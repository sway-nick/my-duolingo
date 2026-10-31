import { getCurrentUser, getGuestTrainingCount, GUEST_WORD_LIMIT, getUserAvatar } from '../../services/authService.js?v=386.0';
import { getUserWeeklyXP, getUserWeeklyRank, formatCompactXp, getCachedLeaderboard } from '../../services/api.js?v=386.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=386.0';
import { openShareDialog } from '../modals/ShareModal.js?v=386.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { isEmailVerified } from '../../services/firebase.js?v=386.0';
import { renderMondayWinnersTicker, updateMondayTickerTabVisibility, initMondayWinnersTickerListener } from './MondayWinnersTicker.js?v=386.0';

let globalAuthChangedCallback = () => {};
let globalTabChangeCallback = () => {};

function detectAndApplyAndroidApp() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const isAndroid = !!(
    window.androidBridge ||
    window.Capacitor?.isNativePlatform?.() ||
    window.Capacitor?.getPlatform?.() === 'android' ||
    (window.location && window.location.hostname === 'localhost' && /Android/i.test(navigator.userAgent))
  );
  if (isAndroid) {
    document.documentElement.classList.add('is-android-app');
    if (document.body) document.body.classList.add('is-android-app');
  }
}
detectAndApplyAndroidApp();

function getSavedTheme() {
  const saved = localStorage.getItem('myduo_theme');
  if (saved === 'notebook') {
    localStorage.setItem('myduo_theme', 'light');
    return 'light';
  }
  return saved || 'light';
}

function applyTheme(theme) {
  const effectiveTheme = theme === 'notebook' ? 'light' : theme;
  localStorage.setItem('myduo_theme', effectiveTheme);
  const app = document.querySelector('.mobile-app');
  document.documentElement.classList.remove('dark-theme', 'notebook-theme');
  document.body.classList.remove('dark-theme', 'notebook-theme');
  if (app) app.classList.remove('dark-theme', 'notebook-theme');

  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
    if (app) app.classList.add('dark-theme');
  }
  // Update Android status bar & navigation bar dynamically
  const isWide = typeof window !== 'undefined' && window.innerWidth > 680;
  const targetBg = effectiveTheme === 'dark'
    ? (isWide ? '#090d16' : '#0f172a')
    : (isWide ? '#e2e8f0' : '#f8fafc');
  document.documentElement.style.backgroundColor = targetBg;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', targetBg);
  }
  if (window.AndroidThemeBridge && typeof window.AndroidThemeBridge.setWindowThemeColor === 'function') {
    try {
      window.AndroidThemeBridge.setWindowThemeColor(theme);
    } catch (e) {}
  }
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
    return { isIcon: false, content: 'Lv -', title: t('header_rank_guest') || 'Лига недели (0 XP)' };
  }
  if (rank === 1) return { isIcon: true, content: '💎', title: t('header_rank_diamond') || '1 место в Лиге недели (Алмаз)' };
  if (rank === 2) return { isIcon: true, content: '🥇', title: t('header_rank_gold') || '2 место в Лиге недели (Золото)' };
  if (rank === 3) return { isIcon: true, content: '🥈', title: t('header_rank_silver') || '3 место в Лиге недели (Серебро)' };
  if (rank === 4) return { isIcon: true, content: '🥉', title: t('header_rank_bronze') || '4 место в Лиге недели (Бронза)' };
  const nTitle = (t('header_rank_n') || '{n} место в Лиге недели').replace('{n}', rank);
  return { isIcon: false, content: `Lv ${rank}`, title: nTitle };
}

function shouldShowSyncBadge(user = null) {
  try {
    const u = user || getCurrentUser();
    const isGuest = !u || !u.id || u.id === 'guest' || String(u.id).startsWith('guest_') || !u.email;
    if (isGuest) return true;
    return Boolean(window.__myduo_sync_issue || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('myduo_sync_issue') === '1'));
  } catch (e) {
    return false;
  }
}

function updateSyncBadges(issueActive = false) {
  try {
    if (typeof window !== 'undefined') {
      window.__myduo_sync_issue = Boolean(issueActive);
      if (issueActive) {
        sessionStorage.setItem('myduo_sync_issue', '1');
      } else {
        sessionStorage.removeItem('myduo_sync_issue');
      }
    }
  } catch (e) {}

  const show = shouldShowSyncBadge();

  const burgerBadge = document.querySelector('#header-burger-sync-badge');
  if (burgerBadge) {
    burgerBadge.style.display = show ? 'block' : 'none';
  }

  const settingsBadge = document.querySelector('#settings-login-sync-badge');
  if (settingsBadge) {
    settingsBadge.style.display = show ? 'block' : 'none';
  }

  const drawerSettingsBadge = document.querySelector('#drawer-settings-sync-badge');
  if (drawerSettingsBadge) {
    drawerSettingsBadge.style.display = show ? 'block' : 'none';
  }

  const leadBadge = document.querySelector('#leaderboard-player-sync-badge');
  if (leadBadge) {
    leadBadge.style.display = show ? 'inline-block' : 'none';
  }
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
    <button class="header-xp-badge" id="header-xp-btn" title="${rankBadge.title}. ${t('header_rank_click_hint') || 'Нажмите, чтобы открыть рейтинг'}">
      ${iconHtml}
      <span class="xp-badge-text"><span id="header-xp-val">${formattedXp}</span>&nbsp;XP</span>
    </button>
  `;

  const isBadgeActive = shouldShowSyncBadge(user);

  return `
    <div style="display:flex; align-items:center; gap:10px;">
      ${xpBadgeHtml}
      <button class="header-burger-btn" id="header-burger-btn" title="${t('header_menu_title') || 'Меню'}" aria-label="${t('header_menu_aria') || 'Открыть меню'}" style="position: relative;">
        <svg class="burger-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="color: var(--text-main);">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <span class="sync-status-badge" id="header-burger-sync-badge" style="display: ${isBadgeActive ? 'block' : 'none'};"></span>
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
    avatarHtml = `<img src="${avatar}" alt="Аватар" class="drawer-avatar-img" referrerpolicy="no-referrer" />`;
  } else {
    const initial = user && user.name != null ? String(user.name).trim().charAt(0).toUpperCase() || '👤' : '👤';
    avatarHtml = `<div class="drawer-avatar-placeholder">${initial}</div>`;
  }
  const username = user ? user.name : (t('drawer_guest_user') || 'Гость (Демо)');
  const email = user ? '' : (t('drawer_guest_progress') || 'Прогресс: {current}/{limit} слов')
    .replace('{current}', guestCount)
    .replace('{limit}', GUEST_WORD_LIMIT);

  app.innerHTML = `
    <div class="mobile-app ${currentTheme === 'dark' ? 'dark-theme' : ''}">

      <div class="safe-area-top-fill" aria-hidden="true"></div>
      <header class="mobile-header">
        <div class="brand" id="brand-logo" style="cursor: pointer; flex: 1 1 auto; min-width: 0; max-width: calc(100% - 130px); overflow: hidden; display: flex; align-items: center;" title="${t('header_brand_title') || 'Перейти на главную (режим Тест)'}">
          <!-- SVG Cup-with-Book Logo -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 56" style="display: block; width: 100%; max-width: 180px; height: 38px; min-width: 130px;">
            <!-- Steam lines (More wavy) -->
            <path d="M12,16 C7,12 17,8 12,4" stroke="#FF6A00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M22,16 C17,12 27,8 22,2" stroke="#FF6A00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M32,16 C27,12 37,8 32,4" stroke="#FF6A00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <!-- Cup body -->
            <path d="M4,28 C4,46 12,54 22,54 C32,54 40,46 40,28 Z" fill="#FF6A00"/>
            <!-- Handle (Now fully connects to cup body at y=45) -->
            <path d="M40,32 C48,32 48,45 35,45" stroke="#FF6A00" stroke-width="4.5" fill="none" stroke-linecap="round"/>
            <!-- Stacked open book pages with thick orange borders -->
            <!-- Open Book background/fill (white) -->
            <path d="M5,30 Q13.5,27 22,30 Q30.5,27 39,30 L39,20 Q30.5,17 22,20 Q13.5,17 5,20 Z" fill="#FFF" stroke="#FF6A00" stroke-width="1.8"/>
            <!-- Page lines left -->
            <path d="M22,23 Q13.5,20 8,23" stroke="#FF6A00" stroke-width="1.2" fill="none"/>
            <path d="M22,26 Q13.5,23 8,26" stroke="#FF6A00" stroke-width="1.2" fill="none"/>
            <!-- Page lines right -->
            <path d="M22,23 Q30.5,20 36,23" stroke="#FF6A00" stroke-width="1.2" fill="none"/>
            <path d="M22,26 Q30.5,23 36,26" stroke="#FF6A00" stroke-width="1.2" fill="none"/>
            <!-- Center Spine Line -->
            <line x1="22" y1="20" x2="22" y2="30" stroke="#FF6A00" stroke-width="1.8"/>
            <!-- EN Text -->
            <text x="22" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#FFF" text-anchor="middle">EN</text>
            <!-- Brand Text (English Breakfast) -->
            <text x="56" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="20.5" fill="var(--text-main)">English <tspan fill="#FF6A00">Breakfast</tspan></text>
            <!-- Subtitle (Vocabulary + inline Demo) -->
            <text x="56" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="16" fill="var(--text-muted)">Vocabulary<tspan id="header-user-status" fill="#ea580c" font-weight="700" font-size="14.5">${user ? '' : ` • 🎁 ${guestCount}/${GUEST_WORD_LIMIT}`}</tspan></text>
          </svg>
        </div>
        
        <div class="header-right-actions">
          ${renderHeaderRightActions(user)}
        </div>
      </header>

      <div id="monday-ticker-container" class="monday-ticker-container"></div>

      <main class="app-main-content">
        <div id="app-content"></div>
      </main>

      <!-- Drawer Overlay -->
      <div class="drawer-overlay" id="drawer-overlay"></div>

      <!-- Leaderboard Drawer (slides from left) -->
      <div class="leaderboard-drawer" id="leaderboard-drawer">
        <div class="drawer-header leaderboard-drawer-header">
          <div class="leaderboard-drawer-title" style="display: flex; align-items: center; gap: 8px; font-size: 19px; font-weight: 800; color: var(--text-main);">
            <span style="font-size: 22px;">🏆</span>
            <span id="leaderboard-drawer-heading">${t('leaderboard')}</span>
          </div>
          <button class="drawer-close-btn" id="leaderboard-drawer-close-btn" aria-label="${t('modal_close') || 'Close'}" title="${t('modal_close') || 'Закрыть'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="leaderboard-drawer-content" id="leaderboard-drawer-content"></div>
      </div>

      <!-- Hamburger Drawer -->
      <div class="burger-drawer" id="burger-drawer">
        <div class="drawer-header">
          <div class="drawer-profile" id="drawer-profile-btn" style="cursor: pointer;" title="${t('settings')}">
            <div class="drawer-avatar-wrapper" id="drawer-avatar-btn" style="cursor: pointer;" title="${t('settings')}">
              ${avatarHtml}
            </div>
            <div class="drawer-profile-info">
              <div class="drawer-username">${username}</div>
              <div class="drawer-email">${email}</div>
            </div>
          </div>
          <button class="drawer-close-btn" id="drawer-close-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="drawer-menu">
          <button class="nav-tab active" data-tab="training" title="${t('training')}">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </span>
            <span class="drawer-item-text">${t('training')}</span>
          </button>
          <button class="nav-tab" data-tab="leaderboard" title="${t('leaderboard')}">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"></path>
                <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"></path>
                <path d="M4 3h16v7a8 8 0 0 1-16 0V3z"></path>
                <path d="M12 18v4"></path>
                <path d="M8 22h8"></path>
              </svg>
            </span>
            <span class="drawer-item-text">${t('leaderboard')}</span>
          </button>
          <button class="nav-tab" data-tab="dictionary" title="${t('dictionary')}">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </span>
            <span class="drawer-item-text">${t('dictionary')}</span>
          </button>
          <button class="nav-tab" data-tab="favorites" title="${t('favorites')}">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </span>
            <span class="drawer-item-text">${t('favorites')}</span>
          </button>
          <button class="nav-tab" data-tab="stats" title="${t('stats')}">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
                <line x1="2" y1="20" x2="22" y2="20"></line>
              </svg>
            </span>
            <span class="drawer-item-text">${t('stats')}</span>
          </button>
          <button class="nav-tab" data-tab="settings" title="${t('settings')}" style="position: relative;">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            <span class="drawer-item-text">${t('settings')}</span>
            <span class="sync-status-badge" id="drawer-settings-sync-badge" style="display: ${shouldShowSyncBadge() ? 'block' : 'none'}; top: 12px; right: 14px;"></span>
          </button>
          <button type="button" class="drawer-share-action-btn" id="drawer-share-btn" title="${t('share_title')}">
            <span class="tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </span>
            <span class="drawer-item-text">${t('share_title')}</span>
          </button>
        </div>

        <div class="drawer-footer">
          <button type="button" class="drawer-feedback-btn" id="drawer-feedback-btn">
            <span class="drawer-feedback-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
                <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
              </svg>
            </span>
            <span class="drawer-feedback-title">${t('feedback_title')}</span>
          </button>
          <div class="drawer-app-version">English Breakfast • 2026</div>
        </div>
      </div>

    </div>
  `;

  applyTheme(currentTheme);

  // Bind Brand Logo Click
  app.addEventListener('click', (e) => {
    const brand = e.target.closest('#brand-logo');
    if (brand) {
      e.stopPropagation();
      onLogoClick();
    }
  });

  // Bind Feedback Button
  const feedbackBtn = app.querySelector('#drawer-feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleFeedbackClick();
    });
  }

  // Bind Share Button
  const shareBtn = app.querySelector('#drawer-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
      openShareDialog();
    });
  }

  // Bind tab switching & drawer closing
  const tabs = app.querySelectorAll('.nav-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      closeDrawer();
      closeLeaderboardDrawer();
      updateMondayTickerTabVisibility(targetTab);
      if (typeof onTabChange === 'function') {
        try {
          onTabChange(targetTab);
        } catch (err) {
          console.error('Error changing tab:', err);
        }
      }
    });
  });

  // Expose setActiveTab globally for native widget deep links (e.g. clicking 🏆 rank badge)
  window.setActiveTab = (targetTab) => {
    const targetEl = app.querySelector(`.nav-tab[data-tab="${targetTab}"]`);
    if (targetEl) {
      tabs.forEach((t) => t.classList.remove('active'));
      targetEl.classList.add('active');
      closeDrawer();
      updateMondayTickerTabVisibility(targetTab);
      if (typeof onTabChange === 'function') {
        try {
          onTabChange(targetTab);
        } catch (err) {
          console.error('Error changing tab:', err);
        }
      }
    }
  };

  // Sync cached or newly calculated rank to Android widget on app startup & resume
  function syncCurrentWidgetRank() {
    try {
      let r = null;
      const cachedRank = localStorage.getItem('myduo_cached_rank');
      if (cachedRank) r = parseInt(cachedRank, 10);
      if (!r || isNaN(r)) {
        const lb = getCachedLeaderboard(null, 'week');
        if (lb && Array.isArray(lb.data)) {
          const idx = lb.data.findIndex((p) => p && p.isCurrentUser);
          if (idx >= 0) {
            r = idx + 1;
            localStorage.setItem('myduo_cached_rank', String(r));
          }
        }
      }
      if (r > 0 && window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.syncUserRank === 'function') {
        window.AndroidWidgetBridge.syncUserRank(r);
      }
    } catch (e) {
      console.warn('[Widget] Error syncing current rank:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.syncCurrentWidgetRank = syncCurrentWidgetRank;
  }
  syncCurrentWidgetRank();

  // Click on top avatar / profile in drawer -> navigate to Settings tab
  const drawerProfileBtn = app.querySelector('#drawer-profile-btn') || app.querySelector('.drawer-profile');
  if (drawerProfileBtn) {
    drawerProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach((t) => t.classList.remove('active'));
      const settingsTab = app.querySelector('.nav-tab[data-tab="settings"]');
      if (settingsTab) settingsTab.classList.add('active');
      closeDrawer();
      if (typeof onTabChange === 'function') {
        try {
          onTabChange('settings');
        } catch (err) {
          console.error('Error switching to settings tab from drawer avatar:', err);
        }
      }
    });
  }

    const lbCloseBtn = app.querySelector('#leaderboard-drawer-close-btn');
  if (lbCloseBtn) {
    lbCloseBtn.onclick = (e) => {
      e.stopPropagation();
      closeLeaderboardDrawer();
    };
  }

  const overlay = app.querySelector('#drawer-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeDrawer();
      closeLeaderboardDrawer();
    });
  }

  // Close drawers on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeLeaderboardDrawer();
    }
  });

  bindHeaderActionButtons(app);
  initMondayWinnersTickerListener();
  renderMondayWinnersTicker();
}

function showFeedbackToast(msg) {
  let toast = document.querySelector('#feedback-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'feedback-toast';
    toast.className = 'feedback-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

const FEEDBACK_EMAIL_TEMPLATES = {
  ru: {
    subject: 'English Breakfast — Отзыв / Пожелания',
    body: (u, l, d) => `Здравствуйте!\n\nМой отзыв / пожелание:\n\n\n---\nПользователь: ${u}\nЯзык интерфейса: ${l}\nУстройство: ${d}`,
  },
  uk: {
    subject: 'English Breakfast — Відгук / Пропозиції',
    body: (u, l, d) => `Вітаємо!\n\nМій відгук / пропозиція:\n\n\n---\nКористувач: ${u}\nМова: ${l}\nПристрій: ${d}`,
  },
  en: {
    subject: 'English Breakfast — Feedback / Suggestions',
    body: (u, l, d) => `Hello!\n\nMy feedback / suggestion:\n\n\n---\nUser: ${u}\nLanguage: ${l}\nDevice: ${d}`,
  },
  de: {
    subject: 'English Breakfast — Feedback / Vorschläge',
    body: (u, l, d) => `Hallo!\n\nMein Feedback / Vorschlag:\n\n\n---\nBenutzer: ${u}\nSprache: ${l}\nGerät: ${d}`,
  },
  es: {
    subject: 'English Breakfast — Comentarios / Sugerencias',
    body: (u, l, d) => `¡Hola!\n\nMi comentario / sugerencia:\n\n\n---\nUsuario: ${u}\nIdioma: ${l}\nDispositivo: ${d}`,
  },
  fr: {
    subject: 'English Breakfast — Commentaires / Suggestions',
    body: (u, l, d) => `Bonjour !\n\nMon retour / suggestion :\n\n\n---\nUtilisateur : ${u}\nLangue : ${l}\nAppareil : ${d}`,
  },
  pl: {
    subject: 'English Breakfast — Opinia / Sugestie',
    body: (u, l, d) => `Cześć!\n\nMoja opinia / sugestia:\n\n\n---\nUżytkownik: ${u}\nJęzyk: ${l}\nUrządzenie: ${d}`,
  },
  it: {
    subject: 'English Breakfast — Feedback / Suggerimenti',
    body: (u, l, d) => `Ciao!\n\nIl mio feedback / suggerimento:\n\n\n---\nUtente: ${u}\nLingua: ${l}\nDispositivo: ${d}`,
  },
  tr: {
    subject: 'English Breakfast — Geri Bildirim / Öneriler',
    body: (u, l, d) => `Merhaba!\n\nGeri bildirimim / önerim:\n\n\n---\nKullanıcı: ${u}\nDil: ${l}\nCihaz: ${d}`,
  },
  pt: {
    subject: 'English Breakfast — Comentários / Sugestões',
    body: (u, l, d) => `Olá!\n\nMeu comentário / sugestão:\n\n\n---\nUsuário: ${u}\nIdioma: ${l}\nDispositivo: ${d}`,
  },
  ro: {
    subject: 'English Breakfast — Feedback / Sugestii',
    body: (u, l, d) => `Salut!\n\nFeedback-ul / sugestia mea:\n\n\n---\nUtilizator: ${u}\nLimbă: ${l}\nDispozitiv: ${d}`,
  },
  bg: {
    subject: 'English Breakfast — Отзив / Предложения',
    body: (u, l, d) => `Здравейте!\n\nМоят отзив / предложение:\n\n\n---\nПотребител: ${u}\nЕзик: ${l}\nУстройство: ${d}`,
  },
  cs: {
    subject: 'English Breakfast — Zpětná vazba / Návrhy',
    body: (u, l, d) => `Dobrý den!\n\nMoje zpětná vazba / návrh:\n\n\n---\nUživatel: ${u}\nJazyk: ${l}\nZařízení: ${d}`,
  },
  sk: {
    subject: 'English Breakfast — Spätná väzba / Návrhy',
    body: (u, l, d) => `Dobrý deň!\n\nMoja spätná väzba / návrh:\n\n\n---\nPoužívateľ: ${u}\nJazyk: ${l}\nZariadenie: ${d}`,
  },
  hu: {
    subject: 'English Breakfast — Visszajelzés / Javaslatok',
    body: (u, l, d) => `Szia!\n\nVisszajelzésem / javaslatom:\n\n\n---\nFelhasználó: ${u}\nNyelv: ${l}\nEszköz: ${d}`,
  },
  el: {
    subject: 'English Breakfast — Σχόλια / Προτάσεις',
    body: (u, l, d) => `Γεια σας!\n\nΤα σχόλια / η πρότασή μου:\n\n\n---\nΧρήστης: ${u}\nΓλώσσα: ${l}\nΣυσκευή: ${d}`,
  },
  sl: {
    subject: 'English Breakfast — Povratne informacije / Predlogi',
    body: (u, l, d) => `Pozdravljeni!\n\nMoje mnenje / predlog:\n\n\n---\nUporabnik: ${u}\nJezik: ${l}\nNaprava: ${d}`,
  },
  et: {
    subject: 'English Breakfast — Tagasiside / Ettepanekud',
    body: (u, l, d) => `Tere!\n\nMinu tagasiside / ettepanek:\n\n\n---\nKasutaja: ${u}\nKeel: ${l}\nSeade: ${d}`,
  },
  lt: {
    subject: 'English Breakfast — Atsiliepimas / Pasiūlymai',
    body: (u, l, d) => `Sveiki!\n\nMano atsiliepimas / pasiūlymas:\n\n\n---\nVartotojas: ${u}\nKalba: ${l}\nĮrenginys: ${d}`,
  },
  lv: {
    subject: 'English Breakfast — Atsauksmes / Ieteikumi',
    body: (u, l, d) => `Sveiki!\n\nMana atsauksme / ieteikums:\n\n\n---\nLietotājs: ${u}\nValoda: ${l}\nIerīce: ${d}`,
  },
  da: {
    subject: 'English Breakfast — Feedback / Forslag',
    body: (u, l, d) => `Hej!\n\nMin feedback / mit forslag:\n\n\n---\nBruger: ${u}\nSprog: ${l}\nEnhed: ${d}`,
  },
  fi: {
    subject: 'English Breakfast — Palaute / Ehdotukset',
    body: (u, l, d) => `Hei!\n\nPalautteeni / ehdotukseni:\n\n\n---\nKäyttäjä: ${u}\nKieli: ${l}\nLaite: ${d}`,
  },
  sv: {
    subject: 'English Breakfast — Feedback / Förslag',
    body: (u, l, d) => `Hej!\n\nMin feedback / mitt förslag:\n\n\n---\nAnvändare: ${u}\nSpråk: ${l}\nEnhet: ${d}`,
  },
  hr: {
    subject: 'English Breakfast — Povratne informacije / Prijedlozi',
    body: (u, l, d) => `Pozdrav!\n\nMoja povratna informacija / prijedlog:\n\n\n---\nKorisnik: ${u}\nJezik: ${l}\nUređaj: ${d}`,
  },
  hi: {
    subject: 'English Breakfast — प्रतिक्रिया / सुझाव',
    body: (u, l, d) => `नमस्ते!\n\nमेरी प्रतिक्रिया / सुझाव:\n\n\n---\nउपयोगकर्ता: ${u}\nभाषा: ${l}\nडिवाइस: ${d}`,
  },
  ar: {
    subject: 'English Breakfast — ملاحظات / اقتراحات',
    body: (u, l, d) => `مرحباً!\n\nملاحظتي / اقتراحي:\n\n\n---\nالمستخدم: ${u}\nاللغة: ${l}\nالجهاز: ${d}`,
  },
  id: {
    subject: 'English Breakfast — Masukan / Saran',
    body: (u, l, d) => `Halo!\n\nMasukan / saran saya:\n\n\n---\nPengguna: ${u}\nBahasa: ${l}\nPerangkat: ${d}`,
  },
  vi: {
    subject: 'English Breakfast — Phản hồi / Đề xuất',
    body: (u, l, d) => `Xin chào!\n\nPhản hồi / đề xuất của tôi:\n\n\n---\nNgười dùng: ${u}\nNgôn ngữ: ${l}\nThiết bị: ${d}`,
  },
  th: {
    subject: 'English Breakfast — ข้อเสนอแนะ / ความคิดเห็น',
    body: (u, l, d) => `สวัสดี!\n\nความคิดเห็น / ข้อเสนอแนะของฉัน:\n\n\n---\nผู้ใช้: ${u}\nภาษา: ${l}\nอุปกรณ์: ${d}`,
  },
  ko: {
    subject: 'English Breakfast — 피드백 / 제안',
    body: (u, l, d) => `안녕하세요!\n\n제 피드백 / 제안:\n\n\n---\n사용자: ${u}\n언어: ${l}\n기기: ${d}`,
  },
  ja: {
    subject: 'English Breakfast — フィードバック / ご提案',
    body: (u, l, d) => `こんにちは！\n\nフィードバック / ご提案：\n\n\n---\nユーザー: ${u}\n言語: ${l}\nデバイス: ${d}`,
  },
  zh: {
    subject: 'English Breakfast — 反馈与建议',
    body: (u, l, d) => `您好！\n\n我的反馈 / 建议：\n\n\n---\n用户: ${u}\n语言: ${l}\n设备: ${d}`,
  },
  ur: {
    subject: 'English Breakfast — رائے اور تجاویز',
    body: (u, l, d) => `ہیلو!\n\nمیری رائے / تجویز:\n\n\n---\nصارف: ${u}\nزبان: ${l}\nڈیوائس: ${d}`,
  },
  bn: {
    subject: 'English Breakfast — মতামত / পরামর্শ',
    body: (u, l, d) => `নমস্কার / হ্যালো!\n\nআমার মতামত / পরামর্শ:\n\n\n---\nব্যবহারকারী: ${u}\nভাষা: ${l}\nডিভাইস: ${d}`,
  },
  fa: {
    subject: 'English Breakfast — بازخورد / پیشنهادات',
    body: (u, l, d) => `سلام!\n\nبازخورد یا پیشنهاد من:\n\n\n---\nکاربر: ${u}\nزبان: ${l}\nدستگاه: ${d}`,
  },
  kk: {
    subject: 'English Breakfast — Кері байланыс / Ұсыныстар',
    body: (u, l, d) => `Сәлеметсіз бе!\n\nМенің пікірім / ұсынысым:\n\n\n---\nПайдаланушы: ${u}\nТіл: ${l}\nҚұрылғы: ${d}`,
  },
};

function handleFeedbackClick() {
  const email = 'lipniagovnikola@gmail.com';
  const currentUser = getCurrentUser();
  const userName = currentUser ? (currentUser.name || currentUser.email) : 'User';
  const rawLang = (typeof getInterfaceLanguage === 'function' && getInterfaceLanguage())
    || localStorage.getItem('myduo_interface_lang')
    || (typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('lang'))
    || 'en';
  const lang = String(rawLang).toLowerCase().trim().split(/[-_]/)[0];

  const tpl = FEEDBACK_EMAIL_TEMPLATES[lang] || FEEDBACK_EMAIL_TEMPLATES.en;
  const subjectText = tpl.subject;
  const bodyText = tpl.body(userName, lang, navigator.userAgent);

  const subject = encodeURIComponent(subjectText);
  const body = encodeURIComponent(bodyText);
  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  // Copy email to clipboard so user never gets stuck
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).catch(() => {});
  }

  showFeedbackToast(t('feedback_copied_toast'));

  // Trigger mail client (use native Android Intent with explicit EXTRA_SUBJECT and EXTRA_TEXT when available)
  setTimeout(() => {
    if (
      typeof window !== 'undefined' &&
      window.AndroidWidgetBridge &&
      typeof window.AndroidWidgetBridge.openFeedbackEmail === 'function'
    ) {
      window.AndroidWidgetBridge.openFeedbackEmail(email, subjectText, bodyText);
    } else {
      window.location.href = mailtoUrl;
    }
  }, 100);

  closeDrawer();
}

export function updateDrawerTranslations() {
  const drawer = document.querySelector('#burger-drawer');
  if (!drawer) return;

  const tabsDef = [
    { tab: 'training', key: 'training' },
    { tab: 'leaderboard', key: 'leaderboard' },
    { tab: 'dictionary', key: 'dictionary' },
    { tab: 'favorites', key: 'favorites' },
    { tab: 'stats', key: 'stats' },
    { tab: 'settings', key: 'settings' }
  ];
  tabsDef.forEach(({ tab, key }) => {
    const tabEl = drawer.querySelector(`.nav-tab[data-tab="${tab}"]`);
    if (tabEl) {
      const textEl = tabEl.querySelector('.drawer-item-text');
      if (textEl) textEl.textContent = t(key);
      tabEl.title = t(key);
    }
  });

  const feedbackBtn = drawer.querySelector('#drawer-feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.innerHTML = `
      <span class="drawer-feedback-icon">💡</span>
      <span class="drawer-feedback-title">${t('feedback_title')}</span>
    `;
  }

  const shareBtn = drawer.querySelector('#drawer-share-btn');
  if (shareBtn) {
    const textEl = shareBtn.querySelector('.drawer-item-text');
    if (textEl) textEl.textContent = t('share_title');
    shareBtn.title = t('share_title');
  }

  const lbHeading = document.querySelector('#leaderboard-drawer-heading');
  if (lbHeading) {
    lbHeading.textContent = t('leaderboard');
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('myduo:lang_changed', () => {
    updateDrawerTranslations();
  });
}

function openDrawer() {
  const drawer = document.querySelector('#burger-drawer');
  const overlay = document.querySelector('#drawer-overlay');
  const lbDrawer = document.querySelector('#leaderboard-drawer');
  if (lbDrawer) lbDrawer.classList.remove('open');

  if (drawer && overlay) {
    updateDrawerTranslations();
    drawer.classList.add('open');
    overlay.classList.add('open');
  }
}

function closeDrawer() {
  const drawer = document.querySelector('#burger-drawer');
  const overlay = document.querySelector('#drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  const lbDrawer = document.querySelector('#leaderboard-drawer');
  if (overlay && (!lbDrawer || !lbDrawer.classList.contains('open'))) {
    overlay.classList.remove('open');
  }
}

function openLeaderboardDrawer() {
  const lbDrawer = document.querySelector('#leaderboard-drawer');
  const overlay = document.querySelector('#drawer-overlay');
  const burgerDrawer = document.querySelector('#burger-drawer');
  if (burgerDrawer) burgerDrawer.classList.remove('open');

  if (lbDrawer && overlay) {
    updateDrawerTranslations();
    lbDrawer.classList.add('open');
    overlay.classList.add('open');
    if (typeof window._renderLeaderboardDrawerContent === 'function') {
      try {
        window._renderLeaderboardDrawerContent();
      } catch (err) {
        console.error('Error rendering leaderboard drawer content:', err);
      }
    }
  }
}

function closeLeaderboardDrawer() {
  const lbDrawer = document.querySelector('#leaderboard-drawer');
  const overlay = document.querySelector('#drawer-overlay');
  if (lbDrawer) lbDrawer.classList.remove('open');
  const burgerDrawer = document.querySelector('#burger-drawer');
  if (overlay && (!burgerDrawer || !burgerDrawer.classList.contains('open'))) {
    overlay.classList.remove('open');
  }
}

if (typeof window !== 'undefined') {
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;
  window.openLeaderboardDrawer = openLeaderboardDrawer;
  window.closeLeaderboardDrawer = closeLeaderboardDrawer;
}

function bindHeaderActionButtons(container) {
  if (!container) return;

  const xpBtn = container.querySelector('#header-xp-btn');
  if (xpBtn) {
    xpBtn.addEventListener('click', () => {
      closeDrawer();
      const navTabs = document.querySelectorAll('.nav-tab');
      navTabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === 'leaderboard'));
      if (typeof globalTabChangeCallback === 'function') {
        try {
          globalTabChangeCallback('leaderboard');
        } catch (err) {
          console.error('Error opening leaderboard from header XP:', err);
        }
      }
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
      avatarWrapper.innerHTML = `<img src="${avatar}" alt="Avatar" class="drawer-avatar-img" referrerpolicy="no-referrer" />`;
    } else {
      const initial = user && user.name != null ? String(user.name).trim().charAt(0).toUpperCase() || '👤' : '👤';
      avatarWrapper.innerHTML = `<div class="drawer-avatar-placeholder">${initial}</div>`;
    }
  }

  const usernameEl = drawer.querySelector('.drawer-username');
  if (usernameEl) {
    usernameEl.textContent = user ? (user.name || (user.email ? user.email.split('@')[0] : 'User')) : 'Guest (Demo)';
  }

  const emailEl = drawer.querySelector('.drawer-email');
  if (emailEl) {
    emailEl.textContent = user ? (user.email || '') : `Progress: ${guestCount}/${GUEST_WORD_LIMIT} words`;
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

  // Handle sync issues (token expiration, network, Firestore rule issues)
  window.addEventListener('myduo:sync-issue', (e) => {
    updateSyncBadges(true);
    const detail = e.detail || {};
    if (detail.kind === 'email_not_verified') {
      showToast(t('lead_verify_email_prompt'));
    } else if (detail.status === 403 || detail.kind === 'permission_denied') {
      showToast(t('lead_sync_error_403'));
    }
  });

  window.addEventListener('myduo:auth_changed', () => {
    updateSyncBadges(false);
  });

  // Prompt unverified email user upon startup/initialization
  try {
    const curUser = getCurrentUser();
    if (curUser && curUser.email && !isEmailVerified()) {
      setTimeout(() => {
        showToast(t('lead_verify_email_prompt'));
      }, 1200);
    }
  } catch (e) {}
}

/**
 * Show a floating toast notification across the app
 */
export function showToast(message, duration = 4000) {
  if (typeof document === 'undefined') return;
  let toast = document.querySelector('#app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'share-toast';
    toast.style.zIndex = '99999';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

export {
  renderAppLayout,
  updateHeaderUser,
  applyTheme,
  getSavedTheme,
  toggleTheme,
  renderMondayWinnersTicker,
  updateMondayTickerTabVisibility,
  openDrawer,
  closeDrawer,
  openLeaderboardDrawer,
  closeLeaderboardDrawer
};
