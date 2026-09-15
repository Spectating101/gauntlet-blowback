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
const programsById = new Map((campaign.programs ?? []).map((item) => [item.id, item]));

test('academic campaign is explicitly scoped away from Main Quest placement', () => {
  assert.equal(campaign.schema, 'blowback.academic_conversion_campaign.v1');
  assert.equal(campaign.scope.main_quest_relationship, 'UPSTREAM_EVIDENCE_PRODUCER');
  assert.ok(campaign.scope.excludes.includes('phd'));
  assert.ok(campaign.scope.excludes.includes('job'));
  assert.equal(campaign.doctrine.calendar_entry_is_not_plan, true);
  assert.equal(campaign.doctrine.research_asset_is_planning_unit, true);
});

test('CL-ECI program preserves ECI, CL and synthesis as distinct research objects', () => {
  const program = programsById.get('program-cl-eci');
  const eci = campaignsById.get('academic-eci');
  const cl = campaignsById.get('academic-cl');
  const synthesis = campaignsById.get('academic-cl-eci-synthesis');

  assert.ok(program);
  assert.ok(eci);
  assert.ok(cl);
  assert.ok(synthesis);
  assert.deepEqual(program.child_campaigns, [
    'academic-eci',
    'academic-cl',
    'academic-cl-eci-synthesis'
  ]);
  assert.equal(eci.asset, 'When Does Energy Track the Real Economy?');
  assert.match(cl.asset, /Constrained Ledger/);
  assert.equal(synthesis.asset, 'From Energy Signals to Constrained Claims');
  assert.notEqual(eci.id, cl.id);
  assert.notEqual(cl.id, synthesis.id);
  assert.equal(campaign.doctrine.duplicate_publication_requires_explicit_overlap_check, true);
});

test('CL-ECI synthesis owns the primary FC27 manuscript and records the live deadline correction', () => {
  const synthesis = campaignsById.get('academic-cl-eci-synthesis');
  const fc27 = synthesis.routes.find((route) => route.route_id === 'fc27-cl-eci');
  const ftsid = synthesis.routes.find((route) => route.route_id === 'ftsid-2026-cl-eci');

  assert.ok(fc27);
  assert.ok(ftsid);
  assert.equal(fc27.primary, true);
  assert.equal(fc27.role, 'PUBLISH');
  assert.equal(fc27.current_deadline_override, '2026-09-24');
  assert.match(fc27.current_source_state, /REVERIFIED_2026-09-16/);
  assert.equal(ftsid.fallback, true);
  assert.equal(ftsid.blocked_by, 'FC27_PRIMARY_MANUSCRIPT_DECISION');

  // The plan deliberately records the live official correction while the older
  // master registry still carries the previous date. Do not silently normalize
  // this discrepancy away until route truth is reconciled separately.
  assert.equal(masterById.get('fc27-cl-eci').deadline, '2026-09-17');
});

test('ECI preserves a standalone measurement lane and does not treat expired GRASFI as live', () => {
  const eci = campaignsById.get('academic-eci');
  assert.equal(eci.stage, 'STANDALONE_MANUSCRIPT_REVALIDATION');
  assert.deepEqual(eci.routes, []);
  assert.equal(eci.historical_routes.length, 1);
  assert.equal(eci.historical_routes[0].route_id, 'grasfi-asia-2027-eci');
  assert.match(eci.historical_routes[0].status, /DEADLINE_PASSED/);
});

test('CL keeps only conditional architecture derivatives until its independent contribution is frozen', () => {
  const cl = campaignsById.get('academic-cl');
  assert.equal(cl.stage, 'ARCHITECTURE_LANE_SELECTION');
  const wu = cl.routes.find((route) => route.route_id === 'wu-tax-tech-2027-il-cl');
  assert.ok(wu);
  assert.equal(wu.conditional, true);
  assert.equal(wu.role, 'CROSS_DOMAIN_STRESS_TEST');
});

test('DT and IL remain separate active academic campaigns with different stage logic', () => {
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

test('every live academic route reference resolves to canonical Gauntlet route truth', () => {
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

test('portfolio WIP policy includes the CL-ECI program lanes plus DT and IL', () => {
  assert.deepEqual(campaign.portfolio_rules.active_outward_campaigns, [
    'academic-cl-eci-synthesis',
    'academic-eci',
    'academic-cl',
    'academic-fiscal-choke-points',
    'academic-invisible-ledger'
  ]);
  assert.equal(campaign.portfolio_rules.primary_integrated_manuscript, 'academic-cl-eci-synthesis');
  assert.equal(
    campaign.portfolio_rules.default_new_project_policy,
    'NO_ACADEMIC_CAMPAIGN_UNTIL_SEPARABLE_RESEARCH_OBJECT_EXISTS'
  );
});
