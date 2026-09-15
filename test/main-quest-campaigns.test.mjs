import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const campaigns = JSON.parse(
  fs.readFileSync(new URL('../data/main-quest-campaigns-2026-09-16.json', import.meta.url), 'utf8'),
);

test('Main Quest is represented as terminal campaigns plus support campaigns', () => {
  assert.equal(campaigns.schema, 'gauntlet.main_quest_campaigns.v1');
  assert.equal(campaigns.terminal_campaigns.length, 2);
  assert.deepEqual(
    campaigns.terminal_campaigns.map((campaign) => campaign.campaign_id),
    ['main-quest-a-funded-phd-options', 'main-quest-b-employment-options'],
  );
  assert.equal(campaigns.support_campaigns.length, 3);
});

test('campaign architecture preserves census-first execution', () => {
  assert.match(campaigns.authority.rules.join(' '), /Discover broadly/);
  assert.match(campaigns.authority.rules.join(' '), /Priority controls sequence, not census inclusion/);
  assert.match(campaigns.execution_principle, /Build shared assets first/);
});

test('PhD and employment campaigns bind to the complete census', () => {
  const phd = campaigns.terminal_campaigns.find((campaign) => campaign.campaign_id === 'main-quest-a-funded-phd-options');
  const jobs = campaigns.terminal_campaigns.find((campaign) => campaign.campaign_id === 'main-quest-b-employment-options');
  assert.match(phd.input_universe, /61 Taiwan PhD routes/);
  assert.match(jobs.input_universe, /88 Taiwan employment routes/);
  assert.equal(jobs.role_families.length, 5);
});

test('support campaigns manufacture evidence instead of replacing terminal outcomes', () => {
  const academic = campaigns.support_campaigns.find((campaign) => campaign.campaign_id === 'support-academic-evidence-factory');
  const systems = campaigns.support_campaigns.find((campaign) => campaign.campaign_id === 'support-systems-evidence-factory');
  const economics = campaigns.support_campaigns.find((campaign) => campaign.campaign_id === 'support-economics-and-runway');
  assert.deepEqual(academic.priority_order, [
    'Fiscal Choke Points / DT',
    'Invisible Ledger',
    'CEIR / Energy Anchoring',
    'ESG Rebrand',
  ]);
  assert.ok(systems.assets.some((asset) => asset.asset === 'Refinery'));
  assert.equal(economics.coverage_target, '149/149 Main Quest routes represented economically');
});

test('shared infrastructure is explicitly reusable across route families', () => {
  const objects = campaigns.shared_infrastructure.map((item) => item.object);
  for (const required of ['master_identity_packet', 'evidence_registry', 'recommender_packet', 'route_delta_sheet', 'decision_ledger']) {
    assert.ok(objects.includes(required), `missing shared object ${required}`);
  }
});
