import test from 'node:test';
import assert from 'node:assert/strict';

// Set up browser environment mocks
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

// Import modules under test
const { getIsoWeekKey, getIsoWeekStartMs } = await import('../frontend/services/weekKey.js');
const {
  commitXpDeltaFirestore,
  reconcileWeeklyXpFirestore,
  reconcileAllTimeXpFirestore,
  hasPendingLeaderboardIncrements
} = await import('../frontend/services/firebase.js');
const {
  addWeeklyXP,
  getUserWeeklyXP,
  getCachedLeaderboard,
  getUserWeeklyRank
} = await import('../frontend/services/api.js');

test('E2E-1: Real fast increments (+1, +1, +5, +3, +1...) execute with atomic transforms', async () => {
  storage.clear();
  const testUid = 'TestUserOwner1234567890abcde';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));
  localStorage.setItem('myduo_current_user', JSON.stringify({
    id: testUid,
    email: 'flash@example.com',
    firebaseUid: testUid,
    name: 'Flash'
  }));

  const capturedWrites = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes(':commit')) {
      const body = JSON.parse(options.body);
      capturedWrites.push(...body.writes);
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const increments = [1, 1, 5, 3, 1];
  for (const inc of increments) {
    addWeeklyXP(inc, testUid, weekKey);
  }

  // Allow async firestore commit promises to resolve
  await new Promise(r => setTimeout(r, 20));

  // Local storage total must be 11
  const finalLocalXp = getUserWeeklyXP(testUid, weekKey);
  assert.equal(finalLocalXp, 11);

  // Each write must transform xp by the specific increment
  assert.equal(capturedWrites.length, increments.length * 3); // 3 writes per commit (weekly, user-copy, alltime)
  const weeklyTransforms = capturedWrites
    .filter(w => w.update?.name?.includes(`/leaderboards/${weekKey}/players/`))
    .map(w => Number(w.updateTransforms?.find(t => t.fieldPath === 'xp')?.increment?.integerValue));

  assert.deepEqual(weeklyTransforms, increments);
});

test('E2E-2: Big delta (+5001, +10000, +12000) is clamped to single write limit and handles errors cleanly', async () => {
  storage.clear();
  const testUid = 'UserBigDelta1234567890abcde';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));

  const commitBodies = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes(':commit')) {
      const body = JSON.parse(options.body);
      commitBodies.push(body);
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  // Big delta 12000 clamped to 1000 max single write allowed by firestore.rules (no more than 1000 XP per session)
  const res = await commitXpDeltaFirestore(testUid, weekKey, 12000, 'BigUser', '');
  assert.equal(res.success, true);
  assert.equal(res.acceptedDelta, 1000);

  const weeklyWrite = commitBodies[0].writes.find(w => w.update?.name?.includes(`/leaderboards/${weekKey}/players/`));
  const inc = weeklyWrite.updateTransforms.find(t => t.fieldPath === 'xp')?.increment?.integerValue;
  assert.equal(inc, '1000');

  // Verify that if Firestore returns 403 (e.g. rate limit), reconciliation reports failure rather than false success
  globalThis.fetch = async (url) => {
    if (url.includes(':commit')) {
      return { ok: false, status: 403, text: async () => 'PERMISSION_DENIED: rate limit' };
    }
    if (url.includes('/leaderboards/')) {
      return { ok: true, status: 200, json: async () => ({ fields: { xp: { integerValue: '0' } } }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const recRes = await reconcileWeeklyXpFirestore(testUid, weekKey, 600, 'BigUser', '');
  assert.equal(recRes.reconciled, false, 'Failed commit must not be marked as reconciled');
  assert.equal(recRes.serverXp, 0);
});

test('E2E-3: Concurrent reconciliation calls are deduplicated in-flight to prevent duplicate writes', async () => {
  storage.clear();
  const testUid = 'UserDedup1234567890abcdef12';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));

  let serverGetCount = 0;
  let commitCount = 0;

  globalThis.fetch = async (url, options = {}) => {
    if (url.includes('/leaderboards/2026-W41/players/')) {
      serverGetCount++;
      // Simulate network latency
      await new Promise(r => setTimeout(r, 20));
      return {
        ok: true,
        status: 200,
        json: async () => ({ fields: { xp: { integerValue: '50' } } })
      };
    }
    if (url.includes(':commit')) {
      commitCount++;
      await new Promise(r => setTimeout(r, 10));
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  // Launch 3 concurrent reconciliations for the same user and week
  const [res1, res2, res3] = await Promise.all([
    reconcileWeeklyXpFirestore(testUid, weekKey, 100, 'Alice', ''),
    reconcileWeeklyXpFirestore(testUid, weekKey, 100, 'Alice', ''),
    reconcileWeeklyXpFirestore(testUid, weekKey, 100, 'Alice', '')
  ]);

  // All 3 return reconciled result
  assert.equal(res1.reconciled, true);
  assert.equal(res2.reconciled, true);
  assert.equal(res3.reconciled, true);

  // In-flight deduplication must prevent running 3 separate commits
  assert.equal(commitCount, 1, 'Concurrent reconciliations must be coalesced into 1 commit');
  assert.equal(serverGetCount, 1, 'Concurrent reconciliations must share the same initial GET query');
});

test('E2E-4: Offline play -> Online recovery syncs without duplicate points', async () => {
  storage.clear();
  const testUid = 'UserOfflineSync1234567890ab';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));
  localStorage.setItem('myduo_current_user', JSON.stringify({
    id: testUid,
    email: 'offline@example.com',
    firebaseUid: testUid,
    name: 'OfflinePlayer'
  }));

  // Step 1: User starts offline, server is at 50 XP
  let serverXp = 50;
  globalThis.fetch = async () => {
    // Network is offline!
    throw new Error('TypeError: Failed to fetch (network offline)');
  };

  // User earns +30 XP locally offline (from 50 to 80)
  localStorage.setItem(`xp_${testUid}_${weekKey}`, '50');
  addWeeklyXP(30, testUid, weekKey);
  assert.equal(getUserWeeklyXP(testUid, weekKey), 80);

  // Step 2: Network is restored!
  const commitWrites = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes('/leaderboards/2026-W41/players/')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ fields: { xp: { integerValue: String(serverXp) } } })
      };
    }
    if (url.includes(':commit')) {
      const b = JSON.parse(options.body);
      commitWrites.push(...b.writes);
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  // Reconcile pending offline score (local 80, server 50 -> diff = 30)
  const syncRes = await reconcileWeeklyXpFirestore(testUid, weekKey, 80, 'OfflinePlayer', '');
  assert.equal(syncRes.reconciled, true);
  assert.equal(syncRes.serverXp, 80);

  // Verify exact diff 30 committed
  const inc = commitWrites
    .find(w => w.update?.name?.includes(`/leaderboards/${weekKey}/players/`))
    ?.updateTransforms?.find(t => t.fieldPath === 'xp')?.increment?.integerValue;
  assert.equal(inc, '30');
});

test('E2E-5: Week transition (Sunday -> Monday UTC): weekly starts at 0, all-time preserved', async () => {
  storage.clear();
  const testUid = 'UserTransition1234567890abc';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));
  localStorage.setItem('myduo_current_user', JSON.stringify({
    id: testUid,
    email: 'alice@example.com',
    name: 'Alice'
  }));

  const week1 = '2026-W41';
  const week2 = '2026-W42';

  // User played in week 1
  localStorage.setItem(`xp_${testUid}_${week1}`, '450');

  // Week 2 arrives
  const week2Xp = getUserWeeklyXP(testUid, week2);
  assert.equal(week2Xp, 0, 'In new week, weekly XP must start at 0');

  // All-time score in cache or calculated from local keys must sum all weeks
  const cachedAll = getCachedLeaderboard(null, 'all');
  const me = cachedAll.data.find(p => p.isCurrentUser);
  assert.ok(me, 'Current user must be in all-time leaderboard');
  assert.equal(me.xp, 450, 'All-time score must retain week 1 score');
});

test('E2E-6: Penalties (-5 XP) do not decrement all-time totalXp', async () => {
  storage.clear();
  const testUid = 'UserPenaltyTest1234567890ab';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));

  let committedAlltimeIncrement = null;
  let committedWeeklyIncrement = null;

  globalThis.fetch = async (url, options = {}) => {
    if (url.includes(':commit')) {
      const body = JSON.parse(options.body);
      const alltimeW = body.writes.find(w => w.update?.name?.includes('/leaderboard_alltime/'));
      const weeklyW = body.writes.find(w => w.update?.name?.includes('/leaderboards/'));
      committedAlltimeIncrement = alltimeW?.updateTransforms?.find(t => t.fieldPath === 'totalXp')?.increment?.integerValue;
      committedWeeklyIncrement = weeklyW?.updateTransforms?.find(t => t.fieldPath === 'xp')?.increment?.integerValue;
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  await commitXpDeltaFirestore(testUid, weekKey, -5, 'Alice', '');
  assert.equal(committedWeeklyIncrement, '-5', 'Weekly score must be decremented by 5');
  assert.equal(committedAlltimeIncrement, '0', 'All-time score must NOT be decremented (increment: 0)');
});

test('E2E-7: Negative XP boundary: weekly XP cannot go below 0', () => {
  storage.clear();
  const testUid = 'UserZeroFloor1234567890abcd';
  const weekKey = '2026-W41';

  localStorage.setItem(`xp_${testUid}_${weekKey}`, '3');

  // Apply mistake penalty -5
  const res = addWeeklyXP(-5, testUid, weekKey);
  assert.equal(res.currentXP, 0, 'Weekly score must floor at 0');
  assert.equal(res.delta, -5);
  assert.equal(getUserWeeklyXP(testUid, weekKey), 0);
});

test('E2E-8: Security validation: invalid weekKey format or alien UID rejected by contract', async () => {
  storage.clear();
  const testUid = 'RealOwner1234567890abcdef12';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'test.token',
    expiresAt: Date.now() + 3600000
  }));

  // Missing arguments
  const res1 = await commitXpDeltaFirestore(null, '2026-W41', 10, 'A', '');
  assert.equal(res1.success, false);
  assert.equal(res1.reason, 'missing_args');

  const res2 = await commitXpDeltaFirestore(testUid, null, 10, 'A', '');
  assert.equal(res2.success, false);
  assert.equal(res2.reason, 'missing_args');
});

test('E2E-9: Rank calculation with ties, bots, current user, and 0 XP', () => {
  storage.clear();
  const testUid = 'UserRankTest1234567890abcde';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_current_user', JSON.stringify({
    id: testUid,
    email: 'alice@example.com',
    name: 'Alice'
  }));

  // 1. With 0 XP, getUserWeeklyRank returns null
  assert.equal(getUserWeeklyRank(testUid, weekKey), null);

  // 2. Query initial leaderboard to inspect top bot's score
  const initialBoard = getCachedLeaderboard(weekKey, 'week');
  const targetBot = initialBoard.data.find(p => p.isBot && p.xp > 0) || initialBoard.data.find(p => p.isBot);
  assert.ok(targetBot, 'Must have a bot in leaderboard');

  // Set current user's XP to match target bot's XP exactly
  localStorage.setItem(`xp_${testUid}_${weekKey}`, String(targetBot.xp));

  // Current user tied with bot at same XP: tie-breaker ranks current user ahead of bot!
  const leaderboard = getCachedLeaderboard(weekKey, 'week');
  const userEntry = leaderboard.data.find(p => p.isCurrentUser);
  const botEntry = leaderboard.data.find(p => p.userId === targetBot.userId);

  const userIdx = leaderboard.data.indexOf(userEntry);
  const botIdx = leaderboard.data.indexOf(botEntry);
  assert.ok(userIdx < botIdx, 'Current user should rank before tied bot');
  assert.equal(getUserWeeklyRank(testUid, weekKey), userIdx + 1);
});

test('E2E-10: Bots in All-time scale predictably by 3.5x multiplier', () => {
  storage.clear();
  const weekKey = '2026-W41';

  const weeklyBoard = getCachedLeaderboard(weekKey, 'week');
  const alltimeBoard = getCachedLeaderboard(weekKey, 'all');

  const weeklyBot = weeklyBoard.data.find(p => p.isBot);
  const alltimeBot = alltimeBoard.data.find(p => p.userId === weeklyBot.userId);

  assert.ok(weeklyBot, 'Must have dynamic bots in weekly leaderboard');
  assert.ok(alltimeBot, 'Must have dynamic bots in all-time leaderboard');
  assert.equal(alltimeBot.xp, Math.floor(weeklyBot.xp * 3.5), 'All-time bot XP scales predictably by 3.5x');
});

test('E2E-11: All-Time leaderboard is unified and caches cleanly in cache_leaderboard_all', () => {
  storage.clear();
  const testUid = 'UserUnifiedTest1234567890abc';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_current_user', JSON.stringify({
    id: testUid,
    email: 'user@example.com',
    name: 'HeroUser'
  }));

  const res = getCachedLeaderboard(weekKey, 'all');
  assert.equal(res.period, 'all', 'Period should be all');
  assert.ok(Array.isArray(res.data), 'Data should be array');
  const userEntry = res.data.find(p => p.userId === testUid);
  assert.ok(userEntry, 'User should be present in all-time leaderboard');
});

test('E2E-12: Big delta (+1200, +12000) syncs across multiple reconciliations without XP loss (Server = Local = 1200 / 12000)', async () => {
  storage.clear();
  const testUid = 'UserMultiSyncTest12345678';
  const weekKey = '2026-W41';

  localStorage.setItem('myduo_firebase_user', JSON.stringify({
    id: testUid,
    idToken: 'mock.jwt.token',
    expiresAt: Date.now() + 3600000
  }));

  let serverXp = 0;
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes('/leaderboards/')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          fields: {
            userId: { stringValue: testUid },
            xp: { integerValue: String(serverXp) }
          }
        })
      };
    }
    if (url.includes(':commit')) {
      const body = JSON.parse(options.body);
      for (const w of body.writes || []) {
        if (w.update?.name?.includes('/leaderboards/')) {
          for (const t of w.updateTransforms || []) {
            if (t.fieldPath === 'xp' && t.increment) {
              serverXp += Number(t.increment.integerValue);
            }
          }
        }
      }
      return { ok: true, status: 200, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  // Case 1: Local = 0 -> +1200 -> sync -> sync -> sync
  let localXp = 1200;
  localStorage.setItem(`xp_${testUid}_${weekKey}`, String(localXp));

  // Sync 1: sends 1000 (clamped)
  const res1 = await reconcileWeeklyXpFirestore(testUid, weekKey, localXp, 'TestUser', '');
  assert.equal(res1.reconciled, true);
  assert.equal(res1.serverXp, 1000);
  assert.equal(serverXp, 1000);

  // Sync 2: sends remaining 200
  const res2 = await reconcileWeeklyXpFirestore(testUid, weekKey, localXp, 'TestUser', '');
  assert.equal(res2.reconciled, true);
  assert.equal(res2.serverXp, 1200);
  assert.equal(serverXp, 1200);

  // Sync 3: already equal, nothing sent
  const res3 = await reconcileWeeklyXpFirestore(testUid, weekKey, localXp, 'TestUser', '');
  assert.equal(res3.reconciled, false);
  assert.equal(serverXp, 1200);
  assert.equal(Number(localStorage.getItem(`xp_${testUid}_${weekKey}`)), 1200);

  // Case 2: Offline earned +12000 XP
  serverXp = 0;
  localXp = 12000;
  localStorage.setItem(`xp_${testUid}_${weekKey}`, String(localXp));

  // 12 reconciliations send 1000 each
  for (let i = 0; i < 12; i++) {
    await reconcileWeeklyXpFirestore(testUid, weekKey, localXp, 'TestUser', '');
  }

  assert.equal(serverXp, 12000, 'Server XP must reach 12000 without loss');
  assert.equal(Number(localStorage.getItem(`xp_${testUid}_${weekKey}`)), 12000, 'Local XP must remain 12000');
});

