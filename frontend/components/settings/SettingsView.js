import { getUserSettings, saveUserSettings } from '../../services/api.js?v=8.0';
import { getCurrentUser, logoutUser } from '../../services/authService.js?v=8.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=8.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=8.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}, allWords = []) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getCurrentUser();
  const currentTheme = getSavedTheme();

  // Extract unique categories from words dictionary
  const categories = Array.from(new Set(allWords.map((w) => w.category).filter(Boolean)));

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

      <!-- Methods Configuration Card -->
      <div class="settings-card">
        <h3>🎯 Методы и форматы обучения</h3>
        <p class="card-desc">Включите методы, которые хотите использовать во время тренировок (автосохранение):</p>
        
        <div class="methods-checkbox-list">
          <label class="checkbox-label">
            <input type="checkbox" id="method-quiz" value="quiz" />
            <span class="custom-check"></span>
            <div class="label-text">
              <strong>Квиз (Выбор ответа)</strong>
              <small>4 варианта перевода</small>
            </div>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" id="method-cards" value="cards" />
            <span class="custom-check"></span>
            <div class="label-text">
              <strong>Карточки слов (Flashcards)</strong>
              <small>Поворот карточки: «Сложно» / «Легко»</small>
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

      <!-- Goals & Category Filter -->
      <div class="settings-card">
        <h3>📌 Дневная цель и категория</h3>
        
        <div class="setting-field">
          <label for="daily-goal-select">Дневная цель (слов в день):</label>
          <select id="daily-goal-select" class="settings-select">
            <option value="10">10 слов в день</option>
            <option value="20">20 слов в день</option>
            <option value="30">30 слов в день</option>
            <option value="40">40 слов в день</option>
            <option value="50">50 слов в день</option>
          </select>
        </div>

        <div class="setting-field">
          <label for="category-select">Изучаемая категория (фильтр тренировки):</label>
          <select id="category-select" class="settings-select">
            <option value="All">Все категории (Весь словарь)</option>
            ${categories
              .map(
                (cat) => `
              <option value="${cat}">${cat} (${allWords.filter((w) => w.category === cat).length} слов)</option>
            `,
              )
              .join('')}
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
  const enabledList = (settings.enabledMethods || 'quiz,cards,input').split(',');

  const quizCheck = container.querySelector('#method-quiz');
  const cardsCheck = container.querySelector('#method-cards');
  const inputCheck = container.querySelector('#method-input');
  const goalSelect = container.querySelector('#daily-goal-select');
  const categorySelect = container.querySelector('#category-select');
  const autoSaveStatus = container.querySelector('#autosave-status');

  quizCheck.checked = enabledList.includes('quiz');
  cardsCheck.checked = enabledList.includes('cards');
  inputCheck.checked = enabledList.includes('input');
  goalSelect.value = String(settings.dailyGoal || 10);
  categorySelect.value = settings.category || settings.level || 'All';

  // Helper: auto-save function
  async function triggerAutoSave() {
    const selectedMethods = [];
    if (quizCheck.checked) selectedMethods.push('quiz');
    if (cardsCheck.checked) selectedMethods.push('cards');
    if (inputCheck.checked) selectedMethods.push('input');

    if (selectedMethods.length === 0) {
      quizCheck.checked = true;
      selectedMethods.push('quiz');
    }

    const newSettings = {
      dailyGoal: Number(goalSelect.value),
      enabledMethods: selectedMethods.join(','),
      category: categorySelect.value,
      level: categorySelect.value,
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

  // Bind change listeners for auto-save
  quizCheck.addEventListener('change', triggerAutoSave);
  cardsCheck.addEventListener('change', triggerAutoSave);
  inputCheck.addEventListener('change', triggerAutoSave);
  goalSelect.addEventListener('change', triggerAutoSave);
  categorySelect.addEventListener('change', triggerAutoSave);

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
