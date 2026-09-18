import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import {
  auditCampaignCoverage,
  campaignRouteAssignment,
} from '../src/allocation/portfolio-campaign-graph.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));
const historicalById = new Map(buildMasterRegistry({ includeArchived: true }).map((record) => [record.id, record]));

test('campaign coverage accounts for every currently scoped route without authorizing execution', () => {
  const audit = auditCampaignCoverage(records);
  assert.equal(audit.assignments.length, audit.summary.campaign_scoped_routes);
  assert.equal(audit.summary.duplicate_master_route_ids, 0);
  assert.ok(audit.summary.duplicate_source_groups > 0);
  assert.ok(audit.summary.duplicate_opportunity_name_groups > 0);
  assert.equal(audit.summary.automatic_execution_allowed, 0);
  assert.ok(audit.summary.campaign_scoped_routes >= 100);
});

test('person-level routes belong to option campaigns while projects remain evidence providers', () => {
  const phd = campaignRouteAssignment(byId.get('phd-nycu-iais'));
  assert.equal(phd.primary_campaign_id, 'main-quest-funded-phd-options');
  assert.equal(phd.route_function, 'CAREER_CONVERT');

  const job = campaignRouteAssignment(byId.get('job-hku-ai-agents-aec-ra-2026'));
  assert.equal(job.primary_campaign_id, 'main-quest-funded-research-appointments');
  assert.ok(job.evidence_campaign_ids.includes('system-research-drive'));
});

test('resource and market outcomes remain visible without replacing asset ownership', () => {
  const access = campaignRouteAssignment(byId.get('openai-researcher-access-hardware-splicer'));
  assert.equal(access.primary_campaign_id, 'system-hardware-splicer');
  assert.equal(access.outcome_campaign_id, 'crosscut-resource-acquisition');
  assert.equal(access.route_function, 'RESOURCE_ACQUIRE');

  const pilot = campaignRouteAssignment(historicalById.get('outbound-publicgood-pilot'));
  assert.equal(pilot.primary_campaign_id, 'system-public-good');
  assert.equal(pilot.outcome_campaign_id, 'crosscut-market-pilots-and-revenue');
  assert.equal(pilot.route_function, 'PILOT_VALIDATE');
});

test('paper routes and portfolio bakeoffs fail into review instead of heuristic execution', () => {
  const paper = campaignRouteAssignment(historicalById.get('icdlt-2026-research-paper'));
  assert.equal(paper.assignment_state, 'NEEDS_CAMPAIGN_ASSIGNMENT');
  assert.ok(paper.data_quality_flags.includes('MISSING_PAPER_LEVEL_CAMPAIGN'));

  const bakeoff = campaignRouteAssignment(historicalById.get('twnic-community-grant-2026-nocturnal'));
  assert.equal(bakeoff.assignment_state, 'NEEDS_CAMPAIGN_ASSIGNMENT');
  assert.ok(bakeoff.data_quality_flags.includes('UNRESOLVED_PORTFOLIO_BAKEOFF'));
});

test('known stale route identifiers are surfaced as data debt', () => {
  const taxAcademy = campaignRouteAssignment(byId.get('tax-academy-sg-il'));
  assert.ok(taxAcademy.data_quality_flags.includes('STALE_ROUTE_ID_ASSET_ALIAS'));

  const ssi = campaignRouteAssignment(byId.get('ssi-fellowship-2027-policy-lab'));
  assert.equal(ssi.primary_campaign_id, 'main-quest-funded-research-appointments');
  assert.ok(ssi.evidence_campaign_ids.includes('system-refinery-commons'));
  assert.ok(ssi.data_quality_flags.includes('STALE_ROUTE_ID_ASSET_ALIAS'));
});
