#!/usr/bin/env node
// One calendar, generated from the live Gauntlet list.
//
// The calendar used to be six hand-edited .ics files that drifted from the list:
// they kept archived routes, "outcome if fired" follow-ups for things never sent,
// and 25 repeating reminders with no end, while missing 18 dated routes the list
// held, NCCU, NTU and HKPFS among them. This builds the calendar from the list, so
// the two cannot disagree:
//
// - one event per live route with a deadline from --today on, and nothing else;
// - no repeating events;
// - reminders 7 days and 1 day before, only on routes that are an application;
// - deadlines with a time are placed on their Asia/Taipei date, with the exact
//   local time in the title (an 23:59 Anywhere-on-Earth close is the next evening
//   here);
// - UIDs are `<route-id>-<YYYYMMDD>@blowback`, the form calendar-onboarding.mjs
//   already binds to a route exactly, and re-importing updates an event rather
//   than duplicating it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from './build-gauntlet-master.mjs';
import { applicantDocumentAuthority, isPhdRoute } from '../src/allocation/submission-readiness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_OUTPUT = path.join(ROOT, 'calendar', 'gauntlet-live.ics');
const TZ = 'Asia/Taipei';

// The leading word qualifies the rest: HOLD_FIRE_LATER is a hold, WATCH_FIRE a watch,
// CHECK_FIRE a check. Only after those does any FIRE status count as an application,
// so new variants (STRETCH_FIRE, FIRE_IF_ELIGIBLE, ...) need no list update.
const ACTION = [
  [/^HOLD_SCREENCAST_RECORDING$/, 'Record + apply'],
  [/^(HOLD|FUNDING_GATED|FALLBACK)/, 'On hold'],
  [/^WATCH/, 'Watch'],
  [/^(CHECK|VERIFY|REVERIFY)/, 'Check'],
  [/FIRE|ARTIFACT_ROUTE|HIGH_FIT_ALTERNATIVE|BAKEOFF/, 'Apply'],
  [/DEVELOP|PREP/, 'Prepare'],
  [/NETWORK/, 'Event'],
];

// Reminders follow the label, so the two cannot disagree.
const REMIND = new Set(['Apply', 'Record + apply']);

export function action(status = '') {
  const found = ACTION.find(([rx]) => rx.test(status));
  return found ? found[1] : 'Deadline';
}

function taipeiParts(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map((p) => [p.type, p.value]));
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

// "2026-10-15", "2026-11-03T12:00:00+01:00" or "2026-10-14/2026-10-16".
export function parseDeadline(raw) {
  const text = String(raw ?? '').trim();
  const range = text.match(/^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/);
  if (range) return { start: range[1], end: range[2], time: null };
  const stamp = text.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/);
  if (stamp) {
    const local = taipeiParts(new Date(text));
    return { start: local.day, end: local.day, time: local.time };
  }
  const day = text.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (day) return { start: day[1], end: day[1], time: null };
  return null;
}

const compact = (day) => day.replaceAll('-', '');

function nextDay(day) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function escapeText(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

// RFC 5545 folds lines longer than 75 octets.
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1; // never split a UTF-8 character
    out.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74; // continuation lines begin with a space
  }
  return out.join('\r\n ');
}

// Routes the applicant has closed out stay on record but are not scheduled. On
// 2026-09-30 that is every PhD route, plus PhD-only funding, after the last two
// PhD applications went in (data/applicant-document-readiness-2026-09-12.json).
export function closedOutFilter(policy = applicantDocumentAuthority().policy) {
  const phd = policy?.phd_applications_closed;
  if (!phd) return () => false;
  const alsoExcluded = new Set(phd.also_excluded_route_ids ?? []);
  return (record) => isPhdRoute(record) || alsoExcluded.has(record.id);
}

export function routeEvents(records, { today, exclude = closedOutFilter() }) {
  const events = [];
  for (const record of records) {
    if (exclude(record)) continue;
    const when = parseDeadline(record.deadline);
    if (!when || when.end < today) continue;
    const status = String(record.status ?? '');
    const label = action(status);
    const title = [record.organization, record.opportunity].filter(Boolean).join(' — ');
    const closes = when.time ? ` (closes ${when.time} Taipei)` : '';
    events.push({
      uid: `${record.id}-${compact(when.start)}@blowback`,
      start: when.start,
      endExclusive: nextDay(when.end),
      summary: `${label}: ${title}${closes}`,
      description: [
        `Status: ${status}`,
        record.gate ? `Gate: ${record.gate}` : null,
        record.assets ? `Uses: ${record.assets}` : null,
        record.source ? `Source: ${record.source}` : null,
        `Route: ${record.id}`,
        `Deadline as recorded: ${record.deadline}`,
      ].filter(Boolean).join('\n'),
      url: /^https?:\/\//.test(String(record.source ?? '')) ? record.source : null,
      remind: REMIND.has(label),
    });
  }
  return events.sort((a, b) => a.start.localeCompare(b.start) || a.uid.localeCompare(b.uid));
}

export function renderCalendar(events, { generatedAt = new Date() } = {}) {
  const stamp = generatedAt.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//gauntlet-blowback//build-calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Gauntlet deadlines',
    `X-WR-TIMEZONE:${TZ}`,
  ];
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.uid}`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.start)}`, `DTEND;VALUE=DATE:${compact(e.endExclusive)}`,
      `SUMMARY:${escapeText(e.summary)}`, `DESCRIPTION:${escapeText(e.description)}`, 'TRANSP:TRANSPARENT');
    if (e.url) lines.push(`URL:${e.url}`);
    if (e.remind) {
      for (const [ahead, label] of [['-P7D', 'one week'], ['-P1D', 'tomorrow']]) {
        lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${ahead}`,
          `DESCRIPTION:${escapeText(`${label}: ${e.summary}`)}`, 'END:VALARM');
      }
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

function taipeiToday() {
  return taipeiParts(new Date()).day;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
  const today = arg('today') ?? taipeiToday();
  const output = arg('out') ? path.resolve(arg('out')) : DEFAULT_OUTPUT;
  const events = routeEvents(buildMasterRegistry(), { today });
  fs.writeFileSync(output, renderCalendar(events));
  const reminded = events.filter((e) => e.remind).length;
  console.log(`${events.length} events from ${today} -> ${path.relative(ROOT, output)} (${reminded} with reminders, 0 repeating)`);
}
