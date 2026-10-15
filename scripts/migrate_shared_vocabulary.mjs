#!/usr/bin/env node
/**
 * scripts/migrate_shared_vocabulary.mjs
 * One-time migration script that moves shared vocabulary updates
 * from legacy path `users/wB3NVAmBarXHSBrtEzDCriS0XBy2/data/vocabulary_updates`
 * to the new public collection `shared/vocabulary_updates`.
 *
 * Usage:
 *   node scripts/migrate_shared_vocabulary.mjs           # Dry-run mode (default)
 *   node scripts/migrate_shared_vocabulary.mjs --apply   # Apply migration to Firestore
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const ADMIN_UID = 'wB3NVAmBarXHSBrtEzDCriS0XBy2';
const isApply = process.argv.includes('--apply');

if (getApps().length === 0) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'english-breakfast-181ba';
  initializeApp({ projectId });
}

const db = getFirestore();

async function runMigration() {
  console.log('\n🚀 Starting Shared Vocabulary Migration');
  console.log(`Mode: ${isApply ? '🔥 LIVE (APPLYING CHANGES)' : '🧪 DRY RUN (NO CHANGES WRITTEN)'}`);

  const sourceRef = db.collection('users').doc(ADMIN_UID).collection('data').doc('vocabulary_updates');
  const targetRef = db.collection('shared').doc('vocabulary_updates');

  console.log(`Reading source document: users/${ADMIN_UID}/data/vocabulary_updates ...`);
  const sourceSnap = await sourceRef.get();

  if (!sourceSnap.exists) {
    console.log('⚠️  Source document does not exist. Nothing to migrate.');
    return;
  }

  const data = sourceSnap.data() || {};
  const updatesJson = data.updatesJson || '{}';
  const updatedAt = data.updatedAt || Date.now();
  const totalCount = data.totalCount || 0;

  console.log(`Found source document:`);
  console.log(` - updatesJson length: ${updatesJson.length} characters`);
  console.log(` - totalCount: ${totalCount}`);
  console.log(` - updatedAt: ${updatedAt}`);

  if (isApply) {
    console.log(`Writing to target document: shared/vocabulary_updates ...`);
    await targetRef.set({
      updatesJson,
      updatedAt,
      totalCount,
      migratedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Migration successfully applied to shared/vocabulary_updates!');
  } else {
    console.log('ℹ️  DRY RUN complete: No writes performed. Run with --apply to execute.');
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
