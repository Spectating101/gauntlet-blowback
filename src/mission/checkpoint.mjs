import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeId } from '../core/safe-id.mjs';

export { assertSafeId };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(ROOT, '.blowback', 'missions');
const ALLOWED_STATUS = new Set(['IN_PROGRESS', 'WAITING_HUMAN', 'SAFE_COMPLETE', 'SUBMITTED', 'BLOCKED', 'ABANDONED', 'EXPIRED']);

function ensureStringArray(value, key) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${key} must be an array of strings`);
  }
  return value;
}

const SECRET_PARAM_NAME = /(?:^|[._-])(?:password|passcode|passwd|otp|secret|signature|api[_-]?key|access[_-]?key|(?:access|refresh|id|auth|bearer|session)?[_-]?token|session[_-]?(?:id|key))(?:$|[._-])/i;
const SECRET_KEY_NAME = /(?:^|_)(?:(?:password|passcode|passwd|secret|api_key|apikey|access_key|private_key|session_key|client_secret)s?|otp|2fa|cvv|card_number|credit_card|token|authorization|cookies?|bearer|jwt|credentials?)(?:_value|_key|_code|_hash|_text)?$/;
// Well-known credential shapes, wherever they appear in free text.
const SECRET_VALUE = /(?:\bBearer\s+[A-Za-z0-9._~+/=-]{16,}|\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}|\b(?:sk|pk|rk)-[A-Za-z0-9_-]{16,}|\bghp_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bAKIA[0-9A-Z]{16}\b|\bAIza[0-9A-Za-z_-]{30,}|\bxox[abprs]-[A-Za-z0-9-]{10,}|\b(?:password|passcode|passwd|otp|secret)\s*[:=]\s*\S{4,})/i;

// Percent-decode up to three layers (redirect targets are often double-encoded) and tolerate
// malformed sequences instead of giving up on the whole string.
function decodeLayers(text) {
  const layers = [text];
  let current = text;
  for (let i = 0; i < 3; i += 1) {
    let next;
    try {
      next = decodeURIComponent(current);
    } catch {
      next = current.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
        const code = Number.parseInt(hex, 16);
        return code < 0x80 ? String.fromCharCode(code) : match;
      });
    }
    if (next === current) break;
    layers.push(next);
    current = next;
  }
  return layers;
}

// Credentials hide in URLs: query/fragment parameters (also inside percent-encoded redirect
// targets) and user:password@ userinfo. Parameter NAMES are matched as whole words so that
// ordinary parameters such as rootpath or max_tokens are not mistaken for secrets.
function holdsSecretUrlParam(text) {
  return decodeLayers(text).some((candidate) => (
    /\/\/[^/\s:@]+:[^/\s@]+@/.test(candidate)
    || [...candidate.matchAll(/[?&#]([\w.%[\]-]+)=/g)].some((match) => SECRET_PARAM_NAME.test(match[1]))
  ));
}

export function assertNoSecretKeys(value, trail = '') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const full = trail ? `${trail}.${key}` : key;
    const normalised = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
    if (SECRET_KEY_NAME.test(normalised)) {
      throw new Error(`checkpoint may not store secrets: ${full}`);
    }
    // Values count too: magic links and OAuth redirects carry secrets in query strings.
    if (typeof child === 'string' && holdsSecretUrlParam(child)) {
      throw new Error(`checkpoint may not store secrets: ${full} holds a secret-looking URL parameter`);
    }
    if (typeof child === 'string' && SECRET_VALUE.test(child)) {
      throw new Error(`checkpoint may not store secrets: ${full} holds a secret-looking value`);
    }
    assertNoSecretKeys(child, full);
  }
}

export function validateCheckpoint(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('checkpoint object required');
  if (!raw.route_id || typeof raw.route_id !== 'string') throw new Error('checkpoint route_id required');
  assertSafeId(raw.route_id, 'checkpoint route_id');
  if (!raw.mission_id || typeof raw.mission_id !== 'string' || !raw.mission_id.trim()) throw new Error('checkpoint mission_id required');
  if (!ALLOWED_STATUS.has(raw.status)) throw new Error(`unsupported checkpoint status: ${raw.status}`);
  if (!raw.stage || typeof raw.stage !== 'string' || !raw.stage.trim()) throw new Error('checkpoint stage required');
  assertNoSecretKeys(raw);

  return {
    schema: 'blowback.browser_checkpoint.v1',
    mission_id: raw.mission_id,
    route_id: raw.route_id,
    status: raw.status,
    stage: raw.stage,
    current_url: raw.current_url ?? null,
    visited_urls: ensureStringArray(raw.visited_urls, 'visited_urls'),
    completed_actions: ensureStringArray(raw.completed_actions, 'completed_actions'),
    unresolved_items: ensureStringArray(raw.unresolved_items, 'unresolved_items'),
    human_required: ensureStringArray(raw.human_required, 'human_required'),
    receipt_refs: ensureStringArray(raw.receipt_refs, 'receipt_refs'),
    note: raw.note ?? null,
    observed_at: raw.observed_at ?? new Date().toISOString(),
  };
}

export function persistCheckpoint(raw) {
  const checkpoint = validateCheckpoint(raw);
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const file = path.join(STATE_DIR, `${checkpoint.route_id}.json`);
  fs.writeFileSync(file, `${JSON.stringify(checkpoint, null, 2)}\n`, { mode: 0o600 });
  return { checkpoint, file };
}
