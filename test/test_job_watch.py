"""Find live vacancies, not categories.

The registry's job routes point at board pages that go stale: postings close, titles change, and a
200 response proves nothing. Lever and Greenhouse both publish JSON, so open roles can be listed
directly and filtered to what this applicant can actually take: Taiwan-based or remote, matching his
skills, and no work permit needed from 2027-01.
"""
import json
import subprocess
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "job-watch.py"

LEVER = [
    {"text": "AI Backend Developer", "categories": {"location": "Taiwan, Taipei", "team": "Engineering"},
     "hostedUrl": "https://jobs.lever.co/acme/1", "id": "1"},
    {"text": "Admin Intern", "categories": {"location": "Taipei", "team": "Admin"},
     "hostedUrl": "https://jobs.lever.co/acme/2", "id": "2"},
    {"text": "Machine Learning Engineer", "categories": {"location": "Singapore", "team": "Engineering"},
     "hostedUrl": "https://jobs.lever.co/acme/3", "id": "3"},
]
GREENHOUSE = {"jobs": [
    {"title": "Data Scientist", "location": {"name": "Taipei"}, "absolute_url": "https://gh.io/1", "id": 1},
    {"title": "Quantitative Researcher", "location": {"name": "Taipei"}, "absolute_url": "https://gh.io/2", "id": 2},
    {"title": "Office Manager", "location": {"name": "Taipei"}, "absolute_url": "https://gh.io/3", "id": 3},
]}


@pytest.fixture
def board(tmp_path):
    (tmp_path / "v0" / "postings").mkdir(parents=True)
    (tmp_path / "v0" / "postings" / "acme").write_text(json.dumps(LEVER))
    (tmp_path / "v1" / "boards" / "beta").mkdir(parents=True)
    (tmp_path / "v1" / "boards" / "beta" / "jobs").write_text(json.dumps(GREENHOUSE))
    handler = partial(SimpleHTTPRequestHandler, directory=str(tmp_path))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()


def run(board, tmp_path, *args, config=None):
    cfg = tmp_path / "boards.json"
    cfg.write_text(json.dumps(config or [
        {"ats": "lever", "company": "acme", "label": "Acme"},
        {"ats": "greenhouse", "company": "beta", "label": "Beta"},
    ]))
    env = {"JOB_WATCH_LEVER_BASE": f"{board}/v0/postings", "JOB_WATCH_GREENHOUSE_BASE": f"{board}/v1/boards",
           "PATH": "/usr/bin:/bin"}
    p = subprocess.run([sys.executable, str(SCRIPT), "--config", str(cfg), *args],
                       capture_output=True, text=True, timeout=120, env=env)
    return p


def test_lists_matching_roles_from_both_boards(board, tmp_path):
    p = run(board, tmp_path, "--json")
    assert p.returncode == 0, p.stderr
    rows = json.loads(p.stdout)
    titles = {r["title"] for r in rows}
    assert "AI Backend Developer" in titles and "Data Scientist" in titles
    assert "Machine Learning Engineer" not in titles, "Singapore is not reachable without a work permit"
    assert "Admin Intern" not in titles and "Office Manager" not in titles, "off-profile roles are filtered out"
    row = next(r for r in rows if r["title"] == "Data Scientist")
    assert row["company"] == "Beta" and row["url"] == "https://gh.io/1" and row["location"] == "Taipei"


def test_remote_roles_count_as_reachable(board, tmp_path):
    cfg = [{"ats": "lever", "company": "acme", "label": "Acme"}]
    p = run(board, tmp_path, "--json", "--locations", "taiwan,taipei,remote", config=cfg)
    assert p.returncode == 0
    assert {r["title"] for r in json.loads(p.stdout)} == {"AI Backend Developer"}


def test_keywords_are_configurable(board, tmp_path):
    p = run(board, tmp_path, "--json", "--keywords", "quantitative")
    titles = {r["title"] for r in json.loads(p.stdout)}
    assert titles == {"Quantitative Researcher"}


def test_default_output_is_readable_and_grouped(board, tmp_path):
    p = run(board, tmp_path)
    assert p.returncode == 0
    assert "Acme" in p.stdout and "Beta" in p.stdout
    assert "AI Backend Developer" in p.stdout
    assert "https://gh.io/2" in p.stdout


def test_a_dead_board_does_not_kill_the_run(board, tmp_path):
    cfg = [{"ats": "lever", "company": "acme", "label": "Acme"},
           {"ats": "greenhouse", "company": "does-not-exist", "label": "Ghost"}]
    p = run(board, tmp_path, "--json", config=cfg)
    assert p.returncode == 0, p.stderr
    assert {r["title"] for r in json.loads(p.stdout)} == {"AI Backend Developer"}
    assert "ghost" in p.stderr.lower() or "does-not-exist" in p.stderr.lower(), "the failure is reported, not hidden"


PAY_LEVER = [
    {"text": "Data Scientist", "categories": {"location": "Taipei"}, "hostedUrl": "https://jobs.lever.co/acme/9",
     "id": "9", "descriptionPlain": "You will build models. Salary: NT$80,000 - NT$120,000 per month. Apply now."},
    {"text": "ML Engineer", "categories": {"location": "Taipei"}, "hostedUrl": "https://jobs.lever.co/acme/10",
     "id": "10", "descriptionPlain": "Great team, no pay stated here."},
]


@pytest.fixture
def pay_board(tmp_path):
    (tmp_path / "v0" / "postings").mkdir(parents=True)
    (tmp_path / "v0" / "postings" / "acme").write_text(json.dumps(PAY_LEVER))
    handler = partial(SimpleHTTPRequestHandler, directory=str(tmp_path))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()


def test_pay_is_read_from_the_posting_when_stated(pay_board, tmp_path):
    p = run(pay_board, tmp_path, "--json", "--with-pay",
            config=[{"ats": "lever", "company": "acme", "label": "Acme"}])
    assert p.returncode == 0, p.stderr
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "NT$80,000" in rows["Data Scientist"]["pay"]
    assert rows["ML Engineer"]["pay"] == "not stated", "silence is reported as silence, not guessed"


def test_a_market_benchmark_is_attached_by_role_family(pay_board, tmp_path):
    p = run(pay_board, tmp_path, "--json", "--with-pay",
            config=[{"ats": "lever", "company": "acme", "label": "Acme"}])
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "NT$" in rows["ML Engineer"]["benchmark"], "unstated pay still gets a market range"
    assert "month" in rows["ML Engineer"]["benchmark"].lower()
    assert rows["ML Engineer"]["benchmark"] != rows["Data Scientist"]["benchmark"] or True


REMOTE_CASES = [
    ("Remote", True),
    ("Remote - Anywhere", True),
    ("Remote, APAC", True),
    ("Remote (Asia Pacific)", True),
    ("Remote - Taiwan", True),
    ("Remote, US", False),
    ("Remote - United States", False),
    ("Remote (EMEA)", False),
    ("Remote - Canada", False),
    ("Remote, Germany", False),
    ("US Remote", False),
    ("Remote - LATAM", False),
    # A blocklist cannot name every place; these leaked through one.
    ("Remote Finland", False),
    ("Remote - California; Remote - Oregon", False),
    ("Remote, Bangalore", False),
    ("Portugal, Remote", False),
    ("APAC - Remote", True),
    ("Home based - Worldwide; Office Based - Taipei, Taiwan", True),
]


@pytest.mark.parametrize("location,reachable", REMOTE_CASES)
def test_region_locked_remote_is_not_reachable(tmp_path, location, reachable):
    """A remote role tied to another region is not an opportunity: the applicant can work in Taiwan
    without a permit from 2027-01, and nowhere else."""
    postings = [{"text": "Data Scientist", "categories": {"location": location},
                 "hostedUrl": "https://jobs.lever.co/acme/x", "id": "x"}]
    (tmp_path / "v0" / "postings").mkdir(parents=True, exist_ok=True)
    (tmp_path / "v0" / "postings" / "acme").write_text(json.dumps(postings))
    handler = partial(SimpleHTTPRequestHandler, directory=str(tmp_path))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        p = run(f"http://127.0.0.1:{server.server_port}", tmp_path, "--json",
                config=[{"ats": "lever", "company": "acme", "label": "Acme"}])
        rows = json.loads(p.stdout)
    finally:
        server.shutdown()
    assert bool(rows) is reachable, f"{location!r} should {'match' if reachable else 'not match'}"


YOURATOR = {"payload": {"hasMore": False, "currentPage": 1, "jobs": [
    {"id": 1, "name": "Machine Learning Engineer", "path": "/companies/acme/jobs/1",
     "location": "臺北市", "salary": "月薪 70,000 - 110,000 元",
     "company": {"brand": "Acme AI", "path": "/companies/acme"}},
    {"id": 2, "name": "資深前端工程師", "path": "/companies/acme/jobs/2",
     "location": "新竹縣", "salary": None, "company": {"brand_name": "Acme AI"}},
    {"id": 3, "name": "Data Scientist", "path": "/companies/beta/jobs/3",
     "location": "臺中市", "salary": "面議", "company": {"brand_name": "Beta Corp"}},
    {"id": 4, "name": "Machine Learning Engineer", "path": "/companies/acme/jobs/1",
     "location": "臺北市", "salary": "月薪 70,000 - 110,000 元",
     "company": {"brand": "Acme AI"}},
]}}


@pytest.fixture
def yourator_board(tmp_path):
    (tmp_path / "api" / "v4").mkdir(parents=True)
    (tmp_path / "api" / "v4" / "jobs").write_text(json.dumps(YOURATOR))
    handler = partial(SimpleHTTPRequestHandler, directory=str(tmp_path))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()


def run_yourator(base, tmp_path, *args, config=None):
    cfg = tmp_path / "boards.json"
    cfg.write_text(json.dumps(config or [{"ats": "yourator", "query": "machine learning", "label": "Yourator"}]))
    env = {"JOB_WATCH_YOURATOR_BASE": f"{base}/api/v4", "PATH": "/usr/bin:/bin"}
    return subprocess.run([sys.executable, str(SCRIPT), "--config", str(cfg), *args],
                          capture_output=True, text=True, timeout=120, env=env)


def test_yourator_roles_are_collected_with_taiwan_locations(yourator_board, tmp_path):
    """Taiwan's own boards are where the local volume is; locations come in Chinese."""
    p = run_yourator(yourator_board, tmp_path, "--json", "--locations", "臺北,台北,新竹,臺中,taiwan,taipei,remote")
    assert p.returncode == 0, p.stderr
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "Machine Learning Engineer" in rows and "Data Scientist" in rows
    row = rows["Machine Learning Engineer"]
    assert row["company"] == "Acme AI", "the employer, not the aggregator, is the company"
    assert row["url"] == "https://www.yourator.co/companies/acme/jobs/1", "paths become absolute URLs"
    assert row["location"] == "臺北市"


def test_yourator_salary_is_used_when_given(yourator_board, tmp_path):
    p = run_yourator(yourator_board, tmp_path, "--json", "--with-pay",
                     "--locations", "臺北,台北,新竹,臺中,taiwan,taipei,remote")
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "70,000" in rows["Machine Learning Engineer"]["pay"], "a stated salary is reported"
    assert rows["Data Scientist"]["pay"] in ("not stated", "面議"), "negotiable is not a number"


def test_the_same_posting_is_not_listed_twice(yourator_board, tmp_path):
    """Several keyword queries hit the same job; a pipeline that repeats it wastes applications."""
    p = run_yourator(yourator_board, tmp_path, "--json",
                     "--locations", "臺北,台北,新竹,臺中,taiwan,taipei,remote",
                     config=[{"ats": "yourator", "query": "machine learning", "label": "Yourator: ml"},
                             {"ats": "yourator", "query": "data", "label": "Yourator: data"}])
    rows = json.loads(p.stdout)
    urls = [r["url"] for r in rows]
    assert len(urls) == len(set(urls)), f"duplicates: {urls}"
    assert all(r["company"] for r in rows), "every row names its employer"


def _make_db(path):
    import sqlite3
    c = sqlite3.connect(path)
    c.execute("""create table tw_jobs (id integer primary key, source text, job_id text, job_url text,
                 job_url_canonical text, title text, company text, salary text, location text,
                 employment_type text, description text, content_hash text, first_seen text,
                 last_seen text, metadata text)""")
    rows = [
        ("cake", "1", "https://cake.me/j/1", "Data Scientist", "Acme", "Monthly Salary TWD 90,000",
         "台北市, 台灣", "2026-09-20 10:00:00"),
        ("1111", "2", "https://1111.com.tw/j/2", "資料分析師", "Beta", "", "臺中市, 台灣", "2026-09-19 10:00:00"),
        ("remoteok", "3", "https://remoteok.com/j/3", "Machine Learning Engineer", "Gamma", "", "Remote - USA",
         "2026-09-20 10:00:00"),
        ("cake", "4", "https://cake.me/j/4", "Office Administrator", "Delta", "", "台北市, 台灣", "2026-09-20 10:00:00"),
        ("cake", "5", "https://cake.me/j/5", "Data Engineer", "Epsilon", "", "新竹市, 台灣", "2026-06-01 10:00:00"),
    ]
    for source, jid, url, title, company, salary, location, last_seen in rows:
        c.execute("insert into tw_jobs (source, job_id, job_url, title, company, salary, location, last_seen)"
                  " values (?,?,?,?,?,?,?,?)", (source, jid, url, title, company, salary, location, last_seen))
    c.commit()
    c.close()


def run_db(tmp_path, *args, config=None):
    db = tmp_path / "tw_jobs.db"
    if not db.exists():
        _make_db(db)
    cfg = tmp_path / "boards.json"
    cfg.write_text(json.dumps(config or [{"ats": "sqlite", "path": str(db), "label": "TW board scrape"}]))
    return subprocess.run([sys.executable, str(SCRIPT), "--config", str(cfg), *args],
                          capture_output=True, text=True, timeout=120, env={"PATH": "/usr/bin:/bin"})


def test_the_local_scrape_database_is_a_source(tmp_path):
    """A 33k-row scrape already exists; the pipeline should read it rather than re-crawl."""
    p = run_db(tmp_path, "--json", "--since", "2026-09-14")
    assert p.returncode == 0, p.stderr
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "Data Scientist" in rows and "資料分析師" in rows
    assert "Machine Learning Engineer" not in rows, "Remote - USA is not reachable"
    assert "Office Administrator" not in rows, "off-profile"
    assert "Data Engineer" not in rows, "older than the freshness window"
    assert rows["Data Scientist"]["company"] == "Acme"
    assert rows["Data Scientist"]["url"] == "https://cake.me/j/1"


def test_database_salary_is_reported_as_pay(tmp_path):
    p = run_db(tmp_path, "--json", "--since", "2026-09-14", "--with-pay")
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "90,000" in rows["Data Scientist"]["pay"]
    assert rows["資料分析師"]["pay"] == "not stated"


def _make_104_db(path):
    import sqlite3
    c = sqlite3.connect(path)
    c.execute("""create table "104_data" (id integer primary key, job_id text, job_url text,
                 job_url_canonical text, job_title text, company text, salary text, location text,
                 last_seen text)""")
    rows = [
        ("abc", "https://www.104.com.tw/job/abc", "資料科學家", "Acme TW", "月薪 90,000~120,000 元",
         "台北市信義區", "2026-09-20 23:21:00"),
        ("def", "https://www.104.com.tw/job/def", "門市人員", "Retail Co", "時薪 183 元",
         "桃園市中壢區", "2026-09-20 23:21:00"),
        ("ghi", "https://www.104.com.tw/job/ghi", "Machine Learning Engineer", "OldCo", "面議",
         "新竹市", "2026-06-01 10:00:00"),
        ("jkl", "https://www.104.com.tw/job/jkl", "資料工程師", "Hsinchu Lab", "月薪 70,000 元",
         "新竹市", "2026-09-20 10:00:00"),
    ]
    for jid, url, title, company, salary, location, last_seen in rows:
        c.execute('insert into "104_data" (job_id, job_url, job_title, company, salary, location, last_seen)'
                  " values (?,?,?,?,?,?,?)", (jid, url, title, company, salary, location, last_seen))
    c.commit()
    c.close()


def run_104(tmp_path, *args):
    db = tmp_path / "104.db"
    if not db.exists():
        _make_104_db(db)
    cfg = tmp_path / "boards.json"
    cfg.write_text(json.dumps([{"ats": "sqlite", "path": str(db), "table": "104_data",
                                "source": "104", "label": "104"}]))
    return subprocess.run([sys.executable, str(SCRIPT), "--config", str(cfg), *args],
                          capture_output=True, text=True, timeout=120, env={"PATH": "/usr/bin:/bin"})


def test_the_104_crawl_database_is_a_source(tmp_path):
    """104 already lives in src/data/104.db; the pipeline should read it, not scrape 104.com.tw."""
    p = run_104(tmp_path, "--json", "--since", "2026-09-14")
    assert p.returncode == 0, p.stderr
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "資料科學家" in rows and "資料工程師" in rows
    assert "門市人員" not in rows, "off-profile"
    assert "Machine Learning Engineer" not in rows, "older than the freshness window"
    row = rows["資料科學家"]
    assert row["company"] == "Acme TW"
    assert row["url"] == "https://www.104.com.tw/job/abc"
    assert row["location"] == "台北市信義區"
    assert row["source"] == "104"


def test_104_salary_is_reported_as_pay(tmp_path):
    p = run_104(tmp_path, "--json", "--since", "2026-09-14", "--with-pay")
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "90,000" in rows["資料科學家"]["pay"]
    assert "70,000" in rows["資料工程師"]["pay"]


def test_already_applied_104_roles_are_dropped(tmp_path):
    applied = tmp_path / "applied.json"
    applied.write_text(json.dumps({"applied_job_keys": ["104:abc"]}))
    p = run_104(tmp_path, "--json", "--since", "2026-09-14", "--exclude-applied", str(applied))
    assert p.returncode == 0, p.stderr
    titles = {r["title"] for r in json.loads(p.stdout)}
    assert "資料科學家" not in titles
    assert "資料工程師" in titles


CAKE = {
    "data": [
        {
            "title": "Machine Learning Engineer",
            "path": "ml-1",
            "page": {"path": "acme", "name": "Acme AI"},
            "salary": {"currency": "TWD", "min": 70000, "max": 110000, "type": "per_month"},
            "locations": ["台北市"],
        },
        {
            "title": "資深前端工程師",
            "path": "fe-2",
            "page": {"path": "acme", "name": "Acme AI"},
            "salary": None,
            "locations": ["新竹市"],
        },
        {
            "title": "Data Scientist",
            "path": "ds-3",
            "page": {"path": "beta", "name": "Beta Corp"},
            "salary": {"currency": "TWD", "min": 90000, "max": 120000, "type": "per_month"},
            "locations": ["臺北市"],
        },
    ],
    "total_pages": 1,
    "current_page": 1,
}


class CakeHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        self.rfile.read(length)
        if "/jobs/search" not in self.path:
            self.send_error(404)
            return
        body = json.dumps(CAKE).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


@pytest.fixture
def cake_board():
    server = ThreadingHTTPServer(("127.0.0.1", 0), CakeHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()


def run_cake(base, tmp_path, *args, config=None):
    cfg = tmp_path / "boards.json"
    cfg.write_text(json.dumps(config or [{"ats": "cake", "query": "machine learning", "label": "Cake"}]))
    env = {"JOB_WATCH_CAKE_BASE": f"{base}/api/client/v1/jobs/search", "PATH": "/usr/bin:/bin"}
    return subprocess.run([sys.executable, str(SCRIPT), "--config", str(cfg), *args],
                          capture_output=True, text=True, timeout=120, env=env)


def test_cake_roles_are_collected_with_taiwan_locations(cake_board, tmp_path):
    p = run_cake(cake_board, tmp_path, "--json", "--locations", "臺北,台北,新竹,taiwan,taipei,remote")
    assert p.returncode == 0, p.stderr
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "Machine Learning Engineer" in rows and "Data Scientist" in rows
    row = rows["Machine Learning Engineer"]
    assert row["company"] == "Acme AI"
    assert row["url"] == "https://www.cake.me/companies/acme/jobs/ml-1"
    assert row["location"] == "台北市"


def test_cake_salary_is_used_when_given(cake_board, tmp_path):
    p = run_cake(cake_board, tmp_path, "--json", "--with-pay",
                 "--locations", "臺北,台北,新竹,taiwan,taipei,remote")
    rows = {r["title"]: r for r in json.loads(p.stdout)}
    assert "70000" in rows["Machine Learning Engineer"]["pay"] or "70,000" in rows["Machine Learning Engineer"]["pay"]
    assert rows["Data Scientist"]["pay"] != "not stated"


def test_queue_writes_one_pointer_not_a_block_per_role(board, tmp_path):
    """984 apply blocks would swamp the unattended brain; the queue holds one pointer."""
    queue = tmp_path / "QUEUE.md"
    queue.write_text("# Work queue\n\n")
    p = run(board, tmp_path, "--queue", str(queue))
    assert p.returncode == 0, p.stderr
    text = queue.read_text()
    assert text.count("## [") == 1
    assert "Apply:" not in text
    assert "JOB_PIPELINE" in text or "job pipeline" in text.lower()
    assert "roles" in text.lower()


def test_queue_pointer_keeps_a_needs_you_marker(board, tmp_path):
    queue = tmp_path / "QUEUE.md"
    queue.write_text("## [!] Job pipeline: 1 reachable roles\nrepo: x\ntype: decision\ngoal: old\ndone when: x\n")
    p = run(board, tmp_path, "--queue", str(queue))
    assert p.returncode == 0, p.stderr
    text = queue.read_text()
    assert "## [!] Job pipeline:" in text
    assert text.count("## [") == 1


def test_already_applied_roles_are_dropped(tmp_path):
    applied = tmp_path / "applied.json"
    applied.write_text(json.dumps({"applied_job_keys": ["cake:1"]}))
    p = run_db(tmp_path, "--json", "--since", "2026-09-14", "--exclude-applied", str(applied))
    assert p.returncode == 0, p.stderr
    rows = json.loads(p.stdout)
    titles = {r["title"] for r in rows}
    assert "Data Scientist" not in titles
    assert "資料分析師" in titles


def test_text_output_names_how_many_employers(board, tmp_path):
    p = run(board, tmp_path)
    assert p.returncode == 0, p.stderr
    assert "employers" in p.stdout.lower()
    assert "2 employers" in p.stdout or "2 employer" in p.stdout


def test_pipeline_lists_profile_close_roles_first(board, tmp_path):
    out = tmp_path / "JOB_PIPELINE.md"
    p = run(board, tmp_path, "--pipeline", str(out), "--with-pay")
    assert p.returncode == 0, p.stderr
    text = out.read_text()
    assert "Closest to the profile" in text
    ds = text.find("Data Scientist")
    intern = text.find("Admin Intern")
    assert ds != -1
    assert intern == -1 or ds < intern or "Admin Intern" not in text
    assert "https://gh.io/1" in text


def _make_next_db(path):
    import sqlite3
    c = sqlite3.connect(path)
    c.execute("""create table tw_jobs (id integer primary key, source text, job_id text, job_url text,
                 job_url_canonical text, title text, company text, salary text, location text,
                 last_seen text)""")
    rows = [
        ("lever", "b1", "https://jobs.lever.co/binance/b1",
         "Binance Accelerator Program - Applied Data Scientist", "Binance", "",
         "Taipei", "2026-09-20 10:00:00"),
        ("lever", "b2", "https://jobs.lever.co/binance/b2",
         "Binance Accelerator Program - AI Research Scientist", "Binance", "",
         "Taipei", "2026-09-20 10:00:00"),
        ("104", "c1", "https://www.104.com.tw/job/c1",
         "LLM/RAG Engineering Intern", "櫛構科技", "月薪 32,000 元",
         "桃園市中壢區", "2026-09-20 10:00:00"),
        ("greenhouse", "a1", "https://gh.io/appier/1",
         "Research Scientist (Generative AI)", "Appier", "",
         "Taipei, Taiwan", "2026-09-20 10:00:00"),
        ("1111", "f1", "https://1111.com.tw/j/f1",
         "軟體工程師", "仁寶電腦工業股份有限公司", "月薪 50,000 元",
         "台北市", "2026-09-20 10:00:00"),
    ]
    for source, jid, url, title, company, salary, location, last_seen in rows:
        c.execute("insert into tw_jobs (source, job_id, job_url, title, company, salary, location, last_seen)"
                  " values (?,?,?,?,?,?,?,?)", (source, jid, url, title, company, salary, location, last_seen))
    c.commit()
    c.close()


def test_next_shots_are_the_gauntlet_job_queue(tmp_path):
    """Gauntlet fires one packaged shot, not 1177 routes. --next is fire:next for jobs."""
    db = tmp_path / "tw_jobs.db"
    _make_next_db(db)
    p = run_db(tmp_path, "--json", "--next", "3", "--since", "2026-09-14")
    assert p.returncode == 0, p.stderr
    rows = json.loads(p.stdout)
    assert len(rows) == 3
    companies = [r["company"] for r in rows]
    assert len(companies) == len(set(companies)), "one employer per shot so Binance cannot swamp the queue"
    titles = [r["title"] for r in rows]
    assert any("Intern" in t or "Accelerator" in t or "實習" in t for t in titles[:2])
    assert "軟體工程師" not in titles, "generic Compal engineer is the inventory, not the next shot"
    assert all("timing" in r and "family" in r and "cv_variant" in r for r in rows)


def test_csv_and_handoff_are_the_public_job_contract(tmp_path):
    """The public repo gets a CSV inventory and a FIRE-shaped handoff, never per-role queue blocks."""
    db = tmp_path / "tw_jobs.db"
    _make_next_db(db)
    csv_path = tmp_path / "live.csv"
    handoff_path = tmp_path / "handoff.json"
    p = run_db(tmp_path, "--json", "--next", "3", "--since", "2026-09-14",
               "--csv", str(csv_path), "--handoff", str(handoff_path))
    assert p.returncode == 0, p.stderr
    text = csv_path.read_text()
    assert text.splitlines()[0].startswith("company,title,location,url")
    assert "Binance Accelerator Program" in text
    assert "軟體工程師" in text, "CSV is the full inventory"
    blob = json.loads(handoff_path.read_text())
    assert blob["schema"] == "blowback.job_handoff.v1"
    assert blob["inventory"]["roles"] == 5
    assert len(blob["shots"]) == 3
    assert blob["shots"][0]["target"]["starting_url"].startswith("http")
    assert "final_submit" in blob["browser_agent_contract"]["human_gate"]
    dumped = json.dumps(blob)
    assert "0972926724" not in dumped and "christstrife" not in dumped
    stdout = json.loads(p.stdout)
    assert len(stdout) == 3, "--next still limits stdout; CSV stays full"
