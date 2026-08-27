const STATES = new Set(['VERIFIED_POSITIVE', 'VERIFIED_NEGATIVE', 'MIXED', 'UNKNOWN']);

function state(value) {
  return STATES.has(value) ? value : 'UNKNOWN';
}

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function policyWithDefaults(raw = {}) {
  return {
    job_backstop_floor_annual_ntd: raw.job_backstop_floor_annual_ntd ?? 1_200_000,
    job_serious_floor_annual_ntd: raw.job_serious_floor_annual_ntd ?? 1_500_000,
    job_high_value_floor_annual_ntd: raw.job_high_value_floor_annual_ntd ?? 2_000_000,
    phd_min_monthly_funding_ntd: raw.phd_min_monthly_funding_ntd ?? 30_000
  };
}

function jobTriage(economic, policy) {
  const min = numberOrNull(economic.annual_compensation_min_ntd);
  const max = numberOrNull(economic.annual_compensation_max_ntd);
  const confidence = economic.compensation_confidence ?? 'UNKNOWN';
  const reasons = [];

  // Undisclosed compensation is a price-discovery problem, not a reason to reject a strong application.
  if (min === null && max === null) {
    return {
      posture: 'PRICE_DISCOVERY',
      acceptance_posture: 'OFFER_REQUIRED',
      reasons: ['compensation is not verified; establish total compensation before acceptance'],
      compensation_confidence: confidence
    };
  }

  const upper = max ?? min;
  const lower = min ?? max;
  if (upper < policy.job_backstop_floor_annual_ntd) {
    reasons.push(`verified/inferred upper compensation is below backstop floor NT$${policy.job_backstop_floor_annual_ntd}`);
    return { posture: 'ECONOMIC_BACKSTOP', acceptance_posture: 'REJECT_UNLESS_OPTIONALITY', reasons, compensation_confidence: confidence };
  }
  if (lower >= policy.job_high_value_floor_annual_ntd) {
    reasons.push(`lower compensation bound clears high-value floor NT$${policy.job_high_value_floor_annual_ntd}`);
    return { posture: 'HIGH_VALUE_FIRE', acceptance_posture: 'OFFER_REQUIRED', reasons, compensation_confidence: confidence };
  }
  if (upper >= policy.job_high_value_floor_annual_ntd) {
    reasons.push(`compensation range can clear high-value floor NT$${policy.job_high_value_floor_annual_ntd}`);
    return { posture: 'HIGH_VALUE_FIRE', acceptance_posture: 'OFFER_REQUIRED', reasons, compensation_confidence: confidence };
  }
  if (upper >= policy.job_serious_floor_annual_ntd) {
    reasons.push(`compensation range clears serious-search floor NT$${policy.job_serious_floor_annual_ntd}`);
    return { posture: 'SERIOUS_FIRE', acceptance_posture: 'OFFER_REQUIRED', reasons, compensation_confidence: confidence };
  }

  reasons.push('compensation clears backstop floor but not the serious-search floor');
  return { posture: 'SELECTIVE', acceptance_posture: 'REJECT_UNLESS_OPTIONALITY', reasons, compensation_confidence: confidence };
}

function phdTriage(economic, policy) {
  const monthly = numberOrNull(economic.monthly_funding_min_ntd ?? economic.monthly_funding_ntd);
  const tuition = state(economic.tuition_coverage);
  const founder = state(economic.founder_freedom);
  const preexistingIp = state(economic.preexisting_ip_protection);
  const outsideIncome = state(economic.outside_income_freedom);
  const researchFreedom = state(economic.research_freedom);
  const reasons = [];

  const hardNegative = [tuition, founder, preexistingIp, researchFreedom].includes('VERIFIED_NEGATIVE');
  if (hardNegative) {
    reasons.push('a verified negative exists in tuition/founder/IP/research-freedom terms');
    return { posture: 'DUE_DILIGENCE_OR_REJECT', acceptance_posture: 'DO_NOT_ACCEPT_YET', reasons };
  }

  if (monthly !== null && monthly < policy.phd_min_monthly_funding_ntd) {
    reasons.push(`funding is below configured minimum NT$${policy.phd_min_monthly_funding_ntd}/month`);
    return { posture: 'ECONOMIC_BACKSTOP', acceptance_posture: 'REJECT_UNLESS_OPTIONALITY', reasons };
  }

  const unresolved = [founder, preexistingIp, outsideIncome, researchFreedom].filter((value) => value === 'UNKNOWN').length;
  if (unresolved > 0) {
    reasons.push(`${unresolved} autonomy/commercialization dimensions remain unverified`);
    if (monthly !== null) reasons.push(`verified/inferred funding floor: NT$${monthly}/month`);
    return { posture: 'FIRE_DUE_DILIGENCE', acceptance_posture: 'DO_NOT_ACCEPT_YET', reasons };
  }

  const positive = [founder, preexistingIp, outsideIncome, researchFreedom].filter((value) => value === 'VERIFIED_POSITIVE').length;
  if (positive >= 3 && monthly !== null && monthly >= policy.phd_min_monthly_funding_ntd) {
    reasons.push('funding floor is met and most autonomy/commercialization dimensions are verified positive');
    return { posture: 'HIGH_OPTIONALITY_FIRE', acceptance_posture: 'OFFER_REQUIRED', reasons };
  }

  reasons.push('funding may be viable but commercial/autonomy terms are mixed');
  return { posture: 'SELECTIVE', acceptance_posture: 'DO_NOT_ACCEPT_YET', reasons };
}

export function assessEconomicOpportunity(opportunity, rawPolicy = {}) {
  if (!opportunity || !['job', 'phd'].includes(opportunity.type)) {
    return { applicable: false, posture: 'NOT_APPLICABLE', acceptance_posture: 'NOT_APPLICABLE', reasons: [] };
  }

  const policy = policyWithDefaults(rawPolicy);
  const economic = opportunity.economic_profile ?? null;
  if (!economic) {
    return {
      applicable: true,
      posture: 'ECONOMIC_PROFILE_REQUIRED',
      acceptance_posture: 'DO_NOT_ACCEPT_YET',
      reasons: ['job/phd campaign needs an economic profile before it can be compared at offer stage'],
      policy
    };
  }

  const result = opportunity.type === 'job' ? jobTriage(economic, policy) : phdTriage(economic, policy);
  return { applicable: true, ...result, policy };
}
