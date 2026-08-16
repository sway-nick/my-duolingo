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
        <p class="subtitle">Управляйте вашим профилем, темой и методами обучения</p>
      </div>

      <!-- User Profile Card -->
      <div class="settings-card profile-card">
        <div class="profile-avatar">👤</div>
        <div class="profile-details">
          <h3>${user ? user.name : 'Гостевой режим'}</h3>
          <p>${user ? user.email : 'Авторизуйтесь, чтобы сохранять прогресс между устройствами'}</p>
        </div>
        <div>
          ${
            user
              ? `<button class="secondary-button" id="logout-btn">Выйти</button>`
              : `<button class="primary-button" id="login-modal-btn">Войти / Регистрация</button>`
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

      <!-- Methods Configuration Card -->
      <div class="settings-card">
        <h3>🎯 Методы и форматы обучения</h3>
        <p class="card-desc">Включите методы, которые хотите использовать во время тренировок:</p>
        
        <div class="methods-checkbox-list">
          <label class="checkbox-label">
            <input type="checkbox" id="method-quiz" value="quiz" />
            <span class="custom-check"></span>
            <div class="label-text">
              <strong>Квиз (Выбор правильного ответа)</strong>
              <small>Показывает 4 варианта перевода</small>
            </div>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" id="method-cards" value="cards" />
            <span class="custom-check"></span>
            <div class="label-text">
              <strong>Карточки слов (Flashcards)</strong>
              <small>Поворот карточки и самопроверка difficulty</small>
            </div>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" id="method-input" value="input" />
            <span class="custom-check"></span>
            <div class="label-text">
              <strong>Текстовый ввод</strong>
              <small>Набор перевода с клавиатуры</small>
            </div>
          </label>
        </div>
      </div>

      <!-- Goals & Preferences -->
      <div class="settings-card">
        <h3>📌 Дневная цель и уровень</h3>
        
        <div class="setting-field">
          <label for="daily-goal-select">Дневная цель (слов в день):</label>
          <select id="daily-goal-select" class="settings-select">
            <option value="5">5 слов / день</option>
            <option value="10">10 слов / день</option>
            <option value="15">15 слов / день</option>
            <option value="20">20 слов / день</option>
          </select>
        </div>

        <div class="setting-field">
          <label for="level-select">Целевой уровень сложности слов:</label>
          <select id="level-select" class="settings-select">
            <option value="All">Все уровни (Все модули разблокированы)</option>
            <option value="A1">A1 - Начальный</option>
            <option value="A2">A2 - Элементарный</option>
            <option value="B1">B1 - Средний</option>
            <option value="B2">B2 - Выше среднего</option>
          </select>
        </div>
      </div>

      <div class="save-bar">
        <button class="primary-button" id="save-settings-btn">Сохранить настройки</button>
        <span class="save-status" id="save-status" style="display:none;">✓ Сохранено</span>
      </div>
    </div>
  `;

  // Bind theme buttons
  const lightBtn = container.querySelector('#theme-light-btn');
  const darkBtn = container.querySelector('#theme-dark-btn');

  lightBtn.addEventListener('click', () => {
    applyTheme('light');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  });

  darkBtn.addEventListener('click', () => {
    applyTheme('dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  });

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

  // Load current settings
  const settings = await getUserSettings();
  const enabledList = (settings.enabledMethods || 'quiz,cards,input').split(',');

  const quizCheck = container.querySelector('#method-quiz');
  const cardsCheck = container.querySelector('#method-cards');
  const inputCheck = container.querySelector('#method-input');
  const goalSelect = container.querySelector('#daily-goal-select');
  const levelSelect = container.querySelector('#level-select');

  quizCheck.checked = enabledList.includes('quiz');
  cardsCheck.checked = enabledList.includes('cards');
  inputCheck.checked = enabledList.includes('input');
  goalSelect.value = String(settings.dailyGoal || 10);
  levelSelect.value = settings.level || 'All';

  // Save handler
  const saveBtn = container.querySelector('#save-settings-btn');
  const saveStatus = container.querySelector('#save-status');

  saveBtn.addEventListener('click', async () => {
    const selectedMethods = [];
    if (quizCheck.checked) selectedMethods.push('quiz');
    if (cardsCheck.checked) selectedMethods.push('cards');
    if (inputCheck.checked) selectedMethods.push('input');

    if (selectedMethods.length === 0) {
      alert('Пожалуйста, выберите хотя бы один метод обучения!');
      return;
    }

    const newSettings = {
      dailyGoal: Number(goalSelect.value),
      enabledMethods: selectedMethods.join(','),
      level: levelSelect.value,
      theme: getSavedTheme(),
    };

    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';

    await saveUserSettings(newSettings);

    saveBtn.disabled = false;
    saveBtn.textContent = 'Сохранить настройки';
    saveStatus.style.display = 'inline';
    setTimeout(() => {
      saveStatus.style.display = 'none';
    }, 2500);
  });
}

export { renderSettingsView };
