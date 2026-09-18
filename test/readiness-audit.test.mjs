import test from 'node:test';
import assert from 'node:assert/strict';
import { candidateFor, classifyPublicReadiness, selectReadinessRoutes } from '../src/application/readiness-audit.mjs';

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

test('full readiness selection includes all current-cycle routes but excludes past hard deadlines', () => {
  const selection = selectReadinessRoutes({
    today: '2026-09-09', scope: 'all', limit: 20,
    records: [route(), route({ id: 'rolling', deadline: 'ROLLING' }), route({ id: 'expired', deadline: '2026-09-08' })],
  });
  assert.deepEqual(selection.routes.map((item) => item.route_id), ['sample-route', 'rolling']);
});

test('readiness selection includes manifest-backed research submissions', () => {
  const selection = selectReadinessRoutes({
    today: '2026-09-15', days: 7,
    records: [{
      id: 'paper-submit', lane: 'RESEARCH', route_class: 'APPLY', status: 'FIRE_NOW',
      deadline: '2026-09-17', source: 'https://conference.example/submit',
      execution_state: 'PACKET_READY', execution_manifest: 'examples/opportunities/paper.json',
    }],
  });
  assert.deepEqual(selection.routes.map((item) => item.route_id), ['paper-submit']);
});

test('readiness selection honors paused-PhD and external-dependency policy', () => {
  const selection = selectReadinessRoutes({
    today: '2026-09-15', days: 7,
    records: [
      route({ id: 'solo-ready' }),
      route({ id: 'phd-held', lane: 'PHD', route_class: 'PHD' }),
      route({ id: 'needs-team', gate: 'A teammate is required before applying.' }),
    ],
  });
  assert.deepEqual(selection.routes.map((item) => item.route_id), ['solo-ready']);
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

test('an unrelated museum-visit application does not become the competition submission route', () => {
  const candidate = candidateFor('https://www.freeway.gov.tw/Publish.aspx?cnid=193&p=43590', {
    candidate_links: [
      {
        text: '雪隧文物館、收費站文物陳列室線上申請參訪',
        href: 'https://www.freeway.gov.tw/appform/appall.aspx?cnid=1860',
        kind: 'registration',
      },
      {
        text: '國道施工車輛證線上申請',
        href: 'https://www.freeway.gov.tw/ConstructionVehicle/ConstructionVehicleIndex.aspx?cnid=3366',
        kind: 'registration',
      },
    ],
  });
  assert.equal(candidate, null);
});
