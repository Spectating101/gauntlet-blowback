# Main Quest Economics — 2026-09-16

The Main Quest is no longer ranked only on admission/job fit and long-run career value. **Current cash economics are a first-class decision variable.**

## Decision rule

For PhDs, compare:

`admission probability × funding certainty × monthly cash × research value × credential-conversion value × post-PhD option value`

For jobs, compare:

`offer probability × compensation certainty × monthly cash × skill growth × brand/network value × long-run income ceiling`

This prevents two recurring errors:

1. treating an unfunded admission as economically equivalent to a funded admission; and
2. comparing a low-probability elite-job salary to a high-probability funded PhD as though both outcomes were already in hand.

## Current verified anchors

| Route | Current cash anchor | Certainty | Interpretation |
|---|---:|---|---|
| NYCU IAIS Outstanding New PhD | up to **NT$30,000/month** for first 24 months | competitive / up-to | viable high-value PhD economics |
| NYCU IAIS Elite New PhD | up to **NT$40,000/month** for first 24 months | competitive / up-to | strongest risk-adjusted PhD economics in the current board |
| TIGP / Academia Sinica | **NT$40,000/month tax-free** first year | guaranteed on admission for year 1 | strong funded PhD comparator |
| ITRI AI Engineer | **NT$55,000+/month** | posted salary floor | genuine full-time alternative |
| Point72 / Cubist quant research | **NT$2.2m+/year** (~NT$183k/month equivalent) | posted salary floor if hired | jackpot lane; a real offer reopens the PhD decision |

### IAIS detail

Official IAIS scholarship rules distinguish the scholarship from admission.

- **Outstanding New PhD:** first 24 months up to NT$30k/month from IAIS; final 24 months up to NT$10k/month from IAIS plus at least NT$20k/month from the advisor.
- **Elite New PhD:** first 24 months up to NT$40k/month from IAIS; final 24 months up to NT$30k/month from IAIS plus at least NT$20k/month advisor matching.
- Full-time remunerated employment/in-service status is incompatible with IAIS scholarship eligibility.
- IAIS can adjust recipient counts and subsidy amounts if budgets are reduced.
- A recipient who also receives the specified NSTC/MOE PhD scholarship must choose one rather than stack them.

Therefore **NT$30k/40k must never be recorded as guaranteed merely because IAIS admission occurs**.

### TIGP detail

TIGP states that admitted students receive NT$40k/month tax-free for the first year. Strong performance can extend the stipend one additional year; later financial support depends on the thesis advisor. That makes TIGP's first-year cash more certain than IAIS's competitive scholarship headline, but later-year continuity needs its own diligence.

## Working money bands

These are Gauntlet heuristics, not market facts or automatic accept/reject rules.

### PhD funding

- **>= NT$40k/month:** `STRONG_FUNDED_PHD` — can seriously compete with ordinary Taiwan full-time work when research value is high.
- **NT$30k–39,999:** `VIABLE_HIGH_VALUE_PHD` — acceptable when the program has exceptional research, network or credential upside.
- **NT$20k–29,999:** `WEAKENED_PHD_ECONOMICS` — needs unusually strong non-cash value.
- **< NT$20k / unfunded:** `GENERALLY_REJECT_UNLESS_EXCEPTIONAL`.

### Full-time cash

- **NT$55k–70k/month:** `GENUINE_PHD_ALTERNATIVE`.
- **NT$80k–120k/month:** `JOB_INCREASINGLY_DOMINATES_CASH`; a PhD needs a stronger strategic case.
- **>= NT$150k/month equivalent:** `REOPEN_DECISION_MATERIALLY`.

## Why IAIS remains unusually important

At the elite headline, IAIS is NT$40k/month versus the current ITRI AI-engineer floor of NT$55k/month: a **NT$15k monthly / NT$180k annual cash gap**.

That gap is material, but it is small enough that IAIS can plausibly compensate through:

- protected research runway;
- NYCU/industry network;
- AI doctoral credential;
- ability to turn the existing portfolio into papers and stronger external validation;
- removal of the degree-field gate that currently blocks several technically well-matched AI roles;
- potentially stronger later-stage advisor matching.

That is why funded IAIS is not treated as a normal low-income student option.

By contrast, a real Point72/Cubist offer at the current NT$2.2m+ annual floor creates a **NT$1.72m+ annual cash gap** versus the IAIS Elite first-24-month headline. If that offer becomes real, Gauntlet must reopen the decision immediately rather than mechanically preferring the PhD.

## Operating policy

1. **Apply to both PhD and employment lanes until real offers exist.** Expected-value comparison happens on outcomes, not fantasies.
2. Every PhD route must acquire: stipend amount, funding certainty, duration, tuition/fee burden, advisor dependence, employment restrictions and scholarship stacking rules.
3. Every job route must acquire: base salary or reliable range, bonus/equity where material, location/cost burden and any work-authorization constraint.
4. Unknown funding/salary is `ECONOMICS_UNRESOLVED`, never silently treated as zero and never silently treated as competitive.
5. A real offer/admission triggers a fresh comparison using actual terms rather than the current planning anchors.

Canonical machine-readable overlay: `data/main-quest-economics-2026-09-16.json`.
