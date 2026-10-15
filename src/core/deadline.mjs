// One reading of a route's `deadline` string, shared by everything that decides whether a route is still open.
//
// Three shapes occur in the live registry besides non-dates (ROLLING, UNKNOWN, ...):
//   2026-10-23                       a day (kept as before: open through that UTC day)
//   2026-10-23T23:59:00-12:00        an instant with an offset (23:59 Anywhere-on-Earth is 11:59 UTC the next day)
//   2026-10-20/2026-10-22            an event window; the route stays open until its LAST day
// Taking the first date in the string, as each caller used to, expired AoE deadlines up to a day early and
// expired an event route on the first day of the event.

const DAY = /\d{4}-\d{2}-\d{2}/;
const RANGE = /^(\d{4}-\d{2}-\d{2})\s*\/\s*(\d{4}-\d{2}-\d{2})$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/;

export function parseDeadline(value) {
  const text = String(value ?? '').trim();
  const range = text.match(RANGE);
  if (range) return { kind: 'range_end', day: range[2], instant: null };
  if (INSTANT.test(text)) {
    const instant = new Date(text);
    if (!Number.isNaN(instant.getTime())) return { kind: 'instant', day: text.slice(0, 10), instant };
  }
  const first = text.match(DAY)?.[0] ?? null;
  return { kind: first ? 'day' : 'none', day: first, instant: null };
}

function asDate(asOf) {
  const date = asOf instanceof Date ? asOf : new Date(asOf);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid deadline reference date: ${asOf}`);
  return date;
}

/** The UTC calendar day on which the deadline falls, for callers that only work in whole days. */
export function deadlineUtcDay(value) {
  const parsed = parseDeadline(value);
  return parsed.instant ? parsed.instant.toISOString().slice(0, 10) : parsed.day;
}

/** True once the deadline has passed. An instant is compared exactly; a day or window is compared by UTC day. */
export function deadlineExpired(value, asOf = new Date()) {
  const now = asDate(asOf);
  const parsed = parseDeadline(value);
  if (parsed.instant) return now.getTime() > parsed.instant.getTime();
  return Boolean(parsed.day && parsed.day < now.toISOString().slice(0, 10));
}
