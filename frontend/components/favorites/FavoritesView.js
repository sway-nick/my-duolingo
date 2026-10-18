import { speakWord } from '../../services/audioService.js?v=385.0';
import { toggleFavoriteApi, clearAllFavoritesApi } from '../../services/api.js?v=385.0';
import { t, getWordTranslation, getWordNotes } from '../../services/i18n.js?v=385.0';
import { removeWordFromCollection, syncCollectionToAndroidWidget, getActiveCollectionId } from '../../services/collectionsService.js?v=385.0';
import { openAddWordsToCollectionModal } from '../modals/AddWordsToCollectionModal.js?v=385.0';

function renderFavoritesView(favoriteWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onStartFavoritePractice = () => {},
    onRemoveFavorite = () => {},
    onClearAllFavorites = () => {},
    onBack = null,
    collectionId = 'my_favorites',
    collectionTitle = null,
    allWords = [],
    onRefresh = null,
  } = options;

  const displayTitle = collectionTitle || t('fav_title');
  const isMyFavorites = collectionId === 'my_favorites';
  const isCustomCol = !isMyFavorites && String(collectionId).startsWith('col_');

  const backBtnHtml = onBack
    ? `
    <button type="button" id="fav-view-back-btn" style="background: none; border: none; font-size: 15px; font-weight: 600; color: var(--primary-color); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 0; margin-bottom: 6px;">
      <span>‹</span> <span>Назад к коллекциям</span>
    </button>
  `
    : '';

  if (!favoriteWords || favoriteWords.length === 0) {
    container.innerHTML = `
      <div class="favorites-page">
        ${backBtnHtml}
        <div class="page-header" style="margin-bottom: 14px;">
          <h2 style="font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.2px;">${displayTitle}</h2>
        </div>
        <div class="empty-favorites-box">
          <span class="empty-icon" style="font-size: 40px; display: block; margin-bottom: 8px;">🤍</span>
          <h3 style="margin: 4px 0 8px;">${isMyFavorites ? t('fav_empty') : 'В этом списке пока нет слов'}</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 16px;">
            ${isMyFavorites ? t('fav_empty_sub') : 'Добавьте слова из словаря или во время тренировок.'}
          </p>
          ${
            isCustomCol
              ? `
            <button type="button" id="empty-add-words-btn" class="primary-button btn-green" style="min-height: 44px; padding: 0 20px; font-size: 14px; font-weight: 700; border-radius: 12px;">
              ➕ Добавить слова
            </button>
          `
              : ''
          }
        </div>
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      if (onBack) onBack();
    });

    container.querySelector('#empty-add-words-btn')?.addEventListener('click', () => {
      openAddWordsToCollectionModal({
        collection: { id: collectionId, name: displayTitle },
        allWords,
        onSaved: () => {
          if (onRefresh) onRefresh();
        },
      });
    });

    return;
  }

  const heartIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="none" aria-hidden="true" style="flex-shrink: 0;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const trashIconSvg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  const repeatBtnText = (t('fav_practice_btn') || '').replace(/^🔥\s*/, '');

  container.innerHTML = `
    <div class="favorites-page">
      ${backBtnHtml}
      <div class="page-header" style="margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <h2 style="font-size: 18px; font-weight: 700; margin: 0; white-space: nowrap; letter-spacing: -0.2px;">${displayTitle}: ${favoriteWords.length}</h2>
        ${
          isCustomCol
            ? `
          <button type="button" id="header-add-words-btn" class="secondary-button" style="padding: 4px 10px; font-size: 13px; font-weight: 600; border-radius: 8px;">
            ➕ Добавить
          </button>
        `
            : ''
        }
      </div>

      <!-- Sticky Repeat & Clear Buttons -->
      <div class="fav-sticky-controls">
        <div style="display: grid; grid-template-columns: ${isMyFavorites ? '1fr 1fr' : '1fr'}; gap: 8px; width: 100%;">
          <button class="primary-button btn-green" id="start-fav-practice-btn" style="width: 100%; min-width: 0; min-height: 44px; height: 44px; font-size: clamp(12.5px, 3.4vw, 14.5px); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;">
            ${heartIconSvg}
            <span>${repeatBtnText}</span>
          </button>
          ${
            isMyFavorites
              ? `
            <button class="primary-button btn-graphite" id="clear-all-favs-btn" style="width: 100%; min-width: 0; min-height: 44px; height: 44px; font-size: clamp(12.5px, 3.4vw, 14px); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; box-sizing: border-box;">
              ${trashIconSvg}
              <span>${t('fav_clear_all_btn')}</span>
            </button>
          `
              : ''
          }
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
                <button class="remove-fav-btn" data-id="${word.id}" title="Удалить из списка">❤️</button>
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
      const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
      const headerHeight = headerEl ? headerEl.offsetHeight : 60;
      favControls.style.setProperty('--fav-sticky-top', `${Math.round(headerHeight + safeTop)}px`);
    }
  };
  updateFavStickyTop();
  window.addEventListener('resize', updateFavStickyTop, { passive: true });

  container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
    if (onBack) onBack();
  });

  container.querySelector('#header-add-words-btn')?.addEventListener('click', () => {
    openAddWordsToCollectionModal({
      collection: { id: collectionId, name: displayTitle },
      allWords,
      onSaved: () => {
        if (onRefresh) onRefresh();
      },
    });
  });

  // Bind practice button
  container.querySelector('#start-fav-practice-btn')?.addEventListener('click', () => {
    onStartFavoritePractice(favoriteWords);
  });

  // Bind clear all favorites button
  container.querySelector('#clear-all-favs-btn')?.addEventListener('click', async () => {
    if (!window.confirm(t('fav_clear_confirm'))) return;
    onClearAllFavorites();
    renderFavoritesView([], containerSelector, options);
    await clearAllFavoritesApi();
  });

  // Event delegation on grid
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

      // 2. Remove favorite / collection word button
      const removeBtn = e.target.closest('.remove-fav-btn');
      if (removeBtn) {
        e.stopPropagation();
        const id = removeBtn.getAttribute('data-id');

        if (isMyFavorites) {
          await toggleFavoriteApi(id, false);
          onRemoveFavorite(id);
          if (getActiveCollectionId() === 'my_favorites') {
            syncCollectionToAndroidWidget('my_favorites', allWords);
          }
        } else if (isCustomCol) {
          removeWordFromCollection(collectionId, id);
          if (getActiveCollectionId() === collectionId) {
            syncCollectionToAndroidWidget(collectionId, allWords);
          }
        }

        const card = container.querySelector(`.fav-card[data-id="${id}"]`);
        if (card) card.remove();

        const remainingCards = container.querySelectorAll('.fav-card');
        const titleEl = container.querySelector('.page-header h2');
        if (titleEl) {
          titleEl.textContent = `${displayTitle}: ${remainingCards.length}`;
        }
        if (remainingCards.length === 0) {
          renderFavoritesView([], containerSelector, options);
        }
      }
    });
  }
}

export { renderFavoritesView };
