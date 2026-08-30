import { speakWord } from '../../services/audioService.js?v=21.0';
import { toggleFavoriteApi, getUserProgress, isWordMastered, addCustomWord } from '../../services/api.js?v=18.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=25.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return (
    String(cat)
      .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
      .trim() || String(cat).trim()
  );
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatWordCount(count) {
  const lang = getInterfaceLanguage();
  if (lang === 'ru' || lang === 'uk') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) return `${count} ${t('words')}`;
    if (mod10 === 1) return `${count} ${t('word_1')}`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} ${t('word_2')}`;
    return `${count} ${t('words')}`;
  }
  return `${count} ${t('words')}`;
}

const BATCH_SIZE = 35; // Render 35 cards at a time for instant 60fps performance

function renderWordCardHtml(w, isFav, prog) {
  const isMastered = isWordMastered(prog);
  const cleanCat = sanitizeCategory(w.category);
  const quizCount = prog?.quizCorrect || 0;
  const pairsCount = prog?.pairsCorrect || 0;
  const testCount = prog?.inputCorrect || 0;
  const seen = prog?.seenInCards;

  let stageBadge = '';
  if (isMastered) {
    stageBadge = `<span class="mastered-badge">🏆 ${t('dict_filter_mastered')}</span>`;
  } else if (pairsCount >= 2) {
    stageBadge = `<span class="stage-badge stage-test">✍️ Тест (${testCount}/2)</span>`;
  } else if (quizCount >= 5) {
    stageBadge = `<span class="stage-badge stage-pairs">🧩 Пары (${pairsCount}/2)</span>`;
  } else if (seen) {
    stageBadge = `<span class="stage-badge stage-quiz">🎯 Квиз (${quizCount}/5)</span>`;
  }

  return `
    <div class="dict-card ${isMastered ? 'mastered' : ''}" data-id="${w.id}">
      <div class="dict-card-header">
        <span class="dict-category-tag">${cleanCat}</span>
        ${stageBadge}
        <div class="dict-actions">
          <button type="button" class="dict-audio-btn sound-button-sm" data-word="${escapeHtml(w.word)}" data-id="${w.id}" title="${t('sound_on')}" aria-label="${t('sound_on')}">
            🔊
          </button>
          <button type="button" class="fav-icon-btn ${isFav ? 'active' : ''}" data-id="${w.id}" title="${t('fav_toggle')}" aria-label="${t('fav_toggle')}">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
      
      <div class="dict-card-body">
        <h3>${escapeHtml(w.word)}</h3>
        <p class="dict-translation">${escapeHtml(w.translation)}</p>
        ${w.notes ? `<p class="dict-notes">${escapeHtml(w.notes)}</p>` : ''}
      </div>
    </div>
  `;
}

function openAddWordModal(words = [], initialWord = '', onWordSaved = () => {}) {
  const modalEl = document.createElement('div');
  modalEl.className = 'speech-diag-overlay';
  modalEl.id = 'add-word-modal-overlay';

  const existingCats = Array.from(new Set(words.map((w) => sanitizeCategory(w.category)).filter(Boolean)));
  if (!existingCats.includes('Общие')) existingCats.unshift('Общие');

  const lang = getInterfaceLanguage();
  const titleText = lang === 'ru' ? '✨ Добавить слово в словарь' : lang === 'uk' ? '✨ Додати слово у словник' : '✨ Add word to dictionary';
  const wordLabel = lang === 'ru' ? 'Английское слово' : lang === 'uk' ? 'Англійське слово' : 'English word';
  const transLabel = lang === 'ru' ? 'Перевод' : lang === 'uk' ? 'Переклад' : 'Translation';
  const catLabel = lang === 'ru' ? 'Категория' : lang === 'uk' ? 'Категорія' : 'Category';
  const notesLabel = lang === 'ru' ? 'Заметка / Пример (необязательно)' : lang === 'uk' ? 'Примітка / Приклад (необовʼязково)' : 'Notes / Example (optional)';
  const saveBtnText = lang === 'ru' ? '💾 Сохранить (AI-проверка)' : lang === 'uk' ? '💾 Зберегти (AI-перевірка)' : '💾 Save (AI check)';
  const cancelBtnText = lang === 'ru' ? 'Отмена' : lang === 'uk' ? 'Скасувати' : 'Cancel';

  modalEl.innerHTML = `
    <div class="speech-diag-modal" style="max-width: 440px; text-align: left; padding: 22px;">
      <div class="speech-diag-header" style="justify-content: space-between; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main);">${titleText}</h3>
        <button type="button" id="add-word-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); padding: 0 4px;">✕</button>
      </div>

      <form id="add-word-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div id="add-word-notice" style="display: none; padding: 10px 12px; background: rgba(217, 119, 6, 0.12); border: 1px solid #d97706; border-radius: 8px; font-size: 13px; color: var(--text-main); line-height: 1.4;"></div>
        <div id="add-word-error" style="display: none; padding: 10px 12px; background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; font-size: 13px; color: #ef4444; font-weight: 500;"></div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-word-input">${wordLabel} *</label>
            <span id="add-word-len" style="color: var(--text-muted); font-size: 11px;">0/35</span>
          </div>
          <input type="text" id="add-word-input" class="search-input" maxlength="35" required value="${escapeHtml(initialWord)}" placeholder="e.g. blossom" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 15px;" />
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-trans-input">${transLabel} *</label>
            <span id="add-trans-len" style="color: var(--text-muted); font-size: 11px;">0/60</span>
          </div>
          <input type="text" id="add-trans-input" class="search-input" maxlength="60" required placeholder="например: цветение" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 15px;" />
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-cat-select">${catLabel}</label>
          </div>
          <select id="add-cat-select" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 9px 12px; font-size: 14px; background: var(--card-bg, #fff); color: var(--text-main);">
            ${existingCats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
            <label for="add-notes-input">${notesLabel}</label>
            <span id="add-notes-len" style="color: var(--text-muted); font-size: 11px;">0/120</span>
          </div>
          <textarea id="add-notes-input" maxlength="120" rows="2" placeholder="Пример: cherry blossoms bloom in spring" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-size: 14px; background: var(--card-bg, #fff); color: var(--text-main); font-family: inherit; resize: none;"></textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button type="button" id="add-word-cancel-btn" class="primary-button" style="flex: 1; min-height: 42px; background: rgba(0,0,0,0.06); color: var(--text-main);">
            ${cancelBtnText}
          </button>
          <button type="submit" id="add-word-submit-btn" class="primary-button btn-green" style="flex: 2; min-height: 42px;">
            ${saveBtnText}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalEl);

  const wordInput = modalEl.querySelector('#add-word-input');
  const transInput = modalEl.querySelector('#add-trans-input');
  const catSelect = modalEl.querySelector('#add-cat-select');
  const notesInput = modalEl.querySelector('#add-notes-input');
  const noticeBox = modalEl.querySelector('#add-word-notice');
  const errorBox = modalEl.querySelector('#add-word-error');
  const submitBtn = modalEl.querySelector('#add-word-submit-btn');
  const closeBtn = modalEl.querySelector('#add-word-close-btn');
  const cancelBtn = modalEl.querySelector('#add-word-cancel-btn');

  const wordLen = modalEl.querySelector('#add-word-len');
  const transLen = modalEl.querySelector('#add-trans-len');
  const notesLen = modalEl.querySelector('#add-notes-len');

  function updateCounters() {
    if (wordLen) wordLen.textContent = `${wordInput.value.length}/35`;
    if (transLen) transLen.textContent = `${transInput.value.length}/60`;
    if (notesLen) notesLen.textContent = `${notesInput.value.length}/120`;
  }

  function checkDuplicate() {
    const typed = wordInput.value.trim().toLowerCase();
    const existing = words.find((w) => w.word && w.word.trim().toLowerCase() === typed);
    if (existing) {
      noticeBox.style.display = 'block';
      noticeBox.innerHTML = `💡 Слово уже есть в словаре (перевод: <strong>«${escapeHtml(existing.translation)}»</strong>, категория: <strong>«${escapeHtml(existing.category)}»</strong>).<br>Вы можете дополнить или обновить примечание к нему.`;
      transInput.value = existing.translation || '';
      transInput.disabled = true;
      catSelect.value = existing.category || 'Общие';
      catSelect.disabled = true;
      submitBtn.textContent = '💾 Обновить заметку';
    } else {
      noticeBox.style.display = 'none';
      transInput.disabled = false;
      catSelect.disabled = false;
      submitBtn.textContent = saveBtnText;
    }
  }

  wordInput.addEventListener('input', () => {
    updateCounters();
    checkDuplicate();
  });
  transInput.addEventListener('input', updateCounters);
  notesInput.addEventListener('input', updateCounters);

  updateCounters();
  if (initialWord) {
    checkDuplicate();
  }

  function cleanup() {
    modalEl.remove();
  }

  closeBtn.addEventListener('click', cleanup);
  cancelBtn.addEventListener('click', cleanup);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) cleanup();
  });

  const form = modalEl.querySelector('#add-word-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const word = wordInput.value.trim();
    const translation = transInput.value.trim();
    const category = catSelect.value.trim();
    const notes = notesInput.value.trim();

    if (word.length < 2 || word.length > 35) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Длина английского слова должна быть от 2 до 35 символов.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '🤖 Проверяю через AI...';

    try {
      const res = await addCustomWord({ word, translation, category, notes });
      cleanup();
      onWordSaved(res.word);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = saveBtnText;
      errorBox.style.display = 'block';
      errorBox.textContent = err.message || 'Ошибка сохранения слова.';
    }
  });

  setTimeout(() => {
    if (initialWord) transInput.focus();
    else wordInput.focus();
  }, 100);
}

function renderDictionaryView(words = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { favoriteIds = [], onFavoriteToggle = () => {} } = options;
  const favSet = new Set(favoriteIds.map(String));
  const userProgress = getUserProgress();

  const savedDictCat = localStorage.getItem('myduo_dict_category') || 'Elementary';
  const uniqueCats = Array.from(new Set(words.map((w) => sanitizeCategory(w.category)).filter(Boolean)));
  const allCategories = ['All', ...uniqueCats];

  let currentCategory = savedDictCat;
  if (currentCategory !== 'All' && !uniqueCats.includes(currentCategory)) {
    currentCategory = uniqueCats.includes('Elementary') ? 'Elementary' : 'All';
  }

  function getCatDisplayName(cat) {
    return cat === 'All' ? t('dict_filter_all') : cat;
  }

  const lang = getInterfaceLanguage();
  const addWordBtnText = lang === 'ru' ? '➕ Добавить слово' : lang === 'uk' ? '➕ Додати слово' : '➕ Add word';

  container.innerHTML = `
    <div class="dictionary-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <h2 id="dict-header-title" style="margin: 0;">${t('dict_title')} (<span id="dict-word-count">${formatWordCount(words.length)}</span>)</h2>
        </div>
        <button type="button" class="primary-button btn-green" id="dict-open-add-btn" style="min-height: 38px; font-size: 13px; padding: 6px 14px; white-space: nowrap; border-radius: 8px;">
          ${addWordBtnText}
        </button>
      </div>

      <!-- Controls: Sticky Search & Category Filter -->
      <div class="dictionary-controls">
        <input type="text" id="dict-search" class="search-input" placeholder="🔍 ${t('dict_search')}" autocomplete="off" />
        
        <div class="custom-dropdown dict-dropdown" id="dict-cat-dropdown">
          <button type="button" class="custom-dropdown-trigger" id="dict-cat-trigger" aria-haspopup="listbox" aria-expanded="false">
            <span id="dict-cat-label">${getCatDisplayName(currentCategory)}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="custom-dropdown-menu dict-dropdown-menu" id="dict-cat-menu" role="listbox"></div>
        </div>
      </div>

      <div class="dictionary-grid" id="dict-grid">
        <!-- Rendered in ultra-fast batches -->
      </div>
      <div id="dict-scroll-sentinel" style="height: 40px; text-align: center; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 13px;"></div>
    </div>
  `;

  const headerEl = document.querySelector('.mobile-header');
  const dictControls = container.querySelector('.dictionary-controls');
  const updateDictStickyTop = () => {
    if (dictControls) {
      const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 58;
      dictControls.style.setProperty('--dict-sticky-top', `${Math.round(headerBottom)}px`);
    }
  };
  updateDictStickyTop();
  window.addEventListener('resize', updateDictStickyTop, { passive: true });

  const dictDropdown = container.querySelector('#dict-cat-dropdown');
  const dictTrigger = container.querySelector('#dict-cat-trigger');
  const dictLabel = container.querySelector('#dict-cat-label');
  const dictMenu = container.querySelector('#dict-cat-menu');
  const openAddBtn = container.querySelector('#dict-open-add-btn');

  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      openAddWordModal(words, '', (savedWord) => {
        if (!words.some((w) => String(w.id) === String(savedWord.id))) {
          words.unshift(savedWord);
        }
        filterAndResetList();
      });
    });
  }

  function renderCategoryOptions() {
    if (!dictMenu) return;
    dictMenu.innerHTML = allCategories
      .map(
        (cat) => `
        <div class="custom-dropdown-item ${cat === currentCategory ? 'selected' : ''}" data-value="${cat}" role="option" aria-selected="${cat === currentCategory}">
          ${getCatDisplayName(cat)}
        </div>
      `
      )
      .join('');
  }

  renderCategoryOptions();

  function toggleDropdown(show) {
    if (!dictDropdown || !dictTrigger || !dictMenu) return;
    const isExpanded = show !== undefined ? show : !dictDropdown.classList.contains('open');
    dictDropdown.classList.toggle('open', isExpanded);
    dictTrigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }

  if (dictTrigger) {
    dictTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  if (dictMenu) {
    dictMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.custom-dropdown-item');
      if (!item) return;
      currentCategory = item.getAttribute('data-value') || 'All';
      localStorage.setItem('myduo_dict_category', currentCategory);
      if (dictLabel) dictLabel.textContent = getCatDisplayName(currentCategory);
      renderCategoryOptions();
      toggleDropdown(false);
      filterAndResetList();
    });
  }

  const closeDropdownOutside = (e) => {
    if (dictDropdown && !dictDropdown.contains(e.target)) {
      toggleDropdown(false);
    }
  };
  document.addEventListener('click', closeDropdownOutside);

  const searchInput = container.querySelector('#dict-search');
  const grid = container.querySelector('#dict-grid');
  const wordCountEl = container.querySelector('#dict-word-count');
  const sentinel = container.querySelector('#dict-scroll-sentinel');

  let filteredWords = [];
  let renderedCount = 0;
  let observer = null;

  function renderBatch() {
    const nextBatch = filteredWords.slice(renderedCount, renderedCount + BATCH_SIZE);
    if (nextBatch.length === 0) return;

    const fragmentHtml = nextBatch
      .map((w) => {
        const isFav = favSet.has(String(w.id));
        const prog = userProgress[w.id] || userProgress[String(w.id)];
        return renderWordCardHtml(w, isFav, prog);
      })
      .join('');

    grid.insertAdjacentHTML('beforeend', fragmentHtml);
    renderedCount += nextBatch.length;

    if (renderedCount < filteredWords.length) {
      if (sentinel) {
        sentinel.style.display = 'block';
        sentinel.textContent = 'Загрузка слов...';
      }
    } else {
      if (sentinel) sentinel.style.display = 'none';
    }
  }

  function setupInfiniteScroll() {
    if (observer) observer.disconnect();
    if (!sentinel) return;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && renderedCount < filteredWords.length) {
              renderBatch();
            }
          });
        },
        { root: null, rootMargin: '300px', threshold: 0.05 }
      );
      observer.observe(sentinel);
    }
  }

  const filterAndResetList = () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCat = currentCategory;

    filteredWords = words.filter((w) => {
      const catClean = sanitizeCategory(w.category);
      const matchQuery =
        !query ||
        (w.word && w.word.toLowerCase().includes(query)) ||
        (w.translation && w.translation.toLowerCase().includes(query));
      const matchCat = selectedCat === 'All' || catClean === selectedCat;
      return matchQuery && matchCat;
    });

    if (wordCountEl) {
      wordCountEl.textContent = formatWordCount(filteredWords.length);
    }

    grid.innerHTML = '';
    renderedCount = 0;

    if (filteredWords.length === 0) {
      const emptyText = getInterfaceLanguage() === 'ru' ? 'Слова не найдены.' : getInterfaceLanguage() === 'uk' ? 'Слова не знайдені.' : 'No words found.';
      const quickAddText = getInterfaceLanguage() === 'ru' ? `➕ Добавить «${escapeHtml(query)}» в словарь` : getInterfaceLanguage() === 'uk' ? `➕ Додати «${escapeHtml(query)}» у словник` : `➕ Add "${escapeHtml(query)}" to dictionary`;

      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 16px;">
          <p style="margin-bottom: 16px; font-size: 15px; color: var(--text-muted);">${emptyText}</p>
          ${query ? `
            <button type="button" class="primary-button btn-green" id="dict-quick-add-btn" style="max-width: 300px; margin: 0 auto;">
              ${quickAddText}
            </button>
          ` : ''}
        </div>
      `;

      const quickAddBtn = grid.querySelector('#dict-quick-add-btn');
      if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
          openAddWordModal(words, query, (savedWord) => {
            if (!words.some((w) => String(w.id) === String(savedWord.id))) {
              words.unshift(savedWord);
            }
            searchInput.value = '';
            filterAndResetList();
          });
        });
      }

      if (sentinel) sentinel.style.display = 'none';
      return;
    }

    renderBatch();
    setupInfiniteScroll();
  };

  grid.addEventListener('click', async (e) => {
    const soundBtn = e.target.closest('.dict-audio-btn');
    if (soundBtn) {
      e.stopPropagation();
      const word = soundBtn.getAttribute('data-word');
      const id = soundBtn.getAttribute('data-id');
      speakWord(word, id);
      return;
    }

    const favBtn = e.target.closest('.fav-icon-btn');
    if (favBtn) {
      e.stopPropagation();
      const id = favBtn.getAttribute('data-id');
      const isCurrentlyFav = favSet.has(String(id));
      const nextFav = !isCurrentlyFav;

      if (nextFav) favSet.add(String(id));
      else favSet.delete(String(id));

      favBtn.textContent = nextFav ? '❤️' : '🤍';
      favBtn.classList.toggle('active', nextFav);

      await toggleFavoriteApi(id, nextFav);
      onFavoriteToggle(id, nextFav);
    }
  });

  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterAndResetList, 120);
  });

  filterAndResetList();
}

export { renderDictionaryView, openAddWordModal };
