import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';
import { buildMasterRegistry } from '../../scripts/build-gauntlet-master.mjs';
import { collectReconSnapshot } from '../commands/recon.mjs';
import { isApplicationRoute } from './operator.mjs';

const FIRE_STATUS = /^(PORTAL_READY|FIRE_NOW|PRIMARY_FIRE|FIRE)$/i;
const TERMINAL_STATUS = /(KILL|REJECT|EXPIRED|HISTORICAL)/i;
const KNOWN_APPLICATION_HOSTS = /(^|\.)(greenhouse\.io|lever\.co|myworkdayjobs\.com|smartrecruiters\.com|jobvite\.com|ashbyhq\.com|successfactors\.eu|taleo\.net)$/i;
const APPLICATION_TARGET = /(\/apply(?:[/?#]|$)|\/application(?:[/?#]|$)|\/register(?:[/?#]|$)|\/submission(?:[/?#]|$)|\/careers?\/[^/]+\/jobs?\/|docs\.google\.com\/forms|forms\.gle|typeform\.com)/i;
const APPLICATION_LINK_TEXT = /\b(apply now|apply here|apply for|start (?:an )?application|application form|online application|submit (?:an )?application)\b|線上申請|立即申請|我要申請/i;
const NON_APPLICATION_LINK_TEXT = /\b(skip to|application process|how to apply|application: process|privacy|accessibility)\b/i;

function dateKey(value = new Date()) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid readiness-audit date: ${value}`);
  return date.toISOString().slice(0, 10);
}

function plusDays(from, days) {
  const date = new Date(`${from}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function hardDeadline(record = {}) {
  return String(record.deadline ?? '').match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
}

function sourceUrl(record = {}) {
  return String(record.source ?? '').trim() || null;
}

function priority(record) {
  if (/^FIRE_NOW$/i.test(String(record.status ?? ''))) return 0;
  if (/^FIRE$/i.test(String(record.status ?? ''))) return 1;
  if (/FIRE/.test(String(record.status ?? ''))) return 2;
  return 3;
}

function safeCandidate(source, candidate) {
  try {
    const sourceHost = new URL(source).hostname.toLowerCase();
    const candidateUrl = new URL(candidate);
    const candidateHost = candidateUrl.hostname.toLowerCase();
    return /^https?:$/.test(candidateUrl.protocol)
      && (candidateHost === sourceHost || candidateHost.endsWith(`.${sourceHost}`) || KNOWN_APPLICATION_HOSTS.test(candidateHost));
  } catch {
    return false;
  }
}

function candidateFor(source, snapshot) {
  const candidates = snapshot.candidate_links
    .filter((link) => safeCandidate(source, link.href))
    .filter((link) => !NON_APPLICATION_LINK_TEXT.test(link.text));
  return candidates.find((link) => link.kind !== 'auth' && (APPLICATION_LINK_TEXT.test(link.text) || APPLICATION_TARGET.test(link.href)))
    ?? candidates.find((link) => link.kind === 'auth')
    ?? null;
}

function hasApplicationFormEvidence(snapshot = {}) {
  const url = String(snapshot.url ?? '');
  const actionEvidence = (snapshot.forms ?? []).some((form) => APPLICATION_TARGET.test(String(form.action ?? '')));
  const applicationHost = APPLICATION_TARGET.test(url);
  const fileInput = (snapshot.file_inputs ?? []).length > 0;
  const substantiveControl = (snapshot.controls ?? []).some((control) => {
    const tag = String(control.tag ?? 'input').toLowerCase();
    const type = String(control.type ?? '').toLowerCase();
    if (tag === 'textarea' || tag === 'select') return true;
    if (['text', 'email', 'tel', 'url', 'number', 'date', 'datetime-local', 'password'].includes(type)) return true;
    return !type && (control.labels ?? []).length > 0;
  });
  const labelledApplicationInput = (snapshot.controls ?? []).some((control) => {
    const label = (control.labels ?? []).join(' ');
    return Boolean(control.required) && /(resume|curriculum vitae|cv\b|cover letter|research statement|proposal|applicant|application|upload|履歷|申請)/i.test(label);
  });
  return actionEvidence || (applicationHost && (substantiveControl || fileInput)) || fileInput || labelledApplicationInput;
}

/**
 * Select only time-bounded work plus directly executable rolling FIRE routes.
 * This prevents the public audit from indiscriminately crawling the portfolio.
 */
export function selectReadinessRoutes({ records = buildMasterRegistry(), today = new Date(), days = 35, limit = 30, scope = 'near_term' } = {}) {
  if (!['near_term', 'all'].includes(scope)) throw new Error(`unsupported readiness-audit scope: ${scope}`);
  const from = dateKey(today);
  const through = plusDays(from, Math.max(0, Number(days) || 0));
  const numericLimit = Number(limit);
  const maxRoutes = scope === 'all'
    ? (Number.isFinite(numericLimit) && numericLimit > 0 ? Math.floor(numericLimit) : 500)
    : (Number.isFinite(numericLimit) && numericLimit > 0 ? Math.floor(numericLimit) : 30);
  const routes = records
    .filter((record) => isApplicationRoute(record) && !TERMINAL_STATUS.test(String(record.status ?? '')))
    .filter((record) => {
      const deadline = hardDeadline(record);
      const currentCycle = !(deadline && deadline < from);
      const inWindow = deadline && deadline >= from && deadline <= through;
      const rollingFire = !deadline && FIRE_STATUS.test(String(record.status ?? '')) && Boolean(record.execution_manifest);
      return scope === 'all' ? currentCycle : inWindow || rollingFire;
    })
    .map((record) => ({
      route_id: record.id,
      organization: record.organization ?? null,
      opportunity: record.opportunity ?? null,
      deadline: record.deadline ?? null,
      status: record.status ?? null,
      execution_state: record.execution_state ?? null,
      source_url: sourceUrl(record),
      execution_manifest: record.execution_manifest || null,
      audit_reason: hardDeadline(record) ? 'hard_deadline_in_window' : 'rolling_executable_fire',
      static_readiness: !sourceUrl(record)
        ? 'ROUTE_REHYDRATION_REQUIRED'
        : record.execution_manifest
          ? 'EXECUTION_MANIFEST_PRESENT'
          : 'PUBLIC_ROUTE_RECON_REQUIRED',
      _record: record,
    }))
    .sort((a, b) => priority(a._record) - priority(b._record)
      || String(a.deadline ?? '9999-12-31').localeCompare(String(b.deadline ?? '9999-12-31'))
      || a.route_id.localeCompare(b.route_id))
    .slice(0, maxRoutes);
  return { scope, from, through, routes };
}

/** Classify only what a public, unauthenticated page actually shows. */
export function classifyPublicReadiness(snapshot, { candidate = null } = {}) {
  const signals = snapshot?.signals ?? {};
  if (signals.password_inputs > 0 || signals.login) {
    return {
      readiness: 'ACCOUNT_OR_LOGIN_GATE_OBSERVED', account_requirement: 'OBSERVED',
      can_recon_now: true, can_prepare_now: false,
      next_action: 'OPEN_IN_EXISTING_SIGNED_IN_BROWSER_OR_COMPLETE_HUMAN_ACCOUNT_GATE',
    };
  }
  if (signals.captcha || signals.two_factor) {
    return {
      readiness: 'PROTECTED_IDENTITY_GATE_OBSERVED', account_requirement: 'UNKNOWN',
      can_recon_now: true, can_prepare_now: false,
      next_action: 'HUMAN_IDENTITY_OR_ANTIBOT_GATE_REQUIRED',
    };
  }
  if (hasApplicationFormEvidence(snapshot)) {
    return {
      readiness: 'PUBLIC_FORM_REACHABLE', account_requirement: 'NOT_OBSERVED_ON_CURRENT_PAGE',
      can_recon_now: true, can_prepare_now: false,
      next_action: 'MAP_FORM_AND_VERIFY_ACCOUNT_OR_COMMITMENT_GATES_BEFORE_PREPARE',
    };
  }
  if (candidate) {
    return {
      readiness: 'PUBLIC_APPLICATION_ROUTE_DISCOVERED', account_requirement: 'UNKNOWN',
      can_recon_now: true, can_prepare_now: false,
      next_action: 'INSPECT_DISCOVERED_APPLICATION_ROUTE',
    };
  }
  return {
    readiness: 'PUBLIC_SOURCE_RECON_ONLY', account_requirement: 'UNKNOWN',
    can_recon_now: true, can_prepare_now: false,
    next_action: 'LOCATE_OFFICIAL_APPLICATION_ROUTE_OR_REHYDRATE_SOURCE',
  };
}

async function auditOneRoute(route, browser) {
  if (!route.source_url) {
    return {
      ...route, public_observation: null, readiness: 'ROUTE_REHYDRATION_REQUIRED', account_requirement: 'UNKNOWN',
      can_recon_now: false, can_prepare_now: false, next_action: 'REHYDRATE_OFFICIAL_SOURCE_BEFORE_ANY_APPLICATION_WORK',
    };
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(route.source_url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const sourceSnapshot = await collectReconSnapshot(page);
    const candidate = candidateFor(route.source_url, sourceSnapshot);
    let targetSnapshot = sourceSnapshot;
    let inspectedUrl = sourceSnapshot.url;
    if (candidate && candidate.href !== sourceSnapshot.url) {
      await page.goto(candidate.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      targetSnapshot = await collectReconSnapshot(page);
      inspectedUrl = targetSnapshot.url;
    }
    const classification = classifyPublicReadiness(targetSnapshot, { candidate });
    return {
      ...route,
      public_observation: {
        inspected_url: inspectedUrl, source_title: sourceSnapshot.title,
        candidate_route: candidate ? { text: candidate.text, href: candidate.href, kind: candidate.kind } : null,
        form_count: targetSnapshot.forms.length, control_count: targetSnapshot.controls.length,
        file_input_count: targetSnapshot.file_inputs.length, signals: targetSnapshot.signals,
      },
      ...classification,
    };
  } catch (error) {
    return {
      ...route, public_observation: null, readiness: 'PUBLIC_ROUTE_UNREACHABLE_OR_PROTECTED', account_requirement: 'UNKNOWN',
      can_recon_now: false, can_prepare_now: false, next_action: 'RETRY_IN_USER_BROWSER_OR_VERIFY_OFFICIAL_SOURCE',
      error: String(error?.message ?? error).slice(0, 500),
    };
  } finally {
    await context.close();
  }
}

async function waitForHost(url, lastSeen, rateLimitMs) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const now = Date.now();
    const remaining = Number(rateLimitMs) - (now - (lastSeen.get(host) ?? 0));
    if (remaining > 0) await wait(remaining);
    lastSeen.set(host, Date.now());
  } catch {
    // auditOneRoute reports invalid/unreachable URLs without attempting a request.
  }
}

/**
 * Public, headless, observation-only readiness scan. It never loads auth
 * state, fills a field, follows a postback, persists storage, or saves a file.
 */
export async function auditApplicationReadiness({ records = buildMasterRegistry(), today = new Date(), days = 35, limit = 30, scope = 'near_term', rateLimitMs = 1_000 } = {}) {
  const selection = selectReadinessRoutes({ records, today, days, limit, scope });
  const browser = await chromium.launch({ headless: true });
  try {
    const routes = [];
    const observations = new Map();
    const lastSeen = new Map();
    for (const route of selection.routes) {
      const cacheKey = route.source_url ?? `missing:${route.route_id}`;
      let observation = observations.get(cacheKey);
      if (!observation) {
        if (route.source_url) await waitForHost(route.source_url, lastSeen, rateLimitMs);
        const audited = await auditOneRoute(route, browser);
        const { _record, route_id, organization, opportunity, deadline, status, execution_state, source_url, execution_manifest, audit_reason, static_readiness, ...shared } = audited;
        observation = shared;
        observations.set(cacheKey, observation);
      }
      routes.push({ ...route, ...observation });
    }
    const count = (predicate) => routes.filter(predicate).length;
    return {
      schema: 'blowback.application_readiness_audit.v1', generated_at: new Date().toISOString(),
      scope: {
        mode: selection.scope, from: selection.from, through: selection.through, route_count: routes.length,
        unique_public_sources_checked: observations.size - routes.filter((route) => !route.source_url).length,
        per_host_minimum_delay_ms: Number(rateLimitMs),
        network_policy: 'public headless observation only; no auth state, form fill, upload, account creation, consent, CAPTCHA interaction, draft save, or submission',
      },
      summary: {
        account_or_login_gate_observed: count((route) => route.account_requirement === 'OBSERVED'),
        public_form_reachable: count((route) => route.readiness === 'PUBLIC_FORM_REACHABLE'),
        source_or_route_recon_only: count((route) => /RECON_ONLY|ROUTE_DISCOVERED/.test(route.readiness)),
        rehydration_or_unreachable: count((route) => /REHYDRATION|UNREACHABLE/.test(route.readiness)),
      },
      routes: routes.map(({ _record, ...route }) => route),
    };
  } finally {
    await browser.close();
  }
}
