import { getCurrentUser, getGuestTrainingCount, GUEST_WORD_LIMIT, getUserAvatar } from '../../services/authService.js?v=18.0';
import { getUserWeeklyXP, getUserWeeklyRank, formatCompactXp } from '../../services/api.js?v=18.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=18.0';

let globalAuthChangedCallback = () => {};
let globalTabChangeCallback = () => {};

function getSavedTheme() {
  return localStorage.getItem('myduo_theme') || 'light';
}

function applyTheme(theme) {
  localStorage.setItem('myduo_theme', theme);
  const app = document.querySelector('.mobile-app');
  // Remove all theme classes first
  document.body.classList.remove('dark-theme', 'notebook-theme');
  if (app) app.classList.remove('dark-theme', 'notebook-theme');

  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    if (app) app.classList.add('dark-theme');
  } else if (theme === 'notebook') {
    document.body.classList.add('notebook-theme');
    if (app) app.classList.add('notebook-theme');
  }
  // 'light' → no extra class needed
}

function toggleTheme() {
  const current = getSavedTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

function getHeaderRankBadge(rank, xp) {
  const numXp = Number(xp) || 0;
  if (numXp <= 0 || !rank) {
    return { isIcon: false, content: 'Lv -', title: 'Лига недели (0 XP)' };
  }
  if (rank === 1) return { isIcon: true, content: '💎', title: '1 место в Лиге недели (Алмаз)' };
  if (rank === 2) return { isIcon: true, content: '🥇', title: '2 место в Лиге недели (Золото)' };
  if (rank === 3) return { isIcon: true, content: '🥈', title: '3 место в Лиге недели (Серебро)' };
  if (rank === 4) return { isIcon: true, content: '🥉', title: '4 место в Лиге недели (Бронза)' };
  return { isIcon: false, content: `Lv ${rank}`, title: `${rank} место в Лиге недели` };
}

function renderHeaderRightActions(user) {
  const avatar = getUserAvatar();
  const xp = getUserWeeklyXP();
  const rank = getUserWeeklyRank();
  const rankBadge = getHeaderRankBadge(rank, xp);
  let badgeContent = '⚙️';
  let extraClass = '';
  if (avatar) {
    badgeContent = `<img src="${avatar}" alt="Avatar" class="header-avatar-img" />`;
    extraClass = 'has-avatar';
  } else if (user && user.name) {
    badgeContent = user.name.trim().charAt(0).toUpperCase();
  }

  const formattedXp = formatCompactXp(xp);
  const iconHtml = rankBadge.isIcon
    ? `<span class="xp-badge-icon" id="header-xp-icon">${rankBadge.content}</span>`
    : `<span class="xp-badge-level" id="header-xp-icon">${rankBadge.content}</span>`;

  const xpBadgeHtml = `
    <button class="header-xp-badge" id="header-xp-btn" title="${rankBadge.title}. Нажмите, чтобы открыть рейтинг">
      ${iconHtml}
      <span class="xp-badge-text"><span id="header-xp-val">${formattedXp}</span>&nbsp;XP</span>
    </button>
  `;

  if (user) {
    return `
      <div style="display:flex; align-items:center; gap:10px;">
        ${xpBadgeHtml}
        <button class="header-profile-badge ${extraClass}" id="profile-btn" title="Настройки">${badgeContent}</button>
      </div>
    `;
  }
  return `
    <div style="display:flex; align-items:center; gap:10px;">
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
        <div class="brand" id="brand-logo" style="cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 2px;" title="Перейти на главную (режим Тест)">
          <div style="display: flex; align-items: center;">
            <!-- SVG Cup-with-Book Logo -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 56" width="160" height="36" style="display: block;">
              <!-- Steam lines -->
              <path d="M20,20 Q24,14 20,8" stroke="#FF6A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <path d="M30,20 Q34,12 30,6" stroke="#FF6A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <path d="M40,20 Q44,14 40,8" stroke="#FF6A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <!-- Cup body -->
              <path d="M8,28 C8,48 18,58 30,58 C42,58 52,48 52,28 Z" fill="#F45100"/>
              <!-- Handle -->
              <path d="M52,34 C60,34 61,44 52,47" stroke="#F45100" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <!-- Open Book pages -->
              <path d="M30,28 Q23,25 16,28 L16,36 Q23,33 30,36 Z" fill="#FFF"/>
              <path d="M30,28 Q37,25 44,28 L44,36 Q37,33 30,36 Z" fill="#FFF"/>
              <line x1="30" y1="28" x2="30" y2="36" stroke="#F45100" stroke-width="1"/>
              <!-- EN Text -->
              <text x="30" y="50" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#FFF" text-anchor="middle">EN</text>
              <!-- Brand Name Text -->
              <text x="70" y="30" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="20" fill="var(--text-main)">English</text>
              <text x="70" y="50" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="20" fill="#FF6A00">Breakfast</text>
            </svg>
          </div>
          <small class="user-status-text" id="header-user-status" style="margin-left: 45px; margin-top: -4px;">
            ${user ? '' : `🎁 Демо: ${guestCount}/${GUEST_WORD_LIMIT} слов`}
          </small>
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
    statusEl.textContent = user ? '' : `🎁 Демо: ${guestCount}/${GUEST_WORD_LIMIT} слов`;
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
    const xpIconEl = document.querySelector('#header-xp-icon');
    const newXp = e.detail && typeof e.detail.xp !== 'undefined' ? e.detail.xp : getUserWeeklyXP();

    if (xpValEl) {
      xpValEl.textContent = formatCompactXp(newXp);
    }

    const rank = getUserWeeklyRank();
    const rankBadge = getHeaderRankBadge(rank, newXp);
    if (xpIconEl) {
      xpIconEl.textContent = rankBadge.content;
      xpIconEl.className = rankBadge.isIcon ? 'xp-badge-icon' : 'xp-badge-level';
      if (xpBtnEl) {
        xpBtnEl.title = `${rankBadge.title}. Нажмите, чтобы открыть рейтинг`;
      }
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
