#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { evaluateProductFactoryOutcome } from "../src/product-factory/triage.mjs";

const input = process.argv[2];
if (!input) {
  console.error("usage: npm run product-factory:triage -- <product-factory-run.json>");
  process.exit(2);
}

const resolved = path.resolve(input);
const run = JSON.parse(fs.readFileSync(resolved, "utf8"));
const result = evaluateProductFactoryOutcome(run);
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
