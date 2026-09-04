import { getUserSettings, saveUserSettings, getWords } from '../../services/api.js?v=200.0';
import { getCurrentUser, logoutUser, getUserAvatar, saveUserAvatar, removeUserAvatar, compressAndCropAvatar, getEffectiveUserId } from '../../services/authService.js?v=200.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=200.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=200.0';
import { speakWord, setSavedVoiceAccent, getSavedVoiceAccent, isAudioMuted, setSavedSilentMode, playSuccessSound, isSfxMuted, setSavedSfxMuted } from '../../services/audioService.js?v=200.0';
import { renderAvatarPickerModal } from './AvatarPickerModal.js?v=200.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=200.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getCurrentUser();
  const avatar = getUserAvatar();
  const currentTheme = getSavedTheme();

  container.innerHTML = `
    <div class="settings-page" style="position: relative;">
      <span class="autosave-badge" id="autosave-status" style="position: absolute; top: -6px; right: 0; opacity: 0; transition: opacity 0.3s ease; white-space: nowrap; z-index: 20;">
        ✓ Saved
      </span>

      <!-- User Profile Card -->
      <div class="settings-card profile-card">
        <div class="profile-avatar-wrapper" id="change-avatar-trigger" title="Click to choose avatar or photo">
          ${
            avatar
              ? `<img src="${avatar}" alt="Avatar" class="profile-avatar-img" />`
              : `<div class="profile-avatar-placeholder">${user && user.name ? user.name.trim().charAt(0).toUpperCase() : '👤'}</div>`
          }
          <div class="avatar-edit-badge" title="Change avatar">🎭</div>
        </div>
        <div class="profile-details">
          <h3 style="font-size: 16px; font-weight: 700; margin: 0;">${user ? user.name : (t('demo') || 'Guest Mode')}</h3>
          ${user ? '' : `<p style="font-size: 12px; margin: 2px 0 0; color: var(--text-muted);">${t('settings_login_sub') || 'Log in to sync progress'}</p>`}
        </div>
        <div>
          ${
            user
              ? `<button class="secondary-button" id="logout-btn" style="width: auto; padding: 8px 16px; min-height: 38px; height: 38px; font-size: 14px; font-weight: 600;">${t('settings_logout')}</button>`
              : `<button class="primary-button" id="login-modal-btn" style="width: auto; padding: 8px 16px; min-height: 38px; height: 38px; font-size: 14px; font-weight: 600;">${t('settings_login')}</button>`
          }
        </div>
      </div>

      <!-- Language Selection Card -->
      <div class="settings-card" style="position: relative; z-index: 15;">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">${t('settings_lang')}</h3>
        <div class="custom-dropdown" id="lang-dropdown">
          <button type="button" class="custom-dropdown-trigger" id="lang-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
            <span id="lang-dropdown-label">English</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="custom-dropdown-menu" id="lang-dropdown-menu" role="listbox">
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
          </div>
        </div>
      </div>

      <!-- Theme Switcher Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">${t('settings_theme')}</h3>
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
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">${t('settings_sfx')}</h3>
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
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px; display: flex; align-items: center; gap: 6px;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#d4a373" style="flex-shrink: 0;">
            <path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4zm-6 16a6 6 0 0 1 12 0H6zm14.5-9a4.5 4.5 0 0 1 0 6.36l-1.06-1.06a3 3 0 0 0 0-4.24l1.06-1.06zm2.5-2.5a8 8 0 0 1 0 11.31l-1.06-1.06a6.5 6.5 0 0 0 0-9.19l1.06-1.06z"/>
          </svg>
          ${t('settings_voice')}
        </h3>
        <div class="voice-options-row">
          <button class="voice-option-btn flag-btn" id="voice-uk-btn" title="British English (UK)" aria-label="British English">
            <svg class="flag-svg-icon" viewBox="0 0 640 480" width="34" height="24">
              <path fill="#012169" d="M0 0h640v480H0z"/>
              <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 240l240 178v62h-80L320 301 81 480H0v-60l239-180L0 64V0h75z"/>
              <path fill="#C8102E" d="m424 288 216 159v33h-44L367 304l57-16zM640 22v10L432 201l-24-33 197-146h35zM0 458v-10l208-169 24 33L35 458H0zM216 192 0 33V0h44l229 176-57 16z"/>
              <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z"/>
              <path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z"/>
            </svg>
          </button>
          <button class="voice-option-btn flag-btn" id="voice-us-btn" title="American English (US)" aria-label="American English">
            <svg class="flag-svg-icon" viewBox="0 0 640 480" width="34" height="24">
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
      <div class="settings-card" style="padding: 12px 14px;">
        <button class="primary-button btn-green btn-clear-cache" id="clear-app-cache-btn" style="width: 100%; min-height: 42px; font-weight: 600; font-size: 15px;">
          ${t('settings_sync_btn')}
        </button>
      </div>

    </div>
  `;

  // Bind auth buttons
  const loginBtn = container.querySelector('#login-modal-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      renderAuthModal(async () => {
        await onUserChange();
        await renderSettingsView(containerSelector, onUserChange);
      });
    });
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutUser();
      await onUserChange();
      await renderSettingsView(containerSelector, onUserChange);
    });
  }

  // Load current user settings
  const settings = await getUserSettings();
  const autoSaveStatus = container.querySelector('#autosave-status');

  // Bind Avatar Picker on avatar click
  const avatarTrigger = container.querySelector('#change-avatar-trigger');
  if (avatarTrigger) {
    avatarTrigger.addEventListener('click', () => {
      renderAvatarPickerModal(async () => {
        if (autoSaveStatus) {
          autoSaveStatus.textContent = '✓ Avatar updated';
          autoSaveStatus.style.opacity = '1';
          setTimeout(() => {
            if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
          }, 1500);
        }
        await renderSettingsView(containerSelector, onUserChange);
      });
    });
  }




  // Setup SFX Selection
  let isSfxMutedVal = isSfxMuted() || Boolean(settings.sfxMuted);
  const sfxOnBtn = container.querySelector('#sfx-on-btn');
  const sfxOffBtn = container.querySelector('#sfx-off-btn');

  function updateSfxButtons() {
    if (sfxOnBtn && sfxOffBtn) {
      sfxOnBtn.classList.toggle('active', !isSfxMutedVal);
      sfxOffBtn.classList.toggle('active', isSfxMutedVal);
    }
  }
  updateSfxButtons();

  // Setup Voice Accent Selection (🇬🇧 UK / 🇺🇸 US)
  let currentAccent = getSavedVoiceAccent();
  const ukVoiceBtn = container.querySelector('#voice-uk-btn');
  const usVoiceBtn = container.querySelector('#voice-us-btn');

  function updateVoiceButtons() {
    if (ukVoiceBtn && usVoiceBtn) {
      ukVoiceBtn.classList.toggle('active', currentAccent === 'uk');
      usVoiceBtn.classList.toggle('active', currentAccent === 'us');
    }
  }
  updateVoiceButtons();

  // Helper: auto-save function
  async function triggerAutoSave() {
    const newSettings = {
      ...settings,
      dailyGoal: 10,
      theme: getSavedTheme(),
      voiceAccent: currentAccent,
      voiceGender: currentAccent === 'uk' ? 'male' : 'female',
      sfxMuted: isSfxMutedVal,
    };

    if (autoSaveStatus) {
      autoSaveStatus.textContent = 'Saving...';
      autoSaveStatus.style.opacity = '1';
    }

    await saveUserSettings(newSettings);
    onUserChange();

    if (autoSaveStatus) {
      autoSaveStatus.textContent = '✓ Saved in profile';
      setTimeout(() => {
        if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
      }, 1500);
    }
  }

  // Bind theme buttons with auto-save
  const lightBtn = container.querySelector('#theme-light-btn');
  const darkBtn = container.querySelector('#theme-dark-btn');
  const notebookBtn = container.querySelector('#theme-notebook-btn');

  function setActiveThemeBtn(active) {
    [lightBtn, darkBtn, notebookBtn].forEach((b) => b && b.classList.remove('active'));
    if (active) active.classList.add('active');
  }

  lightBtn.addEventListener('click', () => {
    applyTheme('light');
    setActiveThemeBtn(lightBtn);
    triggerAutoSave();
  });

  darkBtn.addEventListener('click', () => {
    applyTheme('dark');
    setActiveThemeBtn(darkBtn);
    triggerAutoSave();
  });

  if (notebookBtn) {
    notebookBtn.addEventListener('click', () => {
      applyTheme('notebook');
      setActiveThemeBtn(notebookBtn);
      triggerAutoSave();
    });
  }



  // Bind sfx buttons
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

  // Bind voice accent buttons (🇬🇧 UK / 🇺🇸 US) with preview speech
  if (ukVoiceBtn && usVoiceBtn) {
    ukVoiceBtn.addEventListener('click', () => {
      currentAccent = 'uk';
      setSavedVoiceAccent('uk');
      updateVoiceButtons();
      speakWord('Hello', null, 'en-GB', 'uk', true);
      triggerAutoSave();
    });

    usVoiceBtn.addEventListener('click', () => {
      currentAccent = 'us';
      setSavedVoiceAccent('us');
      updateVoiceButtons();
      speakWord('Hello', null, 'en-US', 'us', true);
      triggerAutoSave();
    });
  }

  // Language Dropdown handling
  const langDropdown = container.querySelector('#lang-dropdown');
  const langTrigger = container.querySelector('#lang-dropdown-trigger');
  const langLabel = container.querySelector('#lang-dropdown-label');
  const langItems = container.querySelectorAll('#lang-dropdown-menu .dropdown-item');

  const langNames = {
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
  };

  const currentLang = localStorage.getItem('myduo_interface_lang') || 'en';

  function updateLangUI(val) {
    if (langLabel) langLabel.textContent = langNames[val] || 'English';
    langItems.forEach((item) => {
      item.classList.toggle('selected', item.dataset.value === val);
    });
  }

  updateLangUI(currentLang);

  if (langTrigger && langDropdown) {
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    langItems.forEach((item) => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const val = item.dataset.value;
        localStorage.setItem('myduo_interface_lang', val);
        updateLangUI(val);
        langDropdown.classList.remove('open');
        
        // Dispatch event to reload other tabs/header and words immediately
        window.dispatchEvent(new Event('myduo:lang_changed'));
        
        // Background refresh words with new language
        getWords(true).catch(() => {});

        // Re-render settings view to show updated labels
        await triggerAutoSave();
        await renderSettingsView(containerSelector, onUserChange);
      });
    });

    // Close on click outside
    document.addEventListener('click', () => {
      langDropdown.classList.remove('open');
    });
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
}

export { renderSettingsView };
