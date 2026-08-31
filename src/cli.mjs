#!/usr/bin/env node
import fs from 'node:fs/promises';
import { loadOpportunity } from './core/load.mjs';
import { validateOpportunity } from './core/validate.mjs';
import { resolveBundle } from './core/resolve.mjs';
import { buildPlan } from './core/plan.mjs';

function usage() {
  console.log(`Blowback v0\n\nCommands:\n  next\n  mission <route-id>\n  apply-next [--submit-if-safe]\n  apply <route-id> [--submit-if-safe]\n  apply-queue [--limit=N] [--submit-if-safe]\n  checkpoint <checkpoint.json>\n  validate <opportunity>\n  plan <opportunity>\n  recon <opportunity> [--stage=source|registration|submission] [--persist-auth]\n  run <opportunity> [--persist-auth]\n\n\`next\` emits the highest-priority unpaused Codex+Chrome mission and automatically specializes application-like routes.\n\`mission\` emits a specific generic route, including its local resume checkpoint.\n\`apply-next\` emits the highest-priority job/lab/predoc/fellowship/residency application mission.\n\`apply-queue\` emits a bounded portfolio-wide application queue. By default all application commands prepare to the last safe state. \`--submit-if-safe\` is explicit runtime authority to submit/send only when no protected gate or unresolved material fact is encountered.\nRecon is observation-only and never promotes a route to prepare. The direct Playwright \`run\` command never performs final submission.`);
}

const [command, filePath, ...rest] = process.argv.slice(2);
if (!command || ['-h', '--help', 'help'].includes(command)) { usage(); process.exit(0); }

function runtimeApplicationOptions(args = []) {
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const parsedLimit = limitArg ? Number(limitArg.slice('--limit='.length)) : 10;
  return {
    submitIfSafe: args.includes('--submit-if-safe'),
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 10
  };
}

if (command === 'next') {
  const { nextBrowserMission } = await import('./mission/operator.mjs');
  const mission = nextBrowserMission();
  if (!mission) {
    console.log(JSON.stringify({ schema: 'blowback.codex_browser_mission.v1', mission: null, reason: 'no actionable unpaused routes' }, null, 2));
    process.exit(0);
  }
  const { isApplicationRoute, applicationMissionForRoute } = await import('./application/operator.mjs');
  const output = isApplicationRoute(mission.record)
    ? applicationMissionForRoute(mission.route_id)
    : mission;
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

if (command === 'mission') {
  if (!filePath) { usage(); process.exit(2); }
  const { browserMissionForRoute } = await import('./mission/operator.mjs');
  console.log(JSON.stringify(browserMissionForRoute(filePath), null, 2));
  process.exit(0);
}

if (command === 'apply-next') {
  const args = [filePath, ...rest].filter(Boolean);
  const { nextApplicationMission } = await import('./application/operator.mjs');
  const options = runtimeApplicationOptions(args);
  const mission = nextApplicationMission(undefined, options);
  console.log(JSON.stringify(mission ?? { schema: 'blowback.application_mission.v1', mission: null, reason: 'no actionable application routes' }, null, 2));
  process.exit(0);
}

if (command === 'apply') {
  if (!filePath) { usage(); process.exit(2); }
  const { applicationMissionForRoute } = await import('./application/operator.mjs');
  const options = runtimeApplicationOptions(rest);
  console.log(JSON.stringify(applicationMissionForRoute(filePath, undefined, options), null, 2));
  process.exit(0);
}

if (command === 'apply-queue') {
  const args = [filePath, ...rest].filter(Boolean);
  const { applicationQueue } = await import('./application/operator.mjs');
  const options = runtimeApplicationOptions(args);
  console.log(JSON.stringify(applicationQueue(undefined, options), null, 2));
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

if (command === 'recon') {
  const { reconOpportunity } = await import('./commands/recon.mjs');
  const stageArg = rest.find((arg) => arg.startsWith('--stage='));
  const stage = stageArg ? stageArg.slice('--stage='.length) : null;
  const result = await reconOpportunity(filePath, {
    persistAuth: rest.includes('--persist-auth'),
    stage
  });
  console.log(JSON.stringify(result, null, 2));
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
