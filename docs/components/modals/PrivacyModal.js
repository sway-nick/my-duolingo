import { t, getInterfaceLanguage } from '../../services/i18n.js?v=200.0';

export function openPrivacyModal() {
  const existing = document.querySelector('#privacy-policy-modal-overlay');
  if (existing) existing.remove();

  const currentLang = (getInterfaceLanguage ? getInterfaceLanguage() : (localStorage.getItem('myduo_interface_lang') || 'ru')).toLowerCase();
  let activeLang = currentLang.startsWith('ru') || currentLang.startsWith('uk') ? 'ru' : 'en';

  const overlay = document.createElement('div');
  overlay.id = 'privacy-policy-modal-overlay';
  overlay.className = 'modal-backdrop privacy-modal-backdrop';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
    box-sizing: border-box;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  `;

  overlay.innerHTML = `
    <div class="privacy-modal-card" style="
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      width: 100%;
      max-width: 540px;
      max-height: calc(100dvh - 36px);
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
        padding: 14px 18px;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
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
          ← ${activeLang === 'ru' ? 'Назад' : 'Back'}
        </button>

        <div style="font-size: 15px; font-weight: 800; color: var(--text-main); text-align: center;">
          ${t('settings_privacy_policy') || (activeLang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy')}
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

      <!-- Language Toggle Bar -->
      <div style="
        display: flex;
        gap: 8px;
        padding: 10px 18px;
        background: rgba(0, 0, 0, 0.03);
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
      ">
        <button type="button" class="privacy-lang-tab ${activeLang === 'ru' ? 'active' : ''}" data-lang="ru" style="
          padding: 5px 14px;
          border-radius: 8px;
          border: 1px solid ${activeLang === 'ru' ? 'var(--accent, #ea580c)' : 'var(--border-color)'};
          background: ${activeLang === 'ru' ? 'var(--accent, #ea580c)' : 'transparent'};
          color: ${activeLang === 'ru' ? '#ffffff' : 'var(--text-main)'};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          min-height: 32px;
        ">Русский</button>
        <button type="button" class="privacy-lang-tab ${activeLang === 'en' ? 'active' : ''}" data-lang="en" style="
          padding: 5px 14px;
          border-radius: 8px;
          border: 1px solid ${activeLang === 'en' ? 'var(--accent, #ea580c)' : 'var(--border-color)'};
          background: ${activeLang === 'en' ? 'var(--accent, #ea580c)' : 'transparent'};
          color: ${activeLang === 'en' ? '#ffffff' : 'var(--text-main)'};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          min-height: 32px;
        ">English</button>
      </div>

      <!-- Scrollable Policy Content -->
      <div id="privacy-content-scroll" style="
        flex: 1 1 auto;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 18px 20px 24px;
        color: var(--text-main);
        font-size: 14px;
        line-height: 1.65;
        overscroll-behavior: contain;
      ">
        <div id="privacy-text-ru" style="display: ${activeLang === 'ru' ? 'block' : 'none'};">
          <h2 style="font-size: 19px; font-weight: 800; margin: 0 0 6px; color: var(--text-main);">🍳 English Breakfast</h2>
          <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 16px;">Дата последнего обновления: 6 сентября 2026 г.</p>

          <p style="margin: 0 0 16px; color: var(--text-muted);">Настоящая Политика конфиденциальности описывает, как мобильное и веб-приложение <strong>English Breakfast</strong> собирает, использует и защищает информацию пользователей.</p>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">1. Сбор и использование информации</h3>
          <p style="margin: 0 0 10px; color: var(--text-muted);">Мы собираем минимально необходимое количество данных для обеспечения работы интерактивного тренажёра:</p>
          <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-muted);">
            <li style="margin-bottom: 6px;"><strong>Прогресс обучения:</strong> изученные слова, количество правильных и ошибочных ответов, баллы опыта (XP) и статистика сохраняются локально на вашем устройстве, а при авторизации синхронизируются с защищённой базой данных.</li>
            <li style="margin-bottom: 6px;"><strong>Учётная запись:</strong> если вы регистрируетесь или входите через Google, мы сохраняем ваше имя и адрес электронной почты исключительно для авторизации и отображения в таблице лидеров.</li>
            <li><strong>Избранные слова и настройки:</strong> список добавленных в избранное слов и выбранная тема оформления.</li>
          </ul>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">2. Разрешения устройства</h3>
          <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-muted);">
            <li style="margin-bottom: 6px;"><strong>Микрофон:</strong> используется исключительно для интерактивной тренировки произношения слов в реальном времени. Аудиозаписи вашего голоса не сохраняются на серверах.</li>
            <li><strong>Камера и галерея:</strong> используется для распознавания текста (OCR) с фотографий и изображений для быстрого добавления слов в личный словарь.</li>
          </ul>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">3. Безопасность данных</h3>
          <p style="margin: 0 0 16px; color: var(--text-muted);">Мы применяем современные стандарты безопасности и шифрования HTTPS для передачи всех данных между приложением и сервером. Мы не продаём, не передаём и не раскрываем личные данные третьим лицам.</p>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">4. Удаление данных</h3>
          <p style="margin: 0 0 16px; color: var(--text-muted);">Вы имеете полное право удалить свой прогресс, избранные слова или учётную запись в любой момент прямо в настройках приложения (кнопка «Удалить аккаунт и данные») либо обратившись к разработчику.</p>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">5. Контакты</h3>
          <p style="margin: 0; color: var(--text-muted);">По любым вопросам, связанным с Политикой конфиденциальности или работой приложения, вы можете связаться с нами по электронной почте:<br>
          <strong>Email:</strong> <a href="mailto:lipniagovnikola@gmail.com" style="color: var(--accent, #ea580c); font-weight: 600;">lipniagovnikola@gmail.com</a></p>
        </div>

        <div id="privacy-text-en" style="display: ${activeLang === 'en' ? 'block' : 'none'};">
          <h2 style="font-size: 19px; font-weight: 800; margin: 0 0 6px; color: var(--text-main);">🍳 English Breakfast</h2>
          <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 16px;">Last Updated: September 6, 2026</p>

          <p style="margin: 0 0 16px; color: var(--text-muted);">This Privacy Policy explains how the <strong>English Breakfast</strong> mobile and web application collects, uses, and safeguards your information.</p>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">1. Information We Collect</h3>
          <p style="margin: 0 0 10px; color: var(--text-muted);">We collect minimal information necessary to deliver personalized vocabulary learning:</p>
          <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-muted);">
            <li style="margin-bottom: 6px;"><strong>Learning Progress:</strong> Mastered words, practice accuracy, experience points (XP), and study streak saved locally and synchronized with our secure database when signed in.</li>
            <li style="margin-bottom: 6px;"><strong>Account Information:</strong> If you choose to sign up or log in with Google, we store your name and email address strictly for authentication and leaderboard ranking.</li>
            <li><strong>Favorites & Settings:</strong> Your saved vocabulary lists, chosen difficulty level, and display themes.</li>
          </ul>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">2. Device Permissions</h3>
          <ul style="margin: 0 0 16px; padding-left: 20px; color: var(--text-muted);">
            <li style="margin-bottom: 6px;"><strong>Microphone:</strong> Used solely for real-time speech recognition during pronunciation practice. Voice audio recordings are not stored on our servers.</li>
            <li><strong>Camera & Photo Gallery:</strong> Used for optical character recognition (OCR) to scan text from images and add vocabulary to your dictionary.</li>
          </ul>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">3. Data Protection</h3>
          <p style="margin: 0 0 16px; color: var(--text-muted);">All data transmissions are secured using HTTPS encryption. We do not sell, lease, or share personal user data with any third-party advertisers.</p>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">4. User Rights & Data Deletion</h3>
          <p style="margin: 0 0 16px; color: var(--text-muted);">You can clear your learning history, remove favorite words, or request full account deletion at any time directly in the app settings or by contacting the developer.</p>

          <h3 style="font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--text-main);">5. Contact Us</h3>
          <p style="margin: 0; color: var(--text-muted);">If you have any questions regarding this Privacy Policy, please reach out to us:<br>
          <strong>Email:</strong> <a href="mailto:lipniagovnikola@gmail.com" style="color: var(--accent, #ea580c); font-weight: 600;">lipniagovnikola@gmail.com</a></p>
        </div>
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

  // Language switch tabs
  const tabs = overlay.querySelectorAll('.privacy-lang-tab');
  const textRu = overlay.querySelector('#privacy-text-ru');
  const textEn = overlay.querySelector('#privacy-text-en');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selected = tab.getAttribute('data-lang');
      tabs.forEach((t) => {
        const isCurrent = t.getAttribute('data-lang') === selected;
        t.style.background = isCurrent ? 'var(--accent, #ea580c)' : 'transparent';
        t.style.borderColor = isCurrent ? 'var(--accent, #ea580c)' : 'var(--border-color)';
        t.style.color = isCurrent ? '#ffffff' : 'var(--text-main)';
      });
      if (textRu) textRu.style.display = selected === 'ru' ? 'block' : 'none';
      if (textEn) textEn.style.display = selected === 'en' ? 'block' : 'none';
    });
  });
}
