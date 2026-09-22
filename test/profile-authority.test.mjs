import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadProfile } from '../src/core/resolve.mjs';

// Contact details were removed from the public profile (the repository is public) and now live
// only in the git-ignored applicant authority file. Field specs like `$profile.phone` must still
// resolve, or a packet-ready route cannot be built.

const PUBLIC_PROFILE = { id: 'christ', name: 'Christopher Ongko', email: 'public@example.edu' };

async function fixture(t, { authority, publicProfile = PUBLIC_PROFILE } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'authority-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const profilePath = path.join(dir, 'profile.json');
  await fs.writeFile(profilePath, JSON.stringify(publicProfile));
  if (authority !== undefined) {
    await fs.writeFile(path.join(dir, 'authority.yaml'), authority);
    process.env.BLOWBACK_AUTHORITY_FILE = path.join(dir, 'authority.yaml');
  } else {
    delete process.env.BLOWBACK_AUTHORITY_FILE;
  }
  t.after(() => { delete process.env.BLOWBACK_AUTHORITY_FILE; delete process.env.BLOWBACK_PROFILE_FILE; });
  return { dir, opportunity: { __dir: dir, profile: 'profile.json' } };
}

test('identity fields from the authority file fill gaps in the public profile', async (t) => {
  const { opportunity } = await fixture(t, {
    authority: 'identity:\n  phone: "+886-900-000-000"\n  email: private@example.edu\nother:\n  ignored: true\n'
  });
  const profile = await loadProfile(opportunity);
  assert.equal(profile.phone, '+886-900-000-000', 'phone comes from the authority file');
  assert.equal(profile.email, 'private@example.edu', 'authority wins over the public profile');
  assert.equal(profile.name, 'Christopher Ongko', 'public fields survive');
  assert.equal(profile.other, undefined, 'only the identity section is merged');
});

test('a missing authority file leaves the public profile untouched', async (t) => {
  const { opportunity } = await fixture(t);
  process.env.BLOWBACK_AUTHORITY_FILE = path.join(os.tmpdir(), 'definitely-absent.yaml');
  const profile = await loadProfile(opportunity);
  assert.deepEqual(profile, PUBLIC_PROFILE);
});

test('BLOWBACK_PROFILE_FILE still wins over the authority file', async (t) => {
  const { dir, opportunity } = await fixture(t, { authority: 'identity:\n  phone: "from-authority"\n' });
  const privatePath = path.join(dir, 'private.json');
  await fs.writeFile(privatePath, JSON.stringify({ phone: 'from-private-profile' }));
  process.env.BLOWBACK_PROFILE_FILE = privatePath;
  const profile = await loadProfile(opportunity);
  assert.equal(profile.phone, 'from-private-profile');
});

test('an unreadable authority file does not break profile loading', async (t) => {
  const { dir, opportunity } = await fixture(t, { authority: 'identity: [this is not a mapping\n' });
  assert.ok(dir);
  const profile = await loadProfile(opportunity);
  assert.equal(profile.email, PUBLIC_PROFILE.email, 'falls back to the public profile');
});
