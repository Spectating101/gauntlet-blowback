import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOpportunity } from '../src/core/load.mjs';
import { validateOpportunity } from '../src/core/validate.mjs';

const AUDITED_PACKET_REVISION = 'f822fc5a4b2355ae945955969dcad7428a71c835';

const liveReconManifests = [
  'examples/opportunities/taia-ai-creative-design-2026.json',
  'examples/opportunities/global-ai-finance-2026-policy-lab.json',
  'examples/opportunities/innoserve-2026-hardware-splicer.json',
  'examples/opportunities/aws-community-day-taiwan-2026-hardware-splicer.json',
  'examples/opportunities/openai-researcher-access-hardware-splicer.json',
  'examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json'
];

const blockedResearchManifests = [
  'examples/opportunities/anthropic-mhs-preview-hardware-splicer.json',
  'examples/opportunities/nchc-university-ai-compute-yzu-hardware-splicer.json',
  'examples/opportunities/aws-cloud-credit-research-yzu-hardware-splicer.json',
  'examples/opportunities/anthropic-ai-for-science-hardware-splicer.json'
];

const researchPacketManifests = [
  'examples/opportunities/aws-community-day-taiwan-2026-hardware-splicer.json',
  'examples/opportunities/openai-researcher-access-hardware-splicer.json',
  'examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json',
  ...blockedResearchManifests
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

for (const manifestPath of blockedResearchManifests) {
  test(`blocked research/resource manifest validates: ${manifestPath}`, async () => {
    const opportunity = await loadOpportunity(manifestPath);
    const validation = validateOpportunity(opportunity);
    assert.equal(validation.ok, true, validation.errors.join('\n'));
    assert.equal(opportunity.mode, 'inspect');
    assert.equal(opportunity.execution_state, 'RESEARCH_ONLY');
    assert.equal(opportunity.direct_control, false);
    assert.ok(opportunity.human_required.includes('final_submit'));
  });
}

for (const manifestPath of researchPacketManifests) {
  test(`research packet is pinned to audited Hardware-Splicer revision: ${manifestPath}`, async () => {
    const opportunity = await loadOpportunity(manifestPath);
    assert.equal(opportunity.packet_revision, AUDITED_PACKET_REVISION);
    assert.match(opportunity.packet_source, new RegExp(`/blob/${AUDITED_PACKET_REVISION}/`));
    for (const requirement of opportunity.packet_requirements ?? []) {
      if (!requirement.canonical_ref) continue;
      assert.match(requirement.canonical_ref, new RegExp(`/blob/${AUDITED_PACKET_REVISION}/`));
    }
  });
}

test('AWS Community Day manifest preserves date-only deadline truth and official CFP route', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/aws-community-day-taiwan-2026-hardware-splicer.json');
  assert.equal(opportunity.deadline, '2026-09-07');
  assert.equal(opportunity.registration_url, 'https://go.awscmd.tw/cfp');
  assert.match(opportunity.deadline_note, /exact cutoff time is not yet verified/i);
  assert.doesNotMatch(opportunity.deadline, /23:59/);
});

test('Anthropic ERAP manifest uses the application linked by the official help page', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json');
  assert.equal(opportunity.registration_url, 'https://forms.gle/pZYC8f6qYqSKvRWn9');
  assert.equal(opportunity.route_evidence.official_google_form_link_verified, true);
  assert.equal(opportunity.route_evidence.form_fields_verified, false);
});
