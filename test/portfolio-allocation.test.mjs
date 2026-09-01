import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import {
  allocationAllowsAutonomousFinalSubmit,
  resolvePortfolioAllocation,
} from '../src/allocation/portfolio.mjs';
import { buildApplicationMission } from '../src/application/operator.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

function allocation(id) {
  const record = byId.get(id);
  assert.ok(record, `missing canonical route ${id}`);
  return resolvePortfolioAllocation(record);
}

test('flagship project-native routes have explicit lead ownership', () => {
  assert.equal(allocation('taia-2026-hardware-splicer').lead_asset, 'hardware-splicer');
  assert.equal(allocation('anthropic-mhs-preview-2026').lead_asset, 'hardware-splicer');
  assert.equal(allocation('openai-researcher').lead_asset, 'cite-agent');
  assert.equal(allocation('otf-nocturnal').lead_asset, 'nocturnal-oversight');
  assert.equal(allocation('msr-2027-technical-refinery').lead_asset, 'refinery-commons');
  assert.equal(allocation('fc27-cl-eci').lead_asset, 'policy-lab');
  assert.equal(allocation('shih-hsin-finance-2026-il').lead_asset, 'research-papers');
  assert.equal(allocation('dpg-policy-lab').lead_asset, 'policy-lab');
});

test('research labor is packaged as person-level evidence bundles rather than project-vs-project applications', () => {
  const hku = allocation('job-hku-ai-engineer-mcp-ra2-2026');
  assert.equal(hku.mode, 'PERSON_BUNDLE');
  assert.equal(hku.lead_asset, 'research-drive');
  assert.deepEqual(hku.lead_projects.slice(0, 2), ['research-drive', 'cite-agent']);
  assert.ok(hku.support_assets.includes('gauntlet-blowback'));

  const ku = allocation('lab-sinica-ku-nlp-ra-2026');
  assert.equal(ku.mode, 'PERSON_BUNDLE');
  assert.equal(ku.lead_asset, 'cite-agent');
  assert.ok(ku.lead_projects.includes('nocturnal-oversight'));
});

test('scarce portfolio slots cannot be consumed by an old multi-asset row', () => {
  const twnic = allocation('twnic-community-grant-2026-nocturnal');
  assert.equal(twnic.mode, 'PORTFOLIO_BAKEOFF');
  assert.equal(twnic.scarce_slot_group, 'twnic-one-proposal-per-host-2026');
  assert.equal(twnic.allocation_clear, false);

  const nlnet = allocation('nlnet-codesupply-refinery');
  assert.equal(nlnet.mode, 'PORTFOLIO_BAKEOFF');
  assert.equal(nlnet.lead_asset, 'refinery-commons');
  assert.equal(nlnet.scarce_slot_group, 'nlnet-first-grant-portfolio-2026');
});

test('Citation Engine and Gauntlet remain support-only and cannot own a standalone slot', () => {
  const citationOnly = resolvePortfolioAllocation({
    id: 'synthetic-citation-only',
    lane: 'GRANT',
    route_class: 'APPLY',
    assets: 'Citation Engine',
    organization: 'Example',
    opportunity: 'Example evidence grant'
  });
  assert.equal(citationOnly.mode, 'SUPPORT_ONLY');
  assert.equal(citationOnly.lead_asset, null);
  assert.equal(citationOnly.allocation_clear, false);

  const blowbackOnly = resolvePortfolioAllocation({
    id: 'synthetic-blowback-only',
    lane: 'COMPETITION',
    route_class: 'APPLY',
    assets: 'Blowback',
    organization: 'Example',
    opportunity: 'Agent automation contest'
  });
  assert.equal(blowbackOnly.mode, 'SUPPORT_ONLY');
  assert.equal(blowbackOnly.lead_asset, null);
});

test('GeoMap stays bounded to procurement/pilot allocation instead of becoming a generic campaign asset', () => {
  const geomap = allocation('outbound-geomap-procurement-intelligence');
  assert.equal(geomap.lead_asset, 'geomap-arbitrage');
  assert.equal(geomap.package_family, 'geomap-procurement');
  assert.match(geomap.package.do_not_claim.join(' '), /generic lead-generation/i);
});

test('application autopilot exposes allocation and refuses autonomous final submit during a bakeoff', () => {
  const twnic = byId.get('twnic-community-grant-2026-nocturnal');
  if (twnic && /JOB|FELLOWSHIP|PHD|RESEARCH_/i.test(`${twnic.lane} ${twnic.route_class}`)) {
    assert.equal(allocationAllowsAutonomousFinalSubmit(twnic), false);
  }

  const hku = byId.get('job-hku-ai-engineer-mcp-ra2-2026');
  const mission = buildApplicationMission(hku);
  assert.equal(mission.application.portfolio_allocation.lead_asset, 'research-drive');
  assert.equal(mission.application.portfolio_allocation.mode, 'PERSON_BUNDLE');
  assert.ok(mission.application.packet_profile.includes('lead_package_evidence'));
});

test('every non-killed canonical route resolves to an allocation state rather than disappearing', () => {
  for (const record of records) {
    if (/KILL|REJECT/i.test(String(record.status ?? ''))) continue;
    const resolved = resolvePortfolioAllocation(record);
    assert.ok(resolved.mode, `${record.id}: allocation mode missing`);
    assert.notEqual(resolved.mode, 'UNALLOCATED_REVIEW', `${record.id}: no allocation rule`);
  }
});
