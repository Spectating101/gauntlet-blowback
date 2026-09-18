# Portfolio Campaign Coverage Audit — 2026-09-16

## Dataset and grain

The source is the current 287-route Gauntlet master compiled from the local working tree. The audited grain is one route that passes the selected portfolio campaign scope. There are 233 such rows.

The intended use is campaign planning and registry remediation. Neither this audit nor a provisional assignment authorizes browser execution.

Reproducible artifacts:

- campaign authority: `data/portfolio-campaign-graph-2026-09-16.json`;
- coverage generator: `scripts/build-portfolio-campaign-coverage.mjs`;
- complete route-level output: `reports/portfolio-campaign-coverage-2026-09-16.json`;
- unresolved-route decisions: `data/portfolio-campaign-review-queue-2026-09-16.json`.

## Coverage profile

| Measure | Count | Rate / interpretation |
|---|---:|---|
| Master routes | 287 | Full compiled registry |
| Campaign-scoped routes | 233 | Audit denominator |
| Campaigns | 23 | Open-world seed, not a completeness claim |
| Explicit campaign assignments | 29 | 12.4% of scoped routes |
| Explicit person-route assignments with terminal override | 2 | 0.9% |
| Provisional deterministic assignments | 180 | 77.3%; useful for census, not execution authority |
| Routes requiring deliberate assignment | 22 | 9.4%; all now have a review disposition |
| Automatic execution allowed | 0 | Required by `ASSESS_ONLY` mode |

The assignment model separates:

- primary campaign ownership;
- cross-cutting outcome campaign, such as resource acquisition or market conversion;
- system assets supplying evidence to person-level applications;
- route function;
- data-quality flags;
- execution authority.

## Findings

### 1. Registry status vocabulary is not a reliable control dimension

**Evidence:** 233 scoped routes use 77 distinct `status` strings. Examples combine action, confidence, dependency, timing and strategy in one field: `FIRE_AFTER_GATE`, `WATCH_REVERIFY`, `HOST_PORTFOLIO_BAKEOFF_REQUIRED`, `DEFAULT_PRIMARY_FIRE`, and many others.

**Risk:** downstream sorting can mistake prose-like status labels for comparable readiness states. A tempting word such as `FIRE` can outrun an internal research, economic, account, or external-person gate.

**Severity/confidence:** High / High.

**Remediation:** preserve historical labels as annotations, but derive execution from separate controlled fields: campaign assignment, route function, asset readiness, packet readiness, portal readiness, economics, dependency class, deadline state, and submission authority.

### 2. Official-source coverage is incomplete

**Evidence:** after the 2026-09-16 official-source pass, 36 of 233 scoped routes (15.5%) have no official source URL, down from 44 (18.9%). The pass hydrated MSR Technical, MSR Data/Tool, three SANER tracks, ICSE-SEIS, DATE LBR, and FAccT. Remaining missingness is concentrated in PhD census rows (13), deliberately unassigned review routes (8), and smaller Hardware Splicer (4), Policy Lab (3), Public-Good (3), and Refinery (3) groups.

**Risk:** deadlines, eligibility, economics, form mechanics, and opening state cannot be trusted or refreshed. These are discovery leads, not safe application targets.

**Severity/confidence:** High / High.

**Remediation:** source-hydrate current high-value families first. Archive past/source-less field reminders. Add a stable not-empty official-source test only for routes promoted beyond discovery/research-only state.

**Remediation completed in this pass:** the eight current technical/publication records above now carry official URLs, exact paper deadlines, upstream abstract deadlines, and applicable registration/presentation dependencies. Source verification did not upgrade their fit, packet, portal, or execution state.

### 3. Past deadlines retain active-looking states

**Evidence:** 26 scoped routes (11.2%) have a hard deadline earlier than 2026-09-16 while retaining a status not recognizably closed, expired, rejected, submitted, or withdrawn. The set includes past PhDs, fellowships, GAF/GRASFI, TAAI, field events, and an old HKU research job.

**Risk:** stale rows can occupy ranking, preparation, or human-attention capacity and create unsafe late portal work.

**Severity/confidence:** High / High for deadline conflict; Medium for the desired archival disposition of each route.

**Remediation:** run a deadline-state reconciliation that moves past routes to history unless a current official source proves an extension or rolling replacement. Do not overwrite a past cycle with a future-cycle assumption.

### 4. Portfolio bakeoffs were being misreported

**Evidence:** 19 scoped routes carry unresolved portfolio-bakeoff semantics. The campaign scope evaluator previously checked whether the provisional lead was active before checking `PORTFOLIO_BAKEOFF`, allowing an unresolved scarce slot to appear as `ACTIVE_LEAD`.

**Risk:** one-call/one-host/one-entity opportunities could be consumed without comparing the portfolio candidates.

**Severity/confidence:** Critical / High for affected scarce slots.

**Remediation completed:** bakeoff mode now takes precedence over an active provisional lead. A regression test covers TWNIC. All 19 are surfaced as unresolved and remain non-executable.

### 5. Campaign-to-master integrity is incomplete

**Evidence:** four campaign route instruments are absent from the current master: ATTA 2027, ATAx 2027, IPSA RC30 2027, and SASE 2027. Their packets exist on separate draft branches/PRs rather than canonical main. The earlier WU identifier mismatch was reconciled to the current master identifier.

**Risk:** campaign plans can describe routes that the canonical operator cannot find, rank, checkpoint, or execute.

**Severity/confidence:** High / High.

**Remediation:** integrate or explicitly import the four reviewed route records before campaign execution. Until then they remain planning instruments, not executable master rows.

### 6. Duplicate source families need parent constraints, not blind deletion

**Evidence:** 22 non-empty official-source groups contain multiple scoped route rows. Notable families include 21 InnoServe categories on one rules page, five NHH PhD rows, three NLnet variants, three Taiwan procurement variants, and provider/job-board families. Two normalized organization/opportunity names are duplicated.

**Risk:** intentional subtracks can be incorrectly deleted, while true duplicates can consume repeated preparation or submission slots. InnoServe is especially dangerous because category count is not submission capacity.

**Severity/confidence:** Medium / High.

**Remediation:** add source-family/parent-route identifiers and enforce family constraints such as maximum submissions, mutual exclusion, one legal entity, or one primary manuscript. Deduplicate exact person/job duplicates separately from legitimate tracks.

### 7. Academic versus system ownership remains ambiguous for seven routes

**Evidence:** after explicit reconciliation, seven `RESEARCH` routes remain provisionally attached to a system asset without a frozen separable paper/system-paper object.

**Risk:** a conference name can manufacture a paper campaign from a product repository, or a paper route can be packaged from generic product marketing.

**Severity/confidence:** Medium / High.

**Remediation:** apply the academic derivative rule: require a separable research question, stable evaluation object, scholarly claim boundary, manuscript-equivalent artifact, and value beyond the product campaign before promotion.

## Unresolved-route disposition

Every one of the 22 routes that could not be safely assigned has a concrete assessment disposition:

| Disposition | Count | Meaning |
|---|---:|---|
| Exclude external prerequisite | 8 | Adviser/team/host/institution dependency is outside current scope |
| Archive closed/completed/expired/past cycle | 7 | Preserve history; remove from active attention |
| Source reverify and bakeoff | 3 | No current demand or mechanics justify project ownership yet |
| Consolidate source-family bakeoff | 2 | Duplicate NLnet Restack project variants require one portfolio decision |
| Hold entity gate | 1 | NVIDIA Inception needs a qualifying company/startup vehicle |
| Watch next cycle with source reverify | 1 | NSTC reminder is past and source-less |

The full route-level reasons are in `data/portfolio-campaign-review-queue-2026-09-16.json`.

## Newly explicit plans

The first graph contained two Main Quest option plans, seven academic plans, seven system-asset plans, and four controls. This audit established three additional material plans:

1. **Funded Research Appointments** — fellowships, residencies, predocs, labs and visiting research, economically distinct from normal jobs and PhDs.
2. **Resource and Cost-Offset Acquisition** — grants, credits, compute and reimbursement bound to named experiments and restrictions.
3. **Market Pilots, Procurement and Revenue** — bounded offers, paid pilots, bounties and procurement evidence.

The current graph therefore contains 23 plans.

## Next remediation order

1. Reconcile the 26 past-deadline active states.
2. Canonicalize the four draft academic route records into the master or keep them explicitly non-executable.
3. Source-hydrate current high-value missing-source routes; archive historical reminders.
4. Normalize route state into separate controlled dimensions while retaining legacy status text.
5. Add parent/source-family constraints for InnoServe, NLnet, procurement, provider access and repeated job boards.
6. Resolve the seven academic/system derivative routes against actual scholarly objects.
7. Re-run the audit. Only reviewed explicit assignments may later become campaign execution authority.

## Source-verification receipt

Official pages checked on 2026-09-16:

- MSR 2027 Technical Papers: `https://2027.msrconf.org/track/msr-2027-technical-papers`
- MSR 2027 Data and Tool Showcase: `https://2027.msrconf.org/track/msr-2027-data-and-tool-showcase-track`
- SANER 2027 Research Track: `https://conf.researchr.org/track/saner-2027/saner-2027-papers`
- SANER 2027 Tool Demo Track: `https://conf.researchr.org/track/saner-2027/saner-2027-tool-demo-track`
- SANER 2027 Agentic AI4SE Track: `https://conf.researchr.org/track/saner-2027/saner-2027-agentic-ai4se-track`
- ICSE 2027 Software Engineering in Society: `https://conf.researchr.org/track/icse-2027/icse-2027-seis`
- DATE 2027 Call for Papers: `https://www.date-conference.com/call-for-papers`
- ACM FAccT 2027 Call for Papers: `https://facctconference.org/2027/cfp.html`

## Assumptions and limits

- This audit uses the current dirty local working tree and its compiled master; it does not claim the default GitHub branch contains every referenced draft packet.
- Source absence means no URL in the master row, not proof that no official page exists.
- Shared source URLs may represent legitimate tracks; they are duplicate-family candidates, not automatically duplicate records.
- Provisional assignments are deterministic organizational hypotheses. They are not fit, eligibility, readiness, or acceptance judgments.
