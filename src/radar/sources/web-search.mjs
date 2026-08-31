import { normalizeOpportunity } from '../core.mjs';

function list(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function decodeEntities(value) {
  return String(value ?? '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(value) {
  return decodeEntities(String(value ?? '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstTag(block, tag) {
  const match = String(block ?? '').match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripTags(match[1]) : '';
}

function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid|msclkid)/i.test(key)) url.searchParams.delete(key);
  }
  return url.href.replace(/\/$/, '');
}

function hostMatches(host, domain) {
  const needle = String(domain ?? '').toLowerCase().replace(/^\./, '');
  return host === needle || host.endsWith(`.${needle}`);
}

export function classifySourceQuality(urlValue, policy = {}) {
  const host = new URL(urlValue).hostname.toLowerCase();
  if (list(policy.blocked_domains).some((domain) => hostMatches(host, domain))) return 'blocked';
  if (list(policy.aggregator_domains).some((domain) => hostMatches(host, domain))) return 'aggregator';
  if (list(policy.preferred_domains).some((domain) => hostMatches(host, domain))) return 'official_candidate';
  if (list(policy.preferred_suffixes).some((suffix) => host.endsWith(String(suffix).toLowerCase()))) return 'official_candidate';
  return 'unknown';
}

export function inferOpportunityType(value) {
  const text = String(value ?? '').normalize('NFKC').toLowerCase();
  if (/predoc|predoctoral|博士前/.test(text)) return 'predoc';
  if (/research residency|research resident|residency/.test(text)) return 'research_residency';
  if (/policy fellowship|policy fellow/.test(text)) return 'policy_fellowship';
  if (/research fellowship|research fellow|fellowship|visiting researcher|visiting scholar|研究員/.test(text)) return 'research_fellowship';
  if (/research engineer|software engineer.*research|研究工程師/.test(text)) return 'research_engineer';
  if (/research officer|research professional|technical associate|project researcher|project staff|研究專員|計畫助理/.test(text)) return 'research_staff';
  if (/research assistant|student ra|research associate|研究助理|專任研究助理|兼任研究助理/.test(text)) return 'research_assistant';
  if (/join us|open positions|recruiting students|招募|徵才/.test(text)) return 'faculty_pull';
  if (/grant|funding|award/.test(text)) return 'grant';
  return 'fellowship';
}

function parseBingRss(xml) {
  const rows = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = re.exec(String(xml ?? '')))) {
    const title = firstTag(match[1], 'title');
    const link = firstTag(match[1], 'link');
    const description = firstTag(match[1], 'description');
    if (!title || !link || !/^https?:/i.test(link)) continue;
    rows.push({ title, url: link, summary: description });
  }
  return rows;
}

function searchRowToOpportunity(row, { query, provider, policy, retrievedAt }) {
  const url = canonicalUrl(row.url);
  const quality = classifySourceQuality(url, policy);
  const searchable = `${row.title} ${row.summary ?? ''}`;
  return normalizeOpportunity({
    source_id: url,
    canonical_id: `web-search:${url}`,
    type: inferOpportunityType(searchable),
    title: row.title,
    organization: new URL(url).hostname,
    summary: row.summary ?? '',
    status: 'discovered',
    tags: ['open-web-discovery', `source-quality:${quality}`],
    eligibility_text: ['DISCOVERY_ONLY: search-result evidence is not sufficient for ELIGIBLE/READY; hydrate the official source first.'],
    url,
    raw_ref: {
      discovery_only: true,
      provider,
      query,
      source_quality: quality,
      search_result_only: true
    }
  }, { source: `web-search:${provider}`, retrievedAt });
}

export async function searchBingRss(query, {
  fetchImpl = fetch,
  count = 8,
  market = 'en-US',
  policy = {},
  retrievedAt = new Date().toISOString()
} = {}) {
  const url = new URL('https://www.bing.com/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'rss');
  url.searchParams.set('count', String(count));
  url.searchParams.set('setlang', market.split('-')[0]);
  const response = await fetchImpl(url, { headers: { 'user-agent': 'gauntlet-blowback-open-web-radar/1.0' } });
  if (!response.ok) throw new Error(`Bing RSS HTTP ${response.status}`);
  return parseBingRss(await response.text())
    .map((row) => searchRowToOpportunity(row, { query, provider: 'bing-rss', policy, retrievedAt }))
    .filter((row) => row.raw_ref?.source_quality !== 'blocked');
}

export async function searchBrave(query, {
  fetchImpl = fetch,
  apiKey = process.env.BRAVE_SEARCH_API_KEY,
  count = 8,
  policy = {},
  retrievedAt = new Date().toISOString()
} = {}) {
  if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY is not configured');
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(count));
  const response = await fetchImpl(url, {
    headers: {
      accept: 'application/json',
      'x-subscription-token': apiKey,
      'user-agent': 'gauntlet-blowback-open-web-radar/1.0'
    }
  });
  if (!response.ok) throw new Error(`Brave Search HTTP ${response.status}`);
  const payload = await response.json();
  return list(payload?.web?.results)
    .filter((row) => row?.title && row?.url)
    .map((row) => searchRowToOpportunity({ title: row.title, url: row.url, summary: row.description ?? '' }, {
      query,
      provider: 'brave',
      policy,
      retrievedAt
    }))
    .filter((row) => row.raw_ref?.source_quality !== 'blocked');
}

export async function searchOpenWebQueries(queryPlan = [], policy = {}, {
  fetchImpl = fetch,
  provider = policy.provider ?? 'auto',
  apiKey = process.env.BRAVE_SEARCH_API_KEY,
  retrievedAt = new Date().toISOString()
} = {}) {
  const opportunities = [];
  const source_errors = [];
  const chosenProvider = provider === 'auto' ? (apiKey ? 'brave' : 'bing-rss') : provider;
  for (const row of queryPlan) {
    try {
      const results = chosenProvider === 'brave'
        ? await searchBrave(row.query, { fetchImpl, apiKey, count: policy.results_per_query ?? 8, policy, retrievedAt })
        : await searchBingRss(row.query, { fetchImpl, count: policy.results_per_query ?? 8, policy, retrievedAt });
      for (const opportunity of results) {
        opportunity.raw_ref.seed_project_id = row.project_id;
        opportunities.push(opportunity);
      }
    } catch (error) {
      source_errors.push({ project_id: row.project_id, query: row.query, provider: chosenProvider, error: String(error?.message ?? error) });
    }
  }

  const byId = new Map();
  for (const opportunity of opportunities) {
    const previous = byId.get(opportunity.id);
    if (!previous || String(opportunity.summary ?? '').length > String(previous.summary ?? '').length) byId.set(opportunity.id, opportunity);
  }
  return { provider: chosenProvider, opportunities: [...byId.values()], source_errors };
}

export function buildSourceFamilyPromotionCandidates(matches = [], policy = {}) {
  const threshold = Number(policy.promotion_min_match_score ?? 0.12);
  const minimumHits = Number(policy.promotion_min_hits ?? 2);
  const domains = new Map();
  for (const match of matches) {
    if (Number(match.score ?? 0) < threshold) continue;
    const opportunity = match.opportunity;
    if (!opportunity?.source?.url) continue;
    const quality = opportunity.raw_ref?.source_quality ?? classifySourceQuality(opportunity.source.url, policy);
    if (quality === 'blocked' || quality === 'aggregator') continue;
    const host = new URL(opportunity.source.url).hostname.toLowerCase();
    const row = domains.get(host) ?? { domain: host, hit_count: 0, project_ids: new Set(), urls: new Set(), source_quality: quality };
    row.hit_count += 1;
    row.project_ids.add(match.project_id);
    row.urls.add(opportunity.source.url);
    if (quality === 'official_candidate') row.source_quality = quality;
    domains.set(host, row);
  }
  return [...domains.values()]
    .filter((row) => row.hit_count >= minimumHits || row.source_quality === 'official_candidate')
    .map((row) => ({
      domain: row.domain,
      hit_count: row.hit_count,
      project_ids: [...row.project_ids].sort(),
      sample_urls: [...row.urls].slice(0, 5),
      source_quality: row.source_quality,
      action: 'VERIFY_DOMAIN_THEN_PROMOTE_TO_SOURCE_FAMILY'
    }))
    .sort((a, b) => b.hit_count - a.hit_count || a.domain.localeCompare(b.domain));
}
