const TYPES = new Set(['job', 'phd', 'competition', 'grant', 'incubator', 'commercial', 'research']);
const ELIGIBILITY = new Set(['PASS', 'FAIL', 'UNKNOWN']);
const FIT = new Set(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
const WORK = new Set(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']);
const COST_TAGS = new Set(['$0', '$POST', '$UPFRONT']);
const DISCLOSURE = new Set(['DISCLOSED', 'UNKNOWN', 'NOT_APPLICABLE']);

function isIsoDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function validateOpportunityDossier(dossier) {
  const errors = [];
  const warnings = [];

  if (!dossier?.id) errors.push('missing id');
  if (!TYPES.has(dossier?.type)) errors.push(`unsupported type: ${dossier?.type}`);
  if (!dossier?.organization) errors.push('missing organization');
  if (!dossier?.title) errors.push('missing title');

  if (!dossier?.source?.url) errors.push('source.url is required');
  if (!isIsoDate(dossier?.source?.retrieved_at)) errors.push('source.retrieved_at must be an ISO date/time');

  if (!ELIGIBILITY.has(dossier?.eligibility?.state)) {
    errors.push('eligibility.state must be PASS, FAIL, or UNKNOWN');
  }
  if (!Array.isArray(dossier?.eligibility?.evidence_refs)) {
    errors.push('eligibility.evidence_refs must be an array');
  }

  if (!COST_TAGS.has(dossier?.cost_tag)) errors.push(`unsupported cost_tag: ${dossier?.cost_tag}`);
  if (!FIT.has(dossier?.fit?.state)) errors.push('fit.state must be HIGH, MEDIUM, LOW, or UNKNOWN');
  if (!Array.isArray(dossier?.fit?.basis) || dossier.fit.basis.length === 0) {
    errors.push('fit.basis must contain at least one explicit basis item');
  }
  if (!WORK.has(dossier?.marginal_work?.state)) {
    errors.push('marginal_work.state must be LOW, MEDIUM, HIGH, or UNKNOWN');
  }
  if (typeof dossier?.direct_control !== 'boolean') errors.push('direct_control must be boolean');
  if (!Array.isArray(dossier?.hard_blockers)) errors.push('hard_blockers must be an array');
  if (!Array.isArray(dossier?.required_evidence)) errors.push('required_evidence must be an array');
  if (!Array.isArray(dossier?.recommended_claim_ids)) errors.push('recommended_claim_ids must be an array');

  const disclosure = dossier?.economics?.disclosure;
  if (!DISCLOSURE.has(disclosure)) {
    errors.push('economics.disclosure must be DISCLOSED, UNKNOWN, or NOT_APPLICABLE');
  } else if (disclosure === 'DISCLOSED') {
    if (!dossier.economics.currency) errors.push('disclosed economics requires currency');
    const hasAmount = Number.isFinite(dossier.economics.amount)
      || Number.isFinite(dossier.economics.amount_min)
      || Number.isFinite(dossier.economics.amount_max);
    if (!hasAmount) errors.push('disclosed economics requires amount or amount_min/amount_max');
    if (!dossier.economics.period && dossier.type === 'job') errors.push('disclosed job economics requires period');
    if (!(dossier.economics.evidence_refs ?? []).length) errors.push('disclosed economics requires evidence_refs');
  } else {
    for (const key of ['amount', 'amount_min', 'amount_max']) {
      if (Number.isFinite(dossier?.economics?.[key])) {
        errors.push(`${key} must not be invented when economics.disclosure=${disclosure}`);
      }
    }
  }

  if (!isIsoDate(dossier?.freshness?.checked_at)) errors.push('freshness.checked_at must be an ISO date/time');
  if (dossier?.freshness?.expires_at != null && !isIsoDate(dossier.freshness.expires_at)) {
    errors.push('freshness.expires_at must be null or an ISO date/time');
  }

  if (dossier?.deadline != null && !isIsoDate(dossier.deadline)) {
    errors.push('deadline must be null or an ISO date/time');
  }

  if (dossier?.source?.url && !/^https?:\/\//.test(dossier.source.url)) {
    warnings.push('source.url is not an http(s) URL');
  }
  if (dossier?.eligibility?.state === 'PASS' && dossier.eligibility.evidence_refs.length === 0) {
    warnings.push('eligibility PASS has no evidence refs');
  }
  if (dossier?.economics?.disclosure === 'UNKNOWN') {
    warnings.push('economics unknown: keep compensation/funding out of ranking claims until sourced');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function assertOpportunityDossier(dossier) {
  const result = validateOpportunityDossier(dossier);
  if (!result.ok) throw new Error(`Invalid opportunity dossier:\n- ${result.errors.join('\n- ')}`);
  return result;
}
