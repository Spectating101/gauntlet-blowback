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
  nocturnalRadar: path.join(ROOT, 'data/nocturnal-conversion-radar-2026-09-01.json'),
  infrastructureRadar: path.join(ROOT, 'data/student-research-infrastructure-radar-2026-09-01.json'),
  researchResourceRadar: path.join(ROOT, 'data/research-resource-radar-2026-09-04.json'),
  fireExecutionRoutes: path.join(ROOT, 'data/fire-execution-routes-2026-09-05.json'),
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
  'execution_manifest',
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
    execution_manifest: '',
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
    execution_manifest: '',
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

function addThreadRecoveredRoutes(records, rows) {
  const skippedExisting = [];
  for (const row of rows ?? []) {
    const record = normalizeSupplement(row);
    if (!record.id) throw new Error('thread-recovered route missing id');
    if (records.has(record.id)) {
      skippedExisting.push(record.id);
      continue;
    }
    records.set(record.id, record);
  }
  return skippedExisting;
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
  nocturnalRadarPath = DEFAULTS.nocturnalRadar,
  infrastructureRadarPath = DEFAULTS.infrastructureRadar,
  researchResourceRadarPath = DEFAULTS.researchResourceRadar,
  fireExecutionRoutesPath = DEFAULTS.fireExecutionRoutes,
} = {}) {
  const longtail = parseCsv(fs.readFileSync(longtailPath, 'utf8')).map(normalizeLongtail);
  const postgrad = parseCsv(fs.readFileSync(postgradPath, 'utf8')).map(normalizePostgrad);
  const supplement = JSON.parse(fs.readFileSync(supplementPath, 'utf8'));
  const facultyPulls = JSON.parse(fs.readFileSync(facultyPullsPath, 'utf8'));
  const threadRecovered = JSON.parse(fs.readFileSync(threadRecoveredPath, 'utf8'));
  const deepRadar = JSON.parse(fs.readFileSync(deepRadarPath, 'utf8'));
  const nocturnalRadar = JSON.parse(fs.readFileSync(nocturnalRadarPath, 'utf8'));
  const infrastructureRadar = JSON.parse(fs.readFileSync(infrastructureRadarPath, 'utf8'));
  const researchResourceRadar = JSON.parse(fs.readFileSync(researchResourceRadarPath, 'utf8'));
  const fireExecutionRoutes = JSON.parse(fs.readFileSync(fireExecutionRoutesPath, 'utf8'));

  const records = new Map();
  for (const record of [...longtail, ...postgrad]) {
    if (records.has(record.id)) throw new Error(`duplicate source route id: ${record.id}`);
    records.set(record.id, record);
  }

  addSupplementRoutes(records, facultyPulls.routes, 'faculty-pull');
  addSupplementRoutes(records, supplement.restored_routes, 'restored');
  applyOverrides(records, supplement.overrides, 'supplement');

  // Conversation/thread recovery is continuity evidence, not live verification.
  // An existing canonical route always wins; thread recovery only fills gaps.
  // This is intentionally more permissive than every live/verified source layer.
  addThreadRecoveredRoutes(records, threadRecovered.routes);

  // Broad deep research restores verified market routes and supersedes stale generic rows.
  addSupplementRoutes(records, deepRadar.routes, 'deep-radar');
  applyOverrides(records, deepRadar.overrides, 'deep-radar');

  // Focused project audits load after broad/thread discovery so newer, more specific
  // route/gate/economics evidence can refine existing IDs without creating duplicates.
  addSupplementRoutes(records, nocturnalRadar.routes, 'nocturnal-conversion-radar');
  applyOverrides(records, nocturnalRadar.overrides, 'nocturnal-conversion-radar');

  // Resource/credit audits are independent economic objects and load after broad
  // project sources so their verified claim/PI semantics remain authoritative.
  addSupplementRoutes(records, infrastructureRadar.routes, 'student-research-infrastructure-radar');
  applyOverrides(records, infrastructureRadar.overrides, 'student-research-infrastructure-radar');

  // The Sep-4 research/resource tranche is the newest program-mechanics and packaging
  // audit. It loads after older opportunity sources so explicit eligibility, applicant-authority
  // and evidence gates supersede optimistic historical rows without deleting provenance.
  addSupplementRoutes(records, researchResourceRadar.routes, 'research-resource-radar');
  applyOverrides(records, researchResourceRadar.overrides, 'research-resource-radar');

  // FIRE execution mapping is intentionally separate from opportunity truth. It only
  // attaches a vetted local manifest to routes whose application copy is already ready.
  applyOverrides(records, fireExecutionRoutes.overrides, 'fire-execution-routes');

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
    source_snapshot: '2026-09-05',
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
