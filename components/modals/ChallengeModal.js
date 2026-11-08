import { getChallengeTranslation } from './challengeTranslations.js?v=386.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=386.0';

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Opens the Challenge video contest modal dialog.
 */
export function openChallengeModal() {
  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('modal_challenge', 'ChallengeModal');
  }

  // Remove any existing instance
  const existing = document.querySelector('#challenge-modal-overlay');
  if (existing) existing.remove();

  let lang = 'ru';
  try {
    if (typeof getInterfaceLanguage === 'function') {
      lang = getInterfaceLanguage();
    } else {
      lang = localStorage.getItem('myduo_interface_lang') || 'ru';
    }
  } catch (e) {
    lang = 'ru';
  }

  const d = getChallengeTranslation(lang);

  const overlay = document.createElement('div');
  overlay.id = 'challenge-modal-overlay';
  overlay.className = 'challenge-modal-overlay modal-overlay';

  const ideasHtml = (d.ideas || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const rulesHtml = (d.rules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const confirmHtml = (d.confirmations || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  overlay.innerHTML = `
    <div class="challenge-modal-card" role="dialog" aria-modal="true" aria-labelledby="challenge-modal-title">
      <div class="challenge-modal-header">
        <div class="challenge-title-group">
          <span class="challenge-title-icon">🎬</span>
          <h2 class="challenge-modal-title" id="challenge-modal-title">${escapeHtml(d.title.replace(/^🎬\s*/, ''))}</h2>
        </div>
        <button type="button" class="challenge-close-btn modal-close-btn" id="challenge-close-btn" aria-label="${escapeHtml(d.closeBtn)}">✕</button>
      </div>

      <div class="challenge-modal-body">
        <!-- Hero Intro Section -->
        <div class="challenge-hero-box">
          <h3 class="challenge-subtitle">${escapeHtml(d.subtitle)}</h3>
          <p class="challenge-intro-text">${escapeHtml(d.intro)}</p>
        </div>

        <!-- Featured on the Golden Card Highlight Banner -->
        <div class="challenge-golden-card-box">
          <div class="challenge-golden-header">
            <span class="challenge-golden-badge">🏆 GOLDEN CARD</span>
            <h4 class="challenge-golden-title">${escapeHtml(d.goldenCardTitle)}</h4>
          </div>
          <p class="challenge-golden-text">${escapeHtml(d.goldenCardText)}</p>
        </div>

        <!-- Ideas Section -->
        <div class="challenge-section-box">
          <h4 class="challenge-section-title">${escapeHtml(d.ideasTitle)}</h4>
          <ul class="challenge-list challenge-ideas-list">
            ${ideasHtml}
          </ul>
          <p class="challenge-ideas-closing">✨ ${escapeHtml(d.ideasClosing)}</p>
        </div>

        <!-- Rules Section -->
        <div class="challenge-section-box">
          <h4 class="challenge-section-title">${escapeHtml(d.rulesTitle)}</h4>
          <ul class="challenge-list challenge-rules-list">
            ${rulesHtml}
          </ul>
        </div>

        <!-- How to Participate Section -->
        <div class="challenge-section-box challenge-participate-box">
          <h4 class="challenge-section-title">${escapeHtml(d.participateTitle)}</h4>
          <p class="challenge-participate-text">${escapeHtml(d.participateText)}</p>
          <a href="mailto:${escapeHtml(d.email)}?subject=${encodeURIComponent('English Breakfast Challenge Video')}" class="challenge-email-chip">
            <span class="email-icon">📩</span>
            <span class="email-address">${escapeHtml(d.email)}</span>
          </a>
        </div>

        <!-- Confirmations / Terms Section -->
        <div class="challenge-section-box challenge-confirm-box">
          <h4 class="challenge-confirm-title">${escapeHtml(d.confirmTitle)}</h4>
          <ul class="challenge-list challenge-confirm-list">
            ${confirmHtml}
          </ul>
        </div>

        <!-- Free Participation & Motivation Callout -->
        <div class="challenge-free-callout">
          <div class="challenge-free-badge">🎉 ${escapeHtml(d.freeNote)}</div>
          <p class="challenge-final-text">${escapeHtml(d.finalNote).replace(/\n/g, '<br/>')}</p>
          <div class="challenge-slogan">${escapeHtml(d.actionSlogan)}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  function closeModal() {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.remove();
    }, 200);
  }

  const closeBtn = overlay.querySelector('#challenge-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', onKeyDown);
      closeModal();
    }
  };
  document.addEventListener('keydown', onKeyDown);
}
