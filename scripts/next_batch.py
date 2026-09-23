#!/usr/bin/env python3
"""Today's applications: the next N roles in the queue that have not been sent.

The queue is already in send order. Local ledgers track submitted URLs and
live portal reviews. HOLD/BLOCKED reviews keep unsuitable roles out of the
batch until a later READY review reopens them. These JSON Lines files are
git-ignored because they record one person's application work.
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
DEFAULT_REVIEW = ROOT / "data/job-review.local.jsonl"
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
        # A url that is not a non-empty string is a damaged line like any other;
        # a list here used to crash the whole read.
        url = entry.get("url") if isinstance(entry, dict) else None
        if isinstance(url, str) and url:
            sent.add(url)
    return sent


def load_review_holds(path) -> set[str]:
    """Latest local review verdict per URL; READY reopens a held role."""
    path = Path(path)
    if not path.exists():
        return set()
    verdicts = {}
    for raw in path.read_bytes().splitlines():
        try:
            entry = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
        if not isinstance(entry, dict):
            continue
        url, status = entry.get("url"), entry.get("status")
        if isinstance(url, str) and url and status in {"HOLD", "BLOCKED", "READY"}:
            verdicts[url] = status
    return {url for url, status in verdicts.items() if status != "READY"}


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


def next_batch(rows, sent, n=10, include_unreachable=False, per_company=None, held=None) -> list[dict]:
    """The next n unsent roles in queue order.

    per_company caps how many roles one employer gets in a single batch. The
    queue's top is crowded by one employer (Binance's accelerator lists a dozen
    near-identical roles), and a day spent on one recruiter's inbox wastes
    applications. Capped roles are not skipped for good: they come back in a
    later batch. None, or a value of 0 or less, means no cap -- the same as the
    command line. A role with no employer named is never capped: an empty name
    says nothing about which company it is, so unrelated roles must not share it.
    """
    if n <= 0:
        return []
    if per_company is not None and per_company <= 0:
        per_company = None
    batch = []
    per = {}
    for row in rows:
        url = row.get("url") or ""
        if not url or url in sent or url in (held or ()):
            continue
        if not include_unreachable and not _reachable(row):
            continue
        key = _company(row)
        if per_company is not None and key:
            if per.get(key, 0) >= per_company:
                continue
            per[key] = per.get(key, 0) + 1
        batch.append(row)
        if len(batch) == n:
            break
    return batch


def _company(row: dict) -> str:
    return " ".join(str(row.get("company") or "").lower().split())


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
    ap.add_argument("--review", type=Path, default=DEFAULT_REVIEW)
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--include-unreachable", action="store_true")
    ap.add_argument("--per-company", type=int, default=2,
                    help="at most this many roles from one employer per batch (0 or less: no cap)")
    ap.add_argument("--mark-sent", metavar="URL")
    ap.add_argument("--mark-review", choices=["HOLD", "BLOCKED", "READY"])
    ap.add_argument("--url", help="role URL for --mark-review")
    ap.add_argument("--reason", help="observed reason for --mark-review")
    ap.add_argument("--today", default=date.today().isoformat())
    args = ap.parse_args(argv)

    if args.mark_sent:
        print("recorded" if mark_sent(args.ledger, args.mark_sent, args.today) else "already recorded")
        return 0
    if args.mark_review:
        if not args.url or not args.reason:
            ap.error("--mark-review requires --url and --reason")
        args.review.parent.mkdir(parents=True, exist_ok=True)
        with args.review.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({"url": args.url, "status": args.mark_review,
                                 "reason": args.reason, "at": args.today}, ensure_ascii=False) + "\n")
        print("review recorded")
        return 0
    rows = load_queue(args.queue)
    cap = args.per_company if args.per_company and args.per_company > 0 else None
    print(render(next_batch(rows, load_sent(args.ledger), args.n, args.include_unreachable,
                            cap, load_review_holds(args.review))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
