import { speakWord } from '../../services/audioService.js?v=21.0';
import { toggleFavoriteApi, getUserProgress, isWordMastered } from '../../services/api.js?v=18.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return (
    String(cat)
      .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
      .trim() || String(cat).trim()
  );
}

function formatWordCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${count} слов`;
  if (mod10 === 1) return `${count} слово`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
  return `${count} слов`;
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
    stageBadge = `<span class="mastered-badge">🏆 Выучено</span>`;
  } else if (pairsCount >= 5) {
    stageBadge = `<span class="in-progress-badge" style="background:#e0e7ff; color:#3730a3; border: 1px solid #818cf8;">✍️ Тест: ${testCount}/3</span>`;
  } else if (quizCount >= 5) {
    stageBadge = `<span class="in-progress-badge" style="background:#f3e8ff; color:#6b21a8; border: 1px solid #c084fc;">🧩 Пары: ${pairsCount}/5</span>`;
  } else if (seen) {
    stageBadge = `<span class="in-progress-badge" style="background:#fef3c7; color:#92400e; border: 1px solid #f59e0b;">🎯 Квиз: ${quizCount}/5</span>`;
  }

  return `
    <div class="dict-card ${isMastered ? 'mastered' : ''}" data-id="${w.id}">
      <div class="dict-card-header">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span class="category-badge">${cleanCat}</span>
          ${stageBadge}
        </div>
        <button class="fav-icon-btn ${isFav ? 'active' : ''}" data-id="${w.id}" title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div class="dict-card-body">
        <h3>${w.word}</h3>
        <p class="dict-transcription">${w.transcription || ''}</p>
        <p class="dict-translation">${w.translation}</p>
      </div>

      <button class="sound-button-sm" data-word="${w.word}" data-id="${w.id}">🔊 Произношение</button>
    </div>
  `;
}

function renderDictionaryView(words = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { favoriteIds = [], onFavoriteToggle = () => {} } = options;
  const favSet = new Set(favoriteIds.map(String));
  const userProgress = getUserProgress();

  // Load saved dictionary category filter from localStorage, defaulting to 'Elementary'
  const savedDictCat = localStorage.getItem('myduo_dict_category') || 'Elementary';
  const uniqueCats = Array.from(new Set(words.map((w) => sanitizeCategory(w.category)).filter(Boolean)));
  const allCategories = ['All', ...uniqueCats];

  let currentCategory = savedDictCat;
  if (currentCategory !== 'All' && !uniqueCats.includes(currentCategory)) {
    currentCategory = uniqueCats.includes('Elementary') ? 'Elementary' : 'All';
  }

  function getCatDisplayName(cat) {
    return cat === 'All' ? 'Все категории' : cat;
  }

  container.innerHTML = `
    <div class="dictionary-page">
      <div class="page-header">
        <h2 id="dict-header-title">📖 Словарь (<span id="dict-word-count">${formatWordCount(words.length)}</span>)</h2>
        <p class="subtitle">Изучайте слова, слушайте произношение и отслеживайте выученные</p>
      </div>

      <!-- Controls: Search & Category Filter -->
      <div class="dictionary-controls">
        <input type="text" id="dict-search" class="search-input" placeholder="🔍 Поиск слова" autocomplete="off" />
        
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

  const dictDropdown = container.querySelector('#dict-cat-dropdown');
  const dictTrigger = container.querySelector('#dict-cat-trigger');
  const dictLabel = container.querySelector('#dict-cat-label');
  const dictMenu = container.querySelector('#dict-cat-menu');

  function renderCategoryOptions() {
    if (!dictMenu) return;
    dictMenu.innerHTML = allCategories
      .map(
        (cat) => `
      <div class="dropdown-item ${cat === currentCategory ? 'selected' : ''}" data-value="${cat}">
        ${getCatDisplayName(cat)}
      </div>
    `
      )
      .join('');

    if (dictLabel) dictLabel.textContent = getCatDisplayName(currentCategory);

    dictMenu.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCategory = item.dataset.value;
        localStorage.setItem('myduo_dict_category', currentCategory);
        renderCategoryOptions();
        dictDropdown.classList.remove('open');
        filterAndResetList();
      });
    });
  }

  renderCategoryOptions();

  if (dictTrigger && dictDropdown) {
    dictTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dictDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      dictDropdown.classList.remove('open');
    });
  }

  const grid = container.querySelector('#dict-grid');
  const searchInput = container.querySelector('#dict-search');
  const wordCountEl = container.querySelector('#dict-word-count');
  const sentinel = container.querySelector('#dict-scroll-sentinel');

  let filteredWords = [];
  let renderedCount = 0;
  let observer = null;

  function renderBatch() {
    if (renderedCount >= filteredWords.length) {
      if (sentinel) sentinel.style.display = 'none';
      return;
    }

    const nextBatch = filteredWords.slice(renderedCount, renderedCount + BATCH_SIZE);
    const fragmentHtml = nextBatch
      .map((w) => {
        const isFav = favSet.has(String(w.id));
        const prog =
          userProgress[w.id] ||
          userProgress[String(w.id)] ||
          (userProgress && typeof userProgress === 'object' ? userProgress[w.id] : null);
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
    if (observer) {
      observer.disconnect();
    }

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
    } else {
      window.addEventListener('scroll', () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.body.offsetHeight;
        if (
          bodyHeight - scrollPosition < 400 &&
          renderedCount < filteredWords.length
        ) {
          renderBatch();
        }
      });
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
      grid.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">Слова не найдены.</p>';
      if (sentinel) sentinel.style.display = 'none';
      return;
    }

    // Render initial fast batch (instant page load)
    renderBatch();
    setupInfiniteScroll();
  };

  // High-performance Event Delegation on grid (zero individual listeners)
  grid.addEventListener('click', async (e) => {
    // 1. Audio button click
    const soundBtn = e.target.closest('.sound-button-sm');
    if (soundBtn) {
      e.stopPropagation();
      const word = soundBtn.getAttribute('data-word');
      const id = soundBtn.getAttribute('data-id');
      speakWord(word, id);
      return;
    }

    // 2. Favorite button click
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

  // Debounced search input
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterAndResetList, 120);
  });

  // Initial fast render
  filterAndResetList();
}

export { renderDictionaryView };
