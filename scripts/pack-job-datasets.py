#!/usr/bin/env python3
"""Pack public-safe job listings into data/jobs/ for the Gauntlet repo.

Raw Molina 104.db / tw_jobs.db are ~140MB (job descriptions) and GitHub will
reject them. This writes listing-only snapshots: no descriptions, no cookies,
no home-directory paths. Recruiter phones/emails in 104 location dumps are
redacted.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sqlite3
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = REPO_ROOT / "data" / "jobs"
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
MOBILE_RE = re.compile(r"(?<!\d)09\d{2}-?\d{6}(?!\d)")
HOME_RE = re.compile(r"/home/[^\s]+")


def sanitize(value) -> str:
    text = "" if value is None else str(value)
    text = EMAIL_RE.sub("[redacted-email]", text)
    text = MOBILE_RE.sub("[redacted-phone]", text)
    text = HOME_RE.sub("[redacted-path]", text)
    return " ".join(text.split())


def short_location(value: str) -> str:
    text = sanitize(value)
    for marker in ("經歷", "學歷", "時薪", "月薪", "年薪", "━━━━━━━━"):
        if marker in text:
            text = text.split(marker, 1)[0].strip()
    return text[:120]


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") or "" for field in fields})


def board_of(row: dict) -> str:
    url = row.get("url") or ""
    host = urlparse(url).netloc.lower()
    source = (row.get("source") or "").lower()
    if "yourator.co" in host or source == "yourator":
        return "yourator"
    if "cake.me" in host or source == "cake":
        return "cake"
    if "104.com.tw" in host or source == "104":
        return "104"
    if "lever.co" in host or source.startswith("lever"):
        return "lever"
    if "greenhouse" in host or source.startswith("greenhouse"):
        return "greenhouse"
    if "remoteok" in host or source == "remoteok":
        return "remoteok"
    if "web3.career" in host or source == "web3career":
        return "web3career"
    if "1111.com.tw" in host or source == "1111":
        return "1111"
    return "other"


def pack_live(live_path: Path, out: Path) -> list[dict]:
    rows = json.loads(live_path.read_text(encoding="utf-8"))
    clean = []
    for row in rows:
        item = {
            "board": board_of(row),
            "company": sanitize(row.get("company")),
            "title": sanitize(row.get("title")),
            "location": short_location(row.get("location") or ""),
            "url": (row.get("url") or "").strip(),
            "source": sanitize(row.get("source")),
            "ats": sanitize(row.get("ats")),
            "id": str(row.get("id") or ""),
            "pay": sanitize(row.get("pay")),
            "benchmark": sanitize(row.get("benchmark")),
        }
        clean.append(item)
    out.mkdir(parents=True, exist_ok=True)
    (out / "live-jobs.json").write_text(
        json.dumps(clean, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    fields = ["board", "company", "title", "location", "url", "source", "ats", "id", "pay", "benchmark"]
    boards_dir = out / "boards"
    by_board: dict[str, list[dict]] = {}
    for row in clean:
        by_board.setdefault(row["board"], []).append(row)
    for board, group in sorted(by_board.items()):
        write_csv(boards_dir / f"{board}.csv", group, fields)
    return clean


def copy_listings(src: Path, query: str, dest: Path, table: str, columns: list[str], location_i: int | None) -> int:
    conn = sqlite3.connect(f"file:{src.resolve()}?mode=ro", uri=True)
    rows = conn.execute(query).fetchall()
    conn.close()
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    out = sqlite3.connect(dest)
    out.execute(f"create table {table} ({', '.join(col + ' text' for col in columns)})")
    cleaned = []
    for row in rows:
        values = [sanitize(v) for v in row]
        if location_i is not None:
            values[location_i] = short_location(values[location_i])
        cleaned.append(tuple(values))
    out.executemany(
        f"insert into {table} values ({','.join('?' * len(columns))})",
        cleaned,
    )
    out.commit()
    out.close()
    return len(cleaned)


def write_snapshot(out: Path, live: list[dict], curated_db: Path | None) -> None:
    dest = out / "snapshot.sqlite"
    if dest.exists():
        dest.unlink()
    conn = sqlite3.connect(dest)
    conn.execute(
        """create table live (
            board text, company text, title text, location text, url text,
            source text, ats text, id text, pay text, benchmark text
        )"""
    )
    conn.executemany(
        "insert into live values (?,?,?,?,?,?,?,?,?,?)",
        [
            (
                row["board"], row["company"], row["title"], row["location"], row["url"],
                row["source"], row["ats"], row["id"], row["pay"], row["benchmark"],
            )
            for row in live
        ],
    )
    conn.execute(
        "create table meta (generated_at text, live_n integer, boards_json text)"
    )
    boards = dict(Counter(row["board"] for row in live))
    conn.execute(
        "insert into meta values (?,?,?)",
        (f"{date.today().isoformat()}T00:00:00+08:00", len(live), json.dumps(boards, ensure_ascii=False)),
    )
    if curated_db and curated_db.is_file():
        src = sqlite3.connect(f"file:{curated_db.resolve()}?mode=ro", uri=True)
        src.row_factory = sqlite3.Row
        rows = list(src.execute("select * from jobs"))
        cols = [item[1] for item in src.execute("pragma table_info(jobs)").fetchall()]
        src.close()
        conn.execute(f"create table curated ({', '.join(col + ' text' for col in cols)})")
        conn.executemany(
            f"insert into curated values ({','.join('?' * len(cols))})",
            [tuple(row[col] for col in cols) for row in rows],
        )
    conn.commit()
    conn.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live-json", type=Path, default=None)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--tw-jobs-db", type=Path, default=None)
    parser.add_argument("--job-104-db", type=Path, default=None)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out = args.out
    out.mkdir(parents=True, exist_ok=True)
    live_path = args.live_json
    if live_path is None:
        dated = REPO_ROOT / "output" / "phd-taiwan-2027" / "live-jobs-2026-09-21.json"
        tracked = out / "live-jobs.json"
        live_path = dated if dated.is_file() else tracked
    if not live_path.is_file():
        raise SystemExit(f"live dump not found: {live_path}")

    live = pack_live(live_path, out)
    tw_src = args.tw_jobs_db or Path(os.environ.get("JOB_WATCH_TW_JOBS_DB") or "")
    job_104 = args.job_104_db or Path(os.environ.get("JOB_WATCH_104_DB") or "")
    n_tw = n_104 = 0
    if tw_src and tw_src.is_file():
        n_tw = copy_listings(
            tw_src,
            "SELECT source, job_id, job_url, job_url_canonical, title, company, salary, location, last_seen FROM tw_jobs",
            out / "boards" / "tw_jobs-listings.sqlite",
            "tw_jobs",
            ["source", "job_id", "job_url", "job_url_canonical", "title", "company", "salary", "location", "last_seen"],
            location_i=7,
        )
    if job_104 and job_104.is_file():
        n_104 = copy_listings(
            job_104,
            'SELECT job_id, job_title, company, salary, location, job_url, post_date, last_seen FROM "104_data"',
            out / "boards" / "104-listings.sqlite",
            "jobs_104",
            ["job_id", "job_title", "company", "salary", "location", "job_url", "post_date", "last_seen"],
            location_i=4,
        )
    write_snapshot(out, live, out / "curated.sqlite")
    boards = Counter(row["board"] for row in live)
    print(
        f"packed live={len(live)} boards={dict(boards)} "
        f"tw_jobs_listings={n_tw} 104_listings={n_104} -> {out}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
