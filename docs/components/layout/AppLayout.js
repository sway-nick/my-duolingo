import { getCurrentUser, getGuestTrainingCount, GUEST_WORD_LIMIT, getUserAvatar } from '../../services/authService.js?v=18.0';
import { getUserWeeklyXP, getUserWeeklyRank, formatCompactXp } from '../../services/api.js?v=18.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=18.0';
import { t } from '../../services/i18n.js?v=130.0';

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
  const xp = getUserWeeklyXP();
  const rank = getUserWeeklyRank();
  const rankBadge = getHeaderRankBadge(rank, xp);

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

  return `
    <div style="display:flex; align-items:center; gap:10px;">
      ${xpBadgeHtml}
      <button class="header-burger-btn" id="header-burger-btn" title="Меню" aria-label="Открыть меню">
        <svg class="burger-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="color: var(--text-main);">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
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

  const avatar = getUserAvatar();
  let avatarHtml = '';
  if (avatar) {
    avatarHtml = `<img src="${avatar}" alt="Аватар" class="drawer-avatar-img" />`;
  } else {
    const initial = user && user.name ? user.name.trim().charAt(0).toUpperCase() : '👤';
    avatarHtml = `<div class="drawer-avatar-placeholder">${initial}</div>`;
  }
  const username = user ? user.name : 'Гость (Демо)';
  const email = user ? user.email : `Прогресс: ${guestCount}/${GUEST_WORD_LIMIT} слов`;

  app.innerHTML = `
    <div class="mobile-app ${currentTheme === 'dark' ? 'dark-theme' : ''}">

      <header class="mobile-header">
        <div class="brand" id="brand-logo" style="cursor: pointer; display: flex; align-items: center; gap: 8px;" title="Перейти на главную (режим Тест)">
          <!-- SVG Cup-with-Book Logo -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 56" width="32" height="39" style="display: block; flex-shrink: 0;">
            <!-- Steam lines -->
            <path d="M12,16 C7,12 17,8 12,4" stroke="#FF6A00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M22,16 C17,12 27,8 22,2" stroke="#FF6A00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M32,16 C27,12 37,8 32,4" stroke="#FF6A00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <!-- Cup body -->
            <path d="M4,28 C4,46 12,54 22,54 C32,54 40,46 40,28 Z" fill="#FF6A00"/>
            <!-- Handle -->
            <path d="M40,32 C48,32 48,45 35,45" stroke="#FF6A00" stroke-width="4.5" fill="none" stroke-linecap="round"/>
            <!-- Open Book -->
            <path d="M5,30 Q13.5,27 22,30 Q30.5,27 39,30 L39,20 Q30.5,17 22,20 Q13.5,17 5,20 Z" fill="#FFF" stroke="#FF6A00" stroke-width="1.8"/>
            <line x1="22" y1="20" x2="22" y2="30" stroke="#FF6A00" stroke-width="1.8"/>
            <!-- EN Text -->
            <text x="22" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#FFF" text-anchor="middle">EN</text>
          </svg>

          <div style="display: flex; flex-direction: column; justify-content: center; line-height: 1.2;">
            <div style="font-weight: 800; font-size: 16px; color: var(--text-main); white-space: nowrap; letter-spacing: -0.2px;">
              English <span style="color: #FF6A00;">Breakfast</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); font-weight: 500; white-space: nowrap;">
              <span>Vocabulary</span>
              <span id="header-user-status" style="display: ${user ? 'none' : 'inline'}; color: #ea580c; font-weight: 600; font-size: 11px;">
                • 🎁 ${guestCount}/${GUEST_WORD_LIMIT}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-right-actions">
          ${renderHeaderRightActions(user)}
        </div>
      </header>

      <main class="app-main-content">
        <div id="app-content"></div>
      </main>

      <!-- Drawer Overlay -->
      <div class="drawer-overlay" id="drawer-overlay"></div>

      <!-- Hamburger Drawer -->
      <div class="burger-drawer" id="burger-drawer">
        <div class="drawer-header">
          <div class="drawer-profile">
            <div class="drawer-avatar-wrapper">
              ${avatarHtml}
            </div>
            <div class="drawer-profile-info">
              <div class="drawer-username">${username}</div>
              <div class="drawer-email">${email}</div>
            </div>
          </div>
          <button class="drawer-close-btn" id="drawer-close-btn" aria-label="Close">&times;</button>
        </div>

        <div class="drawer-menu">
          <button class="nav-tab active" data-tab="training" title="${t('training')}">
            <span class="tab-icon">🎓</span>
            <span class="drawer-item-text">${t('training')}</span>
          </button>
          <button class="nav-tab" data-tab="leaderboard" title="${t('leaderboard')}">
            <span class="tab-icon">🏆</span>
            <span class="drawer-item-text">${t('leaderboard')}</span>
          </button>
          <button class="nav-tab" data-tab="dictionary" title="${t('dictionary')}">
            <span class="tab-icon">📖</span>
            <span class="drawer-item-text">${t('dictionary')}</span>
          </button>
          <button class="nav-tab" data-tab="favorites" title="${t('favorites')}">
            <span class="tab-icon">❤️</span>
            <span class="drawer-item-text">${t('favorites')}</span>
          </button>
          <button class="nav-tab" data-tab="stats" title="${t('stats')}">
            <span class="tab-icon">📊</span>
            <span class="drawer-item-text">${t('stats')}</span>
          </button>
          <button class="nav-tab" data-tab="settings" title="${t('settings')}">
            <span class="tab-icon">⚙️</span>
            <span class="drawer-item-text">${t('settings')}</span>
          </button>
        </div>
      </div>

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

  // Bind tab switching & drawer closing
  const tabs = app.querySelectorAll('.nav-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      onTabChange(targetTab);
      closeDrawer();
    });
  });

  const overlay = app.querySelector('#drawer-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeDrawer();
    });
  }

  // Close drawer on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });

  bindHeaderActionButtons(app);
}

function openDrawer() {
  const drawer = document.querySelector('#burger-drawer');
  const overlay = document.querySelector('#drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
  }
}

function closeDrawer() {
  const drawer = document.querySelector('#burger-drawer');
  const overlay = document.querySelector('#drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function bindHeaderActionButtons(container) {
  if (!container) return;

  const xpBtn = container.querySelector('#header-xp-btn');
  if (xpBtn) {
    xpBtn.addEventListener('click', () => {
      closeDrawer();
      const navTabs = document.querySelectorAll('.nav-tab');
      navTabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === 'leaderboard'));
      globalTabChangeCallback('leaderboard');
    });
  }

  const burgerBtn = container.querySelector('#header-burger-btn');
  if (burgerBtn) {
    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer();
    });
  }

  const drawerCloseBtn = document.querySelector('#drawer-close-btn');
  if (drawerCloseBtn) {
    drawerCloseBtn.onclick = (e) => {
      e.stopPropagation();
      closeDrawer();
    };
  }
}

function updateDrawerProfile() {
  const user = getCurrentUser();
  const avatar = getUserAvatar();
  const guestCount = getGuestTrainingCount();

  const drawer = document.querySelector('#burger-drawer');
  if (!drawer) return;

  const avatarWrapper = drawer.querySelector('.drawer-avatar-wrapper');
  if (avatarWrapper) {
    if (avatar) {
      avatarWrapper.innerHTML = `<img src="${avatar}" alt="Avatar" class="drawer-avatar-img" />`;
    } else {
      const initial = user && user.name ? user.name.trim().charAt(0).toUpperCase() : '👤';
      avatarWrapper.innerHTML = `<div class="drawer-avatar-placeholder">${initial}</div>`;
    }
  }

  const usernameEl = drawer.querySelector('.drawer-username');
  if (usernameEl) {
    usernameEl.textContent = user ? user.name : 'Guest (Demo)';
  }

  const emailEl = drawer.querySelector('.drawer-email');
  if (emailEl) {
    emailEl.textContent = user ? user.email : `Progress: ${guestCount}/${GUEST_WORD_LIMIT} words`;
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
    if (user) {
      statusEl.style.display = 'none';
      statusEl.textContent = '';
    } else {
      statusEl.style.display = 'inline';
      statusEl.textContent = `• 🎁 ${guestCount}/${GUEST_WORD_LIMIT}`;
    }
  }

  const actionsContainer = document.querySelector('.header-right-actions');
  if (actionsContainer) {
    actionsContainer.innerHTML = renderHeaderRightActions(user);
    bindHeaderActionButtons(actionsContainer);
  }

  updateDrawerProfile();
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
        xpBtnEl.title = `${rankBadge.title}. Click to open weekly league`;
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
