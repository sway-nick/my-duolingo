#!/usr/bin/env node
/**
 * scripts/migrate_alltime.mjs
 * Migrates weekly player scores from collectionGroup('players') into leaderboard_alltime/{uid}.
 * 
 * Usage:
 *   node scripts/migrate_alltime.mjs           # Dry-run mode (default)
 *   node scripts/migrate_alltime.mjs --apply   # Apply changes to Firestore
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const isApply = process.argv.includes('--apply');

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'english-breakfast-181ba';
  initializeApp({
    projectId
  });
}

const db = getFirestore();

async function runMigration() {
  console.log(`\n🚀 Starting All-Time Leaderboard Migration`);
  console.log(`Mode: ${isApply ? '🔥 LIVE (APPLYING CHANGES)' : '🧪 DRY RUN (NO CHANGES WRITTEN)'}`);

  console.log('\n⚠️  ПРЕДУПРЕЖДЕНИЕ: Очки прошлых недель могли быть завышены из-за бага');
  console.log('автоматического пересчета всех слов (calcXp) при первом входе игрока в новой неделе.');
  console.log('Миграция суммирует все записанные недельные очки игроков.\n');

  console.log('Querying collectionGroup("players")...');
  const snapshot = await db.collectionGroup('players').get();

  console.log(`Found ${snapshot.size} player document(s) across all weekly leaderboards.`);

  const userStats = new Map();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const userId = data.userId || doc.id;
    if (!userId || userId === 'Deleted') continue;

    const xp = Math.max(0, Number(data.xp) || 0);
    const name = data.name || 'Гость';
    const avatar = data.avatar || '';
    const updatedAt = Number(data.updatedAt) || Date.now();

    if (!userStats.has(userId)) {
      userStats.set(userId, {
        userId,
        name,
        avatar,
        sumXp: 0,
        weeksCount: 0,
        latestUpdatedAt: updatedAt
      });
    }

    const stat = userStats.get(userId);
    stat.sumXp += xp;
    stat.weeksCount += 1;
    if (updatedAt >= stat.latestUpdatedAt) {
      stat.latestUpdatedAt = updatedAt;
      if (name && name !== 'Гость') stat.name = name;
      if (avatar) stat.avatar = avatar;
    }
  }

  console.log(`Aggregated scores for ${userStats.size} distinct user(s).\n`);

  const results = [];

  for (const [userId, stat] of userStats.entries()) {
    const alltimeRef = db.collection('leaderboard_alltime').doc(userId);
    const existingDoc = await alltimeRef.get();
    const currentTotal = existingDoc.exists ? (Number(existingDoc.data().totalXp) || 0) : 0;
    const finalTotal = Math.max(currentTotal, stat.sumXp);

    results.push({
      userId,
      name: stat.name,
      avatar: stat.avatar,
      weeksCount: stat.weeksCount,
      sumXp: stat.sumXp,
      currentTotal,
      finalTotal,
      changed: finalTotal !== currentTotal || !existingDoc.exists
    });

    if (isApply && (finalTotal !== currentTotal || !existingDoc.exists)) {
      await alltimeRef.set({
        userId,
        name: stat.name,
        avatar: stat.avatar,
        totalXp: finalTotal,
        updatedAt: Math.max(Date.now(), stat.latestUpdatedAt)
      }, { merge: true });
    }
  }

  console.table(results.map(r => ({
    userId: r.userId.slice(0, 12) + '...',
    name: r.name,
    weeks: r.weeksCount,
    sumWeeklyXP: r.sumXp,
    currentAllTime: r.currentTotal,
    newAllTime: r.finalTotal,
    action: r.changed ? (isApply ? '✅ UPDATED' : '📝 WOULD UPDATE') : '⏭️ UNCHANGED'
  })));

  if (!isApply) {
    console.log('\n💡 Dry-run completed. To apply changes to Firestore, run:');
    console.log('   node scripts/migrate_alltime.mjs --apply\n');
  } else {
    console.log('\n✅ Migration applied successfully!\n');
  }
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
