# NLnet Restack — Nocturnal application workbook

Status: **STRUCTURE / FACT PACK ONLY — DO NOT SUBMIT OR PASTE AS-IS**  
Current deadline: **3 November 2026, 12:00 CET**  
Official form: `https://nlnet.nl/propose/`  
Fund: **Restack / Open Internet Stack**

## Why this is not final submission copy

NLnet's current proposal form asks applicants to answer in English **in their own words** and states that NLnet is not interested in AI-generated projects or proposals. The form does permit AI assistance, but it requires disclosure and asks for the prompts/interactions and AI output. NLnet's current GenAI policy likewise requires disclosure when GenAI is used in preparing an application.

This workbook was prepared with OpenAI ChatGPT / GPT-5.6 Sol assistance. It therefore exists to organize facts, scope, budget, milestones and evidence so the applicant can write the actual form answers personally. **Do not copy this workbook into the form as if it were applicant-written final prose.**

Before submission:

1. run the cross-portfolio NLnet first-grant bakeoff;
2. if Nocturnal wins the slot, approve the exact open-release plan for funded outputs;
3. personally rewrite every substantive form answer in the applicant's own words;
4. preserve and provide the required AI disclosure/log material for the assistance used here;
5. re-check the latest NLnet GenAI policy immediately before submission, because NLnet has announced a forthcoming revision;
6. review privacy/accuracy attestations and perform final Submit as a human gate.

---

## Candidate project identity

### Theme

Restack

### Working project name

**Nocturnal Open Matter Bundles**

Possible subtitle for the applicant to rewrite if useful: portable, correction-aware public memory for the open internet.

### Existing project

Nocturnal is a completed longitudinal public-memory product. Its current canonical surface is:

- **Now** — continuous readable journalism;
- **Read** — matter history with `What changed?`, chronology, evidence, corrections/disputes and historical `as_of` views;
- **Research** — read-only Timeline, Before/After comparison, Subjects, Sources and Evidence inspection.

Canonical product integration: `12ece15ec6042dec786ef50006db2f92251a7840`  
Portfolio freeze status: `ceb0551e0c148476c51b40b8ffef1713f33efd55`

The grant must fund a **new Restack tranche**, not retroactively fund completed UI/product work.

---

## Proposed new funded work — factual outline for applicant rewrite

### Core problem

Web archives preserve versions of pages; search engines index documents; fact-checking systems assess bounded claims; provenance standards describe origin. A missing interoperable primitive is the **portable evolving state of one matter**: ordered source-linked events, corrections/supersession, current and historical projections, and deterministic verification when the object moves between systems.

### Proposed outcome

Turn Nocturnal's completed internal matter-history model into a small open-internet interoperability/deployability layer:

1. open Matter Bundle specification and conformance corpus;
2. deterministic import/export and verification;
3. correction/supersession-preserving merge semantics;
4. local-first/offline inspection and self-hostable packaging;
5. interoperability examples and public technical documentation.

### User outcome

A researcher, civil-society organization or public-interest technologist should be able to export a correction-aware matter history, verify it independently, move it to another implementation, and preserve the source/correction chronology without depending on a proprietary platform or the original developer's hosted account.

### Explicit non-goals

- not a crawler replacement;
- not a universal truth or credibility score;
- not a reputation/person-risk system;
- not a proprietary newsroom database;
- not a claim that source frequency equals independent corroboration.

---

## Draft amount and duration — applicant must confirm

**Draft request:** EUR 18,500  
**Draft duration:** 8 months

This remains below NLnet's EUR 50k first-proposal ceiling. It is a planning number, not an applicant commitment until personally confirmed.

### Draft budget basis

- Core engineering: **420 h × EUR 35 = EUR 14,700**
- Documentation/reproducibility: **70 h × EUR 30 = EUR 2,100**
- Project-specific test infrastructure: **EUR 900**
- Standards/community/interoperability participation: **EUR 800**
- **Total: EUR 18,500**

Applicant must verify rate, workload, tax/contract implications and realistic availability before using these numbers.

---

## Milestone workbook

### M1 — Open Matter Bundle specification + conformance corpus — draft EUR 4,000

Facts to express in applicant's own words:

- versioned JSON / JSON-LD-compatible schemas where appropriate;
- ordered events, sources, corrections/disputes and historical state;
- map to established open provenance concepts when technically useful;
- public conformance fixtures;
- security/privacy and anti-reputation-score boundaries.

Acceptance idea: public specification, schemas, fixtures and deterministic conformance tests.

### M2 — Verified import/export + correction-preserving merge — draft EUR 5,000

- reference exporter/importer;
- content hashes / manifests;
- deterministic rejection of malformed or chronology-breaking bundles;
- preserve correction/supersession references across transport;
- compatibility tests against canonical runtime and clean fixtures.

Acceptance idea: two independent stores reproduce the same public-safe chronology and manifest checks.

### M3 — Local-first/self-hostable packaging — draft EUR 4,500

- documented small-organization / researcher deployment;
- offline read-only bundle inspection;
- reproducible package/container path;
- migration/export path that avoids hosted-service lock-in.

Acceptance idea: clean-machine install and offline inspection of an integrity-verifiable matter bundle.

### M4 — Interoperability/usability/public documentation — draft EUR 5,000

- several low-risk longitudinal public cases;
- interoperability examples and API docs;
- usability pass for export/import/correction review/historical comparison;
- public compatibility/limitations report.

---

## Technical challenges to cover in the applicant's own words

- merge semantics that preserve chronology instead of rewriting history;
- correction/supersession integrity across imports;
- deterministic verification across versions/implementations;
- historical `as_of` semantics after transport/merge;
- separation of public evidence from private review metadata;
- avoiding domain/source counts becoming fake corroboration scores;
- local-first packaging without a central identity/hosting dependency;
- keeping the format implementable outside Nocturnal.

---

## Ecosystem / European-dimension workbook

No European collaborator or user is currently claimed.

Factual technical case the applicant may develop in their own words:

- Restack aims to build an operational open internet stack without vendor lock-in;
- Nocturnal's proposed tranche is about open standards, portability, self-hosting and interoperable correction-aware public memory;
- European civil-society, research and public-interest organizations should be able to deploy/implement the format without a proprietary US platform account or the original developer's hosted service;
- funded software/specifications/fixtures/documentation would be openly licensed if the owner approves the release plan.

A real European technical collaborator/evaluator would strengthen the application but must never be implied before one exists.

---

## Open-source / FLOS commitment gate

NLnet's current rules require funded software/hardware/content to be released under recognised open licences and scientific outcomes as open access.

The existing Nocturnal engineering documentation carries AGPL-3.0 licensing, but repository visibility and the exact release boundary must be intentionally confirmed before the proposal is fired.

Human decision required:

- what becomes public;
- exact licence(s) for software/specification/docs/fixtures;
- whether existing private history is exposed or only funded outputs/new public repo are published;
- how dependencies and AI-assisted contributions satisfy licence/provenance requirements.

Do not answer the form's open-release commitments until this decision is made.

---

## GenAI disclosure / provenance gate

Answer **Yes** if this workbook materially informs the submitted proposal.

Facts to disclose truthfully:

- model: OpenAI ChatGPT / GPT-5.6 Sol;
- use: current-call research, application structure, scope/budget/milestone brainstorming and draft candidate wording;
- human remains responsible for correctness and final personally written answers.

NLnet's current form requests the prompts/interactions and AI output in the form field or as an uploaded file. Preserve the relevant conversation/logs. Do not replace the required evidence with a short summary if the current form/policy asks for the underlying interactions.

NLnet has announced that its GenAI policy is being revised; **reverify the latest policy on the day the final application is prepared.**

---

## Other funding disclosure

Current safe statement for applicant rewrite:

- No external Nocturnal grant, newsroom adoption or partner funding is claimed.
- If TWNIC or another application is pending at submission time, disclose it truthfully and distinguish scopes so the same tasks are not double-funded.

---

## Evidence available to the applicant

- finished Now / Read / Research product on Nocturnal main;
- hardened backend authority with prior canonical green CI before merge;
- deterministic official-source Artemis II longitudinal specimen;
- fictional safety/correction fixture;
- synthetic morphology regression gallery;
- evaluator guide and product-freeze contract;
- external validation remains intentionally unclaimed.

---

## Final pre-FIRE checklist

- [ ] Nocturnal wins the cross-portfolio NLnet bakeoff.
- [ ] Applicant confirms EUR amount, rate and 8-month time commitment.
- [ ] Applicant approves exact FLOS/public-release boundary.
- [ ] Applicant selects a public project URL or creates an intentional public project page/repo.
- [ ] Applicant personally rewrites all substantive form answers in own words.
- [ ] European dimension is credible and not merely rhetorical; any collaborator/user named is real.
- [ ] Current NLnet GenAI policy is reverified.
- [ ] Prompt/interactions/output log is preserved and attached/pasted as required.
- [ ] Other pending funding is disclosed and scopes do not double-fund.
- [ ] Privacy/accuracy/terms reviewed by applicant.
- [ ] Final Submit performed by applicant.
