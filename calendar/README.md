# Gauntlet calendar authority

## Sep-15 Main Quest overlay

Primary career/degree routes are now separated from the broader opportunity calendar:

- `gauntlet-main-quest-2026-09-15.ics` — PhD + serious full-time/research-employment execution calendar;
- `../data/main-quest-board-2026-09-15.json` — machine-readable PhD/job route board;
- `../docs/MAIN_QUEST_BOARD_2026-09-15.md` — human-readable doctrine, route fit, dates, recommender allocation and operating rhythm.

Main Quest semantics:

- thesis completion remains P0;
- Main Quest A = funded PhD option creation (NYCU, NTU, NTHU, NCCU);
- Main Quest B = upper-tail full-time/research employment price discovery;
- fellowships, competitions, grants, credits and pilots remain side quests unless a hard deadline or exceptional expected value justifies displacement;
- NTHU 116 exact dates remain `WATCH/REVERIFY` until an official 116 doctoral brochure is source-locked.

## Sep-14 freeze candidate

The draft Sep-14 conversion freeze lives in:

- `gauntlet-freeze-active-2026-09-14.ics` — source-verified hard-deadline spine;
- `gauntlet-freeze-rolling-watch-2026-09-14.ics` — rolling/resource/watch actions without fabricated deadlines;
- `../data/gauntlet-freeze-2026-09-14.json` — machine-readable route and allocation snapshot;
- `../docs/GAUNTLET_FREEZE_2026-09-14.md` — human-readable doctrine, route corrections and development gate.

While the Sep-14 freeze PR is under review, the Sep-1 consolidated files remain the committed-main authority. Once accepted, the Sep-14 freeze supersedes stale Sep-1 timing/ownership assertions for the Sep 15–Nov 30 conversion window. In particular, do not use the old Sep-6 MATS Winter Fellowship event as the current MATS authority: the verified live route is the separate MATS Residency window ending Oct 31, 2026 AoE.

Cutoff: **2026-09-01 20:35 Asia/Taipei**.

The calendar layer is now separated by execution semantics instead of by legacy project family.

## Canonical calendars

### `gauntlet-consolidated-active-2026-2027.ics`

Hard dates, current-cycle deadlines, conditional outcomes, field events and recurring execution blocks from the cutoff forward.

Rules:

- no deadline that ended before the cutoff remains in the active file;
- Sep 1 all-day operating events remain `NOW` through the local day;
- `OUTCOME IF FIRED` events are conditional on an actual receipt;
- `REVERIFY` and `WATCH` events are review points, not claims that a remembered date is a current official deadline;
- route-allocation authority wins over stale legacy labels.

Important ownership corrections now reflected in the consolidated calendar:

- SSI is a **Refinery-led person-level research-software bundle**, not a Policy-Lab-owned slot;
- Shih Hsin Finance is **Invisible Ledger / research-papers led**;
- FTSID is the **CL-ECI / Policy Lab fallback manuscript lane** under FC27 exclusivity;
- NLnet is a **portfolio bake-off**, with Refinery provisional lead rather than an old project row reserving the first-grant slot;
- jobs/labs/fellowships/PhDs are person-level evidence bundles, not competing project submissions.

### `gauntlet-consolidated-rolling-watch-2026-2027.ics`

Rolling opportunities and watches that should not be assigned fake hard deadlines.

This includes:

- student benefits and research-access claims;
- OpenAI / Anthropic research-resource actions;
- rolling lab, predoc and research-staff discovery;
- Nocturnal pilot outreach;
- PI-sponsored research-cloud credits;
- Public-Good and GeoMap pilot gates;
- next-cycle fellowships/residencies;
- civic-tech / information-integrity partner watches;
- future-cycle research venues;
- DPG rolling conversion;
- manufactured outbound/pilot review.

The recurring calendar block is the action surface; the full Gauntlet master remains the opportunity inventory.

### `gauntlet-consolidated-history-through-2026-09-01.ics`

Closed or completed dates through the cutoff.

Historical does **not** mean delete. A past opportunity remains useful as:

- negative administrative evidence;
- a future-cycle Radar seed;
- a source-family lead;
- or an `OUTCOME` route when a real submission receipt exists.

A prepared packet is never sufficient to mark a route submitted.

## Legacy calendars

The older split files remain in the repository for provenance and existing calendar subscriptions:

- `gauntlet-postgrad-2026-2027.ics`
- `policy-lab-gauntlet-2026.ics`
- `research-assets-gauntlet-2026-2027.ics`

They are **legacy views as of the Sep-1 consolidation** and must not be used as semantic authority when they conflict with:

1. the Gauntlet master route state;
2. `data/portfolio-route-allocation-2026-09-01.json`;
3. `data/portfolio-assets.json`;
4. the consolidated calendars above.

## State model

Calendar prefixes mean:

- `NOW` — currently active at the cutoff;
- `FIRE` — actionable current-cycle route;
- `FIRE AFTER GATE` / `VERIFY THEN FIRE` — one or more material gates remain;
- `PRIMARY FIRE` — protected lead route in a scarce/overlap group;
- `FALLBACK ONLY` — fire only if the protected primary lane stops;
- `PORTFOLIO BAKEOFF` — do not reserve/submit a scarce slot until portfolio allocation is resolved;
- `OUTCOME IF FIRED` — relevant only when a receipt proves prior submission;
- `WATCH` / `REVERIFY` — discovery intelligence, not a verified current deadline;
- `PILOT` / `PARTNER` — external-evidence route, not necessarily direct funding;
- `CLAIM` / `BORING GOLD` — student entitlement, reimbursement or cost-displacement action;
- `EXPIRED/HISTORY` — removed from the live firing queue but retained as intelligence;
- `KILL + EXPIRED` — both strategically killed and past for the current cycle.

## Cutoff rule

At each calendar rebuild:

1. resolve current local time in Asia/Taipei;
2. move ended hard-deadline events from active to history;
3. if a receipt exists, preserve future notification/final/interview events as outcome events;
4. retain future exact deadlines;
5. convert uncertain future dates to `WATCH/REVERIFY` instead of pretending they are verified deadlines;
6. keep rolling opportunity families alive through recurring review blocks;
7. apply current portfolio lead/support allocation before generating summaries/descriptions;
8. never delete the underlying route from the master merely because its current cycle expired.
