import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applicationKind,
  applicationQueue,
  applicationStage,
  buildApplicationMission,
  isApplicationRoute,
  isSubmissionRoute,
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
  assert.equal(isSubmissionRoute({ lane: 'COMPETITION', route_class: 'APPLY' }), true);
  assert.equal(isSubmissionRoute({ lane: 'RESEARCH', route_class: 'APPLY', execution_manifest: 'examples/opportunities/paper.json' }), true);
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
  const queue = applicationQueue(records, { limit: 10, asOf: '2026-09-01T00:00:00Z' });
  assert.equal(queue.count, 2);
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['job-1', 'job-2']);
});

test('application queue excludes past hard deadlines without hiding rolling routes', () => {
  const records = [
    cleanResearchJob({ id: 'expired', deadline: '2026-09-09' }),
    cleanResearchJob({ id: 'today', deadline: '2026-09-10' }),
    cleanResearchJob({ id: 'rolling', deadline: 'ROLLING' }),
  ];
  const queue = applicationQueue(records, { limit: 10, asOf: '2026-09-10T12:00:00Z' });
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['today', 'rolling']);
});

test('automatic application queue excludes routes that require new external people or credentials', () => {
  const records = [
    cleanResearchJob({ id: 'solo-ready', gate: 'Portal mapped; final submit remains protected.' }),
    cleanResearchJob({ id: 'needs-reference', gate: 'Two professional references required.' }),
    cleanResearchJob({ id: 'needs-team', gate: 'A teammate and adviser confirmation are required.' }),
    cleanResearchJob({ id: 'needs-certification', gate: 'Independent external certification required before applying.' }),
  ];
  const queue = applicationQueue(records, { limit: 10, asOf: '2026-09-01T00:00:00Z' });
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['solo-ready']);

  const named = buildApplicationMission(records[1]);
  assert.equal(named.application.readiness.readiness, 'EXTERNAL_DEPENDENCY_EXCLUDED');
  assert.equal(named.application.readiness.ready_for_browser, false);
});

test('external-dependency classifier does not reject a route for incidental vocabulary', () => {
  const records = [
    cleanResearchJob({ id: 'event-networking', gate: 'Attend only if it creates useful partner or sponsor conversion.' }),
    cleanResearchJob({ id: 'program-host', gate: 'Verify exact host-unit fit; the program provides accommodation and travel.' }),
    cleanResearchJob({ id: 'visa-unknown', gate: 'Verify work authorization or sponsorship terms before accepting.' }),
  ];
  const queue = applicationQueue(records, { limit: 10, asOf: '2026-09-01T00:00:00Z' });
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['event-networking', 'program-host', 'visa-unknown']);
});

test('automatic application queue respects the current PhD document hold', () => {
  const records = [
    cleanResearchJob({ id: 'job-open' }),
    cleanResearchJob({ id: 'phd-held', lane: 'PHD', route_class: 'PHD' }),
  ];
  const queue = applicationQueue(records, { limit: 10, asOf: '2026-09-01T00:00:00Z' });
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['job-open']);
  const named = buildApplicationMission(records[1]);
  assert.equal(named.application.readiness.readiness, 'PHD_DOCUMENT_HOLD');
});

test('automatic application queue respects an explicitly paused named route', () => {
  const records = [
    cleanResearchJob({ id: 'job-open' }),
    cleanResearchJob({ id: 'job-hku-ai-engineer-mcp-ra2-2026' }),
  ];
  const queue = applicationQueue(records, { limit: 10, asOf: '2026-09-01T00:00:00Z' });
  assert.deepEqual(queue.missions.map((mission) => mission.route_id), ['job-open']);
});

test('canonical Gauntlet master compiles a real bounded application queue', () => {
  const queue = applicationQueue(undefined, { limit: 8 });
  assert.equal(queue.schema, 'blowback.application_queue.v1');
  assert.ok(queue.count > 0);
  assert.ok(queue.count <= 8);
  for (const mission of queue.missions) {
    assert.equal(mission.schema, 'blowback.application_mission.v1');
    assert.ok(mission.route_id);
    assert.ok(mission.application.packet_profile.length >= 5);
    assert.equal(isApplicationRoute(mission.record), true);
  }
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
