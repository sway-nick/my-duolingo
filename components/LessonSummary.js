import { AudioService } from '../services/audioService.js?v=8.0';
import { StorageService } from '../services/storageService.js?v=8.0';

export function renderLessonSummary(container, results) {
    if (!container) return;
    
    const { xpEarned, totalCorrect, totalWrong, mistakes = [], lessonId, timeTaken } = results;
    
    const accuracy = totalCorrect + totalWrong > 0 
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) 
        : 100;
    
    let html = `
        <div class="summary-screen">
            <div class="summary-header">
                <div class="summary-icon">⭐</div>
                <h2>Урок завершён!</h2>
            </div>
            
            <div class="summary-stats-grid">
                <div class="summary-xp stat-box">
                    <span class="stat-label">Опыт</span>
                    <span class="stat-value" style="color: #ffc800;">+${xpEarned} XP</span>
                </div>
                <div class="summary-accuracy stat-box">
                    <span class="stat-label">Точность</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="summary-correct stat-box">
                    <span class="stat-label">Правильно</span>
                    <span class="stat-value" style="color: #58cc02;">${totalCorrect}</span>
                </div>
                <div class="summary-wrong stat-box">
                    <span class="stat-label">Ошибки</span>
                    <span class="stat-value" style="color: #ff4b4b;">${totalWrong}</span>
                </div>
                <div class="summary-time stat-box">
                    <span class="stat-label">Время</span>
                    <span class="stat-value">${Math.floor(timeTaken / 60)}м ${timeTaken % 60}с</span>
                </div>
            </div>
    `;
    
    if (mistakes.length > 0) {
        html += `
            <div class="summary-mistakes">
                <h3>Работа над ошибками</h3>
                <ul class="mistakes-list">
        `;
        
        mistakes.forEach(mistake => {
            html += `
                <li class="mistake-item">
                    <div class="mistake-content">
                        <span class="mistake-word">${mistake.word}</span>
                        <span class="mistake-correct">Правильно: ${mistake.correctAnswer}</span>
                        <span class="mistake-yours">Ваш ответ: ${mistake.userAnswer}</span>
                    </div>
                    <button class="mistake-audio-btn" data-word="${mistake.word}">🔊</button>
                </li>
            `;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    html += `
            <div class="summary-actions">
                <button class="summary-continue-btn primary-btn">Продолжить</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    AudioService.playComplete();
    StorageService.addXP(xpEarned);
    if (lessonId) {
        StorageService.completeLesson(lessonId);
    }
    
    const continueBtn = container.querySelector('.summary-continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const event = new CustomEvent('back-to-path');
            document.dispatchEvent(event);
        });
    }
    
    const audioBtns = container.querySelectorAll('.mistake-audio-btn');
    audioBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const word = e.currentTarget.dataset.word;
            AudioService.speak(word);
        });
    });
}
