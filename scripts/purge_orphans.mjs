#!/usr/bin/env node
/**
 * scripts/purge_orphans.mjs
 *
 * Purges orphaned/corrupted accounts from Firestore that were previously hidden in client code.
 * Target UIDs identified from repository history (git show origin/main:frontend/services/firebase.js):
 *   - b9Puaf5jtthwQlOPvAdZJ1o5CBC3
 *   - jf0lHNZnwXVKzQpNh1FSYwkrDfl1
 *
 * NOTE ON FIRESTORE INDEXES:
 * Querying `db.collectionGroup('players').where('userId', '==', uid)` against a production
 * Cloud Firestore database requires a single-field index on collection group 'players'
 * for field 'userId' (Scope: Collection group, Field: userId, Ascending / Descending).
 * If this index is not created yet, Firestore will throw a FAILED_PRECONDITION error with a direct link
 * to create it in the Firebase Console:
 *   Firestore -> Indexes -> Single Field Overrides -> Add collection group 'players', field 'userId'.
 *
 * Removes:
 *   - leaderboards/{weekKey}/players/{uid} (all weeks)
 *   - leaderboard_alltime/{uid}
 *   - users/{uid} and all subcollection documents
 *
 * Usage:
 *   node scripts/purge_orphans.mjs                   # DRY RUN (no documents deleted)
 *   node scripts/purge_orphans.mjs --apply           # LIVE (deletes unauthenticated orphans)
 *   node scripts/purge_orphans.mjs --apply --force   # LIVE (forces deletion even if UID exists in Auth)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';

const TARGET_ORPHANED_UIDS = [
  'b9Puaf5jtthwQlOPvAdZJ1o5CBC3',
  'jf0lHNZnwXVKzQpNh1FSYwkrDfl1'
];

const KNOWN_SUBCOLLECTIONS = [
  'data',
  'progress',
  'settings',
  'sessions',
  'analytics',
  'favorites'
];

const isApply = process.argv.includes('--apply');
const isForce = process.argv.includes('--force');

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const creds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(creds), projectId: creds.project_id });
  } else {
    initializeApp({
      projectId: process.env.GCLOUD_PROJECT || 'english-breakfast-181ba'
    });
  }
}

const db = getFirestore();
const auth = getAuth();

async function purgeOrphanedAccounts() {
  console.log('='.repeat(70));
  console.log(` PURGE ORPHANED ACCOUNTS SCRIPT`);
  console.log(` Mode: ${isApply ? 'LIVE (APPLYING DELETIONS)' : 'DRY RUN (NO CHANGES WILL BE MADE)'}`);
  console.log(` Force flag: ${isForce ? 'ENABLED' : 'DISABLED'}`);
  console.log(` Target UIDs: ${TARGET_ORPHANED_UIDS.join(', ')}`);
  console.log('='.repeat(70));

  const stats = {
    weeklyPlayerDocsFound: 0,
    weeklyPlayerDocsDeleted: 0,
    alltimeDocsFound: 0,
    alltimeDocsDeleted: 0,
    userDocsFound: 0,
    userDocsDeleted: 0,
    subcollectionDocsFound: 0,
    subcollectionDocsDeleted: 0
  };

  for (const uid of TARGET_ORPHANED_UIDS) {
    console.log(`\nProcessing UID: ${uid}...`);

    // 0. Verify account existence in Firebase Authentication
    let authUser = null;
    let authExists = false;
    try {
      authUser = await auth.getUser(uid);
      authExists = true;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        authExists = false;
      } else {
        console.warn(`  [Auth Check Warning] Could not inspect Firebase Auth: ${err.message}`);
      }
    }

    if (authExists) {
      console.log(`  [Auth Check] ⚠️ Account EXISTS in Firebase Auth: email="${authUser.email || 'none'}", created=${authUser.metadata?.creationTime}`);
      if (isApply && !isForce) {
        console.error(`  ⛔ SKIPPING UID ${uid}: Account exists in Firebase Auth! To purge an existing user, pass --force along with --apply.`);
        continue;
      }
    } else {
      console.log(`  [Auth Check] ✅ Account DOES NOT exist in Firebase Auth (confirmed orphan). Safe to purge.`);
    }

    // 1. Search across all leaderboards/*/players collectionGroup
    try {
      const weeklySnap = await db.collectionGroup('players').where('userId', '==', uid).get();
      for (const doc of weeklySnap.docs) {
        stats.weeklyPlayerDocsFound++;
        console.log(`  Found weekly player doc: ${doc.ref.path} (XP: ${doc.data().xp || 0})`);
        if (isApply) {
          await doc.ref.delete();
          stats.weeklyPlayerDocsDeleted++;
        }
      }
    } catch (e) {
      console.warn(`  Warning while querying players collectionGroup for ${uid}:`, e.message);
    }

    // 2. Search leaderboard_alltime/{uid}
    try {
      const alltimeRef = db.doc(`leaderboard_alltime/${uid}`);
      const alltimeSnap = await alltimeRef.get();
      if (alltimeSnap.exists) {
        stats.alltimeDocsFound++;
        console.log(`  Found leaderboard_alltime doc: ${alltimeRef.path} (totalXp: ${alltimeSnap.data().totalXp || 0})`);
        if (isApply) {
          await alltimeRef.delete();
          stats.alltimeDocsDeleted++;
        }
      }
    } catch (e) {
      console.warn(`  Warning while querying leaderboard_alltime for ${uid}:`, e.message);
    }

    // 3. Search root users/{uid}
    try {
      const userRef = db.doc(`users/${uid}`);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        stats.userDocsFound++;
        console.log(`  Found user root doc: ${userRef.path}`);
        if (isApply) {
          await userRef.delete();
          stats.userDocsDeleted++;
        }
      }

      // 4. Search all known subcollections users/{uid}/{subcollection}/*
      for (const subcol of KNOWN_SUBCOLLECTIONS) {
        const subSnap = await userRef.collection(subcol).get();
        for (const subDoc of subSnap.docs) {
          stats.subcollectionDocsFound++;
          console.log(`  Found subcollection doc: ${subDoc.ref.path}`);
          if (isApply) {
            await subDoc.ref.delete();
            stats.subcollectionDocsDeleted++;
          }
        }
      }
    } catch (e) {
      console.warn(`  Warning while querying users/${uid} for subcollections:`, e.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(' PURGE EXECUTION SUMMARY');
  console.log('='.repeat(70));
  console.log(` Weekly player docs:       Found ${stats.weeklyPlayerDocsFound}, Deleted: ${stats.weeklyPlayerDocsDeleted}`);
  console.log(` All-time player docs:     Found ${stats.alltimeDocsFound}, Deleted: ${stats.alltimeDocsDeleted}`);
  console.log(` User root docs:           Found ${stats.userDocsFound}, Deleted: ${stats.userDocsDeleted}`);
  console.log(` Subcollection docs:       Found ${stats.subcollectionDocsFound}, Deleted: ${stats.subcollectionDocsDeleted}`);
  console.log('='.repeat(70));

  if (!isApply) {
    console.log('\n💡 Dry-run completed. To execute deletions, run:');
    console.log('   node scripts/purge_orphans.mjs --apply');
    console.log('   (or pass --force if account exists in Firebase Auth)\n');
  } else {
    console.log('\n✅ Deletions applied successfully.\n');
  }
}

purgeOrphanedAccounts().catch((err) => {
  console.error('Fatal error during purge:', err);
  process.exit(1);
});
