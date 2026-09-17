import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildMasterRegistry } from "../scripts/build-gauntlet-master.mjs";

const project = JSON.parse(fs.readFileSync("examples/projects/policy-lab.json", "utf8"));
const assets = JSON.parse(fs.readFileSync("data/portfolio-assets.json", "utf8")).assets;
const campaign = JSON.parse(
  fs.readFileSync("data/policy-lab-conversion-campaign-2026-09-17.json", "utf8"),
);
const routes = new Map(buildMasterRegistry().map((route) => [route.id, route]));

test("Policy Lab canonical and candidate revisions remain distinct", () => {
  assert.equal(project.canonical_repo_snapshot, "55fd6f2cf2eed25b589e91b5e3161e6ced68f5de");
  assert.equal(project.effective_candidate_snapshot, "2dd92d85d26f8afdf3df0b0f8df927b5cef9f37c");
  assert.notEqual(project.canonical_repo_snapshot, project.effective_candidate_snapshot);
  assert.equal(campaign.source_truth.candidate_is_canonical, false);
});

test("Policy Lab remains internally validated without external evidence", () => {
  const asset = assets.find((candidate) => candidate.id === "policy-lab");
  assert.equal(asset.implementation_stage, "internally_validated");
  assert.equal(asset.external_evidence_stage, "none");
  assert.equal(asset.deployment_stage, "public_demo");
  assert.equal(asset.canonicalization_state, "release_branch_ahead");
  assert.notEqual(project.submission_state, "PORTAL_READY");
});

test("public data and internal checks cannot close external Policy Lab gates", () => {
  assert.ok(campaign.evidence_gates.G2.not_evidence.includes("public Ausgrid reproduction"));
  assert.ok(campaign.evidence_gates.G1.not_evidence.includes("internal CI"));
  assert.ok(campaign.evidence_gates.G3.not_evidence.includes("internal review"));
  assert.ok(campaign.evidence_gates.G4.not_evidence.includes("internal case"));
});

test("stale Policy Lab routes cannot remain ready or fire", () => {
  assert.equal(routes.get("gaf-2026-policy-lab").status, "CLOSED_2026");
  assert.equal(routes.get("gaf-2026-policy-lab").execution_state, "BLOCKED");
  assert.equal(routes.get("dpg-policy-lab").status, "HOLD_CANONICAL_RELEASE");
  assert.equal(routes.get("dpg-policy-lab").execution_state, "DEPENDENCY_RECON_REQUIRED");
  assert.equal(campaign.route_posture.issue_49_leads, "RESEARCHED_LEAD_NOT_READY_OR_FIRE");
});
