import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const consumerPath = path.join(root, 'data', 'hs-competitive-feedback-consumer-v1.json');
const consumer = JSON.parse(fs.readFileSync(consumerPath, 'utf8'));

const EXPECTED_DECISIONS = new Set([
  'IMPROVE_HS_SHELL',
  'IMPROVE_HS_WORKFLOW',
  'INTEGRATE_NOT_REBUILD',
  'RESEARCH_GATE',
  'INVESTIGATE_CORE_CHANGE',
  'HOLD_FOR_EVIDENCE',
  'OBSERVE',
  'OBSERVE_OR_ROUTE_ELSEWHERE',
]);

test('competitive consumer is bound to Hardware-Splicer and Refinery policy', () => {
  assert.equal(consumer.schema_version, 1);
  assert.equal(consumer.subject_project, 'hardware-splicer');
  assert.equal(consumer.producer_contract.repository, 'Spectating101/refinery');
  assert.equal(
    consumer.producer_contract.expected_policy,
    'competition_is_input_to_improvement_not_automatic_scope_reduction',
  );
});

test('all Refinery decisions are explicitly mapped and unknown decisions fail closed', () => {
  assert.deepEqual(new Set(Object.keys(consumer.accepted_decisions)), EXPECTED_DECISIONS);
  assert.equal(consumer.global_guards.unknown_decision_fails_closed, true);
  assert.equal(consumer.global_guards.producer_policy_mismatch_fails_closed, true);
  assert.equal(consumer.global_guards.subject_project_mismatch_fails_closed, true);
});

test('no competitive decision can mutate core semantics or physical authority', () => {
  for (const [decision, row] of Object.entries(consumer.accepted_decisions)) {
    assert.equal(row.core_change, false, `${decision} unexpectedly permits a core change`);
  }
  assert.equal(consumer.global_guards.automatic_core_semantics_changes, false);
  assert.equal(consumer.global_guards.automatic_fabrication_authority, false);
  assert.equal(consumer.global_guards.automatic_power_on_authority, false);
  assert.equal(consumer.global_guards.automatic_release_authority, false);
});

test('only bounded shell workflow and integration decisions may open engineering', () => {
  const authorized = Object.entries(consumer.accepted_decisions)
    .filter(([, row]) => row.may_open_engineering)
    .map(([decision]) => decision)
    .sort();
  assert.deepEqual(authorized, [
    'IMPROVE_HS_SHELL',
    'IMPROVE_HS_WORKFLOW',
    'INTEGRATE_NOT_REBUILD',
  ]);
});

test('SPI physical proof remains P0 and cannot be preempted by generic competition', () => {
  assert.equal(consumer.priority_override.active_campaign, 'Spectating101/hardware-splicer#105');
  assert.equal(consumer.priority_override.priority, 'P0');
  assert.equal(consumer.global_guards.competitor_announcement_alone_can_preempt_physical_proof, false);
});

test('frontend stays closed unless a concrete reopening condition appears', () => {
  assert.equal(consumer.frontend_closure.pull_request, 'Spectating101/hardware-splicer#104');
  assert.equal(consumer.frontend_closure.state, 'CLOSURE_CANDIDATE');
  assert.ok(consumer.frontend_closure.reopen_when.length >= 3);
});
