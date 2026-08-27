import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../../scripts/build-gauntlet-master.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(ROOT, '.blowback', 'missions');

const STATUS_PRIORITY = new Map([
  ['PORTAL_READY', 0],
  ['FIRE_NOW', 1],
  ['PRIMARY_FIRE', 2],
  ['FIRE', 3],
  ['FIRE_AFTER_GATE', 4],
  ['FIRE_IF_ELIGIBLE', 5],
  ['FIRE_IF_FIT', 6],
  ['FIRE_SOON', 7],
  ['STRETCH_FIRE', 8],
  ['SELECTIVE_FIRE', 9],
  ['FIRE_SELECTIVELY', 10],
  ['PRICE_DISCOVERY', 11],
  ['VERIFY', 20],
  ['PREPARE', 21],
  ['PREPARE_IF_ELIGIBLE', 22],
  ['DEPENDENCY_REQUIRED', 23],
  ['ROLLING', 30],
  ['WATCH', 60],
  ['HOLD', 70],
  ['KILL', 90],
]);

const PAUSED_CHECKPOINTS = new Set(['WAITING_HUMAN', 'SAFE_COMPLETE', 'BLOCKED']);
const TERMINAL_CHECKPOINTS = new Set(['SUBMITTED', 'ABANDONED', 'EXPIRED']);

function normalizeStatus(value = '') {
  return String(value).trim().toUpperCase();
}

function statusPriority(record) {
  const status = normalizeStatus(record.status);
  if (STATUS_PRIORITY.has(status)) return STATUS_PRIORITY.get(status);
  if (status.includes('FIRE')) return 12;
  if (status.includes('VERIFY')) return 24;
  if (status.includes('WATCH')) return 60;
  if (status.includes('HOLD')) return 70;
  if (status.includes('KILL') || status.includes('REJECT')) return 90;
  return 40;
}

function deadlineValue(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  const text = String(value).trim();
  if (/^(ROLLING|MONTHLY|SEASONAL|POST-EVENT|VACANCY_DRIVEN|CALL_NOT_YET_VERIFIED|CYCLE_NOT_YET_VERIFIED)$/i.test(text)) {
    return Number.POSITIVE_INFINITY;
  }
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(`${match[0]}T23:59:59Z`);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function loadCheckpoint(routeId) {
  const file = path.join(STATE_DIR, `${routeId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function isSuppressed(record, checkpoint, { includePaused = false } = {}) {
  const status = normalizeStatus(record.status);
  if (status.includes('KILL') || status.includes('REJECT')) return true;
  if (!checkpoint) return false;
  if (TERMINAL_CHECKPOINTS.has(checkpoint.status)) return true;
  if (!includePaused && PAUSED_CHECKPOINTS.has(checkpoint.status)) return true;
  return false;
}

export function rankGauntlet(records = buildMasterRegistry(), options = {}) {
  const ranked = records
    .map((record) => ({ record, checkpoint: loadCheckpoint(record.id) }))
    .filter(({ record, checkpoint }) => !isSuppressed(record, checkpoint, options))
    .sort((a, b) =>
      statusPriority(a.record) - statusPriority(b.record) ||
      deadlineValue(a.record.deadline) - deadlineValue(b.record.deadline) ||
      a.record.id.localeCompare(b.record.id)
    );
  return ranked;
}

function inferHumanGates(record) {
  const gates = new Set([
    'captcha',
    '2fa_or_otp',
    'password_creation_or_choice',
    'payment_or_purchase',
    'final_submit_send_apply_confirm',
    'legal_privacy_terms_consent',
    'originality_or_authorship_declaration',
    'destructive_action',
  ]);
  const gateText = `${record.gate ?? ''} ${record.status ?? ''}`.toLowerCase();
  if (/advisor|adviser/.test(gateText)) gates.add('advisor_commitment');
  if (/team/.test(gateText)) gates.add('team_commitment');
  if (/partner|host/.test(gateText)) gates.add('partner_or_host_commitment');
  if (/eligib/.test(gateText)) gates.add('unresolved_eligibility_attestation');
  if (/account/.test(gateText)) gates.add('account_creation_or_account_choice');
  return [...gates];
}

export function buildBrowserMission(record, checkpoint = null) {
  if (!record?.id) throw new Error('master record with id required');
  return {
    schema: 'blowback.codex_browser_mission.v1',
    mission_id: `mission:${record.id}`,
    route_id: record.id,
    objective: `Advance ${record.organization || record.opportunity}: ${record.opportunity || record.id} through the live web workflow to the last safe reversible state.`,
    strategic: {
      lane: record.lane,
      route_class: record.route_class,
      status: record.status,
      execution_state: record.execution_state,
      deadline: record.deadline,
      gate: record.gate,
      contribution_view: record.contribution_view,
      shared_evidence_family: record.shared_evidence_family,
      mutual_exclusion_group: record.mutual_exclusion_group,
      parent_route: record.parent_route,
      source_state: record.source_state,
    },
    browser: {
      starting_url: record.source || null,
      adaptive_navigation_required: true,
      hardcoded_portal_recipe_required: false,
      use_existing_chrome_session: true,
      multi_tab_allowed: true,
      official_route_preferred: true,
    },
    permissions: {
      auto: [
        'navigate_relevant_links_and_redirects',
        'switch_tabs_or_windows',
        'scroll_expand_and_inspect',
        'reversible_next_continue_back_open_edit_actions',
        'use_existing_authenticated_session',
        'fill_canonical_factual_fields',
        'make_unambiguous_mechanical_selections',
        'upload_existing_designated_artifacts',
        'download_instructions_templates_or_receipts',
        'save_draft',
        'recover_from_timeout_or_session_refresh',
        'inspect_dom_network_or_page_state_when_needed',
      ],
      resolve_before_asking: [
        'track_or_category_from_gauntlet_and_project_evidence',
        'known_profile_and_affiliation_facts',
        'known_project_title_description_and_dates',
        'previously_established_eligibility_facts',
        'designated_existing_artifact_for_route',
      ],
      human_gate: inferHumanGates(record),
      forbidden: [
        'bypass_captcha_or_antibot',
        'invent_credentials',
        'invent_eligibility_affiliation_team_advisor_or_evidence',
        'store_password_otp_card_or_secret_in_checkpoint',
      ],
    },
    success: {
      preferred_terminal_state: 'WAITING_HUMAN',
      acceptable_states: ['SAFE_COMPLETE', 'WAITING_HUMAN', 'SUBMITTED', 'BLOCKED'],
      instruction: 'Do not stop because the portal is unfamiliar. Stop only at a genuine protected gate, verified blocker, or last safe state.',
    },
    resume: checkpoint ? {
      checkpoint_status: checkpoint.status,
      stage: checkpoint.stage,
      current_url: checkpoint.current_url,
      completed_actions: checkpoint.completed_actions ?? [],
      unresolved_items: checkpoint.unresolved_items ?? [],
      human_required: checkpoint.human_required ?? [],
      observed_at: checkpoint.observed_at ?? null,
    } : null,
    record,
  };
}

export function browserMissionForRoute(routeId, records = buildMasterRegistry()) {
  const record = records.find((item) => item.id === routeId);
  if (!record) throw new Error(`route not found in Gauntlet master: ${routeId}`);
  const checkpoint = loadCheckpoint(routeId);
  return buildBrowserMission(record, checkpoint);
}

export function nextBrowserMission(records = buildMasterRegistry()) {
  const ranked = rankGauntlet(records);
  if (!ranked.length) return null;
  const { record, checkpoint } = ranked[0];
  return buildBrowserMission(record, checkpoint);
}
