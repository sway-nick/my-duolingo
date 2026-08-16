import { getCurrentUser, getGuestTrainingCount, GUEST_WORD_LIMIT } from '../../services/authService.js?v=8.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=8.0';

function getSavedTheme() {
  return localStorage.getItem('myduo_theme') || 'light';
}

function applyTheme(theme) {
  localStorage.setItem('myduo_theme', theme);
  const app = document.querySelector('.mobile-app');
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    if (app) app.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    if (app) app.classList.remove('dark-theme');
  }
}

function toggleTheme() {
  const current = getSavedTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

function renderAppLayout(onTabChange = () => {}, onUserAuthChanged = () => {}, onLogoClick = () => {}) {
  const app = document.querySelector('#app');
  const user = getCurrentUser();
  const currentTheme = getSavedTheme();
  const guestCount = getGuestTrainingCount();

  app.innerHTML = `
    <div class="mobile-app ${currentTheme === 'dark' ? 'dark-theme' : ''}">

      <header class="mobile-header">
        <div class="brand" id="brand-logo" style="cursor: pointer;" title="Перейти на главную (режим Тест)">
          <span class="brand-icon">🦉</span>
          <div>
            <h2>English Trainer</h2>
            <small class="user-status-text" id="header-user-status">
              ${user ? `👤 ${user.name}` : `🎁 Демо: ${guestCount}/${GUEST_WORD_LIMIT} слов`}
            </small>
          </div>
        </div>
        
        <div class="header-right-actions">
          <button class="theme-toggle-btn" id="theme-toggle-btn" title="Переключить тему">
            ${currentTheme === 'dark' ? '☼' : '☾'}
          </button>

          ${
            user
              ? `<button class="header-profile-badge" id="profile-btn" title="Ваш профиль">👤</button>`
              : `<button class="header-auth-btn" id="login-header-btn">Войти</button>`
          }
        </div>
      </header>

      <main class="app-main-content">
        <div id="app-content"></div>
      </main>

      <nav class="bottom-nav">
        <button class="nav-tab active" data-tab="training" title="Тренировка">
          <span class="tab-icon">🎓</span>
        </button>
        <button class="nav-tab" data-tab="favorites" title="Избранное">
          <span class="tab-icon">❤️</span>
        </button>
        <button class="nav-tab" data-tab="stats" title="Прогресс">
          <span class="tab-icon">📊</span>
        </button>
        <button class="nav-tab" data-tab="dictionary" title="Словарь">
          <span class="tab-icon">📖</span>
        </button>
        <button class="nav-tab" data-tab="settings" title="Настройки">
          <span class="tab-icon">⚙️</span>
        </button>
      </nav>

    </div>
  `;

  applyTheme(currentTheme);

  // Bind logo click (navigate to Test mode on Training tab)
  const brandLogo = app.querySelector('#brand-logo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      onLogoClick();
    });
  }

  // Bind theme toggle button in header
  const themeBtn = app.querySelector('#theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const newTheme = toggleTheme();
      themeBtn.textContent = newTheme === 'dark' ? '☼' : '☾';
    });
  }

  // Bind tab switching
  const tabs = app.querySelectorAll('.nav-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      onTabChange(targetTab);
    });
  });

  // Bind auth buttons
  const loginHeaderBtn = app.querySelector('#login-header-btn');
  if (loginHeaderBtn) {
    loginHeaderBtn.addEventListener('click', () => {
      renderAuthModal(() => onUserAuthChanged());
    });
  }

  const profileBtn = app.querySelector('#profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const settingsTab = app.querySelector('.nav-tab[data-tab="settings"]');
      if (settingsTab) settingsTab.click();
    });
  }
}

function updateHeaderUser(onUserAuthChanged = () => {}) {
  const user = getCurrentUser();
  const guestCount = getGuestTrainingCount();
  const statusEl = document.querySelector('#header-user-status');
  if (statusEl) {
    statusEl.textContent = user ? `👤 ${user.name}` : `🎁 Демо: ${guestCount}/${GUEST_WORD_LIMIT} слов`;
  }

  const actionsContainer = document.querySelector('.header-right-actions');
  if (actionsContainer) {
    const currentTheme = getSavedTheme();
    actionsContainer.innerHTML = `
      <button class="theme-toggle-btn" id="theme-toggle-btn" title="Переключить тему">
        ${currentTheme === 'dark' ? '☼' : '☾'}
      </button>

      ${
        user
          ? `<button class="header-profile-badge" id="profile-btn" title="Ваш профиль">👤</button>`
          : `<button class="header-auth-btn" id="login-header-btn">Войти</button>`
      }
    `;

    const themeBtn = actionsContainer.querySelector('#theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const newTheme = toggleTheme();
        themeBtn.textContent = newTheme === 'dark' ? '☼' : '☾';
      });
    }

    const loginHeaderBtn = actionsContainer.querySelector('#login-header-btn');
    if (loginHeaderBtn) {
      loginHeaderBtn.addEventListener('click', () => {
        renderAuthModal(() => onUserAuthChanged());
      });
    }

    const profileBtn = actionsContainer.querySelector('#profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        const settingsTab = document.querySelector('.nav-tab[data-tab="settings"]');
        if (settingsTab) settingsTab.click();
      });
    }
  }
}

export { renderAppLayout, updateHeaderUser, applyTheme, getSavedTheme, toggleTheme };
