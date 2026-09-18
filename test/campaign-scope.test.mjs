import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import {
  campaignScopedRecords,
  portfolioCampaignScope,
  routeCampaignDecision,
} from '../src/allocation/campaign-scope.mjs';
import { rankGauntlet } from '../src/mission/operator.mjs';

const scope = portfolioCampaignScope();

test('campaign authority contains exactly the seven selected lead families', () => {
  assert.deepEqual(new Set(scope.active_lead_assets), new Set([
    'research-drive',
    'policy-lab',
    'nocturnal-oversight',
    'hardware-splicer',
    'public-good-control',
    'refinery-commons',
    'research-papers',
  ]));
  assert.deepEqual(new Set(scope.deferred_lead_assets), new Set(['cite-agent', 'sharpe-terminus', 'geomap-arbitrage']));
  assert.deepEqual(new Set(scope.support_only_assets), new Set(['citation-engine', 'gauntlet-blowback']));
});

test('active leads enter the campaign while deferred and support-only leads do not', () => {
  const active = { id: 'active', assets: 'Hardware Splicer', lane: 'COMPETITION', route_class: 'APPLY' };
  const deferred = { id: 'deferred', assets: 'Sharpe Terminus', lane: 'COMPETITION', route_class: 'APPLY' };
  const support = { id: 'support', assets: 'Citation Engine', lane: 'COMPETITION', route_class: 'APPLY' };
  assert.equal(routeCampaignDecision(active).included, true);
  assert.equal(routeCampaignDecision(deferred).included, false);
  assert.equal(routeCampaignDecision(support).included, false);
});

test('campaign filtering changes the execution surface without deleting the master registry', () => {
  const records = buildMasterRegistry();
  const scoped = campaignScopedRecords(records);
  assert.ok(scoped.length > 0);
  assert.ok(scoped.length < records.length);
  assert.ok(records.some((record) => routeCampaignDecision(record).role === 'DEFERRED_LEAD'));
  assert.ok(!scoped.some((record) => routeCampaignDecision(record).role === 'DEFERRED_LEAD'));
});

test('portfolio bakeoffs remain unresolved even when an active asset is provisionally named', () => {
  const decision = routeCampaignDecision({
    id: 'twnic-community-grant-2026-nocturnal',
    assets: 'Nocturnal|Citation Engine',
    lane: 'GRANT',
    route_class: 'APPLY',
  });
  assert.equal(decision.included, true);
  assert.equal(decision.role, 'ACTIVE_BAKEOFF');
  assert.equal(decision.allocation.allocation_clear, false);
});

test('ranked execution can enforce campaign scope without changing unscoped library analysis', () => {
  const records = [
    { id: 'sharpe-first', assets: 'Sharpe Terminus', status: 'FIRE_NOW', execution_state: 'APPLICATION_READY', deadline: 'ROLLING' },
    { id: 'paper-second', assets: 'Research papers', status: 'FIRE', execution_state: 'APPLICATION_READY', deadline: 'ROLLING' },
  ];
  assert.equal(rankGauntlet(records)[0].record.id, 'sharpe-first');
  assert.deepEqual(rankGauntlet(records, { campaignScope: true }).map(({ record }) => record.id), ['paper-second']);
});
