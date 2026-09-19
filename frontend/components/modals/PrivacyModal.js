import { PRIVACY_POLICY_DATA } from './privacyTranslations.js';

export function openPrivacyModal() {
  const existing = document.querySelector('#privacy-policy-modal-overlay');
  if (existing) existing.remove();

  // If user selected an interface language in settings, use it. Otherwise default to English.
  const userLang = (localStorage.getItem('myduo_interface_lang') || '').toLowerCase();
  const activeLang = (userLang && PRIVACY_POLICY_DATA[userLang]) ? userLang : 'en';
  const policy = PRIVACY_POLICY_DATA[activeLang] || PRIVACY_POLICY_DATA.en;

  const overlay = document.createElement('div');
  overlay.id = 'privacy-policy-modal-overlay';
  overlay.className = 'modal-backdrop privacy-modal-backdrop';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: max(20px, calc(var(--safe-top, env(safe-area-inset-top, 0px)) + 14px));
    padding-bottom: max(20px, calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 14px));
    padding-left: max(14px, env(safe-area-inset-left, 0px));
    padding-right: max(14px, env(safe-area-inset-right, 0px));
    box-sizing: border-box;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  `;

  // Render sections HTML
  const sectionsHtml = (policy.sections || []).map(section => {
    const titleHtml = `<h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">${section.title}</h3>`;
    const introHtml = section.intro ? `<p style="margin: 0 0 10px; color: var(--text-muted);">${section.intro}</p>` : '';
    
    let bulletsHtml = '';
    if (Array.isArray(section.bullets) && section.bullets.length > 0) {
      const items = section.bullets.map(b => 
        `<li style="margin-bottom: 6px;"><strong style="color: var(--text-main);">${b.bold}</strong> ${b.text}</li>`
      ).join('');
      bulletsHtml = `<ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-muted);">${items}</ul>`;
    }

    let contactHtml = '';
    if (section.contactEmail) {
      contactHtml = `
        <p style="margin: 6px 0 0; color: var(--text-muted);">
          <strong style="color: var(--text-main);">Email:</strong> 
          <a href="mailto:${section.contactEmail}" style="color: var(--accent, #ea580c); font-weight: 600; text-decoration: none;">${section.contactEmail}</a>
        </p>
      `;
    }

    return `${titleHtml}${introHtml}${bulletsHtml}${contactHtml}`;
  }).join('');

  overlay.innerHTML = `
    <div class="privacy-modal-card" style="
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      width: 100%;
      max-width: 540px;
      height: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      animation: modalFadeIn 0.22s ease-out;
    ">
      <!-- Modal Header -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1.5px solid var(--border-color);
        flex-shrink: 0;
        gap: 8px;
        background: var(--bg-main, inherit);
      ">
        <button type="button" id="privacy-back-btn" style="
          background: none;
          border: none;
          color: var(--accent, #ea580c);
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          margin-left: -6px;
          border-radius: 8px;
          min-height: 38px;
        ">
          ← ${policy.backBtn || 'Back'}
        </button>

        <div style="font-size: 15.5px; font-weight: 800; color: var(--text-main); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 8px;">
          ${policy.modalTitle || 'Privacy Policy'}
        </div>

        <button type="button" id="privacy-close-btn" style="
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
          line-height: 1;
          padding: 6px 10px;
          margin-right: -6px;
          border-radius: 8px;
          min-height: 38px;
        " aria-label="Close">✕</button>
      </div>

      <!-- Scrollable Policy Content -->
      <div id="privacy-content-scroll" style="
        flex: 1 1 auto;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 20px 22px 28px;
        color: var(--text-main);
        font-size: 14px;
        line-height: 1.65;
        overscroll-behavior: contain;
      ">
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 4px; color: var(--text-main);">🍳 ${policy.appName || 'English Breakfast'}</h2>
        <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 16px;">${policy.updated || ''}</p>
        <p style="margin: 0 0 16px; color: var(--text-muted);">${policy.intro || ''}</p>
        ${sectionsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => {
    overlay.style.transition = 'opacity 0.2s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 200);
  };

  const closeBtn = overlay.querySelector('#privacy-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const backBtn = overlay.querySelector('#privacy-back-btn');
  if (backBtn) backBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}
