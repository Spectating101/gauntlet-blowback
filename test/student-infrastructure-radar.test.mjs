import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import { applicationKind, applicationStage, isApplicationRoute, mayAutoSubmit, packetProfileFor } from '../src/application/operator.mjs';
import { evaluateOpportunity } from '../src/core/conversion.mjs';

const radar = JSON.parse(fs.readFileSync(new URL('../data/student-research-infrastructure-radar-2026-09-01.json', import.meta.url), 'utf8'));
const routes = new Map(radar.routes.map((route) => [route.id, route]));
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
  assert.equal(openai.status, 'FIRE_NOW');
  assert.equal(openai.execution_state, 'APPLICATION_READY');
  assert.equal(openai.deadline, 'ROLLING_QUARTERLY_REVIEW');
  assert.match(openai.gate, /No exact September cutoff is published/i);
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
});

test('legacy OFFSET research-credit routes now enter resource application autopilot', () => {
  const openai = master.get('openai-researcher');
  assert.equal(openai.route_class, 'OFFSET');
  assert.equal(isApplicationRoute(openai), true);
  assert.equal(applicationKind(openai), 'RESEARCH_CREDIT_APPLICATION');
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
