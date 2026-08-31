const TYPES = new Set([
  'job', 'phd', 'competition', 'grant', 'sponsorship', 'fellowship', 'institutional_pilot', 'incubator', 'commercial', 'research',
  'research_assistant', 'research_staff', 'research_engineer', 'predoc', 'research_fellowship', 'research_residency',
  'policy_fellowship', 'funded_visiting', 'faculty_pull', 'project_staff', 'research_officer', 'technical_associate',
  'student_benefit', 'institutional_entitlement', 'research_credit', 'pi_sponsored_credit', 'research_preview', 'pi_sponsored_access'
]);
const COST_TAGS = new Set(['$0', '$POST', '$UPFRONT']);
const ELIGIBILITY = new Set(['PASS', 'FAIL', 'UNKNOWN']);
const FIT = new Set(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
const WORK = new Set(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']);

export function missingEvidence(opportunity) {
  const available = new Set(opportunity.available_evidence ?? []);
  return (opportunity.required_evidence ?? []).filter((ref) => !available.has(ref));
}

export function evaluateOpportunity(opportunity) {
  const errors = [];
  if (!opportunity?.id) errors.push('missing opportunity id');
  if (!TYPES.has(opportunity?.type)) errors.push(`unsupported opportunity type: ${opportunity?.type}`);
  if (!COST_TAGS.has(opportunity?.cost_tag)) errors.push(`unsupported cost tag: ${opportunity?.cost_tag}`);
  if (!ELIGIBILITY.has(opportunity?.eligibility?.state)) errors.push('eligibility.state must be PASS, FAIL, or UNKNOWN');
  if (!FIT.has(opportunity?.fit?.state)) errors.push('fit.state must be HIGH, MEDIUM, LOW, or UNKNOWN');
  if (!WORK.has(opportunity?.marginal_work?.state)) errors.push('marginal_work.state must be LOW, MEDIUM, HIGH, or UNKNOWN');
  if (errors.length) return { ok: false, errors };

  const reasons = [];
  const evidenceGaps = missingEvidence(opportunity);
  let decision = 'HOLD';

  if (opportunity.eligibility.state === 'FAIL') {
    decision = 'REJECT';
    reasons.push('eligibility failed');
  } else if (opportunity.eligibility.state === 'UNKNOWN') {
    reasons.push('eligibility unresolved');
  } else if (opportunity.direct_control === false) {
    reasons.push('submission dependency is outside direct control');
  } else if ((opportunity.hard_blockers ?? []).length > 0) {
    reasons.push(`hard blockers: ${opportunity.hard_blockers.join(', ')}`);
  } else if (evidenceGaps.length > 0) {
    reasons.push(`required evidence missing: ${evidenceGaps.join(', ')}`);
  } else if (opportunity.cost_tag === '$UPFRONT') {
    reasons.push('upfront spend requires explicit human approval');
  } else if (opportunity.fit.state === 'LOW' || opportunity.fit.state === 'UNKNOWN') {
    reasons.push(`fit is ${opportunity.fit.state.toLowerCase()}`);
  } else if (opportunity.marginal_work.state === 'HIGH' || opportunity.marginal_work.state === 'UNKNOWN') {
    reasons.push(`marginal work is ${opportunity.marginal_work.state.toLowerCase()}`);
  } else {
    decision = 'READY';
    reasons.push('eligibility passed, required evidence is present, fit credible, marginal work bounded, and no pre-verdict spend blocker');
  }

  return {
    ok: true,
    decision,
    reasons,
    evidence_gaps: evidenceGaps,
    doctrine: {
      cost_tag: opportunity.cost_tag,
      fire: decision === 'READY' && opportunity.cost_tag !== '$UPFRONT'
    }
  };
}
