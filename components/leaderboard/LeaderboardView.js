import { getLeaderboard, getCachedLeaderboard, getIsoWeekKey } from '../../services/api.js?v=16.0';
import { getCurrentUser, getUserAvatar } from '../../services/authService.js?v=16.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=16.0';

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
        <span class="podium-rank-num">#${rank}</span>
      </div>
      <div class="podium-info">
        <h4 class="podium-name">${player.name || 'Ученик'}</h4>
        <span class="podium-xp">${player.xp} XP</span>
      </div>
    </div>
  `;
}

function buildLeaderboardBodyHtml(players, currentUser) {
  const top4 = players.slice(0, 4);
  const rest = players.slice(4);

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
        <p class="subtitle" style="margin-top: 4px;">
          Соревнуйтесь за алмазный кубок! Рейтинг обновляется каждую неделю.
        </p>
      </div>

      <!-- Scoring rules mini-banner -->
      <div class="scoring-rules-banner">
        <div class="rule-chip">🎯 Квиз <strong>+1 XP</strong></div>
        <div class="rule-chip">🧩 Пары без ошибок <strong>+1 XP</strong></div>
        <div class="rule-chip">✍️ Тест <strong>+3 XP</strong></div>
        <div class="rule-chip error-chip">❌ Ошибка <strong>-1 XP</strong></div>
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
  }

  bindListeners();

  // 2. Background fresh sync (non-blocking)
  getLeaderboard().then((freshRes) => {
    if (freshRes && freshRes.data && contentEl) {
      contentEl.innerHTML = buildLeaderboardBodyHtml(freshRes.data, currentUser);
      bindListeners();
    }
  }).catch(() => {});
}

export { renderLeaderboardView };
