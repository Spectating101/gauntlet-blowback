import fs from 'node:fs/promises';
import path from 'node:path';

export async function createRecordDir(opportunityId, root = process.env.BLOWBACK_RECORD_DIR || 'submission-records') {
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const dir = path.resolve(root, opportunityId, stamp);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeJson(dir, name, value) {
  const file = path.join(dir, name);
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return file;
}
