import { getCurrentUser, getGuestTrainingCount, GUEST_WORD_LIMIT, getUserAvatar } from '../../services/authService.js?v=16.0';
import { getUserWeeklyXP } from '../../services/api.js?v=16.0';
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
  const xp = getUserWeeklyXP();
  let badgeContent = '⚙️';
  let extraClass = '';
  if (avatar) {
    badgeContent = `<img src="${avatar}" alt="Avatar" class="header-avatar-img" />`;
    extraClass = 'has-avatar';
  } else if (user && user.name) {
    badgeContent = user.name.trim().charAt(0).toUpperCase();
  }

  const xpBadgeHtml = `
    <button class="header-xp-badge" id="header-xp-btn" title="Ваш недельный опыт (XP). Нажмите, чтобы открыть рейтинг">
      <span class="xp-badge-icon">💎</span>
      <span class="xp-badge-val" id="header-xp-val">${xp}</span>
      <span class="xp-badge-unit">XP</span>
    </button>
  `;

  if (user) {
    return `
      <div style="display:flex; align-items:center; gap:8px;">
        ${xpBadgeHtml}
        <button class="header-profile-badge ${extraClass}" id="profile-btn" title="Настройки">${badgeContent}</button>
      </div>
    `;
  }
  return `
    <div style="display:flex; align-items:center; gap:8px;">
      ${xpBadgeHtml}
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
        <button class="nav-tab" data-tab="leaderboard" title="Рейтинг недели">
          <span class="tab-icon">🏆</span>
        </button>
        <button class="nav-tab" data-tab="dictionary" title="Словарь">
          <span class="tab-icon">📖</span>
        </button>
        <button class="nav-tab" data-tab="favorites" title="Избранное">
          <span class="tab-icon">❤️</span>
        </button>
        <button class="nav-tab" data-tab="stats" title="Прогресс">
          <span class="tab-icon">📊</span>
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

  bindHeaderActionButtons(app);
}

function bindHeaderActionButtons(container) {
  if (!container) return;

  const xpBtn = container.querySelector('#header-xp-btn');
  if (xpBtn) {
    xpBtn.addEventListener('click', () => {
      const navTabs = document.querySelectorAll('.nav-tab');
      navTabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === 'leaderboard'));
      globalTabChangeCallback('leaderboard');
    });
  }

  const loginHeaderBtn = container.querySelector('#login-header-btn');
  if (loginHeaderBtn) {
    loginHeaderBtn.addEventListener('click', () => {
      renderAuthModal(async () => {
        updateHeaderUser();
        await globalAuthChangedCallback();
      });
    });
  }

  const profileBtn = container.querySelector('#profile-btn');
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
    bindHeaderActionButtons(actionsContainer);
  }
}

// Automatically react to global auth, avatar, and XP changes anywhere in the app
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

  window.addEventListener('myduo:xp_changed', (e) => {
    const xpValEl = document.querySelector('#header-xp-val');
    const xpBtnEl = document.querySelector('#header-xp-btn');
    if (xpValEl && e.detail && typeof e.detail.xp !== 'undefined') {
      xpValEl.textContent = e.detail.xp;
    }
    if (xpBtnEl && e.detail && e.detail.delta) {
      xpBtnEl.classList.remove('xp-bump-up', 'xp-bump-down');
      void xpBtnEl.offsetWidth; // trigger reflow
      xpBtnEl.classList.add(e.detail.delta > 0 ? 'xp-bump-up' : 'xp-bump-down');
      setTimeout(() => {
        xpBtnEl.classList.remove('xp-bump-up', 'xp-bump-down');
      }, 700);
    }
  });
}

export { renderAppLayout, updateHeaderUser, applyTheme, getSavedTheme, toggleTheme };
