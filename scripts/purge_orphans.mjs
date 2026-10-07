#!/usr/bin/env node
/**
 * scripts/purge_orphans.mjs
 *
 * Purges orphaned/corrupted accounts from Firestore that were previously hidden in client code.
 * Target UIDs identified from repository history (git show origin/main:frontend/services/firebase.js):
 *   - b9Puaf5jtthwQlOPvAdZJ1o5CBC3
 *   - jf0lHNZnwXVKzQpNh1FSYwkrDfl1
 *
 * Removes:
 *   - leaderboards/{weekKey}/players/{uid} (all weeks)
 *   - leaderboard_alltime/{uid}
 *   - users/{uid} and all subcollection documents
 *
 * Usage:
 *   node scripts/purge_orphans.mjs          # DRY RUN (no documents deleted)
 *   node scripts/purge_orphans.mjs --apply  # LIVE EXECUTION (deletes documents)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

async function purgeOrphanedAccounts() {
  console.log('='.repeat(70));
  console.log(` PURGE ORPHANED ACCOUNTS SCRIPT`);
  console.log(` Mode: ${isApply ? 'LIVE (APPLYING DELETIONS)' : 'DRY RUN (NO CHANGES WILL BE MADE)'}`);
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
      console.warn(`  Warning checking leaderboard_alltime for ${uid}:`, e.message);
    }

    // 3. Search users/{uid} and subcollections
    try {
      const userRef = db.doc(`users/${uid}`);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        stats.userDocsFound++;
        console.log(`  Found user profile doc: ${userRef.path}`);
        if (isApply) {
          await userRef.delete();
          stats.userDocsDeleted++;
        }
      }

      // Check subcollections
      for (const sub of KNOWN_SUBCOLLECTIONS) {
        const subSnap = await userRef.collection(sub).get();
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
      console.warn(`  Warning checking users/${uid} for ${uid}:`, e.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(' SUMMARY');
  console.log('='.repeat(70));
  console.table({
    'Weekly Player Docs': { Found: stats.weeklyPlayerDocsFound, Deleted: stats.weeklyPlayerDocsDeleted },
    'All-time Docs': { Found: stats.alltimeDocsFound, Deleted: stats.alltimeDocsDeleted },
    'User Profile Docs': { Found: stats.userDocsFound, Deleted: stats.userDocsDeleted },
    'Subcollection Docs': { Found: stats.subcollectionDocsFound, Deleted: stats.subcollectionDocsDeleted }
  });

  if (!isApply) {
    console.log('\nℹ  To perform actual deletion, re-run with: node scripts/purge_orphans.mjs --apply');
  } else {
    console.log('\n✅ Deletion complete.');
  }
}

purgeOrphanedAccounts().catch((err) => {
  console.error('Fatal error during purge:', err);
  process.exit(1);
});
