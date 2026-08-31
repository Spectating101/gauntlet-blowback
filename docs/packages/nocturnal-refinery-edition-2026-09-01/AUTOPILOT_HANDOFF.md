# Application Autopilot Handoff

The application-autopilot compiler is now present on the Gauntlet base. This package is structurally compatible with its route-specific profiles, but **no automatic evidence-directory ingestion adapter is claimed yet**.

## Packet-profile mapping

| Route | Package projection | Application-autopilot profile |
|---|---|---|
| Academia Sinica Ku / Der-Nian Yang RA | `RESEARCH_LAB_PHD` | Lab/RA: research-interest note + 1–2 strongest project evidence links + systems evidence packet |
| Tech Policy Press fellowship | `PUBLIC_INTEREST` | Fellowship: program-specific statement + bounded research/output agenda |
| VU / future PhD or faculty-pull route | `RESEARCH_LAB_PHD` | PhD/faculty pull: research statement + academic evidence + exact fit note |
| research engineer / lab staff route using this stack | `RESEARCH_LAB_PHD` | Research job/engineer: technical evidence packet + demanded-stack evidence |
| MSR / SANER | `RESEARCH_SOFTWARE` | not an application-autopilot route; retain research/manuscript workflow |
| OTF / NLnet / TWNIC / DPG / Pulitzer / FIJ | mapped `PUBLIC_INTEREST` / `RESEARCH_SOFTWARE` | grants/standards/pilots stay on the broader mission operator rather than the job-application compiler |

## Canonical evidence inputs

A future adapter should project from, not rewrite:

- `CORE_NARRATIVE.md`;
- `EVIDENCE_MATRIX.md`;
- `NONCLAIMS.md`;
- the relevant `routes/*.md` card;
- source identities in `PACKAGE_MANIFEST.json`;
- route posture in `route-matrix.json`.

`UNPROVEN`/disallowed claims remain excluded.

## Initial-stage guidance

- Sinica routes remain `RECON` until degree/work-right/IP/economic gates resolve.
- Tech Policy Press can move toward `PREPARE` only when required public-work/reference facts are available.
- OTF remains broader-mission recon until exclusion/eligibility audit clears.
- TWNIC remains dependency-blocked until a real host/corpus/legal path exists.
- MSR/SANER are research submission routes, not application-autopilot targets.

## Runtime authority

This handoff does not itself authorize `--submit-if-safe`. Package-level final submit remains human-gated unless the user separately grants runtime authority and the autopilot’s protected-gate checks all clear.

## Integration target

The next small Gauntlet integration, if useful, is a read-only evidence-family adapter that can ingest this directory’s manifest/route matrix and emit the appropriate route-specific packet projection. That is conversion tooling, not a new Nocturnal/Refinery/Edition development phase.
