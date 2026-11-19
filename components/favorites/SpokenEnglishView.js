import { SPOKEN_ENGLISH_ITEMS, getLocalizedSpokenItem } from './spokenEnglishData.js?v=386.0';
import { getSpokenEnglishStrings } from './spokenEnglishI18n.js?v=386.0';
import { getInterfaceLanguage, t } from '../../services/i18n.js?v=386.0';
import { speakWord } from '../../services/audioService.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';
import { isProActive } from '../../services/proState.js?v=386.0';
import { ProService } from '../../services/proService.js?v=386.0';
import { getProStrings } from '../../services/proI18n.js?v=386.0';

const STORAGE_KEY_SPOKEN_AD_UNLOCKED = 'myduo_spoken_ad_unlocked';
const STORAGE_KEY_SPOKEN_UNLOCKED_COUNT = 'myduo_spoken_unlocked_count';

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

export function renderSpokenEnglishView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { onBack = () => {} } = options;
  const lang = getInterfaceLanguage();
  const s = getSpokenEnglishStrings(lang);
  const sPro = getProStrings(lang);
  const activeCategoryInit = options._activeCategory || 'all';
  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('spoken_english', 'SpokenEnglishView');
  }
  let activeCategory = activeCategoryInit;

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
      .filter(({ item }) => activeCategory === 'all' || item.category === activeCategory);

    const visibleItems = filteredItems.filter(({ index }) => index < unlockedLimit);

    const filterChipsHtml = ['all', 'reductions', 'drops', 'texting', 'phrases']
      .map((cat) => `
        <button type="button" class="spoken-filter-chip ${activeCategory === cat ? 'is-active' : ''}" data-spoken-cat="${cat}">
          ${escapeHtml(catLabels[cat] || cat)}
        </button>
      `)
      .join('');

    const cardsHtml = visibleItems.map(({ item, index }) => {
      const loc = getLocalizedSpokenItem(item, lang);
      const badgeLabel = catLabels[item.category] || item.category;
      return `
        <article class="spoken-card" data-spoken-id="${item.id}">
          <div class="spoken-card-top">
            <span class="spoken-cat-badge">${escapeHtml(badgeLabel)}</span>
            <span class="spoken-num">#${index + 1}</span>
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

    let gateBoxHtml = '';
    if (!isPro && unlockedLimit < total) {
      gateBoxHtml = `
        <div class="spoken-gate-box" id="spoken-gate-box">
          <p class="spoken-gate-counter">🔒 ${escapeHtml(String(s.unlockedCounter || '{n} / {total}').replace('{n}', String(unlockedLimit)).replace('{total}', String(total)))}</p>
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
          <p class="spoken-gate-hint">${escapeHtml(String(s.proRemainingHint || '').replace('{n}', String(proRemaining)))}</p>
        </div>
      `;
    }

    container.innerHTML = `
      <style>
        .spoken-page { width: 100%; max-width: min(680px, 100%); min-width: 0; padding: 8px 12px 84px; margin: 0 auto; box-sizing: border-box; overflow-x: hidden; }
        .spoken-header { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 8px; }
        .spoken-back-btn { background: var(--card-bg, #ffffff); border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.28)); color: var(--text-main, #0f172a); border-radius: 12px; padding: 7px 14px; font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .spoken-back-btn:active { transform: scale(0.97); }
        .spoken-title { margin: 0; font-size: 19px; font-weight: 800; color: var(--text-main, #0f172a); min-width: 0; overflow-wrap: anywhere; }
        .spoken-sub { margin: 0 0 12px; font-size: 13.5px; color: var(--text-muted, #64748b); line-height: 1.4; overflow-wrap: anywhere; }
        .spoken-filters { display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 4px; margin-bottom: 12px; width: 100%; box-sizing: border-box; }
        .spoken-filter-chip { border: 1px solid var(--border-color, #e2e8f0); background: var(--card-bg, #ffffff); color: var(--text-muted, #64748b); border-radius: 999px; padding: 6px 11px; font-size: 12px; font-weight: 700; cursor: pointer; max-width: 100%; }
        .spoken-filter-chip.is-active { background: var(--primary-color, #2563eb); border-color: var(--primary-color, #2563eb); color: #ffffff; }
        .spoken-list { display: flex; flex-direction: column; gap: 12px; width: 100%; min-width: 0; }
        .spoken-card { width: 100%; min-width: 0; box-sizing: border-box; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm, 0 4px 12px rgba(15,23,42,0.05)); }
        .spoken-card-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
        .spoken-cat-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; background: rgba(37, 99, 235, 0.1); color: var(--primary-color, #2563eb); }
        .spoken-num { font-size: 12px; font-weight: 700; color: var(--text-muted, #64748b); flex-shrink: 0; }
        .spoken-pair-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 6px; align-items: center; margin-bottom: 10px; width: 100%; min-width: 0; }
        .spoken-formal-box, .spoken-native-box { background: var(--bg-hover, #f1f5f9); border-radius: 12px; padding: 8px 10px; min-width: 0; box-sizing: border-box; }
        .spoken-native-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); }
        .spoken-mini-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted, #64748b); margin-bottom: 2px; }
        .spoken-formal-text { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted, #64748b); overflow-wrap: anywhere; word-break: break-word; }
        .spoken-meaning-text { display: block; margin-top: 3px; font-size: 12px; font-weight: 700; color: var(--primary-color, #2563eb); overflow-wrap: anywhere; word-break: break-word; }
        .spoken-arrow { font-size: 14px; font-weight: 800; color: var(--text-muted, #64748b); flex-shrink: 0; }
        .spoken-native-line { display: flex; align-items: center; justify-content: space-between; gap: 4px; min-width: 0; }
        .spoken-native-text { font-size: 14.5px; font-weight: 800; color: var(--text-main, #0f172a); overflow-wrap: anywhere; word-break: break-word; min-width: 0; }
        .spoken-audio-btn { background: none; border: none; font-size: 16px; cursor: pointer; padding: 2px; flex-shrink: 0; line-height: 1; }
        .spoken-explanation { margin: 0 0 10px; font-size: 13px; line-height: 1.45; color: var(--text-main, #0f172a); overflow-wrap: anywhere; }
        .spoken-example-box { background: var(--bg-hover, #f1f5f9); border-radius: 10px; padding: 8px 10px; min-width: 0; box-sizing: border-box; }
        .spoken-example-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; }
        .spoken-example-en { font-size: 13.5px; font-weight: 700; color: var(--text-main, #0f172a); overflow-wrap: anywhere; min-width: 0; }
        .spoken-example-tr { margin-top: 3px; font-size: 12.5px; color: var(--text-muted, #64748b); overflow-wrap: anywhere; }
        .spoken-gate-box { width: 100%; box-sizing: border-box; margin-top: 16px; padding: 20px 16px; border-radius: 16px; background: var(--card-bg, #ffffff); border: 1.5px solid rgba(245, 158, 11, 0.35); text-align: center; }
        .spoken-gate-counter { margin: 0 0 10px; font-size: 14px; font-weight: 800; color: var(--text-main, #0f172a); }
        .spoken-gate-actions { display: flex; flex-direction: column; gap: 10px; max-width: 320px; margin: 0 auto 10px; }
        .spoken-gate-btn { min-height: 44px; border-radius: 12px; font-size: 14.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; cursor: pointer; }
        .spoken-pro-btn { background: linear-gradient(135deg, #f59e0b, #ea580c); }
        .spoken-gate-hint { margin: 0; font-size: 12.5px; color: var(--text-muted, #64748b); }
      </style>
      <div class="spoken-page">
        <div class="spoken-header">
          <button type="button" id="spoken-back-btn" class="spoken-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
          <h2 class="spoken-title">${escapeHtml(s.hubTitle)}</h2>
        </div>
        <p class="spoken-sub">${escapeHtml(s.hubSubtitle)}</p>
        <div class="spoken-filters">${filterChipsHtml}</div>
        <div class="spoken-list">${cardsHtml}</div>
        ${gateBoxHtml}
      </div>
    `;

    container.querySelector('#spoken-back-btn')?.addEventListener('click', () => onBack());

    container.querySelectorAll('[data-spoken-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-spoken-cat') || 'all';
        options._activeCategory = activeCategory;
        render();
      });
    });

    container.querySelectorAll('[data-speak-text]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-speak-text');
        if (text) speakWord(text);
      });
    });

    const adBtn = container.querySelector('#spoken-ad-unlock-btn');
    adBtn?.addEventListener('click', async () => {
      if (adBtn.disabled) return;
      adBtn.disabled = true;
      const prev = adBtn.innerHTML;
      adBtn.innerHTML = `<span>⏳ ${escapeHtml(t('ad_loading') || 'Загрузка')}</span>`;
      try {
        const res = await AdService.showLanguagePackRewardedAd(s.hubTitle);
        if (!res || (!res.rewardEarned && !res.isOffline)) {
          adBtn.innerHTML = prev;
          adBtn.disabled = false;
          return;
        }
        const nextLimit = Math.min(SPOKEN_ENGLISH_ITEMS.length, getSpokenUnlockedLimit() + 10);
        try {
          localStorage.setItem(STORAGE_KEY_SPOKEN_UNLOCKED_COUNT, String(nextLimit));
        } catch (e) {}
        render();
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
