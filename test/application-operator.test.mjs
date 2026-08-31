import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applicationKind,
  applicationQueue,
  applicationStage,
  buildApplicationMission,
  isApplicationRoute,
  mayAutoSubmit,
  packetProfileFor
} from '../src/application/operator.mjs';
import { evaluateOpportunity } from '../src/core/conversion.mjs';

function cleanResearchJob(overrides = {}) {
  return {
    id: 'job-clean-1',
    lane: 'RESEARCH_JOB',
    route_class: 'RESEARCH_ENGINEER',
    organization: 'Example Lab',
    opportunity: 'Research Engineer — LLM agents',
    status: 'FIRE',
    execution_state: 'APPLICATION_READY',
    deadline: '2026-09-20',
    gate: 'No unresolved eligibility or payment gates.',
    source: 'https://jobs.example.edu/apply/123',
    shared_evidence_family: 'research-labor-agents',
    contribution_view: 'MCP/tool-using agent infrastructure',
    ...overrides
  };
}

test('research labor and career-scale fellowship routes are first-class applications', () => {
  assert.equal(isApplicationRoute(cleanResearchJob()), true);
  assert.equal(isApplicationRoute({ lane: 'RESEARCH_LAB', route_class: 'LAB_STAFF' }), true);
  assert.equal(isApplicationRoute({ lane: 'PREDOC', route_class: 'PREDOC' }), true);
  assert.equal(isApplicationRoute({ lane: 'COMPETITION', route_class: 'APPLY' }), false);
});

test('packet profile varies by application market instead of flattening every route into a resume', () => {
  assert.equal(applicationKind({ lane: 'RESEARCH_LAB', route_class: 'LAB_STAFF' }), 'LAB_APPLICATION');
  assert.ok(packetProfileFor({ lane: 'RESEARCH_LAB', route_class: 'LAB_STAFF' }).includes('research_interest_note'));
  assert.ok(packetProfileFor({ lane: 'PREDOC', route_class: 'PREDOC' }).includes('empirical_research_sample'));
  assert.ok(packetProfileFor({ lane: 'RESEARCH_FELLOWSHIP', route_class: 'RESEARCH_FELLOWSHIP' }).includes('proposal_or_project_agenda'));
});

test('application stage keeps unresolved routes in recon instead of pretending they are ready', () => {
  assert.equal(applicationStage(cleanResearchJob({ status: 'VERIFY', execution_state: 'ELIGIBILITY_RECON_REQUIRED' })), 'RECON');
  assert.equal(applicationStage(cleanResearchJob()), 'PREPARE');
});

test('submit-if-safe requires explicit runtime authority and fails closed on known material gates', () => {
  const clean = cleanResearchJob({ gate: 'Portal mapped; exact source verified.' });
  assert.equal(mayAutoSubmit(clean), false);
  assert.equal(mayAutoSubmit(clean, { submitIfSafe: true }), true);

  const visaUnknown = cleanResearchJob({ gate: 'Verify work authorization and visa sponsorship.' });
  assert.equal(mayAutoSubmit(visaUnknown, { submitIfSafe: true }), false);

  const afterGate = cleanResearchJob({ status: 'FIRE_AFTER_GATE', gate: 'Degree eligibility must be verified.' });
  assert.equal(mayAutoSubmit(afterGate, { submitIfSafe: true }), false);
});

test('runtime authority releases only final send/submit while retaining protected human gates', () => {
  const mission = buildApplicationMission(cleanResearchJob({ gate: 'Portal mapped; exact source verified.' }), null, { submitIfSafe: true });
  assert.equal(mission.application.application_policy.mode, 'SUBMIT_IF_SAFE');
  assert.equal(mission.application.application_policy.runtime_authority, true);
  assert.ok(mission.permissions.auto.includes('final_submit_or_send_only_if_runtime_policy_and_dynamic_gate_checks_pass'));
  assert.equal(mission.permissions.human_gate.includes('final_submit_send_apply_confirm'), false);
  assert.equal(mission.permissions.human_gate.includes('legal_privacy_terms_consent'), true);
  assert.equal(mission.permissions.human_gate.includes('unresolved_eligibility_attestation'), false);
});

test('prepare-only application mission always preserves final submit as a human gate', () => {
  const mission = buildApplicationMission(cleanResearchJob({ gate: 'Portal mapped; exact source verified.' }));
  assert.equal(mission.application.application_policy.mode, 'PREPARE_TO_LAST_SAFE_STATE');
  assert.equal(mission.permissions.human_gate.includes('final_submit_send_apply_confirm'), true);
});

test('application queue ignores non-application lanes and preserves ranking order', () => {
  const records = [
    cleanResearchJob({ id: 'job-2', deadline: '2026-09-10' }),
    { id: 'contest-1', lane: 'COMPETITION', route_class: 'APPLY', status: 'FIRE_NOW', execution_state: 'APPLICATION_READY', deadline: '2026-09-02', organization: 'Contest', opportunity: 'Contest', source: 'https://contest.example' },
    cleanResearchJob({ id: 'job-1', deadline: '2026-09-05' })
  ];
  const queue = applicationQueue(records, { limit: 10 });
  assert.equal(queue.count, 2);
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['job-1', 'job-2']);
});

test('conversion policy accepts newly explicit research-labor opportunity types', () => {
  for (const type of ['research_assistant', 'research_engineer', 'predoc', 'research_fellowship', 'research_residency', 'policy_fellowship', 'faculty_pull']) {
    const result = evaluateOpportunity({
      id: `${type}-1`,
      type,
      cost_tag: '$0',
      eligibility: { state: 'PASS' },
      fit: { state: 'HIGH' },
      marginal_work: { state: 'LOW' },
      direct_control: true,
      hard_blockers: [],
      required_evidence: [],
      available_evidence: []
    });
    assert.equal(result.ok, true, type);
    assert.equal(result.decision, 'READY', type);
  }
});
