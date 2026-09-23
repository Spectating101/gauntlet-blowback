#!/usr/bin/env python3
"""Order the whole job corpus into the sequence to apply in.

This does not shortlist. Every reachable role stays in the queue; what the
ranking decides is which ones you send first, so the early applications are the
ones most likely to land rather than whichever the scraper happened to return
first.

Three inputs decide the order:

- Jev's fit score, which ranks well and scores badly. Measured against hand
  labels its rank correlation is +0.70 where the keyword heuristic manages
  +0.40, but its output compresses into roughly 1.5-3.5 on a 1-5 scale, so the
  ordering is used and the magnitude is not.
- Jev's reachability probability, used only to push roles that cannot be held
  from Taiwan to the back. They are not dropped: the model sees a title, a
  company and a location, which is not enough to retire a role permanently.
- Stated pay, normalised to annual TWD, as a tie-break so that among roles of
  equal fit the better-paid one comes first. A 104 disclosure is a floor, not
  an offer, and never counts as stated pay.

Read-only: it writes its output files and touches nothing else.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))
from pay_normalise import normalise  # noqa: E402

DEFAULT_TRIAGE = ROOT / "output/phd-taiwan-2027/jev-triage-2026-09-22.json"
REACHABLE_FLOOR = 0.5

FIELDS = ("rank", "fit", "reachable", "annual_twd", "pay_stated", "pay_basis", "plausible",
          "company", "title", "location", "url")


# Longest first, so 股份有限公司 is removed whole rather than leaving 股份.
_LEGAL_SUFFIXES = sorted(
    ("股份有限公司", "有限公司", "公司", "co., ltd.", "co.,ltd.", "co. ltd", "ltd.", "ltd",
     "inc.", "inc", "corp.", "corp", "limited", "llc"),
    key=len, reverse=True)
_LATIN_BRAND_THEN_CJK = re.compile(r"^([a-z0-9][a-z0-9 .&-]*?) +[㐀-鿿豈-﫿]")


def company_key(name) -> str:
    """One key per company, however the boards spell it.

    The same employer appears as "GliaCloud" and "GliaCloud 集雅科技", or with and
    without 股份有限公司, which listed one role twice in the queue.
    """
    if not name:
        return ""
    key = re.sub(r"\s+", " ", str(name).lower()).strip()
    for suffix in _LEGAL_SUFFIXES:
        if not key.endswith(suffix) or key == suffix:
            continue
        rest = key[: -len(suffix)]
        # A Latin suffix must stand apart ("acme inc"), or "bigcorp" would lose
        # "corp". CJK suffixes are written joined to the name, so they need no gap.
        if suffix.isascii() and rest[-1:] not in (" ", ",", "."):
            continue
        key = rest.rstrip(" ,.")
        break
    brand = _LATIN_BRAND_THEN_CJK.match(key)
    return brand.group(1).strip() if brand else key


def dedupe(rows: list[dict]) -> list[dict]:
    """One row per (company, title). The same role appears on several boards."""
    seen: dict[tuple[str, str], dict] = {}
    for row in rows:
        key = (company_key(row.get("company")),
               str(row.get("title", "")).strip().lower())
        best = seen.get(key)
        if best is None or (row.get("fit") or 0) > (best.get("fit") or 0):
            seen[key] = row
    return list(seen.values())


def enrich(row: dict) -> dict:
    pay = normalise(row.get("pay") or "")
    out = dict(row)
    out["annual_twd"] = pay["annual_twd"]
    out["pay_stated"] = pay["stated"]
    out["pay_basis"] = pay["basis"]
    out["plausible"] = pay.get("plausible", True)
    return out


def pay_cell(row: dict) -> str:
    """Readable pay: stated figure, disclosure floor, or a dash."""
    annual = row.get("annual_twd")
    if (row.get("pay_stated") and row.get("plausible", True)
            and isinstance(annual, (int, float)) and annual is not None):
        return f"{annual:,}"
    if row.get("pay_basis") == "disclosure" and annual is not None:
        return f"≥{annual:,} (floor)"
    return "—"


def sort_key(row: dict):
    """Reachable first, then Jev's order, then better stated pay.

    A pay figure only breaks ties when it is both stated and believable, so an
    implausible row cannot jump the queue on the strength of a bad number.
    """
    reachable = (row.get("reachable") or 0) >= REACHABLE_FLOOR
    pay = row["annual_twd"] if (row["pay_stated"] and row["plausible"]) else -1
    return (0 if reachable else 1, -(row.get("fit") or 0), -(pay or -1))


def build(rows: list[dict]) -> list[dict]:
    ordered = sorted((enrich(r) for r in dedupe(rows)), key=sort_key)
    for i, row in enumerate(ordered, 1):
        row["rank"] = i
    return ordered


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--triage", type=Path, default=DEFAULT_TRIAGE)
    ap.add_argument("--out-csv", type=Path,
                    default=ROOT / "output/phd-taiwan-2027/application-queue.csv")
    ap.add_argument("--out-md", type=Path,
                    default=ROOT / "output/phd-taiwan-2027/APPLICATION_QUEUE.md")
    ap.add_argument("--top", type=int, default=40, help="rows to write into the readable list")
    args = ap.parse_args()

    if not args.triage.exists():
        print(f"no triage file at {args.triage}; run the Jev triage first", file=sys.stderr)
        return 1

    ordered = build(json.loads(args.triage.read_text(encoding="utf-8")))
    args.out_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.out_csv.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(ordered)

    reachable = [r for r in ordered if (r.get("reachable") or 0) >= REACHABLE_FLOOR]
    paid = [r for r in reachable if r["pay_stated"] and r["plausible"]]
    lines = [
        "# Application queue",
        "",
        f"{len(ordered)} roles, in the order to apply. Nothing is dropped: the last rows are",
        "still worth sending, they are just sent last. Ranking is Jev's, which orders well and",
        "scores badly, so the position is meaningful and the fit number is not.",
        "",
        f"- {len(reachable)} reachable from Taiwan; {len(ordered) - len(reachable)} pushed to the back",
        f"- {len(paid)} state a believable salary; the rest are negotiable, a 104 disclosure, or silent",
        "",
        f"## First {args.top}",
        "",
        "| # | fit | pay (NT$/yr) | company | role |",
        "| --: | --: | --: | --- | --- |",
    ]
    for row in ordered[:args.top]:
        pay = pay_cell(row)
        company = str(row.get("company", ""))[:28].replace("|", "/")
        title = str(row.get("title", ""))[:58].replace("|", "/")
        lines.append(f"| {row['rank']} | {row['fit']:.2f} | {pay} | {company} | {title} |")
    lines += ["", f"Full ordered list: `{args.out_csv.relative_to(ROOT)}`", ""]
    args.out_md.write_text("\n".join(lines), encoding="utf-8")

    print(f"{len(ordered)} roles queued -> {args.out_csv.relative_to(ROOT)}")
    print(f"  {len(reachable)} reachable, {len(paid)} with believable stated pay")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
