# Open Technology Fund — Internet Freedom Fund concept-note draft

Status: **drafted / concrete beneficiary + pilot evidence gate remains**  
Call: rolling  
Official fund: `https://www.opentech.fund/funds/internet-freedom-fund/`  
Applicant class: individuals or organizations, subject to OFAC restrictions and OTF rules

## Do not FIRE yet

OTF's Internet Freedom Fund is not a generic misinformation, journalism, civic-tech or provenance grant. It prioritizes real Internet-freedom problems affecting people in repressive censorship/surveillance contexts.

Before submission, this concept must name a concrete beneficiary/user group and context, ideally supported by evidence from a bounded external Nocturnal pilot or a committed Internet-freedom/civil-society collaborator.

Do not invent a repressive-environment partner or claim that Taiwan FactCheck Center, OCF, Doublethink Lab or another organization has endorsed the project.

---

# Candidate project

## Project title

**Nocturnal: Recoverable Public Memory Under Source Disappearance and Information Control**

Alternative: **Nocturnal Internet Freedom Memory Layer**

## 1–3 sentence project description

Nocturnal is a self-hostable system for reconstructing how a public-source matter changes over time when pages are edited, removed, contradicted or corrected. The proposed project would adapt its correction-aware matter history, source provenance, portable snapshots and historical reconstruction for civil-society researchers, journalists and human-rights practitioners working in restrictive information environments, so they can preserve and independently inspect the documented state of a matter without relying on a single platform or mutable source page.

**Beneficiary placeholder before submission:** `[NAME CONCRETE USER GROUP / REGION / PARTNER]`.

## What problem will the project address?

In restrictive information environments, the evidence needed to understand what was publicly claimed at a specific time is fragile. Official pages can change or disappear, access can be blocked, reporting can be corrected without a clear revision trail, and the same narrative may be repeated across outlets without representing independent evidence. Analysts often reconstruct the history manually from web search, saved links, screenshots, archives and spreadsheets. That process is slow and makes it easy to lose the relationship between an early claim, a later denial or correction, and the current documented state.

Existing web archives are essential but normally preserve pages rather than a structured, correction-aware history of a matter. Search engines find documents but do not reliably preserve supersession or historical state. Fact-checks usually evaluate a bounded claim rather than maintaining an interoperable longitudinal evidence object.

Nocturnal addresses this technical gap by preserving ordered source-linked events, correction/supersession relations, historical `as_of` views and the current documented state without assigning a global truth or reputation score. The proposed OTF work would focus on the threat model of source disappearance, censorship, blocking and deliberate revision in restrictive contexts.

## Proposed activities

### Objective 1 — Threat-model and user-requirements adaptation

Work with a concrete civil-society/research user group to document how source disappearance, access restriction, editing and contradictory reporting currently affect their workflow.

Deliverables:
- written user/problem requirements;
- threat model and misuse analysis;
- safe-data and privacy protocol;
- defined baseline workflow and evaluation metrics.

### Objective 2 — Resilient source and historical-state package

Extend Nocturnal's portable matter-history/snapshot work for restrictive environments:
- preserve source and archive references with explicit availability state;
- support offline/read-only inspection of exported matter bundles;
- preserve correction/supersession chronology across export/import;
- historical reconstruction without leaking later evidence;
- integrity manifests/hashes for portable bundles;
- clear evidence labels that do not turn source frequency into credibility scoring.

Deliverable: open-source resilient matter-bundle implementation and test corpus.

### Objective 3 — Self-hosted / low-dependency deployment

Provide a deployment profile that reduces dependence on one central hosted service or proprietary account.

Deliverables:
- reproducible self-hosted package;
- low-bandwidth/offline export workflow;
- administrator and analyst documentation;
- security/privacy configuration guidance.

### Objective 4 — Bounded field evaluation

Run a defined set of lawful public-source cases with the beneficiary group and compare Nocturnal against their current process.

Metrics:
- time to reconstruct current state;
- time to locate supporting source set;
- correction/supersession discovery;
- source-loss cases recovered through preserved references;
- repeated checking avoided;
- analyst errors/missed context;
- usability/deployment friction.

Publish both positive and negative findings without exposing sensitive case data.

## Real-world applicability gate

**This section must be replaced with actual evidence before submission.**

Required minimum:

- named type of practitioner or organization;
- restrictive information context / geography;
- one concrete workflow problem;
- explanation of how the workflow is handled today;
- why existing archives/search/spreadsheets are insufficient;
- evidence that the users actually want to test or use the proposed workflow.

A Taiwan-only generic fact-checking pilot may establish product utility but does not automatically establish OTF remit. If the first pilot partner works in Internet freedom or cross-border information-control research, document the exact restrictive-context relevance.

## Similar efforts / differentiation

Complementary systems include web archives, fact-checking databases, provenance frameworks, OSINT case-management tools, knowledge graphs and news/search indexes.

Nocturnal's proposed contribution is the combination of:
- one bounded matter as the portable unit;
- ordered public-source events;
- corrections, disputes and supersession as first-class links;
- current and historical documented-state projections;
- integrity-verifiable portable export;
- no browser-side truth/reputation score.

The project should interoperate with archives and provenance systems rather than replace them.

## Monitoring, evaluation and learning

For each pilot case, capture:

1. baseline workflow time and source set;
2. Nocturnal-assisted workflow time and source set;
3. missed/late-discovered corrections;
4. number of source-loss or version-change problems encountered;
5. analyst notes on false positives, confusing UI or missing context;
6. deployment and maintenance burden;
7. whether the portable bundle remained independently inspectable after export.

Share a public, sanitized evaluation report, reproducible non-sensitive fixtures, implementation documentation and a limitations section. Do not publish partner-confidential or risky case data.

## Sustainability

The project should remain free/open source and self-hostable. Long-term sustainability would come from a small interoperable core, documented portable formats, reusable fixtures, maintainers/users able to operate independent instances, and collaboration with the archival/provenance/internet-freedom ecosystem rather than dependence on one hosted service.

Future funding/adoption is not assumed. The proposal should explain the minimal maintenance path if no further grant is received.

## Why this applicant/team

The existing Nocturnal product already implements a longitudinal append-only ledger, public-safe matter histories, source-linked chronology, correction/dispute handling, historical `as_of` projections, portable snapshot manifests/hashes and a finished human-facing Now / Read / Research interface.

The relevant strength is not a claim of field adoption; it is that the technical object already exists and the proposed work can focus on restrictive-context resilience, user requirements, security/deployment and externally witnessed workflow evaluation rather than building a prototype from scratch.

Before submission, add concrete experience/relationship evidence for the beneficiary context. Do not imply at-risk-community expertise that is not established.

## Security / adversarial analysis

Threats to consider:

- source pages edited or deleted after collection;
- network blocking or intermittent access;
- hostile/incorrect source material entering the corpus;
- misleading repetition being mistaken for independent corroboration;
- identity ambiguity and same-name errors;
- public release of sensitive analyst notes or personal data;
- project misuse for punitive/private-person dossiers;
- operator account compromise;
- tampering with exported matter bundles.

Mitigations include source/manifest hashes, correction-preserving append-only history, public/private metadata separation, fail-closed review rules, explicit nonclaims, self-hosting, read-only public surface, and scope restrictions for high-risk personal data.

A full OTF proposal would need a partner-specific threat model and risk review.

## Accessibility / usability

Use a practitioner-led design process rather than assuming current UI success transfers to restrictive environments. Test low-bandwidth flows, keyboard/mobile use where relevant, source inspection, correction discovery and offline bundle reading. Document accessibility and language requirements with the concrete user group.

## Budget posture

Do **not** finalize a budget before the user/context gate is clear. OTF's own guidance says ideal projects often request USD 50k–200k for 6–12 months, but project size must follow actual activities and beneficiaries rather than target the range mechanically.

A plausible later budget could include:
- project-specific engineering;
- security/adversarial review;
- usability/accessibility work;
- local partner/evaluator time;
- documentation/translation;
- project-specific infrastructure;
- safe travel only if necessary.

## Claims allowed now

- OTF IFF is rolling and accepts individuals/organizations subject to eligibility rules.
- Nocturnal is a finished technical base that could be adapted to source disappearance/censorship workflows.
- The project has explicit correction/history/provenance and self-hosting properties relevant to resilient public information.

## Claims forbidden before the gate clears

- named repressive-environment beneficiaries without evidence;
- demonstrated usefulness to journalists/activists/human-rights defenders;
- field safety/effectiveness;
- anti-censorship or censorship-measurement capability beyond what is actually implemented;
- partner endorsement/adoption;
- political-impact claims.

## Human gate

Do not submit until the owner can truthfully fill:

1. beneficiary/user group;
2. restrictive context;
3. concrete workflow problem;
4. current alternative workflow;
5. evidence of demand or pilot willingness;
6. threat-model/user-safety context;
7. applicant experience/relationship to the affected community.
