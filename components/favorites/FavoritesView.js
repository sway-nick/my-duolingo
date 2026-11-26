import { speakWord } from '../../services/audioService.js?v=423.0';
import { toggleFavoriteApi, clearAllFavoritesApi, getUserFavorites } from '../../services/api.js?v=423.0';
import { t, getWordTranslation, getWordNotes, getInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { ProService } from '../../services/proService.js?v=423.0';
import { getProStrings } from '../../services/proI18n.js?v=423.0';
import { getSpokenEnglishStrings } from './spokenEnglishI18n.js?v=423.0';
import { getMicroRulesStrings } from './grammarUiTranslations.js?v=423.0';
import { isPairCollection } from '../../services/confusablePairsData.js?v=423.0';
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
  STATIVE_VERBS_SET,
  getVerbFilterStrings,
} from '../../services/collectionsService.js?v=423.0';
import { AdService } from '../../services/adService.js?v=423.0';
import { isProActive } from '../../services/proState.js?v=423.0';
import { openAddWordsToCollectionModal } from '../modals/AddWordsToCollectionModal.js?v=423.0';
import { openWidgetConfigBottomSheet } from '../modals/WidgetConfigBottomSheet.js?v=423.0';
import { openAddWordModal, attachWordLongPress } from '../dictionary/DictionaryView.js?v=423.0';
import { getRelatedMicroRulesForCollection, getCrossLinkStrings } from './crossLinksMap.js?v=423.0';
import { navigateWithReturn } from '../../services/navigationStack.js?v=423.0';

export const PAGINATED_COLLECTIONS = new Set([
  'it_terms',
  'finance_terms',
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

  const isProPreviewPack = collectionId === 'it_terms' || collectionId === 'finance_terms';
  if (!isProPreviewPack && !isCollectionPackDownloaded(collectionId)) {
    const packStrings = getDownloadablePackStrings();
    const PACK_META = {
      it_terms: { icon: '💻', desc: packStrings.itDesc, count: 200 },
      finance_terms: { icon: '💰', desc: packStrings.financeDesc, count: 200 },
      idioms: { icon: '💬', desc: packStrings.idiomsDesc, count: 150 },
      verbs: { icon: '⚡', desc: packStrings.verbsDesc, count: 100 },
      adjectives: { icon: '🌟', desc: packStrings.adjectivesDesc, count: 100 },
      phrasal_verbs: { icon: '🔄', desc: packStrings.phrasalVerbsDesc, count: 100 },
    };
    const meta = PACK_META[collectionId] || PACK_META.idioms;
    const packIcon = meta.icon;
    const packDesc = meta.desc;
    const totalCount = Array.isArray(favoriteWords) ? favoriteWords.length : meta.count;
    const isItProLocked = isProPreviewPack && !isProActive();
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
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('collection_pack_download', { collection_id: collectionId });
        }
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
  const isItPreview = (collectionId === 'it_terms' || collectionId === 'finance_terms') && !isPro && favoriteWords.length > 6;
  const partialStep = getCollectionUnlockStep(collectionId);
  const isPartialPack = partialStep > 0 && !isPro;
  const partialUnlockedCount = isItPreview
    ? Math.min(favoriteWords.length, 6)
    : (isPartialPack ? Math.min(favoriteWords.length, getCollectionUnlockedCount(collectionId)) : favoriteWords.length);
  const visibleWords = (isItPreview || isPartialPack) ? favoriteWords.slice(0, partialUnlockedCount) : favoriteWords;
  const hasMoreToUnlock = isPartialPack && partialUnlockedCount < favoriteWords.length;
  const sProMore = (hasMoreToUnlock || isItPreview) ? getProStrings(getInterfaceLanguage()) : null;
  const packStringsMore = (hasMoreToUnlock || isItPreview) ? getDownloadablePackStrings() : null;

  const isVerbsCol = collectionId === 'verbs';
  const verbFilter = isVerbsCol && options._verbFilter === 'stative'
    ? 'stative'
    : 'action';
  const actionVerbCount = isVerbsCol
    ? visibleWords.filter((w) => !STATIVE_VERBS_SET.has(String(w.word || '').toLowerCase().trim())).length
    : 0;
  const stativeVerbCount = isVerbsCol
    ? visibleWords.filter((w) => STATIVE_VERBS_SET.has(String(w.word || '').toLowerCase().trim())).length
    : 0;
  const filteredVisibleWords = isVerbsCol
    ? visibleWords.filter((w) => {
        const isStative = STATIVE_VERBS_SET.has(String(w.word || '').toLowerCase().trim());
        return verbFilter === 'stative' ? isStative : !isStative;
      })
    : visibleWords;
  const verbFilterStrings = isVerbsCol ? getVerbFilterStrings(getInterfaceLanguage()) : null;

  const isPhrasalCol = collectionId === 'phrasal_verbs';
  const isPairCol = isPairCollection(collectionId);
  const effectivePageSize = isPhrasalCol ? 16 : (isPairCol ? 12 : PAGE_SIZE);

  const isPaginated = PAGINATED_COLLECTIONS.has(collectionId);
  let currentPage = options._currentPage !== undefined
    ? Number(options._currentPage)
    : (isPaginated ? loadSavedCollectionPage(collectionId) : 1);
  if (!Number.isFinite(currentPage) || currentPage < 1) currentPage = 1;

  const totalPages = isPaginated ? Math.max(1, Math.ceil(filteredVisibleWords.length / effectivePageSize)) : 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  if (isPaginated) {
    saveSavedCollectionPage(collectionId, currentPage);
  }

  const startIndex = isPaginated ? (currentPage - 1) * effectivePageSize : 0;
  const endIndex = isPaginated ? Math.min(startIndex + effectivePageSize, filteredVisibleWords.length) : filteredVisibleWords.length;
  const wordsToRender = isPaginated ? filteredVisibleWords.slice(startIndex, endIndex) : filteredVisibleWords;

  const mrStrings = getMicroRulesStrings(getInterfaceLanguage());
  const prevLabel = mrStrings.prevBtn || 'Previous';
  const nextLabel = mrStrings.nextBtn || 'Next';

  const paginationCtx = `collection_${collectionId}`;
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const pageButtons = pageNumbers.map((p) => {
    if (p === '...') {
      return `<span class="col-page-ellipsis">…</span>`;
    }
    const isAdGated = p !== currentPage && AdService.willShowPaginationAd(paginationCtx, p);
    return `
      <button
        type="button"
        class="col-page-btn ${p === currentPage ? 'is-active' : (isAdGated ? 'is-ad-gated' : '')}"
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
  ` : '';

  const heartIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="none" aria-hidden="true" style="flex-shrink: 0;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const trashIconSvg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  const repeatBtnText = (t('fav_practice_btn') || '').replace(/^🔥\s*/, '');
  const headerCountText = (hasMoreToUnlock || isItPreview) ? `${partialUnlockedCount} / ${favoriteWords.length}` : `${favoriteWords.length}`;

  const formatIpa = (tr) => {
    const clean = String(tr || '').trim().replace(/^\/+|\/+$/g, '').replace(/^\[+|\]+$/g, '').trim();
    return clean ? `[${clean}]` : '';
  };

  const renderPairCardsHtml = () => {
    const pairCards = [];
    for (let i = 0; i < wordsToRender.length; i += 2) {
      const wordA = wordsToRender[i];
      const wordB = wordsToRender[i + 1];
      if (!wordA) continue;

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
          <div class="pair-grid-row">
            ${renderSide(wordA, 'pair-side-a')}
            ${renderSide(wordB, 'pair-side-b')}
          </div>
        </div>
      `);
    }
    return pairCards.join('');
  };

  const renderPhrasalMindMapsHtml = () => {
    // Build fast lookup for base verb translations from allWords
    const baseWordMap = new Map();
    if (Array.isArray(allWords)) {
      for (const w of allWords) {
        const key = String(w?.word || '').trim().toLowerCase();
        if (key && !key.includes(' ') && !baseWordMap.has(key)) {
          baseWordMap.set(key, w);
        }
      }
    }

    // Group wordsToRender into clusters by root verb (max 4 branches per Mind-Map card)
    const groups = [];
    const singles = [];
    const byRoot = new Map();
    for (const w of wordsToRender) {
      const parts = String(w.word || '').trim().split(/\s+/);
      const root = (parts[0] || '').toLowerCase();
      if (!byRoot.has(root)) byRoot.set(root, []);
      byRoot.get(root).push(w);
    }
    for (const [root, list] of byRoot.entries()) {
      if (list.length >= 2) {
        for (let i = 0; i < list.length; i += 4) {
          const chunk = list.slice(i, i + 4);
          if (chunk.length >= 2) {
            groups.push({ root, items: chunk });
          } else {
            singles.push(...chunk);
          }
        }
      } else {
        singles.push(...list);
      }
    }

    const renderBranch = (w) => {
      const isFav = favSet.has(String(w.id));
      const tr = getWordTranslation(w);
      const raw = String(w.word || '').trim();
      const spIdx = raw.indexOf(' ');
      const verbPart = spIdx > 0 ? raw.slice(0, spIdx) : raw;
      const particlePart = spIdx > 0 ? raw.slice(spIdx + 1) : '';
      return `
        <div class="pv-branch-card" data-id="${w.id}">
          <div class="pv-branch-top">
            <span class="pv-branch-word" dir="ltr">${escapeHtml(verbPart)} <span class="pv-particle">${escapeHtml(particlePart)}</span></span>
            <div class="pv-branch-actions">
              <button type="button" class="fav-audio-btn pair-audio-btn" data-word="${escapeHtml(w.word)}" data-id="${w.id}" title="${t('fav_listen_tooltip') || 'Слушать произношение'}">🔊</button>
              <button type="button" class="fav-action-btn fav-toggle-btn fav-icon-btn pair-fav-btn ${isFav ? 'active' : ''}" data-id="${w.id}" title="${isFav ? (t('fav_remove_tooltip') || 'Удалить из избранного') : (t('fav_toggle') || 'В избранное')}">${isFav ? '❤️' : '🤍'}</button>
            </div>
          </div>
          <div class="pv-branch-tr">${escapeHtml(tr)}</div>
        </div>
      `;
    };

    const upArrowsSvg = `
      <svg class="pv-arrows-svg" viewBox="0 0 320 30" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 142 28 Q 108 22 76 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 73 12 L 75 5 L 82 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 178 28 Q 212 22 244 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 238 7 L 245 5 L 247 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const downArrows2Svg = `
      <svg class="pv-arrows-svg" viewBox="0 0 320 30" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 142 2 Q 108 8 76 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 73 18 L 75 25 L 82 23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 178 2 Q 212 8 244 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 238 23 L 245 25 L 247 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const downArrow1Svg = `
      <svg class="pv-arrows-svg" viewBox="0 0 320 26" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 160 2 L 160 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 155 16 L 160 22 L 165 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const mapCardsHtml = groups.map(({ root, items }) => {
      const topItems = items.slice(0, 2);
      const bottomItems = items.slice(2, 4);
      const baseWordObj = baseWordMap.get(root);
      const baseTr = baseWordObj ? getWordTranslation(baseWordObj) : '';
      const shortBaseTr = baseTr ? baseTr.split(',')[0].trim() : '';

      return `
        <div class="fav-card pv-map-card">
          <div class="pv-branch-row">
            ${topItems.map(renderBranch).join('')}
          </div>
          ${upArrowsSvg}
          <div class="pv-center-wrap">
            <button type="button" class="pv-center-pill fav-audio-btn" data-word="${escapeHtml(root)}" title="${t('fav_listen_tooltip') || 'Слушать произношение'}">
              <span class="pv-center-verb" dir="ltr">${escapeHtml(root.toUpperCase())}</span>
              ${shortBaseTr ? `<span class="pv-center-tr">${escapeHtml(shortBaseTr)}</span>` : ''}
            </button>
          </div>
          ${bottomItems.length > 0 ? `
            ${bottomItems.length === 2 ? downArrows2Svg : downArrow1Svg}
            <div class="pv-branch-row ${bottomItems.length === 1 ? 'is-single' : ''}">
              ${bottomItems.map(renderBranch).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const singlesHtml = singles.length > 0 ? `
      <div class="pv-singles-grid">
        ${singles.map(renderBranch).join('')}
      </div>
    ` : '';

    return mapCardsHtml + singlesHtml;
  };

  container.innerHTML = `
    <style>
      .pv-map-card { padding: 12px 10px 13px !important; display: flex; flex-direction: column; align-items: stretch; }
      .pv-branch-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; width: 100%; box-sizing: border-box; }
      .pv-branch-row.is-single { grid-template-columns: minmax(0, 240px); justify-content: center; }
      .pv-branch-card { display: flex; flex-direction: column; min-width: 0; padding: 9px 9px 10px; border-radius: 12px; background: var(--bg-hover, #f1f5f9); border: 1px solid var(--border-color, rgba(148, 163, 184, 0.24)); box-sizing: border-box; }
      body.dark-theme .pv-branch-card, .dark-theme .pv-branch-card, [data-theme="dark"] .pv-branch-card { background: rgba(255, 255, 255, 0.05); border-color: rgba(148, 163, 184, 0.18); }
      .pv-branch-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 3px; margin-bottom: 4px; }
      .pv-branch-word { font-size: 14.5px; font-weight: 800; color: var(--text-main, #0f172a); line-height: 1.2; overflow-wrap: anywhere; min-width: 0; }
      .pv-particle { color: var(--primary-color, #2563eb); }
      body.dark-theme .pv-particle, .dark-theme .pv-particle, [data-theme="dark"] .pv-particle { color: #38bdf8; }
      .pv-branch-actions { display: inline-flex; align-items: center; gap: 1px; flex-shrink: 0; }
      .pv-branch-tr { font-size: 12.5px; font-weight: 600; color: var(--text-muted, #475569); line-height: 1.32; overflow-wrap: anywhere; word-break: break-word; }
      body.dark-theme .pv-branch-tr, .dark-theme .pv-branch-tr, [data-theme="dark"] .pv-branch-tr { color: #cbd5e1; }
      .pv-arrows-svg { width: 100%; height: 26px; display: block; color: rgba(100, 116, 139, 0.55); pointer-events: none; }
      body.dark-theme .pv-arrows-svg, .dark-theme .pv-arrows-svg, [data-theme="dark"] .pv-arrows-svg { color: rgba(56, 189, 248, 0.55); }
      .pv-center-wrap { display: flex; justify-content: center; margin: 2px 0; }
      .pv-center-pill { width: auto !important; height: auto !important; min-width: 118px; padding: 8px 20px !important; border-radius: 16px !important; background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; color: #ffffff !important; border: none !important; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.32); display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; cursor: pointer; transition: transform 0.12s ease; }
      .pv-center-pill:active { transform: scale(0.96); }
      body.dark-theme .pv-center-pill, .dark-theme .pv-center-pill, [data-theme="dark"] .pv-center-pill { background: linear-gradient(135deg, #38bdf8, #0284c7) !important; color: #0f172a !important; box-shadow: 0 4px 16px rgba(56, 189, 248, 0.35); }
      .pv-center-verb { font-size: 18px; font-weight: 900; letter-spacing: 1.4px; line-height: 1.15; }
      .pv-center-tr { font-size: 11px; font-weight: 700; opacity: 0.88; line-height: 1.15; }
      .pv-singles-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; width: 100%; box-sizing: border-box; }
      .pair-card { padding: 10px 10px 11px !important; }
      .pair-grid-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; align-items: stretch; width: 100%; box-sizing: border-box; }
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
      body.dark-theme .pair-side-tr, .dark-theme .pair-side-tr, [data-theme="dark"] .pair-side-tr { color: #38bdf8; }
      .col-pagination { display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 18px; margin-bottom: 14px; flex-wrap: nowrap; }
      .col-page-btn { min-width: 34px; height: 36px; padding: 0 7px; border-radius: 10px; border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25)); background: var(--card-bg, #ffffff); color: var(--text-main, #0f172a); font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0; transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease; }
      .col-page-btn:active:not(:disabled) { transform: scale(0.96); }
      .col-page-btn:hover:not(:disabled) { border-color: var(--primary-color, #2563eb); }
      body.dark-theme .col-page-btn:hover:not(:disabled), .dark-theme .col-page-btn:hover:not(:disabled), [data-theme="dark"] .col-page-btn:hover:not(:disabled) { border-color: #38bdf8; }
      .col-page-btn.is-active { background: var(--primary-color, #2563eb); border-color: var(--primary-color, #2563eb); color: #ffffff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35); }
      body.dark-theme .col-page-btn.is-active, .dark-theme .col-page-btn.is-active, [data-theme="dark"] .col-page-btn.is-active { background: #38bdf8; border-color: #38bdf8; color: #0f172a; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.35); }
      .col-page-btn.is-ad-gated:not(.is-active):not(:disabled) { position: relative; background: linear-gradient(135deg, #f59e0b, #ea580c); border-color: #ea580c; color: #ffffff; box-shadow: 0 2px 7px rgba(234, 88, 12, 0.32); }
      .col-page-btn.is-ad-gated:not(.is-active):not(:disabled)::after { content: '🔒'; position: absolute; top: -5px; right: -4px; font-size: 9.5px; line-height: 1; pointer-events: none; filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35)); }
      .col-page-btn:disabled { opacity: 0.3; cursor: default; }
      .col-page-btn.col-page-nav { font-size: 18px; font-weight: 800; }
      .col-page-ellipsis { min-width: 18px; height: 36px; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted, #64748b); font-weight: 800; font-size: 14px; flex-shrink: 0; user-select: none; }
      .col-page-info { text-align: center; font-size: 12px; font-weight: 700; color: var(--text-muted, #64748b); margin-bottom: 12px; }
      .verb-filter-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
      .verb-filter-chip { border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.28)); background: var(--card-bg, #ffffff); color: var(--text-main, #0f172a); border-radius: 12px; padding: 8px 9px; font-size: 12px; font-weight: 700; cursor: pointer; text-align: center; line-height: 1.2; transition: all 0.15s ease; }
      body.dark-theme .verb-filter-chip, .dark-theme .verb-filter-chip, [data-theme="dark"] .verb-filter-chip { background: rgba(30, 41, 59, 0.72); color: #e2e8f0; border-color: rgba(148, 163, 184, 0.25); }
      .verb-filter-chip.is-active { background: #2563eb; border-color: #2563eb; color: #ffffff; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.28); }
      body.dark-theme .verb-filter-chip.is-active, .dark-theme .verb-filter-chip.is-active, [data-theme="dark"] .verb-filter-chip.is-active { background: #38bdf8; border-color: #38bdf8; color: #0f172a; box-shadow: 0 3px 10px rgba(56, 189, 248, 0.28); }
      .verb-stative-hint { margin: 0 0 10px; padding: 8px 11px; border-radius: 11px; font-size: 12.5px; font-weight: 600; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.22); color: #1d4ed8; }
      body.dark-theme .verb-stative-hint, .dark-theme .verb-stative-hint, [data-theme="dark"] .verb-stative-hint { background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8; }
    </style>
    <div class="favorites-page">
      ${backBtnHtml}
      <div class="page-header" style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <h2 style="font-size: 19px; font-weight: 700; margin: 0; white-space: nowrap; letter-spacing: -0.2px; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${escapeHtml(displayTitle)}: ${headerCountText}</h2>
      </div>

      <!-- 50% / 50% Actions Row -->
      <div class="col-top-actions-row" style="display: grid; grid-template-columns: ${(!isMyFavorites && !isPairCol && !isPhrasalCol) ? '1fr 1fr' : '1fr'}; gap: 8px; width: 100%; margin-bottom: 12px; box-sizing: border-box;">
        <button type="button" id="header-set-widget-btn" class="secondary-button ${isWidgetActive ? 'is-active-widget-btn' : ''}" style="width: 100%; min-width: 0; height: 42px; min-height: 42px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; cursor: pointer; ${isWidgetActive ? 'border: 1.5px solid #22c55e; color: #16a34a; background: rgba(34, 197, 94, 0.12);' : ''}">
          <span style="font-size: 15px;">${isWidgetActive ? '✓' : '📱'}</span>
          <span>${escapeHtml(t('col_pill_widget') || 'Виджет')}</span>
        </button>
        ${
          (!isMyFavorites && !isPairCol && !isPhrasalCol)
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

      ${isVerbsCol && verbFilterStrings ? `
        <div class="verb-filter-bar" role="tablist">
          <button type="button" class="verb-filter-chip ${verbFilter === 'action' ? 'is-active' : ''}" data-verb-filter="action">${escapeHtml(verbFilterStrings.action)} (${actionVerbCount})</button>
          <button type="button" class="verb-filter-chip ${verbFilter === 'stative' ? 'is-active' : ''}" data-verb-filter="stative">${escapeHtml(verbFilterStrings.stative)} (${stativeVerbCount})</button>
        </div>
        ${verbFilter === 'stative' ? `<p class="verb-stative-hint">⚡ ${escapeHtml(verbFilterStrings.stativeHint)}</p>` : ''}
      ` : ''}

      <div class="favorites-grid" id="favorites-grid">
        ${isPairCol ? renderPairCardsHtml() : (isPhrasalCol ? renderPhrasalMindMapsHtml() : wordsToRender
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
                const n = getWordNotes(word, null, {
                  hideItNotes: collectionId !== 'it_terms',
                  hideFinanceNotes: collectionId !== 'finance_terms',
                });
                return n ? `<p class="dict-notes">${escapeHtml(n)}</p>` : '';
              })()}
            </div>
          </div>
        `;
          })
          .join(''))}
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
            ${escapeHtml(collectionId === 'finance_terms' ? (packStringsMore.financeDesc || packStringsMore.itDesc) : packStringsMore.itDesc)}
          </p>
          <button type="button" id="open-it-pro-btn" class="primary-button btn-orange" style="min-height: 46px; padding: 0 24px; font-size: 15px; font-weight: 800; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; background: linear-gradient(135deg, #f59e0b, #ea580c); box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);">
            <span style="font-size: 17px;">⭐</span>
            <span>${escapeHtml(sProMore.pro_buy || 'PRO')}</span>
          </button>
        </div>
      ` : ''}
      ${(() => {
        const relRules = getRelatedMicroRulesForCollection(collectionId);
        if (!relRules || relRules.length === 0) return '';
        const cl = getCrossLinkStrings(getInterfaceLanguage());
        return `
          <div class="fav-cross-box" style="margin-top: 16px; padding: 12px 14px; border-radius: 16px; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, rgba(148, 163, 184, 0.24));">
            <div style="font-size: 12.5px; font-weight: 800; color: var(--text-muted, #64748b); margin-bottom: 8px;">${escapeHtml(cl.relatedRulesHeading || 'Связанные правила')}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 7px;">
              ${relRules.map((rid) => `
                <button type="button" class="fav-cross-rule-chip" data-fav-nav-rule="${rid}" style="border: 1px solid rgba(37, 99, 235, 0.32); background: rgba(37, 99, 235, 0.08); color: var(--primary-color, #2563eb); border-radius: 999px; padding: 6px 12px; font-size: 12.5px; font-weight: 700; cursor: pointer;">
                  ${escapeHtml(cl.microRulePrefix || '📖 Правило')} #${rid} →
                </button>
              `).join('')}
            </div>
          </div>
        `;
      })()}
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

  container.querySelectorAll('[data-col-page]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      const targetPage = Number(btn.getAttribute('data-col-page'));
      if (!targetPage || targetPage === currentPage || targetPage < 1 || targetPage > totalPages) return;
      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('collection_page_change', { collection_id: collectionId, page: targetPage });
      }
      if (!isProActive()) {
        try {
          await AdService.showPaginationInterstitial(`collection_${collectionId}`, targetPage);
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

  container.querySelectorAll('[data-fav-nav-rule]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const ruleId = Number(chip.getAttribute('data-fav-nav-rule'));
      if (!ruleId || typeof window === 'undefined' || typeof window._navigateToTopicLink !== 'function') return;
      navigateWithReturn(
        () => renderFavoritesView(favoriteWords, containerSelector, options),
        () => window._navigateToTopicLink({ targetType: 'grammar_microrules', ruleId }),
        `col_${collectionId}`
      );
    });
  });

  container.querySelector('#header-set-widget-btn')?.addEventListener('click', handleWidgetButtonClick);
  container.querySelector('#header-add-words-btn')?.addEventListener('click', triggerAddWords);

  if (isVerbsCol) {
    container.querySelectorAll('[data-verb-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextFilter = btn.getAttribute('data-verb-filter') || 'all';
        if (nextFilter === verbFilter) return;
        options._verbFilter = nextFilter;
        options._currentPage = 1;
        renderFavoritesView(favoriteWords, containerSelector, options);
      });
    });
  }

  // Bind practice button
  container.querySelector('#start-fav-practice-btn')?.addEventListener('click', () => {
    const currentWords = isVerbsCol
      ? filteredVisibleWords
      : ((visibleWords && visibleWords.length > 0)
        ? visibleWords
        : getCollectionWords(collectionId, allWords));
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
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('collection_pack_unlock_more', {
            collection_id: collectionId,
            unlocked_count: newCount,
          });
        }
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
      ProService.openPaywall(collectionId);
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
