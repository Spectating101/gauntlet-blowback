const EXECUTION_STATES = new Set([
  'RESEARCH_ONLY',
  'PACKET_READY',
  'PORTAL_RECON_REQUIRED',
  'PORTAL_MAPPED',
  'PREPARE_VERIFIED',
  'HUMAN_SUBMIT_READY',
  'SUBMITTED'
]);

function cleanScope(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hostScope(rawUrl) {
  if (!rawUrl) return null;
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
    return cleanScope(host);
  } catch {
    return null;
  }
}

export function resolveRouteUrls(opportunity = {}) {
  const sourceUrl = opportunity.source_url ?? opportunity.entry_url ?? null;
  const registrationUrl = opportunity.registration_url ?? null;
  const submissionUrl = opportunity.submission_url ?? null;
  return {
    source_url: sourceUrl,
    registration_url: registrationUrl,
    submission_url: submissionUrl,
    recon_url: sourceUrl ?? registrationUrl ?? submissionUrl,
    execution_url: submissionUrl ?? registrationUrl ?? opportunity.entry_url ?? sourceUrl
  };
}

export function resolveAuthScope(opportunity = {}) {
  if (opportunity.auth_scope) {
    const explicit = cleanScope(opportunity.auth_scope);
    if (!explicit) throw new Error('auth_scope must contain at least one safe scope character');
    return explicit;
  }

  const routes = resolveRouteUrls(opportunity);
  const derived = hostScope(routes.execution_url) ?? hostScope(routes.recon_url);
  if (derived) return derived;

  const portal = cleanScope(opportunity.portal ?? '');
  if (portal && portal !== 'generic') return portal;
  throw new Error('cannot derive isolated auth scope; set auth_scope or provide a valid portal URL');
}

export function isKnownExecutionState(value) {
  return EXECUTION_STATES.has(value);
}

export function mayPrepareExecutionState(value) {
  return new Set(['PORTAL_MAPPED', 'PREPARE_VERIFIED', 'HUMAN_SUBMIT_READY']).has(value);
}

export const executionStates = Object.freeze([...EXECUTION_STATES]);
