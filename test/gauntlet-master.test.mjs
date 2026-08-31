import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasterRegistry, summarizeMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('master registry is materially larger than either source board', () => {
  assert.ok(records.length > 160, `expected >160 routes after deep-radar integration, got ${records.length}`);
  assert.equal(new Set(records.map((record) => record.id)).size, records.length);
});

test('restores cross-thread flagship routes', () => {
  for (const id of [
    'gaf-2026-policy-lab',
    'fc27-cl-eci',
    'ftsid-2026-cl-eci',
    'shih-hsin-finance-2026-il',
    'innoserve-2026-policy-lab-ip',
    'twnic-community-grant-2026-nocturnal',
    'msr-2027-technical-refinery',
    'taia-2026-hardware-splicer',
    'phd-tudelft-decentralized-trustworthy-ai',
    'job-dutch-rse-family',
  ]) assert.ok(byId.has(id), `missing restored route ${id}`);
});

test('includes verified live faculty-pull routes without inventing funding', () => {
  const route = byId.get('faculty-nthu-shan-hung-wu-ai-2026');
  assert.ok(route, 'missing Shan-Hung Wu faculty-pull route');
  assert.equal(route.route_class, 'FACULTY_PULL');
  assert.equal(route.status, 'FIRE_NOW');
  assert.equal(route.execution_state, 'OUTREACH_READY');
  assert.match(route.source_state, /RECRUITING_VERIFIED/);
  assert.match(route.source_state, /FUNDING_UNKNOWN/);
  assert.match(route.gate, /stipend\/RA compensation is not stated/i);
});

test('integrates deep-researched research-labor routes as first-class master records', () => {
  for (const id of [
    'lab-sinica-ku-nlp-ra-2026',
    'lab-sinica-aiiu-embodied-ai-ra-2026',
    'job-hku-ai-engineer-mcp-ra2-2026',
    'predoc-mit-futuretech-ai-econ-2026',
    'lab-aist-eart-ra-2026',
    'job-astar-embodied-ai-research-engineer-2026',
  ]) assert.ok(byId.has(id), `missing deep-researched labor route ${id}`);

  assert.equal(byId.get('lab-sinica-ku-nlp-ra-2026').route_class, 'LAB_STAFF');
  assert.equal(byId.get('job-hku-ai-engineer-mcp-ra2-2026').route_class, 'RESEARCH_ENGINEER');
  assert.equal(byId.get('predoc-mit-futuretech-ai-econ-2026').route_class, 'PREDOC');
  assert.equal(byId.get('lab-aist-eart-ra-2026').deadline, 'ROLLING');
});

test('integrates fellowships and residencies without flattening their economics', () => {
  for (const id of [
    'residency-mats-winter-2027',
    'residency-mats-2027',
    'fellowship-era-ai-winter-2027',
    'fellowship-astra-2027',
    'fellowship-tech-policy-press-2027',
    'fellowship-anthropic-fellows-2026',
  ]) assert.ok(byId.has(id), `missing fellowship/residency route ${id}`);

  assert.equal(byId.get('residency-mats-2027').route_class, 'RESEARCH_RESIDENCY');
  assert.equal(byId.get('fellowship-tech-policy-press-2027').status, 'SELECTIVE_FIRE');
  assert.equal(byId.get('fellowship-anthropic-fellows-2026').status, 'VERIFY');
});

test('focused Nocturnal audit turns external-pilot evidence into a first-class campaign', () => {
  for (const id of [
    'partner-doublethink-nocturnal-pilot',
    'partner-tfc-nocturnal-pilot',
    'partner-ocf-nocturnal-pilot',
  ]) {
    const route = byId.get(id);
    assert.ok(route, `missing Nocturnal pilot route ${id}`);
    assert.equal(route.route_class, 'PILOT');
    assert.equal(route.status, 'PARTNER_NOW');
    assert.equal(route.execution_state, 'OUTREACH_READY');
    assert.equal(route.mutual_exclusion_group, 'nocturnal-first-serious-pilot');
    assert.match(route.gate, /no funding is implied|not a grant|not a guaranteed funding/i);
  }
});

test('focused Nocturnal audit upgrades ICRP, TWNIC and NLnet gate semantics', () => {
  const otf = byId.get('otf-nocturnal');
  assert.equal(otf.status, 'FIRE_IF_GATES_CLEAR');
  assert.equal(otf.deadline, '2026-09-07T23:59:00+00:00');
  assert.match(otf.gate, /full-time/i);
  assert.match(otf.gate, /host is not required at Stage 1/i);
  assert.match(otf.gate, /surveillance software\/hardware/i);

  const twnic = byId.get('twnic-community-grant-2026-nocturnal');
  assert.equal(twnic.status, 'HOST_PORTFOLIO_BAKEOFF_REQUIRED');
  assert.equal(twnic.mutual_exclusion_group, 'twnic-one-proposal-per-host-2026');
  assert.match(twnic.gate, /one proposal/i);
  assert.match(twnic.gate, /NT\$1\.5M/i);

  const nlnet = byId.get('nlnet-restack-nocturnal');
  assert.equal(nlnet.status, 'MANDATORY_PORTFOLIO_BAKEOFF');
  assert.equal(nlnet.mutual_exclusion_group, 'nlnet-first-grant-portfolio-2026');
  assert.match(nlnet.gate, /€5k-50k/);
  assert.match(nlnet.gate, /libre\/open/i);
  assert.match(nlnet.gate, /focus/i);
});

test('focused Nocturnal audit adds pilot-gated publication routes', () => {
  const icwsm = byId.get('icwsm-2027-demo-nocturnal');
  const websci = byId.get('websci-2027-nocturnal');
  assert.ok(icwsm);
  assert.ok(websci);
  assert.equal(icwsm.status, 'PREP_AFTER_PILOT');
  assert.equal(websci.status, 'PILOT_GATED_PREP');
  assert.equal(icwsm.mutual_exclusion_group, 'nocturnal-active-research-publication');
  assert.equal(websci.mutual_exclusion_group, 'nocturnal-active-research-publication');
  assert.match(icwsm.gate, /pilot/i);
  assert.match(websci.gate, /pilot/i);
});

test('focused Nocturnal audit preserves partner and journalism dependencies', () => {
  const moda = byId.get('moda-ai-ecosystem-2026-nocturnal');
  assert.equal(moda.status, 'PARTNER_ONLY_KILL_IF_FORCED');
  assert.match(moda.gate, /Taiwan-registered eligible information-services business/i);
  assert.match(moda.gate, /does not state the award ceiling/i);

  const fij = byId.get('fij-2026-nocturnal');
  assert.equal(fij.status, 'PARTNER_OR_SKIP_CURRENT_CYCLE');
  assert.match(fij.gate, /journalists|reporters|media outlets/i);

  const pulitzer = byId.get('pulitzer-nocturnal');
  assert.equal(pulitzer.status, 'WATCH_NEXT_ROUND_PARTNER_FIRST');
  assert.match(pulitzer.deadline, /CLOSED_2026-08-27/);
});

test('focused Nocturnal audit keeps EU and ISIF routes bounded by actual institutional eligibility', () => {
  const eu = byId.get('watch-eu-information-integrity-consortium-2026');
  assert.equal(eu.status, 'CONSORTIUM_PARTNER_VERIFY');
  assert.equal(eu.execution_state, 'DEPENDENCY_RECON_REQUIRED');
  assert.match(eu.source_state, /OFFICIAL_EC_CALL_VERIFIED/);
  assert.match(eu.gate, /€6M/);
  assert.match(eu.gate, /60% redistribution/i);
  assert.match(eu.gate, /Taiwan-based individual/i);

  const isif = byId.get('isif-asia-2027-nocturnal-watch');
  assert.equal(isif.status, 'WATCH_2027');
  assert.match(isif.gate, /Individuals are not eligible/i);
  assert.match(isif.gate, /US\$20k\/50k\/75k/i);
});

test('deep-radar overrides stale route states instead of duplicating them', () => {
  assert.equal(byId.get('wanrun-grad-2026').status, 'KILL');
  assert.equal(byId.get('wanrun-grad-2026').execution_state, 'BLOCKED');
  assert.match(byId.get('wanrun-grad-2026').gate, /genuine adviser/i);

  assert.equal(byId.get('otf-nocturnal').opportunity, 'Information Controls Research Program 2026');
  assert.equal(byId.get('otf-nocturnal').status, 'FIRE_IF_GATES_CLEAR');
  assert.equal(byId.get('otf-nocturnal').deadline, '2026-09-07T23:59:00+00:00');
  assert.match(byId.get('otf-nocturnal').gate, /surveillance software\/hardware/i);

  assert.equal(byId.get('taia-2026-hardware-splicer').status, 'FIRE');
  assert.equal(byId.get('taia-2026-hardware-splicer').deadline, '2026-09-14');
});

test('preserves research-family ownership and manuscript exclusivity', () => {
  assert.equal(byId.get('ftsid-2026-cl-eci').contribution_view, 'CL-ECI');
  assert.equal(byId.get('ftsid-2026-cl-eci').mutual_exclusion_group, 'cl-eci-manuscript-2026');
  assert.equal(byId.get('fc27-cl-eci').mutual_exclusion_group, 'cl-eci-manuscript-2026');
  assert.equal(byId.get('shih-hsin-finance-2026-il').contribution_view, 'Invisible Ledger');
  assert.equal(byId.get('innoserve-2026-policy-lab-ip').shared_evidence_family, 'policy-lab-family');
});

test('applies gate-audit corrections to current source rows', () => {
  assert.equal(byId.get('freeway-bridge-2026').status, 'VERIFY');
  assert.equal(byId.get('innoserve-pet-2026').status, 'HOLD');
  assert.equal(byId.get('innoserve-oss-2026').status, 'HOLD');
  assert.equal(byId.get('projectdiscovery-oss').status, 'SELECTIVE_SELL');
  assert.equal(byId.get('job-gogolook-credit').status, 'VERIFY');
  assert.equal(byId.get('job-qualcomm-ai-ml').status, 'WATCH');
});

test('keeps strategic and browser execution states separate', () => {
  assert.equal(byId.get('gaf-2026-policy-lab').status, 'FIRE_NOW');
  assert.equal(byId.get('gaf-2026-policy-lab').execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(byId.get('innoserve-2026-policy-lab-ip').execution_state, 'PACKET_READY');
  assert.equal(byId.get('field-meet-taipei-2026').execution_state, 'NOT_APPLICABLE');
});

test('summary exposes portfolio-wide lane mix including new research labor', () => {
  const summary = summarizeMasterRegistry(records);
  assert.equal(summary.total, records.length);
  assert.ok(summary.lanes.JOB > 0);
  assert.ok(summary.lanes.PhD > 0 || summary.lanes.PHD > 0);
  assert.ok(summary.lanes.PHD_FACULTY > 0);
  assert.ok(summary.lanes.RESEARCH > 0);
  assert.ok(summary.lanes.FIELD > 0);
  assert.ok(summary.lanes.RESEARCH_LAB > 0);
  assert.ok(summary.lanes.RESEARCH_JOB > 0);
  assert.ok(summary.lanes.RESEARCH_FELLOWSHIP > 0);
  assert.ok(summary.lanes.PREDOC > 0);
  assert.ok(summary.lanes.PILOT > 0);
});
