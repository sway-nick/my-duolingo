/**
 * Google AdMob Integration Service
 * Manages Rewarded Ads, Interstitials, Banners and Shield mechanisms
 * Supports Capacitor Native AdMob with Graceful Web/Offline Fallbacks
 * and automatic fallback to official Google Test Units while ad units are pending review.
 */

// Production AdMob Unit IDs
export const AD_CONFIG = {
  APP_ID: 'ca-app-pub-9917058160362744~9932614693',
  UNITS: {
    REWARDED_SHIELD: 'ca-app-pub-9917058160362744/1964468644',
    REWARDED_PACKS: 'ca-app-pub-9917058160362744/5712141963',
    INTERSTITIAL_ROUND: 'ca-app-pub-9917058160362744/8667634483',
    BANNER_FAVORITES: 'ca-app-pub-9917058160362744/5957710665'
  },
  // Official Google AdMob Test Units (always return 100% filled test ads)
  TEST_UNITS: {
    REWARDED_SHIELD: 'ca-app-pub-3940256099942544/5224354917',
    REWARDED_PACKS: 'ca-app-pub-3940256099942544/5224354917',
    INTERSTITIAL_ROUND: 'ca-app-pub-3940256099942544/1033173712',
    BANNER_FAVORITES: 'ca-app-pub-3940256099942544/6300978111'
  }
};

class AdServiceImpl {
  constructor() {
    this.initialized = false;
    this.maxShieldsPerRound = 3;
    this.shieldsUsedInRound = 0;
    this.isShieldAdPrepared = false;
    this.isInterstitialPrepared = false;
    this.isPreparingInterstitial = false;
    this.isBannerActive = false;
    this.bannerCreated = false;
    this.roundsCompletedSinceLastAd = 0;
    this.minRoundsBetweenInterstitials = 2;
    this.lastInterstitialTime = 0;

    // Production AdMob ads enabled (account approved by Google).
    // Test devices registered in Google console or testingDevices receive test ads safely.
    this.useTestAds = false;

    // Bind methods
    this.init = this.init.bind(this);
  }

  getNativeAdMob() {
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins) {
      return window.Capacitor.Plugins.AdMob || null;
    }
    return null;
  }

  isNative() {
    return Boolean(
      typeof window !== 'undefined' &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === 'function' &&
      window.Capacitor.isNativePlatform()
    );
  }

  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  }

  /**
   * Initialize AdMob SDK
   */
  async init() {
    if (this.initialized) return;
    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          testingDevices: [
            'EMULATOR',
            '88fdb90c-2abb-45e2-b323-35336fbe2ddc',
            '88FDB90C-2ABB-45E2-B323-35336FBE2DDC'
          ],
          initializeForTesting: false
        });
        this.initialized = true;
        console.log('✅ Google AdMob initialized on Android');
        // Preload first rewarded ad and interstitial ad in the background
        this.preloadShieldAd().catch(() => {});
        this.preloadInterstitial().catch(() => {});
      } catch (err) {
        console.warn('⚠️ AdMob native init error:', err);
      }
    } else {
      this.initialized = true;
      console.log('ℹ️ AdMob running in Web/Simulator mode');
    }
  }

  /**
   * Reset shield counters when starting a new training round
   */
  resetRoundShields() {
    this.shieldsUsedInRound = 0;
    console.log('🛡️ Round shields reset. Available: 3/3');
    this.preloadShieldAd().catch(() => {});
    this.preloadInterstitial().catch(() => {});
  }

  /**
   * Get remaining shields in current training round
   */
  getShieldsRemaining() {
    return Math.max(0, this.maxShieldsPerRound - this.shieldsUsedInRound);
  }

  /**
   * Check if user can use a shield (has remaining shields and network available)
   */
  canUseShield() {
    return this.getShieldsRemaining() > 0 && this.isOnline();
  }

  /**
   * Get target ad unit ID based on test / production setting
   */
  getUnitId(type) {
    if (this.useTestAds) {
      return AD_CONFIG.TEST_UNITS[type] || AD_CONFIG.TEST_UNITS.REWARDED_SHIELD;
    }
    return AD_CONFIG.UNITS[type] || '';
  }

  /**
   * Prepare rewarded ad for display
   */
  async prepareRewarded(unitType = 'REWARDED_SHIELD') {
    const AdMob = this.getNativeAdMob();
    if (!AdMob || !this.isNative() || !this.isOnline()) return false;

    const primaryId = this.getUnitId(unitType);
    if (!primaryId) return false;

    try {
      await AdMob.prepareRewardVideoAd({ adId: primaryId });
      if (unitType === 'REWARDED_SHIELD') {
        this.isShieldAdPrepared = true;
      }
      return true;
    } catch (e) {
      console.warn(`AdMob unit ${primaryId} failed to load:`, e);
      return false;
    }
  }

  /**
   * Preload rewarded video ad for the shield
   */
  async preloadShieldAd() {
    return this.prepareRewarded('REWARDED_SHIELD');
  }

  /**
   * Preload Interstitial Ad in background so it displays with 0ms delay when a round finishes
   */
  async preloadInterstitial() {
    if (this.isPreparingInterstitial || this.isInterstitialPrepared) return false;
    const AdMob = this.getNativeAdMob();
    if (!AdMob || !this.isNative() || !this.isOnline()) return false;

    const adId = this.getUnitId('INTERSTITIAL_ROUND');
    if (!adId) return false;

    this.isPreparingInterstitial = true;
    try {
      await AdMob.prepareInterstitial({ adId });
      this.isInterstitialPrepared = true;
      console.log('✅ AdMob Interstitial preloaded and ready in memory');
      return true;
    } catch (err) {
      console.warn('⚠️ AdMob Interstitial preload error:', err);
      this.isInterstitialPrepared = false;
      return false;
    } finally {
      this.isPreparingInterstitial = false;
    }
  }

  /**
   * Show Rewarded Ad to save 20 XP in Test mode
   * Returns Promise<{ success: boolean, rewardEarned: boolean, isOffline: boolean }>
   */
  async showShieldRewardedAd() {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_shield_requested');
    }

    if (!this.isOnline()) {
      return { success: false, rewardEarned: false, isOffline: true };
    }

    if (this.getShieldsRemaining() <= 0) {
      return { success: false, rewardEarned: false, isOffline: false };
    }

    const AdMob = this.getNativeAdMob();

    // 1. Native Android AdMob Flow
    if (AdMob && this.isNative()) {
      return new Promise(async (resolve) => {
        let rewardGranted = false;
        let isResolved = false;
        const listeners = [];

        const cleanup = () => {
          listeners.forEach((sub) => {
            try { if (sub && typeof sub.remove === 'function') sub.remove(); } catch (e) {}
          });
          listeners.length = 0;
        };

        const safeResolve = (result) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(result);
        };

        try {
          // Listen to BOTH standard plugin event names to guarantee callback
          const onReward = () => {
            console.log('🏆 AdMob Rewarded video reward earned!');
            rewardGranted = true;
            if (typeof window !== 'undefined' && window.trackEvent) {
              window.trackEvent('ad_shield_reward_earned');
            }
          };

          const onDismiss = () => {
            console.log('📺 AdMob Rewarded video dismissed, reward =', rewardGranted);
            if (rewardGranted) {
              this.shieldsUsedInRound++;
              this.isShieldAdPrepared = false;
              this.preloadShieldAd().catch(() => {});
              safeResolve({ success: true, rewardEarned: true, isOffline: false });
            } else {
              safeResolve({ success: false, rewardEarned: false, isOffline: false });
            }
          };

          const onFailed = (err) => {
            console.warn('❌ AdMob Rewarded video failed to show:', err);
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
          };

          // Register across both naming conventions supported by Capacitor AdMob versions
          listeners.push(await AdMob.addListener('onRewardedVideoAdReward', onReward));
          listeners.push(await AdMob.addListener('onRewarded', onReward));
          listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', onFailed));
          listeners.push(await AdMob.addListener('onFailedToShow', onFailed));

          // Ensure video is prepared
          if (!this.isShieldAdPrepared) {
            const prepared = await this.prepareRewarded('REWARDED_SHIELD');
            if (!prepared) {
              safeResolve({ success: false, rewardEarned: false, isOffline: false });
              return;
            }
          }

          AdMob.showRewardVideoAd().catch((err) => {
            console.warn('AdMob show error, falling back:', err);
            onFailed(err);
          });
        } catch (err) {
          console.warn('AdMob show exception, falling back:', err);
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }
      });
    }

    // 2. Web / Browser Test Simulator Modal
    return this.showWebMockRewardedAd('🛡️ Защита 20 XP', true);
  }

  /**
   * Show Rewarded Ad to download a language or audio pack
   */
  async showLanguagePackRewardedAd(packTitle = 'Языковой пакет') {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_pack_requested', { pack: packTitle });
    }

    if (!this.isOnline()) {
      return { success: false, rewardEarned: false, isOffline: true };
    }

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      return new Promise(async (resolve) => {
        let rewardGranted = false;
        let isResolved = false;
        const listeners = [];

        const cleanup = () => {
          listeners.forEach((sub) => {
            try { if (sub && typeof sub.remove === 'function') sub.remove(); } catch (e) {}
          });
          listeners.length = 0;
        };

        const safeResolve = (result) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(result);
        };

        try {
          const onReward = () => {
            console.log('🏆 Language pack reward earned!');
            rewardGranted = true;
            if (typeof window !== 'undefined' && window.trackEvent) {
              window.trackEvent('ad_pack_reward_earned', { pack: packTitle });
            }
          };
          const onDismiss = () => {
            console.log('📺 Language pack ad dismissed, reward =', rewardGranted);
            safeResolve({ success: true, rewardEarned: rewardGranted, isOffline: false });
          };
          const onFailed = (err) => {
            console.warn('❌ Language pack ad failed to show:', err);
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
          };

          listeners.push(await AdMob.addListener('onRewardedVideoAdReward', onReward));
          listeners.push(await AdMob.addListener('onRewarded', onReward));
          listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', onFailed));
          listeners.push(await AdMob.addListener('onFailedToShow', onFailed));

          const prepared = await this.prepareRewarded('REWARDED_PACKS');
          if (!prepared) {
            console.warn('⚠️ Could not prepare REWARDED_PACKS ad');
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
            return;
          }

          AdMob.showRewardVideoAd().catch((err) => {
            console.warn('AdMob language pack show error:', err);
            onFailed(err);
          });
        } catch (e) {
          console.warn('⚠️ Exception in showLanguagePackRewardedAd:', e);
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }
      });
    }

    return this.showWebMockRewardedAd(`📦 Скачивание: ${packTitle}`, false);
  }

  /**
   * Show Interstitial Ad at the end of a round
   * Includes frequency capping (at least 2 rounds or 3 minutes)
   * Displays with 0ms delay if preloaded, and queues next preload in background
   */
  async showRoundFinishInterstitial() {
    this.roundsCompletedSinceLastAd++;
    const now = Date.now();
    const cooldownMs = 3 * 60 * 1000; // 3 minutes

    if (this.roundsCompletedSinceLastAd < this.minRoundsBetweenInterstitials && (now - this.lastInterstitialTime) < cooldownMs) {
      console.log(`ℹ️ Interstitial deferred: round ${this.roundsCompletedSinceLastAd}/${this.minRoundsBetweenInterstitials}`);
      this.preloadInterstitial().catch(() => {});
      return false;
    }

    if (!this.isOnline()) return false;

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('INTERSTITIAL_ROUND');
        if (!adId) return false;

        if (!this.isInterstitialPrepared) {
          console.log('⏳ Interstitial not preloaded, preparing now...');
          await AdMob.prepareInterstitial({ adId });
          this.isInterstitialPrepared = true;
        }

        await AdMob.showInterstitial();
        this.isInterstitialPrepared = false;

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('ad_interstitial_shown');
        }
        this.roundsCompletedSinceLastAd = 0;
        this.lastInterstitialTime = Date.now();

        // Immediately preload NEXT interstitial in background for next round
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 1500);

        return true;
      } catch (err) {
        console.warn('AdMob interstitial failed to load/show:', err);
        this.isInterstitialPrepared = false;
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 3000);
        return false;
      }
    }

    console.log('ℹ️ [Web Simulator] Round finish interstitial shown');
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_interstitial_shown');
    }
    this.roundsCompletedSinceLastAd = 0;
    this.lastInterstitialTime = Date.now();
    return true;
  }

  /**
   * Show Bottom Banner (Stats & Leaderboard)
   */
  async showBottomBanner() {
    if (this.isBannerActive || !this.isOnline()) return;
    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('BANNER_FAVORITES');
        if (!adId) return;
        await AdMob.showBanner({
          adId,
          adSize: 'ADAPTIVE_BANNER',
          position: 'BOTTOM_CENTER',
          margin: 0
        });
        this.bannerCreated = true;
        this.isBannerActive = true;
      } catch (e) {
        console.warn('AdMob banner error:', e);
      }
    } else {
      this.renderWebBannerPlaceholder(true);
      this.isBannerActive = true;
    }
  }

  /**
   * Hide Bottom Banner (cleanly removes view so re-entry creates a fresh banner)
   */
  async hideBottomBanner() {
    if (!this.isBannerActive && !this.bannerCreated) return;
    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      try {
        await AdMob.removeBanner();
      } catch (e) {
        try { await AdMob.hideBanner(); } catch (_) {}
      }
    } else {
      this.renderWebBannerPlaceholder(false);
    }
    this.bannerCreated = false;
    this.isBannerActive = false;
  }

  // Compatibility aliases
  async showFavoritesBanner() { return this.showBottomBanner(); }
  async hideFavoritesBanner() { return this.hideBottomBanner(); }

  /**
   * Web Mock Rewarded Ad Modal (for local browser testing and dev preview)
   */
  showWebMockRewardedAd(title = 'Просмотр рекламы', isShield = false) {
    return new Promise((resolve) => {
      const existing = document.getElementById('admob-mock-modal');
      if (existing) existing.remove();

      let timeLeft = 5;
      const modal = document.createElement('div');
      modal.id = 'admob-mock-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 24px;
        box-sizing: border-box;
      `;

      modal.innerHTML = `
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px 24px; max-width: 360px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="display: inline-block; background: #e65100; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 16px;">
            GOOGLE ADMOB PREVIEW
          </div>
          <div style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">${title}</div>
          <p style="font-size: 14px; color: #94a3b8; margin: 0 0 20px 0;">
            Вознаграждение будет начислено после окончания таймера:
          </p>
          <div id="mock-ad-timer" style="font-size: 42px; font-weight: 900; color: #f59e0b; margin-bottom: 20px; font-variant-numeric: tabular-nums;">
            ${timeLeft}с
          </div>
          <div style="background: #334155; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 24px;">
            <div id="mock-ad-progress" style="background: #f59e0b; height: 100%; width: 0%; transition: width 1s linear;"></div>
          </div>
          <button id="mock-ad-close-btn" style="background: transparent; border: 1px solid #475569; color: #94a3b8; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; display: none;">
            Пропустить (без награды)
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      const timerEl = modal.querySelector('#mock-ad-timer');
      const progressEl = modal.querySelector('#mock-ad-progress');
      const closeBtn = modal.querySelector('#mock-ad-close-btn');

      const interval = setInterval(() => {
        timeLeft--;
        if (progressEl) progressEl.style.width = `${((5 - timeLeft) / 5) * 100}%`;
        if (timerEl) timerEl.textContent = `${timeLeft}с`;

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (timerEl) {
            timerEl.textContent = '✓ Награда получена!';
            timerEl.style.color = '#22c55e';
            timerEl.style.fontSize = '24px';
          }
          setTimeout(() => {
            modal.remove();
            if (isShield) {
              this.shieldsUsedInRound++;
            }
            resolve({ success: true, rewardEarned: true, isOffline: false });
          }, 600);
        }
      }, 1000);

      closeBtn.addEventListener('click', () => {
        clearInterval(interval);
        modal.remove();
        resolve({ success: false, rewardEarned: false, isOffline: false });
      });
    });
  }

  /**
   * Renders unobtrusive banner placeholder in web mode
   */
  renderWebBannerPlaceholder(show) {
    const existing = document.getElementById('web-admob-banner');
    if (!show) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'web-admob-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: #0f172a;
      border-top: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      z-index: 1000;
    `;
    banner.innerHTML = `<span>📢 AdMob Adaptive Banner • English Breakfast</span>`;
    document.body.appendChild(banner);
  }
}

export const AdService = new AdServiceImpl();
if (typeof window !== 'undefined') {
  window.AdService = AdService;
}
export default AdService;
