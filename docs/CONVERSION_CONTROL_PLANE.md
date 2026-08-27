# Blowback conversion control plane

Blowback v0 is the browser-side clerical operator. This layer sits above it and answers a different question:

> Which external opportunity deserves a truthful preparation run, which existing evidence should be projected into it, and what external verdict came back?

It deliberately does **not** make Playwright more autonomous.

## Architecture

```text
public / connected sources
          ↓
Spectator research + verification
          ↓
canonical opportunity dossier
          ↓
eligibility / cost / fit / marginal-work policy
          ↓
      REJECT | HOLD | READY
                       ↓
canonical claim + evidence inventory
                       ↓
truthful role/venue projection
                       ↓
Blowback v0 inspect / prepare
                       ↓
                 HUMAN GATE
                       ↓
external receipt / verdict / offer
                       ↓
outcome ledger + conversion analytics
```

## Opportunity classes

The shared control plane supports:

- `job`
- `phd`
- `competition`
- `grant`
- `incubator`
- `commercial`
- `research`

The classes share discovery, verification, evidence matching, cost doctrine, preparation, receipt capture, and outcome measurement. Domain-specific fields remain domain-specific; a salary is not a prize and a PhD stipend is not startup revenue.

## Deterministic doctrine

`src/core/conversion.mjs` implements the portfolio gauntlet rule without asking an LLM to decide irreversible state:

1. failed eligibility → `REJECT`;
2. unknown eligibility → `HOLD`;
3. dependency outside direct control → `HOLD`;
4. explicit hard blockers → `HOLD`;
5. `$UPFRONT` pre-verdict spend → `HOLD` for human decision;
6. low/unknown fit or high/unknown marginal work → `HOLD`;
7. otherwise `$0` / `$POST` credible-fit opportunities → `READY`.

Upstream research may propose fit, evidence, and expected value, but the resulting assessment must enter this layer as explicit state with source/evidence references. Unknowns remain unknown.

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

A projection is a truthful emphasis, not a new biography. The same evidence core may generate an FDE, research-engineer, finance-AI, Physical-AI, PhD, competition, or incubator packet, but it may never upgrade claim status.

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

For jobs, optional compensation records can preserve disclosed or offered salary, currency, period, bonus/equity notes, and source. For PhDs use funded compensation separately from research-fit assessment. For competitions/grants preserve prize/funding separately.

The point is eventually to answer questions like:

- Which truthful professional projection gets the highest callback rate?
- Which role family produces the highest offer distribution?
- Which flagship evidence most often survives external scrutiny?
- Which opportunity classes consume the most marginal work per verdict?
- Does FDE convert the portfolio better than generic AI engineering?
- Do high-fit PhDs convert better through Physical AI or interdisciplinary AI/governance framing?

These become measured portfolio results, not anecdotes.

## Hard boundary

Blowback must not become a spray-and-pray applicant.

It must never invent credentials, experience, language ability, eligibility, authorship, affiliations, publication state, physical validation, users, revenue, salary history, or acceptance status. It must never accept legal/IP terms, pay fees, bypass anti-bot controls, or perform final submission without the explicit human gate defined by v0.

The system optimizes **conversion of true evidence**, not conversion at any cost.

## Integration with Spectator

Spectator should be the research/intelligence layer, not the browser operator. A future integration should produce a normalized opportunity dossier containing at minimum:

- canonical source URL and retrieval timestamp;
- opportunity type and organization;
- deadline and location;
- eligibility state + evidence;
- compensation/funding/prize when publicly disclosed, otherwise `UNKNOWN`;
- cost tag (`$0`, `$POST`, `$UPFRONT`);
- fit state + explicit basis;
- marginal-work state;
- hard blockers / unresolved dependencies;
- required evidence;
- recommended canonical claim IDs / projection;
- source freshness.

Blowback then verifies the dossier shape, applies deterministic policy, prepares only `READY` opportunities, and records the outside verdict.

## Stop rule

Do not build a universal CRM, generic ATS, autonomous browsing agent, or frontend dashboard before real conversion volume demonstrates the need. The next evidence should come from real jobs, PhDs, gauntlet entries, incubators, and commercial leads flowing through the same control plane.
