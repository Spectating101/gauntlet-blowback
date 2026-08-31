import { normalizeOpportunity } from '../core.mjs';

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(text, markers = []) {
  const value = text.toLowerCase();
  return markers.some((marker) => value.includes(String(marker).toLowerCase()));
}

/**
 * Monitor a known public funding page without pretending a generic HTML parser
 * can infer eligibility, deadlines or funding amounts safely.
 *
 * The registry supplies the semantic fields. The live page is used only to
 * confirm that configured open/closed markers are still present and to keep a
 * provenance timestamp. A downstream verifier must still hydrate the canonical
 * opportunity dossier before READY.
 */
export async function monitorFundingPage(entry, { fetchImpl = fetch, retrievedAt = new Date().toISOString() } = {}) {
  if (!entry?.url) throw new Error('funding page url is required');
  if (!entry?.title) throw new Error('funding page title is required');

  const response = await fetchImpl(entry.url, { headers: { 'user-agent': 'gauntlet-blowback-funding-radar/1.0' } });
  if (!response.ok) throw new Error(`Funding page HTTP ${response.status}: ${entry.url}`);
  const body = stripHtml(await response.text());

  const closed = includesAny(body, entry.closed_markers ?? []);
  const open = includesAny(body, entry.open_markers ?? []);
  const status = closed ? 'closed' : open ? 'posted' : 'unknown';

  return normalizeOpportunity({
    source_id: entry.source_id ?? entry.id ?? entry.url,
    type: entry.type ?? 'grant',
    title: entry.title,
    organization: entry.organization ?? null,
    summary: entry.summary ?? '',
    status,
    open_date: entry.open_date ?? null,
    deadline: entry.deadline ?? null,
    tags: entry.tags ?? [],
    eligibility_text: entry.eligibility_text ?? [],
    funding: entry.funding ?? null,
    url: entry.url,
    raw_ref: {
      configured_source: true,
      live_marker_state: status,
      marker_open: open,
      marker_closed: closed
    }
  }, { source: entry.source ?? 'funding-page', retrievedAt });
}

export async function monitorFundingRegistryDetailed(entries, options = {}) {
  const opportunities = [];
  const source_errors = [];
  for (const entry of entries ?? []) {
    try {
      opportunities.push(await monitorFundingPage(entry, options));
    } catch (error) {
      source_errors.push({
        id: entry?.id ?? entry?.source_id ?? null,
        url: entry?.url ?? null,
        error: String(error?.message ?? error)
      });
    }
  }
  return { opportunities, source_errors };
}

export async function monitorFundingRegistry(entries, options = {}) {
  return (await monitorFundingRegistryDetailed(entries, options)).opportunities;
}
