import { isKnownExecutionState, mayPrepareExecutionState, resolveRouteUrls } from './routes.mjs';

const REQUIRED_HUMAN_GATES = new Set([
  'login', 'captcha', 'two_factor', 'eligibility_attestation',
  'originality_attestation', 'authorship_attestation', 'terms_acceptance',
  'payment', 'advisor_confirmation', 'team_confirmation', 'final_submit'
]);

export function validateOpportunity(o) {
  const errors = [];
  const warnings = [];
  for (const key of ['id', 'name', 'portal', 'project', 'profile', 'mode']) {
    if (!o?.[key]) errors.push(`missing required field: ${key}`);
  }
  const routes = resolveRouteUrls(o ?? {});
  if (!routes.recon_url && !routes.execution_url) {
    errors.push('at least one portal route URL is required: source_url, registration_url, submission_url, or entry_url');
  }
  if (o?.entry_url && !o?.source_url && !o?.registration_url && !o?.submission_url) {
    warnings.push('entry_url is a compatibility alias; prefer explicit source_url/registration_url/submission_url as the route becomes known');
  }
  if (o?.mode && !['inspect', 'prepare'].includes(o.mode)) {
    errors.push('mode must be inspect or prepare; Blowback intentionally has no autonomous submit mode');
  }
  if (o?.execution_state && !isKnownExecutionState(o.execution_state)) {
    errors.push(`unknown execution_state: ${o.execution_state}`);
  }
  if (!o?.execution_state) warnings.push('execution_state is missing; route readiness is not explicit');
  if (o?.mode === 'prepare' && !mayPrepareExecutionState(o?.execution_state)) {
    errors.push('prepare mode requires execution_state PORTAL_MAPPED, PREPARE_VERIFIED, or HUMAN_SUBMIT_READY');
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
