import { getCurrentUser, getGuestTrainingCount, GUEST_WORD_LIMIT, getUserAvatar } from '../../services/authService.js?v=16.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=16.0';

let globalAuthChangedCallback = () => {};
let globalTabChangeCallback = () => {};

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

function renderHeaderRightActions(user) {
  const avatar = getUserAvatar();
  let badgeContent = '⚙️';
  let extraClass = '';
  if (avatar) {
    badgeContent = `<img src="${avatar}" alt="Avatar" class="header-avatar-img" />`;
    extraClass = 'has-avatar';
  } else if (user && user.name) {
    badgeContent = user.name.trim().charAt(0).toUpperCase();
  }

  if (user) {
    return `<button class="header-profile-badge ${extraClass}" id="profile-btn" title="Настройки">${badgeContent}</button>`;
  }
  return `
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="header-auth-btn" id="login-header-btn">Войти</button>
      <button class="header-profile-badge ${extraClass}" id="profile-btn" title="Настройки">${badgeContent}</button>
    </div>
  `;
}

function renderAppLayout(onTabChange = () => {}, onUserAuthChanged = () => {}, onLogoClick = () => {}) {
  globalAuthChangedCallback = onUserAuthChanged;
  globalTabChangeCallback = onTabChange;

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
              ${user ? user.name : `🎁 Демо: ${guestCount}/${GUEST_WORD_LIMIT} слов`}
            </small>
          </div>
        </div>
        
        <div class="header-right-actions">
          ${renderHeaderRightActions(user)}
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
      </nav>

    </div>
  `;

  applyTheme(currentTheme);

  // Bind Brand Logo Click
  const brandLogo = app.querySelector('#brand-logo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      onLogoClick();
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
      renderAuthModal(async () => {
        updateHeaderUser();
        await globalAuthChangedCallback();
      });
    });
  }

  const profileBtn = app.querySelector('#profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const navTabs = document.querySelectorAll('.nav-tab');
      navTabs.forEach((t) => t.classList.remove('active'));
      globalTabChangeCallback('settings');
    });
  }
}

function updateHeaderUser(onUserAuthChanged) {
  if (typeof onUserAuthChanged === 'function') {
    globalAuthChangedCallback = onUserAuthChanged;
  }

  const user = getCurrentUser();
  const guestCount = getGuestTrainingCount();
  const statusEl = document.querySelector('#header-user-status');
  if (statusEl) {
    statusEl.textContent = user ? user.name : `🎁 Демо: ${guestCount}/${GUEST_WORD_LIMIT} слов`;
  }

  const actionsContainer = document.querySelector('.header-right-actions');
  if (actionsContainer) {
    actionsContainer.innerHTML = renderHeaderRightActions(user);

    const loginHeaderBtn = actionsContainer.querySelector('#login-header-btn');
    if (loginHeaderBtn) {
      loginHeaderBtn.addEventListener('click', () => {
        renderAuthModal(async () => {
          updateHeaderUser();
          await globalAuthChangedCallback();
        });
      });
    }

    const profileBtn = actionsContainer.querySelector('#profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach((t) => t.classList.remove('active'));
        globalTabChangeCallback('settings');
      });
    }
  }
}

// Automatically react to global auth & avatar changes anywhere in the app
if (typeof window !== 'undefined') {
  window.addEventListener('myduo:auth_changed', () => {
    updateHeaderUser();
    if (typeof globalAuthChangedCallback === 'function') {
      globalAuthChangedCallback();
    }
  });

  window.addEventListener('myduo:avatar_changed', () => {
    updateHeaderUser();
  });
}

export { renderAppLayout, updateHeaderUser, applyTheme, getSavedTheme, toggleTheme };
