# Application Autopilot Handoff

This package was prepared independently of the application-autopilot implementation. It is structurally compatible with that compiler, but **no automatic ingestion/integration is claimed in this packet yet**.

## Packet-profile mapping

| Gauntlet/application route | Package projection | Autopilot profile use |
|---|---|---|
| Academia Sinica Ku / Der-Nian Yang RA | `RESEARCH_LAB_PHD` | Lab/RA: research-interest note + 1–2 strongest evidence links + systems evidence packet |
| Tech Policy Press fellowship | `PUBLIC_INTEREST` | Fellowship: program-specific statement + bounded research/output agenda |
| VU / future PhD or faculty-pull route | `RESEARCH_LAB_PHD` | PhD/faculty pull: research statement + academic evidence + exact fit note |
| research engineer / lab staff route using Nocturnal evidence | `RESEARCH_LAB_PHD` | Research job/engineer: technical evidence packet + demanded-stack evidence |
| MSR / SANER | `RESEARCH_SOFTWARE` | not an application-autopilot route; retain research/manuscript workflow |
| OTF / NLnet / TWNIC / DPG / Pulitzer / FIJ | `PUBLIC_INTEREST` or `RESEARCH_SOFTWARE` as mapped | grants/standards/pilots remain on broader mission operator, not the job-application compiler |

## Canonical evidence inputs

The compiler should project from, not rewrite:

- `CORE_NARRATIVE.md`;
- `EVIDENCE_MATRIX.md`;
- `NONCLAIMS.md`;
- the relevant `routes/*.md` card;
- source repository/release identities in `PACKAGE_MANIFEST.json`.

`UNPROVEN`/disallowed claims in `NONCLAIMS.md` remain excluded from external projections.

## Initial-stage guidance

The package intentionally preserves unresolved material gates. Therefore:

- Sinica routes remain `RECON` until degree/work-right/IP/economic gates are resolved;
- Tech Policy Press can compile toward `PREPARE` only when required public-work/reference facts are available;
- OTF remains broader-mission recon until the exclusion/eligibility audit clears;
- TWNIC remains dependency-blocked until a real host/corpus/legal path exists.

## Runtime authority

This handoff does not authorize `--submit-if-safe` and does not alter final-submit policy. The package-level rule remains **final submit human-gated** unless the user separately grants runtime authority under the autopilot safety contract.

## Future integration

If the autopilot branch is merged and a stable packet-input schema is added, `route-matrix.json` can become the machine-readable routing hint and this directory can become an evidence-family source. Until then, treat this file as a semantic handoff, not an implemented adapter.
