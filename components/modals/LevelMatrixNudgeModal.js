import {
  getLevelMatrixStrings,
  computeLevelReadiness,
} from '../favorites/levelMatrixData.js?v=423.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';

export const STORAGE_KEY_CEFR_NUDGE = 'myduo_cefr_nudge_milestones';

const CEFR_LEVELS_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

const FALLBACK_STRINGS = {
  en: {
    nudgeFirstTitle: 'Great start in {level}! 🚀',
    nudgeReadyTitle: 'Level {level} is ready for the exam! 🏆',
    nudgeFirstDesc: 'You closed {done} of {total} blocks in {level}. Open the matrix or try the exam.',
    nudgeReadyDesc: 'All {done} / {total} blocks in {level} are complete! Take the exam to earn +50 XP.',
    nudgeOpenMatrixBtn: '📊 Open Level Matrix',
    nudgeStartExamBtn: '🎯 Take {level} Exam',
    nudgeLaterBtn: 'Later',
  },
  ru: {
    nudgeFirstTitle: 'Отличный старт в {level}! 🚀',
    nudgeReadyTitle: 'Уровень {level} готов к экзамену! 🏆',
    nudgeFirstDesc: 'Вы закрыли {done} из {total} блоков уровня {level}. Откройте матрицу или проверьте себя.',
    nudgeReadyDesc: 'Все {done} / {total} блоков уровня {level} закрыты! Сдайте тест и получите +50 XP.',
    nudgeOpenMatrixBtn: '📊 Открыть матрицу уровней',
    nudgeStartExamBtn: '🎯 Сдать тест {level}',
    nudgeLaterBtn: 'Позже',
  },
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readNudgeMilestones() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CEFR_NUDGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeNudgeMilestone(levelId, triggerType) {
  if (typeof localStorage === 'undefined') return;
  try {
    const saved = readNudgeMilestones();
    saved[levelId] = triggerType;
    localStorage.setItem(STORAGE_KEY_CEFR_NUDGE, JSON.stringify(saved));
  } catch (_) {
    // Ignore storage quota or private mode errors
  }
}

function resolveStrings(lang) {
  const norm = String(lang || 'ru').toLowerCase().trim();
  const base = norm.split(/[-_]/)[0];
  const fallback = base === 'ru' ? FALLBACK_STRINGS.ru : FALLBACK_STRINGS.en;
  let matrixStrings = {};
  try {
    matrixStrings = getLevelMatrixStrings(lang) || {};
  } catch (_) {
    matrixStrings = {};
  }
  return {
    nudgeFirstTitle: matrixStrings.nudgeFirstTitle || fallback.nudgeFirstTitle,
    nudgeReadyTitle: matrixStrings.nudgeReadyTitle || fallback.nudgeReadyTitle,
    nudgeFirstDesc: matrixStrings.nudgeFirstDesc || fallback.nudgeFirstDesc,
    nudgeReadyDesc: matrixStrings.nudgeReadyDesc || fallback.nudgeReadyDesc,
    nudgeOpenMatrixBtn: matrixStrings.nudgeOpenMatrixBtn || fallback.nudgeOpenMatrixBtn,
    nudgeStartExamBtn: matrixStrings.nudgeStartExamBtn || fallback.nudgeStartExamBtn,
    nudgeLaterBtn: matrixStrings.nudgeLaterBtn || fallback.nudgeLaterBtn,
  };
}

function formatTemplate(template, vars) {
  return String(template || '')
    .replace(/\{level\}/g, vars.level ?? '')
    .replace(/\{done\}/g, vars.done ?? '')
    .replace(/\{total\}/g, vars.total ?? '');
}

/**
 * Evaluates whether a CEFR level has reached a nudge milestone ('first' or 'ready')
 * that has not been shown yet.
 */
export function evaluateCefrNudgeCandidate(allWords = [], lang = 'ru') {
  const saved = readNudgeMilestones();

  for (const lvl of CEFR_LEVELS_ORDER) {
    const readiness = computeLevelReadiness(lvl, allWords, lang);
    if (!readiness || readiness.examPassed) continue;

    if (
      readiness.totalBlocks > 0 &&
      readiness.closedBlocks === readiness.totalBlocks &&
      saved[lvl] !== 'ready'
    ) {
      return { levelId: lvl, triggerType: 'ready', readiness };
    }

    if (readiness.closedBlocks >= 1 && !saved[lvl]) {
      return { levelId: lvl, triggerType: 'first', readiness };
    }
  }

  return null;
}

/**
 * Renders and displays the CEFR Level Matrix Nudge modal.
 */
export function showLevelMatrixNudgeModal(candidate, allWords = [], callbacks = {}) {
  if (typeof document === 'undefined') return false;
  if (!candidate || !candidate.levelId) return false;

  const lang = getInterfaceLanguage() || 'ru';
  const baseLang = String(lang).toLowerCase().trim().split(/[-_]/)[0];
  const isRtl = RTL_LOCALES.has(baseLang);

  const levelId = String(candidate.levelId).toUpperCase().trim();
  const triggerType = candidate.triggerType === 'ready' ? 'ready' : 'first';
  const readiness = candidate.readiness || computeLevelReadiness(levelId, allWords, lang);

  writeNudgeMilestone(levelId, triggerType);

  const existing = document.getElementById('cefr-nudge-modal-overlay');
  if (existing) existing.remove();

  const s = resolveStrings(lang);
  const doneCount = Number(readiness?.closedBlocks || 0);
  const totalCount = Number(readiness?.totalBlocks || 0);
  const pct = Math.max(0, Math.min(100, Number(readiness?.percent || 0)));

  const titleText = formatTemplate(
    triggerType === 'ready' ? s.nudgeReadyTitle : s.nudgeFirstTitle,
    { level: levelId, done: doneCount, total: totalCount }
  );
  const descText = formatTemplate(
    triggerType === 'ready' ? s.nudgeReadyDesc : s.nudgeFirstDesc,
    { level: levelId, done: doneCount, total: totalCount }
  );
  const examBtnText = formatTemplate(s.nudgeStartExamBtn, {
    level: levelId,
    done: doneCount,
    total: totalCount,
  });

  const blocks = Array.isArray(readiness?.blocks) ? readiness.blocks : [];
  const closedPreview = blocks.filter((b) => b && b.done).slice(0, 2);
  const openPreview = blocks.filter((b) => b && !b.done).slice(0, 4);

  const closedRowsHtml = closedPreview
    .map(
      (b) => `
      <div class="cefr-nudge-block is-done">
        <span class="cefr-nudge-block-status" aria-hidden="true">✅</span>
        <span class="cefr-nudge-block-title">${escapeHtml(b.title)}</span>
        <span class="cefr-nudge-block-count" dir="ltr">${escapeHtml(b.current)}/${escapeHtml(b.target)}</span>
      </div>`
    )
    .join('');

  const openRowsHtml = openPreview
    .map(
      (b) => `
      <div class="cefr-nudge-block is-open">
        <span class="cefr-nudge-block-status" aria-hidden="true">⏳</span>
        <span class="cefr-nudge-block-title">${escapeHtml(b.title)}</span>
        <span class="cefr-nudge-block-count" dir="ltr">${escapeHtml(b.current)}/${escapeHtml(b.target)}</span>
      </div>`
    )
    .join('');

  const overlay = document.createElement('div');
  overlay.id = 'cefr-nudge-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'cefr-nudge-title');
  overlay.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

  overlay.innerHTML = `
    <style>
      #cefr-nudge-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 10050;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.68);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        padding: 16px;
        box-sizing: border-box;
        animation: cefrNudgeFadeIn 0.2s ease-out;
      }
      @keyframes cefrNudgeFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes cefrNudgeSlideUp {
        from { opacity: 0; transform: translateY(14px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .cefr-nudge-card {
        position: relative;
        width: 100%;
        max-width: 420px;
        max-height: 90vh;
        overflow-y: auto;
        background: var(--bg-card, #ffffff);
        color: var(--text-primary, #0f172a);
        border: 1px solid var(--border-subtle, #e2e8f0);
        border-radius: 24px;
        padding: 26px 22px 22px;
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.24);
        animation: cefrNudgeSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }
      .dark-theme .cefr-nudge-card,
      [data-theme="dark"] .cefr-nudge-card {
        background: #111827;
        color: #f8fafc;
        border-color: #334155;
        box-shadow: 0 24px 56px rgba(0, 0, 0, 0.55);
      }
      .cefr-nudge-close {
        position: absolute;
        top: 14px;
        inset-inline-end: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--border-subtle, #e2e8f0);
        background: var(--bg-subtle, #f1f5f9);
        color: var(--text-secondary, #475569);
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ease, color 0.15s ease;
      }
      .cefr-nudge-close:hover {
        background: var(--bg-card-hover, #e2e8f0);
        color: var(--text-primary, #0f172a);
      }
      .dark-theme .cefr-nudge-close,
      [data-theme="dark"] .cefr-nudge-close {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        color: #94a3b8;
      }
      .dark-theme .cefr-nudge-close:hover,
      [data-theme="dark"] .cefr-nudge-close:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
      .cefr-nudge-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: 0.4px;
        background: rgba(99, 102, 241, 0.12);
        color: #4f46e5;
        margin-bottom: 10px;
      }
      .dark-theme .cefr-nudge-badge,
      [data-theme="dark"] .cefr-nudge-badge {
        background: rgba(99, 102, 241, 0.22);
        color: #a5b4fc;
      }
      .cefr-nudge-title {
        margin: 0 0 8px;
        padding-inline-end: 28px;
        font-size: 20px;
        font-weight: 800;
        line-height: 1.3;
        color: var(--text-primary, #0f172a);
      }
      .dark-theme .cefr-nudge-title,
      [data-theme="dark"] .cefr-nudge-title {
        color: #f8fafc;
      }
      .cefr-nudge-desc {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-secondary, #475569);
      }
      .dark-theme .cefr-nudge-desc,
      [data-theme="dark"] .cefr-nudge-desc {
        color: #cbd5e1;
      }
      .cefr-nudge-matrix-box {
        background: var(--bg-subtle, #f8fafc);
        border: 1px solid var(--border-subtle, #e2e8f0);
        border-radius: 16px;
        padding: 12px 14px;
        margin-bottom: 18px;
      }
      .dark-theme .cefr-nudge-matrix-box,
      [data-theme="dark"] .cefr-nudge-matrix-box {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.1);
      }
      .cefr-nudge-progress-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--text-primary, #0f172a);
      }
      .dark-theme .cefr-nudge-progress-head,
      [data-theme="dark"] .cefr-nudge-progress-head {
        color: #f1f5f9;
      }
      .cefr-nudge-progress-track {
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.25);
        overflow: hidden;
        margin-bottom: 10px;
      }
      .cefr-nudge-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #6366f1 0%, #10b981 100%);
        transition: width 0.3s ease;
      }
      .cefr-nudge-blocks {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cefr-nudge-block {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 10px;
        font-size: 13px;
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border-subtle, #e2e8f0);
      }
      .dark-theme .cefr-nudge-block,
      [data-theme="dark"] .cefr-nudge-block {
        background: rgba(15, 23, 42, 0.55);
        border-color: rgba(255, 255, 255, 0.08);
      }
      .cefr-nudge-block.is-done {
        border-color: rgba(16, 185, 129, 0.35);
      }
      .cefr-nudge-block-status {
        flex-shrink: 0;
        font-size: 13px;
      }
      .cefr-nudge-block-title {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
        text-align: start;
      }
      .cefr-nudge-block-count {
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted, #64748b);
      }
      .dark-theme .cefr-nudge-block-count,
      [data-theme="dark"] .cefr-nudge-block-count {
        color: #94a3b8;
      }
      .cefr-nudge-actions {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .cefr-nudge-btn-primary {
        width: 100%;
        border: none;
        border-radius: 14px;
        padding: 13px 16px;
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .cefr-nudge-btn-primary:active {
        transform: scale(0.98);
        filter: brightness(0.95);
      }
      .cefr-nudge-btn-secondary {
        width: 100%;
        border-radius: 14px;
        padding: 12px 16px;
        font-size: 14.5px;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        transition: transform 0.15s ease, background-color 0.15s ease;
      }
      .dark-theme .cefr-nudge-btn-secondary,
      [data-theme="dark"] .cefr-nudge-btn-secondary {
        background: rgba(16, 185, 129, 0.16);
        color: #6ee7b7;
        border-color: rgba(16, 185, 129, 0.35);
      }
      .cefr-nudge-btn-secondary:active {
        transform: scale(0.98);
      }
      .cefr-nudge-btn-later {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--text-muted, #64748b);
        font-size: 13.5px;
        font-weight: 600;
        padding: 8px;
        cursor: pointer;
      }
      .cefr-nudge-btn-later:hover {
        color: var(--text-primary, #0f172a);
      }
      .dark-theme .cefr-nudge-btn-later,
      [data-theme="dark"] .cefr-nudge-btn-later {
        color: #94a3b8;
      }
      .dark-theme .cefr-nudge-btn-later:hover,
      [data-theme="dark"] .cefr-nudge-btn-later:hover {
        color: #f8fafc;
      }
    </style>
    <div class="cefr-nudge-card">
      <button type="button" class="cefr-nudge-close" id="cefr-nudge-close-btn" aria-label="Close">✕</button>
      <div class="cefr-nudge-badge" dir="ltr">CEFR ${escapeHtml(levelId)}</div>
      <h3 class="cefr-nudge-title" id="cefr-nudge-title">${escapeHtml(titleText)}</h3>
      <p class="cefr-nudge-desc">${escapeHtml(descText)}</p>

      <div class="cefr-nudge-matrix-box">
        <div class="cefr-nudge-progress-head">
          <span dir="ltr">${escapeHtml(levelId)}</span>
          <span dir="ltr">${escapeHtml(doneCount)} / ${escapeHtml(totalCount)} (${escapeHtml(pct)}%)</span>
        </div>
        <div class="cefr-nudge-progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="cefr-nudge-progress-fill" style="width: ${pct}%"></div>
        </div>
        ${(closedRowsHtml || openRowsHtml) ? `<div class="cefr-nudge-blocks">${closedRowsHtml}${openRowsHtml}</div>` : ''}
      </div>

      <div class="cefr-nudge-actions">
        <button type="button" class="cefr-nudge-btn-primary" id="cefr-nudge-matrix-btn">${escapeHtml(s.nudgeOpenMatrixBtn)}</button>
        <button type="button" class="cefr-nudge-btn-secondary" id="cefr-nudge-exam-btn">${escapeHtml(examBtnText)}</button>
        <button type="button" class="cefr-nudge-btn-later" id="cefr-nudge-later-btn">${escapeHtml(s.nudgeLaterBtn)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  function closeModal() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
  }

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  overlay.querySelector('#cefr-nudge-close-btn')?.addEventListener('click', () => {
    closeModal();
  });

  overlay.querySelector('#cefr-nudge-later-btn')?.addEventListener('click', () => {
    closeModal();
  });

  overlay.querySelector('#cefr-nudge-matrix-btn')?.addEventListener('click', () => {
    closeModal();
    callbacks?.onOpenMatrix?.(levelId);
  });

  overlay.querySelector('#cefr-nudge-exam-btn')?.addEventListener('click', () => {
    closeModal();
    callbacks?.onStartExam?.(levelId);
  });

  return true;
}

/**
 * Checks whether a CEFR nudge should be displayed and opens the modal if eligible.
 */
export function maybeShowLevelMatrixNudge(allWords = [], callbacks = {}) {
  if (typeof document === 'undefined') return false;

  const openModal = document.querySelector(
    '#cefr-nudge-modal-overlay, #story-modal-overlay, #eb-pro-paywall-overlay, .modal-overlay.is-open'
  );
  if (openModal) return false;

  const candidate = evaluateCefrNudgeCandidate(allWords, getInterfaceLanguage());
  if (!candidate) return false;

  return showLevelMatrixNudgeModal(candidate, allWords, callbacks);
}
