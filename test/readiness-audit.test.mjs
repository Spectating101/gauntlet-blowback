import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPublicReadiness, selectReadinessRoutes } from '../src/application/readiness-audit.mjs';

function route(overrides = {}) {
  return {
    id: 'sample-route', lane: 'RESEARCH_JOB', route_class: 'RESEARCH_ENGINEER', status: 'FIRE_NOW',
    deadline: '2026-09-16', source: 'https://jobs.example.edu/apply', execution_state: 'APPLICATION_READY', ...overrides,
  };
}

test('readiness selection limits public auditing to near-term and executable rolling work', () => {
  const selection = selectReadinessRoutes({
    today: '2026-09-09', days: 21,
    records: [
      route(),
      route({ id: 'rolling-fire', deadline: 'ROLLING', execution_manifest: 'examples/opportunities/openai-researcher-access-hardware-splicer.json' }),
      route({ id: 'expired', deadline: '2026-09-08' }),
      route({ id: 'far-future', deadline: '2026-12-01' }),
    ],
  });
  assert.deepEqual(selection.routes.map((item) => item.route_id), ['sample-route', 'rolling-fire']);
});

test('readiness classifier records an observed login requirement without claiming it can create an account', () => {
  const result = classifyPublicReadiness({ signals: { password_inputs: 1, login: true }, forms: [], controls: [], file_inputs: [] });
  assert.equal(result.readiness, 'ACCOUNT_OR_LOGIN_GATE_OBSERVED');
  assert.equal(result.account_requirement, 'OBSERVED');
  assert.equal(result.can_prepare_now, false);
});

test('public application-form reachability remains distinct from proving no account is required', () => {
  const result = classifyPublicReadiness({
    url: 'https://example.org/apply', signals: {}, forms: [{ action: 'https://example.org/apply' }],
    controls: [{ type: 'text', required: true, labels: ['Applicant name'] }], file_inputs: [],
  });
  assert.equal(result.readiness, 'PUBLIC_FORM_REACHABLE');
  assert.equal(result.account_requirement, 'NOT_OBSERVED_ON_CURRENT_PAGE');
  assert.equal(result.can_prepare_now, false);
});

test('ordinary search or newsletter controls do not masquerade as an application form', () => {
  const result = classifyPublicReadiness({
    url: 'https://example.org/about', signals: {}, forms: [{ action: 'https://example.org/search' }],
    controls: [{ type: 'search', required: false, labels: ['Search'] }], file_inputs: [],
  });
  assert.equal(result.readiness, 'PUBLIC_SOURCE_RECON_ONLY');
});

test('a cookie-consent form on an apply URL is not evidence that an application form is ready', () => {
  const result = classifyPublicReadiness({
    url: 'https://example.org/apply', signals: {}, forms: [{ action: 'https://example.org/api/cookie-consent' }],
    controls: [{ type: null, name: 'consent', labels: [] }, { type: 'checkbox' }], file_inputs: [],
  });
  assert.equal(result.readiness, 'PUBLIC_SOURCE_RECON_ONLY');
});
