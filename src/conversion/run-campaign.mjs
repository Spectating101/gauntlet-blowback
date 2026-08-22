import fs from 'node:fs/promises';
import path from 'node:path';
import { buildConversionCampaign, ingestExternalOutcome } from './operator.mjs';

function usage() {
  console.error('usage: node src/conversion/run-campaign.mjs <campaign-input.json> [--out <path>] [--outcome <outcome.json>]');
  process.exit(2);
}

const args = process.argv.slice(2);
if (!args.length) usage();

const inputPath = args[0];
let outPath = null;
let outcomePath = null;
for (let i = 1; i < args.length; i += 1) {
  if (args[i] === '--out') outPath = args[++i];
  else if (args[i] === '--outcome') outcomePath = args[++i];
  else usage();
}

const input = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const campaign = buildConversionCampaign(input);
let output = { campaign };

if (outcomePath) {
  const outcome = JSON.parse(await fs.readFile(outcomePath, 'utf8'));
  output.receipt = ingestExternalOutcome(campaign, outcome);
}

const serialized = `${JSON.stringify(output, null, 2)}\n`;
if (outPath) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, serialized);
} else {
  process.stdout.write(serialized);
}
