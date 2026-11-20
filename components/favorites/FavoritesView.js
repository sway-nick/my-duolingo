import { speakWord } from '../../services/audioService.js?v=386.0';
import { toggleFavoriteApi, clearAllFavoritesApi, getUserFavorites } from '../../services/api.js?v=386.0';
import { t, getWordTranslation, getWordNotes, getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { ProService } from '../../services/proService.js?v=386.0';
import { getProStrings } from '../../services/proI18n.js?v=386.0';
import { getSpokenEnglishStrings } from './spokenEnglishI18n.js?v=386.0';
import { getMicroRulesStrings } from './grammarUiTranslations.js?v=386.0';
import { isPairCollection, getPairInfo } from '../../services/confusablePairsData.js?v=386.0';
import {
  removeWordFromCollection,
  syncCollectionToAndroidWidget,
  getActiveCollectionId,
  setActiveCollectionId,
  getCollectionWords,
  isBuiltinCollectionOverridden,
  resetBuiltinCollection,
  isCollectionPackDownloaded,
  markCollectionPackDownloaded,
  getDownloadablePackStrings,
  getCollectionUnlockStep,
  getCollectionUnlockedCount,
  unlockMoreCollectionItems,
} from '../../services/collectionsService.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';
import { isProActive } from '../../services/proState.js?v=386.0';
import { openAddWordsToCollectionModal } from '../modals/AddWordsToCollectionModal.js?v=386.0';
import { openWidgetConfigBottomSheet } from '../modals/WidgetConfigBottomSheet.js?v=386.0';
import { openAddWordModal, attachWordLongPress } from '../dictionary/DictionaryView.js?v=386.0';

export const PAGINATED_COLLECTIONS = new Set([
  'it_terms',
  'verbs',
  'adjectives',
  'phrasal_verbs',
  'idioms',
  'tricky_sounds',
  'confusing_words',
]);
const PAGE_SIZE = 10;
const STORAGE_KEY_COL_PAGE_PREFIX = 'myduo_col_page_';

export function loadSavedCollectionPage(colId) {
  try {
    if (typeof localStorage === 'undefined') return 1;
    const raw = localStorage.getItem(STORAGE_KEY_COL_PAGE_PREFIX + colId);
    const val = parseInt(raw, 10);
    if (Number.isFinite(val) && val >= 1) return val;
  } catch (_) {}
  return 1;
}

export function saveSavedCollectionPage(colId, page = 1) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_COL_PAGE_PREFIX + colId, String(page));
  } catch (_) {}
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function renderFavoritesView(favoriteWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onStartFavoritePractice = () => {},
    onRemoveFavorite = () => {},
    onClearAllFavorites = () => {},
    onFavoriteToggle = () => {},
    onBack = null,
    collectionId = 'my_favorites',
    collectionTitle = null,
    allWords = [],
    favoriteIds = null,
    onRefresh = null,
  } = options;

  const displayTitle = collectionTitle || t('fav_title');
  const isMyFavorites = collectionId === 'my_favorites';
  const isCustomCol = !isMyFavorites && String(collectionId).startsWith('col_');
  const isWidgetActive = getActiveCollectionId() === collectionId;

  const initialFavList = favoriteIds !== null && favoriteIds !== undefined
    ? favoriteIds
    : (typeof getUserFavorites === 'function' ? getUserFavorites() : []);
  const favSet = new Set((initialFavList || []).map(String));

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const backLabel = getSpokenEnglishStrings(getInterfaceLanguage()).backBtn || 'Назад';
  const backBtnHtml = onBack
    ? `
    <div style="margin-bottom: 10px;">
      <button type="button" id="fav-view-back-btn" class="eb-back-pill-btn">‹ ${escapeHtml(backLabel)}</button>
    </div>
  `
    : '';

  const handleWidgetButtonClick = () => {
    // 1. Switch active collection to this collection and sync words to Android widget
    if (window.trackEvent) {
      window.trackEvent('collection_set_widget', { collection_id: collectionId });
    }
    setActiveCollectionId(collectionId);
    syncCollectionToAndroidWidget(collectionId, allWords);

    // 2. Check if widget is placed on the home screen
    let isWidgetOnHomeScreen = false;
    try {
      if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.isWidgetInstalled === 'function') {
        isWidgetOnHomeScreen = Boolean(window.AndroidWidgetBridge.isWidgetInstalled());
      }
    } catch (e) {
      console.warn('[Widget] isWidgetInstalled check failed:', e);
    }

    // 3. If widget is NOT placed on screen -> open "Настройка виджета" bottom sheet
    if (!isWidgetOnHomeScreen) {
      if (typeof openWidgetConfigBottomSheet === 'function') {
        openWidgetConfigBottomSheet();
      } else if (typeof window.openWidgetConfigBottomSheet === 'function') {
        window.openWidgetConfigBottomSheet();
      }
    }

    // 4. Refresh view so UI updates immediately
    if (onRefresh) {
      onRefresh();
    }
  };

  const triggerAddWords = () => {
    const currentWords = getCollectionWords(collectionId, allWords);
    openAddWordsToCollectionModal({
      collection: {
        id: collectionId,
        name: displayTitle,
        wordIds: currentWords.map((w) => String(w.id)),
      },
      allWords,
      onSaved: () => {
        if (onRefresh) onRefresh();
      },
    });
  };

  if (collectionId !== 'it_terms' && !isCollectionPackDownloaded(collectionId)) {
    const packStrings = getDownloadablePackStrings();
    const PACK_META = {
      it_terms: { icon: '💻', desc: packStrings.itDesc, count: 200 },
      idioms: { icon: '💬', desc: packStrings.idiomsDesc, count: 150 },
      verbs: { icon: '⚡', desc: packStrings.verbsDesc, count: 100 },
      adjectives: { icon: '🌟', desc: packStrings.adjectivesDesc, count: 100 },
      phrasal_verbs: { icon: '🔄', desc: packStrings.phrasalVerbsDesc, count: 100 },
    };
    const meta = PACK_META[collectionId] || PACK_META.idioms;
    const packIcon = meta.icon;
    const packDesc = meta.desc;
    const totalCount = Array.isArray(favoriteWords) ? favoriteWords.length : meta.count;
    const isItProLocked = collectionId === 'it_terms' && !isProActive();
    const partialStep = getCollectionUnlockStep(collectionId);
    const sPro = isItProLocked ? getProStrings(getInterfaceLanguage()) : null;

    container.innerHTML = `
      <div class="favorites-page">
        ${backBtnHtml}
        <div class="page-header" style="margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <h2 style="font-size: 19px; font-weight: 700; margin: 0; letter-spacing: -0.2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0;">${escapeHtml(displayTitle)}: ${totalCount}</h2>
        </div>

        <div class="empty-favorites-box" style="padding: 32px 22px; text-align: center; border-radius: 18px;">
          <span class="empty-icon" style="font-size: 52px; display: block; margin-bottom: 12px; line-height: 1;">${packIcon}</span>
          <h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 800;">${escapeHtml(displayTitle)}</h3>
          <p style="color: var(--text-muted); font-size: 14.5px; line-height: 1.5; max-width: 340px; margin: 0 auto 22px;">
            ${escapeHtml(packDesc)}
          </p>
          ${isItProLocked ? `
            <button type="button" id="open-it-pro-btn" class="primary-button btn-orange" style="min-height: 48px; padding: 0 28px; font-size: 15.5px; font-weight: 800; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; background: linear-gradient(135deg, #f59e0b, #ea580c); box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);">
              <span style="font-size: 18px;">⭐</span>
              <span>${escapeHtml(sPro.pro_buy || 'PRO')}</span>
            </button>
          ` : `
            <button type="button" id="download-collection-pack-btn" class="primary-button btn-orange" style="min-height: 48px; padding: 0 28px; font-size: 15.5px; font-weight: 800; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);">
              <span style="font-size: 18px;">🎬</span>
              <span id="download-pack-btn-label">${escapeHtml(partialStep > 0 ? `${packStrings.downloadBtn} (+${partialStep})` : packStrings.downloadBtn)}</span>
            </button>
            ${partialStep <= 0 ? `
              <p style="color: var(--text-muted); font-size: 12px; margin: 12px 0 0; opacity: 0.85;">
                ${escapeHtml(packStrings.watchAdHint)}
              </p>
            ` : ''}
          `}
        </div>
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      if (onBack) onBack();
    });

    if (isItProLocked) {
      container.querySelector('#open-it-pro-btn')?.addEventListener('click', () => {
        ProService.openPaywall('it_terms');
      });
      if (typeof window !== 'undefined') {
        if (window._favItProChangedHandler) {
          window.removeEventListener('eb:pro-changed', window._favItProChangedHandler);
        }
        window._favItProChangedHandler = () => {
          if (typeof document !== 'undefined' && document.body?.contains(container) && container.querySelector('#open-it-pro-btn')) {
            renderFavoritesView(favoriteWords, containerSelector, options);
          }
        };
        window.addEventListener('eb:pro-changed', window._favItProChangedHandler);
      }
      return;
    }

    const dlBtn = container.querySelector('#download-collection-pack-btn');
    dlBtn?.addEventListener('click', async () => {
      if (dlBtn.disabled) return;
      dlBtn.disabled = true;
      dlBtn.style.opacity = '0.75';
      const prevHtml = dlBtn.innerHTML;
      dlBtn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;

      try {
        if (!isProActive()) {
          const adRes = await AdService.showLanguagePackRewardedAd(displayTitle);
          if (!adRes || (!adRes.rewardEarned && !adRes.isOffline)) {
            dlBtn.innerHTML = prevHtml;
            dlBtn.disabled = false;
            dlBtn.style.opacity = '1';
            return;
          }
        }

        dlBtn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;
        await new Promise((r) => setTimeout(r, 450));
        markCollectionPackDownloaded(collectionId);
        renderFavoritesView(favoriteWords, containerSelector, options);
      } catch (err) {
        console.warn('Collection pack download failed:', err);
        dlBtn.innerHTML = prevHtml;
        dlBtn.disabled = false;
        dlBtn.style.opacity = '1';
      }
    });

    return;
  }

  if (!favoriteWords || favoriteWords.length === 0) {
    container.innerHTML = `
      <div class="favorites-page">
        ${backBtnHtml}
        <div class="page-header" style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <h2 style="font-size: 19px; font-weight: 700; margin: 0; letter-spacing: -0.2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0;">${escapeHtml(displayTitle)}</h2>
        </div>

        <!-- 50% / 50% Actions Row -->
        <div class="col-top-actions-row" style="display: grid; grid-template-columns: ${!isMyFavorites ? '1fr 1fr' : '1fr'}; gap: 8px; width: 100%; margin-bottom: 14px; box-sizing: border-box;">
          <button type="button" id="header-set-widget-btn" class="secondary-button ${isWidgetActive ? 'is-active-widget-btn' : ''}" style="width: 100%; min-width: 0; height: 42px; min-height: 42px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; cursor: pointer; ${isWidgetActive ? 'border: 1.5px solid #22c55e; color: #16a34a; background: rgba(34, 197, 94, 0.12);' : ''}">
            <span style="font-size: 15px;">${isWidgetActive ? '✓' : '📱'}</span>
            <span>${escapeHtml(t('col_pill_widget') || 'Виджет')}</span>
          </button>
          ${
            !isMyFavorites
              ? `
            <button type="button" id="header-add-words-btn" class="secondary-button" style="width: 100%; min-width: 0; height: 42px; min-height: 42px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; cursor: pointer;">
              <span style="font-size: 15px;">➕</span>
              <span>${escapeHtml(t('col_btn_add') || 'Добавить')}</span>
            </button>
          `
              : ''
          }
        </div>

        <div class="empty-favorites-box">
          <span class="empty-icon" style="font-size: 40px; display: block; margin-bottom: 8px;">🤍</span>
          <h3 style="margin: 4px 0 8px;">${isMyFavorites ? t('fav_empty') : (t('fav_empty_custom') || 'В этом списке пока нет слов')}</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 16px;">
            ${isMyFavorites ? t('fav_empty_sub') : (t('fav_empty_custom_sub') || 'Добавьте слова из словаря или во время тренировок.')}
          </p>
          ${
            !isMyFavorites
              ? `
            <button type="button" id="empty-add-words-btn" class="primary-button btn-green" style="min-height: 44px; padding: 0 20px; font-size: 14px; font-weight: 700; border-radius: 12px;">
              ➕ ${escapeHtml(t('col_btn_add_words') || 'Добавить слова')}
            </button>
          `
              : ''
          }
        </div>
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      if (onBack) onBack();
    });

    container.querySelector('#header-set-widget-btn')?.addEventListener('click', handleWidgetButtonClick);
    container.querySelector('#header-add-words-btn')?.addEventListener('click', triggerAddWords);
    container.querySelector('#empty-add-words-btn')?.addEventListener('click', triggerAddWords);

    return;
  }

  const isPro = isProActive();
  const isItPreview = collectionId === 'it_terms' && !isPro && favoriteWords.length > 5;
  const partialStep = getCollectionUnlockStep(collectionId);
  const isPartialPack = partialStep > 0 && !isPro;
  const partialUnlockedCount = isItPreview
    ? Math.min(favoriteWords.length, 5)
    : (isPartialPack ? Math.min(favoriteWords.length, getCollectionUnlockedCount(collectionId)) : favoriteWords.length);
  const visibleWords = (isItPreview || isPartialPack) ? favoriteWords.slice(0, partialUnlockedCount) : favoriteWords;
  const hasMoreToUnlock = isPartialPack && partialUnlockedCount < favoriteWords.length;
  const sProMore = (hasMoreToUnlock || isItPreview) ? getProStrings(getInterfaceLanguage()) : null;
  const packStringsMore = (hasMoreToUnlock || isItPreview) ? getDownloadablePackStrings() : null;

  const isPaginated = PAGINATED_COLLECTIONS.has(collectionId);
  let currentPage = options._currentPage !== undefined
    ? Number(options._currentPage)
    : (isPaginated ? loadSavedCollectionPage(collectionId) : 1);
  if (!Number.isFinite(currentPage) || currentPage < 1) currentPage = 1;

  const totalPages = isPaginated ? Math.max(1, Math.ceil(visibleWords.length / PAGE_SIZE)) : 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  if (isPaginated) {
    saveSavedCollectionPage(collectionId, currentPage);
  }

  const startIndex = isPaginated ? (currentPage - 1) * PAGE_SIZE : 0;
  const endIndex = isPaginated ? Math.min(startIndex + PAGE_SIZE, visibleWords.length) : visibleWords.length;
  const wordsToRender = isPaginated ? visibleWords.slice(startIndex, endIndex) : visibleWords;

  const mrStrings = getMicroRulesStrings(getInterfaceLanguage());
  const prevLabel = mrStrings.prevBtn || 'Previous';
  const nextLabel = mrStrings.nextBtn || 'Next';

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const pageButtons = pageNumbers.map((p) => {
    if (p === '...') {
      return `<span class="col-page-ellipsis">…</span>`;
    }
    return `
      <button
        type="button"
        class="col-page-btn ${p === currentPage ? 'is-active' : ''}"
        data-col-page="${p}"
        aria-label="Page ${p}"
        aria-current="${p === currentPage ? 'page' : 'false'}"
      >${p}</button>
    `;
  });

  const paginationHtml = (isPaginated && totalPages > 1) ? `
    <div class="col-pagination">
      <button
        type="button"
        class="col-page-btn col-page-nav"
        data-col-page="${currentPage - 1}"
        ${currentPage <= 1 ? 'disabled' : ''}
        aria-label="${escapeHtml(prevLabel)}"
      >‹</button>
      ${pageButtons.join('')}
      <button
        type="button"
        class="col-page-btn col-page-nav"
        data-col-page="${currentPage + 1}"
        ${currentPage >= totalPages ? 'disabled' : ''}
        aria-label="${escapeHtml(nextLabel)}"
      >›</button>
    </div>
    <div class="col-page-info">
      ${visibleWords.length > 0 ? `${startIndex + 1}–${endIndex} / ${visibleWords.length}` : ''}
    </div>
  ` : '';

  const heartIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="none" aria-hidden="true" style="flex-shrink: 0;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const trashIconSvg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  const repeatBtnText = (t('fav_practice_btn') || '').replace(/^🔥\s*/, '');
  const headerCountText = (hasMoreToUnlock || isItPreview) ? `${partialUnlockedCount} / ${favoriteWords.length}` : `${favoriteWords.length}`;

  const isPairCol = isPairCollection(collectionId);
  const formatIpa = (tr) => {
    const clean = String(tr || '').trim().replace(/^\/+|\/+$/g, '').replace(/^\[+|\]+$/g, '').trim();
    return clean ? `[${clean}]` : '';
  };

  const renderPairCardsHtml = () => {
    const isSoundCol = collectionId === 'tricky_sounds';
    const pairCards = [];
    for (let i = 0; i < wordsToRender.length; i += 2) {
      const wordA = wordsToRender[i];
      const wordB = wordsToRender[i + 1];
      if (!wordA) continue;
      const pairNum = Math.floor((startIndex + i) / 2) + 1;
      const info = getPairInfo(collectionId, wordA.word);
      const contrast = info?.contrast || '';

      const renderSide = (w, sideClass) => {
        if (!w) return `<div class="pair-side ${sideClass}"></div>`;
        const isFav = favSet.has(String(w.id));
        const ipa = formatIpa(w.transcription);
        const tr = getWordTranslation(w);
        return `
          <div class="pair-side ${sideClass}" data-id="${w.id}">
            <div class="pair-side-top">
              <span class="pair-side-word" dir="ltr">${escapeHtml(w.word)}</span>
              <div class="pair-side-actions">
                <button type="button" class="fav-audio-btn pair-audio-btn" data-word="${escapeHtml(w.word)}" data-id="${w.id}" title="${t('fav_listen_tooltip') || 'Слушать произношение'}">🔊</button>
                <button type="button" class="fav-action-btn fav-toggle-btn fav-icon-btn pair-fav-btn ${isFav ? 'active' : ''}" data-id="${w.id}" title="${isFav ? (t('fav_remove_tooltip') || 'Удалить из избранного') : (t('fav_toggle') || 'В избранное')}">${isFav ? '❤️' : '🤍'}</button>
              </div>
            </div>
            ${ipa ? `<div class="pair-side-ipa" dir="ltr">${escapeHtml(ipa)}</div>` : ''}
            <div class="pair-side-tr">${escapeHtml(tr)}</div>
          </div>
        `;
      };

      pairCards.push(`
        <div class="fav-card pair-card" data-id="${wordA.id}">
          <div class="pair-card-head">
            ${isSoundCol && contrast
              ? `<span class="pair-contrast-pill" dir="ltr">${escapeHtml(contrast)}</span>`
              : `<span class="pair-contrast-pill pair-contrast-twins" dir="ltr">A ⇄ B</span>`}
            <span class="pair-num">#${pairNum}</span>
          </div>
          <div class="pair-grid-row">
            ${renderSide(wordA, 'pair-side-a')}
            <span class="pair-vs-mid" aria-hidden="true">${isSoundCol ? '≠' : '⇄'}</span>
            ${renderSide(wordB, 'pair-side-b')}
          </div>
        </div>
      `);
    }
    return pairCards.join('');
  };

  container.innerHTML = `
    <style>
      .pair-card { padding: 12px 12px 13px !important; }
      .pair-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px; }
      .pair-contrast-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.3px; background: rgba(37, 99, 235, 0.11); color: var(--primary-color, #2563eb); }
      .pair-contrast-twins { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }
      body.dark-theme .pair-contrast-twins, .dark-theme .pair-contrast-twins, [data-theme="dark"] .pair-contrast-twins { background: rgba(167, 139, 250, 0.18); color: #c4b5fd; }
      .pair-num { font-size: 12px; font-weight: 700; color: var(--text-muted, #64748b); }
      .pair-grid-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 6px; align-items: stretch; width: 100%; box-sizing: border-box; }
      .pair-vs-mid { align-self: center; font-size: 15px; font-weight: 800; color: var(--text-muted, #64748b); user-select: none; padding: 0 1px; }
      .pair-side { display: flex; flex-direction: column; min-width: 0; padding: 9px 9px 10px; border-radius: 12px; box-sizing: border-box; }
      .pair-side-a { background: var(--bg-hover, #f1f5f9); border: 1px solid var(--border-color, rgba(148, 163, 184, 0.22)); }
      .pair-side-b { background: rgba(37, 99, 235, 0.07); border: 1px solid rgba(37, 99, 235, 0.24); }
      body.dark-theme .pair-side-a, .dark-theme .pair-side-a, [data-theme="dark"] .pair-side-a { background: rgba(255, 255, 255, 0.05); border-color: rgba(148, 163, 184, 0.18); }
      body.dark-theme .pair-side-b, .dark-theme .pair-side-b, [data-theme="dark"] .pair-side-b { background: rgba(56, 189, 248, 0.10); border-color: rgba(56, 189, 248, 0.28); }
      .pair-side-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; margin-bottom: 3px; }
      .pair-side-word { font-size: 15.5px; font-weight: 800; color: var(--text-main, #0f172a); line-height: 1.2; overflow-wrap: anywhere; word-break: break-word; min-width: 0; }
      .pair-side-actions { display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0; }
      .pair-audio-btn, .pair-fav-btn { width: 28px !important; height: 28px !important; min-width: 28px !important; min-height: 28px !important; padding: 0 !important; font-size: 14px !important; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; }
      .pair-side-ipa { font-size: 12px; font-weight: 600; color: var(--text-muted, #64748b); margin-bottom: 5px; line-height: 1.2; overflow-wrap: anywhere; }
      .pair-side-tr { font-size: 12.5px; font-weight: 600; color: var(--primary-color, #2563eb); line-height: 1.32; overflow-wrap: anywhere; word-break: break-word; }
      body.dark-theme .pair-side-tr, .dark-theme .pair-side-tr, [data-theme="dark"] .pair-side-tr { color: var(--primary-color, #38bdf8); }
      .col-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 18px; margin-bottom: 6px; flex-wrap: wrap; }
      .col-page-btn { min-width: 38px; height: 38px; padding: 0 10px; border-radius: 11px; border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25)); background: var(--card-bg, #ffffff); color: var(--text-main, #0f172a); font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease; }
      .col-page-btn:active:not(:disabled) { transform: scale(0.96); }
      .col-page-btn:hover:not(:disabled) { border-color: var(--primary-color, #2563eb); }
      .col-page-btn.is-active { background: var(--primary-color, #2563eb); border-color: var(--primary-color, #2563eb); color: #ffffff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35); }
      body.dark-theme .col-page-btn.is-active, .dark-theme .col-page-btn.is-active, [data-theme="dark"] .col-page-btn.is-active { background: var(--primary-color, #38bdf8); border-color: var(--primary-color, #38bdf8); color: #0f172a; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.35); }
      .col-page-btn:disabled { opacity: 0.3; cursor: default; }
      .col-page-btn.col-page-nav { font-size: 18px; font-weight: 800; }
      .col-page-ellipsis { min-width: 28px; height: 38px; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted, #64748b); font-weight: 800; font-size: 14px; user-select: none; }
      .col-page-info { text-align: center; font-size: 12px; font-weight: 700; color: var(--text-muted, #64748b); margin-bottom: 12px; }
    </style>
    <div class="favorites-page">
      ${backBtnHtml}
      <div class="page-header" style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <h2 style="font-size: 19px; font-weight: 700; margin: 0; white-space: nowrap; letter-spacing: -0.2px; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${escapeHtml(displayTitle)}: ${headerCountText}</h2>
      </div>

      <!-- 50% / 50% Actions Row -->
      <div class="col-top-actions-row" style="display: grid; grid-template-columns: ${!isMyFavorites ? '1fr 1fr' : '1fr'}; gap: 8px; width: 100%; margin-bottom: 12px; box-sizing: border-box;">
        <button type="button" id="header-set-widget-btn" class="secondary-button ${isWidgetActive ? 'is-active-widget-btn' : ''}" style="width: 100%; min-width: 0; height: 42px; min-height: 42px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; cursor: pointer; ${isWidgetActive ? 'border: 1.5px solid #22c55e; color: #16a34a; background: rgba(34, 197, 94, 0.12);' : ''}">
          <span style="font-size: 15px;">${isWidgetActive ? '✓' : '📱'}</span>
          <span>${escapeHtml(t('col_pill_widget') || 'Виджет')}</span>
        </button>
        ${
          !isMyFavorites
            ? `
          <button type="button" id="header-add-words-btn" class="secondary-button" style="width: 100%; min-width: 0; height: 42px; min-height: 42px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; cursor: pointer;">
            <span style="font-size: 15px;">➕</span>
            <span>${escapeHtml(t('col_btn_add') || 'Добавить')}</span>
          </button>
        `
            : ''
        }
      </div>

      <!-- Sticky Repeat & Clear Buttons -->
      <div class="fav-sticky-controls">
        <div style="display: grid; grid-template-columns: ${isMyFavorites ? '1fr 1fr' : '1fr'}; gap: 8px; width: 100%;">
          <button class="primary-button btn-green" id="start-fav-practice-btn" style="width: 100%; min-width: 0; min-height: 44px; height: 44px; font-size: clamp(12.5px, 3.4vw, 14.5px); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;">
            ${heartIconSvg}
            <span>${repeatBtnText}</span>
          </button>
          ${
            isMyFavorites
              ? `
            <button class="primary-button btn-graphite" id="clear-all-favs-btn" style="width: 100%; min-width: 0; min-height: 44px; height: 44px; font-size: clamp(12.5px, 3.4vw, 14px); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; box-sizing: border-box;">
              ${trashIconSvg}
              <span>${t('fav_clear_all_btn')}</span>
            </button>
          `
              : ''
          }
        </div>
      </div>

      <div class="favorites-grid" id="favorites-grid">
        ${isPairCol ? renderPairCardsHtml() : wordsToRender
          .map((word) => {
            const isFav = isMyFavorites ? true : favSet.has(String(word.id));
            return `
          <div class="fav-card" data-id="${word.id}">
            <div class="fav-card-top">
              <span class="category-badge">${(!word.category || word.category === 'Общие') ? (t('cat_general') || 'Elementary') : word.category}</span>
              <div class="fav-card-actions">
                <button type="button" class="fav-audio-btn" data-word="${escapeHtml(word.word)}" data-id="${word.id}" title="${t('fav_listen_tooltip') || 'Слушать произношение'}">🔊</button>
                ${
                  isMyFavorites
                    ? `<button type="button" class="fav-action-btn remove-fav-btn" data-id="${word.id}" title="${t('fav_remove_tooltip') || 'Удалить из списка'}">❤️</button>`
                    : `<button type="button" class="fav-action-btn fav-toggle-btn fav-icon-btn ${isFav ? 'active' : ''}" data-id="${word.id}" title="${isFav ? (t('fav_remove_tooltip') || 'Удалить из избранного') : (t('fav_toggle') || 'В избранное')}">${isFav ? '❤️' : '🤍'}</button>`
                }
                ${
                  isCustomCol
                    ? `<button type="button" class="fav-action-btn remove-col-word-btn" data-id="${word.id}" title="${t('fav_remove_tooltip') || 'Удалить из подборки'}">🗑️</button>`
                    : ''
                }
              </div>
            </div>
            
            <div class="fav-card-body">
              <h3 class="fav-word">${escapeHtml(word.word)}</h3>
              <p class="fav-translation">${escapeHtml(getWordTranslation(word))}</p>
              ${(() => {
                const n = getWordNotes(word, null, { hideItNotes: collectionId !== 'it_terms' });
                return n ? `<p class="dict-notes">${escapeHtml(n)}</p>` : '';
              })()}
            </div>
          </div>
        `;
          })
          .join('')}
      </div>
      ${paginationHtml}
      ${hasMoreToUnlock ? `
        <div id="idioms-unlock-more-box" class="empty-favorites-box" style="margin-top: 16px; padding: 20px 16px; text-align: center; border-radius: 16px;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: var(--text-main);">
            🔒 ${partialUnlockedCount} / ${favoriteWords.length}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            <button type="button" id="unlock-more-idioms-btn" class="primary-button btn-orange" style="min-height: 44px; padding: 0 20px; font-size: 14.5px; font-weight: 800; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
              <span>🎬</span>
              <span>${escapeHtml(packStringsMore.downloadBtn)} (+${Math.min(partialStep, favoriteWords.length - partialUnlockedCount)})</span>
            </button>
            <button type="button" id="open-idioms-pro-btn" class="primary-button btn-orange" style="min-height: 44px; padding: 0 20px; font-size: 14.5px; font-weight: 800; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; background: linear-gradient(135deg, #f59e0b, #ea580c);">
              <span>⭐</span>
              <span>${escapeHtml(sProMore.pro_buy || 'PRO')}</span>
            </button>
          </div>
        </div>
      ` : ''}
      ${isItPreview ? `
        <div id="it-pro-preview-box" class="empty-favorites-box" style="margin-top: 16px; padding: 22px 16px; text-align: center; border-radius: 16px;">
          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: var(--text-main);">
            🔒 ${partialUnlockedCount} / ${favoriteWords.length}
          </p>
          <p style="margin: 0 auto 14px; font-size: 13.5px; line-height: 1.45; color: var(--text-muted); max-width: 340px;">
            ${escapeHtml(packStringsMore.itDesc)}
          </p>
          <button type="button" id="open-it-pro-btn" class="primary-button btn-orange" style="min-height: 46px; padding: 0 24px; font-size: 15px; font-weight: 800; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; background: linear-gradient(135deg, #f59e0b, #ea580c); box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);">
            <span style="font-size: 17px;">⭐</span>
            <span>${escapeHtml(sProMore.pro_buy || 'PRO')}</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;

  const headerEl = document.querySelector('.mobile-header');
  const favControls = container.querySelector('.fav-sticky-controls');
  const updateFavStickyTop = () => {
    if (favControls) {
      const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
      const headerHeight = headerEl ? headerEl.offsetHeight : 60;
      favControls.style.setProperty('--fav-sticky-top', `${Math.round(headerHeight + safeTop)}px`);
    }
  };
  updateFavStickyTop();
  window.addEventListener('resize', updateFavStickyTop, { passive: true });

  const scrollToTop = () => {
    try {
      const pageEl = container.querySelector('.favorites-page') || container;
      if (pageEl && typeof pageEl.scrollIntoView === 'function') {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {
      window.scrollTo(0, 0);
    }
  };

  if (isPaginated && totalPages > 1 && !isProActive()) {
    AdService.preloadPaginationInterstitial().catch(() => {});
  }

  container.querySelectorAll('[data-col-page]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      const targetPage = Number(btn.getAttribute('data-col-page'));
      if (!targetPage || targetPage === currentPage || targetPage < 1 || targetPage > totalPages) return;
      if (!isProActive()) {
        try {
          await AdService.showPaginationInterstitial(`collection_${collectionId}`);
        } catch (_) {}
      }
      options._currentPage = targetPage;
      if (isPaginated) {
        saveSavedCollectionPage(collectionId, targetPage);
      }
      renderFavoritesView(favoriteWords, containerSelector, options);
      scrollToTop();
    });
  });

  container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
    if (onBack) onBack();
  });

  container.querySelector('#header-set-widget-btn')?.addEventListener('click', handleWidgetButtonClick);
  container.querySelector('#header-add-words-btn')?.addEventListener('click', triggerAddWords);

  // Bind practice button
  container.querySelector('#start-fav-practice-btn')?.addEventListener('click', () => {
    const currentWords = (visibleWords && visibleWords.length > 0)
      ? visibleWords
      : getCollectionWords(collectionId, allWords);
    onStartFavoritePractice(currentWords);
  });

  if (hasMoreToUnlock) {
    const moreBtn = container.querySelector('#unlock-more-idioms-btn');
    moreBtn?.addEventListener('click', async () => {
      if (moreBtn.disabled) return;
      moreBtn.disabled = true;
      moreBtn.style.opacity = '0.75';
      const prevHtml = moreBtn.innerHTML;
      moreBtn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;
      try {
        await AdService.showPaginationInterstitial(`collection_${collectionId}_unlock`);
        unlockMoreCollectionItems(collectionId, partialStep);
        const newCount = getCollectionUnlockedCount(collectionId);
        const newPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE));
        options._currentPage = newPage;
        saveSavedCollectionPage(collectionId, newPage);
        renderFavoritesView(favoriteWords, containerSelector, options);
        scrollToTop();
      } catch (err) {
        console.warn('Partial pack unlock failed:', err);
        moreBtn.innerHTML = prevHtml;
        moreBtn.disabled = false;
        moreBtn.style.opacity = '1';
      }
    });

    container.querySelector('#open-idioms-pro-btn')?.addEventListener('click', () => {
      ProService.openPaywall(collectionId);
    });

    if (typeof window !== 'undefined') {
      if (window._favIdiomsProChangedHandler) {
        window.removeEventListener('eb:pro-changed', window._favIdiomsProChangedHandler);
      }
      window._favIdiomsProChangedHandler = () => {
        if (typeof document !== 'undefined' && document.body?.contains(container) && container.querySelector('#idioms-unlock-more-box')) {
          renderFavoritesView(favoriteWords, containerSelector, options);
        }
      };
      window.addEventListener('eb:pro-changed', window._favIdiomsProChangedHandler);
    }
  }

  if (isItPreview) {
    container.querySelector('#open-it-pro-btn')?.addEventListener('click', () => {
      ProService.openPaywall('it_terms');
    });
    if (typeof window !== 'undefined') {
      if (window._favItProChangedHandler) {
        window.removeEventListener('eb:pro-changed', window._favItProChangedHandler);
      }
      window._favItProChangedHandler = () => {
        if (typeof document !== 'undefined' && document.body?.contains(container) && container.querySelector('#it-pro-preview-box')) {
          renderFavoritesView(favoriteWords, containerSelector, options);
        }
      };
      window.addEventListener('eb:pro-changed', window._favItProChangedHandler);
    }
  }

  // Bind clear all favorites button
  container.querySelector('#clear-all-favs-btn')?.addEventListener('click', async () => {
    if (!window.confirm(t('fav_clear_confirm'))) return;
    onClearAllFavorites();
    renderFavoritesView([], containerSelector, options);
    await clearAllFavoritesApi();
  });

  // Event delegation on grid
  const favGrid = container.querySelector('#favorites-grid');
  if (favGrid) {
    favGrid.addEventListener('click', async (e) => {
      // 1. Audio button
      const soundBtn = e.target.closest('.fav-audio-btn, .sound-button-sm');
      if (soundBtn) {
        e.stopPropagation();
        const w = soundBtn.getAttribute('data-word');
        const id = soundBtn.getAttribute('data-id');
        speakWord(w, id);
        return;
      }

      // 2. Favorite toggle button (in thematic & custom collections)
      const favBtn = e.target.closest('.fav-toggle-btn');
      if (favBtn) {
        e.stopPropagation();
        const id = favBtn.getAttribute('data-id');
        const isCurrentlyFav = favSet.has(String(id));
        const nextFav = !isCurrentlyFav;

        if (nextFav) {
          favSet.add(String(id));
        } else {
          favSet.delete(String(id));
        }

        favBtn.textContent = nextFav ? '❤️' : '🤍';
        favBtn.classList.toggle('active', nextFav);
        favBtn.title = nextFav
          ? (t('fav_remove_tooltip') || 'Удалить из избранного')
          : (t('fav_toggle') || 'В избранное');

        toggleFavoriteApi(id, nextFav).catch((err) => console.warn('toggleFavoriteApi error:', err));
        if (typeof onFavoriteToggle === 'function') {
          onFavoriteToggle(id, nextFav);
        }
        if (!nextFav && typeof onRemoveFavorite === 'function') {
          onRemoveFavorite(id);
        }
        if (getActiveCollectionId() === 'my_favorites') {
          syncCollectionToAndroidWidget('my_favorites', allWords);
        }
        return;
      }

      // 3. Remove favorite from "My Favorites" list (where isMyFavorites is true)
      const removeBtn = e.target.closest('.remove-fav-btn');
      if (removeBtn) {
        e.stopPropagation();
        const id = removeBtn.getAttribute('data-id');

        // Immediately remove card from DOM
        const card = container.querySelector(`.fav-card[data-id="${id}"]`);
        if (card) {
          card.remove();
        }

        if (window.trackEvent) {
          window.trackEvent('collection_word_remove', {
            collection_id: collectionId,
            word_id: id,
          });
        }

        const remainingCards = container.querySelectorAll('.fav-card');
        const titleEl = container.querySelector('.page-header h2');
        if (titleEl) {
          titleEl.textContent = `${displayTitle}: ${remainingCards.length}`;
        }
        if (remainingCards.length === 0) {
          renderFavoritesView([], containerSelector, options);
        }

        toggleFavoriteApi(id, false).catch((err) => console.warn('toggleFavoriteApi error:', err));
        if (typeof onRemoveFavorite === 'function') {
          onRemoveFavorite(id);
        }
        if (typeof onFavoriteToggle === 'function') {
          onFavoriteToggle(id, false);
        }
        if (getActiveCollectionId() === 'my_favorites') {
          syncCollectionToAndroidWidget('my_favorites', allWords);
        }
        return;
      }

      // 4. Remove word from custom collection (where isCustomCol is true)
      const removeColBtn = e.target.closest('.remove-col-word-btn');
      if (removeColBtn) {
        e.stopPropagation();
        const id = removeColBtn.getAttribute('data-id');

        const card = container.querySelector(`.fav-card[data-id="${id}"]`);
        if (card) {
          card.remove();
        }

        if (window.trackEvent) {
          window.trackEvent('collection_word_remove', {
            collection_id: collectionId,
            word_id: id,
          });
        }

        removeWordFromCollection(collectionId, id, allWords);
        if (getActiveCollectionId() === collectionId) {
          syncCollectionToAndroidWidget(collectionId, allWords);
        }

        const remainingCards = container.querySelectorAll('.fav-card');
        const titleEl = container.querySelector('.page-header h2');
        if (titleEl) {
          titleEl.textContent = `${displayTitle}: ${remainingCards.length}`;
        }
        if (remainingCards.length === 0) {
          renderFavoritesView([], containerSelector, options);
        }
        return;
      }
    });

    attachWordLongPress(favGrid, '.fav-card', (cardEl) => {
      const id = cardEl.getAttribute('data-id');
      const wordList = Array.isArray(allWords) && allWords.length > 0 ? allWords : favoriteWords;
      const wordObj =
        wordList.find((w) => w && String(w.id) === String(id)) ||
        favoriteWords.find((w) => w && String(w.id) === String(id));
      if (wordObj) {
        openAddWordModal(
          wordList,
          wordObj.word,
          (savedWord) => {
            if (savedWord) {
              const favMatch = favoriteWords.find((w) => w && String(w.id) === String(id));
              if (favMatch && favMatch !== savedWord) {
                Object.assign(favMatch, {
                  translation: savedWord.translation,
                  user_translations: savedWord.user_translations,
                  category: savedWord.category,
                  user_category: savedWord.user_category,
                  notes: savedWord.notes,
                  user_note: savedWord.user_note,
                });
              }
            }
            renderFavoritesView(favoriteWords, containerSelector, options);
          },
          { editWord: wordObj }
        );
      }
    });
  }
}

export { renderFavoritesView };
