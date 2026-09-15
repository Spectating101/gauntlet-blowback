import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const control = JSON.parse(fs.readFileSync(new URL('../data/academic-plan-control-2026-09-16.json', import.meta.url), 'utf8'));

test('academic plan control has the expected scope', () => {
  assert.equal(control.schema, 'blowback.academic_plan_control.v1');
  assert.equal(control.scope, 'ACADEMICS_ONLY');
  assert.equal(control.control_doctrine.plan_is_strategy_authority, true);
  assert.ok(control.plans.length >= 7);
});
