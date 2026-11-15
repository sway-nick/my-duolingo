import {
  getMicroRulesStrings,
  MICRO_RULES_I18N,
} from './grammarUiTranslations.js?v=386.0';
import {
  speakTextInLangAsync,
  stopAllAudio,
  getSavedVoiceAccent,
  triggerHaptic,
  playSuccessSound,
  playErrorSound,
} from '../../services/audioService.js?v=386.0';
import { addWeeklyXP } from '../../services/api.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { formatQuizBlankedHtml, bindQuizWordPopover, closeQuizWordPopover } from './quizWordPopover.js?v=386.0';

export { MICRO_RULES_I18N, getMicroRulesStrings };

const STORAGE_KEY_DONE = 'myduo_microrules_done';
const STORAGE_KEY_UNLOCKED = 'myduo_microrules_unlocked';
const STORAGE_KEY_QUIZ_DONE = 'myduo_microrules_quiz_done';
const STORAGE_KEY_CARD_IDX = 'myduo_microrules_card_idx';
const RTL_LOCALES = new Set(['ar', 'fa', 'ur']);

let cachedDataMod = null;

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadNumSetFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(Number) : []);
  } catch (_) {
    return new Set();
  }
}

function saveNumSetToStorage(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (_) {}
}

function loadDoneSet() {
  return loadNumSetFromStorage(STORAGE_KEY_DONE);
}

function saveDoneSet(set) {
  saveNumSetToStorage(STORAGE_KEY_DONE, set);
}

function loadUnlockedSet() {
  return loadNumSetFromStorage(STORAGE_KEY_UNLOCKED);
}

function saveUnlockedSet(set) {
  saveNumSetToStorage(STORAGE_KEY_UNLOCKED, set);
}

function loadQuizDoneSet() {
  return loadNumSetFromStorage(STORAGE_KEY_QUIZ_DONE);
}

function saveQuizDoneSet(set) {
  saveNumSetToStorage(STORAGE_KEY_QUIZ_DONE, set);
}

function loadSavedCardIndex() {
  try {
    const val = Number(localStorage.getItem(STORAGE_KEY_CARD_IDX) || 0);
    return Number.isFinite(val) && val >= 0 ? val : 0;
  } catch (_) {
    return 0;
  }
}

function saveCardIndex(idx) {
  try {
    localStorage.setItem(STORAGE_KEY_CARD_IDX, String(idx));
  } catch (_) {}
}

function getLevelStyle(level) {
  switch (level) {
    case 'A1': return 'background: rgba(34,197,94,0.16); color: var(--mr-a1-color, #15803d); border-color: rgba(34,197,94,0.35);';
    case 'A2': return 'background: var(--mr-accent-soft); color: var(--mr-accent); border-color: var(--mr-accent-border);';
    case 'B1': return 'background: rgba(245,158,11,0.16); color: var(--mr-b1-color, #b45309); border-color: rgba(245,158,11,0.35);';
    default: return 'background: rgba(168,85,247,0.16); color: var(--mr-b2-color, #7e22ce); border-color: rgba(168,85,247,0.35);';
  }
}

function getStylesHtml() {
  return `
    <style>
      .mr-page {
        --mr-accent: #c2410c;
        --mr-accent-soft: rgba(234, 88, 12, 0.11);
        --mr-accent-border: rgba(234, 88, 12, 0.42);
        --mr-accent-ring: rgba(234, 88, 12, 0.22);
        --mr-surface-muted: rgba(148, 163, 184, 0.12);
        --mr-a1-color: #15803d;
        --mr-b1-color: #b45309;
        --mr-b2-color: #7e22ce;
        padding: 4px 16px 28px;
        max-width: 720px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      body.dark-theme .mr-page,
      .dark-theme .mr-page,
      [data-theme="dark"] .mr-page {
        --mr-accent: #38bdf8;
        --mr-accent-soft: rgba(56, 189, 248, 0.16);
        --mr-accent-border: rgba(56, 189, 248, 0.42);
        --mr-accent-ring: rgba(56, 189, 248, 0.25);
        --mr-surface-muted: rgba(15, 23, 42, 0.35);
        --mr-a1-color: #22c55e;
        --mr-b1-color: #f59e0b;
        --mr-b2-color: #c084fc;
      }
      .mr-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
      }
      .mr-back-btn {
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
      .mr-back-btn:active { transform: scale(0.97); }
      .mr-progress-pill {
        font-size: 13px;
        font-weight: 800;
        color: #10b981;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.35);
        padding: 6px 12px;
        border-radius: 999px;
        font-variant-numeric: tabular-nums;
      }
      .mr-hero {
        margin-bottom: 12px;
      }
      .mr-hero-title {
        font-size: clamp(16px, 4.7vw, 22px);
        font-weight: 800;
        color: var(--text-main);
        margin: 0 0 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mr-hero-sub {
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--text-muted);
        margin: 0;
      }
      .mr-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: var(--card-bg, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
        border-radius: 14px;
        padding: 4px;
        margin-bottom: 10px;
      }
      .mr-tab-btn {
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 13.5px;
        font-weight: 700;
        padding: 9px 10px;
        border-radius: 10px;
        cursor: pointer;
      }
      .mr-tab-btn.is-active {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      }
      .mr-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }
      .mr-levels {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .mr-level-btn {
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
        background: var(--card-bg, rgba(30, 41, 59, 0.65));
        color: var(--text-main);
        font-size: 12.5px;
        font-weight: 700;
        padding: 6px 11px;
        border-radius: 999px;
        cursor: pointer;
      }
      .mr-level-btn.is-active {
        background: var(--mr-accent-soft);
        border-color: var(--mr-accent);
        color: var(--mr-accent);
      }
      .mr-search {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25));
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        color: var(--text-main);
        font-size: 14px;
        outline: none;
      }
      .mr-search:focus {
        border-color: var(--mr-accent);
      }
      .mr-hint {
        font-size: 12px;
        color: var(--text-muted);
        margin: 0 0 12px;
      }
      .mr-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .mr-card {
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.22));
        border-radius: 16px;
        padding: 15px;
      }
      .mr-card.is-done {
        border-color: rgba(16, 185, 129, 0.45);
      }
      .mr-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
      }
      .mr-meta-badges {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .mr-num-badge {
        font-size: 12px;
        font-weight: 800;
        color: var(--text-muted);
      }
      .mr-level-pill {
        font-size: 11px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid transparent;
      }
      .mr-topic-pill {
        font-size: 11.5px;
        font-weight: 600;
        padding: 2px 9px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-muted);
      }
      .mr-done-btn {
        flex-shrink: 0;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.3));
        background: transparent;
        color: var(--text-muted);
        border-radius: 10px;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .mr-done-btn.is-done {
        background: rgba(16, 185, 129, 0.16);
        border-color: #10b981;
        color: #10b981;
      }
      .mr-rule-title {
        font-size: 16px;
        font-weight: 800;
        line-height: 1.35;
        color: var(--text-main);
        margin: 0 0 10px;
      }
      .mr-lock-badge {
        font-size: 13px;
        color: #f97316;
        font-weight: 700;
      }
      .mr-unlock-btn {
        background: linear-gradient(135deg, #f97316, #ea580c);
        color: #ffffff;
        border: none;
        border-radius: 12px;
        padding: 11px 18px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
        width: 100%;
        margin-top: 6px;
      }
      .mr-unlock-btn:active { transform: scale(0.98); }
      .mr-unlock-btn:disabled {
        opacity: 0.72;
        cursor: wait;
      }
      .mr-rule-text {
        font-size: 15px;
        font-weight: 600;
        line-height: 1.5;
        color: var(--text-main);
        margin: 0 0 12px;
        white-space: pre-line;
      }
      .mr-ex-heading {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 7px;
      }
      .mr-ex-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .mr-ex-row {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        background: rgba(148, 163, 184, 0.08);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.16));
        border-radius: 11px;
        padding: 8px 10px;
      }
      .mr-speak-btn {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 9px;
        border: 1px solid var(--mr-accent-border);
        background: var(--mr-accent-soft);
        color: var(--mr-accent);
        font-size: 15px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .mr-speak-btn.is-speaking {
        background: var(--mr-accent-ring);
      }
      .mr-ex-body {
        min-width: 0;
        flex: 1;
      }
      .mr-ex-en {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main);
        direction: ltr;
        text-align: left;
        line-height: 1.35;
      }
      .mr-ex-tr {
        font-size: 12.5px;
        color: var(--text-muted);
        margin-top: 2px;
        line-height: 1.35;
      }
      .mr-more-btn {
        width: 100%;
        margin-top: 4px;
        padding: 12px 16px;
        border-radius: 14px;
        border: 1.5px solid var(--mr-accent-border);
        background: var(--mr-accent-soft);
        color: var(--mr-accent);
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
      }
      .mr-card-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 12px;
      }
      .mr-nav-btn {
        flex: 1;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25));
        background: var(--card-bg, rgba(30, 41, 59, 0.85));
        color: var(--text-main);
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
      }
      .mr-nav-btn.is-primary {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        border-color: transparent;
        color: #ffffff;
      }
      .mr-nav-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .mr-counter {
        font-size: 13px;
        font-weight: 800;
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
      }
      .mr-empty {
        text-align: center;
        padding: 36px 16px;
        color: var(--text-muted);
        font-size: 14px;
      }
      .mr-quiz-section {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed var(--border-color, rgba(148, 163, 184, 0.25));
      }
      .mr-quiz-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 9px;
      }
      .mr-quiz-title {
        font-size: 12.5px;
        font-weight: 800;
        color: #f59e0b;
      }
      .mr-quiz-badge {
        font-size: 11px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(34, 197, 94, 0.16);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.35);
      }
      .mr-quiz-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .mr-quiz-item {
        background: rgba(148, 163, 184, 0.06);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
        border-radius: 12px;
        padding: 10px 11px;
      }
      .mr-quiz-item.is-solved {
        border-color: rgba(34, 197, 94, 0.38);
        background: rgba(34, 197, 94, 0.05);
      }
      .mr-quiz-q-en {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.4;
        direction: ltr;
        text-align: left;
      }
      .mr-quiz-filled {
        color: #22c55e;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .mr-quiz-q-tr {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
        margin-bottom: 8px;
        line-height: 1.35;
      }
      .mr-quiz-opts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
        direction: ltr;
      }
      .mr-quiz-opt {
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
      .mr-quiz-opt:hover:not(:disabled) {
        border-color: var(--mr-accent);
      }
      .mr-quiz-opt.is-correct {
        background: rgba(34, 197, 94, 0.18);
        border-color: #22c55e;
        color: #22c55e;
      }
      .mr-quiz-opt.is-wrong {
        background: rgba(239, 68, 68, 0.16);
        border-color: #ef4444;
        color: #ef4444;
        opacity: 0.75;
      }
      .mr-quiz-opt:disabled {
        cursor: default;
      }
      .mr-card.is-collapsed {
        padding-bottom: 12px;
        cursor: pointer;
      }
      .mr-collapsed-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 2px;
      }
      .mr-collapsed-row .mr-rule-title {
        margin: 0;
        flex: 1;
      }
      .mr-expand-btn {
        border: 1.5px solid var(--mr-accent-border);
        background: var(--mr-accent-soft);
        color: var(--mr-accent);
        font-size: 12px;
        font-weight: 800;
        padding: 6px 12px;
        border-radius: 999px;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .mr-expand-btn.is-collapse {
        margin-left: auto;
      }
      .mr-card-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid rgba(148, 163, 184, 0.14);
      }
      .mr-table-scroll {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin: 0 0 12px;
        border-radius: 10px;
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.22));
        background: var(--mr-surface-muted);
      }
      .mr-ref-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
        direction: ltr;
      }
      .mr-ref-table th,
      .mr-ref-table td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.16));
        border-right: 1px solid var(--border-color, rgba(148, 163, 184, 0.12));
        text-align: left;
        vertical-align: top;
      }
      .mr-ref-table th:last-child,
      .mr-ref-table td:last-child {
        border-right: none;
      }
      .mr-ref-table tr:last-child td {
        border-bottom: none;
      }
      .mr-ref-table th {
        background: var(--mr-accent-soft);
        color: var(--mr-accent);
        font-weight: 800;
        white-space: nowrap;
      }
      .mr-ref-table td {
        color: var(--text-main);
        font-weight: 600;
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

function stripDuplicateTopicPrefix(title, topicLabel) {
  if (!title || !topicLabel) return title || topicLabel || '';
  const tTrim = String(title).trim();
  const pTrim = String(topicLabel).trim();
  if (tTrim.toLowerCase().startsWith(pTrim.toLowerCase())) {
    const rest = tTrim.slice(pTrim.length).replace(/^\s*[:：—–-]\s*/, '').trim();
    if (rest.length > 0) return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return tTrim;
}

export async function renderMicroRulesView(containerSelector = '#app-content', options = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!container) return;

  const { onBack = () => {} } = options;
  const rawLang = (getInterfaceLanguage() || 'ru').toLowerCase();
  const baseLang = rawLang.split('-')[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getMicroRulesStrings(rawLang);

  if (!cachedDataMod) {
    container.innerHTML = `
      ${getStylesHtml()}
      <div class="mr-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="mr-topbar">
          <button type="button" class="mr-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
        </div>
        <div class="mr-hero">
          <h2 class="mr-hero-title">📖 ${escapeHtml(s.hubTitle)}</h2>
        </div>
      </div>
    `;
    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      try { stopAllAudio(); } catch (_) {}
      onBack();
    });
    cachedDataMod = await import('./microRulesData.js?v=386.0');
    if (!container.isConnected) return;
  }

  const { MICRO_RULES, getLocalizedMicroRule, getTopicTitle } = cachedDataMod;

  let activeLevel = 'A1';
  let pageLimit = 30;
  const doneSet = loadDoneSet();
  const unlockedSet = loadUnlockedSet();
  const quizDoneSet = loadQuizDoneSet();
  const expandedDoneSet = new Set();
  const solvedQuestions = new Map();
  let audioSeq = 0;

  function playExample(enText, btnEl) {
    const seq = ++audioSeq;
    try { triggerHaptic('light'); } catch (_) {}
    const accent = typeof getSavedVoiceAccent === 'function' ? getSavedVoiceAccent() : 'us';
    const langTag = accent === 'uk' ? 'en-GB' : 'en-US';
    container.querySelectorAll('.mr-speak-btn.is-speaking').forEach((el) => el.classList.remove('is-speaking'));
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

  function getFilteredRules() {
    return MICRO_RULES.filter((item) => item.level === activeLevel);
  }

  function renderRuleCardHtml(item) {
    const loc = getLocalizedMicroRule(item, rawLang);
    const topicLabel = getTopicTitle(item.topic, rawLang);
    const isUnlocked = unlockedSet.has(item.id);
    const isDone = isUnlocked && doneSet.has(item.id);
    const isQuizDone = isUnlocked && quizDoneSet.has(item.id);
    const isExpanded = !isDone || expandedDoneSet.has(item.id);
    const solvedSet = solvedQuestions.get(item.id);
    const ruleHeading = String(s.ruleLabel || '#{num}').replace('{num}', String(item.id));
    const displayTitle = stripDuplicateTopicPrefix(loc.title || topicLabel, topicLabel);
    const collapseBtnLabel = COLLAPSE_BTN_I18N[rawLang] || COLLAPSE_BTN_I18N[baseLang] || COLLAPSE_BTN_I18N.en;

    if (!isUnlocked) {
      return `
        <article class="mr-card is-locked" data-rule-id="${item.id}">
          <div class="mr-card-top">
            <div class="mr-meta-badges">
              <span class="mr-num-badge">${escapeHtml(ruleHeading)}</span>
              <span class="mr-level-pill" style="${getLevelStyle(item.level)}">${escapeHtml(item.level)}</span>
              <span class="mr-topic-pill">${escapeHtml(topicLabel)}</span>
            </div>
            <span class="mr-lock-badge" aria-label="Locked">🔒</span>
          </div>

          <h3 class="mr-rule-title">${escapeHtml(displayTitle)}</h3>
          <button type="button" class="mr-unlock-btn btn-orange" data-unlock-rule="${item.id}">
            <span>🎬</span>
            <span>${escapeHtml(s.unlockRuleBtn || 'Открыть правило')}</span>
          </button>
        </article>
      `;
    }

    if (isDone && !isExpanded) {
      return `
        <article class="mr-card is-done is-collapsed" data-rule-id="${item.id}" data-toggle-expand="${item.id}" role="button" tabindex="0">
          <div class="mr-card-top">
            <div class="mr-meta-badges">
              <span class="mr-num-badge">${escapeHtml(ruleHeading)}</span>
              <span class="mr-level-pill" style="${getLevelStyle(item.level)}">${escapeHtml(item.level)}</span>
              <span class="mr-topic-pill">${escapeHtml(topicLabel)}</span>
            </div>
            <button type="button" class="mr-done-btn is-done" data-toggle-done="${item.id}">
              ${escapeHtml(s.doneBadge)}
            </button>
          </div>
          <div class="mr-collapsed-row">
            <h3 class="mr-rule-title">${escapeHtml(displayTitle)}</h3>
          </div>
        </article>
      `;
    }

    return `
      <article class="mr-card ${isDone ? 'is-done' : ''}" data-rule-id="${item.id}">
        <div class="mr-card-top">
          <div class="mr-meta-badges">
            <span class="mr-num-badge">${escapeHtml(ruleHeading)}</span>
            <span class="mr-level-pill" style="${getLevelStyle(item.level)}">${escapeHtml(item.level)}</span>
            <span class="mr-topic-pill">${escapeHtml(topicLabel)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${isDone ? `<button type="button" class="mr-expand-btn is-collapse" data-toggle-expand="${item.id}" aria-label="${escapeHtml(collapseBtnLabel)}">▴</button>` : ''}
            <button type="button" class="mr-done-btn ${isDone ? 'is-done' : ''}" data-toggle-done="${item.id}">
              ${escapeHtml(isDone ? s.doneBadge : s.markDoneBtn)}
            </button>
          </div>
        </div>

        <h3 class="mr-rule-title">${escapeHtml(displayTitle)}</h3>
        <p class="mr-rule-text">${escapeHtml(loc.rule)}</p>
        ${loc.table && Array.isArray(loc.table.rows) && loc.table.rows.length > 0 ? `
          <div class="mr-table-scroll">
            <table class="mr-ref-table">
              ${Array.isArray(loc.table.headers) && loc.table.headers.length > 0 ? `
                <thead>
                  <tr>${loc.table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
                </thead>
              ` : ''}
              <tbody>
                ${loc.table.rows.map((row) => `
                  <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${Array.isArray(loc.quiz) && loc.quiz.length > 0 ? `
          <div class="mr-quiz-section">
            <div class="mr-quiz-header">
              <span class="mr-quiz-title">${escapeHtml(s.quizHeading || '⚡ Мини-тест (+5 XP)')}</span>
              ${isQuizDone ? `<span class="mr-quiz-badge">${escapeHtml(s.quizDoneBadge || 'Пройдено ✓ +5 XP')}</span>` : ''}
            </div>
            <div class="mr-quiz-list">
              ${loc.quiz.map((q, qIdx) => {
                const isQDone = isQuizDone || Boolean(solvedSet && solvedSet.has(qIdx));
                const blankHtml = formatQuizBlankedHtml(q.blanked, q.answer, isQDone, 'mr-quiz-filled', escapeHtml);
                return `
                  <div class="mr-quiz-item ${isQDone ? 'is-solved' : ''}">
                    <div class="mr-quiz-q-en">${qIdx + 1}. ${blankHtml}</div>
                    ${q.tr ? `<div class="mr-quiz-q-tr">${escapeHtml(q.tr)}</div>` : ''}
                    <div class="mr-quiz-opts">
                      ${(q.options || []).map((opt) => `
                        <button
                          type="button"
                          class="mr-quiz-opt ${isQDone && opt === q.answer ? 'is-correct' : ''}"
                          data-mr-quiz-rule="${item.id}"
                          data-mr-quiz-q="${qIdx}"
                          data-mr-quiz-opt="${escapeHtml(opt)}"
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
        ${isDone ? `
          <div class="mr-card-footer">
            <button type="button" class="mr-expand-btn" data-toggle-expand="${item.id}">
              ${escapeHtml(collapseBtnLabel)} ▴
            </button>
          </div>
        ` : ''}
      </article>
    `;
  }

  function bindCardListeners(rootEl) {
    rootEl.querySelectorAll('[data-unlock-rule]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        const id = Number(btn.getAttribute('data-unlock-rule'));
        if (!id) return;
        const ruleObj = MICRO_RULES.find((r) => r.id === id);
        const locTitle = ruleObj
          ? (getLocalizedMicroRule(ruleObj, rawLang).title || getTopicTitle(ruleObj.topic, rawLang))
          : `#${id}`;

        btn.disabled = true;
        const prevHtml = btn.innerHTML;
        btn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;

        try {
          const adRes = await AdService.showLanguagePackRewardedAd(locTitle);
          if (adRes && (adRes.rewardEarned || adRes.success)) {
            unlockedSet.add(id);
            saveUnlockedSet(unlockedSet);
            updateDynamicContent();
            return;
          }
        } catch (err) {
          console.warn('Micro-rule ad unlock error:', err);
        }

        if (btn.isConnected) {
          btn.innerHTML = prevHtml;
          btn.disabled = false;
        }
      });
    });

    rootEl.querySelectorAll('[data-toggle-done]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute('data-toggle-done'));
        if (!id) return;
        if (doneSet.has(id)) {
          doneSet.delete(id);
          expandedDoneSet.delete(id);
        } else {
          doneSet.add(id);
          expandedDoneSet.delete(id);
        }
        saveDoneSet(doneSet);
        updateProgressPill();
        const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        updateDynamicContent();
        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
          window.scrollTo(0, prevScrollY);
        }
      });
    });

    rootEl.querySelectorAll('[data-toggle-expand]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-toggle-expand'));
        if (!id) return;
        if (expandedDoneSet.has(id)) expandedDoneSet.delete(id);
        else expandedDoneSet.add(id);
        const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        updateDynamicContent();
        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
          window.scrollTo(0, prevScrollY);
        }
      });
    });

    rootEl.querySelectorAll('[data-speak]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-speak');
        if (text) playExample(text, btn);
      });
    });

    rootEl.querySelectorAll('[data-mr-quiz-opt]').forEach((quizBtn) => {
      quizBtn.addEventListener('click', () => {
        if (quizBtn.disabled) return;
        const ruleId = Number(quizBtn.getAttribute('data-mr-quiz-rule'));
        const qIdx = Number(quizBtn.getAttribute('data-mr-quiz-q'));
        const chosen = quizBtn.getAttribute('data-mr-quiz-opt');
        if (!ruleId || !Number.isInteger(qIdx) || chosen === null) return;
        const item = MICRO_RULES.find((r) => r.id === ruleId);
        const q = item?.quiz?.[qIdx];
        if (!q) return;

        if (chosen === q.answer) {
          let solvedSet = solvedQuestions.get(ruleId);
          if (!solvedSet) {
            solvedSet = new Set();
            solvedQuestions.set(ruleId, solvedSet);
          }
          solvedSet.add(qIdx);
          try { playSuccessSound(); } catch (_) {}
          try { triggerHaptic('selection'); } catch (_) {}

          if (solvedSet.size >= item.quiz.length && !quizDoneSet.has(ruleId)) {
            quizDoneSet.add(ruleId);
            saveQuizDoneSet(quizDoneSet);
            if (!doneSet.has(ruleId)) {
              doneSet.add(ruleId);
              saveDoneSet(doneSet);
            }
            expandedDoneSet.delete(ruleId);
            try { addWeeklyXP(5); } catch (_) {}
            updateProgressPill();
          }
          const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
          updateDynamicContent();
          if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
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
    bindQuizWordPopover(rootEl, rawLang);
  }

  function updateProgressPill() {
    const pill = container.querySelector('#mr-progress-pill');
    if (pill) {
      pill.textContent = String(s.progressLabel || '{done} / {total}')
        .replace('{done}', String(doneSet.size))
        .replace('{total}', String(MICRO_RULES.length));
    }
  }

  function updateDynamicContent() {
    const bodyEl = container.querySelector('#mr-dynamic-body');
    if (!bodyEl) return;

    const filtered = getFilteredRules();
    if (filtered.length === 0) {
      bodyEl.innerHTML = `<div class="mr-empty">${escapeHtml(s.noResults)}</div>`;
      return;
    }

    const shown = filtered.slice(0, pageLimit);
    const remaining = filtered.length - shown.length;
    bodyEl.innerHTML = `
      <div class="mr-list">
        ${shown.map(renderRuleCardHtml).join('')}
        ${remaining > 0 ? `
          <button type="button" class="mr-more-btn" id="mr-show-more-btn">
            ${escapeHtml(String(s.showMoreBtn || 'Show more ({count})').replace('{count}', String(remaining)))}
          </button>
        ` : ''}
      </div>
    `;
    bindCardListeners(bodyEl);

    bodyEl.querySelector('#mr-show-more-btn')?.addEventListener('click', () => {
      pageLimit += 40;
      updateDynamicContent();
    });
  }

  const levels = ['A1', 'A2', 'B1', 'B2'];
  const progressText = String(s.progressLabel || '{done} / {total}')
    .replace('{done}', String(doneSet.size))
    .replace('{total}', String(MICRO_RULES.length));

  container.innerHTML = `
    ${getStylesHtml()}
    <div class="mr-page" dir="${isRtl ? 'rtl' : 'ltr'}">
      <div class="mr-topbar">
        <button type="button" class="mr-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
        <span class="mr-progress-pill" id="mr-progress-pill">${escapeHtml(progressText)}</span>
      </div>

      <div class="mr-hero">
        <h2 class="mr-hero-title">📖 ${escapeHtml(s.hubTitle)}</h2>
      </div>

      <div class="mr-controls">
        <div class="mr-levels">
          ${levels.map((lv) => `
            <button type="button" class="mr-level-btn ${lv === activeLevel ? 'is-active' : ''}" data-mr-level="${lv}">
              ${escapeHtml(lv)}
            </button>
          `).join('')}
        </div>
      </div>

      <div id="mr-dynamic-body"></div>
    </div>
  `;

  container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
    try { stopAllAudio(); } catch (_) {}
    onBack();
  });

  container.querySelectorAll('[data-mr-level]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeLevel = btn.getAttribute('data-mr-level') || 'A1';
      pageLimit = 30;
      container.querySelectorAll('[data-mr-level]').forEach((b) =>
        b.classList.toggle('is-active', b === btn)
      );
      updateDynamicContent();
    });
  });

  if (window.trackScreen) {
    window.trackScreen('grammar_microrules', 'MicroRulesView');
  }

  updateDynamicContent();
}
