/**
 * Pure PRO entitlement, daily shields, and free-tier quota state.
 * Intentionally has ZERO imports to prevent circular dependencies with api.js and adService.js.
 */

export const PRO_KEYS = {
  ENTITLEMENT: 'eb_pro_entitlement_v1',
  SHIELDS: 'eb_pro_shields_v1',
  PROMO_REDEEMED: 'eb_pro_promo_redeemed_v1',
};

export const PRO_LIMITS = {
  FREE_FAVORITES_MAX: 100,
  MICRO_FREE_START: 5,
  MICRO_WORDS_PER_UNLOCK: 30,
  PRO_DAILY_SHIELDS: 3,
  CACHE_TTL_MS: 72 * 60 * 60 * 1000, // 72 hours
  CLOCK_ROLLBACK_TOLERANCE_MS: 60 * 60 * 1000, // 1 hour
  TENSE_THRESHOLDS: {
    present_simple: 0,
    past_simple: 0,
    future_simple: 0,
    present_continuous: 150,
    be_going_to: 300,
    past_continuous: 500,
    present_perfect: 700,
    used_to_would: 900,
    future_continuous: 1100,
    past_perfect: 1300,
    present_perfect_continuous: 1500,
    be_get_used_to: 1700,
    future_perfect: 1900,
    future_in_the_past: 2100,
    past_perfect_continuous: 2300,
    future_perfect_continuous: 2500,
  },
};

function getLocalDateKey(nowMs = Date.now()) {
  const d = new Date(nowMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function readJsonStorage(key) {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function writeJsonStorage(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function removeStorage(key) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  } catch (_) {}
}

function dispatchProChanged(active) {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('eb:pro-changed', { detail: { active: Boolean(active) } }));
    }
  } catch (_) {}
}

function isNativeEnv() {
  try {
    if (typeof window === 'undefined' || !window.Capacitor) return false;
    if (typeof window.Capacitor.isNativePlatform === 'function') {
      return Boolean(window.Capacitor.isNativePlatform());
    }
    if (typeof window.Capacitor.getPlatform === 'function') {
      return window.Capacitor.getPlatform() !== 'web';
    }
    return false;
  } catch (_) {
    return false;
  }
}

export function getEntitlement() {
  return readJsonStorage(PRO_KEYS.ENTITLEMENT);
}

export function isProActive(nowMs = Date.now()) {
  const ent = getEntitlement();
  if (!ent || ent.active !== true) return false;

  if (isNativeEnv() && ent.source === 'play') {
    const verifiedAt = Number(ent.verifiedAt || 0);
    if (!verifiedAt || (nowMs - verifiedAt) > PRO_LIMITS.CACHE_TTL_MS) {
      return false;
    }
  }

  return true;
}

export function setEntitlement(obj) {
  const payload = {
    active: Boolean(obj && obj.active !== false),
    source: obj?.source === 'promo' ? 'promo' : 'play',
    productId: obj?.productId || null,
    orderId: obj?.orderId || null,
    tokenHash: obj?.tokenHash || null,
    verifiedAt: Number(obj?.verifiedAt || Date.now()),
  };
  writeJsonStorage(PRO_KEYS.ENTITLEMENT, payload);
  dispatchProChanged(payload.active);
  return payload;
}

export function clearEntitlement() {
  removeStorage(PRO_KEYS.ENTITLEMENT);
  dispatchProChanged(false);
}

function getShieldState(nowMs = Date.now()) {
  const today = getLocalDateKey(nowMs);
  const stored = readJsonStorage(PRO_KEYS.SHIELDS);

  if (!stored || typeof stored !== 'object') {
    return { date: today, used: 0, lastSeenMs: nowMs, rolledBack: false };
  }

  const lastSeenMs = Number(stored.lastSeenMs || 0);
  const rolledBack = lastSeenMs > 0 && nowMs < (lastSeenMs - PRO_LIMITS.CLOCK_ROLLBACK_TOLERANCE_MS);
  const storedUsed = Math.max(0, Math.min(PRO_LIMITS.PRO_DAILY_SHIELDS, Number(stored.used || 0)));

  if (rolledBack) {
    // Do not reset shields if device clock was rolled back
    return {
      date: stored.date || today,
      used: stored.date === today ? storedUsed : PRO_LIMITS.PRO_DAILY_SHIELDS,
      lastSeenMs,
      rolledBack: true,
    };
  }

  if (stored.date !== today) {
    return { date: today, used: 0, lastSeenMs: Math.max(nowMs, lastSeenMs), rolledBack: false };
  }

  return { date: today, used: storedUsed, lastSeenMs: Math.max(nowMs, lastSeenMs), rolledBack: false };
}

export function getFreeShieldsLeft(nowMs = Date.now()) {
  if (!isProActive(nowMs)) return 0;
  const state = getShieldState(nowMs);
  return Math.max(0, PRO_LIMITS.PRO_DAILY_SHIELDS - state.used);
}

export function consumeFreeShield(nowMs = Date.now()) {
  if (!isProActive(nowMs)) return false;
  const state = getShieldState(nowMs);
  if (state.used >= PRO_LIMITS.PRO_DAILY_SHIELDS) return false;

  const next = {
    date: state.date,
    used: state.used + 1,
    lastSeenMs: Math.max(nowMs, state.lastSeenMs),
  };
  writeJsonStorage(PRO_KEYS.SHIELDS, next);
  return true;
}

export function getTestLearnedCount(progressMap) {
  if (!progressMap || typeof progressMap !== 'object') return 0;
  let count = 0;
  for (const key of Object.keys(progressMap)) {
    const p = progressMap[key];
    if (p && Number(p.inputCorrect || 0) >= 1 && Boolean(p.mastered)) {
      count++;
    }
  }
  return count;
}

export function getMicroRuleQuota(learnedCount) {
  const n = Math.max(0, Math.floor(Number(learnedCount) || 0));
  return PRO_LIMITS.MICRO_FREE_START + Math.floor(n / PRO_LIMITS.MICRO_WORDS_PER_UNLOCK);
}

export function getUnlockableTenseIds(learnedCount) {
  const n = Math.max(0, Number(learnedCount) || 0);
  return Object.entries(PRO_LIMITS.TENSE_THRESHOLDS)
    .filter(([, threshold]) => n >= threshold)
    .map(([id]) => id);
}

export function isPatternText(word) {
  return String(word ?? '').trim().split(/\s+/).filter(Boolean).length > 1;
}
