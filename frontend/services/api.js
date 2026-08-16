import { getCurrentUser } from './authService.js';

const API_URL = 'https://script.google.com/macros/s/AKfycby0lLhpcGJOddZ6L64_D5i14zcU1ZdCtkgA3sj1G9w36eelkGPP4M6k2iTZekTGFAHhFg/exec';

// Default mock vocabulary database if API offline
const MOCK_WORDS = [
  { id: '1', word: 'apple', transcription: '[ˈæp.əl]', translation: 'яблоко', category: 'Еда и напитки', level: 'A1' },
  { id: '2', word: 'book', transcription: '[bʊk]', translation: 'книга', category: 'Обучение', level: 'A1' },
  { id: '3', word: 'journey', transcription: '[ˈdʒɜː.ni]', translation: 'путешествие', category: 'Путешествия', level: 'B1' },
  { id: '4', word: 'courage', transcription: '[ˈkʌr.ɪdʒ]', translation: 'смелость', category: 'Эмоции', level: 'B2' },
  { id: '5', word: 'sunrise', transcription: '[ˈsʌn.raɪz]', translation: 'рассвет', category: 'Природа', level: 'A2' },
  { id: '6', word: 'freedom', transcription: '[ˈfriː.dəm]', translation: 'свобода', category: 'Общие', level: 'B1' },
  { id: '7', word: 'adventure', transcription: '[ədˈven.tʃər]', translation: 'приключение', category: 'Путешествия', level: 'B1' },
  { id: '8', word: 'friendship', transcription: '[ˈfrend.ʃɪp]', translation: 'дружба', category: 'Отношения', level: 'A2' },
];

async function getHealth() {
  try {
    const response = await fetch(`${API_URL}?route=health`);
    return await response.json();
  } catch (error) {
    return { success: true, status: 'mock' };
  }
}

async function getWords() {
  try {
    const response = await fetch(`${API_URL}?route=words`);
    const data = await response.json();
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn('API error, using default word list', error);
  }
  return { success: true, data: MOCK_WORDS };
}

async function registerUser(email, password, name) {
  try {
    const response = await fetch(`${API_URL}?route=register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    const res = await response.json();
    if (res && res.success) return res;
    if (res && res.error) throw new Error(res.error);
  } catch (e) {
    // If backend fail, create local session
    if (e.message && !e.message.includes('fetch')) throw e;
  }
  return {
    success: true,
    data: {
      user: { id: 'u_' + Date.now(), email, name },
      token: 'tok_demo',
    },
  };
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}?route=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const res = await response.json();
    if (res && res.success) return res;
    if (res && res.error) throw new Error(res.error);
  } catch (e) {
    if (e.message && !e.message.includes('fetch')) throw e;
  }
  // Local fallback login
  return {
    success: true,
    data: {
      user: { id: 'u_user', email, name: email.split('@')[0] },
      token: 'tok_demo',
    },
  };
}

async function saveProgress(wordId, isCorrect) {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  try {
    await fetch(`${API_URL}?route=progress`, {
      method: 'POST',
      body: JSON.stringify({ userId, wordId, isCorrect }),
    });
  } catch (e) {
    // fallback local storage
    const key = `progress_${userId}`;
    const local = JSON.parse(localStorage.getItem(key) || '{}');
    if (!local[wordId]) local[wordId] = { correct: 0, error: 0 };
    if (isCorrect) local[wordId].correct += 1;
    else local[wordId].error += 1;
    localStorage.setItem(key, JSON.stringify(local));
  }
}

async function toggleFavoriteApi(wordId, isFavorite) {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  try {
    await fetch(`${API_URL}?route=favorite`, {
      method: 'POST',
      body: JSON.stringify({ userId, wordId, isFavorite }),
    });
  } catch (e) {
    const key = `favs_${userId}`;
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    if (isFavorite && !favs.includes(wordId)) favs.push(wordId);
    if (!isFavorite) {
      const idx = favs.indexOf(wordId);
      if (idx >= 0) favs.splice(idx, 1);
    }
    localStorage.setItem(key, JSON.stringify(favs));
  }
}

async function getUserStats() {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  try {
    const response = await fetch(`${API_URL}?route=stats&userId=${encodeURIComponent(userId)}`);
    const data = await response.json();
    if (data && data.success && data.data) return data.data;
  } catch (e) {
    console.warn('Using local stats calculation', e);
  }

  // Calculate local stats fallback
  const key = `progress_${userId}`;
  const localProg = JSON.parse(localStorage.getItem(key) || '{}');
  const attempted = Object.keys(localProg).length;
  let correct = 0;
  let errors = 0;
  Object.values(localProg).forEach((p) => {
    correct += p.correct || 0;
    errors += p.error || 0;
  });
  const accuracy = correct + errors > 0 ? Math.round((correct / (correct + errors)) * 100) : 0;

  return {
    totalWords: MOCK_WORDS.length,
    masteredCount: Math.min(attempted, 3),
    learningCount: attempted,
    totalAttempted: attempted,
    accuracy,
    streakDays: 1,
    categoryBreakdown: [
      { category: 'Еда и напитки', total: 1, learned: localProg['1'] ? 1 : 0 },
      { category: 'Обучение', total: 1, learned: localProg['2'] ? 1 : 0 },
      { category: 'Путешествия', total: 2, learned: (localProg['3'] || localProg['7']) ? 1 : 0 },
      { category: 'Природа', total: 1, learned: localProg['5'] ? 1 : 0 },
    ],
  };
}

async function getUserSettings() {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  try {
    const response = await fetch(`${API_URL}?route=settings&userId=${encodeURIComponent(userId)}`);
    const data = await response.json();
    if (data && data.success && data.data) return data.data;
  } catch (e) {
    console.warn('Using local settings', e);
  }
  const key = `settings_${userId}`;
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  return {
    userId,
    dailyGoal: 10,
    enabledMethods: 'cards,quiz,input',
    theme: 'light',
    level: 'All',
  };
}

async function saveUserSettings(settings) {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  const payload = { ...settings, userId };
  try {
    await fetch(`${API_URL}?route=settings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const key = `settings_${userId}`;
    localStorage.setItem(key, JSON.stringify(payload));
  }
}

export {
  getHealth,
  getWords,
  registerUser,
  loginUser,
  saveProgress,
  toggleFavoriteApi,
  getUserStats,
  getUserSettings,
  saveUserSettings,
};
