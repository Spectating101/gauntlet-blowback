#!/usr/bin/env python3
"""Report FIRE/PREPARE/VERIFY routes whose deadlines are near or just missed."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MASTER = ROOT / "docs" / "gauntlet-master.json"
# Anchored on both sides: unanchored, "12026-09-25" and "2026-09-251" both yield a
# plausible-looking date and a wrong deadline enters the queue silently.
DATE_RE = re.compile(r"(?<!\d)(\d{4}-\d{2}-\d{2})(?!\d)")
ACTIVE_PREFIXES = ("FIRE", "PREPARE", "VERIFY")
EXPIRED_GRACE_DAYS = 3
QUEUE_REPO = "/home/phyrexian/Downloads/llm_automation/project_portfolio/gauntlet-blowback"


@dataclass(frozen=True)
class Hit:
    route_id: str
    organization: str
    opportunity: str
    deadline: date
    delta: int
    packaged: bool


def load_routes(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        if isinstance(data.get("records"), list):
            return data["records"]
        lists = [value for value in data.values() if isinstance(value, list)]
        if len(lists) == 1:
            return lists[0]
    raise ValueError("master must be a JSON list of routes, or a dict containing one list")


RANGE_RE = re.compile(r"^\s*(\d{4}-\d{2}-\d{2})\s*/\s*(\d{4}-\d{2}-\d{2})\s*$")
INSTANT_RE = re.compile(r"^\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})\s*$")


def parse_deadline(value) -> date | None:
    if value is None:
        return None
    text = str(value).strip()
    window = RANGE_RE.match(text)
    if window:  # an event window stays open until its last day
        try:
            return date.fromisoformat(window.group(2))
        except ValueError:
            return None
    if INSTANT_RE.match(text):  # 23:59 Anywhere-on-Earth is the next UTC day
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(timezone.utc).date()
        except ValueError:
            pass
    match = DATE_RE.search(str(value))
    if not match:
        return None
    try:
        return date.fromisoformat(match.group(1))
    except ValueError:
        return None


# A status is active when FIRE, PREPARE or VERIFY appears as a word in it, unless it leads with a stop word.
# The earlier test was "starts with", which skipped STRETCH_FIRE, CHECK_FIRE, DEFAULT_PRIMARY_FIRE and
# WATCH_FIRE (15 routes, including a paper due 2026-10-23) although the queue (operator.mjs) treats any
# status containing FIRE as fire-priority. HOLD_FIRE_LATER stays out: it leads with HOLD.
ACTIVE_WORDS = frozenset({"FIRE", "PREPARE", "VERIFY"})
INACTIVE_LEADS = frozenset({"HOLD", "KILL", "REJECT", "REJECTED", "EXPIRED", "CLOSED", "WITHDRAWN", "SUBMITTED", "DONE"})


def is_active(status) -> bool:
    if not isinstance(status, str):
        return False
    words = [w for w in re.split(r"[^A-Z0-9]+", status.upper()) if w]
    if not words or words[0] in INACTIVE_LEADS:
        return False
    return status.startswith(ACTIVE_PREFIXES) or bool(ACTIVE_WORDS.intersection(words))


def has_manifest(route: dict) -> bool:
    return bool(route.get("execution_manifest"))


def days_away(delta: int) -> str:
    if delta < 0:
        return f"{-delta} days ago"
    return f"in {delta} days"


def select_hits(routes, today: date, days: int) -> list[Hit]:
    upcoming: list[Hit] = []
    expired: list[Hit] = []
    earliest = today - timedelta(days=EXPIRED_GRACE_DAYS)
    latest = today + timedelta(days=days)
    for route in routes:
        if not isinstance(route, dict) or not is_active(route.get("status")):
            continue
        route_id = route.get("id")
        deadline = parse_deadline(route.get("deadline"))
        if not route_id or deadline is None or deadline < earliest or deadline > latest:
            continue
        hit = Hit(
            route_id=str(route_id),
            organization=str(route.get("organization") or ""),
            opportunity=str(route.get("opportunity") or ""),
            deadline=deadline,
            delta=(deadline - today).days,
            packaged=has_manifest(route),
        )
        if hit.delta >= 0:
            upcoming.append(hit)
        else:
            expired.append(hit)
    upcoming.sort(key=lambda hit: hit.deadline, reverse=True)
    expired.sort(key=lambda hit: hit.deadline, reverse=True)
    return upcoming + expired


def report_line(hit: Hit) -> str:
    parts = [
        hit.route_id,
        hit.organization,
        hit.opportunity,
        hit.deadline.isoformat(),
        days_away(hit.delta),
    ]
    if hit.packaged:
        parts.append("packaged")
    return "  ".join(part for part in parts if part)


def render_report(hits: list[Hit]) -> str:
    lines = [report_line(hit) for hit in hits]
    lines.append(f"{len(hits)} due")
    return "\n".join(lines) + "\n"


def queue_block(hit: Hit) -> str:
    packaged = "packaged: execution manifest ready" if hit.packaged else "no execution manifest"
    return (
        f"## [!] Deadline: {hit.route_id} — {hit.deadline.isoformat()} ({days_away(hit.delta)})\n"
        f"repo: {QUEUE_REPO}\n"
        f"type: decision\n"
        f"goal: {hit.organization} — {hit.opportunity}. {packaged}. "
        f"Decide: fire, drop, or move the date.\n"
        f"done when: the user has decided, or the route status is updated.\n"
    )


def append_queue(path: Path, hits: list[Hit]) -> None:
    if not path.is_file():
        raise FileNotFoundError(f"queue file not found: {path}")
    text = path.read_text()
    blocks = [queue_block(hit) for hit in hits if hit.route_id not in text]
    if not blocks:
        return
    addition = "\n".join(blocks)
    if not text.endswith("\n"):
        text += "\n"
    path.write_text(text + addition)


def parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Watch near and just-missed route deadlines.")
    parser.add_argument("--master", type=Path, default=DEFAULT_MASTER)
    parser.add_argument("--today", default=None, help="YYYY-MM-DD (defaults to today)")
    parser.add_argument("--days", type=int, default=7)
    parser.add_argument("--queue", type=Path, default=None)
    parser.add_argument("--fail-if-due", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    today = date.fromisoformat(args.today) if args.today else date.today()
    master = args.master
    if not master.is_file():
        print(f"master not found: {master}", file=sys.stderr)
        return 2
    try:
        routes = load_routes(json.loads(master.read_text()))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"cannot read master: {exc}", file=sys.stderr)
        return 2

    hits = select_hits(routes, today, args.days)
    sys.stdout.write(render_report(hits))

    if args.queue is not None:
        try:
            append_queue(args.queue, hits)
        except FileNotFoundError as exc:
            print(exc, file=sys.stderr)
            return 2

    if args.fail_if_due and hits:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
