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
        <div class="brand" id="brand-logo" style="cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 2px;" title="Перейти на главную (режим Тест)">
          <div style="display: flex; align-items: center;">
            <!-- SVG Cup-with-Book Logo -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 56" width="180" height="40" style="display: block;">
              <!-- Steam lines -->
              <path d="M20,16 C18.5,12.5 21.5,9.5 20,5" stroke="#FF6A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <path d="M30,16 C28.5,11.5 31.5,8.5 30,3" stroke="#FF6A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <path d="M40,16 C38.5,12.5 41.5,9.5 40,5" stroke="#FF6A00" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <!-- Cup body -->
              <path d="M12,28 C12,46 20,54 30,54 C40,54 48,46 48,28 Z" fill="#FF6A00"/>
              <!-- Handle -->
              <path d="M48,34 C55,34 56,43 48,46" stroke="#FF6A00" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <!-- Stacked open book pages with thick orange borders -->
              <!-- Layer 1 (back pages) -->
              <path d="M30,22 Q21,19 13,22 L13,30 Q21,27 30,30 Z" fill="#FFF" stroke="#FF6A00" stroke-width="1.8"/>
              <path d="M30,22 Q39,19 47,22 L47,30 Q39,27 30,30 Z" fill="#FFF" stroke="#FF6A00" stroke-width="1.8"/>
              <!-- Layer 2 (front pages) -->
              <path d="M30,22 Q24,20 18,23 L18,30 Q24,27 30,30 Z" fill="#FFF" stroke="#FF6A00" stroke-width="1.8"/>
              <path d="M30,22 Q36,20 42,23 L42,30 Q36,27 30,30 Z" fill="#FFF" stroke="#FF6A00" stroke-width="1.8"/>
              <!-- Spine center line -->
              <line x1="30" y1="22" x2="30" y2="30" stroke="#FF6A00" stroke-width="1.8"/>
              <!-- EN Text -->
              <text x="30" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#FFF" text-anchor="middle">EN</text>
              <!-- Brand Text (English Breakfast) -->
              <text x="62" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="18.5" fill="var(--text-main)">English <tspan fill="#FF6A00">Breakfast</tspan></text>
              <!-- Subtitle (Vocabulary) -->
              <text x="62" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="11" fill="var(--text-muted)">Vocabulary</text>
            </svg>
          </div>
          <small class="user-status-text" id="header-user-status" style="margin-left: 45px; margin-top: -4px;">
            ${user ? '' : `🎁 Demo: ${guestCount}/${GUEST_WORD_LIMIT} words`}
          </small>
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
      console.log('Brand logo DOM element clicked!');
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
      console.log('XP badge button clicked! Navigating to leaderboard...');
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
    statusEl.textContent = user ? '' : `🎁 Demo: ${guestCount}/${GUEST_WORD_LIMIT} words`;
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
