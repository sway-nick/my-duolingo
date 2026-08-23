import { getUserStats, toggleFavoriteApi, getUserFavorites, isWordMastered, getUserProgress } from '../../services/api.js?v=18.0';
import { getCurrentUser } from '../../services/authService.js?v=18.0';
import { speakWord, preloadWordAudio } from '../../services/audioService.js?v=18.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=25.0';

async function renderStatsView(allWordsOrContainer = '#app-content', maybeContainer = '#app-content') {
  let allWords = [];
  let containerSelector = '#app-content';

  if (Array.isArray(allWordsOrContainer)) {
    allWords = allWordsOrContainer;
    containerSelector = maybeContainer;
  } else if (typeof allWordsOrContainer === 'string') {
    containerSelector = allWordsOrContainer;
  }

  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    const stats = await getUserStats(allWords);

    let categoriesHtml = `<p class="empty-state">${t('stats_empty_categories')}</p>`;
    if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
      const wordLabel = getInterfaceLanguage() === 'ru' ? 'слов' : getInterfaceLanguage() === 'uk' ? 'слів' : 'words';
      const ofLabel = getInterfaceLanguage() === 'ru' ? 'из' : getInterfaceLanguage() === 'uk' ? 'із' : 'of';
      categoriesHtml = stats.categoryBreakdown
        .map((cat) => {
          const percent = cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
          return `
            <div class="category-row">
              <div class="category-info-row">
                <span class="category-name">📁 ${cat.category}</span>
                <span class="category-count">${cat.learned} ${ofLabel} ${cat.total} ${wordLabel} (${percent}%)</span>
              </div>
              <div class="category-progress-track">
                <div class="category-progress-fill" style="width: ${percent}%;"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // Generate dates for the last 7 days
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      days.push({
        dateStr: d.toLocaleDateString(getInterfaceLanguage() === 'ru' ? 'ru-RU' : getInterfaceLanguage() === 'uk' ? 'uk-UA' : 'en-US', { day: 'numeric', month: 'short' }),
        timestampStart: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
        timestampEnd: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime(),
        dailyCount: 0,
        cumulativeCount: 0
      });
    }

    const localProg = getUserProgress();

    // Fill daily counts
    Object.entries(localProg).forEach(([wordId, prog]) => {
      if (isWordMastered(prog)) {
        const masteredAt = prog.masteredAt || prog.lastPracticed || Date.now();
        days.forEach(day => {
          if (masteredAt >= day.timestampStart && masteredAt <= day.timestampEnd) {
            day.dailyCount += 1;
          }
        });
      }
    });

    // Fill cumulative counts
    days.forEach(day => {
      let count = 0;
      Object.entries(localProg).forEach(([wordId, prog]) => {
        if (isWordMastered(prog)) {
          const masteredAt = prog.masteredAt || prog.lastPracticed || Date.now();
          if (masteredAt <= day.timestampEnd) {
            count += 1;
          }
        }
      });
      day.cumulativeCount = count;
    });

    const maxDaily = Math.max(...days.map(d => d.dailyCount), 1);
    const maxCumulative = Math.max(...days.map(d => d.cumulativeCount), 1);

    const chartHeight = 110; // active height for columns
    const chartBottom = 140; // y baseline

    let barsHtml = '';
    let points = [];
    let labelsHtml = '';

    days.forEach((day, idx) => {
      const x = 50 + idx * 56;
      const barHeight = (day.dailyCount / maxDaily) * chartHeight;
      const barY = chartBottom - barHeight;
      
      // Bar for daily learned (blue)
      barsHtml += `
        <rect x="${x + 8}" y="${barY}" width="20" height="${barHeight}" fill="#3b82f6" rx="3" opacity="0.85" />
        <text x="${x + 18}" y="${barY - 5}" font-family="inherit" font-weight="700" font-size="11" fill="#3b82f6" text-anchor="middle">${day.dailyCount}</text>
      `;

      // Line point for cumulative (green)
      const lineY = chartBottom - (day.cumulativeCount / maxCumulative) * chartHeight;
      points.push({ x: x + 18, y: lineY, val: day.cumulativeCount });

      // Date labels
      labelsHtml += `
        <text x="${x + 18}" y="${chartBottom + 20}" font-family="inherit" font-size="11" fill="var(--text-muted)" text-anchor="middle">${day.dateStr}</text>
      `;
    });

    // Generate path for cumulative line
    let pathD = '';
    points.forEach((p, idx) => {
      if (idx === 0) pathD += `M ${p.x} ${p.y}`;
      else pathD += ` L ${p.x} ${p.y}`;
    });

    let lineHtml = `
      <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    `;
    points.forEach((p) => {
      lineHtml += `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
        <text x="${p.x}" y="${p.y - 7}" font-family="inherit" font-weight="700" font-size="11" fill="#10b981" text-anchor="middle">${p.val}</text>
      `;
    });

    const chartTitle = getInterfaceLanguage() === 'ru' ? 'Динамика изучения' : getInterfaceLanguage() === 'uk' ? 'Динаміка вивчення' : 'Learning Dynamics';
    const barLegend = getInterfaceLanguage() === 'ru' ? 'Выучено за день' : getInterfaceLanguage() === 'uk' ? 'Вивчено за день' : 'Learned today';
    const lineLegend = getInterfaceLanguage() === 'ru' ? 'Всего выучено' : getInterfaceLanguage() === 'uk' ? 'Всього вивчено' : 'Total learned';

    const chartHtml = `
      <div class="curriculum-block" style="margin-top: 20px;">
        <div class="section-title-row" style="margin-bottom: 16px;">
          <h3>📊 ${chartTitle}</h3>
          <div style="display: flex; gap: 14px; font-size: 11px; font-weight: 600;">
            <span style="color: #3b82f6; display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: #3b82f6; border-radius: 2px;"></span>
              ${barLegend}
            </span>
            <span style="color: #10b981; display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 10px; height: 2px; background-color: #10b981;"></span>
              ${lineLegend}
            </span>
          </div>
        </div>
        <div style="width: 100%; overflow-x: auto; background: var(--bg-card, #ffffff); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 8px 10px; box-shadow: var(--shadow-sm);">
          <svg viewBox="0 0 460 180" width="100%" height="160" style="display: block; overflow: visible;">
            <!-- Grid lines -->
            <line x1="40" y1="30" x2="440" y2="30" stroke="var(--border-color)" stroke-width="0.7" stroke-dasharray="4 4" opacity="0.5" />
            <line x1="40" y1="85" x2="440" y2="85" stroke="var(--border-color)" stroke-width="0.7" stroke-dasharray="4 4" opacity="0.5" />
            <line x1="40" y1="140" x2="440" y2="140" stroke="var(--border-color)" stroke-width="1" />
            
            ${barsHtml}
            ${lineHtml}
            ${labelsHtml}
          </svg>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 14px;">
        <h2 style="font-size: 22px; margin: 0;">${t('achievements')}</h2>
      </div>

      <div id="stats-content" style="padding-bottom: 24px;">
        <!-- Top Stats Widgets Grid (1x3) -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🎓</span>
            <div class="stat-info">
              <h3 id="stat-mastered">${stats.masteredCount || 0}</h3>
              <p>${t('dict_filter_mastered')}</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <div class="stat-info">
              <h3 id="stat-accuracy">${(stats.totalAnswers > 0) ? `${stats.accuracy}%` : '0%'}</h3>
              <p>${getInterfaceLanguage() === 'ru' ? 'Точность' : getInterfaceLanguage() === 'uk' ? 'Точність' : 'Accuracy'}</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🔥</span>
            <div class="stat-info">
              <h3 id="stat-streak">${stats.streakDays || 1} ${getInterfaceLanguage() === 'ru' ? 'дн' : getInterfaceLanguage() === 'uk' ? 'дн' : 'days'}</h3>
              <p>${getInterfaceLanguage() === 'ru' ? 'Серия' : getInterfaceLanguage() === 'uk' ? 'Серія' : 'Streak'}</p>
            </div>
          </div>
        </div>

        <!-- Categories Section -->
        <div class="curriculum-block">
          <div class="section-title-row">
            <h3>${t('stats_categories')}</h3>
            <span class="total-words-badge" id="stat-total-words">${getInterfaceLanguage() === 'ru' ? 'Всего слов —' : getInterfaceLanguage() === 'uk' ? 'Всього слів —' : 'Total words —'} ${stats.totalWords || 0}</span>
          </div>
          
          <div class="category-progress-list" id="category-list">
            ${categoriesHtml}
          </div>
        </div>

        <!-- Custom SVG Study Progress Chart -->
        ${chartHtml}
      </div>
    `;
  } catch (err) {
    console.error('Failed to load stats view:', err);
    container.innerHTML = '<p class="empty-state">Ошибка загрузки статистики.</p>';
  }
}

export { renderStatsView };
