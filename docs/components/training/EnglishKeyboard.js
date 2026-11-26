// Built-in English QWERTY Keyboard for Training Input Mode & Consonants Quiz.
// Eliminates Android system keyboard popups, layout switching, and T9/autocorrect hints.

import { triggerHaptic } from '../../services/audioService.js?v=423.0';

const STORAGE_KEY = 'eb_custom_keyboard';

export const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export function isCustomKeyboardEnabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch (_) {
    return true;
  }
}

export function setCustomKeyboardEnabled(enabled) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    }
  } catch (_) {}
}

function ensureKeyboardStyles() {
  if (typeof document === 'undefined' || document.getElementById('eb-en-keyboard-styles')) return;
  const style = document.createElement('style');
  style.id = 'eb-en-keyboard-styles';
  style.textContent = `
    .eb-kb-wrap {
      width: calc(100% + 22px);
      max-width: 460px;
      margin: 12px -11px 0;
      padding: 6px 0 4px;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    .eb-kb-row {
      display: flex;
      justify-content: center;
      gap: 3px;
      margin-bottom: 6px;
      width: 100%;
      box-sizing: border-box;
    }
    .eb-kb-row:last-child {
      margin-bottom: 0;
    }
    .eb-kb-row-2 {
      padding: 0 3.8%;
    }
    .eb-kb-key {
      flex: 1 1 0;
      min-width: 0;
      height: 44px;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--card-bg, #ffffff);
      color: var(--text-main, #0f172a);
      font-size: 18px;
      font-weight: 700;
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      box-shadow: 0 2px 0 rgba(15, 23, 42, 0.14);
      transition: transform 0.06s ease, background 0.08s ease;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .eb-kb-key:active {
      transform: translateY(1.5px) scale(0.96);
      background: rgba(37, 99, 235, 0.14);
    }
    body.dark-theme .eb-kb-key,
    .dark-theme .eb-kb-key,
    [data-theme="dark"] .eb-kb-key {
      background: #1e293b;
      color: #f8fafc;
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.45);
    }
    body.dark-theme .eb-kb-key:active,
    .dark-theme .eb-kb-key:active,
    [data-theme="dark"] .eb-kb-key:active {
      background: rgba(56, 189, 248, 0.26);
    }
    .eb-kb-key.is-fn {
      background: rgba(148, 163, 184, 0.18);
      font-size: 16px;
    }
    body.dark-theme .eb-kb-key.is-fn,
    .dark-theme .eb-kb-key.is-fn {
      background: #334155;
    }
    .eb-kb-key.is-backspace {
      flex: 1.55 1 0;
      font-size: 18px;
    }
    .eb-kb-key.is-symbol {
      flex: 1.15 1 0;
      font-size: 18px;
    }
    .eb-kb-key.is-space {
      flex: 4.5 1 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--text-muted, #64748b);
    }
    .eb-kb-key.is-toggle {
      flex: 1.35 1 0;
      font-size: 15px;
    }
    .eb-kb-collapsed-bar {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      max-width: 440px;
      margin: 6px auto 0;
    }
    .eb-kb-restore-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--card-bg, #ffffff);
      color: var(--text-muted, #64748b);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    body.dark-theme .eb-kb-restore-btn,
    .dark-theme .eb-kb-restore-btn {
      background: #1e293b;
      color: #cbd5e1;
      border-color: rgba(148, 163, 184, 0.3);
    }
    .consonant-input.is-kb-active {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
    }
    body.dark-theme .consonant-input.is-kb-active,
    .dark-theme .consonant-input.is-kb-active {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.28);
    }
    .answer-input.is-custom-kb {
      caret-color: transparent;
      user-select: none;
      -webkit-user-select: none;
      cursor: default;
    }
    .answer-input.is-custom-kb:empty::before {
      content: attr(aria-placeholder);
      color: var(--text-muted, #94a3b8);
      opacity: 0.7;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Renders the built-in English QWERTY keyboard (or a compact restore chip when toggled to system keyboard).
 * Always rendered LTR so English key layout stays standard even on Arabic/Farsi/Urdu interfaces.
 */
export function renderEnglishKeyboard(mountEl, options = {}) {
  if (!mountEl || typeof document === 'undefined') return;
  ensureKeyboardStyles();

  const {
    showSymbolsRow = true,
    onChar = () => {},
    onBackspace = () => {},
    onToggleMode = () => {},
  } = options;

  const enabled = isCustomKeyboardEnabled();

  if (!enabled) {
    mountEl.innerHTML = `
      <div class="eb-kb-collapsed-bar" dir="ltr">
        <button type="button" class="eb-kb-restore-btn" data-kb-action="toggle" aria-label="Switch to built-in English keyboard">
          <span>⌨️</span><span>EN</span>
        </button>
      </div>
    `;
    const btn = mountEl.querySelector('[data-kb-action="toggle"]');
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      try { triggerHaptic('light'); } catch (_) {}
      setCustomKeyboardEnabled(true);
      renderEnglishKeyboard(mountEl, options);
      onToggleMode(true);
    });
    return;
  }

  const row1Html = KEYBOARD_ROWS[0]
    .map((k) => `<button type="button" class="eb-kb-key" data-kb-char="${k}">${k}</button>`)
    .join('');
  const row2Html = KEYBOARD_ROWS[1]
    .map((k) => `<button type="button" class="eb-kb-key" data-kb-char="${k}">${k}</button>`)
    .join('');
  const row3Html =
    KEYBOARD_ROWS[2]
      .map((k) => `<button type="button" class="eb-kb-key" data-kb-char="${k}">${k}</button>`)
      .join('') +
    `<button type="button" class="eb-kb-key is-fn is-backspace" data-kb-action="backspace" aria-label="Backspace">⌫</button>`;

  const row4Html = showSymbolsRow
    ? `
      <div class="eb-kb-row eb-kb-row-4">
        <button type="button" class="eb-kb-key is-fn is-symbol" data-kb-char="-" aria-label="Hyphen">-</button>
        <button type="button" class="eb-kb-key is-fn is-symbol" data-kb-char="'" aria-label="Apostrophe">'</button>
        <button type="button" class="eb-kb-key is-space" data-kb-char=" " aria-label="Space">space</button>
        <button type="button" class="eb-kb-key is-fn is-toggle" data-kb-action="toggle" title="System keyboard" aria-label="System keyboard">⌨️</button>
      </div>
    `
    : `
      <div class="eb-kb-row eb-kb-row-4" style="justify-content: flex-end; margin-top: 2px;">
        <button type="button" class="eb-kb-restore-btn" data-kb-action="toggle" title="System keyboard" aria-label="System keyboard">
          <span>⌨️</span>
        </button>
      </div>
    `;

  mountEl.innerHTML = `
    <div class="eb-kb-wrap" dir="ltr" role="group" aria-label="English Keyboard">
      <div class="eb-kb-row eb-kb-row-1">${row1Html}</div>
      <div class="eb-kb-row eb-kb-row-2">${row2Html}</div>
      <div class="eb-kb-row eb-kb-row-3">${row3Html}</div>
      ${row4Html}
    </div>
  `;

  // Prevent focus changes on touch/mouse so Android WebView never flickers the system keyboard
  mountEl.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      try { triggerHaptic('light'); } catch (_) {}
      const ch = btn.getAttribute('data-kb-char');
      const action = btn.getAttribute('data-kb-action');
      if (ch !== null) {
        onChar(ch);
      } else if (action === 'backspace') {
        onBackspace();
      } else if (action === 'toggle') {
        setCustomKeyboardEnabled(false);
        renderEnglishKeyboard(mountEl, options);
        onToggleMode(false);
      }
    });
  });
}
