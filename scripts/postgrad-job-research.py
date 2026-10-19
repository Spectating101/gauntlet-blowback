#!/usr/bin/env python3
"""Verify prioritized post-graduation postings against direct employer ATS APIs.
Discovery is not verification. This tool never submits applications.
"""
import argparse
import json
import re
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
TZ = ZoneInfo("Asia/Taipei")


def api_url(row):
    board, identity = row["board"], str(row["posting_id"])
    if not re.fullmatch(r"[a-zA-Z0-9-]{2,80}", board):
        raise ValueError("invalid board")
    if row["ats"] == "greenhouse":
        if not identity.isdigit():
            raise ValueError("invalid posting ID")
        expected = f"https://job-boards.greenhouse.io/{board}/jobs/{identity}"
        url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs/{identity}"
    elif row["ats"] == "lever":
        if not re.fullmatch(r"[0-9a-f-]{36}", identity):
            raise ValueError("invalid posting ID")
        expected = f"https://jobs.lever.co/{board}/{identity}"
        url = f"https://api.lever.co/v0/postings/{board}/{identity}"
    else:
        raise ValueError("unsupported ATS")
    if row["source_url"] != expected:
        raise ValueError("source URL does not match the ATS identity")
    return url


def fetch(url):
    request = urllib.request.Request(
        url, headers={"Accept": "application/json", "User-Agent": "GauntletJobResearch/1.0"}
    )
    with urllib.request.urlopen(request, timeout=12) as response:
        return json.load(response)


def normalized(value):
    return " ".join(re.findall(r"[a-z0-9]+", str(value).casefold()))


def evaluate(target, loader=fetch):
    row = dict(target)
    row["checked_at"] = datetime.now(TZ).isoformat(timespec="seconds")
    row["application_state"] = "NOT_RECONCILED"
    url = api_url(row)
    try:
        posting = loader(url)
        title = posting.get("title") if row["ats"] == "greenhouse" else posting.get("text")
        row["ats_title"] = title
        if str(posting.get("id")) != str(row["posting_id"]):
            row["listing_state"] = "IDENTITY_MISMATCH"
        elif normalized(title) != normalized(row["title"]):
            row["listing_state"] = "TITLE_CHANGED_REVIEW"
        else:
            row["listing_state"] = "LIVE_ATS_CONFIRMED"
        location = posting.get("location") if row["ats"] == "greenhouse" else (posting.get("categories") or {}).get("location")
        row["ats_location"] = location.get("name", "") if isinstance(location, dict) else location or ""
    except urllib.error.HTTPError as e:
        row["listing_state"] = "ATS_NOT_FOUND" if e.code == 404 else "CHECK_FAILED"
        row["check_error"] = f"HTTP {e.code}"
    except (OSError, ValueError, TypeError, KeyError, json.JSONDecodeError) as e:
        row["listing_state"] = "CHECK_FAILED"
        row["check_error"] = type(e).__name__
    if row["listing_state"] != "LIVE_ATS_CONFIRMED":
        row["disposition"] = "HOLD_LISTING"
    else:
        row["disposition"] = {
            "PACKET_CANDIDATE": "PREPARE_DRAFT",
            "STRETCH_PACKET": "FIT_REVIEW",
            "HOLD_TIMING": "HOLD_TIMING",
            "HOLD_REQUIREMENTS": "HOLD_REQUIREMENTS",
            "CHECK_LISTING": "FIT_REVIEW",
        }.get(row["review"], "FIT_REVIEW")
    return row


def build(targets, loader=fetch):
    if targets.get("schema") != "blowback.postgrad_job_targets.v1":
        raise ValueError("unsupported target schema")
    seen, rows = set(), []
    for target in targets["targets"]:
        identity = (target["ats"], target["board"], str(target["posting_id"]))
        if identity in seen:
            raise ValueError("duplicate ATS identity")
        seen.add(identity)
        rows.append(evaluate(target, loader))
    rows.sort(key=lambda x: (x["priority"], x["company"]))
    return {
        "schema": "blowback.postgrad_job_research.v1",
        "generated_at": datetime.now(TZ).isoformat(timespec="seconds"),
        "policy": {
            "preferred_full_time_start": "2027-03",
            "work_rights": "Personal postgraduation NIA approval and employer sponsorship review still prospective",
            "application_receipts": "NOT_RECONCILED",
            "human_gates": ["eligibility", "privacy/terms", "final submission"],
        },
        "counts": {
            "roles": len(rows),
            "listing_states": dict(Counter(r["listing_state"] for r in rows)),
            "dispositions": dict(Counter(r["disposition"] for r in rows)),
        },
        "roles": rows,
    }


def markdown(report):
    lines = [
        "# Gauntlet — post-graduation employer ATS review",
        "",
        f"Checked: {report['generated_at']} (Taipei time).",
        "Employer ATS checks are independent of fit and application status.",
        "404 means not verified through the endpoint; it does not conclusively establish closure.",
        "Applications and existing receipts were NOT checked by this runner.",
        "",
        "| Priority | Posting | Verification | Decision |",
        "| --- | --- | --- | --- |",
    ]
    for r in report["roles"]:
        name = (r["company"] + " — " + r["title"]).replace("|", "/")
        lines.append(f"| {r['priority']} | [{name}]({r['source_url']}) | {r['listing_state']} | {r['disposition']} |")
    lines += ["", "## Individual diligence", ""]
    for r in report["roles"]:
        lines += [
            f"### {r['company']}: {r['title']}", "",
            f"**Current listing:** {r['listing_state']}. **Disposition:** {r['disposition']}.",
            "", f"**Evidence-based fit:** {r['fit']}", "", "**Open gates:**",
        ]
        lines.extend("- " + gate for gate in r["gates"])
        lines += ["", f"Official posting: {r['source_url']}", ""]
    lines += [
        "## Constraints", "",
        "- Reconcile existing applications/receipts before drafting or sending duplicates.",
        "- Do not equate historical data, project demos or predicted salary benchmarks to employer facts.",
        "- Do not assume postgraduation work permission before the individual approval or future sponsorship review.",
        "- A verified vacancy is a research lead, not an authorized application.",
        "- Applicant retains all legal declarations, consents, and final Submit actions.",
        "",
    ]
    return "\n".join(lines)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--targets", type=Path, default=ROOT / "data/jobs/postgrad-research-targets.json")
    p.add_argument("--json-out", type=Path, default=ROOT / "output/postgrad-job-research/current.json")
    p.add_argument("--markdown-out", type=Path, default=ROOT / "output/postgrad-job-research/current.md")
    args = p.parse_args()
    result = build(json.loads(args.targets.read_text(encoding="utf-8")))
    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    args.markdown_out.parent.mkdir(parents=True, exist_ok=True)
    args.json_out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    args.markdown_out.write_text(markdown(result), encoding="utf-8")
    print(json.dumps(result["counts"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
