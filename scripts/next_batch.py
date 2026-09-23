#!/usr/bin/env python3
"""Today's applications: the next N roles in the queue that have not been sent.

The queue is already in send order. What it cannot know is what went out
yesterday, so a small ledger records each sent URL and the batch skips them.
The ledger is a local JSON Lines file, git-ignored: it is a record of one
person's applications, not something to publish.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_QUEUE = ROOT / "output/phd-taiwan-2027/application-queue.csv"
DEFAULT_LEDGER = ROOT / "data/applied.local.jsonl"
REACHABLE_FLOOR = 0.5


def load_queue(path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    return sorted(rows, key=lambda r: int(r["rank"]))


def load_sent(ledger_path) -> set[str]:
    """URLs already sent. A damaged line is skipped, so one bad write never
    hides the rest of the record."""
    path = Path(ledger_path)
    if not path.exists():
        return set()
    sent = set()
    # Read bytes and decode per line: a line of invalid UTF-8 is just another
    # damaged line, and reading the whole file as text would raise on it.
    for raw in path.read_bytes().splitlines():
        try:
            line = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(entry, dict) and entry.get("url"):
            sent.add(entry["url"])
    return sent


def mark_sent(ledger_path, url, today) -> bool:
    """Record a sent URL once. Returns False when it was already recorded."""
    path = Path(ledger_path)
    if url in load_sent(path):
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps({"url": url, "at": today}, ensure_ascii=False) + "\n")
    return True


def _reachable(row: dict) -> bool:
    try:
        return float(row.get("reachable") or "") >= REACHABLE_FLOOR
    except ValueError:
        return False


def next_batch(rows, sent, n=10, include_unreachable=False) -> list[dict]:
    if n <= 0:
        return []
    batch = []
    for row in rows:
        url = row.get("url") or ""
        if not url or url in sent:
            continue
        if not include_unreachable and not _reachable(row):
            continue
        batch.append(row)
        if len(batch) == n:
            break
    return batch


def _pay(row: dict) -> str:
    if row.get("pay_stated") == "True" and row.get("plausible") != "False":
        try:
            return f"{int(float(row['annual_twd'])):,}"
        except (KeyError, TypeError, ValueError):
            pass
    return "pay not stated"


def render(batch) -> str:
    if not batch:
        return "Nothing left to send."
    return "\n".join(
        f"- [ ] #{r['rank']} {r['company']} — {r['title']} ({_pay(r)}) {r['url']}" for r in batch)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    ap.add_argument("--ledger", type=Path, default=DEFAULT_LEDGER)
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--include-unreachable", action="store_true")
    ap.add_argument("--mark-sent", metavar="URL")
    ap.add_argument("--today", default=date.today().isoformat())
    args = ap.parse_args(argv)

    if args.mark_sent:
        print("recorded" if mark_sent(args.ledger, args.mark_sent, args.today) else "already recorded")
        return 0
    rows = load_queue(args.queue)
    print(render(next_batch(rows, load_sent(args.ledger), args.n, args.include_unreachable)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
