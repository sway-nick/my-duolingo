import { getUserSettings, saveUserSettings } from '../../services/api.js?v=8.0';
import { getCurrentUser, logoutUser } from '../../services/authService.js?v=8.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=8.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=8.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getCurrentUser();
  const currentTheme = getSavedTheme();

  container.innerHTML = `
    <div class="settings-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div>
          <h2>⚙️ Настройки</h2>
          <p class="subtitle">Настройки сохраняются автоматически в вашем профиле</p>
        </div>
        <span class="autosave-badge" id="autosave-status" style="opacity: 0; transition: opacity 0.3s ease; white-space: nowrap; margin-top: 4px;">
          ✓ Сохранено
        </span>
      </div>

      <!-- User Profile Card -->
      <div class="settings-card profile-card">
        <div class="profile-avatar">👤</div>
        <div class="profile-details">
          <h3>${user ? user.name : 'Гостевой режим'}</h3>
          <p>${user ? user.email : 'Авторизуйтесь, чтобы синхронизировать настройки с Google Таблицей'}</p>
        </div>
        <div>
          ${
            user
              ? `<button class="secondary-button" id="logout-btn" style="width: auto; padding: 10px 18px; min-height: 42px; height: 42px; font-size: 14.5px;">Выйти</button>`
              : `<button class="primary-button" id="login-modal-btn" style="width: auto; padding: 10px 18px; min-height: 42px; height: 42px; font-size: 14.5px;">Войти</button>`
          }
        </div>
      </div>

      <!-- Theme Switcher Card -->
      <div class="settings-card">
        <h3>🎨 Тема оформления</h3>
        <div class="theme-options-row">
          <button class="theme-option-btn ${currentTheme === 'light' ? 'active' : ''}" id="theme-light-btn">
            ☀️ Светлая тема
          </button>
          <button class="theme-option-btn ${currentTheme === 'dark' ? 'active' : ''}" id="theme-dark-btn">
            🌙 Тёмная тема
          </button>
        </div>
      </div>

      <!-- Goals Card -->
      <div class="settings-card">
        <h3 style="margin-bottom: 14px;">📌 Задача на день</h3>
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

  // Helper: auto-save function
  async function triggerAutoSave() {
    const newSettings = {
      ...settings,
      dailyGoal: Number(goalSelect.value),
      theme: getSavedTheme(),
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
}

export { renderSettingsView };
