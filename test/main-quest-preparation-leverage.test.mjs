import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const plan = JSON.parse(
  fs.readFileSync(new URL('../data/main-quest-preparation-leverage-2026-09-16.json', import.meta.url), 'utf8'),
);

test('Main Quest preparation starts with the highest-reuse shared evidence object', () => {
  assert.equal(plan.route_denominator.phd, 61);
  assert.equal(plan.route_denominator.employment, 88);
  assert.equal(plan.route_denominator.total, 149);
  assert.equal(plan.preparation_order[0].artifact_id, 'main-quest-canonical-facts-evidence-spine');
  assert.match(plan.preparation_order[0].coverage, /149\/149/);
});

test('employment preparation uses reusable packet families rather than 88 bespoke resumes', () => {
  const employment = plan.preparation_order.find((item) => item.artifact_id === 'employment-packet-families');
  assert.ok(employment);
  assert.equal(employment.families.length, 5);
  assert.ok(plan.do_not_do_first.includes('create 88 independent resumes'));
});

test('PhD preparation uses one core dossier before route deltas', () => {
  const phd = plan.preparation_order.find((item) => item.artifact_id === 'phd-core-dossier');
  assert.ok(phd);
  assert.match(phd.coverage, /61\/61/);
  assert.ok(phd.route_specific_delta.includes('faculty/lab match'));
  assert.ok(plan.do_not_do_first.includes('write 61 independent PhD SOPs'));
});

test('route delta matrix preserves unresolved employment identities as gaps', () => {
  const delta = plan.preparation_order.find((item) => item.artifact_id === 'route-delta-matrix');
  assert.ok(delta);
  assert.match(delta.integrity_rule, /IDENTITY_GAP/);
  assert.match(delta.integrity_rule, /never invent/i);
});
