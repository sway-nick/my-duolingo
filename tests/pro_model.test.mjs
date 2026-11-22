import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LOCALE_CODES } from '../frontend/config/locales.js';
import {
  PRO_KEYS,
  PRO_LIMITS,
  isProActive,
  setEntitlement,
  clearEntitlement,
  getFreeShieldsLeft,
  consumeFreeShield,
  getTestLearnedCount,
  getMicroRuleQuota,
  getUnlockableTenseIds,
  isPatternText,
} from '../frontend/services/proState.js';
import { PRO_I18N, getProStrings } from '../frontend/services/proI18n.js';
import { AdService } from '../frontend/services/adService.js';
import { ProService } from '../frontend/services/proService.js';
import { toggleFavoriteApi, getUserFavorites, addCustomWord } from '../frontend/services/api.js';

function installMockLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
  return store;
}

test('PRO State: defaults, entitlement set/clear, and 72h native cache TTL', () => {
  installMockLocalStorage();
  assert.equal(isProActive(), false);

  const t0 = 1_700_000_000_000;
  setEntitlement({ active: true, source: 'play', productId: 'eb_pro_lifetime', verifiedAt: t0 });
  assert.equal(isProActive(t0 + 1000), true);

  // Simulate native Capacitor environment to test 72h TTL
  const prevWin = globalThis.window;
  globalThis.window = {
    Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' },
  };
  try {
    assert.equal(isProActive(t0 + 71 * 3600 * 1000), true);
    assert.equal(isProActive(t0 + 73 * 3600 * 1000), false);
  } finally {
    globalThis.window = prevWin;
  }

  clearEntitlement();
  assert.equal(isProActive(), false);
  assert.equal(globalThis.localStorage.getItem(PRO_KEYS.ENTITLEMENT), null);
});

test('PRO State: 3 daily XP shields, calendar reset, and clock rollback protection', () => {
  installMockLocalStorage();
  const day1 = new Date(2026, 10, 15, 12, 0, 0).getTime();

  // Not PRO -> 0 shields
  assert.equal(getFreeShieldsLeft(day1), 0);
  assert.equal(consumeFreeShield(day1), false);

  setEntitlement({ active: true, source: 'play', verifiedAt: day1 });
  assert.equal(getFreeShieldsLeft(day1), PRO_LIMITS.PRO_DAILY_SHIELDS);

  assert.equal(consumeFreeShield(day1 + 1000), true);
  assert.equal(getFreeShieldsLeft(day1 + 1000), 2);
  assert.equal(consumeFreeShield(day1 + 2000), true);
  assert.equal(consumeFreeShield(day1 + 3000), true);
  assert.equal(getFreeShieldsLeft(day1 + 3000), 0);
  assert.equal(consumeFreeShield(day1 + 4000), false);

  // Clock rolled back 2 days -> must NOT reset shields
  const rolledBack = day1 - 2 * 86400 * 1000;
  assert.equal(getFreeShieldsLeft(rolledBack), 0);
  assert.equal(consumeFreeShield(rolledBack), false);

  // Next calendar day -> resets to 3
  const day2 = new Date(2026, 10, 16, 9, 0, 0).getTime();
  assert.equal(getFreeShieldsLeft(day2), 3);
});

test('PRO Quotas: test learned count, micro-rules, tense thresholds, and pattern detection', () => {
  const progress = {
    w1: { inputCorrect: 1, mastered: true },
    w2: { inputCorrect: 2, mastered: true },
    w3: { inputCorrect: 0, mastered: true }, // cards_know only, not input test
    w4: { inputCorrect: 1, mastered: false },
  };
  assert.equal(getTestLearnedCount(progress), 2);

  assert.equal(getMicroRuleQuota(0), 5);
  assert.equal(getMicroRuleQuota(29), 5);
  assert.equal(getMicroRuleQuota(30), 6);
  assert.equal(getMicroRuleQuota(65), 7);

  assert.deepEqual(getUnlockableTenseIds(0), ['present_simple', 'past_simple', 'future_simple']);
  assert.ok(getUnlockableTenseIds(150).includes('present_continuous'));
  assert.ok(!getUnlockableTenseIds(149).includes('present_continuous'));
  assert.equal(getUnlockableTenseIds(2500).length, 16);

  assert.equal(isPatternText('apple'), false);
  assert.equal(isPatternText('  apple  '), false);
  assert.equal(isPatternText('look forward to'), true);
  assert.equal(isPatternText('give up'), true);
});

test('AdService + PRO: interstitials disabled, banner disabled, 3 free daily shields', async () => {
  installMockLocalStorage();
  const origDisabled = AdService.interstitialsDisabled;
  AdService.interstitialsDisabled = false;
  try {
    // Set install time > 7 days ago so grace period is inactive
    globalThis.localStorage.setItem('myduo_first_install_time', String(Date.now() - 10 * 86400 * 1000));
    assert.equal(AdService.canShowHourlyInterstitial(), true);

    setEntitlement({ active: true, source: 'play', verifiedAt: Date.now() });
    assert.equal(AdService.canShowHourlyInterstitial(), false);

    // Banner suppressed when PRO
    AdService.isBannerActive = false;
    await AdService.showBottomBanner();
    assert.equal(AdService.isBannerActive, false);

    // 3 free shields work even when offline
    const origIsOnline = AdService.isOnline;
    AdService.isOnline = () => false;
    try {
      for (let i = 0; i < 3; i++) {
        const res = await AdService.showShieldRewardedAd();
        assert.equal(res.rewardEarned, true);
        assert.equal(res.source, 'pro_free');
      }
      // 4th shield falls back to normal offline check
      const res4 = await AdService.showShieldRewardedAd();
      assert.equal(res4.rewardEarned, false);
      assert.equal(res4.isOffline, true);
    } finally {
      AdService.isOnline = origIsOnline;
      clearEntitlement();
    }
  } finally {
    AdService.interstitialsDisabled = origDisabled;
  }
});

test('PRO I18N: all 36 locales + pt-br & es-mx have all 22 keys and placeholders', () => {
  const requiredKeys = [
    'pro_title',
    'pro_badge',
    'pro_buy',
    'pro_restore',
    'pro_restore_none',
    'pro_promo_placeholder',
    'pro_promo_apply',
    'pro_promo_ok',
    'pro_promo_bad',
    'pro_pending',
    'pro_benefit_noads',
    'pro_benefit_grammar',
    'pro_benefit_favs',
    'pro_benefit_shields',
    'pro_fav_limit',
    'pro_pattern_only',
    'pro_unlock_learn_or_pro',
    'pro_shields_left',
    'pro_discount',
    'pro_thanks',
    'pro_sim_free_on',
    'pro_sim_free_off',
  ];

  const expectedLocales = [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx'];
  for (const loc of expectedLocales) {
    const dict = PRO_I18N[loc];
    assert.ok(dict, `Missing PRO_I18N locale: ${loc}`);
    for (const key of requiredKeys) {
      assert.equal(typeof dict[key], 'string', `Missing key ${key} in ${loc}`);
      assert.ok(dict[key].trim().length > 0, `Empty key ${key} in ${loc}`);
    }
    assert.ok(dict.pro_unlock_learn_or_pro.includes('{n}'), `Missing {n} in pro_unlock_learn_or_pro for ${loc}`);
    assert.ok(dict.pro_shields_left.includes('{n}'), `Missing {n} in pro_shields_left for ${loc}`);
    assert.ok(dict.pro_discount.includes('{p}'), `Missing {p} in pro_discount for ${loc}`);
  }

  assert.equal(getProStrings('pt-BR'), PRO_I18N['pt-br']);
  assert.equal(getProStrings('es-MX'), PRO_I18N['es-mx']);
  assert.equal(getProStrings('xx-unknown'), PRO_I18N.en);
});

test('Free-tier gates: 100 Favorites limit and custom pattern block (bypassed in PRO)', async () => {
  installMockLocalStorage();
  clearEntitlement();

  const origFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options = {}) => {
    const body = options.body ? JSON.parse(options.body) : {};
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          word: {
            id: `custom_mock_${Date.now()}`,
            word: body.word,
            translation: body.translation,
            category: body.category || 'Общие',
            notes: body.notes || '',
          },
        },
      }),
    };
  };

  try {
    // Seed 100 favorites for guest user
    const seed = Array.from({ length: 100 }, (_, i) => `w_${i}`);
    globalThis.localStorage.setItem('favs_guest', JSON.stringify(seed));

    const blockedFav = await toggleFavoriteApi('w_101', true);
    assert.deepEqual(blockedFav, { blocked: 'favorites_limit' });
    assert.equal(getUserFavorites().length, 100);

    // Custom pattern blocked in free mode
    const blockedPattern = await addCustomWord({ word: 'look forward to', translation: 'ждать', category: 'Pattern', notes: '' });
    assert.deepEqual(blockedPattern, { blocked: 'custom_pattern' });

    // Single word allowed in free mode
    const okWord = await addCustomWord({ word: 'serendipity', translation: 'интуиция', category: 'Общие', notes: 'good word' });
    assert.equal(okWord?.blocked, undefined);
    assert.equal(okWord?.word?.word, 'serendipity');

    // PRO unlocks > 100 favorites and custom patterns
    setEntitlement({ active: true, source: 'play', verifiedAt: Date.now() });
    await toggleFavoriteApi('w_101', true);
    assert.equal(getUserFavorites().length, 101);

    const okPattern = await addCustomWord({ word: 'break a leg', translation: 'удачи', category: 'Pattern', notes: '' });
    assert.equal(okPattern?.blocked, undefined);
    assert.equal(okPattern?.word?.word, 'break a leg');
  } finally {
    globalThis.fetch = origFetch;
    clearEntitlement();
  }
});

test('ProService: rejects short promo codes (<12 chars) and exposes openPaywall', async () => {
  const shortRes = await ProService.redeemPromoCode('SHORT123');
  assert.deepEqual(shortRes, { ok: false, reason: 'invalid' });
  assert.equal(typeof ProService.openPaywall, 'function');
  assert.equal(typeof ProService.restore, 'function');
});

test('ProService: clears promo entitlement on logout while preserving play entitlement', () => {
  installMockLocalStorage();
  const listeners = {};
  const origWindow = globalThis.window;
  globalThis.window = {
    ...(origWindow || {}),
    addEventListener: (ev, cb) => {
      listeners[ev] = listeners[ev] || [];
      listeners[ev].push(cb);
    },
    dispatchEvent: (ev) => {
      const list = listeners[ev?.type] || [];
      for (const cb of list) cb(ev);
      return true;
    },
  };
  try {
    ProService._logoutListenerBound = false;
    ProService._bindLogoutCleanup();

    // 1. Promo entitlement must be cleared on myduo:pre_logout
    setEntitlement({ active: true, source: 'promo', tokenHash: 'abc123', verifiedAt: Date.now() });
    globalThis.localStorage.setItem(PRO_KEYS.PROMO_REDEEMED, 'abc123');
    assert.equal(isProActive(), true);
    globalThis.window.dispatchEvent({ type: 'myduo:pre_logout' });
    assert.equal(isProActive(), false);
    assert.equal(globalThis.localStorage.getItem(PRO_KEYS.PROMO_REDEEMED), null);

    // 2. Play entitlement must remain intact on myduo:pre_logout
    setEntitlement({ active: true, source: 'play', verifiedAt: Date.now() });
    assert.equal(isProActive(), true);
    globalThis.window.dispatchEvent({ type: 'myduo:pre_logout' });
    assert.equal(isProActive(), true);
    clearEntitlement();
  } finally {
    globalThis.window = origWindow;
  }
});

test('PRO State: setDebugForceFree overrides active Play PRO without erasing entitlement', async () => {
  const { isDebugForceFree, setDebugForceFree } = await import('../frontend/services/proState.js');
  installMockLocalStorage();
  setEntitlement({ active: true, source: 'play', verifiedAt: Date.now() });
  assert.equal(isProActive(), true);
  assert.equal(isDebugForceFree(), false);

  setDebugForceFree(true);
  assert.equal(isDebugForceFree(), true);
  assert.equal(isProActive(), false, 'Force Free must disable PRO across the app');

  setDebugForceFree(false);
  assert.equal(isDebugForceFree(), false);
  assert.equal(isProActive(), true, 'Disabling Force Free restores original Play PRO');
  clearEntitlement();
});
