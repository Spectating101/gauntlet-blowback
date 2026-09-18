import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMasterRegistry } from './build-gauntlet-master.mjs';
import { readCalendarEvents } from '../src/application/calendar-onboarding.mjs';
import { allocateCalendarEvents } from '../src/allocation/calendar-project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calendars = [
  path.join(ROOT, 'calendar', 'gauntlet-consolidated-active-2026-2027.ics'),
  path.join(ROOT, 'calendar', 'gauntlet-consolidated-rolling-watch-2026-2027.ics'),
];
const events = calendars.flatMap((calendarPath) => readCalendarEvents(calendarPath));
const allocations = allocateCalendarEvents(events, buildMasterRegistry());
const output = {
  schema: 'blowback.calendar_project_allocation.v1',
  as_of: '2026-09-12',
  grain: 'One source VEVENT definition per row; recurrence rules are not expanded.',
  scoring: {
    purpose: 'Choose the strongest selected portfolio lead for each calendar event.',
    weights: { capability_fit: 0.52, asset_maturity: 0.28, route_readiness: 0.20 },
    warning: 'Scores rank the portfolio internally. They are not acceptance probabilities and do not supersede eligibility, source verification, evidence or human gates.',
  },
  source_files: calendars.map((file) => path.relative(ROOT, file)).concat([
    'docs/gauntlet-master.json',
    'data/portfolio-assets.json',
    'data/portfolio-route-allocation-2026-09-01.json',
    'data/portfolio-campaign-scope-2026-09-12.json',
    'data/applicant-document-readiness-2026-09-12.json',
  ]),
  count: allocations.length,
  allocations,
};

const destination = path.join(ROOT, 'docs', 'calendar-project-allocation-2026-09-12.json');
fs.writeFileSync(destination, `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  count: allocations.length,
  by_decision: Object.groupBy(allocations, (row) => row.decision),
}, (_, value) => Array.isArray(value) ? value.length : value, 2)}\n`);
