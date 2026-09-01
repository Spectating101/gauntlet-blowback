import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildMasterRegistry, summarizeMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

function safe(value) {
  return String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim();
}

function unfoldIcs(text) {
  return text.replace(/\r?\n[ \t]/g, '');
}

function parseCalendar(path) {
  const text = unfoldIcs(fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  const events = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const body = block.split('END:VEVENT')[0] ?? '';
    const fields = {};
    for (const line of body.split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const rawKey = line.slice(0, idx);
      const key = rawKey.split(';')[0];
      const value = line.slice(idx + 1);
      if (!fields[key]) fields[key] = value;
    }
    events.push({
      uid: fields.UID ?? '',
      start: fields.DTSTART ?? '',
      summary: fields.SUMMARY ?? '',
      description: fields.DESCRIPTION ?? '',
      url: fields.URL ?? '',
      calendar: path,
    });
  }
  return events;
}

test('export full master and calendar inventory for audit', () => {
  const records = buildMasterRegistry();
  const summary = summarizeMasterRegistry(records);
  assert.ok(records.length > 100);

  console.log('===MASTER_SUMMARY===');
  console.log(JSON.stringify(summary));
  console.log('===MASTER_ROUTES_BEGIN===');
  for (const r of records) {
    console.log([
      'ROUTE', safe(r.id), safe(r.lane), safe(r.organization), safe(r.opportunity), safe(r.status), safe(r.execution_state), safe(r.deadline), safe(r.assets), safe(r.source_state), safe(r.origin)
    ].join('\t'));
  }
  console.log('===MASTER_ROUTES_END===');

  const calendarPaths = [
    'calendar/gauntlet-postgrad-2026-2027.ics',
    'calendar/policy-lab-gauntlet-2026.ics',
    'calendar/research-assets-gauntlet-2026-2027.ics',
  ];
  const events = calendarPaths.flatMap(parseCalendar);
  console.log('===CALENDAR_SUMMARY===');
  console.log(JSON.stringify({ total_events: events.length, calendars: calendarPaths }));
  console.log('===CALENDAR_EVENTS_BEGIN===');
  for (const e of events) {
    console.log(['EVENT', safe(e.calendar), safe(e.start), safe(e.summary), safe(e.description), safe(e.uid)].join('\t'));
  }
  console.log('===CALENDAR_EVENTS_END===');
});
