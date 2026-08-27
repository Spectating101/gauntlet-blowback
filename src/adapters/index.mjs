import { genericAdapter } from './generic.mjs';
import { recipeAdapter } from './recipe.mjs';

const adapters = new Map([
  ['generic', genericAdapter],
  ['devpost', genericAdapter],
  ['easychair', genericAdapter],
  ['openreview', genericAdapter],
  ['recipe', recipeAdapter]
]);

export function getAdapter(name) {
  const adapter = adapters.get(name);
  if (!adapter) throw new Error(`Unsupported portal adapter: ${name}`);
  return adapter;
}
