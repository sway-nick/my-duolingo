import { StorageService } from '../services/storageService.js';

export function renderHeader() {
    const container = document.getElementById('app-header');
    if (!container) return;
    
    container.innerHTML = `
        <div class="header-inner">
            <div class="header-logo">
                <span class="logo-icon">🦜</span>
                <span class="logo-text">duolingo</span>
            </div>
            <div class="header-stats">
                <div class="stat-item streak" title="Серия дней">
                    <span class="stat-icon">🔥</span>
                    <span id="header-streak" class="stat-value">0</span>
                </div>
                <div class="stat-item xp" title="Очки опыта">
                    <span class="stat-icon">⚡</span>
                    <span id="header-xp" class="stat-value">0</span>
                </div>
                <div class="stat-item hearts" title="Жизни" id="header-hearts-container">
                    <span class="stat-icon">❤️</span>
                    <span id="header-hearts-count" class="stat-value">5</span>
                </div>
                <div class="stat-item level" title="Уровень">
                    <span class="level-badge" id="header-level">1 ур.</span>
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
        levelEl.textContent = `${level} ур.`;
    }
}
