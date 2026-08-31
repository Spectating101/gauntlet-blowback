# Conversation-thread recovery source

Snapshot: **2026-09-01**

The Gauntlet master is intended to be lossless across the portfolio. In practice, project-specific conversations often discover niche opportunities before those opportunities reach a formal Radar source board. This document defines how those discoveries enter canonical control state without allowing conversation memory to masquerade as current official verification.

Canonical source:

`data/thread-recovered-routes-2026-09-01.json`

## Authority rule

A route recovered from a prior project thread is continuity evidence only.

It may establish that:

- the opportunity was previously discovered;
- a historical deadline or window was recorded;
- a project mapping was considered;
- a prior FIRE/HOLD/WATCH judgment existed;
- a field/procurement/pilot/partner channel was worth preserving.

It does **not** establish that the opportunity is still open, that eligibility still holds, that compensation is unchanged, or that the remembered deadline/source is currently authoritative.

Current live state must be rehydrated from the official source before a recovered route can advance through:

`VERIFIED -> ELIGIBLE -> READY -> FIRED`.

## Recovered in this tranche

### Policy / finance / research-paper threads

- DADH 2026 historical research-paper route;
- BCK26 historical four-page-paper route;
- ICDLT 2026 historical full-paper route;
- Digital Tax / ICPA historical abstract route;
- ClimateChain 2026 Policy Lab / ECI window, retained as `WATCH_REVERIFY` rather than presumed live;
- ETHOnline 2026 as a bounded web3-adjacent builder route with an explicit no-force-fit gate.

### Cite / Research Drive / research-software threads

- JCDL 2026 workshop/tutorial proposal;
- JCDL 2026 full paper;
- NLnet NGI Zero Commons Fund historical Cite/Citation/Commons route;
- KubeSummit 2026 field/networking route, retained on HOLD unless it creates concrete employer/partner/infrastructure value.

These past calls remain useful as future-cycle source families but cannot receive invented next-cycle deadlines.

### Hardware / research-commercialization / procurement threads

- TAIROS + Automation Taipei 2026 field-intelligence route;
- FUTUREMODE Sep 4-6 recovered field/watch route;
- NSTC Research Entrepreneurship / 科研創業計畫 Sep 3 recovered route, requiring immediate official rehydration rather than panic preparation;
- TAITRA / iSourcing electronics-PCB-chip-module-machinery buyer-demand channel;
- manufactured GeoMap supplier/buyer evidence pilot.

The GeoMap rule remains narrow: evidence-backed technical procurement matching can be tested, while generic scraping/lead-generation positioning remains killed.

### Nocturnal / civic-tech / information-integrity threads

- g0v civic-tech collaboration/future-call watch, with no invented 2026/27 round;
- CIVICUS DDI / Civic Tech Lab partner-first watch;
- EU information-integrity consortium/downstream-subgrant watch, preserving the distinction between consortium funding and direct personal funding.

## Already present and therefore not duplicated

Thread reconciliation also confirmed that many older discoveries were already present in the master/supplement layers, including major Policy Lab routes, TEA/IBFD/NTA continuity, FinTech Taipei, Taiwan Innotech/Energy Taiwan/TAITRONICS-style field routes, SEMICON/Meet Taipei, Hardware-Splicer competition routes, Nocturnal funding routes, Refinery MSR/SANER routes, post-grad jobs/PhDs, MIT Solve, and the newer deep-researched fellowship/lab/research-credit layers.

The recovery pass therefore adds only missing route identities. Existing canonical IDs are not copied into the thread file.

## Ongoing operating rule

When a project conversation discovers a new conversion route:

1. search the generated Gauntlet master for the exact or equivalent route;
2. if already present, update the existing source authority only after current verification;
3. if absent but only conversation evidence exists, add it to the thread-recovered source with `THREAD_RECOVERED_REVERIFY` provenance;
4. if an official source is verified immediately, prefer the appropriate live Radar/source-family file instead;
5. preserve closed/missed routes as negative/history records rather than deleting them;
6. never convert remembered dates into future dates by assumption;
7. never let a thread-recovered row become browser/application-ready without current eligibility/source hydration.

This keeps the master broad and lossless while preserving the Gauntlet truth boundary.
