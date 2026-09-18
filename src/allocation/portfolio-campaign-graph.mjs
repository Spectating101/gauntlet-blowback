import fs from 'node:fs';

import { routeCampaignDecision } from './campaign-scope.mjs';

const DEFAULT_GRAPH = JSON.parse(fs.readFileSync(
  new URL('../../data/portfolio-campaign-graph-2026-09-16.json', import.meta.url),
  'utf8',
));

const SYSTEM_CAMPAIGN_BY_ASSET = new Map([
  ['cite-agent', 'system-cite-agent'],
  ['research-drive', 'system-research-drive'],
  ['policy-lab', 'system-policy-lab'],
  ['nocturnal-oversight', 'system-nocturnal'],
  ['hardware-splicer', 'system-hardware-splicer'],
  ['public-good-control', 'system-public-good'],
  ['refinery-commons', 'system-refinery-commons'],
]);

const PHD_LANES = new Set(['PHD', 'PHD_FACULTY']);
const EMPLOYMENT_LANES = new Set(['JOB', 'CAREER']);
const RESEARCH_APPOINTMENT_LANES = new Set([
  'RESEARCH_JOB',
  'RESEARCH_LAB',
  'PREDOC',
  'RESEARCH_FELLOWSHIP',
  'POLICY_FELLOWSHIP',
  'RESEARCH_RESIDENCY',
  'FUNDED_VISITING_RESEARCH',
  'RESEARCH_CAREER_PROGRAM',
  'FELLOWSHIP',
]);
const RESOURCE_LANES = new Set([
  'GRANT',
  'GRANT_WATCH',
  'INSTITUTIONAL_RESEARCH_GRANT',
  'OPEN_SOURCE_GRANT',
  'RESEARCH_GRANT',
  'RESEARCH_ACCESS',
  'RESEARCH_CREDIT',
  'OFFSET',
  'STUDENT_INFRASTRUCTURE',
]);
const MARKET_LANES = new Set(['SELL', 'PROCURE', 'PROCUREMENT', 'PILOT', 'PARTNER', 'FIELD']);

function normalized(value = '') {
  return String(value).trim().toUpperCase();
}

function explicitRouteIndex(graph = DEFAULT_GRAPH) {
  const index = new Map();
  for (const campaign of graph.campaigns ?? []) {
    for (const route of campaign.route_instruments ?? []) {
      const entries = index.get(route.route_id) ?? [];
      entries.push({ campaign, route });
      index.set(route.route_id, entries);
    }
  }
  return index;
}

function inferredFunction(lane) {
  if (PHD_LANES.has(lane) || EMPLOYMENT_LANES.has(lane) || RESEARCH_APPOINTMENT_LANES.has(lane)) {
    return 'CAREER_CONVERT';
  }
  if (RESOURCE_LANES.has(lane)) return 'RESOURCE_ACQUIRE';
  if (['SELL', 'PROCURE', 'PROCUREMENT'].includes(lane)) return 'MARKET_TEST';
  if (['PILOT', 'PARTNER', 'FIELD'].includes(lane)) return 'PILOT_VALIDATE';
  if (lane === 'STANDARD') return 'STANDARD_REVIEW';
  if (lane === 'COMPETITION' || lane === 'APPLY') return 'CAPABILITY_DEMONSTRATE';
  if (lane === 'CONFERENCE') return 'DISSEMINATE';
  if (lane === 'RESEARCH') return 'PUBLISH';
  return null;
}

function outcomeCampaign(lane) {
  if (PHD_LANES.has(lane)) return 'main-quest-funded-phd-options';
  if (EMPLOYMENT_LANES.has(lane)) return 'main-quest-employment-options';
  if (RESEARCH_APPOINTMENT_LANES.has(lane)) return 'main-quest-funded-research-appointments';
  if (RESOURCE_LANES.has(lane)) return 'crosscut-resource-acquisition';
  if (MARKET_LANES.has(lane)) return 'crosscut-market-pilots-and-revenue';
  return null;
}

function hardDate(deadline) {
  const match = String(deadline ?? '').match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function isPastHardDeadline(deadline, asOf) {
  const date = hardDate(deadline);
  return Boolean(date && date < asOf);
}

function appearsClosed(status) {
  return /KILL|EXPIRED|CLOSED|REJECT|SUBMITTED|WITHDRAW|DONE_RETAIN|EXPIRED_PRESERVE/i.test(String(status ?? ''));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function portfolioCampaignGraph() {
  return DEFAULT_GRAPH;
}

export function campaignRouteAssignment(record, {
  graph = DEFAULT_GRAPH,
  asOf = graph.snapshot,
} = {}) {
  const scope = routeCampaignDecision(record);
  const allocation = scope.allocation;
  const lane = normalized(record.lane);
  const explicit = explicitRouteIndex(graph).get(record.id) ?? [];
  const explicitCampaignIds = explicit.map(({ campaign }) => campaign.campaign_id);
  const outcomeCampaignId = outcomeCampaign(lane);

  const evidenceCampaignIds = unique([
    SYSTEM_CAMPAIGN_BY_ASSET.get(allocation.lead_asset),
    ...(allocation.lead_projects ?? []).map((asset) => SYSTEM_CAMPAIGN_BY_ASSET.get(asset)),
    ...(allocation.support_assets ?? []).map((asset) => SYSTEM_CAMPAIGN_BY_ASSET.get(asset)),
  ]);

  let primaryCampaignId = null;
  let assignmentState = 'NEEDS_CAMPAIGN_ASSIGNMENT';
  let assignmentBasis = 'No explicit campaign or safe deterministic campaign family resolved this route.';

  if (PHD_LANES.has(lane) || EMPLOYMENT_LANES.has(lane) || RESEARCH_APPOINTMENT_LANES.has(lane)) {
    primaryCampaignId = outcomeCampaignId;
    assignmentState = explicit.length ? 'EXPLICIT_WITH_TERMINAL_OVERRIDE' : 'PROVISIONAL';
    assignmentBasis = 'Person-level route is owned by its terminal option campaign; project allocations supply evidence rather than owning the application.';
  } else if (explicit.length === 1) {
    primaryCampaignId = explicit[0].campaign.campaign_id;
    assignmentState = 'EXPLICIT';
    assignmentBasis = 'Route is explicitly attached to a campaign in the portfolio campaign graph.';
  } else if (explicit.length > 1) {
    assignmentState = 'CONFLICTING_EXPLICIT_ASSIGNMENT';
    assignmentBasis = 'The graph attaches this route to more than one campaign without an explicit primary owner.';
  } else if (scope.role === 'SHARED_RESOURCE') {
    primaryCampaignId = 'crosscut-resource-acquisition';
    assignmentState = 'PROVISIONAL';
    assignmentBasis = 'Shared entitlement is provisionally owned by resource acquisition and must later be bound to a named asset use.';
  } else if (scope.role === 'ACTIVE_BAKEOFF') {
    assignmentState = 'NEEDS_CAMPAIGN_ASSIGNMENT';
    assignmentBasis = 'Portfolio bakeoff must select a primary campaign before this route can consume a scarce slot.';
  } else if (allocation.lead_asset === 'research-papers') {
    assignmentState = 'NEEDS_CAMPAIGN_ASSIGNMENT';
    assignmentBasis = 'Research-paper routes require paper-level ownership; the generic research-papers asset is not specific enough.';
  } else if (SYSTEM_CAMPAIGN_BY_ASSET.has(allocation.lead_asset)) {
    primaryCampaignId = SYSTEM_CAMPAIGN_BY_ASSET.get(allocation.lead_asset);
    assignmentState = 'PROVISIONAL';
    assignmentBasis = 'Project-native route is provisionally attached to the selected system-asset campaign pending semantic review.';
  }

  const explicitFunction = explicit.length === 1 ? explicit[0].route.function : null;
  const routeFunction = explicitFunction ?? inferredFunction(lane);
  const flags = [];

  if (!String(record.source ?? '').trim()) flags.push('MISSING_OFFICIAL_SOURCE_URL');
  if (isPastHardDeadline(record.deadline, asOf) && !appearsClosed(record.status)) {
    flags.push('PAST_HARD_DEADLINE_WITH_ACTIVE_STATE');
  }
  if (scope.role === 'ACTIVE_BAKEOFF') flags.push('UNRESOLVED_PORTFOLIO_BAKEOFF');
  if (allocation.lead_asset === 'research-papers' && explicit.length === 0) flags.push('MISSING_PAPER_LEVEL_CAMPAIGN');
  if (!routeFunction) flags.push('NEEDS_ROUTE_FUNCTION_ASSIGNMENT');
  if (lane === 'RESEARCH' && assignmentState === 'PROVISIONAL') flags.push('ACADEMIC_OR_SYSTEM_ROUTE_REVIEW');
  if (record.id === 'tax-academy-sg-il') flags.push('STALE_ROUTE_ID_ASSET_ALIAS');
  if (record.id === 'ssi-fellowship-2027-policy-lab') flags.push('STALE_ROUTE_ID_ASSET_ALIAS');

  return {
    route_id: record.id,
    opportunity: record.opportunity ?? null,
    lane: record.lane ?? null,
    deadline: record.deadline ?? null,
    source: record.source ?? null,
    registry_status: record.status ?? null,
    execution_state: record.execution_state ?? null,
    campaign_scope_role: scope.role,
    primary_campaign_id: primaryCampaignId,
    outcome_campaign_id: outcomeCampaignId,
    evidence_campaign_ids: evidenceCampaignIds.filter((id) => id !== primaryCampaignId),
    explicit_campaign_ids: explicitCampaignIds,
    route_function: routeFunction,
    assignment_state: assignmentState,
    assignment_basis: assignmentBasis,
    data_quality_flags: flags,
    automatic_execution_allowed: false,
    execution_hold_reason: graph.operating_mode === 'ASSESS_ONLY'
      ? 'Portfolio campaign graph is in ASSESS_ONLY mode.'
      : 'Campaign assignment audit does not itself authorize execution.',
  };
}

function counts(values) {
  const result = {};
  for (const value of values) result[value ?? 'NULL'] = (result[value ?? 'NULL'] ?? 0) + 1;
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function duplicateGroups(records, keyFor) {
  const groups = new Map();
  for (const record of records) {
    const key = keyFor(record);
    if (!key) continue;
    const ids = groups.get(key) ?? [];
    ids.push(record.id);
    groups.set(key, ids);
  }
  return [...groups.entries()]
    .filter(([, routeIds]) => routeIds.length > 1)
    .map(([key, routeIds]) => ({ key, route_ids: routeIds }))
    .sort((a, b) => b.route_ids.length - a.route_ids.length || a.key.localeCompare(b.key));
}

function normalizedSource(record) {
  const source = String(record.source ?? '').trim().toLowerCase().replace(/\/$/, '');
  return source && source !== 'internal' ? source : null;
}

function normalizedOpportunity(record) {
  const value = `${record.organization ?? ''}|${record.opportunity ?? ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return value || null;
}

export function auditCampaignCoverage(records, {
  graph = DEFAULT_GRAPH,
  asOf = graph.snapshot,
} = {}) {
  const scopedRecords = records.filter((record) => routeCampaignDecision(record).included);
  const assignments = scopedRecords.map((record) => campaignRouteAssignment(record, { graph, asOf }));
  const masterIds = new Set(records.map((record) => record.id));
  const graphRouteIds = unique((graph.campaigns ?? []).flatMap((campaign) =>
    (campaign.route_instruments ?? []).map((route) => route.route_id)));
  const missingGraphRoutes = graphRouteIds.filter((id) => !masterIds.has(id));
  const duplicateMasterIds = records
    .map((record) => record.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);
  const flagRows = assignments.flatMap((row) => row.data_quality_flags.map((flag) => ({ flag, route_id: row.route_id })));
  const duplicateSourceGroups = duplicateGroups(scopedRecords, normalizedSource);
  const duplicateOpportunityGroups = duplicateGroups(scopedRecords, normalizedOpportunity);

  return {
    schema: 'blowback.portfolio_campaign_coverage_audit.v1',
    as_of: asOf,
    grain: 'One current campaign-scoped Gauntlet master route per assignment row.',
    intended_use: 'Campaign census and data-quality remediation; never execution authorization.',
    summary: {
      master_routes: records.length,
      campaign_scoped_routes: scopedRecords.length,
      graph_campaigns: graph.campaigns.length,
      graph_route_instruments: graphRouteIds.length,
      matched_explicit_route_instruments: graphRouteIds.length - missingGraphRoutes.length,
      graph_route_instruments_missing_from_master: missingGraphRoutes.length,
      duplicate_master_route_ids: duplicateMasterIds.length,
      duplicate_source_groups: duplicateSourceGroups.length,
      duplicate_opportunity_name_groups: duplicateOpportunityGroups.length,
      distinct_registry_statuses_in_scope: new Set(scopedRecords.map((record) => record.status ?? 'NULL')).size,
      assignment_states: counts(assignments.map((row) => row.assignment_state)),
      primary_campaigns: counts(assignments.map((row) => row.primary_campaign_id)),
      outcome_campaigns: counts(assignments.map((row) => row.outcome_campaign_id)),
      route_functions: counts(assignments.map((row) => row.route_function)),
      data_quality_flags: counts(flagRows.map((row) => row.flag)),
      automatic_execution_allowed: assignments.filter((row) => row.automatic_execution_allowed).length,
    },
    quality_findings: {
      missing_graph_route_ids: missingGraphRoutes,
      duplicate_master_route_ids: unique(duplicateMasterIds),
      duplicate_source_groups: duplicateSourceGroups,
      duplicate_opportunity_name_groups: duplicateOpportunityGroups,
      flagged_routes: flagRows,
    },
    assignments,
  };
}
