import fs from 'node:fs/promises';
import path from 'node:path';
import { rankPortfolioMatches } from './core.mjs';
import { buildPortfolioDiscoveryPlan } from './search-query.mjs';
import { buildSourceFamilyPromotionCandidates, searchOpenWebQueries } from './sources/web-search.mjs';

const [
  policyArg = 'examples/radar/open-web-discovery-policy.json',
  scopeArg = 'examples/radar/funding-scope-v1.json'
] = process.argv.slice(2);

async function readJson(file) {
  return JSON.parse(await fs.readFile(path.resolve(file), 'utf8'));
}

const policy = await readJson(policyArg);
const scope = await readJson(scopeArg);
const queryPlan = buildPortfolioDiscoveryPlan(scope.projects ?? [], policy);
const discovery = await searchOpenWebQueries(queryPlan, policy);
const matches = rankPortfolioMatches(discovery.opportunities, scope.projects ?? [], {
  minimumScore: Number(policy.minimum_match_score ?? 0.08),
  activeOnly: true
});
const sourceFamilyPromotionCandidates = buildSourceFamilyPromotionCandidates(matches, policy);

process.stdout.write(JSON.stringify({
  schema: 'blowback.open_web_discovery_run.v1',
  retrieved_at: new Date().toISOString(),
  provider: discovery.provider,
  query_count: queryPlan.length,
  opportunity_count: discovery.opportunities.length,
  match_count: matches.length,
  query_plan: queryPlan,
  source_errors: discovery.source_errors,
  source_family_promotion_candidates: sourceFamilyPromotionCandidates,
  opportunities: discovery.opportunities,
  matches
}, null, 2) + '\n');
