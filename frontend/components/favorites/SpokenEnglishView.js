import { SPOKEN_ENGLISH_ITEMS, getLocalizedSpokenItem } from './spokenEnglishData.js?v=423.0';
import { getSpokenEnglishStrings } from './spokenEnglishI18n.js?v=423.0';
import { getInterfaceLanguage, t } from '../../services/i18n.js?v=423.0';
import { speakWord } from '../../services/audioService.js?v=423.0';
import { AdService } from '../../services/adService.js?v=423.0';
import { isProActive } from '../../services/proState.js?v=423.0';
import { ProService } from '../../services/proService.js?v=423.0';
import { getProStrings } from '../../services/proI18n.js?v=423.0';
import { getMicroRulesStrings } from './grammarUiTranslations.js?v=423.0';
import { pushNavReturn } from '../../services/navigationStack.js?v=423.0';

const PAGE_SIZE = 10;
const STORAGE_KEY_SPOKEN_AD_UNLOCKED = 'myduo_spoken_ad_unlocked';
const STORAGE_KEY_SPOKEN_UNLOCKED_COUNT = 'myduo_spoken_unlocked_count';
const STORAGE_KEY_SPOKEN_PAGE_PREFIX = 'myduo_spoken_page_';
const STORAGE_KEY_SPOKEN_CAT = 'myduo_spoken_cat';
const STORAGE_KEY_SPOKEN_PRACTICED = 'myduo_spoken_practiced';

function recordSpokenPracticedIds(ids = []) {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY_SPOKEN_PRACTICED);
    const existing = raw ? JSON.parse(raw) : [];
    const merged = new Set(Array.isArray(existing) ? existing : []);
    for (const id of ids) {
      if (id !== undefined && id !== null) merged.add(id);
    }
    localStorage.setItem(STORAGE_KEY_SPOKEN_PRACTICED, JSON.stringify([...merged]));
  } catch (_) {}
}

export function loadSavedSpokenPage(cat = 'all') {
  try {
    if (typeof localStorage === 'undefined') return 1;
    const raw = localStorage.getItem(STORAGE_KEY_SPOKEN_PAGE_PREFIX + cat);
    const val = parseInt(raw, 10);
    if (Number.isFinite(val) && val >= 1) return val;
  } catch (_) {}
  return 1;
}

export function saveSavedSpokenPage(cat = 'all', page = 1) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_SPOKEN_PAGE_PREFIX + cat, String(page));
  } catch (_) {}
}

export function loadSavedSpokenCategory() {
  try {
    if (typeof localStorage === 'undefined') return 'reductions';
    const val = localStorage.getItem(STORAGE_KEY_SPOKEN_CAT);
    if (['reductions', 'drops', 'texting', 'phrases'].includes(val)) return val;
  } catch (_) {}
  return 'reductions';
}

export function saveSavedSpokenCategory(cat) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_SPOKEN_CAT, cat);
  } catch (_) {}
}

export function getSpokenUnlockedLimit() {
  const total = SPOKEN_ENGLISH_ITEMS.length;
  if (isProActive()) return total;
  let count = 10;
  try {
    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem(STORAGE_KEY_SPOKEN_AD_UNLOCKED) === 'true') {
        count = Math.max(count, 20);
      }
      const saved = parseInt(localStorage.getItem(STORAGE_KEY_SPOKEN_UNLOCKED_COUNT) || '0', 10);
      if (Number.isFinite(saved) && saved > count) {
        count = saved;
      }
    }
  } catch (e) {}
  return Math.min(total, count);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPageNumbers(current, total) {
  const windowSize = 5;
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  let end = start + windowSize - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - windowSize + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function renderSpokenEnglishView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onBack = () => {},
    onStartPractice = null,
    initialCategory = null,
  } = options;
  const lang = getInterfaceLanguage();
  const isRtl = ['ar', 'fa', 'ur'].includes(lang);
  const s = getSpokenEnglishStrings(lang);
  const sPro = getProStrings(lang);
  const mrStrings = getMicroRulesStrings(lang);
  const prevLabel = mrStrings.prevBtn || 'Previous';
  const nextLabel = mrStrings.nextBtn || 'Next';

  const validCats = ['reductions', 'drops', 'texting', 'phrases'];
  const activeCategoryInit = (options._activeCategory && validCats.includes(options._activeCategory) ? options._activeCategory : null)
    || (initialCategory && validCats.includes(initialCategory) ? initialCategory : loadSavedSpokenCategory());
  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('spoken_english', 'SpokenEnglishView');
  }
  let activeCategory = activeCategoryInit;
  let currentPage = options._currentPage !== undefined
    ? Number(options._currentPage)
    : loadSavedSpokenPage(activeCategory);
  if (!Number.isFinite(currentPage) || currentPage < 1) currentPage = 1;

  function scrollToTop() {
    try {
      const pageEl = container.querySelector('.spoken-page') || container;
      if (pageEl && typeof pageEl.scrollIntoView === 'function') {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }

  function render() {
    const isPro = isProActive();
    const unlockedLimit = getSpokenUnlockedLimit();
    const total = SPOKEN_ENGLISH_ITEMS.length;
    const proRemaining = Math.max(0, total - unlockedLimit);

    const catLabels = {
      all: s.catAll,
      reductions: s.catReductions,
      drops: s.catDrops,
      texting: s.catTexting,
      phrases: s.catPhrases,
    };

    const filteredItems = SPOKEN_ENGLISH_ITEMS.map((item, index) => ({ item, index }))
      .filter(({ item }) => item.category === activeCategory);

    const visibleItems = isPro ? filteredItems : filteredItems.slice(0, unlockedLimit);
    const catTotal = filteredItems.length;
    const catProRemaining = Math.max(0, catTotal - visibleItems.length);

    const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    saveSavedSpokenPage(activeCategory, currentPage);
    saveSavedSpokenCategory(activeCategory);

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, visibleItems.length);
    const pageItems = visibleItems.slice(startIndex, endIndex);

    const filterChipsHtml = ['reductions', 'drops', 'texting', 'phrases']
      .map((cat) => `
        <button type="button" class="spoken-filter-chip ${activeCategory === cat ? 'is-active' : ''}" data-spoken-cat="${cat}">
          ${escapeHtml(catLabels[cat] || cat)}
        </button>
      `)
      .join('');

    const cardsHtml = pageItems.map(({ item }, idxInPage) => {
      const loc = getLocalizedSpokenItem(item, lang);
      const badgeLabel = catLabels[item.category] || item.category;
      return `
        <article class="spoken-card" data-spoken-id="${item.id}">
          <div class="spoken-card-top">
            <span class="spoken-cat-badge">${escapeHtml(badgeLabel)}</span>
            <span class="spoken-num">#${startIndex + idxInPage + 1}</span>
          </div>
          <div class="spoken-pair-row">
            <div class="spoken-formal-box">
              <span class="spoken-mini-label">${escapeHtml(s.formalLabel)}</span>
              <span class="spoken-formal-text">${escapeHtml(item.formal)}</span>
              ${loc.meaning && loc.meaning.toLowerCase() !== item.formal.toLowerCase() ? `<span class="spoken-meaning-text">${escapeHtml(loc.meaning)}</span>` : ''}
            </div>
            <span class="spoken-arrow">→</span>
            <div class="spoken-native-box">
              <span class="spoken-mini-label">${escapeHtml(s.nativeLabel)}</span>
              <div class="spoken-native-line">
                <span class="spoken-native-text">${escapeHtml(item.spoken)}</span>
                <button type="button" class="spoken-audio-btn" data-speak-text="${escapeHtml(item.spoken)}" aria-label="Listen">🔊</button>
              </div>
            </div>
          </div>
          ${loc.explanation ? `<p class="spoken-explanation">${escapeHtml(loc.explanation)}</p>` : ''}
          <div class="spoken-example-box">
            <div class="spoken-example-top">
              <span class="spoken-example-en">«${escapeHtml(item.example)}»</span>
              <button type="button" class="spoken-audio-btn" data-speak-text="${escapeHtml(item.example)}" aria-label="Listen example">🔊</button>
            </div>
            ${loc.exampleTranslation ? `<div class="spoken-example-tr">${escapeHtml(loc.exampleTranslation)}</div>` : ''}
          </div>
        </article>
      `;
    }).join('');

    const spokenAdCtx = `spoken_english_${activeCategory}`;
    const pageNumbers = getPageNumbers(currentPage, totalPages);
    const pageButtons = pageNumbers.map((p) => {
      if (p === '...') {
        return `<span class="spoken-page-ellipsis">…</span>`;
      }
      const isAdGated = p !== currentPage && AdService.willShowPaginationAd(spokenAdCtx, p);
      return `
        <button
          type="button"
          class="spoken-page-btn ${p === currentPage ? 'is-active' : (isAdGated ? 'is-ad-gated' : '')}"
          data-spoken-page="${p}"
          aria-label="Page ${p}"
          aria-current="${p === currentPage ? 'page' : 'false'}"
        >${p}</button>
      `;
    });

    const paginationHtml = totalPages > 1 ? `
      <div class="spoken-pagination">
        <button
          type="button"
          class="spoken-page-btn spoken-page-nav"
          data-spoken-page="${currentPage - 1}"
          ${currentPage <= 1 ? 'disabled' : ''}
          aria-label="${escapeHtml(prevLabel)}"
        >‹</button>
        ${pageButtons.join('')}
        <button
          type="button"
          class="spoken-page-btn spoken-page-nav"
          data-spoken-page="${currentPage + 1}"
          ${currentPage >= totalPages ? 'disabled' : ''}
          aria-label="${escapeHtml(nextLabel)}"
        >›</button>
      </div>
    ` : '';

    let gateBoxHtml = '';
    if (!isPro && catProRemaining > 0) {
      gateBoxHtml = `
        <div class="spoken-gate-box" id="spoken-gate-box">
          <p class="spoken-gate-counter">🔒 ${escapeHtml(String(s.unlockedCounter || '{n} / {total}').replace('{n}', String(visibleItems.length)).replace('{total}', String(catTotal)))}</p>
          <div class="spoken-gate-actions">
            <button type="button" id="spoken-ad-unlock-btn" class="primary-button btn-orange spoken-gate-btn">
              <span>🎬</span>
              <span>${escapeHtml(s.adUnlock10Btn)}</span>
            </button>
            <button type="button" id="spoken-pro-unlock-btn" class="primary-button btn-orange spoken-gate-btn spoken-pro-btn">
              <span>⭐</span>
              <span>${escapeHtml(sPro.pro_buy || 'PRO')}</span>
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <style>
        .spoken-page { width: 100%; max-width: min(680px, 100%); min-width: 0; padding: 8px 12px 84px; margin: 0 auto; box-sizing: border-box; overflow-x: hidden; }
        .spoken-header { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 8px; }
        .spoken-back-btn { background: var(--card-bg, #ffffff); border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.28)); color: var(--text-main, #0f172a); border-radius: 12px; padding: 7px 14px; font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .spoken-back-btn:active { transform: scale(0.97); }
        .spoken-practice-btn { margin-inline-start: auto; border: none; border-radius: 12px; padding: 7px 14px; font-size: 13.5px; font-weight: 800; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; box-shadow: 0 3px 10px rgba(22, 163, 74, 0.25); }
        .spoken-practice-btn:active { transform: scale(0.97); }
        .spoken-title { margin: 0; font-size: 19px; font-weight: 800; color: var(--text-main, #0f172a); min-width: 0; overflow-wrap: anywhere; }
        .spoken-sub { margin: 0 0 12px; font-size: 13.5px; color: var(--text-muted, #64748b); line-height: 1.4; overflow-wrap: anywhere; }
        .spoken-filters { display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 4px; margin-bottom: 12px; width: 100%; box-sizing: border-box; }
        .spoken-filter-chip { border: 1px solid var(--border-color, #e2e8f0); background: var(--card-bg, #ffffff); color: var(--text-muted, #64748b); border-radius: 999px; padding: 6px 11px; font-size: 12px; font-weight: 700; cursor: pointer; max-width: 100%; }
        .spoken-filter-chip.is-active { background: var(--primary-color, #2563eb); border-color: var(--primary-color, #2563eb); color: #ffffff; }
        body.dark-theme .spoken-filter-chip.is-active, .dark-theme .spoken-filter-chip.is-active, [data-theme="dark"] .spoken-filter-chip.is-active { background: #38bdf8; border-color: #38bdf8; color: #0f172a; }
        .spoken-list { display: flex; flex-direction: column; gap: 12px; width: 100%; min-width: 0; }
        .spoken-card { width: 100%; min-width: 0; box-sizing: border-box; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm, 0 4px 12px rgba(15,23,42,0.05)); }
        .spoken-card-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
        .spoken-cat-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; background: rgba(37, 99, 235, 0.1); color: var(--primary-color, #2563eb); }
        body.dark-theme .spoken-cat-badge, .dark-theme .spoken-cat-badge, [data-theme="dark"] .spoken-cat-badge { background: rgba(56, 189, 248, 0.16); color: #38bdf8; }
        .spoken-num { font-size: 12px; font-weight: 700; color: var(--text-muted, #64748b); flex-shrink: 0; }
        .spoken-pair-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 6px; align-items: center; margin-bottom: 10px; width: 100%; min-width: 0; }
        .spoken-formal-box, .spoken-native-box { background: var(--bg-hover, #f1f5f9); border-radius: 12px; padding: 8px 10px; min-width: 0; box-sizing: border-box; }
        .spoken-native-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); }
        .spoken-mini-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted, #64748b); margin-bottom: 2px; }
        .spoken-formal-text { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted, #64748b); overflow-wrap: anywhere; word-break: break-word; }
        .spoken-meaning-text { display: block; margin-top: 3px; font-size: 12px; font-weight: 700; color: var(--primary-color, #2563eb); overflow-wrap: anywhere; word-break: break-word; }
        body.dark-theme .spoken-meaning-text, .dark-theme .spoken-meaning-text, [data-theme="dark"] .spoken-meaning-text { color: #38bdf8; }
        .spoken-arrow { font-size: 14px; font-weight: 800; color: var(--text-muted, #64748b); flex-shrink: 0; }
        .spoken-native-line { display: flex; align-items: center; justify-content: space-between; gap: 4px; min-width: 0; }
        .spoken-native-text { font-size: 14.5px; font-weight: 800; color: var(--text-main, #0f172a); overflow-wrap: anywhere; word-break: break-word; min-width: 0; }
        .spoken-audio-btn { background: none; border: none; font-size: 16px; cursor: pointer; padding: 2px; flex-shrink: 0; line-height: 1; }
        .spoken-explanation { margin: 0 0 10px; font-size: 13px; line-height: 1.45; color: var(--text-main, #0f172a); overflow-wrap: anywhere; }
        .spoken-example-box { background: var(--bg-hover, #f1f5f9); border-radius: 10px; padding: 8px 10px; min-width: 0; box-sizing: border-box; }
        .spoken-example-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; }
        .spoken-example-en { font-size: 13.5px; font-weight: 700; color: var(--text-main, #0f172a); overflow-wrap: anywhere; min-width: 0; }
        .spoken-example-tr { margin-top: 3px; font-size: 12.5px; color: var(--text-muted, #64748b); overflow-wrap: anywhere; }
        .spoken-pagination { display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 18px; margin-bottom: 14px; flex-wrap: nowrap; }
        .spoken-page-btn { min-width: 34px; height: 36px; padding: 0 7px; border-radius: 10px; border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25)); background: var(--card-bg, #ffffff); color: var(--text-main, #0f172a); font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0; transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease; }
        .spoken-page-btn:active:not(:disabled) { transform: scale(0.96); }
        .spoken-page-btn:hover:not(:disabled) { border-color: var(--primary-color, #2563eb); }
        body.dark-theme .spoken-page-btn:hover:not(:disabled), .dark-theme .spoken-page-btn:hover:not(:disabled), [data-theme="dark"] .spoken-page-btn:hover:not(:disabled) { border-color: #38bdf8; }
        .spoken-page-btn.is-active { background: var(--primary-color, #2563eb); border-color: var(--primary-color, #2563eb); color: #ffffff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35); }
        body.dark-theme .spoken-page-btn.is-active, .dark-theme .spoken-page-btn.is-active, [data-theme="dark"] .spoken-page-btn.is-active { background: #38bdf8; border-color: #38bdf8; color: #0f172a; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.35); }
        .spoken-page-btn.is-ad-gated:not(.is-active):not(:disabled) { position: relative; background: linear-gradient(135deg, #f59e0b, #ea580c); border-color: #ea580c; color: #ffffff; box-shadow: 0 2px 7px rgba(234, 88, 12, 0.32); }
        .spoken-page-btn.is-ad-gated:not(.is-active):not(:disabled)::after { content: '🔒'; position: absolute; top: -5px; right: -4px; font-size: 9.5px; line-height: 1; pointer-events: none; filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35)); }
        .spoken-page-btn:disabled { opacity: 0.3; cursor: default; }
        .spoken-page-btn.spoken-page-nav { font-size: 18px; font-weight: 800; }
        .spoken-page-ellipsis { min-width: 18px; height: 36px; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted, #64748b); font-weight: 800; font-size: 14px; flex-shrink: 0; user-select: none; }
        .spoken-page-info { text-align: center; font-size: 12px; font-weight: 700; color: var(--text-muted, #64748b); margin-bottom: 12px; }
        .spoken-gate-box { width: 100%; box-sizing: border-box; margin-top: 16px; padding: 20px 16px; border-radius: 16px; background: var(--card-bg, #ffffff); border: 1.5px solid rgba(245, 158, 11, 0.35); text-align: center; }
        .spoken-gate-counter { margin: 0 0 10px; font-size: 14px; font-weight: 800; color: var(--text-main, #0f172a); }
        .spoken-gate-actions { display: flex; flex-direction: column; gap: 10px; max-width: 320px; margin: 0 auto 10px; }
        .spoken-gate-btn { min-height: 44px; border-radius: 12px; font-size: 14.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; cursor: pointer; }
        .spoken-pro-btn { background: linear-gradient(135deg, #f59e0b, #ea580c); }
        .spoken-gate-hint { margin: 0; font-size: 12.5px; color: var(--text-muted, #64748b); }
      </style>
      <div class="spoken-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="spoken-header">
          <button type="button" id="spoken-back-btn" class="spoken-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
          <h2 class="spoken-title">${escapeHtml(s.hubTitle)}</h2>
          ${pageItems.length > 0 ? `<button type="button" id="spoken-practice-btn" class="spoken-practice-btn">🎓 ${escapeHtml(s.practiceBtn || 'Practice')}</button>` : ''}
        </div>
        <p class="spoken-sub">${escapeHtml(s.hubSubtitle)}</p>
        <div class="spoken-filters">${filterChipsHtml}</div>
        <div class="spoken-list">${cardsHtml}</div>
        ${paginationHtml}
        ${gateBoxHtml}
      </div>
    `;

    container.querySelector('#spoken-back-btn')?.addEventListener('click', () => onBack());

    container.querySelector('#spoken-practice-btn')?.addEventListener('click', () => {
      const roundItems = pageItems.slice(0, 10);
      if (roundItems.length === 0) return;

      const practiceWords = roundItems.map(({ item }) => {
        const loc = getLocalizedSpokenItem(item, lang);
        const meaningText = loc.meaning || item.formal;
        return {
          id: 'spoken_' + item.id,
          word: item.spoken,
          translation: meaningText,
          translations: {
            [lang]: meaningText,
            ru: item.meanings?.ru || item.meaning?.ru || item.formal,
            en: item.formal + (item.spoken ? ' (' + item.spoken + ')' : ''),
          },
          transcription: item.formal,
          notes: loc.explanation || item.formal,
          example: item.example,
          category: 'Spoken English',
        };
      });

      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('spoken_practice_start', {
          category: activeCategory,
          page: currentPage,
          count: practiceWords.length,
        });
      }

      pushNavReturn({
        label: 'spoken_english',
        restore: () =>
          renderSpokenEnglishView(containerSelector, {
            ...options,
            _activeCategory: activeCategory,
            _currentPage: currentPage,
          }),
      });

      if (typeof onStartPractice === 'function') {
        onStartPractice(practiceWords, 'spoken_english', s.hubTitle);
      }
    });

    container.querySelectorAll('[data-spoken-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-spoken-cat') || 'reductions';
        if (cat === activeCategory) return;
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('spoken_category_select', { category: cat });
        }
        activeCategory = cat;
        options._activeCategory = activeCategory;
        saveSavedSpokenCategory(activeCategory);
        currentPage = loadSavedSpokenPage(activeCategory);
        options._currentPage = currentPage;
        render();
        scrollToTop();
      });
    });

    container.querySelectorAll('[data-spoken-page]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        const targetPage = Number(btn.getAttribute('data-spoken-page'));
        if (!targetPage || targetPage === currentPage || targetPage < 1 || targetPage > totalPages) return;
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('spoken_page_change', { page: targetPage, category: activeCategory });
        }
        if (!isProActive()) {
          try {
            await AdService.showPaginationInterstitial(`spoken_english_${activeCategory}`, targetPage);
          } catch (_) {}
        }
        currentPage = targetPage;
        options._currentPage = currentPage;
        saveSavedSpokenPage(activeCategory, currentPage);
        render();
        scrollToTop();
      });
    });

    container.querySelectorAll('[data-speak-text]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-speak-text');
        if (text) {
          if (typeof window !== 'undefined' && window.trackEvent) {
            window.trackEvent('spoken_audio_play', {
              text: String(text).slice(0, 60),
              category: activeCategory,
            });
          }
          speakWord(text);
        }
      });
    });

    const adBtn = container.querySelector('#spoken-ad-unlock-btn');
    adBtn?.addEventListener('click', async () => {
      if (adBtn.disabled) return;
      adBtn.disabled = true;
      const prev = adBtn.innerHTML;
      adBtn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;
      try {
        await AdService.showPaginationInterstitial('spoken_english_unlock');
        const nextLimit = Math.min(SPOKEN_ENGLISH_ITEMS.length, getSpokenUnlockedLimit() + 10);
        try {
          localStorage.setItem(STORAGE_KEY_SPOKEN_UNLOCKED_COUNT, String(nextLimit));
        } catch (e) {}
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('spoken_ad_unlock', { unlocked_limit: nextLimit });
        }
        if (activeCategory === 'all') {
          const newPage = Math.max(1, Math.ceil(nextLimit / PAGE_SIZE));
          currentPage = newPage;
          options._currentPage = newPage;
          saveSavedSpokenPage(activeCategory, newPage);
        }
        render();
        scrollToTop();
      } catch (err) {
        console.warn('Spoken English ad unlock error:', err);
        adBtn.innerHTML = prev;
        adBtn.disabled = false;
      }
    });

    container.querySelector('#spoken-pro-unlock-btn')?.addEventListener('click', () => {
      ProService.openPaywall('spoken_english');
    });
  }

  render();

  if (typeof window !== 'undefined') {
    if (window._spokenProChangedHandler) {
      window.removeEventListener('eb:pro-changed', window._spokenProChangedHandler);
    }
    window._spokenProChangedHandler = () => {
      if (document.body.contains(container) && container.querySelector('.spoken-page')) {
        render();
      }
    };
    window.addEventListener('eb:pro-changed', window._spokenProChangedHandler);
  }
}
