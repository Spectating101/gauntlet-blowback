import test from 'node:test';
import assert from 'node:assert/strict';
import { action, closedOutFilter, parseDeadline, routeEvents, renderCalendar } from '../scripts/build-calendar.mjs';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const route = (id, deadline, status = 'FIRE_AFTER_GATE', extra = {}) => ({
  id, deadline, status, organization: 'Org', opportunity: `Opp ${id}`, ...extra,
});

test('deadline formats land on the right Taipei day', () => {
  assert.deepEqual(parseDeadline('2026-10-15'), { start: '2026-10-15', end: '2026-10-15', time: null });
  assert.deepEqual(parseDeadline('2026-10-14/2026-10-16'), { start: '2026-10-14', end: '2026-10-16', time: null });
  // Noon in Central Europe is 19:00 in Taipei, the same day.
  assert.deepEqual(parseDeadline('2026-11-03T12:00:00+01:00'), { start: '2026-11-03', end: '2026-11-03', time: '19:00' });
  // An 23:59 Anywhere-on-Earth close is the NEXT evening in Taipei.
  assert.deepEqual(parseDeadline('2026-09-24T23:59:00-12:00'), { start: '2026-09-25', end: '2026-09-25', time: '19:59' });
  assert.equal(parseDeadline('ROLLING'), null);
  assert.equal(parseDeadline('CYCLE_NOT_YET_VERIFIED'), null);
});

test('only routes still ahead of today become events', () => {
  const events = routeEvents([
    route('past', '2026-09-29'),
    route('today', '2026-09-30'),
    route('range-still-open', '2026-09-28/2026-10-01'),
    route('undated', 'ROLLING'),
  ], { today: '2026-09-30' });
  assert.deepEqual(events.map((e) => e.uid), ['range-still-open-20260928@blowback', 'today-20260930@blowback']);
});

test('UIDs use the form calendar-onboarding binds to a route exactly', () => {
  const [e] = routeEvents([route('phd-hkpfs-2027', '2026-12-01')], { today: '2026-09-30' });
  assert.equal(e.uid, 'phd-hkpfs-2027-20261201@blowback');
});

test('reminders only on applications, never on watch or hold routes', () => {
  const events = routeEvents([
    route('apply', '2026-10-15', 'FIRE_AFTER_GATE'),
    route('watch', '2026-10-15', 'WATCH'),
    route('hold', '2026-10-15', 'HOLD_OR_KILL'),
  ], { today: '2026-09-30' });
  const byId = Object.fromEntries(events.map((e) => [e.uid.split('-2026')[0], e.remind]));
  assert.deepEqual(byId, { apply: true, watch: false, hold: false });
});

test('the rendered calendar never repeats and keeps lines within 75 octets', () => {
  const long = 'x'.repeat(300) + ' 中文 — ünïcödé';
  const text = renderCalendar(routeEvents([route('a', '2026-10-15', 'FIRE', { gate: long })], { today: '2026-09-30' }));
  assert.ok(!text.includes('RRULE'), 'no repeating events');
  for (const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `line too long: ${line.slice(0, 40)}`);
  assert.equal((text.match(/BEGIN:VALARM/g) ?? []).length, 2);
});

test('every event in the real calendar binds to a live route', () => {
  const records = buildMasterRegistry();
  const live = new Set(records.map((r) => r.id));
  const events = routeEvents(records, { today: '2026-09-30' });
  assert.ok(events.length > 40, `expected the dated live routes, got ${events.length}`);
  for (const e of events) assert.ok(live.has(e.uid.replace(/-\d{8}@blowback$/, '')), e.uid);
});

test('the leading qualifier wins: a held, watched or checked FIRE route is not an application', () => {
  // HOLD_FIRE_LATER, WATCH_FIRE and CHECK_FIRE were all labelled Apply by a FIRE-first match.
  assert.equal(action('HOLD_FIRE_LATER'), 'On hold');
  assert.equal(action('WATCH_FIRE'), 'Watch');
  assert.equal(action('CHECK_FIRE'), 'Check');
  assert.equal(action('VERIFY'), 'Check');
});

test('every FIRE variant in the live list that is an application gets a reminder', () => {
  // Raised in review: a fixed allowlist missed STRETCH_FIRE, FIRE_IF_ELIGIBLE and others.
  for (const status of ['FIRE', 'FIRE_NOW', 'STRETCH_FIRE', 'FIRE_IF_ELIGIBLE', 'FIRE_SELECTIVELY',
    'FIRE_AFTER_REPO_AND_USE_CASE_VERIFY', 'SELECTIVE_FIRE', 'DEFAULT_PRIMARY_FIRE']) {
    const [e] = routeEvents([route('x', '2026-10-15', status)], { today: '2026-09-30' });
    assert.equal(e.remind, true, status);
  }
  const [held] = routeEvents([route('x', '2026-10-15', 'HOLD_FIRE_LATER')], { today: '2026-09-30' });
  assert.equal(held.remind, false);
});

test('closed-out PhD routes and PhD-only funding stay off the calendar', () => {
  const policy = { phd_applications_closed: { also_excluded_route_ids: ['moe-taiwan-scholarship-2027'] } };
  const events = routeEvents([
    route('phd-ntu-im', '2026-11-05', 'FIRE_AFTER_GATE', { lane: 'PhD' }),
    route('moe-taiwan-scholarship-2027', '2027-03-31', 'FIRE_AFTER_GATE', { lane: 'GRANT' }),
    route('msr-2027-technical-refinery', '2026-10-23', 'DEFAULT_PRIMARY_FIRE', { lane: 'RESEARCH' }),
  ], { today: '2026-09-30', exclude: closedOutFilter(policy) });
  assert.deepEqual(events.map((e) => e.uid), ['msr-2027-technical-refinery-20261023@blowback']);
});

test('without a closed-out policy, PhD routes are scheduled like any other', () => {
  const events = routeEvents([route('phd-ntu-im', '2026-11-05', 'FIRE_AFTER_GATE', { lane: 'PhD' })],
    { today: '2026-09-30', exclude: closedOutFilter({}) });
  assert.equal(events.length, 1);
});

test('the real calendar carries no PhD route after the applicant closed them', () => {
  const events = routeEvents(buildMasterRegistry(), { today: '2026-09-30' });
  assert.ok(!events.some((e) => /^phd-|tigp-sinica-phd|moe-taiwan-scholarship/.test(e.uid)));
});
