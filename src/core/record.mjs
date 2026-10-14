import fs from 'node:fs/promises';
import path from 'node:path';
import { assertSafeId } from './safe-id.mjs';

export async function createRecordDir(opportunityId, root = process.env.BLOWBACK_RECORD_DIR || 'submission-records') {
  assertSafeId(opportunityId, 'opportunity id');
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const dir = path.resolve(root, opportunityId, stamp);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}

export async function writeJson(dir, name, value) {
  const file = path.join(dir, name);
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  return file;
}
