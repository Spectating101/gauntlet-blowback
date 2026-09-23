# Product Factory conversion consumer v1

Gauntlet is the conversion and portfolio-allocation layer for Hardware Splicer Product Factory outcomes.

The Product Factory may prove that a board works. It does **not** get to decide by itself that inventory should be purchased or that the product should be sold.

## Input

`hardware_splicer.product_factory_run.v1`

## Decisions

- `WAIT_ENGINEERING` — physical proof has not closed.
- `PHYSICAL_PROOF_FAILED` — preserve the exact failure as HS/Refinery evidence; no sale route.
- `BENCHMARK_REQUIRED` — the artifact works, but comparison against named incumbents has not closed.
- `ECONOMICS_REVIEW_REQUIRED` — realized COGS / proposed price / frozen margin floor are incomplete.
- `DOWNGRADE_TO_HS_EVIDENCE` — the run is useful evidence for Hardware Splicer, but the standalone hardware product should not be forced into market.
- `HUMAN_SELL_DECISION_READY` — physical proof, bounded benchmark and realized economics support preparing a commercial route. Final inventory/pricing/sale authority remains human.

## Full loop

```text
Refinery
  reviewed market structure
      |
      v
Spectator / current web evidence
  prices / specs / channels / complaints
      |
      v
Refinery commercial gate
      |
      v
Hardware Splicer Product Factory
  design -> verify -> source -> build -> prove -> benchmark
      |
      v
Gauntlet conversion consumer
  wait | kill product | preserve SaaS proof | prepare sale/pilot
      |
      v
human commercial decision
      |
      v
outcome receipt
      |
      +----> Refinery LEARN
      +----> HS empirical Product Factory evidence
```

A Product Factory run can therefore create value even when the hardware product is not launched: defects caught, engineering compression, cost misses and benchmark results remain empirical evidence for the HS SaaS/research thesis.
