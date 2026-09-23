import { getUserSettings, saveUserSettings } from '../../services/api.js?v=223.0';
import { getCurrentUser, logoutUser, getUserAvatar, saveUserAvatar, removeUserAvatar, compressAndCropAvatar, getEffectiveUserId } from '../../services/authService.js?v=223.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=223.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=223.0';
import { speakWord, setSavedVoiceAccent, getSavedVoiceAccent, isAudioMuted, setSavedSilentMode, playSuccessSound, isSfxMuted, setSavedSfxMuted } from '../../services/audioService.js?v=223.0';
import { renderAvatarPickerModal } from './AvatarPickerModal.js?v=223.0';
import { t, getInterfaceLanguage, setInterfaceLanguage } from '../../services/i18n.js?v=223.0';
import { deleteCurrentUserAccount } from '../../services/firebase.js?v=223.0';
import { openPrivacyModal } from '../modals/PrivacyModal.js?v=223.0';

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
              ? `<img src="${avatar}" alt="Avatar" class="profile-avatar-img" referrerpolicy="no-referrer" />`
              : `<div class="profile-avatar-placeholder">${user && user.name != null ? String(user.name).trim().charAt(0).toUpperCase() || '👤' : '👤'}</div>`
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


      <div class="settings-footer">
        ${
          user
            ? `
          <!-- Delete Account Button (Clean, no card container) -->
          <button type="button" id="delete-account-btn" class="settings-delete-account-btn">
            ${t('settings_account_delete_btn')}
          </button>
        `
            : ''
        }

        <button type="button" id="open-privacy-btn" class="settings-privacy-btn">
          ${t('settings_privacy_policy')}
        </button>
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
  function triggerAutoSave(langOverride) {
    const activeLang = langOverride || localStorage.getItem('myduo_interface_lang') || 'en';
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
    ukVoiceBtn.addEventListener('click', () => {
      currentAccent = 'uk';
      setSavedVoiceAccent('uk');
      updateVoiceButtons();
      speakWord('Hello', null, 'en-GB', 'uk', true);
      triggerAutoSave();
      // Show download modal for UK Elementary audio pack if not yet downloaded
      if (typeof window.showAccentDownloadModalIfNeeded === 'function') {
        window.showAccentDownloadModalIfNeeded('uk');
      }
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

  function setActiveThemeBtn(active) {
    [lightBtn, darkBtn].forEach((b) => b && b.classList.remove('active'));
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
        if (typeof setInterfaceLanguage === 'function') {
          setInterfaceLanguage(val);
        } else {
          localStorage.setItem('myduo_interface_lang', val);
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
    });
  }

  // Bind Privacy Policy button (in-app modal)
  const openPrivacyBtn = container.querySelector('#open-privacy-btn');
  if (openPrivacyBtn) {
    openPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openPrivacyModal();
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
