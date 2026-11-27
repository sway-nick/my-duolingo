import {
  IRREGULAR_PACKS_UI_I18N,
  IRREGULAR_VERB_PACKS,
  getIrregularPacksStrings,
  getLocalizedPackText,
  groupIrregularVerbsByPack,
} from './irregularVerbsPacksData.js?v=423.0';
import { getInterfaceLanguage, getWordTranslation } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { getUserProgress, getUserFavorites, toggleFavoriteApi } from '../../services/api.js?v=423.0';
import { speakWord, triggerHaptic } from '../../services/audioService.js?v=423.0';
import { navigateWithReturn } from '../../services/navigationStack.js?v=423.0';
import { getRelatedMicroRulesForCollection, getCrossLinkStrings } from './crossLinksMap.js?v=423.0';

export { IRREGULAR_PACKS_UI_I18N, IRREGULAR_VERB_PACKS, getIrregularPacksStrings, groupIrregularVerbsByPack };

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitVerbForms(wordText) {
  const parts = String(wordText || '').trim().split(/\s+/).filter(Boolean);
  return {
    v1: parts[0] || String(wordText || ''),
    v2: parts[1] || '—',
    v3: parts.slice(2).join(' ') || '—',
  };
}

function getCefrBadgeStyle(cefr) {
  switch (cefr) {
    case 'A1':
      return 'background: rgba(34, 197, 94, 0.14); color: #15803d; border-color: rgba(34, 197, 94, 0.35);';
    case 'A2':
      return 'background: rgba(37, 99, 235, 0.12); color: #1d4ed8; border-color: rgba(37, 99, 235, 0.32);';
    default:
      return 'background: rgba(245, 158, 11, 0.15); color: #b45309; border-color: rgba(245, 158, 11, 0.35);';
  }
}

function resolveRelatedMicroRules(collectionId, crossStrings, uiStrings) {
  const ids = getRelatedMicroRulesForCollection(collectionId);
  const specialLabels = {
    35: uiStrings.microRule53Link,
    59: uiStrings.microRule77Link,
    79: uiStrings.microRule78Link,
  };
  const prefix = crossStrings?.microRulePrefix || '📖 #';
  return ids.map((id) => ({
    id,
    label: specialLabels[id] || `${prefix} #${id}`,
  }));
}

function getStylesHtml() {
  return `
    <style>
      .ivp-page {
        width: 100%;
        max-width: min(720px, 100%);
        min-width: 0;
        padding: 6px 12px calc(max(64px, var(--safe-bottom, env(safe-area-inset-bottom, 0px))) + 24px);
        margin: 0 auto;
        box-sizing: border-box;
        overflow-x: hidden;
      }
      .ivp-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }
      .ivp-progress-pill {
        font-size: 12.5px;
        font-weight: 800;
        color: #10b981;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.35);
        padding: 5px 11px;
        border-radius: 999px;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .ivp-hero {
        margin-bottom: 12px;
      }
      .ivp-hero-title {
        margin: 0 0 4px;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        line-height: 1.25;
      }
      .ivp-hero-sub {
        margin: 0;
        font-size: 13px;
        color: var(--text-muted, #64748b);
        line-height: 1.4;
      }
      .ivp-intro-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid rgba(37, 99, 235, 0.22);
        border-radius: 16px;
        padding: 13px 14px;
        margin-bottom: 14px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
      }
      body.dark-theme .ivp-intro-card,
      .dark-theme .ivp-intro-card,
      [data-theme="dark"] .ivp-intro-card {
        border-color: rgba(56, 189, 248, 0.32);
      }
      .ivp-intro-title {
        margin: 0 0 6px;
        font-size: 14.5px;
        font-weight: 800;
        color: #1d4ed8;
      }
      body.dark-theme .ivp-intro-title,
      .dark-theme .ivp-intro-title,
      [data-theme="dark"] .ivp-intro-title {
        color: #38bdf8;
      }
      .ivp-intro-diff {
        margin: 0 0 10px;
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--text-main, #334155);
      }
      .ivp-intro-forms {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ivp-intro-form-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        line-height: 1.4;
        color: var(--text-muted, #475569);
        background: var(--bg-hover, #f8fafc);
        border-radius: 10px;
        padding: 7px 9px;
      }
      body.dark-theme .ivp-intro-form-row,
      .dark-theme .ivp-intro-form-row,
      [data-theme="dark"] .ivp-intro-form-row {
        background: rgba(15, 23, 42, 0.45);
        color: #cbd5e1;
      }
      .ivp-intro-badge {
        flex-shrink: 0;
        font-size: 11px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(37, 99, 235, 0.12);
        color: #1d4ed8;
      }
      body.dark-theme .ivp-intro-badge,
      .dark-theme .ivp-intro-badge,
      [data-theme="dark"] .ivp-intro-badge {
        background: rgba(56, 189, 248, 0.16);
        color: #38bdf8;
      }
      .ivp-pack-chip.is-completed:not(.is-active) {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.12);
        color: #15803d;
      }
      body.dark-theme .ivp-pack-chip.is-completed:not(.is-active),
      .dark-theme .ivp-pack-chip.is-completed:not(.is-active),
      [data-theme="dark"] .ivp-pack-chip.is-completed:not(.is-active) {
        border-color: rgba(74, 222, 128, 0.75);
        background: rgba(34, 197, 94, 0.16);
        color: #86efac;
      }
      .ivp-pack-section.is-completed .ivp-mnemonic-card {
        border: 2px solid #22c55e;
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.22);
      }
      .ivp-chips-scroll {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
        width: 100%;
        box-sizing: border-box;
      }
      .ivp-pack-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        border: 1.5px solid var(--border-color, #e2e8f0);
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #334155);
        border-radius: 999px;
        padding: 6px 11px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        max-width: 100%;
        box-sizing: border-box;
        transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .ivp-pack-chip:active { transform: scale(0.97); }
      .ivp-pack-chip.is-active {
        background: var(--primary-color, #2563eb);
        border-color: var(--primary-color, #2563eb);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
      }
      body.dark-theme .ivp-pack-chip.is-active,
      .dark-theme .ivp-pack-chip.is-active,
      [data-theme="dark"] .ivp-pack-chip.is-active {
        background: #38bdf8;
        border-color: #38bdf8;
        color: #0f172a;
      }
      .ivp-chip-count {
        opacity: 0.85;
        font-size: 11px;
        font-variant-numeric: tabular-nums;
      }
      .ivp-pack-section {
        margin-bottom: 18px;
      }
      .ivp-mnemonic-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid rgba(37, 99, 235, 0.25);
        border-radius: 16px;
        padding: 14px;
        margin-bottom: 10px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
        box-sizing: border-box;
      }
      body.dark-theme .ivp-mnemonic-card,
      .dark-theme .ivp-mnemonic-card,
      [data-theme="dark"] .ivp-mnemonic-card {
        background: var(--card-bg, #1e293b);
        border-color: rgba(56, 189, 248, 0.3);
      }
      .ivp-mnemonic-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 6px;
      }
      .ivp-mnemonic-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .ivp-pack-icon {
        font-size: 20px;
        line-height: 1;
      }
      .ivp-pack-title {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
      }
      .ivp-cefr-badge {
        font-size: 11px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 999px;
        border: 1px solid;
      }
      body.dark-theme .ivp-cefr-badge,
      .dark-theme .ivp-cefr-badge,
      [data-theme="dark"] .ivp-cefr-badge {
        filter: brightness(1.25);
      }
      .ivp-pattern-badge {
        font-size: 11.5px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-main, #334155);
      }
      .ivp-mnemonic-text {
        margin: 6px 0 10px;
        font-size: 13px;
        line-height: 1.45;
        color: var(--text-main, #334155);
      }
      .ivp-mnemonic-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .ivp-pack-stat {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted, #64748b);
      }
      .ivp-learn-btn {
        border: none;
        border-radius: 12px;
        padding: 9px 15px;
        font-size: 13.5px;
        font-weight: 800;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 3px 10px rgba(22, 163, 74, 0.25);
      }
      .ivp-learn-btn:active { transform: scale(0.97); }
      .ivp-actions-right {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .ivp-toggle-circle-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.35));
        background: var(--bg-hover, rgba(148, 163, 184, 0.12));
        color: var(--text-main, #0f172a);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        padding: 0;
        transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      }
      .ivp-toggle-circle-btn:active { transform: scale(0.92); }
      body.dark-theme .ivp-toggle-circle-btn,
      .dark-theme .ivp-toggle-circle-btn,
      [data-theme="dark"] .ivp-toggle-circle-btn {
        background: rgba(148, 163, 184, 0.14);
        border-color: rgba(148, 163, 184, 0.32);
        color: #e2e8f0;
      }
      .ivp-collapse-bottom-wrap {
        display: flex;
        justify-content: center;
        margin-top: 10px;
      }
      .ivp-collapse-bottom-btn {
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.35));
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #334155);
        border-radius: 12px;
        padding: 8px 18px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.12s ease, background 0.15s ease;
      }
      .ivp-collapse-bottom-btn:active { transform: scale(0.96); }
      body.dark-theme .ivp-collapse-bottom-btn,
      .dark-theme .ivp-collapse-bottom-btn,
      [data-theme="dark"] .ivp-collapse-bottom-btn {
        background: rgba(30, 41, 59, 0.85);
        border-color: rgba(148, 163, 184, 0.3);
        color: #e2e8f0;
      }
      .ivp-table-head {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr)) 68px;
        gap: 6px;
        padding: 0 12px 6px;
        font-size: 10.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--text-muted, #64748b);
      }
      .ivp-table-head-col.is-highlighted {
        color: #ea580c;
      }
      body.dark-theme .ivp-table-head-col.is-highlighted,
      .dark-theme .ivp-table-head-col.is-highlighted,
      [data-theme="dark"] .ivp-table-head-col.is-highlighted {
        color: #fbbf24;
      }
      .ivp-verb-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ivp-verb-row {
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 14px;
        padding: 10px 12px;
        box-sizing: border-box;
      }
      .ivp-verb-row.is-mastered {
        border-color: rgba(16, 185, 129, 0.45);
      }
      .ivp-verb-main {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
      }
      .ivp-forms-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
        min-width: 0;
      }
      .ivp-form-cell {
        background: var(--bg-hover, #f1f5f9);
        border-radius: 9px;
        padding: 6px 8px;
        font-size: 13.5px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        text-align: center;
        overflow-wrap: anywhere;
        border: 1px solid transparent;
      }
      .ivp-form-cell.is-v1 {
        color: var(--primary-color, #2563eb);
      }
      body.dark-theme .ivp-form-cell.is-v1,
      .dark-theme .ivp-form-cell.is-v1,
      [data-theme="dark"] .ivp-form-cell.is-v1 {
        color: #38bdf8;
      }
      .ivp-form-cell.is-highlighted {
        background: rgba(245, 158, 11, 0.18);
        border-color: rgba(245, 158, 11, 0.55);
        color: #b45309;
      }
      body.dark-theme .ivp-form-cell.is-highlighted,
      .dark-theme .ivp-form-cell.is-highlighted,
      [data-theme="dark"] .ivp-form-cell.is-highlighted {
        background: rgba(245, 158, 11, 0.22);
        border-color: rgba(251, 191, 36, 0.6);
        color: #fde68a;
      }
      .ivp-row-actions {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .ivp-icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
        background: var(--bg-hover, #f8fafc);
        font-size: 15px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .ivp-icon-btn:active { transform: scale(0.94); }
      .ivp-verb-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 6px;
        font-size: 12.5px;
      }
      .ivp-verb-tr {
        color: var(--text-muted, #64748b);
        font-weight: 600;
        overflow-wrap: anywhere;
      }
      .ivp-verb-trans {
        font-size: 11.5px;
        color: var(--text-muted, #94a3b8);
        flex-shrink: 0;
      }
      .ivp-mastered-tag {
        color: #10b981;
        font-weight: 800;
        font-size: 11.5px;
        flex-shrink: 0;
      }
      .ivp-related-box {
        margin-top: 20px;
        padding: 14px;
        border-radius: 16px;
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
      }
      .ivp-related-heading {
        font-size: 13px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin: 0 0 10px;
      }
      .ivp-related-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .ivp-related-chip {
        border: 1.5px solid rgba(99, 102, 241, 0.3);
        background: rgba(99, 102, 241, 0.08);
        color: #4338ca;
        border-radius: 11px;
        padding: 7px 11px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        text-align: start;
      }
      body.dark-theme .ivp-related-chip,
      .dark-theme .ivp-related-chip,
      [data-theme="dark"] .ivp-related-chip {
        background: rgba(99, 102, 241, 0.18);
        border-color: rgba(129, 140, 248, 0.4);
        color: #c7d2fe;
      }
      .ivp-related-chip.is-tense {
        border-color: rgba(234, 88, 12, 0.35);
        background: rgba(234, 88, 12, 0.09);
        color: #c2410c;
      }
      body.dark-theme .ivp-related-chip.is-tense,
      .dark-theme .ivp-related-chip.is-tense,
      [data-theme="dark"] .ivp-related-chip.is-tense {
        background: rgba(56, 189, 248, 0.14);
        border-color: rgba(56, 189, 248, 0.38);
        color: #38bdf8;
      }
    </style>
  `;
}

const COLLAPSE_BTN_I18N = {
  ar: 'طي القائمة',
  bn: 'তালিকা সংকুচিত করুন',
  bg: 'Свий списъка',
  zh: '收起列表',
  hr: 'Sažmi popis',
  cs: 'Sbalit seznam',
  da: 'Skjul liste',
  en: 'Collapse',
  et: 'Ahenda',
  fi: 'Piilota',
  fr: 'Réduire',
  de: 'Einklappen',
  el: 'Σύμπτυξη',
  hi: 'समेटें',
  hu: 'Összecsukás',
  id: 'Tutup',
  it: 'Comprimi',
  ja: '閉じる',
  kk: 'Жасыру',
  ko: '접기',
  lv: 'Sakļaut',
  lt: 'Suskleisti',
  fa: 'بستن فهرست',
  pl: 'Zwiń',
  pt: 'Recolher',
  'pt-br': 'Recolher',
  ro: 'Restrânge',
  ru: 'Свернуть',
  sk: 'Zbaliť',
  sl: 'Strni',
  es: 'Contraer',
  'es-mx': 'Contraer',
  sv: 'Fäll ihop',
  th: 'ย่อรายการ',
  tr: 'Daralt',
  uk: 'Згорнути',
  ur: 'سمیٹیں',
  vi: 'Thu gọn',
};

function getCollapseLabel(lang) {
  const raw = String(lang || 'en').toLowerCase().trim();
  return COLLAPSE_BTN_I18N[raw] || COLLAPSE_BTN_I18N[raw.split(/[-_]/)[0]] || COLLAPSE_BTN_I18N.en;
}

export function renderIrregularVerbsPacksView(allWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onBack = () => {},
    onStartPractice = null,
    onNavigateLink = null,
    initialPackId = 'all',
    highlightForm = null,
    favoriteIds = [],
    onFavoriteToggle = null,
  } = options;

  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('irregular_verbs_packs', 'IrregularVerbsPacksView');
  }

  const lang = getInterfaceLanguage() || 'en';
  const baseLang = String(lang).toLowerCase().split(/[-_]/)[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getIrregularPacksStrings(lang);
  const crossStrings = getCrossLinkStrings(lang);

  const packs = groupIrregularVerbsByPack(allWords);
  const firstPackId = packs[0]?.id || 'pack_aaa';
  const validPackIds = new Set(packs.map((p) => p.id));
  let activePackId = validPackIds.has(initialPackId) ? initialPackId : firstPackId;
  const expandedPacks = new Set();
  const collapseLabel = getCollapseLabel(lang);

  const normalizedHighlight = String(highlightForm || '').trim().toUpperCase();
  const isHighlightV2 = normalizedHighlight === 'V2';
  const isHighlightV3 = normalizedHighlight === 'V3';

  const storedFavs = Array.isArray(favoriteIds) && favoriteIds.length > 0
    ? favoriteIds
    : (typeof getUserFavorites === 'function' ? getUserFavorites() : []);
  const favSet = new Set((storedFavs || []).map(String));

  const getProgressMap = () => {
    try {
      return typeof getUserProgress === 'function' ? getUserProgress() : {};
    } catch (_) {
      return {};
    }
  };

  const restoreSelf = () =>
    renderIrregularVerbsPacksView(allWords, containerSelector, {
      ...options,
      initialPackId: activePackId,
      favoriteIds: Array.from(favSet),
    });

  function render() {
    const progressMap = getProgressMap();
    const isMasteredWord = (w) => {
      const p = progressMap[w.id] || progressMap[String(w.id)];
      return Boolean(p && p.mastered);
    };

    const allIrregularWords = packs.flatMap((p) => p.words);
    const totalCount = allIrregularWords.length;
    const totalMastered = allIrregularWords.filter(isMasteredWord).length;

    const chipsHtml = packs.map((pack) => {
      const pMastered = pack.words.filter(isMasteredWord).length;
      const pDone = pack.words.length > 0 && pMastered >= pack.words.length;
      const pTitle = getLocalizedPackText(pack.title, lang);
      return `
        <button type="button" class="ivp-pack-chip ${activePackId === pack.id ? 'is-active' : ''} ${pDone ? 'is-completed' : ''}" data-pack-id="${escapeHtml(pack.id)}">
          <span>${pDone ? '✅' : escapeHtml(pack.icon)}</span>
          <span>${escapeHtml(pTitle)}</span>
          <span class="ivp-chip-count" dir="ltr">${pMastered}/${pack.words.length}</span>
        </button>
      `;
    }).join('');

    const visiblePacks = packs.filter((p) => p.id === activePackId);

    const packsHtml = visiblePacks.map((pack) => {
      const pTitle = getLocalizedPackText(pack.title, lang);
      const pMnemonic = getLocalizedPackText(pack.mnemonic, lang);
      const pMastered = pack.words.filter(isMasteredWord).length;

      const rowsHtml = pack.words.map((w) => {
        const { v1, v2, v3 } = splitVerbForms(w.word);
        const mastered = isMasteredWord(w);
        const isFav = favSet.has(String(w.id));
        const translation = getWordTranslation(w) || w.translation || '';
        const trans = w.transcription ? `/${String(w.transcription).replace(/^\/|\/$/g, '')}/` : '';

        return `
          <div class="ivp-verb-row ${mastered ? 'is-mastered' : ''}" data-word-id="${escapeHtml(w.id)}">
            <div class="ivp-verb-main">
              <div class="ivp-forms-grid" dir="ltr">
                <span class="ivp-form-cell is-v1">${escapeHtml(v1)}</span>
                <span class="ivp-form-cell ${isHighlightV2 ? 'is-highlighted' : ''}">${escapeHtml(v2)}</span>
                <span class="ivp-form-cell ${isHighlightV3 ? 'is-highlighted' : ''}">${escapeHtml(v3)}</span>
              </div>
              <div class="ivp-row-actions">
                <button type="button" class="ivp-icon-btn ivp-audio-btn" data-word="${escapeHtml(w.word)}" data-id="${escapeHtml(w.id)}" aria-label="Listen">🔊</button>
                <button type="button" class="ivp-icon-btn ivp-fav-btn ${isFav ? 'active' : ''}" data-id="${escapeHtml(w.id)}" aria-label="Favorite">${isFav ? '❤️' : '🤍'}</button>
              </div>
            </div>
            <div class="ivp-verb-meta">
              <span class="ivp-verb-tr">${escapeHtml(translation)}</span>
              <span style="display:inline-flex;align-items:center;gap:6px;">
                ${trans ? `<span class="ivp-verb-trans" dir="ltr">${escapeHtml(trans)}</span>` : ''}
                ${mastered ? `<span class="ivp-mastered-tag">✓ ${escapeHtml(s.masteredLabel)}</span>` : ''}
              </span>
            </div>
          </div>
        `;
      }).join('');

      const packDone = pack.words.length > 0 && pMastered >= pack.words.length;
      const isExpanded = expandedPacks.has(pack.id);
      const chevronDownSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      const chevronUpSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
      return `
        <section class="ivp-pack-section ${packDone ? 'is-completed' : ''}" data-pack-section="${escapeHtml(pack.id)}">
          <div class="ivp-mnemonic-card">
            <div class="ivp-mnemonic-top">
              <div class="ivp-mnemonic-title-wrap">
                <span class="ivp-pack-icon">${escapeHtml(pack.icon)}</span>
                <h3 class="ivp-pack-title">${escapeHtml(pTitle)}</h3>
                <span class="ivp-cefr-badge" style="${getCefrBadgeStyle(pack.cefr)}">${escapeHtml(pack.cefr)}</span>
              </div>
              <span class="ivp-pattern-badge" dir="ltr">${escapeHtml(pack.patternBadge)}</span>
            </div>
            <p class="ivp-mnemonic-text">${escapeHtml(pMnemonic)}</p>
            <div class="ivp-mnemonic-actions">
              <span class="ivp-pack-stat">${escapeHtml(s.masteredLabel)}: <strong dir="ltr">${pMastered} / ${pack.words.length}</strong></span>
              <div class="ivp-actions-right">
                <button type="button" class="ivp-toggle-circle-btn" data-toggle-pack-list="${escapeHtml(pack.id)}" aria-expanded="${isExpanded ? 'true' : 'false'}" aria-label="${escapeHtml(isExpanded ? collapseLabel : pTitle)}" title="${escapeHtml(isExpanded ? collapseLabel : pTitle)}">
                  ${isExpanded ? chevronUpSvg : chevronDownSvg}
                </button>
                <button type="button" class="ivp-learn-btn" data-learn-pack="${escapeHtml(pack.id)}">
                  ${escapeHtml(s.learnPackBtn)}
                </button>
              </div>
            </div>
          </div>

          ${isExpanded ? `
            <div class="ivp-verb-list">${rowsHtml}</div>

            <div class="ivp-collapse-bottom-wrap">
              <button type="button" class="ivp-collapse-bottom-btn" data-collapse-pack-list="${escapeHtml(pack.id)}">
                ${chevronUpSvg}
                <span>${escapeHtml(collapseLabel)}</span>
              </button>
            </div>
          ` : ''}
        </section>
      `;
    }).join('');

    const relatedRules = resolveRelatedMicroRules('irregular_verbs_packs', crossStrings, s);
    const relatedHtml = `
      <div class="ivp-related-box">
        <div class="ivp-related-heading">🔗 ${escapeHtml(crossStrings.relatedHeading || s.relatedHeading)}</div>
        <div class="ivp-related-chips">
          <button type="button" class="ivp-related-chip is-tense" data-nav-tense="past_simple">
            ${escapeHtml(s.pastSimpleLink)}
          </button>
          <button type="button" class="ivp-related-chip is-tense" data-nav-tense="present_perfect">
            ${escapeHtml(s.presentPerfectLink)}
          </button>
          ${relatedRules.map((rule) => `
            <button type="button" class="ivp-related-chip" data-nav-rule="${escapeHtml(rule.id)}">
              ${escapeHtml(rule.label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="ivp-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="ivp-topbar">
          <button type="button" id="fav-view-back-btn" class="eb-back-pill-btn">‹ ${escapeHtml(s.backBtn)}</button>
          <span class="ivp-progress-pill" dir="ltr">✓ ${totalMastered} / ${totalCount}</span>
        </div>
        <div class="ivp-hero">
          <h2 class="ivp-hero-title">⚡ ${escapeHtml(s.hubTitle)}</h2>
          <p class="ivp-hero-sub">${escapeHtml(s.hubSubtitle)}</p>
        </div>
        ${s.introTitle ? `
          <div class="ivp-intro-card">
            <h3 class="ivp-intro-title">${escapeHtml(s.introTitle)}</h3>
            <p class="ivp-intro-diff">${escapeHtml(s.introDiff || '')}</p>
            <div class="ivp-intro-forms">
              <div class="ivp-intro-form-row"><span class="ivp-intro-badge" dir="ltr">V1</span><span>${escapeHtml(s.introV1Desc || '')}</span></div>
              <div class="ivp-intro-form-row"><span class="ivp-intro-badge" dir="ltr">V2</span><span>${escapeHtml(s.introV2Desc || '')}</span></div>
              <div class="ivp-intro-form-row"><span class="ivp-intro-badge" dir="ltr">V3</span><span>${escapeHtml(s.introV3Desc || '')}</span></div>
            </div>
          </div>
        ` : ''}
        <div class="ivp-chips-scroll">${chipsHtml}</div>
        ${packsHtml}
        ${relatedHtml}
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => onBack());

    container.querySelectorAll('[data-pack-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextId = btn.getAttribute('data-pack-id') || firstPackId;
        if (nextId === activePackId) return;
        activePackId = nextId;
        try { triggerHaptic('selection'); } catch (_) {}
        render();
      });
    });

    container.querySelectorAll('[data-toggle-pack-list]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-toggle-pack-list');
        if (!pid) return;
        if (expandedPacks.has(pid)) expandedPacks.delete(pid);
        else expandedPacks.add(pid);
        try { triggerHaptic('selection'); } catch (_) {}
        render();
      });
    });

    container.querySelectorAll('[data-collapse-pack-list]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-collapse-pack-list');
        if (!pid) return;
        expandedPacks.delete(pid);
        try { triggerHaptic('selection'); } catch (_) {}
        render();
        const sec = container.querySelector(`[data-pack-section="${pid}"]`);
        if (sec && typeof sec.scrollIntoView === 'function') {
          sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    container.querySelectorAll('[data-learn-pack]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const packId = btn.getAttribute('data-learn-pack');
        const pack = packs.find((p) => p.id === packId);
        if (!pack || !pack.words || pack.words.length === 0) return;
        const packTitle = getLocalizedPackText(pack.title, lang);
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('irregular_pack_practice_start', { pack_id: pack.id, words_count: pack.words.length });
        }
        if (typeof onStartPractice === 'function') {
          navigateWithReturn(
            restoreSelf,
            () => onStartPractice(pack.words, pack.id, packTitle),
            pack.id
          );
        }
      });
    });

    container.querySelectorAll('.ivp-audio-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        const id = btn.getAttribute('data-id');
        if (word) speakWord(word, id);
      });
    });

    container.querySelectorAll('.ivp-fav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (!id) return;
        const nextFav = !favSet.has(String(id));
        if (nextFav) favSet.add(String(id));
        else favSet.delete(String(id));

        btn.textContent = nextFav ? '❤️' : '🤍';
        btn.classList.toggle('active', nextFav);
        try { triggerHaptic('light'); } catch (_) {}
        toggleFavoriteApi(id, nextFav).catch(() => {});
        if (typeof onFavoriteToggle === 'function') {
          onFavoriteToggle(id, nextFav);
        }
      });
    });

    container.querySelectorAll('[data-nav-tense]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tenseId = btn.getAttribute('data-nav-tense');
        if (!tenseId) return;
        navigateWithReturn(
          restoreSelf,
          () => onNavigateLink?.({ targetType: 'tense_construction', targetId: tenseId, tenseId }),
          'irregular_verbs_packs'
        );
      });
    });

    container.querySelectorAll('[data-nav-rule]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ruleId = Number(btn.getAttribute('data-nav-rule'));
        if (!Number.isFinite(ruleId)) return;
        navigateWithReturn(
          restoreSelf,
          () => onNavigateLink?.({ targetType: 'grammar_microrules', ruleId }),
          'irregular_verbs_packs'
        );
      });
    });
  }

  render();
}
