import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test runner
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (i) => Array.from(storage.keys())[i] || null,
};
globalThis.window = {
  location: { hostname: 'localhost' },
  localStorage: globalThis.localStorage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Import services
import { saveProgress, getUserWeeklyXP, addWeeklyXP } from '../frontend/services/api.js';
import { getEffectiveUserId } from '../frontend/services/authService.js';
import { AdService, AD_CONFIG } from '../frontend/services/adService.js';

test('1. Input Mode: Standard major mistake applies -20 XP penalty', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(100, userId);
  assert.equal(getUserWeeklyXP(userId), 100);

  await saveProgress(101, false, 'input', { penaltyOverride: -20 });
  assert.equal(getUserWeeklyXP(userId), 80, '100 XP - 20 XP = 80 XP');
});

test('2. Input Mode: XP Shield used via Rewarded Ad applies 0 XP penalty', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(100, userId);

  await saveProgress(102, false, 'input', { shieldUsed: true });
  assert.equal(getUserWeeklyXP(userId), 100, 'Score protected by shield: 100 XP - 0 XP = 100 XP');
});

test('3. Input Mode: Offline / ad unavailable fallback applies -10 XP penalty', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(100, userId);

  await saveProgress(103, false, 'input', { isOfflineFallback: true });
  assert.equal(getUserWeeklyXP(userId), 90, 'Offline gentle penalty: 100 XP - 10 XP = 90 XP');
});

test('4. Input Mode: Second chance typo fix applies -1 XP penalty', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(100, userId);

  await saveProgress(104, true, 'input', { secondChanceFix: true });
  assert.equal(getUserWeeklyXP(userId), 99, 'Typo fixed: 100 XP - 1 XP = 99 XP');
});

test('5. Input Mode: First-try correct spelling gives +3 XP', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(100, userId);

  await saveProgress(105, true, 'input', {});
  assert.equal(getUserWeeklyXP(userId), 103, 'Correct spelling: 100 XP + 3 XP = 103 XP');
});

test('6. Minimum Boundary: Weekly XP never drops below 0 despite multiple -20 XP penalties', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(15, userId); // User has only 15 XP
  assert.equal(getUserWeeklyXP(userId), 15);

  // Apply -20 XP penalty
  await saveProgress(106, false, 'input', { penaltyOverride: -20 });
  assert.equal(getUserWeeklyXP(userId), 0, 'Clamped to minimum 0 XP (15 - 20 => 0)');

  // Another mistake when already at 0 XP
  await saveProgress(107, false, 'input', { penaltyOverride: -20 });
  assert.equal(getUserWeeklyXP(userId), 0, 'Cannot go negative: remains 0 XP');
});

test('7. AdService: Shield limits and round lifecycle', () => {
  AdService.resetRoundShields();
  assert.equal(AdService.getShieldsRemaining(), 3, 'Initial shields in round must be 3');

  AdService.shieldsUsedInRound++;
  assert.equal(AdService.getShieldsRemaining(), 2, '2 shields remaining');

  AdService.shieldsUsedInRound++;
  assert.equal(AdService.getShieldsRemaining(), 1, '1 shield remaining');

  AdService.shieldsUsedInRound++;
  assert.equal(AdService.getShieldsRemaining(), 0, '0 shields remaining');
  assert.equal(AdService.canUseShield(), false, 'Cannot use shield when 0 remain');

  AdService.resetRoundShields();
  assert.equal(AdService.getShieldsRemaining(), 3, 'Resets back to 3 shields for new round');
});

test('8. AdService Config: Verifies correct AdMob App ID and Ad Unit IDs', () => {
  assert.equal(AD_CONFIG.APP_ID, 'ca-app-pub-9917058160362744~9932614693');
  assert.equal(AD_CONFIG.UNITS.REWARDED_SHIELD, 'ca-app-pub-9917058160362744/1964468644');
  assert.equal(AD_CONFIG.UNITS.REWARDED_PACKS, 'ca-app-pub-9917058160362744/5712141963');
  assert.equal(AD_CONFIG.UNITS.INTERSTITIAL_ROUND, 'ca-app-pub-9917058160362744/8667634483');
  assert.equal(AD_CONFIG.UNITS.BANNER_FAVORITES, 'ca-app-pub-9917058160362744/5957710665');
});

test('8b. AdService Interstitial: Preload and round completion lifecycle', async () => {
  assert.equal(typeof AdService.preloadInterstitial, 'function', 'preloadInterstitial must be exposed');
  assert.equal(typeof AdService.showRoundFinishInterstitial, 'function', 'showRoundFinishInterstitial must be exposed');

  // Initial state: last ad just shown, 0 rounds completed
  AdService.roundsCompletedSinceLastAd = 0;
  AdService.lastInterstitialTime = Date.now();

  // Round 1 (deferred because roundsCompletedSinceLastAd = 1 < minRoundsBetweenInterstitials 2)
  const res1 = await AdService.showRoundFinishInterstitial();
  assert.equal(res1, false, 'Round 1 is deferred by frequency cap');
  assert.equal(AdService.roundsCompletedSinceLastAd, 1);

  // Round 2 (triggers interstitial in Web Simulator mode)
  const res2 = await AdService.showRoundFinishInterstitial();
  assert.equal(res2, true, 'Round 2 displays interstitial');
  assert.equal(AdService.roundsCompletedSinceLastAd, 0, 'Rounds counter resets after show');
  assert.ok(AdService.lastInterstitialTime > 0, 'Timestamp is updated');
});

test('9. Pairs Mode: Round completion awards +5 XP', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(50, userId);
  assert.equal(getUserWeeklyXP(userId), 50);

  // Normal pair match during round (0 XP)
  await saveProgress(201, true, 'pairs', {});
  assert.equal(getUserWeeklyXP(userId), 50, 'Intermediate match does not add round XP yet');

  // Final pair in set of pairs with roundComplete: true (+5 XP)
  await saveProgress(202, true, 'pairs', { roundComplete: true });
  assert.equal(getUserWeeklyXP(userId), 55, 'Completing the set of pairs awards +5 XP: 50 XP + 5 XP = 55 XP');
});

test('10. Pairs Mode: Wrong match applies -5 XP penalty', async () => {
  storage.clear();
  const userId = getEffectiveUserId();
  addWeeklyXP(50, userId);

  await saveProgress(203, false, 'pairs', { isPairMistake: true });
  assert.equal(getUserWeeklyXP(userId), 45, 'Wrong pair match applies -5 XP penalty: 50 XP - 5 XP = 45 XP');
});

