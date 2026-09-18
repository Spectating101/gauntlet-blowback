# Case-study card — Cite-Agent reliable research journey

## Current disposition

**IN PROGRESS — strong constituent evidence, not yet one same-candidate end-to-end certification.**

This distinction matters. The system has both a provider-backed research workflow record and a browser-level research/empirics/manuscript continuity record, but those records were produced at different evidence moments. They should not be collapsed into a single exact-release claim.

## What is demonstrated

### Provider-backed research workflow

Authority: `docs/status/generated/end-to-end-research-workflow-latest.json` in the Cite-Agent release candidate worktree.

- topic: mobile-banking adoption in emerging markets, trust, perceived risk and digital financial inclusion;
- four turns: paper sweep, data procurement, manuscript draft and claim audit;
- observed tools include deep research and dataset discovery;
- reusable artifacts include a paper set, dataset leads, a procurement plan and claim audit;
- recorded score: 100/100 with no recorded issues.

This record dates to 2026-05-20. It demonstrates the workflow at that evidence moment, not the current exact candidate.

### Researcher-facing continuity and correction

Authority: `artifacts/researcher-journey-golden/report.json` in the Cite-Agent release candidate worktree.

- green headless browser journey on 2026-09-12;
- one deterministic entry followed by visible-control navigation;
- Research → Empirics → Manuscript bridge;
- authoritative empirical result changes from 0.3400 to 0.5100;
- stale manuscript retains the accepted old value and does not silently rewrite;
- the visible recourse returns to Empirics;
- explicit refresh binds the manuscript to the new result;
- evidence and authority survive reload.

This is strong interaction, stale-evidence and persistence proof. It uses deterministic seeded evidence rather than a fresh provider-backed research question.

### Exact-candidate release gates

Candidate base: `41a5ec16743e55397bcc94631075cb463a211268` (`integration/cite-release-consolidation-20260912`).

The fast release gate initially failed because `verify_api_inference_routes.py` and `llm_runtime_contract_gate.py` imported a different installed Cite-Agent checkout when launched as scripts. The isolated local branch `fix/main-quest-release-verifier-path-20260917` fixes both path authorities at commit `104cee2d` and adds subprocess regressions.

Verified on that local branch:

- 12 focused API-authority tests pass;
- 2 script-path regression tests pass;
- governed API inference route verification passes;
- LLM runtime contract gate passes;
- `npm run verify:release` fast mode passes all five gates.

One report-only maturity item remains: rendered sparse/stale/error/mobile acceptance is absent for the exact base candidate. No attestation was attempted because the local branch contains the deliberate verifier fix and has not been promoted.

## Exact missing closure

To call this one certified served journey, run the current selected frontend/backend candidate pair through:

1. a fresh question;
2. retained source bytes and locators;
3. grounded synthesis;
4. empirical or dataset step;
5. manuscript/export;
6. invalidation or authority change;
7. restart/reload continuity;
8. observed provider/runtime identity;
9. one receipt binding all steps to the same immutable candidate pair.

Until then, outward-facing wording may say Cite-Agent has demonstrated both the provider-backed workflow and the stale-evidence/persistence browser workflow. It may not say the current exact paired release has been certified across the combined journey.

## Strongest nonclaims

- no broad external adoption;
- no independent researcher validation;
- no provider-calibrated superiority;
- no fully attested paired production release;
- no claim that the May provider run is evidence for the September exact candidate.

