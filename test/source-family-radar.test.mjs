import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverSourceFamily, discoverSourceRegistry } from '../src/radar/sources/source-family.mjs';
import { rankPortfolioMatches } from '../src/radar/core.mjs';

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return body; }
  };
}

test('source-family radar discovers matching research openings and hydrates detail text', async () => {
  const pages = new Map([
    ['https://example.edu/jobs', `
      <html><body>
        <a href="/jobs/ra-1">Research Assistant — LLM and RAG</a>
        <a href="/jobs/eng-2">AI Engineer — MCP agents</a>
        <a href="/jobs/faculty-3">Professor of Computer Science</a>
      </body></html>`],
    ['https://example.edu/jobs/ra-1', '<main>Research Assistant working on LLM, RAG, citations and reproducible research systems.</main>'],
    ['https://example.edu/jobs/eng-2', '<main>AI Engineer building MCP agent tool calls and research infrastructure.</main>']
  ]);
  const fetchImpl = async (url) => pages.has(url) ? response(pages.get(url)) : response('not found', 404);

  const source = {
    id: 'example-research',
    source: 'example',
    title: 'Example research jobs',
    organization: 'Example University',
    url: 'https://example.edu/jobs',
    type: 'research_assistant',
    tags: ['research'],
    include_terms: ['Research Assistant', 'AI Engineer'],
    exclude_terms: ['Professor']
  };

  const rows = await discoverSourceFamily(source, { fetchImpl });
  assert.equal(rows.length, 2);
  assert.equal(rows[0].type, 'research_assistant');
  assert.equal(rows[0].status, 'discovered');
  assert.equal(rows[0].raw_ref.discovery_only, true);
  assert.match(rows[0].summary, /LLM, RAG/);
  assert.ok(rows.every((row) => row.source.url.startsWith('https://example.edu/jobs/')));

  const matches = rankPortfolioMatches(rows, [{
    id: 'cite-agent',
    opportunity_types: ['research_assistant'],
    keywords: ['LLM', 'RAG', 'MCP', 'research infrastructure']
  }], { minimumScore: 0.2 });
  assert.equal(matches.length, 2);
});

test('source registry isolates an unavailable source instead of killing the whole sweep', async () => {
  const fetchImpl = async (url) => {
    if (url === 'https://good.example/jobs') return response('<a href="/ra">Research Assistant — AI</a>');
    if (url === 'https://good.example/ra') return response('AI research assistant role using machine learning.');
    return response('down', 503);
  };
  const { opportunities, source_errors } = await discoverSourceRegistry([
    { id: 'good', url: 'https://good.example/jobs', type: 'research_assistant', include_terms: ['Research Assistant'] },
    { id: 'bad', url: 'https://bad.example/jobs', type: 'research_assistant', include_terms: ['Research Assistant'] }
  ], { fetchImpl });
  assert.equal(opportunities.length, 1);
  assert.equal(source_errors.length, 1);
  assert.equal(source_errors[0].id, 'bad');
});
