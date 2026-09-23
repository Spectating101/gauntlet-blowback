import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOpportunity } from '../src/core/load.mjs';
import { validateOpportunity } from '../src/core/validate.mjs';

const AUDITED_PACKET_REVISION = 'f822fc5a4b2355ae945955969dcad7428a71c835';
const FIRE_COPY_REVISION = '328b80b4ca720a04e4bbdfabc481f4dfb68c548b';

const liveReconManifests = [
  'examples/opportunities/taia-ai-creative-design-2026.json',
  'examples/opportunities/global-ai-finance-2026-policy-lab.json',
  'examples/opportunities/innoserve-2026-hardware-splicer.json',
  'examples/opportunities/aws-community-day-taiwan-2026-hardware-splicer.json',
  'examples/opportunities/openai-researcher-access-hardware-splicer.json'
];

const manualSubmitManifests = [
  'examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json'
];

const blockedResearchManifests = [
  'examples/opportunities/anthropic-mhs-preview-hardware-splicer.json',
  'examples/opportunities/nchc-university-ai-compute-yzu-hardware-splicer.json',
  'examples/opportunities/aws-cloud-credit-research-yzu-hardware-splicer.json',
  'examples/opportunities/anthropic-ai-for-science-hardware-splicer.json'
];

const fireResearchManifests = [
  'examples/opportunities/aws-community-day-taiwan-2026-hardware-splicer.json',
  'examples/opportunities/openai-researcher-access-hardware-splicer.json',
  'examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json'
];

const researchPacketManifests = [
  ...fireResearchManifests,
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

for (const manifestPath of manualSubmitManifests) {
  test(`manual-submit manifest validates: ${manifestPath}`, async () => {
    const opportunity = await loadOpportunity(manifestPath);
    const validation = validateOpportunity(opportunity);
    assert.equal(validation.ok, true, validation.errors.join('\n'));
    assert.equal(opportunity.mode, 'inspect');
    assert.equal(opportunity.execution_state, 'HUMAN_SUBMIT_READY');
    assert.equal(opportunity.manual_only, true);
    assert.deepEqual(opportunity.field_map, {});
    assert.ok(opportunity.human_required.includes('final_submit'));
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
  test(`research packet is pinned to immutable Hardware-Splicer revisions: ${manifestPath}`, async () => {
    const opportunity = await loadOpportunity(manifestPath);
    assert.equal(opportunity.packet_revision, AUDITED_PACKET_REVISION);
    assert.match(opportunity.packet_source, new RegExp(`/blob/${AUDITED_PACKET_REVISION}/`));

    if (fireResearchManifests.includes(manifestPath)) {
      assert.equal(opportunity.final_copy_revision, FIRE_COPY_REVISION);
      assert.match(opportunity.final_copy_source, new RegExp(`/blob/${FIRE_COPY_REVISION}/`));
      assert.equal(opportunity.route_evidence.final_submission_copy_ready, true);
    }

    for (const requirement of opportunity.packet_requirements ?? []) {
      if (!requirement.canonical_ref) continue;
      const expectedRevision = requirement.id.startsWith('final_') ? FIRE_COPY_REVISION : AUDITED_PACKET_REVISION;
      assert.match(requirement.canonical_ref, new RegExp(`/blob/${expectedRevision}/`));
    }
  });
}

test('AWS Community Day manifest preserves date-only deadline truth and official CFP route', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/aws-community-day-taiwan-2026-hardware-splicer.json');
  assert.equal(opportunity.deadline, '2026-09-07');
  assert.equal(opportunity.registration_url, 'https://go.awscmd.tw/cfp');
  assert.match(opportunity.deadline_note, /exact cutoff time is not yet verified/i);
  assert.doesNotMatch(opportunity.deadline, /23:59/);
  assert.equal(opportunity.fields.talk_title, 'When an AI Agent Can Touch Hardware: Designing the Checks Between the Model and the Machine');
});

test('OpenAI FIRE manifest carries the current concrete run and budget plan', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/openai-researcher-access-hardware-splicer.json');
  assert.equal(opportunity.fields.project_title, 'Testing Whether Evidence Checks Reduce Unsupported Actions in Tool-Using AI Agents');
  assert.equal(opportunity.fields.working_credit_request_usd, 300);
  assert.equal(opportunity.route_evidence.final_submission_copy_ready, true);
  assert.match(opportunity.packet_requirements.find((r) => r.id === 'api_budget').description, /Sol primary 200 runs.*Terra sensitivity 100 runs/i);
});

test('Anthropic ERAP manifest uses the application linked by the official help page', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json');
  assert.equal(opportunity.fields.project_title, 'Testing Evidence and Authorization Checks for Tool-Using Agents');
  assert.equal(opportunity.registration_url, 'https://forms.gle/pZYC8f6qYqSKvRWn9');
  assert.equal(opportunity.route_evidence.official_google_form_link_verified, true);
  assert.equal(opportunity.route_evidence.final_submission_copy_ready, true);
  assert.equal(opportunity.route_evidence.form_fields_verified, false);
  assert.equal(opportunity.route_evidence.manual_submission_ready, true);
  assert.equal(opportunity.route_evidence.default_credit_award_usd, 1000);
  assert.equal(opportunity.route_evidence.review_cadence, 'first Monday of each month');
  assert.equal(opportunity.route_evidence.next_nominal_review_date, '2026-10-05');
  assert.match(opportunity.manual_submission_runbook, /ANTHROPIC_ERAP_MANUAL_SUBMISSION_2026-09-23\.md$/);
  assert.equal(opportunity.packet_requirements.find((r) => r.id === 'live_form_map').status, 'HUMAN_AT_ENTRY');
  assert.equal(opportunity.packet_requirements.find((r) => r.id === 'model_freshness_gate').status, 'HUMAN_DECISION_REQUIRED');
});


test('Anthropic MHS route is bound to the SPI physical-proof subject without widening authority', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/anthropic-mhs-preview-hardware-splicer.json');
  assert.equal(opportunity.execution_state, 'RESEARCH_ONLY');
  assert.equal(opportunity.direct_control, false);
  assert.equal(opportunity.device_plan.subject, 'hardware-splicer spi_flash_adapter_v1');
  assert.equal(opportunity.device_plan.readiness, 'WAITING_FOR_REAL_PHYSICAL_SUBJECT');
  assert.equal(opportunity.device_plan.tracking, 'Spectating101/hardware-splicer#105');
  assert.equal(opportunity.device_plan.first_allowed_functional_action.command, '0x9F');
  assert.equal(opportunity.device_plan.first_allowed_functional_action.spi_mode, 0);
  assert.equal(opportunity.device_plan.first_allowed_functional_action.frequency_hz, 5000000);
  assert.equal(opportunity.device_plan.first_allowed_functional_action.write_operation, false);
  assert.ok(opportunity.device_plan.explicitly_unavailable_initially.includes('program'));
  assert.ok(opportunity.device_plan.explicitly_unavailable_initially.includes('erase'));
  assert.ok(opportunity.device_plan.explicitly_unavailable_initially.includes('power-on authority'));
  assert.equal(opportunity.route_evidence.programmable_device_surface_defined, true);
  assert.equal(opportunity.route_evidence.physical_device_available, false);
  assert.equal(opportunity.route_evidence.individual_applicant_class_verified, false);
  assert.equal(
    opportunity.packet_requirements.find((r) => r.id === 'programmable_device').status,
    'WAITING_ON_HS_105_PHYSICAL_SUBJECT'
  );
  assert.equal(
    opportunity.packet_requirements.find((r) => r.id === 'applicant_class').status,
    'HUMAN_AT_ENTRY'
  );
  assert.match(
    opportunity.packet_requirements.find((r) => r.id === 'mhs_spi_safety_plan').execution_ref,
    /ANTHROPIC_MHS_SPI_EVALUATION_2026-09-23\.md$/
  );
});
