import { t } from '../../services/i18n.js?v=385.0';
import { showToast } from '../layout/AppLayout.js?v=385.0';

export function openWidgetConfigBottomSheet() {
  const existing = document.querySelector('#widget-config-bottom-sheet');
  if (existing) existing.remove();

  // Check if widget is already placed on home screen
  let isInstalled = false;
  try {
    if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.isWidgetInstalled === 'function') {
      isInstalled = Boolean(window.AndroidWidgetBridge.isWidgetInstalled());
    }
  } catch (e) {
    console.warn('[Widget] Error checking isWidgetInstalled:', e);
  }

  // Load existing config from bridge or localStorage
  let config = {
    widgetTheme: 'gold',
    rotationIntervalMin: 30,
    soundFlipEnabled: true,
    autoSpeakEnabled: false,
    speakStartTime: '09:00',
    speakEndTime: '20:00',
    reminderEnabled: true,
    reminderTime: '11:00'
  };

  try {
    if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.getWidgetConfig === 'function') {
      const bridgeConfigStr = window.AndroidWidgetBridge.getWidgetConfig();
      if (bridgeConfigStr) {
        config = { ...config, ...JSON.parse(bridgeConfigStr) };
      }
    } else {
      const savedStr = localStorage.getItem('myduo_widget_config');
      if (savedStr) config = { ...config, ...JSON.parse(savedStr) };
    }
  } catch (e) {
    console.warn('[Widget] Error loading config:', e);
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'widget-config-bottom-sheet';
  backdrop.className = 'widget-sheet-backdrop';

  backdrop.innerHTML = `
    <div class="widget-sheet-container" role="dialog" aria-modal="true">
      <div class="widget-sheet-drag-handle"></div>

      <div class="widget-sheet-header">
        <h3 class="widget-sheet-title">
          <span>⚙️</span>
          <span>${t('settings_configure_widget') || 'Настройка виджета'}</span>
        </h3>
        <button type="button" class="widget-sheet-close" id="btn-close-widget-sheet" aria-label="${t('widget_close') || 'Закрыть'}">✕</button>
      </div>

      <!-- 1. Widget Theme Style -->
      <div class="widget-sheet-section">
        <label class="widget-sheet-label">${t('widget_theme_style') || 'Стиль оформления'}</label>
        <div class="widget-sheet-pills" id="theme-pills">
          <button type="button" class="widget-sheet-pill ${config.widgetTheme === 'gold' || (!config.widgetTheme || (config.widgetTheme !== 'glass' && config.widgetTheme !== 'dark_glass')) ? 'active' : ''}" data-val="gold">${t('widget_theme_gold') || 'Золото'}</button>
          <button type="button" class="widget-sheet-pill ${config.widgetTheme === 'glass' ? 'active' : ''}" data-val="glass">${t('widget_theme_light') || 'Светлая'}</button>
          <button type="button" class="widget-sheet-pill ${config.widgetTheme === 'dark_glass' ? 'active' : ''}" data-val="dark_glass">${t('widget_theme_dark') || 'Темная'}</button>
        </div>
      </div>

      <!-- 2. Rotation Interval -->
      <div class="widget-sheet-section">
        <label class="widget-sheet-label">${t('widget_interval_label') || 'Смена слова на карточке'}</label>
        <div class="widget-sheet-pills" id="interval-pills">
          <button type="button" class="widget-sheet-pill ${config.rotationIntervalMin === 15 ? 'active' : ''}" data-val="15">${t('widget_interval_15m') || '15 мин'}</button>
          <button type="button" class="widget-sheet-pill ${config.rotationIntervalMin === 30 ? 'active' : ''}" data-val="30">${t('widget_interval_30m') || '30 мин'}</button>
          <button type="button" class="widget-sheet-pill ${config.rotationIntervalMin === 60 ? 'active' : ''}" data-val="60">${t('widget_interval_1h') || '1 час'}</button>
          <button type="button" class="widget-sheet-pill ${config.rotationIntervalMin === 120 ? 'active' : ''}" data-val="120">${t('widget_interval_2h') || '2 часа'}</button>
        </div>
      </div>

      <!-- 3. Page Turn Sound -->
      <div class="widget-sheet-section">
        <label class="widget-sheet-label">${t('widget_sound_flip_label') || 'Звук перелистывания'}</label>
        <div class="widget-sheet-pills" id="sound-pills">
          <button type="button" class="widget-sheet-pill ${config.soundFlipEnabled ? 'active' : ''}" data-val="true">${t('widget_enabled') || 'Включен'}</button>
          <button type="button" class="widget-sheet-pill ${!config.soundFlipEnabled ? 'active' : ''}" data-val="false">${t('widget_disabled') || 'Выключен'}</button>
        </div>
      </div>

      <!-- 4. Auto Pronounce Word -->
      <div class="widget-sheet-section">
        <label class="widget-sheet-label">${t('widget_auto_speak_label') || 'Озвучивать слово при смене'}</label>
        <div class="widget-sheet-pills" id="autospeak-pills">
          <button type="button" class="widget-sheet-pill ${config.autoSpeakEnabled ? 'active' : ''}" data-val="true">${t('widget_enabled') || 'Включено'}</button>
          <button type="button" class="widget-sheet-pill ${!config.autoSpeakEnabled ? 'active' : ''}" data-val="false">${t('widget_disabled') || 'Выключено'}</button>
        </div>
      </div>

      <!-- 5. Speak Window / Repeat Period -->
      <div class="widget-sheet-section" id="speak-hours-section" style="${config.autoSpeakEnabled ? '' : 'opacity: 0.45; pointer-events: none;'}">
        <label class="widget-sheet-label">${t('widget_speak_hours_label') || 'Период повторений'}</label>
        <div class="widget-sheet-time-range-row">
          <div class="widget-sheet-time-picker-wrap" id="speak-start-wrap">
            <span style="font-size: 13px; color: var(--text-muted, #64748b);">${t('widget_time_from') || 'с'}</span>
            <span class="widget-sheet-time-label" id="speak-start-label">${config.speakStartTime || '09:00'}</span>
            <input type="time" class="widget-sheet-time-input" id="speak-start-input" value="${config.speakStartTime || '09:00'}" />
          </div>
          <span style="font-weight: 700; color: var(--text-muted, #94a3b8); font-size: 16px;">—</span>
          <div class="widget-sheet-time-picker-wrap" id="speak-end-wrap">
            <span style="font-size: 13px; color: var(--text-muted, #64748b);">${t('widget_time_to') || 'до'}</span>
            <span class="widget-sheet-time-label" id="speak-end-label">${config.speakEndTime || '20:00'}</span>
            <input type="time" class="widget-sheet-time-input" id="speak-end-input" value="${config.speakEndTime || '20:00'}" />
          </div>
        </div>
      </div>

      <!-- 6. Study Reminder -->
      <div class="widget-sheet-section">
        <label class="widget-sheet-label">${t('widget_reminder_label') || 'Напоминать про занятие'}</label>
        <div class="widget-sheet-reminder-row">
          <div class="widget-sheet-pills" id="reminder-pills" style="flex: 1;">
            <button type="button" class="widget-sheet-pill ${config.reminderEnabled ? 'active' : ''}" data-val="true">${t('widget_on') || 'Вкл'}</button>
            <button type="button" class="widget-sheet-pill ${!config.reminderEnabled ? 'active' : ''}" data-val="false">${t('widget_off') || 'Выкл'}</button>
          </div>
          <div class="widget-sheet-time-picker-wrap" id="time-picker-wrap" style="${config.reminderEnabled ? '' : 'opacity: 0.45; pointer-events: none;'}">
            <span class="widget-sheet-time-icon">🕚</span>
            <span class="widget-sheet-time-label" id="reminder-time-label">${config.reminderTime || '11:00'}</span>
            <input type="time" class="widget-sheet-time-input" id="reminder-time-input" value="${config.reminderTime || '11:00'}" />
          </div>
        </div>
      </div>

      <!-- 7. Submit Button -->
      <div class="widget-sheet-actions">
        <button type="button" class="primary-button widget-sheet-submit-btn" id="btn-apply-widget-config">
          ${isInstalled ? (t('widget_save_changes') || 'Сохранить изменения') : `✨ ${t('widget_add_to_screen') || 'Добавить виджет на экран'}`}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Trigger smooth slide up
  requestAnimationFrame(() => {
    backdrop.classList.add('visible');
  });

  const closeSheet = () => {
    backdrop.classList.remove('visible');
    setTimeout(() => backdrop.remove(), 250);
  };

  const closeBtn = backdrop.querySelector('#btn-close-widget-sheet');
  if (closeBtn) closeBtn.addEventListener('click', closeSheet);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeSheet();
  });

  // Theme selection
  const themePills = backdrop.querySelectorAll('#theme-pills .widget-sheet-pill');
  themePills.forEach(p => {
    p.addEventListener('click', () => {
      themePills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      config.widgetTheme = p.getAttribute('data-val') || 'gold';
    });
  });

  // Interval selection
  const intervalPills = backdrop.querySelectorAll('#interval-pills .widget-sheet-pill');
  intervalPills.forEach(p => {
    p.addEventListener('click', () => {
      intervalPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      config.rotationIntervalMin = parseInt(p.getAttribute('data-val'), 10) || 30;
    });
  });

  // Sound selection
  const soundPills = backdrop.querySelectorAll('#sound-pills .widget-sheet-pill');
  soundPills.forEach(p => {
    p.addEventListener('click', () => {
      soundPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      config.soundFlipEnabled = p.getAttribute('data-val') === 'true';
    });
  });

  // Auto-speak selection
  const autoSpeakPills = backdrop.querySelectorAll('#autospeak-pills .widget-sheet-pill');
  const speakHoursSection = backdrop.querySelector('#speak-hours-section');
  autoSpeakPills.forEach(p => {
    p.addEventListener('click', () => {
      autoSpeakPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      const enabled = p.getAttribute('data-val') === 'true';
      config.autoSpeakEnabled = enabled;
      if (speakHoursSection) {
        speakHoursSection.style.opacity = enabled ? '1' : '0.45';
        speakHoursSection.style.pointerEvents = enabled ? 'auto' : 'none';
      }
    });
  });

  // Speak time window inputs
  const speakStartInput = backdrop.querySelector('#speak-start-input');
  const speakStartLabel = backdrop.querySelector('#speak-start-label');
  if (speakStartInput && speakStartLabel) {
    speakStartInput.addEventListener('change', (e) => {
      if (e.target.value) {
        config.speakStartTime = e.target.value;
        speakStartLabel.textContent = e.target.value;
      }
    });
  }

  const speakEndInput = backdrop.querySelector('#speak-end-input');
  const speakEndLabel = backdrop.querySelector('#speak-end-label');
  if (speakEndInput && speakEndLabel) {
    speakEndInput.addEventListener('change', (e) => {
      if (e.target.value) {
        config.speakEndTime = e.target.value;
        speakEndLabel.textContent = e.target.value;
      }
    });
  }

  // Reminder toggle
  const reminderPills = backdrop.querySelectorAll('#reminder-pills .widget-sheet-pill');
  const timeWrap = backdrop.querySelector('#time-picker-wrap');
  reminderPills.forEach(p => {
    p.addEventListener('click', () => {
      reminderPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      const enabled = p.getAttribute('data-val') === 'true';
      config.reminderEnabled = enabled;
      if (timeWrap) {
        timeWrap.style.opacity = enabled ? '1' : '0.45';
        timeWrap.style.pointerEvents = enabled ? 'auto' : 'none';
      }
    });
  });

  // Time picker input
  const timeInput = backdrop.querySelector('#reminder-time-input');
  const timeLabel = backdrop.querySelector('#reminder-time-label');
  if (timeInput && timeLabel) {
    timeInput.addEventListener('change', (e) => {
      if (e.target.value) {
        config.reminderTime = e.target.value;
        timeLabel.textContent = e.target.value;
      }
    });
  }

  // Apply & Add Widget button
  const submitBtn = backdrop.querySelector('#btn-apply-widget-config');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const configJson = JSON.stringify(config);
      localStorage.setItem('myduo_widget_config', configJson);

      if (window.AndroidWidgetBridge) {
        if (typeof window.AndroidWidgetBridge.saveWidgetConfig === 'function') {
          window.AndroidWidgetBridge.saveWidgetConfig(configJson);
        }
        if (!isInstalled && typeof window.AndroidWidgetBridge.requestPinWidget === 'function') {
          window.AndroidWidgetBridge.requestPinWidget();
        } else if (isInstalled) {
          try {
            showToast(t('widget_settings_saved') || 'Настройки виджета сохранены');
          } catch (e) {}
        }
      } else {
        alert('Зажмите свободное место на рабочем столе и выберите «Виджеты» → English Breakfast.');
      }
      closeSheet();
    });
  }
}

if (typeof window !== 'undefined') {
  window.openWidgetConfigBottomSheet = openWidgetConfigBottomSheet;
}
