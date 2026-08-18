import { getCurrentUser, getEffectiveUserId } from './authService.js?v=16.0';

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

let cachedWordsList = null;

async function getWords(forceRefresh = false) {
  if (!forceRefresh && cachedWordsList && cachedWordsList.length > 0) {
    return { success: true, data: cachedWordsList };
  }

  // Check localStorage cache first for instant startup
  if (!forceRefresh) {
    try {
      const localCached = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
      if (Array.isArray(localCached) && localCached.length > 0) {
        cachedWordsList = localCached;
        // Asynchronously refresh in background without blocking UI
        fetch(`${API_URL}?route=words`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
              cachedWordsList = data.data;
              localStorage.setItem('myduo_cached_words', JSON.stringify(data.data));
            }
          })
          .catch(() => {});
        return { success: true, data: cachedWordsList };
      }
    } catch (e) {}
  }

  try {
    const response = await fetch(`${API_URL}?route=words`);
    const data = await response.json();
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      cachedWordsList = data.data;
      try {
        localStorage.setItem('myduo_cached_words', JSON.stringify(data.data));
      } catch (e) {}
      return data;
    }
  } catch (error) {
    console.warn('API error, using default word list', error);
  }
  return { success: true, data: cachedWordsList || MOCK_WORDS };
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

async function googleAuthUser(email, name, avatar) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = (name || cleanEmail.split('@')[0]).trim();

  // 1. Try POST to Google Apps Script backend
  try {
    const response = await fetch(`${API_URL}?route=google_auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        route: 'google_auth',
        action: 'google_auth',
        email: cleanEmail,
        name: cleanName,
        avatar: avatar || '',
      }),
    });
    const res = await response.json();
    if (res && res.success && res.data?.user) {
      saveLocalUser({ ...res.data.user, password: 'google_oauth_pass' });
      return res;
    }
    if (res && res.error) {
      throw new Error(res.error);
    }
  } catch (e) {
    console.warn('POST google_auth fallback to GET query string', e);
  }

  // 2. Try GET query string fallback
  try {
    const getUrl = `${API_URL}?route=google_auth&action=google_auth&email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}&avatar=${encodeURIComponent(avatar || '')}`;
    const response = await fetch(getUrl);
    const res = await response.json();
    if (res && res.success && res.data?.user) {
      saveLocalUser({ ...res.data.user, password: 'google_oauth_pass' });
      return res;
    }
    if (res && res.error) {
      throw new Error(res.error);
    }
  } catch (e) {
    console.warn('Backend google_auth offline, fallback to local', e);
  }

  // 3. Local fallback if completely offline
  const localUsers = getLocalUsers();
  let user = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: 'u_' + Date.now(),
      email: cleanEmail,
      name: cleanName,
      password: 'google_oauth_pass',
    };
    saveLocalUser(user);
  }

  return {
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name || cleanName },
      token: 'tok_' + user.id,
    },
  };
}

function getIsoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getUserWeeklyXP(userId = null, weekKey = null) {
  const uId = userId || getEffectiveUserId();
  const wKey = weekKey || getIsoWeekKey();
  const key = `xp_${uId}_${wKey}`;
  return Math.max(0, Number(localStorage.getItem(key) || 0));
}

function addWeeklyXP(delta, userId = null, weekKey = null) {
  const uId = userId || getEffectiveUserId();
  const wKey = weekKey || getIsoWeekKey();
  const key = `xp_${uId}_${wKey}`;
  const current = Math.max(0, Number(localStorage.getItem(key) || 0));
  const next = Math.max(0, current + delta);
  localStorage.setItem(key, String(next));

  // Sync to backend asynchronously
  const user = getCurrentUser();
  const userName = user && user.name ? user.name : 'Гость';
  const avatar = localStorage.getItem(`avatar_${uId}`) || (user && user.avatar) || '';

  syncWeeklyXpApi(uId, wKey, next, userName, avatar);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: next, delta } }));
  }

  return { currentXP: next, delta };
}

async function syncWeeklyXpApi(userId, weekKey, xp, name, avatar) {
  try {
    fetch(`${API_URL}?route=leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ route: 'leaderboard', action: 'leaderboard', userId, weekKey, xp, name, avatar }),
    }).catch(() => {});
  } catch (e) {}
}

function getCachedLeaderboard(weekKey = null) {
  const wKey = weekKey || getIsoWeekKey();
  const currentUser = getCurrentUser();
  const currentUserId = getEffectiveUserId();
  const userXP = getUserWeeklyXP(currentUserId, wKey);
  const userAvatar = localStorage.getItem(`avatar_${currentUserId}`) || (currentUser && currentUser.avatar) || '';
  const userName = currentUser && currentUser.name ? currentUser.name : 'Вы (Гость)';

  let list = [];
  try {
    const raw = localStorage.getItem(`cache_leaderboard_${wKey}`);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  if (!list || list.length === 0) {
    // Engaging realistic initial league participants
    list = [
      { userId: 'bot_1', name: 'Alex Smith', avatar: './assets/avatars/avatar_1.png', xp: 54 },
      { userId: 'bot_2', name: 'Elena Petrova', avatar: './assets/avatars/avatar_3.png', xp: 42 },
      { userId: 'bot_3', name: 'Mark Davis', avatar: './assets/avatars/avatar_6.png', xp: 35 },
      { userId: 'bot_4', name: 'Anna Novak', avatar: './assets/avatars/avatar_8.png', xp: 28 },
      { userId: 'bot_5', name: 'Dmitry K.', avatar: './assets/avatars/avatar_11.png', xp: 21 },
      { userId: 'bot_6', name: 'Sophie L.', avatar: './assets/avatars/avatar_14.png', xp: 16 },
      { userId: 'bot_7', name: 'John Doe', avatar: './assets/avatars/avatar_2.png', xp: 11 },
      { userId: 'bot_8', name: 'Maria Ivanova', avatar: './assets/avatars/avatar_15.png', xp: 6 },
    ];
  }

  // Merge current user's profile and live XP
  const myIdx = list.findIndex((u) => String(u.userId) === String(currentUserId));
  if (myIdx >= 0) {
    list[myIdx].xp = Math.max(Number(list[myIdx].xp || 0), userXP);
    list[myIdx].name = userName;
    if (userAvatar) list[myIdx].avatar = userAvatar;
    list[myIdx].isCurrentUser = true;
  } else {
    list.push({
      userId: currentUserId,
      name: userName,
      avatar: userAvatar,
      xp: userXP,
      isCurrentUser: true,
    });
  }

  // Sort descending by XP
  list.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));

  return { success: true, data: list, weekKey: wKey, userXP };
}

async function getLeaderboard(weekKey = null) {
  const wKey = weekKey || getIsoWeekKey();
  const cached = getCachedLeaderboard(wKey);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_URL}?route=leaderboard&weekKey=${wKey}`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      localStorage.setItem(`cache_leaderboard_${wKey}`, JSON.stringify(data.data));
      return getCachedLeaderboard(wKey);
    }
  } catch (e) {
    // Graceful fallback to instant cache on network timeout
  }

  return cached;
}

function getUserProgress() {
  const userId = getEffectiveUserId();
  const key = `progress_${userId}`;
  return JSON.parse(localStorage.getItem(key) || '{}');
}

async function saveProgress(wordId, isCorrect, method = 'cards', options = {}) {
  const userId = getEffectiveUserId();

  const key = `progress_${userId}`;
  const local = JSON.parse(localStorage.getItem(key) || '{}');
  if (!local[wordId]) {
    local[wordId] = {
      correct: 0,
      error: 0,
      quizCorrect: 0,
      pairsCorrect: 0,
      inputCorrect: 0,
      seenInCards: false,
      hardCount: 0,
      mastered: false,
      masteredAt: null,
      lastPracticed: 0,
    };
  }

  const prog = local[wordId];
  prog.lastPracticed = Date.now();
  let autoFavorited = false;

  // Calculate XP change based on mode and correctness
  let xpDelta = 0;

  if (method === 'cards_learn') {
    prog.seenInCards = true;
    prog.stage = 'quiz';
    if (!prog.quizCorrect) prog.quizCorrect = 0;
  } else if (method === 'cards_know') {
    prog.seenInCards = true;
    prog.quizCorrect = Math.max(prog.quizCorrect || 0, 5);
    prog.stage = 'pairs';
    if (!prog.pairsCorrect) prog.pairsCorrect = 0;
  } else if (method === 'cards') {
    prog.seenInCards = true;
    if (!isCorrect) {
      prog.hardCount = (prog.hardCount || 0) + 1;
      if (prog.hardCount >= 3) {
        await toggleFavoriteApi(wordId, true);
        autoFavorited = true;
      }
    }
  } else if (method === 'quiz') {
    if (isCorrect) {
      prog.correct = (prog.correct || 0) + 1;
      prog.quizCorrect = (prog.quizCorrect || 0) + 1;
      if (prog.quizCorrect >= 5) {
        prog.stage = 'pairs';
      }
      xpDelta = 1; // +1 XP for correct quiz answer
    } else {
      prog.error = (prog.error || 0) + 1;
      xpDelta = -5; // -5 XP for wrong quiz answer
    }
  } else if (method === 'pairs') {
    if (isCorrect) {
      prog.correct = (prog.correct || 0) + 1;
      prog.pairsCorrect = (prog.pairsCorrect || 0) + 1;
      if (prog.pairsCorrect >= 2) {
        prog.stage = 'test';
      }
      if (options && options.perfectRound) {
        xpDelta = 3; // +3 XP for complete group of pairs without mistakes
      }
    } else {
      prog.error = (prog.error || 0) + 1;
      xpDelta = -5; // -5 XP for mistake in pairs
    }
  } else if (method === 'input') {
    if (isCorrect) {
      prog.correct = (prog.correct || 0) + 1;
      prog.inputCorrect = (prog.inputCorrect || 0) + 1;
      if (prog.inputCorrect >= 3) {
        prog.mastered = true;
        if (!prog.masteredAt) {
          prog.masteredAt = Date.now();
        }
        prog.stage = 'mastered';
      }
      xpDelta = 3; // +3 XP for correct word typing
    } else {
      prog.error = (prog.error || 0) + 1;
      prog.inputMistakes = (prog.inputMistakes || 0) + 1;
      if (prog.inputMistakes >= 2) {
        await toggleFavoriteApi(wordId, true);
        autoFavorited = true;
      }
      xpDelta = -5; // -5 XP for wrong word typing
    }
  }

  let xpInfo = null;
  if (xpDelta !== 0) {
    xpInfo = addWeeklyXP(xpDelta, userId);
  }

  localStorage.setItem(key, JSON.stringify(local));

  pendingProgressQueue.push({
    route: 'progress',
    action: 'progress',
    userId,
    wordId,
    isCorrect,
    method,
    quizCorrect: prog.quizCorrect || 0,
    pairsCorrect: prog.pairsCorrect || 0,
    inputCorrect: prog.inputCorrect || 0,
    seenInCards: prog.seenInCards || false,
    hardCount: prog.hardCount || 0,
    mastered: prog.mastered || false,
    masteredAt: prog.masteredAt || null,
    lastPracticed: prog.lastPracticed,
    xpDelta,
  });

  if (pendingProgressQueue.length >= 5) {
    flushProgressQueue();
  }

  return { ...prog, autoFavorited };
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

function getUserFavorites() {
  const userId = getEffectiveUserId();
  const key = `favs_${userId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

async function toggleFavoriteApi(wordId, isFavorite) {
  const userId = getEffectiveUserId();
  const key = `favs_${userId}`;
  const favs = JSON.parse(localStorage.getItem(key) || '[]');
  const wordIdStr = String(wordId);
  const exists = favs.map(String).includes(wordIdStr);

  if (isFavorite && !exists) {
    favs.push(wordId);
  } else if (!isFavorite && exists) {
    const idx = favs.map(String).indexOf(wordIdStr);
    if (idx >= 0) favs.splice(idx, 1);
  }
  localStorage.setItem(key, JSON.stringify(favs));

  try {
    await fetch(`${API_URL}?route=favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ route: 'favorite', action: 'favorite', userId, wordId, isFavorite }),
    });
  } catch (e) {
    console.warn('Favorite saved locally, remote sync pending:', e);
  }
}

function isWordMastered(prog) {
  if (!prog) return false;
  return Boolean(
    prog.mastered === true ||
    (prog.inputCorrect !== undefined && Number(prog.inputCorrect) >= 3)
  );
}

function isWordLearning(prog) {
  if (!prog || isWordMastered(prog)) return false;
  return Boolean(prog.seenInCards === true);
}

function getWordStage(prog) {
  if (!prog) return 'new';
  if (isWordMastered(prog)) return 'mastered';
  if ((prog.pairsCorrect || 0) >= 2) return 'test';
  if ((prog.quizCorrect || 0) >= 5) return 'pairs';
  if (prog.seenInCards) return 'quiz';
  return 'new';
}

function getQueueForCards(words, progress) {
  return words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return !p?.seenInCards && !isWordMastered(p);
  });
}

function getQueueForQuiz(words, progress, favorites = []) {
  const base = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return p?.seenInCards && (p.quizCorrect || 0) < 5 && !isWordMastered(p);
  });

  if (!favorites || favorites.length === 0 || base.length === 0) {
    return base;
  }

  const favSet = new Set(favorites.map(String));
  const candidateFavs = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return favSet.has(String(w.id)) && !base.some((bw) => String(bw.id) === String(w.id)) && !isWordMastered(p);
  });

  // Sort candidate favorites by lastPracticed ASC (oldest practiced first, then newer)
  candidateFavs.sort((a, b) => {
    const pA = progress[a.id] || progress[String(a.id)];
    const pB = progress[b.id] || progress[String(b.id)];
    const tA = pA?.lastPracticed || 0;
    const tB = pB?.lastPracticed || 0;
    return tA - tB;
  });

  const favCount = Math.max(1, Math.round(base.length * 0.15));
  const injectedFavs = candidateFavs.slice(0, favCount);

  return [...base, ...injectedFavs];
}

function getQueueForPairs(words, progress, favorites = []) {
  const base = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return (p?.quizCorrect || 0) >= 5 && (p?.pairsCorrect || 0) < 2 && !isWordMastered(p);
  });

  if (!favorites || favorites.length === 0 || base.length === 0) {
    return base;
  }

  const favSet = new Set(favorites.map(String));
  const candidateFavs = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return favSet.has(String(w.id)) && !base.some((bw) => String(bw.id) === String(w.id)) && !isWordMastered(p);
  });

  // Sort candidate favorites by lastPracticed ASC (oldest practiced first, then newer)
  candidateFavs.sort((a, b) => {
    const pA = progress[a.id] || progress[String(a.id)];
    const pB = progress[b.id] || progress[String(b.id)];
    const tA = pA?.lastPracticed || 0;
    const tB = pB?.lastPracticed || 0;
    return tA - tB;
  });

  const favCount = Math.max(1, Math.round(base.length * 0.15));
  const injectedFavs = candidateFavs.slice(0, favCount);

  return [...base, ...injectedFavs];
}

function getQueueForTest(words, progress) {
  return words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return (p?.pairsCorrect || 0) >= 2 && (p?.inputCorrect || 0) < 3 && !isWordMastered(p);
  });
}

async function getUserStats(customWords = null) {
  const userId = getEffectiveUserId();
  const key = `progress_${userId}`;
  const localProg = JSON.parse(localStorage.getItem(key) || '{}');

  let wordsList = customWords;
  if (!wordsList || wordsList.length === 0) {
    if (cachedWordsList && cachedWordsList.length > 0) {
      wordsList = cachedWordsList;
    } else {
      const allWordsRes = await getWords();
      wordsList = allWordsRes.data || MOCK_WORDS;
    }
  }

  let masteredCount = 0;
  let learningCount = 0;
  let correct = 0;
  let errors = 0;

  Object.entries(localProg).forEach(([wordId, prog]) => {
    correct += prog.correct || 0;
    errors += prog.error || 0;
    if (isWordMastered(prog)) {
      masteredCount += 1;
    } else if (isWordLearning(prog)) {
      learningCount += 1;
    }
  });

  const totalAttempted = Object.keys(localProg).length;
  const accuracy = correct + errors > 0 ? Math.round((correct / (correct + errors)) * 100) : 0;

  const categoryMap = {};
  wordsList.forEach((w) => {
    const cat = w.category ? String(w.category).replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '').trim() : 'Общие';
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, learned: 0 };
    categoryMap[cat].total += 1;
    const prog = localProg[w.id] || localProg[String(w.id)];
    if (isWordMastered(prog)) {
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
    totalAnswers: correct + errors,
    correctAnswers: correct,
    accuracy,
    streakDays: 1,
    categoryBreakdown,
  };
}

async function getUserSettings() {
  const userId = getEffectiveUserId();
  const key = `settings_${userId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.dailyGoal === 10 || !parsed.dailyGoal) {
        parsed.dailyGoal = 20;
      }
      return {
        userId,
        dailyGoal: 20,
        theme: 'light',
        level: 'All',
        category: 'All',
        preferredMethod: 'quiz',
        ...parsed,
      };
    } catch (e) {}
  }
  return {
    userId,
    dailyGoal: 20,
    theme: 'light',
    level: 'All',
    category: 'All',
    preferredMethod: 'quiz',
  };
}

async function saveUserSettings(settings) {
  const userId = getEffectiveUserId();
  const payload = {
    route: 'settings',
    action: 'settings',
    ...settings,
    preferredMethod: settings.preferredMethod || 'quiz',
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

function resetWordsProgressForPractice(words) {
  const userId = getEffectiveUserId();
  const progressKey = `progress_${userId}`;
  const localProg = JSON.parse(localStorage.getItem(progressKey) || '{}');
  if (Array.isArray(words)) {
    words.forEach((w) => {
      const id = w.id || w;
      localProg[id] = {
        ...(localProg[id] || {}),
        seenInCards: true,
        quizCorrect: 0,
        pairsCorrect: 0,
        inputCorrect: 0,
        mastered: false,
      };
    });
  }
  localStorage.setItem(progressKey, JSON.stringify(localProg));
  return localProg;
}

export {
  getHealth,
  getWords,
  registerUser,
  loginUser,
  googleAuthUser,
  saveProgress,
  getUserProgress,
  getUserFavorites,
  isWordMastered,
  isWordLearning,
  getWordStage,
  getQueueForCards,
  getQueueForQuiz,
  getQueueForPairs,
  getQueueForTest,
  flushProgressQueue,
  toggleFavoriteApi,
  getUserStats,
  getUserSettings,
  saveUserSettings,
  resetWordsProgressForPractice,
  getEffectiveUserId,
  getLeaderboard,
  getCachedLeaderboard,
  getUserWeeklyXP,
  addWeeklyXP,
  getIsoWeekKey,
};
