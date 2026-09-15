import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const campaign = JSON.parse(
  fs.readFileSync(new URL('../data/academic-conversion-campaign-2026-09-16.json', import.meta.url), 'utf8')
);
const master = buildMasterRegistry();
const masterById = new Map(master.map((record) => [record.id, record]));
const campaignsById = new Map(campaign.campaigns.map((item) => [item.id, item]));

test('academic campaign is explicitly scoped away from Main Quest placement', () => {
  assert.equal(campaign.schema, 'blowback.academic_conversion_campaign.v1');
  assert.equal(campaign.scope.main_quest_relationship, 'UPSTREAM_EVIDENCE_PRODUCER');
  assert.ok(campaign.scope.excludes.includes('phd'));
  assert.ok(campaign.scope.excludes.includes('job'));
  assert.equal(campaign.doctrine.calendar_entry_is_not_plan, true);
  assert.equal(campaign.doctrine.research_asset_is_planning_unit, true);
});

test('DT and IL are separate active academic campaigns with different stage logic', () => {
  const dt = campaignsById.get('academic-fiscal-choke-points');
  const il = campaignsById.get('academic-invisible-ledger');

  assert.ok(dt);
  assert.ok(il);
  assert.equal(dt.asset, 'Fiscal Choke Points');
  assert.equal(dt.stage, 'EXTERNAL_VALIDATION');
  assert.equal(il.asset, 'Invisible Ledger');
  assert.equal(il.stage, 'EMPIRICAL_AUTHORITY_GATE');
  assert.notEqual(dt.id, il.id);

  const ilSase = il.routes.find((route) => route.route_id === 'sase-2027-invisible-ledger');
  assert.equal(ilSase.blocked_by, 'ISSUER_SAMPLE_PERIMETER_DECISION');
});

test('every academic route reference resolves to canonical Gauntlet route truth', () => {
  const allowedRoles = new Set(campaign.route_roles);
  for (const academicCampaign of campaign.campaigns) {
    for (const route of academicCampaign.routes) {
      assert.ok(masterById.has(route.route_id), `missing canonical route ${route.route_id}`);
      assert.ok(allowedRoles.has(route.role), `invalid role ${route.role} on ${route.route_id}`);
    }
  }
});

test('DT routes have plan roles rather than behaving as a flat calendar', () => {
  const dt = campaignsById.get('academic-fiscal-choke-points');
  const roles = new Set(dt.routes.map((route) => route.role));
  assert.ok(roles.has('FUND_EXTEND'));
  assert.ok(roles.has('SPECIALIST_VALIDATE'));
  assert.ok(roles.has('CROSS_DOMAIN_STRESS_TEST'));
  assert.ok(roles.has('PUBLISH'));

  const taxAcademy = dt.routes.find((route) => route.route_id === 'tax-academy-sg-il');
  assert.equal(taxAcademy.role, 'FUND_EXTEND');
  assert.equal(masterById.get('atta-2027-fiscal-choke-points').deadline, '2026-10-12');
});

test('queued secondary papers cannot accumulate external routes before research gates clear', () => {
  for (const id of ['academic-ceir-energy-anchoring', 'academic-esg-rebrand']) {
    const item = campaignsById.get(id);
    assert.ok(item);
    assert.equal(item.state, 'QUEUED');
    assert.equal(item.stage, 'INTERNAL_RESEARCH_UPGRADE');
    assert.equal(item.route_discovery_allowed, false);
    assert.deepEqual(item.routes, []);
  }
});

test('portfolio WIP policy names only DT and IL as active outward campaigns', () => {
  assert.deepEqual(campaign.portfolio_rules.active_outward_campaigns, [
    'academic-fiscal-choke-points',
    'academic-invisible-ledger'
  ]);
  assert.equal(
    campaign.portfolio_rules.default_new_project_policy,
    'NO_ACADEMIC_CAMPAIGN_UNTIL_SEPARABLE_RESEARCH_OBJECT_EXISTS'
  );
});
