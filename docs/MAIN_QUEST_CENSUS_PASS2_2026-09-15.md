# GAUNTLET Main Quest Census — Pass 2

**Snapshot:** 2026-09-15  
**Authority lane:** RADAR / discovery denominator  
**Rule:** **Discovery may gate, but it may not rank.**

## Why this exists

The earlier Main Quest board was intentionally useful for execution, but it was still a shortlist. Pass 2 establishes the denominator first and keeps mediocre, gated, awkward, low-prestige, or unresolved routes visible instead of allowing fit to erase them during discovery.

The operating sequence is now:

`MASTER_UNIVERSE → ELIGIBILITY_GATES → PACKET_FAMILIES → MARGINAL_APPLICATION_COST → EXECUTION_QUEUE`

The census is upstream authority for **what was searched and what exists**. A ranked Main Quest board or FIRE queue remains a downstream execution view and must not be used as the discovery denominator.

## Coverage result

| Domain | Denominator | Entities with route rows | Departments / teams represented | Routes | ELIGIBLE | STRETCH | DEGREE_GATE | SENIORITY_GATE | Delta-search entities |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Taiwan PhD | 21 institutions | 16 | 57 | 61 | 36 | 22 | 3 | 0 | 5 |
| Taiwan employment | 57 employers | 35 | 77 | 88 | 16 | 35 | 16 | 21 | 22 |
| **Total** | **78** | **51** | **134** | **149** | **52** | **57** | **19** | **21** | **27** |

Zero `LANGUAGE_GATE` or `NOT_ELIGIBLE` rows does **not** mean every route is easy or English-only. It means the census did not promote assumptions into hard exclusions without explicit evidence.

## PhD denominator

The 16 institutions with route-level rows are:

NYCU, NTU, NTHU, NCCU, NCU, NTUST, NCKU, NCHU, NSYSU, CCU, YunTech, Taipei Tech, Feng Chia, NTNU, NTPU, and TIGP / Academia Sinica.

The five retained C-tier gaps are:

- Yuan Ze University
- Chung Yuan Christian University
- National Kaohsiung University of Science and Technology
- National Dong Hwa University
- National Taiwan Ocean University

These are **not negative findings**. They mean the institution was checked but a current route was not source-locked strongly enough to promote during this capture.

The data file contains the complete 61-row compact PhD index recovered from the persisted report.

## Employment denominator

The employer denominator is 57. Exact current route rows were reported at 35 employers; 22 searched employers remain explicit delta-search targets:

Applied Materials, Lam Research, KLA, Realtek, Novatek, Delta Electronics, Advantech, Foxconn/Hon Hai, Quanta, Wistron, Wiwynn, ASUS, Acer, Pegatron, AUO, Microsoft Taiwan, AWS Taiwan, LINE Taiwan, Yahoo Taiwan, Shopee Taiwan, Gogoro, and iKala.

The saved report's compact prose index individually exposes 86 route slots across 33 employers when Micron's reported seven routes are counted. The original Deep Research machine attachment reported **88 exact job rows across 35 employers**. The two row identities omitted from the compact prose are **not reconstructed from guesses**.

## Evidence tiers

- **A** — current official university brochure/department notice or official employer requisition directly inspected.
- **B** — current central official notice plus department/program page, or a current employer role corroborated by an authorized/major job board.
- **C** — entity searched but exact current route/current-cycle subrule not sufficiently source-locked. C-tier means **delta-search**, not absence.

## Gate semantics

- `ELIGIBLE` — no explicit degree, language, or seniority blocker recovered for the current applicant baseline; not a probability claim.
- `STRETCH` — no hard blocker, but evidence/technical/research fit would need to carry substantial weight.
- `DEGREE_GATE` — explicit field-family requirement is not established by current applicant truth.
- `SENIORITY_GATE` — explicit seniority/experience requirement is not established by current applicant truth.
- `LANGUAGE_GATE` — reserved for an explicit unsatisfied language condition.
- `NOT_ELIGIBLE` — reserved for an unambiguous hard failure.

## Current 116 pressure window

- **Sep 29:** NCCU, NCKU and YunTech windows begin.
- **Sep 30:** NTU, NCU, NTUST and CCU cluster begins.
- **Oct 1:** NYCU opens.
- **Oct 5:** NCKU closes.
- **Oct 6:** NTUST closes.
- **Oct 7–8:** NYCU / NTU / NCU deadline collision.
- **Oct 13:** NCCU / CCU cluster.
- **Oct 15:** YunTech closes.
- **Late September:** Taipei Tech brochure watch.
- **TBD:** NTHU 116 domestic doctoral screening.
- **Later cycle:** TIGP 2027.

These are **execution dates, not rankings**.

## Integration contract

Canonical data: `data/main-quest-census-pass2-2026-09-15.json`.

This tranche intentionally does **not** wire fabricated summary rows into `docs/gauntlet-master.*`. The master registry is route-level and must only ingest the exact 149-row payload when that payload is recovered/re-exported or rehydrated from live verification.

Until then:

1. this file controls the discovery denominator;
2. the existing Main Quest board may rank/execute only as a downstream view;
3. C-tier rows remain in the delta-search queue;
4. volatile job routes must be reverified before application;
5. no future research pass may report “coverage” without a denominator matrix.

The saved Deep Research object is checksum-pinned in the data file so a later hydration pass can prove lineage rather than silently rebuilding a different universe.
