import { CATEGORIES, LESSONS } from '../services/initialData.js?v=8.0';
import { StorageService } from '../services/storageService.js?v=8.0';

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
    const masteredWords = StorageService.getMasteredWordsCount() || 0;

    let isNextAvailable = true;
    const sortedCategories = [...CATEGORIES].sort((a, b) => a.order - b.order);

    let html = `
        <div class="premium-dashboard">
            <!-- Center Column: Modules & Course Track -->
            <div class="dashboard-main-col">
                <div class="dashboard-hero">
                    <div class="hero-text">
                        <span class="hero-badge">АНГЛИЙСКИЙ ЯЗЫК • A1 — B2</span>
                        <h1 class="hero-title">Программа обучения</h1>
                        <p class="hero-desc">Интерактивный курс с интервальным повторением и практикой речи</p>
                    </div>
                    <div class="hero-stats-row">
                        <div class="hero-stat-item">
                            <span class="hero-stat-val">${completedLessons.length} / ${LESSONS.length}</span>
                            <span class="hero-stat-lbl">Уроков пройдено</span>
                        </div>
                        <div class="hero-stat-item">
                            <span class="hero-stat-val">${masteredWords}</span>
                            <span class="hero-stat-lbl">Слов изучено</span>
                        </div>
                        <div class="hero-stat-item">
                            <span class="hero-stat-val">${xp}</span>
                            <span class="hero-stat-lbl">Всего XP</span>
                        </div>
                    </div>
                </div>

                <div class="modules-list">
    `;

    sortedCategories.forEach((category, catIndex) => {
        const catLessons = LESSONS.filter(l => l.categoryId === category.id).sort((a, b) => a.order - b.order);
        const catCompletedCount = catLessons.filter(l => completedLessons.includes(l.id)).length;
        const progressPercent = Math.round((catCompletedCount / (catLessons.length || 1)) * 100);
        const isCompleted = catCompletedCount === catLessons.length && catLessons.length > 0;

        html += `
            <div class="module-card ${isCompleted ? 'module-completed' : ''}">
                <div class="module-header">
                    <div class="module-meta">
                        <span class="module-level-badge">${category.level || 'A1'}</span>
                        <span class="module-index">Модуль 0${catIndex + 1}</span>
                    </div>
                    <div class="module-icon-box">${category.icon || '📖'}</div>
                </div>

                <div class="module-body">
                    <h2 class="module-title">${category.name}</h2>
                    <p class="module-description">${category.description || 'Базовые фразы, лексика и практические упражнения.'}</p>

                    <div class="module-progress-wrapper">
                        <div class="progress-info">
                            <span class="progress-text">${catCompletedCount} из ${catLessons.length} уроков</span>
                            <span class="progress-percent">${progressPercent}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                    </div>
                </div>

                <div class="module-lessons-grid">
        `;

        catLessons.forEach((lesson, lIdx) => {
            const lessonCompleted = completedLessons.includes(lesson.id);
            let state = 'locked';
            let stateLabel = 'Закрыто';

            if (lessonCompleted) {
                state = 'completed';
                stateLabel = 'Пройдено';
            } else if (isNextAvailable) {
                state = 'active';
                stateLabel = 'Начать';
                isNextAvailable = false;
            }

            html += `
                <button class="lesson-chip lesson-state-${state}" data-lesson-id="${lesson.id}" ${state === 'locked' ? 'disabled' : ''}>
                    <div class="lesson-chip-number">0${lIdx + 1}</div>
                    <div class="lesson-chip-info">
                        <span class="lesson-chip-title">${lesson.title || lesson.name}</span>
                        <span class="lesson-chip-state">${stateLabel}</span>
                    </div>
                    <div class="lesson-chip-action">
                        ${state === 'completed' ? '<span class="action-icon check">✓</span>' : (state === 'active' ? '<span class="action-icon play">▶</span>' : '<span class="action-icon lock">🔒</span>')}
                    </div>
                </button>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `
                </div>
            </div>

            <!-- Right Column: Intelligence & Daily Progress -->
            <aside class="dashboard-sidebar-right">
                <!-- User Profile & Stats Card -->
                <div class="premium-card user-glance-card">
                    <div class="user-glance-header">
                        <div class="user-avatar">🎓</div>
                        <div class="user-glance-info">
                            <div class="user-name">Студент</div>
                            <div class="user-level">Уровень ${level} • ${xp} XP</div>
                        </div>
                    </div>
                    <div class="quick-stats-grid">
                        <div class="quick-stat-box">
                            <span class="quick-stat-icon">🔥</span>
                            <span class="quick-stat-value">${streak}</span>
                            <span class="quick-stat-label">Серия дней</span>
                        </div>
                        <div class="quick-stat-box">
                            <span class="quick-stat-icon">❤️</span>
                            <span class="quick-stat-value">${hearts} / 5</span>
                            <span class="quick-stat-label">Жизней</span>
                        </div>
                    </div>
                </div>

                <!-- Daily Goals Card -->
                <div class="premium-card daily-quest-card">
                    <div class="card-title-row">
                        <h3>Цель на сегодня</h3>
                        <span class="badge-pill">${dailyCompleted}/${dailyGoal}</span>
                    </div>
                    <p class="card-caption">Выполните ежедневную норму, чтобы поддерживать серию</p>
                    <div class="quest-progress-track">
                        <div class="quest-progress-fill" style="width: ${Math.min(100, (dailyCompleted / dailyGoal) * 100)}%;"></div>
                    </div>
                    <div class="quest-footer">
                        <span>${dailyGoal - dailyCompleted > 0 ? `Осталось уроков: ${dailyGoal - dailyCompleted}` : 'Цель выполнена! 🎉'}</span>
                    </div>
                </div>

                <!-- Spaced Repetition SRS Card -->
                <div class="premium-card srs-practice-card">
                    <div class="card-title-row">
                        <h3>Интервальное повторение</h3>
                    </div>
                    <p class="card-caption">Повторяйте изученные слова по алгоритму Лейтнера для долговременной памяти.</p>
                    <button class="btn-premium-action" id="btn-quick-vocab">
                        <span>Перейти в словарь</span>
                        <span class="arrow-icon">→</span>
                    </button>
                </div>

                <!-- Mini Leaderboard -->
                <div class="premium-card league-mini-card">
                    <div class="card-title-row">
                        <h3>Текущая лига</h3>
                        <span class="league-pill">Бронзовая</span>
                    </div>
                    <div class="league-rank-row">
                        <div class="rank-position">#1</div>
                        <div class="rank-details">
                            <div class="rank-name">Вы</div>
                            <div class="rank-xp">${xp} XP за всё время</div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    `;

    container.innerHTML = html;

    // Bind click events on lesson buttons
    const lessonButtons = container.querySelectorAll('.lesson-chip:not([disabled])');
    lessonButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lessonId = e.currentTarget.dataset.lessonId;
            if (lessonId) {
                document.dispatchEvent(new CustomEvent('start-lesson', { detail: { lessonId } }));
            }
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
