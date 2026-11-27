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
  BUILTIN_COLLECTIONS_WITH_GEAR,
  isBuiltinCollectionOverridden,
  resetBuiltinCollection,
  isCollectionPackDownloaded,
  getDownloadablePackStrings,
  getCollectionUnlockStep,
  getCollectionUnlockedCount,
} from '../../services/collectionsService.js?v=423.0';
import { openAddWordsToCollectionModal } from '../modals/AddWordsToCollectionModal.js?v=423.0';
import { getTimeTrainerStrings } from './TimeTrainerView.js?v=423.0';
import { getNumbersFolderStrings } from './NumbersFolderView.js?v=423.0';
import { PREPOSITIONS_META_I18N } from './prepositionsData.js?v=423.0';
import { PRONOUNS_META_I18N } from './pronounsData.js?v=423.0';
import { CONJUNCTIONS_META_I18N } from './conjunctionsData.js?v=423.0';
import { getIrregularPacksStrings } from './irregularVerbsPacksData.js?v=423.0';
import { PREPOSITIONS_GROUPS } from './prepositionsData.js?v=423.0';
import { PRONOUNS_GROUPS } from './pronounsData.js?v=423.0';
import { CONJUNCTIONS_SECTIONS } from './conjunctionsData.js?v=423.0';
import { getUserProgress, isWordMastered } from '../../services/api.js?v=423.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { isProActive } from '../../services/proState.js?v=423.0';
import { ProService } from '../../services/proService.js?v=423.0';

export function renderCollectionsHubView(allWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (window.trackScreen) {
    window.trackScreen('collections_hub', 'CollectionsHubView');
  }

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
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const wordLabel = (count) => {
    const lang = (getInterfaceLanguage() || 'ru').toLowerCase();
    const abs = Math.abs(count);
    const mod10 = abs % 10;
    const mod100 = abs % 100;

    if (lang === 'ru') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} слов`;
      if (mod10 === 1) return `${count} слово`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
      return `${count} слов`;
    }
    if (lang === 'uk') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} слів`;
      if (mod10 === 1) return `${count} слово`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} слова`;
      return `${count} слів`;
    }
    if (lang === 'pl') {
      if (count === 1) return `${count} słowo`;
      if (mod100 >= 12 && mod100 <= 14) return `${count} słów`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} słowa`;
      return `${count} słów`;
    }
    if (lang === 'cs') {
      if (count === 1) return `${count} slovo`;
      if (count >= 2 && count <= 4) return `${count} slova`;
      return `${count} slov`;
    }
    if (lang === 'sk') {
      if (count === 1) return `${count} slovo`;
      if (count >= 2 && count <= 4) return `${count} slová`;
      return `${count} slov`;
    }
    if (lang === 'sl') {
      if (mod100 === 1) return `${count} beseda`;
      if (mod100 === 2) return `${count} besedi`;
      if (mod100 === 3 || mod100 === 4) return `${count} besede`;
      return `${count} besed`;
    }
    if (lang === 'hr') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} riječi`;
      if (mod10 === 1) return `${count} riječ`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} riječi`;
      return `${count} riječi`;
    }
    if (lang === 'bg') {
      return count === 1 ? `${count} дума` : `${count} думи`;
    }
    if (lang === 'de') {
      return count === 1 ? `${count} Wort` : `${count} Wörter`;
    }
    if (lang === 'es') {
      return count === 1 ? `${count} palabra` : `${count} palabras`;
    }
    if (lang === 'pt') {
      return count === 1 ? `${count} palavra` : `${count} palavras`;
    }
    if (lang === 'fr') {
      return count === 1 ? `${count} mot` : `${count} mots`;
    }
    if (lang === 'it') {
      return count === 1 ? `${count} parola` : `${count} parole`;
    }
    if (lang === 'tr') {
      return `${count} kelime`;
    }
    if (lang === 'ro') {
      return count === 1 ? `${count} cuvânt` : `${count} cuvinte`;
    }
    if (lang === 'hu') {
      return `${count} szó`;
    }
    if (lang === 'el') {
      return count === 1 ? `${count} λέξη` : `${count} λέξεις`;
    }
    if (lang === 'da' || lang === 'sv') {
      return `${count} ord`;
    }
    if (lang === 'lv') {
      return count === 1 ? `${count} vārds` : `${count} vārdi`;
    }
    if (lang === 'lt') {
      if (mod100 >= 11 && mod100 <= 19) return `${count} žodžių`;
      if (mod10 === 1) return `${count} žodis`;
      return `${count} žodžiai`;
    }
    if (lang === 'fi') {
      return count === 1 ? `${count} sana` : `${count} sanaa`;
    }
    if (lang === 'et') {
      return count === 1 ? `${count} sõna` : `${count} sõna`;
    }
    if (lang === 'hi') {
      return `${count} शब्द`;
    }
    if (lang === 'zh') {
      return `${count} 个单词`;
    }
    if (lang === 'bn') {
      return `${count} শব্দ`;
    }
    if (lang === 'ur') {
      return `${count} الفاظ`;
    }
    if (lang === 'fa') {
      return `${count} کلمه`;
    }
    if (lang === 'ar') {
      if (count === 1) return `كلمة واحدة`;
      if (count === 2) return `كلمتان`;
      if (count >= 3 && count <= 10) return `${count} كلمات`;
      return `${count} كلمة`;
    }
    if (lang === 'id') {
      return `${count} kata`;
    }
    if (lang === 'vi') {
      return `${count} từ`;
    }
    if (lang === 'th') {
      return `${count} คำ`;
    }
    if (lang === 'ko') {
      return `${count}개 단어`;
    }
    if (lang === 'ja') {
      return `${count}単語`;
    }
    if (lang === 'kk') {
      return `${count} сөз`;
    }
    return count === 1 ? `${count} word` : `${count} words`;
  };

  const lang = getInterfaceLanguage();
  const timeStrings = getTimeTrainerStrings(lang);
  const normLang = String(lang || 'ru').toLowerCase();
  const baseLang = normLang.split('-')[0];
  const pickMeta = (map) => map[normLang] || map[baseLang] || map.en || {};
  const numbersStrings = getNumbersFolderStrings(lang);
  const prepMeta = pickMeta(PREPOSITIONS_META_I18N);
  const pronMeta = pickMeta(PRONOUNS_META_I18N);
  const conjMeta = pickMeta(CONJUNCTIONS_META_I18N);
  const irrStrings = getIrregularPacksStrings(lang);

  let hubProg = {};
  let completedColsSet = new Set();
  let gramRefDoneSet = new Set();
  try { hubProg = getUserProgress() || {}; } catch (_) {}
  try {
    const rc = typeof localStorage !== 'undefined' ? localStorage.getItem('myduo_completed_collections') : null;
    const ac = rc ? JSON.parse(rc) : [];
    if (Array.isArray(ac)) completedColsSet = new Set(ac.map(String));
    const rg = typeof localStorage !== 'undefined' ? localStorage.getItem('myduo_grammar_ref_done') : null;
    const ag = rg ? JSON.parse(rg) : [];
    if (Array.isArray(ag)) gramRefDoneSet = new Set(ag.map(String));
  } catch (_) {}

  const areWordsCompleted = (words) =>
    Array.isArray(words) &&
    words.length > 0 &&
    words.every((w) => w && w.id != null && isWordMastered(hubProg[w.id] || hubProg[String(w.id)]));

  const isCollectionCompleted = (id, wordsOpt = null) => {
    if (id === 'numbers_hub') {
      return isCollectionCompleted('numbers') && isCollectionCompleted('ordinal_numbers');
    }
    if (id === 'grammar_prepositions') {
      return PREPOSITIONS_GROUPS.every((g) => gramRefDoneSet.has(`prepositions:${g.id}`));
    }
    if (id === 'grammar_pronouns') {
      return gramRefDoneSet.has('pronouns:matrix') && PRONOUNS_GROUPS.every((g) => gramRefDoneSet.has(`pronouns:${g.id}`));
    }
    if (id === 'grammar_conjunctions') {
      const keys = [];
      CONJUNCTIONS_SECTIONS.forEach((sec) => {
        if (Array.isArray(sec.groups)) sec.groups.forEach((g) => keys.push(`conjunctions:${g.id}`));
        else keys.push(`conjunctions:${sec.id}`);
      });
      return keys.length > 0 && keys.every((k) => gramRefDoneSet.has(k));
    }
    if (id === 'irregular_verbs_packs') {
      const irrWords = (allWords || []).filter((w) => w && w.category === 'Irregular verbs');
      return areWordsCompleted(irrWords);
    }
    if (completedColsSet.has(String(id))) return true;
    const list = wordsOpt || getCollectionWords(id, allWords);
    return areWordsCompleted(list);
  };

  const completedBadgeHtml = (done) => (done ? '<span class="col-tile-done-badge" aria-label="Completed">✅</span>' : '');

  container.innerHTML = `
    <style>
      .col-tile { position: relative; }
      .col-tile.is-completed {
        border: 2px solid #22c55e !important;
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.24) !important;
      }
      .col-tile-done-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 14px;
        line-height: 1;
        z-index: 2;
      }
    </style>
    <div class="collections-hub-page">
      <!-- 2-Column Grid -->
      <div class="collections-grid" id="collections-grid">
        <!-- 1. Add New Custom List Tile (Top Left) -->
        <div class="col-tile col-tile-add" id="btn-add-new-collection" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon col-add-plus">➕</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(t('col_add_new_list') || 'Новый список')}</h3>
            <span class="col-tile-count">${escapeHtml(t('col_custom_desc') || 'Своя подборка')}</span>
          </div>
        </div>

        <!-- 2. My Favorites Tile (Top Right, right of New List) -->
        <div class="col-tile ${activeColId === 'my_favorites' ? 'is-active-col' : ''}" data-col-id="my_favorites" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">⭐</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(summary.myFavorites.title)}</h3>
            <span class="col-tile-count">${wordLabel(summary.myFavorites.count)}</span>
          </div>
        </div>

        <!-- 3. Time Listening Lab Folder Tile -->
        <div class="col-tile col-tile-time" data-col-id="time_trainer" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🕒</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(timeStrings.folderTitle || 'Время')}</h3>
            <span class="col-tile-count">${escapeHtml(timeStrings.folderSubtitle || '6 режимов')}</span>
          </div>
        </div>

        <!-- 3b. Combined Numbers & Ordinals Folder Tile -->
        <div class="col-tile ${isCollectionCompleted('numbers_hub') ? 'is-completed' : ''}" data-col-id="numbers_hub" role="button" tabindex="0">
          ${completedBadgeHtml(isCollectionCompleted('numbers_hub'))}
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🔢</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(numbersStrings.folderTitle || 'Числа и числительные')}</h3>
            <span class="col-tile-count">${escapeHtml(numbersStrings.folderSubtitle || '2 подпапки')}</span>
          </div>
        </div>

        <!-- 3c. Grammar Reference Collections & Irregular Verbs Packs -->
        <div class="col-tile ${isCollectionCompleted('grammar_prepositions') ? 'is-completed' : ''}" data-col-id="grammar_prepositions" role="button" tabindex="0">${completedBadgeHtml(isCollectionCompleted('grammar_prepositions'))}
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🧭</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(prepMeta.tileTitle || 'Предлоги')}</h3>
            <span class="col-tile-count">${escapeHtml(prepMeta.tileSubtitle || '9 групп')}</span>
          </div>
        </div>

        <div class="col-tile ${isCollectionCompleted('grammar_pronouns') ? 'is-completed' : ''}" data-col-id="grammar_pronouns" role="button" tabindex="0">${completedBadgeHtml(isCollectionCompleted('grammar_pronouns'))}
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">👤</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(pronMeta.tileTitle || 'Местоимения')}</h3>
            <span class="col-tile-count">${escapeHtml(pronMeta.tileSubtitle || 'Таблица и 7 групп')}</span>
          </div>
        </div>

        <div class="col-tile ${isCollectionCompleted('grammar_conjunctions') ? 'is-completed' : ''}" data-col-id="grammar_conjunctions" role="button" tabindex="0">${completedBadgeHtml(isCollectionCompleted('grammar_conjunctions'))}
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🔗</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(conjMeta.tileTitle || 'Союзы и наречия')}</h3>
            <span class="col-tile-count">${escapeHtml(conjMeta.tileSubtitle || '4 раздела')}</span>
          </div>
        </div>

        <div class="col-tile ${isCollectionCompleted('irregular_verbs_packs') ? 'is-completed' : ''}" data-col-id="irregular_verbs_packs" role="button" tabindex="0">${completedBadgeHtml(isCollectionCompleted('irregular_verbs_packs'))}
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">⚡</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(irrStrings.hubTitle || 'Неправильные глаголы')}</h3>
            <span class="col-tile-count">${escapeHtml(irrStrings.hubSubtitle || '10 пачек')}</span>
          </div>
        </div>

        <!-- 3. User Custom Collections -->
        ${summary.customCollections
          .map(
            (col) => `
          <div class="col-tile col-tile-custom ${activeColId === col.id ? 'is-active-col' : ''} ${isCollectionCompleted(col.id, getCollectionWords(col.id, allWords)) ? 'is-completed' : ''}" data-col-id="${escapeHtml(col.id)}" role="button" tabindex="0">${completedBadgeHtml(isCollectionCompleted(col.id, getCollectionWords(col.id, allWords)))}
            <div class="col-tile-icon-box">
              <span class="col-tile-icon">${escapeHtml(col.icon || '📘')}</span>
            </div>
            <div class="col-tile-content">
              <h3 class="col-tile-name">${escapeHtml(col.title)}</h3>
              <span class="col-tile-count">${wordLabel(col.count)}</span>
            </div>
          </div>
        `
          )
          .join('')}

        <!-- 4. Thematic Built-in Collections (2 per row, excluding merged numbers/ordinal_numbers) -->
        ${summary.builtinCollections
          .filter((col) => col.id !== 'numbers' && col.id !== 'ordinal_numbers')
          .map(
            (col) => {
              const isPro = isProActive();
              const isItProLocked = (col.id === 'it_terms' || col.id === 'finance_terms') && !isPro;
              const unlockStep = getCollectionUnlockStep(col.id);
              const isPartial = unlockStep > 0 && !isPro;
              const partialUnlocked = isPartial ? Math.min(col.count, getCollectionUnlockedCount(col.id)) : col.count;
              const isDownloaded = isCollectionPackDownloaded(col.id);
              const packStrings = !isDownloaded && !isItProLocked ? getDownloadablePackStrings(lang) : null;
              let countSubtitle;
              if (isItProLocked) {
                countSubtitle = '⭐ PRO';
              } else if (isPartial) {
                if (partialUnlocked === 0) {
                  countSubtitle = `🎬 ${escapeHtml(packStrings.downloadBtn)} (+${unlockStep})`;
                } else if (partialUnlocked < col.count) {
                  countSubtitle = `${partialUnlocked} / ${col.count}`;
                } else {
                  countSubtitle = wordLabel(col.count);
                }
              } else {
                countSubtitle = isDownloaded
                  ? wordLabel(col.count)
                  : `🎬 ${escapeHtml(packStrings.downloadBtn)}`;
              }
              return `
          <div class="col-tile ${activeColId === col.id ? 'is-active-col' : ''} ${isCollectionCompleted(col.id) ? 'is-completed' : ''}" data-col-id="${escapeHtml(col.id)}" role="button" tabindex="0">${completedBadgeHtml(isCollectionCompleted(col.id))}
            <div class="col-tile-icon-box">
              <span class="col-tile-icon">${escapeHtml(col.icon)}</span>
            </div>
            <div class="col-tile-content">
              <h3 class="col-tile-name">${escapeHtml(col.title)}</h3>
              <span class="col-tile-count">${countSubtitle}</span>
            </div>
          </div>
        `;
            }
          )
          .join('')}
      </div>
    </div>
  `;

  // Long-press and click handling on grid tiles
  const gridEl = container.querySelector('#collections-grid');
  if (!gridEl) return;

  function findColData(colId) {
    if (colId === 'my_favorites') {
      return { col: summary.myFavorites, isCustom: false };
    }
    const custom = summary.customCollections.find((c) => c.id === colId);
    if (custom) return { col: custom, isCustom: true };
    const builtin = summary.builtinCollections.find((c) => c.id === colId);
    if (builtin) return { col: builtin, isCustom: false };
    return null;
  }

  let pressTimer = null;
  let startX = 0;
  let startY = 0;
  let activePointerId = null;
  let didLongPress = false;

  function cancelLongPress() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    activePointerId = null;
  }

  gridEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const tile = e.target.closest('.col-tile');
    if (!tile || tile.id === 'btn-add-new-collection') return;

    cancelLongPress();
    didLongPress = false;
    startX = e.clientX;
    startY = e.clientY;
    activePointerId = e.pointerId;

    const colId = tile.getAttribute('data-col-id');
    const colData = findColData(colId);
    if (!colData) return;

    pressTimer = setTimeout(() => {
      didLongPress = true;
      pressTimer = null;
      try {
        if (navigator.vibrate) navigator.vibrate(40);
      } catch (_) {}
      if ((colData.col.id === 'it_terms' || colData.col.id === 'finance_terms') && !isProActive()) {
        ProService.openPaywall(colData.col.id);
        return;
      }
      openCollectionActionsModal(colData.col, colData.isCustom);
    }, 500);
  });

  gridEl.addEventListener('pointermove', (e) => {
    if (!pressTimer || e.pointerId !== activePointerId) return;
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist > 10) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('pointerup', (e) => {
    if (e.pointerId === activePointerId) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('pointercancel', (e) => {
    if (e.pointerId === activePointerId) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('pointerleave', (e) => {
    if (e.pointerId === activePointerId) {
      cancelLongPress();
    }
  });

  gridEl.addEventListener('contextmenu', (e) => {
    const tile = e.target.closest('.col-tile');
    if (!tile) return;
    e.preventDefault();
    if (tile.id === 'btn-add-new-collection') return;
    if (didLongPress) return;
    const colId = tile.getAttribute('data-col-id');
    const colData = findColData(colId);
    if (colData) {
      openCollectionActionsModal(colData.col, colData.isCustom);
    }
  });

  gridEl.addEventListener('click', (e) => {
    const tile = e.target.closest('.col-tile');
    if (!tile) return;

    if (didLongPress) {
      e.stopPropagation();
      e.preventDefault();
      didLongPress = false;
      return;
    }

    if (tile.id === 'btn-add-new-collection') {
      openCreateCollectionPrompt();
      return;
    }

    const colId = tile.getAttribute('data-col-id');
    if (colId) {
      onOpenCardsView(colId);
    }
  });

  gridEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest('.col-tile');
      if (!tile) return;
      e.preventDefault();
      if (tile.id === 'btn-add-new-collection') {
        openCreateCollectionPrompt();
      } else {
        const colId = tile.getAttribute('data-col-id');
        if (colId) onOpenCardsView(colId);
      }
    }
  });

  // Dialog to create a new collection
  function openCreateCollectionPrompt() {
    const promptText = t('col_create_prompt') || 'Введите название нового списка (например «Урок 1»):';
    const name = window.prompt(promptText, '');
    if (!name || !name.trim()) return;

    const trimmedName = Array.from(name.trim()).slice(0, 20).join('');
    const newCol = createCustomCollection(trimmedName, '📘');
    if (newCol) {
      if (window.trackEvent) {
        window.trackEvent('collection_create', { collection_id: newCol.id, name: trimmedName });
      }
      onOpenCardsView(newCol.id);
    }
  }

  // Manage actions modal for custom and built-in collections (33-locale support)
  function openCollectionActionsModal(col, isCustom = false) {
    if (window.trackScreen) {
      window.trackScreen('collection_actions_modal', 'CollectionActionsModal', { collection_id: col.id });
    }

    const existingModal = document.querySelector('#col-actions-modal-overlay');
    if (existingModal) existingModal.remove();

    const isOverridden = !isCustom && isBuiltinCollectionOverridden(col.id);
    const titleTemplate = isCustom ? t('col_menu_title_list') : t('col_menu_title_collection');
    const titleText = (titleTemplate || (isCustom ? 'Список «{name}»' : 'Подборка «{name}»')).replace('{name}', col.title);
    const isWidgetActive = getActiveCollectionId() === col.id;

    const modalRoot = document.createElement('div');
    modalRoot.id = 'col-actions-modal-overlay';
    modalRoot.className = 'modal-overlay col-actions-modal-overlay';
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
      <div class="modal-content col-actions-modal-card">
        <div class="col-actions-modal-header">
          <h3 class="col-actions-modal-title">${escapeHtml(titleText)}</h3>
          <button type="button" class="col-actions-modal-close" id="col-actions-close-btn" aria-label="${escapeHtml(t('col_menu_cancel') || 'Отмена')}">✕</button>
        </div>
        <div class="col-actions-modal-body">
          <button type="button" class="col-action-item-btn" id="col-btn-view">
            <span class="col-action-item-icon">✏️</span>
            <span class="col-action-item-text">${escapeHtml(t('col_menu_edit') || 'Изменить')}</span>
          </button>
          ${
            isCustom
              ? `
          <button type="button" class="col-action-item-btn" id="col-btn-rename">
            <span class="col-action-item-icon">✏️</span>
            <span class="col-action-item-text">${escapeHtml(t('col_menu_rename') || 'Переименовать')}</span>
          </button>
          <button type="button" class="col-action-item-btn col-action-item-danger" id="col-btn-delete">
            <span class="col-action-item-icon">🗑️</span>
            <span class="col-action-item-text">${escapeHtml(t('col_menu_delete') || 'Удалить список')}</span>
          </button>
          `
              : ''
          }
          ${
            !isCustom && isOverridden
              ? `
          <button type="button" class="col-action-item-btn" id="col-btn-reset">
            <span class="col-action-item-icon">🔄</span>
            <span class="col-action-item-text">${escapeHtml(t('col_reset_to_default') || 'Сбросить к исходным')}</span>
          </button>
          `
              : ''
          }
        </div>
        <div class="col-actions-modal-footer">
          <button type="button" class="secondary-button" id="col-btn-cancel" style="width: 100%; padding: 12px 16px; font-size: 15px; border-radius: 12px;">
            ${escapeHtml(t('col_menu_cancel') || 'Отмена')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalRoot);
    requestAnimationFrame(() => modalRoot.classList.add('is-open'));

    function close() {
      modalRoot.classList.remove('is-open');
      setTimeout(() => modalRoot.remove(), 200);
    }

    modalRoot.querySelector('#col-actions-close-btn')?.addEventListener('click', close);
    modalRoot.querySelector('#col-btn-cancel')?.addEventListener('click', close);
    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot) close();
    });

    modalRoot.querySelector('#col-btn-view')?.addEventListener('click', () => {
      close();
      onOpenCardsView(col.id);
    });

    modalRoot.querySelector('#col-btn-set-widget')?.addEventListener('click', () => {
      close();
      if (window.trackEvent) {
        window.trackEvent('collection_set_widget', { collection_id: col.id });
      }
      setActiveCollectionId(col.id);
      syncCollectionToAndroidWidget(col.id, allWords);
      renderCollectionsHubView(allWords, containerSelector, options);
    });

    if (isCustom) {
      modalRoot.querySelector('#col-btn-rename')?.addEventListener('click', () => {
        close();
        const renamePromptText = t('col_menu_rename_prompt') || 'Новое название списка:';
        const newName = window.prompt(renamePromptText, col.title);
        if (newName && newName.trim()) {
          if (window.trackEvent) {
            window.trackEvent('collection_rename', { collection_id: col.id });
          }
          renameCustomCollection(col.id, newName.trim(), undefined, allWords);
          renderCollectionsHubView(allWords, containerSelector, options);
        }
      });

      modalRoot.querySelector('#col-btn-delete')?.addEventListener('click', () => {
        close();
        const deleteConfirmTemplate = t('col_menu_delete_confirm') || 'Удалить список «{name}»?';
        const deleteConfirmText = deleteConfirmTemplate.replace('{name}', col.title);
        if (window.confirm(deleteConfirmText)) {
          if (window.trackEvent) {
            window.trackEvent('collection_delete', { collection_id: col.id });
          }
          deleteCustomCollection(col.id, allWords);
          renderCollectionsHubView(allWords, containerSelector, options);
        }
      });
    } else if (isOverridden) {
      modalRoot.querySelector('#col-btn-reset')?.addEventListener('click', () => {
        close();
        if (window.trackEvent) {
          window.trackEvent('collection_reset', { collection_id: col.id });
        }
        resetBuiltinCollection(col.id);
        if (getActiveCollectionId() === col.id) {
          syncCollectionToAndroidWidget(col.id, allWords);
        }
        renderCollectionsHubView(allWords, containerSelector, options);
      });
    }
  }
}
