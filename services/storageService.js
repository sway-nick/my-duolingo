class StorageServiceImpl {
  constructor() {
    this.prefix = 'dl_';
  }

  _get(key, defaultValue) {
    const val = localStorage.getItem(this.prefix + key);
    if (val === null) return defaultValue;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }

  _set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  // User profile
  getProfile() {
    return this._get('profile', { name: 'Студент', avatar: '👨‍🎓' });
  }
  updateProfile(data) {
    this._set('profile', { ...this.getProfile(), ...data });
  }

  // XP and Level
  getXP() {
    return this._get('xp', 0);
  }
  addXP(amount) {
    this._set('xp', this.getXP() + amount);
  }
  getLevel() {
    const xp = this.getXP();
    return Math.floor(xp / 100) + 1;
  }
  getLevelProgress() {
    const xp = this.getXP();
    const current = xp % 100;
    const needed = 100;
    return { current, needed, percentage: (current / needed) * 100 };
  }

  // Hearts
  getHeartsData() {
    return this._get('hearts_data', { hearts: 5, lastHeartLostTime: null });
  }
  getMaxHearts() {
    return 5;
  }
  getHearts() {
    const data = this.getHeartsData();
    if (data.hearts < this.getMaxHearts() && data.lastHeartLostTime) {
      const now = Date.now();
      const diffMs = now - data.lastHeartLostTime;
      const refillMs = 30 * 60 * 1000; // 30 minutes per heart
      const refilled = Math.floor(diffMs / refillMs);
      
      if (refilled > 0) {
        data.hearts = Math.min(this.getMaxHearts(), data.hearts + refilled);
        if (data.hearts === this.getMaxHearts()) {
          data.lastHeartLostTime = null;
        } else {
          data.lastHeartLostTime += refilled * refillMs;
        }
        this._set('hearts_data', data);
      }
    }
    return data.hearts;
  }
  loseHeart() {
    const data = this.getHeartsData();
    if (data.hearts > 0) {
      if (data.hearts === this.getMaxHearts()) {
        data.lastHeartLostTime = Date.now();
      }
      data.hearts -= 1;
      this._set('hearts_data', data);
    }
  }
  refillHearts() {
    this._set('hearts_data', { hearts: this.getMaxHearts(), lastHeartLostTime: null });
  }

  // Streak
  getStreakData() {
    return this._get('streak_data', { streak: 0, lastStudyDate: null });
  }
  getStreak() {
    return this.getStreakData().streak;
  }
  getLastStudyDate() {
    return this.getStreakData().lastStudyDate;
  }
  checkAndUpdateStreak() {
    const data = this.getStreakData();
    const today = new Date().toISOString().split('T')[0];
    
    if (data.lastStudyDate === today) {
      return data.streak; // Already studied today
    }
    
    if (data.lastStudyDate) {
      const lastDate = new Date(data.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        data.streak += 1;
      } else if (diffDays > 1) {
        data.streak = 1; // Reset streak
      }
    } else {
      data.streak = 1;
    }
    
    data.lastStudyDate = today;
    this._set('streak_data', data);
    return data.streak;
  }

  // Word progress (SRS)
  getAllWordProgress() {
    return this._get('word_progress', {});
  }
  getWordProgress(wordId) {
    const all = this.getAllWordProgress();
    return all[wordId] || { wordId, box: 0, correctCount: 0, wrongCount: 0, lastReviewed: null, nextReview: Date.now() };
  }
  updateWordProgress(wordId, correct) {
    const all = this.getAllWordProgress();
    const progress = this.getWordProgress(wordId);
    const intervals = [0, 1, 3, 7, 14, 30]; // days
    
    progress.lastReviewed = Date.now();
    
    if (correct) {
      progress.correctCount += 1;
      progress.box = Math.min(progress.box + 1, intervals.length - 1);
    } else {
      progress.wrongCount += 1;
      progress.box = Math.max(0, progress.box - 1); // Or reset to 1 as per Leitner, but let's drop by 1 or go to box 1. Requirement says box 1.
      if (progress.box === 0) progress.box = 1;
    }
    
    const nextReviewDays = intervals[progress.box];
    progress.nextReview = Date.now() + nextReviewDays * 24 * 60 * 60 * 1000;
    
    all[wordId] = progress;
    this._set('word_progress', all);
  }
  getWordsForReview() {
    const all = this.getAllWordProgress();
    const now = Date.now();
    return Object.values(all).filter(p => p.nextReview <= now).map(p => p.wordId);
  }
  getMasteredWordsCount() {
    const all = this.getAllWordProgress();
    // Consider mastered if box >= 4 (14+ days interval)
    return Object.values(all).filter(p => p.box >= 4).length;
  }

  // Lesson progress
  getCompletedLessons() {
    return this._get('completed_lessons', {});
  }
  getLessonProgress(lessonId) {
    const completed = this.getCompletedLessons();
    return completed[lessonId] || { completed: false, score: 0, stars: 0 };
  }
  completeLession(lessonId, results) {
    const completed = this.getCompletedLessons();
    completed[lessonId] = {
      completed: true,
      score: results.score || 0,
      stars: results.stars || 3,
      date: Date.now()
    };
    this._set('completed_lessons', completed);
    this.refillHearts();
    
    let stats = this.getStats();
    stats.lessonsCompleted = (stats.lessonsCompleted || 0) + 1;
    if (results.perfect) stats.perfectLessons = (stats.perfectLessons || 0) + 1;
    this._set('stats', stats);
  }
  isLessonUnlocked(lessonId) {
    // Basic logic: a lesson is unlocked if it's the first in a category, 
    // or if the previous lesson in the same category is completed.
    // Assuming requiredXp is checked elsewhere, or simply checking XP here:
    // But for a generic function, let's just return true for simplicity or implement it properly if needed.
    return true; 
  }

  // Favorites
  getFavorites() {
    return this._get('favorites', []);
  }
  toggleFavorite(wordId) {
    let favs = this.getFavorites();
    if (favs.includes(wordId)) {
      favs = favs.filter(id => id !== wordId);
    } else {
      favs.push(wordId);
    }
    this._set('favorites', favs);
    return favs.includes(wordId);
  }
  isFavorite(wordId) {
    return this.getFavorites().includes(wordId);
  }

  // Stats
  getStats() {
    return this._get('stats', { lessonsCompleted: 0, perfectLessons: 0, fastestLesson: 9999, nightStudy: 0, morningStudy: 0 });
  }
  recordSession(sessionData) {
    const stats = this.getStats();
    if (sessionData.duration && sessionData.duration < stats.fastestLesson) {
      stats.fastestLesson = sessionData.duration;
    }
    
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 4) stats.nightStudy = (stats.nightStudy || 0) + 1;
    if (hour >= 4 && hour < 7) stats.morningStudy = (stats.morningStudy || 0) + 1;
    
    this._set('stats', stats);
  }
  getTodayStats() {
    // stub for daily activity
    return { xp: 0, timeSpent: 0 };
  }
  getWeeklyActivity() {
    return this._get('weekly_activity', {}); // Map of dateStr -> count
  }

  // Achievements
  getUnlockedAchievements() {
    return this._get('unlocked_achievements', []);
  }
  checkAchievements() {
    // Logic to unlock based on conditions would go here.
    // For now we just return current unlocked.
    return this.getUnlockedAchievements();
  }

  // Settings
  getSettings() {
    return this._get('settings', { 
      theme: 'light', 
      soundEnabled: true, 
      speechRate: 1.0, 
      apiUrl: 'https://script.google.com/macros/s/AKfycby0lLhpcGJOddZ6L64_D5i14zcU1ZdCtkgA3sj1G9w36eelkGPP4M6k2iTZekTGFAHhFg/exec', 
      dailyGoal: 10 
    });
  }
  updateSettings(data) {
    this._set('settings', { ...this.getSettings(), ...data });
  }

  // Aliases for compatibility
  checkStreak() {
    return this.checkAndUpdateStreak();
  }
  completeLesson(lessonId, results = {}) {
    return this.completeLession(lessonId, results);
  }
  getProgress() {
    const completed = this.getCompletedLessons();
    const completedList = Array.isArray(completed) ? completed : Object.keys(completed);
    return {
      completedLessons: completedList,
      dailyCompleted: this._get('daily_completed', 0)
    };
  }

  // Reset
  resetAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  }
}

export const StorageService = new StorageServiceImpl();
export default StorageService;
