export const PF_OUTCOMES = Object.freeze({
  WAIT_ENGINEERING: "WAIT_ENGINEERING",
  PHYSICAL_PROOF_FAILED: "PHYSICAL_PROOF_FAILED",
  BENCHMARK_REQUIRED: "BENCHMARK_REQUIRED",
  ECONOMICS_REVIEW_REQUIRED: "ECONOMICS_REVIEW_REQUIRED",
  HUMAN_SELL_DECISION_READY: "HUMAN_SELL_DECISION_READY",
  DOWNGRADE_TO_HS_EVIDENCE: "DOWNGRADE_TO_HS_EVIDENCE",
});

function stageMap(run) {
  return new Map((run?.stages || []).map((stage) => [stage.id, stage]));
}

function passLike(state) {
  return String(state || "").startsWith("PASS");
}

export function evaluateProductFactoryOutcome(run) {
  if (!run || run.schema !== "hardware_splicer.product_factory_run.v1") {
    throw new Error("unsupported Product Factory run schema");
  }

  const stages = stageMap(run);
  const prove = stages.get("PROVE");
  const benchmark = stages.get("BENCHMARK");
  const sell = stages.get("SELL");
  const metrics = run.metrics || {};
  const authority = run.authority || {};

  if (authority.physical_authority_granted === true && !passLike(prove?.state)) {
    throw new Error("physical authority cannot be open without a passed PROVE stage");
  }

  if (String(prove?.state || "").includes("FAIL")) {
    return {
      schema: "gauntlet.product_factory_conversion.v1",
      run_id: run.run_id,
      product_id: run.product_id,
      decision: PF_OUTCOMES.PHYSICAL_PROOF_FAILED,
      external_conversion_authorized: false,
      product_sale_authorized: false,
      preserve_as_hs_evidence: true,
      next_action: "Record exact physical failure, feed it back to HS/Refinery LEARN, and do not open a sale route.",
    };
  }

  if (!passLike(prove?.state)) {
    return {
      schema: "gauntlet.product_factory_conversion.v1",
      run_id: run.run_id,
      product_id: run.product_id,
      decision: PF_OUTCOMES.WAIT_ENGINEERING,
      external_conversion_authorized: false,
      product_sale_authorized: false,
      preserve_as_hs_evidence: true,
      next_action: "Keep conversion closed until revision-bound physical proof exists.",
    };
  }

  if (!passLike(benchmark?.state)) {
    return {
      schema: "gauntlet.product_factory_conversion.v1",
      run_id: run.run_id,
      product_id: run.product_id,
      decision: PF_OUTCOMES.BENCHMARK_REQUIRED,
      external_conversion_authorized: false,
      product_sale_authorized: false,
      preserve_as_hs_evidence: true,
      next_action: "Benchmark the proven artifact against the named incumbent set before commercial conversion.",
    };
  }

  const realizedCogs = Number(metrics.realized_landed_cogs_usd ?? metrics.landed_cogs_ceiling_usd ?? NaN);
  const proposedPrice = Number(metrics.proposed_sale_price_usd ?? metrics.target_msrp_usd ?? NaN);
  const floor = Number(metrics.target_min_gross_margin_fraction ?? NaN);
  const grossMargin = Number.isFinite(realizedCogs) && Number.isFinite(proposedPrice) && proposedPrice > 0
    ? 1 - realizedCogs / proposedPrice
    : NaN;

  if (!Number.isFinite(grossMargin) || !Number.isFinite(floor)) {
    return {
      schema: "gauntlet.product_factory_conversion.v1",
      run_id: run.run_id,
      product_id: run.product_id,
      decision: PF_OUTCOMES.ECONOMICS_REVIEW_REQUIRED,
      external_conversion_authorized: false,
      product_sale_authorized: false,
      preserve_as_hs_evidence: true,
      next_action: "Add realized landed COGS, proposed selling price, and the frozen gross-margin floor.",
    };
  }

  const benchmarkVerdict = String(run.benchmark?.verdict || "");
  const commercialCaseSupported =
    benchmarkVerdict === "COMMERCIAL_CASE_SUPPORTED" &&
    grossMargin >= floor;

  if (!commercialCaseSupported) {
    return {
      schema: "gauntlet.product_factory_conversion.v1",
      run_id: run.run_id,
      product_id: run.product_id,
      decision: PF_OUTCOMES.DOWNGRADE_TO_HS_EVIDENCE,
      external_conversion_authorized: false,
      product_sale_authorized: false,
      preserve_as_hs_evidence: true,
      computed: { gross_margin_fraction: Number(grossMargin.toFixed(4)), floor },
      next_action: "Do not force a product launch. Preserve the run as empirical HS Product Factory evidence and feed the outcome back to Refinery.",
    };
  }

  if (passLike(sell?.state)) {
    throw new Error("SELL may not already be PASS before Gauntlet human commercial decision");
  }

  return {
    schema: "gauntlet.product_factory_conversion.v1",
    run_id: run.run_id,
    product_id: run.product_id,
    decision: PF_OUTCOMES.HUMAN_SELL_DECISION_READY,
    external_conversion_authorized: true,
    product_sale_authorized: false,
    preserve_as_hs_evidence: true,
    computed: { gross_margin_fraction: Number(grossMargin.toFixed(4)), floor },
    required_human_decision: true,
    next_action: "Prepare the truthful sale/pilot packet. Human approval is still required before inventory commitment, pricing publication, purchase, or sale.",
  };
}
