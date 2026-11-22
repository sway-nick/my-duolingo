import { getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { RTL_LOCALES } from '../../config/locales.js?v=386.0';
import { isProActive } from '../../services/proState.js?v=386.0';
import { ProService } from '../../services/proService.js?v=386.0';
import { showProPaywall } from '../pro/ProPaywallModal.js?v=386.0';
import { getNewsStrings } from '../../services/newsI18n.js?v=386.0';
import {
  fetchDailyNews,
  lookupGlossaryWord,
  getArticleGlossaryForLocale,
  normalizeNewsLocale,
} from '../../services/newsService.js?v=386.0';
import {
  getOrBuildDictionary,
  resolveWord,
} from '../modals/MilestoneStoryModal.js?v=386.0';
import {
  speakWordAsync,
  stopAllAudio,
  triggerHaptic,
} from '../../services/audioService.js?v=386.0';

let activeNewsAudioRunId = 0;
let activeNewsPopoverOutside = null;
let activeNewsPopoverScroll = null;
let activeProUnsub = null;

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stopDailyNewsAudio() {
  activeNewsAudioRunId++;
  try {
    stopAllAudio();
  } catch (_) {}
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.news-sentence.is-speaking').forEach((el) => {
      el.classList.remove('is-speaking');
    });
    document.querySelectorAll('.news-listen-btn.is-playing').forEach((btn) => {
      btn.classList.remove('is-playing');
      const label = btn.getAttribute('data-listen-label') || 'Listen';
      btn.innerHTML = `<span aria-hidden="true">🔊</span> <span>${escapeHtml(label)}</span>`;
    });
  }
}

export function closeNewsWordPopover() {
  if (typeof document === 'undefined') return;
  const pop = document.getElementById('news-word-popover');
  if (pop) pop.style.display = 'none';
  document.querySelectorAll('.news-word-token.is-active-token').forEach((el) => {
    el.classList.remove('is-active-token');
  });
}

function splitIntoSentences(text) {
  const clean = String(text || '').trim();
  if (!clean) return [];
  const parts = clean.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  return (parts || [clean]).map((s) => s.trim()).filter(Boolean);
}

function tokenizeWordsHtml(text, articleIdx) {
  const normalized = String(text || '').replace(/[\u2018\u2019\u02BC\u02BB]/g, "'");
  const tokens = normalized.match(/[a-zA-Z'-]+|[^a-zA-Z'-]+/g) || [normalized];
  return tokens
    .map((tok) => {
      if (!/[a-zA-Z]/.test(tok)) {
        return escapeHtml(tok);
      }
      const attr = escapeHtml(tok);
      return `<span class="news-word-token" data-article-idx="${articleIdx}" data-word="${attr}">${attr}</span>`;
    })
    .join('');
}

function getCategoryMeta(category, strings) {
  const cat = String(category || 'positive').toLowerCase();
  if (cat === 'tech' || cat === 'technology') {
    return { icon: '💻', label: strings.catTech, cls: 'cat-tech' };
  }
  if (cat === 'finance' || cat === 'business' || cat === 'economy') {
    return { icon: '📈', label: strings.catFinance, cls: 'cat-finance' };
  }
  return { icon: '✨', label: strings.catPositive, cls: 'cat-positive' };
}

function formatNewsDate(dateStr, locale, short = false) {
  const raw = String(dateStr || '').trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return raw;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(d.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat(locale || 'en', short
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'long', year: 'numeric' }
    ).format(d);
  } catch (_) {
    return raw;
  }
}

function ensureNewsPopover() {
  let pop = document.getElementById('news-word-popover');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'news-word-popover';
    pop.className = 'news-word-popover';
    pop.style.display = 'none';
    pop.innerHTML = `
      <div class="news-word-popover-head">
        <span class="news-word-popover-word" dir="ltr"></span>
        <button type="button" class="news-word-popover-speak" aria-label="Listen">🔊</button>
      </div>
      <div class="news-word-popover-trans" dir="ltr"></div>
      <div class="news-word-popover-meaning"></div>
    `;
    pop.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(pop);
  }
  return pop;
}

function positionPopover(pop, anchorEl) {
  pop.style.display = 'block';
  pop.style.visibility = 'hidden';
  const rect = anchorEl.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  const margin = 10;
  let left = rect.left + rect.width / 2 - popRect.width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - popRect.width - margin));
  let top = rect.top - popRect.height - 10;
  if (top < margin + 40) {
    top = rect.bottom + 10;
  }
  if (top + popRect.height > window.innerHeight - margin) {
    top = Math.max(margin, window.innerHeight - popRect.height - margin);
  }
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(top)}px`;
  pop.style.visibility = 'visible';
}

function renderProGateHtml(strings, isRtl) {
  return `
    <div class="news-pro-gate" dir="${isRtl ? 'rtl' : 'ltr'}">
      <div class="news-pro-gate-badge">⭐ ${escapeHtml(strings.proPreviewLabel)}</div>
      <h3 class="news-pro-gate-title">📰 ${escapeHtml(strings.proLockTitle)}</h3>
      <p class="news-pro-gate-desc">${escapeHtml(strings.proLockDesc)}</p>
      <ul class="news-pro-gate-list">
        <li><span>🌅</span><span>${escapeHtml(strings.proLockBullet1)}</span></li>
        <li><span>👆</span><span>${escapeHtml(strings.proLockBullet2)}</span></li>
        <li><span>🎧</span><span>${escapeHtml(strings.proLockBullet3)}</span></li>
      </ul>
      <div class="news-pro-blurred-sample" aria-hidden="true" dir="ltr">
        <div class="news-card-meta">
          <span class="news-cat-pill cat-tech">💻 ${escapeHtml(strings.catTech)}</span>
        </div>
        <div class="news-blurred-lines">
          <div class="news-blurred-title">New Lightweight Battery Charges in Ten Minutes</div>
          <div class="news-blurred-body">Engineers have announced a lightweight battery breakthrough that stores nearly twice the energy of previous models...</div>
        </div>
      </div>
      <button type="button" id="news-pro-unlock-btn" class="news-pro-cta-btn">
        ⭐ ${escapeHtml(strings.proLockCta)}
      </button>
    </div>
  `;
}

export function renderDailyNewsView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  stopDailyNewsAudio();
  closeNewsWordPopover();

  if (activeProUnsub) {
    try { activeProUnsub(); } catch (_) {}
    activeProUnsub = null;
  }

  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('daily_news', 'DailyNewsView');
  }

  const { onBack = () => {} } = options;
  const rawLang = getInterfaceLanguage() || 'en';
  const locale = normalizeNewsLocale(rawLang);
  const strings = getNewsStrings(locale);
  const isRtl = RTL_LOCALES.has(locale);
  const isPro = isProActive();

  const handleBack = () => {
    stopDailyNewsAudio();
    closeNewsWordPopover();
    if (activeProUnsub) {
      try { activeProUnsub(); } catch (_) {}
      activeProUnsub = null;
    }
    onBack();
  };

  container.innerHTML = `
    <style>
      .daily-news-page {
        padding: 4px 14px 28px;
        max-width: 680px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .daily-news-back {
        background: none;
        border: none;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-color, #2563eb);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
        margin-bottom: 10px;
      }
      body.dark-theme .daily-news-back,
      .dark-theme .daily-news-back,
      [data-theme="dark"] .daily-news-back {
        color: #38bdf8;
      }
      .daily-news-header {
        margin-bottom: 14px;
      }
      .daily-news-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .daily-news-title {
        font-size: 24px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .daily-news-pro-pill {
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        border-radius: 999px;
        background: linear-gradient(135deg, #f59e0b, #ea580c);
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      .daily-news-subtitle {
        font-size: 13.5px;
        color: var(--text-muted, #64748b);
        margin: 6px 0 0;
        line-height: 1.4;
      }
      .daily-news-date-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-top: 8px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-main, #334155);
        font-size: 12px;
        font-weight: 700;
      }
      body.dark-theme .daily-news-date-pill,
      .dark-theme .daily-news-date-pill {
        background: rgba(148, 163, 184, 0.18);
        color: #cbd5e1;
      }
      .news-card-meta-left {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .news-card-date {
        font-size: 11.5px;
        font-weight: 600;
        color: var(--text-muted, #64748b);
      }
      .daily-news-hint {
        margin: 12px 0 14px;
        padding: 10px 13px;
        border-radius: 12px;
        background: rgba(37, 99, 235, 0.08);
        border: 1px solid rgba(37, 99, 235, 0.2);
        color: var(--text-main, #1e293b);
        font-size: 12.5px;
        line-height: 1.4;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      body.dark-theme .daily-news-hint,
      .dark-theme .daily-news-hint,
      [data-theme="dark"] .daily-news-hint {
        background: rgba(56, 189, 248, 0.12);
        border-color: rgba(56, 189, 248, 0.25);
        color: #e2e8f0;
      }
      .daily-news-notice {
        margin: 0 0 14px;
        padding: 9px 12px;
        border-radius: 11px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: var(--text-main, #1e293b);
        font-size: 12.5px;
        line-height: 1.4;
      }
      body.dark-theme .daily-news-notice,
      .dark-theme .daily-news-notice,
      [data-theme="dark"] .daily-news-notice {
        color: #fde68a;
      }
      .daily-news-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .news-card {
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 18px;
        padding: 16px 16px 14px;
        box-shadow: var(--shadow-sm, 0 4px 14px rgba(15, 23, 42, 0.05));
      }
      body.dark-theme .news-card,
      .dark-theme .news-card,
      [data-theme="dark"] .news-card {
        background: var(--card-bg, #1e293b);
        border-color: rgba(148, 163, 184, 0.22);
      }
      .news-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .news-cat-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
      }
      .news-cat-pill.cat-tech {
        background: rgba(59, 130, 246, 0.14);
        color: #1d4ed8;
      }
      .news-cat-pill.cat-finance {
        background: rgba(16, 185, 129, 0.14);
        color: #047857;
      }
      .news-cat-pill.cat-positive {
        background: rgba(245, 158, 11, 0.16);
        color: #b45309;
      }
      body.dark-theme .news-cat-pill.cat-tech,
      .dark-theme .news-cat-pill.cat-tech { color: #60a5fa; }
      body.dark-theme .news-cat-pill.cat-finance,
      .dark-theme .news-cat-pill.cat-finance { color: #34d399; }
      body.dark-theme .news-cat-pill.cat-positive,
      .dark-theme .news-cat-pill.cat-positive { color: #fbbf24; }
      .news-audio-controls {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .news-listen-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px solid rgba(37, 99, 235, 0.3);
        background: rgba(37, 99, 235, 0.08);
        color: #1d4ed8;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .news-listen-btn.is-playing {
        background: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
      }
      body.dark-theme .news-listen-btn:not(.is-playing),
      .dark-theme .news-listen-btn:not(.is-playing) {
        background: rgba(56, 189, 248, 0.14);
        border-color: rgba(56, 189, 248, 0.35);
        color: #38bdf8;
      }
      .news-speed-btn {
        padding: 5px 8px;
        border-radius: 999px;
        border: 1px solid var(--border-color, #cbd5e1);
        background: transparent;
        color: var(--text-muted, #64748b);
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .news-card-title {
        margin: 0 0 10px;
        font-size: 18px;
        font-weight: 800;
        line-height: 1.35;
        color: var(--text-main, #0f172a);
        text-align: left;
      }
      .news-card-body {
        text-align: left;
        font-size: 15.5px;
        line-height: 1.65;
        color: var(--text-main, #1e293b);
      }
      body.dark-theme .news-card-body,
      .dark-theme .news-card-body {
        color: #e2e8f0;
      }
      .news-card-paragraph {
        margin: 0 0 10px;
      }
      .news-card-paragraph:last-child {
        margin-bottom: 0;
      }
      .news-sentence {
        border-radius: 4px;
        transition: background 0.15s ease;
      }
      .news-sentence.is-speaking {
        background: rgba(245, 158, 11, 0.22);
      }
      .news-word-token {
        cursor: pointer;
        border-bottom: 1px dashed rgba(148, 163, 184, 0.45);
        border-radius: 3px;
        padding: 0 1px;
        transition: background 0.12s ease, color 0.12s ease;
      }
      .news-word-token:active,
      .news-word-token.is-active-token {
        background: rgba(234, 88, 12, 0.2);
        color: #c2410c;
      }
      body.dark-theme .news-word-token.is-active-token,
      .dark-theme .news-word-token.is-active-token {
        background: rgba(56, 189, 248, 0.26);
        color: #38bdf8;
      }
      .news-card-source {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
        font-size: 12px;
        color: var(--text-muted, #64748b);
      }
      .news-word-popover {
        position: fixed;
        z-index: 100060;
        min-width: 175px;
        max-width: min(300px, calc(100vw - 24px));
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        padding: 10px 12px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.22);
      }
      body.dark-theme .news-word-popover,
      .dark-theme .news-word-popover {
        background: #1e293b;
        color: #f8fafc;
        border-color: #475569;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.45);
      }
      .news-word-popover-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .news-word-popover-word {
        font-size: 15px;
        font-weight: 800;
      }
      .news-word-popover-speak {
        border: none;
        background: rgba(37, 99, 235, 0.12);
        color: #2563eb;
        border-radius: 8px;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 15px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .news-word-popover-trans {
        font-size: 12px;
        color: var(--text-muted, #64748b);
        margin-top: 2px;
      }
      .news-word-popover-meaning {
        margin-top: 6px;
        font-size: 14.5px;
        font-weight: 600;
        line-height: 1.35;
      }
      .news-pro-gate {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid rgba(245, 158, 11, 0.45);
        border-radius: 20px;
        padding: 20px 18px;
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
      }
      body.dark-theme .news-pro-gate,
      .dark-theme .news-pro-gate {
        background: var(--card-bg, #1e293b);
      }
      .news-pro-gate-badge {
        display: inline-flex;
        padding: 4px 10px;
        border-radius: 999px;
        background: linear-gradient(135deg, #f59e0b, #ea580c);
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 10px;
      }
      .news-pro-gate-title {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
      }
      .news-pro-gate-desc {
        margin: 0 0 14px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-muted, #64748b);
      }
      .news-pro-gate-list {
        list-style: none;
        padding: 0;
        margin: 0 0 16px;
        display: flex;
        flex-direction: column;
        gap: 9px;
        font-size: 13.5px;
        line-height: 1.4;
      }
      .news-pro-gate-list li {
        display: flex;
        align-items: flex-start;
        gap: 9px;
      }
      .news-pro-blurred-sample {
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px dashed rgba(148, 163, 184, 0.4);
        margin-bottom: 16px;
        background: rgba(148, 163, 184, 0.06);
      }
      .news-blurred-lines {
        filter: blur(4px);
        user-select: none;
        pointer-events: none;
        margin-top: 8px;
      }
      .news-blurred-title {
        font-weight: 800;
        font-size: 15px;
        margin-bottom: 4px;
      }
      .news-blurred-body {
        font-size: 13px;
        opacity: 0.85;
      }
      .news-pro-cta-btn {
        width: 100%;
        min-height: 46px;
        border: none;
        border-radius: 13px;
        background: linear-gradient(135deg, #f59e0b, #ea580c);
        color: #ffffff;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(234, 88, 12, 0.35);
      }
      .daily-news-loading {
        text-align: center;
        padding: 36px 16px;
        color: var(--text-muted, #64748b);
        font-size: 14px;
      }
    </style>

    <div class="daily-news-page" dir="${isRtl ? 'rtl' : 'ltr'}">
      <button type="button" id="daily-news-back-btn" class="daily-news-back">
        ${isRtl ? '→' : '←'} ${escapeHtml(strings.backBtn)}
      </button>

      <div class="daily-news-header">
        <div class="daily-news-title-row">
          <h2 class="daily-news-title">
            <img src="assets/icons/daily_news_globe.webp" alt="" style="width:30px;height:30px;object-fit:contain;vertical-align:middle;" />
            <span>${escapeHtml(strings.pageTitle)}</span>
          </h2>
          <span class="daily-news-pro-pill">⭐ ${escapeHtml(strings.proBadge)}</span>
        </div>
        <p class="daily-news-subtitle">${escapeHtml(strings.pageSubtitle)}</p>
        <div id="daily-news-date-slot"></div>
      </div>

      <div id="daily-news-content">
        ${isPro
          ? `<div class="daily-news-loading">${escapeHtml(strings.loadingText)}</div>`
          : renderProGateHtml(strings, isRtl)
        }
      </div>
    </div>
  `;

  container.querySelector('#daily-news-back-btn')?.addEventListener('click', handleBack);

  if (!isPro) {
    container.querySelector('#news-pro-unlock-btn')?.addEventListener('click', () => {
      showProPaywall({ reason: 'daily_news' });
    });
    activeProUnsub = ProService.onChange((nowPro) => {
      if (nowPro && document.querySelector('#daily-news-content')) {
        renderDailyNewsView(containerSelector, options);
      }
    });
    return;
  }

  // Load news + built-in fallback dictionary in parallel
  let dictMap = null;
  const dictPromise = getOrBuildDictionary(locale)
    .then((m) => {
      dictMap = m;
      return m;
    })
    .catch(() => new Map());

  fetchDailyNews(locale).then((edition) => {
    const contentEl = container.querySelector('#daily-news-content');
    if (!contentEl) return;

    const articles = Array.isArray(edition?.articles) ? edition.articles : [];
    if (articles.length === 0) {
      contentEl.innerHTML = `<div class="daily-news-loading">${escapeHtml(strings.emptyText)}</div>`;
      return;
    }

    const editionDate = edition?.date || '';
    const editionCountry = edition?.country || '';
    const fullDateLabel = formatNewsDate(editionDate, locale, false);
    const shortDateLabel = formatNewsDate(editionDate, locale, true);
    const dateSlot = container.querySelector('#daily-news-date-slot');
    if (dateSlot && (fullDateLabel || editionCountry)) {
      const regionSuffix = editionCountry ? ` · ${editionCountry}` : '';
      dateSlot.innerHTML = `<span class="daily-news-date-pill">📅 ${escapeHtml(fullDateLabel + regionSuffix)}</span>`;
    }
    try {
      if (editionDate && typeof localStorage !== 'undefined') {
        localStorage.setItem('eb_daily_news_seen_date', editionDate);
      }
    } catch (_) {}

    let noticeHtml = '';
    if (edition.isFallbackEdition) {
      noticeHtml = `<div class="daily-news-notice">🌍 ${escapeHtml(strings.fallbackNotice)}</div>`;
    } else if (edition.isDemoEdition) {
      noticeHtml = `<div class="daily-news-notice">☀️ ${escapeHtml(strings.demoNotice)}</div>`;
    }

    const cardsHtml = articles
      .map((article, idx) => {
        const cat = getCategoryMeta(article.category, strings);
        const titleSentences = splitIntoSentences(article.title);
        const paragraphs = Array.isArray(article.paragraphs)
          ? article.paragraphs
          : [String(article.body || '')].filter(Boolean);

        let sentenceCounter = 0;
        const titleHtml = titleSentences
          .map((s) => {
            const sIdx = sentenceCounter++;
            return `<span class="news-sentence" data-article-idx="${idx}" data-sentence-idx="${sIdx}">${tokenizeWordsHtml(s, idx)}</span>`;
          })
          .join(' ');

        const paragraphsHtml = paragraphs
          .map((p) => {
            const sentences = splitIntoSentences(p);
            const inner = sentences
              .map((s) => {
                const sIdx = sentenceCounter++;
                return `<span class="news-sentence" data-article-idx="${idx}" data-sentence-idx="${sIdx}">${tokenizeWordsHtml(s, idx)}</span>`;
              })
              .join(' ');
            return `<p class="news-card-paragraph">${inner}</p>`;
          })
          .join('');

        return `
          <article class="news-card" data-article-idx="${idx}">
            <div class="news-card-top">
              <div class="news-card-meta-left">
                <span class="news-cat-pill ${cat.cls}">${cat.icon} ${escapeHtml(cat.label)}</span>
                ${shortDateLabel ? `<span class="news-card-date">${escapeHtml(shortDateLabel)}</span>` : ''}
              </div>
              <div class="news-audio-controls">
                <button
                  type="button"
                  class="news-speed-btn"
                  data-article-idx="${idx}"
                  data-speed="0.85"
                  aria-label="Audio speed"
                >0.85x</button>
                <button
                  type="button"
                  class="news-listen-btn"
                  data-article-idx="${idx}"
                  data-listen-label="${escapeHtml(strings.listenBtn)}"
                  data-stop-label="${escapeHtml(strings.stopBtn)}"
                ><span aria-hidden="true">🔊</span> <span>${escapeHtml(strings.listenBtn)}</span></button>
              </div>
            </div>
            <h3 class="news-card-title" dir="ltr">${titleHtml}</h3>
            <div class="news-card-body" dir="ltr">${paragraphsHtml}</div>
            ${article.sourceName ? `
              <div class="news-card-source">
                ${escapeHtml(strings.sourceLabel)}: ${escapeHtml(article.sourceName)}
              </div>
            ` : ''}
          </article>
        `;
      })
      .join('');

    contentEl.innerHTML = `
      <div class="daily-news-hint">
        <span>👆</span>
        <span>${escapeHtml(strings.tapHint)}</span>
      </div>
      ${noticeHtml}
      <div class="daily-news-list">${cardsHtml}</div>
    `;

    // Bind speed toggle buttons
    contentEl.querySelectorAll('.news-speed-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cur = parseFloat(btn.getAttribute('data-speed') || '0.85');
        const next = cur < 0.95 ? 1.0 : 0.85;
        btn.setAttribute('data-speed', String(next));
        btn.textContent = next === 1.0 ? '1.0x' : '0.85x';
      });
    });

    // Bind Listen / Stop buttons with sentence-by-sentence playback & highlight
    contentEl.querySelectorAll('.news-listen-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeNewsWordPopover();
        const wasPlaying = btn.classList.contains('is-playing');
        stopDailyNewsAudio();
        if (wasPlaying) return;

        const artIdx = Number(btn.getAttribute('data-article-idx'));
        const card = contentEl.querySelector(`.news-card[data-article-idx="${artIdx}"]`);
        if (!card) return;

        const speedBtn = card.querySelector('.news-speed-btn');
        const speed = parseFloat(speedBtn?.getAttribute('data-speed') || '0.85') || 0.85;
        const sentences = Array.from(card.querySelectorAll('.news-sentence'));
        if (sentences.length === 0) return;

        const runId = ++activeNewsAudioRunId;
        btn.classList.add('is-playing');
        const stopLabel = btn.getAttribute('data-stop-label') || strings.stopBtn;
        btn.innerHTML = `<span aria-hidden="true">⏹</span> <span>${escapeHtml(stopLabel)}</span>`;

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('daily_news_listen', { locale, article_idx: artIdx, speed });
        }

        for (const sentEl of sentences) {
          if (runId !== activeNewsAudioRunId) break;
          card.querySelectorAll('.news-sentence.is-speaking').forEach((el) => el.classList.remove('is-speaking'));
          sentEl.classList.add('is-speaking');
          const text = (sentEl.textContent || '').trim();
          if (text) {
            await speakWordAsync(text, null, speed);
          }
        }

        if (runId === activeNewsAudioRunId) {
          stopDailyNewsAudio();
        }
      });
    });

    // Outside click & scroll handlers for word popover
    if (activeNewsPopoverOutside) {
      document.removeEventListener('click', activeNewsPopoverOutside);
    }
    activeNewsPopoverOutside = (e) => {
      if (!e.target.closest('.news-word-token') && !e.target.closest('#news-word-popover')) {
        closeNewsWordPopover();
      }
    };
    document.addEventListener('click', activeNewsPopoverOutside);

    if (activeNewsPopoverScroll && typeof window !== 'undefined') {
      window.removeEventListener('scroll', activeNewsPopoverScroll, true);
    }
    activeNewsPopoverScroll = () => closeNewsWordPopover();
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', activeNewsPopoverScroll, { passive: true, capture: true });
    }

    // Bind tap-to-translate on every word token
    contentEl.querySelectorAll('.news-word-token').forEach((tokenEl) => {
      tokenEl.addEventListener('click', async (e) => {
        e.stopPropagation();
        try { triggerHaptic('light'); } catch (_) {}

        const rawWord = tokenEl.getAttribute('data-word') || tokenEl.textContent || '';
        const artIdx = Number(tokenEl.getAttribute('data-article-idx'));
        const article = articles[artIdx];

        document.querySelectorAll('.news-word-token.is-active-token').forEach((el) => {
          el.classList.remove('is-active-token');
        });
        tokenEl.classList.add('is-active-token');

        // 1. Contextual article glossary for user's interface language first
        const articleGlossary = getArticleGlossaryForLocale(article, locale);
        const glossaryMeaning = lookupGlossaryWord(rawWord, articleGlossary);

        // 2. Fallback / transcription from app's built-in dictionary
        const map = dictMap && dictMap.size > 0 ? dictMap : await dictPromise;
        const dictResolved = resolveWord(rawWord, map, locale);

        const meaning = glossaryMeaning || dictResolved?.translation || strings.wordNotFound;
        const transcription = dictResolved?.transcription
          ? `/${String(dictResolved.transcription).replace(/^\/|\/$/g, '')}/`
          : '';

        const pop = ensureNewsPopover();
        const wordEl = pop.querySelector('.news-word-popover-word');
        const transEl = pop.querySelector('.news-word-popover-trans');
        const meaningEl = pop.querySelector('.news-word-popover-meaning');
        const speakBtn = pop.querySelector('.news-word-popover-speak');

        wordEl.textContent = rawWord;
        transEl.textContent = transcription;
        transEl.style.display = transcription ? 'block' : 'none';
        meaningEl.textContent = meaning;
        meaningEl.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

        speakBtn.onclick = (ev) => {
          ev.stopPropagation();
          stopDailyNewsAudio();
          speakWordAsync(rawWord, null, 0.95).catch(() => {});
        };

        positionPopover(pop, tokenEl);
      });
    });
  });
}
