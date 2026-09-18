import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMasterRegistry } from './build-gauntlet-master.mjs';
import { resolvePortfolioAllocation } from '../src/allocation/portfolio.mjs';
import { portfolioCampaignScope, routeCampaignDecision } from '../src/allocation/campaign-scope.mjs';
import { allocateCalendarEvents } from '../src/allocation/calendar-project.mjs';
import { currentCycleExpired } from '../src/mission/operator.mjs';
import { buildCalendarOnboardingQueue, expandCalendarEvents, readCalendarEvents } from '../src/application/calendar-onboarding.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ACTIVE_CALENDAR = path.join(ROOT, 'calendar', 'gauntlet-consolidated-active-2026-2027.ics');
const ROLLING_CALENDAR = path.join(ROOT, 'calendar', 'gauntlet-consolidated-rolling-watch-2026-2027.ics');
const ASSET_FILE = path.join(ROOT, 'data', 'portfolio-assets.json');
const OUTPUT = path.join(ROOT, 'docs', 'portfolio-calendar-snapshot.json');

function option(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function datePart(value) {
  return String(value ?? '').match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
}

function isSuppressed(record) {
  return /KILL|REJECT|EXPIRED|DONE_RETAIN/i.test(String(record.status ?? ''));
}

function deadlineKind(value) {
  if (datePart(value)) return 'hard_date';
  if (String(value ?? '').trim()) return 'rolling_or_watch';
  return 'undated';
}

function countBy(rows, key) {
  return Object.fromEntries([...rows.reduce((map, row) => {
    const value = typeof key === 'function' ? key(row) : row[key];
    map.set(value || 'UNSPECIFIED', (map.get(value || 'UNSPECIFIED') ?? 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))));
}

const asOf = option('as-of', new Date().toISOString().slice(0, 10));
const through = option('through', '2027-12-31');
const records = buildMasterRegistry();
const assetAuthority = JSON.parse(fs.readFileSync(ASSET_FILE, 'utf8'));
const campaignAuthority = portfolioCampaignScope();
const activeRecords = records.filter((record) => !isSuppressed(record) && !currentCycleExpired(record, asOf));
const hardDeadlines = activeRecords
  .filter((record) => datePart(record.deadline))
  .sort((a, b) => datePart(a.deadline).localeCompare(datePart(b.deadline)) || a.id.localeCompare(b.id));
const rollingOrWatch = activeRecords
  .filter((record) => deadlineKind(record.deadline) !== 'hard_date')
  .sort((a, b) => String(a.deadline ?? '').localeCompare(String(b.deadline ?? '')) || a.id.localeCompare(b.id));
const expiredOrSuppressed = records
  .filter((record) => !activeRecords.includes(record))
  .sort((a, b) => String(datePart(b.deadline) ?? '').localeCompare(String(datePart(a.deadline) ?? '')) || a.id.localeCompare(b.id));

const routeRows = records.map((record) => {
  const allocation = resolvePortfolioAllocation(record);
  const campaign = routeCampaignDecision(record);
  return {
    id: record.id,
    organization: record.organization,
    opportunity: record.opportunity,
    lane: record.lane,
    route_class: record.route_class,
    status: record.status,
    execution_state: record.execution_state,
    deadline: record.deadline,
    deadline_date: datePart(record.deadline),
    deadline_kind: deadlineKind(record.deadline),
    active: activeRecords.includes(record),
    source_state: record.source_state,
    source: record.source,
    execution_manifest: record.execution_manifest,
    assets: record.assets,
    allocation_mode: allocation.mode,
    lead_asset: allocation.lead_asset,
    support_assets: allocation.support_assets,
    package_family: allocation.package_family,
    allocation_confidence: allocation.confidence,
    campaign_included: campaign.included,
    campaign_role: campaign.role,
    campaign_reason: campaign.reason,
    gate: record.gate,
  };
});

const activeRows = routeRows.filter((row) => row.active);
const activeCampaignRows = activeRows.filter((row) => row.campaign_included);
const activeLeadAssets = new Set(campaignAuthority.active_lead_assets);
const supportOnlyAssets = new Set(campaignAuthority.support_only_assets);
const deferredLeadAssets = new Set(campaignAuthority.deferred_lead_assets);
const projectAssets = assetAuthority.assets.map((asset) => ({
  ...asset,
  campaign_role: activeLeadAssets.has(asset.id)
    ? 'ACTIVE_LEAD'
    : supportOnlyAssets.has(asset.id)
      ? 'SUPPORT_ONLY'
      : deferredLeadAssets.has(asset.id)
        ? 'DEFERRED'
        : 'OUT_OF_SCOPE',
  lead_route_count: activeRows.filter((route) => route.lead_asset === asset.id).length,
  support_route_count: activeRows.filter((route) => route.support_assets?.includes(asset.id)).length,
  hard_deadline_lead_count: activeRows.filter((route) => route.lead_asset === asset.id && route.deadline_kind === 'hard_date').length,
}));

const rawEvents = [ACTIVE_CALENDAR, ROLLING_CALENDAR].flatMap((calendarPath) =>
  readCalendarEvents(calendarPath).map((event) => ({ ...event, calendar: path.basename(calendarPath) })),
);
const calendarProjectAllocations = allocateCalendarEvents(rawEvents, records);
const expandedEvents = expandCalendarEvents(rawEvents, { from: asOf, through })
  .sort((a, b) => a.start.localeCompare(b.start) || a.uid.localeCompare(b.uid));
const daySpan = Math.max(0, Math.ceil((Date.parse(`${through}T00:00:00Z`) - Date.parse(`${asOf}T00:00:00Z`)) / 86_400_000));
const onboarding = buildCalendarOnboardingQueue({ records, today: asOf, days: daySpan, limit: records.length + 100 });
const cueBindings = new Map();
for (const route of onboarding.routes) {
  for (const cue of route.calendar_cues) cueBindings.set(`${cue.uid}|${cue.start}`, route.route_id);
}
const calendarRows = expandedEvents.map((event) => {
  const routeId = cueBindings.get(`${event.uid}|${event.start}`) ?? null;
  return {
    date: event.start,
    summary: event.summary,
    description: event.description ?? null,
    uid: event.uid,
    recurrence: event.rrule ?? null,
    calendar: event.calendar,
    route_id: routeId,
    route_bound: Boolean(routeId),
  };
});

const sourceMissing = routeRows.filter((row) => !row.source).length;
const hardDeadlineMissingSource = routeRows.filter((row) => row.active && row.deadline_kind === 'hard_date' && !row.source).length;
const unboundCalendar = calendarRows.filter((row) => !row.route_bound).length;
const operatorUnboundCalendar = onboarding.unbound_calendar_cues.length;
const nonApplicationBoundCalendar = calendarRows.length - (calendarRows.length - unboundCalendar) - operatorUnboundCalendar;

const snapshot = {
  schema: 'blowback.portfolio_calendar_report_snapshot.v1',
  as_of: asOf,
  through,
  source_files: [
    'docs/gauntlet-master.json',
    'calendar/gauntlet-consolidated-active-2026-2027.ics',
    'calendar/gauntlet-consolidated-rolling-watch-2026-2027.ics',
    'data/portfolio-assets.json',
    'data/portfolio-route-allocation-2026-09-01.json',
    'data/portfolio-campaign-scope-2026-09-12.json',
    'data/applicant-document-readiness-2026-09-12.json',
  ],
  metrics: {
    master_routes: records.length,
    unique_route_ids: new Set(records.map((record) => record.id)).size,
    active_routes: activeRows.length,
    active_campaign_routes: activeCampaignRows.length,
    active_campaign_lead_assets: campaignAuthority.active_lead_assets.length,
    active_hard_deadlines: hardDeadlines.length,
    active_rolling_or_watch: rollingOrWatch.length,
    expired_or_suppressed_routes: expiredOrSuppressed.length,
    project_assets: projectAssets.length,
    executable_manifests: activeRows.filter((row) => row.execution_manifest).length,
    packet_or_application_ready: activeRows.filter((row) => /PACKET_READY|APPLICATION_READY|OUTREACH_READY|PORTAL_MAPPED|PREPARE_VERIFIED|HUMAN_SUBMIT_READY/.test(row.execution_state)).length,
    calendar_source_events: rawEvents.length,
    calendar_events_with_selected_lead: calendarProjectAllocations.filter((row) => row.recommended_lead_asset).length,
    calendar_portfolio_operations: calendarProjectAllocations.filter((row) => row.decision === 'BATCH_BY_ROUTE').length,
    calendar_inherited_stages: calendarProjectAllocations.filter((row) => row.decision === 'INHERIT_PARENT_ENTRY').length,
    calendar_entries_needing_route_binding: calendarProjectAllocations.filter((row) => row.decision === 'RESEARCH_OR_BIND_ROUTE_FIRST').length,
    calendar_selected_leads_missing_route: calendarProjectAllocations.filter((row) => row.recommended_lead_asset && !row.route_id).length,
    calendar_expanded_events: calendarRows.length,
    calendar_application_bound_events: calendarRows.length - unboundCalendar,
    calendar_operator_unbound_events: operatorUnboundCalendar,
    calendar_non_application_bound_events: nonApplicationBoundCalendar,
    calendar_not_application_bound_events: unboundCalendar,
    source_missing_routes: sourceMissing,
    active_hard_deadline_missing_source: hardDeadlineMissingSource,
  },
  distributions: {
    active_by_lane: countBy(activeRows, 'lane'),
    active_by_status: countBy(activeRows, 'status'),
    active_by_execution_state: countBy(activeRows, 'execution_state'),
    active_campaign_by_lead_asset: countBy(activeCampaignRows, 'lead_asset'),
    active_campaign_by_role: countBy(activeCampaignRows, 'campaign_role'),
    calendar_selected_leads: countBy(calendarProjectAllocations.filter((row) => row.recommended_lead_asset), 'recommended_lead_asset'),
    calendar_relative_win_bands: countBy(calendarProjectAllocations, 'relative_win_band'),
    calendar_submission_readiness: countBy(calendarProjectAllocations, (row) => row.submission_readiness?.readiness),
    active_deadlines_by_month: countBy(hardDeadlines, (row) => datePart(row.deadline).slice(0, 7)),
    assets_by_implementation_stage: countBy(projectAssets, 'implementation_stage'),
    assets_by_external_evidence_stage: countBy(projectAssets, 'external_evidence_stage'),
    assets_by_canonicalization_state: countBy(projectAssets, 'canonicalization_state'),
  },
  hard_deadlines: hardDeadlines.map((record) => routeRows.find((row) => row.id === record.id)),
  rolling_or_watch: rollingOrWatch.map((record) => routeRows.find((row) => row.id === record.id)),
  expired_or_suppressed: expiredOrSuppressed.map((record) => routeRows.find((row) => row.id === record.id)),
  routes: routeRows,
  campaign_routes: activeCampaignRows,
  calendar_events: calendarRows,
  calendar_project_allocations: calendarProjectAllocations,
  assets: projectAssets,
  quality_findings: [
    {
      severity: calendarProjectAllocations.some((row) => row.recommended_lead_asset && !row.route_id) ? 'high' : 'none',
      finding: 'Calendar project decisions without a canonical route binding',
      evidence: `${calendarProjectAllocations.filter((row) => row.recommended_lead_asset && !row.route_id).length} source events have a selected lead asset but no exact canonical route; ${calendarProjectAllocations.filter((row) => row.decision === 'RESEARCH_OR_BIND_ROUTE_FIRST').length} event remains unallocated pending route research.`,
      risk: 'A sensible project choice still cannot produce a checkpointed browser mission until the event resolves to a canonical route.',
      remediation: 'Hydrate or bind the III, Energy Taiwan and E2 entries before treating them as executable work.',
    },
    {
      severity: unboundCalendar ? 'high' : 'none',
      finding: 'Most calendar events are not exposed as application-bound operator work',
      evidence: `${calendarRows.length - unboundCalendar} of ${calendarRows.length} expanded events are linked to application routes; the onboarding operator reports ${operatorUnboundCalendar} explicitly unbound cues and omits ${nonApplicationBoundCalendar} cues associated with non-application routes from its route queue.`,
      risk: 'The calendar can remind the user about work but cannot reliably drive mission generation or checkpoints for most cues.',
      remediation: 'Generate explicit route_id metadata for every cue and expose separate application, submission, development, partner and watch queues; enforce binding and visibility tests.',
    },
    {
      severity: hardDeadlineMissingSource ? 'high' : 'none',
      finding: 'Active hard deadlines without an official source URL',
      evidence: `${hardDeadlineMissingSource} active hard-date routes have no source URL.`,
      risk: 'Deadline or eligibility details cannot be reverified before execution.',
      remediation: 'Require an official source before a hard-date route can enter FIRE or PREPARE.',
    },
    {
      severity: sourceMissing ? 'medium' : 'none',
      finding: 'Registry routes without source URLs',
      evidence: `${sourceMissing} of ${records.length} master routes have no source URL.`,
      risk: 'These are useful research leads but should not be presented as verified application targets.',
      remediation: 'Keep them in RESEARCH_ONLY/REVERIFY until radar hydrates an official source.',
    },
    {
      severity: 'medium',
      finding: 'Calendar and asset authorities have different freshness dates',
      evidence: 'Consolidated calendar cutoff is 2026-09-01; master and expanded radar were rebuilt through 2026-09-12; asset maturity is primarily audited through 2026-09-01.',
      risk: 'A calendar entry or maturity label can lag the current route registry.',
      remediation: 'Regenerate calendars from the current master and rerun asset audits after canonical project revisions change.',
    },
  ],
};

const source = (label, files, grain) => ({
  label,
  files,
  grain,
  metricDefinitions: [],
});
const reportSnapshot = {
  title: `${snapshot.metrics.active_campaign_lead_assets} selected portfolio families now drive ${snapshot.metrics.active_campaign_routes} active routes`,
  status: 'reviewed',
  generatedAt: new Date().toISOString(),
  filters: [],
  report: {
    asOf,
    originalQuestion: 'Show the whole opportunity calendar and every portfolio project that can be used for entries.',
  },
  analysis: {
    schema: snapshot.schema,
    through,
    source_files: snapshot.source_files,
    metrics: snapshot.metrics,
    distributions: snapshot.distributions,
  },
  queries: {
    summary: {
      label: 'Portfolio calendar summary',
      rows: [snapshot.metrics],
      source: source('Generated Gauntlet master, calendars and asset authority', snapshot.source_files, 'One reviewed portfolio snapshot'),
    },
    hard_deadlines: {
      label: 'Active hard-deadline routes',
      reportingField: 'deadline_date',
      rows: snapshot.hard_deadlines,
      source: source('Gauntlet master', ['docs/gauntlet-master.json'], 'One canonical route per row'),
    },
    rolling_or_watch: {
      label: 'Active rolling, recurring, watch and undated routes',
      rows: snapshot.rolling_or_watch,
      source: source('Gauntlet master', ['docs/gauntlet-master.json'], 'One canonical route per row'),
    },
    routes: {
      label: 'Complete canonical route inventory',
      rows: snapshot.routes,
      source: source('Gauntlet master with allocation resolution', ['docs/gauntlet-master.json', 'data/portfolio-route-allocation-2026-09-01.json'], 'One canonical route per row'),
    },
    campaign_routes: {
      label: 'Active routes in the selected portfolio campaign',
      rows: snapshot.campaign_routes,
      source: source('Gauntlet master with campaign-scope authority', ['docs/gauntlet-master.json', 'data/portfolio-campaign-scope-2026-09-12.json'], 'One active in-scope route per row'),
    },
    calendar_events: {
      label: 'Expanded active and rolling calendar cues',
      reportingField: 'date',
      rows: snapshot.calendar_events,
      source: source('Consolidated Gauntlet calendars', ['calendar/gauntlet-consolidated-active-2026-2027.ics', 'calendar/gauntlet-consolidated-rolling-watch-2026-2027.ics'], 'One expanded calendar occurrence per row'),
    },
    calendar_project_allocations: {
      label: 'Recommended project lead for every source calendar event',
      reportingField: 'date',
      rows: snapshot.calendar_project_allocations,
      source: source('Calendar-to-project allocation and execution-readiness analysis', ['calendar/gauntlet-consolidated-active-2026-2027.ics', 'calendar/gauntlet-consolidated-rolling-watch-2026-2027.ics', 'data/portfolio-assets.json', 'data/portfolio-route-allocation-2026-09-01.json', 'data/applicant-document-readiness-2026-09-12.json'], 'One source VEVENT definition per row; recurrence rules are not expanded'),
    },
    assets: {
      label: 'Portfolio assets and maturity authority',
      rows: snapshot.assets,
      source: source('Portfolio asset maturity and route allocation authorities', ['data/portfolio-assets.json', 'data/portfolio-route-allocation-2026-09-01.json'], 'One governed portfolio asset per row'),
    },
    quality_findings: {
      label: 'Calendar and registry data-quality findings',
      rows: snapshot.quality_findings,
      source: source('Calculated consistency checks', snapshot.source_files, 'One material quality finding per row'),
    },
    expired_or_suppressed: {
      label: 'Expired, killed and suppressed routes retained for provenance',
      rows: snapshot.expired_or_suppressed,
      source: source('Gauntlet master', ['docs/gauntlet-master.json'], 'One canonical route per row'),
    },
  },
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(reportSnapshot, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(snapshot.metrics, null, 2)}\n`);
