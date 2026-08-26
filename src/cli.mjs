#!/usr/bin/env node
import fs from 'node:fs/promises';
import { loadOpportunity } from './core/load.mjs';
import { validateOpportunity } from './core/validate.mjs';
import { resolveBundle } from './core/resolve.mjs';
import { buildPlan } from './core/plan.mjs';

function usage() {
  console.log(`Blowback v0\n\nCommands:\n  next\n  mission <route-id>\n  checkpoint <checkpoint.json>\n  validate <opportunity>\n  plan <opportunity>\n  run <opportunity> [--persist-auth]\n\n\`next\` emits the highest-priority unpaused Codex+Chrome browser mission.\n\`mission\` emits a specific route, including its local resume checkpoint.\nBlowback never performs final submission.`);
}

const [command, filePath, ...rest] = process.argv.slice(2);
if (!command || ['-h', '--help', 'help'].includes(command)) { usage(); process.exit(0); }

if (command === 'next') {
  const { nextBrowserMission } = await import('./mission/operator.mjs');
  const mission = nextBrowserMission();
  if (!mission) {
    console.log(JSON.stringify({ schema: 'blowback.codex_browser_mission.v1', mission: null, reason: 'no actionable unpaused routes' }, null, 2));
    process.exit(0);
  }
  console.log(JSON.stringify(mission, null, 2));
  process.exit(0);
}

if (command === 'mission') {
  if (!filePath) { usage(); process.exit(2); }
  const { browserMissionForRoute } = await import('./mission/operator.mjs');
  console.log(JSON.stringify(browserMissionForRoute(filePath), null, 2));
  process.exit(0);
}

if (command === 'checkpoint') {
  if (!filePath) { usage(); process.exit(2); }
  const raw = JSON.parse(await fs.readFile(filePath, 'utf8'));
  const { persistCheckpoint } = await import('./mission/checkpoint.mjs');
  const result = persistCheckpoint(raw);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (!filePath) { usage(); process.exit(2); }

if (command === 'validate') {
  const opportunity = await loadOpportunity(filePath);
  const result = validateOpportunity(opportunity);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

if (command === 'plan') {
  const opportunity = await loadOpportunity(filePath);
  const validation = validateOpportunity(opportunity);
  if (!validation.ok) { console.error(JSON.stringify(validation, null, 2)); process.exit(1); }
  const bundle = await resolveBundle(opportunity);
  console.log(JSON.stringify(buildPlan(bundle), null, 2));
  process.exit(0);
}

if (command === 'run') {
  const { runOpportunity } = await import('./commands/run.mjs');
  const result = await runOpportunity(filePath, { persistAuth: rest.includes('--persist-auth') });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
usage();
process.exit(2);
