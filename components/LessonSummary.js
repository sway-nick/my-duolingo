import { AudioService } from '../services/audioService.js?v=386.0';
import { StorageService } from '../services/storageService.js?v=386.0';
import { t } from '../services/i18n.js?v=386.0';
import { checkAndPromptReviewFunnel } from './modals/ReviewFunnelModal.js?v=386.0';
import { showFairyTaleSurveyModal, getFairyTaleStrings } from './modals/FairyTaleSurveyModal.js?v=386.0';

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
    
    if (typeof localStorage !== 'undefined' && localStorage.getItem('myduo_fairy_tale_survey_done') !== 'true') {
        const ftStrings = getFairyTaleStrings();
        const stats = StorageService.getStats() || {};
        const completedCount = (stats.lessonsCompleted) || Object.keys(StorageService.getCompletedLessons() || {}).length || 0;
        const bannerTitle = (completedCount >= 3 && ftStrings.congratsTitle) ? ftStrings.congratsTitle : ftStrings.title;
        const bannerBadge = (completedCount >= 3 && ftStrings.congratsBadge) ? ftStrings.congratsBadge : ftStrings.badge;
        html += `
            <div class="summary-fairy-tale-banner" id="summary-fairy-tale-banner" style="margin: 16px 0 8px; padding: 12px 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(234, 88, 12, 0.18) 100%); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: transform 0.12s ease;">
                <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
                    <span style="font-size: 26px;">🎁</span>
                    <div>
                        <div style="font-size: 13.5px; font-weight: 800; color: #fef08a;">${bannerBadge}</div>
                        <div style="font-size: 12px; color: #cbd5e1; margin-top: 1px;">${bannerTitle}</div>
                    </div>
                </div>
                <span style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 10px; white-space: nowrap; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);">▶</span>
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
    
    try {
        const stats = StorageService.getStats() || {};
        const completedLessonsMap = StorageService.getCompletedLessons() || {};
        const completedCount = (stats.lessonsCompleted) || Object.keys(completedLessonsMap).length || 0;
        const isSurveyDone = typeof localStorage !== 'undefined' && localStorage.getItem('myduo_fairy_tale_survey_done') === 'true';

        if (!isSurveyDone && completedCount >= 3) {
            if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('myduo_ft_survey_auto_shown')) {
                sessionStorage.setItem('myduo_ft_survey_auto_shown', 'true');
                setTimeout(() => {
                    showFairyTaleSurveyModal('auto_lesson_3');
                }, 850);
            }
        } else if (isSurveyDone) {
            const streak = StorageService.getStreak() || 0;
            checkAndPromptReviewFunnel('summary', { streak, accuracy });
        }
    } catch (e) {}
    
    const continueBtn = container.querySelector('.summary-continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const event = new CustomEvent('back-to-path');
            document.dispatchEvent(event);
        });
    }

    const ftBanner = container.querySelector('#summary-fairy-tale-banner');
    if (ftBanner) {
        ftBanner.addEventListener('click', () => {
            showFairyTaleSurveyModal('lesson_summary');
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
