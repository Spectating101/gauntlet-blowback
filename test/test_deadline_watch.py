"""Deadlines must reach the work queue by themselves.

A packet-ready route (shih-hsin-finance) died four days before anyone noticed, and
smartliving-creative expired the day before that. Nothing watched the dates. This watcher turns
near and just-missed deadlines into queue items a human will see.
"""
import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "deadline-watch.py"
QUEUE_HEADER = "# Work queue\n\nintro\n\n---\n"

ROUTES = [
    {"id": "due-in-3", "status": "FIRE_NOW", "deadline": "2026-09-24", "execution_manifest": {"x": 1},
     "organization": "Org A", "opportunity": "Thing A"},
    {"id": "due-in-20", "status": "FIRE_NOW", "deadline": "2026-10-11", "organization": "Org B", "opportunity": "Thing B"},
    {"id": "expired-2d", "status": "FIRE_NOW", "deadline": "2026-09-19", "execution_manifest": {"x": 1},
     "organization": "Org C", "opportunity": "Thing C"},
    {"id": "expired-long", "status": "FIRE_NOW", "deadline": "2026-08-01", "organization": "Org D", "opportunity": "Thing D"},
    {"id": "rolling", "status": "FIRE_NOW", "deadline": "ROLLING", "organization": "Org E", "opportunity": "Thing E"},
    {"id": "watch-only", "status": "WATCH", "deadline": "2026-09-23", "organization": "Org F", "opportunity": "Thing F"},
]


@pytest.fixture
def master(tmp_path):
    p = tmp_path / "gauntlet-master.json"
    p.write_text(json.dumps(ROUTES))
    return p


def run(master, *args):
    p = subprocess.run([sys.executable, str(SCRIPT), "--master", str(master), "--today", "2026-09-21", *args],
                       capture_output=True, text=True, timeout=120)
    return p.returncode, p.stdout + p.stderr


def test_reports_near_and_just_missed_deadlines(master):
    code, out = run(master)
    assert code == 0, out
    assert "due-in-3" in out and "expired-2d" in out
    assert "due-in-20" not in out, "outside the window"
    assert "expired-long" not in out, "too old to chase"
    assert "rolling" not in out and "watch-only" not in out, "no date, or not a FIRE route"
    assert "3 days" in out or "3d" in out


def test_window_is_configurable(master):
    code, out = run(master, "--days", "30")
    assert code == 0 and "due-in-20" in out


def test_writes_queue_items_without_duplicating(master, tmp_path):
    q = tmp_path / "QUEUE.md"
    q.write_text(QUEUE_HEADER)
    code, _ = run(master, "--queue", str(q))
    assert code == 0
    first = q.read_text()
    assert first.startswith(QUEUE_HEADER), "the existing queue is preserved"
    assert first.count("## [!] ") == 2, first
    assert "due-in-3" in first and "expired-2d" in first
    assert "type: decision" in first, "a deadline call is the user's, not the brain's"
    code, _ = run(master, "--queue", str(q))
    assert q.read_text() == first, "running again adds nothing"


def test_queue_item_carries_what_a_human_needs(master, tmp_path):
    q = tmp_path / "QUEUE.md"
    q.write_text(QUEUE_HEADER)
    run(master, "--queue", str(q))
    text = q.read_text()
    assert "Org A" in text and "Thing A" in text
    assert "2026-09-24" in text and "2026-09-19" in text
    assert "packaged" in text.lower() or "manifest" in text.lower(), "flag routes that are ready to fire"


def test_exit_code_signals_whether_anything_is_due(master, tmp_path):
    empty = tmp_path / "none.json"
    empty.write_text(json.dumps([r for r in ROUTES if r["id"] in ("due-in-20", "rolling")]))
    code, _ = run(empty)
    assert code == 0, "nothing due is still a success"
    code, out = run(master, "--fail-if-due")
    assert code == 1, "opt-in non-zero exit for cron-style use"


MALFORMED = [
    {"id": "long-year", "status": "FIRE_NOW", "deadline": "12026-09-25", "organization": "Org", "opportunity": "X"},
    {"id": "trailing-digit", "status": "FIRE_NOW", "deadline": "2026-09-251", "organization": "Org", "opportunity": "Y"},
    {"id": "real-date", "status": "FIRE_NOW", "deadline": "2026-09-25", "organization": "Org", "opportunity": "Z"},
]


def test_a_date_embedded_in_a_longer_number_is_not_a_deadline(tmp_path):
    """`\\d{4}-\\d{2}-\\d{2}` is unanchored, so "12026-09-25" yields "2026-09-25" and a wrong date
    silently enters the queue. A reviewer caught this in a benchmark; it was real."""
    master = tmp_path / "m.json"
    master.write_text(json.dumps(MALFORMED))
    p = subprocess.run([sys.executable, str(SCRIPT), "--master", str(master), "--today", "2026-09-21", "--days", "30"],
                       capture_output=True, text=True, timeout=120)
    assert p.returncode == 0, p.stderr
    assert "real-date" in p.stdout
    assert "long-year" not in p.stdout, "12026-09-25 is not 2026-09-25"
    assert "trailing-digit" not in p.stdout, "2026-09-251 is not 2026-09-25"
