# Nocturnal Gauntlet Evaluation — 2026-08-25

## Purpose

Test the newly consolidated Nocturnal 1.2 firing package against the **actual checked-in Funding Radar v1 entries** using Blowback's existing deterministic conversion doctrine.

This test deliberately does **not** require a high award size or prestige threshold.

Blowback makes clerical preparation cheap. Therefore a small route may still be worth firing when:

- eligibility passes;
- the submission is under direct control;
- no hard blocker or required-evidence gap remains;
- pre-verdict cost is `$0` or `$POST`;
- fit is at least `MEDIUM`;
- marginal work is at most `MEDIUM`.

This is already the behavior of `src/core/conversion.mjs`. No ROI-only filter needs to be added or removed.

## Input state

Nocturnal 1.2 now has a canonical project/application package, technical evidence boundary, cold-review surface, route-specific preparation, and explicit non-claims.

Current external state remains:

- no external pilot partner;
- no newsroom/reporting partner;
- no registered institutional host attached to the project;
- no approved real-person public corpus;
- repository currently private;
- AGPL-3.0-or-later license text present;
- engineering baseline frozen.

These are constraints, not reasons to inflate or suppress other opportunities.

## Checked-in live Funding Radar candidates

The current Funding Radar v1 candidate set tagged for Nocturnal is:

1. NLnet calls reopening 2026-09-03;
2. TWNIC Community Grants 2026;
3. GitHub Sponsors;
4. Open Source Collective fiscal sponsorship.

Detailed machine-readable assessments are in:

`examples/radar/nocturnal-candidate-assessments-2026-08-25.json`

## Results

| Route | Cost | Fit | Work | Current decision | Why |
|---|---|---|---|---|---|
| NLnet / Open Internet Stack | `$0` | HIGH | LOW | **HOLD → likely FIRE test on Sep 3** | Exact live call-specific eligibility is not yet available. The Nocturnal package is otherwise ready enough that the remaining work is mostly call projection rather than project development. |
| TWNIC Community Grants | `$0` | MEDIUM | MEDIUM | **HOLD** | A legally registered applicant/host and bounded Taiwan institutional pilot are real dependencies outside current direct control. Blowback cannot automate them into existence. |
| GitHub Sponsors | `$0` | MEDIUM | LOW | **HOLD** | Recipient-region eligibility must be verified truthfully; current public docs list Indonesia but not Taiwan. Nocturnal is also still private, so it is not yet a credible project-specific open-source sponsorship surface. |
| Open Source Collective | `$POST` | MEDIUM | LOW application work | **REJECT in current state** | OSC currently requires open-source software under an organizational repository rather than a personal repository. Nocturnal is private under `Spectating101/nocturnal-oversight`. Re-evaluate after a genuine public/org migration and when fiscal hosting solves a real money-flow problem. |

## Interpretation

### 1. Small opportunities are allowed

The result is **not** "only NLnet is worth our time."

GitHub Sponsors and fiscal-hosting mechanisms were tested even though they may generate much less money than a grant. They failed/held because of concrete eligibility or readiness conditions, not because their expected payout was too small.

If a future route offers, for example, a small grant, microgrant, sponsorship, compute credit, travel award, maintenance bounty, or recognition with:

- `PASS` eligibility;
- `MEDIUM` or better fit;
- `LOW`/`MEDIUM` work;
- no external dependency;
- no upfront cost blocker;

then Blowback should prepare it even when the absolute upside is modest.

### 2. Cheap automation does not make structural dependencies cheap

Blowback can reduce:

- repeated project descriptions;
- evidence selection;
- field mapping;
- uploads;
- portal clerical work;
- repeated boilerplate.

It cannot cheaply manufacture:

- a legally eligible institution;
- a newsroom/editorial partner;
- a genuine user population;
- a jurisdiction-specific legal review;
- a public open-source community;
- recipient-region eligibility.

Those remain legitimate HOLD/REJECT gates.

### 3. Nocturnal is now cheap to project

The repository packaging materially changes marginal work.

Before the consolidation, a new venue required reconstructing the project story from multiple generations of documentation. Now the reusable source is the Nocturnal `FIRE_PACKET.md` plus `EVIDENCE_PACKET.md`, with route-specific material only where needed.

That makes a larger number of modest-but-clean opportunities economically sensible once discovered.

### 4. The current limiting factor is Radar recall

Funding Radar v1 currently contains only four live funding mechanisms tagged for Nocturnal. That is too small a sample to conclude that Nocturnal has only four plausible external routes.

The correct next expansion is **candidate recall**, not lowering truth/eligibility gates.

Future Nocturnal discovery should include smaller mechanisms as first-class candidates when they are real and current, including:

- microgrants and prototype grants;
- open-source maintenance grants;
- civic-tech small grants;
- journalism-technology support;
- research/software sustainability awards;
- compute/hosting credits where they materially reduce project cost;
- small institutional pilots;
- sponsorship/donation rails;
- recognition/registry routes when the external signal itself has value.

Do not add a source merely to make the list longer. Add it when it repeatedly yields credible opportunities that the current source registry misses.

## Route-specific re-evaluation triggers

### NLnet

Re-run immediately when the 2026-09-03 live calls and call-specific guides appear.

If eligibility passes naturally and the open-release obligations are acceptable, the expected Blowback result should become `READY` because fit is high, marginal application work is low, and the project package already exists.

### TWNIC

Do not spend cycles trying to force a host merely to clear the grant gate. Re-evaluate if a legitimate eligible institution independently wants the bounded Taiwan pilot.

### GitHub Sponsors

Re-evaluate when:

1. recipient-region/account eligibility is confirmed through truthful GitHub onboarding; and
2. Nocturnal is genuinely public/open source.

At that point activation is cheap enough that even modest sponsor revenue can justify it.

### Open Source Collective

Re-evaluate only when:

1. Nocturnal is public under an organizational repository;
2. open-source eligibility/governance requirements are actually met; and
3. there is a real grant/donation/payment flow for which fiscal hosting removes administrative friction.

Do not reorganize the project solely to obtain a fiscal-host profile.

## Bottom line

The Nocturnal package passes the **projection-cost** test: it is now cheap enough to fire at modest opportunities.

The current checked-in Gauntlet inventory does **not** produce a READY submission on 2026-08-25 because each live mechanism still has a real unresolved or failed gate.

That is a healthy result. The doctrine should remain:

> **Fire broadly across truthful, eligible, bounded-cost opportunities — including small ones. Reject only for real gates, not because the prize looks insufficiently glamorous.**
