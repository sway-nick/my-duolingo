import {
  PRO_KEYS,
  isProActive,
  setEntitlement,
  clearEntitlement,
  getEntitlement,
} from './proState.js?v=386.0';
import { getEffectiveUserId } from './authService.js?v=386.0';
import { redeemPromoCodeFirestore, fetchProEntitlementFirestore } from './firebase.js?v=386.0';

export const PRO_PRODUCT_ID = 'eb_pro_lifetime';

async function sha256Hex(input) {
  const str = String(input || '');
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const data = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (_) {}
  // Fallback deterministic non-crypto hash for environments without SubtleCrypto
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function getBillingPlugin() {
  if (typeof window === 'undefined' || !window.Capacitor || !window.Capacitor.Plugins) {
    return null;
  }
  return window.Capacitor.Plugins.Billing || null;
}

function isNative() {
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

class ProServiceImpl {
  constructor() {
    this._initialized = false;
    this._initPromise = null;
    this._listenerHandle = null;
    this._cachedOffer = null;
    this._bindLogoutCleanup();
  }

  _bindLogoutCleanup() {
    if (this._logoutListenerBound) return;
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    this._logoutListenerBound = true;
    window.addEventListener('myduo:pre_logout', () => {
      const current = getEntitlement();
      if (current && current.source === 'promo') {
        clearEntitlement();
      }
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(PRO_KEYS.PROMO_REDEEMED);
        }
      } catch (_) {}
    });
    window.addEventListener('eb:pro-changed', () => {
      try {
        if (typeof window.setAnalyticsUserProperty === 'function') {
          window.setAnalyticsUserProperty('is_pro', isProActive() ? 'true' : 'false');
        }
        if (typeof window.syncProToLeaderboard === 'function') {
          window.syncProToLeaderboard();
        }
      } catch (_) {}
    });
  }

  isPro() {
    return isProActive();
  }

  onChange(cb) {
    if (typeof cb !== 'function' || typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return () => {};
    }
    const handler = (ev) => {
      cb(Boolean(ev?.detail?.active ?? this.isPro()));
    };
    window.addEventListener('eb:pro-changed', handler);
    return () => window.removeEventListener('eb:pro-changed', handler);
  }

  async init() {
    if (this._initialized) return true;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      if (typeof window !== 'undefined') {
        window.ProService = this;
      }

      const Billing = getBillingPlugin();
      if (!Billing || !isNative()) {
        this._initialized = true;
        return false;
      }

      try {
        if (typeof Billing.addListener === 'function' && !this._listenerHandle) {
          this._listenerHandle = await Billing.addListener('purchaseUpdated', (payload) => {
            this._handlePurchaseUpdate(payload).catch(() => {});
          });
        }
        await Billing.init();
        await this.revalidate();
        this._initialized = true;
        return true;
      } catch (err) {
        console.warn('ProService init failed:', err);
        this._initialized = true;
        return false;
      }
    })();

    return this._initPromise;
  }

  async _handlePurchaseUpdate(payload) {
    if (!payload) return;
    const list = Array.isArray(payload.purchases) ? payload.purchases : [payload];
    for (const p of list) {
      if (p && p.productId === PRO_PRODUCT_ID && p.state === 'PURCHASED') {
        await this._grantFromPlayPurchase(p);
        return;
      }
    }
  }

  async _grantFromPlayPurchase(purchase) {
    const Billing = getBillingPlugin();
    if (Billing && !purchase.acknowledged && purchase.purchaseToken) {
      try {
        await Billing.acknowledge({ purchaseToken: purchase.purchaseToken });
      } catch (err) {
        console.warn('Billing acknowledge error:', err);
      }
    }
    const tokenHash = purchase.purchaseToken ? await sha256Hex(purchase.purchaseToken) : null;
    setEntitlement({
      active: true,
      source: 'play',
      productId: purchase.productId || PRO_PRODUCT_ID,
      orderId: purchase.orderId || null,
      tokenHash,
      verifiedAt: Date.now(),
    });
  }

  async revalidate() {
    const Billing = getBillingPlugin();
    if (!Billing || !isNative()) return this.isPro();

    try {
      const res = await Billing.queryPurchases();
      const purchases = Array.isArray(res?.purchases) ? res.purchases : [];
      const activePlay = purchases.find(
        (p) => p && p.productId === PRO_PRODUCT_ID && p.state === 'PURCHASED'
      );

      if (activePlay) {
        await this._grantFromPlayPurchase(activePlay);
        return true;
      }

      // Only clear Play-sourced entitlements (preserve promo entitlements)
      const current = getEntitlement();
      if (current && current.source === 'play') {
        clearEntitlement();
      }
      if (!this.isPro()) {
        const fsEnt = await fetchProEntitlementFirestore(getEffectiveUserId());
        if (fsEnt && fsEnt.active) {
          setEntitlement({
            active: true,
            source: 'promo',
            productId: PRO_PRODUCT_ID,
            tokenHash: fsEnt.tokenHash || null,
            verifiedAt: Date.now(),
          });
          return true;
        }
      }
      return this.isPro();
    } catch (err) {
      console.warn('ProService revalidate failed:', err);
      return this.isPro();
    }
  }

  async getOffer() {
    if (this._cachedOffer) return this._cachedOffer;
    const Billing = getBillingPlugin();
    if (!Billing || !isNative()) return null;

    try {
      const details = await Billing.getProductDetails({ productId: PRO_PRODUCT_ID });
      if (!details) return null;

      const offers = Array.isArray(details.offers) ? details.offers : [];
      const bestOffer = offers.find((o) => o && o.offerToken) || offers[0] || null;

      const formattedPrice = bestOffer?.formattedPrice || details.formattedPrice || null;
      const priceMicros = Number(bestOffer?.priceMicros ?? details.priceMicros ?? 0);
      const fullPriceMicros = Number(bestOffer?.fullPriceMicros ?? details.priceMicros ?? 0);
      const fullFormattedPrice =
        fullPriceMicros > priceMicros && details.formattedPrice
          ? details.formattedPrice
          : null;
      const discountPercent =
        bestOffer?.discountPercent != null
          ? Number(bestOffer.discountPercent)
          : (fullPriceMicros > priceMicros && fullPriceMicros > 0
              ? Math.round(((fullPriceMicros - priceMicros) / fullPriceMicros) * 100)
              : 0);

      this._cachedOffer = {
        productId: details.productId || PRO_PRODUCT_ID,
        formattedPrice,
        fullFormattedPrice,
        discountPercent,
        currency: details.currency || null,
        offerToken: bestOffer?.offerToken || null,
      };
      return this._cachedOffer;
    } catch (err) {
      console.warn('ProService getOffer failed:', err);
      return null;
    }
  }

  async purchase() {
    const Billing = getBillingPlugin();
    if (!Billing || !isNative()) {
      return { status: 'error' };
    }

    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('pro_purchase_started');
    }

    try {
      const offer = await this.getOffer();
      const params = { productId: PRO_PRODUCT_ID };
      if (offer?.offerToken) {
        params.offerToken = offer.offerToken;
      }
      const res = await Billing.purchase(params);
      if (!res || res.status === 'cancelled') {
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('pro_purchase_cancelled', { code: res?.responseCode ?? 1 });
        }
        return { status: 'cancelled' };
      }
      if (res.status === 'pending') {
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('pro_purchase_pending');
        }
        return { status: 'pending' };
      }
      if (res.status === 'already_owned') {
        const reval = await this.revalidate();
        if (reval) {
          if (typeof window !== 'undefined' && window.trackEvent) {
            window.trackEvent('pro_purchase_success', { restored_existing: true });
          }
          return { status: 'purchased' };
        }
      }
      if (res.status === 'purchased') {
        await this._grantFromPlayPurchase({
          productId: PRO_PRODUCT_ID,
          purchaseToken: res.purchaseToken,
          orderId: res.orderId,
          acknowledged: false,
        });
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('pro_purchase_success');
        }
        return { status: 'purchased' };
      }
      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('pro_purchase_error', {
          code: res?.responseCode ?? -1,
          reason: String(res?.debugMessage || 'unknown_error').slice(0, 100),
        });
      }
      return {
        status: 'error',
        responseCode: res?.responseCode ?? -1,
        debugMessage: res?.debugMessage,
      };
    } catch (err) {
      console.warn('ProService purchase failed:', err);
      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('pro_purchase_error', {
          code: -1,
          reason: String(err?.message || err || 'exception').slice(0, 100),
        });
      }
      return { status: 'error', responseCode: -1, debugMessage: String(err?.message || err) };
    }
  }

  async restore() {
    const Billing = getBillingPlugin();
    if (!Billing || !isNative()) {
      return { restored: false, status: 'unavailable' };
    }
    const active = await this.revalidate();
    if (active && typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('pro_restore_success');
    }
    return { restored: Boolean(active), status: active ? 'restored' : 'none' };
  }

  async redeemPromoCode(code) {
    const clean = String(code || '').trim().toUpperCase();
    if (clean.length < 12) {
      return { ok: false, reason: 'invalid' };
    }
    const codeHash = await sha256Hex(clean);
    const res = await redeemPromoCodeFirestore(getEffectiveUserId(), codeHash);
    if (!res || !res.ok) {
      return { ok: false, reason: res?.reason || 'invalid' };
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PRO_KEYS.PROMO_REDEEMED, codeHash);
      }
    } catch (_) {}
    setEntitlement({
      active: true,
      source: 'promo',
      productId: PRO_PRODUCT_ID,
      tokenHash: codeHash,
      verifiedAt: Date.now(),
    });
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('pro_promo_redeemed');
    }
    return { ok: true };
  }

  openPaywall(reason = 'settings', extra = {}) {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('pro_paywall_open', { reason: String(reason || 'settings') });
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('eb:pro-paywall', { detail: { reason, ...(extra || {}) } }));
    }
  }
}

export const ProService = new ProServiceImpl();
export default ProService;
