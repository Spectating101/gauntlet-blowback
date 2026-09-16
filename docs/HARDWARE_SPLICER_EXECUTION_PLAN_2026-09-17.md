# Hardware Splicer execution campaign — 2026-09-17

## Mission

Convert the frozen Hardware Splicer release into the strongest truthful set of durable external surfaces that can be produced without inventing physical evidence, collaborators, institutional authority, or unsupported performance claims.

This is one campaign, not a collection of unrelated applications. Opportunities are instruments serving one of five transformations:

```text
frozen internal candidate
    -> citable and license-clear artifact
    -> legible, audience-specific product package
    -> recognized open-hardware surface
    -> fabricated and measured revision
    -> public technical evaluation
    -> archival or benchmark evidence
```

The campaign begins at commit `f892facd67c5124e2362860ebc999625afedc5d5`, tag `gauntlet-spi-flash-adapter-v1-20260916`, with release SHA-256 `6d4c76feaeebdab1223ed6c4be21d63835212baea731aea9d3933f2525be1edd`.

The frozen candidate remains immutable. New evidence creates a new artifact version; it never rewrites the 2026-09-16 record.

## Current truth

Supported now:

- canonical software and manufacturing package are frozen and reproducible;
- schematic, PCB outputs, BOM, placement, drawings, and FCT procedure are packaged;
- deterministic software, CI, evidence identity, and package integrity have been verified internally;
- the release is suitable for external inspection, quotation, fabrication, and bounded technical demonstration.

Not supported now:

- a board has been fabricated, assembled, powered, or measured;
- the design is physically correct or production-ready;
- an independent engineer, manufacturer, user, or reviewer has validated it;
- the project has an OSHWA certification, DOI, paper acceptance, benchmark result, or external deployment.

Every route must preserve `PACKAGED_NOT_PHYSICAL` until revision-bound physical evidence exists.

## Campaign outcomes

### Outcome A — durable public authority

The frozen candidate has a permanent, citable, independently preserved identity with exact provenance, hashes, licenses, claims, and nonclaims.

### Outcome B — product conversion and reception

The project is understandable within thirty seconds, reproducible without repository archaeology, and presented differently—but consistently—to open-hardware users, embedded engineers, evaluators, researchers, conference reviewers, and fabrication providers.

### Outcome C — open-hardware conformance

The first-party hardware, software, and documentation scopes are explicitly licensed and the rev-0.2 design is eligible for OSHWA self-certification. Certification is claimed only after a real OSHWA record exists.

### Outcome D — physical truth

An exact revision is fabricated and subjected to staged cold inspection, controlled power, and read-only identification testing. Failures are recorded as evidence rather than hidden.

### Outcome E — external technical evaluation

At least one technically relevant external audience evaluates the work through a talk, demonstration, engineering track, peer review, or benchmark. Selection and rejection both produce usable receipts.

### Outcome F — reusable research contribution

Hardware Splicer produces a quantitative, reproducible evaluation of evidence-gated agentic hardware work rather than only a project description.

## Execution doctrine

1. Preserve the frozen release; never edit history to absorb later results.
2. Build one canonical evidence spine and derive route-specific packages from it.
3. Separate public artifact publication, licensing, procurement, travel, legal attestations, and final submissions into explicit human gates.
4. Do not call publication, OSHWA certification, peer review, or a vendor quotation physical validation.
5. Do not build sponsor-specific features unless they create a reusable experiment.
6. Do not submit substantially overlapping manuscripts concurrently.
7. A route cannot become FIRE merely because its deadline is near. Its predecessor gate and commitment burden must both be satisfied.

## Workstreams

### WS1 — canonical artifact and preservation

Purpose: create the reusable source object for every later route.

Deliverables:

- release-to-archive manifest binding tag, commit, release assets, and SHA-256;
- `CITATION.cff` draft using the canonical applicant-profile creator name and ORCID, left for projection review;
- machine-readable claims/nonclaims ledger;
- first-party/third-party content inventory;
- deterministic archive bundle excluding restricted vendor bytes;
- Zenodo deposit draft and metadata preview;
- Software Heritage save request and resulting SWHID after public authorization;
- public artifact landing page linking release, DOI/SWHID, reproduction commands, and physical status.

Human gates:

- canonical creator name/ORCID projection review;
- final public license choices;
- final Zenodo publication;
- any legal assertion about ownership or relicensing.

Exit test:

- a clean rebuild produces the same manifest;
- every included object has an origin and license classification;
- the public record says `PACKAGED_NOT_PHYSICAL` prominently;
- DOI/SWHID fields remain empty until real identifiers exist.

### WS2 — open-hardware conformance

Purpose: make rev-0.2 legally and practically reusable without overstating correctness.

Deliverables:

- license inventory for hardware design files, software, documentation, and third-party material;
- proposed scope split: OSI-approved software license, OSHWA-compatible hardware license, and open documentation license;
- repository notices identifying TI, Winbond, and other third-party material outside first-party relicensing;
- OSHWA checklist evidence page;
- OSHWA application draft.

Human gates:

- approve licensing scope;
- accept the OSHWA certification-mark agreement;
- make the self-certification and final application submission.

Exit test:

- editable design sources, BOM, build information, and version identity are public and easy to locate;
- all creator-controlled material is appropriately licensed;
- third-party components are clearly distinguished;
- no OSHWA UID or mark appears before issuance.

### WS3 — physical evidence

Purpose: cross the physical boundary through ordinary procurement instead of waiting for a sponsor or validation partner.

Stages:

```text
quotation only
    -> purchase approval
    -> fabrication/assembly
    -> receipt and identity inspection
    -> cold inspection/continuity
    -> controlled rail and OE bring-up
    -> read-only 0x9F at 5 MHz
    -> evidence ingest and new artifact version
```

Agent work before payment:

- validate the existing fabrication packet against the frozen release;
- create provider-neutral quotation instructions;
- create a substitution policy and unanswered-fabrication-question list;
- produce the expected evidence-return checklist;
- compare quotations without ordering.

Human gates:

- vendor choice;
- payment/order;
- address and personal information;
- physical bench actions or authorization of a paid lab;
- acceptance of component substitutions.

Exit test:

- each physical result is bound to board revision, serial/lot where available, test procedure, equipment/context, timestamp, and raw evidence;
- failures remain visible;
- only a new version may change physical maturity.

### WS4 — product conversion packaging

Purpose: turn the frozen engineering system into something an outsider can understand, trust, reproduce, and route correctly without reading the repository history.

Canonical positioning hypothesis:

> Hardware Splicer is an evidence-gated open hardware engineering workbench. AI agents can propose and assemble engineering work, while deterministic tools, revision identities, and explicit evidence boundaries retain authority over what is accepted.

This sentence is a starting hypothesis, not mandatory wording. Packaging QA must test whether target audiences understand it and whether a more concrete SPI-first formulation performs better.

The packaging system has one canonical core and several audience views.

Canonical core:

- a one-sentence category/value statement;
- 30-second, two-minute, and ten-minute explanations;
- a concrete “why this exists” SPI failure story;
- architecture and evidence-authority diagrams;
- a claims/nonclaims card with `PACKAGED_NOT_PHYSICAL` visible;
- five-minute quickstart and complete reproducibility path;
- release/download/citation/license links;
- one clean demo recording plus an offline demo script;
- screenshots of the evidence ledger, derived lab, KiCad package, and fail-closed rejection behavior;
- FAQ covering physical status, AI authority, supported workflows, limitations, licensing, and reproduction;
- stable copy blocks in short, medium, and long field lengths.

Audience packages:

1. **Open-source user:** clone, replay, contribute, cite, and understand licenses.
2. **Hardware/embedded engineer:** inspect the SPI case, evidence chain, CAD package, verification procedure, and failure boundaries.
3. **Fabricator/FCT provider:** receive only manufacturing inputs, controlled substitutions, inspection steps, and evidence-return requirements.
4. **Conference/demo reviewer:** see problem, novelty, concrete example, demonstrated evidence, audience value, and nonclaims quickly.
5. **Research reviewer:** obtain frozen method, baselines, scenarios, metrics, raw results, and reproducibility instructions.
6. **Resource/access program:** see the bounded experiment, requested resource, safety relevance, budget, and measurable output without turning HS into generic AI-safety prose.

Packaging acceptance tests:

- an unfamiliar technical reader can state what HS is, what is proven, and what is not proven after the first screen;
- every outward claim maps to a canonical evidence object;
- no audience package introduces a new claim or silently changes maturity;
- the first useful demo works offline and does not depend on a live AI service;
- installation/replay time and prerequisites are stated honestly;
- important artifacts are reachable without searching repository history;
- field-limited copy preserves the concrete problem, method, evidence, output, and nonclaims;
- terminology is audience-natural and avoids internal Gauntlet vocabulary;
- all links, hashes, downloads, diagrams, and reproduction commands are tested;
- package versions identify the exact canonical release and copy revision.

Deliverables:

- product-positioning and audience matrix;
- canonical message/copy library;
- release landing page and visual evidence map;
- quickstart and reproducibility path;
- evaluator kit and demo kit;
- provider/manufacturing handoff view;
- research artifact view;
- route-specific packet templates generated from the canonical core;
- packaging QA report recording comprehension, evidence, link, and claim checks.

Stop rules:

- do not hide `PACKAGED_NOT_PHYSICAL` to make the product look more mature;
- do not fabricate users, testimonials, deployments, measured performance, or production readiness;
- do not describe ordinary internal tests as independent validation;
- do not use one generic abstract for every audience;
- do not let visual polish outrun artifact reproducibility or evidence discoverability.

### WS5 — public technical surfaces

Purpose: obtain audience, review, and real external receipts without making publication count the goal.

#### Embedded World 2027 / Eclipse session

- Role: first time-critical talk proposal and strongest immediate thematic match.
- Official deadline: 2026-09-28.
- Internal submission-ready target: 2026-09-24.
- Working title: `Evidence-Gated AI Agents for Open-Source Hardware Engineering`.
- Package: title, abstract, speaker biography, three takeaways, one concrete SPI case, explicit nonclaims, and source links.
- Status rule: `PREPARE_NOW`; becomes `WAITING_HUMAN` only after portal reconnaissance, copy review, identity confirmation, and willingness-to-attend decision.
- Acceptance consequence: Nuremberg attendance and associated travel remain a later economic gate; the conference pass alone does not cover travel.

#### FOSDEM 2027 stand

- Role: reproducible open-source demonstration and contributor/user exposure.
- Deadline: 2026-10-31 23:59 UTC.
- Decision date: 2026-10-10.
- Demo spine: artifact identity -> virtual replay -> model receipt/semantic boundary -> KiCad revision -> tamper rejection -> physical-state boundary.
- Status rule: `HOLD_TRAVEL_DECISION`, not FIRE. Prepare reusable demo assets; submit only if at least one real attendee and travel feasibility are confirmed.

#### DAC 2027 Engineering Track

- Role: strongest later system-level presentation route if HS remains more compelling as an engineered workflow than as a novel algorithmic paper.
- Deadline: 2027-01-11.
- Required package: 100–200-word abstract and six-slide PowerPoint with motivation, main idea, evidence, and measurable results.
- Status rule: `PREPARE_AFTER_EVALUATION_SPINE`.
- Human/economic gate: accepted presenters must register and present.

### WS6 — quantitative evaluation and publication

Purpose: convert the system into a defensible research result.

Primary research question:

> Does evidence-gated agentic hardware engineering reduce unsupported acceptance and provenance failure while retaining useful engineering completion compared with an otherwise similar unguarded workflow?

Minimum experiment:

- freeze a scenario corpus containing valid, stale, tampered, mismatched-revision, capability-inadequate, and physically unsupported evidence;
- compare at least one unguarded baseline with the Hardware Splicer guarded workflow;
- predeclare expected safe action for every scenario;
- measure false acceptance, false blocking, safe completion, abstention/escalation, provenance completeness, and reproducibility;
- report exact model/tool versions and repeated-run variance;
- keep virtual/model/CAD/physical authority layers separate;
- add physical results only when genuinely available.

Milestones:

- 2026-09-23: evaluation protocol frozen;
- 2026-09-30: scenario corpus frozen;
- 2026-10-10: baseline and guarded pilot complete;
- 2026-10-20: full run and preliminary analysis complete;
- 2026-10-24: publication route decision;
- 2026-11-06: first complete manuscript or engineering evidence deck.

Archival route decision on 2026-10-24:

- choose **VTS** when the strongest contribution is test/validation methodology and the verified final deadline/cost are acceptable;
- choose **DAC Research** when the work demonstrates a novel agentic EDA method with strong quantitative comparison;
- choose **DATE LBR** when the result is important but compact/preliminary or arrives after the main-paper window;
- choose **ETS** when fail-closed evidence semantics and dependability become the clearest distinct contribution;
- choose **DAC Engineering** when the artifact/system evidence is strong but research novelty is not yet sufficient for an archival manuscript.

Only one substantially overlapping archival manuscript may be active at a time. Alternate routes remain conditional until rejection, withdrawal, or a clearly non-overlapping contribution exists.

## Route allocation

| Route | Campaign purpose | State now | Predecessor gate | Human commitment |
|---|---|---|---|---|
| GitHub frozen release | immutable source authority | COMPLETE | none | none |
| Canonical product package | outsider comprehension and reuse | BUILD_NOW | frozen authority and claim map | identity approval only where personal data appears |
| Software Heritage | independent preservation | PREPARE | public-source scope review | authorize external archival request |
| Zenodo DOI | citable artifact | PREPARE_DRAFT | license/content inventory and metadata QA | publish record |
| OSHWA | open-hardware conformance | PREPARE | license clearance | legal agreement and final application |
| Ordinary fabrication | physical truth | PREPARE_QUOTE | packet QA | vendor/payment/address |
| Embedded World | immediate technical evaluation | PREPARE_NOW | abstract + portal + attendance feasibility | attestations and final submit |
| FOSDEM stand | open-source demonstration | HOLD_TRAVEL_DECISION | demo package and real attendee | travel and final submit |
| VTS | archival test/validation review | CONDITIONAL | quantitative evaluation and verified deadline/cost | authorship, fee/travel, submit |
| DAC Research | archival EDA review | CONDITIONAL_PRIMARY | strong quantitative novelty | authorship, fee/travel, submit |
| DATE LBR | compact late result | PREPARE_FALLBACK | new result and overlap clearance | authorship, fee/travel, submit |
| ETS | dependable verification review | WATCH_DISTINCT | stronger/distinct result | authorship, fee/travel, submit |
| DAC Engineering | system/demo evaluation | PREPARE_LATER | measurable evidence and six-slide case | fee/travel, submit |
| OpenAI/Anthropic access | optional resource acquisition | SIDE_SHOT | low-effort account data | login, terms, final submit |
| MHS preview | physical-agent research access | HOLD_DEVICE_GATE | truthful device/workflow | account, terms, final submit |
| ICCAD/MLCAD contests | future deterministic benchmarks | WATCH_2027 | official problem and adapter fit | registration/submit |

## Calendar

### 17–18 September

- reconcile the frozen release, PR #50 release route, the existing HS campaign record, and the Deep Research census;
- produce license/content inventory without changing licenses;
- inspect the Embedded World portal and capture actual fields/limits;
- draft the Embedded World abstract from canonical evidence;
- freeze the positioning hypothesis and audience matrix;
- define the evaluation protocol and scenario taxonomy;
- validate the fabrication quotation packet without sending it.

### 19–24 September

- complete Embedded World copy, bio, takeaways, and claims audit;
- build the landing page, message library, quickstart, evidence map, evaluator kit, and first offline demo package;
- run packaging QA for outsider comprehension, links, evidence traceability, and claim drift;
- build the archive manifest, citation metadata draft, and Zenodo deposit preview;
- freeze the quantitative evaluation protocol;
- prepare the OSHWA compliance gap list;
- present only the smallest necessary human decisions: identity/ORCID projection review, licensing, attendance willingness, and publication authorization.

### 25–28 September

- final Embedded World review and human-gated submission;
- capture real submission receipt if submitted;
- do not claim submission without receipt evidence;
- begin evaluation corpus construction regardless of proposal outcome.

### 29 September–10 October

- freeze scenario corpus and run pilot comparison;
- publish archive/DOI only if license and publication gates are cleared;
- request fabrication quotations if permitted, without ordering;
- decide whether FOSDEM travel is realistic;
- keep OpenAI/Anthropic applications as side shots, not blockers.

### 11–24 October

- complete full quantitative evaluation and analyze errors;
- prepare FOSDEM stand only if travel gate passed;
- decide the single primary publication route;
- prepare OSHWA application after license clearance;
- decide whether physical procurement is funded.

### 25 October–20 November

- submit FOSDEM by October 31 only if attendance is real;
- complete one primary archival packet, not several overlapping manuscripts;
- if fabrication exists, ingest evidence and issue a new artifact version;
- otherwise preserve the explicit nonphysical boundary.

### 21 November–15 December

- use DATE LBR or ETS only according to the publication decision tree;
- do not recycle a rejected paper without using the reviews and correcting the contribution;
- begin the DAC Engineering six-slide evidence package.

### 16 December–11 January

- complete DAC Engineering package if evidence supports it;
- prepare 2027 ICCAD/MLCAD benchmark adapters only after official tasks appear;
- refresh the route census and retain closed cycles as next-year radar records.

## Human decision register

These are the only decisions that should interrupt autonomous preparation:

1. Verify the public creator identity and ORCID projected from the canonical applicant profile.
2. Approve hardware/software/documentation license scopes.
3. Authorize Zenodo publication and OSHWA legal agreement.
4. Confirm willingness to attend Embedded World if accepted before final submission.
5. Decide FOSDEM travel by 2026-10-10.
6. Approve fabrication budget, vendor, substitutions, payment, and address.
7. Approve physical bench work or paid-lab authorization.
8. Approve authorship/originality declarations, fees, travel, and final submission for each venue.

Everything else—source verification, portal reconnaissance, drafting, compression, artifact assembly, deterministic checks, demo preparation, experiment execution, and receipt formatting—should proceed without repeated permission requests.

## Risk and stop rules

- **License uncertainty:** stop publication/certification, continue private preparation.
- **No travel willingness:** do not submit attendance-dependent routes; preserve the package for online/local alternatives.
- **No fabrication budget:** continue artifact, simulation, model, and research-evaluation work; do not imply physical progress.
- **Weak quantitative result:** route to DAC Engineering/demo or technical report rather than forcing an archival paper.
- **High false-block rate:** treat it as an engineering defect and improve the gate design before publication.
- **Portal eligibility contradiction:** mark BLOCKED and retain evidence; do not improvise eligibility.
- **Duplicate-submission risk:** stop the later overlapping submission until venue policy and manuscript distinction are resolved.
- **Vendor substitution or revision drift:** require new identity binding before accepting evidence.
- **Deadline ambiguity:** use the earliest official date as the operating cutoff until the portal clarifies it.

## Campaign scorecard

Track conversion by evidence, not application volume:

- durable identifiers created;
- license scopes resolved;
- external records with receipt IDs;
- physical stages truthfully crossed;
- scenarios executed and reproducible;
- false-acceptance and false-blocking rates;
- external reviews, decisions, and useful rejection feedback;
- number of external packages derived from the canonical evidence spine without claim drift;
- unsupported claims introduced: target zero;
- protected commitments crossed without human authority: target zero.

## Immediate operator queue

Execution checkpoint on 2026-09-17:

1. `HS-EW-01` — public portal/account reconnaissance complete; authenticated abstract-form mapping remains behind account creation.
2. `HS-EW-02` — complete; title, abstract, biography, takeaways, session structure, evidence references, and nonclaims are packaged.
3. `HS-PKG-01` — complete; positioning, audience matrix, and copy hierarchy are frozen for review.
4. `HS-PKG-02` — complete; product front door, evidence map, FAQ, quickstart, archive view, provider view, and evaluator paths exist.
5. `HS-PKG-03` — complete; offline demonstration and packaging QA are prepared, with 49 SPI/FCT tests green and all new relative links resolving.
6. `HS-ART-01` — scope inventory complete; third-party vendor PDFs and ambiguous media are explicitly excluded from the initial archive.
7. `HS-ART-02` — metadata, CFF draft, and machine-readable archive manifest complete; actual archive assembly/publication remains gated.
8. `HS-EVAL-01` — complete; the protocol, event rubric, and adjudication guide are bound to the frozen release. `HS-EVAL-02` is also complete because the ten-case corpus already exists and validates. The real missing engineering gate is a matched non-destructive reference/advisory runner; the current runner covers only the constrained condition.
9. `HS-PHY-01` — complete; provider package identity, contents, and physical nonclaims were reverified without vendor contact.
10. `HS-PLAN-01` — complete; Embedded World is registered in Gauntlet and the active calendar without entering FIRE.

The next executable autonomous engineering work is the matched reference/advisory runner and continued route packaging. Paid scored runs remain blocked until treatment parity, a paired transport pilot, exact model snapshots, and cost authority exist. The immediate human checkpoint is deliberately small: Embedded World account identity/attendance/attestations, license scope, archive-publication authority, and quotation budget authority.

The campaign is complete only when every active route is either receipted, deliberately held at a named human gate, closed with a reason, or moved to a future watch cycle—and the resulting external evidence is reconciled back into Hardware Splicer's canonical maturity record.
