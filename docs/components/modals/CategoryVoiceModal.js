import { downloadCategoryVoicePack, getSavedVoiceAccent } from '../../services/audioService.js?v=200.0';
import { getCategoryVoiceModalStrings, getCategoryDetails } from '../../services/i18n.js?v=200.0';

export function showCategoryVoiceModal({
  category,
  catWords = [],
  accent = null,
  onComplete = () => {},
  onContinueWithout = () => {},
  onCancel = () => {},
}) {
  const existing = document.querySelector('#cat-voice-download-modal');
  if (existing) existing.remove();

  const currentAccent = accent || getSavedVoiceAccent() || 'us';
  const details = getCategoryDetails(category);
  const count = catWords.length || 100;
  // Estimate ~8.5KB per compressed word audio file
  const sizeMb = Math.max(0.5, (count * 8.5 / 1024)).toFixed(1);
  const strings = getCategoryVoiceModalStrings(details.title || category, count, sizeMb);

  const modalEl = document.createElement('div');
  modalEl.id = 'cat-voice-download-modal';
  modalEl.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 16px;
    box-sizing: border-box;
    animation: catVoiceFadeIn 0.2s ease-out;
  `;

  modalEl.innerHTML = `
    <style>
      @keyframes catVoiceFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .cat-voice-box {
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #0f172a);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        max-width: 420px;
        width: 100%;
        padding: 24px;
        box-sizing: border-box;
        text-align: center;
        position: relative;
      }
      .cat-voice-icon-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        box-shadow: 0 6px 16px rgba(234, 88, 12, 0.35);
        color: #ffffff;
      }
      .cat-voice-title {
        font-size: 20px;
        font-weight: 800;
        margin: 0 0 8px;
        letter-spacing: -0.3px;
      }
      .cat-voice-sub {
        font-size: 14px;
        color: var(--text-muted, #64748b);
        line-height: 1.45;
        margin: 0 0 20px;
      }
      .cat-voice-btn-primary {
        width: 100%;
        padding: 14px 20px;
        font-size: 15px;
        font-weight: 700;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: #ffffff;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
        transition: transform 0.15s, opacity 0.15s;
        margin-bottom: 10px;
      }
      .cat-voice-btn-primary:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      .cat-voice-btn-secondary {
        width: 100%;
        padding: 11px 16px;
        font-size: 14px;
        font-weight: 600;
        border: 1px solid var(--border-color, #cbd5e1);
        border-radius: 12px;
        background: transparent;
        color: var(--text-muted, #64748b);
        cursor: pointer;
        transition: background 0.15s;
      }
      .cat-voice-btn-secondary:active {
        background: rgba(0,0,0,0.05);
      }
      .cat-voice-progress-container {
        display: none;
        margin-top: 10px;
        text-align: left;
      }
      .cat-voice-progress-bar-bg {
        width: 100%;
        height: 10px;
        background: var(--border-color, #e2e8f0);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      .cat-voice-progress-bar-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #f97316, #22c55e);
        border-radius: 999px;
        transition: width 0.15s ease-out;
      }
      .cat-voice-progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted, #64748b);
      }
      .cat-voice-close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--text-muted, #94a3b8);
        padding: 4px 8px;
        border-radius: 8px;
      }
    </style>

    <div class="cat-voice-box">
      <button class="cat-voice-close-btn" id="cat-voice-close" aria-label="Закрыть">✕</button>
      
      <div class="cat-voice-icon-circle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </div>

      <h3 class="cat-voice-title">${strings.title}</h3>
      <p class="cat-voice-sub">${strings.subtitle}</p>

      <div id="cat-voice-actions">
        <button type="button" class="cat-voice-btn-primary" id="cat-voice-download-btn">
          ${strings.downloadBtn}
        </button>
        <button type="button" class="cat-voice-btn-secondary" id="cat-voice-skip-btn">
          ${strings.continueWithoutBtn}
        </button>
      </div>

      <div class="cat-voice-progress-container" id="cat-voice-progress-wrapper">
        <div class="cat-voice-progress-bar-bg">
          <div class="cat-voice-progress-bar-fill" id="cat-voice-progress-fill"></div>
        </div>
        <div class="cat-voice-progress-labels">
          <span id="cat-voice-progress-title">${strings.progressTitle}</span>
          <span id="cat-voice-progress-percent">0%</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const closeBtn = modalEl.querySelector('#cat-voice-close');
  const skipBtn = modalEl.querySelector('#cat-voice-skip-btn');
  const downloadBtn = modalEl.querySelector('#cat-voice-download-btn');
  const actionsWrapper = modalEl.querySelector('#cat-voice-actions');
  const progressWrapper = modalEl.querySelector('#cat-voice-progress-wrapper');
  const progressFill = modalEl.querySelector('#cat-voice-progress-fill');
  const progressPercent = modalEl.querySelector('#cat-voice-progress-percent');
  const progressTitle = modalEl.querySelector('#cat-voice-progress-title');

  function cleanup() {
    if (modalEl && modalEl.parentNode) {
      modalEl.remove();
    }
  }

  closeBtn?.addEventListener('click', () => {
    cleanup();
    onCancel();
  });

  skipBtn?.addEventListener('click', () => {
    cleanup();
    onContinueWithout();
  });

  downloadBtn?.addEventListener('click', async () => {
    actionsWrapper.style.display = 'none';
    progressWrapper.style.display = 'block';
    closeBtn.style.display = 'none';

    try {
      await downloadCategoryVoicePack(currentAccent, category, catWords, (pct, done, total) => {
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressPercent) progressPercent.textContent = `${pct}% (${done}/${total})`;
      });

      if (progressFill) progressFill.style.width = '100%';
      if (progressTitle) progressTitle.textContent = strings.completeTitle;
      if (progressPercent) progressPercent.textContent = '100%';

      setTimeout(() => {
        cleanup();
        onComplete();
      }, 350);
    } catch (err) {
      console.warn('Voice pack download error:', err);
      cleanup();
      onContinueWithout();
    }
  });

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) {
      cleanup();
      onCancel();
    }
  });
}
