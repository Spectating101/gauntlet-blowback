# Gauntlet takeover assessment — 2026-09-18

## Decision

The immediate defect is split operating state, not a shortage of opportunities. Consolidate the existing research and receipts before starting another census or adding platform features. Funded PhD option creation and employment option creation remain the primary campaigns. Nocturnal conversion is a parallel project lane, not the whole Gauntlet.

This is a review-branch reconciliation. It does not authorize a main merge, an external message, an application, an upload, a payment, or a commitment.

## Inspected source snapshots

| Source | Exact snapshot | Treatment |
| --- | --- | --- |
| Gauntlet main | `9ef06d3dc6abef511137364c830f00c5c5c57537` | Preserve latest Nocturnal conversion work and current expiry corrections. |
| Main Quest PR #52 | `83e4bd02626f7f00fc451a955268b3341ac6525c` | Carry census, economics, campaigns, preparation leverage, execution authority, Policy Lab reconciliation and expiry/checkpoint fixes. |
| TFC staging PR #54 | `5b810cc57b21375a68684656c28f3e1aa80cc9a9` | Preserve the archived staging receipt and `message_transmitted=false`; do not infer a live session. |

At inspection, #52 was 28 commits ahead and 20 behind main and reported unmergeable. The shared changed paths were `test/fire-handoff.test.mjs` and `test/gauntlet-master.test.mjs`. Beyond those textual conflicts, #52 contained a now-obsolete Nocturnal pre-merge closure plan. A blind conflict resolution would have regressed project truth.

## Reconciliation performed

- Combine #52 and the later main/#54 content without dropping the newer Nocturnal packets, funding gates or expiry tests.
- Copy the authoritative Nocturnal supplement row into `data/portfolio-assets.json`. Preserve the other eleven #52 asset rows and the original registry census date; this is not a claim that all twelve projects were freshly re-audited.
- Supersede the old Nocturnal closure record and document, preserving their historical exact-commit pointer. No repeat RC2/V3 integration or general product construction is scheduled.
- Preserve Policy Lab's candidate-versus-main distinction, absent external validation, closed GAF route and DPG release dependency.
- Preserve Main Quest's unresolved Invisible Ledger/thesis exclusion and Research Drive/Cite-Agent ownership boundaries.
- Keep both the newer Nocturnal FIRE tests and #52's expiry/checkpoint behavior. No submission permission is added.

## Execution order after review

1. **Main Quest shared evidence and document inventory.** Work from `data/main-quest-execution-authority-2026-09-17.json`. Inventory exact evidence revisions, usable project demonstrations, CV facts, transcript/degree documents, language evidence and recommender requirements. Mark absent documents unknown; do not manufacture availability or recommender consent.
2. **PhD preparation.** Produce the programme/funding/faculty/document matrix from the preserved 61-route discovery census, then prepare one programme-neutral dossier and verified route deltas. A scholarship lead is not guaranteed funding, and a discovered programme is not an open application.
3. **Employment preparation.** Verify live requisitions before route-specific preparation, then use the existing preparation-family architecture. The research reports 88 rows but only 86 named slots; preserve the two missing identities as gaps. Unknown pay is price-discovery debt, not invented compensation.
4. **Nocturnal side lane.** Reconcile the archived TFC staging record with the actual live browser before final human review. TWNIC remains host/slot/admin-dependent; NLnet remains portfolio-choice, open-output and applicant-authorship dependent; OTF remains beneficiary/problem-evidence dependent. Do not reopen Nocturnal construction to avoid these external gates.
5. **Evidence intake, not duplicate development.** Receive exact Research Drive/Cite-Agent receipts from their owners. Policy Lab requires source-release reconciliation and external reproduction/comprehension evidence. Hardware Splicer remains `PACKAGED_NOT_PHYSICAL`. Do not import old Refinery/Commons claims into a different repository without an identity and revision check.

`fire-next` is a packaged-route dispatcher, not proof that the full Main Quest discovery census has become an executable application queue. A prominent prepared Nocturnal or credit packet must not silently redefine the overall priorities.

## Still open, not disguised as complete

- #54's archived TFC campaign record says staged, while the checked-in opportunity manifest and master/FIRE tests still describe `PORTAL_RECON_REQUIRED` and an unverified field map. Preserve the staging evidence, but revalidate the live session/fields and update the runtime handoff only with a real receipt. This takeover did not access an authenticated browser or resend the message.
- Route deadlines, funding, eligibility and live vacancies carried from earlier research were not newly verified against official external sources in this repository-consolidation pass. Reverify before execution; do not bump source timestamps merely because this branch is newer.
- Other open work, including #39, #40, #42–#47 and #51, is not blanket-approved or silently integrated. #47's useful Main Quest lineage is carried through #52; independent packet/queue changes still require their own review.
- Existing paper packets do not override the later unresolved-thesis authority. No Invisible Ledger outward submission is authorized here.

## Verification boundary

The revised registry and closure tests were run locally as a focused 12-test suite. The original registry was reconstructed and its Git blob hash verified before editing; the resulting Nocturnal row matches the supplement and the other eleven rows are unchanged. Full `npm run check` and browser-suite acceptance must be established on the combined commit, not inherited from #52's earlier green report. Hosted CI results belong to the PR/check-run record.

No main branch, original PR, external portal, contact, application, payment or account was changed by this takeover. Only a new review candidate is proposed. After review, advance verified packets and collect external receipts rather than opening another generalized Gauntlet build phase.
