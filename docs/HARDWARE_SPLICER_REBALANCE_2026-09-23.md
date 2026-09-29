# Hardware-Splicer route allocation overlay — 2026-09-23

This file is deliberately **not** the canonical Hardware-Splicer product state.

Canonical project identity, investment posture, active/frozen surfaces, competitor-development rule, and authority boundaries live in:

`Spectating101/hardware-splicer/docs/HARDWARE_SPLICER_OPERATING_STATE.{md,json}`

introduced by `Spectating101/hardware-splicer#106`.

Gauntlet owns one narrower question:

> Given the current portfolio and a specific external opportunity, should Hardware-Splicer lead this route, support it, wait for more evidence, or let another asset lead?

Machine-readable route overlay: `data/hs-route-rebalance-2026-09-23.json`.

## Allocation invariants

- Hardware-Splicer remains a flagship / selectively active project under its own canonical state.
- Moving one opportunity to another portfolio asset does **not** remove or deprecate an HS capability.
- Moved routes remain reclaimable if future HS evidence/workload makes it the better lead.
- Historical manifests remain evidence; do not delete them to make the current allocation look cleaner.
- SPI physical proof (`hardware-splicer#105`) remains P0.
- Generic competitor announcements do not preempt that physical-proof campaign.

## Current route allocation

This section is synchronized to the individual execution manifests as of the 2026-09-23 closeout pass. The machine-readable overlay is authoritative for route allocation; the individual route manifests remain authoritative for their detailed gates.

### P0 — HS physical proof / provider contact

- **SPI external physical/FCT proof** — **HS PRIMARY / CONTACT READY**.
- Canonical release: `gauntlet-spi-flash-adapter-v1-20260916`.
- Exact provider candidates: JLCPCB and PCBWay.
- Provider-reply evaluator is merged in `hardware-splicer#108`.
- Next action is external: send the same frozen package and engineering-review request to both providers, then stop before checkout/payment.
- A quote, DFM response, or positive feasibility reply grants **no** fabrication, power, FCT, or release authority.

### HS primary external routes

- **Anthropic External Researcher Access** — **HUMAN_SUBMIT_READY**. Gauntlet #61 removed the browser-automation dependency; exact live form labels and final submit remain human.
- **Anthropic MHS Research Preview** — **RESEARCH_ONLY / SPI SUBJECT DEFINED**. Gauntlet #63 binds the route to `spi_flash_adapter_v1`. MHS is transport/discovery; HS remains the evidence/revision/authority boundary. Physical execution waits for #105.
- **DATE 2027 LBR** — **PACKET_READY / EVIDENCE GATED**. Gauntlet #64 records the current two-page double-blind format and 2026-11-29 AoE deadline. Results wake only on substantive empirical evidence; MCP infrastructure alone is insufficient.

### HS conditional / blocked external route

- **InnoServe Industrial AI** — **RESEARCH_ONLY / CONTACT_READY_NOT_SENT**. Gauntlet #67 records the 2026-08-27 model-origin declaration conflict with historical optional Qwen/DeepSeek work in the broader HS repo; Gauntlet #69 binds that gate to the official organizer contacts and a paste-ready clarification that discloses the historical experiments. Send that clarification to both published organizer emails, but keep the route blocked until an unambiguous organizer reply and the separate 1–2 school-adviser requirement both clear.

### HS after new evidence + consent

- **Anthropic AI for Science** — **RESEARCH_ONLY**. Gauntlet #66 binds it to #105 physical evidence, a frozen Claude/API scientific workload, institutional consent, receiving organization/account, data/IP rights, and live reconciliation of the public US$20k vs US$50k credit-cap discrepancy.

### Another asset currently leads

- **OpenAI Researcher Access** → Cite-Agent currently has the cleaner reliability experiment. HS remains a support/alternate experiment.
- **AWS Cloud Credit for Research** → Research Drive / YZUC currently have the more native workload.
- **NCHC university AI compute** → YZUC / Research Drive / Refinery currently have the more native local/open-model workload.

These are allocation choices, not judgments that Hardware-Splicer should become smaller.

### Archive

Past TAIA, TAS, TAAI and AWS Community Day routes remain historical conversion evidence. WanRun remains explicit negative evidence.

### Current HS program consequence

The internal build phase is no longer the bottleneck. Current useful progress comes from:

1. provider contact / external engineering review;
2. human submission of already-ready research routes;
3. real physical evidence;
4. route-specific clarification/consent;
5. targeted engineering only when those external collisions expose a concrete HS-native gap.

Do not open a generic HS feature sprint merely because a route exists.

## Relationship to Refinery

Refinery PR `Spectating101/refinery#24` supplies source-bound competitor observations and a bounded response class.

Gauntlet consumes those observations through `data/hs-competitive-feedback-consumer-v1.json` and may:

- open bounded shell/workflow engineering;
- open an integration candidate;
- request more evidence;
- open a core investigation without authorizing a core mutation;
- run a portfolio bake-off;
- do nothing.

Gauntlet cannot use a Refinery packet to grant fabrication, power-on, functional-test, release, or core-semantics authority.

## Person-level use

For jobs, RAs, fellowships, residencies, PhDs, research conversations, and technical evaluation, HS remains a flagship work sample whenever physical AI, robotics, electronics, EDA, embodied systems, or consequential-agent control is material.

A project-level opportunity being led by Cite, Research Drive, YZUC, Refinery, Nocturnal, or Policy Lab does not weaken HS in the person's evidence bundle.

## Practical rule

When Gauntlet sees an opportunity, ask:

1. Is hardware / physical-agent / release-assurance evidence intrinsic to the route?
2. Does HS have the strongest existing evidence with reasonable marginal work?
3. Would winning materially reprice HS or the portfolio?
4. Is another existing asset more native without requiring manufactured justification?

Then allocate the route.

Do **not** use route allocation to redefine what Hardware-Splicer is. That now has one canonical owner: Hardware-Splicer itself.
