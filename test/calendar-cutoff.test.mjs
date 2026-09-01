import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const activePath = new URL('../calendar/gauntlet-consolidated-active-2026-2027.ics', import.meta.url);
const rollingPath = new URL('../calendar/gauntlet-consolidated-rolling-watch-2026-2027.ics', import.meta.url);
const historyPath = new URL('../calendar/gauntlet-consolidated-history-through-2026-09-01.ics', import.meta.url);

const active = fs.readFileSync(activePath, 'utf8');
const rolling = fs.readFileSync(rollingPath, 'utf8');
const history = fs.readFileSync(historyPath, 'utf8');

function events(text) {
  return [...text.matchAll(/BEGIN:VEVENT\n([\s\S]*?)\nEND:VEVENT/g)].map((match) => match[1]);
}

function field(event, name) {
  const line = event.split('\n').find((item) => item.startsWith(`${name}:`) || item.startsWith(`${name};`));
  return line ?? null;
}

function compactStart(event) {
  const line = field(event, 'DTSTART');
  if (!line) return null;
  const value = line.slice(line.indexOf(':') + 1);
  return value.replace(/[^0-9]/g, '').slice(0, 8);
}

test('all consolidated calendar events are structurally complete and UIDs are unique', () => {
  const all = [...events(active), ...events(rolling), ...events(history)];
  assert.ok(all.length > 50, 'expected a substantial consolidated calendar');
  const uids = [];
  for (const event of all) {
    assert.ok(field(event, 'UID'), 'VEVENT missing UID');
    assert.ok(field(event, 'DTSTART'), 'VEVENT missing DTSTART');
    assert.ok(field(event, 'SUMMARY'), 'VEVENT missing SUMMARY');
    uids.push(field(event, 'UID'));
  }
  assert.equal(new Set(uids).size, uids.length, 'duplicate UID across consolidated calendars');
});

test('active and rolling calendars contain no pre-cutoff dates', () => {
  for (const event of [...events(active), ...events(rolling)]) {
    const start = compactStart(event);
    assert.ok(start >= '20260901', `${field(event, 'UID')} starts before Sep-1 cutoff`);
  }
  assert.doesNotMatch(active, /DTSTART[^\n]*:202608/);
  assert.doesNotMatch(rolling, /DTSTART[^\n]*:202608/);
});

test('history calendar contains the clearly closed current-cycle routes', () => {
  for (const token of [
    'Wanrun Graduate Research 2026',
    'AgenTrust Fellowship',
    'Global AI Finance 2026',
    'GRASFI Asia 2027',
    'BCK26',
    'ICDLT 2026',
    'Digital Tax / ICPA 2026',
    'JCDL 2026 full paper',
    'TAIROS + Automation Taipei'
  ]) assert.match(history, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  assert.match(history, /Wanrun Graduate Research 2026[\s\S]*Mandatory adviser-signature gate/);
  assert.match(history, /Global AI Finance 2026[\s\S]*preparation is not proof of submission/i);
});

test('current allocation authority replaces stale legacy calendar ownership', () => {
  assert.match(active, /Software Sustainability Institute Fellowship 2027[\s\S]*Refinery-led/i);
  assert.match(active, /Invisible Ledger — Shih Hsin Finance abstract/);
  assert.match(active, /FTSID 2026 — CL-ECI/);
  assert.match(active, /NLnet Restack \/ CodeSupply[\s\S]*Refinery is provisional lead/i);
  assert.doesNotMatch(active, /Policy Lab — SSI Fellowship/);
  assert.doesNotMatch(active, /Policy Lab — Shih Hsin/);
});

test('uncertain cycles stay review points rather than false deadlines', () => {
  assert.match(active, /\[WATCH\/REVERIFY\] Constellation \/ Astra next cohort/);
  assert.match(active, /Do not treat Sep 26 as a verified hard application deadline/);
  assert.match(rolling, /do not preserve old deadlines as current authority/i);
});

test('conditional outcomes are not treated as proof of submission', () => {
  assert.match(active, /\[OUTCOME IF FIRED\] Global AI Finance 2026 notification/);
  assert.match(active, /Only active if a receipt exists/);
  assert.match(active, /\[OUTCOME IF FIRED\] Invisible Ledger — Shih Hsin Finance notification/);
});
