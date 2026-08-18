import { getUserStats, toggleFavoriteApi, getUserFavorites } from '../../services/api.js?v=18.0';
import { getCurrentUser } from '../../services/authService.js?v=18.0';
import { speakWord, preloadWordAudio } from '../../services/audioService.js?v=18.0';

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

    const wotd = stats.wordOfTheDay;
    let wotdHtml = '';
    let isWotdFav = false;

    if (wotd) {
      if (wotd.word) preloadWordAudio(wotd.word);
      const favList = getUserFavorites();
      const favSet = new Set(favList.map(String));
      isWotdFav = favSet.has(String(wotd.id));

      wotdHtml = `
        <!-- Word of the Day Section (Self-contained Card) -->
        <div class="flashcard-3d-wrapper wotd-standalone-wrapper" style="margin: 16px auto 0; max-width: 100%;">
          <div class="flashcard-3d wotd-card" id="wotd-flashcard-3d" title="Нажмите, чтобы перевернуть карточку">
            <!-- Front Face: English word -->
            <div class="flashcard-face flashcard-front">
              <div class="flashcard-face-top">
                <button type="button" class="flashcard-sound-btn" id="wotd-sound-front" title="Прослушать">🔊</button>
                <span class="wotd-card-badge">🔥 Слово дня</span>
                <button type="button" class="flashcard-fav-btn ${isWotdFav ? 'is-favorite' : ''}" id="wotd-fav-front" title="В Избранное">
                  ${isWotdFav ? '❤️' : '🤍'}
                </button>
              </div>
              <div class="flashcard-face-body">
                <h2 class="flashcard-word">${wotd.word}</h2>
                ${wotd.transcription ? `<p class="flashcard-transcription">${wotd.transcription}</p>` : ''}
              </div>
              <div class="flashcard-face-bottom">
                <span class="flashcard-flip-prompt">Нажми, чтобы увидеть перевод</span>
              </div>
            </div>

            <!-- Back Face: Russian translation -->
            <div class="flashcard-face flashcard-back">
              <div class="flashcard-face-top">
                <button type="button" class="flashcard-sound-btn" id="wotd-sound-back" title="Прослушать">🔊</button>
                <span class="wotd-card-badge">🔥 Слово дня</span>
                <button type="button" class="flashcard-fav-btn ${isWotdFav ? 'is-favorite' : ''}" id="wotd-fav-back" title="В Избранное">
                  ${isWotdFav ? '❤️' : '🤍'}
                </button>
              </div>
              <div class="flashcard-face-body">
                <h2 class="flashcard-translation">${wotd.translation}</h2>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 14px;">
        <h2 style="font-size: 22px; margin: 0;">📊 Ваши достижения</h2>
      </div>

      <div id="stats-content" style="padding-bottom: 24px;">
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

        <!-- Categories Section -->
        <div class="curriculum-block">
          <div class="section-title-row">
            <h3>Категории</h3>
            <span class="total-words-badge" id="stat-total-words">Всего слов — ${stats.totalWords || 0}</span>
          </div>
          
          <div class="category-progress-list" id="category-list">
            ${categoriesHtml}
          </div>
        </div>

        <!-- Word of the Day Section -->
        ${wotdHtml}
      </div>
    `;

    if (wotd) {
      const flashcard = container.querySelector('#wotd-flashcard-3d');
      if (flashcard) {
        let isFlipped = false;
        flashcard.addEventListener('click', (e) => {
          if (e.target.closest('.flashcard-sound-btn') || e.target.closest('.flashcard-fav-btn')) {
            return;
          }
          isFlipped = !isFlipped;
          flashcard.classList.toggle('is-flipped', isFlipped);
          if (!isFlipped) {
            speakWord(wotd.word, wotd.id);
          }
        });

        const speakButtons = container.querySelectorAll('#wotd-sound-front, #wotd-sound-back');
        speakButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            speakWord(wotd.word, wotd.id);
          });
        });

        const favButtons = container.querySelectorAll('#wotd-fav-front, #wotd-fav-back');
        favButtons.forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            isWotdFav = !isWotdFav;
            await toggleFavoriteApi(wotd.id, isWotdFav);
            favButtons.forEach((b) => {
              b.classList.toggle('is-favorite', isWotdFav);
              b.innerHTML = isWotdFav ? '❤️' : '🤍';
            });
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load stats view:', err);
    container.innerHTML = '<p class="empty-state">Ошибка загрузки статистики.</p>';
  }
}

export { renderStatsView };
