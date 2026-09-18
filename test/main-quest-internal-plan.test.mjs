import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  internalBuildQueue,
  internalQuestStatus,
  nextInternalBuild,
} from '../src/main-quest/internal.mjs';

const planUrl = new URL('../data/main-quest-internal-execution-plan-2026-09-17.json', import.meta.url);
const plan = JSON.parse(fs.readFileSync(planUrl, 'utf8'));

test('main quest plan is an internal-build authority, not an execution authority', () => {
  assert.equal(plan.schema, 'blowback.main_quest_internal_execution_plan.v1');
  assert.equal(plan.operating_mode, 'INTERNAL_BUILD_ONLY');
  assert.equal(plan.external_execution_authorized, false);
});

test('the three terminal main quests remain distinct', () => {
  assert.deepEqual(
    plan.main_quests.map((quest) => quest.id).sort(),
    ['employment_options', 'funded_phd_options', 'funded_research_appointments'],
  );

  for (const quest of plan.main_quests) {
    assert.ok(quest.internal_work_authorized.length > 0, `${quest.id}: internal work`);
    assert.ok(quest.external_work_forbidden.includes('submission'), `${quest.id}: submission gate`);
  }
});

test('active, supporting and deferred asset lanes are explicit and non-overlapping', () => {
  const active = plan.active_asset_advancement.map((item) => item.asset_id).sort();
  assert.deepEqual(active, [
    'hardware-splicer',
    'policy-lab',
    'public-good-control',
    'refinery-commons',
    'research-drive',
    'research-papers',
  ]);
  assert.deepEqual(plan.support_only_assets.sort(), ['citation-engine', 'gauntlet-blowback']);
  assert.deepEqual(plan.deferred_assets.sort(), ['cite-agent', 'geomap-arbitrage', 'nocturnal-oversight', 'sharpe-terminus']);

  const all = [...active, ...plan.support_only_assets, ...plan.deferred_assets];
  assert.equal(new Set(all).size, all.length);
});

test('every active asset has a bounded objective and acceptance contract', () => {
  for (const item of plan.active_asset_advancement) {
    assert.ok(Number.isInteger(item.priority), `${item.asset_id}: priority`);
    assert.ok(
      ['IN_PROGRESS_INTERNAL', 'READY_INTERNAL_BUILD'].includes(item.state),
      `${item.asset_id}: state`,
    );
    assert.ok(item.objective, `${item.asset_id}: objective`);
    assert.ok(item.acceptance, `${item.asset_id}: acceptance`);
  }
});

test('internal queue is deterministic and cannot be confused with an external mission', () => {
  const queue = internalBuildQueue();
  assert.equal(queue.schema, 'blowback.main_quest_internal_queue.v1');
  assert.equal(queue.external_execution_authorized, false);
  assert.equal(queue.items[0].asset_id, 'research-drive');
  assert.equal(queue.items[0].state, 'IN_PROGRESS_INTERNAL');
  assert.deepEqual(queue.items.map((item) => item.priority), [10, 20, 30, 40, 50, 60]);
  for (const item of queue.items) {
    assert.ok(item.repository, `${item.asset_id}: repository`);
    assert.ok(item.forbidden_actions.includes('application or submission'));
    assert.ok(item.forbidden_actions.includes('claiming external validation from internal work'));
  }
});

test('internal queue respects a bounded limit', () => {
  const queue = internalBuildQueue({ limit: 3 });
  assert.equal(queue.count, 3);
  assert.deepEqual(queue.items.map((item) => item.asset_id), [
    'research-drive',
    'hardware-splicer',
    'policy-lab',
  ]);
});

test('internal next and status expose the same bounded first mission', () => {
  const next = nextInternalBuild();
  const status = internalQuestStatus();
  assert.equal(next.mission.asset_id, 'research-drive');
  assert.equal(status.next.asset_id, 'research-drive');
  assert.equal(status.shared_deliverables_state, 'DRAFT_BUILT_REVIEW_REQUIRED');
  assert.equal(status.external_execution_authorized, false);
});

test('all internal Main Quest deliverables exist', () => {
  for (const relativePath of plan.shared_deliverables) {
    const url = new URL(`../${relativePath}`, import.meta.url);
    assert.ok(fs.existsSync(url), relativePath);
    const content = fs.readFileSync(url, 'utf8');
    assert.ok(content.length > 500, `${relativePath}: substantive content`);
  }
});

test('the plan preserves evidence and external-action boundaries', () => {
  assert.ok(plan.evidence_rules.includes('Internal verification never becomes external validation.'));
  assert.ok(plan.evidence_rules.includes('No external action is implied by internal packet readiness.'));

  const planText = fs.readFileSync(planUrl, 'utf8');
  assert.doesNotMatch(planText, /"external_execution_authorized"\s*:\s*true/);
  assert.doesNotMatch(planText, /"operating_mode"\s*:\s*"(?:FIRE|EXECUTE|SUBMIT)/);
});
