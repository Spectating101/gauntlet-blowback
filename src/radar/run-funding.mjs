import fs from 'node:fs/promises';
import path from 'node:path';
import { monitorFundingRegistryDetailed } from './sources/funding-page.mjs';
import { rankPortfolioMatches } from './core.mjs';

const [registryArg = 'examples/radar/funding-source-registry.json', scopeArg = 'examples/radar/funding-scope-v1.json'] = process.argv.slice(2);

async function readJson(file) {
  return JSON.parse(await fs.readFile(path.resolve(file), 'utf8'));
}

const registry = await readJson(registryArg);
const scope = await readJson(scopeArg);
const monitored = await monitorFundingRegistryDetailed(registry.sources ?? []);
const opportunities = monitored.opportunities;
const matches = rankPortfolioMatches(opportunities, scope.projects ?? [], { minimumScore: 0.08, activeOnly: true });

process.stdout.write(JSON.stringify({
  retrieved_at: new Date().toISOString(),
  source_count: (registry.sources ?? []).length,
  opportunity_count: opportunities.length,
  match_count: matches.length,
  source_errors: monitored.source_errors,
  opportunities,
  matches
}, null, 2) + '\n');
