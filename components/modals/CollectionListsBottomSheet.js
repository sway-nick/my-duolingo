import { t, getWordTranslation } from '../../services/i18n.js?v=385.0';
import {
  getUserFavorites,
  toggleFavoriteApi,
} from '../../services/api.js?v=385.0';
import {
  getCustomCollections,
  createCustomCollection,
  addWordToCollection,
  removeWordFromCollection,
  syncCollectionToAndroidWidget,
  getActiveCollectionId,
} from '../../services/collectionsService.js?v=385.0';

export function openCollectionListsBottomSheet({ word, allWords = [], onUpdated = () => {}, onClose = () => {} }) {
  if (!word) return;

  const existingSheet = document.querySelector('#collection-sheet-root');
  if (existingSheet) {
    if (typeof existingSheet._cleanup === 'function') {
      existingSheet._cleanup();
    } else {
      existingSheet.remove();
    }
  }

  const wordId = String(word.id);
  const wordText = word.word || '';
  const wordTrans = getWordTranslation(word);

  const sheetRoot = document.createElement('div');
  sheetRoot.id = 'collection-sheet-root';
  sheetRoot.className = 'collection-sheet-overlay';
  sheetRoot.setAttribute('role', 'dialog');
  sheetRoot.setAttribute('aria-modal', 'true');

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  sheetRoot.innerHTML = `
    <div class="collection-sheet-backdrop"></div>
    <div class="collection-sheet-container">
      <div class="collection-sheet-drag-handle"></div>

      <!-- Word Header -->
      <div class="collection-sheet-header">
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">❤️</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(wordText)}
            </h3>
          </div>
          <p style="margin: 3px 0 0; font-size: 13.5px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(wordTrans)}
          </p>
        </div>
        <button type="button" id="close-col-sheet-btn" class="collection-sheet-close" aria-label="${escapeHtml(t('widget_close') || 'Закрыть')}">
          ✕
        </button>
      </div>

      <div style="padding: 10px 18px 4px; font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
        ${escapeHtml(t('fav_hub_btn') || 'Списки')}
      </div>

      <!-- Collections List -->
      <div class="collection-sheet-list" id="collection-sheet-items">
      </div>

      <!-- Inline Add Collection Form -->
      <div class="collection-sheet-new-box" id="new-col-form" style="display: none; padding: 12px 18px; border-top: 1px solid var(--border-color); background: var(--card-bg);">
        <div style="display: flex; gap: 8px;">
          <input
            type="text"
            id="new-col-name-input"
            placeholder="${escapeHtml(t('col_create_placeholder') || 'Название списка (напр. «Урок 1»)...')}"
            maxlength="20"
            style="flex: 1; min-width: 0; padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--bg-color); color: var(--text-main); font-size: 14.5px; outline: none; box-sizing: border-box;"
          />
          <button type="button" id="btn-submit-new-col" class="primary-button btn-green" style="padding: 0 16px; min-height: 42px; font-size: 14px; font-weight: 700; border-radius: 12px; flex-shrink: 0;">
            ${escapeHtml(t('col_btn_add') || 'Создать')}
          </button>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="collection-sheet-footer">
        <button type="button" id="btn-toggle-new-col-form" class="primary-button btn-graphite" style="flex: 1; min-height: 44px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <span>➕</span>
          <span>${escapeHtml(t('col_add_new_list') || 'Создать список')}</span>
        </button>
        <button type="button" id="btn-done-col-sheet" class="primary-button btn-green" style="min-width: 110px; min-height: 44px; font-size: 14px; font-weight: 700; border-radius: 12px;">
          ${escapeHtml(t('col_btn_done') || 'Готово')}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(sheetRoot);

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    sheetRoot.classList.add('is-open');
  });

  const listContainer = sheetRoot.querySelector('#collection-sheet-items');
  const newColForm = sheetRoot.querySelector('#new-col-form');
  const newColInput = sheetRoot.querySelector('#new-col-name-input');
  const toggleFormBtn = sheetRoot.querySelector('#btn-toggle-new-col-form');

  function renderCollectionItems() {
    const isFav = getUserFavorites().map(String).includes(wordId);
    const customCols = getCustomCollections();

    let html = `
      <!-- My Favorites Option -->
      <label class="collection-sheet-item">
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
          <input
            type="checkbox"
            class="col-item-checkbox"
            data-type="favorite"
            ${isFav ? 'checked' : ''}
            style="width: 20px; height: 20px; accent-color: #22c55e; cursor: pointer; flex-shrink: 0;"
          />
          <span style="font-size: 18px; flex-shrink: 0;">⭐</span>
          <div style="min-width: 0;">
            <div style="font-weight: 600; font-size: 15px; color: var(--text-main);">${escapeHtml(t('fav_title') || 'Мои фавориты')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(t('col_fav_desc') || 'Основной список избранного')}</div>
          </div>
        </div>
      </label>
    `;

    if (customCols.length > 0) {
      customCols.forEach((col) => {
        const isInCol = Array.isArray(col.wordIds) && col.wordIds.map(String).includes(wordId);
        html += `
          <label class="collection-sheet-item">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <input
                type="checkbox"
                class="col-item-checkbox"
                data-type="custom"
                data-col-id="${escapeHtml(col.id)}"
                ${isInCol ? 'checked' : ''}
                style="width: 20px; height: 20px; accent-color: #22c55e; cursor: pointer; flex-shrink: 0;"
              />
              <span style="font-size: 18px; flex-shrink: 0;">${escapeHtml(col.icon || '📘')}</span>
              <div style="min-width: 0;">
                <div style="font-weight: 600; font-size: 15px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(col.name)}
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">${(col.wordIds || []).length} ${escapeHtml(t('words') || 'слов')}</div>
              </div>
            </div>
          </label>
        `;
      });
    }

    listContainer.innerHTML = html;
  }

  renderCollectionItems();

  // Checkbox change handler
  listContainer.addEventListener('change', async (e) => {
    const cb = e.target.closest('.col-item-checkbox');
    if (!cb) return;

    const type = cb.getAttribute('data-type');
    const checked = cb.checked;

    if (type === 'favorite') {
      await toggleFavoriteApi(word.id);
      window.dispatchEvent(new CustomEvent('myduo:favorite_toggled', { detail: { wordId: word.id } }));
      if (getActiveCollectionId() === 'my_favorites') {
        syncCollectionToAndroidWidget('my_favorites', allWords);
      }
    } else if (type === 'custom') {
      const colId = cb.getAttribute('data-col-id');
      if (checked) {
        addWordToCollection(colId, word.id);
      } else {
        removeWordFromCollection(colId, word.id);
      }
      if (getActiveCollectionId() === colId) {
        syncCollectionToAndroidWidget(colId, allWords);
      }
    }

    onUpdated();
    renderCollectionItems();
  });

  // Toggle create list form
  toggleFormBtn.addEventListener('click', () => {
    const isVisible = newColForm.style.display !== 'none';
    newColForm.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      newColInput.value = '';
      newColInput.focus();
    }
  });

  // Submit new list
  sheetRoot.querySelector('#btn-submit-new-col')?.addEventListener('click', () => {
    const name = Array.from((newColInput.value || '').trim()).slice(0, 20).join('');
    if (!name) return;

    const newCol = createCustomCollection(name, '📘');
    if (newCol) {
      addWordToCollection(newCol.id, word.id, allWords);
      newColForm.style.display = 'none';
      newColInput.value = '';
      renderCollectionItems();
      onUpdated();
    }
  });

  let isClosing = false;
  function closeSheet() {
    if (isClosing) return;
    isClosing = true;
    document.removeEventListener('keydown', handleKeyDown);
    sheetRoot.classList.remove('is-open');
    setTimeout(() => {
      sheetRoot.remove();
      onClose();
    }, 240);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSheet();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  sheetRoot._cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
    sheetRoot.remove();
  };

  sheetRoot.querySelector('#close-col-sheet-btn')?.addEventListener('click', closeSheet);
  sheetRoot.querySelector('#btn-done-col-sheet')?.addEventListener('click', closeSheet);
  sheetRoot.querySelector('.collection-sheet-backdrop')?.addEventListener('click', closeSheet);
}

export function attachHeartLongPress(btn, wordObj, allWords = [], onQuickToggle = () => {}) {
  if (!btn || !wordObj) return;

  let timer = null;
  let didLongPress = false;
  let startX = 0;
  let startY = 0;

  const startPress = (e) => {
    didLongPress = false;
    startX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    startY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    timer = setTimeout(() => {
      didLongPress = true;
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
      } catch (err) {}
      openCollectionListsBottomSheet({
        word: wordObj,
        allWords,
        onUpdated: () => {
          window.dispatchEvent(new CustomEvent('myduo_collections_updated'));
        },
      });
    }, 400);
  };

  const cancelPress = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const movePress = (e) => {
    if (!timer) return;
    const curX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const curY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    if (Math.hypot(curX - startX, curY - startY) > 12) {
      cancelPress();
    }
  };

  btn.addEventListener('pointerdown', startPress, { passive: true });
  btn.addEventListener('pointerup', cancelPress, { passive: true });
  btn.addEventListener('pointercancel', cancelPress, { passive: true });
  btn.addEventListener('pointerleave', cancelPress, { passive: true });
  btn.addEventListener('pointermove', movePress, { passive: true });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (didLongPress) {
      didLongPress = false;
      return;
    }
    onQuickToggle(e);
  });
}

