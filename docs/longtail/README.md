# Long-Tail Conversion Radar

This package turns Gauntlet/Blowback from an application-opportunity tracker into a high-volume conversion engine for the active portfolio.

## Canonical gate audit

Before treating any stored `FIRE`, `VERIFY`, `HOLD`, or `KILL` label as authoritative, consult [`../GAUNTLET_GATE_AUDIT_2026-08-26.md`](../GAUNTLET_GATE_AUDIT_2026-08-26.md).

The audit introduces gate classes `G0`–`G6`, records live-source corrections discovered on 2026-08-26, and explicitly overrides stale campaign labels until the machine-readable records are reconciled. In particular, it distinguishes owner/admin friction from integration work, external-evidence gaps, hard blockers, and economic/optionality gates.

## Operating objective

Primary empirical target:

> Trailing 30-day realized conversion >= NT$5,000 in unrestricted cash or genuinely displaced AI/tool spend, while keeping median marginal human preparation for small-fish campaigns below roughly 1–2 hours.

This is a measurement target, not a promise of monthly income.

## What counts as conversion

Blowback should track more than grants and competitions:

- competition cash and finalist/honorable-mention awards;
- microgrants and rapid grants;
- paid OSS issues, bounties, maintainer grants and bounded technical work;
- paid fellowships and short research contributor programs;
- direct paid pilots, evaluations, diagnostics and implementation sprints;
- procurement and corporate/industrial PoCs;
- jobs, contract research and portfolio-backed consulting;
- API/cloud/GPU/tool credits only to the extent they displace spend that would actually have occurred;
- institutional adoption and validated external usage as non-cash conversion evidence.

## Campaign is the unit of work

A parent program is not one opportunity when it contains many independently judged tracks.

Example:

`InnoServe -> AMD AI Agent track -> Cite x track -> eligibility -> packet -> submission -> receipt -> outcome`

Each project x track pairing is a separate campaign candidate until cross-campaign restrictions are applied.

## Hard gates

- `USER_ELIGIBILITY_REQUIRED` — enrollment/graduation/residence/nationality/etc. cannot be inferred.
- `COMPANY_REQUIRED` — company/startup/vendor vehicle required.
- `ACADEMIC_HOST_REQUIRED` — university/research-institution handling required.
- `VEHICLE_DECISION_REQUIRED` — corporation/nonprofit/equity/other commitment changes strategic posture.
- `NEW_BUILD_RISK` — opportunity starts requiring enough new engineering that it ceases to be conversion.
- `DUPLICATE_OR_CATEGORY_LIMIT` — a parent program limits number of tracks/projects that may be entered.
- `SOURCE_ANOMALY` — official page contains conflicting or unusual published data and requires manual confirmation.

These legacy hard-gate labels remain useful, but pre-firing triage should additionally map them to the audit's semantic gate classes:

- `G0` owner / portal
- `G1` eligibility / administration
- `G2` packet / application
- `G3` integration / domain adaptation
- `G4` external evidence
- `G5` hard blocker / mismatch
- `G6` economics / optionality

## Default lifecycle

`DISCOVER -> VERIFIED -> ELIGIBLE -> READY -> FIRED -> RECEIPT -> OUTCOME -> CONVERSION`

## Economic fields

Every campaign should capture at minimum:

- cash value in original currency;
- cash-bearing slot count when known;
- realistic cost displacement separately from nominal credits;
- marginal human prep time;
- estimated new-build hours;
- result latency;
- repeatability;
- project fit and evidence-reuse level;
- vehicle/dependency requirements;
- source URL and retrieval date;
- final receipt/outcome.

## Files in this package

- `../GAUNTLET_GATE_AUDIT_2026-08-26.md` — canonical audit overlay and gate taxonomy; consult before FIRE.
- `opportunity-radar.md` — current researched opportunity families and project matches.
- `firing-queue.md` — prioritized campaign queue and near-term deadlines.
- `preparation-packets.md` — canonical reusable dossier and per-project packet requirements.
- `source-registry.md` — sources Blowback should poll continuously.
- `outbound-playbook.md` — manufactured conversion campaigns for mature portfolio assets.
- `longtail-campaigns.csv` — machine-friendly seed inventory for campaign ingestion.

## Portfolio scope

Active assets only:

- Cite-Agent
- YZU / Research Drive
- Policy Lab
- Nocturnal Oversight
- Hardware Splicer
- Public-Good Control
- Refinery / Commons
- Sharpe Terminus
- research papers / thesis line
- Citation Engine
- Gauntlet / Blowback as the conversion control layer

Dormant repositories are excluded unless external evidence later justifies resurrection.
