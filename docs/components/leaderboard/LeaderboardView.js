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
          <svg class="diamond-laurel-wreath" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="laurelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fffbeb" />
                <stop offset="30%" stop-color="#fde047" />
                <stop offset="65%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#b45309" />
              </linearGradient>
              <filter id="wreathGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#78350f" flood-opacity="0.5"/>
              </filter>
            </defs>
            <g filter="url(#wreathGlow)">
              <!-- Left branch stem -->
              <path d="M60 110 C38 108 16 88 16 60 C16 42 26 25 40 16" stroke="url(#laurelGoldGrad)" stroke-width="2.8" stroke-linecap="round"/>
              <!-- Left leaves -->
              <path d="M53 108 C44 104 41 95 48 90 C53 94 56 102 53 108 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M38 98 C28 92 26 83 34 78 C39 83 40 91 38 98 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M26 84 C17 77 16 67 25 63 C29 68 29 77 26 84 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M19 68 C13 60 13 49 22 47 C25 53 23 62 19 68 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M18 49 C15 39 19 30 28 30 C30 36 26 44 18 49 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M25 32 C24 23 31 16 40 18 C39 25 33 31 25 32 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M38 19 C39 10 49 7 56 12 C54 19 46 22 38 19 Z" fill="url(#laurelGoldGrad)"/>
              
              <!-- Right branch stem -->
              <path d="M60 110 C82 108 104 88 104 60 C104 42 94 25 80 16" stroke="url(#laurelGoldGrad)" stroke-width="2.8" stroke-linecap="round"/>
              <!-- Right leaves -->
              <path d="M67 108 C76 104 79 95 72 90 C67 94 64 102 67 108 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M82 98 C92 92 94 83 86 78 C81 83 80 91 82 98 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M94 84 C103 77 104 67 95 63 C91 68 91 77 94 84 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M101 68 C107 60 107 49 98 47 C95 53 97 62 101 68 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M102 49 C105 39 101 30 92 30 C90 36 94 44 102 49 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M95 32 C96 23 89 16 80 18 C81 25 87 31 95 32 Z" fill="url(#laurelGoldGrad)"/>
              <path d="M82 19 C81 10 71 7 64 12 C66 19 74 22 82 19 Z" fill="url(#laurelGoldGrad)"/>
              
              <!-- Bottom gold ribbon tie -->
              <path d="M55 110 C58 107 62 107 65 110 C62 114 58 114 55 110 Z" fill="url(#laurelGoldGrad)"/>
              <circle cx="60" cy="110" r="3" fill="#fef08a"/>
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
