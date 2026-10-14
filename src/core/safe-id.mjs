const SAFE_ID = /^[A-Za-z0-9_][A-Za-z0-9._-]*$/;

export function isSafeId(value) {
  return typeof value === 'string' && SAFE_ID.test(value) && !value.includes('..');
}

export function assertSafeId(value, label) {
  if (!isSafeId(value)) {
    throw new Error(`${label} must be a plain identifier (letters, digits, dot, dash, underscore): ${JSON.stringify(value)}`);
  }
  return value;
}
