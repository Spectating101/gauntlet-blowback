import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenWebDiscoveryQueries, buildPortfolioDiscoveryPlan } from '../src/radar/search-query.mjs';
import {
  buildSourceFamilyPromotionCandidates,
  classifySourceQuality,
  inferOpportunityType,
  searchBingRss
} from '../src/radar/sources/web-search.mjs';
import { rankPortfolioMatches } from '../src/radar/core.mjs';

test('open-web query builder mixes existing asset vocabulary with research-labor terms', () => {
  const project = {
    id: 'cite',
    discovery_queries: ['research assistant LLM RAG'],
    keywords: ['MCP', 'citation', 'research software']
  };
  const policy = {
    per_project_query_limit: 4,
    opportunity_terms: ['research engineer', 'predoc'],
    opportunity_terms_zh_tw: ['研究助理'],
    geographies: [
      { id: 'north-taiwan', query: 'Taiwan Taipei Hsinchu', priority: 5 },
      { id: 'taiwan-zh', query: '台灣 台北 新竹', priority: 4 }
    ],
    query_exclusions: ['-site:indeed.com']
  };
  const queries = buildOpenWebDiscoveryQueries(project, policy);
  assert.equal(queries.length, 4);
  assert.match(queries[0], /research assistant LLM RAG/);
  assert.ok(queries.some((query) => /research engineer|predoc|研究助理/.test(query)));
  assert.ok(queries.every((query) => query.includes('-site:indeed.com')));
});

test('portfolio discovery plan round-robins projects under a global query budget', () => {
  const policy = {
    query_budget: 3,
    per_project_query_limit: 3,
    opportunity_terms: ['research assistant'],
    geographies: [{ id: 'tw', query: 'Taiwan', priority: 1 }]
  };
  const projects = [
    { id: 'a', discovery_queries: ['alpha'], keywords: ['AI'] },
    { id: 'b', discovery_queries: ['beta'], keywords: ['finance'] }
  ];
  const plan = buildPortfolioDiscoveryPlan(projects, policy);
  assert.equal(plan.length, 3);
  assert.deepEqual(plan.slice(0, 2).map((row) => row.project_id), ['a', 'b']);
});

test('source quality and opportunity type are conservative and explainable', () => {
  const policy = {
    preferred_domains: ['sinica.edu.tw'],
    aggregator_domains: ['indeed.com'],
    blocked_domains: ['facebook.com'],
    preferred_suffixes: ['.edu']
  };
  assert.equal(classifySourceQuality('https://www.sinica.edu.tw/recruitment/1', policy), 'official_candidate');
  assert.equal(classifySourceQuality('https://indeed.com/viewjob?id=1', policy), 'aggregator');
  assert.equal(classifySourceQuality('https://facebook.com/post/1', policy), 'blocked');
  assert.equal(inferOpportunityType('Technical Associate / Predoctoral Research Assistant'), 'predoc');
  assert.equal(inferOpportunityType('AI Research Engineer'), 'research_engineer');
  assert.equal(inferOpportunityType('科技政策 Fellowship'), 'fellowship');
});

test('Bing RSS adapter returns DISCOVERY_ONLY candidates without promoting snippets to verified state', async () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Research Assistant - LLM and RAG</title><link>https://example.edu/jobs/123?utm_source=bing</link><description>Python, retrieval augmented generation, agents.</description></item>
  </channel></rss>`;
  const fetchImpl = async () => ({ ok: true, async text() { return xml; } });
  const rows = await searchBingRss('research assistant LLM Taiwan', {
    fetchImpl,
    policy: { preferred_suffixes: ['.edu'] }
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].type, 'research_assistant');
  assert.equal(rows[0].status, 'discovered');
  assert.match(rows[0].eligibility_text[0], /DISCOVERY_ONLY/);
  assert.equal(rows[0].source.url, 'https://example.edu/jobs/123');
  assert.equal(rows[0].raw_ref.source_quality, 'official_candidate');
});

test('official domains with relevant portfolio matches become source-family promotion candidates', async () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Research Assistant - LLM RAG</title><link>https://example.edu/jobs/1</link><description>LLM RAG research infrastructure.</description></item>
    <item><title>Research Engineer - LLM agents</title><link>https://example.edu/jobs/2</link><description>LLM agents research infrastructure.</description></item>
  </channel></rss>`;
  const fetchImpl = async () => ({ ok: true, async text() { return xml; } });
  const policy = { preferred_suffixes: ['.edu'], promotion_min_hits: 2, promotion_min_match_score: 0.1 };
  const opportunities = await searchBingRss('LLM research', { fetchImpl, policy });
  const projects = [{
    id: 'cite',
    opportunity_types: ['research_assistant', 'research_engineer'],
    keywords: ['LLM', 'RAG', 'research infrastructure', 'agent']
  }];
  const matches = rankPortfolioMatches(opportunities, projects, { minimumScore: 0.1 });
  const promotions = buildSourceFamilyPromotionCandidates(matches, policy);
  assert.equal(promotions.length, 1);
  assert.equal(promotions[0].domain, 'example.edu');
  assert.equal(promotions[0].action, 'VERIFY_DOMAIN_THEN_PROMOTE_TO_SOURCE_FAMILY');
});
