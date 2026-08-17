import { getUserSettings, saveUserSettings } from '../../services/api.js?v=16.0';
import { getCurrentUser, logoutUser, getUserAvatar, saveUserAvatar, removeUserAvatar, compressAndCropAvatar, getEffectiveUserId } from '../../services/authService.js?v=16.0';
import { renderAuthModal } from '../auth/AuthModal.js?v=16.0';
import { applyTheme, getSavedTheme } from '../layout/AppLayout.js?v=16.0';
import { speakWord, setSavedVoiceGender, isAudioMuted, setSavedSilentMode, playSuccessSound } from '../../services/audioService.js?v=16.0';

async function renderSettingsView(containerSelector = '#app-content', onUserChange = () => {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getCurrentUser();
  const avatar = getUserAvatar();
  const currentTheme = getSavedTheme();

  container.innerHTML = `
    <div class="settings-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0;">⚙️ Настройки</h2>
        <span class="autosave-badge" id="autosave-status" style="opacity: 0; transition: opacity 0.3s ease; white-space: nowrap;">
          ✓ Сохранено
        </span>
      </div>

      <!-- User Profile Card -->
      <div class="settings-card profile-card">
        <div class="profile-avatar-wrapper" id="change-avatar-trigger" title="Нажмите, чтобы загрузить фото">
          ${
            avatar
              ? `<img src="${avatar}" alt="Аватар" class="profile-avatar-img" />`
              : `<div class="profile-avatar-placeholder">${user && user.name ? user.name.trim().charAt(0).toUpperCase() : '👤'}</div>`
          }
          <div class="avatar-edit-badge" title="Загрузить фото">📷</div>
          <input type="file" id="avatar-file-input" accept="image/png, image/jpeg, image/webp, image/gif, image/heic" style="display: none;" />
        </div>
        <div class="profile-details">
          <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 2px;">${user ? user.name : 'Гостевой режим'}</h3>
          <p style="font-size: 12px; margin: 0; color: var(--text-muted);">${user ? user.email : 'Авторизуйтесь для синхронизации'}</p>
          <div style="display: flex; gap: 10px; margin-top: 5px;">
            <button type="button" class="avatar-action-link" id="upload-avatar-btn">
              ${avatar ? 'Сменить фото' : 'Загрузить фото'}
            </button>
            ${
              avatar
                ? `<button type="button" class="avatar-action-link delete-link" id="delete-avatar-btn">Удалить</button>`
                : ''
            }
          </div>
        </div>
        <div>
          ${
            user
              ? `<button class="secondary-button" id="logout-btn" style="width: auto; padding: 8px 16px; min-height: 38px; height: 38px; font-size: 14px; font-weight: 600;">Выйти</button>`
              : `<button class="primary-button" id="login-modal-btn" style="width: auto; padding: 8px 16px; min-height: 38px; height: 38px; font-size: 14px; font-weight: 600;">Войти</button>`
          }
        </div>
      </div>

      <!-- Theme Switcher Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">🎨 Тема оформления</h3>
        <div class="theme-options-row">
          <button class="theme-option-btn ${currentTheme === 'light' ? 'active' : ''}" id="theme-light-btn">
            ☼ Светлая тема
          </button>
          <button class="theme-option-btn ${currentTheme === 'dark' ? 'active' : ''}" id="theme-dark-btn">
            ☾ Тёмная тема
          </button>
        </div>
      </div>

      <!-- Sound Mode Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">🔊 Звук и эффекты</h3>
        <div class="sound-options-row">
          <button class="sound-option-btn" id="sound-on-btn">
            🔊 Со звуком
          </button>
          <button class="sound-option-btn" id="sound-off-btn">
            🔇 Без звука
          </button>
        </div>
      </div>

      <!-- Voice Selection Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px; display: flex; align-items: center; gap: 6px;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#d4a373" style="flex-shrink: 0;">
            <path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4zm-6 16a6 6 0 0 1 12 0H6zm14.5-9a4.5 4.5 0 0 1 0 6.36l-1.06-1.06a3 3 0 0 0 0-4.24l1.06-1.06zm2.5-2.5a8 8 0 0 1 0 11.31l-1.06-1.06a6.5 6.5 0 0 0 0-9.19l1.06-1.06z"/>
          </svg>
          Голос озвучки
        </h3>
        <div class="voice-options-row">
          <button class="voice-option-btn" id="voice-female-btn">
            ♀ Женский
          </button>
          <button class="voice-option-btn" id="voice-male-btn">
            ♂ Мужской
          </button>
        </div>
      </div>

      <!-- Goals Card -->
      <div class="settings-card">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 10px;">📌 Задача на день</h3>
        <select id="daily-goal-select" class="settings-select">
          <option value="10">10 слов</option>
          <option value="20">20 слов</option>
          <option value="30">30 слов</option>
          <option value="40">40 слов</option>
          <option value="50">50 слов</option>
          <option value="75">75 слов</option>
          <option value="100">100 слов</option>
        </select>
      </div>

    </div>
  `;

  // Bind auth buttons
  const loginBtn = container.querySelector('#login-modal-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      renderAuthModal(async () => {
        await onUserChange();
        await renderSettingsView(containerSelector, onUserChange);
      });
    });
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutUser();
      await onUserChange();
      await renderSettingsView(containerSelector, onUserChange);
    });
  }

  // Load current user settings
  const settings = await getUserSettings();
  const goalSelect = container.querySelector('#daily-goal-select');
  const autoSaveStatus = container.querySelector('#autosave-status');

  // Bind Avatar Upload / Change / Remove
  const avatarTrigger = container.querySelector('#change-avatar-trigger');
  const uploadAvatarBtn = container.querySelector('#upload-avatar-btn');
  const fileInput = container.querySelector('#avatar-file-input');
  const deleteAvatarBtn = container.querySelector('#delete-avatar-btn');

  const openFilePicker = () => {
    if (fileInput) fileInput.click();
  };

  if (avatarTrigger) avatarTrigger.addEventListener('click', openFilePicker);
  if (uploadAvatarBtn) uploadAvatarBtn.addEventListener('click', openFilePicker);

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        if (autoSaveStatus) {
          autoSaveStatus.textContent = 'Обработка фото...';
          autoSaveStatus.style.opacity = '1';
        }
        const compressedBase64 = await compressAndCropAvatar(file, 128);
        saveUserAvatar(getEffectiveUserId(), compressedBase64);
        if (autoSaveStatus) {
          autoSaveStatus.textContent = '✓ Аватар сохранен';
          setTimeout(() => {
            if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
          }, 1500);
        }
        await renderSettingsView(containerSelector, onUserChange);
      } catch (err) {
        console.error('Failed processing avatar image:', err);
        alert('Не удалось загрузить изображение. Попробуйте другой файл (PNG, JPG, WebP).');
      }
    });
  }

  if (deleteAvatarBtn) {
    deleteAvatarBtn.addEventListener('click', async () => {
      removeUserAvatar(getEffectiveUserId());
      if (autoSaveStatus) {
        autoSaveStatus.textContent = '✓ Фото удалено';
        autoSaveStatus.style.opacity = '1';
        setTimeout(() => {
          if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
        }, 1500);
      }
      await renderSettingsView(containerSelector, onUserChange);
    });
  }

  goalSelect.value = String(settings.dailyGoal || 10);

  // Setup Sound / Silent Mode Selection
  let isSilent = isAudioMuted() || Boolean(settings.silentMode);
  const soundOnBtn = container.querySelector('#sound-on-btn');
  const soundOffBtn = container.querySelector('#sound-off-btn');

  function updateSoundButtons() {
    if (soundOnBtn && soundOffBtn) {
      soundOnBtn.classList.toggle('active', !isSilent);
      soundOffBtn.classList.toggle('active', isSilent);
    }
  }
  updateSoundButtons();

  // Setup Voice Selection
  let currentVoice = settings.voiceGender || 'female';
  const femaleVoiceBtn = container.querySelector('#voice-female-btn');
  const maleVoiceBtn = container.querySelector('#voice-male-btn');

  function updateVoiceButtons() {
    if (femaleVoiceBtn && maleVoiceBtn) {
      femaleVoiceBtn.classList.toggle('active', currentVoice === 'female');
      maleVoiceBtn.classList.toggle('active', currentVoice === 'male');
    }
  }
  updateVoiceButtons();

  // Helper: auto-save function
  async function triggerAutoSave() {
    const newSettings = {
      ...settings,
      dailyGoal: Number(goalSelect.value),
      theme: getSavedTheme(),
      voiceGender: currentVoice,
      silentMode: isSilent,
    };

    if (autoSaveStatus) {
      autoSaveStatus.textContent = 'Сохранение...';
      autoSaveStatus.style.opacity = '1';
    }

    await saveUserSettings(newSettings);
    onUserChange();

    if (autoSaveStatus) {
      autoSaveStatus.textContent = '✓ Сохранено в профиле';
      setTimeout(() => {
        if (autoSaveStatus) autoSaveStatus.style.opacity = '0';
      }, 1500);
    }
  }

  // Bind change listener for goal
  goalSelect.addEventListener('change', triggerAutoSave);

  // Bind theme buttons with auto-save
  const lightBtn = container.querySelector('#theme-light-btn');
  const darkBtn = container.querySelector('#theme-dark-btn');

  lightBtn.addEventListener('click', () => {
    applyTheme('light');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
    triggerAutoSave();
  });

  darkBtn.addEventListener('click', () => {
    applyTheme('dark');
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
    triggerAutoSave();
  });

  // Bind sound buttons
  if (soundOnBtn && soundOffBtn) {
    soundOnBtn.addEventListener('click', () => {
      isSilent = false;
      setSavedSilentMode(false);
      updateSoundButtons();
      playSuccessSound();
      triggerAutoSave();
    });

    soundOffBtn.addEventListener('click', () => {
      isSilent = true;
      setSavedSilentMode(true);
      updateSoundButtons();
      triggerAutoSave();
    });
  }

  // Bind voice buttons with preview speech
  if (femaleVoiceBtn && maleVoiceBtn) {
    femaleVoiceBtn.addEventListener('click', () => {
      currentVoice = 'female';
      setSavedVoiceGender('female');
      updateVoiceButtons();
      speakWord('Hello! This is the female voice.', null, 'en-US', 'female', true);
      triggerAutoSave();
    });

    maleVoiceBtn.addEventListener('click', () => {
      currentVoice = 'male';
      setSavedVoiceGender('male');
      updateVoiceButtons();
      speakWord('Hello! This is the male voice.', null, 'en-US', 'male', true);
      triggerAutoSave();
    });
  }
}

export { renderSettingsView };
