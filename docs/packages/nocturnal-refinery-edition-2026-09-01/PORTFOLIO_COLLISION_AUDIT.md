# Portfolio Collision Audit — Nocturnal / Refinery / Edition

Snapshot: **2026-09-01**

This file answers a different question from project fit:

> If we use Nocturnal as the lead for this opportunity, do we consume a scarce applicant/entity/manuscript slot that another portfolio asset might use better?

A route must not become `FIRE` merely because Nocturnal fits. First determine the **submission unit** and **slot scarcity**.

## Collision classes

- `NO_PROJECT_COLLISION` — separate projects/solutions may be submitted independently; only effort cost is shared.
- `PERSON_APPLICATION_BUNDLE` — the submission unit is the person, role or fellowship application. Projects are evidence inside one application; do not create separate applications per project unless the venue explicitly permits/requires that.
- `RESEARCH_CONCEPT_SLOT` — the person applies with one bounded research focus. Run an internal portfolio bake-off before fixing the concept.
- `ENTITY_SCARCE_SLOT` — a legal entity/institution has a formal one-proposal or similar cap. Never reserve it for Nocturnal without comparing the whole portfolio and coordinating with the entity.
- `FIRST_GRANT_SCARCE` — several proposals may technically be submitted, but the fund effectively makes the applicant choose/focus for the first award. Treat as one portfolio allocation decision.
- `MANUSCRIPT_CONTRIBUTION_SLOT` — venue/manuscript originality and overlap rules make the empirical contribution scarce even if different submission portals exist.
- `PARTNER_USECASE_SLOT` — no usable slot exists until a real external partner/use case exists; project choice is driven by that partner's problem.

## Current audit

| Route | Collision class | Other portfolio contenders | Current best lead | Does Nocturnal block something stronger? |
|---|---|---|---|---|
| OTF ICRP 2026 | `RESEARCH_CONCEPT_SLOT` | Citation Engine / Research Drive as methods; Policy Lab only if a genuinely information-controls question exists | **Nocturnal-derived research question**, with Citation Engine/Research Drive supporting | **Probably no**, but do not submit the product as the research question. The program is about a focused information-controls research project, not a portfolio showcase. |
| NLnet Restack | `FIRST_GRANT_SCARCE` | **Policy Lab Restack** is already a separate master route; Nocturnal Restack; potentially other NLnet-family proposals such as Refinery under a different call | **UNDECIDED — mandatory portfolio bake-off after live call opens** | **YES, potentially.** Multiple proposals are technically possible, but a first-time applicant should expect to focus/choose. Do not privilege Nocturnal before comparing Policy Lab and the best NLnet-family proposal. |
| Academia Sinica — Ku Lab | `PERSON_APPLICATION_BUNDLE` | Cite, Research Drive, Citation Engine, Nocturnal are all already mapped in the master row | **candidate-level bundle**, not Nocturnal | **No.** One RA application should use the strongest 1–2 artifacts for the lab; Nocturnal is evidence, not a consumed project slot. |
| Academia Sinica — Der-Nian Yang | `PERSON_APPLICATION_BUNDLE` | Nocturnal, Research Drive, Citation Engine, Cite are already mapped | **candidate-level bundle**, probably Nocturnal + Research Drive for this lab | **No.** Same reason: the role hires the researcher, not one project. |
| Tech Policy Press 2027 | `PERSON_APPLICATION_BUNDLE` with one thematic focus | Nocturnal, Policy Lab, Citation Engine are already mapped | **Nocturnal-led information-integrity focus** currently looks strongest; supporting assets remain available inside the same application | **Not as separate project submissions.** The real scarce object is the applicant's chosen focus, so compare themes before finalizing the cover letter. |
| MSR 2027 Technical | `MANUSCRIPT_CONTRIBUTION_SLOT` | Refinery / Commons | **Refinery** | **No.** This package already keeps Nocturnal downstream-only. Preserve manuscript originality/overlap rules. |
| MSR 2027 Data & Tool | `MANUSCRIPT_CONTRIBUTION_SLOT` | Refinery / Commons | **Refinery** | **No.** Same contribution family; choose the best MSR lane rather than forcing Nocturnal in. |
| SANER Research / Tool | `MANUSCRIPT_CONTRIBUTION_SLOT` | Refinery / Commons | **Refinery** | **No.** Coordinate with MSR/iFS/ICSE-SEIS alternatives so one empirical contribution is not double-spent. |
| TWNIC Community Grants 2026 | `ENTITY_SCARCE_SLOT` | Nocturnal; Citation Engine / Research Drive / Policy Lab / Public-Good Control are plausible thematic alternatives; the host institution may also have unrelated proposals | **Nocturnal appears strongest from the current portfolio, but this is NOT locked** | **YES.** Official rule is one proposal per applying legal entity. Run a whole-portfolio + host-level bake-off before reserving the entity slot. |
| Digital Public Goods Registry | `NO_PROJECT_COLLISION` | **Policy Lab has its own DPG route and is currently more execution-ready**; Nocturnal has a separate solution route | **Policy Lab first on current readiness; Nocturnal later if it clears DPG requirements** | **No formal slot collision found.** Do not delay Policy Lab merely to package Nocturnal. |
| VU Social Data Science PhD | `PERSON_APPLICATION_BUNDLE` / research-proposal fit | Nocturnal, Research Drive, Research Papers and other empirical systems may support | **vacancy-specific research thesis, not a product** | **No project-slot collision**, but choosing the wrong research proposal can weaken the one application. |
| APNIC fellowship watch | `RESEARCH_CONCEPT_SLOT` when next call opens | Nocturnal, Research Drive, Policy Lab | **UNDECIDED until next call** | **Potentially.** Run portfolio bake-off when the actual next-cycle themes are known. |
| Asia House fellowship watch | `PERSON_APPLICATION_BUNDLE` with thematic focus | Nocturnal, Policy Lab, Finance, Sharpe | **UNDECIDED until next call** | **Potentially at theme level**, not because projects are separately submitted. |
| Pulitzer Center | `PARTNER_USECASE_SLOT` | whichever artifact directly supports the real reporting partner/use case | **none yet** | **No slot should be consumed now.** Let the partner/use case determine the lead. |
| Fund for Investigative Journalism | `PARTNER_USECASE_SLOT` | same | **none yet** | **No slot should be consumed now.** |

## Specific corrections to the earlier package

### TWNIC

The previous wording `PRIMARY_FIRE` is a route-state inherited from the Nocturnal-specific board, not a portfolio allocation decision. TWNIC's current official announcement says each applying entity may submit **one** proposal. Therefore the correct package posture is:

`PORTFOLIO_BAKEOFF_REQUIRED + HOST_DEPENDENCY`

Nocturnal currently looks like the strongest natural match because the call explicitly covers internet policy/governance and internet technology, while Nocturnal is already an information-integrity/public-memory system. But this is an assessment, not a reservation of the entity slot.

### NLnet

The master already contains both:

- `nlnet-restack-policy-lab-2026`
- `nlnet-restack-nocturnal`

NLnet's Restack FAQ allows multiple proposals in a round, but explicitly advises first-time applicants to focus on making one project successful and says multiple eligible proposals may need to be chosen between or plausibly combined. Therefore:

`NOCTURNAL_RESTACK != AUTOMATIC_FIRE`

The correct action after the live call opens is to score at least **Policy Lab vs Nocturnal** on:

1. literal call fit;
2. open/libre release readiness;
3. European-dimension story;
4. amount of genuinely new R&D still fundable;
5. external/user need;
6. ability to deliver independently;
7. expected value per proposal hour.

### Digital Public Goods

The portfolio already contains:

- `dpg-policy-lab` — `READY_TO_SUBMIT / PACKET_READY` in the restored master state;
- `dpg-nocturnal` — `VERIFY / RESEARCH_ONLY`.

DPG recognition is solution-specific. No one-solution-per-applicant cap was found in the current public FAQ. Therefore Nocturnal should **not** displace or delay the more mature Policy Lab DPG route.

### Personal applications are not project contests

For Sinica labs, Tech Policy Press, PhDs and similar routes, the applicant is the submission unit. The Gauntlet should compile the strongest evidence bundle rather than creating artificial `Nocturnal vs Cite vs Research Drive` applications to the same role.

For example, the current Ku Lab master row already maps `Cite|Research Drive|Citation Engine|Nocturnal`; Der-Nian Yang maps `Nocturnal|Research Drive|Citation Engine|Cite`. That is the correct ontology: one candidate application, several supporting assets.

## Portfolio allocation rule

Before any final submit, compute:

```text
opportunity
  ↓
submission unit
  ↓
formal slot limit
  ↓
portfolio contenders
  ↓
relative fit × maturity × marginal work × expected value
  ↓
SELECT LEAD | BUNDLE EVIDENCE | PARALLEL ALLOWED | HOLD
```

A project-specific radar hit is **not** permission to consume a portfolio-scoped slot.
