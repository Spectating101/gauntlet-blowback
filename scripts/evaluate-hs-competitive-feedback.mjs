#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const defaultPacket = path.join(root, 'data', 'refinery-hs-competitive-feedback-2026-09-23.json');
const consumerPath = path.join(root, 'data', 'hs-competitive-feedback-consumer-v1.json');

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

export function evaluateCompetitivePacket(packet, consumer) {
  if (packet.schema_version !== 1) throw new Error('unsupported packet schema_version');
  if (packet.subject_project !== consumer.producer_contract.required_subject_project) {
    throw new Error('competitive packet subject_project mismatch');
  }
  if (packet.policy !== consumer.producer_contract.expected_policy) {
    throw new Error('competitive packet policy mismatch');
  }
  if (!Array.isArray(packet.decisions)) throw new Error('competitive packet decisions must be an array');
  if (packet.summary?.core_semantics_changes_authorized !== 0) {
    throw new Error('competitive packet attempted to authorize core semantics changes');
  }

  const actions = packet.decisions.map((decision) => {
    const rule = consumer.accepted_decisions[decision.decision];
    if (!rule) throw new Error(`unknown competitive decision: ${decision.decision}`);
    if (decision.subject_project !== consumer.subject_project) {
      throw new Error(`decision subject mismatch for ${decision.competitor}`);
    }
    if (decision.core_semantics_change_authorized !== false) {
      throw new Error(`core semantics authorization rejected for ${decision.competitor}`);
    }
    if (decision.engineering_authorized && !rule.may_open_engineering) {
      throw new Error(`producer engineering authorization exceeds consumer policy for ${decision.competitor}`);
    }
    const allowed = new Set(rule.allowed_surfaces || []);
    for (const scope of decision.allowed_scope || []) {
      if (!allowed.has(scope)) {
        throw new Error(`scope ${scope} is not consumer-authorized for ${decision.competitor}`);
      }
    }
    return {
      competitor: decision.competitor,
      decision: decision.decision,
      gauntlet_action: rule.gauntlet_action,
      priority_ceiling: rule.priority_ceiling,
      engineering_authorized: Boolean(decision.engineering_authorized && rule.may_open_engineering),
      allowed_scope: decision.allowed_scope || [],
      core_change: false,
    };
  });

  return {
    schema_version: 1,
    subject_project: consumer.subject_project,
    source_policy: packet.policy,
    active_priority: consumer.priority_override,
    frontend_closure: consumer.frontend_closure,
    guards: consumer.global_guards,
    actions,
    summary: {
      observations: actions.length,
      engineering_actions: actions.filter((row) => row.engineering_authorized).length,
      core_changes_authorized: 0,
      fabrication_authorized: false,
      power_on_authorized: false,
      release_authorized: false,
    },
  };
}

function main() {
  const packetArg = process.argv[2];
  const packetPath = packetArg ? path.resolve(process.cwd(), packetArg) : defaultPacket;
  const packet = readJson(packetPath);
  const consumer = readJson(consumerPath);
  const result = evaluateCompetitivePacket(packet, consumer);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
