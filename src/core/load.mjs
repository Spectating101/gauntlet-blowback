import fs from 'node:fs/promises';
import path from 'node:path';

export async function loadStructured(filePath) {
  const absolute = path.resolve(filePath);
  const raw = await fs.readFile(absolute, 'utf8');
  const ext = path.extname(absolute).toLowerCase();
  if (ext === '.json') return JSON.parse(raw);
  if (ext === '.yaml' || ext === '.yml') {
    const { default: YAML } = await import('yaml');
    return YAML.parse(raw);
  }
  throw new Error(`Unsupported manifest extension: ${ext || '(none)'}`);
}

export async function loadOpportunity(filePath) {
  const opportunity = await loadStructured(filePath);
  opportunity.__file = path.resolve(filePath);
  opportunity.__dir = path.dirname(opportunity.__file);
  return opportunity;
}
