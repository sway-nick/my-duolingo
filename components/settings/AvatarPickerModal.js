import { VECTOR_AVATARS, saveUserAvatar, getUserAvatar, getEffectiveUserId, compressAndCropAvatar } from '../../services/authService.js?v=18.0';
import { t } from '../../services/i18n.js?v=200.0';

function renderAvatarPickerModal(onAvatarSelected = () => {}) {
  // Remove existing modal if any
  const existing = document.querySelector('#avatar-picker-modal');
  if (existing) existing.remove();

  const currentAvatar = getUserAvatar();

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'avatar-picker-modal';
  modalOverlay.className = 'modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="modal-content avatar-picker-modal-content">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 17px; font-weight: 700;">${t('avatar_choose_title')}</h3>
        <button class="modal-close-btn" id="close-avatar-modal-btn" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); line-height: 1; padding: 4px;">✕</button>
      </div>

      <div class="avatar-grid-picker" style="margin-bottom: 16px;">
        ${VECTOR_AVATARS.map((avatarPath, index) => {
          const isSelected = Boolean(currentAvatar && (currentAvatar === avatarPath || currentAvatar.split('?')[0] === avatarPath.split('?')[0]));
          return `
            <div class="avatar-grid-item ${isSelected ? 'selected' : ''}" data-path="${avatarPath}" role="button" tabindex="0" title="${t('avatar_choose_title')} ${index + 1}">
              <img src="${avatarPath}" alt="Avatar ${index + 1}" class="avatar-grid-img" />
              ${isSelected ? '<span class="avatar-check-badge">✓</span>' : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="avatar-modal-footer" style="display: flex; flex-direction: column; gap: 8px; align-items: stretch;">
        <label class="primary-button btn-blue upload-custom-avatar-btn" style="display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; margin: 0; width: 100%;">
          ${t('avatar_upload_btn')}
          <input type="file" id="modal-avatar-file-input" accept="image/png, image/jpeg, image/webp, image/gif, image/heic" style="display: none;" />
        </label>
        ${
          currentAvatar
            ? `<button class="secondary-button" id="modal-reset-avatar-btn" style="font-size: 12.5px; padding: 6px 12px; min-height: 34px; height: 34px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">${t('avatar_reset_btn')}</button>`
            : ''
        }
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Close handlers
  const closeModal = () => modalOverlay.remove();
  const closeBtn = modalOverlay.querySelector('#close-avatar-modal-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Pick vector avatar item
  const gridItems = modalOverlay.querySelectorAll('.avatar-grid-item');
  gridItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedPath = btn.getAttribute('data-path');
      if (selectedPath) {
        saveUserAvatar(getEffectiveUserId(), selectedPath);
        onAvatarSelected(selectedPath);
        closeModal();
      }
    });
  });

  // Reset avatar button handler
  const resetBtn = modalOverlay.querySelector('#modal-reset-avatar-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      saveUserAvatar(getEffectiveUserId(), null);
      onAvatarSelected(null);
      closeModal();
    });
  }

  // Upload custom file handler
  const fileInput = modalOverlay.querySelector('#modal-avatar-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressedBase64 = await compressAndCropAvatar(file, 128);
        saveUserAvatar(getEffectiveUserId(), compressedBase64);
        onAvatarSelected(compressedBase64);
        closeModal();
      } catch (err) {
        console.error('Error processing custom avatar:', err);
        alert('Не удалось обработать изображение. Попробуйте другой файл.');
      }
    });
  }
}

export { renderAvatarPickerModal };
