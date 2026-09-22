#!/usr/bin/env python3
"""Measure Jev against the keyword heuristic on a hand-labelled sample.

A classifier is worth adopting only if it beats what it replaces. This scores the same 40 roles
three ways — Claude's labels (ground truth), the keyword buckets already in the file, and Jev —
and reports agreement, mean absolute error and where they disagree. Without a key it says so and
exits 0, so it is safe to run at any time.
"""
from __future__ import annotations

import argparse
import json
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev  # noqa: E402

BUCKET_SCORE = {"strong": 5, "plausible": 4, "intern": 3, "too-senior": 2, "off-profile": 1}
PROMPT = (
    "Applicant: Indonesian national in Taiwan, finishing an MSc in Finance and Accounting in "
    "2027-01, GPA 4.0, strong public engineering portfolio (agent evaluation, provenance tooling), "
    "no computer science degree, may work in Taiwan without a permit for two years from graduation "
    "and holds no work authorisation elsewhere.\n"
    "How well is this role worth one application from this applicant?"
)
# The rungs are the criteria, low to high. The service scores them 0-indexed and
# echoes this list back as the legend, so a returned 0.0 means RUNGS[0].
RUNGS = [
    "clearly not worth applying",
    "probably not worth applying",
    "marginal; worth applying only if cheap",
    "worth applying",
    "clearly worth applying",
]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--set", type=Path,
                    default=Path(__file__).resolve().parents[1] / "data/jev-benchmark-set.json")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    data = json.loads(args.set.read_text(encoding="utf-8"))
    items = data["items"]
    if not jev.available():
        print("jev is not configured; nothing measured. Put JEV_API_KEY_1..5 in .env.local.", file=sys.stderr)
        return 0

    rows = []
    for item in items:
        answers = jev.ask(
            state={k: item[k] for k in ("title", "company", "location")},
            questions={"fit": jev.score(PROMPT, RUNGS)},
        )
        fit = (answers or {}).get("fit") or {}
        raw = fit.get("score")
        # The service returns a 0-indexed position on RUNGS; the hand labels are
        # 1..5. Comparing the two directly would charge Jev a full point of error.
        rows.append({
            "id": item["id"],
            "claude": item["claude_label"],
            "heuristic": BUCKET_SCORE[item["basis"]],
            "jev": raw + 1 if isinstance(raw, (int, float)) else None,
            "confidence": fit.get("confidence"),
        })

    scored = [r for r in rows if isinstance(r["jev"], (int, float))]
    if not scored:
        print("jev returned no usable scores", file=sys.stderr)
        return 1
    jev_err = statistics.mean(abs(r["jev"] - r["claude"]) for r in scored)
    heur_err = statistics.mean(abs(r["heuristic"] - r["claude"]) for r in scored)
    top_jev = {r["id"] for r in sorted(scored, key=lambda r: -r["jev"])[:10]}
    top_claude = {r["id"] for r in sorted(scored, key=lambda r: -r["claude"])[:10]}

    if args.json:
        print(json.dumps({"rows": rows, "jev_mae": jev_err, "heuristic_mae": heur_err,
                          "top10_overlap": len(top_jev & top_claude)}, ensure_ascii=False))
        return 0

    print(f"scored {len(scored)} of {len(items)} roles")
    print(f"  mean absolute error vs Claude's labels — jev {jev_err:.2f}, heuristic {heur_err:.2f}")
    print(f"  top-10 overlap with Claude's top 10 — {len(top_jev & top_claude)}/10")
    print("\nlargest disagreements (these are the interesting ones):")
    for r in sorted(scored, key=lambda r: -abs(r["jev"] - r["claude"]))[:8]:
        print(f"  claude {r['claude']}  jev {r['jev']:.1f} (conf {r['confidence']})  {r['id'][:60]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
