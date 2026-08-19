const REQUIRED_HUMAN_GATES = new Set([
  'login', 'captcha', 'two_factor', 'eligibility_attestation',
  'originality_attestation', 'authorship_attestation', 'terms_acceptance',
  'payment', 'advisor_confirmation', 'team_confirmation', 'final_submit'
]);

export function validateOpportunity(o) {
  const errors = [];
  const warnings = [];
  for (const key of ['id', 'name', 'portal', 'entry_url', 'project', 'profile', 'mode']) {
    if (!o?.[key]) errors.push(`missing required field: ${key}`);
  }
  if (o?.mode && !['inspect', 'prepare'].includes(o.mode)) {
    errors.push('mode must be inspect or prepare; v0 intentionally has no autonomous submit mode');
  }
  if (o?.direct_control === false) warnings.push('direct_control=false: keep this route out of FIRE until dependency is resolved');
  if (!Array.isArray(o?.human_required) || !o.human_required.includes('final_submit')) {
    errors.push('human_required must include final_submit');
  }
  for (const gate of o?.human_required ?? []) {
    if (!REQUIRED_HUMAN_GATES.has(gate)) warnings.push(`unknown human gate: ${gate}`);
  }
  if (!o?.fields || typeof o.fields !== 'object') errors.push('fields must be an object');
  if (o?.uploads && !Array.isArray(o.uploads)) errors.push('uploads must be an array');
  return { ok: errors.length === 0, errors, warnings };
}

export function assertOpportunity(o) {
  const result = validateOpportunity(o);
  if (!result.ok) throw new Error(`Invalid opportunity manifest:\n- ${result.errors.join('\n- ')}`);
  return result;
}
