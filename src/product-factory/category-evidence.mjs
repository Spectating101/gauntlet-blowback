export const CATEGORY_LEVELS = Object.freeze({
  L0_ARCHITECTURE_ONLY: "L0_ARCHITECTURE_ONLY",
  L1_ONE_PHYSICAL_TRANSFORMATION: "L1_ONE_PHYSICAL_TRANSFORMATION",
  L2_HETEROGENEOUS_REPEATABILITY: "L2_HETEROGENEOUS_REPEATABILITY",
  L3_COMMERCIAL_REPEATABILITY: "L3_COMMERCIAL_REPEATABILITY",
});

function stageMap(run) {
  return new Map((run?.stages || []).map((stage) => [stage.id, stage]));
}

function passLike(state) {
  return String(state || "").startsWith("PASS");
}

function realizedCogs(run) {
  const metrics = run?.metrics || {};
  for (const key of [
    "realized_landed_cogs_usd",
    "realized_effective_cogs_usd",
    "realized_landed_cogs_twd",
    "realized_effective_cogs_twd",
  ]) {
    const value = Number(metrics[key]);
    if (Number.isFinite(value) && value > 0) return { key, value };
  }
  return null;
}

function sourceMode(run) {
  return String(
    run?.source_strategy?.selected_mode
      ?? run?.transformation?.source_mode
      ?? run?.metrics?.source_mode
      ?? "",
  ).trim();
}

function physicalRunEvidence(run) {
  if (!run || run.schema !== "hardware_splicer.product_factory_run.v1") return null;
  const stages = stageMap(run);
  if (!passLike(stages.get("PROVE")?.state)) return null;
  const cogs = realizedCogs(run);
  if (!cogs) return null;
  const mode = sourceMode(run);
  if (!mode) return null;

  return {
    run_id: run.run_id,
    product_id: run.product_id,
    source_mode: mode,
    realized_cogs_metric: cogs.key,
    realized_cogs: cogs.value,
    benchmark_passed: passLike(stages.get("BENCHMARK")?.state),
    paid_outcome: run?.commercial_outcome?.paid === true,
    customer_outcome_bound: Boolean(
      run?.commercial_outcome?.customer_outcome_id
      || run?.commercial_outcome?.receipt_id
    ),
  };
}

export function evaluateProductFactoryCategoryEvidence(runs) {
  if (!Array.isArray(runs)) {
    throw new Error("Product Factory category evidence requires an array of runs");
  }

  const physical = runs.map(physicalRunEvidence).filter(Boolean);
  const modes = [...new Set(physical.map((row) => row.source_mode))].sort();
  const commercial = physical.filter(
    (row) => row.paid_outcome && row.customer_outcome_bound && row.benchmark_passed,
  );

  let level = CATEGORY_LEVELS.L0_ARCHITECTURE_ONLY;
  if (physical.length >= 1) {
    level = CATEGORY_LEVELS.L1_ONE_PHYSICAL_TRANSFORMATION;
  }
  if (physical.length >= 3 && modes.length >= 2) {
    level = CATEGORY_LEVELS.L2_HETEROGENEOUS_REPEATABILITY;
  }
  if (
    physical.length >= 3
    && modes.length >= 2
    && commercial.length >= 2
  ) {
    level = CATEGORY_LEVELS.L3_COMMERCIAL_REPEATABILITY;
  }

  return {
    schema: "gauntlet.product_factory_category_evidence.v1",
    level,
    physical_run_count: physical.length,
    distinct_source_modes: modes,
    commercial_bound_run_count: commercial.length,
    qualifying_runs: physical,
    claims: {
      workflow_exists: true,
      one_physical_transformation_demonstrated:
        level !== CATEGORY_LEVELS.L0_ARCHITECTURE_ONLY,
      heterogeneous_repeatability_supported:
        level === CATEGORY_LEVELS.L2_HETEROGENEOUS_REPEATABILITY
        || level === CATEGORY_LEVELS.L3_COMMERCIAL_REPEATABILITY,
      commercial_repeatability_supported:
        level === CATEGORY_LEVELS.L3_COMMERCIAL_REPEATABILITY,
      general_transformation_moat_proven: false,
    },
    authority: {
      portfolio_repricing_review_allowed:
        level !== CATEGORY_LEVELS.L0_ARCHITECTURE_ONLY,
      automatic_investment_decision: false,
      automatic_product_sale_authority: false,
    },
    boundary:
      "This ladder controls claim/repricing review only. Even L3 does not automatically prove a moat, market leadership, investment value, or sale authority.",
  };
}
