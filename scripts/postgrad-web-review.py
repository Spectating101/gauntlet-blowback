#!/usr/bin/env python3
"""Render the official-source job review separately from ATS API verification.

This is a dated research snapshot. External pages are not automatically rechecked
by this script; the source URL and next manual verification action are retained.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data/jobs/postgrad-web-source-review-20261019.json"


def validate(data: dict) -> list[dict]:
    if data.get("schema") != "blowback.postgrad_web_source_review.v1":
        raise ValueError("unsupported review schema")
    rows, seen = [], set()
    for item in data["leads"]:
        key = item.get("key")
        if not key or key in seen:
            raise ValueError("missing or duplicate key")
        seen.add(key)
        if not item.get("source_url", "").startswith("https://"):
            raise ValueError("source URL must be HTTPS")
        status = item.get("status", "")
        if not (status.startswith(("BLOCKED_", "HOLD_", "EXCLUDE_")) or status in (
            "PRIORITIZE_PACKET", "FIT_AND_TIMING_REVIEW", "BACKUP_FIT_REVIEW"
        )):
            raise ValueError(f"unsafe status: {status}")
        if not item.get("requirements") or not item.get("risks"):
            raise ValueError("requirements and risks required")
        if status == "PRIORITIZE_PACKET" and item.get("source_tier") != "official_employer":
            raise ValueError("top packet requires primary official employer evidence")
        rows.append(dict(item))
    return rows


def render(data: dict, as_of: date) -> str:
    rows = validate(data)
    statuses = Counter(r["status"] for r in rows)
    text = [
        "# Gauntlet post-master employment: broader official-source review",
        "",
        f"Research date: {data['checked_on']}. Report generated for {as_of.isoformat()}.",
        "",
        "A web-listed vacancy is not an ATS-verified vacancy, a viable application, or a submission. "
        "Follow the linked source and recheck opening, requirements and onboarding timing.",
        "",
        f"**Candidates researched:** {len(rows)} across graduate, quant, fintech, and local banking markets.",
        f"**Dispositions:** {', '.join(f'{name}={n}' for name, n in sorted(statuses.items()))}.",
        "",
        "| Route | Disposition | Advertised deadline | Principal issue |",
        "| --- | --- | --- | --- |",
    ]
    for r in rows:
        name = (r["company"] + ": " + r["title"]).replace("|", "/")
        d = r.get("deadline") or "Rolling/unspecified"
        if r.get("deadline") and date.fromisoformat(r["deadline"]) < as_of:
            d += " (expired)"
        risk = r["risks"][0].replace("|", "/")
        text.append(f"| [{name}]({r['source_url']}) | {r['status']} | {d} | {risk} |")
    text += ["", "## Why the next queue is smaller", ""]
    for r in rows:
        text += [f"### {r['company']} — {r['title']}", "",
            f"**State:** {r['status']}; **evidence:** {r['source_tier']}.",
            f"**Job family:** {r['track']}. **Location:** {r['region']}.",
            f"**Next:** {r['next']}", "",
            "**Requirements observed:**", *[f"- {x}" for x in r["requirements"]], "",
            "**Risks / blocking facts:**", *[f"- {x}" for x in r["risks"]], "",
            "**Candidate evidence to consider:**", *[f"- {x}" for x in r["evidence_fit"]], "",
            f"Source: {r['source_url']}", ""
        ]
    text += ["## Non-negotiable policy", "",
        "- Confirm current opening on the employer portal before any application.",
        "- Check existing applications and receipts first; never duplicate blindly.",
        "- Graduate work rights require NIA-approved residence extension and do not equal permanent work rights.",
        "- Separate demonstrated research ability from paid industrial tenure, and English skill from Mandarin fluency.",
        "- Never use automatic submit or make legal/originality declarations on behalf of the applicant.",
        "",
    ]
    return "\n".join(text)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--registry", type=Path, default=REGISTRY)
    p.add_argument("--as-of", default=date.today().isoformat())
    p.add_argument("--output", type=Path, default=ROOT / "output/postgrad-job-research/landscape.md")
    args = p.parse_args()
    data = json.loads(args.registry.read_text(encoding="utf-8"))
    doc = render(data, date.fromisoformat(args.as_of))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(doc, encoding="utf-8")
    print(f"Research dossier: {args.output}; roles={len(validate(data))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
