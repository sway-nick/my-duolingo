import { StorageService } from '../services/storageService.js?v=8.0';
import { ACHIEVEMENTS } from '../services/initialData.js?v=8.0';

export function renderStats(container) {
    if (!container) return;
    
    const stats = StorageService.getStats() || { accuracy: 0, sessions: [] };
    const xp = StorageService.getXP() || 0;
    const streak = StorageService.getStreak() || 0;
    const masteredWords = StorageService.getMasteredWordsCount() || 0;
    const level = Math.floor(xp / 100) + 1;
    const nextLevelXp = level * 100;
    const xpProgress = (xp % 100) / 100 * 100;
    
    const unlockedAchievements = StorageService.getUnlockedAchievements() || [];
    const activity = StorageService.getWeeklyActivity() || {};
    
    let html = `
        <div class="stats-container">
            <h2>Ваша статистика</h2>
            
            <div class="level-progress-section">
                <div class="level-header">
                    <h3>Уровень ${level}</h3>
                    <span>${xp} / ${nextLevelXp} XP</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${xpProgress}%;"></div>
                </div>
            </div>
            
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-card-title">Слов изучено</div>
                    <div class="stat-card-value">${masteredWords}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">Точность</div>
                    <div class="stat-card-value">${stats.accuracy !== undefined ? stats.accuracy : 100}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">Серия дней 🔥</div>
                    <div class="stat-card-value">${streak}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-title">Всего XP ⚡</div>
                    <div class="stat-card-value">${xp}</div>
                </div>
            </div>
            
            <div class="stats-calendar-section">
                <h3>Активность (последние 4 недели)</h3>
                <div class="stats-calendar">
    `;
    
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = activity[dateStr] || 0;
        
        let intensityClass = 'intensity-0';
        if (count > 0 && count <= 3) intensityClass = 'intensity-1';
        else if (count >= 4 && count <= 7) intensityClass = 'intensity-2';
        else if (count >= 8) intensityClass = 'intensity-3';
        
        html += `<div class="calendar-cell ${intensityClass}" title="${dateStr}: ${count} слов"></div>`;
    }
    
    html += `
                </div>
            </div>
            
            <div class="achievements-section">
                <h3>Достижения</h3>
                <div class="achievements-grid">
    `;
    
    const allAchievements = ACHIEVEMENTS || [];
    allAchievements.forEach(ach => {
        const isUnlocked = unlockedAchievements.includes(ach.id);
        html += `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${ach.description}">
                <div class="achievement-icon">${isUnlocked ? (ach.icon || '🏆') : '🔒'}</div>
                <div class="achievement-name">${ach.name}</div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <div class="recent-sessions-section">
                <h3>Последние сессии</h3>
                <ul class="recent-sessions-list">
    `;
    
    const recentSessions = (stats.sessions || []).slice(-5).reverse();
    if (recentSessions.length === 0) {
        html += '<li class="empty-session">Нет недавних сессий</li>';
    } else {
        recentSessions.forEach(session => {
            const d = new Date(session.timestamp).toLocaleString('ru-RU');
            html += `
                <li class="session-item">
                    <span class="session-date">${d}</span>
                    <span class="session-xp" style="color: #ffc800;">+${session.xpEarned} XP</span>
                    <span class="session-acc">Точность: ${session.accuracy}%</span>
                </li>
            `;
        });
    }
    
    html += `
                </ul>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
