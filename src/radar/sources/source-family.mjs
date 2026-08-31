import { normalizeOpportunity } from '../core.mjs';

function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(value) {
  return decodeEntities(String(value ?? ''))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalized(value) {
  return stripHtml(value).normalize('NFKC').toLowerCase();
}

function matchesAny(value, terms = []) {
  const haystack = normalized(value);
  return terms.some((term) => haystack.includes(normalized(term)));
}

function extractAnchors(html, baseUrl) {
  const anchors = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(String(html ?? '')))) {
    try {
      const url = new URL(decodeEntities(match[1]), baseUrl).href;
      const title = stripHtml(match[2]);
      if (!/^https?:/i.test(url)) continue;
      anchors.push({ url, title });
    } catch {
      // Ignore malformed links from source pages.
    }
  }
  return anchors;
}

function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
  }
  return url.href.replace(/\/$/, '');
}

async function hydrateCandidate(candidate, source, { fetchImpl, maxSummaryChars }) {
  let summary = '';
  let detailStatus = 'unfetched';
  try {
    const response = await fetchImpl(candidate.url, { headers: { 'user-agent': 'gauntlet-blowback-opportunity-radar/1.0' } });
    if (response.ok) {
      summary = stripHtml(await response.text()).slice(0, maxSummaryChars);
      detailStatus = 'fetched';
    } else detailStatus = `http_${response.status}`;
  } catch (error) {
    detailStatus = `error:${error?.name ?? 'fetch'}`;
  }

  const searchable = `${candidate.title} ${candidate.url} ${summary}`;
  const matchedTerms = (source.include_terms ?? []).filter((term) => matchesAny(searchable, [term]));

  return normalizeOpportunity({
    source_id: canonicalUrl(candidate.url),
    canonical_id: `source-family:${source.id}:${canonicalUrl(candidate.url)}`,
    type: source.type ?? 'research_staff',
    title: candidate.title || new URL(candidate.url).pathname.split('/').filter(Boolean).pop() || source.title,
    organization: source.organization ?? source.title ?? source.id,
    summary,
    status: 'discovered',
    tags: [...new Set([...(source.tags ?? []), ...matchedTerms])],
    eligibility_text: ['DISCOVERY_ONLY: hydrate official posting before ELIGIBLE/READY.'],
    url: candidate.url,
    raw_ref: {
      discovery_only: true,
      source_family_id: source.id,
      index_url: source.url,
      anchor_text: candidate.title,
      matched_terms: matchedTerms,
      detail_status: detailStatus
    }
  }, { source: source.source ?? `source-family:${source.id}` });
}

export async function discoverSourceFamily(source, {
  fetchImpl = fetch,
  maxCandidates = 40,
  maxSummaryChars = 7000
} = {}) {
  if (!source?.id) throw new Error('source family id is required');
  if (!source?.url) throw new Error('source family url is required');

  const response = await fetchImpl(source.url, { headers: { 'user-agent': 'gauntlet-blowback-opportunity-radar/1.0' } });
  if (!response.ok) throw new Error(`Source-family page HTTP ${response.status}: ${source.url}`);
  const html = await response.text();
  const indexHost = new URL(source.url).host;
  const seen = new Set();

  const candidates = extractAnchors(html, source.url)
    .filter((candidate) => {
      const searchable = `${candidate.title} ${candidate.url}`;
      if ((source.include_terms ?? []).length && !matchesAny(searchable, source.include_terms)) return false;
      if ((source.exclude_terms ?? []).length && matchesAny(searchable, source.exclude_terms)) return false;
      if (source.same_host_only !== false && new URL(candidate.url).host !== indexHost) return false;
      const key = canonicalUrl(candidate.url);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, source.max_candidates ?? maxCandidates);

  const rows = [];
  for (const candidate of candidates) rows.push(await hydrateCandidate(candidate, source, { fetchImpl, maxSummaryChars }));
  return rows;
}

export async function discoverSourceRegistry(sources, options = {}) {
  const opportunities = [];
  const source_errors = [];
  for (const source of sources ?? []) {
    try {
      opportunities.push(...await discoverSourceFamily(source, options));
    } catch (error) {
      source_errors.push({ id: source?.id ?? null, url: source?.url ?? null, error: String(error?.message ?? error) });
    }
  }
  return { opportunities, source_errors };
}
