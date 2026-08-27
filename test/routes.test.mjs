import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAuthScope, resolveRouteUrls } from '../src/core/routes.mjs';
import { validateOpportunity } from '../src/core/validate.mjs';

function baseOpportunity(overrides = {}) {
  return {
    id: 'route-test',
    name: 'Route Test',
    portal: 'generic',
    source_url: 'https://example.org/info',
    mode: 'inspect',
    profile: '../examples/profiles/christ.json',
    project: '../examples/projects/public-good-control.json',
    fields: {},
    uploads: [],
    human_required: ['final_submit'],
    ...overrides
  };
}

test('route stages keep source reconnaissance separate from execution target', () => {
  const routes = resolveRouteUrls(baseOpportunity({
    registration_url: 'https://apply.example.org/register',
    submission_url: 'https://apply.example.org/submission/42'
  }));
  assert.equal(routes.recon_url, 'https://example.org/info');
  assert.equal(routes.execution_url, 'https://apply.example.org/submission/42');
});

test('generic portals derive auth scope from host instead of sharing generic.json', () => {
  const google = resolveAuthScope(baseOpportunity({ source_url: 'https://docs.google.com/forms/d/e/test/viewform' }));
  const innoserve = resolveAuthScope(baseOpportunity({ source_url: 'https://innoserve.tca.org.tw/rules' }));
  assert.equal(google, 'docs.google.com');
  assert.equal(innoserve, 'innoserve.tca.org.tw');
  assert.notEqual(google, innoserve);
});

test('explicit auth_scope wins and is filename-safe', () => {
  assert.equal(
    resolveAuthScope(baseOpportunity({ auth_scope: 'ConfTool / AIFinConf 2026' })),
    'conftool-aifinconf-2026'
  );
});

test('prepare is blocked until portal mapping is explicitly verified', () => {
  const blocked = validateOpportunity(baseOpportunity({ mode: 'prepare', execution_state: 'PORTAL_RECON_REQUIRED' }));
  assert.equal(blocked.ok, false);
  assert.match(blocked.errors.join('\n'), /prepare mode requires execution_state/);

  const allowed = validateOpportunity(baseOpportunity({ mode: 'prepare', execution_state: 'PORTAL_MAPPED' }));
  assert.equal(allowed.ok, true);
});
