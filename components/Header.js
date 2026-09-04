import { StorageService } from '../services/storageService.js?v=200.0';

export function renderHeader() {
    const container = document.getElementById('app-header');
    if (!container) return;
    
    container.innerHTML = `
        <div class="header-inner">
            <div class="header-brand">
                <span class="header-logo-icon">✦</span>
                <span class="header-logo-text">English Trainer</span>
            </div>
            <div class="header-stats-group">
                <div class="header-stat-badge streak-badge" title="Серия дней">
                    <span class="stat-icon">🔥</span>
                    <span id="header-streak" class="stat-num">0</span>
                </div>
                <div class="header-stat-badge xp-badge" title="Очки опыта">
                    <span class="stat-icon">⚡</span>
                    <span id="header-xp" class="stat-num">0</span>
                </div>
                <div class="header-stat-badge hearts-badge" title="Жизни" id="header-hearts-container">
                    <span class="stat-icon">❤️</span>
                    <span id="header-hearts-count" class="stat-num">5</span>
                </div>
                <div class="header-level-badge" id="header-level" title="Уровень">
                    Уровень 1
                </div>
            </div>
        </div>
    `;
    updateHeader();
}

export function updateHeader() {
    const streakEl = document.getElementById('header-streak');
    const xpEl = document.getElementById('header-xp');
    const heartsCountEl = document.getElementById('header-hearts-count');
    const levelEl = document.getElementById('header-level');
    
    if (streakEl) streakEl.textContent = StorageService.getStreak() || 0;
    if (xpEl) xpEl.textContent = StorageService.getXP() || 0;
    if (heartsCountEl) heartsCountEl.textContent = StorageService.getHearts() || 5;
    
    if (levelEl) {
        const xp = StorageService.getXP() || 0;
        const level = Math.floor(xp / 100) + 1;
        levelEl.textContent = `Уровень ${level}`;
    }
}
