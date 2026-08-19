import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOpportunity } from '../src/core/load.mjs';
import { validateOpportunity } from '../src/core/validate.mjs';
import { resolveBundle } from '../src/core/resolve.mjs';
import { buildPlan } from '../src/core/plan.mjs';

const example = 'examples/opportunities/animalhack-2026.json';

test('example opportunity is valid and always human-gates final submit', async () => {
  const opportunity = await loadOpportunity(example);
  const validation = validateOpportunity(opportunity);
  assert.equal(validation.ok, true);
  assert.ok(opportunity.human_required.includes('final_submit'));
});

test('bundle resolves canonical profile/project references', async () => {
  const opportunity = await loadOpportunity(example);
  const bundle = await resolveBundle(opportunity);
  assert.equal(bundle.fields.participant_name, 'Christopher Ongko');
  assert.equal(bundle.fields.project_name, 'Public-Good Control');
});

test('plan contains no submit action', async () => {
  const opportunity = await loadOpportunity(example);
  const bundle = await resolveBundle(opportunity);
  const plan = buildPlan(bundle);
  assert.equal(plan.steps.some((step) => step.kind === 'submit'), false);
  assert.equal(plan.steps.at(-1).gate, 'final_submit');
});
