# TWNIC Community Grants 2026 — Nocturnal host packet

Status: **host packet ready / legal-applicant commitment required**  
Deadline: **30 September 2026, 23:59 Taiwan time**  
Official portal: `https://twgrants.tw/`  
Maximum subsidy: **NTD 1,500,000**  
Draft category: **Internet Technology**

## Hard eligibility / administration gates

TWNIC requires a legally registered applicant: company, association, nonprofit, research institution or academic institution. An individual student cannot be the applicant by themselves.

Each organization may submit only **one** proposal. Before asking an organization to host Nocturnal, verify that the organization has not already reserved its 2026 TWNIC slot.

The final application requires organization-level facts and documents that cannot be invented or supplied by Gauntlet:

- official applicant organization name;
- responsible person and title;
- contact staff and title;
- official address/phone/email;
- printed application with organization/responsible-person seal/signature;
- guarantee and declaration with official seal;
- proof of organization;
- 2023–2025 financial statements (or permitted substitute if newly established);
- approved budget classifications;
- authorization to commit the organization to the project and any award shortfall.

## Candidate host families — not commitments

### 1. Open Culture Foundation (OCF)

Structurally aligned because OCF is a Taiwan nonprofit focused on open source, open data, open government, digital rights and internet freedom, and explicitly supports open-tech communities/fiscal administration. This does **not** imply OCF has agreed to host the project or that its one-proposal TWNIC slot is free.

### 2. Yuan Ze University / an eligible academic unit

An academic institution is an allowed applicant class. Institutional willingness, responsible-person authority, finance/admin process and the one-proposal slot must be checked. Do not imply university sponsorship before written/explicit approval.

The right host is whichever independently wants the project and can lawfully carry the administration; do not force a host merely to clear the grant gate.

---

# Draft project

## Project title — English

**Resilient Public Information Memory for Taiwan: Open, Correction-Aware Source Provenance Infrastructure**

## 計畫名稱 — 中文

**臺灣韌性公共資訊記憶：開放、可追溯更正之來源與版本基礎設施**

## Category

**Internet Technology**

Rationale: the project is an open technical system for resilient public-web information provenance, version/change tracking, correction visibility, portable public memory and self-hosted research access. It should not be submitted as a political-use project.

## Compliance / fit statement

Taiwan's public web contains important information that changes over time: agencies revise notices, organizations correct statements, service incidents close, guidance is superseded, and source pages may move or disappear. Ordinary web search is good at finding pages but does not preserve a machine-readable history of how one documented matter changed or which later record superseded an earlier one.

This project will develop and evaluate an open, self-hostable public-information memory layer for Taiwan. It will preserve source-linked chronology, corrections/supersession, current documented state and historical views while keeping public-facing interpretation separate from truth, guilt or reputation scoring. The implementation is intended to improve the resilience and reusability of public web information, not to build private-person dossiers or political campaign tooling.

The project aligns with TWNIC's Internet Technology theme by developing practical Internet infrastructure for durable public-source provenance and resilient access, with public implementation details and project outcomes.

## Goals

1. Publish a stable open-source Nocturnal Taiwan deployment profile and public technical documentation.
2. Implement portable, verifiable matter-history bundles for source-linked public information, including correction/supersession references.
3. Add resilient source-preservation/retrieval workflows for public web material while keeping rights and privacy boundaries explicit.
4. Run bounded usability/workflow evaluations with public-interest researchers, fact-checkers, civic-tech or academic users using non-sensitive public-source cases.
5. Publish reproducible evaluation results, limitations and deployment guidance for other Taiwan organizations.

## Target groups

- Taiwanese civil-society and open-technology organizations;
- fact-checking and public-interest research teams;
- university researchers/students working with evolving public-source records;
- journalists and data researchers who need correction/version history;
- public-interest technologists who need a self-hosted, reusable provenance layer.

This is not a consumer surveillance service and should not target private individuals for profiling.

## Project outline

### Work package 1 — Taiwan deployment and open packaging

- clean self-hosted deployment path;
- Traditional Chinese operator/evaluator documentation;
- open configuration for public-safe read-only access;
- reproducible sample dataset using low-risk public/official sources.

### Work package 2 — resilient matter bundles and provenance

- portable event/source/correction bundle format;
- deterministic import/export and verification;
- preserve supersession/correction links and historical `as_of` state;
- public documentation of data model and nonclaims.

### Work package 3 — public-source resilience

- archived/reference state handling for source disappearance or revision;
- rights-aware media/document reference handling;
- explicit distinction between source recurrence and independent corroboration;
- source integrity/manifest reporting.

### Work package 4 — bounded external workflow evaluation

Run several small public-source cases with willing external or academic evaluators. Prefer non-sensitive cases such as public-health guidance changes, environmental/public-safety notices, infrastructure/service incidents, product/consumer advisories, or other correction-rich public records.

Measure:

- time to reconstruct current state;
- time to recover supporting sources;
- correction/supersession discovery;
- repeated checking avoided;
- analyst error/missed-context notes;
- usability and deployment friction.

Negative findings remain reportable.

### Work package 5 — public release and knowledge transfer

- publish code/documentation/technical report;
- publish non-sensitive example datasets and evaluation methodology;
- public demonstration/workshop for Taiwan open-tech/research users;
- final report including limitations and follow-on recommendations.

## Expected benefits

### Technical

- a reusable open component for tracking evolving public information rather than only indexing documents;
- portable source/correction history that can survive platform or hosting changes;
- self-hosting and data portability for organizations that cannot depend on one vendor account;
- explicit historical state reconstruction useful for audit/research.

### Taiwan Internet ecosystem

- better resilience of public web knowledge under edits, broken links and source disappearance;
- reusable open technical infrastructure rather than a one-off website;
- public documentation and fixtures that Taiwan organizations can evaluate or extend;
- practical evidence about whether longitudinal source memory reduces repeated checking or missed corrections.

## Explicit nonclaims

- no truth, guilt, reputation or person-risk score;
- no claim that co-appearance proves relationship;
- no claim that source frequency proves credibility or independence;
- no private-person surveillance/punitive dossier use as a project goal;
- no claim of partner adoption until a partner actually agrees;
- no political campaign purpose.

---

# Draft execution schedule

Suggested execution period: **January–October 2027**. Host may adjust dates while preserving the October 31, 2027 completion deadline.

| Period | Deliverable |
| --- | --- |
| Jan–Feb 2027 | host/project setup; deployment profile; Traditional Chinese documentation baseline; reproducible fixture |
| Mar–Apr | portable matter-bundle schema; import/export verification; correction/supersession integrity tests |
| May–Jun | source-resilience/archive-reference work; packaging; rights/privacy review; security/reproducibility checks |
| Jul–Aug | bounded external/academic workflow evaluations; collect quantitative and qualitative results |
| Sep | public documentation, examples, deployment guide, workshop/demo material |
| Oct | final technical report, open release, outcomes publication and TWNIC final deliverable preparation |

Mid-term report target: around May/June 2027, subject to contract.

---

# Draft budget framework

**Planning draft only. The legal applicant's finance/admin office must map every line to allowable TWNIC expense categories before submission.**

Suggested project total / requested subsidy: **NTD 1,200,000**.

This avoids assuming an unapproved host co-funding commitment. TWNIC may award less than requested without allowing scope reduction, so the host must explicitly accept the risk of covering any approved-project shortfall before final submission.

| Work item | Draft amount (NTD) | Notes |
| --- | ---: | --- |
| Project-specific software engineering / technical services | 420,000 | specific deliverables, not routine organization salary/overhead |
| Independent security/reproducibility/accessibility evaluation | 180,000 | external or separately scoped technical review |
| Public-source preservation/data processing/archive services | 140,000 | project-specific source resilience/testing |
| Evaluator/pilot execution and research operations | 120,000 | bounded evaluation, transcription/analysis/logistics as allowed |
| Documentation, Traditional Chinese/English translation and public release packaging | 110,000 | technical docs and public deliverables |
| Test infrastructure / temporary project-specific compute-storage | 90,000 | not routine organization Internet/firewall overhead |
| Public technical workshop/demo and dissemination | 80,000 | project-specific, not generic social-media marketing |
| Hardware/software equipment required for compatibility testing | 60,000 | 5% of request, below TWNIC 15% equipment cap |
| **Total** | **1,200,000** | host finance review required |

Do not submit these classifications unchanged if the host/TWNIC template uses different eligible-accounting definitions.

---

# Host outreach memo

## Short version

I have completed Nocturnal, an open longitudinal public-information system that keeps source-linked updates, corrections and later outcomes attached to the same matter instead of treating each page as an isolated result. TWNIC Community Grants 2026 is open until September 30 and allows legally registered nonprofits, associations and academic/research institutions to apply for up to NT$1.5M.

I would like to ask whether [HOST] would consider being the legal applicant for a bounded Internet Technology proposal: an open, self-hostable Taiwan deployment of Nocturnal focused on resilient public-web provenance, correction/version history and external workflow evaluation. The project would publish implementation details and outcomes, avoid political/punitive-person use, and use non-sensitive public-source cases for evaluation.

The main immediate question is administrative: TWNIC allows only one proposal per organization, so I first need to know whether [HOST]'s 2026 slot is available and whether the project is within your mission/admin capacity. If so, I already have a full technical/evaluation draft and can adapt it to your finance/signature requirements.

## What the host would need to provide/approve

- agreement to act as applicant and contracting organization;
- confirmation its single 2026 TWNIC proposal slot is available;
- responsible person/contact staff;
- organization seal/signatures;
- proof of organization and required financial statements;
- finance review of budget classifications;
- project governance and award-shortfall decision;
- final submission authorization.

## What is already prepared

- completed product and evaluator guide;
- technical project description;
- goals/target groups/expected benefits;
- 10-month schedule draft;
- budget framework;
- public/non-sensitive evaluation protocol;
- explicit safety/nonclaim boundaries.

---

# Portal/document checklist

Required by TWNIC public instructions:

- online application form;
- signed/sealed application PDF;
- guarantee: no commercial use of project outcomes within one year;
- declaration of other grant applications/funding status;
- project proposal PDF;
- budget form;
- task and schedule form;
- proof of organization;
- 2023, 2024, 2025 financial statements or allowed substitute;
- accurate organization/contact/responsible-person information.

If NLnet or another grant remains pending at TWNIC submission time, disclose it truthfully in the TWNIC declaration and distinguish scopes.

## Human gate

Do not open a TWNIC application under a host's name until the host explicitly authorizes it. Do not invent responsible-person details, seals, financial statements, project-slot availability or cost-sharing commitments.
