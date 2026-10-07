#!/usr/bin/env node
/**
 * scripts/audit_leaderboard.mjs
 * Read-only audit script for Firestore leaderboards.
 * 
 * Audits:
 * 1. Orphaned documents in leaderboards/* /players and leaderboard_alltime (no matching users/{uid})
 * 2. Documents with xp higher than realistic weekly maximum (> 15000 XP)
 * 3. Duplicates of the same person under different UIDs (matching non-generic names)
 * 4. Documents where data.userId does not match document ID
 *
 * Output: Console table & JSON report
 *
 * Usage:
 *   node scripts/audit_leaderboard.mjs
 *   node scripts/audit_leaderboard.mjs --save-json
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const MAX_REALISTIC_WEEKLY_XP = 15000;
const saveJson = process.argv.includes('--save-json');

if (getApps().length === 0) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'english-breakfast-181ba';
  initializeApp({ projectId });
}

const db = getFirestore();

async function runAudit() {
  console.log('\n🔍 Starting Read-Only Firestore Leaderboard Audit...\n');

  // 1. Fetch all weekly player documents
  console.log('Fetching all weekly players via collectionGroup("players")...');
  const weeklySnap = await db.collectionGroup('players').get();
  console.log(`Retrieved ${weeklySnap.size} weekly player document(s).`);

  // 2. Fetch all all-time player documents
  console.log('Fetching all documents from leaderboard_alltime...');
  const alltimeSnap = await db.collection('leaderboard_alltime').get();
  console.log(`Retrieved ${alltimeSnap.size} all-time player document(s).`);

  // 3. Collect unique UIDs across all leaderboard documents
  const allUids = new Set();
  weeklySnap.docs.forEach(d => {
    allUids.add(d.id);
    const u = d.data().userId;
    if (u) allUids.add(u);
  });
  alltimeSnap.docs.forEach(d => {
    allUids.add(d.id);
    const u = d.data().userId;
    if (u) allUids.add(u);
  });

  console.log(`Checking ${allUids.size} unique user UID(s) against collection /users ...`);

  // 4. Batch check user profile existence in /users/{uid}
  const existingUsers = new Set();
  const uidList = Array.from(allUids);
  const CHUNK_SIZE = 100;
  for (let i = 0; i < uidList.length; i += CHUNK_SIZE) {
    const chunk = uidList.slice(i, i + CHUNK_SIZE);
    const refs = chunk.map(uid => db.collection('users').doc(uid));
    const snaps = await db.getAll(...refs);
    snaps.forEach(snap => {
      if (snap.exists) existingUsers.add(snap.id);
    });
  }

  console.log(`Verified ${existingUsers.size} user document(s) in /users.\n`);

  // 5. Run Audit Checks
  const issues = [];
  const playersByName = new Map();

  // Audit Weekly Documents
  for (const doc of weeklySnap.docs) {
    const data = doc.data() || {};
    const docPath = doc.ref.path;
    const docId = doc.id;
    const userId = data.userId;
    const xp = Number(data.xp || 0);
    const name = String(data.name || '').trim();

    // Check 1: ID mismatch
    if (userId && userId !== docId) {
      issues.push({
        type: 'ID_MISMATCH',
        scope: 'weekly',
        path: docPath,
        docId,
        userId,
        name,
        xp,
        details: `doc.id (${docId}) != data.userId (${userId})`
      });
    }

    // Check 2: Orphaned document (no users/{uid})
    const effectiveUid = userId || docId;
    if (!existingUsers.has(effectiveUid)) {
      issues.push({
        type: 'ORPHANED_DOC',
        scope: 'weekly',
        path: docPath,
        docId,
        userId: effectiveUid,
        name,
        xp,
        details: `No document /users/${effectiveUid} found`
      });
    }

    // Check 3: XP above realistic maximum
    if (xp > MAX_REALISTIC_WEEKLY_XP) {
      issues.push({
        type: 'XP_OVER_MAX',
        scope: 'weekly',
        path: docPath,
        docId,
        userId: effectiveUid,
        name,
        xp,
        details: `XP (${xp}) exceeds weekly cap (${MAX_REALISTIC_WEEKLY_XP})`
      });
    }

    // Collect for duplicate name check
    if (name && name.toLowerCase() !== 'гость' && name.toLowerCase() !== 'deleted' && name.toLowerCase() !== 'user') {
      const lower = name.toLowerCase();
      if (!playersByName.has(lower)) playersByName.set(lower, new Set());
      playersByName.get(lower).add(effectiveUid);
    }
  }

  // Audit All-Time Documents
  for (const doc of alltimeSnap.docs) {
    const data = doc.data() || {};
    const docPath = doc.ref.path;
    const docId = doc.id;
    const userId = data.userId;
    const totalXp = Number(data.totalXp != null ? data.totalXp : (data.xp || 0));
    const name = String(data.name || '').trim();

    // Check 1: ID mismatch
    if (userId && userId !== docId) {
      issues.push({
        type: 'ID_MISMATCH',
        scope: 'alltime',
        path: docPath,
        docId,
        userId,
        name,
        xp: totalXp,
        details: `doc.id (${docId}) != data.userId (${userId})`
      });
    }

    // Check 2: Orphaned document
    const effectiveUid = userId || docId;
    if (!existingUsers.has(effectiveUid)) {
      issues.push({
        type: 'ORPHANED_DOC',
        scope: 'alltime',
        path: docPath,
        docId,
        userId: effectiveUid,
        name,
        xp: totalXp,
        details: `No document /users/${effectiveUid} found`
      });
    }
  }

  // Check 4: Duplicate players under different UIDs
  const duplicateIssues = [];
  playersByName.forEach((uids, nameKey) => {
    if (uids.size > 1) {
      const uidArr = Array.from(uids);
      const dup = {
        type: 'DUPLICATE_NAME',
        name: nameKey,
        uids: uidArr,
        count: uidArr.length,
        details: `Identical player name "${nameKey}" used by ${uidArr.length} different UIDs: ${uidArr.join(', ')}`
      };
      issues.push(dup);
      duplicateIssues.push(dup);
    }
  });

  // 6. Output Table Presentation
  console.log('================ AUDIT RESULTS SUMMARY ================');
  console.log(`Total leaderboard issues found: ${issues.length}`);
  const summaryByType = {};
  issues.forEach(i => {
    summaryByType[i.type] = (summaryByType[i.type] || 0) + 1;
  });
  console.table(Object.entries(summaryByType).map(([Type, Count]) => ({ Type, Count })));

  if (issues.length > 0) {
    console.log('\n================ DETAILED ISSUES TABLE ================');
    const tableData = issues.map((item, idx) => ({
      '#': idx + 1,
      Type: item.type,
      Scope: item.scope || 'name',
      UID: item.userId || (item.uids ? item.uids[0] : item.docId),
      Name: item.name || '',
      XP: item.xp != null ? item.xp : '-',
      Details: item.details
    }));
    console.table(tableData.slice(0, 100)); // Print up to 100 rows
    if (tableData.length > 100) {
      console.log(`... and ${tableData.length - 100} more items.`);
    }
  } else {
    console.log('✅ No anomalies or integrity issues detected in leaderboards!');
  }

  // 7. Output JSON
  const report = {
    timestamp: new Date().toISOString(),
    totalWeeklyDocs: weeklySnap.size,
    totalAlltimeDocs: alltimeSnap.size,
    totalUniqueUids: allUids.size,
    totalExistingUsers: existingUsers.size,
    issuesCount: issues.length,
    summaryByType,
    issues
  };

  if (saveJson) {
    fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2), 'utf-8');
    console.log('\n📄 Full JSON audit report saved to audit_report.json');
  }

  console.log('\n================ AUDIT JSON EXCERPT ================');
  console.log(JSON.stringify({
    timestamp: report.timestamp,
    issuesCount: report.issuesCount,
    summaryByType: report.summaryByType
  }, null, 2));

  return report;
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
