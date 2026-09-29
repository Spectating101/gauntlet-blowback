# DATE 2027 LBR — Hardware-Splicer evidence finalization gate

Date: 2026-09-23  
Route: `date-2027-lbr-hardware-splicer`  
State: **prepared / evidence-gated**

## Official submission frame

As of 2026-09-23, DATE 2027 states:

- Late Breaking Results are **2-page extended abstracts**;
- one additional page may be used **for bibliographic references only**;
- submission is **double blind**;
- the paper title must begin with **"Late Breaking Results:"**;
- final-paper deadline is **Sunday, 29 November 2026 AoE**;
- the official CFP currently marks the LBR submission surface as not yet available.

Do not invent form fields or submission mechanics before the official portal is published.

## Canonical HS source

Current draft source:

`docs/external_assessment/submissions/DATE_2027_LBR_DRAFT.md`

The draft is intentionally not a final paper. Its Results section must remain evidence-gated.

Physical evidence campaign:

`Spectating101/hardware-splicer#105`

Current physical state:

- package/revision frozen;
- physical correctness **UNPROVEN**;
- no fabricated/identified physical subject yet.

## What wakes the route

Preferred wake condition:

> one revision-bound real physical result from #105 that is strong enough to constitute an empirical result, including a preserved negative or mixed result.

The route can also wake on a comparably substantive frozen external-agent or cross-model experiment, but **MCP transport/infrastructure alone is not enough**.

## Claim-upgrade map

### P0/P1 — provider review / fabrication decision

May add:

- external manufacturing/DFM review occurred;
- exact provider findings, if any;
- exact package/revision reviewed.

Must **not** claim:

- fabricated hardware;
- assembly correctness;
- electrical correctness;
- physical validation.

A quote or DFM pass is not a DATE result by itself.

### P2 — physical board identity

May add:

- board was fabricated/assembled;
- exact board or lot identity;
- exact revision and assembly state;
- DNP/open states actually observed.

Must **not** claim:

- cold electrical checks passed;
- safe power-up;
- correct function.

### P3 — cold checks

May add exact unpowered evidence:

- continuity/isolation/resistance;
- polarity;
- OE pull-down / CS-domain state;
- any preserved failure.

Paper wording must remain bounded to unpowered checks.

### P4 — controlled power

May add:

- measured 3V3 / 1V8 / DUT_1V8;
- current/current-limit behavior;
- rail ramp/overshoot/timing where captured;
- exact pass or failure state.

This establishes bounded powered evidence only. It does not establish functional correctness.

### P5 — bounded functional transaction

This is the preferred minimum physical result for a strong DATE LBR trigger.

May add:

- exact board/revision;
- `simulated:false`;
- SPI mode 0;
- 5 MHz;
- read-only `0x9F`;
- observed JEDEC ID;
- raw transaction/capture references;
- authority state before/after action.

If the observed result is `EF6018`, report only the bounded identity-read success. Do not generalize to universal PCB correctness.

If the result fails or differs, preserve and report the failure. A disciplined negative result remains empirical evidence.

### P6 — evidence closure

May update:

- Abstract;
- Results table;
- Discussion;
- Conclusion;
- limitations that are genuinely resolved.

Must retain unresolved limitations.

## Preferred final result table

| Run / subject | Evidence state | Authority state | Requested action | Observed result | Failure / stale-evidence handling |
|---|---|---|---|---|---|
| [exact board/revision] | [cold/power/functional] | [closed/open scope] | [0x9F or refused action] | [raw bounded result] | [preserved outcome] |

Useful secondary measurements:

- provider / operator / instrument identity;
- package and revision hashes;
- board identity;
- failed or incomplete calls;
- human intervention count;
- stale-evidence event count;
- authority refusals;
- successor-revision decisions.

## Double-blind finalization

Before submission:

1. move evidence into a DATE template;
2. fit body to 2 pages;
3. use optional third page for references only;
4. remove author names, affiliations, acknowledgments and identifying self-references for review;
5. preserve the required title prefix;
6. verify every empirical number against canonical run evidence;
7. keep negative/mixed outcomes rather than cleaning them into a success narrative;
8. inspect the official live submission portal when released;
9. human performs authorship/originality/payment/final submit.

## Hard no-go conditions

Do not submit if the paper's main new empirical contribution is only:

- MCP connectivity;
- existing software test counts;
- UI completion;
- provider marketing claims;
- a fabrication quote;
- simulation presented as physical evidence.

The LBR should report **what happened when the frozen architecture met a real bounded experiment**, not simply that the architecture exists.
