/** Read-only ESCO occupation suggestions; NOT hiring eligibility or open jobs. */
const ROOT = 'https://ec.europa.eu/esco/api/search';
export async function escoOccupationCandidates(query, {limit = 5, fetchImpl = fetch} = {}) {
  if (typeof query !== 'string' || query.trim().length < 2 || query.trim().length > 120) throw new Error('query must be 2-120 chars');
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('limit must be 1-10');
  const url = new URL(ROOT);
  url.searchParams.set('text', query.trim());
  url.searchParams.set('type', 'occupation');
  url.searchParams.set('language', 'en');
  url.searchParams.set('limit', String(limit));
  const response = await fetchImpl(url.toString(), { headers: { 'Accept': 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('ESCO HTTP ' + response.status);
  if (!(response.headers?.get?.('content-type') || '').includes('json')) throw new Error('ESCO returned non-JSON');
  const text = await response.text();
  if (text.length > 500000) throw new Error('ESCO response too large');
  const payload = JSON.parse(text);
  const records = payload?._embedded?.results;
  if (!Array.isArray(records)) throw new Error('invalid ESCO occupation response');
  const candidates = records.slice(0, limit).flatMap(row => {
    if (typeof row?.uri !== 'string' || !/^http:\/\/data\.europa\.eu\/esco\/occupation\/[a-zA-Z0-9-]+$/.test(row.uri)) return [];
    return [{
      source: 'esco', occupation_uri: row.uri, title: String(row.preferredLabel?.en ?? row.title ?? '').slice(0, 200),
      matched_text: String(row.searchHit ?? '').slice(0, 200),
      evidence_status: 'taxonomy_label_only',
      job_open: false, eligibility_verified: false, skills_verified: false,
    }];
  });
  return {query: query.trim(), candidates, source_url: url.toString(),
    total_reported: payload.total ?? null, authority: 'occupation_taxonomy_only',
    no_submission_or_job_claim: true};
}
