import { getUserSettings, saveUserSettings, getWords } from '../../services/api.js?v=200.0';
import { getCurrentUser, logoutUser, getUserAvatar, saveUserAvatar, removeUserAvatar, compressAndCropAvatar, getEffectiveUserId } from '../../services/authService.js?v=200.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=200.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=200.0';
import { speakWord, setSavedVoiceAccent, getSavedVoiceAccent, isAudioMuted, setSavedSilentMode, playSuccessSound, isSfxMuted, setSavedSfxMuted, isVoicePackDownloaded, downloadVoicePack } from '../../services/audioService.js?v=200.0';
import { renderAvatarPickerModal } from './AvatarPickerModal.js?v=200.0';
import { t, getInterfaceLanguage, getUkVoiceModalStrings } from '../../services/i18n.js?v=200.0';
import { deleteCurrentUserAccount } from '../../services/firebase.js?v=200.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  if (window._activeTab && window._activeTab !== 'settings') return;

  const user = getCurrentUser();
  const avatar = getUserAvatar();
  const currentTheme = getSavedTheme();

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
              ? `<img src="${avatar}" alt="Avatar" class="profile-avatar-img" />`
              : `<div class="profile-avatar-placeholder">${user && user.name ? user.name.trim().charAt(0).toUpperCase() : '👤'}</div>`
          }
          <div class="avatar-edit-badge" title="${t('settings_avatar_edit_tooltip')}">🎭</div>
        </div>
        <div class="profile-details" style="flex: 1; min-width: 0;">
          <h3 class="profile-name">${user ? user.name : (t('settings_guest_mode') || t('demo') || 'Guest Mode')}</h3>
          ${user ? '' : `<p class="profile-sub">${t('settings_login_sub') || 'Log in to sync progress'}</p>`}
        </div>
        <div>
          ${
            user
              ? `<button class="secondary-button settings-auth-btn" id="logout-btn">${t('settings_logout')}</button>`
              : `<button class="primary-button settings-auth-btn" id="login-modal-btn">${t('settings_login')}</button>`
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
            <div class="dropdown-item" data-value="en">English</div>
            <div class="dropdown-item" data-value="ru">Русский</div>
            <div class="dropdown-item" data-value="uk">Українська</div>
            <div class="dropdown-item" data-value="de">Deutsch</div>
            <div class="dropdown-item" data-value="es">Español</div>
            <div class="dropdown-item" data-value="fr">Français</div>
            <div class="dropdown-item" data-value="pl">Polski</div>
            <div class="dropdown-item" data-value="it">Italiano</div>
            <div class="dropdown-item" data-value="tr">Türkçe</div>
            <div class="dropdown-item" data-value="pt">Português</div>
            <div class="dropdown-item" data-value="ro">Română</div>
            <div class="dropdown-item" data-value="bg">Български</div>
            <div class="dropdown-item" data-value="cs">Čeština</div>
            <div class="dropdown-item" data-value="sk">Slovenčina</div>
            <div class="dropdown-item" data-value="hu">Magyar</div>
            <div class="dropdown-item" data-value="el">Ελληνικά</div>
            <div class="dropdown-item" data-value="sl">Slovenščina</div>
            <div class="dropdown-item" data-value="et">Eesti</div>
            <div class="dropdown-item" data-value="lt">Lietuvių</div>
            <div class="dropdown-item" data-value="lv">Latviešu</div>
            <div class="dropdown-item" data-value="da">Dansk</div>
            <div class="dropdown-item" data-value="fi">Suomi</div>
            <div class="dropdown-item" data-value="sv">Svenska</div>
            <div class="dropdown-item" data-value="hr">Hrvatski</div>
            <div class="dropdown-item" data-value="ga">Gaeilge</div>
            <div class="dropdown-item" data-value="mt">Malti</div>
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
          <button class="theme-option-btn ${currentTheme === 'notebook' ? 'active' : ''}" id="theme-notebook-btn">
            ${t('settings_theme_notebook')}
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

      <!-- App Maintenance / Sync Card -->
      <div class="settings-card">
        <button class="primary-button btn-green btn-clear-cache" id="clear-app-cache-btn">
          ${t('settings_sync_btn')}
        </button>
      </div>

      ${
        user
          ? `
        <!-- Danger Zone / Delete Account (Google Play Compliance) -->
        <div class="settings-card danger-zone-card" style="border: 1px solid rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.03);">
          <h3 class="settings-card-title" style="color: #ef4444; margin-bottom: 8px;">
            ${t('settings_account_mgmt')}
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0 0 12px;">
            ${t('settings_account_delete_desc')}
          </p>
          <button type="button" class="secondary-button" id="delete-account-btn" style="width: 100%; color: #ef4444; border-color: rgba(239, 68, 68, 0.4); font-weight: 600;">
            ${t('settings_account_delete_btn')}
          </button>
        </div>
      `
          : ''
      }

      <div style="text-align: center; margin-top: 12px; margin-bottom: 24px;">
        <a href="./privacy.html" target="_blank" style="font-size: 13px; color: var(--text-muted); text-decoration: underline;">
          ${t('settings_privacy_policy')}
        </a>
      </div>

    </div>
  `;

  // Synchronous initial values from local storage/helpers
  let isSfxMutedVal = isSfxMuted();
  let currentAccent = getSavedVoiceAccent();
  let currentSettingsObj = {};

  // Auto-save status element
  const autoSaveStatus = container.querySelector('#autosave-status');

  // Helper: auto-save function (non-blocking)
  function triggerAutoSave() {
    const newSettings = {
      ...currentSettingsObj,
      dailyGoal: 10,
      theme: getSavedTheme(),
      voiceAccent: currentAccent,
      voiceGender: currentAccent === 'uk' ? 'male' : 'female',
      sfxMuted: isSfxMutedVal,
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
      });
    });
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutUser();
      await onUserChange();
      if (!window._activeTab || window._activeTab === 'settings') {
        renderSettingsView(containerSelector, onUserChange);
      }
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
      ukVoiceBtn.classList.toggle('active', currentAccent === 'uk');
      usVoiceBtn.classList.toggle('active', currentAccent === 'us');
    }
  }
  updateVoiceButtons();

  if (ukVoiceBtn && usVoiceBtn) {
    ukVoiceBtn.addEventListener('click', async () => {
      const isUkBaseDownloaded = isVoicePackDownloaded('uk_base');
      if (isUkBaseDownloaded) {
        currentAccent = 'uk';
        setSavedVoiceAccent('uk');
        updateVoiceButtons();
        speakWord('Hello', null, 'en-GB', 'uk', true);
        triggerAutoSave();
        return;
      }

      // Show UK base voice download modal (localized into user's language)
      const strings = getUkVoiceModalStrings();
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'uk-voice-download-modal';
      modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 350px; padding: 26px 20px; box-sizing: border-box; animation: scaleUp 0.2s ease;">
          <div style="font-size: 44px; margin-bottom: 10px; line-height: 1;">🇬🇧</div>
          <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 10px; color: var(--text-main);">
            ${strings.title}
          </h3>
          <p id="uk-modal-desc" style="font-size: 13.5px; color: var(--text-muted); line-height: 1.45; margin: 0 0 18px;">
            ${strings.desc}
          </p>
          <div id="uk-progress-wrap" style="display: none; margin-bottom: 16px;">
            <div style="background: rgba(0,0,0,0.08); border-radius: 99px; height: 10px; overflow: hidden; margin-bottom: 6px;">
              <div id="uk-progress-bar" style="background: var(--btn-green-bg, #22c55e); height: 100%; width: 0%; transition: width 0.15s ease;"></div>
            </div>
            <span id="uk-progress-text" style="font-size: 12px; font-weight: 700; color: var(--text-muted);">0%</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="primary-button btn-green" id="uk-modal-download-btn" style="min-height: 44px; font-size: 15px; font-weight: 700; width: 100%;">
              ${strings.downloadBtn}
            </button>
            <button class="secondary-button" id="uk-modal-cancel-btn" style="min-height: 38px; font-size: 14px; width: 100%;">
              ${strings.cancelBtn}
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const downloadBtn = modal.querySelector('#uk-modal-download-btn');
      const cancelBtn = modal.querySelector('#uk-modal-cancel-btn');
      const progressWrap = modal.querySelector('#uk-progress-wrap');
      const progressBar = modal.querySelector('#uk-progress-bar');
      const progressText = modal.querySelector('#uk-progress-text');
      const descEl = modal.querySelector('#uk-modal-desc');

      cancelBtn.addEventListener('click', () => {
        modal.remove();
      });

      downloadBtn.addEventListener('click', async () => {
        downloadBtn.disabled = true;
        cancelBtn.style.display = 'none';
        progressWrap.style.display = 'block';
        if (descEl) descEl.textContent = strings.downloading;
        try {
          const wordsRes = await getWords(false);
          const words = (wordsRes && wordsRes.data) || [];
          const baseWords = words.filter((w) => {
            const cat = String(w.category || '').toLowerCase();
            return cat.includes('elementary') || cat.includes('irregular');
          });

          await downloadVoicePack('uk', baseWords, (percent) => {
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${percent}%`;
          });

          localStorage.setItem('myduo_pack_uk_base_downloaded', 'true');
          modal.remove();

          currentAccent = 'uk';
          setSavedVoiceAccent('uk');
          updateVoiceButtons();
          speakWord('Hello', null, 'en-GB', 'uk', true);
          triggerAutoSave();
        } catch (err) {
          console.warn('UK voice download failed:', err);
          downloadBtn.disabled = false;
          cancelBtn.style.display = 'block';
          downloadBtn.textContent = strings.retryBtn;
        }
      });
    });

    usVoiceBtn.addEventListener('click', () => {
      currentAccent = 'us';
      setSavedVoiceAccent('us');
      updateVoiceButtons();
      speakWord('Hello', null, 'en-US', 'us', true);
      triggerAutoSave();
    });
  }

  // Bind theme buttons with auto-save
  const lightBtn = container.querySelector('#theme-light-btn');
  const darkBtn = container.querySelector('#theme-dark-btn');
  const notebookBtn = container.querySelector('#theme-notebook-btn');

  function setActiveThemeBtn(active) {
    [lightBtn, darkBtn, notebookBtn].forEach((b) => b && b.classList.remove('active'));
    if (active) active.classList.add('active');
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      applyTheme('light');
      setActiveThemeBtn(lightBtn);
      triggerAutoSave();
    });
  }

  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      applyTheme('dark');
      setActiveThemeBtn(darkBtn);
      triggerAutoSave();
    });
  }

  if (notebookBtn) {
    notebookBtn.addEventListener('click', () => {
      applyTheme('notebook');
      setActiveThemeBtn(notebookBtn);
      triggerAutoSave();
    });
  }

  // Language Dropdown handling
  const langDropdown = container.querySelector('#lang-dropdown');
  const langTrigger = container.querySelector('#lang-dropdown-trigger');
  const langLabel = container.querySelector('#lang-dropdown-label');
  const langItems = container.querySelectorAll('#lang-dropdown-menu .dropdown-item');

  const langNames = {
    en: 'English',
    ru: 'Русский',
    uk: 'Українська',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français',
    pl: 'Polski',
    it: 'Italiano',
    tr: 'Türkçe',
    pt: 'Português',
    ro: 'Română',
    bg: 'Български',
    cs: 'Čeština',
    sk: 'Slovenčina',
    hu: 'Magyar',
    el: 'Ελληνικά',
    sl: 'Slovenščina',
    et: 'Eesti',
    lt: 'Lietuvių',
    lv: 'Latviešu',
    da: 'Dansk',
    fi: 'Suomi',
    sv: 'Svenska',
    hr: 'Hrvatski',
    ga: 'Gaeilge',
    mt: 'Malti',
  };

  const currentLang = localStorage.getItem('myduo_interface_lang') || 'en';

  function updateLangUI(val) {
    if (langLabel) langLabel.textContent = langNames[val] || 'English';
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
        localStorage.setItem('myduo_interface_lang', val);
        updateLangUI(val);
        langDropdown.classList.remove('open');
        
        // Dispatch event to reload other tabs/header and words immediately
        window.dispatchEvent(new Event('myduo:lang_changed'));
        
        // Background refresh words with new language
        getWords(true).catch(() => {});

        // Save in background
        triggerAutoSave();

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

  // Bind clear cache button
  const clearCacheBtn = container.querySelector('#clear-app-cache-btn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', async () => {
      const confirmMsg = t('settings_sync_confirm');
      if (confirm(confirmMsg)) {
        // 1. Clear local words & leaderboard cache
        localStorage.removeItem('myduo_cached_words');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('cache_leaderboard_') || k === 'myduo_leaderboard_period')) {
            localStorage.removeItem(k);
          }
        }
        // 2. Clear browser Cache Storage
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          } catch (e) {
            console.warn('Cache storage clear error:', e);
          }
        }
        // 3. Force reload with timestamp to bust mobile disk cache
        window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
      }
    });
  }

  // Bind Delete Account button (Google Play Compliance)
  const deleteAccountBtn = container.querySelector('#delete-account-btn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      const confirmMsg = t('settings_account_delete_confirm');
      if (confirm(confirmMsg)) {
        try {
          deleteAccountBtn.disabled = true;
          deleteAccountBtn.textContent = t('settings_account_deleting');
          await deleteCurrentUserAccount();
          logoutUser();
          alert(t('settings_account_deleted'));
          window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
        } catch (err) {
          console.warn('Delete account error:', err);
          logoutUser();
          window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
        }
      }
    });
  }

  // Asynchronously fetch full settings from server / cloud and update local state if present
  getUserSettings().then((remoteSettings) => {
    if (remoteSettings) {
      currentSettingsObj = remoteSettings;
      if (typeof remoteSettings.sfxMuted !== 'undefined') {
        isSfxMutedVal = Boolean(remoteSettings.sfxMuted);
        updateSfxButtons();
      }
      if (remoteSettings.voiceAccent) {
        currentAccent = remoteSettings.voiceAccent;
        updateVoiceButtons();
      }
    }
  }).catch((err) => {
    console.warn('Error loading remote settings:', err);
  });
}

export { renderSettingsView };
