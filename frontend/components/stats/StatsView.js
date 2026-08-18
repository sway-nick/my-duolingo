import { getUserStats } from '../../services/api.js?v=18.0';
import { getCurrentUser } from '../../services/authService.js?v=18.0';

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

    let categoriesHtml = '<p class="empty-state">Категории появятся после первых пройденных уроков.</p>';
    if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
      categoriesHtml = stats.categoryBreakdown
        .map((cat) => {
          const percent = cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
          return `
            <div class="category-row">
              <div class="category-info-row">
                <span class="category-name">📁 ${cat.category}</span>
                <span class="category-count">${cat.learned} из ${cat.total} слов (${percent}%)</span>
              </div>
              <div class="category-progress-track">
                <div class="category-progress-fill" style="width: ${percent}%;"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 14px;">
        <h2 style="font-size: 22px; margin: 0;">📊 Ваши достижения</h2>
      </div>

      <div id="stats-content">
        <!-- Top Stats Widgets Grid (2x2) -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🎓</span>
            <div class="stat-info">
              <h3 id="stat-mastered">${stats.masteredCount || 0}</h3>
              <p>Выучено</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">📖</span>
            <div class="stat-info">
              <h3 id="stat-learning">${stats.learningCount || 0}</h3>
              <p>На изучении</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <div class="stat-info">
              <h3 id="stat-accuracy">${(stats.totalAnswers > 0) ? `${stats.accuracy}%` : '0%'}</h3>
              <p>Точность</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🔥</span>
            <div class="stat-info">
              <h3 id="stat-streak">${stats.streakDays || 1} дн</h3>
              <p>Серия</p>
            </div>
          </div>
        </div>

        <!-- Relocated Curriculum / Program Section -->
        <div class="curriculum-block">
          <div class="section-title-row">
            <h3>📚 Программа обучения по категориям</h3>
            <span class="total-words-badge" id="stat-total-words">Всего в программе: ${stats.totalWords || 0} слов</span>
          </div>
          
          <div class="category-progress-list" id="category-list">
            ${categoriesHtml}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load stats view:', err);
    container.innerHTML = '<p class="empty-state">Ошибка загрузки статистики.</p>';
  }
}

export { renderStatsView };
