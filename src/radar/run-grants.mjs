import fs from 'node:fs/promises';
import { buildDiscoveryQueries, deduplicateOpportunities, rankPortfolioMatches } from './core.mjs';
import { searchGrantsGov } from './sources/grants-gov.mjs';

const scopePath = process.argv[2] ?? 'examples/radar/portfolio-scope.json';
const minimumScore = Number(process.env.RADAR_MIN_SCORE ?? 0.08);
const rows = Number(process.env.RADAR_ROWS ?? 25);
const scope = JSON.parse(await fs.readFile(scopePath, 'utf8'));
const projects = scope.projects ?? [];

const discovered = [];
const queryLog = [];
for (const project of projects) {
  for (const query of buildDiscoveryQueries(project)) {
    try {
      const opportunities = await searchGrantsGov({ keyword: query, rows });
      discovered.push(...opportunities);
      queryLog.push({ project_id: project.id, query, count: opportunities.length, ok: true });
    } catch (error) {
      queryLog.push({ project_id: project.id, query, count: 0, ok: false, error: error.message });
    }
  }
}

const unique = deduplicateOpportunities(discovered);
const matches = rankPortfolioMatches(unique, projects, { minimumScore });

console.log(JSON.stringify({
  generated_at: new Date().toISOString(),
  source: 'grants.gov',
  scope_path: scopePath,
  query_count: queryLog.length,
  discovered_count: discovered.length,
  unique_count: unique.length,
  match_count: matches.length,
  queries: queryLog,
  matches: matches.map((row) => ({
    project_id: row.project_id,
    score: row.score,
    matched_terms: row.matched_terms,
    opportunity: {
      id: row.opportunity.id,
      title: row.opportunity.title,
      organization: row.opportunity.organization,
      deadline: row.opportunity.deadline,
      status: row.opportunity.status,
      url: row.opportunity.source.url
    }
  }))
}, null, 2));
