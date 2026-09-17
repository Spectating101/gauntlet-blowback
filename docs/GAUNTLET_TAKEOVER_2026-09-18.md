# Gauntlet takeover assessment — 2026-09-18

## Decision

The immediate defect is split operating state, not a shortage of opportunities. Consolidate the existing research and receipts before starting another census or adding platform features. Funded PhD option creation and employment option creation remain the primary campaigns. Nocturnal conversion is a parallel project lane, not the whole Gauntlet.

This is a review-branch reconciliation. It does not authorize a main merge, an external message, an application, an upload, a payment, or a commitment.

## Inspected source snapshots

| Source | Exact snapshot | Treatment |
| --- | --- | --- |
| Gauntlet main | `9ef06d3dc6abef511137364c830f00c5c5c57537` | Preserve latest Nocturnal conversion work and current expiry corrections. |
| Main Quest PR #52 | `83e4bd02626f7f00fc451a955268b3341ac6525c` | Carry census, economics, campaigns, preparation leverage, execution authority, Policy Lab reconciliation and expiry/checkpoint fixes. |
| TFC staging PR #54 | `5b810cc57b21375a68684656c28f3e1aa80cc9a9` | Preserve archived staging evidence and `message_transmitted=false`; do not infer a live session. |

At inspection, #52 was 28 commits ahead and 20 behind main and reported unmergeable. The shared changed paths were `test/fire-handoff.test.mjs` and `test/gauntlet-master.test.mjs`. Beyond those textual conflicts, #52 contained a now-obsolete Nocturnal pre-merge closure plan. A blind conflict resolution would have regressed project truth.

## Reconciliation performed

- Combine #52 and later main/#54 content without dropping the newer Nocturnal packets, funding gates or expiry tests.
- Copy the authoritative Nocturnal supplement row into `data/portfolio-assets.json`. Preserve the other eleven #52 asset rows and the original registry census date; this is not a fresh audit of all twelve projects.
- Supersede the old Nocturnal closure record and document, preserving their historical exact-commit pointer. No repeat RC2/V3 integration or general product construction is scheduled.
- Preserve Policy Lab's candidate-versus-main distinction, absent external validation, closed GAF route and DPG release dependency.
- Preserve Main Quest's unresolved Invisible Ledger/thesis exclusion and Research Drive/Cite-Agent ownership boundaries.
- Keep the newer Nocturnal FIRE tests alongside #52's expiry/checkpoint behavior. No submission permission is added.

## CI-discovered dispatch defect and repair

The first combined run exposed a real TFC dispatch defect: the opportunity manifest used `STAGED_HUMAN_SEND_GATE`, which is not an accepted runtime execution-state value. Manifest validation failed, and the FIRE queue silently omitted the route. This was not just a stale test expectation.

The repaired manifest uses the existing valid `PORTAL_RECON_REQUIRED` runtime state, matching the next required action and master record. The prior `STAGED_HUMAN_SEND_GATE` label is retained under `route_evidence.recorded_staging_state`, along with the observed field map, original verification date, receipt reference and `message_transmitted=false`. It explicitly records `current_session_verified=false` and `session_revalidation_required=true`.

The FIRE handoff now retains the historically verified field map while requiring current-form inspection and preserving `HUMAN_PROTECTED` final Send. Regression assertions cover the archived staging boundary, valid handoff construction, all three expected FIRE bundles, expired-route exclusion and NLnet's unresolved gates. No new permissive runtime state or weakened validator was introduced.

Correction to the initial assessment: the TFC manifest had already been updated with staging and field-map evidence. The defect was its unsupported runtime state, not an absent manifest update. The campaign execution file remains a historical campaign record rather than the master loader's runtime authority.

## Execution order after review

1. **Main Quest shared evidence and document inventory.** Use `data/main-quest-execution-authority-2026-09-17.json`. Inventory exact evidence revisions, usable demonstrations, CV facts, transcript/degree documents, language evidence and recommender requirements. Mark absent documents unknown; do not manufacture availability or recommender consent.
2. **PhD preparation.** Produce the programme/funding/faculty/document matrix from the preserved 61-route discovery census, then prepare one programme-neutral dossier and verified route deltas. A scholarship lead is not guaranteed funding, and a discovered programme is not an open application.
3. **Employment preparation.** Verify live requisitions before route-specific preparation, then use the existing preparation-family architecture. The research reports 88 rows but only 86 named slots; preserve the two missing identities as gaps. Unknown pay requires verification, not invented compensation.
4. **Nocturnal side lane.** Revalidate the actual TFC browser session before final human review. TWNIC remains host/slot/admin-dependent; NLnet remains portfolio-choice, open-output and applicant-authorship dependent; OTF remains beneficiary/problem-evidence dependent. Do not reopen Nocturnal construction to avoid these external gates.
5. **Evidence intake, not duplicate development.** Receive exact Research Drive/Cite-Agent receipts from their owners. Policy Lab requires source-release reconciliation and external reproduction/comprehension evidence. Hardware Splicer remains `PACKAGED_NOT_PHYSICAL`. Do not import old Refinery/Commons claims into a different repository without an identity and revision check.

`fire-next` is a packaged-route dispatcher, not proof that the full Main Quest discovery census has become an executable application queue. A prominent Nocturnal or credit packet must not silently redefine the overall priorities.

## Still open, not disguised as complete

- Actual TFC live-session revalidation, final human review and any eventual submission receipt remain outstanding. This takeover did not access an authenticated browser or transmit the message.
- Route deadlines, funding, eligibility and live vacancies carried from earlier research were not newly verified against official external sources in this repository-consolidation pass. Reverify before execution; do not bump source timestamps merely because this branch is newer.
- Other open work, including #39, #40, #42–#47 and #51, is not blanket-approved. #47's useful Main Quest lineage is carried through #52; independent packet/queue changes still require their own review.
- Existing paper packets do not override the later unresolved-thesis authority. No Invisible Ledger outward submission is authorized here.

## Verification boundary

The revised registry and closure tests passed locally as a focused 12-test suite. The original registry's Git blob was verified before editing; the resulting Nocturnal row matches the supplement and the other eleven rows are unchanged.

The first combined CI run (`35253133014`, candidate `65113b0db6b32deba1470491f4ed0b7aaa12cf70`) passed syntax and master generation (289 records), passed browser CI, and passed 190/192 core tests. The two failures shared the unsupported TFC runtime-state cause described above. The repair is covered by the subsequent PR-head runs; current acceptance must be read from PR #55's latest checks, not inherited from this initial run or #52's earlier report.

No main branch, original PR, external portal, contact, application, payment or account was changed. Only PR #55's review candidate was created and repaired. After review, advance verified packets and collect external receipts rather than opening another generalized Gauntlet build phase.
