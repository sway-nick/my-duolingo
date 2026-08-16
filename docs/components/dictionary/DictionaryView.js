import { speakWord } from '../../services/audioService.js?v=10.0';
import { toggleFavoriteApi, getUserProgress, isWordMastered } from '../../services/api.js?v=10.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return String(cat)
    .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
    .trim() || String(cat).trim();
}

function formatWordCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${count} слов`;
  if (mod10 === 1) return `${count} слово`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
  return `${count} слов`;
}

function renderDictionaryView(words = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { favoriteIds = [], onFavoriteToggle = () => {} } = options;
  const favSet = new Set(favoriteIds.map(String));
  const userProgress = getUserProgress();

  // Load saved dictionary category filter from localStorage
  const savedDictCat = localStorage.getItem('myduo_dict_category') || 'All';

  container.innerHTML = `
    <div class="dictionary-page">
      <div class="page-header">
        <h2 id="dict-header-title">📖 Словарь (<span id="dict-word-count">${formatWordCount(words.length)}</span>)</h2>
        <p class="subtitle">Изучайте слова, слушайте произношение и отслеживайте выученные</p>
      </div>

      <!-- Controls: Search & Category Filter -->
      <div class="dictionary-controls">
        <input type="text" id="dict-search" class="search-input" placeholder="🔍 Поиск слова" />
        
        <select id="dict-category" class="filter-select">
          <option value="All">Все категории</option>
        </select>
      </div>

      <div class="dictionary-grid" id="dict-grid">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Populate categories without numbers in parentheses
  const categorySelect = container.querySelector('#dict-category');
  const uniqueCats = Array.from(
    new Set(words.map((w) => sanitizeCategory(w.category)).filter(Boolean))
  );
  uniqueCats.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === savedDictCat) {
      opt.selected = true;
    }
    categorySelect.appendChild(opt);
  });

  if (savedDictCat === 'All') {
    categorySelect.value = 'All';
  } else if (uniqueCats.includes(savedDictCat)) {
    categorySelect.value = savedDictCat;
  }

  const grid = container.querySelector('#dict-grid');
  const searchInput = container.querySelector('#dict-search');
  const wordCountEl = container.querySelector('#dict-word-count');

  const renderList = () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCat = categorySelect.value;

    const filtered = words.filter((w) => {
      const catClean = sanitizeCategory(w.category);
      const matchQuery =
        !query ||
        w.word.toLowerCase().includes(query) ||
        w.translation.toLowerCase().includes(query);
      const matchCat = selectedCat === 'All' || catClean === selectedCat;
      return matchQuery && matchCat;
    });

    // Update dynamically to show count of words in selected category/filter
    if (wordCountEl) {
      wordCountEl.textContent = formatWordCount(filtered.length);
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="empty-state">Слова не найдены.</p>';
      return;
    }

    grid.innerHTML = filtered
      .map((w) => {
        const isFav = favSet.has(String(w.id));
        const prog =
          userProgress[w.id] ||
          userProgress[String(w.id)] ||
          (w.word ? userProgress[w.word.toLowerCase().trim()] : null);

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
      })
      .join('');

    // Bind audio listeners
    grid.querySelectorAll('.sound-button-sm').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const word = e.target.getAttribute('data-word');
        const id = e.target.getAttribute('data-id');
        speakWord(word, id);
      });
    });

    // Bind favorite listeners
    grid.querySelectorAll('.fav-icon-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const isCurrentlyFav = favSet.has(String(id));
        const nextFav = !isCurrentlyFav;

        if (nextFav) favSet.add(String(id));
        else favSet.delete(String(id));

        btn.textContent = nextFav ? '❤️' : '🤍';
        btn.classList.toggle('active', nextFav);

        await toggleFavoriteApi(id, nextFav);
        onFavoriteToggle(id, nextFav);
      });
    });
  };

  searchInput.addEventListener('input', renderList);
  categorySelect.addEventListener('change', () => {
    // Remember chosen category persistently
    localStorage.setItem('myduo_dict_category', categorySelect.value);
    renderList();
  });

  renderList();
}

export { renderDictionaryView, sanitizeCategory };
