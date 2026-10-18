import {
  getAllCollectionsSummary,
  getCollectionWords,
  getCollectionTitle,
  getActiveCollectionId,
  setActiveCollectionId,
  syncCollectionToAndroidWidget,
  createCustomCollection,
  deleteCustomCollection,
  renameCustomCollection,
  BUILTIN_COLLECTIONS_WITH_GEAR,
  isBuiltinCollectionOverridden,
  resetBuiltinCollection,
} from '../../services/collectionsService.js?v=385.0';
import { openAddWordsToCollectionModal } from '../modals/AddWordsToCollectionModal.js?v=385.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=385.0';

export function renderCollectionsHubView(allWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onStartPractice = () => {},
    onOpenCardsView = () => {},
  } = options;

  const summary = getAllCollectionsSummary(allWords);
  const activeColId = getActiveCollectionId();

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const wordLabel = (count) => {
    const lang = (getInterfaceLanguage() || 'ru').toLowerCase();
    const abs = Math.abs(count);
    const mod10 = abs % 10;
    const mod100 = abs % 100;

    if (lang === 'ru') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} слов`;
      if (mod10 === 1) return `${count} слово`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
      return `${count} слов`;
    }
    if (lang === 'uk') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} слів`;
      if (mod10 === 1) return `${count} слово`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
      return `${count} слів`;
    }
    if (lang === 'pl') {
      if (count === 1) return `${count} słowo`;
      if (mod100 >= 12 && mod100 <= 14) return `${count} słów`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} słowa`;
      return `${count} słów`;
    }
    if (lang === 'cs') {
      if (count === 1) return `${count} slovo`;
      if (count >= 2 && count <= 4) return `${count} slova`;
      return `${count} slov`;
    }
    if (lang === 'sk') {
      if (count === 1) return `${count} slovo`;
      if (count >= 2 && count <= 4) return `${count} slová`;
      return `${count} slov`;
    }
    if (lang === 'sl') {
      if (mod100 === 1) return `${count} beseda`;
      if (mod100 === 2) return `${count} besedi`;
      if (mod100 === 3 || mod100 === 4) return `${count} besede`;
      return `${count} besed`;
    }
    if (lang === 'hr') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} riječi`;
      if (mod10 === 1) return `${count} riječ`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} riječi`;
      return `${count} riječi`;
    }
    if (lang === 'bg') {
      return count === 1 ? `${count} дума` : `${count} думи`;
    }
    if (lang === 'de') {
      return count === 1 ? `${count} Wort` : `${count} Wörter`;
    }
    if (lang === 'es' || lang === 'pt') {
      return count === 1 ? `${count} palabra` : `${count} palabras`;
    }
    if (lang === 'fr') {
      return count === 1 ? `${count} mot` : `${count} mots`;
    }
    if (lang === 'it') {
      return count === 1 ? `${count} parola` : `${count} parole`;
    }
    if (lang === 'tr') {
      return `${count} kelime`;
    }
    if (lang === 'ro') {
      return count === 1 ? `${count} cuvânt` : `${count} cuvinte`;
    }
    if (lang === 'hu') {
      return `${count} szó`;
    }
    if (lang === 'el') {
      return count === 1 ? `${count} λέξη` : `${count} λέξεις`;
    }
    if (lang === 'da' || lang === 'sv') {
      return `${count} ord`;
    }
    if (lang === 'ga') {
      return count === 1 ? `${count} focal` : `${count} focail`;
    }
    if (lang === 'lv') {
      return count === 1 ? `${count} vārds` : `${count} vārdi`;
    }
    if (lang === 'lt') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} žodžių`;
      if (mod10 === 1) return `${count} žodis`;
      return `${count} žodžiai`;
    }
    if (lang === 'mt') {
      return count === 1 ? `${count} kelma` : `${count} kelmiet`;
    }
    if (lang === 'fi') {
      return count === 1 ? `${count} sana` : `${count} sanaa`;
    }
    if (lang === 'et') {
      return count === 1 ? `${count} sõna` : `${count} sõna`;
    }
    if (lang === 'hi') {
      return `${count} शब्द`;
    }
    if (lang === 'ar') {
      if (count === 1) return `كلمة واحدة`;
      if (count === 2) return `كلمتان`;
      if (count >= 3 && count <= 10) return `${count} كلمات`;
      return `${count} كلمة`;
    }
    if (lang === 'id') {
      return `${count} kata`;
    }
    if (lang === 'vi') {
      return `${count} từ`;
    }
    if (lang === 'th') {
      return `${count} คำ`;
    }
    if (lang === 'ko') {
      return `${count}개 단어`;
    }
    if (lang === 'ja') {
      return `${count}単語`;
    }
    return count === 1 ? `${count} word` : `${count} words`;
  };

  container.innerHTML = `
    <div class="collections-hub-page">
      <!-- 2-Column Grid -->
      <div class="collections-grid" id="collections-grid">
        <!-- 1. My Favorites Tile -->
        <div class="col-tile ${activeColId === 'my_favorites' ? 'is-active-col' : ''}" data-col-id="my_favorites" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">⭐</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(summary.myFavorites.title)}</h3>
            <span class="col-tile-count">${wordLabel(summary.myFavorites.count)}</span>
          </div>
        </div>

        <!-- 2. Add New Custom List Tile -->
        <div class="col-tile col-tile-add" id="btn-add-new-collection" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon col-add-plus">➕</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(t('col_add_new_list') || 'Новый список')}</h3>
            <span class="col-tile-count">${escapeHtml(t('col_custom_desc') || 'Своя подборка')}</span>
          </div>
        </div>

        <!-- 3. User Custom Collections -->
        ${summary.customCollections
          .map(
            (col) => `
          <div class="col-tile col-tile-custom ${activeColId === col.id ? 'is-active-col' : ''}" data-col-id="${escapeHtml(col.id)}" role="button" tabindex="0">
            <div class="col-tile-icon-box">
              <span class="col-tile-icon">${escapeHtml(col.icon || '📘')}</span>
            </div>
            <div class="col-tile-content">
              <h3 class="col-tile-name">${escapeHtml(col.title)}</h3>
              <span class="col-tile-count">${wordLabel(col.count)}</span>
            </div>
          </div>
        `
          )
          .join('')}

        <!-- 4. Thematic Built-in Collections (2 per row) -->
        ${summary.builtinCollections
          .map(
            (col) => `
          <div class="col-tile ${activeColId === col.id ? 'is-active-col' : ''}" data-col-id="${escapeHtml(col.id)}" role="button" tabindex="0">
            <div class="col-tile-icon-box">
              <span class="col-tile-icon">${escapeHtml(col.icon)}</span>
            </div>
            <div class="col-tile-content">
              <h3 class="col-tile-name">${escapeHtml(col.title)}</h3>
              <span class="col-tile-count">${wordLabel(col.count)}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  // Long-press and click handling on grid tiles
  const gridEl = container.querySelector('#collections-grid');
  if (!gridEl) return;

  function findColData(colId) {
    if (colId === 'my_favorites') {
      return { col: summary.myFavorites, isCustom: false };
    }
    const custom = summary.customCollections.find((c) => c.id === colId);
    if (custom) return { col: custom, isCustom: true };
    const builtin = summary.builtinCollections.find((c) => c.id === colId);
    if (builtin) return { col: builtin, isCustom: false };
    return null;
  }

  let pressTimer = null;
  let startX = 0;
  let startY = 0;
  let activePointerId = null;
  let didLongPress = false;

  function cancelLongPress() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    activePointerId = null;
  }

  gridEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const tile = e.target.closest('.col-tile');
    if (!tile || tile.id === 'btn-add-new-collection') return;

    cancelLongPress();
    didLongPress = false;
    startX = e.clientX;
    startY = e.clientY;
    activePointerId = e.pointerId;

    const colId = tile.getAttribute('data-col-id');
    const colData = findColData(colId);
    if (!colData) return;

    pressTimer = setTimeout(() => {
      didLongPress = true;
      pressTimer = null;
      try {
        if (navigator.vibrate) navigator.vibrate(40);
      } catch (_) {}
      openCollectionActionsModal(colData.col, colData.isCustom);
    }, 500);
  });

  gridEl.addEventListener('pointermove', (e) => {
    if (!pressTimer || e.pointerId !== activePointerId) return;
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist > 10) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('pointerup', (e) => {
    if (e.pointerId === activePointerId) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('pointercancel', (e) => {
    if (e.pointerId === activePointerId) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('pointerleave', (e) => {
    if (e.pointerId === activePointerId) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('contextmenu', (e) => {
    const tile = e.target.closest('.col-tile');
    if (!tile) return;
    e.preventDefault();
    if (tile.id === 'btn-add-new-collection') return;
    if (didLongPress) return;
    const colId = tile.getAttribute('data-col-id');
    const colData = findColData(colId);
    if (colData) {
      openCollectionActionsModal(colData.col, colData.isCustom);
    }
  });

  gridEl.addEventListener('click', (e) => {
    const tile = e.target.closest('.col-tile');
    if (!tile) return;

    if (didLongPress) {
      e.stopPropagation();
      e.preventDefault();
      didLongPress = false;
      return;
    }

    if (tile.id === 'btn-add-new-collection') {
      openCreateCollectionPrompt();
      return;
    }

    const colId = tile.getAttribute('data-col-id');
    if (colId) {
      onOpenCardsView(colId);
    }
  });

  gridEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest('.col-tile');
      if (!tile) return;
      e.preventDefault();
      if (tile.id === 'btn-add-new-collection') {
        openCreateCollectionPrompt();
      } else {
        const colId = tile.getAttribute('data-col-id');
        if (colId) onOpenCardsView(colId);
      }
    }
  });

  // Dialog to create a new collection
  function openCreateCollectionPrompt() {
    const promptText = t('col_create_prompt') || 'Введите название нового списка (например «Урок 1»):';
    const name = window.prompt(promptText, '');
    if (!name || !name.trim()) return;

    const trimmedName = Array.from(name.trim()).slice(0, 20).join('');
    const newCol = createCustomCollection(trimmedName, '📘');
    if (newCol) {
      onOpenCardsView(newCol.id);
    }
  }

  // Manage actions modal for custom and built-in collections (33-locale support)
  function openCollectionActionsModal(col, isCustom = false) {
    const existingModal = document.querySelector('#col-actions-modal-overlay');
    if (existingModal) existingModal.remove();

    const isOverridden = !isCustom && isBuiltinCollectionOverridden(col.id);
    const titleTemplate = isCustom ? t('col_menu_title_list') : t('col_menu_title_collection');
    const titleText = (titleTemplate || (isCustom ? 'Список «{name}»' : 'Подборка «{name}»')).replace('{name}', col.title);
    const isWidgetActive = getActiveCollectionId() === col.id;

    const modalRoot = document.createElement('div');
    modalRoot.id = 'col-actions-modal-overlay';
    modalRoot.className = 'modal-overlay col-actions-modal-overlay';
    modalRoot.setAttribute('role', 'dialog');
    modalRoot.setAttribute('aria-modal', 'true');

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    modalRoot.innerHTML = `
      <div class="modal-content col-actions-modal-card">
        <div class="col-actions-modal-header">
          <h3 class="col-actions-modal-title">${escapeHtml(titleText)}</h3>
          <button type="button" class="col-actions-modal-close" id="col-actions-close-btn" aria-label="${escapeHtml(t('col_menu_cancel') || 'Отмена')}">✕</button>
        </div>
        <div class="col-actions-modal-body">
          <button type="button" class="col-action-item-btn" id="col-btn-view">
            <span class="col-action-item-icon">✏️</span>
            <span class="col-action-item-text">${escapeHtml(t('col_menu_edit') || 'Изменить')}</span>
          </button>
          ${
            isCustom
              ? `
          <button type="button" class="col-action-item-btn" id="col-btn-rename">
            <span class="col-action-item-icon">✏️</span>
            <span class="col-action-item-text">${escapeHtml(t('col_menu_rename') || 'Переименовать')}</span>
          </button>
          <button type="button" class="col-action-item-btn col-action-item-danger" id="col-btn-delete">
            <span class="col-action-item-icon">🗑️</span>
            <span class="col-action-item-text">${escapeHtml(t('col_menu_delete') || 'Удалить список')}</span>
          </button>
          `
              : ''
          }
          ${
            !isCustom && isOverridden
              ? `
          <button type="button" class="col-action-item-btn" id="col-btn-reset">
            <span class="col-action-item-icon">🔄</span>
            <span class="col-action-item-text">${escapeHtml(t('col_reset_to_default') || 'Сбросить к исходным')}</span>
          </button>
          `
              : ''
          }
        </div>
        <div class="col-actions-modal-footer">
          <button type="button" class="secondary-button" id="col-btn-cancel" style="width: 100%; padding: 12px 16px; font-size: 15px; border-radius: 12px;">
            ${escapeHtml(t('col_menu_cancel') || 'Отмена')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalRoot);
    requestAnimationFrame(() => modalRoot.classList.add('is-open'));

    function close() {
      modalRoot.classList.remove('is-open');
      setTimeout(() => modalRoot.remove(), 200);
    }

    modalRoot.querySelector('#col-actions-close-btn')?.addEventListener('click', close);
    modalRoot.querySelector('#col-btn-cancel')?.addEventListener('click', close);
    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot) close();
    });

    modalRoot.querySelector('#col-btn-view')?.addEventListener('click', () => {
      close();
      onOpenCardsView(col.id);
    });

    modalRoot.querySelector('#col-btn-set-widget')?.addEventListener('click', () => {
      close();
      setActiveCollectionId(col.id);
      syncCollectionToAndroidWidget(col.id, allWords);
      renderCollectionsHubView(allWords, containerSelector, options);
    });

    if (isCustom) {
      modalRoot.querySelector('#col-btn-rename')?.addEventListener('click', () => {
        close();
        const renamePromptText = t('col_menu_rename_prompt') || 'Новое название списка:';
        const newName = window.prompt(renamePromptText, col.title);
        if (newName && newName.trim()) {
          renameCustomCollection(col.id, newName.trim(), undefined, allWords);
          renderCollectionsHubView(allWords, containerSelector, options);
        }
      });

      modalRoot.querySelector('#col-btn-delete')?.addEventListener('click', () => {
        close();
        const deleteConfirmTemplate = t('col_menu_delete_confirm') || 'Удалить список «{name}»?';
        const deleteConfirmText = deleteConfirmTemplate.replace('{name}', col.title);
        if (window.confirm(deleteConfirmText)) {
          deleteCustomCollection(col.id, allWords);
          renderCollectionsHubView(allWords, containerSelector, options);
        }
      });
    } else if (isOverridden) {
      modalRoot.querySelector('#col-btn-reset')?.addEventListener('click', () => {
        close();
        resetBuiltinCollection(col.id);
        if (getActiveCollectionId() === col.id) {
          syncCollectionToAndroidWidget(col.id, allWords);
        }
        renderCollectionsHubView(allWords, containerSelector, options);
      });
    }
  }
}
