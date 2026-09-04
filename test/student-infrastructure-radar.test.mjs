import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import { applicationKind, applicationStage, isApplicationRoute, mayAutoSubmit, packetProfileFor } from '../src/application/operator.mjs';
import { evaluateOpportunity } from '../src/core/conversion.mjs';

const radar = JSON.parse(fs.readFileSync(new URL('../data/student-research-infrastructure-radar-2026-09-01.json', import.meta.url), 'utf8'));
const routes = new Map(radar.routes.map((route) => [route.id, route]));
const refreshedRadar = JSON.parse(fs.readFileSync(new URL('../data/research-resource-radar-2026-09-04.json', import.meta.url), 'utf8'));
const refreshedRoutes = new Map(refreshedRadar.routes.map((route) => [route.id, route]));
const candidateAssessment = JSON.parse(fs.readFileSync(new URL('../examples/radar/research-resource-candidate-assessments-2026-09-04.json', import.meta.url), 'utf8'));
const candidateIds = candidateAssessment.candidates.map((candidate) => candidate.id);
const master = new Map(buildMasterRegistry().map((route) => [route.id, route]));

test('student infrastructure radar has unique canonical route ids', () => {
  assert.equal(routes.size, radar.routes.length);
  for (const id of [
    'azure-for-students-2026',
    'heroku-github-students-2026',
    'appwrite-education-2026',
    'anthropic-mhs-preview-2026',
    'anthropic-ai-for-science-general-2026',
    'google-cloud-research-credits-pi-2026',
    'oracle-for-research-project-award-2026',
    'aws-cloud-credit-research-2026'
  ]) assert.ok(routes.has(id), `missing infrastructure route ${id}`);
});

test('research-credit audit preserves verified uncertainty instead of inventing deadlines or eligibility', () => {
  assert.equal(routes.get('anthropic-ai-for-science-general-2026').deadline, 'ROLLING');
  assert.match(routes.get('anthropic-ai-for-science-general-2026').gate, /Do not encode the unverified 'first Monday\/monthly Sep 7' cadence/i);
  assert.equal(routes.get('google-cloud-research-credits-pi-2026').status, 'DEPENDENCY_REQUIRED');
  assert.match(routes.get('google-cloud-research-credits-pi-2026').gate, /MSc students are explicitly ineligible/i);
  assert.equal(routes.get('aws-cloud-credit-research-2026').status, 'HOLD');
  assert.match(routes.get('aws-cloud-credit-research-2026').gate, /greater China region/i);
});

test('student entitlements preserve commercial-use and activation-clock constraints', () => {
  assert.equal(routes.get('appwrite-education-2026').status, 'FIRE_NOW');
  assert.match(routes.get('appwrite-education-2026').gate, /prohibit non-educational\/commercial use/i);
  assert.equal(routes.get('mongodb-student-pack-2026').status, 'HOLD_UNTIL_NEEDED');
  assert.match(routes.get('mongodb-student-pack-2026').gate, /90 days/i);
});

test('master builder integrates the new infrastructure tranche and refreshes OpenAI Researcher Access', () => {
  for (const id of routes.keys()) assert.ok(master.has(id), `master missing infrastructure route ${id}`);
  const openai = master.get('openai-researcher');
  assert.ok(openai, 'missing OpenAI Researcher Access legacy route');
  assert.equal(openai.status, 'KILL_SUPERSEDED');
  assert.equal(openai.execution_state, 'RESEARCH_ONLY');
  assert.match(openai.gate, /Superseded by openai-researcher-access-hardware-splicer/i);
});

test('Sep-4 research/resource tranche enters the Gauntlet master with explicit execution gates', () => {
  assert.equal(refreshedRoutes.size, refreshedRadar.routes.length);
  for (const id of [
    'aws-community-day-taiwan-2026-hardware-splicer',
    'openai-researcher-access-hardware-splicer',
    'anthropic-external-researcher-access-2026',
    'nchc-university-ai-compute-yzu-2026',
    'microsoft-student-ambassadors-2026',
    'aws-educate-taiwan-campus-ambassador-9-2026',
    'claude-campus-status-2026-09-04'
  ]) {
    assert.ok(refreshedRoutes.has(id), `missing Sep-4 route ${id}`);
    assert.ok(master.has(id), `master missing Sep-4 route ${id}`);
  }

  const awsCfp = master.get('aws-community-day-taiwan-2026-hardware-splicer');
  assert.equal(awsCfp.status, 'FIRE_NOW');
  assert.equal(awsCfp.execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(awsCfp.deadline, '2026-09-07');

  const openai = master.get('openai-researcher-access-hardware-splicer');
  assert.equal(openai.status, 'FIRE_NOW');
  assert.equal(openai.execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(openai.assets, 'Hardware Splicer');
  assert.match(openai.gate, /300-run default/i);

  const anthropic = master.get('anthropic-external-researcher-access-2026');
  assert.equal(anthropic.status, 'FIRE_NOW');
  assert.equal(anthropic.execution_state, 'PORTAL_RECON_REQUIRED');
  assert.match(anthropic.gate, /AI safety\/control work/i);
  assert.match(anthropic.gate, /300-run default/i);

  const nchc = master.get('nchc-university-ai-compute-yzu-2026');
  assert.equal(nchc.status, 'DEPENDENCY_REQUIRED');
  assert.equal(nchc.execution_state, 'ELIGIBILITY_RECON_REQUIRED');
  assert.match(nchc.gate, /university is the applicant/i);
  assert.match(nchc.gate, /NT\$30\/H200-GPU-hour/i);
});

test('Sep-4 candidate assessment uses canonical Gauntlet ids and contains no stale aliases', () => {
  assert.equal(new Set(candidateIds).size, candidateIds.length, 'candidate assessment contains duplicate ids');

  const canonicalIds = [
    'aws-community-day-taiwan-2026-hardware-splicer',
    'openai-researcher-access-hardware-splicer',
    'anthropic-external-researcher-access-2026',
    'anthropic-mhs-preview-2026',
    'nchc-university-ai-compute-yzu-2026',
    'aws-cloud-credit-research-2026',
    'anthropic-ai-for-science-general-2026',
    'microsoft-student-ambassadors-2026',
    'aws-educate-taiwan-campus-ambassador-9-2026',
    'claude-campus-status-2026-09-04'
  ];

  for (const id of canonicalIds) {
    assert.ok(candidateIds.includes(id), `candidate assessment missing canonical id ${id}`);
    assert.ok(master.has(id), `canonical candidate id ${id} is not represented in master`);
  }

  for (const stale of [
    'anthropic-external-researcher-access-hardware-splicer',
    'anthropic-mhs-preview-hardware-splicer',
    'aws-cloud-credit-research-yzu',
    'anthropic-ai-for-science-hardware-splicer',
    'aws-educate-taiwan-campus-ambassador-9',
    'claude-campus-program-status-2026-09-04'
  ]) assert.equal(candidateIds.includes(stale), false, `stale alias survived: ${stale}`);
});

test('Sep-4 overrides keep high-upside routes from outrunning eligibility or evidence', () => {
  const mhs = master.get('anthropic-mhs-preview-2026');
  assert.equal(mhs.status, 'FIRE_AFTER_GATE');
  assert.equal(mhs.execution_state, 'ELIGIBILITY_RECON_REQUIRED');
  assert.match(mhs.gate, /concrete programmable device/i);

  const science = master.get('anthropic-ai-for-science-general-2026');
  assert.equal(science.status, 'HOLD');
  assert.equal(science.execution_state, 'RESEARCH_ONLY');
  assert.match(science.gate, /live-model evidence/i);
  assert.match(science.gate, /jurisdiction\/residency/i);

  const awsResearch = master.get('aws-cloud-credit-research-2026');
  assert.equal(awsResearch.status, 'HOLD');
  assert.equal(awsResearch.execution_state, 'ELIGIBILITY_RECON_REQUIRED');
  assert.match(awsResearch.gate, /written AWS confirmation/i);
  assert.match(awsResearch.gate, /90-120 days/i);

  const claudeCampus = master.get('claude-campus-status-2026-09-04');
  assert.equal(claudeCampus.status, 'HOLD');
  assert.match(claudeCampus.gate, /prior Spring 2026 application as closed/i);
});

test('application compiler distinguishes benefit claims, research credits and PI dependencies', () => {
  const azure = master.get('azure-for-students-2026');
  assert.equal(isApplicationRoute(azure), true);
  assert.equal(applicationKind(azure), 'STUDENT_BENEFIT_CLAIM');
  assert.ok(packetProfileFor(azure).includes('student_status_proof'));

  const anthropic = master.get('anthropic-ai-for-science-general-2026');
  assert.equal(applicationKind(anthropic), 'RESEARCH_CREDIT_APPLICATION');
  assert.ok(packetProfileFor(anthropic).includes('budget_or_usage_model'));

  const google = master.get('google-cloud-research-credits-pi-2026');
  assert.equal(applicationKind(google), 'PI_SPONSORED_RESOURCE_APPLICATION');
  assert.equal(applicationStage(google), 'RECON');
  assert.equal(mayAutoSubmit(google, { submitIfSafe: true }), false);

  const openai = master.get('openai-researcher-access-hardware-splicer');
  assert.equal(applicationKind(openai), 'RESEARCH_CREDIT_APPLICATION');
  assert.equal(applicationStage(openai), 'RECON');
  assert.ok(packetProfileFor(openai).includes('experiment_or_infrastructure_plan'));

  const erap = master.get('anthropic-external-researcher-access-2026');
  assert.equal(applicationKind(erap), 'RESEARCH_CREDIT_APPLICATION');
  assert.equal(applicationStage(erap), 'RECON');

  const nchc = master.get('nchc-university-ai-compute-yzu-2026');
  assert.equal(applicationKind(nchc), 'PI_SPONSORED_RESOURCE_APPLICATION');
  assert.equal(applicationStage(nchc), 'RECON');
  assert.equal(mayAutoSubmit(nchc, { submitIfSafe: true }), false);
});

test('legacy OFFSET research-credit route is retained only as superseded history', () => {
  const openai = master.get('openai-researcher');
  assert.equal(openai.route_class, 'OFFSET');
  assert.equal(isApplicationRoute(openai), true);
  assert.equal(applicationKind(openai), 'RESEARCH_CREDIT_APPLICATION');
  assert.equal(openai.status, 'KILL_SUPERSEDED');
});

test('conversion policy accepts new resource opportunity types', () => {
  for (const type of ['student_benefit', 'institutional_entitlement', 'research_credit', 'pi_sponsored_credit', 'research_preview', 'pi_sponsored_access']) {
    const result = evaluateOpportunity({
      id: `test-${type}`,
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
