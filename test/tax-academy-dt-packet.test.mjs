import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const packetUrl = new URL('../data/tax-academy-sg-dt-packet-2026-09-15.json', import.meta.url);
const packet = JSON.parse(fs.readFileSync(packetUrl, 'utf8'));
const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('Tax Academy packet preserves DT ownership and mechanics gate', () => {
  assert.equal(packet.route_id, 'tax-academy-sg-il');
  assert.equal(packet.primary_asset, 'Fiscal Choke Points');
  assert.equal(packet.state, 'PACKET_DRAFTED_MECHANICS_GATE');
  assert.equal(packet.strategic_status, 'FIRE_AFTER_GATE');
  assert.ok(packet.mechanics_gates.length >= 5);
});

test('Tax Academy packet does not silently promote the master route', () => {
  const route = byId.get(packet.route_id);
  assert.ok(route, 'canonical Tax Academy route must exist');
  assert.match(route.assets, /Fiscal Choke Points/);
  assert.equal(route.status, 'FIRE_AFTER_GATE');
  assert.equal(route.deadline, 'ROLLING_NO_PUBLIC_DEADLINE');
  assert.match(route.source_state, /OFFICIAL_TAX_ACADEMY_CALL_REVERIFIED_2026-09-15/);
});

test('provisional budget reconciles to the verified public grant ceiling', () => {
  const items = packet.provisional_budget_sgd.items;
  const sum = items.reduce((total, item) => total + item.amount, 0);
  assert.equal(sum, packet.provisional_budget_sgd.total);
  assert.equal(sum, packet.opportunity.grant_ceiling_sgd);
  assert.equal(packet.provisional_budget_sgd.submit_before_budget_rules_confirmed, false);
});

test('Singapore extension preserves transaction-path resolution', () => {
  const paths = packet.proposal.candidate_singapore_paths;
  assert.ok(paths.length >= 3);
  assert.equal(new Set(paths.map((path) => path.id)).size, paths.length);
  assert.ok(paths.some((path) => path.node === 'overseas supplier'));
  assert.ok(paths.some((path) => /marketplace/i.test(path.node)));
  assert.ok(paths.some((path) => /business buyer/i.test(path.node)));
});

test('packet keeps causal and performance nonclaims explicit', () => {
  const text = packet.nonclaims.join(' ');
  assert.match(text, /No claim.*revenue\/compliance effect/i);
  assert.match(text, /No claim.*superior/i);
  assert.match(text, /No causal inference/i);
});

test('human-readable packet exists at the machine packet path', () => {
  const packetDoc = new URL(`../${packet.packet_doc}`, import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(packetDoc)), true);
});
