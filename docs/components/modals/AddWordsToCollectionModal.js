import { getWordTranslation } from '../../services/i18n.js?v=386.0';
import { setCollectionWords, getCustomCollections, saveCustomCollections, syncCollectionToAndroidWidget, getActiveCollectionId } from '../../services/collectionsService.js?v=386.0';

export function openAddWordsToCollectionModal({ collection, allWords = [], onSaved = () => {}, onClose = () => {} }) {
  if (!collection) return;

  if (window.trackScreen) {
    window.trackScreen('modal_add_words', 'AddWordsModal', { collection_id: collection.id });
  }

  const existingModal = document.querySelector('#add-words-modal-root');
  if (existingModal) existingModal.remove();

  const initialSet = new Set((collection.wordIds || []).map(String));
  const selectedSet = new Set((collection.wordIds || []).map(String));
  let searchQuery = '';

  const modalRoot = document.createElement('div');
  modalRoot.id = 'add-words-modal-root';
  modalRoot.className = 'modal-overlay add-words-modal-overlay';
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
    <div class="modal-content add-words-modal-card" style="max-width: 480px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; border-radius: 20px; box-shadow: 0 16px 40px rgba(0,0,0,0.3);">
      <!-- Modal Header -->
      <div style="padding: 16px 18px 12px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; background: var(--card-bg);">
        <div style="min-width: 0;">
          <h3 style="margin: 0; font-size: 17px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ➕ Добавить слова: ${escapeHtml(collection.name)}
          </h3>
          <p style="margin: 2px 0 0; font-size: 13px; color: var(--text-muted);" id="modal-selected-counter">
            В подборке: ${initialSet.size}
          </p>
        </div>
        <button type="button" id="close-add-words-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); padding: 4px 8px; line-height: 1;">
          ✕
        </button>
      </div>

      <!-- Search Input -->
      <div style="padding: 12px 18px 8px; background: var(--card-bg);">
        <div style="position: relative; width: 100%;">
          <input
            type="text"
            id="add-words-search-input"
            placeholder="Поиск по словарю..."
            style="width: 100%; padding: 10px 14px 10px 38px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--bg-color); color: var(--text-main); font-size: 15px; outline: none; box-sizing: border-box;"
          />
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.6; pointer-events: none;">🔍</span>
        </div>
      </div>

      <!-- Words List Container -->
      <div id="add-words-list" style="flex: 1; overflow-y: auto; padding: 6px 14px; min-height: 220px; max-height: 50vh;">
      </div>

      <!-- Footer Actions -->
      <div style="padding: 12px 18px 16px; border-top: 1px solid var(--border-color); background: var(--card-bg); display: flex; gap: 10px; justify-content: flex-end;">
        <button type="button" id="btn-cancel-add-words" class="primary-button btn-graphite" style="min-height: 42px; padding: 0 16px; font-size: 14px; border-radius: 12px;">
          Отмена
        </button>
        <button type="button" id="btn-save-add-words" class="primary-button btn-green" style="min-height: 42px; padding: 0 20px; font-size: 14px; font-weight: 700; border-radius: 12px;">
          Сохранить
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  const listEl = modalRoot.querySelector('#add-words-list');
  const searchInput = modalRoot.querySelector('#add-words-search-input');
  const counterEl = modalRoot.querySelector('#modal-selected-counter');
  const saveBtn = modalRoot.querySelector('#btn-save-add-words');

  function updateCounters() {
    const addedCount = Array.from(selectedSet).filter((id) => !initialSet.has(id)).length;
    const removedCount = Array.from(initialSet).filter((id) => !selectedSet.has(id)).length;

    if (counterEl) {
      if (addedCount > 0 && removedCount === 0) {
        counterEl.textContent = `В подборке: ${initialSet.size} • Новых: +${addedCount}`;
      } else if (removedCount > 0) {
        counterEl.textContent = `В подборке: ${selectedSet.size} (${addedCount > 0 ? `+${addedCount}, ` : ''}-${removedCount})`;
      } else {
        counterEl.textContent = `В подборке: ${initialSet.size}`;
      }
    }

    if (saveBtn) {
      if (addedCount > 0 && removedCount === 0) {
        saveBtn.textContent = `Добавить (+${addedCount})`;
      } else if (addedCount > 0 || removedCount > 0) {
        saveBtn.textContent = `Сохранить (${selectedSet.size})`;
      } else {
        saveBtn.textContent = `Сохранить`;
      }
    }
  }

  function renderList() {
    const q = searchQuery.toLowerCase().trim();
    let matches = allWords;
    if (q) {
      matches = allWords.filter((w) => {
        if (!w) return false;
        const wordText = String(w.word || '').toLowerCase();
        const transText = String(getWordTranslation(w) || '').toLowerCase();
        return wordText.includes(q) || transText.includes(q);
      });
    }

    // Sort: checked items first if searching, or limit to top 80 for high UI responsiveness
    const displayList = matches.slice(0, 80);

    if (displayList.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--text-muted); font-size: 14px;">
          Слова не найдены
        </div>
      `;
      return;
    }

    listEl.innerHTML = displayList
      .map((w) => {
        const idStr = String(w.id);
        const isChecked = selectedSet.has(idStr);
        const isInitiallyInCol = initialSet.has(idStr);
        const isNewlyAdded = isChecked && !isInitiallyInCol;
        const trans = getWordTranslation(w);
        return `
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 6px; border-radius: 10px; background: var(--bg-hover); cursor: pointer; user-select: none; transition: background 0.15s ease;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <input
                type="checkbox"
                class="add-word-checkbox"
                data-id="${idStr}"
                ${isChecked ? 'checked' : ''}
                style="width: 20px; height: 20px; accent-color: #22c55e; cursor: pointer; flex-shrink: 0;"
              />
              <div style="min-width: 0;">
                <div style="font-weight: 600; font-size: 15px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(w.word)}
                </div>
                <div style="font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(trans)}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; margin-left: 8px;">
              ${isNewlyAdded ? `<span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: rgba(34, 197, 94, 0.15); color: #16a34a; font-weight: 700;">+Новое</span>` : ''}
              ${isInitiallyInCol && isChecked ? `<span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: rgba(0,0,0,0.06); color: var(--text-muted); font-weight: 600;">В подборке</span>` : ''}
              ${w.category ? `<span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: rgba(0,0,0,0.06); color: var(--text-muted);">${escapeHtml(w.category)}</span>` : ''}
            </div>
          </label>
        `;
      })
      .join('');
  }

  updateCounters();

  renderList();

  // Search input handler
  let debounceTimer = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value;
      renderList();
    }, 120);
  });

  // Checkbox toggle handler
  listEl.addEventListener('change', (e) => {
    const cb = e.target.closest('.add-word-checkbox');
    if (cb) {
      const id = cb.getAttribute('data-id');
      if (cb.checked) {
        selectedSet.add(id);
      } else {
        selectedSet.delete(id);
      }
      updateCounters();
    }
  });

  function close() {
    modalRoot.remove();
    onClose();
  }

  modalRoot.querySelector('#close-add-words-modal')?.addEventListener('click', close);
  modalRoot.querySelector('#btn-cancel-add-words')?.addEventListener('click', close);

  modalRoot.addEventListener('click', (e) => {
    if (e.target === modalRoot) close();
  });

  // Save handler
  saveBtn.addEventListener('click', () => {
    const arr = Array.from(selectedSet);
    const addedCount = arr.filter((id) => !initialSet.has(id)).length;
    const removedCount = Array.from(initialSet).filter((id) => !selectedSet.has(id)).length;

    if (window.trackEvent) {
      window.trackEvent('collection_words_update', {
        collection_id: collection.id,
        total_words: arr.length,
        added_count: addedCount,
        removed_count: removedCount,
      });
    }

    setCollectionWords(collection.id, arr);
    if (getActiveCollectionId() === collection.id) {
      syncCollectionToAndroidWidget(collection.id, allWords);
    }
    onSaved(arr);
    close();
  });
}
