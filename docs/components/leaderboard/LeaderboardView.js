import { getLeaderboard, getCachedLeaderboard, getIsoWeekKey, formatCompactXp } from '../../services/api.js?v=200.0';
import { getCurrentUser, getUserAvatar } from '../../services/authService.js?v=131.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=131.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=131.0';

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
      <h2 style="margin: 0 0 10px; font-size: 22px;">Вы в ТОП 100!</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 15px; line-height: 1.4;">
        Поздравляем! Вы заняли <strong>#${rank}</strong> место в рейтинге. Так держать! 🚀
      </p>
      <button class="primary-button btn-green" id="top100-close-btn" style="min-height: 44px; width: 100%;">
        Ура!
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
  const day = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysUntilSunday = (7 - day) % 7;
  const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);
  const diffMs = Math.max(0, nextSunday - now);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, mins };
}

function renderPodiumCard(player, rank) {
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
        <h4 class="podium-name">${player.name || (getInterfaceLanguage() === 'ru' ? 'Ученик' : getInterfaceLanguage() === 'uk' ? 'Учень' : 'Student')}</h4>
        <span class="podium-xp">${formatCompactXp(player.xp)} XP</span>
      </div>
    </div>
  `;
}

function buildLeaderboardBodyHtml(players, currentUser, period = 'week') {
  const top100 = players.slice(0, 100);
  const top4 = top100.slice(0, 4);
  const rest = top100.slice(4);

  const myRankIndex = players.findIndex((p) => p.isCurrentUser);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myPlayer = myRankIndex >= 0 ? players[myRankIndex] : null;

  const podiumHtml = `
    <div class="podium-grid">
      ${top4.map((p, idx) => renderPodiumCard(p, idx + 1)).join('')}
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
                ${p.name || 'Ученик'}
              </div>
              <div class="row-xp">${formatCompactXp(p.xp)} XP</div>
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
      ? (getInterfaceLanguage() === 'ru' ? 'Ваш результат за всё время' : getInterfaceLanguage() === 'uk' ? 'Ваш результат за весь час' : 'Your result of all time') 
      : (currentUser 
          ? (getInterfaceLanguage() === 'ru' ? 'Ваш текущий результат' : getInterfaceLanguage() === 'uk' ? 'Ваш поточний результат' : 'Your current result') 
          : (getInterfaceLanguage() === 'ru' ? 'Войдите, чтобы закрепить результат' : getInterfaceLanguage() === 'uk' ? 'Увійдіть, щоб закріпити результат' : 'Log in to save your result')
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
            <div class="my-bar-name" style="font-weight: 700; font-size: 14px;">${currentUser ? currentUser.name : (getInterfaceLanguage() === 'ru' ? 'Вы (Гость)' : getInterfaceLanguage() === 'uk' ? 'Ви (Гість)' : 'You (Guest)')}</div>
            <div class="my-bar-status" style="font-size: 12px; color: var(--text-muted);">
              ${statusText}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="my-bar-xp">${formatCompactXp(myPlayer.xp)} XP</span>
          ${
            !currentUser
              ? `<button class="primary-button" id="leaderboard-login-btn" style="padding: 6px 14px; min-height: 34px; height: 34px; font-size: 13px;">${getInterfaceLanguage() === 'ru' ? 'Войти' : getInterfaceLanguage() === 'uk' ? 'Увійти' : 'Log In'}</button>`
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

  const dText = getInterfaceLanguage() === 'ru' ? 'д' : getInterfaceLanguage() === 'uk' ? 'д' : 'd';
  const hText = getInterfaceLanguage() === 'ru' ? 'ч' : getInterfaceLanguage() === 'uk' ? 'г' : 'h';
  const mText = getInterfaceLanguage() === 'ru' ? 'м' : getInterfaceLanguage() === 'uk' ? 'хв' : 'm';

  container.innerHTML = `
    <div class="leaderboard-page" style="position: relative;">
      <!-- Single Sticky Header Group (Header + Podium) -->
      <div class="leaderboard-sticky-group" style="position: sticky; top: 56px; z-index: 45; background: var(--bg-main, var(--bg-color, #ffffff)); padding-top: 8px; padding-bottom: 6px; border-bottom: 1.5px solid var(--border-color); margin: -12px -14px 8px -14px; padding-left: 14px; padding-right: 14px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
        <div class="page-header" style="margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div class="custom-dropdown" id="leaderboard-type-dropdown" style="margin: 0; width: 175px;">
            <button type="button" class="custom-dropdown-trigger" id="leaderboard-type-trigger" style="font-size: 19px; font-weight: 800; padding: 4px 6px; height: 38px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 175px; gap: 4px;" aria-haspopup="listbox" aria-expanded="false">
              <span id="leaderboard-type-label" style="white-space: nowrap; flex: 1; text-align: left;">${currentPeriod === 'all' ? '🌎 ' + t('lead_all_time') : t('lead_title')}</span>
              <span class="dropdown-arrow" style="font-size: 9px; flex-shrink: 0; margin-left: 2px;">▼</span>
            </button>
            <div class="custom-dropdown-menu" id="leaderboard-type-menu" role="listbox" style="z-index: 130; width: 175px;">
              <div class="dropdown-item ${currentPeriod === 'week' ? 'selected' : ''}" data-value="week" style="white-space: nowrap; padding: 10px 12px;">${t('lead_title')}</div>
              <div class="dropdown-item ${currentPeriod === 'all' ? 'selected' : ''}" data-value="all" style="white-space: nowrap; padding: 10px 12px;">🌎 ${t('lead_all_time')}</div>
            </div>
          </div>
          <div class="league-timer-badge" id="leaderboard-timer-badge" style="display: ${currentPeriod === 'all' ? 'none' : 'block'}; margin-right: 4px;">
            ⏳ ${weekTime.days > 0 ? `${weekTime.days}${dText} ` : ''}${weekTime.hours}${hText} ${weekTime.mins}${mText}
          </div>
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
      if (freshRes && freshRes.data && contentEl) {
        const freshBodyData = buildLeaderboardBodyHtml(freshRes.data, currentUser, currentPeriod);
        const podiumContainer = container.querySelector('#leaderboard-podium-container');
        if (podiumContainer) podiumContainer.innerHTML = freshBodyData.podiumHtml;
        contentEl.innerHTML = freshBodyData.restHtml;
        bindDynamicListeners();
      }
    } catch (e) {
      console.warn('Leaderboard auto-sync error:', e);
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
