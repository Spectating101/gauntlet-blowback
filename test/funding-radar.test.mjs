import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateOpportunity } from '../src/core/conversion.mjs';
import { monitorFundingPage, monitorFundingRegistryDetailed } from '../src/radar/sources/funding-page.mjs';
import { scoreOpportunityForProject } from '../src/radar/core.mjs';

test('conversion policy accepts sponsorship and institutional pilot types without weakening gates', () => {
  for (const type of ['sponsorship', 'fellowship', 'institutional_pilot']) {
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
    assert.equal(result.ok, true);
    assert.equal(result.decision, 'READY');
    assert.equal(result.doctrine.fire, true);
  }
});

test('funding page monitor preserves configured semantics and only derives marker status', async () => {
  const fetchImpl = async () => ({
    ok: true,
    async text() {
      return '<html><body><h1>Apply for funding</h1><p>Submit a proposal before the deadline.</p></body></html>';
    }
  });

  const opportunity = await monitorFundingPage({
    id: 'example-fund',
    source: 'example',
    type: 'sponsorship',
    title: 'Example sponsorship',
    organization: 'Example Foundation',
    url: 'https://example.test/funding',
    deadline: '2026-11-03T12:00:00+01:00',
    open_markers: ['submit a proposal'],
    closed_markers: ['applications closed'],
    eligibility_text: ['Must be verified downstream.'],
    funding: { currency: 'EUR', ceiling: 50000 }
  }, { fetchImpl, retrievedAt: '2026-08-22T08:00:00.000Z' });

  assert.equal(opportunity.type, 'sponsorship');
  assert.equal(opportunity.status, 'posted');
  assert.equal(opportunity.organization, 'Example Foundation');
  assert.equal(opportunity.funding.ceiling, 50000);
  assert.deepEqual(opportunity.eligibility_text, ['Must be verified downstream.']);
  assert.equal(opportunity.raw_ref.live_marker_state, 'posted');
});

test('funding registry isolates one hostile source instead of aborting the whole sweep', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('blocked')) return { ok: false, status: 426, async text() { return ''; } };
    return { ok: true, status: 200, async text() { return '<p>Apply now</p>'; } };
  };
  const monitored = await monitorFundingRegistryDetailed([
    { id: 'blocked', title: 'Blocked fund', url: 'https://blocked.test', open_markers: ['apply now'] },
    { id: 'healthy', title: 'Healthy fund', url: 'https://healthy.test', open_markers: ['apply now'] }
  ], { fetchImpl });
  assert.equal(monitored.opportunities.length, 1);
  assert.equal(monitored.opportunities[0].title, 'Healthy fund');
  assert.equal(monitored.source_errors.length, 1);
  assert.equal(monitored.source_errors[0].id, 'blocked');
  assert.match(monitored.source_errors[0].error, /HTTP 426/);
});

test('funding source type bounds prevent grant-only candidates leaking into sponsorship-only project scope', () => {
  const opportunity = {
    id: 'grant:1',
    type: 'grant',
    title: 'Open source infrastructure grant',
    organization: 'Example',
    summary: 'Funding for open source software infrastructure',
    tags: [],
    eligibility_text: []
  };
  const project = {
    id: 'sponsor-only',
    opportunity_types: ['sponsorship'],
    keywords: ['open source', 'infrastructure']
  };
  const match = scoreOpportunityForProject(opportunity, project);
  assert.equal(match.type_match, false);
  assert.equal(match.score, 0);
});
