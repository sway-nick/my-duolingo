import { getUserSettings, saveUserSettings, getWords, getIsoWeekKey } from '../../services/api.js?v=423.0';
import { getCurrentUser, logoutUser, getUserAvatar, saveUserAvatar, removeUserAvatar, compressAndCropAvatar, getEffectiveUserId } from '../../services/authService.js?v=423.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=423.0';
import { applyTheme, getSavedTheme, showToast } from '../layout/AppLayout.js?v=423.0';
import { speakWord, setSavedVoiceAccent, getSavedVoiceAccent, isAudioMuted, setSavedSilentMode, playSuccessSound, isSfxMuted, setSavedSfxMuted, isCategoryAudioDownloaded, isVoicePackDownloaded } from '../../services/audioService.js?v=423.0';
import { renderAvatarPickerModal } from './AvatarPickerModal.js?v=423.0';
import { t, getInterfaceLanguage, setInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { SUPPORTED_LOCALES, getLocaleDisplayName } from '../../config/locales.js?v=423.0';
import { deleteCurrentUserAccount, getSiteStatsSummaryFirestore, getGa4CountryReportFirestore } from '../../services/firebase.js?v=423.0';
import { openPrivacyModal } from '../modals/PrivacyModal.js?v=423.0';
import { openWidgetConfigBottomSheet } from '../modals/WidgetConfigBottomSheet.js?v=423.0';
import { ProService } from '../../services/proService.js?v=423.0';
import { getProStrings } from '../../services/proI18n.js?v=423.0';
import { getFreeShieldsLeft, isProActive, isDebugForceFree, setDebugForceFree } from '../../services/proState.js?v=423.0';

if (typeof window !== 'undefined') {
  window.openWidgetConfigBottomSheet = openWidgetConfigBottomSheet;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  if (window._activeTab && window._activeTab !== 'settings') return;

  const user = getCurrentUser();
  const isLoggedIn = Boolean(user && user.id && user.id !== 'guest' && !String(user.id).startsWith('guest_') && user.email);
  const avatar = getUserAvatar();
  const currentTheme = getSavedTheme();
  const hasSyncIssue = Boolean(window.__myduo_sync_issue || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('myduo_sync_issue') === '1'));
  const showBadge = !isLoggedIn || hasSyncIssue;

  let isWidgetInstalled = false;
  try {
    if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.isWidgetInstalled === 'function') {
      isWidgetInstalled = Boolean(window.AndroidWidgetBridge.isWidgetInstalled());
    }
  } catch (e) {}

  const displayName = isLoggedIn
    ? (user.name || user.email.split('@')[0])
    : (t('settings_guest_mode') || t('demo') || 'Guest (Demo)');
  const displaySub = isLoggedIn
    ? (hasSyncIssue ? (t('lead_login_to_save') || 'Требуется войти заново для синхронизации') : (user.email || ''))
    : (t('settings_login_sub') || 'Log in to sync progress');

  container.innerHTML = `
    <div class="settings-page" style="position: relative;">
      <span class="autosave-badge" id="autosave-status" style="position: absolute; top: -6px; right: 0; opacity: 0; transition: opacity 0.3s ease; white-space: nowrap; z-index: 20;">
        ${t('settings_saved')}
      </span>

      <!-- User Profile Card -->
      <div class="settings-card profile-card">
        <div class="profile-avatar-wrapper" id="change-avatar-trigger" title="${t('settings_avatar_choose_tooltip')}">
          ${
            avatar
              ? `<img src="${avatar}" alt="Avatar" class="profile-avatar-img${isProActive() ? ' pro-avatar-ring' : ''}" referrerpolicy="no-referrer" />`
              : `<div class="profile-avatar-placeholder${isProActive() ? ' pro-avatar-ring' : ''}">${escapeHtml(displayName.trim().charAt(0).toUpperCase() || '👤')}</div>`
          }
          <div class="avatar-edit-badge" title="${t('settings_avatar_edit_tooltip')}">🎭</div>
        </div>
        <div class="profile-details" style="flex: 1 1 auto; min-width: 0; overflow: hidden; padding-right: 8px;">
          <h3 class="profile-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(displayName)}</h3>
          <p class="profile-sub" style="${hasSyncIssue ? 'color: #ea580c; font-weight: 500;' : ''} white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${escapeHtml(displaySub)}</p>
        </div>
        <div class="profile-action" style="flex: 0 0 auto; flex-shrink: 0;">
          ${
            isLoggedIn && !hasSyncIssue
              ? `<button class="secondary-button settings-auth-btn" id="logout-btn">${t('settings_logout') || 'Выйти'}</button>`
              : `<button class="primary-button settings-auth-btn" id="register-modal-btn" style="position: relative;">
                  ${hasSyncIssue ? (t('auth_tab_login') || 'Войти') : (t('auth_tab_register') || 'Регистрация')}
                  <span class="sync-status-badge" id="settings-login-sync-badge" style="display: ${showBadge ? 'block' : 'none'}; top: -2px; right: -2px;"></span>
                </button>`
          }
        </div>
      </div>

      <!-- Language Selection Card -->
      <div class="settings-card" style="position: relative; z-index: 15;">
        <h3 class="settings-card-title">${t('settings_lang')}</h3>
        <div class="custom-dropdown" id="lang-dropdown">
          <button type="button" class="custom-dropdown-trigger" id="lang-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
            <span id="lang-dropdown-label">English</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="custom-dropdown-menu" id="lang-dropdown-menu" role="listbox">
            ${SUPPORTED_LOCALES.map((l) => `<div class="dropdown-item" data-value="${l.code}">${l.name} (${l.code})</div>`).join('\n            ')}
          </div>
        </div>
      </div>

      <!-- Theme Switcher Card -->
      <div class="settings-card">
        <h3 class="settings-card-title">${t('settings_theme')}</h3>
        <div class="theme-options-row">
          <button class="theme-option-btn ${currentTheme === 'light' ? 'active' : ''}" id="theme-light-btn">
            ${t('settings_theme_light')}
          </button>
          <button class="theme-option-btn ${currentTheme === 'dark' ? 'active' : ''}" id="theme-dark-btn">
            ${t('settings_theme_dark')}
          </button>
        </div>
      </div>

      <!-- Sound Mode Card -->
      <div class="settings-card">
        <h3 class="settings-card-title">${t('settings_sfx')}</h3>
        <div class="sound-options-row">
          <button class="sound-option-btn" id="sfx-on-btn">
            ${t('settings_sfx_on')}
          </button>
          <button class="sound-option-btn" id="sfx-off-btn">
            ${t('settings_sfx_off')}
          </button>
        </div>
      </div>

      <!-- Voice Selection Card -->
      <div class="settings-card">
        <h3 class="settings-card-title" style="display: flex; align-items: center; gap: 6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#d4a373" style="flex-shrink: 0;">
            <path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4zm-6 16a6 6 0 0 1 12 0H6zm14.5-9a4.5 4.5 0 0 1 0 6.36l-1.06-1.06a3 3 0 0 0 0-4.24l1.06-1.06zm2.5-2.5a8 8 0 0 1 0 11.31l-1.06-1.06a6.5 6.5 0 0 0 0-9.19l1.06-1.06z"/>
          </svg>
          ${t('settings_voice')}
        </h3>
        <div class="voice-options-row">
          <button class="voice-option-btn flag-btn" id="voice-uk-btn" title="${t('settings_voice_uk_title')}" aria-label="British English">
            <svg class="flag-svg-icon" viewBox="0 0 640 480" width="30" height="21">
              <path fill="#012169" d="M0 0h640v480H0z"/>
              <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 240l240 178v62h-80L320 301 81 480H0v-60l239-180L0 64V0h75z"/>
              <path fill="#C8102E" d="m424 288 216 159v33h-44L367 304l57-16zM640 22v10L432 201l-24-33 197-146h35zM0 458v-10l208-169 24 33L35 458H0zM216 192 0 33V0h44l229 176-57 16z"/>
              <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z"/>
              <path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z"/>
            </svg>
          </button>
          <button class="voice-option-btn flag-btn" id="voice-us-btn" title="${t('settings_voice_us_title')}" aria-label="American English">
            <svg class="flag-svg-icon" viewBox="0 0 640 480" width="30" height="21">
              <path fill="#bd3d44" d="M0 0h640v480H0z"/>
              <path stroke="#fff" stroke-width="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"/>
              <path fill="#192f5d" d="M0 0h260v259H0z"/>
              <g fill="#fff">
                <circle cx="30" cy="28" r="7"/><circle cx="75" cy="28" r="7"/><circle cx="120" cy="28" r="7"/><circle cx="165" cy="28" r="7"/><circle cx="210" cy="28" r="7"/>
                <circle cx="52" cy="56" r="7"/><circle cx="97" cy="56" r="7"/><circle cx="142" cy="56" r="7"/><circle cx="187" cy="56" r="7"/>
                <circle cx="30" cy="84" r="7"/><circle cx="75" cy="84" r="7"/><circle cx="120" cy="84" r="7"/><circle cx="165" cy="84" r="7"/><circle cx="210" cy="84" r="7"/>
                <circle cx="52" cy="112" r="7"/><circle cx="97" cy="112" r="7"/><circle cx="142" cy="112" r="7"/><circle cx="187" cy="112" r="7"/>
                <circle cx="30" cy="140" r="7"/><circle cx="75" cy="140" r="7"/><circle cx="120" cy="140" r="7"/><circle cx="165" cy="140" r="7"/><circle cx="210" cy="140" r="7"/>
                <circle cx="52" cy="168" r="7"/><circle cx="97" cy="168" r="7"/><circle cx="142" cy="168" r="7"/><circle cx="187" cy="168" r="7"/>
                <circle cx="30" cy="196" r="7"/><circle cx="75" cy="196" r="7"/><circle cx="120" cy="196" r="7"/><circle cx="165" cy="196" r="7"/><circle cx="210" cy="196" r="7"/>
                <circle cx="52" cy="224" r="7"/><circle cx="97" cy="224" r="7"/><circle cx="142" cy="224" r="7"/><circle cx="187" cy="224" r="7"/>
              </g>
            </svg>
          </button>
        </div>
      </div>

      <!-- Widget Button -->
      <div class="settings-card" id="widget-promo-section" style="padding: 16px 12px;">
        <button type="button" class="theme-option-btn active" id="btn-pin-widget" style="width: 100%; justify-content: center;">
          ${t('settings_configure_widget') || 'Настроить виджет'}
        </button>
      </div>

      ${(() => {
        const isNativeApp = Boolean(typeof window !== 'undefined' && window.Capacitor && ((typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) || (typeof window.Capacitor.getPlatform === 'function' && window.Capacitor.getPlatform() !== 'web')));
        const isDebug = typeof localStorage !== 'undefined' && localStorage.getItem('myduo_debug_mode') === 'true';
        const isForceFree = isDebugForceFree();
        const isProNow = ProService.isPro();
        if (!isNativeApp && !isProNow && !isDebug && !isForceFree) return '';
        const sPro = getProStrings(getInterfaceLanguage());
        const promoEnabled = typeof localStorage === 'undefined' || localStorage.getItem('eb_promo_codes_enabled') !== 'false';
        return `
        <div class="settings-card" id="settings-pro-section" style="padding: 16px 14px;">
          <div id="settings-pro-header" style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:${isProNow ? '0' : '10px'};cursor:pointer;user-select:none;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span id="settings-pro-badge" style="padding:3px 9px;border-radius:999px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:800;font-size:11px;">${escapeHtml(sPro.pro_badge)}</span>
              <h3 class="settings-card-title" style="margin:0;">${escapeHtml(sPro.pro_title)}</h3>
            </div>
            ${isForceFree ? `<span style="padding:2px 8px;border-radius:999px;background:rgba(239,68,68,0.16);color:#ef4444;font-weight:800;font-size:10.5px;letter-spacing:0.3px;">FREE TEST</span>` : ''}
          </div>
          ${isProNow ? '' : `
            <button type="button" class="theme-option-btn active" id="btn-settings-open-pro" style="width:100%;justify-content:center;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;border:none;margin-bottom:8px;">
              ⭐ ${escapeHtml(sPro.pro_buy)}
            </button>
            <button type="button" class="theme-option-btn" id="btn-settings-restore-pro" style="width:100%;justify-content:center;font-size:13px;">
              ${escapeHtml(sPro.pro_restore)}
            </button>
            ${promoEnabled ? `
              <div style="display:flex;gap:8px;margin-top:10px;">
                <input type="text" id="eb-settings-promo-input" placeholder="${escapeHtml(sPro.pro_promo_placeholder)}" autocomplete="off" style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;border:1px solid var(--border-color,rgba(148,163,184,0.3));background:var(--bg-main,transparent);color:var(--text-main);font-size:13px;" />
                <button type="button" class="theme-option-btn" id="eb-settings-promo-btn" style="padding:8px 12px;font-size:13px;white-space:nowrap;">${escapeHtml(sPro.pro_promo_apply)}</button>
              </div>
            ` : ''}
            <div id="eb-settings-pro-msg" style="display:none;margin-top:8px;font-size:12px;font-weight:600;"></div>
          `}
        </div>
        `;
      })()}

      ${(typeof localStorage !== 'undefined' && localStorage.getItem('myduo_debug_mode') === 'true') ? `
      <!-- Monday Cat Meme Demo (Debug only) -->
      <div class="settings-card" id="monday-ticker-demo-section" style="padding: 14px 12px; text-align: center;">
        <button type="button" class="theme-option-btn" id="btn-test-monday-meme" style="width: 100%; justify-content: center; font-size: 14px; gap: 8px;">
          <span>🎬</span>
          <span>Проверить мем с котом (Золотая карта)</span>
        </button>
      </div>
      ` : ''}

      <div class="settings-footer" id="settings-footer-area">
        <button type="button" id="open-privacy-btn" class="settings-privacy-btn">
          ${t('settings_privacy_policy')}
        </button>
        <div id="settings-secret-stats-trigger" style="margin-top: 6px; font-size: 11px; color: var(--text-muted, #94a3b8); opacity: 0.55; user-select: none; cursor: pointer; padding: 4px 12px; display: inline-block;">
          English Breakfast v386.0
        </div>
      </div>

    </div>
  `;

  // Synchronous initial values from local storage/helpers
  let isSfxMutedVal = isSfxMuted();
  const isUkDownloadedNow = () => isCategoryAudioDownloaded('uk', 'Elementary') || isVoicePackDownloaded('uk');
  let currentAccent = getSavedVoiceAccent();
  if (currentAccent === 'uk' && !isUkDownloadedNow()) {
    currentAccent = 'us';
    setSavedVoiceAccent('us');
  }
  let currentSettingsObj = {};

  // Auto-save status element
  const autoSaveStatus = container.querySelector('#autosave-status');

  // Helper: auto-save function (non-blocking)
  function triggerAutoSave(langOverride) {
    if (langOverride) {
      try {
        localStorage.setItem('myduo_lang_manual', 'true');
      } catch (e) {}
    }
    const activeLang = langOverride || getInterfaceLanguage();
    currentSettingsObj.interfaceLang = activeLang;
    const newSettings = {
      ...currentSettingsObj,
      dailyGoal: 10,
      theme: getSavedTheme(),
      voiceAccent: currentAccent,
      voiceGender: currentAccent === 'uk' ? 'male' : 'female',
      sfxMuted: isSfxMutedVal,
      interfaceLang: activeLang,
    };

    if (autoSaveStatus) {
      autoSaveStatus.textContent = t('settings_saving');
      autoSaveStatus.style.opacity = '1';
    }

    saveUserSettings(newSettings).then(() => {
      onUserChange();
      if (autoSaveStatus) {
        autoSaveStatus.textContent = t('settings_saved');
        setTimeout(() => {
          if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
        }, 1500);
      }
    }).catch((e) => {
      console.warn('Auto-save error:', e);
    });
  }

  // Bind auth buttons
  const loginBtn = container.querySelector('#login-modal-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      renderAuthModal(async () => {
        await onUserChange();
        if (!window._activeTab || window._activeTab === 'settings') {
          renderSettingsView(containerSelector, onUserChange);
        }
      }, 'login');
    });
  }

  const registerBtn = container.querySelector('#register-modal-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      const mode = hasSyncIssue ? 'login' : 'register';
      renderAuthModal(async () => {
        await onUserChange();
        if (!window._activeTab || window._activeTab === 'settings') {
          renderSettingsView(containerSelector, onUserChange);
        }
      }, mode);
    });
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      openAccountActionsModal();
    });
  }

  // Bind Avatar Picker on avatar click
  const avatarTrigger = container.querySelector('#change-avatar-trigger');
  if (avatarTrigger) {
    avatarTrigger.addEventListener('click', () => {
      renderAvatarPickerModal(async () => {
        if (autoSaveStatus) {
          autoSaveStatus.textContent = t('settings_avatar_updated');
          autoSaveStatus.style.opacity = '1';
          setTimeout(() => {
            if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
          }, 1500);
        }
        if (!window._activeTab || window._activeTab === 'settings') {
          renderSettingsView(containerSelector, onUserChange);
        }
      });
    });
  }

  // Setup SFX Selection
  const sfxOnBtn = container.querySelector('#sfx-on-btn');
  const sfxOffBtn = container.querySelector('#sfx-off-btn');

  function updateSfxButtons() {
    if (sfxOnBtn && sfxOffBtn) {
      sfxOnBtn.classList.toggle('active', !isSfxMutedVal);
      sfxOffBtn.classList.toggle('active', isSfxMutedVal);
    }
  }
  updateSfxButtons();

  if (sfxOnBtn && sfxOffBtn) {
    sfxOnBtn.addEventListener('click', () => {
      isSfxMutedVal = false;
      setSavedSfxMuted(false);
      updateSfxButtons();
      playSuccessSound();
      triggerAutoSave();
    });

    sfxOffBtn.addEventListener('click', () => {
      isSfxMutedVal = true;
      setSavedSfxMuted(true);
      updateSfxButtons();
      triggerAutoSave();
    });
  }

  // Setup Voice Accent Selection (🇬🇧 UK / 🇺🇸 US)
  const ukVoiceBtn = container.querySelector('#voice-uk-btn');
  const usVoiceBtn = container.querySelector('#voice-us-btn');

  function updateVoiceButtons() {
    if (ukVoiceBtn && usVoiceBtn) {
      const effectiveUk = currentAccent === 'uk' && isUkDownloadedNow();
      ukVoiceBtn.classList.toggle('active', effectiveUk);
      usVoiceBtn.classList.toggle('active', !effectiveUk);
    }
  }
  updateVoiceButtons();

  if (ukVoiceBtn && usVoiceBtn) {
    ukVoiceBtn.addEventListener('click', async () => {
      if (isUkDownloadedNow()) {
        currentAccent = 'uk';
        setSavedVoiceAccent('uk');
        updateVoiceButtons();
        speakWord('Hello', null, 'en-GB', 'uk', true);
        triggerAutoSave();
        if (window.trackEvent) {
          window.trackEvent('settings_accent_change', { accent: 'uk' });
        }
        // Verify cache in background; if evicted, prompt download and keep US active until downloaded
        if (typeof window.showAccentDownloadModalIfNeeded === 'function') {
          const modalOpened = await window.showAccentDownloadModalIfNeeded('uk', {
            onSuccess: () => {
              currentAccent = 'uk';
              setSavedVoiceAccent('uk');
              updateVoiceButtons();
              speakWord('Hello', null, 'en-GB', 'uk', true);
              triggerAutoSave();
            },
            onCancel: () => {
              currentAccent = 'us';
              setSavedVoiceAccent('us');
              updateVoiceButtons();
              triggerAutoSave();
            },
          });
          if (modalOpened) {
            currentAccent = 'us';
            setSavedVoiceAccent('us');
            updateVoiceButtons();
          }
        }
        return;
      }

      // UK audio pack is not downloaded yet: keep US accent active/green until download completes
      currentAccent = 'us';
      setSavedVoiceAccent('us');
      updateVoiceButtons();

      if (typeof window.showAccentDownloadModalIfNeeded === 'function') {
        await window.showAccentDownloadModalIfNeeded('uk', {
          onSuccess: () => {
            currentAccent = 'uk';
            setSavedVoiceAccent('uk');
            updateVoiceButtons();
            speakWord('Hello', null, 'en-GB', 'uk', true);
            triggerAutoSave();
            if (window.trackEvent) {
              window.trackEvent('settings_accent_change', { accent: 'uk' });
            }
          },
          onCancel: () => {
            currentAccent = 'us';
            setSavedVoiceAccent('us');
            updateVoiceButtons();
            triggerAutoSave();
          },
        });
      }
    });

    usVoiceBtn.addEventListener('click', () => {
      currentAccent = 'us';
      setSavedVoiceAccent('us');
      updateVoiceButtons();
      speakWord('Hello', null, 'en-US', 'us', true);
      triggerAutoSave();
      if (window.trackEvent) {
        window.trackEvent('settings_accent_change', { accent: 'us' });
      }
    });
  }

  // Bind theme buttons with auto-save
  const lightBtn = container.querySelector('#theme-light-btn');
  const darkBtn = container.querySelector('#theme-dark-btn');

  function setActiveThemeBtn(active) {
    [lightBtn, darkBtn].forEach((b) => b && b.classList.remove('active'));
    if (active) active.classList.add('active');
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      applyTheme('light');
      setActiveThemeBtn(lightBtn);
      triggerAutoSave();
      if (window.trackEvent) {
        window.trackEvent('settings_theme_change', { theme: 'light' });
      }
    });
  }

  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      applyTheme('dark');
      setActiveThemeBtn(darkBtn);
      triggerAutoSave();
      if (window.trackEvent) {
        window.trackEvent('settings_theme_change', { theme: 'dark' });
      }
    });
  }

  // Language Dropdown handling
  const langDropdown = container.querySelector('#lang-dropdown');
  const langTrigger = container.querySelector('#lang-dropdown-trigger');
  const langLabel = container.querySelector('#lang-dropdown-label');
  const langItems = container.querySelectorAll('#lang-dropdown-menu .dropdown-item');

  const currentLang = getInterfaceLanguage();

  function updateLangUI(val) {
    if (langLabel) langLabel.textContent = getLocaleDisplayName(val, true);
    langItems.forEach((item) => {
      item.classList.toggle('selected', item.dataset.value === val);
    });
  }

  updateLangUI(currentLang);

  if (container._langDocClickHandler) {
    document.removeEventListener('click', container._langDocClickHandler);
    container._langDocClickHandler = null;
  }

  if (langTrigger && langDropdown) {
    const langMenu = container.querySelector('#lang-dropdown-menu');

    langTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    if (langMenu) {
      langMenu.addEventListener('click', (e) => e.stopPropagation());
      langMenu.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    }

    langItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = item.dataset.value;
        if (window.trackEvent) {
          window.trackEvent('settings_language_change', { lang: val });
        }
        if (typeof setInterfaceLanguage === 'function') {
          setInterfaceLanguage(val);
        } else {
          try {
            localStorage.setItem('myduo_lang_manual', 'true');
            localStorage.setItem('myduo_interface_lang', val);
          } catch (e) {}
          window.dispatchEvent(new Event('myduo:lang_changed'));
        }
        updateLangUI(val);
        langDropdown.classList.remove('open');
        
        currentSettingsObj.interfaceLang = val;

        // Background refresh words with new language
        getWords(true).catch(() => {});

        // Save in background with explicit language
        triggerAutoSave(val);

        // In-place update text of settings view dynamically without wiping the DOM
        renderSettingsView(containerSelector, onUserChange);
      });
    });

    // Close on click outside without leaking global listeners
    const onDocClick = (e) => {
      if (langDropdown && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
      }
    };
    container._langDocClickHandler = onDocClick;
    setTimeout(() => {
      document.addEventListener('click', onDocClick);
    }, 100);
  }



  async function executeDeleteAccount(statusBtn = null) {
    const confirmMsg = t('settings_account_delete_confirm') || 'Are you sure you want to permanently delete your account and all learning data? This action cannot be undone.';
    if (!confirm(confirmMsg)) return;

    if (statusBtn) {
      statusBtn.disabled = true;
      statusBtn.textContent = t('settings_account_deleting') || 'Deleting...';
    }

    try {
      await deleteCurrentUserAccount();
      logoutUser();
      alert(t('settings_account_deleted') || 'Account deleted successfully.');
    } catch (err) {
      console.warn('Delete account error:', err);
      logoutUser();
    }

    // ── Полная очистка всех локальных данных ──────────────────────────
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}

    // Удаляем все CacheStorage-кэши (скачанное аудио и Service Worker кэши)
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((k) => caches.delete(k)));
      }
    } catch (e) {}

    // Отписываем и удаляем Service Worker регистрации
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) {}

    // Редирект после очистки
    window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
  }

  function openAccountActionsModal() {
    const existing = document.querySelector('#account-actions-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'account-actions-modal';
    modal.style.zIndex = '99999';
    modal.innerHTML = `
      <div class="modal-content account-actions-card" style="text-align: center; max-width: 320px; width: 90%; padding: 22px 18px; box-sizing: border-box; animation: scaleUp 0.18s ease; border-radius: 16px;">
        <div style="margin-bottom: 18px;">
          <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(displayName)}
          </h3>
          <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(user.email || '')}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <button type="button" class="secondary-button" id="modal-logout-btn" style="min-height: 42px; height: 42px; font-size: 14.5px; font-weight: 700; width: 100%; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${t('settings_logout') || 'Выйти'}
          </button>

          <button type="button" class="settings-delete-account-btn" id="modal-delete-account-btn" style="min-height: 42px; height: 42px; font-size: 13px; font-weight: 600; width: 100%; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${t('settings_account_delete_btn') || 'Удалить аккаунт и данные'}
          </button>

          <button type="button" class="primary-button btn-green" id="modal-cancel-btn" style="min-height: 42px; height: 42px; font-size: 14.5px; font-weight: 700; width: 100%; border-radius: 12px !important; margin-top: 2px; cursor: pointer;">
            ${t('dict_cancel_btn') || 'Отмена'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    modal.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);

    modal.querySelector('#modal-logout-btn').addEventListener('click', async () => {
      closeModal();
      if (window.trackEvent) {
        window.trackEvent('logout');
      }
      logoutUser();
      await onUserChange();
      if (!window._activeTab || window._activeTab === 'settings') {
        renderSettingsView(containerSelector, onUserChange);
      }
    });

    modal.querySelector('#modal-delete-account-btn').addEventListener('click', async () => {
      const delBtn = modal.querySelector('#modal-delete-account-btn');
      await executeDeleteAccount(delBtn);
    });
  }

  // Bind Privacy Policy button (in-app modal)
  const openPrivacyBtn = container.querySelector('#open-privacy-btn');
  if (openPrivacyBtn) {
    openPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPrivacyModal();
    });
  }

  const countryDisplayNames = (() => {
    try {
      if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
        return new Intl.DisplayNames([getInterfaceLanguage() || 'ru', 'ru', 'en'], { type: 'region' });
      }
    } catch (_) {}
    return null;
  })();

  function getCountryLabel(code, fallbackName) {
    const c = String(code || '').trim().toUpperCase();
    if (c === 'OTHER') return 'Прочие страны';
    if (!/^[A-Z]{2}$/.test(c) || c === 'ZZ') return 'Не определено';
    if (countryDisplayNames) {
      try {
        const localized = countryDisplayNames.of(c);
        if (localized && localized !== c) return localized;
      } catch (_) {}
    }
    return fallbackName || c;
  }

  function countryCodeToFlag(code) {
    const c = String(code || '').trim().toUpperCase();
    if (c === 'OTHER') return '🌍';
    if (!/^[A-Z]{2}$/.test(c) || c === 'ZZ') return '❔';
    return String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65, 0x1f1e6 + c.charCodeAt(1) - 65);
  }

  function formatUsd(val) {
    const n = Number(val || 0);
    if (!Number.isFinite(n) || n === 0) return '$0';
    return n >= 100 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`;
  }

  function openSiteStatsModal() {
    const existing = document.querySelector('#eb-site-stats-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'eb-site-stats-modal';
    modal.style.zIndex = '100000';
    modal.innerHTML = `
      <style>
        .eb-ga4-tabs { display:flex; gap:5px; margin-bottom:10px; }
        .eb-ga4-tab { flex:1; padding:7px 4px; border-radius:10px; border:1px solid var(--border-color, rgba(148,163,184,0.28)); background:var(--card-bg, transparent); color:var(--text-muted); font-size:11.5px; font-weight:700; white-space:nowrap; cursor:pointer; }
        .eb-ga4-tab.is-active { background:var(--primary-color, #2563eb); border-color:var(--primary-color, #2563eb); color:#ffffff; }
        body.dark-theme .eb-ga4-tab.is-active, .dark-theme .eb-ga4-tab.is-active, [data-theme="dark"] .eb-ga4-tab.is-active { background:#38bdf8; border-color:#38bdf8; color:#0f172a; }
        .eb-ga4-table-wrap { width:100%; overflow-x:auto; max-height:52vh; overflow-y:auto; border-radius:12px; border:1px solid var(--border-color, rgba(148,163,184,0.22)); }
        .eb-ga4-table { width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; white-space:nowrap; }
        .eb-ga4-table th { position:sticky; top:0; z-index:2; background:var(--card-bg, #ffffff); color:var(--text-muted); font-weight:700; font-size:11px; text-align:right; padding:8px 6px; border-bottom:1px solid var(--border-color, rgba(148,163,184,0.24)); }
        body.dark-theme .eb-ga4-table th, .dark-theme .eb-ga4-table th, [data-theme="dark"] .eb-ga4-table th { background:#1e293b; }
        .eb-ga4-table th:first-child, .eb-ga4-table td:first-child { text-align:left; padding-left:9px; position:sticky; left:0; background:inherit; max-width:140px; overflow:hidden; text-overflow:ellipsis; }
        .eb-ga4-table th:first-child { z-index:3; }
        .eb-ga4-table td { text-align:right; padding:7px 6px; border-bottom:1px solid var(--border-color, rgba(148,163,184,0.12)); color:var(--text-main); }
        .eb-ga4-table tbody tr { background:var(--card-bg, #ffffff); }
        body.dark-theme .eb-ga4-table tbody tr, .dark-theme .eb-ga4-table tbody tr, [data-theme="dark"] .eb-ga4-table tbody tr { background:#111827; }
        .eb-ga4-table tbody tr.is-total-row { font-weight:800; background:rgba(37,99,235,0.08); }
        body.dark-theme .eb-ga4-table tbody tr.is-total-row, .dark-theme .eb-ga4-table tbody tr.is-total-row, [data-theme="dark"] .eb-ga4-table tbody tr.is-total-row { background:rgba(56,189,248,0.14); }
        .eb-ga4-table tbody tr.is-total-row td:first-child { background:inherit; }
        .eb-ga4-table td:last-child, .eb-ga4-table th:last-child { padding-right:9px; }
      </style>
      <div class="modal-content" style="max-width: 560px; width: 96%; padding: 18px 14px; border-radius: 18px; box-sizing: border-box; text-align: left;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3 style="margin:0;font-size:17px;font-weight:800;color:var(--text-main);">📊 Статистика по странам (GA4)</h3>
          <button type="button" id="eb-site-stats-close-x" style="background:none;border:none;font-size:20px;line-height:1;color:var(--text-muted);cursor:pointer;padding:2px 6px;">✕</button>
        </div>
        <div id="eb-site-stats-body" style="font-size:13px;color:var(--text-main);display:flex;flex-direction:column;gap:10px;">
          <div style="text-align:center;padding:22px 0;color:var(--text-muted);">Загрузка аналитики...</div>
        </div>
        <button type="button" class="primary-button btn-green" id="eb-site-stats-close-btn" style="width:100%;margin-top:14px;min-height:40px;height:40px;border-radius:12px !important;font-weight:700;cursor:pointer;">
          Закрыть
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    modal.querySelector('#eb-site-stats-close-x')?.addEventListener('click', close);
    modal.querySelector('#eb-site-stats-close-btn')?.addEventListener('click', close);

    Promise.allSettled([getGa4CountryReportFirestore(), getSiteStatsSummaryFirestore()]).then(([ga4Res, siteRes]) => {
      const bodyEl = modal.querySelector('#eb-site-stats-body');
      if (!bodyEl) return;

      const ga4 = ga4Res.status === 'fulfilled' ? ga4Res.value : null;
      const s = siteRes.status === 'fulfilled' ? siteRes.value : null;

      const renderFallbackSummary = () => {
        if (!s) return '';
        return `
          <div style="padding:10px 12px;border-radius:12px;background:var(--bg-secondary, rgba(148,163,184,0.1));border:1px solid var(--border-color, rgba(148,163,184,0.2));font-size:12px;">
            <div style="font-weight:800;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.3px;">🏆 Игроки в Firestore</div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;">
              <span>Всего: <strong>${s.totalPlayers}</strong></span>
              <span>24ч: <strong style="color:#22c55e;">${s.active24h}</strong></span>
              <span>7д: <strong>${s.active7d}</strong></span>
              <span>30д: <strong>${s.active30d}</strong></span>
              <span>${escapeHtml(s.weekKey)}: <strong>${s.weeklyPlayers}</strong></span>
            </div>
          </div>
        `;
      };

      if (!ga4 || !ga4.periods) {
        bodyEl.innerHTML = `
          <div style="padding:12px 13px;border-radius:12px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);line-height:1.45;font-size:12.5px;">
            <div style="font-weight:800;margin-bottom:6px;">⏳ Отчёт GA4 ещё не синхронизирован</div>
            <div style="color:var(--text-muted);">
              Добавь в GitHub Secrets репозитория <code>GA4_PROPERTY_ID</code> и <code>GA4_SERVICE_ACCOUNT_JSON</code>, затем запусти workflow <strong>Sync GA4 Country Stats to Firestore</strong> во вкладке Actions.
            </div>
          </div>
          ${renderFallbackSummary()}
        `;
        return;
      }

      let activePeriod = 'yesterday';
      const updatedStr = ga4.updatedAt
        ? new Date(ga4.updatedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '—';

      const renderPeriod = () => {
        const p = ga4.periods[activePeriod] || ga4.periods.yesterday || ga4.periods.today;
        const tot = p?.totals || {};
        const rows = Array.isArray(p?.countries) ? p.countries : [];

        const rowsHtml = rows.map((r) => {
          const countryLabel = getCountryLabel(r.code, r.name);
          return `
          <tr>
            <td title="${escapeHtml(countryLabel)}">${countryCodeToFlag(r.code)} <strong>${escapeHtml(countryLabel)}</strong></td>
            <td>${Number(r.totalUsers || 0)}</td>
            <td style="color:#38bdf8;">${Number(r.newPaid || 0)}</td>
            <td style="color:#22c55e;">${Number(r.newOrganic || 0)}</td>
            <td style="${Number(r.uninstalls || 0) > 0 ? 'color:#f87171;' : 'color:var(--text-muted);'}">${Number(r.uninstalls || 0)}</td>
            <td><strong>${Number(r.activeUsers || 0)}</strong></td>
            <td style="${Number(r.proPurchases || 0) > 0 ? 'color:#f59e0b;font-weight:700;' : 'color:var(--text-muted);'}">${Number(r.proPurchases || 0)}</td>
            <td>${escapeHtml(formatUsd(r.adRevenue))}</td>
          </tr>
        `;
        }).join('');

        bodyEl.innerHTML = `
          <div class="eb-ga4-tabs">
            <button type="button" class="eb-ga4-tab ${activePeriod === 'today' ? 'is-active' : ''}" data-ga4-period="today">Сегодня</button>
            <button type="button" class="eb-ga4-tab ${activePeriod === 'yesterday' ? 'is-active' : ''}" data-ga4-period="yesterday">Вчера</button>
            <button type="button" class="eb-ga4-tab ${activePeriod === 'last7d' ? 'is-active' : ''}" data-ga4-period="last7d">7 дней</button>
            <button type="button" class="eb-ga4-tab ${activePeriod === 'allTime' ? 'is-active' : ''}" data-ga4-period="allTime">Всё время</button>
          </div>

          <div class="eb-ga4-table-wrap">
            <table class="eb-ga4-table">
              <thead>
                <tr>
                  <th>Страна</th>
                  <th>Всего</th>
                  <th title="Новые с рекламы">+Рекл</th>
                  <th title="Новые органика">+Орг</th>
                  <th title="Удалили приложение (app_remove)">Удал.</th>
                  <th title="Активные пользователи">Актив.</th>
                  <th title="Покупки PRO">PRO</th>
                  <th title="Доход от рекламы (USD)">Рекл.$</th>
                </tr>
              </thead>
              <tbody>
                <tr class="is-total-row">
                  <td>Итого</td>
                  <td>${Number(tot.totalUsers || 0)}</td>
                  <td style="color:#38bdf8;">${Number(tot.newPaid || 0)}</td>
                  <td style="color:#22c55e;">${Number(tot.newOrganic || 0)}</td>
                  <td style="color:#f87171;">${Number(tot.uninstalls || 0)}</td>
                  <td>${Number(tot.activeUsers || 0)}</td>
                  <td style="color:#f59e0b;">${Number(tot.proPurchases || 0)}</td>
                  <td>${escapeHtml(formatUsd(tot.adRevenue))}</td>
                </tr>
                ${rowsHtml || `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:14px;">Нет данных за период</td></tr>`}
              </tbody>
            </table>
          </div>

          ${renderFallbackSummary()}

          <div style="font-size:11px;color:var(--text-muted);text-align:center;">
            Обновлено: ${escapeHtml(updatedStr)} · Доход: ${ga4.revenueSource === 'admob' ? 'AdMob + Unity' : 'GA4'}
          </div>
        `;

        bodyEl.querySelectorAll('[data-ga4-period]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const next = btn.getAttribute('data-ga4-period');
            if (next && next !== activePeriod) {
              activePeriod = next;
              renderPeriod();
            }
          });
        });
      };

      renderPeriod();
    }).catch(() => {
      const bodyEl = modal.querySelector('#eb-site-stats-body');
      if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;color:#ef4444;padding:12px 0;">Не удалось загрузить статистику</div>`;
    });
  }

  // Secret 5-tap trigger in Settings footer to view live Visitor & Player Statistics
  const statsFooterArea = container.querySelector('#settings-footer-area');
  if (statsFooterArea) {
    let statsTapCount = 0;
    let statsTapTimer = null;
    statsFooterArea.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest('#open-privacy-btn')) return;
      statsTapCount++;
      if (statsTapTimer) clearTimeout(statsTapTimer);
      statsTapTimer = setTimeout(() => {
        statsTapCount = 0;
      }, 2500);
      if (statsTapCount >= 5) {
        statsTapCount = 0;
        clearTimeout(statsTapTimer);
        try {
          if (navigator.vibrate) navigator.vibrate(40);
        } catch (_) {}
        openSiteStatsModal();
      }
    });
  }

  // Bind Pin Widget button: open sleek bottom sheet
  const btnPinWidget = container.querySelector('#btn-pin-widget');
  if (btnPinWidget) {
    btnPinWidget.addEventListener('click', (e) => {
      e.preventDefault();
      openWidgetConfigBottomSheet();
    });
  }

  // Bind test button for Monday Cat Meme (Golden Card)
  const btnTestMeme = container.querySelector('#btn-test-monday-meme');
  if (btnTestMeme) {
    btnTestMeme.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const curWeekKey = getIsoWeekKey();
        localStorage.removeItem(`myduo_meme_seen_week_${curWeekKey}`);
        localStorage.removeItem('myduo_wotd_video_last_date');
        localStorage.setItem('myduo_trial_monday_meme', '1');
      } catch (err) {}
      if (typeof window.setActiveTab === 'function') {
        window.setActiveTab('training');
      }
    });
  }

  // Bind PRO section buttons & secret 5-tap simulation toggle
  const triggerProForceFreeToggle = () => {
    const nextForceFree = !isDebugForceFree();
    setDebugForceFree(nextForceFree);
    try {
      if (navigator.vibrate) navigator.vibrate(40);
    } catch (_) {}
    const sProToast = getProStrings(getInterfaceLanguage());
    showToast(nextForceFree ? sProToast.pro_sim_free_on : sProToast.pro_sim_free_off);
    renderSettingsView(containerSelector, onUserChange);
  };

  const proHeaderEl = container.querySelector('#settings-pro-header');
  if (proHeaderEl) {
    let proTapCount = 0;
    let proTapTimer = null;
    proHeaderEl.addEventListener('click', (e) => {
      proTapCount++;
      if (proTapTimer) clearTimeout(proTapTimer);
      proTapTimer = setTimeout(() => {
        proTapCount = 0;
      }, 2500);
      if (proTapCount >= 5) {
        e.preventDefault();
        e.stopPropagation();
        proTapCount = 0;
        clearTimeout(proTapTimer);
        triggerProForceFreeToggle();
      }
    });
  }

  if (typeof window !== 'undefined' && !window.__ebSettingsProListener) {
    window.__ebSettingsProListener = true;
    window.addEventListener('eb:pro-changed', () => {
      try {
        if (window._activeTab === 'settings' || document.querySelector('#settings-pro-section')) {
          renderSettingsView(containerSelector, onUserChange);
        }
      } catch (_) {}
    });
  }

  const proMsgEl = container.querySelector('#eb-settings-pro-msg');
  const showProMsg = (text, isOk = false) => {
    if (!proMsgEl) return;
    proMsgEl.style.display = 'block';
    proMsgEl.style.color = isOk ? '#22c55e' : '#f87171';
    proMsgEl.textContent = text;
  };

  container.querySelector('#btn-settings-open-pro')?.addEventListener('click', () => {
    ProService.openPaywall('settings');
  });

  const restoreProBtn = container.querySelector('#btn-settings-restore-pro');
  restoreProBtn?.addEventListener('click', async () => {
    if (restoreProBtn.disabled) return;
    restoreProBtn.disabled = true;
    const sPro = getProStrings(getInterfaceLanguage());
    try {
      const res = await ProService.restore();
      if (res.restored) {
        showProMsg(sPro.pro_thanks, true);
        renderSettingsView(containerSelector, onUserChange);
      } else {
        showProMsg(sPro.pro_restore_none, false);
      }
    } finally {
      if (restoreProBtn.isConnected) restoreProBtn.disabled = false;
    }
  });

  const promoBtn = container.querySelector('#eb-settings-promo-btn');
  const promoInput = container.querySelector('#eb-settings-promo-input');
  promoBtn?.addEventListener('click', async () => {
    if (promoBtn.disabled) return;
    const code = promoInput?.value || '';
    const sPro = getProStrings(getInterfaceLanguage());
    promoBtn.disabled = true;
    try {
      const res = await ProService.redeemPromoCode(code);
      if (res.ok) {
        showProMsg(sPro.pro_promo_ok, true);
        setTimeout(() => renderSettingsView(containerSelector, onUserChange), 600);
      } else {
        showProMsg(sPro.pro_promo_bad, false);
      }
    } finally {
      if (promoBtn.isConnected) promoBtn.disabled = false;
    }
  });

  // Asynchronously fetch full settings from server / cloud and update local state if present
  getUserSettings().then((remoteSettings) => {
    if (remoteSettings) {
      currentSettingsObj = remoteSettings;
      if (typeof remoteSettings.sfxMuted !== 'undefined') {
        isSfxMutedVal = Boolean(remoteSettings.sfxMuted);
        updateSfxButtons();
      }
      if (remoteSettings.voiceAccent) {
        const validAccent = (remoteSettings.voiceAccent === 'uk' && !isUkDownloadedNow())
          ? 'us'
          : remoteSettings.voiceAccent;
        currentAccent = validAccent;
        setSavedVoiceAccent(validAccent);
        updateVoiceButtons();
      }
    }
  }).catch((err) => {
    console.warn('Error loading remote settings:', err);
  });
}

export { renderSettingsView };
