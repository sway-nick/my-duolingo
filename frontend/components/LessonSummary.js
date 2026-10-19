import { AudioService } from '../services/audioService.js?v=386.0';
import { StorageService } from '../services/storageService.js?v=386.0';
import { t } from '../services/i18n.js?v=386.0';

export function renderLessonSummary(container, results) {
    if (!container) return;
    
    const { xpEarned, totalCorrect, totalWrong, mistakes = [], lessonId, timeTaken } = results;
    
    const accuracy = totalCorrect + totalWrong > 0 
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) 
        : 100;

    if (typeof window !== 'undefined') {
        if (window.trackScreen) window.trackScreen('lesson_summary', 'LessonSummary');
        if (window.trackEvent) {
            window.trackEvent('lesson_completed', {
                lesson_id: lessonId || '',
                xp_earned: xpEarned || 0,
                accuracy: accuracy,
                correct_count: totalCorrect || 0,
                wrong_count: totalWrong || 0,
                time_taken: timeTaken || 0
            });
        }
    }
    
    let html = `
        <div class="summary-screen">
            <div class="summary-header">
                <div class="summary-icon">⭐</div>
                <h2>${t('train_goal_achieved') ? t('train_goal_achieved').replace('<br/>', ' ') : 'Lesson completed!'}</h2>
            </div>
            
            <div class="summary-stats-grid">
                <div class="summary-xp stat-box">
                    <span class="stat-label">XP</span>
                    <span class="stat-value" style="color: #ffc800;">+${xpEarned} XP</span>
                </div>
                <div class="summary-accuracy stat-box">
                    <span class="stat-label">${t('stats_accuracy') || 'Accuracy'}</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="summary-correct stat-box">
                    <span class="stat-label">${t('dict_stage_quiz') || 'Correct'}</span>
                    <span class="stat-value" style="color: #58cc02;">${totalCorrect}</span>
                </div>
                <div class="summary-wrong stat-box">
                    <span class="stat-label">${t('review_repeat') || 'Errors'}</span>
                    <span class="stat-value" style="color: #ff4b4b;">${totalWrong}</span>
                </div>
                <div class="summary-time stat-box">
                    <span class="stat-label">${t('lead_hours_short') ? t('lead_hours_short') : 'Time'}</span>
                    <span class="stat-value">${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</span>
                </div>
            </div>
    `;
    
    if (mistakes.length > 0) {
        html += `
            <div class="summary-mistakes">
                <h3>${t('review_repeat') || 'Mistakes review'}</h3>
                <ul class="mistakes-list">
        `;
        
        mistakes.forEach(mistake => {
            html += `
                <li class="mistake-item">
                    <div class="mistake-content">
                        <span class="mistake-word">${mistake.word}</span>
                        <span class="mistake-correct">${t('train_correct_label') || 'Correct:'} ${mistake.correctAnswer}</span>
                        <span class="mistake-yours">${t('lead_guest_name') || 'You'}: ${mistake.userAnswer}</span>
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
                <button class="summary-continue-btn primary-btn">${t('train_continue') || 'Continue'}</button>
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
