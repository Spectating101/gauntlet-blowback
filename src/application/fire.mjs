import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../../scripts/build-gauntlet-master.mjs';
import { loadOpportunity, loadStructured } from '../core/load.mjs';
import { assertOpportunity } from '../core/validate.mjs';
import { resolveBundle } from '../core/resolve.mjs';
import { resolveRouteUrls } from '../core/routes.mjs';
import { buildBrowserMission, rankGauntlet } from '../mission/operator.mjs';
import { assertNoSecretKeys, persistCheckpoint } from '../mission/checkpoint.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RECEIPT_DIR = path.join(ROOT, '.blowback', 'receipts');
const FIRE_STATUS = /^(PORTAL_READY|FIRE_NOW|PRIMARY_FIRE|FIRE)$/i;
const RECEIPT_STATUSES = new Set(['IN_PROGRESS', 'WAITING_HUMAN', 'SAFE_COMPLETE', 'SUBMITTED', 'BLOCKED', 'ABANDONED', 'EXPIRED']);

function withinRoot(file) {
  const resolved = path.resolve(file);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`path escapes repository root: ${file}`);
  }
  return resolved;
}

function asStringArray(value, key) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${key} must be an array of strings`);
  }
  return value;
}

function safeFilename(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, '_');
}

function requireFireRecord(record) {
  if (!record) throw new Error('route record required');
  if (!record.execution_manifest) throw new Error(`route has no execution_manifest: ${record.id}`);
  if (!FIRE_STATUS.test(String(record.status ?? ''))) {
    throw new Error(`route is not in an immediate FIRE state: ${record.id} (${record.status ?? 'UNKNOWN'})`);
  }
  return record;
}

async function loadExecutionBundle(record) {
  requireFireRecord(record);
  const manifestPath = withinRoot(path.join(ROOT, record.execution_manifest));
  const opportunity = await loadOpportunity(manifestPath);
  assertOpportunity(opportunity);
  if (opportunity.id !== record.id) {
    throw new Error(`execution manifest id mismatch: master=${record.id} manifest=${opportunity.id}`);
  }
  if (opportunity.direct_control === false) throw new Error(`execution manifest is not directly controllable: ${record.id}`);
  if (opportunity.route_evidence?.final_submission_copy_ready !== true) {
    throw new Error(`final submission copy is not marked ready: ${record.id}`);
  }
  if (!opportunity.fire_packet) throw new Error(`execution manifest has no fire_packet: ${record.id}`);

  const bundle = await resolveBundle(opportunity);
  const firePacketPath = withinRoot(path.resolve(opportunity.__dir, opportunity.fire_packet));
  const firePacket = await loadStructured(firePacketPath);
  if (firePacket?.schema !== 'blowback.fire_packet.v1') throw new Error(`unsupported fire packet schema: ${firePacket?.schema ?? '(missing)'}`);
  if (firePacket.route_id !== record.id) throw new Error(`fire packet route mismatch: master=${record.id} packet=${firePacket.route_id}`);
  if (!firePacket.copy || typeof firePacket.copy !== 'object') throw new Error(`fire packet copy missing: ${record.id}`);

  return { manifestPath, opportunity, bundle, firePacketPath, firePacket };
}

function receiptTemplate(mission, routes) {
  return {
    schema: 'blowback.fire_receipt.v1',
    mission_id: mission.mission_id,
    route_id: mission.route_id,
    status: 'WAITING_HUMAN',
    stage: 'final_review',
    current_url: routes.execution_url ?? routes.recon_url ?? null,
    visited_urls: [],
    completed_actions: [],
    unresolved_items: [],
    human_required: ['final_submit'],
    receipt_refs: [],
    application_id: null,
    submitted_at: null,
    next_expected_event: null,
    note: null,
  };
}

export async function buildFireHandoff(record, checkpoint = null) {
  const { opportunity, bundle, firePacket, manifestPath, firePacketPath } = await loadExecutionBundle(record);
  const mission = buildBrowserMission(record, checkpoint);
  const routes = resolveRouteUrls(opportunity);
  const startingUrl = routes.execution_url ?? routes.recon_url ?? record.source ?? null;

  return {
    schema: 'blowback.fire_handoff.v1',
    generated_at: new Date().toISOString(),
    handoff_id: `fire:${record.id}`,
    mission_id: mission.mission_id,
    route_id: record.id,
    state: 'READY_FOR_BROWSER_AGENT',
    priority: {
      status: record.status,
      deadline: record.deadline,
      organization: record.organization,
      opportunity: record.opportunity,
    },
    target: {
      starting_url: startingUrl,
      source_url: routes.source_url,
      registration_url: routes.registration_url,
      submission_url: routes.submission_url,
      portal: opportunity.portal,
      portal_family: opportunity.portal_family ?? null,
      auth_scope: opportunity.auth_scope ?? null,
    },
    applicant_fields: bundle.fields,
    uploads: bundle.uploads,
    submission_copy: firePacket.copy,
    packet: {
      local_manifest: path.relative(ROOT, manifestPath),
      local_fire_packet: path.relative(ROOT, firePacketPath),
      canonical_packet_source: opportunity.packet_source ?? null,
      canonical_packet_revision: opportunity.packet_revision ?? null,
      final_copy_source: opportunity.final_copy_source ?? firePacket.source_url ?? null,
      final_copy_revision: opportunity.final_copy_revision ?? firePacket.source_revision ?? null,
    },
    live_portal_state: {
      execution_state: opportunity.execution_state ?? null,
      recon_stage: opportunity.recon_stage ?? null,
      field_map_verified: opportunity.route_evidence?.form_fields_verified === true,
      field_map: opportunity.field_map ?? {},
      upload_map: opportunity.upload_map ?? {},
    },
    browser_agent_contract: {
      objective: 'Open the live route, inspect the current form, map the prepared copy to the real fields, complete all safe reversible work, save a draft when possible, and stop at protected commitment gates.',
      auto: mission.permissions.auto,
      resolve_before_asking: mission.permissions.resolve_before_asking,
      human_gate: mission.permissions.human_gate,
      forbidden: mission.permissions.forbidden,
      final_submit_policy: 'HUMAN_PROTECTED',
      do_not_redesign_copy_unless_live_field_limits_require_compression: true,
      if_copy_must_be_compressed: 'Preserve the research question, causal mechanism, concrete method, expected outputs and explicit nonclaims. Do not add new claims.',
      after_human_submit: 'Capture confirmation/application id, submitted timestamp, current URL, receipt/screenshot/email references, next expected event, and return a blowback.fire_receipt.v1 payload.',
    },
    receipt_contract: {
      schema: 'blowback.fire_receipt.v1',
      allowed_statuses: [...RECEIPT_STATUSES],
      checkpoint_on_return: true,
      persist_receipt: true,
      template: receiptTemplate(mission, routes),
    },
    resume: mission.resume,
  };
}

export async function fireHandoffForRoute(routeId, records = buildMasterRegistry()) {
  const ranked = rankGauntlet(records, { includePaused: true });
  const found = ranked.find(({ record }) => record.id === routeId);
  if (!found) throw new Error(`route not found in active Gauntlet master: ${routeId}`);
  return buildFireHandoff(found.record, found.checkpoint);
}

export async function nextFireHandoff(records = buildMasterRegistry()) {
  const ranked = rankGauntlet(records)
    .filter(({ record }) => record.execution_manifest && FIRE_STATUS.test(String(record.status ?? '')));
  for (const item of ranked) {
    try {
      return await buildFireHandoff(item.record, item.checkpoint);
    } catch {
      // A FIRE route without a complete execution bundle is not executable yet.
      // Continue to the next deterministic FIRE route rather than failing the whole queue.
    }
  }
  return null;
}

export async function fireHandoffQueue(records = buildMasterRegistry(), { limit = 10 } = {}) {
  const ranked = rankGauntlet(records)
    .filter(({ record }) => record.execution_manifest && FIRE_STATUS.test(String(record.status ?? '')));
  const handoffs = [];
  for (const item of ranked) {
    if (handoffs.length >= Math.max(1, Number(limit) || 10)) break;
    try {
      handoffs.push(await buildFireHandoff(item.record, item.checkpoint));
    } catch {
      // Keep the queue executable-only. Non-ready FIRE records remain visible in Gauntlet,
      // but they do not become browser-agent handoffs until their bundle is complete.
    }
  }
  return {
    schema: 'blowback.fire_queue.v1',
    generated_at: new Date().toISOString(),
    count: handoffs.length,
    handoffs,
  };
}

export function validateFireReceipt(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('fire receipt object required');
  if (raw.schema && raw.schema !== 'blowback.fire_receipt.v1') throw new Error(`unsupported fire receipt schema: ${raw.schema}`);
  if (!raw.route_id || typeof raw.route_id !== 'string') throw new Error('fire receipt route_id required');
  if (!raw.mission_id || typeof raw.mission_id !== 'string') throw new Error('fire receipt mission_id required');
  if (!RECEIPT_STATUSES.has(raw.status)) throw new Error(`unsupported fire receipt status: ${raw.status}`);
  if (!raw.stage || typeof raw.stage !== 'string') throw new Error('fire receipt stage required');
  assertNoSecretKeys(raw);

  if (raw.status === 'SUBMITTED' && !raw.submitted_at) throw new Error('submitted fire receipt requires submitted_at');
  if (raw.status === 'SUBMITTED' && !raw.application_id && !(raw.receipt_refs?.length > 0)) {
    throw new Error('submitted fire receipt requires application_id or receipt_refs');
  }

  return {
    schema: 'blowback.fire_receipt.v1',
    mission_id: raw.mission_id,
    route_id: raw.route_id,
    status: raw.status,
    stage: raw.stage,
    current_url: raw.current_url ?? null,
    visited_urls: asStringArray(raw.visited_urls, 'visited_urls'),
    completed_actions: asStringArray(raw.completed_actions, 'completed_actions'),
    unresolved_items: asStringArray(raw.unresolved_items, 'unresolved_items'),
    human_required: asStringArray(raw.human_required, 'human_required'),
    receipt_refs: asStringArray(raw.receipt_refs, 'receipt_refs'),
    application_id: raw.application_id ?? null,
    submitted_at: raw.submitted_at ?? null,
    next_expected_event: raw.next_expected_event ?? null,
    resource_or_award_terms: raw.resource_or_award_terms ?? null,
    note: raw.note ?? null,
    observed_at: raw.observed_at ?? new Date().toISOString(),
  };
}

export function fireReceiptToCheckpoint(receipt) {
  const normalized = validateFireReceipt(receipt);
  return {
    mission_id: normalized.mission_id,
    route_id: normalized.route_id,
    status: normalized.status,
    stage: normalized.stage,
    current_url: normalized.current_url,
    visited_urls: normalized.visited_urls,
    completed_actions: normalized.completed_actions,
    unresolved_items: normalized.unresolved_items,
    human_required: normalized.human_required,
    receipt_refs: normalized.receipt_refs,
    note: normalized.note,
    observed_at: normalized.observed_at,
  };
}

export function persistFireReceipt(raw) {
  const receipt = validateFireReceipt(raw);
  fs.mkdirSync(RECEIPT_DIR, { recursive: true });
  const stamp = safeFilename(receipt.submitted_at ?? receipt.observed_at);
  const file = path.join(RECEIPT_DIR, `${safeFilename(receipt.route_id)}-${stamp}.json`);
  fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });

  const receiptRef = path.relative(ROOT, file);
  const checkpoint = fireReceiptToCheckpoint({
    ...receipt,
    receipt_refs: [...new Set([...receipt.receipt_refs, receiptRef])],
  });
  const persistedCheckpoint = persistCheckpoint(checkpoint);
  return { receipt, receipt_file: file, checkpoint: persistedCheckpoint.checkpoint, checkpoint_file: persistedCheckpoint.file };
}
