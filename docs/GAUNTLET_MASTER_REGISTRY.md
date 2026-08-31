# Portfolio-wide Gauntlet Master Registry

Snapshot: **2026-09-01**

This is the canonical portfolio-submission and conversion inventory layer.

It exists because the portfolio accumulated opportunity state in several places over time: the long-tail board, post-graduation board, project-specific research threads, the recovered Calendar Gauntlet, grant/sponsorship handoffs, faculty-pull discovery, browser-execution manifests, and now a dedicated deep-research pass over the hidden research-labor/fellowship market. No single older file was lossless.

The master registry is therefore **federated and generated**, not manually duplicated.

## Canonical union

Run:

```bash
npm run gauntlet:master
```

This deterministically generates:

- `docs/gauntlet-master.csv`
- `docs/gauntlet-master.json`

from:

1. `docs/longtail/longtail-campaigns.csv` — semester conversion, grants, competitions, bounties, credits, pilots, procurement and manufactured outbound;
2. `docs/postgrad/postgrad-market.csv` — jobs and PhDs;
3. `data/faculty-pull-routes.json` — verified professor/lab recruiting routes where funding may still be unknown;
4. `data/gauntlet-master-supplement.json` — restored cross-thread/project routes plus explicit semantic overrides;
5. `data/deep-opportunity-radar-2026-09-01.json` — source-verified research-labor, predoc, fellowship, residency and funded-visiting routes plus evidence-backed corrections to stale older rows.

The source boards remain useful specialized views. The generated master is the portfolio-wide view Codex/Blowback should consume when deciding what exists.

## Why this is not one hand-maintained giant CSV

A giant copied CSV would immediately drift again. The master build preserves specialized source boards and overlays recovered/current state by stable `id`.

Current rows are never silently rewritten. When a gate audit or later deep-research pass changes a live source row, an explicit `override` carries the reason.

Recovered/current routes carry `source_state` such as:

- `VERIFIED_*`
- `OFFICIAL_*_VERIFIED_*`
- `RECOVERED_REVERIFY`
- `FOUND_IN_PRIOR_DEEP_RESEARCH_REVERIFY_LIVE`
- `RECURRING_SOURCE_*_WATCH_*`
- `HISTORICAL_POOL_REVERIFY`

so old continuity evidence cannot masquerade as a current live call.

## Core search doctrine

The Gauntlet is not merely a calendar of named competitions.

The governing discovery question is:

> **Who is currently paying, funding, hosting, credentialing, deploying or employing something that an existing portfolio asset already demonstrates?**

Search therefore includes, as first-class route classes:

- competition / prize;
- grant / microgrant / reimbursement;
- bounty / paid OSS task;
- compute/API credit;
- paid pilot / procurement;
- sidecar fellowship;
- research fellowship;
- research residency;
- lab staff / RA / student RA;
- research engineer / project researcher / research officer;
- predoc / research professional / technical associate;
- funded visiting research;
- faculty-pull / open lab recruitment;
- ordinary employment;
- salaried PhD.

The title is not the transaction. A professor's `Join Us` page, a `Research Assistant II`, a `Technical Associate`, a `Resident`, and a conventional company `Research Engineer` can all represent the same underlying conversion event: an institution has budget and needs capabilities already evidenced by the portfolio.

## Economic classification

The deep-opportunity radar deliberately avoids flattening all fellowships or lab roles into a prestige bucket.

### Boring recurring money

Examples: Taiwan PT/FT RAs, student assistantships, bounded paid research tasks, reimbursements.

Optimize for:

- cash certainty;
- cash/hour;
- low application effort;
- professor/institutional validation;
- publication/reference upside;
- compatibility with existing study/work constraints.

### Sidecar cash

Examples: low-hours paid fellowships, microgrants, small policy/research programs.

Apply aggressively when the thesis is genuine and the packet is highly reusable.

### Career-scale funded research

Examples: OTF ICRP, MATS, ERA, Astra, LASR, Anthropic Fellows.

These are **not side income**. Acceptance must be compared against jobs, PhDs, own-project runway, location, visa, IP and outside-work freedom.

### Research labor / predoc

Examples: Academia Sinica, HKU, MIT FutureTech, UChicago BFI, Oxford, ETH, A*STAR, AIST.

Optimize for salary **plus** research output, PI/reference quality, institutional network, publication path and future job/PhD repricing.

## Rolling-state semantics

Never manufacture a deadline for a rolling lab or recurring annual program.

Use:

- `ROLLING` for a currently live persistent rail;
- `CYCLE_NOT_YET_VERIFIED` for a recurring source whose next call has not opened;
- `CALL_NOT_YET_VERIFIED` where a program appears current but the active call/deadline is not source-clean;
- a real ISO date only where the current official source supports it.

Closed annual programs remain `WATCH`; they do not disappear and they do not receive invented next-year dates.

## Strategic state versus execution state

These are independent.

Example:

```text
GAF 2026
strategic status: FIRE_NOW
execution state: PORTAL_RECON_REQUIRED
```

That means the portfolio decision is already made, while the browser route still needs live mapping.

The same applies to the new research-labor lane:

```text
HKU AI Engineer
strategic status: FIRE_AFTER_GATE
execution state: APPLICATION_READY
```

The technical fit can be strong while visa/degree/salary/IP gates remain unresolved.

Execution states are not inferred from FIRE/HOLD/KILL labels.

## Research-family ancestry

### Policy Lab family

```text
Policy Lab / solarpunk-coin
├── Policy Lab       executable research/software/public artifact
├── CL-ECI           bounded financial-claim academic mechanism
├── CL               general assurance / authorization architecture
├── ECI              energy / sustainable-finance contribution
└── historical SPK   substrate / provenance / base research
```

Use `shared_evidence_family=policy-lab-family` to reuse evidence without counting the same accomplishment repeatedly.

External verdicts do **not** automatically propagate between views.

### Manuscript exclusivity

`FC'27 → CL-ECI` is the primary manuscript lane.

`FTSID → CL-ECI` is a fallback under the same:

```text
mutual_exclusion_group=cl-eci-manuscript-2026
```

`Shih Hsin → Invisible Ledger` is deliberately outside that group.

## Deep-research routes added 2026-09-01

### Taiwan research labor

First-class master rows now include:

- Academia Sinica IIS / Lun-Wei Ku — LLM, RAG, AI safety, fake news/news literacy; FT/PT;
- Academia Sinica CITI / AIIU — CV, 3D/digital twins, Embodied AI, VLA/VLN, AI safety; FT and student/PT salary rails;
- Academia Sinica IIS / Der-Nian Yang — LLM/data mining/social networks/big-data systems;
- Academia Sinica IIS / Ti-Rong Wu — RL/search/planning/LLMs/intelligent agents.

These are deliberately represented as paid research-labor candidates, not generic professor networking.

### Asia research engineering

Added:

- HKU AI Engineer / RA II — explicit MCP, agent tool calls, Vercel AI SDK, Python/TypeScript;
- HKU AI Agents for Architecture & Construction — FT/PT RA/student RA route;
- AIST Embodied AI Research Team / RA mechanism;
- A*STAR Robotics & Autonomous Systems / Embodied AI Data Engine;
- AI Singapore AIAP next-cycle watch;
- OIST funded research internship.

### Predoc / research-professional market

Added:

- MIT FutureTech Technical Associate / Predoctoral RA;
- UChicago BFI Development Innovation Lab Research Professional;
- UChicago BFI Health Initiative Research Professional;
- Stanford SIEPR next-cycle watch.

Predoc is treated as a labor market and research-career route, not as an academic footnote.

### Fellowship / residency market

Added or upgraded:

- OTF Information Controls Research Program — live Nocturnal route, subject to critical surveillance-technology exclusion audit;
- FAS AI Safety Policy Entrepreneurship Fellowship — workload/economics refreshed;
- ERA:AI Winter 2027;
- MATS Winter 2027;
- MATS Residency;
- Astra Fellowship;
- LASR Labs;
- Tech Policy Press 2027;
- Anthropic Fellows Program — hard work-authorization gate;
- SSI 2027 — asset mapping broadened toward Citation Engine/Research Drive/Refinery/Commons;
- APNIC research-fellowship next-cycle watch;
- Asia House next-cycle watch.

## Applied deep-radar corrections

The 2026-09-01 overlay changes old rows only where the later evidence is stronger:

- **Wanrun Graduate Research 2026 → `KILL`**: strong technical fit but hard adviser-signature gate; do not manufacture an adviser relationship or panic-submit;
- **OTF / Nocturnal → live ICRP `FIRE_AFTER_GATE`**: replaces stale generic OTF watch; first gate is literal surveillance-technology exclusion review;
- **FAS → `FIRE_IF_FIT / APPLICATION_READY`** with verified workload/economics;
- **SSI → broader research-software asset family**, with £4k explicitly treated as restricted activity budget rather than salary;
- **TAAI / Hardware Splicer → `FIRE` Sep 14**, preserving demonstrated-software versus pending-physical-validation boundary and not importing Wanrun's adviser blocker into a different route.

## Restored high-value routes

### Policy Lab / CL-ECI / IL

Retained in the master layer:

- Global AI Finance 2026 WIP poster;
- Financial Cryptography 2027 — CL-ECI primary manuscript;
- GRASFI-Asia 2027;
- NLnet Restack;
- SSI Fellowship 2027;
- Digital Public Goods Registry;
- JOSS external-impact-gated route;
- FTSID — CL-ECI fallback only;
- Shih Hsin Finance — Invisible Ledger;
- Tax Academy of Singapore research grant;
- Chunghwa Telecom Smart Innovation;
- NTUB FinTech competition;
- WU Tax Law Technology Conference;
- Global Tax Symposium;
- PBFEAM / NYCU finance conference watch;
- Policy Lab → InnoServe Information Application and International English.

### Nocturnal

Retained/upgraded:

- TWNIC Community Grants 2026;
- Pulitzer Center;
- Fund for Investigative Journalism;
- OTF — now upgraded to the live ICRP route;
- Digital Public Goods route;
- NLnet Restack watch.

### Refinery / Commons

Retained:

- MSR 2027 Technical;
- MSR Data & Tool Showcase;
- SANER Research / Tool Demo;
- SANER Agentic AI4SE only if agent behavior is genuinely empirical object;
- iFS 2027 reserve;
- ICSE SEIS alternative;
- NLnet CodeSupply / Launch-to-Artifact Provenance Graph.

### Hardware Splicer

Retained/updated:

- TAIA AI Creative Design;
- TAAI 2026 — now explicit immediate FIRE academic route;
- InnoServe Industrial AI Innovation;
- TAS route watch;
- DATE 2027 LBR;
- III/APICTA-related route;
- YZU Semiconductor AI Agent home-field route;
- Wanrun retained as negative evidence with `KILL`, not deleted.

### Field / network channels

Non-submission conversion channels remain valid with:

```text
route_class=FIELD
execution_state=NOT_APPLICABLE
```

These should create leads, pilots, evaluators or evidence. They must never be sent to the browser submission operator as if they were forms.

## Required fields for every master record

The generated master normalizes records into:

```text
id
lane
organization
opportunity
route_class
assets
contribution_view
status
execution_state
deadline
gate
shared_evidence_family
mutual_exclusion_group
parent_route
source_state
source
origin
```

Not every source can populate every field immediately. Blank/UNKNOWN is preferable to fabricated precision.

The deep radar stores compensation/workload/visa/IP detail inside `gate` and `source_state` because the current v1 master schema intentionally remains stable. A future schema revision can promote these into dedicated typed columns after downstream consumers are migrated.

## Operating rule for Codex / Blowback

The intended control flow is:

```text
master registry
  ↓
select strategic candidate
  ↓
rehydrate current source / deadline / eligibility / economics
  ↓
apply gate audit + family/exclusivity rules
  ↓
READY / HOLD / KILL
  ↓
packet + browser execution state
  ↓
Blowback/Codex prepare to human gate
  ↓
final submit remains human-controlled
  ↓
receipt / outcome feeds back into Gauntlet
```

Additional research-labor rule:

```text
unknown salary/funding → ask/verify before large packet
unknown eligibility/work authorization → resolve binary gate first
unknown IP/outside-work → cheap application may proceed; acceptance may not
rolling source → refresh, never fabricate deadline
```

A recovered route may become `FIRE` only after its current live state is verified. A historical route may become `EXPIRED` or `KILL` without being deleted; retaining the negative state is part of the evidence trail.
