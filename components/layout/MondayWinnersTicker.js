import { getCachedLeaderboard, getLeaderboard, formatCompactXp } from '../../services/api.js?v=385.0';
import { getRecentWeekKeys, getIsoWeekKey } from '../../services/weekKey.js?v=385.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=385.0';

const TICKER_TEXTS = {
  ru: {
    badge: 'ТОП-4',
    badgeTitle: 'Лига недели завершена',
    intro: 'Лига недели завершена! Поздравляем лидеров:',
    rank1: '1 место',
    rank2: '2 место',
    rank3: '3 место',
    rank4: '4 место',
    outro: 'Началась новая лига! Удачи в тренировках!',
    close: 'Закрыть',
  },
  uk: {
    badge: 'ТОП-4',
    badgeTitle: 'Ліга тижня завершена',
    intro: 'Ліга тижня завершена! Вітаємо лідерів:',
    rank1: '1 місце',
    rank2: '2 місце',
    rank3: '3 місце',
    rank4: '4 місце',
    outro: 'Розпочалася нова ліга! Успіхів у тренуваннях!',
    close: 'Закрити',
  },
  en: {
    badge: 'TOP-4',
    badgeTitle: 'Weekly League finished',
    intro: 'Weekly League completed! Congratulations to the leaders:',
    rank1: '1st place',
    rank2: '2nd place',
    rank3: '3rd place',
    rank4: '4th place',
    outro: 'A new league has begun! Good luck with training!',
    close: 'Close',
  },
  de: {
    badge: 'TOP-4',
    badgeTitle: 'Wochenliga beendet',
    intro: 'Wochenliga beendet! Herzlichen Glückwunsch an die Besten:',
    rank1: '1. Platz',
    rank2: '2. Platz',
    rank3: '3. Platz',
    rank4: '4. Platz',
    outro: 'Eine neue Liga hat begonnen! Viel Erfolg!',
    close: 'Schließen',
  },
  es: {
    badge: 'TOP-4',
    badgeTitle: 'Liga semanal finalizada',
    intro: '¡Liga semanal finalizada! Felicitaciones a los líderes:',
    rank1: '1.er puesto',
    rank2: '2.º puesto',
    rank3: '3.er puesto',
    rank4: '4.º puesto',
    outro: '¡Comenzó una nueva liga! ¡Éxito en el aprendizaje!',
    close: 'Cerrar',
  },
  fr: {
    badge: 'TOP-4',
    badgeTitle: 'Ligue hebdomadaire terminée',
    intro: 'Ligue hebdomadaire terminée ! Félicitations aux vainqueurs :',
    rank1: '1ère place',
    rank2: '2e place',
    rank3: '3e place',
    rank4: '4e place',
    outro: 'Une nouvelle ligue commence ! Bon apprentissage !',
    close: 'Fermer',
  },
};

function getTickerTexts() {
  const lang = (getInterfaceLanguage ? getInterfaceLanguage() : 'ru').toLowerCase();
  return TICKER_TEXTS[lang] || TICKER_TEXTS.en || TICKER_TEXTS.ru;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTop4Winners(weekKey) {
  let lb = getCachedLeaderboard(weekKey, 'week');
  let players = (lb && Array.isArray(lb.data)) ? lb.data.filter((p) => p && p.name) : [];

  if (players.length < 4) {
    const curWeekKey = getIsoWeekKey();
    if (weekKey !== curWeekKey) {
      const curLb = getCachedLeaderboard(curWeekKey, 'week');
      const curPlayers = (curLb && Array.isArray(curLb.data)) ? curLb.data.filter((p) => p && p.name) : [];
      if (curPlayers.length > players.length) {
        players = curPlayers;
      }
    }
  }

  const defaultWinners = [
    { name: 'Elena', xp: 2450 },
    { name: 'Alex', xp: 1980 },
    { name: 'Max', xp: 1620 },
    { name: 'Anna', xp: 1350 },
  ];

  const winners = [];
  for (let i = 0; i < 4; i++) {
    if (players[i] && Number(players[i].xp || 0) > 0) {
      winners.push({
        name: players[i].name || defaultWinners[i].name,
        xp: Number(players[i].xp || 0),
        isCurrentUser: Boolean(players[i].isCurrentUser),
      });
    } else {
      winners.push(defaultWinners[i]);
    }
  }

  return winners;
}

function buildMarqueeHtml(winners, texts) {
  const medals = ['🥇', '🥈', '🥉', '🎖️'];

  const items = winners.map((w, idx) => {
    const medal = medals[idx] || '🎖️';
    const xpFormatted = formatCompactXp ? formatCompactXp(w.xp) : `${w.xp}`;
    const highlightClass = w.isCurrentUser ? 'ticker-player-you' : '';
    const youSuffix = w.isCurrentUser ? ' <span>(Вы)</span>' : '';

    return `
      <span class="ticker-player-item ${highlightClass}">
        <span class="ticker-medal">${medal}</span>
        <strong class="ticker-player-name">${escapeHtml(w.name)}${youSuffix}</strong>
        <span class="ticker-player-xp">${xpFormatted} XP</span>
      </span>
    `;
  });

  return `
    <span class="ticker-intro">🏆 ${texts.intro}</span>
    <span class="ticker-bullet">•</span>
    ${items.join(' <span class="ticker-bullet">•</span> ')}
    <span class="ticker-bullet">•</span>
    <span class="ticker-outro">🎉 ${texts.outro}</span>
    <span class="ticker-spacer">✦</span>
  `;
}

let isTickerActive = false;

export function shouldShowMondayTicker(force = false) {
  // Disabled per product decision
  return false;
}

export function renderMondayWinnersTicker(options = {}) {
  const { force = false } = options;
  if (!shouldShowMondayTicker(force)) {
    return;
  }

  const container = document.querySelector('#monday-ticker-container');
  if (!container) return;

  const curWeekKey = getIsoWeekKey();
  const seenKey = `myduo_ticker_seen_week_${curWeekKey}`;
  const dismissKey = `myduo_monday_ticker_dismissed_${curWeekKey}`;

  const recentWeeks = getRecentWeekKeys(2);
  const prevWeekKey = recentWeeks[1] || recentWeeks[0];

  const texts = getTickerTexts();
  let winners = getTop4Winners(prevWeekKey);

  // Remove existing ticker if already present
  const existingTicker = container.querySelector('#monday-winners-ticker');
  if (existingTicker) existingTicker.remove();

  const marqueeHtml = buildMarqueeHtml(winners, texts);

  const tickerEl = document.createElement('div');
  tickerEl.id = 'monday-winners-ticker';
  tickerEl.className = 'monday-winners-ticker';
  tickerEl.setAttribute('role', 'region');
  tickerEl.setAttribute('aria-label', texts.badgeTitle);
  tickerEl.title = `${texts.badgeTitle}. Нажмите, чтобы открыть рейтинг`;

  tickerEl.innerHTML = `
    <div class="ticker-badge" title="${texts.badgeTitle}">
      <span class="ticker-badge-trophy">🏆</span>
      <span class="ticker-badge-text">${texts.badge}</span>
    </div>
    <div class="ticker-marquee-wrapper" id="ticker-marquee-wrapper">
      <div class="ticker-track">
        <div class="ticker-content">${marqueeHtml}</div>
        <div class="ticker-content" aria-hidden="true">${marqueeHtml}</div>
      </div>
    </div>
    <button type="button" class="ticker-close-btn" id="ticker-close-btn" title="${texts.close}" aria-label="${texts.close}">✕</button>
  `;

  // Show ticker exactly 2 times (2 complete marquee passes), then smoothly dismiss
  let loopCount = 0;
  const track = tickerEl.querySelector('.ticker-track');
  if (track) {
    track.addEventListener('animationiteration', () => {
      loopCount++;
      if (loopCount >= 2) {
        tickerEl.classList.add('ticker-dismissing');
        setTimeout(() => {
          tickerEl.remove();
          isTickerActive = false;
        }, 350);
        try {
          localStorage.setItem(seenKey, '1');
        } catch (err) {}
      }
    });
  }

  // Click on ticker (except close button) -> Navigate to Leaderboard
  tickerEl.addEventListener('click', (e) => {
    if (e.target.closest('#ticker-close-btn')) return;
    if (typeof window.setActiveTab === 'function') {
      window.setActiveTab('leaderboard');
    }
  });

  // Close button dismiss handler
  const closeBtn = tickerEl.querySelector('#ticker-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tickerEl.classList.add('ticker-dismissing');
      setTimeout(() => {
        tickerEl.remove();
        isTickerActive = false;
      }, 300);
      try {
        sessionStorage.setItem(dismissKey, '1');
        localStorage.setItem(seenKey, '1');
      } catch (err) {}
    });
  }

  container.appendChild(tickerEl);
  isTickerActive = true;

  // Background refresh from Firestore if available
  getLeaderboard(prevWeekKey, 'week').then((res) => {
    if (res && Array.isArray(res.data) && res.data.length >= 4) {
      const freshWinners = getTop4Winners(prevWeekKey);
      const freshHtml = buildMarqueeHtml(freshWinners, texts);
      const contents = tickerEl.querySelectorAll('.ticker-content');
      contents.forEach((c) => {
        c.innerHTML = freshHtml;
      });
    }
  }).catch(() => {});
}

export function updateMondayTickerTabVisibility(currentTab) {
  const container = document.querySelector('#monday-ticker-container');
  if (!container) return;

  // Show ticker specifically on the main training screen
  if (currentTab === 'training') {
    container.style.display = 'block';
    if (!container.querySelector('#monday-winners-ticker') && shouldShowMondayTicker(false)) {
      renderMondayWinnersTicker();
    }
  } else {
    // Hide ticker on other secondary tabs to keep dictionary/leaderboard/settings views clean
    container.style.display = 'none';
  }
}

export function initMondayWinnersTickerListener() {
  if (typeof window !== 'undefined') {
    window.addEventListener('myduo:show_monday_ticker', (e) => {
      const force = Boolean(e?.detail?.force);
      const container = document.querySelector('#monday-ticker-container');
      if (container) container.style.display = 'block';
      renderMondayWinnersTicker({ force: true });
    });
  }
}
