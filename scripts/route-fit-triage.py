#!/usr/bin/env python3
"""Read-only triage of Gauntlet routes by whether this applicant can enter them.

The applicant is an Indonesian national living in Taiwan, a full-time master's
student until 2027-01, with no work authorisation outside Taiwan.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))
import jev

DEFAULT_MASTER = ROOT / "docs" / "gauntlet-master.json"

FIT_ORDER = ("ADDRESSABLE", "NEEDS_CHECK", "BLOCKED_WORK_AUTH", "INELIGIBLE")
# choice criteria are a label -> meaning map; the meanings belong here rather
# than spelled out in the prompt, because this is what the model classifies on.
JEV_FIT_CRITERIA = {
    "INELIGIBLE": "the applicant cannot enter this route",
    "BLOCKED_WORK_AUTH": "the route requires work authorisation the applicant does not hold",
    "NEEDS_CHECK": "eligibility or work authorisation is unverified on this record",
    "ADDRESSABLE": "the applicant can enter this route as recorded",
}
JEV_STATE_KEYS = (
    "id",
    "lane",
    "organization",
    "opportunity",
    "status",
    "deadline",
    "gate",
)
JEV_OPTIONAL_KEYS = ("eligibility_note", "eligibility_verdict")
JEV_APPLICANT_LINE = (
    "Applicant: Indonesian national living in Taiwan, full-time master’s student "
    "until 2027-01, may work in Taiwan without a permit for two years from "
    "graduation, holds no work authorisation elsewhere."
)
JEV_FIT_PROMPT = "Classify whether this applicant can enter the route."
JEV_FAILURE_LIMIT = 3
# Anchored on both sides: unanchored, "12026-09-25" and "2026-09-251" both yield a
# plausible-looking date and a wrong deadline enters the queue silently.
DATE_RE = re.compile(r"(?<!\d)(\d{4}-\d{2}-\d{2})(?!\d)")

# Covered visa gates first so a supportive phrase is not treated as a block.
COVERED_VISA_PHRASES = (
    "visa support",
    "visa sponsorship offered",
    "sponsorship available",
    "government authorised exchange scheme",
    "government authorized exchange scheme",
)

# Spec order: quote the first listed phrase that appears, not the first in the text.
WORK_AUTH_PHRASES = (
    "work authorization",
    "work authorisation",
    "visa",
    "sponsorship",
    "right to work",
    "h-1b",
    "h1b",
    "skilled worker",
    "tier 2",
    "graduate visa",
    "employment pass",
    "e-3",
    "l-1",
)

STUDENT_PHRASES = (
    "student enrolment",
    "student enrollment",
    "student pack",
    "campus",
)


def load_records(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("records"), list):
        return data["records"]
    raise ValueError(f"{path} must be a JSON list or an object with a records list")


def field(record: dict, key: str) -> str:
    value = record.get(key)
    if value is None:
        return ""
    return str(value)


def gate_or_opportunity(record: dict) -> str:
    return f"{field(record, 'gate')} {field(record, 'opportunity')}"


def deadline_date(deadline: str) -> str | None:
    match = DATE_RE.search(deadline or "")
    return match.group(1) if match else None


def is_expired(deadline: str, today: str) -> bool:
    found = deadline_date(deadline)
    return found is not None and found < today


def _phrase_pattern(phrase: str) -> re.Pattern:
    # A phrase must start at a word edge: "e-3" (a visa class) is not in "Stage-3", "l-1" is not in
    # "Level-1", "ntu" (a university) is not in "quantum" or "venture". Short or numbered phrases must also
    # end at a word edge ("e-3" is not "e-30"); longer words keep suffixes ("visa" still matches "visas").
    tail = r"(?![A-Za-z0-9])" if re.search(r"\d", phrase) or len(phrase) <= 3 else ""
    return re.compile(r"(?<![A-Za-z0-9])" + re.escape(phrase) + tail, re.IGNORECASE)


def find_listed_phrase(text: str, phrases: tuple[str, ...]) -> str | None:
    for phrase in phrases:
        match = _phrase_pattern(phrase).search(text)
        if match:
            return text[match.start() : match.end()]
    return None


EMPLOYMENT_LANES = {"JOB", "PREDOC", "PHD", "RESEARCH_JOB", "RESEARCH_LAB", "INTERNSHIP"}
LOCAL_OR_REMOTE_PHRASES = (
    "taiwan", "taipei", "taoyuan", "hsinchu", "tainan", "kaohsiung", "yuan ze", "yzu", "remote",
    "work from anywhere", "fully remote", "indonesia", "jakarta",
    # Taiwanese institutions by name: a route at NYCU is local even when the record never says Taiwan.
    "nycu", "yang ming", "chiao tung", "ntu", "ntust", "nthu", "ncku", "ncue", "sinica", "nctu",
    "academia sinica", "national central", "national cheng kung", "national tsing hua",
)


def classify(record: dict) -> tuple[str, str]:
    verdict = field(record, "eligibility_verdict").strip()
    verdict_l = verdict.lower()
    if verdict_l.startswith("ineligible"):
        return "INELIGIBLE", f"recorded verdict: {verdict}"
    if verdict_l.startswith("eligible"):
        return "ADDRESSABLE", f"recorded verdict: {verdict}"

    text = gate_or_opportunity(record)
    covered = find_listed_phrase(text, COVERED_VISA_PHRASES)
    if covered:
        return "ADDRESSABLE", "visa gate is covered"

    blocked = find_listed_phrase(text, WORK_AUTH_PHRASES)
    if blocked:
        return "BLOCKED_WORK_AUTH", f'work-auth phrase found: "{blocked}"'

    if field(record, "lane") == "STUDENT_INFRASTRUCTURE" or find_listed_phrase(text, STUDENT_PHRASES):
        return "ADDRESSABLE", "applicant is enrolled until 2027-01"

    # Employment abroad is the trap: a posting that says nothing about visas is not evidence that
    # none is needed, and the applicant holds no work authorisation outside Taiwan. Silence on an
    # overseas job means "go and read the posting", not "open".
    if field(record, "lane").upper() in EMPLOYMENT_LANES:
        whole = " ".join(str(record.get(k) or "") for k in ("organization", "opportunity", "gate", "assets"))
        if not find_listed_phrase(whole, LOCAL_OR_REMOTE_PHRASES):
            return "NEEDS_CHECK", "employment route abroad; work authorisation unverified on this record"

    gate = field(record, "gate").strip()
    gate_l = gate.lower()
    if not gate or "unverified" in gate_l or "unknown" in gate_l:
        return "NEEDS_CHECK", "gate is empty or mentions an unverified/unknown requirement"
    return "ADDRESSABLE", "no eligibility restriction found in the record"


def row_from(record: dict) -> dict:
    fit, why = classify(record)
    return {
        "id": record.get("id"),
        "fit": fit,
        "why": why,
        "deadline": record.get("deadline"),
        "lane": record.get("lane"),
        "organization": record.get("organization"),
        "opportunity": record.get("opportunity"),
        "status": record.get("status"),
        "source_url": record.get("source_url") or record.get("source") or "",
    }


def jev_state(record: dict) -> dict:
    state = {key: record.get(key) for key in JEV_STATE_KEYS}
    for key in JEV_OPTIONAL_KEYS:
        if key in record and record.get(key) not in (None, ""):
            state[key] = record.get(key)
    state["applicant"] = JEV_APPLICANT_LINE
    return state


def parse_jev_fit(answers) -> tuple[str, float] | None:
    if not isinstance(answers, dict):
        return None
    payload = answers.get("fit")
    if not isinstance(payload, dict):
        return None
    choice = payload.get("choice")
    if choice not in JEV_FIT_CRITERIA:
        return None
    try:
        confidence = float(payload["confidence"])
    except (KeyError, TypeError, ValueError):
        return None
    return str(choice), confidence


def jev_why(choice: str, confidence: float, heuristic: str) -> str:
    scored = f"{confidence:.2f}"
    if choice == heuristic:
        return f"Jev confirmed heuristic {heuristic} ({scored})."
    return f"Jev replaced heuristic {heuristic} with {choice} ({scored})."


def sort_key(row: dict) -> tuple:
    found = deadline_date(str(row.get("deadline") or ""))
    ident = str(row.get("id") or "")
    if found:
        return (0, found, ident)
    return (1, str(row.get("deadline") or ""), ident)


def render_shortlist(rows: list[dict]) -> str:
    grouped: dict[str, list[dict]] = {name: [] for name in FIT_ORDER}
    for row in rows:
        grouped.setdefault(row["fit"], []).append(row)

    lines: list[str] = []
    for fit in FIT_ORDER:
        group = sorted(grouped.get(fit, []), key=sort_key)
        if not group:
            continue
        lines.append(f"{fit} ({len(group)})")
        for row in group:
            deadline = row.get("deadline") or "—"
            org = row.get("organization") or ""
            opportunity = row.get("opportunity") or ""
            lines.append(f"  {deadline}  {row.get('id')}  {org}  {opportunity}")
            lines.append(f"    {row['why']}")
        lines.append("")

    counts = Counter(row["fit"] for row in rows)
    lines.append("  ".join(f"{name}: {counts.get(name, 0)}" for name in FIT_ORDER))
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Classify Gauntlet routes by applicant work-auth and student fit."
    )
    parser.add_argument("--master", type=Path, default=DEFAULT_MASTER, help="Gauntlet master JSON")
    parser.add_argument("--today", default=None, help="YYYY-MM-DD cutoff; drop earlier dated deadlines")
    parser.add_argument("--json", action="store_true", help="Print a JSON list of classified routes")
    parser.add_argument("--fit", choices=FIT_ORDER, metavar="CLASS", help="Keep one fit class")
    parser.add_argument(
        "--jev",
        action="store_true",
        help="Ask Jev to classify fit; heuristics remain the fallback",
    )
    args = parser.parse_args(argv)

    master = args.master
    if not master.is_file():
        print(f"not a file: {master}", file=sys.stderr)
        return 2

    today = args.today or date.today().isoformat()
    records = load_records(master)

    ask_jev = bool(args.jev)
    consecutive_failures = 0
    reported_jev = False
    if ask_jev and not jev.available():
        print("jev is not configured; keeping heuristic verdicts", file=sys.stderr)
        reported_jev = True
        ask_jev = False

    rows: list[dict] = []
    for record in records:
        if is_expired(field(record, "deadline"), today):
            continue
        row = row_from(record)
        if args.jev:
            heuristic = row["fit"]
            row["heuristic_fit"] = heuristic
            if ask_jev:
                answers = jev.ask(
                    jev_state(record),
                    {"fit": jev.choice(JEV_FIT_PROMPT, JEV_FIT_CRITERIA)},
                )
                parsed = parse_jev_fit(answers)
                if parsed is None:
                    consecutive_failures += 1
                    if not reported_jev:
                        print("jev unreachable; keeping heuristic verdicts", file=sys.stderr)
                        reported_jev = True
                    if consecutive_failures >= JEV_FAILURE_LIMIT:
                        ask_jev = False
                else:
                    consecutive_failures = 0
                    choice, confidence = parsed
                    row["fit"] = choice
                    row["why"] = jev_why(choice, confidence, heuristic)
        rows.append(row)

    if args.fit:
        rows = [row for row in rows if row["fit"] == args.fit]

    if args.json:
        print(json.dumps(rows))
    else:
        sys.stdout.write(render_shortlist(rows))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
