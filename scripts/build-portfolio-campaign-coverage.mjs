import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMasterRegistry } from './build-gauntlet-master.mjs';
import { auditCampaignCoverage } from '../src/allocation/portfolio-campaign-graph.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(ROOT, 'reports', 'portfolio-campaign-coverage-2026-09-16.json');
const audit = auditCampaignCoverage(buildMasterRegistry());

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(audit, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(audit.summary, null, 2)}\n`);
