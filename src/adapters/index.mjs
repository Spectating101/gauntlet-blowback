import { genericAdapter } from './generic.mjs';

const adapters = new Map([
  ['generic', genericAdapter],
  ['devpost', genericAdapter],
  ['easychair', genericAdapter],
  ['openreview', genericAdapter]
]);

export function getAdapter(name) {
  const adapter = adapters.get(name);
  if (!adapter) throw new Error(`Unsupported portal adapter: ${name}`);
  return adapter;
}
