import {
  getTenseConstructionsStrings,
  getMicroRulesStrings,
  TENSE_CONSTRUCTIONS_I18N,
} from './grammarUiTranslations.js?v=386.0';
import {
  TENSE_CONSTRUCTIONS,
  getLocalizedTenseConstruction,
} from './tenseConstructionsData.js?v=386.0';
import {
  speakTextInLangAsync,
  stopAllAudio,
  getSavedVoiceAccent,
  triggerHaptic,
  playSuccessSound,
  playErrorSound,
} from '../../services/audioService.js?v=386.0';
import { addWeeklyXP, getUserProgress } from '../../services/api.js?v=386.0';
import { getInterfaceLanguage, t } from '../../services/i18n.js?v=386.0';
import AdService from '../../services/adService.js?v=386.0';
import { isProActive, getTestLearnedCount, PRO_LIMITS } from '../../services/proState.js?v=386.0';
import { ProService } from '../../services/proService.js?v=386.0';
import { getProStrings } from '../../services/proI18n.js?v=386.0';
import { formatQuizBlankedHtml, bindQuizWordPopover, closeQuizWordPopover } from './quizWordPopover.js?v=386.0';

export { TENSE_CONSTRUCTIONS_I18N, getTenseConstructionsStrings };

const STORAGE_KEY_DONE = 'myduo_tenses_done';
const STORAGE_KEY_QUIZ_DONE = 'myduo_tenses_quiz_done';
const STORAGE_KEY_UNLOCKED = 'myduo_tenses_unlocked';
const RTL_LOCALES = new Set(['ar', 'fa', 'ur']);

function loadIdsFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (_) {
    return new Set();
  }
}

function saveIdsToStorage(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (_) {}
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadDoneIds() {
  return loadIdsFromStorage(STORAGE_KEY_DONE);
}

function saveDoneIds(set) {
  saveIdsToStorage(STORAGE_KEY_DONE, set);
}

function loadQuizDoneSet() {
  return loadIdsFromStorage(STORAGE_KEY_QUIZ_DONE);
}

function saveQuizDoneSet(set) {
  saveIdsToStorage(STORAGE_KEY_QUIZ_DONE, set);
}

function loadUnlockedSet() {
  const set = loadIdsFromStorage(STORAGE_KEY_UNLOCKED);
  set.add('present_simple');
  return set;
}

function saveUnlockedSet(set) {
  saveIdsToStorage(STORAGE_KEY_UNLOCKED, set);
}

function getLevelBadgeColor(level) {
  switch (level) {
    case 'A1': return 'background: rgba(34,197,94,0.16); color: var(--tc-a1-color, #15803d); border-color: rgba(34,197,94,0.35);';
    case 'A2': return 'background: var(--tc-accent-soft); color: var(--tc-accent); border-color: var(--tc-accent-border);';
    case 'B1': return 'background: rgba(245,158,11,0.16); color: var(--tc-b1-color, #b45309); border-color: rgba(245,158,11,0.35);';
    default: return 'background: rgba(168,85,247,0.16); color: var(--tc-b2-color, #7e22ce); border-color: rgba(168,85,247,0.35);';
  }
}

function getStylesHtml() {
  return `
    <style>
      .tc-page {
        --tc-accent: #c2410c;
        --tc-accent-soft: rgba(234, 88, 12, 0.11);
        --tc-accent-border: rgba(234, 88, 12, 0.42);
        --tc-accent-ring: rgba(234, 88, 12, 0.22);
        --tc-purpose-bg: rgba(234, 88, 12, 0.06);
        --tc-purpose-border: rgba(234, 88, 12, 0.22);
        --tc-surface-muted: rgba(148, 163, 184, 0.12);
        --tc-formula-color: #9a3412;
        --tc-tab-gradient: linear-gradient(135deg, #f97316, #ea580c);
        --tc-tab-shadow: 0 2px 8px rgba(234, 88, 12, 0.28);
        --tc-a1-color: #15803d;
        --tc-b1-color: #b45309;
        --tc-b2-color: #7e22ce;
        padding: 4px 16px calc(max(52px, var(--safe-bottom, env(safe-area-inset-bottom, 0px))) + 20px);
        width: 100%;
        max-width: 720px;
        min-width: 0;
        margin: 0 auto;
        box-sizing: border-box;
        overflow-x: hidden;
      }
      body.dark-theme .tc-page,
      .dark-theme .tc-page,
      [data-theme="dark"] .tc-page {
        --tc-accent: #38bdf8;
        --tc-accent-soft: rgba(56, 189, 248, 0.16);
        --tc-accent-border: rgba(56, 189, 248, 0.42);
        --tc-accent-ring: rgba(56, 189, 248, 0.25);
        --tc-purpose-bg: rgba(56, 189, 248, 0.08);
        --tc-purpose-border: rgba(56, 189, 248, 0.22);
        --tc-surface-muted: rgba(15, 23, 42, 0.22);
        --tc-formula-color: #38bdf8;
        --tc-tab-gradient: linear-gradient(135deg, #2563eb, #1d4ed8);
        --tc-tab-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        --tc-a1-color: #22c55e;
        --tc-b1-color: #f59e0b;
        --tc-b2-color: #c084fc;
      }
      .tc-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
      }
      .tc-back-btn {
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25));
        color: var(--text-main, #f8fafc);
        border-radius: 12px;
        padding: 7px 14px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .tc-back-btn:active { transform: scale(0.97); }
      .tc-progress-pill {
        font-size: 13px;
        font-weight: 800;
        color: #10b981;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.35);
        padding: 6px 12px;
        border-radius: 999px;
        font-variant-numeric: tabular-nums;
      }
      .tc-hero {
        margin-bottom: 14px;
      }
      .tc-hero-title {
        font-size: 22px;
        font-weight: 800;
        color: var(--text-main);
        margin: 0 0 6px;
      }
      .tc-hero-sub {
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--text-muted);
        margin: 0;
      }
      .tc-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: var(--card-bg, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
        border-radius: 14px;
        padding: 4px;
        margin-bottom: 12px;
      }
      .tc-tab-btn {
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 13.5px;
        font-weight: 700;
        padding: 9px 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .tc-tab-btn.is-active {
        background: var(--tc-tab-gradient);
        color: #ffffff;
        box-shadow: var(--tc-tab-shadow);
      }
      .tc-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
      }
      .tc-filter-btn {
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
        background: var(--card-bg, rgba(30, 41, 59, 0.65));
        color: var(--text-main);
        font-size: 12.5px;
        font-weight: 700;
        padding: 6px 11px;
        border-radius: 999px;
        cursor: pointer;
      }
      .tc-filter-btn.is-active {
        background: var(--tc-accent-soft);
        border-color: var(--tc-accent);
        color: var(--tc-accent);
      }
      .tc-cards-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .tc-card {
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.22));
        border-radius: 18px;
        padding: 16px;
        scroll-margin-top: 84px;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        box-sizing: border-box;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .tc-card.is-highlighted {
        border-color: var(--tc-accent);
        box-shadow: 0 0 0 3px var(--tc-accent-ring);
      }
      .tc-card.is-done {
        border-color: rgba(16, 185, 129, 0.45);
      }
      .tc-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }
      .tc-card-title-wrap {
        min-width: 0;
      }
      .tc-card-title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tc-card-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--text-main);
        margin: 0;
      }
      .tc-level-badge {
        font-size: 11px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid transparent;
      }
      .tc-card-sub {
        font-size: 13px;
        color: var(--text-muted);
        margin: 4px 0 0;
      }
      .tc-done-btn {
        flex-shrink: 0;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.3));
        background: transparent;
        color: var(--text-muted);
        border-radius: 10px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .tc-done-btn.is-done {
        background: rgba(16, 185, 129, 0.16);
        border-color: #10b981;
        color: #10b981;
      }
      .tc-section {
        margin-top: 12px;
      }
      .tc-section-label {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: var(--text-muted);
        margin-bottom: 6px;
      }
      .tc-purpose-box {
        background: var(--tc-purpose-bg);
        border: 1px solid var(--tc-purpose-border);
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--text-main);
      }
      .tc-formula-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
        background: var(--tc-surface-muted);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
        border-radius: 12px;
        padding: 10px 12px;
      }
      .tc-formula-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
      }
      .tc-formula-key {
        font-weight: 700;
        color: var(--text-muted);
      }
      .tc-formula-val {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-weight: 700;
        color: var(--tc-formula-color);
        direction: ltr;
        unicode-bidi: isolate;
      }
      .tc-markers-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        direction: ltr;
      }
      .tc-marker-chip {
        font-size: 12px;
        font-weight: 600;
        background: rgba(148, 163, 184, 0.14);
        border: 1px solid rgba(148, 163, 184, 0.22);
        color: var(--text-main);
        padding: 3px 9px;
        border-radius: 999px;
      }
      .tc-examples-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .tc-example-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(148, 163, 184, 0.08);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.16));
        border-radius: 12px;
        padding: 9px 11px;
      }
      .tc-speak-btn {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid var(--tc-accent-border);
        background: var(--tc-accent-soft);
        color: var(--tc-accent);
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tc-speak-btn:active { transform: scale(0.94); }
      .tc-speak-btn.is-speaking {
        background: var(--tc-accent-ring);
        border-color: var(--tc-accent);
      }
      .tc-example-body {
        min-width: 0;
        flex: 1;
      }
      .tc-example-en {
        font-size: 14.5px;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.35;
        direction: ltr;
        text-align: left;
      }
      .tc-example-tr {
        font-size: 13px;
        color: var(--text-muted);
        margin-top: 2px;
        line-height: 1.35;
      }
      .tc-example-note {
        display: inline-block;
        margin-top: 4px;
        font-size: 11.5px;
        font-weight: 600;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.12);
        padding: 2px 7px;
        border-radius: 6px;
      }
      .tc-matrix-hint {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 10px;
      }
      .tc-matrix-scroll {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-radius: 16px;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.22));
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        margin-bottom: 14px;
        box-sizing: border-box;
      }
      .tc-matrix-table {
        width: 100%;
        min-width: 600px;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .tc-matrix-table th,
      .tc-matrix-table td {
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
        padding: 9px 8px;
        vertical-align: top;
        text-align: left;
      }
      .tc-matrix-table td.is-done {
        box-shadow: inset 0 0 0 1.5px rgba(16, 185, 129, 0.85);
        background: rgba(16, 185, 129, 0.08);
      }
      .tc-matrix-table th {
        background: rgba(37, 99, 235, 0.12);
        color: var(--text-main);
        font-weight: 800;
      }
      .tc-matrix-th-sub {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .tc-matrix-rowhead {
        font-weight: 800;
        color: var(--text-main);
        background: rgba(148, 163, 184, 0.08);
        width: 105px;
      }
      .tc-matrix-cell-btn {
        width: 100%;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        text-align: left;
        cursor: pointer;
        color: inherit;
        font: inherit;
      }
      .tc-matrix-cell-btn:hover .tc-matrix-cell-title {
        color: var(--tc-accent);
        text-decoration: underline;
      }
      .tc-matrix-cell-title {
        display: block;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 3px;
        direction: ltr;
      }
      .tc-matrix-cell-formula {
        display: block;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 11.5px;
        color: var(--tc-formula-color);
        direction: ltr;
      }
      .tc-special-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
        gap: 8px;
      }
      .tc-special-chip-btn {
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.22));
        border-radius: 12px;
        padding: 10px 12px;
        text-align: left;
        cursor: pointer;
        color: var(--text-main);
      }
      .tc-special-chip-btn:hover {
        border-color: var(--tc-accent);
      }
      .tc-special-chip-btn.is-done {
        border-color: rgba(16, 185, 129, 0.75);
        background: rgba(16, 185, 129, 0.08);
      }
      .tc-quiz-section {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed var(--border-color, rgba(148, 163, 184, 0.25));
      }
      .tc-quiz-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 9px;
      }
      .tc-quiz-title {
        font-size: 12.5px;
        font-weight: 800;
        color: #f59e0b;
      }
      .tc-quiz-badge {
        font-size: 11px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(34, 197, 94, 0.16);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.35);
      }
      .tc-quiz-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .tc-quiz-item {
        background: rgba(148, 163, 184, 0.06);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
        border-radius: 12px;
        padding: 10px 11px;
      }
      .tc-quiz-item.is-solved {
        border-color: rgba(34, 197, 94, 0.38);
        background: rgba(34, 197, 94, 0.05);
      }
      .tc-quiz-q-en {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.4;
        direction: ltr;
        text-align: left;
      }
      .tc-quiz-filled {
        color: #22c55e;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .tc-quiz-q-tr {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
        line-height: 1.35;
      }
      .tc-quiz-opts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
        margin-top: 8px;
        direction: ltr;
      }
      .tc-quiz-opt {
        padding: 7px 10px;
        border-radius: 9px;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.28));
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        color: var(--text-main);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
        transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .tc-quiz-opt:hover:not(:disabled) {
        border-color: var(--tc-accent);
      }
      .tc-quiz-opt.is-correct {
        background: rgba(34, 197, 94, 0.18);
        border-color: #22c55e;
        color: #22c55e;
      }
      .tc-quiz-opt.is-wrong {
        background: rgba(239, 68, 68, 0.16);
        border-color: #ef4444;
        color: #ef4444;
        opacity: 0.75;
      }
      .tc-quiz-opt:disabled {
        cursor: default;
      }
      .tc-card.is-locked {
        opacity: 0.94;
      }
      .tc-unlock-btn {
        width: 100%;
        margin-top: 10px;
        border: none;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
      }
      .tc-card.is-collapsed {
        padding-bottom: 12px;
        cursor: pointer;
      }
      .tc-collapsed-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 4px;
      }
      .tc-collapsed-row .tc-card-title-wrap {
        flex: 1;
        min-width: 0;
      }
      .tc-expand-btn {
        border: 1.5px solid var(--tc-accent-border);
        background: var(--tc-accent-soft);
        color: var(--tc-accent);
        font-size: 12px;
        font-weight: 800;
        padding: 6px 12px;
        border-radius: 999px;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .tc-expand-btn.is-collapse {
        width: 32px;
        height: 32px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      }
      .tc-card-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid rgba(148, 163, 184, 0.14);
      }
    </style>
  `;
}

const COLLAPSE_BTN_I18N = {
  ru: 'Свернуть', uk: 'Згорнути', en: 'Collapse', de: 'Einklappen',
  es: 'Contraer', 'es-mx': 'Contraer', fr: 'Réduire', pl: 'Zwiń',
  tr: 'Daralt', it: 'Comprimi', ro: 'Restrânge', bg: 'Свиване',
  hu: 'Összecsukás', el: 'Σύμπτυξη', da: 'Skjul', lv: 'Sakļaut',
  lt: 'Suskleisti', pt: 'Recolher', 'pt-br': 'Recolher', sk: 'Zbaliť',
  sl: 'Strni', fi: 'Pienennä', hr: 'Sažmi', cs: 'Sbalit',
  sv: 'Fäll ihop', et: 'Ahenda', hi: 'समेकें', bn: 'সংকুচিত করুন',
  ar: 'طي', fa: 'جمع کردن', ur: 'سمیٹیں', id: 'Ciutkan',
  vi: 'Thu gọn', th: 'ย่อ', ko: '접기', ja: '折りたたむ',
  zh: '收起', kk: 'Жию',
};

const LEARN_BTN_I18N = {
  ru: 'Учить', uk: 'Вчити', en: 'Learn', de: 'Lernen',
  es: 'Aprender', 'es-mx': 'Aprender', fr: 'Apprendre', pl: 'Ucz się',
  tr: 'Öğren', it: 'Impara', ro: 'Învață', bg: 'Учи',
  hu: 'Tanulás', el: 'Μάθε', da: 'Lær', lv: 'Mācīties',
  lt: 'Mokytis', pt: 'Aprender', 'pt-br': 'Aprender', sk: 'Učiť sa',
  sl: 'Uči se', fi: 'Opi', hr: 'Uči', cs: 'Učit se',
  sv: 'Lär', et: 'Õpi', hi: 'सीखें', bn: 'শিখুন',
  ar: 'تعلّم', fa: 'یادگیری', ur: 'سیکھیں', id: 'Pelajari',
  vi: 'Học', th: 'เรียน', ko: '학습', ja: '学ぶ',
  zh: '学习', kk: 'Үйрену',
};

export function renderTenseConstructionsView(containerSelector = '#app-content', options = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!container) return;

  const { onBack = () => {} } = options;
  const rawLang = (getInterfaceLanguage() || 'ru').toLowerCase();
  const baseLang = rawLang.split('-')[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getTenseConstructionsStrings(rawLang);
  const mrStrings = getMicroRulesStrings(rawLang);
  const unlockBtnLabel = mrStrings?.unlockRuleBtn || 'Открыть правило';
  const collapseBtnLabel = COLLAPSE_BTN_I18N[rawLang] || COLLAPSE_BTN_I18N[baseLang] || COLLAPSE_BTN_I18N.en;
  const learnBtnLabel = LEARN_BTN_I18N[rawLang] || LEARN_BTN_I18N[baseLang] || LEARN_BTN_I18N.en;

  let activeTab = 'list';
  let activeGroup = 'all';
  let focusedId = null;
  const doneSet = loadDoneIds();
  const unlockedSet = loadUnlockedSet();
  const quizDoneSet = loadQuizDoneSet();
  const expandedDoneSet = new Set();
  const collapsedOpenSet = new Set();
  const solvedQuestions = new Map();
  let audioSeq = 0;

  function scrollTenseCardToTop(id, smooth = false) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id;
    const card = container.querySelector(`[data-tense-card="${escapedId}"]`);
    if (!card || typeof card.getBoundingClientRect !== 'function') return;
    const headerEl = document.querySelector('.mobile-header, header, .app-header, .top-bar');
    const safeTop = typeof getComputedStyle === 'function'
      ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0)
      : 0;
    const headerBottom = headerEl && typeof headerEl.getBoundingClientRect === 'function'
      ? Math.max(headerEl.getBoundingClientRect().bottom, headerEl.getBoundingClientRect().height + safeTop)
      : (64 + safeTop);
    const targetTop = Math.max(0, window.scrollY + card.getBoundingClientRect().top - headerBottom - 12);
    if (typeof window.scrollTo === 'function') {
      if (smooth) {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      } else {
        window.scrollTo(0, targetTop);
      }
    }
  }

  function playExample(enText, btnEl) {
    const seq = ++audioSeq;
    try { triggerHaptic('light'); } catch (_) {}
    const accent = typeof getSavedVoiceAccent === 'function' ? getSavedVoiceAccent() : 'us';
    const langTag = accent === 'uk' ? 'en-GB' : 'en-US';
    container.querySelectorAll('.tc-speak-btn.is-speaking').forEach((el) => el.classList.remove('is-speaking'));
    if (btnEl) btnEl.classList.add('is-speaking');
    try {
      speakTextInLangAsync(enText, langTag)
        .catch(() => {})
        .finally(() => {
          if (seq === audioSeq && btnEl && btnEl.isConnected) {
            btnEl.classList.remove('is-speaking');
          }
        });
    } catch (_) {
      if (btnEl) btnEl.classList.remove('is-speaking');
    }
  }

  function renderCardHtml(item) {
    const loc = getLocalizedTenseConstruction(item, rawLang);
    const isPro = isProActive();
    const isUnlocked = isPro || unlockedSet.has(item.id);
    const isDone = isUnlocked && doneSet.has(item.id);
    const isQuizDone = isUnlocked && quizDoneSet.has(item.id);
    const isExpanded = expandedDoneSet.has(item.id);
    const solvedSet = solvedQuestions.get(item.id);
    const isHighlighted = focusedId === item.id;

    if (!isUnlocked) {
      const learnedCount = getTestLearnedCount(getUserProgress());
      const threshold = PRO_LIMITS.TENSE_THRESHOLDS[item.id] ?? 0;
      const canUnlockWithAd = learnedCount >= threshold;
      const wordsNeeded = Math.max(0, threshold - learnedCount);
      const sPro = getProStrings(rawLang);
      const hintText = String(sPro.pro_unlock_learn_or_pro || '').replace('{n}', String(wordsNeeded));
      return `
        <article class="tc-card is-locked ${isHighlighted ? 'is-highlighted' : ''}" data-tense-card="${escapeHtml(item.id)}">
          <div class="tc-card-head" style="margin-bottom:6px;">
            <div class="tc-card-title-wrap">
              <div class="tc-card-title-row">
                <h3 class="tc-card-title" dir="ltr">${escapeHtml(item.title)}</h3>
                <span class="tc-level-badge" style="${getLevelBadgeColor(item.level)}">${escapeHtml(item.level)}</span>
              </div>
            </div>
            <span aria-label="Locked" style="font-size:15px;">🔒</span>
          </div>
          <p class="tc-card-sub" style="margin:0 0 10px;">${escapeHtml(loc.subtitle)}</p>
          ${canUnlockWithAd ? `
            <button type="button" class="tc-unlock-btn btn-orange" data-unlock-tense="${escapeHtml(item.id)}">
              <span>🎬</span>
              <span>${escapeHtml(unlockBtnLabel)}</span>
            </button>
          ` : `
            <p style="margin:0 0 10px;font-size:13px;line-height:1.4;color:var(--text-muted,#94a3b8);">${escapeHtml(hintText)}</p>
            <button type="button" class="tc-unlock-btn btn-orange" data-open-pro="tenses" data-words-needed="${wordsNeeded}" style="background:linear-gradient(135deg,#f59e0b,#ea580c);">
              <span>⭐</span>
              <span>${escapeHtml(sPro.pro_buy || 'PRO')}</span>
            </button>
          `}
        </article>
      `;
    }

    if (!isExpanded) {
      return `
        <article class="tc-card ${isDone ? 'is-done ' : ''}is-collapsed ${isHighlighted ? 'is-highlighted' : ''}" data-tense-card="${escapeHtml(item.id)}" data-toggle-expand="${escapeHtml(item.id)}" role="button" tabindex="0">
          <div class="tc-card-head" style="margin-bottom:4px;">
            <div class="tc-card-title-wrap">
              <div class="tc-card-title-row">
                <h3 class="tc-card-title" dir="ltr">${escapeHtml(item.title)}</h3>
                <span class="tc-level-badge" style="${getLevelBadgeColor(item.level)}">${escapeHtml(item.level)}</span>
              </div>
            </div>
            ${isDone
              ? `<button type="button" class="tc-done-btn is-done" data-toggle-done="${escapeHtml(item.id)}">${escapeHtml(s.doneBadge)}</button>`
              : `<span class="tc-done-btn">${escapeHtml(learnBtnLabel)}</span>`
            }
          </div>
          <p class="tc-card-sub" style="margin:0;">${escapeHtml(loc.subtitle)}</p>
        </article>
      `;
    }

    return `
      <article class="tc-card ${isDone ? 'is-done' : ''} ${isHighlighted ? 'is-highlighted' : ''}" data-tense-card="${escapeHtml(item.id)}">
        <div class="tc-card-head" style="margin-bottom:6px;">
          <div class="tc-card-title-wrap">
            <div class="tc-card-title-row">
              <h3 class="tc-card-title" dir="ltr">${escapeHtml(item.title)}</h3>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="tc-expand-btn is-collapse" data-toggle-expand="${escapeHtml(item.id)}" aria-label="${escapeHtml(collapseBtnLabel)}">▴</button>
            ${isDone
              ? `<button type="button" class="tc-done-btn is-done" data-toggle-done="${escapeHtml(item.id)}">${escapeHtml(s.doneBadge)}</button>`
              : `<span class="tc-done-btn">${escapeHtml(learnBtnLabel)}</span>`
            }
          </div>
        </div>
        <p class="tc-card-sub" style="margin:0 0 12px;">${escapeHtml(loc.subtitle)}</p>

        <div class="tc-section">
          <div class="tc-section-label">${escapeHtml(s.purposeHeading)}</div>
          <div class="tc-purpose-box">${escapeHtml(loc.purpose)}</div>
        </div>

        <div class="tc-section">
          <div class="tc-section-label">${escapeHtml(s.formulaHeading)}</div>
          <div class="tc-formula-grid">
            <div class="tc-formula-row">
              <span class="tc-formula-key">${escapeHtml(s.posLabel)}</span>
              <span class="tc-formula-val">${escapeHtml(item.formula.pos)}</span>
            </div>
            <div class="tc-formula-row">
              <span class="tc-formula-key">${escapeHtml(s.negLabel)}</span>
              <span class="tc-formula-val">${escapeHtml(item.formula.neg)}</span>
            </div>
            <div class="tc-formula-row">
              <span class="tc-formula-key">${escapeHtml(s.quesLabel)}</span>
              <span class="tc-formula-val">${escapeHtml(item.formula.ques)}</span>
            </div>
            <div class="tc-formula-row">
              <span class="tc-formula-key">${escapeHtml(s.auxLabel)}</span>
              <span class="tc-formula-val">${escapeHtml(item.formula.aux)}</span>
            </div>
          </div>
        </div>

        <div class="tc-section">
          <div class="tc-section-label">${escapeHtml(s.markersHeading)}</div>
          <div class="tc-markers-wrap">
            ${item.markers.map((m) => `<span class="tc-marker-chip">${escapeHtml(m)}</span>`).join('')}
          </div>
        </div>

        ${Array.isArray(loc.quiz) && loc.quiz.length > 0 ? `
          <div class="tc-quiz-section">
            <div class="tc-quiz-header">
              <span class="tc-quiz-title">${escapeHtml(s.quizHeading || '⚡ Мини-тест (+5 XP)')}</span>
              ${isQuizDone ? `<span class="tc-quiz-badge">${escapeHtml(s.quizDoneBadge || 'Пройдено ✓ +5 XP')}</span>` : ''}
            </div>
            <div class="tc-quiz-list">
              ${loc.quiz.map((q, qIdx) => {
                const isQDone = isQuizDone || Boolean(solvedSet && solvedSet.has(qIdx));
                const blankHtml = formatQuizBlankedHtml(q.blanked, q.answer, isQDone, 'tc-quiz-filled', escapeHtml);
                return `
                  <div class="tc-quiz-item ${isQDone ? 'is-solved' : ''}">
                    <div class="tc-quiz-q-en">${qIdx + 1}. ${blankHtml}</div>
                    ${q.tr ? `<div class="tc-quiz-q-tr">${escapeHtml(q.tr)}</div>` : ''}
                    <div class="tc-quiz-opts">
                      ${(q.options || []).map((opt) => `
                        <button
                          type="button"
                          class="tc-quiz-opt ${isQDone && opt === q.answer ? 'is-correct' : ''}"
                          data-tc-quiz-tense="${escapeHtml(item.id)}"
                          data-tc-quiz-q="${qIdx}"
                          data-tc-quiz-opt="${escapeHtml(opt)}"
                          ${isQDone ? 'disabled' : ''}
                        >${escapeHtml(opt)}</button>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        <div class="tc-card-footer">
          <button type="button" class="tc-expand-btn" data-toggle-expand="${escapeHtml(item.id)}">
            ${escapeHtml(collapseBtnLabel)} ▴
          </button>
        </div>
      </article>
    `;
  }

  function renderMatrixHtml() {
    const byId = new Map(TENSE_CONSTRUCTIONS.map((t) => [t.id, t]));
    const aspects = [
      { key: 'simple', label: 'Simple', sub: s.simpleSubtitle, markers: ['every day', 'always', 'yesterday', 'tomorrow'] },
      { key: 'continuous', label: 'Continuous', sub: s.continuousSubtitle, markers: ['now', 'at the moment', 'while', 'at 5 PM'] },
      { key: 'perfect', label: 'Perfect', sub: s.perfectSubtitle, markers: ['already', 'just', 'yet', 'by that time'] },
      { key: 'perfect_continuous', label: 'Perfect Continuous', sub: s.perfectContinuousSubtitle, markers: ['for 2 hours', 'since morning', 'how long'] },
    ];
    const rows = [
      { time: 'present', label: s.presentRow },
      { time: 'past', label: s.pastRow },
      { time: 'future', label: s.futureRow },
    ];
    const specials = TENSE_CONSTRUCTIONS.filter((t) => t.group === 'special');

    return `
      <p class="tc-matrix-hint">${escapeHtml(s.matrixHint)}</p>
      <div class="tc-matrix-scroll">
        <table class="tc-matrix-table">
          <thead>
            <tr>
              <th></th>
              ${aspects.map((a) => `
                <th>
                  <span>${escapeHtml(a.label)}</span>
                  <span class="tc-matrix-th-sub">${escapeHtml(a.sub)}</span>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((r) => `
              <tr>
                <td class="tc-matrix-rowhead">${escapeHtml(r.label)}</td>
                ${aspects.map((a) => {
                  const id = `${r.time}_${a.key}`;
                  const item = byId.get(id);
                  if (!item) return '<td></td>';
                  const isDone = doneSet.has(id);
                  return `
                    <td class="${isDone ? 'is-done' : ''}">
                      <button type="button" class="tc-matrix-cell-btn" data-open-tense="${escapeHtml(id)}">
                        <span class="tc-matrix-cell-title">${escapeHtml(item.title)}</span>
                        <span class="tc-matrix-cell-formula">${escapeHtml(item.formula.pos)}</span>
                      </button>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
            <tr>
              <td class="tc-matrix-rowhead">${escapeHtml(s.markersRow)}</td>
              ${aspects.map((a) => `
                <td dir="ltr" style="color: var(--text-muted); font-size: 11.5px;">${escapeHtml(a.markers.join(', '))}</td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="tc-section-label">${escapeHtml(s.filterSpecial)} · ${escapeHtml(s.specialSubtitle)}</div>
      <div class="tc-special-grid">
        ${specials.map((sp) => `
          <button type="button" class="tc-special-chip-btn ${doneSet.has(sp.id) ? 'is-done' : ''}" data-open-tense="${escapeHtml(sp.id)}">
            <span class="tc-matrix-cell-title">${escapeHtml(sp.title)}</span>
            <span class="tc-matrix-cell-formula">${escapeHtml(sp.formula.pos)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function render() {
    const progressText = String(s.progressLabel || '{done} / {total}')
      .replace('{done}', String(doneSet.size))
      .replace('{total}', String(TENSE_CONSTRUCTIONS.length));

    const groups = [
      { id: 'all', label: s.filterAll },
      { id: 'simple', label: s.filterSimple },
      { id: 'continuous', label: s.filterContinuous },
      { id: 'perfect', label: s.filterPerfect },
      { id: 'perfect_continuous', label: s.filterPerfectContinuous },
      { id: 'special', label: s.filterSpecial },
    ];

    const visibleItems = activeGroup === 'all'
      ? TENSE_CONSTRUCTIONS
      : TENSE_CONSTRUCTIONS.filter((item) => item.group === activeGroup);

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="tc-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="tc-topbar">
          <button type="button" class="tc-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
          <span class="tc-progress-pill">${escapeHtml(progressText)}</span>
        </div>

        <div class="tc-hero">
          <h2 class="tc-hero-title">⏳ ${escapeHtml(s.hubTitle)}</h2>
        </div>

        <div class="tc-tabs">
          <button type="button" class="tc-tab-btn ${activeTab === 'list' ? 'is-active' : ''}" data-tab-mode="list">${escapeHtml(String(s.tabList || 'Конструкции').replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/gu, '').replace(/\s*[(\uff08]16[)\uff09]/g, '').replace(/\s+/g, ' ').trim())}</button>
          <button type="button" class="tc-tab-btn ${activeTab === 'matrix' ? 'is-active' : ''}" data-tab-mode="matrix">${escapeHtml(baseLang === 'tr' ? 'Tablo' : baseLang === 'kk' ? 'Матрица' : baseLang === 'hu' ? 'Mátrix' : String(s.tabMatrix || 'Матрица').replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/gu, '').replace(/\s*4\s*[×xX*]\s*3(?:-[a-zA-Z]+)?\s*/g, ' ').replace(/^[\s-]+/, '').trim().replace(/^([a-z])/, (m) => m.toUpperCase()))}</button>
        </div>

        ${activeTab === 'list' ? `
          <div class="tc-filters">
            ${groups.map((g) => `
              <button type="button" class="tc-filter-btn ${activeGroup === g.id ? 'is-active' : ''}" data-group-id="${g.id}">
                ${escapeHtml(g.label)}
              </button>
            `).join('')}
          </div>
          <div class="tc-cards-list">
            ${visibleItems.map(renderCardHtml).join('')}
          </div>
        ` : renderMatrixHtml()}
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      closeQuizWordPopover();
      try { stopAllAudio(); } catch (_) {}
      onBack();
    });

    container.querySelectorAll('[data-tab-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab-mode') || 'list';
        focusedId = null;
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('tense_tab_switch', { tab: activeTab });
        }
        render();
      });
    });

    container.querySelectorAll('[data-group-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeGroup = btn.getAttribute('data-group-id') || 'all';
        focusedId = null;
        render();
      });
    });

    container.querySelectorAll('[data-open-pro]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wordsNeeded = Number(btn.getAttribute('data-words-needed') || 0);
        ProService.openPaywall(btn.getAttribute('data-open-pro') || 'tenses', { wordsNeeded });
      });
    });

    container.querySelectorAll('[data-unlock-tense]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        const id = btn.getAttribute('data-unlock-tense');
        if (!id) return;
        const threshold = PRO_LIMITS.TENSE_THRESHOLDS[id] ?? 0;
        const learned = getTestLearnedCount(getUserProgress());
        if (!isProActive() && learned < threshold) {
          ProService.openPaywall('tenses', { wordsNeeded: threshold - learned });
          return;
        }
        const item = TENSE_CONSTRUCTIONS.find((tObj) => tObj.id === id);
        btn.disabled = true;
        const prevHtml = btn.innerHTML;
        btn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;
        try {
          const adRes = await AdService.showLanguagePackRewardedAd(item?.title || id);
          if (adRes && (adRes.rewardEarned || adRes.success)) {
            unlockedSet.add(id);
            saveUnlockedSet(unlockedSet);
            const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
            render();
            if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
              window.scrollTo(0, prevScrollY);
            }
            return;
          }
        } catch (err) {
          console.warn('Tense construction ad unlock error:', err);
        }
        if (btn.isConnected) {
          btn.innerHTML = prevHtml;
          btn.disabled = false;
        }
      });
    });

    container.querySelectorAll('[data-toggle-done]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-toggle-done');
        if (!id) return;
        const markingDone = !doneSet.has(id);
        if (markingDone) {
          doneSet.add(id);
          expandedDoneSet.delete(id);
        } else {
          doneSet.delete(id);
          expandedDoneSet.delete(id);
        }
        saveDoneIds(doneSet);
        const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        render();
        if (markingDone) {
          scrollTenseCardToTop(id, false);
        } else if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
          window.scrollTo(0, prevScrollY);
        }
      });
    });

    container.querySelectorAll('[data-toggle-expand]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-expand');
        if (!id) return;
        if (expandedDoneSet.has(id)) expandedDoneSet.delete(id);
        else expandedDoneSet.add(id);
        render();
        scrollTenseCardToTop(id, false);
      });
    });

    container.querySelectorAll('[data-speak]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-speak');
        if (text) playExample(text, btn);
      });
    });

    container.querySelectorAll('[data-open-tense]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-tense');
        if (!id) return;
        focusedId = id;
        activeTab = 'list';
        activeGroup = 'all';
        expandedDoneSet.add(id);
        render();
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => scrollTenseCardToTop(id, true));
        } else {
          scrollTenseCardToTop(id, true);
        }
      });
    });

    container.querySelectorAll('[data-tc-quiz-opt]').forEach((quizBtn) => {
      quizBtn.addEventListener('click', () => {
        if (quizBtn.disabled) return;
        const tenseId = quizBtn.getAttribute('data-tc-quiz-tense');
        const qIdx = Number(quizBtn.getAttribute('data-tc-quiz-q'));
        const chosen = quizBtn.getAttribute('data-tc-quiz-opt');
        if (!tenseId || !Number.isInteger(qIdx) || chosen === null) return;
        const item = TENSE_CONSTRUCTIONS.find((t) => t.id === tenseId);
        const q = item?.quiz?.[qIdx];
        if (!q) return;

        if (chosen === q.answer) {
          let solvedSet = solvedQuestions.get(tenseId);
          if (!solvedSet) {
            solvedSet = new Set();
            solvedQuestions.set(tenseId, solvedSet);
          }
          solvedSet.add(qIdx);
          try { playSuccessSound(); } catch (_) {}
          try { triggerHaptic('selection'); } catch (_) {}

          let justCompletedTense = false;
          if (solvedSet.size >= item.quiz.length) {
            if (!quizDoneSet.has(tenseId)) {
              quizDoneSet.add(tenseId);
              saveQuizDoneSet(quizDoneSet);
              try { addWeeklyXP(5); } catch (_) {}
              if (typeof window !== 'undefined' && window.trackEvent) {
                window.trackEvent('tense_completed', { tense_id: tenseId });
              }
            }
            if (!doneSet.has(tenseId)) {
              doneSet.add(tenseId);
              saveDoneIds(doneSet);
            }
            expandedDoneSet.delete(tenseId);
            collapsedOpenSet.delete(tenseId);
            justCompletedTense = true;
          }
          const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
          render();
          if (justCompletedTense) {
            scrollTenseCardToTop(tenseId, false);
          } else if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
            window.scrollTo(0, prevScrollY);
          }
        } else {
          quizBtn.classList.add('is-wrong');
          quizBtn.disabled = true;
          try { playErrorSound(); } catch (_) {}
          try { triggerHaptic('selection'); } catch (_) {}
        }
      });
    });

    closeQuizWordPopover();
    bindQuizWordPopover(container, rawLang);
  }

  if (window.trackScreen) {
    window.trackScreen('tense_constructions', 'TenseConstructionsView');
  }
  render();
}
