import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DEFAULTS = {
  longtail: path.join(ROOT, 'docs/longtail/longtail-campaigns.csv'),
  postgrad: path.join(ROOT, 'docs/postgrad/postgrad-market.csv'),
  supplement: path.join(ROOT, 'data/gauntlet-master-supplement.json'),
  facultyPulls: path.join(ROOT, 'data/faculty-pull-routes.json'),
  threadRecovered: path.join(ROOT, 'data/thread-recovered-routes-2026-09-01.json'),
  deepRadar: path.join(ROOT, 'data/deep-opportunity-radar-2026-09-01.json'),
  infrastructureRadar: path.join(ROOT, 'data/student-research-infrastructure-radar-2026-09-01.json'),
  outputCsv: path.join(ROOT, 'docs/gauntlet-master.csv'),
  outputJson: path.join(ROOT, 'docs/gauntlet-master.json'),
};

export const MASTER_COLUMNS = [
  'id',
  'lane',
  'organization',
  'opportunity',
  'route_class',
  'assets',
  'contribution_view',
  'status',
  'execution_state',
  'deadline',
  'gate',
  'shared_evidence_family',
  'mutual_exclusion_group',
  'parent_route',
  'source_state',
  'source',
  'origin',
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }

  if (field !== '' || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])));
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(records) {
  return [
    MASTER_COLUMNS.join(','),
    ...records.map((record) => MASTER_COLUMNS.map((column) => csvEscape(record[column] ?? '')).join(',')),
  ].join('\n') + '\n';
}

function normalizeLongtail(row) {
  return {
    id: row.id,
    lane: row.mode === 'CAREER' ? 'CAREER' : row.mode,
    organization: row.parent,
    opportunity: row.track || row.parent,
    route_class: row.mode,
    assets: row.asset,
    contribution_view: '',
    status: row.status,
    execution_state: 'RESEARCH_ONLY',
    deadline: row.deadline,
    gate: row.gate,
    shared_evidence_family: '',
    mutual_exclusion_group: '',
    parent_route: '',
    source_state: 'CURRENT_LONGTAIL_BOARD',
    source: row.source,
    origin: 'docs/longtail/longtail-campaigns.csv',
  };
}

function normalizePostgrad(row) {
  return {
    id: row.id,
    lane: row.lane,
    organization: row.organization,
    opportunity: row.opportunity,
    route_class: row.lane,
    assets: row.lead_assets,
    contribution_view: '',
    status: row.status,
    execution_state: 'RESEARCH_ONLY',
    deadline: row.deadline_or_cadence,
    gate: row.blocking_unknown,
    shared_evidence_family: '',
    mutual_exclusion_group: '',
    parent_route: '',
    source_state: row.compensation_evidence || 'CURRENT_POSTGRAD_BOARD',
    source: row.source_url,
    origin: 'docs/postgrad/postgrad-market.csv',
  };
}

function normalizeSupplement(row) {
  return Object.fromEntries(MASTER_COLUMNS.map((column) => [column, row[column] ?? '']));
}

function applyOverride(record, override) {
  const { id: _id, reason, ...patch } = override;
  const updated = { ...record, ...patch };
  if (reason) {
    const marker = `master override: ${reason}`;
    updated.origin = updated.origin ? `${updated.origin} | ${marker}` : marker;
  }
  return updated;
}

function addSupplementRoutes(records, rows, sourceLabel) {
  for (const row of rows ?? []) {
    const record = normalizeSupplement(row);
    if (!record.id) throw new Error(`${sourceLabel} route missing id`);
    if (records.has(record.id)) throw new Error(`${sourceLabel} route collides with current source id: ${record.id}`);
    records.set(record.id, record);
  }
}

function applyOverrides(records, overrides, sourceLabel) {
  for (const override of overrides ?? []) {
    if (!records.has(override.id)) throw new Error(`${sourceLabel} override target not found: ${override.id}`);
    records.set(override.id, applyOverride(records.get(override.id), override));
  }
}

export function buildMasterRegistry({
  longtailPath = DEFAULTS.longtail,
  postgradPath = DEFAULTS.postgrad,
  supplementPath = DEFAULTS.supplement,
  facultyPullsPath = DEFAULTS.facultyPulls,
  threadRecoveredPath = DEFAULTS.threadRecovered,
  deepRadarPath = DEFAULTS.deepRadar,
  infrastructureRadarPath = DEFAULTS.infrastructureRadar,
} = {}) {
  const longtail = parseCsv(fs.readFileSync(longtailPath, 'utf8')).map(normalizeLongtail);
  const postgrad = parseCsv(fs.readFileSync(postgradPath, 'utf8')).map(normalizePostgrad);
  const supplement = JSON.parse(fs.readFileSync(supplementPath, 'utf8'));
  const facultyPulls = JSON.parse(fs.readFileSync(facultyPullsPath, 'utf8'));
  const threadRecovered = JSON.parse(fs.readFileSync(threadRecoveredPath, 'utf8'));
  const deepRadar = JSON.parse(fs.readFileSync(deepRadarPath, 'utf8'));
  const infrastructureRadar = JSON.parse(fs.readFileSync(infrastructureRadarPath, 'utf8'));

  const records = new Map();
  for (const record of [...longtail, ...postgrad]) {
    if (records.has(record.id)) throw new Error(`duplicate source route id: ${record.id}`);
    records.set(record.id, record);
  }

  addSupplementRoutes(records, facultyPulls.routes, 'faculty-pull');
  addSupplementRoutes(records, supplement.restored_routes, 'restored');
  applyOverrides(records, supplement.overrides, 'supplement');

  // Conversation/thread recovery is continuity evidence, not live verification.
  // It is loaded before the verified deep-radar layers so a later official audit
  // can explicitly override a recovered state without conversation memory being
  // treated as semantic authority.
  addSupplementRoutes(records, threadRecovered.routes, 'thread-recovered');
  applyOverrides(records, threadRecovered.overrides, 'thread-recovered');

  // Deep research layers are applied after the older boards so verified new routes
  // and evidence-backed corrections can supersede stale generic rows without
  // duplicating IDs. Later focused audits may override earlier broad audits.
  addSupplementRoutes(records, deepRadar.routes, 'deep-radar');
  applyOverrides(records, deepRadar.overrides, 'deep-radar');
  addSupplementRoutes(records, infrastructureRadar.routes, 'student-research-infrastructure-radar');
  applyOverrides(records, infrastructureRadar.overrides, 'student-research-infrastructure-radar');

  const output = [...records.values()];
  const ids = new Set(output.map((record) => record.id));
  if (ids.size !== output.length) throw new Error('master registry contains duplicate ids');
  return output;
}

export function summarizeMasterRegistry(records) {
  const countBy = (key) => Object.fromEntries(
    [...records.reduce((map, record) => map.set(record[key] || 'UNSPECIFIED', (map.get(record[key] || 'UNSPECIFIED') ?? 0) + 1), new Map()).entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );

  return {
    total: records.length,
    lanes: countBy('lane'),
    route_classes: countBy('route_class'),
    statuses: countBy('status'),
    execution_states: countBy('execution_state'),
  };
}

export function writeMasterRegistry(options = {}) {
  const records = buildMasterRegistry(options);
  const outputCsv = options.outputCsv ?? DEFAULTS.outputCsv;
  const outputJson = options.outputJson ?? DEFAULTS.outputJson;
  const payload = {
    schema: 'blowback.gauntlet_master.v1',
    source_snapshot: '2026-09-01',
    summary: summarizeMasterRegistry(records),
    records,
  };
  fs.writeFileSync(outputCsv, toCsv(records));
  fs.writeFileSync(outputJson, JSON.stringify(payload, null, 2) + '\n');
  return payload;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = writeMasterRegistry();
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
}
