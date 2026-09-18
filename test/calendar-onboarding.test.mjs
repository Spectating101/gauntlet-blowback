import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import {
  buildCalendarOnboardingQueue,
  expandCalendarEvents,
  parseCalendarEvents,
  persistAccountCheckpoint,
  validateAccountCheckpoint,
} from '../src/application/calendar-onboarding.mjs';

const calendar = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:research-job-20260915@blowback\nDTSTART;VALUE=DATE:20260915\nSUMMARY:[FIRE] Example research job\nDESCRIPTION:Apply from the canonical packet.\nEND:VEVENT\nBEGIN:VEVENT\nUID:unbound-review-20260916@blowback\nDTSTART;VALUE=DATE:20260916\nSUMMARY:[WATCH] Unbound review\nEND:VEVENT\nEND:VCALENDAR\n`;

function record(overrides = {}) {
  return {
    id: 'research-job', lane: 'RESEARCH_JOB', route_class: 'RESEARCH_ENGINEER',
    organization: 'Example Lab', opportunity: 'Research Engineer', status: 'FIRE',
    execution_state: 'APPLICATION_READY', deadline: '2026-09-20',
    source: 'https://jobs.example.edu/apply',
    ...overrides,
  };
}

test('calendar parser preserves execution cues without treating them as route authority', () => {
  const events = parseCalendarEvents(calendar);
  assert.equal(events.length, 2);
  assert.equal(events[0].start, '2026-09-15');
  assert.equal(events[0].summary, '[FIRE] Example research job');
});

test('calendar expansion carries recurring review blocks into the current planning window', () => {
  const recurring = parseCalendarEvents(`BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:weekly-review-20260903@blowback\nDTSTART;VALUE=DATE:20260903\nRRULE:FREQ=WEEKLY;BYDAY=TH;COUNT=4\nSUMMARY:[WATCH] Weekly review\nEND:VEVENT\nEND:VCALENDAR\n`);
  assert.deepEqual(expandCalendarEvents(recurring, { from: '2026-09-09', through: '2026-09-18' }).map((event) => event.start), ['2026-09-10', '2026-09-17']);
});

test('calendar onboarding queue associates exact route ids and makes account setup explicit', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-onboarding-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  const accountDir = path.join(dir, 'accounts');
  fs.writeFileSync(calendarPath, calendar);
  persistAccountCheckpoint({ scope: 'jobs.example.edu', state: 'LOGIN_REQUIRED', route_ids: ['research-job'] }, { accountDir });
  const queue = buildCalendarOnboardingQueue({ records: [record()], calendarPath, accountDir, today: '2026-09-09', days: 14 });
  assert.equal(queue.count, 1);
  assert.equal(queue.routes[0].stage, 'ACCOUNT_ONBOARDING');
  assert.equal(queue.routes[0].account.next_action, 'HUMAN_SIGN_IN');
  assert.equal(queue.routes[0].calendar_cues[0].uid, 'research-job-20260915@blowback');
  assert.ok('recommended_lead_asset' in queue.routes[0].calendar_cues[0]);
  assert.equal(queue.calendar_project_allocations.length, 2);
  assert.equal(queue.unbound_calendar_cues[0].uid, 'unbound-review-20260916@blowback');
  assert.equal(queue.email_policy.gmail_optional, true);
});

test('calendar onboarding excludes a hard-date route after its current cycle expires', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-expired-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  fs.writeFileSync(calendarPath, calendar);
  const queue = buildCalendarOnboardingQueue({ records: [record({ deadline: '2026-09-07' })], calendarPath, accountDir: path.join(dir, 'accounts'), today: '2026-09-09' });
  assert.equal(queue.count, 0);
});

test('calendar onboarding does not invent an account requirement for an email outreach route', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-outreach-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  fs.writeFileSync(calendarPath, calendar);
  const queue = buildCalendarOnboardingQueue({
    records: [record({ route_class: 'FACULTY_PULL', source: 'mailto:lab@example.edu', execution_state: 'OUTREACH_READY' })],
    calendarPath,
    accountDir: path.join(dir, 'accounts'),
    today: '2026-09-09',
  });
  assert.equal(queue.routes[0].account.state, 'NOT_REQUIRED');
  assert.equal(queue.routes[0].stage, 'PREPARE');
});

test('account checkpoints fail closed on secret-bearing data', () => {
  assert.throws(() => validateAccountCheckpoint({ scope: 'portal.example', state: 'ACCOUNT_READY', otp: '123456' }), /may not store secrets/i);
});

test('FIRE onboarding uses the manifest auth scope instead of its public source-page host', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-fire-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  fs.writeFileSync(calendarPath, calendar);
  const route = buildMasterRegistry().find((item) => item.id === 'anthropic-external-researcher-access-2026');
  const queue = buildCalendarOnboardingQueue({ records: [route], calendarPath, accountDir: path.join(dir, 'accounts'), today: '2026-09-09' });
  assert.equal(queue.routes[0].account.scope, 'anthropic-research-access');
});

test('calendar onboarding excludes an explicitly paused packaged research submission', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-research-submit-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  fs.writeFileSync(calendarPath, calendar);
  const packagedPaper = {
    id: 'shih-hsin-finance-2026-il', lane: 'RESEARCH', route_class: 'APPLY',
    organization: 'Shih Hsin University', opportunity: 'Finance International Conference 2026',
    status: 'FIRE_NOW', execution_state: 'PACKET_READY', deadline: '2026-09-17',
    source: 'https://fin.example.edu/call',
    execution_manifest: 'examples/opportunities/shih-hsin-finance-2026-invisible-ledger.json',
  };
  const queue = buildCalendarOnboardingQueue({
    records: [record(), packagedPaper], calendarPath,
    accountDir: path.join(dir, 'accounts'), today: '2026-09-09',
  });
  assert.deepEqual(queue.routes.map((item) => item.route_id), ['research-job']);
});

test('calendar onboarding excludes paused PhDs and routes needing new external prerequisites', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-policy-filter-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  fs.writeFileSync(calendarPath, calendar);
  const queue = buildCalendarOnboardingQueue({
    records: [
      record({ id: 'solo-ready' }),
      record({ id: 'phd-held', lane: 'PHD', route_class: 'PHD' }),
      record({ id: 'needs-reference', gate: 'Two professional references required.' }),
      record({ id: 'job-hku-ai-engineer-mcp-ra2-2026' }),
    ],
    calendarPath,
    accountDir: path.join(dir, 'accounts'),
    today: '2026-09-09',
  });
  assert.deepEqual(queue.routes.map((item) => item.route_id), ['solo-ready']);
});

test('canonical calendar queue keeps the paused paper out and preserves the screencast-blocked fellowship', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-calendar-canonical-priority-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const calendarPath = path.join(dir, 'active.ics');
  fs.writeFileSync(calendarPath, 'BEGIN:VCALENDAR\nEND:VCALENDAR\n');
  const master = buildMasterRegistry();
  const records = master.filter((item) => ['shih-hsin-finance-2026-il', 'ssi-fellowship-2027-policy-lab'].includes(item.id));
  const queue = buildCalendarOnboardingQueue({
    records, calendarPath, accountDir: path.join(dir, 'accounts'), today: '2026-09-15', days: 21,
  });
  assert.deepEqual(queue.routes.map((item) => item.route_id), ['ssi-fellowship-2027-policy-lab']);
  assert.equal(queue.routes[0].submission_readiness.readiness, 'PACKET_BLOCKED_ON_SCREENCAST');
  assert.equal(queue.routes[0].submission_readiness.ready_for_browser, false);
  assert.match(queue.routes[0].submission_readiness.packaging_required.join(' '), /CW27 registration, travel, and accommodation are provided separately/);
  assert.match(queue.routes[0].submission_readiness.packaging_required.join(' '), /six-minute-maximum screencast/);
});
