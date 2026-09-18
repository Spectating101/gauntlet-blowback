# Case-study card — Hardware Splicer

## Thirty-second account

Hardware Splicer is an evidence-gated engineering system for producing and reviewing hardware/software manufacturing packages without allowing an agent's recommendation to become physical authority. The current SPI Flash Adapter candidate is frozen, reproducible and packaged for review; it is deliberately not described as fabricated or physically validated.

## Exact authority

- frozen release commit: `f892facd67c5124e2362860ebc999625afedc5d5`;
- release tag: `gauntlet-spi-flash-adapter-v1-20260916`;
- package SHA-256: `6d4c76feaeebdab1223ed6c4be21d63835212baea731aea9d3933f2525be1edd`;
- external-conversion package candidate: `package/hs-external-conversion-20260917@3fb033830505d2df37b8fdd6d5310fe9e6874f2c`;
- boundary: `PACKAGED_NOT_PHYSICAL`.

The conversion branch explains and packages the frozen release. It does not rewrite the historical candidate or increase its evidence stage.

## Demonstrated work

- complete schematic and PCB manufacturing package;
- Gerbers, BOM, placement and drawings;
- acceptance/FCT procedure;
- deterministic rebuild and package integrity;
- frozen unseen SPI corpus containing ten cases without provider I/O;
- 55 focused tests across the external MCP runner, unseen corpus and SPI reference design;
- hero rendering bound to the product package by an exact SHA-256;
- outsider-facing evidence map, FAQ, offline evaluator path, provider-handoff QA and research/adjudication freeze.

## Why it matters

The project demonstrates more than file generation. It makes the boundary between software evidence and physical authority explicit, packages the result so another engineer can inspect it, and preserves the exact candidate used by tests and documentation.

## Strongest nonclaims

- no board has been fabricated, powered or measured;
- connector electrical compatibility and whole-assembly closure are unproven;
- no provider or independent engineer has approved the design;
- no external design-partner validation exists;
- the matched reference/advisory evaluation runner remains incomplete.

## Best Main Quest uses

- agent-systems, semiconductor/EDA and physical-AI employment packet;
- evidence-gated consequential-engineering case study;
- funded research on agent authority, evaluation and engineering reliability;
- supporting evidence for general reliable-AI roles.

## Next internal milestone

Implement the matched non-destructive reference/advisory runner, treatment-parity audit, synthetic transport tests and frozen result schema. Keep that as a new milestone; do not modify the frozen release.

