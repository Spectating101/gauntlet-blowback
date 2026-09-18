import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import { allocateCalendarEvent, allocateCalendarEvents } from '../src/allocation/calendar-project.mjs';
import { readCalendarEvents } from '../src/application/calendar-onboarding.mjs';
import { portfolioCampaignScope } from '../src/allocation/campaign-scope.mjs';

const records = buildMasterRegistry();
const event = (key, summary, description = '') => ({
  uid: `${key}-20260917@blowback`,
  start: '2026-09-17',
  summary,
  description,
});

test('paper-native calendar entries select the research-paper asset', () => {
  const allocation = allocateCalendarEvent(event('il-shihhsin', '[LOW-COST FIRE] Invisible Ledger — Shih Hsin Finance abstract'), records);
  assert.equal(allocation.route_id, 'shih-hsin-finance-2026-il');
  assert.equal(allocation.recommended_lead_asset, 'research-papers');
  assert.equal(allocation.submission_readiness.readiness, 'READY_FOR_BROWSER_DRAFT');
  assert.equal(allocation.submission_readiness.ready_for_browser, true);
});

test('calendar allocation keeps project fit separate from execution readiness', () => {
  const embedded = allocateCalendarEvent(event('embedded-world-2027-hardware-splicer', '[PREPARE] Embedded World Hardware Splicer'), records);
  const taai = allocateCalendarEvent(event('taai-hs-paper', '[FIRE] TAAI domestic paper'), records);
  const atlantis = allocateCalendarEvent(event('vu-atlantis', '[FIRE] VU ATLANTIS PhD'), records);
  assert.equal(embedded.recommended_lead_asset, 'hardware-splicer');
  assert.equal(embedded.submission_readiness.readiness, 'RESEARCH_OR_RECON_REQUIRED');
  assert.equal(embedded.ready_for_browser, false);
  assert.equal(taai.recommended_lead_asset, 'hardware-splicer');
  assert.equal(taai.submission_readiness.readiness, 'ROUTE_BINDING_REQUIRED');
  assert.equal(taai.submission_readiness_label, 'ROUTE_BINDING_REQUIRED');
  assert.equal(taai.ready_for_browser, false);
  assert.equal(atlantis.recommended_lead_asset, null);
  assert.equal(atlantis.submission_readiness.readiness, 'ROUTE_BINDING_REQUIRED');
  assert.equal(atlantis.submission_readiness.ready_for_browser, false);
});

test('multi-asset routes resolve to the strongest authorized campaign lead', () => {
  const allocation = allocateCalendarEvent(event('smartliving', '[VERIFY/FIRE] Smart Living competition', 'Public-Good or HS only if native.'), records);
  assert.equal(allocation.recommended_lead_asset, 'hardware-splicer');
  assert.ok(allocation.alternatives.some((candidate) => candidate.asset_id === 'public-good-control'));
});

test('deferred GeoMap maintenance never becomes a selected project entry', () => {
  const allocation = allocateCalendarEvent(event('rolling-procurement', '[LOW PRIORITY] GeoMap procurement-demand review'), records);
  assert.equal(allocation.decision, 'SKIP_DEFERRED_GEOMAP');
  assert.equal(allocation.recommended_lead_asset, null);
});

test('research-access calendar packages retain the concrete Hardware Splicer experiment', () => {
  const allocation = allocateCalendarEvent(event('anthropic-research-access', '[FIRE AFTER PACKET] Anthropic MHS + AI for Science', 'Hardware Splicer leads.'), records);
  assert.equal(allocation.recommended_lead_asset, 'hardware-splicer');
});

test('batch and outcome events do not masquerade as new project submissions', () => {
  const batch = allocateCalendarEvent(event('ai-fire-weekly', '[FIRE BATCH] Agent / AI / research-engineering applications'), records);
  const outcome = allocateCalendarEvent(event('gaf-outcome', '[OUTCOME IF FIRED] Global AI Finance notification', 'Policy Lab'), records);
  assert.equal(batch.decision, 'BATCH_BY_ROUTE');
  assert.equal(batch.recommended_lead_asset, null);
  assert.equal(outcome.decision, 'INHERIT_PARENT_ENTRY');
});

test('every source calendar event receives exactly one bounded allocation decision', () => {
  const events = [
    ...readCalendarEvents(new URL('../calendar/gauntlet-consolidated-active-2026-2027.ics', import.meta.url)),
    ...readCalendarEvents(new URL('../calendar/gauntlet-consolidated-rolling-watch-2026-2027.ics', import.meta.url)),
  ];
  const allocations = allocateCalendarEvents(events, records);
  const active = new Set(portfolioCampaignScope().active_lead_assets);
  assert.equal(allocations.length, events.length);
  assert.equal(new Set(allocations.map((row) => row.calendar_uid)).size, events.length);
  assert.ok(allocations.every((row) => row.decision));
  assert.ok(allocations.filter((row) => row.recommended_lead_asset).every((row) => active.has(row.recommended_lead_asset)));
  assert.ok(allocations.filter((row) => row.score != null).every((row) => row.score >= 0 && row.score <= 100));
  assert.ok(!allocations.some((row) => row.recommended_lead_asset === 'sharpe-terminus' || row.recommended_lead_asset === 'geomap-arbitrage'));
});
