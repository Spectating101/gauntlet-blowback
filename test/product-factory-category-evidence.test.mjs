import test from "node:test";
import assert from "node:assert/strict";

import {
  CATEGORY_LEVELS,
  evaluateProductFactoryCategoryEvidence,
} from "../src/product-factory/category-evidence.mjs";

function run(id, mode, {
  prove = true,
  benchmark = true,
  cogs = 30,
  paid = false,
  customer = false,
} = {}) {
  return {
    schema: "hardware_splicer.product_factory_run.v1",
    run_id: id,
    product_id: id.toLowerCase(),
    source_strategy: { selected_mode: mode },
    stages: [
      { id: "PROVE", state: prove ? "PASS_PHYSICAL" : "BLOCKED_ON_PHYSICAL_ARTIFACT" },
      { id: "BENCHMARK", state: benchmark ? "PASS" : "BLOCKED_ON_PHYSICAL_PROOF" },
    ],
    metrics: { realized_landed_cogs_usd: cogs },
    commercial_outcome: paid
      ? {
          paid: true,
          customer_outcome_id: customer ? `customer:${id}` : null,
        }
      : {},
  };
}

test("paper Product Factory contracts remain L0", () => {
  const result = evaluateProductFactoryCategoryEvidence([
    run("PF-001", "NEW_BUILD", { prove: false }),
    run("PF-002", "DONOR_RETROFIT", { prove: false }),
  ]);
  assert.equal(result.level, CATEGORY_LEVELS.L0_ARCHITECTURE_ONLY);
  assert.equal(result.physical_run_count, 0);
  assert.equal(result.claims.heterogeneous_repeatability_supported, false);
});

test("one real transformation is L1 only", () => {
  const result = evaluateProductFactoryCategoryEvidence([
    run("PF-001", "NEW_BUILD"),
  ]);
  assert.equal(result.level, CATEGORY_LEVELS.L1_ONE_PHYSICAL_TRANSFORMATION);
  assert.equal(result.authority.portfolio_repricing_review_allowed, true);
  assert.equal(result.claims.general_transformation_moat_proven, false);
});

test("three physical runs across multiple source modes reach L2", () => {
  const result = evaluateProductFactoryCategoryEvidence([
    run("PF-001", "NEW_BUILD"),
    run("PF-002", "DONOR_RETROFIT"),
    run("PF-003", "HYBRID"),
  ]);
  assert.equal(result.level, CATEGORY_LEVELS.L2_HETEROGENEOUS_REPEATABILITY);
  assert.deepEqual(result.distinct_source_modes, ["DONOR_RETROFIT", "HYBRID", "NEW_BUILD"]);
  assert.equal(result.claims.heterogeneous_repeatability_supported, true);
  assert.equal(result.claims.commercial_repeatability_supported, false);
});

test("paid outcomes must be benchmarked and customer-bound for L3", () => {
  const result = evaluateProductFactoryCategoryEvidence([
    run("PF-001", "NEW_BUILD", { paid: true, customer: true }),
    run("PF-002", "DONOR_RETROFIT", { paid: true, customer: true }),
    run("PF-003", "HYBRID"),
  ]);
  assert.equal(result.level, CATEGORY_LEVELS.L3_COMMERCIAL_REPEATABILITY);
  assert.equal(result.commercial_bound_run_count, 2);
  assert.equal(result.claims.commercial_repeatability_supported, true);
  assert.equal(result.claims.general_transformation_moat_proven, false);
});

test("same-mode repetition cannot masquerade as heterogeneous generality", () => {
  const result = evaluateProductFactoryCategoryEvidence([
    run("PF-001", "NEW_BUILD"),
    run("PF-004", "NEW_BUILD"),
    run("PF-005", "NEW_BUILD"),
  ]);
  assert.equal(result.level, CATEGORY_LEVELS.L1_ONE_PHYSICAL_TRANSFORMATION);
  assert.deepEqual(result.distinct_source_modes, ["NEW_BUILD"]);
});
