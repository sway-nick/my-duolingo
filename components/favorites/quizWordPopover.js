import { getOrBuildDictionary, resolveWord } from '../modals/MilestoneStoryModal.js?v=386.0';
import {
  speakTextInLangAsync,
  getSavedVoiceAccent,
  triggerHaptic,
} from '../../services/audioService.js?v=386.0';

let activeOutsideHandler = null;
let activeScrollHandler = null;

function defaultEscapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Splits English text into clickable word tokens while leaving punctuation and ___ blanks intact.
 */
export function tokenizeQuizTextHtml(text, escapeHtml = defaultEscapeHtml) {
  const normalized = String(text || '').replace(/[\u2018\u2019\u02BC\u02BB]/g, "'");
  const tokens = normalized.match(/[a-zA-Z'-]+|[^a-zA-Z'-]+/g) || [normalized];
  return tokens.map((tok) => {
    if (!/[a-zA-Z]/.test(tok)) {
      return escapeHtml(tok);
    }
    const cleanAttr = escapeHtml(tok);
    return `<span class="quiz-word-token" data-quiz-word="${cleanAttr}">${cleanAttr}</span>`;
  }).join('');
}

/**
 * Formats a quiz sentence with either blanked ___ or filled answer, keeping all English words clickable.
 */
export function formatQuizBlankedHtml(blanked, answer, isSolved, filledClass, escapeHtml = defaultEscapeHtml) {
  const raw = String(blanked || '');
  if (!isSolved) {
    return tokenizeQuizTextHtml(raw, escapeHtml);
  }
  const idx = raw.indexOf('___');
  if (idx === -1) {
    return tokenizeQuizTextHtml(raw, escapeHtml);
  }
  const before = tokenizeQuizTextHtml(raw.slice(0, idx), escapeHtml);
  const after = tokenizeQuizTextHtml(raw.slice(idx + 3), escapeHtml);
  const ansHtml = tokenizeQuizTextHtml(answer || '', escapeHtml);
  return `${before}<strong class="${escapeHtml(filledClass)}">${ansHtml}</strong>${after}`;
}

function ensurePopoverStyles() {
  if (typeof document === 'undefined' || document.getElementById('quiz-word-popover-styles')) return;
  const style = document.createElement('style');
  style.id = 'quiz-word-popover-styles';
  style.textContent = `
    .quiz-word-token {
      cursor: pointer;
      border-bottom: 1px dashed rgba(148, 163, 184, 0.45);
      border-radius: 3px;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .quiz-word-token:active,
    .quiz-word-token.is-active-token {
      background: rgba(234, 88, 12, 0.18);
      color: #c2410c;
    }
    body.dark-theme .quiz-word-token.is-active-token,
    .dark-theme .quiz-word-token.is-active-token,
    [data-theme="dark"] .quiz-word-token.is-active-token {
      background: rgba(56, 189, 248, 0.24);
      color: #38bdf8;
    }
    .quiz-word-popover {
      position: fixed;
      z-index: 100050;
      min-width: 170px;
      max-width: min(290px, calc(100vw - 24px));
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid rgba(234, 88, 12, 0.45);
      border-radius: 14px;
      padding: 10px 12px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
      display: none;
      box-sizing: border-box;
    }
    body.dark-theme .quiz-word-popover,
    .dark-theme .quiz-word-popover,
    [data-theme="dark"] .quiz-word-popover {
      background: #1e293b;
      color: #f8fafc;
      border-color: rgba(56, 189, 248, 0.45);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    }
    .quiz-word-popover-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }
    .quiz-word-popover-word {
      font-size: 15px;
      font-weight: 800;
      direction: ltr;
    }
    .quiz-word-popover-speak {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 1px solid rgba(234, 88, 12, 0.35);
      background: rgba(234, 88, 12, 0.1);
      color: #c2410c;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    body.dark-theme .quiz-word-popover-speak,
    .dark-theme .quiz-word-popover-speak,
    [data-theme="dark"] .quiz-word-popover-speak {
      border-color: rgba(56, 189, 248, 0.4);
      background: rgba(56, 189, 248, 0.14);
      color: #38bdf8;
    }
    .quiz-word-popover-trans {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
      direction: ltr;
    }
    body.dark-theme .quiz-word-popover-trans,
    .dark-theme .quiz-word-popover-trans,
    [data-theme="dark"] .quiz-word-popover-trans {
      color: #94a3b8;
    }
    .quiz-word-popover-meaning {
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.35;
    }
  `;
  document.head.appendChild(style);
}

export function closeQuizWordPopover() {
  if (typeof document === 'undefined') return;
  const pop = document.getElementById('quiz-word-popover');
  if (pop) pop.style.display = 'none';
  document.querySelectorAll('.quiz-word-token.is-active-token').forEach((el) => {
    el.classList.remove('is-active-token');
  });
}

function getOrCreatePopover() {
  ensurePopoverStyles();
  let pop = document.getElementById('quiz-word-popover');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'quiz-word-popover';
    pop.className = 'quiz-word-popover';
    pop.innerHTML = `
      <div class="quiz-word-popover-head">
        <span class="quiz-word-popover-word"></span>
        <button type="button" class="quiz-word-popover-speak" aria-label="Listen">🔊</button>
      </div>
      <div class="quiz-word-popover-trans"></div>
      <div class="quiz-word-popover-meaning"></div>
    `;
    pop.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(pop);
  }
  return pop;
}

/**
 * Binds tap-to-translate popover on all `.quiz-word-token` elements inside `rootEl`.
 */
export function bindQuizWordPopover(rootEl, rawLang) {
  if (!rootEl || typeof document === 'undefined') return;
  const tokens = rootEl.querySelectorAll('.quiz-word-token');
  if (!tokens || tokens.length === 0) return;

  let dictMap = null;
  const dictPromise = getOrBuildDictionary(rawLang).then((m) => {
    dictMap = m;
    return m;
  }).catch(() => new Map());

  const speakWordNow = (wordText) => {
    try { triggerHaptic('light'); } catch (_) {}
    const accent = typeof getSavedVoiceAccent === 'function' ? getSavedVoiceAccent() : 'us';
    const langTag = accent === 'uk' ? 'en-GB' : 'en-US';
    try { speakTextInLangAsync(wordText, langTag).catch(() => {}); } catch (_) {}
  };

  if (activeOutsideHandler) {
    document.removeEventListener('click', activeOutsideHandler);
  }
  activeOutsideHandler = (e) => {
    if (!e.target.closest('.quiz-word-token') && !e.target.closest('#quiz-word-popover')) {
      closeQuizWordPopover();
    }
  };
  document.addEventListener('click', activeOutsideHandler);

  if (activeScrollHandler && typeof window !== 'undefined') {
    window.removeEventListener('scroll', activeScrollHandler, true);
  }
  activeScrollHandler = () => closeQuizWordPopover();
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', activeScrollHandler, { passive: true, capture: true });
  }

  tokens.forEach((tokenEl) => {
    tokenEl.addEventListener('click', async (e) => {
      e.stopPropagation();
      const rawText = tokenEl.getAttribute('data-quiz-word') || tokenEl.textContent;
      const map = (dictMap && dictMap.size > 0) ? dictMap : await dictPromise;
      const resolved = resolveWord(rawText, map, rawLang);
      if (!resolved) return;

      document.querySelectorAll('.quiz-word-token.is-active-token').forEach((el) => {
        el.classList.remove('is-active-token');
      });
      tokenEl.classList.add('is-active-token');

      const pop = getOrCreatePopover();
      const wordEl = pop.querySelector('.quiz-word-popover-word');
      const transEl = pop.querySelector('.quiz-word-popover-trans');
      const meaningEl = pop.querySelector('.quiz-word-popover-meaning');
      const speakBtn = pop.querySelector('.quiz-word-popover-speak');

      wordEl.textContent = resolved.baseForm && resolved.baseForm !== resolved.word
        ? `${resolved.word} (${resolved.baseForm})`
        : resolved.word;
      transEl.textContent = resolved.transcription ? `/${resolved.transcription.replace(/^\/|\/$/g, '')}/` : '';
      transEl.style.display = transEl.textContent ? 'block' : 'none';
      meaningEl.textContent = resolved.translation || resolved.word;
      speakBtn.onclick = (ev) => {
        ev.stopPropagation();
        speakWordNow(resolved.word);
      };

      pop.style.display = 'block';
      pop.style.visibility = 'hidden';

      const rect = tokenEl.getBoundingClientRect();
      const popRect = pop.getBoundingClientRect();
      const vw = window.innerWidth || 360;
      const vh = window.innerHeight || 640;

      const left = Math.max(12, Math.min(vw - popRect.width - 12, rect.left + rect.width / 2 - popRect.width / 2));
      let top = rect.top - popRect.height - 8;
      if (top < 64) {
        top = Math.min(vh - popRect.height - 12, rect.bottom + 8);
      }

      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.style.visibility = 'visible';

      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('grammar_quiz_word_click', {
          word: resolved.word,
          from_dict: Boolean(resolved.isFromDict),
        });
      }

      speakWordNow(resolved.word);
    });
  });
}
