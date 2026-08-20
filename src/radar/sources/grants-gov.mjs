import { normalizeOpportunity } from '../core.mjs';

const SEARCH_URL = 'https://api.grants.gov/v1/api/search2';
const DETAIL_URL = 'https://api.grants.gov/v1/api/fetchOpportunity';

async function postJson(url, body, fetchImpl) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Grants.gov HTTP ${response.status}`);
  const payload = await response.json();
  if (payload?.errorcode !== 0) throw new Error(`Grants.gov API error: ${payload?.msg ?? payload?.errorcode}`);
  return payload.data;
}

function grantUrl(id) {
  return `https://www.grants.gov/search-results-detail/${encodeURIComponent(id)}`;
}

export async function searchGrantsGov({ keyword, rows = 25, statuses = 'forecasted|posted', fetchImpl = fetch } = {}) {
  if (!keyword) throw new Error('keyword is required');
  const data = await postJson(SEARCH_URL, { keyword, rows, oppStatuses: statuses }, fetchImpl);
  return (data?.oppHits ?? []).map((hit) => normalizeOpportunity({
    source_id: hit.id,
    number: hit.number,
    type: 'grant',
    title: hit.title,
    organization: hit.agencyName ?? hit.agencyCode,
    open_date: hit.openDate,
    deadline: hit.closeDate,
    status: hit.oppStatus,
    tags: [hit.docType, ...(hit.alnist ?? [])].filter(Boolean),
    url: grantUrl(hit.id),
    raw_ref: { opportunity_number: hit.number, agency_code: hit.agencyCode }
  }, { source: 'grants.gov' }));
}

export async function fetchGrantDetail(opportunityId, { fetchImpl = fetch } = {}) {
  const data = await postJson(DETAIL_URL, { opportunityId: Number(opportunityId) }, fetchImpl);
  const synopsis = data?.synopsis ?? {};
  return normalizeOpportunity({
    source_id: data.id ?? opportunityId,
    number: data.opportunityNumber,
    type: 'grant',
    title: data.opportunityTitle,
    organization: synopsis.agencyName ?? data?.agencyDetails?.agencyName ?? data.owningAgencyCode,
    summary: synopsis.synopsisDesc ?? '',
    open_date: synopsis.postingDate,
    deadline: synopsis.responseDateDesc ?? data.originalDueDateDesc,
    status: data.docType,
    eligibility_text: (synopsis.applicantTypes ?? []).map((item) => item.description),
    tags: [
      ...(synopsis.fundingInstruments ?? []).map((item) => item.description),
      ...(synopsis.fundingActivityCategories ?? []).map((item) => item.description),
      ...(data.alns ?? []).map((item) => item.programTitle)
    ],
    funding: {
      ceiling: synopsis.awardCeiling ?? null,
      floor: synopsis.awardFloor ?? null,
      cost_sharing: synopsis.costSharing ?? null
    },
    url: grantUrl(data.id ?? opportunityId),
    raw_ref: { opportunity_number: data.opportunityNumber, agency_code: synopsis.agencyCode }
  }, { source: 'grants.gov' });
}
