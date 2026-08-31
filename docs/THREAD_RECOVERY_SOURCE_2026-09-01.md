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
- a field/procurement/pilot channel was worth preserving.

It does **not** establish that the opportunity is still open, that eligibility still holds, that compensation is unchanged, or that the remembered deadline/source is currently authoritative.

Current live state must be rehydrated from the official source before a recovered route can advance through:

`VERIFIED -> ELIGIBLE -> READY -> FIRED`.

## Recovered in this tranche

### Policy / finance / research-paper threads

- DADH 2026 historical research-paper route;
- BCK26 historical four-page-paper route;
- ICDLT 2026 historical full-paper route;
- Digital Tax / ICPA historical abstract route;
- ClimateChain 2026 Policy Lab / ECI window, retained as `WATCH_REVERIFY` rather than presumed live.

### Cite / Research Drive / research-software threads

- JCDL 2026 workshop/tutorial proposal;
- JCDL 2026 full paper;
- NLnet NGI Zero Commons Fund historical Cite/Citation/Commons route.

These past calls remain useful as future-cycle source families but cannot receive invented next-cycle deadlines.

### Hardware / field / procurement threads

- TAIROS + Automation Taipei 2026 field-intelligence route;
- FUTUREMODE watch/reverify route;
- TAITRA / iSourcing electronics-PCB-chip-module-machinery buyer-demand channel;
- manufactured GeoMap supplier/buyer evidence pilot.

The GeoMap rule remains narrow: evidence-backed technical procurement matching can be tested, while generic scraping/lead-generation positioning remains killed.

## Already present and therefore not duplicated

Thread reconciliation also confirmed that many older discoveries were already present in the master/supplement layers, including major Policy Lab routes, TEA/IBFD/NTA continuity, FinTech Taipei, Taiwan Innotech/Energy Taiwan/TAITRONICS-style field routes, SEMICON/Meet Taipei, Hardware-Splicer competition routes, Nocturnal funding routes, Refinery MSR/SANER routes, post-grad jobs/PhDs, and the newer deep-researched fellowship/lab/research-credit layers.

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
