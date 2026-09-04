import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function assertNoSecretKeys(value, trail = '') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const full = trail ? `${trail}.${key}` : key;
    if (/(password|passcode|otp|2fa|cvv|card_number|credit_card|secret|api_key|token)$/i.test(key)) {
      throw new Error(`checkpoint may not store secrets: ${full}`);
    }
    assertNoSecretKeys(child, full);
  }
}

export function validateCheckpoint(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('checkpoint object required');
  if (!raw.route_id || typeof raw.route_id !== 'string') throw new Error('checkpoint route_id required');
  if (!raw.mission_id || typeof raw.mission_id !== 'string') throw new Error('checkpoint mission_id required');
  if (!ALLOWED_STATUS.has(raw.status)) throw new Error(`unsupported checkpoint status: ${raw.status}`);
  if (!raw.stage || typeof raw.stage !== 'string') throw new Error('checkpoint stage required');
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
