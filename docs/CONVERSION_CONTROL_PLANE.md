# Blowback conversion control plane

Blowback is the execution substrate for converting finished portfolio evidence into external verdicts and economic outcomes.

It answers three linked questions:

1. Which external opportunity deserves attention?
2. Which existing evidence should be projected into it?
3. How far can the operator advance the route without inventing facts or crossing protected commitments?

## Architecture

```text
public / connected sources
          ↓
Radar discovery + source-family monitoring
          ↓
official-source verification
          ↓
canonical Gauntlet route
          ↓
eligibility / economics / fit / marginal-work policy
          ↓
      REJECT | HOLD | READY/FIRE
                       ↓
canonical claim + evidence inventory
                       ↓
truthful role/venue projection
                       ↓
mission / application compiler
                       ↓
Codex+Chrome or bounded Playwright
                       ↓
protected gate OR explicitly-authorized safe submit/send
                       ↓
external receipt / verdict / offer
                       ↓
outcome ledger + conversion analytics
```

## Opportunity classes

The shared control plane covers conventional routes and the hidden research-labor market.

### General conversion

- `job`
- `phd`
- `competition`
- `grant`
- `sponsorship`
- `fellowship`
- `institutional_pilot`
- `incubator`
- `commercial`
- `research`

### Research labor / application markets

- `research_assistant`
- `research_staff`
- `research_engineer`
- `research_officer`
- `technical_associate`
- `project_staff`
- `predoc`
- `research_fellowship`
- `research_residency`
- `policy_fellowship`
- `funded_visiting`
- `faculty_pull`

The classes share discovery, verification, evidence matching, cost doctrine, preparation, receipt capture and outcome measurement. Domain-specific economics remain separate: salary is not a prize; restricted research budget is not personal cash; PhD stipend is not startup revenue.

## Deterministic doctrine

`src/core/conversion.mjs` implements the portfolio gauntlet rule without asking an LLM to decide truth state:

1. failed eligibility → `REJECT`;
2. unknown eligibility → `HOLD`;
3. dependency outside direct control → `HOLD`;
4. explicit hard blockers → `HOLD`;
5. missing required evidence → `HOLD`;
6. `$UPFRONT` pre-verdict spend → `HOLD` for explicit decision;
7. low/unknown fit or high/unknown marginal work → `HOLD`;
8. otherwise credible `$0` / `$POST` opportunities may become `READY`.

Upstream research may propose fit, expected value and evidence. The result enters this layer as explicit state with source/evidence references. Unknowns remain unknown.

## Claim inventory and projections

Applications should not be rewritten from memory.

Maintain canonical claims such as:

```json
{
  "id": "hs-mcp-backend",
  "text": "Hardware-Splicer exposes its canonical backend through MCP.",
  "status": "PROVEN",
  "evidence_refs": ["github:hardware-splicer:workflow:canonical-mcp"]
}
```

Statuses are:

- `PROVEN` — requires evidence references;
- `INFERRED` — may appear only with inference status preserved;
- `UNPROVEN` — excluded from external application projections.

A projection is a truthful emphasis, not a new biography. The same evidence core may generate an FDE, research-engineer, finance-AI, Physical-AI, predoc, PhD, fellowship, competition or incubator packet, but it may never upgrade claim status.

## Application compiler

Application-like Gauntlet routes are compiled into `blowback.application_mission.v1`.

The compiler derives:

- application kind;
- current stage (`RECON` or `PREPARE`);
- likely channel (`PORTAL`, `OUTREACH`, or recon-required);
- route-specific packet profile;
- canonical evidence family;
- allowed automatic actions;
- protected gates;
- receipt/follow-up obligations.

Route-specific packet profiles are deliberate. A lab RA should not receive the same packet as a commercial software job, and a predoc should not receive the same packet as a policy fellowship.

See `docs/APPLICATION_AUTOPILOT.md`.

## Final-action authority

The deterministic Playwright `run` path retains its original boundary: it never performs final submission.

Adaptive application missions default to preparation-only. Explicit runtime authority can be supplied with:

```bash
npm run blowback -- apply-next --submit-if-safe
```

That authority releases only final submit/send on a route that is already in a fire/ready posture and has no known material dependency.

It does not authorize:

- CAPTCHA bypass;
- secret invention or storage;
- legal/privacy/terms acceptance;
- eligibility/originality/authorship attestations;
- payment/purchase;
- adviser/team/partner/host commitments;
- guessed work-authorization or visa answers;
- guessed IP/moonlighting/outside-work answers;
- material free-text answers unsupported by verified evidence;
- destructive actions.

Dynamic discovery of one of those conditions forces `WAITING_HUMAN`.

This preserves the distinction between **automation authority** and **truth/commitment authority**.

## Conversion analytics

Store external outcomes rather than relying on retrospective impressions:

```text
DISCOVERED → VERIFIED → READY → SUBMITTED
                              ↓
                     SCREEN / INTERVIEW / FINAL
                              ↓
                    ACCEPTED / OFFERED / REJECTED
                              ↓
                         CONVERTED
```

For jobs and research labor, preserve advertised and offered compensation separately. For PhDs/fellowships, separate personal stipend from restricted research support, travel, compute or housing. For competitions/grants preserve prize/funding separately.

The point is eventually to answer questions like:

- Which truthful professional projection gets the highest callback rate?
- Which lab/research-job family produces the best offer distribution?
- Which project most often survives external scrutiny?
- Which application classes consume the most marginal human work per verdict?
- Which source families yield actual cash rather than merely interesting listings?
- Do research-labor routes outperform generic AI jobs for post-graduation conversion?
- Which fellowships/residencies create enough option value to beat a job or funded PhD?

These become measured portfolio results, not anecdotes.

## Hard truth boundary

Blowback must not become an indiscriminate spray-and-pray applicant.

It must never invent credentials, experience, language ability, eligibility, authorship, affiliations, publication state, physical validation, users, revenue, salary history or acceptance status. Search snippets are not application authority. A newly discovered source must be hydrated and verified before submission can be considered.

The system optimizes **conversion of true evidence**, not conversion at any cost.

## Integration with Radar

Radar should produce a normalized opportunity dossier containing at minimum:

- canonical source URL and retrieval timestamp;
- opportunity type and organization;
- deadline or explicit rolling/cycle state;
- location / remote status;
- eligibility state + evidence;
- compensation/funding/prize when publicly disclosed, otherwise `UNKNOWN`;
- cash class: personal / restricted / reimbursement / credits / benefits;
- cost tag (`$0`, `$POST`, `$UPFRONT`);
- fit state + explicit basis;
- marginal-work state;
- hard blockers / unresolved dependencies;
- required evidence;
- recommended canonical claim IDs / projection;
- source freshness;
- for application routes, work authorization/visa, degree/background, host/adviser/team and IP/outside-work facts where published.

Blowback then verifies the dossier shape, applies deterministic policy, compiles application missions for application-like routes, prepares only when evidence supports it, and records the outside verdict.

## Stop rule

Do not build a generic ATS dashboard, recruiter CRM or new frontend before real conversion volume demonstrates the need.

The next evidence should come from real applications, submissions, lab replies, interviews, fellowships, funded projects, offers and receipts flowing through the same control plane.
