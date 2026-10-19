import { escoOccupationCandidates } from './esco-taxonomy.mjs';
const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  process.stderr.write('Usage: npm run radar:esco -- "research engineer"\n');
  process.exitCode = 2;
} else {
  try {
    const result = await escoOccupationCandidates(query);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (e) {
    process.stderr.write('ESCO discovery failed: ' + e.message + '\n');
    process.exitCode = 1;
  }
}
