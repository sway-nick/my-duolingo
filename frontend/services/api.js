import { getCurrentUser, getEffectiveUserId, getGuestId, getDeterministicUserId } from './authService.js?v=200.0';

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
let syncDebounceTimer = null;

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
try {
  const initialCache = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
  if (Array.isArray(initialCache) && initialCache.length > 0) {
    cachedWordsList = initialCache;
  }
} catch (e) {}

function sanitizeTranscriptions(words) {
  if (!Array.isArray(words)) return;
  words.forEach((w) => {
    if (w) {
      let t = String(w.transcription || '').trim();
      if (t) {
        t = t.replace(/^[\/\[]/, '').replace(/[\/\]]$/, '');
        w.transcription = `/${t}/`;
      } else {
        w.transcription = '';
      }
    }
  });
}

function getActiveLang() {
  try {
    return localStorage.getItem('myduo_interface_lang') || 'en';
  } catch (e) {
    return 'en';
  }
}

function applyMultilingualTranslations(words) {
  if (!Array.isArray(words)) return;
  const lang = getActiveLang();
  words.forEach((w) => {
    if (w) {
      if (w.translations && w.translations[lang]) {
        w.translation = w.translations[lang];
      }
      if (w.all_notes && typeof w.all_notes === 'object') {
        w.notes = w.all_notes[lang] || '';
      } else if (lang !== 'ru') {
        w.notes = '';
      }
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('myduo:lang_changed', () => {
    if (cachedWordsList && Array.isArray(cachedWordsList)) {
      applyMultilingualTranslations(cachedWordsList);
      try {
        localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: cachedWordsList }));
    }
  });
}

async function getWords(forceRefresh = false) {
  const sortByZipf = (list) => {
    if (Array.isArray(list)) {
      list.sort((a, b) => (Number(b.zipf) || 0) - (Number(a.zipf) || 0));
    }
  };

  const currentLang = getActiveLang();

  if (!forceRefresh && cachedWordsList && cachedWordsList.length > 0) {
    sanitizeTranscriptions(cachedWordsList);
    applyMultilingualTranslations(cachedWordsList);
    sortByZipf(cachedWordsList);
    return { success: true, data: cachedWordsList };
  }

  // Check localStorage cache first for instant startup
  if (!forceRefresh) {
    try {
      let localCached = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
      const hasMultilingual = Array.isArray(localCached) && localCached.length > 0 && localCached.some((w) => w && w.translations && typeof w.translations === 'object');

      if (!hasMultilingual) {
        // Invalidate legacy cache without translations
        localCached = null;
        localStorage.removeItem('myduo_cached_words');
      }

      if (Array.isArray(localCached) && localCached.length > 0) {
        sanitizeTranscriptions(localCached);
        applyMultilingualTranslations(localCached);
        sortByZipf(localCached);
        cachedWordsList = localCached;
        // Asynchronously refresh in background without blocking UI
        fetch(`${API_URL}?route=words&lang=${currentLang}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
              sanitizeTranscriptions(data.data);
              applyMultilingualTranslations(data.data);
              sortByZipf(data.data);
              cachedWordsList = data.data;
              localStorage.setItem('myduo_cached_words', JSON.stringify(data.data));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: data.data }));
              }
            }
          })
          .catch(() => {});
        return { success: true, data: cachedWordsList };
      }
    } catch (e) {}
  }

  try {
    const response = await fetch(`${API_URL}?route=words&lang=${currentLang}`);
    const data = await response.json();
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      sanitizeTranscriptions(data.data);
      applyMultilingualTranslations(data.data);
      sortByZipf(data.data);
      cachedWordsList = data.data;
      try {
        localStorage.setItem('myduo_cached_words', JSON.stringify(data.data));
      } catch (e) {}
      return data;
    }
  } catch (error) {
    console.warn('API error, using default word list', error);
  }

  const fallbackList = cachedWordsList || MOCK_WORDS;
  sanitizeTranscriptions(fallbackList);
  applyMultilingualTranslations(fallbackList);
  sortByZipf(fallbackList);
  return { success: true, data: fallbackList };
}

async function registerUser(email, password, name) {
  const cleanEmail = email.toLowerCase().trim();
  const deterministicId = getDeterministicUserId(cleanEmail);

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

  // 3. Local fallback registration (using deterministic ID)
  const newUser = {
    id: deterministicId,
    email: cleanEmail,
    name: name.trim(),
    password: password,
  };
  saveLocalUser(newUser);

  // Initialize brand new settings strictly for Elementary cards training
  const initialSettings = {
    userId: deterministicId,
    dailyGoal: 10,
    theme: 'light',
    level: 'Elementary',
    category: 'Elementary',
    preferredMethod: 'cards',
  };
  localStorage.setItem(`settings_${deterministicId}`, JSON.stringify(initialSettings));
  localStorage.setItem('myduo_dict_category', 'Elementary');

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
  const deterministicId = getDeterministicUserId(cleanEmail);

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
        user: { id: found.id || deterministicId, email: found.email, name: found.name },
        token: 'tok_' + (found.id || deterministicId),
      },
    };
  }

  const demoUser = {
    id: deterministicId,
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
  const deterministicId = getDeterministicUserId(cleanEmail);

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

  // 3. Local fallback if completely offline (using deterministic ID)
  const localUsers = getLocalUsers();
  let user = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: deterministicId,
      email: cleanEmail,
      name: cleanName,
      password: 'google_oauth_pass',
    };
    saveLocalUser(user);
  }

  return {
    success: true,
    data: {
      user: { id: user.id || deterministicId, email: user.email, name: user.name || cleanName },
      token: 'tok_' + (user.id || deterministicId),
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
  const current = getUserWeeklyXP(uId, wKey);
  const oldRank = getUserWeeklyRank(uId, wKey);
  const next = Math.max(0, current + delta);
  localStorage.setItem(key, String(next));

  // Sync to backend asynchronously
  const user = getCurrentUser();
  const userName = user && user.name ? user.name : 'Гость';
  const avatar = localStorage.getItem(`avatar_${uId}`) || (user && user.avatar) || '';

  syncWeeklyXpApi(uId, wKey, next, userName, avatar);

  const newRank = getUserWeeklyRank(uId, wKey);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: next, delta } }));

    // Trigger celebration when reaching prize podium (top 4: 1st=💎, 2nd=🥇, 3rd=🥈, 4th=🥉)
    if (newRank && newRank <= 4 && delta > 0) {
      const bestCelebrated = Number(sessionStorage.getItem(`myduo_celebrated_rank_${wKey}_${uId}`) || 999);
      if (newRank < bestCelebrated || (!oldRank || oldRank > 4)) {
        sessionStorage.setItem(`myduo_celebrated_rank_${wKey}_${uId}`, String(newRank));
        window.dispatchEvent(new CustomEvent('myduo:podium_achieved', {
          detail: { rank: newRank, oldRank, xp: next }
        }));
      }
    }
  }

  return { currentXP: next, delta };
}

async function syncWeeklyXpApi(userId, weekKey, xp, name, avatar) {
  if (!userId || !String(userId).startsWith('u_')) return;
  const cleanName = name || 'Гость';
  const cleanAvatar = avatar || '';
  const cleanXp = Math.max(0, Number(xp || 0));

  // 1. Send via POST (text/plain)
  try {
    fetch(`${API_URL}?route=leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ route: 'leaderboard', action: 'leaderboard', userId, weekKey, xp: cleanXp, name: cleanName, avatar: cleanAvatar }),
    }).catch(() => {});
  } catch (e) {}

  try {
    const queryUrl = `${API_URL}?route=leaderboard&action=sync&userId=${encodeURIComponent(userId)}&weekKey=${encodeURIComponent(weekKey)}&xp=${cleanXp}&name=${encodeURIComponent(cleanName)}&avatar=${encodeURIComponent(cleanAvatar)}&_t=${Date.now()}`;
    fetch(queryUrl).catch(() => {});
  } catch (e) {}
}

const BOT_PROFILES = [
  { name: 'Alex Smith', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Elena Petrova', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Mark Davis', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Anna Novak', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Dmitry Kuznetsov', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Sophie Laurent', avatar: './assets/avatars/avatar_14.png' },
  { name: 'John Doe', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Maria Ivanova', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Carlos Mendes', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Emma Watson', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Liam O\'Connor', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Yuki Tanaka', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Oliver Brown', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Chloe Dubois', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Lucas Silva', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Maximilian Becker', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Mia Andersen', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Noah Johnson', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Zoe Martin', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Artem Sokolov', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Isabella Rossi', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Viktor Orlov', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Hannah Schmidt', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Gabriel Santos', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Polina Smirnova', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Daniel Miller', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Laura Garcia', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Sergey Volkov', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Emily Clark', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Mateo Fernandez', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Alina Morozova', avatar: './assets/avatars/avatar_15.png' },
  { name: 'William Taylor', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Camille Bernard', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Ivan Popov', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Freja Nielsen', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Ethan Wright', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Daria Lebedeva', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Leo Moreau', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Victoria Hall', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Ksenia Fedorova', avatar: './assets/avatars/avatar_8.png' },
  { name: 'James Wilson', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Clara Meyer', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Ilya Kozlov', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Sara Lind', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Mason Evans', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Anastasia Romanova', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Hugo Lefebvre', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Evelyn Moore', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Mikhail Pavlov', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Olivia King', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Thomas Anderson', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Ekaterina Volkova', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Benjamin Lee', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Sofia Costa', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Andrey Semenov', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Charlotte Green', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Lucas Bianchi', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Valeria Tarasova', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Henry Adams', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Mila Jansen', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Denis Belov', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Amelia Baker', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Sebastian Wagner', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Kira Vasilyeva', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Jack Campbell', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Astrid Larsson', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Pavel Komarov', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Harper Scott', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Diego Romero', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Alisa Zaytseva', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Samuel Harris', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Elise Fontaine', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Timur Gusev', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Grace Turner', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Felix Weber', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Veronika Danilova', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Arthur Mitchell', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Lina Johansson', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Vadim Solovyov', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Scarlett Phillips', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Oscar Dupont', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Nadezhda Belyakova', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Julian Torres', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Maya Hoffmann', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Roman Kudryavtsev', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Lily Carter', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Matteo Ricci', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Yulia Antonova', avatar: './assets/avatars/avatar_8.png' },
  { name: 'George Kelly', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Ines Ramos', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Grigoriy Melnikov', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Ruby Bennett', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Jonas Braun', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Svetlana Ponomareva', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Louis Leroy', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Eleanor Bailey', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Stanislav Borisov', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Eva Lund', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Leon Schmitt', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Tatiana Makarova', avatar: './assets/avatars/avatar_4.png' }
];

function generateDynamicBots(weekKey) {
  const now = new Date();
  let dayOfWeek = now.getUTCDay();
  if (dayOfWeek === 0) dayOfWeek = 7;
  const hour = now.getUTCHours();

  function hashStr(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  return BOT_PROFILES.map((bot, index) => {
    const userId = 'bot_' + (index + 1);
    const tier = index % 5;
    const maxDaily = [190, 140, 95, 60, 30][tier];
    const minDaily = [70, 40, 20, 5, 0][tier];

    let botXP = 0;
    for (let d = 1; d <= dayOfWeek; d++) {
      const seed = hashStr(weekKey + '_' + userId + '_day_' + d);
      const dayGain = minDaily + (seed % (maxDaily - minDaily + 1));
      if (d < dayOfWeek) {
        botXP += dayGain;
      } else {
        const fraction = Math.min(1.0, Math.max(0.1, (hour + 1) / 21));
        botXP += Math.floor(dayGain * fraction);
      }
    }

    return {
      userId: userId,
      name: bot.name,
      avatar: bot.avatar,
      xp: botXP,
      isBot: true,
    };
  });
}

function getCachedLeaderboard(weekKey = null, period = 'week') {
  const wKey = weekKey || getIsoWeekKey();
  const currentUser = getCurrentUser();
  const currentUserId = getEffectiveUserId();
  const userAvatar = localStorage.getItem(`avatar_${currentUserId}`) || (currentUser && currentUser.avatar) || '';
  const userName = currentUser && currentUser.name ? currentUser.name : 'Вы (Гость)';

  if (period === 'all') {
    let rawList = [];
    try {
      const raw = localStorage.getItem('cache_leaderboard_all');
      if (raw) rawList = JSON.parse(raw);
    } catch (e) {}

    const realPlayers = rawList.filter((u) => !String(u.userId).startsWith('bot_'));
    const dynamicBots = generateDynamicBots(wKey).map((bot) => ({
      userId: bot.userId,
      name: bot.name,
      avatar: bot.avatar,
      xp: Math.floor(bot.xp * 3.5),
      isBot: true,
    }));
    const combined = [...realPlayers, ...dynamicBots];

    let totalLocalXP = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`xp_${currentUserId}_`)) {
          totalLocalXP += Number(localStorage.getItem(k) || 0);
        }
      }
    } catch (e) {}

    const myIdx = combined.findIndex((u) => String(u.userId) === String(currentUserId));
    if (myIdx >= 0) {
      combined[myIdx].xp = Math.max(Number(combined[myIdx].xp || 0), totalLocalXP);
      combined[myIdx].name = userName;
      if (userAvatar) combined[myIdx].avatar = userAvatar;
      combined[myIdx].isCurrentUser = true;
    } else {
      combined.push({
        userId: currentUserId,
        name: userName,
        avatar: userAvatar,
        xp: totalLocalXP,
        isCurrentUser: true,
      });
    }

    combined.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
    return { success: true, data: combined, period: 'all' };
  }

  const userXP = getUserWeeklyXP(currentUserId, wKey);
  let rawList = [];
  try {
    const raw = localStorage.getItem(`cache_leaderboard_${wKey}`);
    if (raw) rawList = JSON.parse(raw);
  } catch (e) {}

  const realPlayers = rawList.filter((u) => !String(u.userId).startsWith('bot_'));
  const dynamicBots = generateDynamicBots(wKey);
  const combined = [...realPlayers, ...dynamicBots];

  const myIdx = combined.findIndex((u) => String(u.userId) === String(currentUserId));
  if (myIdx >= 0) {
    combined[myIdx].xp = Math.max(Number(combined[myIdx].xp || 0), userXP);
    combined[myIdx].name = userName;
    if (userAvatar) combined[myIdx].avatar = userAvatar;
    combined[myIdx].isCurrentUser = true;
  } else {
    combined.push({
      userId: currentUserId,
      name: userName,
      avatar: userAvatar,
      xp: userXP,
      isCurrentUser: true,
    });
  }

  combined.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));

  return { success: true, data: combined, weekKey: wKey, userXP, period: 'week' };
}

function getUserWeeklyRank(userId = null, weekKey = null) {
  const currentUserId = userId || getEffectiveUserId();
  const res = getCachedLeaderboard(weekKey);
  const list = res.data || [];
  const myIdx = list.findIndex((u) => String(u.userId) === String(currentUserId));
  const userXP = getUserWeeklyXP(currentUserId, weekKey);
  if (userXP <= 0 || myIdx < 0) {
    return null;
  }
  return myIdx + 1;
}

function formatCompactXp(xp) {
  const num = Number(xp) || 0;
  if (num < 1000) return String(num);
  if (num < 1_000_000) {
    const kVal = num / 1000;
    const formatted = kVal >= 10 ? Math.round(kVal) : kVal.toFixed(1).replace(/\.0$/, '').replace('.', ',');
    return `${formatted}K`;
  }
  if (num < 1_000_000_000) {
    const mVal = num / 1_000_000;
    const formatted = mVal.toFixed(1).replace(/\.0$/, '').replace('.', ',');
    return `${formatted}M`;
  }
  const bVal = num / 1_000_000_000;
  const formatted = bVal.toFixed(1).replace(/\.0$/, '').replace('.', ',');
  return `${formatted}B`;
}

async function getLeaderboard(weekKey = null, period = 'week') {
  const wKey = weekKey || getIsoWeekKey();
  const currentUserId = getEffectiveUserId();
  const userXP = getUserWeeklyXP(currentUserId, wKey);
  const currentUser = getCurrentUser();
  const userAvatar = localStorage.getItem(`avatar_${currentUserId}`) || (currentUser && currentUser.avatar) || '';
  const userName = currentUser && currentUser.name ? currentUser.name : 'Гость';

  // Automatically ensure current user's local XP & avatar are synced to cloud
  if (userXP > 0 || userAvatar) {
    syncWeeklyXpApi(currentUserId, wKey, userXP, userName, userAvatar);
  }

  let fetchUrl = `${API_URL}?route=leaderboard&weekKey=${wKey}&_t=${Date.now()}`;
  if (period === 'all') {
    fetchUrl = `${API_URL}?route=leaderboard&period=all&_t=${Date.now()}`;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(fetchUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      if (period === 'all') {
        localStorage.setItem('cache_leaderboard_all', JSON.stringify(data.data));
      } else {
        const realPlayers = data.data.filter((u) => !String(u.userId).startsWith('bot_'));
        const dynamicBots = generateDynamicBots(wKey);
        const combined = [...realPlayers, ...dynamicBots];
        combined.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));

        localStorage.setItem(`cache_leaderboard_${wKey}`, JSON.stringify(combined));
      }

      if (period !== 'all') {
        const meOnServer = data.data.find((item) => String(item.userId) === String(currentUserId));
        if (meOnServer) {
          const serverXp = Number(meOnServer.xp || 0);

          // Check if the server value is contaminated (equal to current userXP + maxOtherVal of previous weeks)
          let maxOtherVal = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(`xp_${currentUserId}_`) && k !== `xp_${currentUserId}_${wKey}`) {
              const val = Number(localStorage.getItem(k) || 0);
              if (val > maxOtherVal) maxOtherVal = val;
            }
          }

          if (maxOtherVal > 0 && serverXp === (userXP + maxOtherVal)) {
            // The server value is contaminated! Do NOT restore it.
            // Instead, force sync the correct userXP to the server immediately.
            syncWeeklyXpApi(currentUserId, wKey, userXP, userName, userAvatar);
          } else if (serverXp > userXP) {
            localStorage.setItem(`xp_${currentUserId}_${wKey}`, String(meOnServer.xp));
            window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: serverXp, delta: 0 } }));
          }

          if (meOnServer.avatar && !localStorage.getItem(`avatar_${currentUserId}`)) {
            localStorage.setItem(`avatar_${currentUserId}`, meOnServer.avatar);
            window.dispatchEvent(new CustomEvent('myduo:avatar_changed', { detail: { userId: currentUserId, avatar: meOnServer.avatar } }));
          }
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo:leaderboard_updated', { detail: { data: data.data, period } }));
      }

      return getCachedLeaderboard(wKey, period);
    }
  } catch (e) {
    // Graceful fallback to instant cache on network timeout
  }

  return getCachedLeaderboard(wKey, period);
}

if (typeof window !== 'undefined') {
  window.addEventListener('myduo:avatar_changed', (e) => {
    const uId = (e.detail && e.detail.userId) || getEffectiveUserId();
    const wKey = getIsoWeekKey();
    const currentXp = getUserWeeklyXP(uId, wKey);
    const user = getCurrentUser();
    const userName = user && user.name ? user.name : 'Гость';
    const avatar = (e.detail && typeof e.detail.avatar !== 'undefined')
      ? e.detail.avatar
      : localStorage.getItem(`avatar_${uId}`) || '';
    syncWeeklyXpApi(uId, wKey, currentXp, userName, avatar);
  });
}

function getLocalDateStr(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function recordStudyDay(userId) {
  if (!userId) return;
  try {
    const today = getLocalDateStr(new Date());
    const key = `study_dates_${userId}`;
    const dates = JSON.parse(localStorage.getItem(key) || '[]');
    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem(key, JSON.stringify(dates));
    }
  } catch (e) {}
}

function calculateUserStreak(userId, localProg = {}) {
  const datesSet = new Set();

  // 1. Collect from stored study_dates list
  try {
    const storedDates = JSON.parse(localStorage.getItem(`study_dates_${userId}`) || '[]');
    if (Array.isArray(storedDates)) {
      storedDates.forEach((d) => {
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
          datesSet.add(d);
        }
      });
    }
  } catch (e) {}

  // 2. Collect from all word progress timestamps (lastPracticed, masteredAt)
  if (localProg && typeof localProg === 'object') {
    Object.values(localProg).forEach((p) => {
      if (p && p.lastPracticed && typeof p.lastPracticed === 'number' && p.lastPracticed > 0) {
        datesSet.add(getLocalDateStr(new Date(p.lastPracticed)));
      }
      if (p && p.masteredAt && typeof p.masteredAt === 'number' && p.masteredAt > 0) {
        datesSet.add(getLocalDateStr(new Date(p.masteredAt)));
      }
    });
  }

  // 3. Collect from legacy streak_data if available
  try {
    const legacy = JSON.parse(localStorage.getItem('streak_data') || '{}');
    if (legacy && legacy.lastStudyDate && /^\d{4}-\d{2}-\d{2}$/.test(legacy.lastStudyDate)) {
      datesSet.add(legacy.lastStudyDate);
    }
  } catch (e) {}

  if (datesSet.size === 0) {
    return 0;
  }

  // Persist merged unique dates
  try {
    localStorage.setItem(`study_dates_${userId}`, JSON.stringify(Array.from(datesSet).sort()));
  } catch (e) {}

  const today = getLocalDateStr(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateStr(yesterdayDate);

  // If user hasn't studied today and hasn't studied yesterday, streak is broken
  if (!datesSet.has(today) && !datesSet.has(yesterday)) {
    return 0;
  }

  // Count consecutive days going backwards from anchor (today if studied today, else yesterday)
  let currentCheckDate = new Date();
  if (!datesSet.has(today)) {
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const checkStr = getLocalDateStr(currentCheckDate);
    if (datesSet.has(checkStr)) {
      streak += 1;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getUserProgress() {
  const userId = getEffectiveUserId();
  const key = `progress_${userId}`;
  return JSON.parse(localStorage.getItem(key) || '{}');
}

async function saveProgress(wordId, isCorrect, method = 'cards', options = {}) {
  const userId = getEffectiveUserId();
  recordStudyDay(userId);

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
    if (!isWordMastered(prog)) {
      prog.stage = 'quiz';
      if (!prog.quizCorrect) prog.quizCorrect = 0;
    }
  } else if (method === 'cards_know') {
    prog.seenInCards = true;
    if (!isWordMastered(prog)) {
      prog.quizCorrect = Math.max(prog.quizCorrect || 0, 5);
      prog.stage = 'pairs';
      if (!prog.pairsCorrect) prog.pairsCorrect = 0;
    }
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
      xpDelta = (options && options.skipXp) ? 0 : 1; // +1 XP (or 0 if fallback) for correct quiz answer
    } else {
      prog.error = (prog.error || 0) + 1;
      xpDelta = -5; // -5 XP for wrong quiz answer
    }
  } else if (method === 'pairs') {
    if (isCorrect) {
      prog.correct = (prog.correct || 0) + 1;
      prog.pairsCorrect = (prog.pairsCorrect || 0) + 1;
      if (prog.pairsCorrect >= 1) {
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
      if (options && options.secondChanceFix) {
        // Second chance fix: deduct 1 point as penalty instead of 5
        xpDelta = -1;
        prog.inputMistakes = (prog.inputMistakes || 0) + 1;
      } else {
        prog.correct = (prog.correct || 0) + 1;
        prog.inputCorrect = (prog.inputCorrect || 0) + 1;
        if (prog.inputCorrect >= 2) {
          prog.mastered = true;
          if (!prog.masteredAt) {
            prog.masteredAt = Date.now();
          }
          prog.stage = 'mastered';
        }
        xpDelta = 3; // +3 XP for first-try correct word typing
      }
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

  pushUserDataToCloud(userId);

  return { ...prog, autoFavorited };
}

async function flushProgressQueue() {
  if (pendingProgressQueue.length === 0) return;
  const batch = [...pendingProgressQueue];
  pendingProgressQueue = [];

  for (const item of batch) {
    if (!item.userId || !String(item.userId).startsWith('u_')) {
      continue; // Skip guests from cloud progress sync
    }
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

async function fetchUserDataFromCloud(userId = null, weekKey = null) {
  const uId = userId || getEffectiveUserId();
  if (!uId || !String(uId).startsWith('u_')) return null;

  const wKey = weekKey || getIsoWeekKey();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`${API_URL}?route=sync&userId=${encodeURIComponent(uId)}&weekKey=${encodeURIComponent(wKey)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const res = await response.json();
    if (res && res.success && res.data) {
      const { progress = {}, favorites = [], weeklyXp = 0, avatar = '', settings = null } = res.data;

      // 1. Merge Progress (take highest advancement for each word)
      const progKey = `progress_${uId}`;
      const localProg = JSON.parse(localStorage.getItem(progKey) || '{}');
      const mergedProg = { ...localProg };

      Object.keys(progress).forEach((wordId) => {
        const c = progress[wordId];
        const l = localProg[wordId];
        if (!l) {
          mergedProg[wordId] = c;
        } else {
          mergedProg[wordId] = {
            correct: Math.max(l.correct || 0, c.correct || 0),
            error: Math.max(l.error || 0, c.error || 0),
            quizCorrect: Math.max(l.quizCorrect || 0, c.quizCorrect || 0),
            pairsCorrect: Math.max(l.pairsCorrect || 0, c.pairsCorrect || 0),
            inputCorrect: Math.max(l.inputCorrect || 0, c.inputCorrect || 0),
            seenInCards: Boolean(l.seenInCards || c.seenInCards),
            mastered: Boolean(l.mastered || c.mastered || (Math.max(l.inputCorrect || 0, c.inputCorrect || 0) >= 2)),
            masteredAt: l.masteredAt || c.masteredAt || null,
            lastPracticed: Math.max(l.lastPracticed || 0, c.lastPracticed || 0),
            hardCount: Math.max(l.hardCount || 0, c.hardCount || 0),
          };
        }
      });
      localStorage.setItem(progKey, JSON.stringify(mergedProg));

      // 2. Merge Favorites (union of sets)
      const favKey = `favs_${uId}`;
      const localFavs = JSON.parse(localStorage.getItem(favKey) || '[]');
      const mergedFavs = Array.from(new Set([...localFavs.map(String), ...favorites.map(String)]));
      localStorage.setItem(favKey, JSON.stringify(mergedFavs));

      // 3. Merge Weekly XP (take maximum)
      const xpKey = `xp_${uId}_${wKey}`;
      const localXp = Number(localStorage.getItem(xpKey) || 0);
      const finalXp = Math.max(localXp, Number(weeklyXp || 0));
      if (finalXp > 0) {
        localStorage.setItem(xpKey, String(finalXp));
      }

      // 4. Merge Avatar
      if (avatar && !localStorage.getItem(`avatar_${uId}`)) {
        localStorage.setItem(`avatar_${uId}`, avatar);
      }

      // 5. Merge Settings
      if (settings && typeof settings === 'object') {
        const setKey = `settings_${uId}`;
        const localSet = JSON.parse(localStorage.getItem(setKey) || '{}');
        const mergedSet = { ...settings, ...localSet };
        localStorage.setItem(setKey, JSON.stringify(mergedSet));
      }

      // 6. Merge Study Dates for streak
      if (res.data.studyDates && Array.isArray(res.data.studyDates)) {
        const dateKey = `study_dates_${uId}`;
        const localDates = JSON.parse(localStorage.getItem(dateKey) || '[]');
        const mergedDates = Array.from(new Set([...localDates, ...res.data.studyDates])).sort();
        localStorage.setItem(dateKey, JSON.stringify(mergedDates));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo:cloud_synced', { detail: { userId: uId, xp: finalXp } }));
        window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: finalXp, delta: 0 } }));
      }

      return res.data;
    }
  } catch (e) {
    console.warn('Cloud sync GET failed, using local offline data:', e);
  }
  return null;
}

function pushUserDataToCloud(userId = null, weekKey = null) {
  const uId = userId || getEffectiveUserId();
  if (!uId || !String(uId).startsWith('u_')) return;

  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    const wKey = weekKey || getIsoWeekKey();
    const progress = JSON.parse(localStorage.getItem(`progress_${uId}`) || '{}');
    const favorites = JSON.parse(localStorage.getItem(`favs_${uId}`) || '[]');
    const weeklyXp = Number(localStorage.getItem(`xp_${uId}_${wKey}`) || 0);
    const settings = JSON.parse(localStorage.getItem(`settings_${uId}`) || '{}');
    const avatar = localStorage.getItem(`avatar_${uId}`) || '';
    const studyDates = JSON.parse(localStorage.getItem(`study_dates_${uId}`) || '[]');
    const user = getCurrentUser();
    const userName = user && user.name ? user.name : 'Участник';

    try {
      await fetch(`${API_URL}?route=sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          route: 'sync',
          action: 'sync',
          userId: uId,
          weekKey: wKey,
          progress,
          favorites,
          weeklyXp,
          settings,
          avatar,
          studyDates,
          userName,
        }),
      });
    } catch (e) {
      console.warn('Cloud sync POST failed, queued for next sync:', e);
    }
  }, 400);
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushProgressQueue();
      pushUserDataToCloud();
    }
  });
  window.addEventListener('pagehide', () => {
    flushProgressQueue();
    pushUserDataToCloud();
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

  pushUserDataToCloud(userId);

  if (String(userId).startsWith('u_')) {
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
}

function isWordMastered(prog) {
  if (!prog) return false;
  return Boolean(
    prog.mastered === true ||
    (prog.inputCorrect !== undefined && Number(prog.inputCorrect) >= 2)
  );
}

function isWordLearning(prog) {
  if (!prog || isWordMastered(prog)) return false;
  return Boolean(prog.seenInCards === true);
}

function getWordStage(prog) {
  if (!prog) return 'new';
  if (isWordMastered(prog)) return 'mastered';
  if ((prog.pairsCorrect || 0) >= 1) return 'test';
  if ((prog.quizCorrect || 0) >= 5) return 'pairs';
  if (prog.seenInCards) return 'quiz';
  return 'new';
}

function getQueueForCards(words, progress) {
  const base = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return !p || (!p.seenInCards && !isWordMastered(p));
  });

  // Приоритет изучения: сначала слова с наибольшей частотностью Zipf
  base.sort((a, b) => (Number(b.zipf) || 0) - (Number(a.zipf) || 0));

  const candidateMastered = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return p && isWordMastered(p);
  });

  if (candidateMastered.length === 0) {
    return base;
  }

  candidateMastered.sort((a, b) => {
    const pA = progress[a.id] || progress[String(a.id)];
    const pB = progress[b.id] || progress[String(b.id)];
    const tA = pA ? pA.lastPracticed || 0 : 0;
    const tB = pB ? pB.lastPracticed || 0 : 0;
    return tA - tB;
  });

  const injectCount = Math.max(1, Math.round(base.length * 0.15));
  const injected = candidateMastered.slice(0, injectCount);

  return [...base, ...injected];
}

function prepareTrainingBatch(categoryWords, userProgress, favorites = []) {
  // 1. Up to 10 words actively selected in Cards
  const baseWords = categoryWords.filter((w) => {
    const p = userProgress[w.id] || userProgress[String(w.id)];
    return isWordLearning(p);
  }).slice(0, 10);

  const baseIds = new Set(baseWords.map((w) => String(w.id)));

  // Strict caps: max 5 favorites (50%) + max 5 oldest mastered (50%) = max 20 words total!
  const favLimit = Math.min(5, Math.max(1, Math.round(baseWords.length * 0.5)));
  const masteredLimit = Math.min(5, Math.max(1, Math.round(baseWords.length * 0.5)));

  // 2. Pick up to 5 oldest favorites of the category
  let injectedFavs = [];
  if (favorites && favorites.length > 0) {
    const favSet = new Set(favorites.map(String));
    const candidateFavs = categoryWords.filter((w) => {
      return favSet.has(String(w.id)) && !baseIds.has(String(w.id));
    });
    candidateFavs.sort((a, b) => {
      const pA = userProgress[a.id] || userProgress[String(a.id)];
      const pB = userProgress[b.id] || userProgress[String(b.id)];
      const tA = pA ? (pA.lastPracticed || 0) : 0;
      const tB = pB ? (pB.lastPracticed || 0) : 0;
      return tA - tB;
    });
    injectedFavs = candidateFavs.slice(0, favLimit);
  }

  const combinedIds = new Set([...baseIds, ...injectedFavs.map((w) => String(w.id))]);

  // 3. Pick up to 5 oldest mastered words for retention (spaced repetition)
  const candidateMastered = categoryWords.filter((w) => {
    const p = userProgress[w.id] || userProgress[String(w.id)];
    return p && isWordMastered(p) && !combinedIds.has(String(w.id));
  });
  candidateMastered.sort((a, b) => {
    const pA = userProgress[a.id] || userProgress[String(a.id)];
    const pB = userProgress[b.id] || userProgress[String(b.id)];
    const tA = pA ? (pA.lastPracticed || pA.masteredAt || 0) : 0;
    const tB = pB ? (pB.lastPracticed || pB.masteredAt || 0) : 0;
    return tA - tB;
  });
  const injectedMastered = candidateMastered.slice(0, masteredLimit);

  const bonusWords = [...injectedFavs, ...injectedMastered];
  if (bonusWords.length > 0) {
    resetWordsProgressForPractice(bonusWords);
  }

  // Exactly max 20 words: 10 base + up to 5 favs + up to 5 mastered
  return [...baseWords, ...bonusWords].slice(0, 20);
}

function getQueueForQuiz(words, progress) {
  return words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return p && p.seenInCards && (p.quizCorrect || 0) < 5 && !isWordMastered(p);
  });
}

function getQueueForPairs(words, progress) {
  return words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return p && (p.quizCorrect || 0) >= 5 && (p.pairsCorrect || 0) < 1 && !isWordMastered(p);
  });
}

function getQueueForTest(words, progress) {
  return words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    if (!p) return false;
    if (isWordMastered(p)) return false;
    if (p.seenInCards !== true) return false;
    return Boolean((p.pairsCorrect || 0) >= 1 && (p.inputCorrect || 0) < 2);
  });
}

async function getUserStats(customWords = null) {
  const userId = getEffectiveUserId();
  const localProg = getUserProgress();

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
  let totalAttempted = 0;
  let correct = 0;
  let errors = 0;

  const categoryMap = {};

  wordsList.forEach((w) => {
    const cat = w.category || 'Elementary';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { total: 0, learned: 0 };
    }
    categoryMap[cat].total += 1;
    const prog = localProg[w.id] || localProg[String(w.id)];
    if (isWordMastered(prog)) {
      categoryMap[cat].learned += 1;
    }
  });

  Object.entries(localProg).forEach(([wordId, prog]) => {
    correct += prog.correct || 0;
    errors += prog.error || 0;
    if (isWordMastered(prog)) {
      masteredCount += 1;
    } else if (isWordLearning(prog)) {
      learningCount += 1;
    }
    totalAttempted += 1;
  });

  const accuracy = correct + errors > 0 ? Math.round((correct / (correct + errors)) * 100) : 0;

  const getCategoryOrderIndex = (catName) => {
    const clean = String(catName || '').toLowerCase().trim();
    if (clean.includes('elementary')) return 0;
    if (clean.includes('irregular')) return 1;
    if (clean.includes('pattern')) return 2;
    if (clean.includes('intermediate')) return 3;
    if (clean.includes('advanced')) return 4;
    return 999;
  };

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      learned: stats.learned,
    }))
    .sort((a, b) => {
      const diff = getCategoryOrderIndex(a.category) - getCategoryOrderIndex(b.category);
      if (diff !== 0) return diff;
      return a.category.localeCompare(b.category);
    });

  // Clean any old legacy stats cache to prevent cross-device deviation
  try {
    localStorage.removeItem('myduo_cached_cloud_stats');
  } catch (e) {}

  // Word of the Day: show instantly from date-hash (zero delay).
  // Fire background fetch; caller receives the promise to patch only the WOTD block when ready.
  const wordOfTheDay = getGlobalWordOfTheDay(wordsList, null);

  const wotdBackgroundPromise = fetch(`${API_URL}?route=stats&userId=${encodeURIComponent(userId)}`)
    .then((r) => r.json())
    .then((json) => (json && json.success && json.data && json.data.wordOfTheDayId ? String(json.data.wordOfTheDayId) : null))
    .catch(() => null);

  const streakDays = calculateUserStreak(userId, localProg);

  return {
    totalWords: wordsList.length,
    masteredCount,
    learningCount,
    totalAttempted,
    totalAnswers: correct + errors,
    correctAnswers: correct,
    accuracy,
    streakDays,
    categoryBreakdown,
    wordOfTheDay,
    wordsList,               // needed for background WOTD patch
    wotdBackgroundPromise,   // resolves to real cloudWordOfTheDayId (or null)
  };
}

async function getUserSettings() {
  const userId = getEffectiveUserId();
  const key = `settings_${userId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.dailyGoal === 20 || !parsed.dailyGoal) {
        parsed.dailyGoal = 10;
      }
      return {
        userId,
        dailyGoal: 10,
        theme: 'light',
        level: 'Elementary',
        category: 'Elementary',
        preferredMethod: 'cards',
        ...parsed,
      };
    } catch (e) {}
  }
  return {
    userId,
    dailyGoal: 10,
    theme: 'light',
    level: 'Elementary',
    category: 'Elementary',
    preferredMethod: 'cards',
  };
}

async function saveUserSettings(settings) {
  const userId = getEffectiveUserId();
  const cat = (settings.category && settings.category !== 'All' && settings.category !== 'Все категории')
    ? settings.category
    : 'Elementary';
  const payload = {
    route: 'settings',
    action: 'settings',
    ...settings,
    preferredMethod: settings.preferredMethod || 'cards',
    category: cat,
    level: cat,
    userId,
  };

  const key = `settings_${userId}`;
  localStorage.setItem(key, JSON.stringify(payload));

  pushUserDataToCloud(userId);

  if (String(userId).startsWith('u_')) {
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
        quizCorrect: 5,
        pairsCorrect: 0,
        inputCorrect: 0,
        mastered: false,
      };
    });
  }
  localStorage.setItem(progressKey, JSON.stringify(localProg));
  return localProg;
}

function getGlobalWordOfTheDay(wordsList, cloudWordId = null) {
  if (!wordsList || wordsList.length === 0) return null;

  // 1. Sort words strictly by ID ascending so the list ordering is 100% identical on all devices
  const sorted = [...wordsList].sort((a, b) => {
    const idA = Number(a.id) || 0;
    const idB = Number(b.id) || 0;
    if (idA !== idB) return idA - idB;
    return String(a.word || '').localeCompare(String(b.word || ''));
  });

  if (cloudWordId) {
    const found = sorted.find((w) => String(w.id) === String(cloudWordId));
    if (found) return found;
  }

  // 2. Standardized local calendar date (YYYY-MM-DD)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = ((hash << 5) - hash) + todayStr.charCodeAt(i);
    hash |= 0;
  }

  const idx = Math.abs(hash) % sorted.length;
  return sorted[idx];
}

async function transcribeAudio(audioBlob, mimeType, expectedWord) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      let timeoutId = null;
      try {
        const base64Data = (reader.result || '').split(',')[1];
        if (!base64Data) {
          throw new Error('Empty audio payload');
        }

        console.log('VOICE DEBUG', {
          mimeType,
          blobBytes: audioBlob.size,
          base64Chars: base64Data.length,
          expectedWord,
          userAgent: navigator.userAgent,
        });

        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 15000);
        const uploadStart = Date.now();

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'transcribe',
            audioBase64: base64Data,
            mimeType: mimeType || 'audio/webm',
            expectedWord: expectedWord || '',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const totalClientMs = Date.now() - uploadStart;

        const json = await response.json();
        if (json && json.success && json.data) {
          if (json.data.timings) {
            json.data.timings.totalClientMs = totalClientMs;
          }
          resolve(json.data);
        } else {
          reject(new Error(json?.error || 'Transcription failed'));
        }
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          reject(new Error('Время ожидания ответа сервера истекло (15 сек). Попробуйте еще раз.'));
        } else {
          reject(err);
        }
      }
    };
    reader.onerror = (e) => reject(new Error('Failed to read audio blob'));
    reader.readAsDataURL(audioBlob);
  });
}

async function transcribePingAudio(audioBlob, mimeType, expectedWord) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      let timeoutId = null;
      try {
        const base64Data = (reader.result || '').split(',')[1];
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 30000);
        const uploadStart = Date.now();

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'transcribeping',
            audioBase64: base64Data,
            mimeType: mimeType || 'audio/webm',
            expectedWord: expectedWord || '',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const totalClientMs = Date.now() - uploadStart;
        const json = await response.json();
        if (json && json.success && json.data) {
          json.data.totalClientMs = totalClientMs;
          resolve(json.data);
        } else {
          reject(new Error(json?.error || 'Ping failed'));
        }
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(err);
      }
    };
    reader.onerror = (e) => reject(new Error('Failed to read audio blob'));
    reader.readAsDataURL(audioBlob);
  });
}

async function getCloudWordOfTheDayId(userId) {
  try {
    const r = await fetch(`${API_URL}?route=stats&userId=${encodeURIComponent(userId || 'guest')}`);
    const json = await r.json();
    if (json && json.success && json.data && json.data.wordOfTheDayId) {
      return String(json.data.wordOfTheDayId);
    }
  } catch (e) {
    console.warn('Failed to fetch cloud word of the day ID:', e);
  }
  return null;
}

// Self-healing function to correct any improperly copied weekly XP from previous weeks
function runWeeklyXpCleanup() {
  if (typeof window === 'undefined') return;
  try {
    const currentUserId = getEffectiveUserId();
    const currentWeekKey = getIsoWeekKey();
    const currentXpKey = `xp_${currentUserId}_${currentWeekKey}`;

    if (!localStorage.getItem(`myduo_reset_cleanup_v3_${currentWeekKey}`)) {
      const currentVal = Number(localStorage.getItem(currentXpKey) || 0);
      if (currentVal > 0) {
        let maxOtherVal = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`xp_${currentUserId}_`) && k !== currentXpKey) {
            const val = Number(localStorage.getItem(k) || 0);
            if (val > maxOtherVal) {
              maxOtherVal = val;
            }
          }
        }
        if (maxOtherVal > 0 && currentVal >= maxOtherVal) {
          const actualXP = currentVal - maxOtherVal;
          localStorage.setItem(currentXpKey, String(actualXP));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: actualXP, delta: 0 } }));
          }, 100);
        }
      }
      localStorage.setItem(`myduo_reset_cleanup_v3_${currentWeekKey}`, 'true');
    }
  } catch (e) {}
}

// Initialize session tracking and tab switches
if (typeof window !== 'undefined') {
  if (!window._appSessionStartTime) {
    window._appSessionStartTime = Date.now();
  }
  if (!window._tabSwitchInitialized) {
    window._tabSwitchInitialized = true;
    window._tabSwitchCount = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window._tabSwitchCount = (window._tabSwitchCount || 0) + 1;
      }
    });
  }
}

async function sendUserAnalytics() {
  if (typeof window === 'undefined') return;
  const currentUserId = getEffectiveUserId();
  const now = Date.now();

  // Bulletproof throttle using localStorage (shared across tabs, module imports, and page reloads)
  const throttleKey = `myduo_last_analytics_sent_${currentUserId}`;
  const lastSent = Number(localStorage.getItem(throttleKey) || 0);
  if (now - lastSent < 30000) { // Max once per 30 seconds per user
    return;
  }
  localStorage.setItem(throttleKey, String(now));

  try {
    const currentUser = getCurrentUser();
    const email = currentUser && currentUser.email ? currentUser.email : 'guest';
    const name = currentUser && currentUser.name ? currentUser.name : 'Гость';

    // 1. Device Type
    let deviceType = 'Desktop';
    const ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      if (/Tablet|iPad/i.test(ua)) {
        deviceType = 'Tablet';
      } else {
        deviceType = 'Mobile';
      }
    }

    // 2. OS Detection
    let os = 'Unknown OS';
    if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac') !== -1) os = 'macOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('X11') !== -1) os = 'UNIX';

    // 3. Browser Detection
    let browser = 'Unknown Browser';
    if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Chromium') === -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (ua.indexOf('Edg') !== -1) browser = 'Edge';
    else if (ua.indexOf('OPR') !== -1 || ua.indexOf('Opera') !== -1) browser = 'Opera';

    // 4. Language & Locale
    const language = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    // 5. Screen Resolution
    const resolution = `${window.screen.width}x${window.screen.height}`;

    // 6. Referrer
    const referrer = document.referrer || '';

    // 7. Extended Hardware Metrics (Columns N & O)
    const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : '';
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '';

    // 8. App Mode (Column P: PWA vs Browser)
    const isPwa = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator && window.navigator.standalone === true);
    const appMode = isPwa ? 'PWA (App)' : 'Browser Tab';

    // 9. Session Duration (Column Q)
    if (!window._appSessionStartTime) window._appSessionStartTime = Date.now();
    const elapsedMin = Math.max(0.1, Math.round(((Date.now() - window._appSessionStartTime) / 60000) * 10) / 10);
    const sessionTime = `${elapsedMin} мин`;

    // 10. Focus / Tab Switches (Column R)
    const tabSwitches = String(window._tabSwitchCount || 0);

    // 11. Conversions & Engagement (Columns S, T, U)
    const roundsCompleted = localStorage.getItem(`myduo_rounds_count_${currentUserId}`) || '0';
    const audioClicks = localStorage.getItem(`myduo_audio_clicks_${currentUserId}`) || '0';
    let favsAdded = '0';
    try {
      const favs = JSON.parse(localStorage.getItem(`favs_${currentUserId}`) || '[]');
      favsAdded = String(favs.length);
    } catch(e) {}

    let location = 'Unknown Location';
    let ipAddress = '';
    try {
      const geoRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
      if (geoRes) {
        ipAddress = geoRes.ip || '';
        const country = geoRes.country_name || '';
        const city = geoRes.city || '';
        if (country || city) {
          location = [country, city].filter(Boolean).join(', ');
        }
      }
    } catch (err) {
      console.warn('Silent geolocation fetch failed:', err);
    }

    fetch(`${API_URL}?route=analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        route: 'analytics',
        userId: currentUserId,
        email: email,
        name: name,
        deviceType,
        os,
        browser,
        language,
        timezone,
        resolution,
        location,
        referrer,
        ipAddress,
        cores,
        ram,
        appMode,
        sessionTime,
        tabSwitches,
        roundsCompleted,
        audioClicks,
        favsAdded
      }),
    }).catch(() => {});
  } catch (e) {
    console.warn('Failed to send user analytics:', e);
  }
}

let _analyticsDebounceTimer = null;
function sendUserAnalyticsDebounced(delay = 1000) {
  if (_analyticsDebounceTimer) clearTimeout(_analyticsDebounceTimer);
  _analyticsDebounceTimer = setTimeout(() => {
    sendUserAnalytics();
  }, delay);
}

function trackRoundCompleted(targetUserId) {
  try {
    const uid = targetUserId || getEffectiveUserId();
    const roundKey = `myduo_rounds_count_${uid}`;
    const current = Number(localStorage.getItem(roundKey) || 0) + 1;
    localStorage.setItem(roundKey, String(current));
    sendUserAnalyticsDebounced(500);
  } catch (e) {}
}

// Automatically trigger on page load
try {
  runWeeklyXpCleanup();
  sendUserAnalytics();
} catch (e) {}

// Automatically trigger on login/logout state change and tab exit
if (typeof window !== 'undefined') {
  window.addEventListener('myduo:auth_changed', () => {
    sendUserAnalytics();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendUserAnalytics();
    }
  });

  window.addEventListener('pagehide', () => {
    sendUserAnalytics();
  });
}

async function addCustomWord({ word, translation, category, notes }) {
  const cleanW = String(word || '').trim();
  const cleanTrans = String(translation || '').trim();
  const cleanCat = String(category || 'Общие').trim();
  const cleanNotes = String(notes || '').trim();

  const localWord = {
    id: `custom_${Date.now()}`,
    word: cleanW,
    translation: cleanTrans,
    category: cleanCat,
    level: (cleanCat === 'Pattern' || cleanCat === 'Irregular verbs') ? '' : 'A2',
    transcription: '',
    notes: cleanNotes,
    zipf: 4.2,
  };

  const payload = {
    action: 'addword',
    route: 'addword',
    word: cleanW,
    translation: cleanTrans,
    category: cleanCat,
    notes: cleanNotes,
  };

  let savedWord = localWord;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_URL}?route=addword`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await response.json();
    if (json && json.success && json.data?.word) {
      savedWord = json.data.word;
    }
  } catch (err) {
    console.warn('Network error during addCustomWord, saving locally:', err);
  }

  if (!cachedWordsList || !Array.isArray(cachedWordsList)) {
    try {
      cachedWordsList = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
    } catch (e) {
      cachedWordsList = [];
    }
  }

  const idx = cachedWordsList.findIndex(
    (w) => String(w.id) === String(savedWord.id) || (w.word && w.word.toLowerCase() === savedWord.word.toLowerCase())
  );
  if (idx >= 0) {
    cachedWordsList[idx] = { ...cachedWordsList[idx], ...savedWord };
  } else {
    cachedWordsList.unshift(savedWord);
  }
  try {
    localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
  } catch (e) {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: cachedWordsList }));
  }

  return { word: savedWord };
}

async function batchAddCustomWords(words = []) {
  if (!Array.isArray(words) || words.length === 0) {
    return { addedCount: 0, words: [] };
  }

  const formattedWords = words.map((w, idx) => ({
    id: w.id || `custom_${Date.now()}_${idx}`,
    word: String(w.word || '').trim().toLowerCase(),
    translation: String(w.translation || '').trim().toLowerCase(),
    category: String(w.category || 'Общие').trim(),
    level: (w.category === 'Pattern' || w.category === 'Irregular verbs') ? '' : String(w.level || 'A2').trim(),
    transcription: w.category === 'Pattern' ? '' : String(w.transcription || '').trim(),
    notes: String(w.notes || '').trim(),
    zipf: parseFloat(w.zipf) || 4.2,
  }));

  const payload = {
    action: 'batchadd',
    route: 'batchadd',
    words: formattedWords,
  };

  let savedWords = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${API_URL}?route=batchadd`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await response.json();
    if (json && json.success && json.data) {
      savedWords = Array.isArray(json.data.words) ? json.data.words : formattedWords;
    } else {
      console.warn('Batch add backend warning, using local fallback:', json?.error);
      savedWords = formattedWords;
    }
  } catch (err) {
    console.warn('Network error during batchAddCustomWords, saving locally:', err);
    savedWords = formattedWords;
  }

  if (!cachedWordsList || !Array.isArray(cachedWordsList)) {
    try {
      cachedWordsList = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
    } catch (e) {
      cachedWordsList = [];
    }
  }

  if (savedWords.length > 0) {
    savedWords.forEach((sw) => {
      const idx = cachedWordsList.findIndex(
        (w) => String(w.id) === String(sw.id) || (w.word && w.word.toLowerCase() === sw.word.toLowerCase())
      );
      if (idx >= 0) {
        cachedWordsList[idx] = { ...cachedWordsList[idx], ...sw };
      } else {
        cachedWordsList.unshift(sw);
      }
    });

    try {
      localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: cachedWordsList }));
    }
  }

  return { addedCount: savedWords.length, words: savedWords };
}

async function scanDocumentImage(payloadInput, mimeType = 'image/jpeg') {
  let lang = 'ru';
  try {
    const stored = localStorage.getItem('myduo_interface_lang');
    if (stored && ['ru', 'uk', 'en', 'de', 'es', 'fr'].includes(stored)) {
      lang = stored;
    }
  } catch (e) {}

  let payload = {
    action: 'scanimage',
    route: 'scanimage',
    lang: lang,
  };

  if (typeof payloadInput === 'object' && payloadInput !== null) {
    if (payloadInput.text) payload.text = String(payloadInput.text).trim();
    if (payloadInput.imageBase64) payload.imageBase64 = String(payloadInput.imageBase64).trim();
    if (payloadInput.mimeType) payload.mimeType = payloadInput.mimeType || 'image/jpeg';
  } else if (typeof payloadInput === 'string') {
    payload.imageBase64 = payloadInput.trim();
    payload.mimeType = mimeType || 'image/jpeg';
  }

  let resJson = null;
  try {
    const response = await fetch(`${API_URL}?route=scanimage`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    resJson = await response.json();
  } catch (err) {
    console.warn('Backend scanimage fetch error:', err);
  }

  if (resJson && resJson.success && resJson.data && Array.isArray(resJson.data.lemmas) && resJson.data.lemmas.length > 0) {
    return resJson.data;
  }

  // If text extraction failed on backend (e.g. rate-limit or model overload), use graceful client-side fallback
  if (payload.text && payload.text.trim().length >= 2) {
    try {
      console.log('Using client-side fast text lemma extractor fallback...');
      return await clientSideExtractTextLemmas(payload.text, lang);
    } catch (fallbackErr) {
      console.warn('Client fallback error:', fallbackErr);
    }
  }

  if (resJson && resJson.data) {
    return resJson.data;
  }

  let errMsg = resJson?.error || 'Не удалось распознать слова';
  if (errMsg.includes('imageBase64')) {
    errMsg = 'Для работы распознавания текста обновите Code.gs в Google Apps Script (скопируйте файл backend/dist/Code.gs).';
  }
  throw new Error(errMsg);
}

async function clientSideExtractTextLemmas(rawText, lang = 'ru') {
  const lines = rawText.split(/[\r\n]+|[;•·\t]+/);
  const items = [];
  const seen = new Set();

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.length < 2) continue;

    // Remove bullets/numbers e.g. "1. ", "- "
    line = line.replace(/^[\d\.\-\*\#\>\s]+/, '').trim();
    if (!line) continue;

    let original = line;
    let clean = line.replace(/^[^\w\s']+|[^\w\s']+$/g, '').trim();
    if (!clean) continue;

    let lemma = clean;
    if (lemma.toLowerCase().startsWith('to ')) {
      lemma = lemma.slice(3).trim();
    } else if (lemma.toLowerCase().startsWith('a ')) {
      lemma = lemma.slice(2).trim();
    } else if (lemma.toLowerCase().startsWith('an ')) {
      lemma = lemma.slice(3).trim();
    } else if (lemma.toLowerCase().startsWith('the ')) {
      lemma = lemma.slice(4).trim();
    }

    const key = lemma.toLowerCase();
    if (!key || key.length < 2 || seen.has(key)) continue;
    seen.add(key);

    items.push({
      word: key,
      original: original,
      context: original,
    });
    if (items.length >= 40) break;
  }

  if (items.length <= 1 && rawText.length > 50) {
    const words = rawText.match(/[a-zA-Z']+/g) || [];
    const stopWords = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'you', 'are', 'was', 'were', 'have', 'has', 'had', 'from', 'they', 'what', 'when', 'where', 'which', 'who', 'will', 'would', 'could', 'should', 'about']);
    for (const w of words) {
      const lower = w.toLowerCase().trim();
      if (lower.length > 2 && !stopWords.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        items.push({
          word: lower,
          original: w,
          context: '',
        });
        if (items.length >= 30) break;
      }
    }
  }

  const targetLang = lang === 'uk' ? 'uk' : (lang === 'en' ? 'en' : 'ru');
  const lemmas = await Promise.all(
    items.map(async (item) => {
      const tokens = item.word.split(/\s+/).filter(Boolean);
      let cat = 'Elementary';
      if (tokens.length === 3 && (item.word.includes('/') || item.original.includes('/'))) {
        cat = 'Irregular verbs';
      } else if (tokens.length >= 2) {
        cat = 'Pattern';
      }

      try {
        const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(item.word)}`;
        const res = await fetch(gtxUrl).then((r) => r.json());
        let translation = '';
        if (res && res[0] && res[0][0] && res[0][0][0]) {
          translation = String(res[0][0][0]).trim().toLowerCase();
        }
        return {
          word: item.word,
          original: item.original,
          translation: translation || item.word,
          transcription: '',
          level: 'A2',
          category: cat,
          context: item.context,
        };
      } catch (e) {
        return {
          word: item.word,
          original: item.original,
          translation: item.word,
          transcription: '',
          level: 'A2',
          category: cat,
          context: item.context,
        };
      }
    })
  );

  return {
    detected_text_snippet: rawText.slice(0, 100),
    lemmas: lemmas,
    modelUsed: 'client-fallback',
  };
}

async function suggestTranslations(word) {
  if (!word || String(word).trim().length < 2) {
    return { suggestions: [], category: 'Общие', transcription: '' };
  }
  const clean = String(word).trim().toLowerCase();

  let targetLang = 'ru';
  try {
    const stored = localStorage.getItem('myduo_interface_lang');
    if (stored && ['ru', 'uk', 'de', 'es', 'fr', 'pl', 'it', 'tr', 'pt'].includes(stored)) {
      targetLang = stored;
    }
  } catch (e) {}

  try {
    // 1. Check local cached words first (0ms instantaneous)
    if (cachedWordsList && Array.isArray(cachedWordsList)) {
      const match = cachedWordsList.find((w) => w.word && w.word.toLowerCase() === clean);
      if (match) {
        let tVal = (match.translations && match.translations[targetLang]) || match.translation || '';
        if (tVal) {
          const parts = tVal.split(/[,;\/]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          const unique = Array.from(new Set([tVal.toLowerCase(), ...parts]));
          return {
            suggestions: unique.slice(0, 4),
            category: match.category || 'Общие',
            transcription: match.transcription || '',
          };
        }
      }
    }

    // 2. High-speed Google Translate API (gtx client) - instant, unblocked, supports multiple synonyms
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&dt=at&q=${encodeURIComponent(clean)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(gtxUrl, { signal: controller.signal }).then((r) => r.json());
    clearTimeout(timeoutId);

    const suggestions = [];
    if (res && res[0] && res[0][0] && res[0][0][0]) {
      const mainTrans = String(res[0][0][0]).trim().toLowerCase();
      if (mainTrans && mainTrans !== clean) {
        suggestions.push(mainTrans);
      }
    }

    // Dictionary synonyms from res[1]
    if (res && Array.isArray(res[1])) {
      res[1].forEach((group) => {
        if (group && Array.isArray(group[1])) {
          group[1].forEach((syn) => {
            const cleanSyn = String(syn || '').trim().toLowerCase();
            if (cleanSyn && cleanSyn !== clean && !suggestions.includes(cleanSyn) && cleanSyn.length <= 30) {
              suggestions.push(cleanSyn);
            }
          });
        }
      });
    }

    // Alternative variants from res[5]
    if (res && Array.isArray(res[5])) {
      res[5].forEach((item) => {
        if (item && Array.isArray(item[2])) {
          item[2].forEach((synGroup) => {
            const cleanSyn = String(synGroup[0] || '').trim().toLowerCase();
            if (cleanSyn && cleanSyn !== clean && !suggestions.includes(cleanSyn) && cleanSyn.length <= 30) {
              suggestions.push(cleanSyn);
            }
          });
        }
      });
    }

    if (suggestions.length > 0) {
      return {
        suggestions: suggestions.slice(0, 4),
        category: 'Общие',
        transcription: '',
      };
    }
  } catch (e) {
    console.warn('Google Translate suggestions fallback:', e);
  }

  // 3. Fallback: MyMemory API
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|${targetLang}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const mmRes = await fetch(myMemoryUrl, { signal: controller.signal }).then((r) => r.json());
    clearTimeout(timeoutId);

    if (mmRes && mmRes.responseData && mmRes.responseData.translatedText) {
      const rawMain = String(mmRes.responseData.translatedText || '').trim().toLowerCase();
      const suggestions = [];
      if (rawMain && rawMain !== clean && rawMain.length <= 40 && !rawMain.includes('mymemory')) {
        suggestions.push(rawMain);
      }
      if (Array.isArray(mmRes.matches)) {
        mmRes.matches.forEach((m) => {
          if (m.translation && typeof m.translation === 'string') {
            const t = m.translation.trim().toLowerCase();
            if (t && t !== clean && t.length <= 30 && !suggestions.includes(t) && !t.includes('mymemory') && !t.includes('http')) {
              suggestions.push(t);
            }
          }
        });
      }
      if (suggestions.length > 0) {
        return {
          suggestions: suggestions.slice(0, 4),
          category: 'Общие',
          transcription: '',
        };
      }
    }
  } catch (err) {
    console.warn('MyMemory fallback error:', err);
  }

  return { suggestions: [], category: 'Общие', transcription: '' };
}

const ApiService = {
  suggestTranslations,
  addCustomWord,
  batchAddCustomWords,
  scanDocumentImage,
  sendUserAnalytics,
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
  prepareTrainingBatch,
  flushProgressQueue,
  toggleFavoriteApi,
  getUserStats,
  getGlobalWordOfTheDay,
  getUserSettings,
  saveUserSettings,
  resetWordsProgressForPractice,
  getEffectiveUserId,
  getLeaderboard,
  getCachedLeaderboard,
  getUserWeeklyXP,
  addWeeklyXP,
  getUserWeeklyRank,
  formatCompactXp,
  getIsoWeekKey,
  fetchUserDataFromCloud,
  pushUserDataToCloud,
  transcribeAudio,
  transcribePingAudio,
  getCloudWordOfTheDayId,
  trackRoundCompleted,
  sendUserAnalyticsDebounced,
};

export default ApiService;

export {
  ApiService,
  suggestTranslations,
  addCustomWord,
  batchAddCustomWords,
  scanDocumentImage,
  sendUserAnalytics,
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
  prepareTrainingBatch,
  flushProgressQueue,
  toggleFavoriteApi,
  getUserStats,
  getGlobalWordOfTheDay,
  getUserSettings,
  saveUserSettings,
  resetWordsProgressForPractice,
  getEffectiveUserId,
  getLeaderboard,
  getCachedLeaderboard,
  getUserWeeklyXP,
  addWeeklyXP,
  getUserWeeklyRank,
  formatCompactXp,
  getIsoWeekKey,
  fetchUserDataFromCloud,
  pushUserDataToCloud,
  transcribeAudio,
  transcribePingAudio,
  getCloudWordOfTheDayId,
  trackRoundCompleted,
  sendUserAnalyticsDebounced,
};

export { getWordTranslation, getWordNotes } from './i18n.js';
