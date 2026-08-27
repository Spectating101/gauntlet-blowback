const SECRET_PATTERN = /(password|passcode|one[-_ ]?time|otp|2fa|two[-_ ]?factor|captcha|cvv|cvc|card[-_ ]?number)/i;
const COMMITMENT_PATTERN = /(final[-_ ]?submit|\bsubmit\b|\bsend\b|\bpay\b|payment|purchase|checkout|terms|privacy|consent|attest|declaration|originality|authorship|eligibility|authorize|create[-_ ]?account|register[-_ ]?account|withdraw|delete)/i;

function searchable(name, spec = {}) {
  return [
    name,
    spec.label,
    spec.placeholder,
    spec.selector,
    spec.name,
    spec.role,
    spec.human_gate
  ].filter(Boolean).join(' ');
}

export function protectedFieldReason(name, spec = {}) {
  if (spec.human_gate) return `human_gate:${spec.human_gate}`;
  if (SECRET_PATTERN.test(searchable(name, spec))) return 'protected_secret';
  return null;
}

export function protectedCommitmentReason(name, spec = {}) {
  if (spec.human_gate) return `human_gate:${spec.human_gate}`;
  if (SECRET_PATTERN.test(searchable(name, spec))) return 'protected_secret';
  if (COMMITMENT_PATTERN.test(searchable(name, spec))) return 'protected_commitment';
  return null;
}
