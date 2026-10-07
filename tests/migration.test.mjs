import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8088';
process.env.GCLOUD_PROJECT = 'demo-rules-test';

if (getApps().length === 0) {
  initializeApp({ projectId: 'demo-rules-test' });
}
const db = getFirestore();

test('Migration script: collectionGroup players aggregation and --apply mode', async () => {
  const uid1 = 'migrated_user_1';
  const uid2 = 'migrated_user_2';

  // Seed weekly data
  await db.doc(`leaderboards/2026-W38/players/${uid1}`).set({
    userId: uid1,
    name: 'Alice',
    avatar: 'avatar1.png',
    xp: 250,
    updatedAt: 1000
  });

  await db.doc(`leaderboards/2026-W39/players/${uid1}`).set({
    userId: uid1,
    name: 'Alice Updated',
    avatar: 'avatar1_new.png',
    xp: 450,
    updatedAt: 2000
  });

  await db.doc(`leaderboards/2026-W39/players/${uid2}`).set({
    userId: uid2,
    name: 'Bob',
    avatar: 'avatar2.png',
    xp: 600,
    updatedAt: 1500
  });

  // Pre-seed leaderboard_alltime for uid2 with higher score 1000 (must not be downgraded)
  await db.doc(`leaderboard_alltime/${uid2}`).set({
    userId: uid2,
    name: 'Bob',
    avatar: 'avatar2.png',
    totalXp: 1000,
    updatedAt: 1200
  });

  // 1. Run dry-run migration
  const { stdout: dryRunOut } = await execFileAsync(process.execPath, ['scripts/migrate_alltime.mjs'], {
    env: { ...process.env, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8088', GCLOUD_PROJECT: 'demo-rules-test' }
  });
  assert.ok(dryRunOut.includes('DRY RUN'), 'Must indicate dry run');
  assert.ok(dryRunOut.includes('ПРЕДУПРЕЖДЕНИЕ'), 'Must show warning about calcXp bug');

  // Verify dry-run did not write uid1 to alltime
  const uid1DocBefore = await db.doc(`leaderboard_alltime/${uid1}`).get();
  assert.equal(uid1DocBefore.exists, false, 'Dry run must not write changes');

  // 2. Run --apply migration
  const { stdout: applyOut } = await execFileAsync(process.execPath, ['scripts/migrate_alltime.mjs', '--apply'], {
    env: { ...process.env, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8088', GCLOUD_PROJECT: 'demo-rules-test' }
  });
  assert.ok(applyOut.includes('LIVE (APPLYING CHANGES)'), 'Must indicate live apply');

  // Verify uid1 created in alltime with sum = 250 + 450 = 700
  const uid1DocAfter = await db.doc(`leaderboard_alltime/${uid1}`).get();
  assert.equal(uid1DocAfter.exists, true);
  assert.equal(uid1DocAfter.data().totalXp, 700);
  assert.equal(uid1DocAfter.data().name, 'Alice Updated');

  // Verify uid2 retained max(1000, 600) = 1000
  const uid2DocAfter = await db.doc(`leaderboard_alltime/${uid2}`).get();
  assert.equal(uid2DocAfter.data().totalXp, 1000);
});
