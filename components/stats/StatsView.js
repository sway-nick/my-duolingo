import { getUserStats, toggleFavoriteApi, getUserFavorites, isWordMastered, getUserProgress } from '../../services/api.js?v=378.0';
import { getCurrentUser } from '../../services/authService.js?v=378.0';
import { speakWord, preloadWordAudio } from '../../services/audioService.js?v=378.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=378.0';

function getCategoryMeta(catName) {
  const name = String(catName || '').toLowerCase().trim();
  if (name.includes('elementary')) {
    return { badgeClass: 'badge-a1', badgeText: 'A1-A2', isLevel: true, order: 1 };
  }
  if (name.includes('intermediate')) {
    return { badgeClass: 'badge-b1', badgeText: 'B1-B2', isLevel: true, order: 2 };
  }
  if (name.includes('advanced')) {
    return { badgeClass: 'badge-c1', badgeText: 'C1-C2', isLevel: true, order: 3 };
  }
  if (name.includes('irregular')) {
    return { badgeClass: 'badge-verbs', badgeText: '⚡ ' + (t('category_irregular_short') || 'Глаголы'), isLevel: false, order: 4 };
  }
  if (name.includes('pattern')) {
    return { badgeClass: 'badge-pattern', badgeText: '💬 ' + (t('category_pattern_short') || 'Речь'), isLevel: false, order: 5 };
  }
  return { badgeClass: 'badge-general', badgeText: '📚', isLevel: false, order: 6 };
}

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
      const wordLabel = t('stats_words_unit');
      const ofLabel = t('stats_of');

      const levelCards = [];
      const specialCards = [];

      stats.categoryBreakdown.forEach((cat) => {
        const percent = cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
        const meta = getCategoryMeta(cat.category);
        const cardHtml = `
          <div class="category-card">
            <div class="category-info-row">
              <div class="cat-name-box">
                <span class="cat-badge ${meta.badgeClass}">${meta.badgeText}</span>
                <span class="cat-title-text">${cat.category}</span>
              </div>
              <span class="category-count">${cat.learned} ${ofLabel} ${cat.total} ${wordLabel} (${percent}%)</span>
            </div>
            <div class="category-progress-track">
              <div class="category-progress-fill" style="width: ${percent}%;"></div>
            </div>
          </div>
        `;
        if (meta.isLevel) {
          levelCards.push({ meta, html: cardHtml });
        } else {
          specialCards.push({ meta, html: cardHtml });
        }
      });

      levelCards.sort((a, b) => a.meta.order - b.meta.order);
      specialCards.sort((a, b) => a.meta.order - b.meta.order);

      let sectionsHtml = '';
      if (levelCards.length > 0) {
        sectionsHtml += `
          <div class="stats-section-title">
            <span>${t('stats_levels')}</span>
          </div>
          ${levelCards.map(c => c.html).join('')}
        `;
      }
      if (specialCards.length > 0) {
        sectionsHtml += `
          <div class="stats-section-title"${levelCards.length > 0 ? ' style="margin-top: 16px;"' : ''}>
            <span>${t('stats_special_courses')}</span>
          </div>
          ${specialCards.map(c => c.html).join('')}
        `;
      }

      categoriesHtml = sectionsHtml || categoriesHtml;
    }

    // Generate dates for the last 7 days
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      days.push({
        dateStr: d.toLocaleDateString(getInterfaceLanguage() || 'en', { day: 'numeric', month: 'short' }),
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
    const minCum = Math.min(...days.map(d => d.cumulativeCount));
    const maxCum = Math.max(...days.map(d => d.cumulativeCount));
    const cumDiff = maxCum - minCum;

    function buildChartSvg(width = 352, height = 125) {
      const W = Math.max(Math.round(width || 352), 260);
      const H = Math.max(Math.round(height || 125), 100);
      const chartBottom = H - 22;
      const maxBarHeight = 36;

      let barsHtml = '';
      let points = [];
      let labelsHtml = '';

      const topY = 22;
      const bottomY = Math.max(chartBottom - maxBarHeight - 6, topY + 8);

      const paddingX = Math.round(W * 0.08);
      const availableW = W - paddingX * 2;
      const step = availableW / (days.length - 1);

      days.forEach((day, idx) => {
        const x = Math.round(paddingX + idx * step);
        const barHeight = day.dailyCount > 0 ? Math.max((day.dailyCount / maxDaily) * maxBarHeight, 5) : 0;
        const barY = chartBottom - barHeight;

        // Lower tier: Bars for daily learned
        if (day.dailyCount > 0) {
          barsHtml += `
            <rect x="${x - 9}" y="${barY}" width="18" height="${barHeight}" fill="url(#stats-bar-grad)" rx="3" opacity="0.9" />
            <text x="${x}" y="${barY - 3}" font-family="inherit" font-weight="700" font-size="9" fill="#38bdf8" text-anchor="middle">${day.dailyCount}</text>
          `;
        }

        // Upper tier: Cumulative line
        const lineY = cumDiff === 0 
          ? Math.round((topY + bottomY) / 2) 
          : Math.round(bottomY - ((day.cumulativeCount - minCum) / cumDiff) * (bottomY - topY));
        points.push({ x, y: lineY, val: day.cumulativeCount });

        // Clean X axis date labels
        labelsHtml += `
          <text x="${x}" y="${chartBottom + 14}" font-family="inherit" font-size="9.5" font-weight="500" fill="var(--text-muted, #94a3b8)" text-anchor="middle">${day.dateStr}</text>
        `;
      });

      // Generate path for cumulative line
      let pathD = '';
      points.forEach((p, idx) => {
        if (idx === 0) pathD += `M ${p.x} ${p.y}`;
        else pathD += ` L ${p.x} ${p.y}`;
      });

      let lineHtml = `
        <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      `;
      points.forEach((p) => {
        lineHtml += `
          <circle cx="${p.x}" cy="${p.y}" r="3" fill="#10b981" stroke="var(--card-bg, #1e293b)" stroke-width="1.2" />
          <text x="${p.x}" y="${p.y - 6}" font-family="inherit" font-weight="700" font-size="9.5" fill="#10b981" text-anchor="middle">${p.val}</text>
        `;
      });

      const grid1 = Math.round(H * 0.24);
      const grid2 = Math.round(H * 0.54);

      return `
        <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="none" style="display: block; overflow: visible;">
          <defs>
            <linearGradient id="stats-bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#60a5fa" />
              <stop offset="100%" stop-color="#2563eb" />
            </linearGradient>
          </defs>

          <!-- Baseline and grid -->
          <line x1="12" y1="${grid1}" x2="${W - 12}" y2="${grid1}" stroke="var(--border-color)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.35" />
          <line x1="12" y1="${grid2}" x2="${W - 12}" y2="${grid2}" stroke="var(--border-color)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.35" />
          <line x1="12" y1="${chartBottom}" x2="${W - 12}" y2="${chartBottom}" stroke="var(--border-color)" stroke-width="1" opacity="0.7" />

          ${barsHtml}
          ${lineHtml}
          ${labelsHtml}
        </svg>
      `;
    }

    const chartHtml = `
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">${t('stats_study_dynamics')}</span>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-dot" style="background: #3b82f6;"></span> ${t('stats_daily')}</div>
            <div class="legend-item"><span class="legend-dot" style="background: #10b981;"></span> ${t('stats_total')}</div>
          </div>
        </div>
        <div class="chart-svg-container" id="stats-chart-wrapper">
          ${buildChartSvg(352, 125)}
        </div>
      </div>
    `;

    container.innerHTML = `
      <div id="stats-content" style="padding-bottom: 0; margin-top: 0;">
        <!-- Top Stats Widgets Grid (1x3) -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap blue">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <span class="stat-val" id="stat-mastered">${stats.masteredCount || 0}</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap red">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <span class="stat-val" id="stat-accuracy">${(stats.totalAnswers > 0) ? `${stats.accuracy}%` : '0%'}</span>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap amber">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            </div>
            <span class="stat-val" id="stat-streak">${stats.streakDays || 1} ${t('stats_days_short')}</span>
          </div>
        </div>

        <!-- Categories Section -->
        <div class="curriculum-block">
          <div class="category-progress-list" id="category-list">
            ${categoriesHtml}
          </div>
        </div>

        <!-- Custom SVG Study Progress Chart -->
        ${chartHtml}
      </div>
    `;

    // Responsive width adjustment for chart
    const chartWrapper = container.querySelector('#stats-chart-wrapper');
    if (chartWrapper) {
      let lastWidth = 0;
      const applyChartWidth = (w) => {
        const measuredW = Math.round(w || chartWrapper.clientWidth || 352);
        if (measuredW >= 200 && Math.abs(measuredW - lastWidth) >= 4) {
          lastWidth = measuredW;
          chartWrapper.innerHTML = buildChartSvg(measuredW, 125);
        }
      };

      requestAnimationFrame(() => {
        applyChartWidth();
      });

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const w = entry.contentRect ? entry.contentRect.width : null;
            if (w && w >= 200) {
              applyChartWidth(w);
            }
          }
        });
        ro.observe(chartWrapper);
      }
    }
  } catch (err) {
    console.error('Failed to load stats view:', err);
    container.innerHTML = `<p class="empty-state">${t('stats_load_error')}</p>`;
  }
}

export { renderStatsView };
