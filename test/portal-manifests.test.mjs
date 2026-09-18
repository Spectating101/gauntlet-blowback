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
  'examples/opportunities/embedded-world-2027-hardware-splicer.json',
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
});

test('TAAI packet is ready while live OpenReview mapping and final submit remain gated', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/taai-2026-domestic-hardware-splicer.json');
  const validation = validateOpportunity(opportunity);
  assert.equal(validation.ok, true, validation.errors.join('\n'));
  assert.equal(opportunity.id, 'taai-2026-domestic-hardware-splicer');
  assert.equal(opportunity.execution_state, 'PACKET_READY');
  assert.equal(opportunity.mode, 'inspect');
  assert.equal(opportunity.submission_url, 'https://openreview.net/group?id=TAAI.org/2026/Conference');
  assert.equal(opportunity.uploads[0].name, 'paper_pdf');
  assert.match(opportunity.uploads[0].path, /Hardware_Splicer_TAAI_2026_Extended_Abstract\.pdf$/);
  assert.equal(opportunity.route_evidence.submission_pdf_ready, true);
  assert.equal(opportunity.route_evidence.final_submission_copy_ready, true);
  assert.equal(opportunity.fire_packet, '../fire-packets/taai-2026-domestic-hardware-splicer.json');
  assert.equal(opportunity.route_evidence.live_openreview_fields_verified, false);
  assert.ok(opportunity.human_required.includes('final_submit'));
});

test('SSI fellowship package carries the corrected deck while recording remains human-gated', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/ssi-fellowship-2027-refinery-commons.json');
  const validation = validateOpportunity(opportunity);
  assert.equal(validation.ok, true, validation.errors.join('\n'));
  assert.equal(opportunity.submission_url, 'https://forms.cloud.microsoft/e/pJdGh0rRSx');
  assert.equal(opportunity.route_evidence.official_application_reverified, '2026-09-17');
  assert.equal(opportunity.route_evidence.live_form_reverified, '2026-09-17');
  assert.equal(opportunity.route_evidence.screencast_max_seconds, 360);
  assert.equal(opportunity.route_evidence.editable_screencast_deck_ready, true);
  assert.equal(opportunity.route_evidence.screencast_deck_blocker, null);
  assert.equal(
    opportunity.packet_requirements.find((item) => item.id === 'screencast_deck').status,
    'PACKET_READY',
  );
  assert.match(
    opportunity.packet_requirements.find((item) => item.id === 'screencast_deck').canonical_ref,
    /Screencast_Final\.pptx$/,
  );
  assert.ok(opportunity.human_required.includes('record_and_host_screencast'));
  assert.ok(opportunity.human_required.includes('final_submit'));
});

test('Embedded World packet fits public limits and remains blocked at account and commitment gates', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/embedded-world-2027-hardware-splicer.json');
  const validation = validateOpportunity(opportunity);
  assert.equal(validation.ok, true, validation.errors.join('\n'));
  assert.equal(opportunity.deadline, '2026-09-28');
  assert.equal(opportunity.recon_stage, 'submission');
  assert.equal(opportunity.route_evidence.login_form_observed, true);
  assert.equal(opportunity.route_evidence.captcha_observed, false);
  assert.equal(opportunity.route_evidence.account_created, false);
  assert.equal(opportunity.route_evidence.authenticated_form_mapped, false);
  assert.equal(opportunity.fields.abstract.length, 1074);
  assert.ok(opportunity.fields.abstract.length <= opportunity.route_evidence.abstract_limit_characters);
  assert.equal(opportunity.fields.presenter_cv.length, 243);
  assert.ok(opportunity.fields.presenter_cv.length <= opportunity.route_evidence.presenter_cv_limit_characters);
  assert.equal(
    opportunity.packet_requirements.find((item) => item.id === 'conversion_package').status,
    'WAITING_CANONICAL_PROMOTION',
  );
  assert.ok(opportunity.human_required.includes('eligibility_attestation'));
  assert.ok(opportunity.human_required.includes('terms_acceptance'));
  assert.ok(opportunity.human_required.includes('final_submit'));
});

test('DPG route maps only evidence-backed first-page fields and preserves attestation gates', async () => {
  const opportunity = await loadOpportunity('examples/opportunities/dpg-policy-lab.json');
  const validation = validateOpportunity(opportunity);
  assert.equal(validation.ok, true, validation.errors.join('\n'));
  assert.equal(opportunity.execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(opportunity.recon_stage, 'submission');
  assert.equal(opportunity.fields.solution_category, 'Open Software');
  assert.equal(opportunity.field_map.solution_category.action, 'select');
  assert.equal(opportunity.route_evidence.first_questionnaire_page_mapped, true);
  assert.equal(opportunity.route_evidence.remaining_questionnaire_sections_mapped, false);
  assert.equal(opportunity.route_evidence.public_email_unresolved, true);
  assert.equal(opportunity.route_evidence.canonical_ci_green, false);
  assert.equal(opportunity.route_evidence.legal_attestations_confirmed, false);
  assert.equal(opportunity.route_evidence.final_submit_authorized, false);
  assert.ok(!Object.hasOwn(opportunity.fields, 'public_email'));
  assert.ok(opportunity.human_required.includes('terms_acceptance'));
  assert.ok(opportunity.human_required.includes('final_submit'));
});
