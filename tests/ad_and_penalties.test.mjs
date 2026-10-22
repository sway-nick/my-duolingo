import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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
import {
  saveProgress,
  getUserWeeklyXP,
  addWeeklyXP,
  getUserProgress,
  getActiveConveyorBatch,
  getQueueForCards,
  getQueueForQuiz,
  clearActiveConveyorBatch,
} from '../frontend/services/api.js';
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

  // Initial state: 0 rounds completed
  AdService.roundsCompletedSinceLastAd = 0;
  AdService.lastInterstitialTime = Date.now();

  // Round 1 (triggers interstitial after every round)
  const res1 = await AdService.showRoundFinishInterstitial();
  assert.equal(res1, true, 'Round 1 displays interstitial');
  assert.equal(AdService.roundsCompletedSinceLastAd, 0, 'Rounds counter resets after show');

  // Round 2 (triggers interstitial again on next round)
  const res2 = await AdService.showRoundFinishInterstitial();
  assert.equal(res2, true, 'Round 2 displays interstitial');
  assert.equal(AdService.roundsCompletedSinceLastAd, 0, 'Rounds counter resets after show');
  assert.ok(AdService.lastInterstitialTime > 0, 'Timestamp is updated');
});

test('8c. AdService Collections Exit Interstitial: Capped at max 2 times per day and min 1 hour interval', async () => {
  assert.equal(typeof AdService.showCollectionsExitInterstitial, 'function', 'showCollectionsExitInterstitial must be exposed');

  global.localStorage.removeItem('ad_col_exit_interstitial_stats');

  // First show: succeeds
  const res1 = await AdService.showCollectionsExitInterstitial();
  assert.equal(res1, true, 'First collections exit shows ad');

  // Immediate second show: blocked by 1-hour cooldown
  const res2 = await AdService.showCollectionsExitInterstitial();
  assert.equal(res2, false, 'Immediate second show is blocked by 1-hour cooldown');

  // Fast-forward 1 hour (modify lastShown in storage)
  const raw = JSON.parse(global.localStorage.getItem('ad_col_exit_interstitial_stats'));
  raw.lastShown = Date.now() - (3601 * 1000);
  global.localStorage.setItem('ad_col_exit_interstitial_stats', JSON.stringify(raw));

  // Second show after 1 hour: succeeds
  const res3 = await AdService.showCollectionsExitInterstitial();
  assert.equal(res3, true, 'Second show after 1 hour succeeds (count is now 2)');

  // Fast-forward another hour: blocked because daily cap of 2 is reached!
  const raw2 = JSON.parse(global.localStorage.getItem('ad_col_exit_interstitial_stats'));
  raw2.lastShown = Date.now() - (3601 * 1000);
  global.localStorage.setItem('ad_col_exit_interstitial_stats', JSON.stringify(raw2));

  const res4 = await AdService.showCollectionsExitInterstitial();
  assert.equal(res4, false, 'Third show in same day is blocked by daily cap (max 2/day)');
});

test('8d. AdService Training Early Exit Interstitial: 60-minute cooldown and unlimited daily frequency', async () => {
  assert.equal(typeof AdService.showTrainingEarlyExitInterstitial, 'function', 'showTrainingEarlyExitInterstitial must be exposed');

  global.localStorage.removeItem('ad_training_early_exit_last_time');

  // First show: succeeds
  const res1 = await AdService.showTrainingEarlyExitInterstitial();
  assert.equal(res1, true, 'First early exit shows ad');

  // Immediate second show: blocked by 60-minute cooldown
  const res2 = await AdService.showTrainingEarlyExitInterstitial();
  assert.equal(res2, false, 'Immediate second show is blocked by 60-minute cooldown');

  // Fast-forward 1 hour in storage
  const stored1 = Date.now() - (3601 * 1000);
  global.localStorage.setItem('ad_training_early_exit_last_time', String(stored1));

  // Second show after 1 hour: succeeds
  const res3 = await AdService.showTrainingEarlyExitInterstitial();
  assert.equal(res3, true, 'Second show after 1 hour succeeds');

  // Fast-forward another hour: succeeds again (no daily cap, unlimited per day!)
  const stored2 = Date.now() - (3601 * 1000);
  global.localStorage.setItem('ad_training_early_exit_last_time', String(stored2));

  const res4 = await AdService.showTrainingEarlyExitInterstitial();
  assert.equal(res4, true, 'Third show after another hour succeeds (unlimited daily frequency)');
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

test('11. Round Progress Preservation: Exiting after Cards into Quiz preserves Quiz queue and does not clear batch on Back/Logo/Tab switch', async () => {
  storage.clear();
  clearActiveConveyorBatch();

  const mockCategoryWords = [
    { id: 1001, word: 'apple', category: 'Elementary' },
    { id: 1002, word: 'bread', category: 'Elementary' },
    { id: 1003, word: 'cheese', category: 'Elementary' },
    { id: 1004, word: 'drink', category: 'Elementary' },
    { id: 1005, word: 'egg', category: 'Elementary' },
  ];

  // Step 1: Start round -> 5 words in Cards queue
  getActiveConveyorBatch(mockCategoryWords, getUserProgress(), []);
  let cardsQ = getQueueForCards(mockCategoryWords, getUserProgress(), []);
  assert.equal(cardsQ.length, 5, 'Initial Cards queue has 5 words');

  // Step 2: User completes Cards stage (marks all 5 words as learning)
  for (const w of mockCategoryWords) {
    await saveProgress(w.id, false, 'cards');
  }

  cardsQ = getQueueForCards(mockCategoryWords, getUserProgress(), []);
  const quizQ = getQueueForQuiz(mockCategoryWords, getUserProgress(), []);
  assert.equal(cardsQ.length, 0, 'Cards queue is now empty (0 words remaining)');
  assert.equal(quizQ.length, 5, 'Quiz queue has all 5 words ready');

  // Step 3: Verify index.html does NOT call clearActiveConveyorBatch() on Back button, Logo click, or renderTab
  const indexHtml = fs.readFileSync(path.resolve('frontend/index.html'), 'utf8');
  const backHandlerIdx = indexHtml.indexOf('window.handleAndroidBackButton = function()');
  assert.ok(backHandlerIdx !== -1, 'handleAndroidBackButton exists in index.html');
  const backHandlerBody = indexHtml.slice(backHandlerIdx);
  assert.equal(
    backHandlerBody.includes('clearActiveConveyorBatch()'),
    false,
    'handleAndroidBackButton MUST NOT call clearActiveConveyorBatch()'
  );

  const logoCommentIdx = indexHtml.indexOf('// Click on Logo / Brand -> Exit any practice');
  assert.ok(logoCommentIdx !== -1, 'Logo click handler exists in index.html');
  const logoBody = indexHtml.slice(logoCommentIdx, logoCommentIdx + 1200);
  assert.equal(
    logoBody.includes('clearActiveConveyorBatch()'),
    false,
    'Logo click handler MUST NOT call clearActiveConveyorBatch()'
  );

  const renderTabIdx = indexHtml.indexOf('async function renderTab(tabName');
  assert.ok(renderTabIdx !== -1, 'renderTab exists in index.html');
  const renderTabHeader = indexHtml.slice(renderTabIdx, renderTabIdx + 1800);
  assert.equal(
    renderTabHeader.includes('clearActiveConveyorBatch()'),
    false,
    'renderTab MUST NOT call clearActiveConveyorBatch()'
  );
});


