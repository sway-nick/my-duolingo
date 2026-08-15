import { CATEGORIES, LESSONS } from '../services/initialData.js';
import { StorageService } from '../services/storageService.js';

export function renderSkillPath(container) {
    if (!container) return;
    
    const progress = StorageService.getProgress() || {};
    const completedLessons = progress.completedLessons || [];
    
    const settings = StorageService.getSettings() || {};
    const dailyGoal = settings.dailyGoal || 3;
    const dailyCompleted = progress.dailyCompleted || 0;
    const xp = StorageService.getXP() || 0;
    const streak = StorageService.getStreak() || 0;
    const hearts = StorageService.getHearts() || 5;
    const level = Math.floor(xp / 100) + 1;
    
    // Category theme colors
    const categoryColors = [
        { bg: '#58cc02', border: '#46a302', title: 'Раздел 1: Основы' },
        { bg: '#ce82ff', border: '#a553db', title: 'Раздел 2: Еда и Напитки' },
        { bg: '#1cb0f6', border: '#1899d6', title: 'Раздел 3: Путешествия' },
        { bg: '#ff9600', border: '#cc7800', title: 'Раздел 4: Семья' },
        { bg: '#2b70c9', border: '#1f5396', title: 'Раздел 5: Работа' },
        { bg: '#00cd9c', border: '#00a37c', title: 'Раздел 6: Природа' },
        { bg: '#ff4b4b', border: '#d92c2c', title: 'Раздел 7: Эмоции' },
        { bg: '#ffc800', border: '#d9a700', title: 'Раздел 8: Глаголы' }
    ];

    let html = `
        <div class="duo-dashboard-layout">
            <div class="duo-path-column">
    `;
    
    let isNextAvailable = true;
    const sortedCategories = [...CATEGORIES].sort((a, b) => a.order - b.order);
    
    sortedCategories.forEach((category, catIndex) => {
        const theme = categoryColors[catIndex % categoryColors.length];
        const catLessons = LESSONS.filter(l => l.categoryId === category.id).sort((a, b) => a.order - b.order);
        const catCompleted = catLessons.every(l => completedLessons.includes(l.id));

        html += `
            <div class="duo-unit-section">
                <div class="duo-unit-header" style="background-color: ${theme.bg}; border-bottom-color: ${theme.border};">
                    <div class="unit-header-text">
                        <div class="unit-subtitle">${theme.title}</div>
                        <h2 class="unit-title">${category.name}</h2>
                        <p class="unit-desc">${category.description || 'Изучите новые слова и фразы'}</p>
                    </div>
                    <div class="unit-header-badge">
                        <span class="unit-icon">${category.icon || '📖'}</span>
                        <span class="unit-level">${category.level || 'A1'}</span>
                    </div>
                </div>

                <div class="duo-nodes-track">
        `;
        
        // Zigzag offsets for nodes
        const offsets = [0, 45, 0, -45];
        
        catLessons.forEach((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            let state = 'locked';
            let showStartTooltip = false;
            
            if (isCompleted) {
                state = 'completed';
            } else if (isNextAvailable) {
                state = 'active';
                showStartTooltip = true;
                isNextAvailable = false;
            }
            
            const offsetPx = offsets[index % offsets.length];
            
            html += `
                <div class="duo-node-wrapper" style="transform: translateX(${offsetPx}px);">
                    ${showStartTooltip ? `
                        <div class="duo-start-bubble">
                            <span>НАЧАТЬ</span>
                            <div class="bubble-arrow"></div>
                        </div>
                    ` : ''}
                    <button class="duo-skill-node state-${state}" data-lesson-id="${lesson.id}" ${state === 'locked' ? 'disabled' : ''} aria-label="${lesson.name || lesson.title}">
                        <div class="duo-node-icon-circle">
                            ${state === 'completed' ? '✓' : (state === 'active' ? (category.icon || '⭐') : '🔒')}
                        </div>
                        <div class="duo-node-ring"></div>
                    </button>
                    <div class="duo-node-label ${state === 'active' ? 'active-label' : ''}">
                        ${lesson.title || lesson.name}
                    </div>
                </div>
            `;
        });
        
        // Unit completion chest / trophy
        html += `
                    <div class="duo-unit-chest ${catCompleted ? 'unlocked' : 'locked'}">
                        <div class="chest-icon">${catCompleted ? '🏆' : '🎁'}</div>
                        <div class="chest-label">${catCompleted ? 'Раздел пройден!' : 'Награда раздела'}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>

            <!-- Right Sidebar Widgets (Desktop) -->
            <aside class="duo-sidebar-right">
                <!-- User Stats Card -->
                <div class="duo-card stats-widget-card">
                    <div class="stats-widget-row">
                        <div class="stat-pill streak-pill" title="Серия дней">
                            <span class="stat-icon">🔥</span>
                            <span class="stat-num">${streak}</span>
                            <span class="stat-label">Дней</span>
                        </div>
                        <div class="stat-pill xp-pill" title="Всего опыта">
                            <span class="stat-icon">⚡</span>
                            <span class="stat-num">${xp}</span>
                            <span class="stat-label">XP</span>
                        </div>
                        <div class="stat-pill hearts-pill" title="Жизни">
                            <span class="stat-icon">❤️</span>
                            <span class="stat-num">${hearts}</span>
                            <span class="stat-label">Сердец</span>
                        </div>
                    </div>
                </div>

                <!-- Daily Quests Card -->
                <div class="duo-card quest-card">
                    <div class="card-header">
                        <h3>🎯 Задания дня</h3>
                        <span class="quest-view-all">Все</span>
                    </div>
                    <div class="quest-item">
                        <div class="quest-icon">⚡</div>
                        <div class="quest-info">
                            <div class="quest-title">Завершите уроки</div>
                            <div class="quest-progress-bar">
                                <div class="quest-progress-fill" style="width: ${Math.min(100, (dailyCompleted / dailyGoal) * 100)}%;"></div>
                            </div>
                            <div class="quest-count">${dailyCompleted} / ${dailyGoal} уроков</div>
                        </div>
                    </div>
                    <div class="quest-item">
                        <div class="quest-icon">⭐</div>
                        <div class="quest-info">
                            <div class="quest-title">Наберите 50 XP</div>
                            <div class="quest-progress-bar">
                                <div class="quest-progress-fill" style="width: ${Math.min(100, (xp % 100)) / 50 * 100}%;"></div>
                            </div>
                            <div class="quest-count">${Math.min(50, xp % 100)} / 50 XP</div>
                        </div>
                    </div>
                </div>

                <!-- League Card -->
                <div class="duo-card league-card">
                    <div class="card-header">
                        <h3>🏆 Бронзовая лига</h3>
                    </div>
                    <div class="league-body">
                        <div class="league-rank">
                            <span class="rank-badge">#1</span>
                            <div class="rank-user">
                                <strong>Вы</strong>
                                <small>${xp} XP</small>
                            </div>
                        </div>
                        <p class="league-notice">Пройдите урок, чтобы укрепить позицию в топ-3!</p>
                    </div>
                </div>

                <!-- Quick Practice Card -->
                <div class="duo-card promo-card">
                    <div class="card-header">
                        <h3>📖 Быстрая тренировка</h3>
                    </div>
                    <p class="promo-desc">Повторите слова из словаря с помощью карточек SRS.</p>
                    <button class="duo-btn-secondary" id="btn-quick-vocab">
                        Открыть словарь
                    </button>
                </div>
            </aside>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Bind click events on active/completed nodes
    const nodes = container.querySelectorAll('.duo-skill-node:not([disabled])');
    nodes.forEach(node => {
        node.addEventListener('click', (e) => {
            const lessonId = e.currentTarget.dataset.lessonId;
            const event = new CustomEvent('start-lesson', { detail: { lessonId } });
            document.dispatchEvent(event);
        });
    });

    // Quick vocab button
    const quickVocabBtn = container.querySelector('#btn-quick-vocab');
    if (quickVocabBtn) {
        quickVocabBtn.addEventListener('click', () => {
            const navBtn = document.querySelector('[data-view="vocabulary"]');
            if (navBtn) navBtn.click();
        });
    }
}
