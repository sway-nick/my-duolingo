import { speakWord } from '../../services/audioService.js?v=7.0';
import { toggleFavoriteApi } from '../../services/api.js?v=7.0';

function renderDictionaryView(words = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { favoriteIds = [], onFavoriteToggle = () => {} } = options;
  const favSet = new Set(favoriteIds);

  container.innerHTML = `
    <div class="dictionary-page">
      <div class="page-header">
        <h2>📖 Словарь (${words.length} слов)</h2>
        <p class="subtitle">Изучайте новые слова, слушайте произношение и добавляйте в избранное</p>
      </div>

      <!-- Controls: Search & Category Filter -->
      <div class="dictionary-controls">
        <input type="text" id="dict-search" class="search-input" placeholder="🔍 Поиск слова или перевода..." />
        
        <select id="dict-category" class="filter-select">
          <option value="All">Все категории</option>
        </select>
      </div>

      <div class="dictionary-grid" id="dict-grid">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Populate categories
  const categorySelect = container.querySelector('#dict-category');
  const categories = Array.from(new Set(words.map((w) => w.category || 'Общие')));
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  const grid = container.querySelector('#dict-grid');
  const searchInput = container.querySelector('#dict-search');

  const renderList = () => {
    const query = searchInput.value.trim().toLowerCase();
    const cat = categorySelect.value;

    const filtered = words.filter((w) => {
      const matchQuery =
        !query ||
        w.word.toLowerCase().includes(query) ||
        w.translation.toLowerCase().includes(query);
      const matchCat = cat === 'All' || (w.category || 'Общие') === cat;
      return matchQuery && matchCat;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="empty-state">Слова не найдены.</p>';
      return;
    }

    grid.innerHTML = filtered
      .map((w) => {
        const isFav = favSet.has(w.id);
        return `
        <div class="dict-card" data-id="${w.id}">
          <div class="dict-card-header">
            <span class="category-badge">${w.category || 'Общие'} • ${w.level || 'A1'}</span>
            <button class="fav-icon-btn ${isFav ? 'active' : ''}" data-id="${w.id}">
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

    // Bind listeners
    grid.querySelectorAll('.sound-button-sm').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const word = e.target.getAttribute('data-word');
        const id = e.target.getAttribute('data-id');
        speakWord(word, id);
      });
    });

    grid.querySelectorAll('.fav-icon-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const isCurrentlyFav = favSet.has(id);
        const nextFav = !isCurrentlyFav;

        if (nextFav) favSet.add(id);
        else favSet.delete(id);

        btn.textContent = nextFav ? '❤️' : '🤍';
        btn.classList.toggle('active', nextFav);

        await toggleFavoriteApi(id, nextFav);
        onFavoriteToggle(id, nextFav);
      });
    });
  };

  searchInput.addEventListener('input', renderList);
  categorySelect.addEventListener('change', renderList);

  renderList();
}

export { renderDictionaryView };
