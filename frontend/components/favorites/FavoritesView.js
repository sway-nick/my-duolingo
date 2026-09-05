import { speakWord } from '../../services/audioService.js?v=200.0';
import { toggleFavoriteApi, clearAllFavoritesApi } from '../../services/api.js?v=200.0';
import { t, getWordTranslation, getWordNotes } from '../../services/i18n.js?v=200.0';

function renderFavoritesView(favoriteWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { onStartFavoritePractice = () => {}, onRemoveFavorite = () => {}, onClearAllFavorites = () => {} } = options;

  if (!favoriteWords || favoriteWords.length === 0) {
    container.innerHTML = `
      <div class="favorites-page">
        <div class="page-header" style="margin-bottom: 14px;">
          <h2 style="font-size: 22px; margin: 0;">${t('fav_title')}</h2>
        </div>
        <div class="empty-favorites-box">
          <span class="empty-icon" style="font-size: 40px; display: block; margin-bottom: 8px;">🤍</span>
          <h3 style="margin: 4px 0 8px;">${t('fav_empty')}</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">
            ${t('fav_empty_sub')}
          </p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="favorites-page">
      <div class="page-header" style="margin-bottom: 8px;">
        <h2 style="font-size: 22px; margin: 0; white-space: nowrap;">${t('fav_title')} (${favoriteWords.length})</h2>
      </div>

      <!-- Sticky Repeat & Clear Buttons -->
      <div class="fav-sticky-controls">
        <div style="display: flex; gap: 8px; width: 100%; align-items: stretch;">
          <button class="primary-button btn-green" id="start-fav-practice-btn" style="flex: 1; min-height: 44px; height: 44px; font-size: 15px; font-weight: 700; white-space: nowrap; padding: 0 12px;">
            ${t('fav_practice_btn')}
          </button>
          <button class="secondary-button" id="clear-all-favs-btn" style="min-height: 44px; height: 44px; font-size: 14px; font-weight: 600; white-space: nowrap; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border-radius: 12px;">
            🤍 ${t('fav_clear_all_btn')}
          </button>
        </div>
      </div>

      <div class="favorites-grid" id="favorites-grid">
        ${favoriteWords
          .map(
            (word) => `
          <div class="fav-card" data-id="${word.id}">
            <div class="fav-card-top">
              <span class="category-badge">${word.category || 'Общие'}</span>
              <div class="fav-card-actions">
                <button class="fav-audio-btn" data-word="${word.word}" data-id="${word.id}" title="Слушать произношение">🔊</button>
                <button class="remove-fav-btn" data-id="${word.id}" title="Удалить из избранного">❤️</button>
              </div>
            </div>
            
            <div class="fav-card-body">
              <h3 class="fav-word">${word.word}</h3>
              <p class="fav-translation">${getWordTranslation(word)}</p>
              ${getWordNotes(word) ? `<p class="dict-notes">${getWordNotes(word)}</p>` : ''}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  const headerEl = document.querySelector('.mobile-header');
  const favControls = container.querySelector('.fav-sticky-controls');
  const updateFavStickyTop = () => {
    if (favControls) {
      const headerHeight = headerEl ? headerEl.offsetHeight : 56;
      favControls.style.setProperty('--fav-sticky-top', `${Math.round(headerHeight)}px`);
    }
  };
  updateFavStickyTop();
  window.addEventListener('resize', updateFavStickyTop, { passive: true });

  // Bind practice button
  container.querySelector('#start-fav-practice-btn')?.addEventListener('click', () => {
    onStartFavoritePractice(favoriteWords);
  });

  // Bind clear all favorites button
  container.querySelector('#clear-all-favs-btn')?.addEventListener('click', async () => {
    if (!window.confirm(t('fav_clear_confirm'))) return;
    await clearAllFavoritesApi();
    onClearAllFavorites();
    favoriteWords.forEach((w) => {
      if (w && w.id) onRemoveFavorite(w.id);
    });
    renderFavoritesView([], containerSelector, options);
  });

  // High-performance single event delegation on grid
  const favGrid = container.querySelector('#favorites-grid');
  if (favGrid) {
    favGrid.addEventListener('click', async (e) => {
      // 1. Audio button
      const soundBtn = e.target.closest('.fav-audio-btn, .sound-button-sm');
      if (soundBtn) {
        e.stopPropagation();
        const w = soundBtn.getAttribute('data-word');
        const id = soundBtn.getAttribute('data-id');
        speakWord(w, id);
        return;
      }

      // 2. Remove favorite button
      const removeBtn = e.target.closest('.remove-fav-btn');
      if (removeBtn) {
        e.stopPropagation();
        const id = removeBtn.getAttribute('data-id');
        await toggleFavoriteApi(id, false);
        const card = container.querySelector(`.fav-card[data-id="${id}"]`);
        if (card) card.remove();
        onRemoveFavorite(id);

        const remainingCards = container.querySelectorAll('.fav-card');
        if (remainingCards.length === 0) {
          renderFavoritesView([], containerSelector, options);
        }
      }
    });
  }
}

export { renderFavoritesView };
