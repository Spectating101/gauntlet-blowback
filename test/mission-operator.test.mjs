import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import { buildBrowserMission, nextBrowserMission, rankGauntlet } from '../src/mission/operator.mjs';
import { persistCheckpoint, validateCheckpoint } from '../src/mission/checkpoint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATE_DIR = path.join(ROOT, '.blowback', 'missions');

function record(overrides = {}) {
  return {
    id: 'route-a',
    lane: 'RESEARCH',
    organization: 'Example Venue',
    opportunity: 'Example Submission',
    route_class: 'RESEARCH',
    assets: 'Policy Lab',
    contribution_view: 'CL-ECI',
    status: 'FIRE_NOW',
    execution_state: 'PORTAL_RECON_REQUIRED',
    deadline: '2026-08-31',
    gate: '',
    shared_evidence_family: 'policy-lab-family',
    mutual_exclusion_group: '',
    parent_route: '',
    source_state: 'VERIFIED',
    source: 'https://example.org/apply',
    origin: 'test',
    ...overrides,
  };
}

test('browser mission delegates adaptive navigation to Codex and gates commitments', () => {
  const mission = buildBrowserMission(record());
  assert.equal(mission.browser.adaptive_navigation_required, true);
  assert.equal(mission.browser.hardcoded_portal_recipe_required, false);
  assert.ok(mission.permissions.auto.includes('reversible_next_continue_back_open_edit_actions'));
  assert.ok(mission.permissions.auto.includes('save_draft'));
  assert.ok(mission.permissions.human_gate.includes('final_submit_send_apply_confirm'));
  assert.ok(mission.permissions.forbidden.includes('bypass_captcha_or_antibot'));
});

test('advisor and team dependencies become explicit human gates', () => {
  const mission = buildBrowserMission(record({ gate: 'advisor + team required' }));
  assert.ok(mission.permissions.human_gate.includes('advisor_commitment'));
  assert.ok(mission.permissions.human_gate.includes('team_commitment'));
});

test('rankGauntlet prefers immediate FIRE over WATCH and KILL', () => {
  const ranked = rankGauntlet([
    record({ id: 'watch', status: 'WATCH', deadline: '2026-08-28' }),
    record({ id: 'fire', status: 'FIRE_NOW', deadline: '2026-09-01' }),
    record({ id: 'kill', status: 'KILL', deadline: '2026-08-27' }),
  ], { asOf: '2026-08-20T00:00:00Z' });
  assert.deepEqual(ranked.map((item) => item.record.id), ['fire', 'watch']);
});

test('rankGauntlet dispatches a near-deadline packaged route before a rolling research-only lead', () => {
  const ranked = rankGauntlet([
    record({
      id: 'rolling-research-only',
      lane: 'JOB',
      status: 'FIRE_NOW',
      execution_state: 'RESEARCH_ONLY',
      deadline: 'ROLLING',
    }),
    record({
      id: 'taai-packet',
      lane: 'COMPETITION',
      status: 'FIRE_NOW',
      execution_state: 'PACKET_READY',
      deadline: '2026-09-14T23:59:00-12:00',
    }),
  ], { asOf: '2026-09-12T00:00:00Z' });
  assert.deepEqual(ranked.map((item) => item.record.id), ['taai-packet', 'rolling-research-only']);
});

test('WAITING_HUMAN route does not freeze next dispatch', (t) => {
  const pausedRouteId = '__test_waiting_human__';
  const checkpointFile = path.join(STATE_DIR, `${pausedRouteId}.json`);
  fs.rmSync(checkpointFile, { force: true });
  t.after(() => fs.rmSync(checkpointFile, { force: true }));
  persistCheckpoint({
    mission_id: `mission:${pausedRouteId}`,
    route_id: pausedRouteId,
    status: 'WAITING_HUMAN',
    stage: 'FINAL_REVIEW',
    human_required: ['final submit'],
  });
  const ranked = rankGauntlet([
    record({ id: pausedRouteId, status: 'FIRE_NOW' }),
    record({ id: 'route-b', status: 'FIRE', deadline: '2026-09-01' }),
  ], { asOf: '2026-08-20T00:00:00Z' });
  assert.deepEqual(ranked.map((item) => item.record.id), ['route-b']);
});

test('rankGauntlet excludes expired hard deadlines but keeps today and rolling routes', () => {
  const ranked = rankGauntlet([
    record({ id: 'expired', deadline: '2026-09-09' }),
    record({ id: 'today', deadline: '2026-09-10' }),
    record({ id: 'rolling', deadline: 'ROLLING' }),
  ], { asOf: '2026-09-10T12:00:00Z' });
  assert.deepEqual(ranked.map((item) => item.record.id), ['today', 'rolling']);
});

test('rankGauntlet can include expired routes for explicit historical access', () => {
  const ranked = rankGauntlet([
    record({ id: 'expired', deadline: '2026-09-09' }),
  ], { asOf: '2026-09-10T12:00:00Z', includeExpired: true });
  assert.deepEqual(ranked.map((item) => item.record.id), ['expired']);
});

test('generic automatic dispatch respects the same named-route pause as FIRE', () => {
  const paused = record({
    id: 'shih-hsin-finance-2026-il',
    status: 'FIRE_NOW',
    execution_state: 'PACKET_READY',
    deadline: '2026-09-17',
  });
  const safe = record({ id: 'route-b', status: 'FIRE', deadline: '2026-09-20' });
  const ranked = rankGauntlet([paused, safe], { asOf: '2026-09-17T00:00:00Z' });
  assert.deepEqual(ranked.map((item) => item.record.id), ['route-b']);

  const manual = rankGauntlet([paused], {
    asOf: '2026-09-17T00:00:00Z',
    includeAutomaticQueueExcluded: true,
  });
  assert.deepEqual(manual.map((item) => item.record.id), ['shih-hsin-finance-2026-il']);
});

test('checkpoint rejects secret-bearing payloads', () => {
  assert.throws(() => validateCheckpoint({
    mission_id: 'mission:route-a',
    route_id: 'route-a',
    status: 'IN_PROGRESS',
    stage: 'LOGIN',
    password: 'do-not-store-this',
  }), /may not store secrets/);
});

test('checkpoint accepts resumable non-secret browser state', () => {
  const checkpoint = validateCheckpoint({
    mission_id: 'mission:route-a',
    route_id: 'route-a',
    status: 'WAITING_HUMAN',
    stage: 'FINAL_REVIEW',
    current_url: 'https://example.org/review',
    completed_actions: ['metadata_completed', 'files_uploaded'],
    human_required: ['final submit'],
  });
  assert.equal(checkpoint.status, 'WAITING_HUMAN');
  assert.deepEqual(checkpoint.completed_actions, ['metadata_completed', 'files_uploaded']);
});

test('real master registry produces a Codex browser mission', () => {
  const [record] = buildMasterRegistry();
  const mission = buildBrowserMission(record);
  assert.ok(mission?.route_id);
  assert.equal(mission.browser.adaptive_navigation_required, true);
  assert.equal(mission.browser.hardcoded_portal_recipe_required, false);
});
