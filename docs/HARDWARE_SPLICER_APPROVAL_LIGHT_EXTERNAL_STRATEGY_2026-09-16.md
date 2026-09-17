# Hardware Splicer Approval-Light External Strategy — 2026-09-16

## Strategic reset

Hardware Splicer should no longer treat grants, research-access programs, pilots, design partners, corporate sponsorship, or provider engagement as the primary conversion lane.

Those routes remain optional side shots, but they have too much discretionary approval risk and can leave the project stalled even when the artifact itself is strong.

The primary question is now:

> Where can Hardware Splicer publish, certify, submit, demonstrate, benchmark, compete, fabricate, or otherwise put the work into credible external evaluation without first needing someone to sponsor or adopt the project?

The operating principle is **artifact first, approval second**.

## Canonical current truth

Hardware Splicer main is consolidated at the Astra-to-physical release boundary represented by PR #101 / commit `f892facd67c5124e2362860ebc999625afedc5d5`.

Current evidence includes:

- deterministic SPI virtual verification;
- derived virtual lab with Icarus-backed execution;
- real TI TXU0304 manufacturer-model capture and semantic audit;
- Winbond IBIS/Verilog ingestion, capability-audit and execution-preflight machinery, but no real Winbond execution yet;
- editable KiCad rev-0.2 SPI flash adapter;
- deterministic package/FCT handoff and evidence-return audit;
- Astra/external-agent guardrails and bounded engineering workflow.

Current physical truth remains:

```text
PACKAGED_NOT_PHYSICAL
provider_engaged=false
submitted=false
ordered=false
fabricated=false
assembled=false
powered=false
physical_gates_run=false
physical_correctness=UNPROVEN
physical_authority_granted=false
```

No external route may silently upgrade those facts.

---

## Gate model

Use this scale when evaluating external routes:

- **G0 — self-service:** publish directly; no competitive selection.
- **G1 — objective eligibility/compliance:** enter if requirements are met; no discretionary sponsor required.
- **G2 — ordinary technical/curatorial selection:** anyone eligible may submit, then peer/jury/curator selection occurs.
- **G3 — proposal/resource shortlist:** meaningful work depends on being selected first.
- **G4 — relationship/institutional approval:** sponsor, partner, university, provider, adviser, corporate adoption or similar external approval is structurally required.

Default Gauntlet priority should favor **G0 → G1 → G2** and penalize G3/G4 unless conversion value is unusually high.

---

## Priority execution list

### 1. FIRE NOW — Canonical external artifact + Zenodo DOI

**Gate:** G0  
**Deadline:** none  
**Role:** permanent, independently citable project object.

Create one durable object:

> **Hardware Splicer Open Verification Artifact — 2026.09.1**

Package around the frozen engineering provenance rather than rewriting it.

Minimum contents:

- source/provenance anchor to `f892facd...`;
- current GitHub release/package identities;
- `CITATION.cff`;
- claims/nonclaims ledger;
- deterministic artifact manifest and SHA-256 list;
- derived virtual-lab evidence;
- TI metadata receipt and semantic audit, excluding raw TI/Winbond vendor bytes;
- editable KiCad rev-0.2 design sources;
- remote-FCT / physical-validation package;
- exact reproducibility commands;
- explicit `PACKAGED_NOT_PHYSICAL` state.

Preferred workflow:

1. clean licensing scopes;
2. reserve DOI;
3. embed DOI in citation metadata;
4. build artifact deterministically twice and compare;
5. publish Zenodo record;
6. connect GitHub to Zenodo for future versioned releases.

This route should remain valuable even if every conference or contest rejects later submissions.

---

### 2. FIRE NOW — OSHWA certification for rev-0.2 hardware

**Gate:** G1  
**Deadline:** none  
**Role:** turn the KiCad board from “files in a repo” into a recognized open-hardware compliance surface.

Before filing:

- keep software under MIT;
- use a recognized open-hardware license for first-party hardware design material, recommended default: `CERN-OHL-P-2.0`;
- use an open documentation license, recommended default: `CC-BY-4.0` where contributor rights permit;
- keep TI/Winbond and other third-party materials explicitly outside first-party relicensing;
- make native editable KiCad sources, BOM, build docs and revision identity easy to find;
- explicitly state that OSHWA certification is **not** evidence of physical correctness.

Do not add OSHWA marks/UIDs before the actual certification result exists.

---

### 3. FIRE NOW — Embedded World 2027 / Eclipse trustworthy AI-agents session

**Gate:** G2  
**Deadline:** **2026-09-28**  
**Internal target:** 2026-09-26  
**Fit:** exceptional.

Theme is directly aligned with Hardware Splicer: trustworthy open-source embedded systems in the age of AI agents, including testing, trust, failure modes and human oversight.

Primary framing:

> **Evidence-Gated AI Agents for Open-Source Hardware Engineering**

Lead with one concrete SPI case and the core distinction:

```text
source evidence
→ derived simulation
→ manufacturer-model evidence
→ CAD verification
→ physical measurement
```

Each stage has an explicit authority ceiling. The current public artifact intentionally stops at `PACKAGED_NOT_PHYSICAL`.

Do not turn this into generic “AI safety” language. Keep it hardware/embedded/test specific.

Official source: Eclipse Foundation Embedded World call for the 2027 session.

---

### 4. FIRE — FOSDEM 2027 project stand

**Gate:** G2  
**Deadline:** **2026-10-31 23:59 UTC**  
**Internal target:** 2026-10-28  
**Fit:** high.

Stand pitch:

> **Hardware Splicer — an open, reproducible hardware-evidence workbench**

Demo should be artifact-led and capable of running offline:

1. open DOI / artifact claims page;
2. replay derived SPI virtual lab;
3. show real TI model receipt and why model authenticity does not imply semantic sufficiency;
4. open editable KiCad board and verification receipt;
5. deliberately tamper with a copied evidence object and show fail-closed rejection;
6. show physical package state remaining `PACKAGED_NOT_PHYSICAL`;
7. give clone/DOI path.

The stand is a better external-conversion mechanism than asking for a design partner because a rejection does not erase the artifact, and an acceptance creates direct user/contributor exposure.

Official source: FOSDEM 2027 Call for Stands.

---

### 5. PARALLEL CRITICAL PATH — fabricate as ordinary procurement

**Gate:** G1 operationally, not an application route  
**Deadline:** none  
**Role:** cross the physical boundary without waiting for a “validation partner.”

Strategic change:

> Buy fabrication/assembly as a normal service. Do not require the vendor to understand, adopt, endorse, or validate Hardware Splicer as a project.

Use the existing package as the procurement input.

Split physical progression into independent steps:

1. ordinary PCBA fabrication/assembly;
2. cold inspection/continuity;
3. controlled rail/OE bring-up;
4. read-only `0x9F` / 5 MHz test;
5. evidence ingest under the existing revision-bound contract.

Payment/order remains a human gate.

When measurements exist, publish a new artifact version. Do **not** rewrite 2026.09.1 retroactively.

---

### 6. PREPARE — IEEE VTS 2027

**Gate:** G2 ordinary peer review  
**Title/abstract deadline:** **2026-11-13**  
**Paper deadline:** **2026-11-20**  
**Fit:** very high if framed as test/validation methodology.

Working paper direction:

> **Evidence-Gated AI-Assisted Test and Validation for Hardware Bring-Up**

Strongest if physical evidence exists by early November, but do not block the artifact/demo lanes waiting for it.

Likely contribution spine:

- authority/evidence separation;
- deterministic surrogate benchmark;
- manufacturer-model semantic gating;
- revision-bound EDA checks;
- adversarial tamper/stale-identity rejection;
- physical handoff and, if available, measured read-only validation.

Official source: IEEE VTS 2027 call.

---

### 7. PREPARE / CHOOSE ONE PRIMARY — DAC 2027 Research

**Gate:** G2 ordinary peer review  
**Deadline:** **2026-11-18**  
**Fit:** very high when framed as EDA methodology rather than project description.

Working research framing:

> **Evidence-Gated Agentic Hardware Engineering: Preventing Authority Escalation Across Simulation, EDA, and Physical Validation**

Before firing, add a clear comparative/ablation result such as:

- acceptance errors with vs. without semantic capability gating;
- stale/tampered evidence accepted vs. rejected;
- agent workflow with vs. without authority constraints;
- surrogate vs. manufacturer-model disagreement/calibration when Winbond evidence becomes available.

Do **not** shotgun essentially the same manuscript simultaneously into VTS and DAC Research.

Official source: DAC 2027 Research Manuscript Submissions.

---

### 8. PREPARE — IEEE ETS 2027

**Gate:** G2 ordinary peer review  
**Abstract deadline:** **2026-12-08**  
**Paper deadline:** **2026-12-15**  
**Fit:** very high for fail-closed evidence semantics / verification.

Working framing:

> **Fail-Closed Evidence Semantics for AI-Assisted Hardware Verification**

Use as primary archival target if the methodology/evidence is materially stronger by December, or as a genuinely distinct route after other venue decisions permit it. Do not depend on duplicate submission.

Official source: IEEE ETS 2027 Call for Papers.

---

### 9. PREPARE — DAC 2027 Engineering Track

**Gate:** G2  
**Deadline:** **2027-01-11**  
**Fit:** extremely high.

This may be the cleanest high-credibility venue if the system remains stronger as an engineering artifact than as a research manuscript.

Working framing:

> **Hardware Splicer: Evidence-Gated Integration of AI Agents, Deterministic Verification, and Editable Hardware Artifacts**

Show the whole executable flow instead of pretending the project is only an algorithmic novelty contribution.

Official source: DAC 2027 Engineering / Back-End Track submission call.

---

## 2027 A-watchlist

These should be monitored from the start of their cycles rather than discovered after registration closes.

### ICCAD CAD Contest 2027

**Priority:** A  
**Expected gate:** G1/G2  
**2027 call:** not yet published.

Why it matters:

The 2026 contest included LLM-assisted netlist exploration/transformation, regression failure bucketing and data-driven SoC floorplanning. If 2027 again exposes agentic EDA/verification tasks, Hardware Splicer can enter as a contestant under deterministic scoring rather than asking for sponsorship.

Prepare in advance:

- clean Linux benchmark runner;
- deterministic scorer/report adapter;
- reproducibility container;
- “HS is contestant, benchmark is authority” boundary.

Begin radar in **Jan–Feb 2027**.

### MLCAD Contest 2027

**Priority:** A  
**Expected gate:** G1/G2  
**2027 call:** not yet published.

2026 explicitly allowed LLM/agentic workflows for EDA timing optimization using OpenROAD.

Prepare:

- small OpenROAD-facing experiment harness;
- strict separation between agent proposal and metric authority;
- deterministic experiment packaging.

Begin radar in January.

### Open Hardware Summit 2027

**Priority:** A/B  
**2027 call:** monitor.

Strong target once DOI/OSHWA/physical artifact surfaces exist.

### FOSDEM 2027 open-hardware/CAD/EDA adjacent devrooms/talk calls

**Priority:** A/B  
**2027 stand call already active.**

Monitor later devroom/talk CFPs separately from the stand.

### COSCUP 2027 / Taiwan open-source alternatives

**Priority:** B  
**2027 call:** monitor.

Use only where a genuine open-source engineering/demo track exists. Do not force Hardware Splicer into a generic community talk solely because it is local.

---

## Conditional / secondary routes

### Hackster hardware contests

**Gate:** G1/G2  
**Priority:** B/C.

Enter only when the required hardware ecosystem creates a useful generalization experiment.

Do not paste the SPI project into an unrelated sponsor challenge just to have another submission.

### PolarFire FPGA Design Contest 2026

**Gate:** G3 proposal shortlist  
**Deadline:** **2026-10-03**  
**Priority:** C / conditional.

Useful only if we deliberately want an FPGA-generalization experiment. It should not displace Artifact/Embedded/FOSDEM work.

### Tiny Tapeout

**Gate:** G1 technical conformance  
**Current IHP26b timing:** too compressed for the present artifact.

Future use should be a deliberately chosen small RTL derivative that tests the pipeline from agent output to synthesis to manufactured silicon. Do not contort the SPI PCB project into an ASIC submission.

---

## Demoted lanes

Keep these visible but do not let them define the main quest:

- grants;
- research-compute/model-credit access;
- design-partner recruitment;
- custom provider validation partnerships;
- institution-only schemes;
- adviser/team-required contests;
- corporate pilots requiring adoption before evidence can be produced.

Treat them as opportunistic side shots, not prerequisites.

A provider/evaluator route may still be used when it becomes convenient, but it should no longer block artifact publication, certification, ordinary fabrication, public demonstrations, technical submissions or benchmark competitions.

---

## 30 / 60 / 120 day plan

### Next 30 days

1. Freeze external licensing policy.
2. Build `Hardware Splicer Open Verification Artifact 2026.09.1`.
3. Reserve and publish Zenodo DOI.
4. Prepare/submit OSHWA certification.
5. Fire Embedded World by Sep 28.
6. Start ordinary PCBA procurement in parallel if spend is approved.
7. Prepare FOSDEM stand package.
8. Keep Winbond authenticated download as a narrow human gate, not a blocker.

### Next 60 days

1. Submit FOSDEM stand by Oct 31.
2. Ingest first physical fabrication/inspection evidence if available.
3. Publish versioned artifact update rather than mutating v2026.09.1.
4. Build one common quantitative research/ablation spine.
5. Choose **one** primary November archival route: VTS or DAC Research.
6. Keep ETS as December alternate/distinct route.
7. Prepare DAC Engineering deck/demo independently of paper acceptance.

### Next 120 days

1. Fire ETS if it remains the best distinct paper route.
2. Submit DAC Engineering by Jan 11 if artifact/demo remains strong.
3. Begin ICCAD 2027 and MLCAD 2027 radar before their spring registration windows.
4. Add Open Hardware Summit / Taiwan open-source event calls when official 2027 CFPs appear.
5. Use physical results and Winbond execution, when available, as new evidence-bearing artifact versions.

---

## Reusable canonical artifact rule

Every external route should consume the same evidence spine wherever possible:

```text
Hardware Splicer Open Verification Artifact
        ├── DOI / permanent citation
        ├── OSHWA open-hardware record
        ├── Embedded World talk
        ├── FOSDEM stand/demo
        ├── VTS / DAC / ETS research evidence
        ├── DAC Engineering artifact/demo
        └── ICCAD / MLCAD future benchmark derivatives
```

Do not rebuild the project narrative from zero for each venue.

Route-specific copy may change emphasis, but the underlying provenance, evidence identities, claims, nonclaims and physical state must remain canonical.

---

## Gauntlet execution policy

For Hardware Splicer external conversion, Gauntlet should prefer this ordering:

```text
G0/G1 durable artifact creation
→ time-sensitive G2 direct submissions
→ ordinary procurement / physical evidence
→ one primary archival paper route
→ engineering/demo routes
→ future benchmark contests
→ G3/G4 grant/partner/access routes only as optional side shots
```

### Human gates

Keep human action restricted to genuinely non-delegable commitments:

- public creator identity / ORCID confirmation;
- licensing decision where legal ownership/judgment is required;
- account creation/login/2FA;
- legal/originality/eligibility attestations;
- payment/order approval;
- final conference/competition submit;
- physical bench operation where needed.

Everything else should be prepared by Gauntlet/Blowback from canonical evidence.

---

## Kill criteria

Kill or demote a route when any of the following is true:

- it requires a new bespoke Hardware Splicer feature unrelated to core validation;
- it requires recruiting teammates solely for eligibility;
- it requires institutional sponsorship with no unique conversion benefit;
- it demands unsupported physical/production claims;
- travel/cost dominates expected credibility value;
- deadline pressure would force low-quality or duplicate academic work;
- the route cannot reuse the canonical external artifact and produces no meaningful new evidence surface.

---

## Strategic success metric

Do not measure progress primarily by application count.

Measure:

> **How many durable external surfaces can consume the same canonical Hardware Splicer artifact without requiring us to rewrite or inflate the evidence story?**

A DOI, open-hardware certification, reproducible public demo, ordinary fabricated board, benchmark score, accepted engineering presentation or peer-reviewed paper are all stronger conversion units than another pending access application.
