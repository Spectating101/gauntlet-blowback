import test from 'node:test';
import assert from 'node:assert/strict';

import { expandCalendarEvents } from '../src/application/calendar-onboarding.mjs';

// 2026-10-05 is a Monday.
function days(rrule, start = '2026-10-05', range = { from: '2026-10-05', through: '2026-10-31' }) {
  return expandCalendarEvents([{ uid: 'x', summary: 'x', start, rrule }], range).map((event) => event.start.slice(5));
}

test('a weekly rule on several days emits every named day, not only the weekday of DTSTART', () => {
  assert.deepEqual(days('FREQ=WEEKLY;BYDAY=MO,WE'), ['10-05', '10-07', '10-12', '10-14', '10-19', '10-21', '10-26', '10-28']);
});

test('INTERVAL=2 means every other week, counted from the week that holds DTSTART', () => {
  assert.deepEqual(days('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO'), ['10-05', '10-19']);
  assert.deepEqual(days('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH'), ['10-05', '10-08', '10-19', '10-22']);
});

test('shapes that already worked give the same result', () => {
  assert.deepEqual(days('FREQ=WEEKLY;BYDAY=MO'), ['10-05', '10-12', '10-19', '10-26']);
  assert.deepEqual(days('FREQ=BIWEEKLY;BYDAY=MO'), ['10-05', '10-19']);
  assert.deepEqual(days('FREQ=WEEKLY;COUNT=4', '2026-10-07'), ['10-07', '10-14', '10-21', '10-28']);
  assert.deepEqual(days('FREQ=WEEKLY;BYDAY=MO;UNTIL=20261014'), ['10-05', '10-12']);
});

test('COUNT stops after that many occurrences across all named days', () => {
  assert.deepEqual(days('FREQ=WEEKLY;BYDAY=MO,WE;COUNT=3'), ['10-05', '10-07', '10-12']);
});

test('occurrences before the window still count toward COUNT', () => {
  assert.deepEqual(days('FREQ=WEEKLY;BYDAY=MO,WE;COUNT=3', '2026-10-05', { from: '2026-10-08', through: '2026-10-31' }), ['10-12']);
});

test('a DTSTART that is not itself on a named day starts at the next one', () => {
  assert.deepEqual(days('FREQ=WEEKLY;BYDAY=MO', '2026-10-06'), ['10-12', '10-19', '10-26']);
});

test('monthly rules and non-repeating events are untouched', () => {
  assert.deepEqual(days('FREQ=MONTHLY;BYMONTHDAY=12'), ['10-12']);
  assert.deepEqual(
    expandCalendarEvents([{ uid: 'y', summary: 'y', start: '2026-10-09' }], { from: '2026-10-05', through: '2026-10-31' }).map((event) => event.start),
    ['2026-10-09'],
  );
});
