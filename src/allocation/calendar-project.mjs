import fs from 'node:fs';

import { resolvePortfolioAllocation, routeAssets } from './portfolio.mjs';
import { portfolioCampaignScope, routeCampaignDecision } from './campaign-scope.mjs';
import { assessSubmissionReadiness } from './submission-readiness.mjs';

const ASSET_AUTHORITY = JSON.parse(fs.readFileSync(new URL('../../data/portfolio-assets.json', import.meta.url), 'utf8'));
const CAMPAIGN = portfolioCampaignScope();
const ACTIVE = new Set(CAMPAIGN.active_lead_assets);

const ASSET_NAMES = {
  'cite-agent': ['cite-agent', 'cite agent', 'cite'],
  'research-drive': ['research drive', 'yzu cluster', 'yzu', 'rd'],
  'policy-lab': ['policy lab', 'cl-eci', 'eci'],
  'nocturnal-oversight': ['nocturnal oversight', 'nocturnal'],
  'hardware-splicer': ['hardware splicer', 'hardware-splicer', 'hs'],
  'public-good-control': ['public-good control', 'public good', 'public-good'],
  'refinery-commons': ['refinery / commons', 'refinery', 'commons'],
  'research-papers': ['research papers', 'research-papers', 'invisible ledger', 'manuscript'],
};

const CAPABILITY_TERMS = {
  'cite-agent': ['citation', 'literature', 'rag', 'research ai', 'reliable ai', 'evaluation', 'nlp'],
  'research-drive': ['research infrastructure', 'mcp', 'data system', 'full-stack', 'cloud', 'workflow', 'platform'],
  'policy-lab': ['policy', 'fintech', 'finance', 'governance', 'assurance', 'audit', 'tax', 'cryptography'],
  'nocturnal-oversight': ['information integrity', 'journalism', 'fact-check', 'civic', 'censorship', 'news', 'social data'],
  'hardware-splicer': ['hardware', 'physical', 'robot', 'embodied', 'electronics', 'semiconductor', 'construction', 'industrial ai', 'computer vision'],
  'public-good-control': ['public-good', 'public good', 'humanitarian', 'animal', 'disaster', 'climate', 'conservation', 'smart living'],
  'refinery-commons': ['software sustainability', 'open source', 'provenance', 'reuse', 'software engineering', 'tool demo', 'artifact'],
  'research-papers': ['paper', 'conference', 'publication', 'abstract', 'symposium', 'manuscript', 'finance research', 'tax research'],
};

const IMPLEMENTATION = { unknown: 0, concept: 20, implemented: 60, internally_validated: 85 };
const EXTERNAL = { unknown: 0, none: 0, limited: 30, partner_validated: 60, independently_replicated: 80, adopted: 100 };
const DEPLOYMENT = { unknown: 0, none: 0, public_demo: 45, shadow: 55, internal_live: 65, external_operational: 100 };
const CANONICAL = { unknown: 0, canonical: 100, release_branch_ahead: 65, integration_in_progress: 40, branch_archaeology_required: 20, research_repair_required: 25 };

const ROUTE_ALIASES = new Map(Object.entries({
  'yzu-semiconductor-final': 'yzu-semiconductor-ai-agent-2026-hs',
  'nycu-diligence': 'phd-nycu-iais',
  futuremode: 'field-futuremode-2026',
  ethonline: 'ethonline-2026-policy-lab',
  'mats-winter': 'residency-mats-winter-2027',
  'fas-ai-policy': 'fas-ai-policy-2026',
  'otf-icrp': 'otf-nocturnal',
  'yzu-subsidy-open': 'yzu-competition-reimbursement',
  'tudelft-business-software': 'phd-tudelft-business-software',
  'tea-ibfd-reverify': 'ibfd-2026-invisible-ledger',
  kubesummit: 'field-kubesummit-2026',
  'era-ai': 'fellowship-era-ai-winter-2027',
  'vu-social-data': 'phd-vu-social-data',
  'taai-hs-paper': 'taai-2026-domestic-hardware-splicer',
  'taia-hs-creative': 'taia-2026-hardware-splicer',
  fij: 'fij-2026-nocturnal',
  'vu-atlantis': 'phd-vu-atlantis',
  'nhh-early': 'phd-nhh-finance',
  'hku-ai-engineer': 'job-hku-ai-engineer-mcp-ra2-2026',
  'fc27-cl-eci': 'fc27-cl-eci',
  'il-shihhsin': 'shih-hsin-finance-2026-il',
  'il-shihhsin-outcome': 'shih-hsin-finance-2026-il',
  'taiwan-innotech': 'field-taiwan-innotech-2026',
  smartliving: 'smartliving-creative-2026',
  'cht-cl-eci': 'cht-smart-innovation-2026-cl-eci',
  'ntnu-maritime': 'phd-ntnu-maritime-interactive-agents',
  'lasr-reverify': 'fellowship-lasr-winter-2027',
  'astra-watch': 'fellowship-astra-2027',
  tpp: 'fellowship-tech-policy-press-2027',
  'tudelft-dtai': 'phd-tudelft-decentralized-trustworthy-ai',
  'awesome-climate': 'awesome-climate-2026-09',
  'saner-research': 'saner-2027-research-refinery',
  'ntub-fintech': 'ntub-fintech-2026-cl-eci',
  twnic: 'twnic-community-grant-2026-nocturnal',
  ftsid: 'ftsid-2026-cl-eci',
  'eu-info-integrity': 'watch-eu-information-integrity-consortium-2026',
  ssi: 'ssi-fellowship-2027-policy-lab',
  'sinica-der-nian': 'lab-sinica-der-nian-yang-ra-2026',
  'usn-ai-audit': 'phd-usn-ai-auditing',
  'msr-technical': 'msr-2027-technical-refinery',
  'saner-tool': 'saner-2027-tool-demo-refinery',
  'saner-agentic': 'saner-2027-agentic-ai4se-refinery',
  'fintech-taipei': 'field-fintech-taipei-2026',
  'freeway-ai': 'freeway-pricing-2026',
  'usn-ai-audit': 'phd-usn-audit-ai',
  taitronics: 'field-taitronics-aiot-2026',
  'industry-academia': 'ncue-mech-2026',
  'oist-internship': 'internship-oist-research-2027',
  'mats-residency': 'residency-mats-2027',
  'shihhsin-full': 'shih-hsin-finance-2026-il',
  nlnet: 'nlnet-codesupply-refinery',
  'shihhsin-conference': 'shih-hsin-finance-2026-il',
  'msr-data-tool': 'msr-2027-data-tool-refinery',
  interledger: 'interledger-local-2026',
  'yzu-subsidy-close': 'yzu-competition-reimbursement',
  'awesome-climate-nov': 'awesome-climate-2026-09',
  legaltech: 'legaltech-app-2026',
  'nhh-main': 'phd-nhh-main-2027',
  'hku-aec': 'job-hku-ai-agents-aec-ra-2026',
  'global-tax': 'global-tax-symposium-2027-il',
  'sinica-ku': 'lab-sinica-ku-nlp-ra-2026',
  'openai-researcher': 'openai-researcher-access-hardware-splicer',
  'gaf-outcome': 'gaf-2026-policy-lab',
  innoserve: 'innoserve-2026-hs-industrial-ai',
  'ntub-finalist': 'ntub-fintech-2026-cl-eci',
  'ntub-final': 'ntub-fintech-2026-cl-eci',
  'cht-finalist': 'cht-smart-innovation-2026-cl-eci',
  'cht-final': 'cht-smart-innovation-2026-cl-eci',
  'dpg-policy-lab': 'dpg-policy-lab',
  'rolling-public-good-pilot': 'outbound-publicgood-pilot',
}));

const LEAD_OVERRIDES = new Map(Object.entries({
  'nhh-early': 'research-papers',
  'nhh-main': 'research-papers',
  'openai-researcher': 'hardware-splicer',
  'anthropic-research-access': 'hardware-splicer',
  nlnet: 'refinery-commons',
  smartliving: 'hardware-splicer',
  'taiwan-innotech': 'hardware-splicer',
  'sinica-ku': 'cite-agent',
  'ntnu-maritime': 'research-drive',
  interledger: 'policy-lab',
  legaltech: 'policy-lab',
  'tudelft-business-software': 'research-drive',
  'vu-social-data': 'nocturnal-oversight',
  fij: 'nocturnal-oversight',
  'freeway-ai': 'policy-lab',
  'energy-taiwan': 'hardware-splicer',
  taitronics: 'hardware-splicer',
  'industry-academia': 'hardware-splicer',
  'usn-ai-audit': 'policy-lab',
  'iii-register': 'hardware-splicer',
  'iii-proposal': 'hardware-splicer',
  'oist-internship': 'research-drive',
  'il-shihhsin-outcome': 'research-papers',
  'gaf-outcome': 'policy-lab',
  'ntub-finalist': 'policy-lab',
  'ntub-final': 'policy-lab',
  'cht-finalist': 'policy-lab',
  'cht-final': 'policy-lab',
}));

const NO_SINGLE_LEAD = new Set([
  'postgrad-job-kickoff',
  'taiwan-phd-refresh',
  'ai-fire-weekly',
  'outcome-ledger-weekly',
  'yzu-subsidy-open',
  'job-refresh-weekly',
  'quant-fire-weekly',
  'external-evidence-weekly',
  'postgrad-review',
  'innoserve-final',
  'meet-taipei',
  'yzu-subsidy-close',
  'sinica-year-end',
  'student-infrastructure-claim',
  'rolling-money-review',
  'rolling-research-labor',
  'next-cycle-fellowships',
  'partner-watch',
  'rolling-publications',
  'outbound-pilot-review',
]);

function eventKey(event) {
  return String(event.uid ?? '').replace(/-\d{8}@blowback$/i, '');
}

function normalizedText(event, route = null) {
  return [event.uid, event.summary, event.description, route?.id, route?.organization, route?.opportunity, route?.assets, route?.contribution_view]
    .filter(Boolean).join(' ').toLowerCase().replace(/[–—_/]+/g, ' ');
}

function mentioned(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function maturityScore(asset) {
  return Math.round(
    (IMPLEMENTATION[asset.implementation_stage] ?? 0) * 0.45
    + (EXTERNAL[asset.external_evidence_stage] ?? 0) * 0.20
    + (DEPLOYMENT[asset.deployment_stage] ?? 0) * 0.15
    + (CANONICAL[asset.canonicalization_state] ?? 0) * 0.20
  );
}

function readinessScore(route) {
  if (!route) return 35;
  const status = String(route.status ?? '').toUpperCase();
  const execution = String(route.execution_state ?? '').toUpperCase();
  let score = /PRIMARY_FIRE|FIRE_NOW|READY_TO_SUBMIT/.test(status) ? 90
    : /FIRE/.test(status) ? 70
      : /VERIFY|REHYDRATE/.test(status) ? 45
        : /WATCH|ROLLING/.test(status) ? 30
          : /HOLD|KILL|REJECT|EXPIRED/.test(status) ? 5 : 35;
  if (/HUMAN_SUBMIT_READY|PREPARE_VERIFIED|PORTAL_MAPPED|APPLICATION_READY|PACKET_READY|OUTREACH_READY/.test(execution)) score += 10;
  if (/RESEARCH_ONLY|RECON_REQUIRED/.test(execution)) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function opportunityKind(event) {
  const key = eventKey(event);
  const summary = String(event.summary ?? '').toUpperCase();
  if (NO_SINGLE_LEAD.has(key)) return 'PORTFOLIO_OPERATION';
  if (/OUTCOME|FINAL IF|PRESENT IF|IF ACCEPTED|CLAIM WINDOW/.test(summary)) return 'INHERITED_STAGE';
  if (/FIRE BATCH|\[RADAR\]|\[LEDGER\]|\[REVIEW\]|\[G4 BLOCK\]|ROLLING MONEY|ROLLING LABS|FUTURE-CYCLE|POST-GRAD|UPPER-TAIL EMPLOYMENT/.test(summary)) return 'PORTFOLIO_OPERATION';
  if (/NETWORK|FIELD\]|FIELD ROUTE|EXPO|TAITRONICS|ENERGY TAIWAN/.test(summary)) return 'FIELD_OR_NETWORK';
  if (/HOLD|REVERIFY|WATCH|DUE DILIGENCE|VERIFY/.test(summary) && !/VERIFY\/FIRE|VERIFY THEN FIRE|CHECK FIRE/.test(summary)) return 'REVERIFY_OR_HOLD';
  return 'ENTRY_OR_APPLICATION';
}

function routeForEvent(event, records) {
  const key = eventKey(event);
  const alias = ROUTE_ALIASES.get(key);
  if (alias) return records.find((record) => record.id === alias) ?? null;
  const exact = records.find((record) => record.id === key);
  if (exact) return exact;
  const tokens = key.split('-').filter((token) => token.length > 2 && !['fire', 'watch', 'final', 'review'].includes(token));
  const candidates = records.map((record) => ({
    record,
    matches: tokens.filter((token) => record.id.includes(token)).length,
  })).filter((item) => item.matches > 0)
    .sort((a, b) => b.matches - a.matches || a.record.id.localeCompare(b.record.id));
  return candidates[0]?.matches >= Math.max(2, Math.ceil(tokens.length * 0.5)) ? candidates[0].record : null;
}

function candidateAssets(event, route) {
  const text = normalizedText(event, route);
  const candidates = new Set();
  const allocation = route ? resolvePortfolioAllocation(route) : null;
  if (allocation?.lead_asset && ACTIVE.has(allocation.lead_asset)) candidates.add(allocation.lead_asset);
  for (const asset of allocation?.lead_projects ?? []) if (ACTIVE.has(asset)) candidates.add(asset);
  for (const asset of route ? routeAssets(route) : []) if (ACTIVE.has(asset)) candidates.add(asset);
  for (const [asset, names] of Object.entries(ASSET_NAMES)) {
    if (ACTIVE.has(asset) && mentioned(text, names)) candidates.add(asset);
  }
  return [...candidates];
}

function scoreAsset(assetId, event, route) {
  const asset = ASSET_AUTHORITY.assets.find((item) => item.id === assetId);
  const allocation = route ? resolvePortfolioAllocation(route) : null;
  const text = normalizedText(event, route);
  let fit = 35;
  if (allocation?.lead_asset === assetId) fit += 35;
  if (allocation?.lead_projects?.includes(assetId)) fit += 22;
  if (route && routeAssets(route).includes(assetId)) fit += 12;
  if (mentioned(text, ASSET_NAMES[assetId] ?? [])) fit += 15;
  fit += Math.min(20, (CAPABILITY_TERMS[assetId] ?? []).filter((term) => text.includes(term)).length * 5);
  fit = Math.min(100, fit);
  const maturity = maturityScore(asset);
  const readiness = readinessScore(route);
  const score = Math.round(fit * 0.52 + maturity * 0.28 + readiness * 0.20);
  return { asset_id: assetId, score, capability_fit: fit, maturity, route_readiness: readiness };
}

function winBand(score, kind, route) {
  if (kind === 'PORTFOLIO_OPERATION' || kind === 'INHERITED_STAGE') return 'NOT_A_NEW_ENTRY';
  if (kind === 'REVERIFY_OR_HOLD' || /HOLD|KILL|REJECT|EXPIRED/.test(String(route?.status ?? '').toUpperCase())) return 'BLOCKED_OR_LOW';
  if (score >= 76) return 'STRONG_RELATIVE_FIT';
  if (score >= 62) return 'MEDIUM_RELATIVE_FIT';
  return 'LOW_OR_UNPROVEN_FIT';
}

function readinessWorkSummary(readiness) {
  const work = [];
  if (readiness.packaging_required?.length) work.push(`Packaging: ${readiness.packaging_required.join('; ')}`);
  if (readiness.engineering_required && readiness.engineering_required !== 'NONE') work.push(`Engineering/evidence: ${readiness.engineering_required}`);
  if (readiness.documents_missing_or_unverified?.length) work.push(`Documents: ${readiness.documents_missing_or_unverified.join('; ')}`);
  if (readiness.dependency_or_human_gates?.length) work.push(`Gates: ${readiness.dependency_or_human_gates.join('; ')}`);
  return work.join(' | ') || 'No pre-draft work identified; protected final actions still follow route policy.';
}

export function allocateCalendarEvent(event, records = []) {
  const key = eventKey(event);
  const kind = opportunityKind(event);
  const route = routeForEvent(event, records);
  const campaign = route ? routeCampaignDecision(route) : null;
  const submissionReadiness = assessSubmissionReadiness(route);
  const candidates = candidateAssets(event, route).map((asset) => scoreAsset(asset, event, route)).sort((a, b) => b.score - a.score || a.asset_id.localeCompare(b.asset_id));
  const override = LEAD_OVERRIDES.get(key);
  const selected = NO_SINGLE_LEAD.has(key)
    ? null
    : override && ACTIVE.has(override)
      ? candidates.find((candidate) => candidate.asset_id === override) ?? scoreAsset(override, event, route)
      : candidates[0] ?? null;
  const decision = key === 'rolling-procurement'
    ? 'SKIP_DEFERRED_GEOMAP'
    : kind === 'PORTFOLIO_OPERATION'
      ? 'BATCH_BY_ROUTE'
      : kind === 'INHERITED_STAGE'
        ? 'INHERIT_PARENT_ENTRY'
        : selected
          ? 'USE_SELECTED_LEAD'
          : 'RESEARCH_OR_BIND_ROUTE_FIRST';
  return {
    calendar_uid: event.uid,
    event_key: key,
    date: event.start,
    recurrence: event.rrule ?? null,
    summary: event.summary,
    event_kind: kind,
    route_id: route?.id ?? null,
    route_status: route?.status ?? null,
    campaign_included: campaign?.included ?? null,
    decision,
    recommended_lead_asset: decision === 'SKIP_DEFERRED_GEOMAP' || decision === 'BATCH_BY_ROUTE' ? null : selected?.asset_id ?? null,
    relative_win_band: selected ? winBand(selected.score, kind, route) : 'UNASSESSED',
    submission_readiness_label: submissionReadiness.readiness,
    ready_for_browser: submissionReadiness.ready_for_browser,
    readiness_work: readinessWorkSummary(submissionReadiness),
    readiness_next_action: submissionReadiness.next_action,
    submission_readiness: submissionReadiness,
    score: selected?.score ?? null,
    score_components: selected ? {
      capability_fit: selected.capability_fit,
      maturity: selected.maturity,
      route_readiness: selected.route_readiness,
    } : null,
    alternatives: candidates.filter((candidate) => candidate.asset_id !== selected?.asset_id).slice(0, 3),
    confidence: route && selected ? 'MEDIUM_HIGH' : selected ? 'MEDIUM' : kind === 'PORTFOLIO_OPERATION' ? 'NOT_APPLICABLE' : 'LOW',
    caveat: 'Relative win band is a portfolio-selection heuristic, not an empirical acceptance probability. Live eligibility, current source, competition strength and external evidence still control submission readiness.',
  };
}

export function allocateCalendarEvents(events, records = []) {
  return events.map((event) => allocateCalendarEvent(event, records));
}
