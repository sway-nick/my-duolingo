import { getUserSettings, saveUserSettings } from '../../services/api.js?v=18.0';
import { getCurrentUser, logoutUser, getUserAvatar, saveUserAvatar, removeUserAvatar, compressAndCropAvatar, getEffectiveUserId } from '../../services/authService.js?v=18.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=18.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=18.0';
import { speakWord, setSavedVoiceAccent, getSavedVoiceAccent, isAudioMuted, setSavedSilentMode, playSuccessSound } from '../../services/audioService.js?v=24.0';
import { renderAvatarPickerModal } from './AvatarPickerModal.js?v=18.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getCurrentUser();
  const avatar = getUserAvatar();
  const currentTheme = getSavedTheme();

  container.innerHTML = `
    <div class="settings-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0;">⚙️ Настройки</h2>
        <span class="autosave-badge" id="autosave-status" style="opacity: 0; transition: opacity 0.3s ease; white-space: nowrap;">
          ✓ Сохранено
        </span>
      </div>

      <!-- User Profile Card -->
      <div class="settings-card profile-card">
        <div class="profile-avatar-wrapper" id="change-avatar-trigger" title="Нажмите, чтобы выбрать персонажа или фото">
          ${
            avatar
              ? `<img src="${avatar}" alt="Аватар" class="profile-avatar-img" />`
              : `<div class="profile-avatar-placeholder">${user && user.name ? user.name.trim().charAt(0).toUpperCase() : '👤'}</div>`
          }
          <div class="avatar-edit-badge" title="Выбрать персонажа">🎭</div>
        </div>
        <div class="profile-details">
          <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 2px;">${user ? user.name : 'Гостевой режим'}</h3>
          <p style="font-size: 12px; margin: 0; color: var(--text-muted);">${user ? user.email : 'Авторизуйтесь для синхронизации'}</p>
        </div>
        <div>
          ${
            user
              ? `<button class="secondary-button" id="logout-btn" style="width: auto; padding: 8px 16px; min-height: 38px; height: 38px; font-size: 14px; font-weight: 600;">Выйти</button>`
              : `<button class="primary-button" id="login-modal-btn" style="width: auto; padding: 8px 16px; min-height: 38px; height: 38px; font-size: 14px; font-weight: 600;">Войти</button>`
          }
        </div>
      </div>

      <!-- Theme Switcher Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">🎨 Тема оформления</h3>
        <div class="theme-options-row">
          <button class="theme-option-btn ${currentTheme === 'light' ? 'active' : ''}" id="theme-light-btn">
            ☼ Светлая
          </button>
          <button class="theme-option-btn ${currentTheme === 'dark' ? 'active' : ''}" id="theme-dark-btn">
            ☾ Тёмная
          </button>
        </div>
      </div>

      <!-- Sound Mode Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">🔊 Звук и эффекты</h3>
        <div class="sound-options-row">
          <button class="sound-option-btn" id="sound-on-btn">
            🔊 Со звуком
          </button>
          <button class="sound-option-btn" id="sound-off-btn">
            🔇 Без звука
          </button>
        </div>
      </div>

      <!-- Voice Selection Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px; display: flex; align-items: center; gap: 6px;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#d4a373" style="flex-shrink: 0;">
            <path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4zm-6 16a6 6 0 0 1 12 0H6zm14.5-9a4.5 4.5 0 0 1 0 6.36l-1.06-1.06a3 3 0 0 0 0-4.24l1.06-1.06zm2.5-2.5a8 8 0 0 1 0 11.31l-1.06-1.06a6.5 6.5 0 0 0 0-9.19l1.06-1.06z"/>
          </svg>
          Вариант озвучки
        </h3>
        <div class="voice-options-row">
          <button class="voice-option-btn flag-btn" id="voice-uk-btn" title="British English (Великобритания)" aria-label="Британский английский">
            <svg class="flag-svg-icon" viewBox="0 0 640 480" width="34" height="24">
              <path fill="#012169" d="M0 0h640v480H0z"/>
              <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 240l240 178v62h-80L320 301 81 480H0v-60l239-180L0 64V0h75z"/>
              <path fill="#C8102E" d="m424 288 216 159v33h-44L367 304l57-16zM640 22v10L432 201l-24-33 197-146h35zM0 458v-10l208-169 24 33L35 458H0zM216 192 0 33V0h44l229 176-57 16z"/>
              <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z"/>
              <path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z"/>
            </svg>
          </button>
          <button class="voice-option-btn flag-btn" id="voice-us-btn" title="American English (США)" aria-label="Американский английский">
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

      <!-- Goals Card -->
      <div class="settings-card" style="position: relative; z-index: 10;">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">📌 Задача на день</h3>
        <div class="custom-dropdown" id="goal-dropdown">
          <button type="button" class="custom-dropdown-trigger" id="goal-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
            <span id="goal-dropdown-label">20 слов</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="custom-dropdown-menu" id="goal-dropdown-menu" role="listbox">
            <div class="dropdown-item" data-value="20">20 слов</div>
            <div class="dropdown-item" data-value="30">30 слов</div>
            <div class="dropdown-item" data-value="40">40 слов</div>
            <div class="dropdown-item" data-value="50">50 слов</div>
            <div class="dropdown-item" data-value="75">75 слов</div>
            <div class="dropdown-item" data-value="100">100 слов</div>
          </div>
        </div>
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
          autoSaveStatus.textContent = '✓ Аватар обновлен';
          autoSaveStatus.style.opacity = '1';
          setTimeout(() => {
            if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
          }, 1500);
        }
        await renderSettingsView(containerSelector, onUserChange);
      });
    });
  }

  // Goal Dropdown handling (Default 20 words)
  let currentGoal = Number(settings.dailyGoal) === 10 || !settings.dailyGoal ? 20 : Number(settings.dailyGoal);
  const goalDropdown = container.querySelector('#goal-dropdown');
  const goalTrigger = container.querySelector('#goal-dropdown-trigger');
  const goalLabel = container.querySelector('#goal-dropdown-label');
  const goalItems = container.querySelectorAll('.dropdown-item');

  function updateGoalUI(val) {
    currentGoal = Number(val);
    if (goalLabel) goalLabel.textContent = `${currentGoal} слов`;
    goalItems.forEach((item) => {
      item.classList.toggle('selected', Number(item.dataset.value) === currentGoal);
    });
  }

  updateGoalUI(currentGoal);

  if (goalTrigger && goalDropdown) {
    goalTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      goalDropdown.classList.toggle('open');
    });

    goalItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = Number(item.dataset.value);
        updateGoalUI(val);
        goalDropdown.classList.remove('open');
        triggerAutoSave();
      });
    });

    // Close on click outside
    document.addEventListener('click', () => {
      goalDropdown.classList.remove('open');
    });
  }

  // Setup Sound / Silent Mode Selection
  let isSilent = isAudioMuted() || Boolean(settings.silentMode);
  const soundOnBtn = container.querySelector('#sound-on-btn');
  const soundOffBtn = container.querySelector('#sound-off-btn');

  function updateSoundButtons() {
    if (soundOnBtn && soundOffBtn) {
      soundOnBtn.classList.toggle('active', !isSilent);
      soundOffBtn.classList.toggle('active', isSilent);
    }
  }
  updateSoundButtons();

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
      dailyGoal: currentGoal,
      theme: getSavedTheme(),
      voiceAccent: currentAccent,
      voiceGender: currentAccent === 'uk' ? 'male' : 'female',
      silentMode: isSilent,
    };

    if (autoSaveStatus) {
      autoSaveStatus.textContent = 'Сохранение...';
      autoSaveStatus.style.opacity = '1';
    }

    await saveUserSettings(newSettings);
    onUserChange();

    if (autoSaveStatus) {
      autoSaveStatus.textContent = '✓ Сохранено в профиле';
      setTimeout(() => {
        if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
      }, 1500);
    }
  }

  // Bind theme buttons with auto-save
  const lightBtn = container.querySelector('#theme-light-btn');
  const darkBtn = container.querySelector('#theme-dark-btn');

  lightBtn.addEventListener('click', () => {
    applyTheme('light');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
    triggerAutoSave();
  });

  darkBtn.addEventListener('click', () => {
    applyTheme('dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
    triggerAutoSave();
  });

  // Bind sound buttons
  if (soundOnBtn && soundOffBtn) {
    soundOnBtn.addEventListener('click', () => {
      isSilent = false;
      setSavedSilentMode(false);
      updateSoundButtons();
      playSuccessSound();
      triggerAutoSave();
    });

    soundOffBtn.addEventListener('click', () => {
      isSilent = true;
      setSavedSilentMode(true);
      updateSoundButtons();
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
}

export { renderSettingsView };
