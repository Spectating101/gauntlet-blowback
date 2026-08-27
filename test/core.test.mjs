import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
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

test('local private profile overrides repo profile without replacing public defaults', async (t) => {
  const previous = process.env.BLOWBACK_PROFILE_FILE;
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'blowback-profile-'));
  const privateProfilePath = path.join(dir, 'profile.local.json');
  await fs.writeFile(privateProfilePath, JSON.stringify({ name: 'Private Override', phone: '+000000' }), 'utf8');
  process.env.BLOWBACK_PROFILE_FILE = privateProfilePath;
  t.after(async () => {
    if (previous === undefined) delete process.env.BLOWBACK_PROFILE_FILE;
    else process.env.BLOWBACK_PROFILE_FILE = previous;
    await fs.rm(dir, { recursive: true, force: true });
  });

  const opportunity = await loadOpportunity(example);
  const bundle = await resolveBundle(opportunity);
  assert.equal(bundle.profile.name, 'Private Override');
  assert.equal(bundle.profile.phone, '+000000');
  assert.equal(bundle.profile.affiliation, 'Yuan Ze University');
  assert.equal(bundle.fields.participant_name, 'Private Override');
});

test('plan contains no submit action and redacts resolved values by default', async () => {
  const opportunity = await loadOpportunity(example);
  const bundle = await resolveBundle(opportunity);
  const plan = buildPlan(bundle);
  assert.equal(plan.values_redacted, true);
  assert.equal(plan.steps.some((step) => step.kind === 'submit'), false);
  assert.equal(plan.steps.some((step) => step.kind === 'field' && Object.hasOwn(step, 'value')), false);
  assert.equal(plan.steps.some((step) => step.kind === 'upload' && Object.hasOwn(step, 'path')), false);
  assert.equal(plan.steps.at(-1).gate, 'final_submit');
});
