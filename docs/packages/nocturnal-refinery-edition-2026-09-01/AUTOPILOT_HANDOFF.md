# Application Autopilot Handoff

The application-autopilot compiler is present on the Gauntlet base. This package is structurally compatible with its route-specific profiles, but **no automatic evidence-directory ingestion adapter is claimed yet**.

Before compiling any route packet, consult:

- `docs/PORTFOLIO_SLOT_ALLOCATION_2026-09-01.md`
- `data/portfolio-slot-allocation-2026-09-01.json`

A project-specific Nocturnal packet must not bypass a `PORTFOLIO_BAKEOFF_REQUIRED`, `MUTUALLY_EXCLUSIVE`, or `DEPENDENCY_BLOCKED` allocation state.

## Packet-profile mapping

| Route | Package projection | Application-autopilot profile |
|---|---|---|
| Academia Sinica Ku / Der-Nian Yang RA | `RESEARCH_LAB_PHD` | Lab/RA: research-interest note + strongest route-specific evidence; person-level bundle, not a Nocturnal-only application |
| Tech Policy Press fellowship | `PUBLIC_INTEREST` | Fellowship: program-specific statement + bounded research/output agenda; Nocturnal currently lead theme, Policy/Citation support |
| VU / future PhD or faculty-pull route | `RESEARCH_LAB_PHD` | PhD/faculty pull: research statement + academic evidence + exact fit note |
| research engineer / lab staff route | `RESEARCH_LAB_PHD` | Research job/engineer: technical evidence packet selected from the whole portfolio |
| MSR / SANER | `RESEARCH_SOFTWARE` | not an application-autopilot route; retain research/manuscript workflow with Refinery as contribution |
| OTF / NLnet / TWNIC / DPG / Pulitzer / FIJ | mapped `PUBLIC_INTEREST` / `RESEARCH_SOFTWARE` | grants/standards/pilots stay on broader mission operator and must clear portfolio allocation first |

## Canonical evidence inputs

A future adapter should project from, not rewrite:

- `CORE_NARRATIVE.md`;
- `EVIDENCE_MATRIX.md`;
- `NONCLAIMS.md`;
- the relevant `routes/*.md` card;
- source identities in `PACKAGE_MANIFEST.json`;
- route posture in `route-matrix.json`;
- the portfolio-wide selected lead/supporting assets.

`UNPROVEN`/disallowed claims remain excluded.

## Initial-stage guidance

- Sinica routes remain `RECON` until degree/work-right/IP/economic gates resolve; then compile the strongest candidate bundle.
- Tech Policy Press can move toward `PREPARE` only when required public-work/reference facts are available.
- OTF remains broader-mission recon until exclusion/eligibility audit clears.
- TWNIC remains portfolio/host dependency-blocked until the one entity slot is explicitly allocated.
- NLnet remains portfolio-bakeoff required until the live call is rehydrated.
- DPG should not delay the more execution-ready Policy Lab solution route.
- MSR/SANER are research submission routes, not application-autopilot targets.

## Runtime authority

This handoff does not itself authorize `--submit-if-safe`. Package-level final submit remains human-gated unless the user separately grants runtime authority and all protected-gate and portfolio-allocation checks clear.

## Integration target

The next small Gauntlet integration, if useful, is a read-only evidence-family adapter that can ingest the package manifest plus portfolio allocation and emit the correct route-specific evidence bundle. That is conversion tooling, not a new Nocturnal/Refinery/Edition development phase.
