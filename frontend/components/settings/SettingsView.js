import { getUserSettings, saveUserSettings } from '../../services/api.js?v=8.0';
import { getCurrentUser, logoutUser } from '../../services/authService.js?v=8.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=8.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=8.0';
import { speakWord, setSavedVoiceGender } from '../../services/audioService.js?v=15.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getCurrentUser();
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
        <div class="profile-avatar">👤</div>
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
            ☀️ Светлая тема
          </button>
          <button class="theme-option-btn ${currentTheme === 'dark' ? 'active' : ''}" id="theme-dark-btn">
            🌙 Тёмная тема
          </button>
        </div>
      </div>

      <!-- Voice Selection Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">🗣️ Голос озвучки</h3>
        <div class="voice-options-row">
          <button class="voice-option-btn" id="voice-female-btn">
            👩 Женский
          </button>
          <button class="voice-option-btn" id="voice-male-btn">
            👨 Мужской
          </button>
        </div>
      </div>

      <!-- Goals Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">📌 Задача на день</h3>
        <select id="daily-goal-select" class="settings-select">
          <option value="10">10 слов</option>
          <option value="20">20 слов</option>
          <option value="30">30 слов</option>
          <option value="40">40 слов</option>
          <option value="50">50 слов</option>
          <option value="75">75 слов</option>
          <option value="100">100 слов</option>
        </select>
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
  const goalSelect = container.querySelector('#daily-goal-select');
  const autoSaveStatus = container.querySelector('#autosave-status');

  goalSelect.value = String(settings.dailyGoal || 10);

  // Setup Voice Selection
  let currentVoice = settings.voiceGender || 'female';
  const femaleVoiceBtn = container.querySelector('#voice-female-btn');
  const maleVoiceBtn = container.querySelector('#voice-male-btn');

  function updateVoiceButtons() {
    if (femaleVoiceBtn && maleVoiceBtn) {
      femaleVoiceBtn.classList.toggle('active', currentVoice === 'female');
      maleVoiceBtn.classList.toggle('active', currentVoice === 'male');
    }
  }
  updateVoiceButtons();

  // Helper: auto-save function
  async function triggerAutoSave() {
    const newSettings = {
      ...settings,
      dailyGoal: Number(goalSelect.value),
      theme: getSavedTheme(),
      voiceGender: currentVoice,
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

  // Bind change listener for goal
  goalSelect.addEventListener('change', triggerAutoSave);

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

  // Bind voice buttons with preview speech
  if (femaleVoiceBtn && maleVoiceBtn) {
    femaleVoiceBtn.addEventListener('click', () => {
      currentVoice = 'female';
      setSavedVoiceGender('female');
      updateVoiceButtons();
      speakWord('Hello! This is the female voice.', null, 'en-US', 'female');
      triggerAutoSave();
    });

    maleVoiceBtn.addEventListener('click', () => {
      currentVoice = 'male';
      setSavedVoiceGender('male');
      updateVoiceButtons();
      speakWord('Hello! This is the male voice.', null, 'en-US', 'male');
      triggerAutoSave();
    });
  }
}

export { renderSettingsView };
