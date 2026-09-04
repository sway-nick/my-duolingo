import { StorageService } from '../services/storageService.js?v=200.0';

export function renderSettings(container) {
    if (!container) return;
    
    const settings = StorageService.getSettings() || {
        theme: 'light',
        soundEnabled: true,
        speechRate: 1.0,
        dailyGoal: 3,
        apiUrl: ''
    };
    
    const html = `
        <div class="modal-overlay" id="settings-overlay" style="display: none;">
            <div class="modal" id="settings-modal">
                <div class="modal-header">
                    <h2>Настройки</h2>
                    <button class="close-btn" id="close-settings-btn">✕</button>
                </div>
                <div class="modal-body">
                    <div class="setting-row">
                        <label for="theme-toggle">Тема (Светлая/Тёмная)</label>
                        <label class="switch">
                            <input type="checkbox" id="theme-toggle" ${settings.theme === 'dark' ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="setting-row">
                        <label for="sound-toggle">Звуковые эффекты</label>
                        <label class="switch">
                            <input type="checkbox" id="sound-toggle" ${settings.soundEnabled ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="setting-row">
                        <label for="speech-rate">Скорость речи: <span id="speech-rate-val">${settings.speechRate}</span>x</label>
                        <input type="range" id="speech-rate" min="0.5" max="1.5" step="0.1" value="${settings.speechRate}">
                    </div>
                    
                    <div class="setting-row">
                        <label for="daily-goal">Ежедневная цель (уроков)</label>
                        <input type="number" id="daily-goal" min="1" max="20" value="${settings.dailyGoal}">
                    </div>
                    
                    <div class="setting-row advanced-row">
                        <details>
                            <summary>Дополнительно</summary>
                            <div class="advanced-content">
                                <label for="api-url">API URL</label>
                                <input type="text" id="api-url" value="${settings.apiUrl || ''}" placeholder="https://script.google.com/...">
                            </div>
                        </details>
                    </div>
                    
                    <div class="setting-row danger-zone">
                        <button id="reset-progress-btn" class="danger-btn">Сбросить прогресс</button>
                    </div>
                    
                    <div class="app-version">v1.0.0</div>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('settings-overlay');
    if (existing) {
        existing.remove();
    }
    container.insertAdjacentHTML('beforeend', html);
    
    const overlay = document.getElementById('settings-overlay');
    const closeBtn = document.getElementById('close-settings-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const soundToggle = document.getElementById('sound-toggle');
    const speechRate = document.getElementById('speech-rate');
    const speechRateVal = document.getElementById('speech-rate-val');
    const dailyGoal = document.getElementById('daily-goal');
    const apiUrl = document.getElementById('api-url');
    const resetBtn = document.getElementById('reset-progress-btn');
    
    closeBtn.addEventListener('click', hideSettingsModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideSettingsModal();
    });
    
    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        StorageService.updateSettings(settings);
    });
    
    soundToggle.addEventListener('change', (e) => {
        settings.soundEnabled = e.target.checked;
        StorageService.updateSettings(settings);
    });
    
    speechRate.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        speechRateVal.textContent = val;
        settings.speechRate = parseFloat(val);
        StorageService.updateSettings(settings);
    });
    
    dailyGoal.addEventListener('change', (e) => {
        settings.dailyGoal = parseInt(e.target.value, 10) || 3;
        StorageService.updateSettings(settings);
    });
    
    apiUrl.addEventListener('change', (e) => {
        settings.apiUrl = e.target.value;
        StorageService.updateSettings(settings);
    });
    
    resetBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите полностью сбросить свой прогресс? Это действие нельзя отменить.')) {
            StorageService.resetProgress();
            alert('Прогресс сброшен.');
            window.location.reload();
        }
    });
}

export function showSettingsModal() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    } else {
        renderSettings(document.body);
        document.getElementById('settings-overlay').style.display = 'flex';
    }
}

export function hideSettingsModal() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'none';
}
