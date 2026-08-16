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
      <div class="page-header">
        <h2>⚙️ Персональные настройки</h2>
        <p class="subtitle">Настройки сохраняются автоматически в вашем профиле</p>
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
              ? `<button class="secondary-button" id="logout-btn">Выйти</button>`
              : `<button class="primary-button" id="login-modal-btn">Войти / Регистрация</button>`
          }
        </div>
      </div>

      <!-- Auto-save notification indicator -->
      <div class="autosave-bar">
        <span class="autosave-badge" id="autosave-status" style="opacity: 0; transition: opacity 0.3s ease;">
          ✓ Сохранено в профиле
        </span>
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
        <h3>📌 Дневная цель обучения</h3>
        
        <div class="setting-field">
          <label for="daily-goal-select">Количество новых слов в день:</label>
          <select id="daily-goal-select" class="settings-select">
            <option value="10">10 слов в день</option>
            <option value="20">20 слов в день</option>
            <option value="30">30 слов в день</option>
            <option value="40">40 слов в день</option>
            <option value="50">50 слов в день</option>
          </select>
        </div>
      </div>

    </div>
  `;

  // Bind auth buttons
  const loginBtn = container.querySelector('#login-modal-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      renderAuthModal(() => onUserChange());
    });
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      onUserChange();
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
