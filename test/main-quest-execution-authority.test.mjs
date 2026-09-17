import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const authority = JSON.parse(
  fs.readFileSync("data/main-quest-execution-authority-2026-09-17.json", "utf8"),
);

test("PhD and employment remain the terminal executable-now priorities", () => {
  assert.deepEqual(
    authority.terminal_priorities.map((campaign) => campaign.campaign_id),
    ["main-quest-a-funded-phd-options", "main-quest-b-employment-options"],
  );
  assert.ok(
    authority.terminal_priorities.every(
      (campaign) => campaign.state === "ACTIVE_INTERNAL_PREPARATION",
    ),
  );
});

test("Invisible Ledger cannot be promoted into settled thesis evidence", () => {
  const invisibleLedger = authority.asset_authority.find(
    (asset) => asset.asset_id === "invisible-ledger",
  );
  assert.equal(invisibleLedger.state, "UNRESOLVED_USER_OWNED_RESEARCH_OBJECT");
  assert.ok(
    invisibleLedger.forbidden_now.includes(
      "treating Invisible Ledger as the settled thesis",
    ),
  );
  assert.ok(
    invisibleLedger.forbidden_now.includes(
      "using it as a prerequisite for the whole PhD or employment campaign",
    ),
  );
});

test("existing Research Drive and Cite-Agent agents keep implementation ownership", () => {
  for (const assetId of ["research-drive", "cite-agent"]) {
    const asset = authority.asset_authority.find(
      (candidate) => candidate.asset_id === assetId,
    );
    assert.equal(asset.state, "OWNED_BY_EXISTING_PROJECT_AGENT");
    assert.ok(asset.forbidden_now.includes("parallel implementation by the Gauntlet operator"));
  }
});

test("internal preparation never authorizes external commitment", () => {
  const prohibited = authority.global_rules.join("\n");
  assert.match(prohibited, /does not authorize communication/);
  assert.match(prohibited, /External execution remains disabled/);
  for (const campaign of authority.terminal_priorities) {
    assert.ok(campaign.protected.includes("final submission"));
  }
});
