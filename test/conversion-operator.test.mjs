import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConversionCampaign, ingestExternalOutcome } from '../src/conversion/operator.mjs';

const baseProject = {
  id: 'public-good-control',
  name: 'Public-Good Control',
  pitch: 'bounded disaster shadow pilot',
  claims: [
    { id: 'replay', status: 'PROVEN', text: 'historical replay exists', evidence_refs: ['e:replay'] },
    { id: 'field', status: 'UNPROVEN', text: 'field effectiveness proven', evidence_refs: [] }
  ]
};

function opportunity(overrides = {}) {
  return {
    id: 'pilot:1',
    type: 'institutional_pilot',
    title: 'Shadow pilot',
    cost_tag: '$0',
    direct_control: true,
    eligibility: { state: 'PASS' },
    fit: { state: 'HIGH' },
    marginal_work: { state: 'LOW' },
    required_evidence: ['e:replay'],
    available_evidence: ['e:replay'],
    claim_ids: ['replay', 'field'],
    ...overrides
  };
}

test('ready opportunity becomes auto-preparable but never auto-submittable', () => {
  const campaign = buildConversionCampaign({ project: baseProject, opportunity: opportunity() });
  assert.equal(campaign.state, 'READY_TO_PREPARE');
  assert.equal(campaign.autonomy.may_prepare, true);
  assert.equal(campaign.autonomy.may_submit, false);
  assert.equal(campaign.autonomy.may_pay, false);
  assert.ok(campaign.autonomy.reversible_actions.some((item) => item.action === 'prepare_portal_fields_and_uploads'));
  assert.ok(campaign.autonomy.human_gates.some((item) => item.gate === 'final_submit_or_send'));
  assert.deepEqual(campaign.claim_projection.selected.map((item) => item.id), ['replay']);
  assert.deepEqual(campaign.claim_projection.excluded.map((item) => item.id), ['field']);
});

test('open partner dependency stops READY-to-prepare while preserving autonomous drafting', () => {
  const campaign = buildConversionCampaign({
    project: baseProject,
    opportunity: opportunity({ direct_control: false }),
    dependencies: [{ id: 'partner', kind: 'partner', state: 'OPEN', description: 'field partner required' }]
  });
  assert.equal(campaign.state, 'DEPENDENCY_REQUIRED');
  assert.equal(campaign.autonomy.may_prepare, false);
  assert.ok(campaign.autonomy.reversible_actions.some((item) => item.action === 'draft_application_or_outreach'));
  assert.ok(campaign.autonomy.reversible_actions.some((item) => item.action === 'prepare_partner_or_sponsor_contact_packet'));
  assert.ok(campaign.autonomy.human_gates.some((item) => item.gate === 'partner'));
});

test('upfront cost always creates a payment gate and never auto-pays', () => {
  const campaign = buildConversionCampaign({ project: baseProject, opportunity: opportunity({ cost_tag: '$UPFRONT' }) });
  assert.equal(campaign.state, 'VERIFICATION_REQUIRED');
  assert.equal(campaign.autonomy.may_pay, false);
  assert.ok(campaign.autonomy.human_gates.some((item) => item.gate === 'payment'));
});

test('external outcomes become review-required receipts, not automatic claim upgrades', () => {
  const campaign = buildConversionCampaign({ project: baseProject, opportunity: opportunity() });
  const receipt = ingestExternalOutcome(campaign, {
    stage: 'ACCEPTED',
    source: 'funder-email',
    verdict: 'accepted for pilot'
  });
  assert.equal(receipt.claim_effect, 'REVIEW_REQUIRED');
  assert.equal(receipt.candidate_evidence.status, 'UNREVIEWED');
  assert.equal(receipt.candidate_evidence.stage, 'ACCEPTED');
});
