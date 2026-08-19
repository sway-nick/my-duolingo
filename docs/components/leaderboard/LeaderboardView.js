import { getLeaderboard, getCachedLeaderboard, getIsoWeekKey } from '../../services/api.js?v=18.0';
import { getCurrentUser, getUserAvatar } from '../../services/authService.js?v=18.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=18.0';

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
        <h4 class="podium-name">${player.name || 'Ученик'}</h4>
        <span class="podium-xp">${player.xp} XP</span>
      </div>
    </div>
  `;
}

function buildLeaderboardBodyHtml(players, currentUser) {
  const top100 = players.slice(0, 100);
  const top4 = top100.slice(0, 4);
  const rest = top100.slice(4);

  const myRankIndex = players.findIndex((p) => p.isCurrentUser);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myPlayer = myRankIndex >= 0 ? players[myRankIndex] : null;

  const podiumHtml = `
    <div class="podium-sticky-wrapper">
      <div class="podium-grid">
        ${top4.map((p, idx) => renderPodiumCard(p, idx + 1)).join('')}
      </div>
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
              <div class="row-xp">${p.xp} XP</div>
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
            <div style="font-weight: 700; font-size: 14px;">${currentUser ? currentUser.name : 'Вы (Гость)'}</div>
            <div style="font-size: 12px; color: var(--text-muted);">
              ${currentUser ? 'Ваш текущий результат' : 'Войдите, чтобы закрепить результат'}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="my-bar-xp">${myPlayer.xp} XP</span>
          ${
            !currentUser
              ? `<button class="primary-button" id="leaderboard-login-btn" style="padding: 6px 14px; min-height: 34px; height: 34px; font-size: 13px;">Войти</button>`
              : ''
          }
        </div>
      </div>
    `;
  }

  return `${podiumHtml}${restListHtml}${myStickyBarHtml}`;
}

async function renderLeaderboardView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const currentUser = getCurrentUser();
  const weekTime = getTimeUntilSundayEnd();

  // 1. Instant 0ms cached data load
  const cachedRes = getCachedLeaderboard();
  const initialPlayers = cachedRes.data || [];

  container.innerHTML = `
    <div class="leaderboard-page">
      <div class="page-header" style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <h2 style="margin: 0; font-size: 22px; display: flex; align-items: center; gap: 8px;">
            🏆 Лига недели
          </h2>
          <div class="league-timer-badge">
            ⏳ ${weekTime.days > 0 ? `${weekTime.days}д ` : ''}${weekTime.hours}ч ${weekTime.mins}м
          </div>
        </div>
      </div>

      <!-- Scoring rules mini-banner -->
      <div class="scoring-rules-banner">
        <div class="rule-chip"><span class="rule-chip-icon">🎯</span> Квиз <strong class="rule-chip-val">+1&nbsp;XP</strong></div>
        <div class="rule-chip"><span class="rule-chip-icon">🧩</span> Пары <strong class="rule-chip-val">+3&nbsp;XP</strong></div>
        <div class="rule-chip"><span class="rule-chip-icon">✍️</span> Тест <strong class="rule-chip-val">+3&nbsp;XP</strong></div>
        <div class="rule-chip error-chip"><span class="rule-chip-icon">🪲</span> Ошибка <strong class="error-xp-val">-5&nbsp;XP</strong></div>
      </div>

      <!-- Instant 0ms Content -->
      <div id="leaderboard-content" style="min-height: 280px;">
        ${buildLeaderboardBodyHtml(initialPlayers, currentUser)}
      </div>
    </div>
  `;

  const contentEl = container.querySelector('#leaderboard-content');

  function bindListeners() {
    const loginBtn = contentEl.querySelector('#leaderboard-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        renderAuthModal(async () => {
          if (options && options.onUserChange) await options.onUserChange();
          renderLeaderboardView(containerSelector, options);
        });
      });
    }

    // Set sticky top offset for podium directly below header
    const headerEl = document.querySelector('.mobile-header');
    const stickyWrapper = contentEl.querySelector('.podium-sticky-wrapper');
    const updatePodiumStickyTop = () => {
      if (stickyWrapper) {
        const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 58;
        stickyWrapper.style.setProperty('--podium-sticky-top', `${Math.round(headerBottom)}px`);
      }
    };
    updatePodiumStickyTop();
    window.addEventListener('resize', updatePodiumStickyTop, { passive: true });
  }

  bindListeners();

  async function loadFreshData() {
    try {
      const freshRes = await getLeaderboard();
      if (freshRes && freshRes.data && contentEl) {
        contentEl.innerHTML = buildLeaderboardBodyHtml(freshRes.data, currentUser);
        bindListeners();
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
    const updatedCache = getCachedLeaderboard();
    if (updatedCache && updatedCache.data && contentEl && document.body.contains(contentEl)) {
      contentEl.innerHTML = buildLeaderboardBodyHtml(updatedCache.data, currentUser);
      bindListeners();
    }
  };

  window.addEventListener('myduo:xp_changed', handleLiveUpdate);
  window.addEventListener('myduo:leaderboard_updated', handleLiveUpdate);

  // 4. When user tabs back to the app, immediately refresh
  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && document.body.contains(contentEl)) {
      loadFreshData();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
}

export { renderLeaderboardView };
