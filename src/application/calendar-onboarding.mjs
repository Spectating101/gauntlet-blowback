import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../../scripts/build-gauntlet-master.mjs';
import { assertNoSecretKeys } from '../mission/checkpoint.mjs';
import { isApplicationRoute } from './operator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_CALENDARS = [
  path.join(ROOT, 'calendar', 'gauntlet-consolidated-active-2026-2027.ics'),
  path.join(ROOT, 'calendar', 'gauntlet-consolidated-rolling-watch-2026-2027.ics'),
];
const DEFAULT_ACCOUNT_DIR = path.join(ROOT, '.blowback', 'accounts');
const ACCOUNT_STATES = new Set([
  'UNVERIFIED', 'LOGIN_REQUIRED', 'ACCOUNT_REQUIRED', 'EMAIL_VERIFICATION_REQUIRED',
  'CONSOLE_ORG_REQUIRED', 'ACCOUNT_READY', 'NOT_REQUIRED', 'BLOCKED'
]);

function unfoldIcs(text) {
  return text.replace(/\r?\n[ \t]/g, '');
}

function unescapeIcs(value = '') {
  return String(value).replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

function safeScope(value = '') {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseDateKey(value = '') {
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function toDateKey(value = new Date()) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid calendar date: ${value}`);
  return date.toISOString().slice(0, 10);
}

function plusDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function routeIdForUid(uid = '') {
  return String(uid).replace(/@blowback$/i, '').replace(/-\d{8}$/, '');
}

function rruleValues(rrule = '') {
  return Object.fromEntries(String(rrule).split(';').map((part) => part.split('=', 2)).filter(([key, value]) => key && value));
}

function dateFromKey(dateKey) {
  return new Date(`${dateKey}T00:00:00Z`);
}

function weekdayKey(dateKey) {
  return ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][dateFromKey(dateKey).getUTCDay()];
}

function monthStart(dateKey) {
  return `${dateKey.slice(0, 7)}-01`;
}

function nextMonth(dateKey) {
  const date = dateFromKey(monthStart(dateKey));
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

function daysInMonth(dateKey) {
  const date = dateFromKey(monthStart(dateKey));
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.getUTCDate();
}

/** Expand the simple weekly/monthly RRULEs used by Gauntlet's own calendars. */
export function expandCalendarEvents(events, { from, through }) {
  const output = [];
  for (const event of events) {
    if (!event.rrule) {
      if (event.start >= from && event.start <= through) output.push({ ...event, original_start: event.start });
      continue;
    }
    const rule = rruleValues(event.rrule);
    const until = parseDateKey(rule.UNTIL) ?? through;
    const end = until < through ? until : through;
    const count = Number(rule.COUNT) || Number.POSITIVE_INFINITY;
    let emitted = 0;
    if (rule.FREQ === 'MONTHLY') {
      const days = String(rule.BYMONTHDAY ?? event.start.slice(8)).split(',').map(Number).filter((day) => day >= 1 && day <= 31);
      for (let cursor = monthStart(event.start); cursor <= end && emitted < count; cursor = nextMonth(cursor)) {
        for (const day of days) {
          if (day > daysInMonth(cursor)) continue;
          const occurrence = `${cursor.slice(0, 8)}${String(day).padStart(2, '0')}`;
          if (occurrence < event.start || occurrence > end) continue;
          if (occurrence < from) { emitted += 1; continue; }
          output.push({ ...event, start: occurrence, original_start: event.start });
          emitted += 1;
          if (emitted >= count) break;
        }
      }
      continue;
    }
    const interval = rule.FREQ === 'BIWEEKLY' ? 14 : 7;
    const allowedDays = new Set(String(rule.BYDAY ?? weekdayKey(event.start)).split(','));
    for (let occurrence = event.start; occurrence <= end && emitted < count; occurrence = plusDays(occurrence, 1)) {
      const offset = Math.floor((dateFromKey(occurrence) - dateFromKey(event.start)) / 86_400_000);
      if (offset < 0 || offset % interval !== 0 || !allowedDays.has(weekdayKey(occurrence))) continue;
      if (occurrence < from) { emitted += 1; continue; }
      output.push({ ...event, start: occurrence, original_start: event.start });
      emitted += 1;
    }
  }
  return output;
}

function bindCalendarCue(event, records, byId) {
  const exactRouteId = routeIdForUid(event.uid);
  if (byId.has(exactRouteId)) return { route_id: exactRouteId, binding: 'exact_calendar_uid' };
  const ignored = new Set(['fire', 'watch', 'review', 'weekly', 'monthly', 'rolling', 'outcome', 'early', 'next', 'cycle']);
  const tokens = exactRouteId.split('-').filter((token) => token.length >= 3 && !ignored.has(token));
  const candidates = records.filter((record) => tokens.length > 0 && tokens.every((token) => String(record.id).includes(token)));
  return candidates.length === 1 ? { route_id: candidates[0].id, binding: 'unique_route_id_token_match' } : { route_id: null, binding: 'unbound' };
}

function deadlineDate(record = {}) {
  return String(record.deadline ?? '').match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
}

function isTerminalStatus(record = {}) {
  return /(KILL|REJECT|EXPIRED|HISTORICAL)/i.test(String(record.status ?? ''));
}

function accountScopeFor(record) {
  if (record.execution_manifest) {
    const manifestPath = path.resolve(ROOT, record.execution_manifest);
    if (manifestPath.startsWith(`${ROOT}${path.sep}`) && fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const explicit = safeScope(manifest.auth_scope);
        if (explicit) return explicit;
        const endpoint = manifest.submission_url ?? manifest.registration_url ?? manifest.source_url;
        if (endpoint) return safeScope(new URL(endpoint).hostname.replace(/^www\./, '')) || 'route-account';
      } catch {
        // The master record still produces an explicit UNVERIFIED account state below.
      }
    }
  }
  try {
    return safeScope(new URL(record.source).hostname.replace(/^www\./, '')) || 'route-account';
  } catch {
    return safeScope(record.id) || 'route-account';
  }
}

function accountFile(accountDir, scope) {
  const safe = safeScope(scope);
  if (!safe) throw new Error('account checkpoint scope must be a safe non-empty identifier');
  return path.join(accountDir, `${safe}.json`);
}

function hasAccountCheckpoint(scope, { accountDir = DEFAULT_ACCOUNT_DIR } = {}) {
  return fs.existsSync(accountFile(accountDir, scope));
}

function accountIsNotNormallyRequired(record = {}) {
  return String(record.route_class ?? '').trim().toUpperCase() === 'FACULTY_PULL'
    || /^mailto:/i.test(String(record.source ?? ''));
}

function accountNextAction(account) {
  switch (account.state) {
    case 'ACCOUNT_READY': return 'MAP_LIVE_FORM';
    case 'NOT_REQUIRED': return 'MAP_LIVE_FORM';
    case 'LOGIN_REQUIRED': return 'HUMAN_SIGN_IN';
    case 'ACCOUNT_REQUIRED': return 'HUMAN_CREATE_ACCOUNT';
    case 'EMAIL_VERIFICATION_REQUIRED': return 'HUMAN_VERIFY_EMAIL';
    case 'CONSOLE_ORG_REQUIRED': return 'HUMAN_CREATE_OR_SELECT_ORGANIZATION';
    case 'BLOCKED': return 'RESOLVE_EXTERNAL_BLOCKER';
    default: return 'VERIFY_PORTAL_AND_ACCOUNT_STATE';
  }
}

function routeStage(record, account, today) {
  const deadline = deadlineDate(record);
  if (deadline && deadline < today) return 'EXPIRED_REVERIFY';
  if (account.state !== 'ACCOUNT_READY' && account.state !== 'NOT_REQUIRED') return 'ACCOUNT_ONBOARDING';
  if (/(RECON|RESEARCH_ONLY|ELIGIBILITY)/i.test(String(record.execution_state ?? ''))) return 'RECON';
  if (/(APPLICATION_READY|PACKET_READY|PORTAL_MAPPED|PREPARE_VERIFIED|HUMAN_SUBMIT_READY|OUTREACH_READY)/i.test(String(record.execution_state ?? ''))) return 'PREPARE';
  return 'VERIFY_ROUTE';
}

/** Parse only the calendar fields needed for non-authoritative execution cues. */
export function parseCalendarEvents(text) {
  const events = [];
  let current = null;
  for (const line of unfoldIcs(text).split(/\r?\n/)) {
    if (line === 'BEGIN:VEVENT') { current = {}; continue; }
    if (line === 'END:VEVENT') {
      if (current?.uid && current.start) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).split(';', 1)[0];
    const value = unescapeIcs(line.slice(colon + 1));
    if (key === 'UID') current.uid = value;
    if (key === 'DTSTART') current.start = parseDateKey(value);
    if (key === 'SUMMARY') current.summary = value;
    if (key === 'DESCRIPTION') current.description = value;
    if (key === 'RRULE') current.rrule = value;
  }
  return events;
}

export function readCalendarEvents(calendarPath) {
  return parseCalendarEvents(fs.readFileSync(calendarPath, 'utf8'));
}

/** Account checkpoints deliberately contain state only: never email addresses, passwords, OTPs, tokens, or mailbox contents. */
export function validateAccountCheckpoint(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('account checkpoint object required');
  assertNoSecretKeys(raw);
  const scope = safeScope(raw.scope);
  if (!scope) throw new Error('account checkpoint scope required');
  if (!ACCOUNT_STATES.has(raw.state)) throw new Error(`unsupported account state: ${raw.state}`);
  if (raw.route_ids != null && (!Array.isArray(raw.route_ids) || raw.route_ids.some((id) => typeof id !== 'string'))) {
    throw new Error('account checkpoint route_ids must be an array of strings');
  }
  return {
    schema: 'blowback.account_checkpoint.v1',
    scope,
    state: raw.state,
    route_ids: [...new Set(raw.route_ids ?? [])],
    portal_url: raw.portal_url ?? null,
    note: raw.note ?? null,
    observed_at: raw.observed_at ?? new Date().toISOString(),
  };
}

export function persistAccountCheckpoint(raw, { accountDir = DEFAULT_ACCOUNT_DIR } = {}) {
  const checkpoint = validateAccountCheckpoint(raw);
  fs.mkdirSync(accountDir, { recursive: true });
  const file = accountFile(accountDir, checkpoint.scope);
  fs.writeFileSync(file, `${JSON.stringify(checkpoint, null, 2)}\n`, { mode: 0o600 });
  return { checkpoint, file };
}

export function loadAccountCheckpoint(scope, { accountDir = DEFAULT_ACCOUNT_DIR } = {}) {
  const file = accountFile(accountDir, scope);
  if (!fs.existsSync(file)) {
    return { schema: 'blowback.account_checkpoint.v1', scope: safeScope(scope), state: 'UNVERIFIED', route_ids: [], portal_url: null, note: null, observed_at: null };
  }
  return validateAccountCheckpoint(JSON.parse(fs.readFileSync(file, 'utf8')));
}

/**
 * Convert the active calendar into a bounded application/onboarding queue.
 * Calendar cues never overwrite route facts; unmatched cues remain explicitly unbound.
 */
export function buildCalendarOnboardingQueue({
  records = buildMasterRegistry(),
  calendarPath = null,
  calendarPaths = null,
  accountDir = DEFAULT_ACCOUNT_DIR,
  today = new Date(),
  days = 21,
  limit = 30,
} = {}) {
  const dateKey = toDateKey(today);
  const through = plusDays(dateKey, Math.max(0, Number(days) || 0));
  const byId = new Map(records.map((record) => [record.id, record]));
  const sources = calendarPaths ?? (calendarPath ? [calendarPath] : DEFAULT_CALENDARS);
  const calendar = sources.flatMap((source) => readCalendarEvents(source));
  const cues = expandCalendarEvents(calendar, { from: dateKey, through })
    .map((event) => {
      const binding = bindCalendarCue(event, records, byId);
      return { ...event, ...binding, authoritative: false };
    })
    .sort((a, b) => a.start.localeCompare(b.start) || a.uid.localeCompare(b.uid));
  const cuesByRoute = new Map();
  for (const cue of cues) {
    if (!cue.route_id) continue;
    const list = cuesByRoute.get(cue.route_id) ?? [];
    list.push({ uid: cue.uid, start: cue.start, summary: cue.summary, description: cue.description ?? null, rrule: cue.rrule ?? null });
    cuesByRoute.set(cue.route_id, list);
  }
  const routes = records
    .filter((record) => isApplicationRoute(record) && !isTerminalStatus(record))
    .map((record) => {
      const account_scope = accountScopeFor(record);
      const account = !hasAccountCheckpoint(account_scope, { accountDir }) && accountIsNotNormallyRequired(record)
        ? { schema: 'blowback.account_checkpoint.v1', scope: account_scope, state: 'NOT_REQUIRED', route_ids: [], portal_url: null, note: null, observed_at: null }
        : loadAccountCheckpoint(account_scope, { accountDir });
      return {
        route_id: record.id,
        organization: record.organization,
        opportunity: record.opportunity,
        deadline: record.deadline,
        status: record.status,
        execution_state: record.execution_state,
        source_url: record.source || null,
        calendar_cues: cuesByRoute.get(record.id) ?? [],
        account: {
          scope: account_scope,
          state: account.state,
          next_action: accountNextAction(account),
          checkpoint_observed_at: account.observed_at,
        },
        stage: routeStage(record, account, dateKey),
        automation: [
          'open official route in existing browser session',
          'inspect live instructions and form structure',
          'prepare factual fields and designated artifacts only after explicit transmission confirmation',
          'save draft and checkpoint progress',
        ],
        human_required: [
          'account creation or account choice',
          'password, OTP, CAPTCHA, legal/privacy/terms acceptance',
          'material eligibility/location/team/adviser decisions',
          'final submit/send/apply confirmation',
        ],
      };
    })
    .filter((route) => route.stage !== 'EXPIRED_REVERIFY')
    .sort((a, b) => {
      const urgency = (route) => route.calendar_cues.length ? route.calendar_cues[0].start : '9999-12-31';
      return urgency(a).localeCompare(urgency(b)) || String(a.deadline ?? '').localeCompare(String(b.deadline ?? '')) || a.route_id.localeCompare(b.route_id);
    })
    .slice(0, Math.max(1, Number(limit) || 30));

  return {
    schema: 'blowback.calendar_application_onboarding_queue.v1',
    generated_at: new Date().toISOString(),
    calendar: { sources: sources.map((source) => path.relative(ROOT, source)), from: dateKey, through, authoritative_for_route_facts: false },
    count: routes.length,
    routes,
    unbound_calendar_cues: cues.filter((cue) => !cue.route_id),
    email_policy: {
      gmail_optional: true,
      permitted_uses: ['observe expected verification or receipt messages for an explicitly scoped route', 'report whether a verification/receipt exists'],
      forbidden_storage: ['mailbox contents', 'passwords', 'OTP codes', 'tokens', 'email addresses in account checkpoints'],
      human_confirmation_required_for: ['using a verification link/code that creates or activates an external account', 'transmitting application data', 'terms acceptance', 'final submission'],
    },
  };
}
