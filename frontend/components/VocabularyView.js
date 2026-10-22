import { WORDS, CATEGORIES } from '../services/initialData.js?v=386.0';
import { StorageService } from '../services/storageService.js?v=386.0';
import { AudioService } from '../services/audioService.js?v=386.0';

export function renderVocabulary(container, favoritesOnly = false) {
    if (!container) return;
    
    let html = `
        <div class="vocabulary-container">
            <div class="vocab-header">
                <h2>${favoritesOnly ? 'Избранное' : 'Словарь'}</h2>
                <div class="vocab-search-container">
                    <input type="text" class="vocab-search" placeholder="Поиск слов..." />
                </div>
            </div>
            
            <div class="vocab-filters">
                <button class="filter-chip active" data-category="all">Все</button>
                ${CATEGORIES.map(c => `<button class="filter-chip" data-category="${c.id}">${c.name}</button>`).join('')}
            </div>
            
            <div class="vocab-level-filters">
                <button class="level-pill active" data-level="all">Все уровни</button>
                <button class="level-pill" data-level="A1">A1</button>
                <button class="level-pill" data-level="A2">A2</button>
                <button class="level-pill" data-level="B1">B1</button>
                <button class="level-pill" data-level="B2">B2</button>
            </div>
            
            <div class="vocab-sort">
                <span>Сортировка: </span>
                <select id="vocab-sort-select">
                    <option value="alpha">По алфавиту</option>
                    <option value="level">По уровню</option>
                    <option value="progress">По прогрессу</option>
                </select>
            </div>
            
            <div class="vocab-count">Найдено: <span id="vocab-count-num">0</span> слов</div>
            
            <div class="vocab-list"></div>
            <div class="vocab-scroll-sentinel" style="height: 32px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
    
    const searchInput = container.querySelector('.vocab-search');
    const categoryChips = container.querySelectorAll('.filter-chip');
    const levelPills = container.querySelectorAll('.level-pill');
    const sortSelect = container.querySelector('#vocab-sort-select');
    const vocabList = container.querySelector('.vocab-list');
    const sentinel = container.querySelector('.vocab-scroll-sentinel');
    const countNum = container.querySelector('#vocab-count-num');
    
    let currentCategory = 'all';
    let currentLevel = 'all';
    let currentSort = 'alpha';
    let currentSearch = '';
    let filtered = [];
    let renderedCount = 0;
    let observer = null;
    const VOCAB_BATCH_SIZE = 50;

    const renderVocabItemHtml = (word) => {
        const isFav = StorageService.isFavorite(word.id);
        const progress = StorageService.getWordProgress(word.id) || 0;
        return `
            <div class="vocab-item">
                <div class="vocab-item-main">
                    <div class="vocab-word">
                        <strong>${word.english}</strong>
                        <span class="vocab-transcription">${word.transcription || ''}</span>
                    </div>
                    <div class="vocab-translation">${word.russian}</div>
                    <div class="vocab-meta">
                        <span class="level-badge level-${word.level}">${word.level}</span>
                        <div class="srs-progress" title="Прогресс: ${progress}">
                            ${'<div class="srs-dot active"></div>'.repeat(Math.min(5, progress))}
                            ${'<div class="srs-dot"></div>'.repeat(Math.max(0, 5 - progress))}
                        </div>
                    </div>
                </div>
                <div class="vocab-item-actions">
                    <button class="vocab-audio-btn" data-word="${word.english}">🔊</button>
                    <button class="vocab-fav-btn ${isFav ? 'active' : ''}" data-id="${word.id}">
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        `;
    };

    const appendNextBatch = () => {
        const slice = filtered.slice(renderedCount, renderedCount + VOCAB_BATCH_SIZE);
        if (slice.length === 0) return;
        vocabList.insertAdjacentHTML('beforeend', slice.map(renderVocabItemHtml).join(''));
        renderedCount += slice.length;
        if (sentinel) {
            sentinel.style.display = renderedCount < filtered.length ? 'block' : 'none';
        }
    };

    const setupObserver = () => {
        if (observer) observer.disconnect();
        if (!sentinel || typeof IntersectionObserver === 'undefined') return;
        observer = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting) && renderedCount < filtered.length) {
                appendNextBatch();
            }
        }, { rootMargin: '250px' });
        observer.observe(sentinel);
    };
    
    const updateList = () => {
        const query = currentSearch ? currentSearch.trim().toLowerCase() : '';
        filtered = WORDS.filter(w => {
            if (favoritesOnly && !StorageService.isFavorite(w.id)) return false;
            if (currentCategory !== 'all' && w.categoryId !== currentCategory) return false;
            if (currentLevel !== 'all' && w.level !== currentLevel) return false;
            if (query && !w.english.toLowerCase().includes(query) && !w.russian.toLowerCase().includes(query)) return false;
            return true;
        });
        
        if (currentSort === 'alpha') {
            filtered.sort((a, b) => a.english.localeCompare(b.english));
        } else if (currentSort === 'level') {
            filtered.sort((a, b) => a.level.localeCompare(b.level));
        } else if (currentSort === 'progress') {
            filtered.sort((a, b) => {
                const pA = StorageService.getWordProgress(a.id) || 0;
                const pB = StorageService.getWordProgress(b.id) || 0;
                return pB - pA;
            });
        }
        
        countNum.textContent = filtered.length;
        vocabList.innerHTML = '';
        renderedCount = 0;
        
        if (filtered.length === 0) {
            vocabList.innerHTML = '<div class="empty-state">Слова не найдены</div>';
            if (sentinel) sentinel.style.display = 'none';
            return;
        }
        
        appendNextBatch();
        setupObserver();
    };
    
    let searchDebounceTimer = null;
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(updateList, 120);
    });
    
    categoryChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            categoryChips.forEach(c => c.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentCategory = target.dataset.category;
            updateList();
        });
    });
    
    levelPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            levelPills.forEach(p => p.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentLevel = target.dataset.level;
            updateList();
        });
    });
    
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateList();
    });
    
    vocabList.addEventListener('click', (e) => {
        const audioBtn = e.target.closest('.vocab-audio-btn');
        if (audioBtn) {
            AudioService.speak(audioBtn.dataset.word);
            return;
        }
        
        const favBtn = e.target.closest('.vocab-fav-btn');
        if (favBtn) {
            const wordId = favBtn.dataset.id;
            StorageService.toggleFavorite(wordId);
            favBtn.classList.toggle('active');
            favBtn.textContent = favBtn.classList.contains('active') ? '♥' : '♡';
        }
    });
    
    updateList();
}
