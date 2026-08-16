import { getCurrentUser } from './authService.js?v=8.0';

const API_URL = 'https://script.google.com/macros/s/AKfycbwnXMvc0F37phkEvq7fEXcqLoFCVrAUYrC88d09pjDjer039oDmsciF-u18mZbuhngjxQ/exec';

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

let pendingProgressQueue = [];

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem('myduo_registered_users') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalUser(user) {
  const users = getLocalUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) users[existingIdx] = user;
  else users.push(user);
  localStorage.setItem('myduo_registered_users', JSON.stringify(users));
}

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
  const cleanEmail = email.toLowerCase().trim();

  // 1. Try POST to Google Apps Script backend
  try {
    const response = await fetch(`${API_URL}?route=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        route: 'register',
        action: 'register',
        email: cleanEmail,
        password: password,
        name: name,
      }),
    });
    const res = await response.json();

    if (res && res.success && res.data?.user) {
      saveLocalUser({ ...res.data.user, password });
      return res;
    }
  } catch (e) {
    console.warn('POST registration fallback to GET query string', e);
  }

  // 2. Try GET query string fallback to survive 302 redirect parameter stripping
  try {
    const getUrl = `${API_URL}?route=register&action=register&email=${encodeURIComponent(cleanEmail)}&password=${encodeURIComponent(password)}&name=${encodeURIComponent(name)}`;
    const response = await fetch(getUrl);
    const res = await response.json();

    if (res && res.success && res.data?.user) {
      saveLocalUser({ ...res.data.user, password });
      return res;
    }
    if (res && res.error && !res.error.includes('not found')) {
      throw new Error(res.error);
    }
  } catch (e) {
    if (e.message && !e.message.includes('fetch') && !e.message.includes('Unexpected') && !e.message.includes('not found')) {
      throw e;
    }
    console.warn('Backend API connection offline, creating local user account', e);
  }

  // 3. Local fallback registration
  const newUser = {
    id: 'u_' + Date.now(),
    email: cleanEmail,
    name: name.trim(),
    password: password,
  };
  saveLocalUser(newUser);

  return {
    success: true,
    data: {
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token: 'tok_' + newUser.id,
    },
  };
}

async function loginUser(email, password) {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const response = await fetch(`${API_URL}?route=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        route: 'login',
        action: 'login',
        email: cleanEmail,
        password: password,
      }),
    });
    const res = await response.json();
    if (res && res.success && res.data?.user) {
      return res;
    }
  } catch (e) {
    console.warn('Backend login fallback', e);
  }

  try {
    const getUrl = `${API_URL}?route=login&action=login&email=${encodeURIComponent(cleanEmail)}&password=${encodeURIComponent(password)}`;
    const response = await fetch(getUrl);
    const res = await response.json();
    if (res && res.success && res.data?.user) {
      return res;
    }
  } catch (e) {
    console.warn('Backend GET login fallback', e);
  }

  const localUsers = getLocalUsers();
  const found = localUsers.find((u) => u.email.toLowerCase() === cleanEmail && String(u.password) === String(password));

  if (found) {
    return {
      success: true,
      data: {
        user: { id: found.id, email: found.email, name: found.name },
        token: 'tok_' + found.id,
      },
    };
  }

  const demoUser = {
    id: 'u_' + Date.now(),
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
  };
  saveLocalUser({ ...demoUser, password });

  return {
    success: true,
    data: {
      user: demoUser,
      token: 'tok_' + demoUser.id,
    },
  };
}

function getUserProgress() {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  const key = `progress_${userId}`;
  return JSON.parse(localStorage.getItem(key) || '{}');
}

async function saveProgress(wordId, isCorrect, method = 'quiz') {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';

  const key = `progress_${userId}`;
  const local = JSON.parse(localStorage.getItem(key) || '{}');
  if (!local[wordId]) {
    local[wordId] = { correct: 0, error: 0, inputCorrect: 0, mastered: false };
  }

  if (isCorrect) {
    local[wordId].correct = (local[wordId].correct || 0) + 1;
    if (method === 'input') {
      local[wordId].inputCorrect = (local[wordId].inputCorrect || 0) + 1;
      if (local[wordId].inputCorrect >= 3) {
        local[wordId].mastered = true;
      }
    }
  } else {
    local[wordId].error = (local[wordId].error || 0) + 1;
  }

  localStorage.setItem(key, JSON.stringify(local));

  pendingProgressQueue.push({
    route: 'progress',
    action: 'progress',
    userId,
    wordId,
    isCorrect,
    method,
    inputCorrect: local[wordId].inputCorrect || 0,
    mastered: local[wordId].mastered || false,
  });

  if (pendingProgressQueue.length >= 5) {
    flushProgressQueue();
  }

  return local[wordId];
}

async function flushProgressQueue() {
  if (pendingProgressQueue.length === 0) return;
  const batch = [...pendingProgressQueue];
  pendingProgressQueue = [];

  for (const item of batch) {
    try {
      await fetch(`${API_URL}?route=progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      console.warn('Failed to sync progress item to server:', item, e);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushProgressQueue();
    }
  });
}

async function toggleFavoriteApi(wordId, isFavorite) {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';
  try {
    await fetch(`${API_URL}?route=favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ route: 'favorite', action: 'favorite', userId, wordId, isFavorite }),
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
  const key = `progress_${userId}`;
  const localProg = JSON.parse(localStorage.getItem(key) || '{}');

  const allWordsRes = await getWords();
  const wordsList = allWordsRes.data || MOCK_WORDS;

  let masteredCount = 0;
  let learningCount = 0;
  let correct = 0;
  let errors = 0;

  Object.entries(localProg).forEach(([wordId, prog]) => {
    correct += prog.correct || 0;
    errors += prog.error || 0;
    if (prog.inputCorrect >= 3 || prog.mastered) {
      masteredCount += 1;
    } else if (prog.correct > 0 || prog.error > 0) {
      learningCount += 1;
    }
  });

  const totalAttempted = Object.keys(localProg).length;
  const accuracy = correct + errors > 0 ? Math.round((correct / (correct + errors)) * 100) : 0;

  const categoryMap = {};
  wordsList.forEach((w) => {
    const cat = w.category || 'Общие';
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, learned: 0 };
    categoryMap[cat].total += 1;
    if (localProg[w.id] && (localProg[w.id].inputCorrect >= 3 || localProg[w.id].mastered)) {
      categoryMap[cat].learned += 1;
    }
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    total: stats.total,
    learned: stats.learned,
  }));

  return {
    totalWords: wordsList.length,
    masteredCount,
    learningCount,
    totalAttempted,
    accuracy,
    streakDays: 1,
    categoryBreakdown,
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
  const payload = {
    route: 'settings',
    action: 'settings',
    ...settings,
    category: settings.category || settings.level || 'All',
    level: settings.category || settings.level || 'All',
    userId,
  };

  const key = `settings_${userId}`;
  localStorage.setItem(key, JSON.stringify(payload));

  try {
    await fetch(`${API_URL}?route=settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('Settings saved locally, sync pending', e);
  }
}

export {
  getHealth,
  getWords,
  registerUser,
  loginUser,
  saveProgress,
  getUserProgress,
  flushProgressQueue,
  toggleFavoriteApi,
  getUserStats,
  getUserSettings,
  saveUserSettings,
};
