import { getUserStats } from '../../services/api.js?v=7.0';
import { getCurrentUser } from '../../services/authService.js?v=7.0';

async function renderStatsView(containerSelector = '#app-content') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `
    <div class="stats-page">
      <div class="page-header">
        <h2>📊 Прогресс и Программа обучения</h2>
        <p class="subtitle">Ваши персональные достижения и детализация по темам</p>
      </div>

      <div class="stats-loading" id="stats-loading">
        Загрузка статистики...
      </div>

      <div id="stats-content" style="display: none;">
        <!-- Top Stats Widgets Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🎓</span>
            <div class="stat-info">
              <h3 id="stat-mastered">0</h3>
              <p>Выучено слов</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">📖</span>
            <div class="stat-info">
              <h3 id="stat-learning">0</h3>
              <p>В процессе изучения</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <div class="stat-info">
              <h3 id="stat-accuracy">0%</h3>
              <p>Точность ответов</p>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🔥</span>
            <div class="stat-info">
              <h3 id="stat-streak">0 дней</h3>
              <p>Серия тренировок</p>
            </div>
          </div>
        </div>

        <!-- Relocated Curriculum / Program Section -->
        <div class="curriculum-block">
          <div class="section-title-row">
            <h3>📚 Программа обучения по категориям</h3>
            <span class="total-words-badge" id="stat-total-words">Всего слов: 0</span>
          </div>
          
          <div class="category-progress-list" id="category-list">
            <!-- Dynamic categories rendered here -->
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const stats = await getUserStats();
    container.querySelector('#stats-loading').style.display = 'none';
    const content = container.querySelector('#stats-content');
    content.style.display = 'block';

    content.querySelector('#stat-mastered').textContent = stats.masteredCount || 0;
    content.querySelector('#stat-learning').textContent = stats.learningCount || 0;
    content.querySelector('#stat-accuracy').textContent = `${stats.accuracy || 0}%`;
    content.querySelector('#stat-streak').textContent = `${stats.streakDays || 1} d`;
    content.querySelector('#stat-total-words').textContent = `Всего в программе: ${stats.totalWords || 0} слов`;

    const catList = content.querySelector('#category-list');
    if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
      catList.innerHTML = stats.categoryBreakdown
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
    } else {
      catList.innerHTML = '<p class="empty-state">Категории появятся после первых пройденных уроков.</p>';
    }
  } catch (err) {
    console.error('Failed to load stats view:', err);
    container.querySelector('#stats-loading').textContent = 'Ошибка загрузки статистики.';
  }
}

export { renderStatsView };
