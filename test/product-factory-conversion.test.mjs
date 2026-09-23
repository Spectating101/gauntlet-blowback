import test from "node:test";
import assert from "node:assert/strict";

import { evaluateProductFactoryOutcome, PF_OUTCOMES } from "../src/product-factory/triage.mjs";
import fixture from "../examples/product-factory/pf-outcome-fixture.json" with { type: "json" };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("commercially supported proven run becomes human sell decision ready", () => {
  const result = evaluateProductFactoryOutcome(clone(fixture));
  assert.equal(result.decision, PF_OUTCOMES.HUMAN_SELL_DECISION_READY);
  assert.equal(result.external_conversion_authorized, true);
  assert.equal(result.product_sale_authorized, false);
  assert.equal(result.required_human_decision, true);
});

test("physical failure never opens conversion", () => {
  const run = clone(fixture);
  run.stages.find((stage) => stage.id === "PROVE").state = "FAIL_PHYSICAL";
  run.authority.physical_authority_granted = false;
  const result = evaluateProductFactoryOutcome(run);
  assert.equal(result.decision, PF_OUTCOMES.PHYSICAL_PROOF_FAILED);
  assert.equal(result.external_conversion_authorized, false);
  assert.equal(result.preserve_as_hs_evidence, true);
});

test("proof without benchmark waits for benchmark", () => {
  const run = clone(fixture);
  run.stages.find((stage) => stage.id === "BENCHMARK").state = "BLOCKED_ON_PHYSICAL_PROOF";
  const result = evaluateProductFactoryOutcome(run);
  assert.equal(result.decision, PF_OUTCOMES.BENCHMARK_REQUIRED);
  assert.equal(result.product_sale_authorized, false);
});

test("failed commercial economics downgrades to HS evidence instead of forcing sale", () => {
  const run = clone(fixture);
  run.metrics.realized_landed_cogs_usd = 50;
  const result = evaluateProductFactoryOutcome(run);
  assert.equal(result.decision, PF_OUTCOMES.DOWNGRADE_TO_HS_EVIDENCE);
  assert.equal(result.external_conversion_authorized, false);
  assert.equal(result.preserve_as_hs_evidence, true);
});

test("weak benchmark downgrades even with good margin", () => {
  const run = clone(fixture);
  run.benchmark.verdict = "NO_CLEAR_COMMERCIAL_ADVANTAGE";
  const result = evaluateProductFactoryOutcome(run);
  assert.equal(result.decision, PF_OUTCOMES.DOWNGRADE_TO_HS_EVIDENCE);
});

test("upstream physical authority cannot be open before PROVE passes", () => {
  const run = clone(fixture);
  run.stages.find((stage) => stage.id === "PROVE").state = "BLOCKED_ON_PHYSICAL_ARTIFACT";
  assert.throws(
    () => evaluateProductFactoryOutcome(run),
    /physical authority cannot be open/,
  );
});

test("SELL cannot be pre-passed before Gauntlet human decision", () => {
  const run = clone(fixture);
  run.stages.find((stage) => stage.id === "SELL").state = "PASS";
  assert.throws(
    () => evaluateProductFactoryOutcome(run),
    /SELL may not already be PASS/,
  );
});
