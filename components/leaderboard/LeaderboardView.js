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
      <div class="podium-avatar-wrapper">
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

    // Dynamic compact mode precisely when podium touches the sticky header
    const headerEl = document.querySelector('.mobile-header');
    const updateCompactPodium = () => {
      const stickyWrapper = contentEl.querySelector('.podium-sticky-wrapper');
      if (stickyWrapper && document.body.contains(stickyWrapper)) {
        const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 58;
        // Leave a precise 1px visible gap under the header
        const stickyTopOffset = Math.ceil(headerBottom) + 1;
        stickyWrapper.style.setProperty('--podium-sticky-top', `${stickyTopOffset}px`);

        const wrapperRect = stickyWrapper.getBoundingClientRect();
        // Compress only when the top edge of the cards reaches the header
        const isTouchingHeader = wrapperRect.top <= (stickyTopOffset + 1);
        stickyWrapper.classList.toggle('is-compact', isTouchingHeader);
      }
    };

    if (container._onLeaderboardScroll) {
      window.removeEventListener('scroll', container._onLeaderboardScroll);
    }
    container._onLeaderboardScroll = updateCompactPodium;
    window.addEventListener('scroll', container._onLeaderboardScroll, { passive: true });
    updateCompactPodium();
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
