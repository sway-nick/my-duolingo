import test from 'node:test';
import assert from 'node:assert/strict';

// Set up minimal browser-like globals for unit testing ES modules
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(String(k), String(v)),
  removeItem: (k) => storage.delete(String(k)),
  clear: () => storage.clear(),
  key: (i) => Array.from(storage.keys())[i] || null,
  get length() {
    return storage.size;
  }
};
globalThis.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};
globalThis.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Import modules
const { getIsoWeekKey, getRecentWeekKeys } = await import('../frontend/services/weekKey.js');
const {
  commitXpDeltaFirestore,
  reconcileWeeklyXpFirestore,
  reconcileAllTimeXpFirestore,
  getWeeklyLeaderboardFirestore,
  getAllTimeLeaderboardFirestore,
  deleteAllUserFirestoreData,
  hasPendingLeaderboardIncrements
} = await import('../frontend/services/firebase.js');
const { fetchUserDataFromCloud, addWeeklyXP, getUserWeeklyXP } = await import('../frontend/services/api.js');

test('1. ISO week key at boundary conditions (UTC)', () => {
  // Sunday 2026-12-27 23:59:59.999Z -> 2026-W52
  assert.equal(getIsoWeekKey(new Date('2026-12-27T23:59:59.999Z')), '2026-W52');
  // Monday 2026-12-28 00:00:00.000Z -> 2026-W53
  assert.equal(getIsoWeekKey(new Date('2026-12-28T00:00:00.000Z')), '2026-W53');
  // Sunday 2027-01-03 23:59:59.999Z -> 2026-W53
  assert.equal(getIsoWeekKey(new Date('2027-01-03T23:59:59.999Z')), '2026-W53');
  // Monday 2027-01-04 00:00:00.000Z -> 2027-W01
  assert.equal(getIsoWeekKey(new Date('2027-01-04T00:00:00.000Z')), '2027-W01');

  // Recent week keys generates 8 weeks
  const recent = getRecentWeekKeys(8, new Date('2027-01-04T00:00:00Z'));
  assert.equal(recent.length, 8);
  assert.equal(recent[0], '2027-W01');
  assert.equal(recent[1], '2026-W53');
});

test('2. Atomic commit body contains increment transform instead of absolute value', async () => {
  const capturedRequests = [];
  globalThis.fetch = async (url, options = {}) => {
    capturedRequests.push({ url, options });
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ commitTime: new Date().toISOString() }),
      json: async () => ({ commitTime: new Date().toISOString() })
    };
  };

  const testUid = 'TestUserOwner1234567890abcde';
  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.id.token',
    expiresAt: Date.now() + 3600000
  }));

  const res = await commitXpDeltaFirestore(testUid, '2026-W41', 25, 'Alice', 'avatar.png');
  assert.equal(res.success, true);

  const commitReq = capturedRequests.find(r => r.url.includes(':commit'));
  assert.ok(commitReq, 'Must call documents:commit endpoint');

  const body = JSON.parse(commitReq.options.body);
  assert.ok(Array.isArray(body.writes), 'Body must contain writes array');

  // Verify write 1: weekly leaderboard player
  const weeklyWrite = body.writes.find(w => w.update?.name?.includes('/leaderboards/2026-W41/players/'));
  assert.ok(weeklyWrite, 'Must have write for weekly leaderboard');
  const weeklyXpTransform = weeklyWrite.updateTransforms.find(t => t.fieldPath === 'xp');
  assert.ok(weeklyXpTransform, 'Must transform xp');
  assert.equal(weeklyXpTransform.increment?.integerValue, '25');
  assert.ok(!weeklyWrite.updateMask.fieldPaths.includes('xp'), 'updateMask must not overwrite xp absolutely');

  // Verify write 2: leaderboard_alltime
  const alltimeWrite = body.writes.find(w => w.update?.name?.includes('/leaderboard_alltime/'));
  assert.ok(alltimeWrite, 'Must have write for alltime leaderboard');
  const alltimeXpTransform = alltimeWrite.updateTransforms.find(t => t.fieldPath === 'totalXp');
  assert.ok(alltimeXpTransform, 'Must transform totalXp');
  assert.equal(alltimeXpTransform.increment?.integerValue, '25');

  // Penalty write (-5): weekly decreases, alltime is NOT decremented
  capturedRequests.length = 0;
  await commitXpDeltaFirestore(testUid, '2026-W41', -5, 'Alice', 'avatar.png');
  const penaltyCommit = capturedRequests.find(r => r.url.includes(':commit'));
  const penaltyBody = JSON.parse(penaltyCommit.options.body);
  const penaltyWeekly = penaltyBody.writes.find(w => w.update?.name?.includes('/leaderboards/2026-W41/players/'));
  const penaltyWeeklyXp = penaltyWeekly.updateTransforms.find(t => t.fieldPath === 'xp');
  assert.equal(penaltyWeeklyXp?.increment?.integerValue, '-5');
  const penaltyAlltime = penaltyBody.writes.find(w => w.update?.name?.includes('/leaderboard_alltime/'));
  const penaltyAlltimeXp = penaltyAlltime?.updateTransforms?.find(t => t.fieldPath === 'totalXp');
  assert.equal(penaltyAlltimeXp?.increment?.integerValue, '0', 'totalXp must NOT be decremented on penalty (increment is 0 to initialize document if absent)');
});

test('3. Reconcile only upwards and never lowers score', async () => {
  const testUid = 'TestUserOwner1234567890abcde';
  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.id.token',
    expiresAt: Date.now() + 3600000
  }));

  let serverXp = 100;
  let commitCalledWith = null;

  globalThis.fetch = async (url, options = {}) => {
    if (url.includes(':commit')) {
      const b = JSON.parse(options.body);
      commitCalledWith = b;
      return { ok: true, status: 200, json: async () => ({}) };
    }
    // GET single document
    if (url.includes('/leaderboards/2026-W41/players/')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          fields: {
            xp: { integerValue: String(serverXp) }
          }
        })
      };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  // Case A: server has 100, local has 50 (e.g. played on another device)
  // Local must be raised to 100, server must NOT be lowered!
  const res1 = await reconcileWeeklyXpFirestore(testUid, '2026-W41', 50, 'Alice', '');
  assert.equal(res1.localXp, 100);
  assert.equal(commitCalledWith, null, 'Server must never be lowered');
  assert.equal(localStorage.getItem(`xp_${testUid}_2026-W41`), '100');

  // Case B: local has 150, server has 100 (e.g. played offline)
  // Difference of 50 must be committed to server
  commitCalledWith = null;
  const res2 = await reconcileWeeklyXpFirestore(testUid, '2026-W41', 150, 'Alice', '');
  assert.equal(res2.reconciled, true);
  assert.ok(commitCalledWith, 'Commit must be called for diff');
  const w = commitCalledWith.writes[0];
  const diffXpTransform = w.updateTransforms.find(t => t.fieldPath === 'xp');
  assert.equal(diffXpTransform?.increment?.integerValue, '50');
});

test('4. Fetching leaderboard queries with orderBy xp DESC and limit 110 with 250 docs (sorted by xp, not uid)', async () => {
  let capturedQuery = null;

  globalThis.fetch = async (url, options = {}) => {
    if (url.includes(':runQuery')) {
      capturedQuery = JSON.parse(options.body);
      // Simulate 250 documents in database, Firestore :runQuery returns top limitCount
      const docs = [];
      for (let i = 250; i >= 1; i--) {
        docs.push({
          document: {
            name: `projects/p/databases/d/documents/leaderboards/2026-W41/players/uid_random_${i}_${Math.random()}`,
            fields: {
              userId: { stringValue: `uid_random_${i}` },
              name: { stringValue: `Player ${i}` },
              xp: { integerValue: String(i * 10) }
            }
          }
        });
      }
      return {
        ok: true,
        status: 200,
        json: async () => docs.slice(0, capturedQuery.structuredQuery.limit)
      };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const players = await getWeeklyLeaderboardFirestore('2026-W41', 100);
  assert.ok(capturedQuery, ':runQuery must be called');
  assert.equal(capturedQuery.structuredQuery.orderBy[0].field.fieldPath, 'xp');
  assert.equal(capturedQuery.structuredQuery.orderBy[0].direction, 'DESCENDING');
  assert.equal(capturedQuery.structuredQuery.limit, 110);

  assert.equal(players.length, 100);
  // Must be sorted by xp DESC, NOT by uid
  assert.equal(players[0].xp, 2500);
  assert.equal(players[99].xp, 1510);
});

test('5. Non-existent leaderboard_alltime creates record capped at totalXp <= 5000', async () => {
  const testUid = 'TestUserOwner1234567890abcde';
  localStorage.clear();
  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.id.token',
    expiresAt: Date.now() + 3600000
  }));

  // Local keys sum = 6500 (week 1: 3000, week 2: 3500)
  localStorage.setItem(`xp_${testUid}_2026-W39`, '3000');
  localStorage.setItem(`xp_${testUid}_2026-W40`, '3500');

  const commitWrites = [];

  globalThis.fetch = async (url, options = {}) => {
    if (url.includes('/leaderboard_alltime/')) {
      // 404 does not exist
      return { ok: false, status: 404 };
    }
    if (url.includes(':commit')) {
      const b = JSON.parse(options.body);
      commitWrites.push(b.writes);
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const res = await reconcileAllTimeXpFirestore(testUid, 'Alice', '');
  assert.equal(res.reconciled, true);
  assert.equal(res.totalXp, 5000);

  // Must have 1 commit capped at 5000 with setToServerValue REQUEST_TIME
  assert.equal(commitWrites.length, 1);
  const firstWrite = commitWrites[0][0];
  assert.equal(firstWrite.update.fields.totalXp.integerValue, '5000');
  assert.equal(firstWrite.updateTransforms[0].setToServerValue, 'REQUEST_TIME');
});

test('6. User with big history and legacy xp key enters new week -> weekly XP starts at 0', async (t) => {
  const { mock } = await import('node:test');
  // Advance mock time to Monday of next week: 2026-10-12T02:00:00.000Z
  mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-12T02:00:00.000Z') });

  try {
    const testUid = 'TestUserOwner1234567890abcde';
    const currentWeekKey = getIsoWeekKey(); // dynamically evaluates to '2026-W42'

    localStorage.clear();
    localStorage.setItem('myduo_current_user', JSON.stringify({
      id: testUid,
      email: 'user@example.com',
      name: 'Alice',
      firebaseUid: testUid
    }));
    localStorage.setItem('myduo_firebase_user', JSON.stringify({
      id: testUid,
      idToken: 'test.id.token',
      expiresAt: Date.now() + 3600000
    }));

    // Old legacy keys: xp = 1250 (from past week)
    localStorage.setItem('xp', '1250');
    localStorage.setItem('dl_xp', '1250');
    // Past week XP key:
    localStorage.setItem(`xp_${testUid}_2026-W41`, '1250');

    // User has 50 mastered words in progress
    const bigProgress = {};
    for (let i = 1; i <= 50; i++) {
      bigProgress[`word_${i}`] = { mastered: true, stage: 'mastered' };
    }
    localStorage.setItem(`progress_${testUid}`, JSON.stringify(bigProgress));

    // Migrate guest data (simulates app load/login)
    const { setCurrentUser } = await import('../frontend/services/authService.js');
    setCurrentUser({ id: testUid, email: 'user@example.com', name: 'Alice', firebaseUid: testUid }, 'test.token');

    // Current week key must NOT get past week's 1250 points
    let currentWeeklyXp = getUserWeeklyXP(testUid, currentWeekKey);
    assert.equal(currentWeeklyXp, 0, `migrateGuestData must NOT transfer old plain xp to current week ${currentWeekKey}`);

    globalThis.fetch = async (url) => {
      // Return empty weekly XP (0) from Firestore
      return {
        ok: true,
        status: 200,
        json: async () => ({ documents: [] })
      };
    };

    await fetchUserDataFromCloud(testUid, currentWeekKey);

    const weeklyXpAfterCloud = getUserWeeklyXP(testUid, currentWeekKey);
    assert.equal(weeklyXpAfterCloud, 0, 'fetchUserDataFromCloud must NOT transfer calcXp or plain xp');
    assert.equal(localStorage.getItem('xp'), null, 'Legacy xp key must be cleared from storage');
  } finally {
    mock.timers.reset();
  }
});

test('7. deleteAllUserFirestoreData deletes leaderboard_alltime and recent 8 weeks', async () => {
  const testUid = 'TestUserOwner1234567890abcde';
  const deletedUrls = [];

  globalThis.fetch = async (url, options = {}) => {
    if (options.method === 'DELETE') {
      deletedUrls.push(url);
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  await deleteAllUserFirestoreData(testUid, 'test.token');

  // Verify leaderboard_alltime is deleted
  assert.ok(deletedUrls.some(u => u.includes(`/leaderboard_alltime/${testUid}`)), 'Must delete leaderboard_alltime');

  // Verify recent weekly player documents deleted
  const recentWeeks = getRecentWeekKeys(8);
  for (const wKey of recentWeeks) {
    assert.ok(
      deletedUrls.some(u => u.includes(`/leaderboards/${wKey}/players/${testUid}`)),
      `Must delete player doc for ${wKey}`
    );
  }
});
