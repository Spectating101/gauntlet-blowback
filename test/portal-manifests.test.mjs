import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOpportunity } from '../src/core/load.mjs';
import { validateOpportunity } from '../src/core/validate.mjs';

const liveReconManifests = [
  'examples/opportunities/taia-ai-creative-design-2026.json',
  'examples/opportunities/global-ai-finance-2026-policy-lab.json',
  'examples/opportunities/innoserve-2026-hardware-splicer.json'
];

for (const manifestPath of liveReconManifests) {
  test(`live recon manifest validates: ${manifestPath}`, async () => {
    const opportunity = await loadOpportunity(manifestPath);
    const validation = validateOpportunity(opportunity);
    assert.equal(validation.ok, true, validation.errors.join('\n'));
    assert.equal(opportunity.mode, 'inspect');
    assert.equal(opportunity.execution_state, 'PORTAL_RECON_REQUIRED');
    assert.deepEqual(opportunity.field_map, {});
  });
}
