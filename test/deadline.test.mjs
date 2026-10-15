import test from 'node:test';
import assert from 'node:assert/strict';

import { deadlineExpired, deadlineUtcDay, parseDeadline } from '../src/core/deadline.mjs';
import { currentCycleExpired } from '../src/mission/operator.mjs';

const at = (iso) => new Date(iso);

test('deadlines are read as a day, an instant with an offset, or an event window', () => {
  assert.deepEqual(parseDeadline('2026-10-23'), { kind: 'day', day: '2026-10-23', instant: null });
  assert.equal(parseDeadline('2026-10-20/2026-10-22').day, '2026-10-22');
  assert.equal(parseDeadline('2026-10-20/2026-10-22').kind, 'range_end');
  const aoe = parseDeadline('2026-10-23T23:59:00-12:00');
  assert.equal(aoe.kind, 'instant');
  assert.equal(aoe.instant.toISOString(), '2026-10-24T11:59:00.000Z');
  for (const text of ['ROLLING', 'UNKNOWN', 'CYCLE_NOT_YET_VERIFIED', '', null, undefined]) {
    assert.deepEqual(parseDeadline(text), { kind: 'none', day: null, instant: null }, String(text));
  }
});

test('an Anywhere-on-Earth deadline stays open until 11:59 UTC the next day', () => {
  const aoe = '2026-10-23T23:59:00-12:00';
  assert.equal(deadlineExpired(aoe, at('2026-10-23T20:00:00Z')), false);
  assert.equal(deadlineExpired(aoe, at('2026-10-24T01:00:00Z')), false, 'was reported expired about 11 hours early');
  assert.equal(deadlineExpired(aoe, at('2026-10-24T11:58:00Z')), false);
  assert.equal(deadlineExpired(aoe, at('2026-10-24T12:00:00Z')), true);
});

test('an offset ahead of UTC is also compared as an instant', () => {
  const taipei = '2026-10-23T09:00:00+08:00'; // 01:00 UTC
  assert.equal(deadlineExpired(taipei, at('2026-10-23T00:30:00Z')), false);
  assert.equal(deadlineExpired(taipei, at('2026-10-23T01:30:00Z')), true);
});

test('an event window stays open through its last day', () => {
  const expo = '2026-10-20/2026-10-22';
  assert.equal(deadlineExpired(expo, at('2026-10-21T10:00:00Z')), false, 'was expired on the first day of the event');
  assert.equal(deadlineExpired(expo, at('2026-10-22T20:00:00Z')), false);
  assert.equal(deadlineExpired(expo, at('2026-10-23T00:30:00Z')), true);
});

test('a plain day is unchanged: open through that UTC day, and non-dates never expire', () => {
  assert.equal(deadlineExpired('2026-10-23', at('2026-10-23T20:00:00Z')), false);
  assert.equal(deadlineExpired('2026-10-23', at('2026-10-24T00:30:00Z')), true);
  for (const text of ['ROLLING', 'WHILE_ENROLLED', 'UNKNOWN', null]) {
    assert.equal(deadlineExpired(text, at('2030-01-01T00:00:00Z')), false, String(text));
  }
});

test('the UTC day of an instant is the day the deadline really falls on', () => {
  assert.equal(deadlineUtcDay('2026-10-23T23:59:00-12:00'), '2026-10-24');
  assert.equal(deadlineUtcDay('2026-10-20/2026-10-22'), '2026-10-22');
  assert.equal(deadlineUtcDay('2026-10-23'), '2026-10-23');
  assert.equal(deadlineUtcDay('ROLLING'), null);
});

test('the queue uses the same rule and still rejects an invalid reference date', () => {
  assert.equal(currentCycleExpired({ deadline: '2026-10-23T23:59:00-12:00' }, at('2026-10-24T01:00:00Z')), false);
  assert.equal(currentCycleExpired({ deadline: '2026-10-20/2026-10-22' }, at('2026-10-21T10:00:00Z')), false);
  assert.equal(currentCycleExpired({ deadline: '2026-10-23' }, at('2026-10-24T00:30:00Z')), true);
  assert.throws(() => currentCycleExpired({ deadline: '2026-10-23' }, 'not-a-date'), /invalid Gauntlet queue date/);
});
