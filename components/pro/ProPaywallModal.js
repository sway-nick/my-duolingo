import { ProService } from '../../services/proService.js?v=423.0';
import { getProStrings } from '../../services/proI18n.js?v=423.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { showToast } from '../layout/AppLayout.js?v=423.0';
import { isDebugForceFree, setDebugForceFree } from '../../services/proState.js?v=423.0';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getReasonBannerText(s, reason, wordsNeeded = 0) {
  switch (reason) {
    case 'favorites_limit':
      return s.pro_fav_limit;
    case 'custom_pattern':
      return s.pro_pattern_only;
    case 'tenses':
    case 'micro_rules':
    case 'stories':
      if (Number(wordsNeeded) > 0) {
        return String(s.pro_unlock_learn_or_pro || '').replace('{n}', String(wordsNeeded));
      }
      return '';
    default:
      return '';
  }
}

export function showProPaywall({ reason = 'settings', wordsNeeded = 0 } = {}) {
  if (typeof document === 'undefined') return Promise.resolve('closed');
  if (document.getElementById('eb-pro-paywall-modal')) {
    return Promise.resolve('closed');
  }

  const lang = getInterfaceLanguage() || 'en';
  const baseLang = String(lang).toLowerCase().split(/[-_]/)[0];
  const s = getProStrings(lang);
  const isRtl = RTL_LOCALES.has(baseLang);
  const reasonText = getReasonBannerText(s, reason, wordsNeeded);

  if (typeof window !== 'undefined' && window.trackEvent) {
    window.trackEvent('pro_paywall_shown', { reason });
  }

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'eb-pro-paywall-modal';
    overlay.dir = isRtl ? 'rtl' : 'ltr';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:10050',
      'background:rgba(15,23,42,0.72)',
      'backdrop-filter:blur(6px)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:16px',
    ].join(';');

    overlay.innerHTML = `
      <div class="eb-pro-modal-card" style="width:100%;max-width:420px;background:var(--card-bg,#ffffff);color:var(--text-main,#0f172a);border:1px solid var(--border-color,rgba(148,163,184,0.28));border-radius:20px;padding:22px 20px;box-shadow:0 24px 48px rgba(0,0,0,0.28);position:relative;max-height:90vh;overflow-y:auto;">
        <button type="button" id="eb-pro-close-btn" aria-label="Close" style="position:absolute;top:12px;${isRtl ? 'left' : 'right'}:12px;width:32px;height:32px;border-radius:50%;border:none;background:rgba(148,163,184,0.2);color:var(--text-main,#0f172a);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>

        <div id="eb-pro-modal-header" style="display:flex;align-items:center;gap:10px;margin-bottom:10px;cursor:pointer;user-select:none;">
          <span style="display:inline-flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:999px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:800;font-size:12px;letter-spacing:0.6px;">${escapeHtml(s.pro_badge)}</span>
          <h2 style="margin:0;font-size:20px;font-weight:800;line-height:1.25;color:var(--text-main,#0f172a);">${escapeHtml(s.pro_title)}</h2>
        </div>

        ${reasonText ? `
          <div style="margin:0 0 14px;padding:10px 12px;border-radius:12px;background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);color:var(--text-main,#0f172a);font-size:13px;font-weight:600;line-height:1.4;">
            ${escapeHtml(reasonText)}
          </div>
        ` : ''}

        <ul style="list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.4;">
          <li style="display:flex;gap:10px;align-items:flex-start;"><span>🎬</span><span>${escapeHtml(s.pro_benefit_noads)}</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start;"><span>📚</span><span>${escapeHtml(s.pro_benefit_grammar)}</span></li>
          <li style="display:flex;gap:10px;align-items:flex-start;"><span>🛡️</span><span>${escapeHtml(s.pro_benefit_shields)}</span></li>
        </ul>

        <div id="eb-pro-price-box" style="display:none;align-items:center;justify-content:center;gap:10px;margin-bottom:14px;padding:10px;border-radius:12px;background:rgba(148,163,184,0.1);">
          <span id="eb-pro-full-price" style="display:none;text-decoration:line-through;color:var(--text-muted,#94a3b8);font-size:14px;font-weight:600;"></span>
          <span id="eb-pro-price" style="font-size:22px;font-weight:900;color:#22c55e;"></span>
          <span id="eb-pro-discount-badge" style="display:none;padding:3px 8px;border-radius:999px;background:#ef4444;color:#fff;font-size:12px;font-weight:800;"></span>
        </div>

        <div id="eb-pro-status-msg" style="display:none;margin-bottom:12px;padding:8px 10px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;"></div>

        <button type="button" id="eb-pro-buy-btn" class="primary-button btn-orange" style="width:100%;min-height:46px;border-radius:12px;font-size:15px;font-weight:800;border:none;cursor:pointer;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;box-shadow:0 6px 16px rgba(234,88,12,0.35);">
          ${escapeHtml(s.pro_buy)}
        </button>

        <button type="button" id="eb-pro-restore-btn" style="width:100%;margin-top:10px;padding:8px;background:none;border:none;color:var(--text-muted,#94a3b8);font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;">
          ${escapeHtml(s.pro_restore)}
        </button>
      </div>
    `;

    let closed = false;
    const finish = (outcome) => {
      if (closed) return;
      closed = true;
      overlay.remove();
      resolve(outcome);
    };

    const showStatus = (text, isOk = false) => {
      const box = overlay.querySelector('#eb-pro-status-msg');
      if (!box) return;
      box.style.display = 'block';
      box.style.background = isOk ? 'rgba(34,197,94,0.16)' : 'rgba(239,68,68,0.14)';
      box.style.color = isOk ? '#16a34a' : 'var(--text-main,#0f172a)';
      box.textContent = text;
    };

    overlay.querySelector('#eb-pro-close-btn')?.addEventListener('click', () => finish('closed'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) finish('closed');
    });

    const modalHeaderEl = overlay.querySelector('#eb-pro-modal-header');
    if (modalHeaderEl) {
      let modalTapCount = 0;
      let modalTapTimer = null;
      modalHeaderEl.addEventListener('click', (e) => {
        modalTapCount++;
        if (modalTapTimer) clearTimeout(modalTapTimer);
        modalTapTimer = setTimeout(() => {
          modalTapCount = 0;
        }, 2500);
        if (modalTapCount >= 5) {
          e.preventDefault();
          e.stopPropagation();
          modalTapCount = 0;
          clearTimeout(modalTapTimer);
          const nextForceFree = !isDebugForceFree();
          setDebugForceFree(nextForceFree);
          try {
            if (navigator.vibrate) navigator.vibrate(40);
          } catch (_) {}
          showToast(nextForceFree ? s.pro_sim_free_on : s.pro_sim_free_off);
          finish('sim_toggled');
        }
      });
    }

    const buyBtn = overlay.querySelector('#eb-pro-buy-btn');
    const restoreBtn = overlay.querySelector('#eb-pro-restore-btn');

    ProService.getOffer().then((offer) => {
      if (closed || !offer || !offer.formattedPrice) return;
      const box = overlay.querySelector('#eb-pro-price-box');
      const priceEl = overlay.querySelector('#eb-pro-price');
      const fullEl = overlay.querySelector('#eb-pro-full-price');
      const discEl = overlay.querySelector('#eb-pro-discount-badge');
      if (box && priceEl) {
        priceEl.textContent = offer.formattedPrice;
        box.style.display = 'flex';
        if (offer.fullFormattedPrice && offer.discountPercent > 0 && fullEl && discEl) {
          fullEl.textContent = offer.fullFormattedPrice;
          fullEl.style.display = 'inline';
          discEl.textContent = String(s.pro_discount || '-{p}%').replace('{p}', String(offer.discountPercent));
          discEl.style.display = 'inline-block';
        }
      }
    }).catch(() => {});

    buyBtn?.addEventListener('click', async () => {
      if (buyBtn.disabled) return;
      buyBtn.disabled = true;
      const prev = buyBtn.textContent;
      buyBtn.textContent = '⏳ ...';
      try {
        const res = await ProService.purchase();
        if (res.status === 'purchased') {
          showStatus(s.pro_thanks, true);
          setTimeout(() => {
            finish('purchased');
            if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
              window.location.reload();
            }
          }, 1100);
          return;
        }
        if (res.status === 'pending') {
          showStatus(s.pro_pending, false);
          return;
        }
        if (res.status === 'error') {
          showStatus(s.pro_restore_none, false);
          return;
        }
      } finally {
        if (!closed && buyBtn.isConnected) {
          buyBtn.disabled = false;
          buyBtn.textContent = prev;
        }
      }
    });

    restoreBtn?.addEventListener('click', async () => {
      if (restoreBtn.disabled) return;
      restoreBtn.disabled = true;
      try {
        const res = await ProService.restore();
        if (res.restored) {
          showStatus(s.pro_thanks, true);
          setTimeout(() => {
            finish('purchased');
            if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
              window.location.reload();
            }
          }, 1100);
          return;
        }
        showStatus(s.pro_restore_none, false);
      } finally {
        if (!closed && restoreBtn.isConnected) {
          restoreBtn.disabled = false;
        }
      }
    });

    document.body.appendChild(overlay);
  });
}
