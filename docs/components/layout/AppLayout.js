import { getCurrentUser } from '../../services/authService.js?v=7.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=7.0';

function renderAppLayout(onTabChange = () => {}, onUserAuthChanged = () => {}) {
  const app = document.querySelector('#app');
  const user = getCurrentUser();

  app.innerHTML = `
    <div class="mobile-app">

      <header class="mobile-header">
        <div class="brand">
          <span class="brand-icon">🦉</span>
          <div>
            <h2>English Trainer</h2>
            <small class="user-status-text" id="header-user-status">
              ${user ? `👤 ${user.name}` : 'Гостевой режим'}
            </small>
          </div>
        </div>
        
        <div class="header-right-actions">
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
        <button class="nav-tab active" data-tab="training">
          <span class="tab-icon">🎓</span>
          <span>Тренировка</span>
        </button>
        <button class="nav-tab" data-tab="favorites">
          <span class="tab-icon">❤️</span>
          <span>Избранное</span>
        </button>
        <button class="nav-tab" data-tab="stats">
          <span class="tab-icon">📊</span>
          <span>Прогресс</span>
        </button>
        <button class="nav-tab" data-tab="dictionary">
          <span class="tab-icon">📖</span>
          <span>Словарь</span>
        </button>
        <button class="nav-tab" data-tab="settings">
          <span class="tab-icon">⚙️</span>
          <span>Настройки</span>
        </button>
      </nav>

    </div>
  `;

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
      // Navigate to settings tab
      const settingsTab = app.querySelector('.nav-tab[data-tab="settings"]');
      if (settingsTab) settingsTab.click();
    });
  }
}

function updateHeaderUser() {
  const user = getCurrentUser();
  const statusEl = document.querySelector('#header-user-status');
  if (statusEl) {
    statusEl.textContent = user ? `👤 ${user.name}` : 'Гостевой режим';
  }
}

export { renderAppLayout, updateHeaderUser };
