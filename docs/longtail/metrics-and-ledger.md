# Long-Tail Conversion Ledger

Blowback should measure realized conversion, not attention or nominal program size.

## Core monthly benchmark

`subscription_floor_ntd = 5000`

Primary test:

> Can trailing 30-day realized cash + genuine AI/tool cost displacement remain at or above NT$5,000 without materially increasing portfolio construction work?

## Required metrics

- `discovered_count`
- `verified_eligible_count`
- `ready_count`
- `fired_count`
- `receipt_count`
- `cash_bearing_slot_density`
- `prep_minutes`
- `new_build_hours`
- `result_latency_days`
- `cash_realized_ntd`
- `cost_displaced_ntd`
- `restricted_support_ntd`
- `external_validation_count`
- `meetings_created`
- `pilots_created`
- `offers_created`
- `conversion_per_human_hour`
- `repeatability`
- `source_hit_rate`
- `asset_hit_rate`
- `subscription_months_covered`

## Accounting rules

### Cash
Count only money actually received or contractually owed after the external decision.

Do not count:
- headline prize before winning;
- projected MRR;
- application value;
- vague “exposure.”

### Cost displacement
Count only spend that would genuinely have occurred.

Example:
- US$1,000 API credits granted;
- actual planned API spend over credit life = US$180;
- `cost_displaced = US$180`, not US$1,000.

### Restricted support
Track separately:
- compute credits with no immediate planned use;
- travel reimbursement;
- equipment-use credits;
- partner-service benefits.

Restricted support may become cost displacement later if actual use replaces planned expenditure.

### External validation
Track non-cash conversion separately:
- finalist / honorable mention;
- accepted paper/poster;
- pilot accepted;
- professor/institution adoption;
- external user completing workflow;
- testimonial;
- interview / technical screen;
- partner follow-up.

These strengthen later conversion but are not cash.

## Source-level learning

After at least 20 verified campaigns from a source/family, record:

- eligibility precision;
- READY rate;
- submission rate;
- cash/selection hit rate;
- median prep time;
- median result latency;
- realized NT$/human-hour;
- observed failure reasons.

After 50–100 total real firings, replace qualitative priors with observed rates wherever sample size permits.

## Asset-level learning

Each active asset should accumulate:

- candidate campaigns;
- eligible campaigns;
- fired campaigns;
- external selections;
- meetings;
- pilots;
- paid conversions;
- cash realized;
- cost displaced;
- median marginal prep;
- dominant converting route;
- routes repeatedly rejected by reality.

This turns the portfolio into an allocation problem:

> increase firing volume where realized conversion per unit human time is high; decrease it where repeated external evidence rejects the thesis.
