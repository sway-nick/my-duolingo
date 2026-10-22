import { t } from '../../services/i18n.js?v=386.0';
import { showToast } from '../layout/AppLayout.js?v=386.0';

export function openWidgetConfigBottomSheet() {
  if (window.trackScreen) {
    window.trackScreen('modal_widget_config', 'WidgetConfigSheet');
  }

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
    autoSpeakEnabled: true,
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

      <!-- 2. Study Reminder -->
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

      <!-- 3. Submit Button -->
      <div class="widget-sheet-actions">
        <button type="button" class="primary-button widget-sheet-submit-btn" id="btn-apply-widget-config">
          ${isInstalled ? (t('widget_save_changes') || 'Сохранить изменения') : `✨ ${t('widget_add_to_screen') || 'Добавить виджет на экран'}`}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Trigger smooth appearance
  requestAnimationFrame(() => {
    backdrop.classList.add('visible');
  });

  // System back button handling: exit modal and go to Settings tab
  const previousBackHandler = window.handleAndroidBackButton;
  const customBackHandler = function() {
    closeSheet();
    if (typeof window.setActiveTab === 'function') {
      window.setActiveTab('settings');
    } else {
      const settingsTabBtn = document.querySelector('[data-tab="settings"]');
      if (settingsTabBtn) settingsTabBtn.click();
    }
    return true;
  };
  window.handleAndroidBackButton = customBackHandler;

  const closeSheet = () => {
    if (window.handleAndroidBackButton === customBackHandler) {
      window.handleAndroidBackButton = previousBackHandler;
    }
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

      if (window.trackEvent) {
        window.trackEvent('widget_config_save', {
          is_installed: isInstalled,
          theme: config.widgetTheme,
          reminder_enabled: config.reminderEnabled,
        });
      }

      if (window.AndroidWidgetBridge) {
        if (typeof window.syncFavoritesToAndroidWidget === 'function') {
          try {
            window.syncFavoritesToAndroidWidget();
          } catch (e) {}
        }
        if (typeof window.AndroidWidgetBridge.saveWidgetConfig === 'function') {
          window.AndroidWidgetBridge.saveWidgetConfig(configJson);
        }
        if (!isInstalled && typeof window.AndroidWidgetBridge.requestPinWidget === 'function') {
          if (window.trackEvent) {
            window.trackEvent('widget_pin_request');
          }
          closeSheet();
          setTimeout(() => {
            try {
              window.AndroidWidgetBridge.requestPinWidget();
            } catch (e) {
              console.warn('[Widget] requestPinWidget error:', e);
            }
          }, 80);
          return;
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
