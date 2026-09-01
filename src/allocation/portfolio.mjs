import fs from 'node:fs';

const policy = JSON.parse(fs.readFileSync(new URL('../../data/portfolio-route-allocation-2026-09-01.json', import.meta.url), 'utf8'));

const APPLICATION_LANES = new Set([
  'JOB', 'RESEARCH_JOB', 'RESEARCH_LAB', 'PREDOC', 'RESEARCH_FELLOWSHIP', 'POLICY_FELLOWSHIP',
  'RESEARCH_RESIDENCY', 'FUNDED_VISITING_RESEARCH', 'RESEARCH_CAREER_PROGRAM', 'PHD', 'PHD_FACULTY',
  'CAREER', 'FELLOWSHIP', 'STUDENT_INFRASTRUCTURE', 'RESEARCH_ACCESS', 'RESEARCH_CREDIT', 'OFFSET'
]);

const APPLICATION_ROUTE_CLASSES = new Set([
  'JOB', 'LAB_STAFF', 'RESEARCH_ENGINEER', 'PREDOC', 'RESEARCH_FELLOWSHIP', 'RESEARCH_RESIDENCY',
  'POLICY_FELLOWSHIP', 'FUNDED_VISITING_PROGRAM', 'FACULTY_PULL', 'RESEARCH_ENGINEERING_PROGRAM', 'PHD',
  'STUDENT_BENEFIT', 'INSTITUTIONAL_ENTITLEMENT', 'RESEARCH_CREDIT', 'PI_SPONSORED_CREDIT',
  'RESEARCH_PREVIEW', 'PI_SPONSORED_ACCESS', 'OFFSET'
]);

const SUPPORT_ONLY = new Set(policy.support_only_assets ?? []);

const ALIASES = new Map([
  ['hardware splicer', 'hardware-splicer'],
  ['hardware-splicer', 'hardware-splicer'],
  ['cite', 'cite-agent'],
  ['cite-agent', 'cite-agent'],
  ['research drive', 'research-drive'],
  ['yzu', 'research-drive'],
  ['policy lab', 'policy-lab'],
  ['cl-eci', 'policy-lab'],
  ['eci', 'policy-lab'],
  ['cl', 'policy-lab'],
  ['nocturnal', 'nocturnal-oversight'],
  ['nocturnal oversight', 'nocturnal-oversight'],
  ['public-good', 'public-good-control'],
  ['public good', 'public-good-control'],
  ['public-good control', 'public-good-control'],
  ['refinery', 'refinery-commons'],
  ['commons', 'refinery-commons'],
  ['refinery / commons', 'refinery-commons'],
  ['sharpe', 'sharpe-terminus'],
  ['sharpe terminus', 'sharpe-terminus'],
  ['research papers', 'research-papers'],
  ['research paper', 'research-papers'],
  ['citation engine', 'citation-engine'],
  ['citation-engine', 'citation-engine'],
  ['blowback', 'gauntlet-blowback'],
  ['gauntlet', 'gauntlet-blowback'],
  ['gauntlet/blowback', 'gauntlet-blowback'],
  ['geomap', 'geomap-arbitrage'],
  ['geomap arbitrage', 'geomap-arbitrage']
]);

const DEFAULT_PACKAGE_BY_ASSET = {
  'hardware-splicer': 'hardware-splicer-physical-agents',
  'cite-agent': 'cite-reliable-research-ai',
  'research-drive': 'research-drive-research-infrastructure',
  'nocturnal-oversight': 'nocturnal-information-integrity',
  'policy-lab': 'policy-lab-fintech-assurance',
  'refinery-commons': 'refinery-research-software',
  'sharpe-terminus': 'sharpe-quant-research',
  'public-good-control': 'public-good-control',
  'geomap-arbitrage': 'geomap-procurement',
  'research-papers': 'finance-research-paper'
};

function normalized(value = '') {
  return String(value).trim().toUpperCase();
}

export function isApplicationLike(record = {}) {
  return APPLICATION_LANES.has(normalized(record.lane)) || APPLICATION_ROUTE_CLASSES.has(normalized(record.route_class));
}

export function canonicalAsset(value = '') {
  const key = String(value).trim().toLowerCase();
  return ALIASES.get(key) ?? null;
}

export function routeAssets(record = {}) {
  const raw = String(record.assets ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  const canonical = [];
  for (const item of raw) {
    const resolved = canonicalAsset(item);
    if (resolved && !canonical.includes(resolved)) canonical.push(resolved);
  }
  return canonical;
}

function routeText(record = {}) {
  return [
    record.id,
    record.lane,
    record.route_class,
    record.organization,
    record.opportunity,
    record.assets,
    record.contribution_view,
    record.shared_evidence_family,
    record.gate
  ].filter(Boolean).join(' ');
}

function withDefaults(allocation, record) {
  const lead = allocation.lead_asset ?? null;
  const support = [...new Set(allocation.support_assets ?? [])].filter((asset) => asset !== lead);
  const leadProjects = [...new Set(allocation.lead_projects ?? (lead && lead !== 'PERSON' ? [lead] : []))];
  const packageFamily = allocation.package_family === 'asset-default'
    ? (DEFAULT_PACKAGE_BY_ASSET[lead] ?? 'person-portfolio')
    : (allocation.package_family ?? DEFAULT_PACKAGE_BY_ASSET[lead] ?? 'person-portfolio');
  return {
    schema: 'blowback.portfolio_allocation.v1',
    route_id: record.id ?? null,
    mode: allocation.mode,
    lead_asset: lead,
    lead_projects: leadProjects,
    support_assets: support,
    package_family: packageFamily,
    scarce_slot_group: allocation.scarce_slot_group ?? record.mutual_exclusion_group ?? null,
    confidence: allocation.confidence ?? 'MEDIUM',
    reason: allocation.reason ?? '',
    package: policy.packages?.[packageFamily] ?? null,
    allocation_clear: !['PORTFOLIO_BAKEOFF', 'DO_NOT_CONSUME', 'SUPPORT_ONLY', 'UNALLOCATED_REVIEW'].includes(allocation.mode)
  };
}

function exactAllocation(record) {
  const exact = policy.exact_allocations?.[record.id];
  return exact ? withDefaults(exact, record) : null;
}

function ruleMatches(rule, record, assets) {
  if (rule.application_only && !isApplicationLike(record)) return false;
  if (rule.lane_regex && !(new RegExp(rule.lane_regex, 'i')).test(String(record.lane ?? ''))) return false;
  if (rule.text_regex && !(new RegExp(rule.text_regex, 'i')).test(routeText(record))) return false;
  if (rule.single_project_only && assets.filter((asset) => !SUPPORT_ONLY.has(asset)).length !== 1) return false;
  return true;
}

export function resolvePortfolioAllocation(record = {}) {
  if (!record?.id) {
    return withDefaults({
      mode: 'UNALLOCATED_REVIEW',
      lead_asset: null,
      support_assets: [],
      package_family: 'person-portfolio',
      confidence: 'LOW',
      reason: 'Route id is missing.'
    }, record);
  }

  const exact = exactAllocation(record);
  if (exact) return exact;

  const assets = routeAssets(record);
  const leadCapable = assets.filter((asset) => !SUPPORT_ONLY.has(asset));
  const supportOnlyNamed = assets.filter((asset) => SUPPORT_ONLY.has(asset));

  if (leadCapable.length === 0 && supportOnlyNamed.length > 0) {
    return withDefaults({
      mode: 'SUPPORT_ONLY',
      lead_asset: null,
      support_assets: supportOnlyNamed,
      package_family: 'person-portfolio',
      confidence: 'HIGH',
      reason: 'The route names only support-layer assets. Portfolio policy forbids Citation Engine or Gauntlet/Blowback from consuming a standalone project slot.'
    }, record);
  }

  for (const rule of policy.pattern_rules ?? []) {
    if (!ruleMatches(rule, record, assets)) continue;
    const allocation = { ...rule };
    delete allocation.id;
    delete allocation.lane_regex;
    delete allocation.text_regex;
    delete allocation.application_only;
    delete allocation.single_project_only;

    if (rule.single_project_only) {
      allocation.lead_asset = leadCapable[0];
      allocation.support_assets = [...supportOnlyNamed];
    } else if (allocation.mode === 'PERSON_BUNDLE' && allocation.lead_asset === 'PERSON') {
      allocation.support_assets = [...new Set([...(allocation.support_assets ?? []), ...assets])];
    }
    return withDefaults(allocation, record);
  }

  return withDefaults({
    mode: leadCapable.length > 1 ? 'PORTFOLIO_BAKEOFF' : 'UNALLOCATED_REVIEW',
    lead_asset: leadCapable[0] ?? null,
    support_assets: [...leadCapable.slice(1), ...supportOnlyNamed],
    package_family: leadCapable[0] ? 'asset-default' : 'person-portfolio',
    confidence: 'LOW',
    reason: 'No exact or domain rule resolved route ownership.'
  }, record);
}

export function allocationAllowsAutonomousFinalSubmit(record = {}) {
  const allocation = resolvePortfolioAllocation(record);
  return allocation.allocation_clear && allocation.confidence !== 'LOW';
}

export function portfolioAllocationPolicy() {
  return policy;
}
