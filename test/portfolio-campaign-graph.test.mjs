import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const graph = JSON.parse(fs.readFileSync(
  new URL('../data/portfolio-campaign-graph-2026-09-16.json', import.meta.url),
  'utf8',
));

const campaigns = graph.campaigns ?? [];
const byId = new Map(campaigns.map((campaign) => [campaign.campaign_id, campaign]));

test('portfolio campaign graph is assessment-only and explicitly open-world', () => {
  assert.equal(graph.schema, 'blowback.portfolio_campaign_graph.v1');
  assert.equal(graph.operating_mode, 'ASSESS_ONLY');
  assert.equal(graph.completeness.state, 'OPEN_WORLD_SEED');
  assert.match(graph.completeness.unmapped_item_policy, /may not enter an automatic execution queue/i);
});

test('campaign identifiers are unique and every campaign has an executable planning contract', () => {
  assert.equal(byId.size, campaigns.length);
  for (const campaign of campaigns) {
    assert.ok(campaign.desired_end_state, `${campaign.campaign_id}: desired_end_state`);
    assert.ok(campaign.current_stage, `${campaign.campaign_id}: current_stage`);
    assert.ok(campaign.current_decisive_gate, `${campaign.campaign_id}: current_decisive_gate`);
    assert.ok(campaign.completion_condition, `${campaign.campaign_id}: completion_condition`);
    assert.ok(Array.isArray(campaign.stop_conditions), `${campaign.campaign_id}: stop_conditions`);
    assert.ok(Array.isArray(campaign.route_instruments), `${campaign.campaign_id}: route_instruments`);
  }
});

test('all selected lead asset families have their own campaign instead of one systems bucket', () => {
  const required = [
    'system-cite-agent',
    'system-research-drive',
    'system-policy-lab',
    'system-nocturnal',
    'system-hardware-splicer',
    'system-public-good',
    'system-refinery-commons',
  ];
  for (const id of required) assert.ok(byId.has(id), id);
  assert.ok(campaigns.some((campaign) => campaign.campaign_type === 'ACADEMIC_ASSET'));
  assert.ok(byId.has('main-quest-funded-phd-options'));
  assert.ok(byId.has('main-quest-employment-options'));
  assert.ok(byId.has('main-quest-funded-research-appointments'));
  assert.ok(byId.has('crosscut-resource-acquisition'));
  assert.ok(byId.has('crosscut-market-pilots-and-revenue'));
});

test('route instruments state their campaign function and cannot claim FIRE in assess-only mode', () => {
  const allowedFunctions = new Set(graph.route_functions);
  const allowedPostures = new Set(graph.route_postures);
  for (const campaign of campaigns) {
    for (const route of campaign.route_instruments) {
      assert.ok(route.route_id, `${campaign.campaign_id}: route_id`);
      assert.ok(allowedFunctions.has(route.function), `${route.route_id}: ${route.function}`);
      assert.ok(allowedPostures.has(route.posture), `${route.route_id}: ${route.posture}`);
      assert.ok(!/FIRE/i.test(route.posture), `${route.route_id}: FIRE posture forbidden`);
      assert.ok(route.reason, `${route.route_id}: reason`);
    }
  }
});

test('readiness keeps campaign, asset, packet, portal, economics and authority separate', () => {
  assert.deepEqual(new Set(graph.readiness_axes), new Set([
    'asset_readiness',
    'campaign_usefulness',
    'packet_readiness',
    'portal_readiness',
    'economics_acceptability',
    'submission_authority',
  ]));
});

test('known upstream gates override tempting live routes', () => {
  const il = byId.get('academic-invisible-ledger');
  assert.equal(il.current_stage, 'EMPIRICAL_AUTHORITY_GATE');
  assert.equal(
    il.route_instruments.find((route) => route.route_id === 'shih-hsin-finance-2026-il').posture,
    'HOLD_INTERNAL_GATE',
  );

  const ceir = byId.get('academic-ceir');
  const esg = byId.get('academic-esg-rebrand');
  assert.equal(ceir.route_instruments.length, 0);
  assert.equal(esg.route_instruments.length, 0);
});
