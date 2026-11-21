import { getStoryStrings } from '../modals/storyTranslations.js?v=386.0';
import { showMilestoneStoryModal, showStoryToast, MILESTONE_STORIES } from '../modals/MilestoneStoryModal.js?v=386.0';
import { showFairyTaleSurveyModal, getFairyTaleStrings } from '../modals/FairyTaleSurveyModal.js?v=386.0';
import { getMasteredWordsCount } from '../../services/api.js?v=386.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { isProActive } from '../../services/proState.js?v=386.0';
import { ProService } from '../../services/proService.js?v=386.0';
import { getProStrings } from '../../services/proI18n.js?v=386.0';
import { getSpokenEnglishStrings } from './spokenEnglishI18n.js?v=386.0';

export function renderStoriesView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('stories_hub', 'StoriesView');
  }

  const { onBack = () => {} } = options;
  const lang = getInterfaceLanguage();
  const strings = getStoryStrings(lang);
  const sPro = getProStrings(lang);
  const masteredWords = getMasteredWordsCount();
  const isPro = isProActive();

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const allMilestones = Object.keys(MILESTONE_STORIES).map(Number).sort((a, b) => a - b);
  const unlockedMilestones = allMilestones.filter(m => isPro || masteredWords >= m);

  const storyCardsHtml = allMilestones.map(m => {
    const story = MILESTONE_STORIES[m];
    if (!story) return '';
    const isUnlocked = isPro || (!story.isProOnly && (m === 0 || masteredWords >= m));
    const isCompleted = localStorage.getItem(`myduo_milestone_story_${m}_completed`) === 'true';
    const title = strings[story.titleKey] || story.title;
    let badge = strings[story.badgeKey] || `🏆 ${m} слов`;
    if (m === 0 && localStorage.getItem('myduo_fairy_tale_survey_done') !== 'true') {
      badge = getFairyTaleStrings().badge;
    }

    let titleHtml = escapeHtml(title);
    if (m === 0) {
      const byMatch = title.match(/^(.*?)\s+by\s+(.*)$/i);
      if (byMatch) {
        titleHtml = `<span style="display: block;">${escapeHtml(byMatch[1])}</span><span style="display: block; font-style: italic; font-weight: 500; opacity: 0.9; margin-top: 2px;">${escapeHtml(byMatch[2])}</span>`;
      }
    }

    if (isUnlocked) {
      const statusBadge = `
        <span class="story-card-status status-unlocked">
          ${isCompleted ? '✓ ' : ''}${escapeHtml(strings.statusUnlocked || 'Открыто')}
        </span>
      `;

      return `
        <div class="story-list-card is-unlocked" data-milestone="${m}" role="button" tabindex="0">
          <div class="story-card-top">
            <div class="story-card-badge">${escapeHtml(badge)}</div>
            ${statusBadge}
          </div>
          ${story.coverImage ? `
            <div class="story-card-cover-wrapper" style="margin: 8px 0 12px 0; border-radius: 12px; overflow: hidden; max-height: 160px; text-align: center;">
              <img src="${story.coverImage}" alt="${escapeHtml(title)}" style="width: auto; max-width: 100%; height: 160px; object-fit: contain; display: inline-block; margin: 0 auto;" />
            </div>
          ` : ''}
          <h3 class="story-card-title"${(m === 0 || m === 1) ? ' style="text-align: center;"' : ''}>${titleHtml}</h3>
        </div>
      `;
    } else {
      const lockLabel = story.isProOnly
        ? (strings.statusLockedPro || 'Только в PRO')
        : (strings.statusLocked || 'Откроется на {count} словах').replace('{count}', m);
      const wordsNeeded = Math.max(0, m - masteredWords);
      const proHint = story.isProOnly
        ? (strings.proStoryHint || 'Эксклюзивная сказка для подписчиков PRO')
        : String(sPro.pro_unlock_learn_or_pro || '').replace('{n}', String(wordsNeeded));
      return `
        <div class="story-list-card is-locked" data-milestone="${m}" data-words-needed="${wordsNeeded}" data-pro-only="${story.isProOnly ? 'true' : 'false'}" data-locked="true" role="button" tabindex="0">
          <div class="story-card-top">
            <span class="story-card-status status-locked">🔒 ${escapeHtml(lockLabel)}</span>
            <span class="story-card-status" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:800;">⭐ ${escapeHtml(sPro.pro_badge || 'PRO')}</span>
          </div>
          ${story.coverImage ? `
            <div class="story-card-cover-wrapper" style="margin: 8px 0 12px 0; border-radius: 12px; overflow: hidden; max-height: 160px; text-align: center;">
              <img src="${story.coverImage}" alt="${escapeHtml(title)}" style="width: auto; max-width: 100%; height: 160px; object-fit: contain; display: inline-block; margin: 0 auto;" />
            </div>
          ` : ''}
          <h3 class="story-card-title story-title-locked"${(m === 0 || m === 1) ? ' style="text-align: center;"' : ''}>${titleHtml}</h3>
          ${proHint ? `<p style="margin:6px 0 0;font-size:12px;line-height:1.35;color:var(--text-muted,#94a3b8);">${escapeHtml(proHint)}</p>` : ''}
        </div>
      `;
    }
  }).join('');

  container.innerHTML = `
    <style>
      .stories-view-page {
        padding: 4px 16px 16px;
        max-width: 680px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .stories-view-back {
        background: none;
        border: none;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-color, #2563eb);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        margin-bottom: 12px;
      }
      body.dark-theme .stories-view-back,
      .dark-theme .stories-view-back,
      [data-theme="dark"] .stories-view-back {
        color: #38bdf8;
      }
      .stories-view-header {
        margin-bottom: 20px;
      }
      .stories-view-title {
        font-size: 24px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin: 0 0 6px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .stories-view-subtitle {
        font-size: 14px;
        color: var(--text-muted, #64748b);
        margin: 0 0 12px;
        line-height: 1.4;
      }
      .stories-view-progress {
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        padding: 8px 14px;
        font-size: 13px;
        color: var(--text-main, #0f172a);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .stories-view-progress strong {
        color: #d97706;
      }
      .stories-list-grid {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .story-list-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid rgba(245, 158, 11, 0.35);
        border-radius: 18px;
        padding: 16px 18px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        cursor: pointer;
      }
      .story-card-cover-wrapper {
        background: var(--bg-hover, #f1f5f9);
      }
      body.dark-theme .story-list-card,
      .dark-theme .story-list-card,
      [data-theme='dark'] .story-list-card {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border-color: rgba(245, 158, 11, 0.3);
      }
      body.dark-theme .story-card-cover-wrapper,
      .dark-theme .story-card-cover-wrapper,
      [data-theme='dark'] .story-card-cover-wrapper {
        background: rgba(15, 23, 42, 0.6);
      }
      .story-list-card.is-unlocked:hover {
        border-color: rgba(245, 158, 11, 0.7);
        box-shadow: var(--shadow-md, 0 8px 24px rgba(15, 23, 42, 0.1));
        transform: translateY(-2px);
      }
      .story-list-card.is-locked {
        opacity: 0.72;
        border-color: var(--border-color, #e2e8f0);
        cursor: pointer;
      }
      .story-list-card.is-locked:hover {
        border-color: rgba(148, 163, 184, 0.55);
      }
      .story-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .story-card-badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #b45309;
        background: rgba(245, 158, 11, 0.14);
        padding: 3px 8px;
        border-radius: 9999px;
      }
      body.dark-theme .story-card-badge,
      .dark-theme .story-card-badge,
      [data-theme='dark'] .story-card-badge {
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.15);
      }
      .story-badge-locked {
        color: var(--text-muted, #64748b);
        background: rgba(148, 163, 184, 0.14);
      }
      .story-card-status {
        font-size: 11.5px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 9999px;
      }
      .status-unlocked {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      body.dark-theme .status-unlocked,
      .dark-theme .status-unlocked,
      [data-theme='dark'] .status-unlocked {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
      .status-locked {
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-muted, #64748b);
        border: 1px solid rgba(148, 163, 184, 0.28);
      }
      .story-card-title {
        font-size: 17px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin: 0;
      }
      .story-title-locked {
        color: var(--text-muted, #64748b);
      }
      .story-card-preview {
        font-size: 13.5px;
        color: var(--text-muted, #64748b);
        margin: 0 0 12px;
        font-style: italic;
        line-height: 1.4;
      }
      .story-card-action {
        display: flex;
        justify-content: flex-end;
      }
      .story-card-btn {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #b45309;
        font-size: 13.5px;
        font-weight: 700;
        padding: 7px 14px;
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      body.dark-theme .story-card-btn,
      .dark-theme .story-card-btn,
      [data-theme='dark'] .story-card-btn {
        color: #fde68a;
      }
      .story-card-btn:hover {
        background: #f59e0b;
        color: #0f172a;
      }
      .story-card-locked-hint {
        font-size: 12.5px;
        color: #64748b;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
      }
    </style>

    <div class="stories-view-page">
      <div style="margin-bottom: 12px;">
        <button type="button" id="stories-back-btn" class="eb-back-pill-btn">‹ ${getSpokenEnglishStrings(lang).backBtn || 'Назад'}</button>
      </div>
      <div class="stories-list-grid">
        ${storyCardsHtml}
      </div>
    </div>
  `;

  // Back button event
  const backBtn = container.querySelector('#stories-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      onBack();
    });
  }

  // Story click bindings (unlocked cards open reader)
  container.querySelectorAll('.story-list-card.is-unlocked').forEach(card => {
    card.addEventListener('click', (e) => {
      const raw = card.getAttribute('data-milestone');
      const milestone = raw !== null && raw !== '' ? Number(raw) : 0;
      const storyId = milestone === 1 ? 'aladdin' : milestone === 0 ? 'japanese_fairy_tale' : `milestone_${milestone}`;
      const storyObj = MILESTONE_STORIES[milestone];
      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('story_card_click', {
          milestone,
          story_id: storyId,
          title: storyObj?.title || '',
          unlocked: true,
        });
      }
      if (milestone === 0 && localStorage.getItem('myduo_fairy_tale_survey_done') !== 'true') {
        showFairyTaleSurveyModal('story_tile');
        return;
      }
      showMilestoneStoryModal(milestone);
    });
  });

  // Story click bindings for locked cards (open PRO paywall with wordsNeeded)
  container.querySelectorAll('.story-list-card.is-locked').forEach(card => {
    card.addEventListener('click', () => {
      const raw = card.getAttribute('data-milestone');
      const milestone = raw !== null && raw !== '' ? Number(raw) : 0;
      const isProOnly = card.getAttribute('data-pro-only') === 'true';
      const wordsNeeded = Number(card.getAttribute('data-words-needed') || 0);
      const storyId = milestone === 1 ? 'aladdin' : milestone === 0 ? 'japanese_fairy_tale' : `milestone_${milestone}`;
      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('story_locked_click', {
          milestone,
          story_id: storyId,
          is_pro_only: isProOnly,
          words_needed: wordsNeeded,
        });
      }
      if (isProOnly) {
        ProService.openPaywall('aladdin_story_pro');
      } else {
        ProService.openPaywall('stories', { wordsNeeded });
      }
    });
  });

  if (typeof window !== 'undefined') {
    if (window._storiesProChangedHandler) {
      window.removeEventListener('eb:pro-changed', window._storiesProChangedHandler);
    }
    window._storiesProChangedHandler = () => {
      if (document.body.contains(container) && container.querySelector('.stories-view-page')) {
        renderStoriesView(containerSelector, options);
      }
    };
    window.addEventListener('eb:pro-changed', window._storiesProChangedHandler);
  }
}
