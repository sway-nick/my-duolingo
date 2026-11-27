import { getStoryStrings } from '../modals/storyTranslations.js?v=423.0';
import { getMicroRulesStrings, getTenseConstructionsStrings } from './grammarUiTranslations.js?v=423.0';
import { getSpokenEnglishStrings } from './spokenEnglishI18n.js?v=423.0';
import { getSpokenUnlockedLimit } from './SpokenEnglishView.js?v=423.0';
import { SPOKEN_ENGLISH_ITEMS } from './spokenEnglishData.js?v=423.0';
import { getMasteredWordsCount } from '../../services/api.js?v=423.0';
import { getInterfaceLanguage, t } from '../../services/i18n.js?v=423.0';
import { isProActive } from '../../services/proState.js?v=423.0';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderGrammarHubView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onBack = () => {},
    onOpenSection = () => {},
  } = options;

  const lang = getInterfaceLanguage();
  const storyStrings = getStoryStrings(lang);
  const microStrings = getMicroRulesStrings(lang);
  const tenseStrings = getTenseConstructionsStrings(lang);
  const spokenStrings = getSpokenEnglishStrings(lang);

  let unlockedStoriesCount = 0;
  try {
    const masteredWords = getMasteredWordsCount();
    const allMilestones = Array.from({ length: 37 }, (_, i) => i * 50);
    unlockedStoriesCount = isProActive()
      ? allMilestones.length
      : allMilestones.filter((m) => masteredWords >= m).length;
  } catch (_) {}
  const storiesCountLabel = `${unlockedStoriesCount} / 37`;

  const spokenUnlocked = getSpokenUnlockedLimit();
  const spokenTotal = SPOKEN_ENGLISH_ITEMS.length;
  const spokenCountLabel = isProActive()
    ? spokenStrings.folderSubtitle
    : `${spokenUnlocked} / ${spokenTotal}`;

  container.innerHTML = `
    <div class="collections-hub-page" style="padding: 8px 4px 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <div>
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; line-height: 1.2;">${escapeHtml(spokenStrings.grammarHubTitle)}</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">${escapeHtml(spokenStrings.grammarHubSubtitle)}</p>
        </div>
        <button type="button" id="grammar-hub-back-btn" class="cat-select-circle-btn" style="width: 36px; height: 36px; min-width: 36px; min-height: 36px; border-radius: 50%; border: 1.5px solid var(--border-color, #334155); background: var(--bg-hover, #1e293b); color: var(--text-muted, #94a3b8); display: inline-flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; box-sizing: border-box; flex-shrink: 0;" aria-label="${escapeHtml(t('modal_close') || 'Close')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="collections-grid" id="grammar-hub-grid">
        <div class="col-tile col-tile-microrules" data-grammar-id="grammar_microrules" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">📘</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(microStrings.folderTitle || 'Микроправила')}</h3>
            <span class="col-tile-count">${escapeHtml(microStrings.folderSubtitle || '156 правил по шагам')}</span>
          </div>
        </div>

        <div class="col-tile col-tile-tenses" data-grammar-id="tense_constructions" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">⏳</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(tenseStrings.folderTitle || 'Временные конструкции')}</h3>
            <span class="col-tile-count">${escapeHtml(tenseStrings.folderSubtitle || '16 конструкций и матрица')}</span>
          </div>
        </div>

        <div class="col-tile col-tile-spoken" data-grammar-id="spoken_english" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🗣️</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(spokenStrings.folderTitle || 'Живой английский')}</h3>
            <span class="col-tile-count">${escapeHtml(spokenCountLabel)}</span>
          </div>
        </div>

        <div class="col-tile col-tile-stories" data-grammar-id="milestone_stories" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">📖</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(storyStrings.storiesFolderTitle || 'Тексты')}</h3>
            <span class="col-tile-count">${escapeHtml(storiesCountLabel)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#grammar-hub-back-btn')?.addEventListener('click', () => onBack());

  container.querySelectorAll('[data-grammar-id]').forEach((tile) => {
    const open = () => {
      const id = tile.getAttribute('data-grammar-id');
      if (id) {
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('grammar_tile_click', { section: id });
        }
        onOpenSection(id);
      }
    };
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}
