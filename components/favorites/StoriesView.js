import { getStoryStrings } from '../modals/storyTranslations.js?v=386.0';
import { showMilestoneStoryModal, MILESTONE_STORIES } from '../modals/MilestoneStoryModal.js?v=386.0';
import { getMasteredWordsCount } from '../../services/api.js?v=386.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=386.0';

export function renderStoriesView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { onBack = () => {} } = options;
  const lang = getInterfaceLanguage();
  const strings = getStoryStrings(lang);
  const masteredWords = getMasteredWordsCount();

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const allMilestones = [100, 200, 300, 400, 500, 600, 700, 800];
  const unlockedMilestones = allMilestones.filter(m => masteredWords >= m);

  let storyCardsHtml = '';
  if (unlockedMilestones.length === 0) {
    storyCardsHtml = `
      <div class="stories-empty-card" style="text-align: center; padding: 40px 20px; background: rgba(15, 23, 42, 0.6); border: 1.5px dashed rgba(245, 158, 11, 0.3); border-radius: 20px; margin-top: 10px;">
        <div style="font-size: 44px; margin-bottom: 12px;">📖</div>
        <h3 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 8px;">
          ${escapeHtml(strings.storiesEmptyTitle || 'Здесь появятся ваши рассказы')}
        </h3>
        <p style="font-size: 14px; color: #94a3b8; max-width: 380px; margin: 0 auto 16px; line-height: 1.5;">
          ${escapeHtml(strings.storiesEmptyDesc || 'Первый рассказ откроется, когда вы выучите 100 слов.')}
        </p>
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; color: #fde68a;">
          🎯 Прогресс: ${masteredWords} / 100 слов
        </div>
      </div>
    `;
  } else {
    storyCardsHtml = unlockedMilestones.map(m => {
      const story = MILESTONE_STORIES[m];
      if (!story) return '';
      const isCompleted = localStorage.getItem(`myduo_milestone_story_${m}_completed`) === 'true';
      const title = strings[story.titleKey] || story.title;
      const preview = story.paragraphs[0] || '';
      const badge = strings[story.badgeKey] || `🏆 ${m} слов`;

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
          <h3 class="story-card-title">${escapeHtml(title)}</h3>
          <p class="story-card-preview">“${escapeHtml(preview)}”</p>
          <div class="story-card-action">
            <button type="button" class="story-card-btn" data-milestone="${m}">
              📖 <span>${escapeHtml(strings.readStoryBtn || 'Читать')}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <style>
      .stories-view-page {
        padding: 16px;
        max-width: 680px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .stories-view-back {
        background: none;
        border: none;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-color, #38bdf8);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        margin-bottom: 12px;
      }
      .stories-view-header {
        margin-bottom: 20px;
      }
      .stories-view-title {
        font-size: 24px;
        font-weight: 800;
        color: #f8fafc;
        margin: 0 0 6px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .stories-view-subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin: 0 0 12px;
        line-height: 1.4;
      }
      .stories-view-progress {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 8px 14px;
        font-size: 13px;
        color: #e2e8f0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .stories-view-progress strong {
        color: #fbbf24;
      }
      .stories-list-grid {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .story-list-card {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 1.5px solid rgba(245, 158, 11, 0.3);
        border-radius: 18px;
        padding: 16px 18px;
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        cursor: pointer;
      }
      .story-list-card:hover {
        border-color: rgba(251, 191, 36, 0.6);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
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
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.15);
        padding: 3px 8px;
        border-radius: 9999px;
      }
      .story-card-status {
        font-size: 11.5px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 9999px;
      }
      .status-unlocked {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .story-card-title {
        font-size: 17px;
        font-weight: 800;
        color: #f8fafc;
        margin: 0 0 6px;
      }
      .story-card-preview {
        font-size: 13.5px;
        color: #94a3b8;
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
        color: #fde68a;
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
      .story-card-btn:hover {
        background: #f59e0b;
        color: #0f172a;
      }
    </style>

    <div class="stories-view-page">
      <button type="button" class="stories-view-back" id="stories-back-btn">
        <span>‹</span> <span>${escapeHtml(t('fav_hub_btn') || 'Назад к коллекциям')}</span>
      </button>

      <div class="stories-view-header">
        <h2 class="stories-view-title">📖 <span>${escapeHtml(strings.storiesFolderTitle || 'Рассказы')}</span></h2>
        <p class="stories-view-subtitle">${escapeHtml(strings.storiesFolderDesc || 'Тексты по выученным словам')}</p>
        <div class="stories-view-progress">
          <span>🎯 Выучено слов: <strong>${masteredWords}</strong> (доступно рассказов: <strong>${unlockedMilestones.length}</strong>)</span>
        </div>
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

  // Story click bindings
  container.querySelectorAll('.story-list-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const milestone = Number(card.getAttribute('data-milestone')) || 100;
      showMilestoneStoryModal(milestone);
    });
  });
}
