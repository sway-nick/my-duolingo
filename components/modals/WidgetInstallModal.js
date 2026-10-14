import { t } from '../../services/i18n.js?v=385.0';

export function openWidgetInstallModal() {
  const existing = document.querySelector('#widget-install-modal');
  if (existing) existing.remove();

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'widget-install-modal';
  modalOverlay.className = 'modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="modal-content widget-install-modal-content" style="max-width: 400px; width: 90%; border-radius: 20px; padding: 20px;">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h3 style="margin: 0; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span>📱</span>
          <span>Установка виджета</span>
        </h3>
        <button class="modal-close-btn" id="close-widget-modal-btn" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); line-height: 1; padding: 4px;">✕</button>
      </div>

      <div style="background: rgba(234, 179, 8, 0.12); border: 1.5px solid rgba(234, 179, 8, 0.35); border-radius: 14px; padding: 13px; margin-bottom: 16px; font-size: 13px; line-height: 1.45; color: var(--text-main);">
        <div style="font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; color: #eab308;">
          <span>⚠️</span>
          <span>Если экран защищён от изменений:</span>
        </div>
        На смартфонах Xiaomi (MIUI / HyperOS), Samsung и др. может быть включена функция <b>«Защитить от изменений»</b> (блокировка сетки экрана). При активной защите система блокирует виджет и показывает серую рамку.<br><br>
        <b>Как разрешить установку:</b><br>
        1. Зажмите свободное место на рабочем столе телефона.<br>
        2. Откройте <b>«Настройки»</b> экрана (шестерёнка) и временно <b>выключите «Защитить от изменений»</b>.<br>
        3. Нажмите кнопку добавления ниже:
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
        <button type="button" class="primary-button" id="btn-pin-action" style="width: 100%; justify-content: center; font-weight: 700; padding: 12px 16px; border-radius: 14px; background: linear-gradient(135deg, #ca8a04, #eab308); color: #000; border: none; font-size: 14px;">
          ✨ Добавить виджет (4×1)
        </button>

        <button type="button" class="secondary-button" id="btn-open-perms" style="width: 100%; justify-content: center; font-size: 12.5px; padding: 8px 12px; border-radius: 12px; opacity: 0.85;">
          ⚙️ Разрешения приложения в телефоне
        </button>
      </div>

      <p style="margin: 0; font-size: 11.5px; color: var(--text-muted); text-align: center; line-height: 1.35;">
        Или зажмите иконку приложения на рабочем столе и выберите <b>«Добавить виджет»</b>.
      </p>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();
  const closeBtn = modalOverlay.querySelector('#close-widget-modal-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  const btnPin = modalOverlay.querySelector('#btn-pin-action');
  if (btnPin) {
    btnPin.addEventListener('click', () => {
      if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.requestPinWidget === 'function') {
        window.AndroidWidgetBridge.requestPinWidget();
      } else {
        alert('Зажмите иконку English Breakfast на рабочем столе телефона и выберите «Добавить виджет».');
      }
      closeModal();
    });
  }

  const btnPerms = modalOverlay.querySelector('#btn-open-perms');
  if (btnPerms) {
    btnPerms.addEventListener('click', () => {
      if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.openHomeScreenSettings === 'function') {
        window.AndroidWidgetBridge.openHomeScreenSettings();
      }
    });
  }
}
