import { t } from '../../services/i18n.0';

/**
 * Show a quick toast notification
 */
function showShareToast(msg) {
  let toast = document.querySelector('#share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/**
 * Get the canonical share URL for the app
 */
function getShareUrl() {
  if (typeof window === 'undefined') return 'https://sway-nick.github.io/my-duolingo/';
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  // If running on localhost or raw file, standard fallback is GitHub pages URL
  if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('file')) {
    return 'https://sway-nick.github.io/my-duolingo/';
  }
  return origin + pathname;
}

/**
 * Render and display the Share Modal on Desktop or fallback
 */
export function showShareModal() {
  // Remove any existing share modal
  const existing = document.querySelector('#share-modal-overlay');
  if (existing) existing.remove();

  const shareUrl = getShareUrl();
  const shareText = t('share_message_text');

  const overlay = document.createElement('div');
  overlay.id = 'share-modal-overlay';
  overlay.className = 'share-modal-overlay';

  overlay.innerHTML = `
    <div class="share-modal-card">
      <div class="share-modal-header">
        <div class="share-modal-header-text">
          <div class="share-modal-title">
            <svg class="share-title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>${t('share_modal_title')}</span>
          </div>
          <div class="share-modal-subtitle">${t('share_modal_sub')}</div>
        </div>
        <button class="share-modal-close" id="share-modal-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="share-channels-grid">
        <!-- Telegram -->
        <button class="share-channel-btn share-tg" id="share-channel-tg" title="${t('share_channel_telegram')}">
          <div class="share-channel-icon-wrap share-icon-tg">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.07-.06-.17-.04-.24-.02-.11.02-1.78 1.13-5.03 3.32-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.86-.44-.75-.24-1.35-.37-1.3-.78.03-.21.32-.43.87-.66 3.42-1.49 5.71-2.47 6.86-2.95 3.26-1.36 3.94-1.6 4.38-1.6.1 0 .32.02.46.14.12.1.15.24.17.34-.01.07.01.22 0 .33z"/>
            </svg>
          </div>
          <span class="share-channel-label">${t('share_channel_telegram')}</span>
        </button>

        <!-- WhatsApp -->
        <button class="share-channel-btn share-wa" id="share-channel-wa" title="${t('share_channel_whatsapp')}">
          <div class="share-channel-icon-wrap share-icon-wa">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 17.8c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.03 8.03 0 0 1-1.23-4.23c0-4.42 3.6-8.02 8.02-8.02 2.14 0 4.16.84 5.67 2.35a7.97 7.97 0 0 1 2.35 5.67c0 4.42-3.6 8.02-8.02 8.02zm4.4-6c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z"/>
            </svg>
          </div>
          <span class="share-channel-label">${t('share_channel_whatsapp')}</span>
        </button>

        <!-- Viber -->
        <button class="share-channel-btn share-vb" id="share-channel-vb" title="${t('share_channel_viber')}">
          <div class="share-channel-icon-wrap share-icon-vb">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M20.4 15.6c-.6-.6-1.5-.6-2.1 0l-1.2 1.2c-.3.3-.8.4-1.2.2-2.1-1-3.8-2.7-4.8-4.8-.2-.4-.1-.9.2-1.2l1.2-1.2c.6-.6.6-1.5 0-2.1l-2.4-2.4c-.6-.6-1.5-.6-2.1 0l-1.5 1.5c-.7.7-1 1.7-.8 2.7 1 4.8 4.8 8.6 9.6 9.6 1 .2 2-.1 2.7-.8l1.5-1.5c.6-.6.6-1.5 0-2.1l-2.4-2.4zm-2.4-8.6c1.6.8 2.8 2 3.6 3.6.2.4.7.5 1.1.3.4-.2.5-.7.3-1.1-1-2-2.5-3.5-4.5-4.5-.4-.2-.9-.1-1.1.3-.2.4-.1.9.3 1.1zm-1.8 1.8c.8.4 1.4 1 1.8 1.8.2.4.6.5 1 .3.4-.2.5-.6.3-1-.6-1.1-1.5-2-2.6-2.6-.4-.2-.8-.1-1 .3-.2.4-.1.8.3 1z"/>
            </svg>
          </div>
          <span class="share-channel-label">${t('share_channel_viber')}</span>
        </button>

        <!-- TikTok -->
        <button class="share-channel-btn share-tt" id="share-channel-tt" title="${t('share_channel_tiktok')}">
          <div class="share-channel-icon-wrap share-icon-tt">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.34 0 .66.06.96.17V9.45a6.34 6.34 0 0 0-.96-.08A6.34 6.34 0 0 0 3 15.67a6.34 6.34 0 0 0 6.34 6.33 6.34 6.34 0 0 0 6.33-6.33V9.12a8.16 8.16 0 0 0 3.92 1.05v-3.48z"/>
            </svg>
          </div>
          <span class="share-channel-label">${t('share_channel_tiktok')}</span>
        </button>

        <!-- Email -->
        <button class="share-channel-btn share-em" id="share-channel-em" title="${t('share_channel_email')}">
          <div class="share-channel-icon-wrap share-icon-em">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <span class="share-channel-label">${t('share_channel_email')}</span>
        </button>

        <!-- SMS -->
        <button class="share-channel-btn share-sms" id="share-channel-sms" title="${t('share_channel_sms')}">
          <div class="share-channel-icon-wrap share-icon-sms">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
            </svg>
          </div>
          <span class="share-channel-label">${t('share_channel_sms')}</span>
        </button>
      </div>

      <!-- Link Copy Field -->
      <div class="share-link-box">
        <input type="text" class="share-link-input" id="share-link-input" value="${shareUrl}" readonly spellcheck="false" />
        <button class="share-copy-btn" id="share-copy-btn">
          <span class="share-copy-btn-icon">📋</span>
          <span class="share-copy-btn-text">${t('share_copy_link')}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('open');
  });

  const closeModal = () => {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.remove();
    }, 220);
  };

  // Close handlers
  const closeBtn = overlay.querySelector('#share-modal-close-btn');
  if (closeBtn) closeBtn.onclick = closeModal;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Telegram click
  const tgBtn = overlay.querySelector('#share-channel-tg');
  if (tgBtn) {
    tgBtn.onclick = () => {
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
      closeModal();
    };
  }

  // WhatsApp click
  const waBtn = overlay.querySelector('#share-channel-wa');
  if (waBtn) {
    waBtn.onclick = () => {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      closeModal();
    };
  }

  // Viber click
  const vbBtn = overlay.querySelector('#share-channel-vb');
  if (vbBtn) {
    vbBtn.onclick = () => {
      const vbUrl = `viber://forward?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.location.href = vbUrl;
      closeModal();
    };
  }

  // TikTok click (Copy link & prompt + optionally open TikTok)
  const ttBtn = overlay.querySelector('#share-channel-tt');
  if (ttBtn) {
    ttBtn.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      showShareToast(t('share_tiktok_copied_toast'));
      setTimeout(() => {
        window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
      }, 500);
      closeModal();
    };
  }

  // Email click
  const emBtn = overlay.querySelector('#share-channel-em');
  if (emBtn) {
    emBtn.onclick = () => {
      const mailtoUrl = `mailto:?subject=${encodeURIComponent('English Breakfast')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
      window.location.href = mailtoUrl;
      closeModal();
    };
  }

  // SMS click
  const smsBtn = overlay.querySelector('#share-channel-sms');
  if (smsBtn) {
    smsBtn.onclick = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const delimiter = isIOS ? '&' : '?';
      const smsUrl = `sms:${delimiter}body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.location.href = smsUrl;
      closeModal();
    };
  }

  // Copy Link Button
  const copyBtn = overlay.querySelector('#share-copy-btn');
  const linkInput = overlay.querySelector('#share-link-input');
  if (copyBtn && linkInput) {
    copyBtn.onclick = () => {
      linkInput.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showCopySuccess(copyBtn);
        }).catch(() => {
          document.execCommand('copy');
          showCopySuccess(copyBtn);
        });
      } else {
        document.execCommand('copy');
        showCopySuccess(copyBtn);
      }
    };
  }
}

function showCopySuccess(copyBtn) {
  copyBtn.classList.add('copied');
  const icon = copyBtn.querySelector('.share-copy-btn-icon');
  const text = copyBtn.querySelector('.share-copy-btn-text');
  if (icon) icon.textContent = '✓';
  if (text) text.textContent = t('share_copied_btn');
  showShareToast(t('share_copied_toast'));

  setTimeout(() => {
    copyBtn.classList.remove('copied');
    if (icon) icon.textContent = '📋';
    if (text) text.textContent = t('share_copy_link');
  }, 2500);
}

/**
 * Main entry point for sharing
 * Invokes native navigator.share on mobile if supported, or renders ShareModal
 */
export function openShareDialog() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shareUrl = getShareUrl();
  const shareText = t('share_message_text');

  if (navigator.share && isMobile) {
    navigator.share({
      title: 'English Breakfast',
      text: shareText,
      url: shareUrl
    }).catch((err) => {
      // If user cancelled, do nothing. If error, open modal.
      if (err.name !== 'AbortError') {
        showShareModal();
      }
    });
  } else {
    showShareModal();
  }
}
