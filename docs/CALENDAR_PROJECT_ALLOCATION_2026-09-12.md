# Calendar → Project Allocation (2026-09-12)

## Decision

Every one of the 96 source `VEVENT` definitions in the active and rolling calendars now has an explicit allocation decision. Recurring rules are assessed once at their source-event grain and expand into dated occurrences in `calendar-queue`.

- 66 events select a lead project.
- 20 are portfolio operations/batches and must allocate each underlying route independently.
- 8 are outcome, finalist, reimbursement or presentation stages that inherit the project actually submitted.
- 1 GeoMap recurring review is explicitly skipped under the current campaign scope.
- 1 E2 / 1 Hotels recheck remains unallocated because no canonical route establishes what the opportunity is.

The machine-readable authority is `docs/calendar-project-allocation-2026-09-12.json` and is regenerated with `npm run calendar:allocate`.

## Whole-campaign inventory

The five document-heavy routes below are only the immediate applicant-record audit. They are not the full Gauntlet.

- The master contains 287 unique routes; 248 remain active and 195 are inside the selected campaign scope.
- The selected campaign contains 150 project-led routes, 30 person-level application bundles, 8 shared student/resource routes and 7 portfolio bakeoffs.
- Registry execution state currently reports 15 `APPLICATION_READY`, 9 `OUTREACH_READY` and 4 `PACKET_READY` routes across the active master. These labels mean that useful packaging exists; they do **not** by themselves establish live-form, eligibility, account, evidence or final-submit readiness.
- Only one current calendar route passes the stricter `READY_FOR_BROWSER_DRAFT` assessment: the TAAI Hardware Splicer packet. The remaining calendar work divides mainly into 27 packaging/route-recon tasks, 21 route-binding tasks, 16 externally dependent exclusions, 13 research/recon tasks and 6 general PhD-document holds, plus route-specific evidence and eligibility gates.
- The registry still has 58 routes without official source URLs, including 13 active hard-deadline routes. Those remain research leads, not safe execution targets.

| Lead family | Active campaign routes |
|---|---:|
| Cite-Agent | 36 |
| Person-level bundles | 30 |
| Hardware Splicer | 27 |
| Public-Good Control Plane | 23 |
| Refinery / Commons | 22 |
| Research Drive | 18 |
| Policy Lab / CL-ECI | 15 |
| Nocturnal Oversight | 8 |
| Research papers | 1 |
| Lead unresolved / bakeoff pending | 15 |

The next audit tranche therefore covers the full set of packet-, application- and outreach-ready routes, followed by every hard deadline through October. Each route must be reclassified against its official source as `READY_FOR_BROWSER_DRAFT`, `PACKAGING_REQUIRED`, `FORMAL_RECORD_OR_ACCOUNT_GATE`, `EXTERNAL_DEPENDENCY`, or `SOURCE_REVERIFY` before automation touches the live portal.

## Scoring interpretation

The relative score is designed to choose among this portfolio's projects. It is not an acceptance probability.

| Component | Weight | Meaning |
|---|---:|---|
| Capability fit | 52% | Native match between the opportunity and the project's actual contribution/evidence package |
| Asset maturity | 28% | Implementation, external evidence, deployment and canonicalization state |
| Route readiness | 20% | Current FIRE/VERIFY/HOLD state and whether an execution packet exists |

External eligibility, source freshness, manuscript overlap and final human commitments remain hard gates regardless of score. A stronger campaign rule now applies to third parties: a route that requires a new referee/reference, recommendation, external validation or certification, teammate, adviser, principal investigator, host, partner, institutional approval/sponsorship, or introduced connection is excluded rather than queued for dependency resolution. Ordinary external review after submission is not such a prerequisite; neither are self-owned accounts, existing documents, or the protected final human submit.

## Current project choices by opportunity family

| Opportunity family | Lead project | Why |
|---|---|---|
| Physical/embodied/industrial AI, semiconductor, construction, field hardware | Hardware Splicer | Strongest differentiated technical evidence and the portfolio's only current limited external/operator evidence in physical-agent work |
| Research AI, citation/RAG, NLP and evidence-accountability roles | Cite-Agent | Most direct research-facing reliability story; Research Drive supports platform and workflow claims |
| MCP, data systems, full-stack research infrastructure and research-cloud routes | Research Drive | Internal-live deployment and strongest operational infrastructure maturity |
| FinTech, financial governance, audit, tax, cryptography and policy | Policy Lab / CL-ECI | Canonical public demo plus existing venue-specific packets; avoid claims of external adoption |
| Information integrity, journalism, censorship, civic monitoring and social-data work | Nocturnal Oversight | Native problem fit; remains partner/pilot gated where the applicant route requires a real journalist/operator |
| Climate, conservation, disaster and bounded civic/public-good routes | Public-Good Control Plane | Native public-interest control-plane framing; only use where a real operator/use case exists |
| Software sustainability, open source, provenance, reuse and research-software venues | Refinery / Commons | Strongest native research-software contribution and bounded falsification/provenance evidence |
| Paper-native finance/tax conferences and manuscript stages | Research papers / Invisible Ledger | Existing manuscript is the asset; only current claim-audited revisions may be used |

## Immediate calendar recommendations

Readiness answers a different question from fit: whether the selected asset can be carried into a real browser draft now, or still needs packaging, research/evidence repair, an external dependency, or applicant documents.

| Date | Entry | Recommended lead | Relative assessment | Readiness | Work still required / hard gate |
|---|---|---|---|---|---|
| 2026-09-13 | ERA:AI Winter 2027 | Hardware Splicer | Strong relative fit | **Excluded — external dependency** | The application requires two referees. The no-LLM/no-AI-use attestation is an additional constraint, but the referee requirement alone removes this route from the campaign. |
| 2026-09-14 | TAAI 2026 domestic extended abstract | Hardware Splicer | Strong relative fit | **Ready for browser draft** | No packaging or engineering remains. Use the existing FIRE packet/PDF in signed-in OpenReview; account, attestations and final submit are protected. |
| 2026-09-14 | VU Social Data Science PhD | Nocturnal Oversight | Medium relative fit | **Generated packet; eligibility gate — not in auto queue** | The refreshed CV and one-page letter are generated, but the advertised completed-research-master requirement is not established and the user has paused PhD applications. |
| 2026-09-14 | Fund for Investigative Journalism | Nocturnal Oversight | Low until dependency clears | **Excluded — external dependency** | Requires a real journalist or media-outlet applicant and investigation lead. The campaign will not acquire or manufacture that relationship. |
| 2026-09-15 | HKU AI Engineer / RA II | Research Drive | Strong relative fit | **Eligibility blocked or uncertain** | The CV is the primary document and a concise one-page cover note is available. Before browser execution, establish that the Finance and Accounting degree is accepted as a related field and verify work-authorization plus exact required-stack expectations. |
| 2026-09-15 | VU ATLANTIS PhD | Cite-Agent | Strong relative fit | **Excluded — external dependency** | The route requires two referees. Existing generated documents do not change that campaign-level exclusion. |
| 2026-09-15 | NHH early finance PhD | Research papers | Low/unproven after Sharpe deferral | **Strongest substantive packet; formal-records hold** | CV, 252-word statement, 2,214-word proposal, and research list are generated and within the stated word ranges. NHH permits an unfinished master's at application time, but the bachelor record, current master's records, grading scale, GPA/thesis threshold, GMAT/GRE, and English-test or waiver evidence remain unresolved. |
| 2026-09-24 23:59 AoE | Financial Cryptography 2027 | Policy Lab / CL-ECI | Strong relative fit | **Research-evidence repair required** | Official CFP extension reverified 13 Sep. Repair/remove the unreproduced indicator result and disclose stationarity limits, then freeze and format the short paper. This is research QA, not general product engineering. |
| 2026-09-17 | Shih Hsin Finance abstract | Research papers / Invisible Ledger | Medium relative fit, low effort | **Claim repair + packaging required** | Propagate the audited $170B correction into the current abstract/manuscript, export, verify route, then draft. |
| 2026-09-18 | Chunghwa Telecom competition | Policy Lab / CL-ECI | Strong fit if eligible | **Excluded — external dependency** | The required eligible teammate makes this route ineligible for the current solo campaign. |
| 2026-09-18 | Smart Living competition | Hardware Splicer | Medium relative fit | **Category recon, then packaging** | Use only if an existing capability is natively eligible. Do not build a new project merely to force fit. |

## Applicant-document audit and PhD policy

The scoped workspace audit found a two-page CV PDF dated 2026-04-20 in adjacent Cite-Agent worktrees. The operator used it, the canonical applicant profile, and current bounded project evidence to generate a refreshed two-page CV. It also found an official January 2026 enrollment certificate establishing the exact degree title as **Master of Science in Finance and Accounting**, although that certificate's printed validity has expired. The operator generated the immediate HKU, VU Social, VU ATLANTIS and NHH prose packets. For ERA it generated only a compliance checklist because the live form prohibits AI/LLM-authored responses. All editable documents require applicant review and designation.

The audit still found no bachelor degree certificate, transcripts, current course/grade overview, grading-scale document, GMAT/GRE proof, current English-test or exemption proof, or referee list by document-like filename. Candidate manuscripts exist, but no writing sample has been explicitly designated and claim-audited for a PhD packet. These are personal/formal evidence gates that drafting cannot manufacture.

This does **not** prove those materials do not exist. Email, cloud drives, external portals and unmounted storage were not searched. Therefore the machine authority uses `NOT_FOUND_IN_SCOPED_SEARCH`, not `MISSING`.

Automatic PhD drafting/execution is now held until both conditions are true:

1. the user explicitly reopens PhD applications; and
2. the exact official document set for the named route is verified and privately designated.

Named PhD routes remain inspectable for research and audit, but they are excluded from `apply-next` / `apply-queue` so a deadline label cannot silently turn an unready person-level application into the next automatic action.

## Corrected prior allocation errors

- Fund for Investigative Journalism now uses Nocturnal rather than Cite, but the required journalist/media applicant excludes it from this campaign.
- VU Social Data Science now uses Nocturnal rather than a generic Policy bundle.
- TU Delft Business Impact from Construction Software uses Research Drive rather than Policy Lab.
- The generic OIST internship uses Research Drive after Sharpe was deferred; exact host-unit fit must still be resolved.
- USN AI transformation of auditing uses Policy Lab rather than Cite.
- OpenAI and Anthropic research-access calendar work retains the concrete Hardware Splicer evaluation package already built for those routes.
- Outcome/final/presentation dates inherit the project actually submitted and never create a second application.

## Remaining data-quality gaps

- III registration and proposal, plus Energy Taiwan, have a recommended Hardware Splicer lead but still lack an exact current canonical route binding.
- The E2 / 1 Hotels fellowship recheck has neither a trustworthy route binding nor enough current evidence to choose a lead.
- Calendar dates are non-authoritative reminders. Before execution, the canonical route and official source control deadline and eligibility.
