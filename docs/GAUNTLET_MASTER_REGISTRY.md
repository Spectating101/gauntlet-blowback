# Portfolio-wide Gauntlet Master Registry

Snapshot: **2026-08-26**

This is the canonical portfolio-submission inventory layer.

It exists because the portfolio accumulated opportunity state in several places over time: the long-tail board, post-graduation board, project-specific research threads, the recovered Calendar Gauntlet, grant/sponsorship handoffs, and browser-execution manifests. No single older file was lossless.

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
3. `data/gauntlet-master-supplement.json` — restored cross-thread/project routes plus explicit semantic overrides.

The source boards remain useful specialized views. The generated master is the portfolio-wide view Codex/Blowback should consume when deciding what exists.

## Why this is not one hand-maintained giant CSV

A giant copied CSV would immediately drift again. The master build preserves the specialized source boards and overlays recovered state by stable `id`.

Current rows are never silently rewritten. When the gate audit changes a live source row, the supplement contains an explicit `override` with a reason.

Recovered routes carry `source_state` such as:

- `VERIFIED_*`
- `RECOVERED_REVERIFY`
- `FOUND_IN_PRIOR_DEEP_RESEARCH_REVERIFY_LIVE`
- `HISTORICAL_POOL_REVERIFY`

so old continuity evidence cannot masquerade as a current live call.

## Strategic state versus execution state

These are independent.

Example:

```text
GAF 2026
strategic status: FIRE_NOW
execution state: PORTAL_RECON_REQUIRED
```

That means the portfolio decision is already made, while the browser route still needs live mapping.

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

This resolves the earlier accidental FTSID/IL ownership collision while also freeing Shih Hsin to become the cheap local finance route for IL.

## Restored high-value routes

### Policy Lab / CL-ECI / IL

Restored into the master layer:

- Global AI Finance 2026 WIP poster — `FIRE_NOW`;
- Financial Cryptography 2027 — CL-ECI primary manuscript;
- GRASFI-Asia 2027 — ECI manuscript gate;
- NLnet Restack — call-gated;
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
- Policy Lab → InnoServe Information Application (IP);
- Policy Lab → InnoServe International Exchange English (IC).

The InnoServe Policy Lab routes preserve the existing prepared system-overview/video work. Their principal unresolved blocker is adviser/team administration rather than missing product architecture.

### Nocturnal

Restored:

- TWNIC Community Grants 2026 — `PRIMARY_FIRE`;
- Pulitzer Center — partner/use-case gated;
- Fund for Investigative Journalism — partner/cycle gated;
- Open Technology Fund — use-case/live-call gated;
- Digital Public Goods route;
- NLnet Restack watch.

TWNIC was historically one of Nocturnal's strongest formal conversion routes and should not disappear merely because a later long-tail CSV reconstruction omitted it.

### Refinery / Commons

Restored:

- MSR 2027 Technical — `DEFAULT_PRIMARY_FIRE`;
- MSR Data & Tool Showcase;
- SANER 2027 Research — conditional;
- SANER Tool Demo;
- SANER Agentic AI4SE — HOLD/KILL unless agent behavior is genuinely the empirical object;
- iFS 2027 reserve;
- ICSE SEIS alternative;
- NLnet CodeSupply / Launch-to-Artifact Provenance Graph.

The frozen empirical research object remains separate from later Commons/product work.

### Hardware Splicer

Restored/retained:

- TAIA AI Creative Design;
- TAAI 2026;
- InnoServe Industrial AI Innovation;
- TAS route watch;
- DATE 2027 LBR;
- III/APICTA-related route;
- YZU Semiconductor AI Agent home-field route.

Wanrun and the broad InnoServe/NCUE rows already remain in the current long-tail board, so they are imported rather than duplicated.

### Tax / finance continuity pool

Preserved as `REVERIFY` or historical continuity where current live mechanics are not strong enough to FIRE:

- DADH;
- Taiwan Economic Association;
- IBFD;
- ATTA;
- National Tax Association;
- ITPF Research Grant;
- ACM FAccT;
- FINEC / tax-finance association family.

The point is not to revive every old venue. The point is to retain why a route existed and require a live re-verification before it consumes work.

### Career routes recovered from older deep-research threads

Added as `REHYDRATE` / permanent-source candidates rather than pretending old vacancy state is current:

- TU Delft Decentralized and Trustworthy AI Pipelines;
- AI-assisted Integrated Circuit Reverse Engineering route;
- NTNU Human-Centered Interactive AI Agents for Maritime Simulator Training;
- NMBU causal-ML vacancy family;
- Dutch Research Software Engineer / Scientific Engineer market via AcademicTransfer.

The existing postgrad board remains authoritative for its current named roles; these rows exist so a useful prior discovery is not silently forgotten.

### Field / network channels

The master can also retain non-submission conversion channels with:

```text
route_class=FIELD
execution_state=NOT_APPLICABLE
```

Current restored examples include Taiwan Innotech Expo, Energy Taiwan / Net-Zero Taiwan, TAITRONICS/AIoT/Taiwan Industry Week, FinTech Taipei and Meet Taipei.

These should create leads, pilots, evaluators or evidence. They must never be sent to the browser submission operator as if they were forms.

## Applied gate-audit corrections

The master overlay currently corrects several stale source rows without erasing their history:

- Freeway Bridge Deterioration: `FIRE` → `VERIFY`;
- InnoServe PET: → `HOLD` pending actual PET + privacy/utility evidence;
- InnoServe Open Source AI Model: → `HOLD` pending actual open-model application scope;
- ProjectDiscovery: issue-level `SELECTIVE_SELL` rather than automatic product fit;
- Gogolook Credit Risk: → `VERIFY` for production credit-risk experience;
- Qualcomm AI/ML and CV: → `WATCH` unless a live requisition clears degree/seniority/embedded-depth filters.

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

## Operating rule for Codex / Blowback

The intended control flow is:

```text
master registry
  ↓
select strategic candidate
  ↓
rehydrate current source / deadline / eligibility
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

A recovered route may become `FIRE` only after its current live state is verified. A historical route may become `EXPIRED` or `KILL` without being deleted; retaining the negative state is part of the evidence trail.
