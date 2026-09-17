# NLnet Restack — Nocturnal application draft

Status: **application draft ready / open-release + GenAI disclosure human gates remain**  
Current deadline: **3 November 2026, 12:00 CET**  
Official form: `https://nlnet.nl/propose/`  
Fund: Restack / Open Internet Stack

## Submission blockers before FIRE

1. **Open-release decision.** NLnet requires funded software/hardware/content and scientific outcomes to be released under recognised free/open licences. The owner must explicitly approve the public-release plan for the funded outputs before final submission.
2. **European dimension.** Applicants outside Europe are eligible, but Restack treats a clear European dimension as a knock-out criterion. The proposal below makes the technical European dimension explicit; adding an actual European collaborator/user would strengthen it but is not fabricated here.
3. **GenAI disclosure.** This proposal was prepared with ChatGPT/GPT-5.6 Sol assistance. NLnet requires disclosure plus a prompt-provenance log containing model, dates/times, prompts and unedited outputs. Do not submit without the required log/export.
4. Final privacy/accuracy attestations and final submit remain human gates.

---

## Thematic call

**Restack**

## Proposal name

**Nocturnal Open Matter Bundles — portable, correction-aware public memory for the open internet**

Alternative short title: **Nocturnal Open Memory**

## Website / wiki

Use the canonical public project/portfolio URL chosen by the owner. Do not link a private repository unless access is intentionally granted.

## Abstract / whole project and expected outcomes

I built Nocturnal to preserve how a documented matter changes over time instead of flattening search results into disconnected pages. It keeps source-linked events, identity state, corrections, disputes, later outcomes and the current documented state attached to one matter, and exposes that history through readable and research interfaces.

The proposed Restack project would turn the completed Nocturnal product into a portable open-internet building block rather than a single hosted application. The work would define an open matter-bundle interchange format, implement deterministic import/export and verification, add local-first/offline deployment and reproducible packaging, and document interoperability with open provenance standards. A user should be able to export a correction-aware matter history from one Nocturnal instance, verify it independently, move it to another implementation, and keep the source/correction chronology intact without depending on a proprietary platform or hosted account.

Expected outcomes are: (1) a published open specification and test corpus for portable matter histories; (2) a reference implementation for verified bundle import/export; (3) local-first/self-hosted packaging and reproducible deployment documentation; (4) interoperability tests and public examples; and (5) documentation for civil-society, research and public-interest users who need durable source provenance and correction history.

My contribution so far includes the Nocturnal engine/runtime, append-only longitudinal ledger, public-safe matter history, correction/dispute handling, historical `as_of` projections, portable snapshot manifests/hashes, and the current Now / Read / Research user surface. The funded work is deliberately a new interoperability and deployability tranche, not payment for already-completed interface work.

## Requested amount

**EUR 18,500**

Draft duration: **8 months**

This is intentionally below the EUR 50k first-proposal ceiling and sized as a focused interoperability/deployability project.

## Budget explanation

Draft budget; owner must confirm rate and commitment before submission.

- **Core engineering — 420 hours × EUR 35 = EUR 14,700.** Open matter-bundle schema, deterministic import/export, verification, merge/correction semantics, local-first packaging, interoperability implementation and tests.
- **Documentation and reproducibility — 70 hours × EUR 30 = EUR 2,100.** Specification, evaluator documentation, examples, installation/deployment and migration guides.
- **Testing/infrastructure — EUR 900.** Reproducible test environments, storage/bandwidth for public fixtures and compatibility testing; no routine hosting overhead.
- **Standards/community participation — EUR 800.** Directly relevant technical meetings, interoperability review or travel/registration if it materially improves standards alignment; unused allocation would remain unclaimed.

Total requested: **EUR 18,500**.

No up-front payment is assumed. Milestones are designed to support NLnet's milestone-based reimbursement model.

## Other funding sources

Nocturnal has been developed independently as a portfolio/research software project. No external Nocturnal grant, partner adoption or newsroom funding is claimed in this application.

If another grant is pending at submission time (for example TWNIC), disclose it explicitly and distinguish the scope. The Restack proposal is for open interoperability, portability and local-first deployment; it should not double-fund the same tasks.

## Main tasks / milestones

### M1 — Open Matter Bundle specification and conformance corpus — EUR 4,000

- define a stable portable bundle for matter metadata, ordered events, sources, corrections/disputes and historical state;
- map provenance fields to established open provenance concepts where technically appropriate;
- publish JSON/JSON-LD schemas and a versioned conformance corpus;
- document security/privacy boundaries and fields that must not become reputation scores.

Acceptance: public specification, schemas, fixtures and deterministic conformance tests.

### M2 — Verified import/export and correction-preserving merge — EUR 5,000

- reference exporter/importer;
- content hashes and manifest verification;
- deterministic rejection of malformed or chronology-breaking bundles;
- preserve correction/supersession references across transport;
- compatibility tests between clean-room fixtures and the canonical runtime.

Acceptance: two independent stores can export/import the same fixture and reproduce the same public-safe chronology and manifest checks.

### M3 — Local-first packaging and deployability — EUR 4,500

- self-hostable/local-first package for a small organization or researcher;
- offline/read-only bundle inspection;
- reproducible container/package documentation;
- migration/export path so users are not locked to a single hosted instance.

Acceptance: documented clean-machine install plus offline inspection of a signed/hashed matter bundle.

### M4 — Interoperability, usability and public documentation — EUR 5,000

- test the format against several public, low-risk longitudinal cases;
- interoperability examples and API documentation;
- usability pass for export/import, correction review and historical comparison;
- publish technical report, limitations and future extension points.

Acceptance: public documentation, reproducible example set and final compatibility report.

## Comparison with existing / historical efforts

Web archives preserve versions of pages; fact-checking systems publish individual assessments; provenance systems can describe where an artifact came from; knowledge graphs model entities and relations; news search indexes documents. These are complementary rather than interchangeable with Nocturnal.

The technical gap addressed here is a portable object for **the evolving documented state of one matter**: ordered source-linked events, corrections and supersession, current/historical projections, and verifiable transport between systems. The goal is not to create another crawler, universal truth score or proprietary newsroom database. The goal is to make correction-aware public memory movable and independently inspectable as an open technical primitive.

## Significant technical challenges

- defining merge rules that preserve chronology and corrections without silently rewriting history;
- deterministic verification across implementations and versions;
- separating public evidence/provenance from private review metadata;
- preserving historical `as_of` semantics when bundles are moved or combined;
- avoiding source-domain counts being misrepresented as independent corroboration;
- providing useful local-first packaging without creating a central identity or hosting dependency;
- designing an interchange format that remains small enough to implement outside Nocturnal.

## Ecosystem / engagement

The work is relevant to open-source public-interest technology, web archiving, provenance, fact-checking, research tooling and civil-society analysis. The project will publish specifications, fixtures and implementation guidance in the open, and will seek technical feedback from communities working on provenance, archival interoperability, open research infrastructure and internet-freedom tooling.

The European dimension is technical and deployment-oriented: Restack is intended to create an Open Internet Stack that European organizations can adopt without vendor lock-in. This project would make Nocturnal's correction-aware matter histories portable, self-hostable and standards-oriented so European civil-society, research and public-interest organizations can deploy or interoperate with the work without depending on a US platform account, proprietary API or the original developer's hosted service. The implementation will prioritize open standards, open licences, reproducible deployment and data portability. If a European technical collaborator or evaluator joins before submission, add them explicitly; do not imply one exists otherwise.

## Open-source / licence statement

**Human approval required before submission.**

Draft commitment:

> All software, schemas, documentation, conformance fixtures and scientific/technical outputs produced with Restack support will be published under recognised free/open licences. The owner will identify the exact repository/publication boundary before submission and will not claim an open release that has not been approved.

The current Nocturnal codebase carries AGPL-3.0 licensing in its engineering documentation, but repository visibility/public-release status must be checked and intentionally resolved before this application is fired.

## GenAI disclosure

Answer **Yes** to NLnet's GenAI-use question if this draft or material derived from it is submitted.

Suggested summary:

> I used OpenAI ChatGPT (GPT-5.6 Sol) to help research the current call, structure the application against the published form, and draft/compress candidate wording. I remain responsible for the technical content and will edit/verify all statements. A prompt provenance log with the required prompts and unedited outputs is attached/provided as required by NLnet's current policy.

### Required prompt-log action

NLnet's current policy requires model, dates/times, prompts and **unedited outputs**. Before submission, export or otherwise preserve the relevant ChatGPT conversation verbatim. Do not replace the required log with a summary only.

## Claims we may make

- Nocturnal is already a functioning, human-facing longitudinal public-memory product.
- The existing backend preserves source-linked chronology, correction/supersession history and historical state.
- The proposed work is new R&D focused on portability, interoperability and local-first deployment.
- The project will publish funded outputs openly if the owner approves the open-release plan before submission.

## Claims we must not make

- existing European partners/users unless one actually joins;
- newsroom/institutional adoption;
- external workflow improvement before a real pilot result;
- universal truth, credibility or reputation scoring;
- that the current private/public repository status already satisfies Restack without the open-release gate being resolved;
- that AI assistance was absent.

## Final human gates

- confirm requested amount/rate and time commitment;
- approve exact open-source/public-release boundary;
- select public project URL;
- review European-dimension answer;
- attach complete GenAI prompt log;
- review privacy statement and attestations;
- final Submit.
