import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDiscoveryQueries,
  deduplicateOpportunities,
  isOpportunityActive,
  normalizeOpportunity,
  rankPortfolioMatches,
  scoreOpportunityForProject
} from '../src/radar/core.mjs';
import { fetchGrantDetail, searchGrantsGov } from '../src/radar/sources/grants-gov.mjs';

test('normalization preserves provenance and deduplication prefers richer records', () => {
  const thin = normalizeOpportunity({ id: '7', title: 'AI for Semiconductor Manufacturing', agency: 'NSF' }, { source: 'fixture', retrievedAt: '2026-08-20T00:00:00Z' });
  const rich = normalizeOpportunity({ id: '7', title: 'AI for Semiconductor Manufacturing', agency: 'NSF', description: 'Hardware validation and testing.', eligibility: ['Universities'] }, { source: 'fixture', retrievedAt: '2026-08-20T00:00:00Z' });
  const deduped = deduplicateOpportunities([thin, rich]);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].summary, 'Hardware validation and testing.');
  assert.deepEqual(deduped[0].eligibility_text, ['Universities']);
});

test('portfolio matching is deterministic, explainable, and type bounded', () => {
  const opportunity = normalizeOpportunity({
    id: 'semi-1',
    type: 'grant',
    title: 'Artificial Intelligence for Semiconductor Hardware Validation',
    description: 'Research on electronics testing and advanced manufacturing.'
  }, { source: 'fixture' });
  const hardware = {
    id: 'hardware-splicer',
    opportunity_types: ['grant'],
    keywords: [
      { term: 'semiconductor', weight: 3 },
      { term: 'hardware', weight: 2 },
      { term: 'validation', weight: 2 },
      { term: 'testing', weight: 1 },
      { term: 'artificial intelligence', weight: 1 }
    ]
  };
  const nocturnal = {
    id: 'nocturnal',
    opportunity_types: ['grant'],
    keywords: [{ term: 'journalism', weight: 3 }, { term: 'governance', weight: 2 }]
  };
  const match = scoreOpportunityForProject(opportunity, hardware);
  assert.equal(match.score, 1);
  assert.ok(match.matched_terms.includes('semiconductor'));
  const ranked = rankPortfolioMatches([opportunity], [nocturnal, hardware]);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].project_id, 'hardware-splicer');
});

test('short terms use token boundaries instead of substring matches', () => {
  const project = { id: 'ai', opportunity_types: ['grant'], keywords: [{ term: 'AI', weight: 1 }] };
  const falsePositive = normalizeOpportunity({ id: '1', type: 'grant', title: 'Training for Journalists' }, { source: 'fixture' });
  const truePositive = normalizeOpportunity({ id: '2', type: 'grant', title: 'AI for Journalists' }, { source: 'fixture' });
  assert.equal(scoreOpportunityForProject(falsePositive, project).score, 0);
  assert.equal(scoreOpportunityForProject(truePositive, project).score, 1);
});

test('expired deadlines are filtered while forecasted/no-deadline records remain visible', () => {
  const asOf = new Date('2026-08-20T12:00:00Z');
  const expired = normalizeOpportunity({ id: 'old', title: 'Old Grant', deadline: '2026-08-18', status: 'posted' }, { source: 'fixture' });
  const today = normalizeOpportunity({ id: 'today', title: 'Today Grant', deadline: '2026-08-20', status: 'posted' }, { source: 'fixture' });
  const forecast = normalizeOpportunity({ id: 'future', title: 'Forecast Grant', status: 'forecasted' }, { source: 'fixture' });
  assert.equal(isOpportunityActive(expired, { asOf }), false);
  assert.equal(isOpportunityActive(today, { asOf }), true);
  assert.equal(isOpportunityActive(forecast, { asOf }), true);
});

test('explicit discovery queries are used before keyword fallbacks', () => {
  assert.deepEqual(buildDiscoveryQueries({ id: 'p', discovery_queries: ['one', 'two'], keywords: ['three'] }), ['one', 'two']);
  assert.deepEqual(buildDiscoveryQueries({ id: 'p', keywords: [{ term: 'low', weight: 1 }, { term: 'high', weight: 4 }] }), ['high', 'low']);
});

test('Grants.gov search adapter sends official search2 shape and normalizes hits', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      async json() {
        return {
          errorcode: 0,
          data: {
            oppHits: [{ id: '219999', number: 'ABC-1', title: 'Semiconductor AI Research', agencyCode: 'NSF', agencyName: 'National Science Foundation', openDate: '08/01/2026', closeDate: '10/01/2026', oppStatus: 'posted', docType: 'synopsis', alnist: ['47.041'] }]
          }
        };
      }
    };
  };
  const rows = await searchGrantsGov({ keyword: 'semiconductor AI', rows: 10, fetchImpl });
  assert.equal(request.url, 'https://api.grants.gov/v1/api/search2');
  assert.deepEqual(JSON.parse(request.options.body), { keyword: 'semiconductor AI', rows: 10, oppStatuses: 'forecasted|posted' });
  assert.equal(rows[0].id, 'grants.gov:219999');
  assert.equal(rows[0].organization, 'National Science Foundation');
  assert.match(rows[0].source.url, /219999$/);
});

test('Grants.gov detail adapter preserves eligibility and award metadata', async () => {
  const fetchImpl = async () => ({
    ok: true,
    async json() {
      return {
        errorcode: 0,
        data: {
          id: 289999,
          opportunityNumber: 'TEST-1',
          opportunityTitle: 'Research Infrastructure',
          owningAgencyCode: 'NSF',
          docType: 'synopsis',
          synopsis: {
            agencyName: 'National Science Foundation',
            synopsisDesc: 'Build reproducible research infrastructure.',
            responseDateDesc: 'Oct 11, 2026 12:00:00 AM EDT',
            postingDate: 'Aug 11, 2026 12:00:00 AM EDT',
            applicantTypes: [{ description: 'Public and state institutions of higher education' }],
            fundingInstruments: [{ description: 'Grant' }],
            fundingActivityCategories: [{ description: 'Science and Technology' }],
            awardCeiling: '1000000',
            awardFloor: '100000',
            costSharing: false
          },
          alns: [{ programTitle: 'Research Infrastructure' }]
        }
      };
    }
  });
  const detail = await fetchGrantDetail(289999, { fetchImpl });
  assert.deepEqual(detail.eligibility_text, ['Public and state institutions of higher education']);
  assert.equal(detail.funding.ceiling, '1000000');
  assert.ok(detail.tags.includes('research infrastructure'));
});
