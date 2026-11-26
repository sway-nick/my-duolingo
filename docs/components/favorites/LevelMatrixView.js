import {
  getLevelMatrixStrings,
  computeLevelReadiness,
  buildLevelExamQuestions,
  computeExamTopicStats,
  savePassedCefrExam,
  loadPassedCefrExams,
} from './levelMatrixData.js?v=423.0';
import { navigateWithReturn } from '../../services/navigationStack.js?v=423.0';
import { addWeeklyXP } from '../../services/api.js?v=423.0';
import {
  playSuccessSound,
  playErrorSound,
  triggerHaptic,
} from '../../services/audioService.js?v=423.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { isProActive } from '../../services/proState.js?v=423.0';
import { ProService } from '../../services/proService.js?v=423.0';
import { MICRO_RULES, getLocalizedMicroRule } from './microRulesData.js?v=423.0';
import { MISTAKE_CARD_LABELS_I18N, RULE_MISTAKE_CARDS } from './ruleMistakeCardsData.js?v=423.0';
import { formatQuizBlankedHtml, bindQuizWordPopover, closeQuizWordPopover } from './quizWordPopover.js?v=423.0';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLevelAccent(level) {
  switch (level) {
    case 'A1': return '#16a34a';
    case 'A2': return '#2563eb';
    case 'B1': return '#d97706';
    case 'B2': return '#9333ea';
    case 'C1': return '#dc2626';
    default: return '#2563eb';
  }
}

function getCategoryLabel(cat, s) {
  switch (cat) {
    case 'collections': return s.catCollections;
    case 'vocabulary': return s.catVocabulary;
    case 'grammar_ref': return s.catGrammarRef;
    case 'irregular': return s.catIrregular;
    case 'tenses': return s.catTenses;
    case 'microrules': return s.catMicroRules;
    case 'spoken': return s.catSpoken;
    default: return cat;
  }
}

function getStylesHtml() {
  return `
    <style>
      .lm-page {
        width: 100%;
        max-width: 720px;
        min-width: 0;
        margin: 0 auto;
        padding: 6px 14px calc(max(64px, var(--safe-bottom, env(safe-area-inset-bottom, 0px))) + 24px);
        box-sizing: border-box;
        overflow-x: hidden;
      }
      .lm-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }
      .lm-back-btn {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, #e2e8f0);
        color: var(--text-main, #0f172a);
        border-radius: 12px;
        padding: 7px 14px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .lm-back-btn:active { transform: scale(0.97); }
      .lm-mode-pills {
        display: inline-flex;
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 999px;
        padding: 3px;
        gap: 3px;
      }
      .lm-mode-pill {
        border: none;
        background: transparent;
        color: var(--text-muted, #64748b);
        font-size: 12.5px;
        font-weight: 700;
        padding: 6px 11px;
        border-radius: 999px;
        cursor: pointer;
      }
      .lm-mode-pill.is-active {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
      }
      .lm-hero {
        margin-bottom: 12px;
      }
      .lm-hero-title {
        margin: 0 0 4px;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        line-height: 1.25;
      }
      .lm-hero-sub {
        margin: 0;
        font-size: 13px;
        color: var(--text-muted, #64748b);
        line-height: 1.4;
      }
      .lm-level-tabs {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        margin-bottom: 12px;
      }
      .lm-level-tab {
        border: 1.5px solid var(--border-color, #e2e8f0);
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #0f172a);
        border-radius: 12px;
        padding: 8px 4px;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: transform 0.12s ease, border-color 0.15s ease;
      }
      .lm-level-tab:active { transform: scale(0.96); }
      .lm-level-tab.is-active {
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }
      .lm-summary-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, #e2e8f0);
        border-radius: 16px;
        padding: 14px 16px;
        margin-bottom: 14px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
      }
      .lm-summary-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .lm-level-name {
        font-size: 16px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
      }
      .lm-passed-badge {
        font-size: 12px;
        font-weight: 800;
        color: #15803d;
        background: rgba(34, 197, 94, 0.15);
        border: 1px solid rgba(34, 197, 94, 0.35);
        padding: 3px 9px;
        border-radius: 999px;
      }
      .lm-readiness-text {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-muted, #64748b);
        margin-bottom: 6px;
      }
      .lm-progress-track {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: var(--bg-hover, #f1f5f9);
        overflow: hidden;
        margin-bottom: 10px;
      }
      .lm-progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.25s ease;
      }
      .lm-not-ready-hint {
        font-size: 12.5px;
        color: var(--text-muted, #64748b);
        margin: 0 0 10px;
        line-height: 1.4;
      }
      .lm-primary-cta {
        width: 100%;
        border: none;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 14.5px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);
      }
      .lm-primary-cta:active { transform: scale(0.98); }
      .lm-secondary-cta {
        width: 100%;
        border: 1.5px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        padding: 11px 16px;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main, #0f172a);
        background: var(--card-bg, #ffffff);
        cursor: pointer;
      }
      .lm-cat-section {
        margin-bottom: 14px;
      }
      .lm-cat-title {
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-muted, #64748b);
        margin: 0 0 8px 2px;
      }
      .lm-blocks-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .lm-block-btn {
        width: 100%;
        text-align: inherit;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 13px;
        border-radius: 14px;
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, #e2e8f0);
        color: var(--text-main, #0f172a);
        cursor: pointer;
        transition: border-color 0.15s ease, transform 0.1s ease;
      }
      .lm-block-btn:active { transform: scale(0.985); }
      .lm-block-btn.is-done {
        border-color: rgba(34, 197, 94, 0.4);
        background: rgba(34, 197, 94, 0.06);
      }
      .lm-block-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }
      .lm-block-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
      .lm-block-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.3;
        overflow-wrap: break-word;
      }
      .lm-block-status {
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 800;
        padding: 4px 9px;
        border-radius: 999px;
        font-variant-numeric: tabular-nums;
      }
      .lm-block-status.is-done {
        color: #15803d;
        background: rgba(34, 197, 94, 0.15);
      }
      .lm-block-status.is-open {
        color: var(--text-muted, #64748b);
        background: var(--bg-hover, #f1f5f9);
      }
      .lm-exam-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, #e2e8f0);
        border-radius: 16px;
        padding: 16px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
      }
      .lm-exam-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 12.5px;
        font-weight: 800;
        color: var(--text-muted, #64748b);
        margin-bottom: 8px;
      }
      .lm-exam-topic-pill {
        font-size: 11.5px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: var(--bg-hover, #f1f5f9);
        color: var(--text-muted, #64748b);
      }
      .lm-exam-prompt {
        font-size: 16px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        line-height: 1.45;
        margin: 8px 0 14px;
      }
      .lm-options-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 14px;
      }
      .lm-opt-btn {
        width: 100%;
        text-align: inherit;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1.5px solid var(--border-color, #e2e8f0);
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #0f172a);
        font-size: 14.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .lm-opt-btn.is-selected {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
      }
      .lm-opt-btn.is-correct {
        border-color: #16a34a;
        background: rgba(34, 197, 94, 0.16);
        color: #15803d;
      }
      .lm-opt-btn.is-wrong {
        border-color: #dc2626;
        background: rgba(239, 68, 68, 0.14);
        color: #b91c1c;
      }
      .lm-tile-answer-zone {
        min-height: 48px;
        border: 1.5px dashed var(--border-color, #cbd5e1);
        border-radius: 12px;
        padding: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        margin-bottom: 10px;
        background: var(--bg-hover, #f8fafc);
      }
      .lm-tile-bank {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-bottom: 10px;
      }
      .lm-tile-chip {
        border: 1.5px solid var(--border-color, #cbd5e1);
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #0f172a);
        border-radius: 10px;
        padding: 7px 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .lm-tile-chip.is-placed {
        background: rgba(37, 99, 235, 0.12);
        border-color: #2563eb;
      }
      .lm-tile-chip:disabled {
        opacity: 0.35;
        cursor: default;
      }
      .lm-tile-tools {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .lm-mini-btn {
        border: 1px solid var(--border-color, #cbd5e1);
        background: var(--bg-hover, #f1f5f9);
        color: var(--text-main, #0f172a);
        border-radius: 8px;
        padding: 5px 10px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .lm-feedback {
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 13.5px;
        font-weight: 700;
        margin-bottom: 12px;
      }
      .lm-feedback.is-ok {
        background: rgba(34, 197, 94, 0.15);
        color: #15803d;
      }
      .lm-feedback.is-bad {
        background: rgba(239, 68, 68, 0.14);
        color: #b91c1c;
      }
      .lm-result-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, #e2e8f0);
        border-radius: 16px;
        padding: 18px 16px;
      }
      .lm-result-score {
        font-size: 28px;
        font-weight: 900;
        margin: 0 0 6px;
      }
      .lm-result-title {
        font-size: 18px;
        font-weight: 800;
        margin: 0 0 6px;
        color: var(--text-main, #0f172a);
      }
      .lm-result-desc {
        font-size: 13.5px;
        color: var(--text-muted, #64748b);
        margin: 0 0 14px;
        line-height: 1.45;
      }
      .lm-weak-heading {
        font-size: 13.5px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin: 12px 0 8px;
      }
      .lm-result-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 14px;
      }
      .lm-profile-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 800;
        color: #1d4ed8;
        background: rgba(37, 99, 235, 0.1);
        border: 1px solid rgba(37, 99, 235, 0.25);
        border-radius: 999px;
        padding: 4px 10px;
        margin-bottom: 8px;
      }
      .lm-skills-box {
        background: var(--bg-hover, #f8fafc);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        padding: 9px 11px;
        margin-bottom: 10px;
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--text-main, #0f172a);
      }
      .lm-skills-label {
        font-weight: 800;
        margin-bottom: 3px;
        color: var(--text-main, #0f172a);
      }
      .lm-skills-text {
        color: var(--text-muted, #64748b);
      }
      .lm-topic-stats-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 14px;
      }
      .lm-topic-stat-row {
        background: var(--bg-hover, #f8fafc);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        padding: 10px 12px;
      }
      .lm-topic-stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }
      .lm-topic-stat-name {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--text-main, #0f172a);
        min-width: 0;
        flex: 1;
      }
      .lm-topic-stat-right {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .lm-topic-fraction {
        font-size: 12.5px;
        font-weight: 700;
        color: var(--text-muted, #64748b);
        font-variant-numeric: tabular-nums;
      }
      .lm-topic-pct-badge {
        font-size: 11.5px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 999px;
        font-variant-numeric: tabular-nums;
      }
      .lm-topic-pct-badge.is-high {
        color: #15803d;
        background: rgba(34, 197, 94, 0.16);
      }
      .lm-topic-pct-badge.is-mid {
        color: #b45309;
        background: rgba(245, 158, 11, 0.18);
      }
      .lm-topic-pct-badge.is-low {
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.16);
      }
      .lm-topic-mini-bar {
        width: 100%;
        height: 6px;
        border-radius: 999px;
        background: var(--border-color, #e2e8f0);
        overflow: hidden;
      }
      .lm-topic-mini-fill {
        height: 100%;
        border-radius: 999px;
      }
      .lm-topic-study-btn {
        border: 1px solid rgba(37, 99, 235, 0.35);
        background: rgba(37, 99, 235, 0.08);
        color: #1d4ed8;
        border-radius: 999px;
        padding: 3px 9px;
        font-size: 11.5px;
        font-weight: 800;
        cursor: pointer;
        flex-shrink: 0;
      }
      .lm-topic-study-btn:active { transform: scale(0.96); }
      .lm-all-correct-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13.5px;
        font-weight: 800;
        color: #15803d;
        background: rgba(34, 197, 94, 0.14);
        border: 1px solid rgba(34, 197, 94, 0.35);
        border-radius: 12px;
        padding: 9px 13px;
        margin: 8px 0 4px;
      }
      .lm-free-a1-note {
        font-size: 12.5px;
        font-weight: 700;
        color: #15803d;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 10px;
        padding: 8px 11px;
        margin-bottom: 10px;
      }
      .lm-mistakes-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 12px;
      }
      .lm-mistake-card {
        background: var(--bg-hover, #f8fafc);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        padding: 11px 12px;
      }
      .lm-mistake-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }
      .lm-mistake-topic {
        font-size: 11.5px;
        font-weight: 800;
        color: var(--text-muted, #64748b);
      }
      .lm-mistake-prompt {
        font-size: 14px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin-bottom: 6px;
        line-height: 1.4;
      }
      .lm-mistake-ans-row {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 3px;
        line-height: 1.35;
      }
      .lm-mistake-ans-row.is-wrong { color: #b91c1c; }
      .lm-mistake-ans-row.is-right { color: #15803d; }
      .lm-mistake-exp {
        font-size: 12.5px;
        color: var(--text-muted, #64748b);
        margin-top: 6px;
        line-height: 1.4;
      }
      .lm-pro-gate-card {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(37, 99, 235, 0.08));
        border: 1.5px solid rgba(245, 158, 11, 0.45);
        border-radius: 14px;
        padding: 14px;
        margin: 12px 0;
      }
      .lm-pro-gate-title {
        font-size: 14.5px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        margin: 0 0 8px;
      }
      .lm-pro-blur-preview {
        filter: blur(4.5px);
        user-select: none;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;
      }
      .lm-pro-gate-desc {
        font-size: 12.5px;
        color: var(--text-muted, #64748b);
        line-height: 1.45;
        margin: 0 0 10px;
      }
      .lm-pro-unlock-btn {
        width: 100%;
        border: none;
        border-radius: 12px;
        padding: 11px 14px;
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.28);
      }
      .lm-pro-unlock-btn:active { transform: scale(0.98); }
      .lm-rule-cut {
        margin-top: 9px;
        border: 1px solid rgba(37, 99, 235, 0.24);
        border-radius: 10px;
        background: var(--card-bg, #ffffff);
        overflow: hidden;
      }
      .lm-rule-cut-summary {
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 11px;
        font-size: 12.5px;
        font-weight: 800;
        color: #1d4ed8;
        cursor: pointer;
        user-select: none;
        background: rgba(37, 99, 235, 0.06);
      }
      body.dark-theme .lm-rule-cut-summary,
      .dark-theme .lm-rule-cut-summary,
      [data-theme="dark"] .lm-rule-cut-summary {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.12);
      }
      body.dark-theme .lm-rule-cut,
      .dark-theme .lm-rule-cut,
      [data-theme="dark"] .lm-rule-cut {
        border-color: rgba(56, 189, 248, 0.36);
      }
      body.dark-theme .lm-rule-cut-body,
      .dark-theme .lm-rule-cut-body,
      [data-theme="dark"] .lm-rule-cut-body {
        border-top-color: rgba(56, 189, 248, 0.24);
      }
      .lm-rule-cut-summary::-webkit-details-marker { display: none; }
      .lm-rule-cut-title-wrap {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex: 1;
        line-height: 1.35;
      }
      .lm-rule-cut-chevron {
        flex-shrink: 0;
        font-size: 12px;
        transition: transform 0.18s ease;
      }
      .lm-rule-cut[open] .lm-rule-cut-chevron {
        transform: rotate(180deg);
      }
      .lm-rule-cut-body {
        padding: 10px 12px 12px;
        border-top: 1px solid rgba(37, 99, 235, 0.16);
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .lm-rule-cut-text {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--text-main, #0f172a);
        white-space: pre-line;
      }
      .lm-rule-cut-contrast-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .lm-rule-cut-contrast {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 9px;
        padding: 8px 10px;
        background: var(--bg-hover, #f8fafc);
        font-size: 12.5px;
      }
      .lm-rule-cut-contrast-pair {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .lm-cut-wrong {
        color: #b91c1c;
        font-weight: 700;
        background: rgba(239, 68, 68, 0.1);
        padding: 2px 7px;
        border-radius: 6px;
      }
      .lm-cut-wrong del {
        text-decoration: line-through;
        text-decoration-thickness: 2px;
      }
      .lm-cut-right {
        color: #15803d;
        font-weight: 700;
        background: rgba(34, 197, 94, 0.12);
        padding: 2px 7px;
        border-radius: 6px;
      }
      body.dark-theme .lm-cut-wrong, .dark-theme .lm-cut-wrong, [data-theme="dark"] .lm-cut-wrong { color: #fca5a5; }
      body.dark-theme .lm-cut-right, .dark-theme .lm-cut-right, [data-theme="dark"] .lm-cut-right { color: #86efac; }
      .lm-rule-cut-contrast-meaning {
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-muted, #64748b);
      }
      .lm-rule-cut-examples {
        background: var(--bg-hover, #f8fafc);
        border-radius: 8px;
        padding: 8px 10px;
      }
      .lm-rule-cut-ex-label {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-muted, #64748b);
        margin-bottom: 5px;
      }
      .lm-rule-cut-ex-item {
        font-size: 12.5px;
        line-height: 1.4;
        margin-bottom: 4px;
      }
      .lm-rule-cut-ex-item:last-child { margin-bottom: 0; }
      .lm-rule-cut-ex-en {
        font-weight: 700;
        color: var(--text-main, #0f172a);
      }
      .lm-rule-cut-ex-tr {
        color: var(--text-muted, #64748b);
        margin-inline-start: 6px;
      }
      .lm-rule-cut-footer {
        display: flex;
        justify-content: flex-end;
      }
      .lm-rule-cut-open-btn {
        border: 1px solid rgba(37, 99, 235, 0.35);
        background: rgba(37, 99, 235, 0.08);
        color: #1d4ed8;
        font-size: 12px;
        font-weight: 800;
        border-radius: 999px;
        padding: 5px 12px;
        cursor: pointer;
      }
      body.dark-theme .lm-rule-cut-open-btn,
      .dark-theme .lm-rule-cut-open-btn,
      [data-theme="dark"] .lm-rule-cut-open-btn {
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.4);
        background: rgba(56, 189, 248, 0.14);
      }
      body.dark-theme .lm-topic-study-btn,
      .dark-theme .lm-topic-study-btn,
      [data-theme="dark"] .lm-topic-study-btn,
      body.dark-theme .lm-profile-pill,
      .dark-theme .lm-profile-pill,
      [data-theme="dark"] .lm-profile-pill {
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.4);
        background: rgba(56, 189, 248, 0.14);
      }
      body.dark-theme .lm-opt-btn.is-correct,
      .dark-theme .lm-opt-btn.is-correct,
      [data-theme="dark"] .lm-opt-btn.is-correct {
        color: #86efac;
        background: rgba(34, 197, 94, 0.2);
        border-color: #22c55e;
      }
      body.dark-theme .lm-opt-btn.is-wrong,
      .dark-theme .lm-opt-btn.is-wrong,
      [data-theme="dark"] .lm-opt-btn.is-wrong {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
      }
      body.dark-theme .lm-feedback.is-ok,
      .dark-theme .lm-feedback.is-ok,
      [data-theme="dark"] .lm-feedback.is-ok {
        color: #86efac;
        background: rgba(34, 197, 94, 0.2);
      }
      body.dark-theme .lm-mistake-ans-row.is-wrong,
      .dark-theme .lm-mistake-ans-row.is-wrong,
      [data-theme="dark"] .lm-mistake-ans-row.is-wrong { color: #fca5a5; }
      body.dark-theme .lm-mistake-ans-row.is-right,
      .dark-theme .lm-mistake-ans-row.is-right,
      [data-theme="dark"] .lm-mistake-ans-row.is-right { color: #86efac; }
      .lm-filled-answer {
        color: #15803d;
        background: rgba(34, 197, 94, 0.16);
        padding: 1px 6px;
        border-radius: 6px;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      body.dark-theme .lm-filled-answer,
      .dark-theme .lm-filled-answer,
      [data-theme="dark"] .lm-filled-answer {
        color: #4ade80;
        background: rgba(34, 197, 94, 0.22);
      }
      .lm-rule-cut-open-btn:active { transform: scale(0.97); }
    </style>
  `;
}

function formatCutMistakeHtml(rawText) {
  return escapeHtml(rawText).replace(/~~([^~]+)~~/g, '<del>$1</del>');
}

export function renderLevelMatrixView(allWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    onBack = () => {},
    onNavigateLink = null,
    initialLevel = 'A1',
    initialMode = 'matrix',
    restoreExamState = null,
  } = options;

  const lang = getInterfaceLanguage();
  const normLang = String(lang || 'ru').toLowerCase().trim();
  const baseLang = normLang.split(/[-_]/)[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getLevelMatrixStrings(normLang);

  let activeLevel = LEVELS.includes(String(initialLevel).toUpperCase())
    ? String(initialLevel).toUpperCase()
    : 'A1';
  const hasRestoreExam = Boolean(restoreExamState && Array.isArray(restoreExamState.examQuestions) && restoreExamState.examQuestions.length > 0);
  let mode = hasRestoreExam || initialMode === 'exam' ? 'exam' : 'matrix';

  // Exam state
  let examQuestions = hasRestoreExam ? restoreExamState.examQuestions : [];
  let examAnswers = hasRestoreExam && Array.isArray(restoreExamState.examAnswers)
    ? restoreExamState.examAnswers
    : [];
  let examIndex = hasRestoreExam
    ? (restoreExamState.examFinished ? Math.max(0, examQuestions.length - 1) : Number(restoreExamState.examIndex || 0))
    : 0;
  let examScore = hasRestoreExam ? Number(restoreExamState.examScore || 0) : 0;
  let selectedOption = hasRestoreExam ? (restoreExamState.selectedOption ?? null) : null;
  let placedTileIndices = hasRestoreExam && Array.isArray(restoreExamState.placedTileIndices) ? restoreExamState.placedTileIndices : [];
  let questionChecked = hasRestoreExam ? Boolean(restoreExamState.questionChecked) : false;
  let lastAnswerCorrect = hasRestoreExam ? Boolean(restoreExamState.lastAnswerCorrect) : false;
  let examFinished = hasRestoreExam ? Boolean(restoreExamState.examFinished) : false;
  let examXpAwardedNow = hasRestoreExam ? Boolean(restoreExamState.examXpAwardedNow) : false;
  let examAlreadyClaimed = hasRestoreExam ? Boolean(restoreExamState.examAlreadyClaimed) : false;
  let lastTopicStats = [];
  let lastMistakes = [];
  const weakTopicsMap = new Map();

  if (typeof window !== 'undefined' && typeof window.trackScreen === 'function') {
    window.trackScreen('cefr_level_matrix', 'LevelMatrixView');
  }

  function showExamGateModal(level, percent, isLocked) {
    if (typeof document === 'undefined') return;
    const prev = document.getElementById('lm-exam-gate-modal');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.id = 'lm-exam-gate-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1300;background:rgba(15,23,42,0.62);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

    const closeModal = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const isDark = document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark-theme');
    const cardBg = isDark ? '#0f172a' : '#ffffff';
    const textMain = isDark ? '#f8fafc' : '#0f172a';
    const textMuted = isDark ? '#94a3b8' : '#475569';
    const borderCol = isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.32)';

    const bodyText = isLocked
      ? String(s.examGateLockedBody || '').replaceAll('{percent}', String(percent))
      : String(s.examGateConfirmBody || '').replaceAll('{percent}', String(percent));

    overlay.innerHTML = `
      <div dir="${isRtl ? 'rtl' : 'ltr'}" role="dialog" aria-modal="true" style="width:100%;max-width:360px;background:${cardBg};color:${textMain};border:1.5px solid ${borderCol};border-radius:20px;padding:20px 18px;box-shadow:0 20px 44px rgba(0,0,0,0.38);box-sizing:border-box;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">${isLocked ? '🔒' : '📝'}</div>
        ${isLocked ? `<h3 style="margin:0 0 8px;font-size:17px;font-weight:800;">${escapeHtml(s.examGateLockedTitle || 'Test not available yet')}</h3>` : ''}
        <p style="margin:0 0 18px;font-size:14px;line-height:1.45;color:${textMuted};">${escapeHtml(bodyText)}</p>
        ${isLocked ? `
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button type="button" id="lm-gate-pro-btn" style="width:100%;border:none;border-radius:13px;padding:12px 14px;font-size:14px;font-weight:800;color:#ffffff;background:linear-gradient(135deg,#f59e0b,#ea580c);cursor:pointer;box-shadow:0 4px 14px rgba(234,88,12,0.32);">${escapeHtml(s.examGateProBtn || '⭐ PRO')}</button>
            <button type="button" id="lm-gate-close-btn" style="width:100%;border:1.5px solid ${borderCol};border-radius:13px;padding:10px 14px;font-size:13.5px;font-weight:700;background:transparent;color:${textMain};cursor:pointer;">${escapeHtml(s.examGateOk || 'OK')}</button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button type="button" id="lm-gate-yes-btn" style="width:100%;border:none;border-radius:13px;padding:11px 14px;font-size:14.5px;font-weight:800;color:#ffffff;background:linear-gradient(135deg,#22c55e,#16a34a);cursor:pointer;">${escapeHtml(s.examGateYes || 'Yes')}</button>
            <button type="button" id="lm-gate-close-btn" style="width:100%;border:1.5px solid ${borderCol};border-radius:13px;padding:11px 14px;font-size:14px;font-weight:700;background:transparent;color:${textMain};cursor:pointer;">${escapeHtml(s.examGateNo || 'No')}</button>
          </div>
        `}
      </div>
    `;

    overlay.querySelector('#lm-gate-close-btn')?.addEventListener('click', closeModal);
    overlay.querySelector('#lm-gate-yes-btn')?.addEventListener('click', () => {
      closeModal();
      startExamForLevel(level);
    });
    overlay.querySelector('#lm-gate-pro-btn')?.addEventListener('click', () => {
      closeModal();
      ProService.openPaywall('cefr_exam_gate');
    });

    document.body.appendChild(overlay);
  }

  function requestStartExamForLevel(level) {
    if (isProActive()) {
      startExamForLevel(level);
      return;
    }
    const r = computeLevelReadiness(level, allWords, normLang);
    if (r.percent < 50) {
      showExamGateModal(level, r.percent, true);
      return;
    }
    if (r.percent < 100) {
      showExamGateModal(level, r.percent, false);
      return;
    }
    startExamForLevel(level);
  }

  function startExamForLevel(level) {
    activeLevel = level;
    mode = 'exam';
    examQuestions = buildLevelExamQuestions(activeLevel, allWords, normLang);
    examAnswers = [];
    examIndex = 0;
    examScore = 0;
    selectedOption = null;
    placedTileIndices = [];
    questionChecked = false;
    lastAnswerCorrect = false;
    examFinished = false;
    examXpAwardedNow = false;
    examAlreadyClaimed = false;
    lastTopicStats = [];
    lastMistakes = [];
    weakTopicsMap.clear();
    render();
  }

  function navigateToBlockLink(linkTarget) {
    if (!linkTarget) return;
    const targetHandler =
      typeof onNavigateLink === 'function'
        ? onNavigateLink
        : typeof window !== 'undefined' && typeof window._navigateToTopicLink === 'function'
          ? window._navigateToTopicLink
          : null;
    if (!targetHandler) return;
    const savedExamSnapshot =
      mode === 'exam' && examQuestions.length > 0
        ? {
            examQuestions: [...examQuestions],
            examAnswers: [...examAnswers],
            examIndex,
            examScore,
            selectedOption,
            placedTileIndices: [...placedTileIndices],
            questionChecked,
            lastAnswerCorrect,
            examFinished: Boolean(examFinished),
            examXpAwardedNow,
            examAlreadyClaimed,
          }
        : null;
    try { closeQuizWordPopover(); } catch (_) {}
    navigateWithReturn(
      () =>
        renderLevelMatrixView(allWords, containerSelector, {
          ...options,
          initialLevel: activeLevel,
          initialMode: savedExamSnapshot ? 'exam' : 'matrix',
          restoreExamState: savedExamSnapshot,
        }),
      () => targetHandler(linkTarget)
    );
  }

  function renderMatrixBody() {
    const readiness = computeLevelReadiness(activeLevel, allWords, normLang);
    const accent = getLevelAccent(activeLevel);
    const levelLabel = s.levelNames[activeLevel] || activeLevel;
    const readinessText = s.readinessLabel
      .replace('{done}', String(readiness.closedBlocks))
      .replace('{total}', String(readiness.totalBlocks))
      .replace('{pct}', String(readiness.percent));
    const examBtnLabel = (readiness.examPassed ? s.retakeExamBtn : s.startExamBtn).replace('{level}', activeLevel);

    // Group blocks by category in consistent order
    const categoryOrder = ['collections', 'vocabulary', 'grammar_ref', 'irregular', 'tenses', 'microrules', 'spoken'];
    const groupedHtml = categoryOrder
      .map((cat) => {
        const list = readiness.blocks.filter((b) => b.category === cat);
        if (!list.length) return '';
        const cardsHtml = list
          .map((b) => {
            const statusText = b.done
              ? `✅ ${s.closedStatus}`
              : `⏳ ${b.current} / ${b.target} →`;
            return `
              <button type="button" class="lm-block-btn ${b.done ? 'is-done' : ''}" data-block-id="${escapeHtml(b.id)}">
                <span class="lm-block-left">
                  <span class="lm-block-icon">${escapeHtml(b.icon)}</span>
                  <span class="lm-block-title">${escapeHtml(b.title)}</span>
                </span>
                <span class="lm-block-status ${b.done ? 'is-done' : 'is-open'}">${escapeHtml(statusText)}</span>
              </button>
            `;
          })
          .join('');
        return `
          <section class="lm-cat-section">
            <h3 class="lm-cat-title">${escapeHtml(getCategoryLabel(cat, s))}</h3>
            <div class="lm-blocks-list">${cardsHtml}</div>
          </section>
        `;
      })
      .join('');

    const profileVocabHtml = readiness.vocabRange
      ? `<div class="lm-profile-pill">📚 ${escapeHtml(s.vocabRangeLabel.replace('{range}', readiness.vocabRange))}</div>`
      : '';
    const profileSkillsHtml = readiness.skills
      ? `
        <div class="lm-skills-box">
          <div class="lm-skills-label">${escapeHtml(s.practicalSkillsHeading.replace('{level}', activeLevel))}</div>
          <div class="lm-skills-text">${escapeHtml(readiness.skills)}</div>
        </div>
      `
      : '';

    return `
      <div class="lm-summary-card">
        <div class="lm-summary-head">
          <span class="lm-level-name" dir="ltr">${escapeHtml(levelLabel)}</span>
          ${readiness.examPassed ? `<span class="lm-passed-badge">${escapeHtml(s.examPassedBadge)}</span>` : ''}
        </div>
        ${profileVocabHtml}
        ${profileSkillsHtml}
        <div class="lm-readiness-text">${escapeHtml(readinessText)}</div>
        <div class="lm-progress-track">
          <div class="lm-progress-fill" style="width: ${readiness.percent}%; background: ${accent};"></div>
        </div>
        <button type="button" class="lm-primary-cta" id="lm-start-exam-btn">${escapeHtml(examBtnLabel)}</button>
      </div>
      ${groupedHtml}
    `;
  }

  function renderMicroRuleCutHtml(microRuleId, fallbackLink = null) {
    const ruleObj = microRuleId
      ? MICRO_RULES.find((r) => r.id === Number(microRuleId))
      : null;
    if (!ruleObj) {
      if (!fallbackLink) return '';
      return `
        <div class="lm-rule-cut-footer" style="margin-top:8px;">
          <button type="button" class="lm-rule-cut-open-btn" data-open-fallback-link="1">${escapeHtml(s.studyTopicShort || 'Study topic')}</button>
        </div>
      `;
    }
    const locRule = getLocalizedMicroRule(ruleObj, normLang);
    const mistakeLabels =
      MISTAKE_CARD_LABELS_I18N[normLang] ||
      MISTAKE_CARD_LABELS_I18N[baseLang] ||
      MISTAKE_CARD_LABELS_I18N.en;
    const contrastCards = Array.isArray(RULE_MISTAKE_CARDS[ruleObj.id])
      ? RULE_MISTAKE_CARDS[ruleObj.id]
      : [];
    const contrastHtml = contrastCards.length
      ? `
        <div class="lm-rule-cut-contrast-list">
          ${contrastCards
            .map((pair) => {
              const meaning =
                pair.meaning?.[normLang] ||
                pair.meaning?.[baseLang] ||
                pair.meaning?.en ||
                pair.meaning?.ru ||
                '';
              return `
                <div class="lm-rule-cut-contrast">
                  <div class="lm-rule-cut-contrast-pair" dir="ltr">
                    <span class="lm-cut-wrong">${escapeHtml(mistakeLabels.wrongLabel)}: ${formatCutMistakeHtml(pair.wrong)}</span>
                    <span class="lm-cut-right">${escapeHtml(mistakeLabels.rightLabel)}: ${escapeHtml(pair.right)}</span>
                  </div>
                  ${meaning ? `<div class="lm-rule-cut-contrast-meaning">${escapeHtml(meaning)}</div>` : ''}
                </div>
              `;
            })
            .join('')}
        </div>
      `
      : '';
    const examplesSlice = (locRule.examples || []).slice(0, 3);
    const examplesHtml = examplesSlice.length
      ? `
        <div class="lm-rule-cut-examples">
          <div class="lm-rule-cut-ex-label">${escapeHtml(s.examplesLabel || 'Examples')}</div>
          ${examplesSlice
            .map(
              (ex) => `
              <div class="lm-rule-cut-ex-item">
                <span class="lm-rule-cut-ex-en" dir="ltr">${escapeHtml(ex.en)}</span>
                ${ex.tr ? `<span class="lm-rule-cut-ex-tr">— ${escapeHtml(ex.tr)}</span>` : ''}
              </div>
            `
            )
            .join('')}
        </div>
      `
      : '';
    const cutHeading = `${s.microRuleCutLabel || 'Micro-rule'} #${ruleObj.id}: ${locRule.title}`;
    return `
      <details class="lm-rule-cut" data-mistake-rule-id="${ruleObj.id}">
        <summary class="lm-rule-cut-summary">
          <span class="lm-rule-cut-title-wrap"><span>📖</span><span>${escapeHtml(cutHeading)}</span></span>
          <span class="lm-rule-cut-chevron" aria-hidden="true">▾</span>
        </summary>
        <div class="lm-rule-cut-body">
          <p class="lm-rule-cut-text">${escapeHtml(locRule.rule)}</p>
          ${contrastHtml}
          ${examplesHtml}
          <div class="lm-rule-cut-footer">
            <button type="button" class="lm-rule-cut-open-btn" data-open-full-rule="${ruleObj.id}" data-open-full-level="${escapeHtml(ruleObj.level)}">${escapeHtml(s.openFullRuleBtn || 'Open full rule')} →</button>
          </div>
        </div>
      </details>
    `;
  }

  function renderExamBody() {
    if (!examQuestions.length) {
      examQuestions = buildLevelExamQuestions(activeLevel, allWords, normLang);
    }

    if (examFinished) {
      const total = examQuestions.length;
      const pct = total > 0 ? Math.round((examScore / total) * 100) : 0;
      const passed = total > 0 && pct >= 80;
      const accent = passed ? '#16a34a' : '#d97706';
      const title = passed
        ? s.examPassTitle.replace('{level}', activeLevel)
        : s.examFailTitle.replace('{score}', String(examScore)).replace('{total}', String(total));
      const desc = passed ? s.examPassDesc : s.examFailDesc;

      const { topicStats, mistakes } = computeExamTopicStats(examQuestions, examAnswers);
      lastTopicStats = topicStats;
      lastMistakes = mistakes;

      const topicBreakdownHtml = topicStats.length > 0
        ? `
          <div class="lm-weak-heading">${escapeHtml(s.topicBreakdownHeading)}</div>
          <div class="lm-topic-stats-list">
            ${topicStats
              .map((t, idx) => {
                const badgeCls = t.percent >= 100 ? 'is-high' : t.percent >= 50 ? 'is-mid' : 'is-low';
                const barColor = t.percent >= 100 ? '#16a34a' : t.percent >= 50 ? '#d97706' : '#dc2626';
                const studyBtn = t.percent < 100 && t.linkTarget
                  ? `<button type="button" class="lm-topic-study-btn" data-topic-idx="${idx}">${escapeHtml(s.studyTopicShort)}</button>`
                  : '';
                return `
                  <div class="lm-topic-stat-row">
                    <div class="lm-topic-stat-top">
                      <span class="lm-topic-stat-name">${escapeHtml(t.topicTitle)}</span>
                      <span class="lm-topic-stat-right">
                        <span class="lm-topic-fraction" dir="ltr">${t.correct} / ${t.total}</span>
                        <span class="lm-topic-pct-badge ${badgeCls}" dir="ltr">${t.percent}%</span>
                        ${studyBtn}
                      </span>
                    </div>
                    <div class="lm-topic-mini-bar">
                      <div class="lm-topic-mini-fill" style="width: ${t.percent}%; background: ${barColor};"></div>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `
        : '';

      const canViewMistakes = isProActive() || activeLevel === 'A1';
      let mistakesHtml = '';
      if (mistakes.length === 0) {
        mistakesHtml = `<div class="lm-all-correct-badge">${escapeHtml(s.allCorrectBadge)}</div>`;
      } else if (canViewMistakes) {
        const freeNoteHtml = !isProActive() && activeLevel === 'A1'
          ? `<div class="lm-free-a1-note">${escapeHtml(s.freeA1MistakesNote)}</div>`
          : '';
        mistakesHtml = `
          <div class="lm-weak-heading">${escapeHtml(s.mistakesReviewHeading.replace('{n}', String(mistakes.length)))}</div>
          ${freeNoteHtml}
          <div class="lm-mistakes-list">
            ${mistakes
              .map((m, idx) => {
                const ruleCutHtml = renderMicroRuleCutHtml(m.microRuleId, m.linkTarget);
                return `
                  <div class="lm-mistake-card">
                    <div class="lm-mistake-head">
                      <span class="lm-mistake-topic">${escapeHtml(m.topicTitle)}</span>
                      ${
                        m.linkTarget
                          ? `<button type="button" class="lm-topic-study-btn" data-mistake-idx="${idx}">${escapeHtml(s.studyTopicShort)}</button>`
                          : ''
                      }
                    </div>
                    <div class="lm-mistake-prompt" dir="ltr">${escapeHtml(m.prompt)}</div>
                    <div class="lm-mistake-ans-row is-wrong">❌ ${escapeHtml(s.yourAnswerLabel)}: <span dir="ltr">${escapeHtml(m.userAnswer)}</span></div>
                    <div class="lm-mistake-ans-row is-right">✅ ${escapeHtml(s.correctAnswerLabel)}: <span dir="ltr">${escapeHtml(m.correctAnswer)}</span></div>
                    ${m.explanation ? `<div class="lm-mistake-exp">💡 ${escapeHtml(m.explanation)}</div>` : ''}
                    ${ruleCutHtml}
                  </div>
                `;
              })              .join('')}
          </div>
        `;
      } else {
        const previewMistakes = mistakes.slice(0, 2);
        mistakesHtml = `
          <div class="lm-pro-gate-card" id="lm-pro-mistakes-gate">
            <h4 class="lm-pro-gate-title">${escapeHtml(s.proErrorsLockTitle.replace('{n}', String(mistakes.length)))}</h4>
            <div class="lm-pro-blur-preview" style="filter: blur(4.5px); user-select: none; pointer-events: none;" aria-hidden="true">
              ${previewMistakes
                .map(
                  (m) => `
                  <div class="lm-mistake-card">
                    <div class="lm-mistake-prompt" dir="ltr">${escapeHtml(m.prompt)}</div>
                    <div class="lm-mistake-ans-row is-wrong">❌ ${escapeHtml(m.userAnswer)}</div>
                    <div class="lm-mistake-ans-row is-right">✅ ${escapeHtml(m.correctAnswer)}</div>
                  </div>
                `
                )
                .join('')}
            </div>
            <p class="lm-pro-gate-desc">${escapeHtml(s.proErrorsLockDesc)}</p>
            <button type="button" class="lm-pro-unlock-btn" id="lm-pro-unlock-mistakes-btn">${escapeHtml(s.proErrorsUnlockBtn)}</button>
          </div>
        `;
      }

      return `
        <div class="lm-result-card">
          <div class="lm-result-score" style="color: ${accent};" dir="ltr">${examScore} / ${total} (${pct}%)</div>
          <h3 class="lm-result-title">${escapeHtml(title)}</h3>
          <p class="lm-result-desc">${escapeHtml(desc)}</p>
          ${passed && examAlreadyClaimed ? `<p class="lm-result-desc">${escapeHtml(s.examXpAlreadyNote)}</p>` : ''}
          ${topicBreakdownHtml}
          ${mistakesHtml}
          <div class="lm-result-actions">
            <button type="button" class="lm-primary-cta" id="lm-retake-exam-btn">${escapeHtml(s.retakeExamBtn.replace('{level}', activeLevel))}</button>
            <button type="button" class="lm-secondary-cta" id="lm-back-matrix-btn">${escapeHtml(s.backToMatrixBtn)}</button>
          </div>
        </div>
      `;
    }

    const q = examQuestions[examIndex];
    const total = examQuestions.length;
    const progressPct = Math.round(((examIndex + (questionChecked ? 1 : 0)) / total) * 100);
    const qLabel = s.examQuestionLabel
      .replace('{n}', String(examIndex + 1))
      .replace('{total}', String(total));

    let bodyHtml = '';
    let canSubmit = false;

    if (q.type === 'tiles') {
      const placedTokens = placedTileIndices.map((idx) => q.tiles[idx]);
      canSubmit = placedTokens.length === q.answerTokens.length;
      const placedHtml = placedTileIndices
        .map(
          (tileIdx, pos) => `
          <button type="button" class="lm-tile-chip is-placed" dir="ltr" data-exam-tile-remove="${pos}" ${questionChecked ? 'disabled' : ''}>
            ${escapeHtml(q.tiles[tileIdx])}
          </button>
        `
        )
        .join('');
      const bankHtml = q.tiles
        .map((tok, tileIdx) => {
          const used = placedTileIndices.includes(tileIdx);
          return `
            <button type="button" class="lm-tile-chip" dir="ltr" data-exam-tile-pick="${tileIdx}" ${used || questionChecked ? 'disabled' : ''}>
              ${escapeHtml(tok)}
            </button>
          `;
        })
        .join('');
      bodyHtml = `
        <div class="lm-tile-answer-zone" dir="ltr">${placedHtml}</div>
        <div class="lm-tile-bank" dir="ltr">${bankHtml}</div>
        ${
          !questionChecked
            ? `
              <div class="lm-tile-tools">
                <button type="button" class="lm-mini-btn" id="lm-tile-clear-btn">${escapeHtml(s.tileClearBtn)}</button>
                <button type="button" class="lm-mini-btn" id="lm-tile-reset-btn">${escapeHtml(s.tileResetBtn)}</button>
              </div>
            `
            : ''
        }
      `;
    } else {
      canSubmit = selectedOption !== null;
      bodyHtml = `
        <div class="lm-options-grid">
          ${(q.options || [])
            .map((opt, idx) => {
              let cls = 'lm-opt-btn';
              if (questionChecked) {
                if (opt === q.answer) cls += ' is-correct';
                else if (opt === selectedOption) cls += ' is-wrong';
              } else if (opt === selectedOption) {
                cls += ' is-selected';
              }
              return `
                <button type="button" class="${cls}" dir="ltr" data-exam-opt-idx="${idx}" ${questionChecked ? 'disabled' : ''}>
                  ${escapeHtml(opt)}
                </button>
              `;
            })
            .join('')}
        </div>
      `;
    }

    const useWordPopover =
      (activeLevel === 'A1' || activeLevel === 'A2') &&
      q.type === 'choice' &&
      q.category !== 'vocabulary';

    let promptHtml = '';
    if (useWordPopover) {
      promptHtml = formatQuizBlankedHtml(q.prompt, q.answer, questionChecked, 'lm-filled-answer', escapeHtml);
    } else if (questionChecked && String(q.prompt || '').includes('___')) {
      const rawPrompt = String(q.prompt || '');
      const blankPos = rawPrompt.indexOf('___');
      promptHtml = `${escapeHtml(rawPrompt.slice(0, blankPos))}<strong class="lm-filled-answer">${escapeHtml(q.answer)}</strong>${escapeHtml(rawPrompt.slice(blankPos + 3))}`;
    } else {
      promptHtml = escapeHtml(q.prompt);
    }

    let feedbackHtml = '';
    if (questionChecked) {
      if (lastAnswerCorrect) {
        feedbackHtml = `<div class="lm-feedback is-ok">${escapeHtml(s.examCorrectMsg)}</div>`;
      } else {
        feedbackHtml = `<div style="margin-bottom: 12px;">${renderMicroRuleCutHtml(q.microRuleId, q.linkTarget)}</div>`;
      }
    }

    const isLast = examIndex >= total - 1;
    const actionBtnHtml = questionChecked
      ? `<button type="button" class="lm-primary-cta" id="lm-exam-next-btn">${escapeHtml(isLast ? s.examFinishBtn : s.examNextBtn)}</button>`
      : `<button type="button" class="lm-primary-cta" id="lm-exam-submit-btn" ${canSubmit ? '' : 'disabled style="opacity:0.5;cursor:not-allowed;"'}>${escapeHtml(s.examSubmitBtn)}</button>`;

    return `
      <div class="lm-exam-card">
        <div class="lm-exam-meta">
          <span>${escapeHtml(qLabel)}</span>
          <span class="lm-exam-topic-pill">${escapeHtml(q.blockTitle || activeLevel)}</span>
        </div>
        <div class="lm-progress-track">
          <div class="lm-progress-fill" style="width: ${progressPct}%; background: ${getLevelAccent(activeLevel)};"></div>
        </div>
        <div class="lm-exam-prompt" dir="ltr">${promptHtml}</div>
        ${bodyHtml}
        ${feedbackHtml}
        ${actionBtnHtml}
      </div>
    `;
  }

  function render() {
    const passedSet = loadPassedCefrExams();
    const levelTabsHtml = LEVELS.map((lvl) => {
      const isAct = lvl === activeLevel;
      const isPass = passedSet.has(lvl);
      const activeStyle = isAct ? `background: ${getLevelAccent(lvl)};` : '';
      return `
        <button type="button" class="lm-level-tab ${isAct ? 'is-active' : ''}" style="${activeStyle}" data-level-tab="${lvl}">
          <span dir="ltr">${lvl}</span>${isPass ? '<span>🏆</span>' : ''}
        </button>
      `;
    }).join('');

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="lm-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="lm-topbar">
          <button type="button" class="lm-back-btn" id="fav-view-back-btn">
            <span>${isRtl ? '›' : '‹'}</span>
            <span>${escapeHtml(s.backBtn)}</span>
          </button>
          <div class="lm-mode-pills">
            <button type="button" class="lm-mode-pill ${mode === 'matrix' ? 'is-active' : ''}" data-lm-mode="matrix">${escapeHtml(s.matrixTab)}</button>
            <button type="button" class="lm-mode-pill ${mode === 'exam' ? 'is-active' : ''}" data-lm-mode="exam">${escapeHtml(s.examTab)}</button>
          </div>
        </div>

        <div class="lm-hero">
          <h2 class="lm-hero-title">${escapeHtml(s.hubTitle)}</h2>
        </div>

        <div class="lm-level-tabs">${levelTabsHtml}</div>

        ${mode === 'exam' ? renderExamBody() : renderMatrixBody()}
      </div>
    `;

    // Bind events
    container.querySelectorAll('[data-open-full-rule]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ruleId = Number(btn.getAttribute('data-open-full-rule'));
        const level = btn.getAttribute('data-open-full-level') || activeLevel;
        if (Number.isInteger(ruleId) && ruleId > 0) {
          navigateToBlockLink({ targetType: 'grammar_microrules', level, ruleId });
        }
      });
    });

    if (mode === 'exam' && !examFinished && (activeLevel === 'A1' || activeLevel === 'A2')) {
      try {
        bindQuizWordPopover(container, normLang);
      } catch (_) {}
    }

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      try { closeQuizWordPopover(); } catch (_) {}
      if (mode === 'exam' && !examFinished && examIndex > 0) {
        mode = 'matrix';
        render();
        return;
      }
      onBack();
    });

    container.querySelectorAll('[data-lm-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-lm-mode');
        if (nextMode === 'exam') {
          requestStartExamForLevel(activeLevel);
        } else {
          mode = 'matrix';
          render();
        }
      });
    });

    container.querySelectorAll('[data-level-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lvl = btn.getAttribute('data-level-tab');
        if (!lvl) return;
        activeLevel = lvl;
        if (mode === 'exam') {
          requestStartExamForLevel(lvl);
        } else {
          render();
        }
      });
    });

    container.querySelector('#lm-start-exam-btn')?.addEventListener('click', () => {
      requestStartExamForLevel(activeLevel);
    });

    if (mode === 'matrix') {
      const readiness = computeLevelReadiness(activeLevel, allWords, normLang);
      const blockMap = new Map(readiness.blocks.map((b) => [b.id, b]));
      container.querySelectorAll('[data-block-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bId = btn.getAttribute('data-block-id');
          const block = blockMap.get(bId);
          if (block) navigateToBlockLink(block.linkTarget);
        });
      });
    } else if (examFinished) {
      container.querySelector('#lm-retake-exam-btn')?.addEventListener('click', () => {
        startExamForLevel(activeLevel);
      });
      container.querySelector('#lm-back-matrix-btn')?.addEventListener('click', () => {
        mode = 'matrix';
        render();
      });
      container.querySelectorAll('[data-weak-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const wId = btn.getAttribute('data-weak-id');
          const weak = weakTopicsMap.get(wId);
          if (weak) navigateToBlockLink(weak.linkTarget);
        });
      });
      container.querySelectorAll('[data-topic-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-topic-idx'));
          const topic = Number.isInteger(idx) ? lastTopicStats[idx] : null;
          if (topic?.linkTarget) navigateToBlockLink(topic.linkTarget);
        });
      });
      container.querySelectorAll('[data-mistake-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-mistake-idx'));
          const mistake = Number.isInteger(idx) ? lastMistakes[idx] : null;
          if (mistake?.linkTarget) navigateToBlockLink(mistake.linkTarget);
        });
      });

      container.querySelector('#lm-pro-unlock-mistakes-btn')?.addEventListener('click', () => {
        ProService.openPaywall('cefr_exam_errors');
      });
    } else {
      const q = examQuestions[examIndex];

      container.querySelectorAll('[data-exam-opt-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (questionChecked) return;
          const idx = Number(btn.getAttribute('data-exam-opt-idx'));
          if (Number.isInteger(idx) && q.options[idx] !== undefined) {
            selectedOption = q.options[idx];
            render();
          }
        });
      });

      container.querySelectorAll('[data-exam-tile-pick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (questionChecked) return;
          const idx = Number(btn.getAttribute('data-exam-tile-pick'));
          if (Number.isInteger(idx) && !placedTileIndices.includes(idx)) {
            placedTileIndices = [...placedTileIndices, idx];
            render();
          }
        });
      });

      container.querySelectorAll('[data-exam-tile-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (questionChecked) return;
          const pos = Number(btn.getAttribute('data-exam-tile-remove'));
          if (Number.isInteger(pos)) {
            placedTileIndices = placedTileIndices.filter((_, i) => i !== pos);
            render();
          }
        });
      });

      container.querySelector('#lm-tile-clear-btn')?.addEventListener('click', () => {
        placedTileIndices = [];
        render();
      });
      container.querySelector('#lm-tile-reset-btn')?.addEventListener('click', () => {
        placedTileIndices = [];
        render();
      });

      container.querySelector('#lm-exam-submit-btn')?.addEventListener('click', () => {
        if (questionChecked) return;
        let userAnswer = '';
        let isCorrect = false;
        if (q.type === 'tiles') {
          userAnswer = placedTileIndices.map((idx) => q.tiles[idx]).join(' ');
          isCorrect = userAnswer === q.answer;
        } else {
          userAnswer = selectedOption ?? '';
          isCorrect = selectedOption === q.answer;
        }
        questionChecked = true;
        lastAnswerCorrect = isCorrect;
        examAnswers.push({
          question: q,
          userAnswer,
          correctAnswer: q.answer,
          isCorrect,
        });
        if (isCorrect) {
          examScore++;
          try { playSuccessSound(); } catch (_) {}
          try { triggerHaptic('selection'); } catch (_) {}
        } else {
          try { playErrorSound(); } catch (_) {}
          try { triggerHaptic('notification'); } catch (_) {}
          if (q.blockId && !weakTopicsMap.has(q.blockId)) {
            weakTopicsMap.set(q.blockId, {
              id: q.blockId,
              title: q.blockTitle || q.blockId,
              linkTarget: q.linkTarget,
            });
          }
        }
        render();
      });

      container.querySelector('#lm-exam-next-btn')?.addEventListener('click', () => {
        try { closeQuizWordPopover(); } catch (_) {}
        if (examIndex < examQuestions.length - 1) {
          examIndex++;
          selectedOption = null;
          placedTileIndices = [];
          questionChecked = false;
          lastAnswerCorrect = false;
          render();
        } else {
          examFinished = true;
          const total = examQuestions.length;
          const passed = total > 0 && Math.round((examScore / total) * 100) >= 80;
          if (passed) {
            const newlyPassed = savePassedCefrExam(activeLevel);
            if (newlyPassed) {
              examXpAwardedNow = true;
              try { addWeeklyXP(50); } catch (_) {}
            } else {
              examAlreadyClaimed = true;
            }
            try { playSuccessSound(); } catch (_) {}
          }
          render();
        }
      });
    }
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    if (container._lmProChangedHandler && typeof window.removeEventListener === 'function') {
      window.removeEventListener('eb:pro-changed', container._lmProChangedHandler);
    }
    const onProChanged = () => {
      if (!container.querySelector('.lm-page')) {
        if (typeof window.removeEventListener === 'function') {
          window.removeEventListener('eb:pro-changed', onProChanged);
        }
        return;
      }
      render();
    };
    container._lmProChangedHandler = onProChanged;
    window.addEventListener('eb:pro-changed', onProChanged);
  }

  render();
}
