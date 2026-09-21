#!/usr/bin/env python3
"""List currently open Lever/Greenhouse roles this applicant can actually take."""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import sqlite3
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import date, timedelta
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = REPO_ROOT / "scripts" / "job-boards.json"
DEFAULT_CURATED = REPO_ROOT / "data" / "jobs" / "curated-shots.json"
DEFAULT_LOCATIONS = "taiwan,taipei,taoyuan,hsinchu,臺北,台北,新北,桃園,新竹,臺中,台中,remote,遠端,居家"
DEFAULT_KEYWORDS = (
    "data,machine learning,ml,ai,research,quant,scientist,engineer,analyst,llm,"
    # Taiwanese boards post in Chinese; English-only keywords silently drop local roles.
    "資料,數據,工程師,分析師,研究,演算法,機器學習,人工智慧,科學家,後端,量化"
)
LEVER_DEFAULT_BASE = "https://api.lever.co/v0/postings"
GREENHOUSE_DEFAULT_BASE = "https://boards-api.greenhouse.io/v1/boards"
YOURATOR_DEFAULT_BASE = "https://www.yourator.co/api/v4"
YOURATOR_SITE = "https://www.yourator.co"
YOURATOR_MAX_PAGES = 5
CAKE_DEFAULT_URL = "https://api.cake.me/api/client/v1/jobs/search"
CAKE_SITE = "https://www.cake.me"
CAKE_MAX_PAGES = 5
TIMEOUT_SEC = 30
DEFAULT_SINCE_DAYS = 14
PROFILE_CLOSE = (
    "machine learning,ml engineer,research scientist,quant,quantitative,"
    "data scientist,data engineer,llm,資料科學,機器學習,資料工程,量化,研究員"
)
JOB_PIPELINE_REL = "output/phd-taiwan-2027/JOB_PIPELINE.md"
QUEUE_POINTER_RE = re.compile(r"## \[[^\]]+\] Job pipeline:.*?(?=\n## |\Z)", re.S)


def split_csv(raw: str) -> list[str]:
    return [part.strip() for part in raw.split(",") if part.strip()]


# A remote role tied to another region is not reachable: the applicant may work in Taiwan without a
# permit from 2027-01, and nowhere else. "Remote", "Remote - APAC" and "Remote, Taiwan" count;
# "Remote, US" and "Remote (EMEA)" do not.
# A blocklist of regions cannot keep up ("Remote Finland", "Remote - California"), so invert it:
# a remote role is reachable only when everything in its location is either the word remote, a
# connector, or a place the applicant can actually work from.
REMOTE_OK_WORDS = {
    "remote", "hybrid", "home", "office", "based", "roles", "role", "or", "and", "anywhere",
    "global", "worldwide", "flexible", "taiwan", "taipei", "taoyuan", "hsinchu", "apac", "apj",
    "asia", "pacific", "any", "location", "distributed",
}


def _remote_is_reachable(location: str) -> bool:
    words = [w for w in re.split(r"[^a-z]+", location.lower()) if w]
    return all(w in REMOTE_OK_WORDS for w in words)


def location_matches(location: str, needles: list[str]) -> bool:
    hay = location.lower()
    for needle in needles:
        needle = needle.lower()
        if needle not in hay:
            continue
        if needle == "remote" and not _remote_is_reachable(hay):
            continue
        return True
    return False


def title_matches(title: str, keywords: list[str]) -> bool:
    hay = title.lower()
    for keyword in keywords:
        needle = keyword.lower()
        if len(needle) <= 2:
            if re.search(r"\b" + re.escape(needle) + r"\b", hay):
                return True
        elif needle in hay:
            return True
    return False


def fetch_json(url: str, payload: dict | None = None, extra_headers: dict | None = None):
    headers = {"Accept": "application/json", "User-Agent": "job-watch.py"}
    if extra_headers:
        headers.update(extra_headers)
    data = None
    if payload is not None:
        headers.setdefault("Content-Type", "application/json")
        data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(request, timeout=TIMEOUT_SEC) as response:
        return json.loads(response.read().decode("utf-8"))


def lever_url(company: str) -> str:
    from_env = "JOB_WATCH_LEVER_BASE" in os.environ
    base = os.environ.get("JOB_WATCH_LEVER_BASE", LEVER_DEFAULT_BASE).rstrip("/")
    url = f"{base}/{company}"
    if not from_env:
        url += "?mode=json"
    return url


def greenhouse_url(company: str) -> str:
    base = os.environ.get("JOB_WATCH_GREENHOUSE_BASE", GREENHOUSE_DEFAULT_BASE).rstrip("/")
    return f"{base}/{company}/jobs"


def yourator_url(query: str, page: int) -> str:
    base = os.environ.get("JOB_WATCH_YOURATOR_BASE", YOURATOR_DEFAULT_BASE).rstrip("/")
    query_string = urllib.parse.urlencode({"term[keyword]": query, "page": page})
    return f"{base}/jobs?{query_string}"


def from_lever(job: dict, label: str) -> dict:
    categories = job.get("categories") or {}
    return {
        "company": label,
        "title": job.get("text") or "",
        "location": categories.get("location") or "",
        "url": job.get("hostedUrl") or "",
        "ats": "lever",
        "id": job.get("id"),
    }


def from_greenhouse(job: dict, label: str) -> dict:
    location = job.get("location")
    if isinstance(location, dict):
        name = location.get("name") or ""
    else:
        name = location or ""
    return {
        "company": label,
        "title": job.get("title") or "",
        "location": name,
        "url": job.get("absolute_url") or "",
        "ats": "greenhouse",
        "id": job.get("id"),
    }


SQLITE_TABLES = frozenset({"tw_jobs", "104_data"})


def from_sqlite(job: sqlite3.Row) -> dict:
    company = (job["company"] or "").strip() or (job["source"] or "")
    return {
        "company": company,
        "title": job["title"] or "",
        "location": job["location"] or "",
        "url": job["job_url_canonical"] or job["job_url"] or "",
        "ats": "sqlite",
        "source": job["source"] or "",
        "id": job["job_id"] or job["id"],
        "_salary": job["salary"],
    }


def load_sqlite(entry: dict, since: str) -> list[dict]:
    path = entry.get("path") or os.environ.get(entry.get("path_env") or "")
    if not path:
        raise ValueError("set path or path_env to a sqlite database")
    table = entry.get("table") or "tw_jobs"
    if table not in SQLITE_TABLES:
        raise ValueError(f"unknown sqlite table {table!r}")
    uri = Path(path).resolve().as_uri() + "?mode=ro"
    conn = sqlite3.connect(uri, uri=True)
    try:
        conn.row_factory = sqlite3.Row
        if table == "104_data":
            source = entry.get("source") or "104"
            cursor = conn.execute(
                'SELECT id, :source AS source, job_id, job_url, job_url_canonical, '
                'job_title AS title, company, salary, location '
                'FROM "104_data" WHERE last_seen >= :since',
                {"source": source, "since": since},
            )
        else:
            cursor = conn.execute(
                "SELECT id, source, job_id, job_url, job_url_canonical, title, company, salary, location "
                "FROM tw_jobs WHERE last_seen >= ?",
                (since,),
            )
        return [from_sqlite(job) for job in cursor]
    finally:
        conn.close()


def from_yourator(job: dict) -> dict:
    company = job.get("company") or {}
    if not isinstance(company, dict):
        company = {}
    path = job.get("path") or ""
    return {
        "company": company.get("brand") or company.get("brand_name") or company.get("name") or "",
        "title": job.get("name") or "",
        "location": job.get("location") or "",
        "url": YOURATOR_SITE + path,
        "ats": "yourator",
        "source": "yourator",
        "id": job.get("id"),
        "_salary": job.get("salary"),
    }


def load_yourator(query: str) -> list[dict]:
    rows: list[dict] = []
    for page in range(1, YOURATOR_MAX_PAGES + 1):
        data = fetch_json(yourator_url(query, page))
        if not isinstance(data, dict) or not isinstance(data.get("payload"), dict):
            raise ValueError("expected a payload object")
        payload = data["payload"]
        jobs = payload.get("jobs")
        if not isinstance(jobs, list):
            raise ValueError("expected a jobs array")
        if not jobs:
            break
        for job in jobs:
            if isinstance(job, dict):
                rows.append(from_yourator(job))
        if not payload.get("hasMore"):
            break
    return rows


def cake_url() -> str:
    return os.environ.get("JOB_WATCH_CAKE_BASE", CAKE_DEFAULT_URL)


def cake_salary_text(salary) -> str:
    if isinstance(salary, str):
        return salary.strip()
    if not isinstance(salary, dict):
        return ""
    kind = {"per_year": "Annual Salary", "per_month": "Monthly Salary",
            "per_hour": "Hourly Wage"}.get(salary.get("type") or "", salary.get("type") or "")
    currency = salary.get("currency") or ""
    minimum, maximum = salary.get("min"), salary.get("max")
    if minimum is None and maximum is None:
        return ""
    if minimum is not None and maximum is not None:
        span = f"{minimum}~{maximum}"
    else:
        span = str(minimum if minimum is not None else maximum)
    return " ".join(part for part in (kind, currency, span) if part)


def cake_location_text(job: dict) -> str:
    locs = job.get("locationsWithLocale") or job.get("locations_with_locale") or job.get("locations") or []
    names = []
    for item in locs:
        if isinstance(item, str):
            names.append(item)
        elif isinstance(item, dict):
            names.append(item.get("zh-TW") or item.get("zh-tw") or item.get("en")
                         or item.get("fullAddress") or item.get("city") or item.get("name") or item.get("text") or "")
    return ", ".join(name for name in names if name)


def from_cake(job: dict) -> dict:
    page = job.get("page") if isinstance(job.get("page"), dict) else {}
    path = job.get("path") or ""
    company_path = page.get("path") or ""
    url = f"{CAKE_SITE}/companies/{company_path}/jobs/{path}" if company_path else f"{CAKE_SITE}/jobs/{path}"
    return {
        "company": page.get("name") or "",
        "title": job.get("title") or "",
        "location": cake_location_text(job),
        "url": url,
        "ats": "cake",
        "source": "cake",
        "id": path,
        "_salary": cake_salary_text(job.get("salary")),
    }


def load_cake(query: str) -> list[dict]:
    rows: list[dict] = []
    url = cake_url()
    for page in range(1, CAKE_MAX_PAGES + 1):
        payload = {
            "query": query,
            "filters": {"locations": ["Taiwan"]},
            "sort_by": "latest",
            "page": page,
            "per_page": 20,
        }
        data = fetch_json(
            url,
            payload=payload,
            extra_headers={"Origin": "https://www.cake.me", "Referer": "https://www.cake.me/jobs/in-Taiwan"},
        )
        if not isinstance(data, dict) or not isinstance(data.get("data"), list):
            raise ValueError("expected a data array")
        jobs = data["data"]
        if not jobs:
            break
        for job in jobs:
            if isinstance(job, dict):
                rows.append(from_cake(job))
        total_pages = data.get("total_pages")
        if isinstance(total_pages, int) and page >= total_pages:
            break
    return rows


def load_board(entry: dict, since: str) -> list[dict]:
    ats = entry.get("ats")
    company = entry.get("company") or entry.get("query") or ""
    label = entry.get("label") or company
    try:
        if ats == "lever":
            data = fetch_json(lever_url(company))
            if not isinstance(data, list):
                raise ValueError("expected a JSON list")
            rows = []
            for job in data:
                if isinstance(job, dict):
                    row = from_lever(job, label)
                    row["_text"] = " ".join(str(job.get(k) or "") for k in
                                            ("descriptionPlain", "additionalPlain", "description"))
                    rows.append(row)
            return rows
        if ats == "greenhouse":
            data = fetch_json(greenhouse_url(company))
            if not isinstance(data, dict) or not isinstance(data.get("jobs"), list):
                raise ValueError("expected a jobs array")
            rows = []
            for job in data["jobs"]:
                if isinstance(job, dict):
                    row = from_greenhouse(job, label)
                    row["_text"] = str(job.get("content") or "")
                    row["_detail"] = f"{greenhouse_url(company)}/{job.get('id')}"
                    rows.append(row)
            return rows
        if ats == "yourator":
            return load_yourator(entry.get("query") or "")
        if ats == "cake":
            return load_cake(entry.get("query") or "")
        if ats == "sqlite":
            return load_sqlite(entry, since)
        print(f"job-watch: {label} ({company}): unknown ats {ats!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError, OSError, sqlite3.Error) as exc:
        print(f"job-watch: {label} ({company}): {exc}", file=sys.stderr)
        return []


def render_text(rows: list[dict]) -> str:
    lines: list[str] = []
    current = None
    for row in rows:
        if row["company"] != current:
            if current is not None:
                lines.append("")
            current = row["company"]
            lines.append(current)
        lines.append(f"  {row['title']} — {row['location']}  {row['url']}"
                     + (f"\n      pay: {row['pay']} | {row['benchmark']}" if row.get("pay") else ""))
    lines.append("")
    employers = len({row["company"] for row in rows})
    lines.append(f"{len(rows)} roles across {employers} employers")
    return "\n".join(lines) + "\n"


def pipeline_line(row: dict) -> str:
    pay = row.get("pay") or ""
    if pay and pay != "not stated":
        extra = f"\n  {pay}"
    elif row.get("benchmark"):
        extra = f"\n  {row['benchmark']}"
    else:
        extra = ""
    return f"- **{row['title']}** — {row['company']} · {row['location']}{extra}\n  {row['url']}"


def write_pipeline(path: Path, rows: list[dict]) -> None:
    close_needles = split_csv(PROFILE_CLOSE)
    close = [row for row in rows if title_matches(row["title"], close_needles)]
    employers = len({row["company"] for row in rows})
    paid = sum(1 for row in rows if row.get("pay") and row["pay"] != "not stated")
    lines = [
        f"# Live job pipeline — {date.today().isoformat()}",
        "",
        f"{len(rows)} reachable roles across {employers} employers"
        + (f"; {paid} state a salary." if any("pay" in row for row in rows) else "."),
        "Reachable means Taiwan-based, or remote without a region lock. Regenerate with:",
        "`python3 scripts/job-watch.py --with-pay --pipeline output/phd-taiwan-2027/JOB_PIPELINE.md`",
        "",
        f"## Closest to the profile ({len(close)})",
        "",
    ]
    for row in close:
        lines.append(pipeline_line(row))
    lines.append("")
    lines.append("## All roles, grouped by employer")
    lines.append("")
    current = None
    for row in rows:
        if row["company"] != current:
            current = row["company"]
            lines.append(f"### {current}")
            lines.append("")
        lines.append(pipeline_line(row))
        lines.append("")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def write_queue_pointer(path: Path, rows: list[dict]) -> None:
    employers = len({row["company"] for row in rows})
    paid = sum(1 for row in rows if row.get("pay") and row["pay"] != "not stated")
    pay_bit = f", {paid} with stated pay" if any("pay" in row for row in rows) else ""
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    marker_match = re.search(r"## \[([^\]]+)\] Job pipeline:", existing)
    marker = f"[{marker_match.group(1)}]" if marker_match else "[ ]"
    block = (
        f"## {marker} Job pipeline: {len(rows)} reachable roles\n"
        f"repo: {REPO_ROOT}\n"
        f"type: decision\n"
        f"goal: {JOB_PIPELINE_REL} lists {len(rows)} live roles across {employers} employers{pay_bit}. "
        "Decide how many to fire per day and which CV variant each family uses.\n"
        "done when: a daily application target is set and the first batch is sent.\n"
    )
    if QUEUE_POINTER_RE.search(existing):
        text = QUEUE_POINTER_RE.sub(block.strip(), existing, count=1)
        if not text.endswith("\n"):
            text += "\n"
        path.write_text(text, encoding="utf-8")
        return
    text = existing
    if text and not text.endswith("\n"):
        text += "\n"
    if text and not text.endswith("\n\n"):
        text += "\n"
    text += block
    if not text.endswith("\n"):
        text += "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def load_applied(path: Path) -> set[str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return {str(item) for item in data if item}
    if not isinstance(data, dict):
        return set()
    keys = list(data.get("applied_job_keys") or [])
    keys.extend(data.get("applied_job_ids") or [])
    return {str(item) for item in keys if item}


def applied_key(row: dict) -> str:
    source = row.get("source") or ""
    job_id = row.get("id")
    if source and job_id not in (None, ""):
        return f"{source}:{job_id}"
    return ""


def is_applied(row: dict, keys: set[str]) -> bool:
    if not keys:
        return False
    key = applied_key(row)
    if key and key in keys:
        return True
    url = row.get("url") or ""
    return bool(url) and url in keys


INTERN_RE = re.compile(r"intern|實習|工讀|兼職|accelerator program", re.I)
SENIOR_RE = re.compile(r"senior|staff|principal|lead|manager|資深|經理|總監|director", re.I)
AGENCY_RE = re.compile(r"recruitment|招募中心|獵才|headhunt|未來無限|人力仲介|人力資源顧問", re.I)
JUNK_PAY_RE = re.compile(r"TWD\s*0(?:\.0)?\s*~\s*0", re.I)
WATCHLIST_NEEDLES = (
    "binance", "appier", "gogolook", "worldquant", "jane street", "mediatek", "hong wen",
)
OEM_RE = re.compile(
    r"仁寶|鴻海|鴻佰|廣達|緯創|和碩|英業達|富士康|compal|foxconn|pegatron|"
    r"wistron|inventec|quanta|ingrasys",
    re.I,
)
BD_INTERN_RE = re.compile(
    r"事業開発|business development|business management|業務落地|產品企劃|"
    r"行銷|sales intern|sales engineer|bd intern|bd focus|fashion|門市|店員|銷售|"
    r"영업|사업개발|매니저 인턴",
    re.I,
)
PM_INTERN_RE = re.compile(r"product manager|專案經理|產品經理|pm intern", re.I)
CONTENT_INTERN_RE = re.compile(r"影音內容|內容設計|content design", re.I)
GIG_RE = re.compile(r"兼職|假日|part[- ]time", re.I)
WORD_RE = re.compile(r"[a-z0-9]+", re.I)
CJK_RUN_RE = re.compile(r"[\u4e00-\u9fff]+")
FIT_STOP = {
    "the", "and", "for", "with", "intern", "internship", "engineer", "engineering",
    "program", "programme", "taiwan", "taipei", "asia", "hong", "kong",
    "股份", "有限", "公司", "集團", "工程", "工程師", "實習", "計畫", "專區",
}
# Prototype documents for a Rocchio centroid, not OR-gates. A title keeps
# if it sits closer to the keep centroid than the skip centroid.
KEEP_DOCS = (
    "machine learning engineer; research scientist; llm reasoning; post-training; generative ai; agentic ai; large language model",
    "data scientist; data analyst intern; data engineer; applied data scientist; research data scientist",
    "quantitative researcher; quant trading; quantitative analyst; 量化交易 量化資料 量化建模 量化系統",
    "virtual asset regulatory research intern; 虛擬資產 法規 研究實習 crypto finance on-chain",
    "credit risk data analyst; financial data analyst; web3 data scientist llm applied",
    "機器學習工程師 資料科學家 資料工程師 人工智慧 大型語言模型 研究員 演算法工程師",
)
SKIP_DOCS = (
    "recruitment consulting headhunt 招募中心 獵才 人力仲介 unidentified client agency listing",
    "civil construction intern 土木 營建 建築 大地工程 職業安全衛生 門市 店員 fashion retail 銷售",
    "business development intern sales intern 業務 行銷 產品企劃 content design 影音內容 事業開発",
    "frontend intern vue.js android ios firmware 韌體 電腦安裝 計時工讀 store clerk 產品設計",
    "compal foxconn pegatron inventec 仁寶 鴻海 廣達 軟體工程師 generic oem factory software",
    "product manager intern 專案經理 假日兼職 part-time gig livechat customer service campaign analyst",
    "network engineer devops 網管 維運 qa test intern analog field applications packaging design",
    "full stack intern software engineer intern techops intern devsecops intern ios intern android intern backend intern",
)
KEEP_MARGIN = 0.08
MAYBE_MARGIN = 0.03
FAMILY_RULES = (
    ("quant", ("quant", "quantitative", "量化")),
    ("ml_research", ("machine learning", "ml engineer", "research scientist", "llm", "機器學習", "ai engineer", "ai工程")),
    ("data_science", ("data scientist", "data science", "資料科學", "資料科學家")),
    ("data_eng", ("data engineer", "資料工程")),
    ("analyst", ("analyst", "analytics", "分析師")),
    ("research", ("research", "研究", "研究員")),
    ("software", ("backend", "後端", "software", "engineer", "工程師", "developer")),
)


def role_family(title: str) -> str:
    hay = (title or "").lower()
    for name, needles in FAMILY_RULES:
        if any(n in hay for n in needles):
            return name
    return "other"


def role_timing(title: str) -> str:
    if INTERN_RE.search(title or ""):
        return "now_intern"
    if SENIOR_RE.search(title or ""):
        return "later_senior"
    return "ft"


def cv_variant(row: dict) -> str:
    source = row.get("source") or row.get("ats") or ""
    family = role_family(row.get("title") or "")
    if source == "104" or any("\u4e00" <= ch <= "\u9fff" for ch in (row.get("title") or "")[:12]):
        if family in ("ml_research", "data_science", "data_eng", "quant", "research"):
            return "ai"
        return "zh"
    if family in ("ml_research", "data_science", "data_eng", "quant", "research"):
        return "ai"
    return "en"


def is_agency(row: dict) -> bool:
    blob = f"{row.get('company') or ''} {row.get('title') or ''}"
    return bool(AGENCY_RE.search(blob))


def is_junk_pay(row: dict) -> bool:
    return bool(JUNK_PAY_RE.search(row.get("pay") or ""))


def on_watchlist(row: dict) -> bool:
    company = (row.get("company") or "").lower()
    return any(needle in company for needle in WATCHLIST_NEEDLES)


def is_oem(row: dict) -> bool:
    return bool(OEM_RE.search(row.get("company") or ""))


def intern_kind(title: str) -> str:
    text = title or ""
    if BD_INTERN_RE.search(text):
        return "bd"
    if PM_INTERN_RE.search(text):
        return "pm"
    if CONTENT_INTERN_RE.search(text):
        return "content"
    if GIG_RE.search(text):
        return "gig"
    return "other"


def _fit_tokens(text: str) -> Counter:
    s = (text or "").lower()
    bag: Counter = Counter()
    for word in WORD_RE.findall(s):
        if len(word) < 2 or word in FIT_STOP:
            continue
        bag[("w", word)] += 1
        if len(word) >= 4:
            for i in range(len(word) - 3):
                bag[("c4", word[i:i + 4])] += 1
    for run in CJK_RUN_RE.findall(s):
        for n in (2, 3):
            if len(run) >= n:
                for i in range(len(run) - n + 1):
                    gram = run[i:i + n]
                    if gram in FIT_STOP:
                        continue
                    bag[("cjk", gram)] += 1
        if len(run) == 1:
            bag[("cjk", run)] += 1
    return bag


def _unit(bag: Counter) -> dict[tuple, float]:
    norm = math.sqrt(sum(v * v for v in bag.values())) or 1.0
    return {key: value / norm for key, value in bag.items()}


def _centroid(docs: tuple[str, ...]) -> dict[tuple, float]:
    acc: Counter = Counter()
    for doc in docs:
        acc.update(_unit(_fit_tokens(doc)))
    return _unit(acc)


KEEP_CENTROID = _centroid(KEEP_DOCS)
SKIP_CENTROID = _centroid(SKIP_DOCS)


def _cosine(bag: Counter, centroid: dict[tuple, float]) -> float:
    if not bag or not centroid:
        return 0.0
    unit = _unit(bag)
    return sum(unit[key] * centroid[key] for key in unit.keys() & centroid.keys())


def fit_profile(row: dict) -> dict:
    """Score a posting against keep/skip prototypes. Not a keyword OR-list."""
    title = row.get("title") or ""
    company = row.get("company") or ""
    bag = _fit_tokens(f"{company} {title}")
    pos = _cosine(bag, KEEP_CENTROID)
    neg = _cosine(bag, SKIP_CENTROID)
    margin = pos - neg
    tags: list[str] = []
    intern = role_timing(title) == "now_intern"
    kind = intern_kind(title) if intern else ""
    if is_agency(row):
        margin -= 0.55
        tags.append("agency")
    if is_oem(row) and not intern:
        margin -= 0.18
        tags.append("oem")
    if role_timing(title) == "later_senior":
        margin -= 0.14
        tags.append("senior")
    if on_watchlist(row) and pos >= 0.12:
        margin += 0.05
        tags.append("watchlist")
    if intern and kind in ("bd", "gig", "content", "pm"):
        margin -= 0.22
        tags.append(f"intern_{kind}")
    elif intern and pos >= 0.10 and (pos - neg) > 0.04:
        margin += 0.04
        tags.append("intern_window")
    elif intern and pos >= 0.06 and neg <= 0.02:
        margin += 0.04
        tags.append("intern_window")
    return {
        "fit_pos": round(pos, 4),
        "fit_neg": round(neg, 4),
        "fit_margin": round(margin, 4),
        "fit_tags": tags,
    }


def curate_row(row: dict) -> dict:
    """Label a live row from prototype fit. keep/maybe is the dataset; skip stays in live-pipeline.csv."""
    shot = annotate_shot(row)
    fit = fit_profile(shot)
    timing = shot["timing"]
    kind = intern_kind(shot.get("title") or "") if timing == "now_intern" else ""
    margin = fit["fit_margin"]
    tags = list(fit["fit_tags"])
    reasons = [
        f"pos={fit['fit_pos']:.3f}",
        f"neg={fit['fit_neg']:.3f}",
        f"margin={margin:.3f}",
        *tags,
    ]

    if "agency" in tags:
        verdict = "skip"
        reasons.append("agency_employer")
    elif timing == "later_senior":
        verdict = "maybe" if margin >= KEEP_MARGIN else "skip"
        reasons.append("senior_profile" if verdict == "maybe" else "senior")
    elif margin >= KEEP_MARGIN:
        verdict = "keep"
    elif margin >= MAYBE_MARGIN:
        verdict = "maybe"
    else:
        verdict = "skip"

    if is_junk_pay(shot):
        reasons.append("junk_pay")

    if verdict == "keep" and (
        timing == "now_intern" or "watchlist" in tags or margin >= 0.20 or shot["family"] == "quant"
    ):
        tier = "A"
    elif verdict == "keep":
        tier = "B"
    else:
        tier = "C"

    shot.update(fit)
    shot["verdict"] = verdict
    shot["tier"] = tier
    shot["intern_kind"] = kind
    shot["watchlist"] = on_watchlist(shot)
    shot["agency"] = is_agency(shot)
    shot["oem"] = is_oem(shot)
    shot["pay_junk"] = is_junk_pay(shot)
    shot["reasons"] = ",".join(reasons)
    return shot


def curated_rows(rows: list[dict], include_maybe: bool = True) -> list[dict]:
    labeled = [curate_row(row) for row in rows]
    wanted = {"keep", "maybe"} if include_maybe else {"keep"}
    picked = [row for row in labeled if row["verdict"] in wanted]
    picked.sort(key=lambda row: (
        0 if row["verdict"] == "keep" else 1,
        0 if row["tier"] == "A" else 1 if row["tier"] == "B" else 2,
        0 if row["timing"] == "now_intern" else 1 if row["timing"] == "ft" else 2,
        -(row.get("fit_margin") or 0),
        -(row.get("score") or 0),
        row.get("company") or "",
        row.get("title") or "",
    ))
    return picked


CURATED_FIELDS = (
    "verdict", "tier", "company", "title", "location", "url", "source", "ats", "id",
    "pay", "pay_junk", "benchmark", "family", "timing", "intern_kind",
    "watchlist", "agency", "oem", "score", "fit_pos", "fit_neg", "fit_margin",
    "cv_variant", "reasons",
)


def write_curated_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CURATED_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            out = {field: row.get(field, "") for field in CURATED_FIELDS}
            out["watchlist"] = "1" if row.get("watchlist") else "0"
            out["agency"] = "1" if row.get("agency") else "0"
            out["oem"] = "1" if row.get("oem") else "0"
            out["pay_junk"] = "1" if row.get("pay_junk") else "0"
            writer.writerow(out)


def write_curated_json(path: Path, inventory_n: int, rows: list[dict]) -> None:
    keep_n = sum(1 for row in rows if row["verdict"] == "keep")
    maybe_n = sum(1 for row in rows if row["verdict"] == "maybe")
    payload = {
        "schema": "blowback.job_curated.v1",
        "generated_at": f"{date.today().isoformat()}T00:00:00+08:00",
        "profile": (
            "Finance master's completing 2027-01. Intern/accelerator now; "
            "full-time from the graduate work window. Taipei LLM / data / quant / ML. "
            "Keep/skip is prototype-centroid fit, not a title keyword OR-list. "
            "Agencies and generic OEM software are skip, not this table."
        ),
        "inventory_roles": inventory_n,
        "counts": {
            "keep": keep_n,
            "maybe": maybe_n,
            "rows": len(rows),
            "employers_keep": len({row["company"] for row in rows if row["verdict"] == "keep"}),
            "now_intern_keep": sum(1 for row in rows if row["verdict"] == "keep" and row["timing"] == "now_intern"),
        },
        "rows": [
            {field: row.get(field) for field in CURATED_FIELDS}
            for row in rows
        ],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_curated_db(path: Path, inventory_n: int, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        path.unlink()
    conn = sqlite3.connect(path)
    conn.execute(
        """create table jobs (
            verdict text, tier text, company text, title text, location text, url text,
            source text, ats text, id text, pay text, pay_junk integer, benchmark text,
            family text, timing text, intern_kind text, watchlist integer, agency integer,
            oem integer, score integer, fit_pos real, fit_neg real, fit_margin real,
            cv_variant text, reasons text
        )"""
    )
    conn.execute(
        """create table meta (
            generated_at text, inventory_roles integer, keep_n integer, maybe_n integer
        )"""
    )
    conn.execute(
        "insert into meta values (?,?,?,?)",
        (
            f"{date.today().isoformat()}T00:00:00+08:00",
            inventory_n,
            sum(1 for row in rows if row["verdict"] == "keep"),
            sum(1 for row in rows if row["verdict"] == "maybe"),
        ),
    )
    conn.executemany(
        """insert into jobs values (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )""",
        [
            (
                row.get("verdict"), row.get("tier"), row.get("company"), row.get("title"),
                row.get("location"), row.get("url"), row.get("source"), row.get("ats"),
                row.get("id"), row.get("pay"), 1 if row.get("pay_junk") else 0,
                row.get("benchmark"), row.get("family"), row.get("timing"),
                row.get("intern_kind"), 1 if row.get("watchlist") else 0,
                1 if row.get("agency") else 0, 1 if row.get("oem") else 0,
                row.get("score"), row.get("fit_pos"), row.get("fit_neg"),
                row.get("fit_margin"), row.get("cv_variant"), row.get("reasons"),
            )
            for row in rows
        ],
    )
    conn.commit()
    conn.close()


def shot_score(row: dict) -> int:
    title = row.get("title") or ""
    close = title_matches(title, split_csv(PROFILE_CLOSE))
    timing = role_timing(title)
    score = 0
    if timing == "now_intern" and close:
        score += 100
    elif timing == "now_intern":
        score += 55
    elif close and timing == "ft":
        score += 70
    elif close and timing == "later_senior":
        score += 25
    else:
        score += 5
    pay = row.get("pay") or ""
    if pay and pay != "not stated" and not is_junk_pay(row):
        score += 10
    source = row.get("source") or row.get("ats") or ""
    if source in ("104", "yourator", "cake") or row.get("ats") in ("yourator", "cake"):
        score += 5
    if on_watchlist(row):
        score += 15
    if is_agency(row):
        score -= 80
    if is_junk_pay(row):
        score -= 15
    return score


def annotate_shot(row: dict) -> dict:
    shot = dict(row)
    shot["family"] = role_family(row.get("title") or "")
    shot["timing"] = role_timing(row.get("title") or "")
    shot["cv_variant"] = cv_variant(row)
    shot["score"] = shot_score(row)
    return shot


def load_curated(path: Path | None = None) -> dict:
    curated = path or Path(os.environ.get("JOB_WATCH_CURATED") or DEFAULT_CURATED)
    if not curated.exists():
        return {"shots": []}
    try:
        payload = json.loads(curated.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"shots": []}
    if not isinstance(payload, dict):
        return {"shots": []}
    payload.setdefault("shots", [])
    return payload


def _match_curated(row: dict, spec: dict) -> bool:
    needle = spec.get("url_contains") or spec.get("url") or ""
    return bool(needle) and needle in (row.get("url") or "")


def next_shots(rows: list[dict], n: int, per_employer: int = 1, curated: dict | None = None) -> list[dict]:
    curated = load_curated() if curated is None else curated
    picked: list[dict] = []
    used: dict[str, int] = {}
    for spec in curated.get("shots") or []:
        for row in rows:
            company = row.get("company") or ""
            if used.get(company, 0) >= per_employer:
                continue
            if not _match_curated(row, spec):
                continue
            shot = annotate_shot(row)
            if spec.get("why"):
                shot["why"] = spec["why"]
            if spec.get("cv_variant"):
                shot["cv_variant"] = spec["cv_variant"]
            picked.append(shot)
            used[company] = used.get(company, 0) + 1
            break
        if len(picked) >= n:
            return picked
    ranked = sorted(rows, key=lambda row: (-shot_score(row), row.get("company") or "", row.get("title") or ""))
    for row in ranked:
        company = row.get("company") or ""
        if used.get(company, 0) >= per_employer:
            continue
        if is_agency(row):
            continue
        used[company] = used.get(company, 0) + 1
        picked.append(annotate_shot(row))
        if len(picked) >= n:
            break
    return picked


CSV_FIELDS = (
    "company", "title", "location", "url", "source", "ats", "id",
    "pay", "benchmark", "family", "timing", "score", "cv_variant",
)


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") or "" for field in CSV_FIELDS})


def portal_for(row: dict) -> str:
    url = row.get("url") or ""
    if "104.com.tw" in url:
        return "104"
    if "cake.me" in url:
        return "cake"
    if "yourator.co" in url:
        return "yourator"
    if "greenhouse.io" in url or "job-boards.greenhouse.io" in url:
        return "greenhouse"
    if "lever.co" in url:
        return "lever"
    return row.get("ats") or row.get("source") or "unknown"


def shot_why(row: dict) -> str:
    timing = row.get("timing")
    family = row.get("family")
    if timing == "now_intern":
        return f"Reachable now as a student: {family} intern/accelerator, not a 2027-01 full-time gate."
    if timing == "later_senior":
        return f"Profile-close {family} but senior-titled; treat as later unless the posting is explicitly junior."
    return f"Profile-close {family} full-time: legally open from 2027-01 under the graduate work window."


def shot_human_gate(row: dict) -> list[str]:
    portal = portal_for(row)
    gates = ["final_submit", "eligibility_attestation", "terms_acceptance"]
    if portal == "104":
        gates = ["104_cookie_export", "captcha", "final_submit"]
    elif portal in ("cake", "yourator"):
        gates = ["login_session", "final_submit"]
    return gates


def pack_shot(row: dict, index: int) -> dict:
    return {
        "shot_id": f"job-shot-{index:02d}",
        "company": row.get("company"),
        "title": row.get("title"),
        "family": row.get("family"),
        "timing": row.get("timing"),
        "score": row.get("score"),
        "cv_variant": row.get("cv_variant"),
        "pay": row.get("pay") or "not stated",
        "benchmark": row.get("benchmark"),
        "location": row.get("location"),
        "source": row.get("source") or row.get("ats"),
        "portal": portal_for(row),
        "why": row.get("why") or shot_why(row),
        "target": {"starting_url": row.get("url")},
        "human_gate": shot_human_gate(row),
        "forbidden": [
            "invent_eligibility",
            "invent_work_auth",
            "bypass_captcha",
            "final_submit",
            "paste_gauntlet_jargon_into_the_application",
        ],
    }


def write_handoff(path: Path, rows: list[dict], shots: list[dict], csv_rel: str | None) -> None:
    from collections import Counter
    families = Counter(role_family(row.get("title") or "") for row in rows)
    timings = Counter(role_timing(row.get("title") or "") for row in rows)
    employers = len({row.get("company") for row in rows})
    paid = sum(1 for row in rows if row.get("pay") and row["pay"] != "not stated")
    close = sum(1 for row in rows if title_matches(row.get("title") or "", split_csv(PROFILE_CLOSE)))
    payload = {
        "schema": "blowback.job_handoff.v1",
        "generated_at": f"{date.today().isoformat()}T00:00:00+08:00",
        "handoff_id": f"jobs:{date.today().isoformat()}",
        "state": "READY_FOR_BROWSER_AGENT",
        "priority": {
            "status": "FIRE_NOW",
            "deadline": "ROLLING",
            "lane": "JOB",
            "note": "This is fire:next for jobs. Do not insert these shots into gauntlet-master.json.",
        },
        "inventory": {
            "roles": len(rows),
            "employers": employers,
            "pay_stated": paid,
            "profile_close": close,
            "csv": csv_rel,
            "freshness_days": DEFAULT_SINCE_DAYS,
        },
        "analysis": {
            "family_counts": dict(families),
            "timing_counts": dict(timings),
            "now_intern": timings.get("now_intern", 0),
            "ft_from_2027_01": timings.get("ft", 0),
            "later_senior": timings.get("later_senior", 0),
            "notes": [
                "Most rows are generic 工程師 at Compal/Foxconn; they are inventory, not shots.",
                "Intern/BAP/實習 is the only slice reachable before 2027-01.",
                "104.db is a local intern/corridor crawl, not a full-time 104 catalog.",
                "Named Gauntlet JOB routes with empty execution_manifest are a watchlist, not packaged FIRE.",
                "Shots prefer data/jobs/curated-shots.json when those URLs are still live; agencies and TWD 0~0 are not next-shots.",
            ],
        },
        "curation": {
            "mode": "human_shortlist" if (load_curated().get("shots")) else "heuristic",
            "source": "data/jobs/curated-shots.json",
        },
        "queue": {
            "pointer_rule": "one [!] Job pipeline block in the unattended queue, never one Apply block per role",
            "shots_rule": "one employer per --next shot",
        },
        "sources": {
            "tw_jobs_path_env": "JOB_WATCH_TW_JOBS_DB",
            "job_104_path_env": "JOB_WATCH_104_DB",
            "live_ats": ["lever", "greenhouse", "yourator", "cake"],
            "do_not": "HTTP-scrape 104.com.tw; read src/data/104.db instead",
        },
        "cv_variants": {
            "ai": "AI/data CV — resolve from the private applicant authority file, not this public repo",
            "zh": "Chinese CV — same authority file",
            "en": "English general CV — same authority file",
        },
        "shots": [pack_shot(row, i) for i, row in enumerate(shots, start=1)],
        "browser_agent_contract": {
            "objective": "Open the shot URL, map the CV variant to the live form, complete reversible fields, save a draft, stop at protected gates.",
            "auto": [
                "open starting_url",
                "fill factual fields from the private applicant authority file",
                "upload the designated CV variant",
                "save draft",
            ],
            "human_gate": [
                "captcha",
                "password_or_2fa",
                "104_cookie_export",
                "eligibility_attestation",
                "terms_acceptance",
                "final_submit",
            ],
            "forbidden": [
                "invent_eligibility",
                "invent_work_auth",
                "bypass_captcha",
                "final_submit",
                "commit_applicant_contact_into_this_public_repository",
                "enqueue_one_queue_block_per_role",
            ],
            "final_submit_policy": "HUMAN_PROTECTED",
            "do_not_redesign_copy": True,
        },
        "receipt_contract": {
            "schema": "blowback.job_receipt.v1",
            "allowed_statuses": [
                "IN_PROGRESS", "WAITING_HUMAN", "SAFE_COMPLETE",
                "SUBMITTED", "BLOCKED", "ABANDONED", "EXPIRED",
            ],
            "checkpoint_on_return": True,
            "template": {
                "schema": "blowback.job_receipt.v1",
                "shot_id": None,
                "status": None,
                "submitted_at": None,
                "application_id": None,
                "confirmation_url": None,
                "receipt_ref": None,
                "human_required": [],
            },
        },
        "regenerate": [
            "export JOB_WATCH_TW_JOBS_DB=/path/to/tw_jobs.db JOB_WATCH_104_DB=/path/to/104.db",
            "python3 scripts/job-watch.py --with-pay --next 8 --csv data/jobs/live-pipeline.csv --handoff data/jobs/handoff.json",
        ],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="List live Taiwan-reachable roles from the local scrape DB, Cake, Yourator, Lever and Greenhouse.",
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG, metavar="PATH")
    parser.add_argument("--locations", default=DEFAULT_LOCATIONS, metavar="CSV")
    parser.add_argument("--keywords", default=DEFAULT_KEYWORDS, metavar="CSV")
    parser.add_argument("--json", action="store_true", dest="as_json")
    parser.add_argument("--queue", type=Path, metavar="FILE",
                        help="write one queue pointer at FILE, never one block per role")
    parser.add_argument("--pipeline", type=Path, metavar="FILE",
                        help="write JOB_PIPELINE.md with profile-close roles first")
    parser.add_argument("--exclude-applied", type=Path, metavar="FILE",
                        help="JSON list or {applied_job_keys: [...]} of source:id keys already sent")
    parser.add_argument("--with-pay", action="store_true", dest="with_pay",
                        help="read stated pay from each posting and attach a market benchmark")
    parser.add_argument("--next", type=int, metavar="N", dest="next_n",
                        help="Gauntlet job queue: only the next N shots, one employer each")
    parser.add_argument("--csv", type=Path, metavar="FILE",
                        help="write the full inventory as CSV (not just --next)")
    parser.add_argument("--handoff", type=Path, metavar="FILE",
                        help="write blowback.job_handoff.v1 JSON for the browser agent")
    parser.add_argument("--from-json", type=Path, dest="from_json", metavar="FILE",
                        help="curate an existing live-jobs JSON dump instead of refetching boards")
    parser.add_argument("--curated", type=Path, metavar="FILE",
                        help="write the keep+maybe curated dataset as CSV")
    parser.add_argument("--curated-json", type=Path, dest="curated_json", metavar="FILE",
                        help="write blowback.job_curated.v1 JSON")
    parser.add_argument("--curated-db", type=Path, dest="curated_db", metavar="FILE",
                        help="write the curated dataset as sqlite")
    parser.add_argument("--keep-only", action="store_true", dest="keep_only",
                        help="curated outputs include verdict=keep only, not maybe")
    parser.add_argument(
        "--since",
        default=(date.today() - timedelta(days=DEFAULT_SINCE_DAYS)).isoformat(),
        metavar="YYYY-MM-DD",
        help="only sqlite rows last_seen on or after this date (default: 14 days ago)",
    )
    return parser.parse_args(argv)


# Taiwan pay, monthly, from market surveys read 2026-09-21. Used only when a posting states nothing;
# a benchmark is a market range, never a claim about this employer.
BENCHMARKS = [
    (("quant", "quantitative"), "market: ~NT$110,000/month entry (NT$1.33M/yr), higher with bonus"),
    (("machine learning", "ml engineer", "research scientist", "ai engineer"),
     "market: ~NT$122,000/month entry ML engineer (NT$1.47M/yr)"),
    (("data scientist", "data science"),
     "market: ~NT$100,000/month median Taipei (NT$79,000 at the 25th percentile)"),
    (("analyst", "analytics"), "market: ~NT$60,000-90,000/month for analyst roles in Taipei"),
    (("intern",), "market: interns typically NT$200-250/hour or a fixed monthly stipend"),
    (("engineer", "developer"), "market: ~NT$80,000-120,000/month for software engineers in Taipei"),
]
PAY_PATTERNS = [
    re.compile(r"(?:NT\$|TWD|NTD)\s?[\d,]{4,}(?:\s?(?:-|–|to)\s?(?:NT\$|TWD|NTD)?\s?[\d,]{4,})?", re.I),
    re.compile(r"[\d,]{5,}\s?(?:NTD|TWD)(?:\s?(?:-|–|to)\s?[\d,]{5,}\s?(?:NTD|TWD)?)?", re.I),
    re.compile(r"(?:salary|compensation|待遇|月薪)[^.\n]{0,40}?[\d,]{4,}", re.I),
]


def pay_from_text(text: str) -> str:
    """Return the pay a posting actually states, or "not stated". Never invent a figure."""
    for rx in PAY_PATTERNS:
        m = rx.search(text or "")
        if m:
            return " ".join(m.group(0).split())[:80]
    return "not stated"


def pay_from_yourator(salary) -> str:
    """Use the board's salary string when it contains a digit; 面議 and blanks are not stated."""
    if isinstance(salary, str) and any(ch.isdigit() for ch in salary):
        return salary.strip()
    return "not stated"


def benchmark_for(title: str) -> str:
    low = (title or "").lower()
    for keys, text in BENCHMARKS:
        if any(k in low for k in keys):
            return text
    return "market: no benchmark for this role family"


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.from_json is not None:
        if not args.from_json.is_file():
            print(f"live dump not found: {args.from_json}", file=sys.stderr)
            return 2
        rows = json.loads(args.from_json.read_text(encoding="utf-8"))
        if not isinstance(rows, list):
            print("--from-json must be a list of job objects", file=sys.stderr)
            return 2
        for row in rows:
            if not row.get("benchmark"):
                row["benchmark"] = benchmark_for(row.get("title") or "")
            if not row.get("pay"):
                row["pay"] = "not stated"
    else:
        if not args.config.is_file():
            print(f"config not found: {args.config}", file=sys.stderr)
            return 2

        boards = json.loads(args.config.read_text(encoding="utf-8"))
        locations = split_csv(args.locations)
        keywords = split_csv(args.keywords)

        rows = []
        for entry in boards:
            for posting in load_board(entry, since=args.since):
                if not location_matches(posting["location"], locations):
                    continue
                if not title_matches(posting["title"], keywords):
                    continue
                rows.append(posting)

        seen: set[str] = set()
        unique: list[dict] = []
        for row in rows:
            key = row.get("url") or f"{row['company']}|{row['title']}"
            if key in seen:
                continue
            seen.add(key)
            unique.append(row)
        rows = unique

        applied = load_applied(args.exclude_applied) if args.exclude_applied else set()
        if applied:
            rows = [row for row in rows if not is_applied(row, applied)]

        rows.sort(key=lambda row: (row["company"], row["title"]))

        if args.with_pay:
            for row in rows:
                if row.get("ats") in ("yourator", "sqlite", "cake"):
                    row["pay"] = pay_from_yourator(row.get("_salary"))
                else:
                    text = row.get("_text") or ""
                    if not text and row.get("_detail"):
                        try:
                            text = str(fetch_json(row["_detail"]).get("content") or "")
                        except Exception:  # noqa: BLE001 — a missing detail page is not fatal
                            text = ""
                    row["pay"] = pay_from_text(text)
                row["benchmark"] = benchmark_for(row["title"])

        for row in rows:
            row.pop("_text", None)
            row.pop("_detail", None)
            row.pop("_salary", None)

    if args.pipeline is not None:
        write_pipeline(args.pipeline, rows)
    if args.queue is not None:
        write_queue_pointer(args.queue, rows)

    csv_rows = [annotate_shot(row) for row in rows]
    if args.csv is not None:
        write_csv(args.csv, csv_rows)

    picked = None
    if args.curated is not None or args.curated_json is not None or args.curated_db is not None:
        picked = curated_rows(rows, include_maybe=not args.keep_only)
        if args.curated is not None:
            write_curated_csv(args.curated, picked)
        if args.curated_json is not None:
            write_curated_json(args.curated_json, len(rows), picked)
        if args.curated_db is not None:
            write_curated_db(args.curated_db, len(rows), picked)

    shot_n = args.next_n if args.next_n is not None else 8
    if args.handoff is not None:
        if shot_n < 1:
            print("--next must be >= 1", file=sys.stderr)
            return 2
        csv_rel = None
        if args.csv is not None:
            try:
                csv_rel = str(args.csv.resolve().relative_to(REPO_ROOT))
            except ValueError:
                csv_rel = str(args.csv)
        write_handoff(args.handoff, csv_rows, next_shots(rows, shot_n), csv_rel)

    if args.next_n is not None:
        if args.next_n < 1:
            print("--next must be >= 1", file=sys.stderr)
            return 2
        rows = next_shots(rows, args.next_n)

    if picked is not None and args.next_n is None and not args.as_json:
        keep_n = sum(1 for row in picked if row["verdict"] == "keep")
        maybe_n = sum(1 for row in picked if row["verdict"] == "maybe")
        targets = [str(p) for p in (args.curated, args.curated_json, args.curated_db) if p is not None]
        print(f"curated keep={keep_n} maybe={maybe_n} of {len(csv_rows)} -> {', '.join(targets)}")
        return 0

    if args.as_json:
        print(json.dumps(rows, ensure_ascii=False))
    else:
        sys.stdout.write(render_text(rows))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
