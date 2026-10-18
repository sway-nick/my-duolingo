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
} from '../../services/collectionsService.js?v=385.0';
import { openAddWordsToCollectionModal } from '../modals/AddWordsToCollectionModal.js?v=385.0';

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
      .replace(/"/g, '&quot;');

  const wordLabel = (count) => {
    const abs = Math.abs(count);
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (mod100 >= 11 && mod100 <= 19) return `${count} слов`;
    if (mod10 === 1) return `${count} слово`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
    return `${count} слов`;
  };

  container.innerHTML = `
    <div class="collections-hub-page">
      <!-- Hub Header -->
      <div class="collections-header">
        <div>
          <h2 class="collections-title">Коллекции и списки</h2>
          <p class="collections-subtitle">Тапните на плитку для тренировки и виджета на телефоне</p>
        </div>
      </div>

      <!-- 2-Column Grid -->
      <div class="collections-grid" id="collections-grid">
        <!-- 1. My Favorites Tile -->
        <div class="col-tile ${activeColId === 'my_favorites' ? 'is-active-col' : ''}" data-col-id="my_favorites">
          <div class="col-tile-top">
            <span class="col-tile-icon">⭐</span>
            <div class="col-tile-actions">
              ${activeColId === 'my_favorites' ? `<span class="col-active-pill" title="Сейчас в виджете">📱 Виджет</span>` : ''}
              <button type="button" class="col-view-cards-btn" data-col-id="my_favorites" title="Список карточек" aria-label="Список карточек">
                📋
              </button>
            </div>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(summary.myFavorites.title)}</h3>
            <span class="col-tile-count">${wordLabel(summary.myFavorites.count)}</span>
          </div>
        </div>

        <!-- 2. Add New Custom List Tile -->
        <div class="col-tile col-tile-add" id="btn-add-new-collection" role="button" tabindex="0">
          <div class="col-add-plus">➕</div>
          <h3 class="col-tile-name">Новый список</h3>
          <span class="col-tile-count">Своя подборка</span>
        </div>

        <!-- 3. User Custom Collections -->
        ${summary.customCollections
          .map(
            (col) => `
          <div class="col-tile col-tile-custom ${activeColId === col.id ? 'is-active-col' : ''}" data-col-id="${escapeHtml(col.id)}">
            <div class="col-tile-top">
              <span class="col-tile-icon">${escapeHtml(col.icon || '📘')}</span>
              <div class="col-tile-actions">
                ${activeColId === col.id ? `<span class="col-active-pill" title="Сейчас в виджете">📱 Виджет</span>` : ''}
                <button type="button" class="col-custom-menu-btn" data-col-id="${escapeHtml(col.id)}" data-col-name="${escapeHtml(col.title)}" title="Управление" aria-label="Управление">
                  ⚙️
                </button>
              </div>
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
          <div class="col-tile ${activeColId === col.id ? 'is-active-col' : ''}" data-col-id="${escapeHtml(col.id)}">
            <div class="col-tile-top">
              <span class="col-tile-icon">${escapeHtml(col.icon)}</span>
              <div class="col-tile-actions">
                ${activeColId === col.id ? `<span class="col-active-pill" title="Сейчас в виджете">📱 Виджет</span>` : ''}
                <button type="button" class="col-view-cards-btn" data-col-id="${escapeHtml(col.id)}" title="Список карточек" aria-label="Список карточек">
                  👁️
                </button>
              </div>
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

  // Helper to start practice for a collection
  function triggerStartCollection(collectionId) {
    const words = getCollectionWords(collectionId, allWords);
    const title = getCollectionTitle(collectionId);

    if (words.length === 0) {
      // If custom collection is empty, prompt to add words
      const customCol = summary.customCollections.find((c) => c.id === collectionId);
      if (customCol) {
        openAddWordsToCollectionModal({
          collection: customCol.raw,
          allWords,
          onSaved: () => renderCollectionsHubView(allWords, containerSelector, options),
        });
        return;
      }
      if (collectionId === 'my_favorites') {
        alert('В избранном пока нет слов. Добавляйте слова сердечком ❤️ во время уроков.');
        return;
      }
    }

    // Set active & sync to Android widget
    setActiveCollectionId(collectionId);
    syncCollectionToAndroidWidget(collectionId, allWords);

    // Call training callback
    onStartPractice(words, collectionId, title);
  }

  // Bind Grid Tiles Tap
  const gridEl = container.querySelector('#collections-grid');
  gridEl.addEventListener('click', (e) => {
    // If click on actions inside tile (view cards or settings), don't trigger tile click
    if (e.target.closest('.col-view-cards-btn') || e.target.closest('.col-custom-menu-btn')) {
      return;
    }

    const tile = e.target.closest('.col-tile');
    if (!tile) return;

    if (tile.id === 'btn-add-new-collection') {
      openCreateCollectionPrompt();
      return;
    }

    const colId = tile.getAttribute('data-col-id');
    if (colId) {
      triggerStartCollection(colId);
    }
  });

  // Bind View Cards Button (📋 or 👁️)
  gridEl.querySelectorAll('.col-view-cards-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId = btn.getAttribute('data-col-id');
      if (colId) {
        onOpenCardsView(colId);
      }
    });
  });

  // Bind Custom Collection Manage Button (⚙️)
  gridEl.querySelectorAll('.col-custom-menu-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId = btn.getAttribute('data-col-id');
      const colName = btn.getAttribute('data-col-name');
      const customCol = summary.customCollections.find((c) => c.id === colId);
      if (customCol) {
        openCustomCollectionMenu(customCol, e);
      }
    });
  });

  // Dialog to create a new collection
  function openCreateCollectionPrompt() {
    const name = window.prompt('Введите название нового списка (например «Урок 5»):', '');
    if (!name || !name.trim()) return;

    const newCol = createCustomCollection(name.trim(), '📘');
    if (newCol) {
      // Immediately offer to pick words from the dictionary
      openAddWordsToCollectionModal({
        collection: newCol,
        allWords,
        onSaved: () => renderCollectionsHubView(allWords, containerSelector, options),
        onClose: () => renderCollectionsHubView(allWords, containerSelector, options),
      });
    }
  }

  // Manage menu popup for custom collections
  function openCustomCollectionMenu(col) {
    const choice = window.prompt(
      `Список «${col.title}»:\n1. ➕ Добавить / изменить слова\n2. 👁️ Просмотреть слова\n3. ✏️ Переименовать\n4. 🗑️ Удалить список\n\nВведите номер действия (1-4):`,
      '1'
    );

    if (choice === '1') {
      openAddWordsToCollectionModal({
        collection: col.raw,
        allWords,
        onSaved: () => renderCollectionsHubView(allWords, containerSelector, options),
      });
    } else if (choice === '2') {
      onOpenCardsView(col.id);
    } else if (choice === '3') {
      const newName = window.prompt('Новое название списка:', col.title);
      if (newName && newName.trim()) {
        renameCustomCollection(col.id, newName.trim());
        renderCollectionsHubView(allWords, containerSelector, options);
      }
    } else if (choice === '4') {
      if (window.confirm(`Удалить список «${col.title}»?`)) {
        deleteCustomCollection(col.id);
        renderCollectionsHubView(allWords, containerSelector, options);
      }
    }
  }
}
