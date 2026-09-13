import { getLeaderboard, getCachedLeaderboard, getIsoWeekKey, formatCompactXp } from '../../services/api.js?v=200.0';
import { getCurrentUser, getUserAvatar } from '../../services/authService.js?v=200.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=200.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=200.0';

let currentPeriod = localStorage.getItem('myduo_leaderboard_period') || 'week'; // 'week' or 'all'

function showTop100Modal(rank) {
  const existing = document.querySelector('#top100-congrats-modal');
  if (existing) existing.remove();

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'top100-congrats-modal';
  modalOverlay.className = 'modal-backdrop';
  modalOverlay.style.zIndex = '9999';

  modalOverlay.innerHTML = `
    <div class="modal-content" style="text-align: center; max-width: 320px; padding: 28px 20px; position: relative;">
      <div style="font-size: 52px; margin-bottom: 12px;">🏆</div>
      <h2 style="margin: 0 0 10px; font-size: 22px;">${t('lead_top100_title')}</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 15px; line-height: 1.4;">
        ${t('lead_top100_desc', { rank })}
      </p>
      <button class="primary-button btn-green" id="top100-close-btn" style="min-height: 44px; width: 100%;">
        ${t('lead_top100_btn')}
      </button>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const cleanup = () => {
    modalOverlay.classList.add('fade-out');
    setTimeout(() => modalOverlay.remove(), 250);
  };

  modalOverlay.querySelector('#top100-close-btn').addEventListener('click', cleanup);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cleanup();
  });
}

function getTimeUntilSundayEnd() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  const daysUntilSunday = (7 - day) % 7;
  const targetEndMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilSunday,
    23, 59, 59, 999
  );
  const diffMs = Math.max(0, targetEndMs - now.getTime());

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, mins };
}

function formatLeaderboardXp(xp, period = 'week') {
  if (period === 'all') {
    return formatCompactXp(xp);
  }
  return String(Math.round(Number(xp || 0)));
}

function renderPodiumCard(player, rank, period = 'week') {
  let badgeIcon = '💎';
  let rankClass = 'rank-diamond';

  if (rank === 2) {
    badgeIcon = '🥇';
    rankClass = 'rank-gold';
  } else if (rank === 3) {
    badgeIcon = '🥈';
    rankClass = 'rank-silver';
  } else if (rank === 4) {
    badgeIcon = '🥉';
    rankClass = 'rank-bronze';
  }

  const avatarSrc = player.avatar || '';
  const initial = player.name ? player.name.trim().charAt(0).toUpperCase() : '👤';
  const isMe = player.isCurrentUser;

  return `
    <div class="podium-card ${rankClass} ${isMe ? 'is-me' : ''}">
      <div class="podium-badge">${badgeIcon}</div>
      <div class="podium-avatar-wrapper ${rank === 1 ? 'has-wreath' : ''}">
        ${
          rank === 1
            ? `
          <svg class="diamond-laurel-wreath" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="laurelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="25%" stop-color="#fef08a" />
                <stop offset="55%" stop-color="#f59e0b" />
                <stop offset="85%" stop-color="#d97706" />
                <stop offset="100%" stop-color="#78350f" />
              </linearGradient>
              <filter id="wreathGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0.8" stdDeviation="1.2" flood-color="#451a03" flood-opacity="0.55"/>
              </filter>

              <!-- Slender Laurel Leaf Pair Definition at R=41.5 -->
              <g id="laurel-pair">
                <!-- Outer elegant leaf -->
                <path d="M 50 91.5 C 55 93.5 60 91.5 62 86.5 C 60 83 54 84.5 50 89" fill="url(#laurelGoldGrad)" stroke="#92400e" stroke-width="0.5"/>
                <!-- Inner slender leaf -->
                <path d="M 50 91.5 C 53.5 89.5 56 85 54 80.5 C 51.5 81 49 84.5 50 90" fill="url(#laurelGoldGrad)" stroke="#92400e" stroke-width="0.5"/>
                <!-- Small acorn node -->
                <circle cx="50" cy="91.5" r="0.8" fill="#fef08a"/>
              </g>
              <!-- Single top tip leaf -->
              <g id="laurel-tip">
                <path d="M 50 91.5 C 53 93 57 88 56 83 C 53 84 51 88 50 91.5" fill="url(#laurelGoldGrad)" stroke="#92400e" stroke-width="0.5"/>
              </g>
            </defs>
            <g filter="url(#wreathGlow)">
              <!-- Exact circular branch stems (Radius R=41.5 around 50,50) -->
              <path d="M 50 91.5 A 41.5 41.5 0 0 1 39.5 10" stroke="url(#laurelGoldGrad)" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M 50 91.5 A 41.5 41.5 0 0 0 60.5 10" stroke="url(#laurelGoldGrad)" stroke-width="1.6" stroke-linecap="round"/>
              
              <!-- Right branch leaf pairs (Rotated precisely around 50,50) -->
              <use href="#laurel-pair" transform="rotate(-20 50 50)"/>
              <use href="#laurel-pair" transform="rotate(-44 50 50)"/>
              <use href="#laurel-pair" transform="rotate(-68 50 50)"/>
              <use href="#laurel-pair" transform="rotate(-92 50 50)"/>
              <use href="#laurel-pair" transform="rotate(-116 50 50)"/>
              <use href="#laurel-pair" transform="rotate(-140 50 50)"/>
              <use href="#laurel-tip" transform="rotate(-162 50 50)"/>

              <!-- Left branch leaf pairs (Symmetrically mirrored across vertical axis) -->
              <g transform="translate(100, 0) scale(-1, 1)">
                <use href="#laurel-pair" transform="rotate(-20 50 50)"/>
                <use href="#laurel-pair" transform="rotate(-44 50 50)"/>
                <use href="#laurel-pair" transform="rotate(-68 50 50)"/>
                <use href="#laurel-pair" transform="rotate(-92 50 50)"/>
                <use href="#laurel-pair" transform="rotate(-116 50 50)"/>
                <use href="#laurel-pair" transform="rotate(-140 50 50)"/>
                <use href="#laurel-tip" transform="rotate(-162 50 50)"/>
              </g>

              <!-- Bottom delicate ribbon knot & tails -->
              <path d="M 46.5 91.5 C 48 89.5 52 89.5 53.5 91.5 C 52 93.5 48 93.5 46.5 91.5 Z" fill="url(#laurelGoldGrad)" stroke="#92400e" stroke-width="0.5"/>
              <path d="M 48 92.5 L 45 96.5 L 47.5 95.5 L 49.5 92.5" fill="url(#laurelGoldGrad)"/>
              <path d="M 52 92.5 L 55 96.5 L 52.5 95.5 L 50.5 92.5" fill="url(#laurelGoldGrad)"/>
              <circle cx="50" cy="91.5" r="1.6" fill="#fffbeb" stroke="#b45309" stroke-width="0.4"/>
            </g>
          </svg>
        `
            : ''
        }
        ${
          avatarSrc
            ? `<img src="${avatarSrc}" alt="${player.name}" class="podium-avatar-img" />`
            : `<div class="podium-avatar-placeholder">${initial}</div>`
        }
      </div>
      <div class="podium-info">
        <h4 class="podium-name">${player.name || t('lead_student_default')}</h4>
        <span class="podium-xp">${formatLeaderboardXp(player.xp, period)} XP</span>
      </div>
    </div>
  `;
}

function buildLeaderboardBodyHtml(players, currentUser, period = 'week') {
  if (!players || players.length === 0) {
    return {
      podiumHtml: '',
      restHtml: `
        <div class="empty-state-card" style="text-align: center; padding: 40px 20px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 240px;">
          <div style="font-size: 48px; margin-bottom: 12px; line-height: 1;">🏆</div>
          <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 8px; color: var(--text-main);">${t('lead_updating_title')}</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 20px; max-width: 280px; line-height: 1.45;">
            ${t('lead_updating_desc')}
          </p>
          <button class="primary-button btn-green" id="retry-leaderboard-btn" style="max-width: 240px; min-height: 44px; height: 44px; font-size: 15px; font-weight: 700;">
            🔄 ${t('lead_refresh_btn')}
          </button>
        </div>
      `
    };
  }

  const top100 = players.slice(0, 100);
  const top4 = top100.slice(0, 4);
  const rest = top100.slice(4);

  const myRankIndex = players.findIndex((p) => p.isCurrentUser);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myPlayer = myRankIndex >= 0 ? players[myRankIndex] : null;

  const podiumHtml = `
    <div class="podium-grid">
      ${top4.map((p, idx) => renderPodiumCard(p, idx + 1, period)).join('')}
    </div>
  `;

  let restListHtml = '';
  if (rest.length > 0) {
    restListHtml = `
      <div class="leaderboard-table">
        ${rest
          .map((p, idx) => {
            const rank = idx + 5;
            const isMe = p.isCurrentUser;
            const avatarSrc = p.avatar || '';
            const initial = p.name ? p.name.trim().charAt(0).toUpperCase() : '👤';

            return `
            <div class="leaderboard-row ${isMe ? 'is-me' : ''}">
              <div class="row-rank">#${rank}</div>
              <div class="row-avatar-wrapper">
                ${
                  avatarSrc
                    ? `<img src="${avatarSrc}" alt="${p.name}" class="row-avatar-img" />`
                    : `<div class="row-avatar-placeholder">${initial}</div>`
                }
              </div>
              <div class="row-name">
                ${p.name || t('lead_student_default')}
              </div>
              <div class="row-xp">${formatLeaderboardXp(p.xp, period)} XP</div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  let myStickyBarHtml = '';
  if (myPlayer && (myRank > 4 || !currentUser)) {
    const myAvatar = getUserAvatar();
    const statusText = period === 'all'
      ? t('lead_score_all_time')
      : (currentUser
          ? t('lead_score_current')
          : t('lead_login_to_save')
        );
    myStickyBarHtml = `
      <div class="my-leaderboard-bar">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="my-rank-badge">#${myRank || '-'}</span>
          ${
            myAvatar
              ? `<img src="${myAvatar}" class="my-bar-avatar" alt="Вы" />`
              : `<div class="my-bar-avatar-placeholder">${currentUser && currentUser.name ? currentUser.name.charAt(0) : '👤'}</div>`
          }
          <div>
            <div class="my-bar-name" style="font-weight: 700; font-size: 14px;">${currentUser ? currentUser.name : t('lead_guest_name')}</div>
            <div class="my-bar-status" style="font-size: 12px; color: var(--text-muted);">
              ${statusText}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="my-bar-xp">${formatLeaderboardXp(myPlayer.xp, period)} XP</span>
          ${
            !currentUser
              ? `<button class="primary-button" id="leaderboard-login-btn" style="padding: 6px 14px; min-height: 34px; height: 34px; font-size: 13px;">${t('settings_login')}</button>`
              : ''
          }
        </div>
      </div>
    `;
  }

  return {
    podiumHtml,
    restHtml: `${restListHtml}${myStickyBarHtml}`
  };
}

async function renderLeaderboardView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const currentUser = getCurrentUser();
  const weekTime = getTimeUntilSundayEnd();

  // 1. Instant 0ms cached data load
  const cachedRes = getCachedLeaderboard(null, currentPeriod);
  const initialPlayers = cachedRes.data || [];

  // Congratulate user if they are in TOP 100
  const myRankIndex = initialPlayers.findIndex((p) => p.isCurrentUser);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  if (myRank !== null && myRank <= 100) {
    const weekKey = getIsoWeekKey();
    const congratKey = `congrats_top100_${weekKey}_${currentUser ? currentUser.id : 'guest'}`;
    if (!localStorage.getItem(congratKey)) {
      localStorage.setItem(congratKey, 'true');
      setTimeout(() => showTop100Modal(myRank), 500);
    }
  }

  const bodyData = buildLeaderboardBodyHtml(initialPlayers, currentUser, currentPeriod);

  const dText = t('lead_days_short');
  const hText = t('lead_hours_short');
  const mText = t('lead_minutes_short');

  container.innerHTML = `
    <div class="leaderboard-page" style="position: relative;">
      <!-- Single Sticky Header Group (Header + Podium) Flush to Mobile Header -->
      <div class="leaderboard-sticky-group">
        <div class="leaderboard-top-row ${currentPeriod === 'all' ? 'no-timer' : ''}">
          <div class="custom-dropdown" id="leaderboard-type-dropdown">
            <button type="button" class="leaderboard-header-chip leaderboard-dropdown-chip" id="leaderboard-type-trigger" aria-haspopup="listbox" aria-expanded="false">
              <span id="leaderboard-type-label" style="white-space: nowrap; text-align: left; overflow: hidden; text-overflow: ellipsis;">${currentPeriod === 'all' ? '🌎 ' + t('lead_all_time') : t('lead_title')}</span>
              <span class="dropdown-arrow" style="font-size: 9px; flex-shrink: 0; margin-left: 6px; transition: transform 0.2s ease;">▼</span>
            </button>
            <div class="custom-dropdown-menu" id="leaderboard-type-menu" role="listbox" style="z-index: 130; width: 100%; min-width: 190px;">
              <div class="dropdown-item ${currentPeriod === 'week' ? 'selected' : ''}" data-value="week" style="white-space: nowrap; padding: 10px 12px;">${t('lead_title')}</div>
              <div class="dropdown-item ${currentPeriod === 'all' ? 'selected' : ''}" data-value="all" style="white-space: nowrap; padding: 10px 12px;">🌎 ${t('lead_all_time')}</div>
            </div>
          </div>
          ${currentPeriod === 'all' ? '' : `
          <div class="leaderboard-header-chip leaderboard-timer-chip" id="leaderboard-timer-badge">
            <span style="font-size: 13.5px; line-height: 1;">⏳</span>
            <span>${weekTime.days > 0 ? `${weekTime.days}${dText} ` : ''}${weekTime.hours}${hText}</span>
          </div>
          `}
        </div>

        <div id="leaderboard-podium-container">
          ${bodyData.podiumHtml}
        </div>
      </div>

      <!-- Scrollable Content -->
      <div id="leaderboard-content" style="min-height: 280px;">
        ${bodyData.restHtml}
      </div>
    </div>
  `;

  const contentEl = container.querySelector('#leaderboard-content');

  // Clean up previous event listeners to prevent duplicate execution
  if (container._xpHandler) window.removeEventListener('myduo:xp_changed', container._xpHandler);
  if (container._leaderboardHandler) window.removeEventListener('myduo:leaderboard_updated', container._leaderboardHandler);
  if (container._visibilityHandler) document.removeEventListener('visibilitychange', container._visibilityHandler);
  if (container._globalClickHandler) document.removeEventListener('click', container._globalClickHandler);

  function bindDynamicListeners() {
    const loginBtn = contentEl.querySelector('#leaderboard-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        renderAuthModal(async () => {
          if (options && options.onUserChange) await options.onUserChange();
          renderLeaderboardView(containerSelector, options);
        });
      });
    }

    const retryBtn = contentEl.querySelector('#retry-leaderboard-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        retryBtn.textContent = '⏳ ...';
        loadFreshData();
      });
    }
  }

  function bindStaticListeners() {
    const typeDropdown = container.querySelector('#leaderboard-type-dropdown');
    const typeTrigger = container.querySelector('#leaderboard-type-trigger');
    const typeItems = container.querySelectorAll('#leaderboard-type-menu .dropdown-item');

    if (typeTrigger && typeDropdown) {
      typeTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        typeDropdown.classList.toggle('open');
      });

      typeItems.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          currentPeriod = item.getAttribute('data-value');
          localStorage.setItem('myduo_leaderboard_period', currentPeriod);
          typeDropdown.classList.remove('open');
          renderLeaderboardView(containerSelector, options);
        });
      });

      const closeDropdown = () => {
        typeDropdown.classList.remove('open');
      };
      document.addEventListener('click', closeDropdown);
      container._globalClickHandler = closeDropdown;
    }
  }

  bindStaticListeners();
  bindDynamicListeners();

  async function loadFreshData() {
    try {
      const freshRes = await getLeaderboard(null, currentPeriod);
      if (freshRes && freshRes.data && freshRes.data.length > 0 && contentEl) {
        const freshBodyData = buildLeaderboardBodyHtml(freshRes.data, currentUser, currentPeriod);
        const podiumContainer = container.querySelector('#leaderboard-podium-container');
        if (podiumContainer) podiumContainer.innerHTML = freshBodyData.podiumHtml;
        contentEl.innerHTML = freshBodyData.restHtml;
        bindDynamicListeners();
      } else if (contentEl && (!initialPlayers || initialPlayers.length === 0)) {
        const fallbackData = buildLeaderboardBodyHtml([], currentUser, currentPeriod);
        contentEl.innerHTML = fallbackData.restHtml;
        bindDynamicListeners();
      }
    } catch (e) {
      console.warn('Leaderboard auto-sync error:', e);
      if (contentEl && (!initialPlayers || initialPlayers.length === 0)) {
        const fallbackData = buildLeaderboardBodyHtml([], currentUser, currentPeriod);
        contentEl.innerHTML = fallbackData.restHtml;
        bindDynamicListeners();
      }
    }
  }

  // Clear any existing polling timer on container
  if (container._leaderboardTimer) {
    clearInterval(container._leaderboardTimer);
    container._leaderboardTimer = null;
  }

  // 1. Fresh sync on initial open
  loadFreshData();

  // 2. Background sync every 1 hour while viewing leaderboard
  container._leaderboardTimer = setInterval(() => {
    // Only fetch if tab content is still active in the DOM
    if (document.body.contains(contentEl)) {
      loadFreshData();
    } else {
      clearInterval(container._leaderboardTimer);
      container._leaderboardTimer = null;
    }
  }, 3600000);

  // 3. Listen to local XP and remote leaderboard changes to update table immediately
  const handleLiveUpdate = () => {
    const updatedCache = getCachedLeaderboard(null, currentPeriod);
    if (updatedCache && updatedCache.data && contentEl && document.body.contains(contentEl)) {
      const freshBodyData = buildLeaderboardBodyHtml(updatedCache.data, currentUser, currentPeriod);
      const podiumContainer = container.querySelector('#leaderboard-podium-container');
      if (podiumContainer) podiumContainer.innerHTML = freshBodyData.podiumHtml;
      contentEl.innerHTML = freshBodyData.restHtml;
      bindDynamicListeners();
    }
  };

  window.addEventListener('myduo:xp_changed', handleLiveUpdate);
  window.addEventListener('myduo:leaderboard_updated', handleLiveUpdate);
  container._xpHandler = handleLiveUpdate;
  container._leaderboardHandler = handleLiveUpdate;

  // 4. When user tabs back to the app, immediately refresh
  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && document.body.contains(contentEl)) {
      loadFreshData();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  container._visibilityHandler = handleVisibility;
}

export { renderLeaderboardView };
