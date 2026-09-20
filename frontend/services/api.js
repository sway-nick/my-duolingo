import { getCurrentUser, getEffectiveUserId, getGuestId, getDeterministicUserId } from './authService.js?v=200.0';
import { 
  syncLeaderboardScoreFirestore, 
  getWeeklyLeaderboardFirestore, 
  getUserWeeklyXpFirestore,
  saveUserProgressFirestore, 
  saveBulkProgressFirestore,
  loadUserProgressFirestore,
  saveUserProfileFirestore,
  saveUserSettingsFirestore,
  saveUserFavoritesFirestore,
  saveUserNotesFirestore,
  loadUserNotesFirestore,
  saveUserCustomWordsFirestore,
  loadUserCustomWordsFirestore,
  fetchSharedVocabularyUpdatesFirestore,
  saveUserAnalyticsFirestore,
  saveSessionFirestore,
  updateUserSessionSummaryFirestore,
  loadFullUserDataFirestore
} from './firebase.js?v=200.0';

async function getHealth() {
  return { success: true, status: 'ok', engine: 'firebase' };
}

function getFirestoreUserId(userId = null) {
  const user = getCurrentUser();
  let fbUid = user?.firebaseUid ? String(user.firebaseUid) : '';

  // Migration: myduo_firebase_user.id always stores fbRes.localId (real Firebase UID).
  // Old auth code stored Google Sub ID in user.firebaseUid — detect and fix on the fly.
  try {
    const stored = localStorage.getItem('myduo_firebase_user');
    if (stored) {
      const fbData = JSON.parse(stored);
      const realFbUid = fbData?.id ? String(fbData.id) : '';
      // Google Sub IDs are purely numeric (e.g. 110531984537821932939).
      // Real Firebase UIDs contain letters (e.g. b9PUaf5jtthwQIOPvAdZJ1o5CBC3).
      const googleSubPattern = /^\d+$/;
      if (realFbUid && realFbUid !== fbUid) {
        // Prefer realFbUid if fbUid looks like a Google numeric Sub ID
        if (!fbUid || googleSubPattern.test(fbUid)) {
          fbUid = realFbUid;
          // Also patch the user object in localStorage so future calls are instant
          if (user && user.firebaseUid !== realFbUid) {
            try {
              user.firebaseUid = realFbUid;
              localStorage.setItem('myduo_current_user', JSON.stringify(user));
            } catch (e) {}
          }
        }
      }
    }
  } catch (e) {}

  if (!fbUid) return userId;
  const detId = user?.email ? getDeterministicUserId(user.email) : null;
  const effectiveId = getEffectiveUserId();
  if (!userId) return fbUid;
  const candidate = String(userId);
  if (
    candidate === fbUid ||
    candidate === String(user?.id || '') ||
    candidate === String(detId || '') ||
    candidate === String(effectiveId || '')
  ) {
    return fbUid;
  }
  return userId;
}

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

const WORDS_CACHE_VERSION = 'v218_utf8_clean';

let cachedWordsList = null;
try {
  const cacheVer = localStorage.getItem('myduo_words_cache_ver');
  const rawCache = localStorage.getItem('myduo_cached_words') || '';
  if (cacheVer === WORDS_CACHE_VERSION && !rawCache.includes('\ufffd') && !rawCache.includes('плщадь')) {
    const initialCache = JSON.parse(rawCache || '[]');
    if (Array.isArray(initialCache) && initialCache.length > 0) {
      cachedWordsList = initialCache;
    }
  } else {
    localStorage.removeItem('myduo_cached_words');
    localStorage.setItem('myduo_words_cache_ver', WORDS_CACHE_VERSION);
  }
} catch (e) {}

function sanitizeTranscriptions(words) {
  if (!Array.isArray(words)) return;
  words.forEach((w) => {
    if (w) {
      if (typeof w.word === 'string' && /[\u00ad\u200b\ufeff]/.test(w.word)) {
        w.word = w.word.replace(/[\u00ad\u200b\ufeff]/g, '').trim();
      }
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

function getUserNotesLocal() {
  try {
    return JSON.parse(localStorage.getItem('myduo_user_notes') || '{}');
  } catch (e) {
    return {};
  }
}

function saveUserNote(wordId, wordText, noteText) {
  const notes = getUserNotesLocal();
  const cleanNote = String(noteText || '').trim();
  const cleanWord = String(wordText || '').toLowerCase().trim();
  const cleanId = wordId ? String(wordId) : '';

  if (cleanId) {
    if (cleanNote) notes[cleanId] = cleanNote;
    else delete notes[cleanId];
  }
  if (cleanWord) {
    if (cleanNote) notes[cleanWord] = cleanNote;
    else delete notes[cleanWord];
  }

  try {
    localStorage.setItem('myduo_user_notes', JSON.stringify(notes));
  } catch (e) {}

  if (cachedWordsList && Array.isArray(cachedWordsList)) {
    const target = cachedWordsList.find(
      (w) => (cleanId && String(w.id) === cleanId) || (cleanWord && w.word && w.word.toLowerCase() === cleanWord)
    );
    if (target) {
      target.user_note = cleanNote;
      if (cleanNote) target.notes = cleanNote;
    }
    try {
      localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
    } catch (e) {}
  }

  try {
    const user = getCurrentUser();
    const uId = user?.id || getEffectiveUserId();
    if (uId) {
      saveUserNotesFirestore(uId, notes).catch(() => {});
    }
  } catch (e) {}

  return notes;
}

function applyUserNotes(words) {
  if (!Array.isArray(words)) return;
  const userNotes = getUserNotesLocal();
  if (!userNotes || Object.keys(userNotes).length === 0) return;
  words.forEach((w) => {
    if (!w) return;
    const wId = w.id ? String(w.id) : '';
    const wText = w.word ? String(w.word).toLowerCase().trim() : '';
    const personalNote = (wId && userNotes[wId]) || (wText && userNotes[wText]);
    if (personalNote) {
      w.user_note = personalNote;
      w.notes = personalNote;
    }
  });
}

let _syncUpdatesPromise = null;
async function syncRemoteVocabularyUpdates() {
  try {
    const updates = await fetchSharedVocabularyUpdatesFirestore();
    if (!updates || Object.keys(updates).length === 0) return false;

    if (!cachedWordsList || !Array.isArray(cachedWordsList)) {
      try {
        cachedWordsList = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
      } catch (e) {
        cachedWordsList = [];
      }
    }
    if (cachedWordsList.length === 0) return false;

    let hasChanges = false;
    const wordMap = new Map();
    cachedWordsList.forEach((w, i) => {
      wordMap.set(String(w.id), i);
      if (w.word) wordMap.set(String(w.word).toLowerCase().trim(), i);
    });

    Object.keys(updates).forEach((idKey) => {
      const u = updates[idKey];
      if (!u || !u.word) return;

      const cleanWord = String(u.word).toLowerCase().trim();
      let targetIdx = wordMap.get(String(u.id));
      if (targetIdx === undefined) targetIdx = wordMap.get(cleanWord);

      if (targetIdx !== undefined) {
        const existing = cachedWordsList[targetIdx];
        let rowChanged = false;
        if (u.translation && existing.translation !== u.translation) {
          existing.translation = u.translation;
          rowChanged = true;
        }
        if (u.transcription !== undefined && existing.transcription !== u.transcription) {
          existing.transcription = u.transcription;
          rowChanged = true;
        }
        if (u.category && existing.category !== u.category) {
          existing.category = u.category;
          rowChanged = true;
        }
        if (u.level && existing.level !== u.level) {
          existing.level = u.level;
          rowChanged = true;
        }
        if (rowChanged) hasChanges = true;
      } else {
        cachedWordsList.unshift({
          id: u.id || `w_${cleanWord}`,
          word: cleanWord,
          translation: u.translation || cleanWord,
          transcription: u.transcription || '',
          category: u.category || 'Elementary',
          level: u.level || 'A2',
          zipf: u.zipf || 0,
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      try {
        localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
        localStorage.setItem('myduo_words_cache_ver', WORDS_CACHE_VERSION);
      } catch (e) {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: cachedWordsList }));
      }
    }
    return hasChanges;
  } catch (err) {
    console.warn('syncRemoteVocabularyUpdates warning:', err);
    return false;
  }
}

async function getWords(forceRefresh = false) {
  const sortByZipf = (list) => {
    if (Array.isArray(list)) {
      list.sort((a, b) => (Number(b.zipf) || 0) - (Number(a.zipf) || 0));
    }
  };

  const currentLang = getActiveLang();

  // Background sync for latest updates from Google Sheets / Firestore
  if (forceRefresh) {
    await syncRemoteVocabularyUpdates();
  } else {
    syncRemoteVocabularyUpdates().catch(() => {});
  }

  if (!forceRefresh && cachedWordsList && cachedWordsList.length > 0) {
    sanitizeTranscriptions(cachedWordsList);
    applyMultilingualTranslations(cachedWordsList);
    applyUserNotes(cachedWordsList);
    sortByZipf(cachedWordsList);
    return { success: true, data: cachedWordsList };
  }

  // Check localStorage cache first for instant startup
  if (!forceRefresh) {
    try {
      const cacheVer = localStorage.getItem('myduo_words_cache_ver');
      const rawCache = localStorage.getItem('myduo_cached_words') || '';

      if (cacheVer === WORDS_CACHE_VERSION && !rawCache.includes('\ufffd') && !rawCache.includes('плщадь')) {
        let localCached = JSON.parse(rawCache || '[]');
        const hasMultilingual = Array.isArray(localCached) && localCached.length > 0 && localCached.some((w) => w && w.translations && typeof w.translations === 'object');

        if (hasMultilingual) {
          sanitizeTranscriptions(localCached);
          applyMultilingualTranslations(localCached);
          applyUserNotes(localCached);
          sortByZipf(localCached);
          cachedWordsList = localCached;
          return { success: true, data: cachedWordsList };
        }
      } else {
        localStorage.removeItem('myduo_cached_words');
        localStorage.setItem('myduo_words_cache_ver', WORDS_CACHE_VERSION);
      }
    } catch (e) {}
  }

  // Load static dictionary bundled with the app
  try {
    let wordData = null;
    const pathsToTry = ['./assets/data/words.json', 'assets/data/words.json', '/assets/data/words.json'];
    for (const p of pathsToTry) {
      try {
        const response = await fetch(p);
        if (response.ok) {
          wordData = await response.json();
          if (Array.isArray(wordData) && wordData.length > 0) break;
        }
      } catch (err) {}
    }

    if (Array.isArray(wordData) && wordData.length > 0) {
      let localCached = [];
      try {
        localCached = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
      } catch (e) {}
      const bundleWordSet = new Set(wordData.map((w) => String(w.word || '').toLowerCase().trim()));
      const customLocal = localCached.filter(
        (w) => w && w.word && !bundleWordSet.has(String(w.word).toLowerCase().trim()) && String(w.id || '').startsWith('custom_')
      );
      if (customLocal.length > 0) {
        wordData.unshift(...customLocal);
      }

      sanitizeTranscriptions(wordData);
      applyMultilingualTranslations(wordData);
      applyUserNotes(wordData);
      sortByZipf(wordData);
      cachedWordsList = wordData;
      try {
        localStorage.setItem('myduo_cached_words', JSON.stringify(wordData));
        localStorage.setItem('myduo_words_cache_ver', WORDS_CACHE_VERSION);
      } catch (e) {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: wordData }));
      }
      return { success: true, data: cachedWordsList };
    }
  } catch (error) {
    console.warn('Failed to load local words.json, using fallback', error);
  }

  const fallbackList = cachedWordsList || MOCK_WORDS;
  sanitizeTranscriptions(fallbackList);
  applyMultilingualTranslations(fallbackList);
  applyUserNotes(fallbackList);
  sortByZipf(fallbackList);
  return { success: true, data: fallbackList };
}

async function registerUser(email, password, name) {
  const cleanEmail = email.toLowerCase().trim();
  const deterministicId = getDeterministicUserId(cleanEmail);

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

  const userExists = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (userExists) {
    return {
      success: false,
      error: 'Неверный пароль. Пожалуйста, проверьте введённые данные.',
    };
  }

  return {
    success: false,
    error: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь.',
  };
}

async function googleAuthUser(email, name, avatar) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = (name || cleanEmail.split('@')[0]).trim();
  const deterministicId = getDeterministicUserId(cleanEmail);

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
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getUserWeeklyXP(userId = null, weekKey = null) {
  const uId = userId || getEffectiveUserId();
  const wKey = weekKey || getIsoWeekKey();
  const key = `xp_${uId}_${wKey}`;
  let xp = Number(localStorage.getItem(key) || 0);

  const user = getCurrentUser();

  if (xp <= 0) {
    // Check deterministic user ID
    if (user && user.email) {
      const detId = getDeterministicUserId(user.email);
      if (detId && detId !== uId) {
        const detXp = Number(localStorage.getItem(`xp_${detId}_${wKey}`) || 0);
        if (detXp > xp) xp = detXp;
      }
    }

    // Check firebaseUid
    if (user && user.firebaseUid && user.firebaseUid !== uId) {
      const fbXp = Number(localStorage.getItem(`xp_${user.firebaseUid}_${wKey}`) || 0);
      if (fbXp > xp) xp = fbXp;
    }

    // Check guest ID for the same week
    const guestId = getGuestId();
    if (guestId && guestId !== uId) {
      const guestXp = Number(localStorage.getItem(`xp_${guestId}_${wKey}`) || 0);
      if (guestXp > xp) xp = guestXp;
    }



    if (xp > 0) {
      localStorage.setItem(key, String(xp));
    }
  }

  return Math.max(0, xp);
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
  if (!userId) return;
  const cleanName = name || 'Гость';
  const cleanAvatar = avatar || '';
  const cleanXp = Math.max(0, Number(xp || 0));

  // Sync to Cloud Firestore (Real-time, instant)
  try {
    syncLeaderboardScoreFirestore(getFirestoreUserId(userId), weekKey, cleanXp, cleanName, cleanAvatar).catch(() => {});
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
  let dayOfWeek = now.getUTCDay(); // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday in UTC
  if (dayOfWeek === 0) dayOfWeek = 7;
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

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
      const daySeed = hashStr(`${weekKey}_${userId}_day_${d}`);
      const dayGain = minDaily + (daySeed % (maxDaily - minDaily + 1));
      if (dayGain <= 0) continue;

      // Number of training sessions today (1 to 4 sessions depending on tier and seed)
      const numSessions = tier === 0 ? (2 + (daySeed % 3)) : // 2..4 sessions for top leaders
                          tier <= 2 ? (1 + (daySeed % 3)) : // 1..3 sessions for mid tier
                          (1 + (daySeed % 2));              // 1..2 sessions for casual

      const slotSize = Math.floor(1440 / numSessions);
      let remainingXP = dayGain;

      for (let s = 0; s < numSessions; s++) {
        const sessSeed = hashStr(`${weekKey}_${userId}_d${d}_s${s}`);
        const isLast = (s === numSessions - 1);

        const basePortion = Math.floor(dayGain / numSessions);
        let sessionXP = isLast ? remainingXP : Math.max(5, Math.floor(basePortion * (0.8 + (sessSeed % 40) / 100)));
        sessionXP = Math.min(sessionXP, remainingXP);
        remainingXP -= sessionXP;

        // Session start time in minutes (0..1439 UTC)
        const slotStart = s * slotSize;
        const jitter = sessSeed % Math.max(10, slotSize - 15);
        const sessionMinute = slotStart + jitter;

        if (d < dayOfWeek) {
          botXP += sessionXP;
        } else {
          if (currentMinutes >= sessionMinute) {
            botXP += sessionXP;
          }
        }
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

    let realPlayers = (Array.isArray(rawList) ? rawList : []).filter((u) => u && u.userId && !String(u.userId).startsWith('bot_'));
    if (realPlayers.length === 0) {
      const migrated = getMigratedPlayersSync();
      if (Array.isArray(migrated) && migrated.length > 0) {
        realPlayers = migrated.map(p => ({
          userId: p && p.userId,
          name: (p && p.name != null) ? String(p.name) : 'Student',
          avatar: (p && p.avatar) || '',
          xp: period === 'all' ? ((p && (p.allXp || p.weeklyXp)) || 0) : ((p && p.weeklyXp) || 0),
          isBot: false
        })).filter(p => p.userId && p.xp > 0);
      }
    }
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

    const myIdx = combined.findIndex((u) => u && String(u.userId) === String(currentUserId));
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

    combined.sort((a, b) => Number((b && b.xp) || 0) - Number((a && a.xp) || 0));
    return { success: true, data: combined, period: 'all' };
  }

  const userXP = getUserWeeklyXP(currentUserId, wKey);
  let rawList = [];
  try {
    const raw = localStorage.getItem(`cache_leaderboard_${wKey}`);
    if (raw) rawList = JSON.parse(raw);
  } catch (e) {}

  let realPlayers = (Array.isArray(rawList) ? rawList : []).filter((u) => u && u.userId && !String(u.userId).startsWith('bot_'));
  if (realPlayers.length === 0) {
    const migrated = getMigratedPlayersSync();
    if (Array.isArray(migrated) && migrated.length > 0) {
      realPlayers = migrated.map(p => ({
        userId: p && p.userId,
        name: (p && p.name != null) ? String(p.name) : 'Student',
        avatar: (p && p.avatar) || '',
        xp: (p && p.weeklyXp) || 0,
        isBot: false
      })).filter(p => p.userId && p.xp > 0);
    }
  }
  const dynamicBots = generateDynamicBots(wKey);
  const combined = [...realPlayers, ...dynamicBots];

  const myIdx = combined.findIndex((u) => u && String(u.userId) === String(currentUserId));
  if (myIdx >= 0) {
    combined[myIdx].xp = userXP;
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

  combined.sort((a, b) => Number((b && b.xp) || 0) - Number((a && a.xp) || 0));

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

  // Automatically ensure current user's local XP & avatar are synced to Firestore
  if (userXP > 0 || userAvatar) {
    syncWeeklyXpApi(currentUserId, wKey, userXP, userName, userAvatar);
  }

  // 1. Query Cloud Firestore first (5-20ms instant response)
  try {
    const fsPlayers = await getWeeklyLeaderboardFirestore(wKey);
    if (fsPlayers && Array.isArray(fsPlayers) && fsPlayers.length > 0) {
      const validFsPlayers = fsPlayers.filter((p) => p && p.userId);
      const detId = currentUser?.email ? getDeterministicUserId(currentUser.email) : null;
      const fbUid = currentUser?.firebaseUid || null;

      const myIdx = validFsPlayers.findIndex((u) => u && (
        String(u.userId) === String(currentUserId) ||
        (fbUid && String(u.userId) === String(fbUid)) ||
        (detId && String(u.userId) === String(detId))
      ));
      if (myIdx >= 0) {
        validFsPlayers[myIdx].xp = Math.max(Number(validFsPlayers[myIdx].xp || 0), userXP);
        validFsPlayers[myIdx].userId = currentUserId;
        validFsPlayers[myIdx].name = userName;
        if (userAvatar) validFsPlayers[myIdx].avatar = userAvatar;
        validFsPlayers[myIdx].isCurrentUser = true;
      } else if (userXP > 0) {
        validFsPlayers.push({
          userId: currentUserId,
          name: userName,
          avatar: userAvatar,
          xp: userXP,
          isCurrentUser: true,
        });
      }

      const dynamicBots = generateDynamicBots(wKey);
      const combined = [...validFsPlayers, ...dynamicBots];
      combined.sort((a, b) => Number((b && b.xp) || 0) - Number((a && a.xp) || 0));
      localStorage.setItem(`cache_leaderboard_${wKey}`, JSON.stringify(combined));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo:leaderboard_updated', { detail: { data: combined, period } }));
      }
      return getCachedLeaderboard(wKey, period);
    }
  } catch (fsErr) {
    console.warn('Firestore leaderboard query fallback:', fsErr);
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
  prog.lastReviewedAt = Date.now();
  let autoFavorited = false;

  // Calculate XP change based on mode and correctness
  let xpDelta = 0;

  if (options && options.isFavPractice) {
    if (isCorrect) {
      prog.correct = (prog.correct || 0) + 1;
    } else {
      prog.error = (prog.error || 0) + 1;
    }
    xpDelta = 0; // Practice in Favorites does NOT change XP at all
  } else if (method === 'cards_learn') {
    prog.seenInCards = true;
    prog.roundCardsDone = true;
    prog.roundQuizDone = false;
    prog.roundPairsDone = false;
    prog.roundTestDone = false;
    prog.stage = 'quiz';
    prog.quizCorrect = 0;
    prog.lastReviewedAt = Date.now();
  } else if (method === 'cards_repeat_round') {
    prog.seenInCards = true;
    prog.roundCardsDone = true;
    prog.stage = 'quiz';
    prog.quizCorrect = 0;
    prog.pairsCorrect = 0;
  } else if (method === 'cards_know') {
    prog.known = true;
    prog.mastered = true;
    prog.seenInCards = true;
    prog.lastReviewedAt = Date.now();
    prog.roundCardsDone = false;
    prog.roundQuizDone = false;
    prog.roundPairsDone = false;
    prog.roundTestDone = false;
    prog.stage = 'mastered';
  } else if (method === 'cards') {
    prog.seenInCards = true;
    prog.roundCardsDone = true;
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
      if (isWordMastered(prog)) {
        prog.roundQuizDone = true;
      } else {
        if (options && options.isSingleRemaining) {
          // If this is the last/only remaining word, advance to next mode after exactly 1 check!
          prog.quizCorrect = Math.max(prog.quizCorrect || 0, 5);
          prog.stage = 'pairs';
          prog.roundQuizDone = true;
        } else {
          prog.quizCorrect = (prog.quizCorrect || 0) + 1;
          if (prog.quizCorrect >= 5) {
            prog.stage = 'pairs';
            prog.roundQuizDone = true;
          }
        }
      }
      xpDelta = (options && options.skipXp) ? 0 : 1; // +1 XP (or 0 if fallback) for correct quiz answer
    } else {
      prog.error = (prog.error || 0) + 1;
      xpDelta = -5; // -5 XP for wrong quiz answer
    }
  } else if (method === 'pairs') {
    if (isCorrect) {
      prog.correct = (prog.correct || 0) + 1;
      if (isWordMastered(prog)) {
        prog.roundPairsDone = true;
      } else {
        prog.pairsCorrect = (prog.pairsCorrect || 0) + 1;
        if (prog.pairsCorrect >= 1) {
          prog.stage = 'test';
          prog.roundPairsDone = true;
        }
      }
      if (options && options.perfectRound) {
        xpDelta = 5; // +5 XP for complete group of pairs without mistakes
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
        if (options && options.isSingleRemaining) {
          // Single remaining word: master immediately on fix so user isn't forced to re-type 3 times
          prog.inputCorrect = Math.max(prog.inputCorrect || 0, 2);
          prog.mastered = true;
          if (!prog.masteredAt) prog.masteredAt = Date.now();
          prog.stage = 'mastered';
          prog.roundTestDone = true;
        }
      } else {
        prog.correct = (prog.correct || 0) + 1;
        if (isWordMastered(prog)) {
          prog.roundTestDone = true;
        } else {
          if (options && options.isSingleRemaining) {
            // Single remaining word: master immediately after exactly 1 correct check!
            prog.inputCorrect = Math.max(prog.inputCorrect || 0, 2);
            prog.mastered = true;
            if (!prog.masteredAt) {
              prog.masteredAt = Date.now();
            }
            prog.stage = 'mastered';
            prog.roundTestDone = true;
          } else {
            prog.inputCorrect = (prog.inputCorrect || 0) + 1;
            if (prog.inputCorrect >= 2) {
              prog.mastered = true;
              if (!prog.masteredAt) {
                prog.masteredAt = Date.now();
              }
              prog.stage = 'mastered';
              prog.roundTestDone = true;
            }
          }
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

  // Sync to Cloud Firestore (Real-time persistent cloud storage)
  try {
    const fsUid = getFirestoreUserId(userId);
    saveUserProgressFirestore(fsUid, wordId, prog).catch(() => {});
  } catch (e) {}

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
    if (!item.userId || String(item.userId).startsWith('guest_')) {
      continue; // Skip guests from cloud progress sync
    }
    try {
      saveUserProgressFirestore(getFirestoreUserId(item.userId), item.wordId, item);
    } catch (e) {
      console.warn('Failed to sync progress item to Firestore:', item, e);
    }
  }
}

let cachedMigratedPlayers = null;
function getMigratedPlayersSync() {
  if (cachedMigratedPlayers) return cachedMigratedPlayers;
  try {
    const raw = localStorage.getItem('myduo_migrated_players_cache');
    if (raw) {
      cachedMigratedPlayers = JSON.parse(raw);
      return cachedMigratedPlayers;
    }
  } catch (e) {}
  return [];
}

async function loadMigratedPlayersBundle() {
  if (cachedMigratedPlayers && Array.isArray(cachedMigratedPlayers) && cachedMigratedPlayers.length > 0) {
    return cachedMigratedPlayers;
  }
  const paths = ['./assets/data/migrated_players.json', 'assets/data/migrated_players.json', '/assets/data/migrated_players.json'];
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedMigratedPlayers = data;
          try {
            localStorage.setItem('myduo_migrated_players_cache', JSON.stringify(data));
          } catch (e) {}
          return data;
        }
      }
    } catch (e) {}
  }
  return getMigratedPlayersSync();
}

async function fetchUserDataFromCloud(userId = null, weekKey = null) {
  const uId = userId || getEffectiveUserId();
  if (!uId || String(uId).startsWith('guest_')) return null;

  const wKey = weekKey || getIsoWeekKey();
  const user = getCurrentUser();
  const detId = user && user.email ? getDeterministicUserId(user.email) : null;
  const fbUid = user && (user.firebaseUid || (user.id && user.id !== detId ? user.id : null));
  // Use Firebase UID as primary Firestore path (subcollections require auth.uid == userId)
  const firestoreUid = getFirestoreUserId(uId);

  // Fetch real-time progress, XP and data from Cloud Firestore
  try {
    const [prog1, prog2, progFb, xp1, xp2, xpFb, fullDoc, detDoc, fbDoc, migratedPlayers] = await Promise.all([
      loadUserProgressFirestore(firestoreUid).catch(() => ({})),
      detId && detId !== uId && detId !== firestoreUid ? loadUserProgressFirestore(detId).catch(() => ({})) : Promise.resolve({}),
      fbUid && fbUid !== uId && fbUid !== detId && fbUid !== firestoreUid ? loadUserProgressFirestore(fbUid).catch(() => ({})) : Promise.resolve({}),
      getUserWeeklyXpFirestore(firestoreUid, wKey).catch(() => 0),
      detId && detId !== uId && detId !== firestoreUid ? getUserWeeklyXpFirestore(detId, wKey).catch(() => 0) : Promise.resolve(0),
      fbUid && fbUid !== uId && fbUid !== detId && fbUid !== firestoreUid ? getUserWeeklyXpFirestore(fbUid, wKey).catch(() => 0) : Promise.resolve(0),
      loadFullUserDataFirestore(firestoreUid).catch(() => null),
      detId && detId !== uId && detId !== firestoreUid ? loadFullUserDataFirestore(detId).catch(() => null) : Promise.resolve(null),
      fbUid && fbUid !== uId && fbUid !== detId && fbUid !== firestoreUid ? loadFullUserDataFirestore(fbUid).catch(() => null) : Promise.resolve(null),
      loadMigratedPlayersBundle().catch(() => [])
    ]);

    const progKey = `progress_${uId}`;
    const localProg = JSON.parse(localStorage.getItem(progKey) || '{}');
    const mergedProg = {
      ...(fbDoc?.progress || {}),
      ...(detDoc?.progress || {}),
      ...(fullDoc?.progress || {}),
      ...(progFb || {}),
      ...(prog2 || {}),
      ...(prog1 || {}),
      ...localProg
    };

    const deletedFavs = getDeletedFavoritesSet(uId);
    const sanitizeFavArray = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map(id => String(id).trim())
        .filter(id => id && !deletedFavs.has(id));
    };

    const mergedFavsSet = new Set([
      ...sanitizeFavArray(fbDoc?.favorites),
      ...sanitizeFavArray(detDoc?.favorites),
      ...sanitizeFavArray(fullDoc?.favorites),
      ...sanitizeFavArray(JSON.parse(localStorage.getItem(`favs_${uId}`) || '[]')),
      ...(fbUid ? sanitizeFavArray(JSON.parse(localStorage.getItem(`favs_${fbUid}`) || '[]')) : []),
      ...(detId ? sanitizeFavArray(JSON.parse(localStorage.getItem(`favs_${detId}`) || '[]')) : []),
      ...sanitizeFavArray(JSON.parse(localStorage.getItem('dl_favorites') || '[]')),
      ...sanitizeFavArray(JSON.parse(localStorage.getItem('favorites') || '[]')),
      ...sanitizeFavArray(JSON.parse(localStorage.getItem('favs_guest') || '[]'))
    ]);

    // Match historical profile from migrated database
    const cleanEmail = (user?.email || '').toLowerCase().trim();
    const cleanName = (user?.name || '').toLowerCase().trim();
    const matchingProfiles = (migratedPlayers || []).filter(p => {
      const pId = String(p.userId || '').toLowerCase();
      const pName = String(p.name || '').toLowerCase();
      if (cleanEmail && (cleanEmail.includes('lipniagov') || cleanEmail.includes('nikola') || cleanEmail.includes('sway'))) {
        return pName.includes('nikola') || pName.includes('nick lip') || pId.includes('lipniagov') || pId.includes('1786863204201');
      }
      if (cleanEmail && (cleanEmail.includes('julia') || cleanEmail.includes('voland') || cleanEmail.includes('lipa'))) {
        return pName.includes('julia') || pName.includes('voland') || pId.includes('1787070034849');
      }
      if (cleanEmail && (cleanEmail.includes('irina') || cleanEmail.includes('ирина'))) {
        return pName.includes('ирина') || pId.includes('1786872780877');
      }
      if (cleanEmail && (cleanEmail.includes('stadnikov') || cleanEmail.includes('роман'))) {
        return pName.includes('роман') || pId.includes('1786973820215');
      }
      return pId === String(uId).toLowerCase() || (cleanName && pName === cleanName);
    });

    let maxHistoricalXp = 0;
    let foundAvatar = '';

    for (const prof of matchingProfiles) {
      if (prof.progress && typeof prof.progress === 'object') {
        Object.keys(prof.progress).forEach(wId => {
          if (!mergedProg[wId]) {
            mergedProg[wId] = prof.progress[wId];
          } else {
            mergedProg[wId] = {
              ...mergedProg[wId],
              ...prof.progress[wId],
              correct: Math.max(mergedProg[wId].correct || 0, prof.progress[wId].correct || 0),
              error: Math.max(mergedProg[wId].error || 0, prof.progress[wId].error || 0),
              quizCorrect: Math.max(mergedProg[wId].quizCorrect || 0, prof.progress[wId].quizCorrect || 0),
              pairsCorrect: Math.max(mergedProg[wId].pairsCorrect || 0, prof.progress[wId].pairsCorrect || 0),
              inputCorrect: Math.max(mergedProg[wId].inputCorrect || 0, prof.progress[wId].inputCorrect || 0),
              mastered: Boolean(mergedProg[wId].mastered || prof.progress[wId].mastered),
              seenInCards: Boolean(mergedProg[wId].seenInCards || prof.progress[wId].seenInCards)
            };
          }
        });
      }
      if (Array.isArray(prof.favorites)) {
        prof.favorites.forEach(id => {
          const sid = String(id).trim();
          if (sid && !deletedFavs.has(sid)) mergedFavsSet.add(sid);
        });
      }
      if (prof.weeklyXp && prof.weeklyXp > maxHistoricalXp) {
        maxHistoricalXp = prof.weeklyXp;
      }
      if (prof.avatar && !foundAvatar) {
        let av = prof.avatar;
        if (av.startsWith('./')) av = av.slice(2);
        if (av.includes('?v=')) av = av.split('?')[0];
        foundAvatar = av;
      }
    }

    if (!foundAvatar) {
      foundAvatar = fbDoc?.profile?.avatar || fullDoc?.profile?.avatar || detDoc?.profile?.avatar || user?.avatar || '';
    }

    if (foundAvatar) {
      localStorage.setItem(`avatar_${uId}`, foundAvatar);
      localStorage.setItem('avatar_guest', foundAvatar);
      if (fbUid) localStorage.setItem(`avatar_${fbUid}`, foundAvatar);
      if (detId) localStorage.setItem(`avatar_${detId}`, foundAvatar);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo:avatar_changed', { detail: { avatar: foundAvatar } }));
      }
    }

    localStorage.setItem(progKey, JSON.stringify(mergedProg));

    // Merge XP from Firestore and local
    const xpKey = `xp_${uId}_${wKey}`;
    const localXp = getUserWeeklyXP(uId, wKey);
    let finalFirestoreXp = Math.max(localXp, Number(xp1 || 0), Number(xp2 || 0), Number(xpFb || 0), maxHistoricalXp);

    // Check profile XP
    if (fullDoc?.profile?.xp || fullDoc?.profile?.totalXp) {
      const pXp = Number(fullDoc.profile.xp || fullDoc.profile.totalXp || 0);
      if (pXp > finalFirestoreXp) finalFirestoreXp = pXp;
    }
    if (detDoc?.profile?.xp || detDoc?.profile?.totalXp) {
      const pXp = Number(detDoc.profile.xp || detDoc.profile.totalXp || 0);
      if (pXp > finalFirestoreXp) finalFirestoreXp = pXp;
    }
    if (fbDoc?.profile?.xp || fbDoc?.profile?.totalXp) {
      const pXp = Number(fbDoc.profile.xp || fbDoc.profile.totalXp || 0);
      if (pXp > finalFirestoreXp) finalFirestoreXp = pXp;
    }

    // Fallback: calculate XP from merged progress
    if (finalFirestoreXp <= 0 && mergedProg && Object.keys(mergedProg).length > 0) {
      let calcXp = 0;
      Object.values(mergedProg).forEach((p) => {
        if (p) {
          if (p.mastered) calcXp += 50;
          else if (p.stage === 'test' || (p.inputCorrect && p.inputCorrect > 0)) calcXp += 25;
          else if (p.stage === 'pairs' || (p.pairsCorrect && p.pairsCorrect > 0)) calcXp += 15;
          else if (p.stage === 'quiz' || (p.quizCorrect && p.quizCorrect > 0)) calcXp += 5;
          else if (p.seenInCards) calcXp += 2;
        }
      });
      if (calcXp > 0) finalFirestoreXp = calcXp;
    }



    if (finalFirestoreXp > 0) {
      localStorage.setItem(xpKey, String(finalFirestoreXp));
      localStorage.setItem('xp', String(finalFirestoreXp));
      if (detId && detId !== uId) {
        localStorage.setItem(`xp_${detId}_${wKey}`, String(finalFirestoreXp));
      }
      if (fbUid && fbUid !== uId) {
        localStorage.setItem(`xp_${fbUid}_${wKey}`, String(finalFirestoreXp));
      }
      syncLeaderboardScoreFirestore(getFirestoreUserId(uId), wKey, finalFirestoreXp, user?.name || 'User', foundAvatar || user?.avatar || '');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: finalFirestoreXp, delta: 0 } }));
      }
    }

    if (detId && detId !== uId) {
      const detFavs = sanitizeFavArray(JSON.parse(localStorage.getItem(`favs_${detId}`) || '[]'));
      detFavs.forEach(id => mergedFavsSet.add(String(id)));
    }
    if (fbUid && fbUid !== uId) {
      const fbFavs = sanitizeFavArray(JSON.parse(localStorage.getItem(`favs_${fbUid}`) || '[]'));
      fbFavs.forEach(id => mergedFavsSet.add(String(id)));
    }

    const mergedFavs = Array.from(mergedFavsSet)
      .map(String)
      .map(s => s.trim())
      .filter(id => id && !deletedFavs.has(id));

    localStorage.setItem(`favs_${uId}`, JSON.stringify(mergedFavs));
    if (detId && detId !== uId) {
      localStorage.setItem(`favs_${detId}`, JSON.stringify(mergedFavs));
    }
    if (fbUid && fbUid !== uId) {
      localStorage.setItem(`favs_${fbUid}`, JSON.stringify(mergedFavs));
    }
    const firestoreSyncUid = fbUid || firestoreUid;
    if (firestoreSyncUid && !String(firestoreSyncUid).startsWith('guest_')) {
      saveUserFavoritesFirestore(firestoreSyncUid, mergedFavs).catch(() => {});
    }

    const activeLocalLang = localStorage.getItem('myduo_interface_lang');
    const mergedSettings = {
      ...(fbDoc?.settings || {}),
      ...(detDoc?.settings || {}),
      ...(fullDoc?.settings || {}),
      ...(JSON.parse(localStorage.getItem(`settings_${uId}`) || '{}'))
    };
    if (activeLocalLang) {
      mergedSettings.interfaceLang = activeLocalLang;
    }
    if (Object.keys(mergedSettings).length > 0) {
      localStorage.setItem(`settings_${uId}`, JSON.stringify(mergedSettings));
      if (fbUid && fbUid !== uId) {
        localStorage.setItem(`settings_${fbUid}`, JSON.stringify(mergedSettings));
      }
      if (mergedSettings.theme) {
        localStorage.setItem('myduo_theme', mergedSettings.theme);
        if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
          const app = document.querySelector('.mobile-app');
          if (document.body && document.body.classList) {
            document.body.classList.remove('dark-theme', 'notebook-theme');
          }
          if (app) app.classList.remove('dark-theme', 'notebook-theme');
          if (mergedSettings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (app) app.classList.add('dark-theme');
          } else if (mergedSettings.theme === 'notebook') {
            document.body.classList.add('notebook-theme');
            if (app) app.classList.add('notebook-theme');
          }
        }
      }
      if (mergedSettings.interfaceLang) {
        const oldLang = localStorage.getItem('myduo_interface_lang');
        localStorage.setItem('myduo_interface_lang', mergedSettings.interfaceLang);
        if (oldLang !== mergedSettings.interfaceLang && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('myduo:lang_changed'));
        }
      }
      if (mergedSettings.voiceAccent) {
        localStorage.setItem('myduo_voice_accent', mergedSettings.voiceAccent);
      }
      if (typeof mergedSettings.sfxMuted !== 'undefined') {
        localStorage.setItem('myduo_sfx_muted', String(mergedSettings.sfxMuted));
      }
      if (Array.isArray(mergedSettings.downloadedCategories)) {
        mergedSettings.downloadedCategories.forEach(cat => {
          localStorage.setItem(`myduo_cat_downloaded_us_${cat}`, 'true');
          localStorage.setItem(`myduo_cat_downloaded_uk_${cat}`, 'true');
        });
      }
    }

    // 1. Sync User Notes
    const localNotes = getUserNotesLocal();
    const remoteNotes = { ...(detDoc?.notes || {}), ...(fullDoc?.notes || {}) };
    const mergedNotes = { ...remoteNotes, ...localNotes };
    if (Object.keys(mergedNotes).length > 0) {
      localStorage.setItem('myduo_user_notes', JSON.stringify(mergedNotes));
      saveUserNotesFirestore(uId, mergedNotes).catch(() => {});
      if (cachedWordsList && Array.isArray(cachedWordsList)) {
        applyUserNotes(cachedWordsList);
      }
    }

    // 2. Sync Custom Words
    const remoteCustomWords = Array.isArray(fullDoc?.customWords) ? fullDoc.customWords : (Array.isArray(detDoc?.customWords) ? detDoc.customWords : []);
    if (remoteCustomWords.length > 0 || (cachedWordsList && cachedWordsList.some(w => String(w.id || '').startsWith('custom_')))) {
      if (!cachedWordsList || !Array.isArray(cachedWordsList)) {
        try {
          cachedWordsList = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
        } catch (e) {
          cachedWordsList = [];
        }
      }
      const existingCustomIds = new Set(cachedWordsList.filter(w => String(w.id || '').startsWith('custom_')).map(w => String(w.id)));
      const existingCustomWords = new Set(cachedWordsList.filter(w => String(w.id || '').startsWith('custom_')).map(w => String(w.word || '').toLowerCase()));
      
      let addedAny = false;
      remoteCustomWords.forEach(rcw => {
        if (!existingCustomIds.has(String(rcw.id)) && !existingCustomWords.has(String(rcw.word || '').toLowerCase())) {
          cachedWordsList.unshift(rcw);
          existingCustomIds.add(String(rcw.id));
          existingCustomWords.add(String(rcw.word || '').toLowerCase());
          addedAny = true;
        }
      });

      const allCustomWords = cachedWordsList.filter(w => String(w.id || '').startsWith('custom_'));
      if (allCustomWords.length > 0) {
        saveUserCustomWordsFirestore(uId, allCustomWords).catch(() => {});
      }
      if (addedAny) {
        try {
          localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: cachedWordsList }));
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('myduo:cloud_synced', { detail: { userId: uId, xp: finalFirestoreXp } }));
      window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: finalFirestoreXp } }));
      window.dispatchEvent(new CustomEvent('myduo:progress_updated', { detail: { userId: uId, progress: mergedProg } }));
      window.dispatchEvent(new CustomEvent('myduo_favorites_updated', { detail: mergedFavs }));
    }
  } catch (fsErr) {
    console.warn('Firestore progress & XP load error:', fsErr);
  }

  return null;
}

function pushUserDataToCloud(userId = null, weekKey = null, immediate = false) {
  const uId = userId || getEffectiveUserId();
  if (!uId || String(uId).startsWith('guest_')) return;

  const doSync = async () => {
    const wKey = weekKey || getIsoWeekKey();
    const firestoreUid = getFirestoreUserId(uId);
    const progress = JSON.parse(localStorage.getItem(`progress_${uId}`) || '{}');
    const favorites = JSON.parse(localStorage.getItem(`favs_${uId}`) || '[]');
    const weeklyXp = getUserWeeklyXP(uId, wKey);
    const settings = JSON.parse(localStorage.getItem(`settings_${uId}`) || '{}');
    const avatar = localStorage.getItem(`avatar_${uId}`) || '';
    const user = getCurrentUser();
    const userName = user && user.name ? user.name : 'Участник';

    // 100% Cloud Firestore sync using Firebase UID
    try {
      saveUserProfileFirestore(firestoreUid, { name: userName, avatar, email: user?.email || '' }).catch(() => {});
      if (weeklyXp > 0) {
        syncLeaderboardScoreFirestore(firestoreUid, wKey, weeklyXp, userName, avatar).catch(() => {});
      }
      saveUserFavoritesFirestore(firestoreUid, favorites).catch(() => {});
      saveUserSettingsFirestore(firestoreUid, settings).catch(() => {});
      saveBulkProgressFirestore(firestoreUid, progress).catch(() => {});

      const localNotes = getUserNotesLocal();
      if (Object.keys(localNotes).length > 0) {
        saveUserNotesFirestore(firestoreUid, localNotes).catch(() => {});
      }

      if (cachedWordsList && Array.isArray(cachedWordsList)) {
        const customOnly = cachedWordsList.filter(w => String(w.id || '').startsWith('custom_'));
        if (customOnly.length > 0) {
          saveUserCustomWordsFirestore(firestoreUid, customOnly).catch(() => {});
        }
      }
    } catch (fsErr) {
      console.warn('Firestore sync failed:', fsErr);
    }
  };

  if (immediate) {
    clearTimeout(syncDebounceTimer);
    doSync();
  } else {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(doSync, 400);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushProgressQueue();
      pushUserDataToCloud(null, null, true);
    }
  });
  window.addEventListener('pagehide', () => {
    flushProgressQueue();
    pushUserDataToCloud(null, null, true);
  });
  window.addEventListener('beforeunload', () => {
    flushProgressQueue();
    pushUserDataToCloud(null, null, true);
  });
  window.addEventListener('myduo:pre_logout', () => {
    flushProgressQueue();
    pushUserDataToCloud(null, null, true);
  });
  if (typeof document !== 'undefined') {
    document.addEventListener('pause', () => {
      flushProgressQueue();
      pushUserDataToCloud(null, null, true);
    });
  }
}

function getDeletedFavoritesSet(userId = null) {
  const uId = userId || getEffectiveUserId();
  const user = getCurrentUser();
  const detId = user && user.email ? getDeterministicUserId(user.email) : null;
  const fbUid = user && user.firebaseUid ? user.firebaseUid : null;
  const guestId = getGuestId();

  const set = new Set();
  const keys = [
    uId ? `favs_deleted_${uId}` : null,
    detId ? `favs_deleted_${detId}` : null,
    fbUid ? `favs_deleted_${fbUid}` : null,
    guestId ? `favs_deleted_${guestId}` : null,
    'favs_deleted'
  ].filter(Boolean);

  keys.forEach(k => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach(id => {
            const sid = String(id).trim();
            if (sid) set.add(sid);
          });
        }
      }
    } catch (e) {}
  });

  return set;
}

function recordDeletedFavorite(wordId, userId = null) {
  const sid = String(wordId).trim();
  if (!sid) return;
  const uId = userId || getEffectiveUserId();
  const user = getCurrentUser();
  const detId = user && user.email ? getDeterministicUserId(user.email) : null;
  const fbUid = user && user.firebaseUid ? user.firebaseUid : null;
  const guestId = getGuestId();

  const targetKeys = Array.from(new Set([
    uId ? `favs_deleted_${uId}` : null,
    detId ? `favs_deleted_${detId}` : null,
    fbUid ? `favs_deleted_${fbUid}` : null,
    guestId ? `favs_deleted_${guestId}` : null,
    'favs_deleted'
  ].filter(Boolean)));

  targetKeys.forEach(k => {
    try {
      const list = JSON.parse(localStorage.getItem(k) || '[]');
      const set = new Set(Array.isArray(list) ? list.map(String) : []);
      set.add(sid);
      localStorage.setItem(k, JSON.stringify(Array.from(set)));
    } catch (e) {}
  });
}

function unrecordDeletedFavorite(wordId, userId = null) {
  const sid = String(wordId).trim();
  if (!sid) return;
  const uId = userId || getEffectiveUserId();
  const user = getCurrentUser();
  const detId = user && user.email ? getDeterministicUserId(user.email) : null;
  const fbUid = user && user.firebaseUid ? user.firebaseUid : null;
  const guestId = getGuestId();

  const targetKeys = Array.from(new Set([
    uId ? `favs_deleted_${uId}` : null,
    detId ? `favs_deleted_${detId}` : null,
    fbUid ? `favs_deleted_${fbUid}` : null,
    guestId ? `favs_deleted_${guestId}` : null,
    'favs_deleted'
  ].filter(Boolean)));

  targetKeys.forEach(k => {
    try {
      const list = JSON.parse(localStorage.getItem(k) || '[]');
      if (Array.isArray(list) && list.length > 0) {
        const set = new Set(list.map(String));
        set.delete(sid);
        localStorage.setItem(k, JSON.stringify(Array.from(set)));
      }
    } catch (e) {}
  });
}

function getUserFavorites() {
  const userId = getEffectiveUserId();
  const key = `favs_${userId}`;
  let favs = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      favs = JSON.parse(raw);
    }
  } catch (e) {}

  const deletedSet = getDeletedFavoritesSet(userId);

  // ONLY if the key was never initialized in localStorage (null), perform one-time migration
  if (!Array.isArray(favs)) {
    const merged = new Set();
    try {
      const user = getCurrentUser();
      if (user && user.email) {
        const detId = getDeterministicUserId(user.email);
        if (detId && detId !== userId) {
          const detFavs = JSON.parse(localStorage.getItem(`favs_${detId}`) || '[]');
          if (Array.isArray(detFavs)) detFavs.forEach(id => {
            const sid = String(id).trim();
            if (sid && !deletedSet.has(sid)) merged.add(sid);
          });
        }
      }

      if (user && user.firebaseUid && user.firebaseUid !== userId) {
        const fbFavs = JSON.parse(localStorage.getItem(`favs_${user.firebaseUid}`) || '[]');
        if (Array.isArray(fbFavs)) fbFavs.forEach(id => {
          const sid = String(id).trim();
          if (sid && !deletedSet.has(sid)) merged.add(sid);
        });
      }

      const guestId = getGuestId();
      if (guestId && guestId !== userId) {
        const guestFavs = JSON.parse(localStorage.getItem(`favs_${guestId}`) || '[]');
        if (Array.isArray(guestFavs)) guestFavs.forEach(id => {
          const sid = String(id).trim();
          if (sid && !deletedSet.has(sid)) merged.add(sid);
        });
      }

      const legacyKeys = ['favs_guest', 'dl_favorites', 'favorites', 'myduo_favorites', 'favs'];
      legacyKeys.forEach(k => {
        const arr = JSON.parse(localStorage.getItem(k) || '[]');
        if (Array.isArray(arr)) arr.forEach(id => {
          const sid = String(id).trim();
          if (sid && !deletedSet.has(sid)) merged.add(sid);
        });
      });
    } catch (e) {}

    favs = Array.from(merged).filter(id => id && !deletedSet.has(id));
    try {
      localStorage.setItem(key, JSON.stringify(favs));
    } catch (e) {}
  }

  const cleanFavs = (Array.isArray(favs) ? favs : [])
    .map(id => String(id).trim())
    .filter(id => id && !deletedSet.has(id));

  return cleanFavs;
}

async function toggleFavoriteApi(wordId, isFavorite) {
  const userId = getEffectiveUserId();
  const wordIdStr = String(wordId).trim();
  if (!wordIdStr) return;

  const user = getCurrentUser();
  const detId = user && user.email ? getDeterministicUserId(user.email) : null;
  const fbUid = user && user.firebaseUid ? user.firebaseUid : null;
  const guestId = getGuestId();

  let favs = getUserFavorites();

  if (isFavorite) {
    unrecordDeletedFavorite(wordIdStr, userId);
    if (!favs.includes(wordIdStr)) {
      favs.push(wordIdStr);
    }
  } else {
    recordDeletedFavorite(wordIdStr, userId);
    favs = favs.filter(id => String(id).trim() !== wordIdStr);

    // Deep purge across all legacy, guest, and variant localStorage keys
    const purgeKeys = new Set([
      'favs_guest',
      'dl_favorites',
      'favorites',
      'myduo_favorites',
      'favs',
      guestId ? `favs_${guestId}` : null
    ].filter(Boolean));

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('favs_') || k.startsWith('favorites_')) && !k.includes('deleted')) {
          purgeKeys.add(k);
        }
      }
    } catch (e) {}

    purgeKeys.forEach(k => {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(id => String(id).trim() !== wordIdStr);
            localStorage.setItem(k, JSON.stringify(filtered));
          }
        }
      } catch (e) {}
    });
  }

  // Save the updated list to primary user key and aliases
  const serialized = JSON.stringify(favs);
  localStorage.setItem(`favs_${userId}`, serialized);
  if (detId && detId !== userId) localStorage.setItem(`favs_${detId}`, serialized);
  if (fbUid && fbUid !== userId) localStorage.setItem(`favs_${fbUid}`, serialized);

  // Dispatch UI update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo_favorites_updated', { detail: favs }));
  }

  // Synchronize to Firestore only via Firebase UID (required by security rules: request.auth.uid == userId)
  const fsUid = fbUid || getFirestoreUserId(userId);
  if (fsUid && !String(fsUid).startsWith('guest_')) {
    try {
      saveUserFavoritesFirestore(fsUid, favs).catch(() => {});
    } catch (e) {}
  }

  pushUserDataToCloud(userId);
}

async function clearAllFavoritesApi() {
  const userId = getEffectiveUserId();
  const user = getCurrentUser();
  const detId = user && user.email ? getDeterministicUserId(user.email) : null;
  const fbUid = user && user.firebaseUid ? user.firebaseUid : null;
  const guestId = getGuestId();

  const currentFavs = getUserFavorites();
  currentFavs.forEach(id => recordDeletedFavorite(id, userId));

  localStorage.setItem(`favs_${userId}`, JSON.stringify([]));
  if (detId && detId !== userId) localStorage.setItem(`favs_${detId}`, JSON.stringify([]));
  if (fbUid && fbUid !== userId) localStorage.setItem(`favs_${fbUid}`, JSON.stringify([]));
  if (guestId && guestId !== userId) localStorage.setItem(`favs_${guestId}`, JSON.stringify([]));

  const legacyKeys = ['favs_guest', 'dl_favorites', 'favorites', 'myduo_favorites', 'favs'];
  legacyKeys.forEach(k => {
    try { localStorage.setItem(k, JSON.stringify([])); } catch (e) {}
  });

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('favs_') || k.startsWith('favorites_')) && !k.includes('deleted')) {
        localStorage.setItem(k, JSON.stringify([]));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo_favorites_updated', { detail: [] }));
  }

  const fsUid = fbUid || getFirestoreUserId(userId);
  if (fsUid && !String(fsUid).startsWith('guest_')) {
    try {
      saveUserFavoritesFirestore(fsUid, []).catch(() => {});
    } catch (e) {}
  }

  pushUserDataToCloud(userId);
}

function isWordMastered(prog) {
  if (!prog) return false;
  return Boolean(
    prog.mastered === true ||
    prog.known === true ||
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

function getQueueForCards(words, progress, favorites = null) {
  if (!words || words.length === 0) return [];
  const favs = favorites !== null ? favorites : (typeof getUserFavorites === 'function' ? getUserFavorites() : []);
  const favSet = new Set((favs || []).map(String));

  // Count unmastered words already accepted into the learning batch this round
  const pickedInRound = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return !favSet.has(String(w.id)) && p && p.roundCardsDone === true && !isWordMastered(p);
  });

  const totalUnmastered = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    return !favSet.has(String(w.id)) && (!p || !isWordMastered(p));
  });

  const targetCount = Math.min(10, totalUnmastered.length);

  // If target quota (10 unmastered words) is already selected, Cards intake is done!
  if (pickedInRound.length >= targetCount && targetCount > 0) {
    return [];
  }

  // Candidate unmastered words that have NOT yet been accepted
  const candidates = words.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    if (favSet.has(String(w.id))) return false;
    if (p && isWordMastered(p)) return false;
    return !p || p.roundCardsDone !== true;
  });

  // Sort candidate intake strictly by Zipf frequency descending (most frequent first)
  candidates.sort((a, b) => (Number(b.zipf) || 0) - (Number(a.zipf) || 0));

  return candidates;
}

function prepareTrainingBatch(categoryWords, userProgress, favorites = [], pickedWords = []) {
  if (!categoryWords || categoryWords.length === 0) return [];

  const favSet = new Set((favorites || []).map(String));

  // 1. Gather up to 10 base words (ONLY NEW / UNMASTERED words, NEVER Favorites!):
  let baseWords = [];
  if (Array.isArray(pickedWords) && pickedWords.length > 0) {
    baseWords = pickedWords.slice(0, 10);
  } else {
    // Filter out any word that is in favorites or already mastered
    const candidateNewWords = categoryWords.filter((w) => {
      const p = userProgress[w.id] || userProgress[String(w.id)];
      return !favSet.has(String(w.id)) && (!p || !isWordMastered(p));
    });

    // Split candidate new words into those with pending round cards vs unstarted
    const pendingInRound = candidateNewWords.filter((w) => {
      const p = userProgress[w.id] || userProgress[String(w.id)];
      return p && p.roundCardsDone;
    });

    const unstarted = candidateNewWords.filter((w) => {
      const p = userProgress[w.id] || userProgress[String(w.id)];
      return !p || !p.seenInCards;
    });
    unstarted.sort((a, b) => (Number(b.zipf) || 0) - (Number(a.zipf) || 0));

    // Combine to form baseWords (up to 10)
    const baseWordsSet = new Set();
    for (const w of [...pendingInRound, ...unstarted]) {
      if (baseWords.length >= 10) break;
      const idStr = String(w.id);
      if (!baseWordsSet.has(idStr)) {
        baseWordsSet.add(idStr);
        baseWords.push(w);
      }
    }

    // If still empty (e.g. all non-favorite words are mastered), fallback to any unmastered words
    if (baseWords.length === 0) {
      const remainingUnmastered = candidateNewWords.slice(0, 10);
      baseWords.push(...remainingUnmastered);
    }
  }

  if (baseWords.length === 0) {
    return [];
  }

  const baseIds = new Set(baseWords.map((w) => String(w.id)));

  // Word pool for review words (favorites and mastered):
  // STRICTLY within categoryWords! Words from other categories must NEVER be mixed into the conveyor.
  const reviewWordPool = [...categoryWords];

  // 2. Pick up to 5 oldest Favorites (LRU by lastReviewedAt / lastPracticed ascending)
  let injectedFavs = [];
  if (favorites && favorites.length > 0) {
    const candidateFavs = reviewWordPool.filter((w) => {
      return favSet.has(String(w.id)) && !baseIds.has(String(w.id));
    });
    candidateFavs.sort((a, b) => {
      const pA = userProgress[a.id] || userProgress[String(a.id)];
      const pB = userProgress[b.id] || userProgress[String(b.id)];
      const tA = pA ? (pA.lastReviewedAt || pA.lastPracticed || 0) : 0;
      const tB = pB ? (pB.lastReviewedAt || pB.lastPracticed || 0) : 0;
      return tA - tB;
    });
    injectedFavs = candidateFavs.slice(0, 5);
  }

  const combinedIds = new Set([...baseIds, ...injectedFavs.map((w) => String(w.id))]);

  // 3. Pick oldest Mastered words (LRU by lastReviewedAt / lastPracticed / masteredAt ascending)
  // Quota: 5 words + shortfall from favorites if favorites < 5 (total review words up to 10)
  const neededMastered = Math.max(0, 10 - injectedFavs.length);
  let injectedMastered = [];
  if (neededMastered > 0) {
    const candidateMastered = reviewWordPool.filter((w) => {
      const p = userProgress[w.id] || userProgress[String(w.id)];
      return p && isWordMastered(p) && !combinedIds.has(String(w.id));
    });
    candidateMastered.sort((a, b) => {
      const pA = userProgress[a.id] || userProgress[String(a.id)];
      const pB = userProgress[b.id] || userProgress[String(b.id)];
      const tA = pA ? (pA.lastReviewedAt || pA.lastPracticed || pA.masteredAt || 0) : 0;
      const tB = pB ? (pB.lastReviewedAt || pB.lastPracticed || pB.masteredAt || 0) : 0;
      return tA - tB;
    });
    injectedMastered = candidateMastered.slice(0, neededMastered);
  }

  const bonusWords = [...injectedFavs, ...injectedMastered];

  // Up to 20 words in conveyor: up to 10 base (new words) + up to 10 review (5 favs + 5 mastered)
  return [...baseWords, ...bonusWords].slice(0, 20);
}

function getCategoryBatchKey(categoryWords) {
  if (Array.isArray(categoryWords) && categoryWords.length > 0 && categoryWords[0] && categoryWords[0].category) {
    return String(categoryWords[0].category).trim().toLowerCase().replace(/[^a-z0-9_]+/gi, '_');
  }
  return 'default';
}

function getActiveConveyorBatch(categoryWords, userProgress, favorites = []) {
  if (!Array.isArray(categoryWords) || categoryWords.length === 0) {
    return [];
  }
  const userId = getEffectiveUserId();
  const catKey = getCategoryBatchKey(categoryWords);
  const storageKey = `conveyor_batch_${userId}_${catKey}`;
  const raw = localStorage.getItem(storageKey);
  let batchIds = [];
  try {
    batchIds = raw ? JSON.parse(raw) : [];
  } catch (e) {
    batchIds = [];
  }

  // Index ONLY category words - never resolve words outside the active category
  const wordMap = new Map();
  categoryWords.forEach((w) => wordMap.set(String(w.id), w));

  if (Array.isArray(batchIds) && batchIds.length > 0) {
    const resolved = batchIds.map((id) => wordMap.get(String(id))).filter(Boolean);
    
    // Check if the resolved batch still has uncompleted words in this round
    const hasActiveWords = resolved.some((w) => {
      const p = userProgress[w.id] || userProgress[String(w.id)];
      if (!p) return true; // not even opened in cards
      if (!p.roundCardsDone) return true; // needs cards
      if (isWordMastered(p)) {
        return !p.roundTestDone;
      }
      return !p.roundTestDone && (p.inputCorrect || 0) < 2;
    });

    if (hasActiveWords && resolved.length > 0) {
      return resolved;
    } else {
      clearActiveConveyorBatch(categoryWords);
    }
  }

  const freshBatch = prepareTrainingBatch(categoryWords, userProgress, favorites);
  if (freshBatch.length > 0) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(freshBatch.map((w) => String(w.id))));
    } catch (e) {}
  }
  return freshBatch;
}

function clearActiveConveyorBatch(categoryWordsOrKey = null) {
  const userId = getEffectiveUserId();
  try {
    // 1. Remove legacy un-scoped batch key
    localStorage.removeItem(`conveyor_batch_${userId}`);

    // 2. Remove category-specific key or all category conveyor keys
    if (typeof categoryWordsOrKey === 'string') {
      localStorage.removeItem(`conveyor_batch_${userId}_${categoryWordsOrKey}`);
    } else if (Array.isArray(categoryWordsOrKey)) {
      const catKey = getCategoryBatchKey(categoryWordsOrKey);
      localStorage.removeItem(`conveyor_batch_${userId}_${catKey}`);
    } else {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`conveyor_batch_${userId}`)) {
          localStorage.removeItem(k);
        }
      }
    }

    // 3. Clear round flags in user progress
    const key = `progress_${userId}`;
    const local = JSON.parse(localStorage.getItem(key) || '{}');
    let changed = false;
    const targetIds = Array.isArray(categoryWordsOrKey)
      ? new Set(categoryWordsOrKey.map((w) => String(w.id)))
      : null;

    Object.entries(local).forEach(([id, p]) => {
      if (targetIds && !targetIds.has(String(id))) return;
      if (p.roundCardsDone || p.roundQuizDone || p.roundPairsDone || p.roundTestDone) {
        delete p.roundCardsDone;
        delete p.roundQuizDone;
        delete p.roundPairsDone;
        delete p.roundTestDone;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(key, JSON.stringify(local));
    }
  } catch (e) {}
}

function getQueueForQuiz(words, progress, favorites = null) {
  const favs = favorites !== null ? favorites : (typeof getUserFavorites === 'function' ? getUserFavorites() : []);
  const batch = getActiveConveyorBatch(words, progress, favs);
  if (!batch || batch.length === 0) return [];
  const favSet = new Set((favs || []).map(String));

  return batch.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    const isFav = favSet.has(String(w.id));
    const isMastered = p && isWordMastered(p);

    // Review words (Favorites and Mastered) connect directly into Quiz:
    if (isFav || isMastered) {
      return p ? p.roundQuizDone !== true : true;
    }

    if (!p) return false;
    // New words must have completed Cards first
    if (p.roundCardsDone !== true) return false;
    return (p.quizCorrect || 0) < 5 && p.roundQuizDone !== true;
  });
}

function getQueueForPairs(words, progress, favorites = null) {
  const favs = favorites !== null ? favorites : (typeof getUserFavorites === 'function' ? getUserFavorites() : []);
  const batch = getActiveConveyorBatch(words, progress, favs);
  if (!batch || batch.length === 0) return [];
  const favSet = new Set((favs || []).map(String));

  return batch.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    if (!p) return false;
    const isFav = favSet.has(String(w.id));
    const isMastered = isWordMastered(p);

    if (isFav || isMastered) {
      return p.roundQuizDone === true && p.roundPairsDone !== true;
    }

    // New words must have completed Cards first
    if (p.roundCardsDone !== true) return false;
    return (p.quizCorrect || 0) >= 5 && (p.pairsCorrect || 0) < 1 && p.roundPairsDone !== true;
  });
}

function getQueueForTest(words, progress, favorites = null) {
  const favs = favorites !== null ? favorites : (typeof getUserFavorites === 'function' ? getUserFavorites() : []);
  const batch = getActiveConveyorBatch(words, progress, favs);
  if (!batch || batch.length === 0) return [];
  const favSet = new Set((favs || []).map(String));

  return batch.filter((w) => {
    const p = progress[w.id] || progress[String(w.id)];
    if (!p) return false;
    const isFav = favSet.has(String(w.id));
    const isMastered = isWordMastered(p);

    if (isFav || isMastered) {
      return p.roundPairsDone === true && p.roundTestDone !== true;
    }

    return Boolean(
      p.roundCardsDone === true &&
      (p.pairsCorrect || 0) >= 1 &&
      (p.inputCorrect || 0) < 2 &&
      p.roundTestDone !== true
    );
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

  const wotdBackgroundPromise = Promise.resolve(null);

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
  const activeLang = localStorage.getItem('myduo_interface_lang') || 'en';
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
        interfaceLang: activeLang,
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
    interfaceLang: activeLang,
  };
}

async function saveUserSettings(settings) {
  const userId = getEffectiveUserId();
  const cat = (settings.category && settings.category !== 'All' && settings.category !== 'Все категории')
    ? settings.category
    : 'Elementary';

  // Primary source of truth for language is active selection in localStorage or explicit override
  const activeLocalLang = localStorage.getItem('myduo_interface_lang');
  let currentLang = (settings && settings.interfaceLang && settings.interfaceLang !== 'undefined')
    ? settings.interfaceLang
    : (activeLocalLang || 'en');
  localStorage.setItem('myduo_interface_lang', currentLang);

  const currentTheme = localStorage.getItem('myduo_theme') || 'light';
  const currentAccent = localStorage.getItem('myduo_voice_accent') || 'us';
  const currentSfx = localStorage.getItem('myduo_sfx_muted') === 'true';

  // Collect downloaded category audio flags
  const downloadedCats = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('myduo_cat_downloaded_') && localStorage.getItem(k) === 'true') {
        const parts = k.split('_');
        const catName = parts.slice(4).join('_');
        if (catName && !downloadedCats.includes(catName)) {
          downloadedCats.push(catName);
        }
      }
    }
  } catch (e) {}

  const payload = {
    dailyGoal: 10,
    theme: currentTheme,
    voiceAccent: currentAccent,
    sfxMuted: currentSfx,
    downloadedCategories: downloadedCats,
    ...settings,
    interfaceLang: currentLang,
    preferredMethod: settings.preferredMethod || 'cards',
    category: cat,
    level: cat,
    userId,
  };

  const key = `settings_${userId}`;
  localStorage.setItem(key, JSON.stringify(payload));
  if (payload.theme) localStorage.setItem('myduo_theme', payload.theme);
  if (payload.interfaceLang) localStorage.setItem('myduo_interface_lang', payload.interfaceLang);
  if (payload.voiceAccent) localStorage.setItem('myduo_voice_accent', payload.voiceAccent);
  if (typeof payload.sfxMuted !== 'undefined') localStorage.setItem('myduo_sfx_muted', String(payload.sfxMuted));

  // Sync to Cloud Firestore
  try {
    saveUserSettingsFirestore(userId, payload).catch(() => {});
    const user = getCurrentUser();
    if (user?.firebaseUid && user.firebaseUid !== userId) {
      saveUserSettingsFirestore(user.firebaseUid, payload).catch(() => {});
    }
  } catch (e) {}

  pushUserDataToCloud(userId);
  return payload;
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

  // 1. Filter quality words of the day:
  // - No patterns (category includes 'pattern')
  // - No irregular verbs (category includes 'irregular')
  // - No words shorter than 4 letters
  // - No words longer than 13 letters
  // - Exclude phrases with spaces/slashes and pure service words
  const eligible = wordsList.filter((w) => {
    if (!w) return false;
    const cat = String(w.category || '').toLowerCase().trim();
    if (cat.includes('pattern')) return false;
    if (cat.includes('irregular')) return false;

    const text = String(w.word || '').trim();
    if (!text || text.includes(' ') || text.includes('/')) return false;

    const cleanLetters = text.replace(/[^a-zA-Z]/g, '');
    if (cleanLetters.length < 4 || cleanLetters.length > 13) return false;
    if (text.length < 4 || text.length > 13) return false;

    const lower = text.toLowerCase();
    if (['with', 'from', 'into', 'than', 'then', 'that', 'this', 'them', 'they'].includes(lower)) return false;
    return true;
  });

  const pool = eligible.length > 0 ? eligible : wordsList;

  // 2. Sort words strictly by ID ascending so the ordering is 100% identical on all devices
  const sorted = [...pool].sort((a, b) => {
    const idA = Number(a.id) || 0;
    const idB = Number(b.id) || 0;
    if (idA !== idB) return idA - idB;
    return String(a.word || '').localeCompare(String(b.word || ''));
  });

  // 3. Standardized UTC calendar date (YYYY-MM-DD)
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  // 4. Uniform 32-bit hash for daily rotation
  let hash = 2166136261;
  for (let i = 0; i < todayStr.length; i++) {
    hash ^= todayStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const idx = Math.abs(hash >>> 0) % sorted.length;
  return sorted[idx];
}

async function transcribeAudio(audioBlob, mimeType, expectedWord) {
  // Use Web Speech API for real speech recognition (works in Chrome/Android WebView)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Fallback: feature not available — return neutral result (no score)
    return {
      transcribed: '',
      isCorrect: false,
      score: null,
      feedback: '',
      timings: { totalClientMs: 0 },
    };
  }

  return new Promise((resolve) => {
    const t0 = Date.now();
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    recognition.onresult = (event) => {
      const totalMs = Date.now() - t0;
      const expected = (expectedWord || '').toLowerCase().trim();
      let bestTranscribed = '';
      let bestScore = 0;

      // Check all alternatives for the best match
      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i].transcript.toLowerCase().trim();
        // Simple similarity: exact match or one contains the other
        let score = 0;
        if (alt === expected) {
          score = 100;
        } else if (alt.includes(expected) || expected.includes(alt)) {
          score = Math.round(85 * (Math.min(alt.length, expected.length) / Math.max(alt.length, expected.length)));
        } else {
          // Character-level similarity (Dice coefficient on bigrams)
          const bigrams = (s) => { const b = new Set(); for (let j = 0; j < s.length - 1; j++) b.add(s[j] + s[j+1]); return b; };
          const bA = bigrams(alt), bE = bigrams(expected);
          let inter = 0; bA.forEach(b => { if (bE.has(b)) inter++; });
          score = bA.size + bE.size > 0 ? Math.round((2 * inter / (bA.size + bE.size)) * 100) : 0;
        }
        if (score > bestScore) { bestScore = score; bestTranscribed = alt; }
      }

      const isCorrect = bestScore >= 70;
      let feedback = '';
      if (!isCorrect && bestTranscribed) {
        feedback = `Услышано: «${bestTranscribed}»`;
      }

      settle({
        transcribed: bestTranscribed,
        isCorrect,
        score: bestScore,
        feedback,
        timings: { totalClientMs: totalMs },
      });
    };

    recognition.onerror = (event) => {
      settle({ transcribed: '', isCorrect: false, score: null, feedback: '', timings: { totalClientMs: Date.now() - t0 } });
    };

    recognition.onend = () => {
      // If no result was fired before end
      settle({ transcribed: '', isCorrect: false, score: null, feedback: '', timings: { totalClientMs: Date.now() - t0 } });
    };

    recognition.start();
  });
}


async function transcribePingAudio(audioBlob, mimeType, expectedWord) {
  return {
    success: true,
    totalClientMs: 10,
  };
}

async function getCloudWordOfTheDayId(userId) {
  return null;
}

// Safe weekly cleanup helper (preserves valid XP)
function runWeeklyXpCleanup() {
  // No-op: preserves legitimate user weekly XP and prevents destructive resets
}

// ----------------- FIRESTORE SESSION & USAGE TRACKING -----------------

let _sessionGeoCache = null;
let _sessionHeartbeatTimer = null;
let _lastHiddenTimestamp = 0;

async function fetchGeoLocation() {
  if (_sessionGeoCache) return _sessionGeoCache;
  try {
    const cached = localStorage.getItem('myduo_cached_geo');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - (parsed.timestamp || 0) < 86400000) { // 24h cache
        _sessionGeoCache = parsed.data;
        return _sessionGeoCache;
      }
    }
  } catch (e) {}

  try {
    const geoRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
    if (geoRes) {
      let location = 'Unknown Location';
      const country = geoRes.country_name || '';
      const city = geoRes.city || '';
      if (country || city) {
        location = [country, city].filter(Boolean).join(', ');
      }
      _sessionGeoCache = {
        location,
        ipAddress: geoRes.ip || '',
        country: geoRes.country_name || '',
        city: geoRes.city || ''
      };
      localStorage.setItem('myduo_cached_geo', JSON.stringify({
        timestamp: Date.now(),
        data: _sessionGeoCache
      }));
      return _sessionGeoCache;
    }
  } catch (err) {
    console.warn('Silent geolocation fetch failed:', err);
  }
  return { location: 'Unknown Location', ipAddress: '', country: '', city: '' };
}

function getAttributionData() {
  let attribution = {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    gclid: '',
    fbclid: '',
    referrer: (typeof document !== 'undefined' && document.referrer) || '',
    firstSeenAt: Date.now(),
  };

  try {
    const saved = localStorage.getItem('myduo_attribution');
    if (saved) {
      attribution = { ...attribution, ...JSON.parse(saved) };
    }

    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get('utm_source') || params.get('source') || '';
      const utm_medium = params.get('utm_medium') || params.get('medium') || '';
      const utm_campaign = params.get('utm_campaign') || params.get('campaign') || '';
      const utm_content = params.get('utm_content') || params.get('content') || '';
      const utm_term = params.get('utm_term') || params.get('term') || '';
      const gclid = params.get('gclid') || '';
      const fbclid = params.get('fbclid') || '';

      if (utm_source || utm_campaign || gclid || fbclid || utm_medium) {
        attribution = {
          ...attribution,
          utm_source: utm_source || attribution.utm_source,
          utm_medium: utm_medium || attribution.utm_medium,
          utm_campaign: utm_campaign || attribution.utm_campaign,
          utm_content: utm_content || attribution.utm_content,
          utm_term: utm_term || attribution.utm_term,
          gclid: gclid || attribution.gclid,
          fbclid: fbclid || attribution.fbclid,
          referrer: (typeof document !== 'undefined' && document.referrer) || attribution.referrer,
        };
        localStorage.setItem('myduo_attribution', JSON.stringify(attribution));
      }
    } else if (!saved) {
      localStorage.setItem('myduo_attribution', JSON.stringify(attribution));
    }
  } catch (e) {}

  return attribution;
}

function getClientEnvironmentMetrics() {
  let deviceType = 'Desktop';
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    if (/Tablet|iPad/i.test(ua)) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Mobile';
    }
  }

  let os = 'Unknown OS';
  if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('X11') !== -1) os = 'UNIX';

  let browser = 'Unknown Browser';
  if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Chromium') === -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Edg') !== -1) browser = 'Edge';
  else if (ua.indexOf('OPR') !== -1 || ua.indexOf('Opera') !== -1) browser = 'Opera';

  const language = (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0]))) || 'ru';
  const timezone = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  const resolution = (typeof window !== 'undefined' && window.screen) ? `${window.screen.width}x${window.screen.height}` : '0x0';
  const rawReferrer = (typeof document !== 'undefined' && document.referrer) || '';
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) ? `${navigator.hardwareConcurrency} cores` : '';
  const ram = (typeof navigator !== 'undefined' && navigator.deviceMemory) ? `${navigator.deviceMemory} GB` : '';

  const isNative = typeof window !== 'undefined' && !!(window.Capacitor?.isNativePlatform?.());
  const isPwa = typeof window !== 'undefined' && ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator && window.navigator.standalone === true));
  const appMode = isNative ? 'Android App (Capacitor)' : (isPwa ? 'PWA (App)' : 'Browser Tab');
  const platform = isNative ? 'android' : 'web';

  const attr = getAttributionData();

  return {
    deviceType,
    os,
    browser,
    language,
    timezone,
    resolution,
    referrer: attr.referrer || rawReferrer || 'direct',
    utmSource: attr.utm_source || 'organic',
    utmMedium: attr.utm_medium || '',
    utmCampaign: attr.utm_campaign || 'direct',
    utmContent: attr.utm_content || '',
    utmTerm: attr.utm_term || '',
    gclid: attr.gclid || '',
    fbclid: attr.fbclid || '',
    cores,
    ram,
    appMode,
    platform
  };
}

function getWordsStudiedCount(userId) {
  try {
    const raw = localStorage.getItem(`progress_${userId}`);
    if (!raw) return 0;
    const progress = JSON.parse(raw);
    let count = 0;
    for (const id of Object.keys(progress)) {
      const p = progress[id];
      if (p && (p.stage > 0 || p.timesPracticed > 0 || p.correctCount > 0 || p.masteredAt)) {
        count++;
      }
    }
    return count;
  } catch (e) {
    return 0;
  }
}

function ensureActiveSession(userId) {
  if (typeof window === 'undefined') return;
  const now = Date.now();

  if (!window._appSessionId || window._sessionUserId !== userId) {
    window._sessionUserId = userId;
    window._appSessionStartTime = now;
    window._sessionLastTick = now;
    window._sessionAccumulatedSeconds = 0;
    window._appSessionId = `sess_${userId}_${now}`;

    // Increment total user session count
    const sessCountKey = `myduo_session_count_${userId}`;
    const totalSessions = Number(localStorage.getItem(sessCountKey) || 0) + 1;
    localStorage.setItem(sessCountKey, String(totalSessions));
  }
}

function tickSessionActiveTime() {
  if (typeof window === 'undefined') return 0;
  const now = Date.now();
  const lastTick = window._sessionLastTick || now;
  window._sessionLastTick = now;

  // Only accumulate if document was visible or small interval (< 120s)
  const deltaMs = now - lastTick;
  if (deltaMs > 0 && deltaMs < 120000) {
    const deltaSec = Math.round(deltaMs / 1000);
    window._sessionAccumulatedSeconds = (window._sessionAccumulatedSeconds || 0) + deltaSec;

    // Increment persistent total usage time for this user
    const userId = window._sessionUserId || getEffectiveUserId();
    const totalTimeKey = `myduo_total_usage_seconds_${userId}`;
    const currentTotal = Number(localStorage.getItem(totalTimeKey) || 0) + deltaSec;
    localStorage.setItem(totalTimeKey, String(currentTotal));
  }
  return window._sessionAccumulatedSeconds || 0;
}

async function sendUserAnalytics(isClosing = false, customStatus = null) {
  if (typeof window === 'undefined') return;
  const currentUserId = getEffectiveUserId();
  if (!currentUserId || String(currentUserId).startsWith('guest_')) return;
  ensureActiveSession(currentUserId);
  tickSessionActiveTime();

  const now = Date.now();
  const sessionStartTime = window._appSessionStartTime || now;
  const sessionId = window._appSessionId || `sess_${currentUserId}_${now}`;
  const durationSec = Math.max(1, window._sessionAccumulatedSeconds || Math.round((now - sessionStartTime) / 1000));
  const durationMin = Number((durationSec / 60).toFixed(2));
  const status = customStatus || (isClosing ? 'completed' : 'active');

  const totalTimeKey = `myduo_total_usage_seconds_${currentUserId}`;
  const totalUserUsageSeconds = Number(localStorage.getItem(totalTimeKey) || durationSec);
  const sessCountKey = `myduo_session_count_${currentUserId}`;
  const totalUserSessions = Number(localStorage.getItem(sessCountKey) || 1);

  try {
    const currentUser = getCurrentUser();
    const email = currentUser && currentUser.email ? currentUser.email : 'guest';
    const name = currentUser && currentUser.name ? currentUser.name : 'Гость';

    const env = getClientEnvironmentMetrics();
    const geo = await fetchGeoLocation();

    const tabSwitches = Number(window._tabSwitchCount || 0);
    const roundsCompleted = Number(localStorage.getItem(`myduo_rounds_count_${currentUserId}`) || 0);
    const audioClicks = Number(localStorage.getItem(`myduo_audio_clicks_${currentUserId}`) || 0);
    let favsAdded = 0;
    try {
      const favs = JSON.parse(localStorage.getItem(`favs_${currentUserId}`) || '[]');
      favsAdded = favs.length;
    } catch(e) {}
    const wordsStudied = getWordsStudiedCount(currentUserId);

    const sessionPayload = {
      sessionId,
      userId: currentUserId,
      email,
      name,
      sessionStart: sessionStartTime,
      sessionStartIso: new Date(sessionStartTime).toISOString(),
      sessionEnd: now,
      sessionEndIso: new Date(now).toISOString(),
      durationSeconds: durationSec,
      durationMinutes: durationMin,
      status,
      ...env,
      location: geo.location || 'Unknown Location',
      ipAddress: geo.ipAddress || '',
      tabSwitches,
      roundsCompleted,
      audioClicks,
      favsAdded,
      wordsStudied
    };

    // 1. Write full session record to Firestore /sessions/{sessionId}
    saveSessionFirestore(sessionId, sessionPayload, isClosing);

    // 2. Update user profile document /users/{userId} with aggregated usage stats
    const attr = getAttributionData();
    updateUserSessionSummaryFirestore(currentUserId, {
      lastActiveAt: now,
      lastActiveIso: new Date(now).toISOString(),
      totalActiveSeconds: totalUserUsageSeconds,
      totalActiveMinutes: Number((totalUserUsageSeconds / 60).toFixed(2)),
      sessionCount: totalUserSessions,
      lastSessionId: sessionId,
      campaign: attr.utm_campaign || 'direct',
      source: attr.utm_source || 'organic',
      medium: attr.utm_medium || '',
      referrer: attr.referrer || 'direct',
      gclid: attr.gclid || '',
      fbclid: attr.fbclid || '',
    }, isClosing);
  } catch (e) {
    console.warn('Failed to save session analytics in Firestore:', e);
  }
}

let _analyticsDebounceTimer = null;
function sendUserAnalyticsDebounced(delay = 1000) {
  if (_analyticsDebounceTimer) clearTimeout(_analyticsDebounceTimer);
  _analyticsDebounceTimer = setTimeout(() => {
    sendUserAnalytics(false, 'active');
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

// Automatically trigger on page load & initialize session lifecycle
try {
  runWeeklyXpCleanup();
  if (typeof window !== 'undefined') {
    ensureActiveSession(getEffectiveUserId());
    sendUserAnalytics(false, 'active');

    // Heartbeat timer disabled: analytics sent on session events and round completions to conserve quota

    if (!window._sessionListenersInitialized) {
      window._sessionListenersInitialized = true;
      window._tabSwitchCount = 0;

      window.addEventListener('myduo:auth_changed', () => {
        // Finalize old session and start new user session
        sendUserAnalytics(true, 'completed');
        window._appSessionId = null;
        ensureActiveSession(getEffectiveUserId());
        sendUserAnalytics(false, 'active');
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          window._tabSwitchCount = (window._tabSwitchCount || 0) + 1;
          _lastHiddenTimestamp = Date.now();
          sendUserAnalytics(true, 'paused');
        } else {
          // If returning after > 5 minutes in background, start a fresh session
          if (_lastHiddenTimestamp && (Date.now() - _lastHiddenTimestamp > 300000)) {
            window._appSessionId = null;
            ensureActiveSession(getEffectiveUserId());
          } else {
            window._sessionLastTick = Date.now();
          }
          sendUserAnalytics(false, 'active');
        }
      });

      window.addEventListener('pagehide', () => {
        sendUserAnalytics(true, 'completed');
      });

      window.addEventListener('beforeunload', () => {
        sendUserAnalytics(true, 'completed');
      });
    }
  }
} catch (e) {}

async function addCustomWord({ word, translation, category, notes }) {
  const cleanW = String(word || '').replace(/[\u00ad\u200b\ufeff]/g, '').trim();
  const cleanTrans = String(translation || '').replace(/[\u00ad\u200b\ufeff]/g, '').trim();
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
    zipf: 0,
  };

  let lang = 'ru';
  try {
    lang = localStorage.getItem('myduo_interface_lang') || 'ru';
  } catch (e) {}

  const payload = {
    action: 'addword',
    route: 'addword',
    word: cleanW,
    translation: cleanTrans,
    category: cleanCat,
    notes: cleanNotes,
    lang,
    language: lang,
  };

  let savedWord = localWord;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const response = await fetch(`${GAS_SCANNER_URL}?route=addword`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await response.json();
    if (json && json.success && json.data && json.data.word) {
      savedWord = json.data.word;
    } else if (json && json.success === false) {
      throw new Error(json.error || 'Слово или фраза отклонена сервером.');
    }
  } catch (netErr) {
    if (netErr.message && netErr.message.includes('отклонена')) throw netErr;
    console.warn('Network error during addCustomWord, saving locally:', netErr);
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
    savedWord = cachedWordsList[idx];
  } else {
    cachedWordsList.unshift(savedWord);
  }

  // Save personal note to notes map (User personal database in Firestore)
  if (cleanNotes) {
    saveUserNote(savedWord.id, cleanW, cleanNotes);
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
    zipf: parseFloat(w.zipf) || 0,
  }));

  const payload = {
    action: 'batchadd',
    route: 'batchadd',
    words: formattedWords,
  };

  let savedWords = formattedWords;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${GAS_SCANNER_URL}?route=batchadd`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await response.json();
    if (json && json.success && json.data && Array.isArray(json.data.words)) {
      savedWords = json.data.words;
    }
  } catch (err) {
    console.warn('Network error during batchAddCustomWords, saving locally:', err);
  }

  if (!cachedWordsList || !Array.isArray(cachedWordsList)) {
    try {
      cachedWordsList = JSON.parse(localStorage.getItem('myduo_cached_words') || '[]');
    } catch (e) {
      cachedWordsList = [];
    }
  }

  savedWords.forEach((sw) => {
    const idx = cachedWordsList.findIndex(
      (w) => String(w.id) === String(sw.id) || (w.word && w.word.toLowerCase() === sw.word.toLowerCase())
    );
    if (idx >= 0) {
      cachedWordsList[idx] = { ...cachedWordsList[idx], ...sw };
    } else {
      cachedWordsList.unshift(sw);
    }
    if (sw.notes) {
      saveUserNote(sw.id, sw.word, sw.notes);
    }
  });

  try {
    localStorage.setItem('myduo_cached_words', JSON.stringify(cachedWordsList));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo_words_updated', { detail: cachedWordsList }));
  }

  return { addedCount: savedWords.length, words: savedWords };
}

const GAS_SCANNER_URL = 'https://script.google.com/macros/s/AKfycbwnXMvc0F37phkEvq7fEXcqLoFCVrAUYrC88d09pjDjer039oDmsciF-u18mZbuhngjxQ/exec';

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
    if (payloadInput.startsWith('data:image')) {
      payload.imageBase64 = payloadInput.split(',')[1] || payloadInput;
      payload.mimeType = mimeType || 'image/jpeg';
    } else if (payloadInput.length > 500) {
      payload.imageBase64 = payloadInput.trim();
      payload.mimeType = mimeType || 'image/jpeg';
    } else {
      payload.text = payloadInput.trim();
    }
  }

  let resJson = null;
  try {
    const response = await fetch(`${GAS_SCANNER_URL}?route=scanimage`, {
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

  // Graceful offline fallback for text paste
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

  let errMsg = resJson?.error || 'Не удалось распознать слова с фото или текста';
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
  getActiveConveyorBatch,
  clearActiveConveyorBatch,
  flushProgressQueue,
  toggleFavoriteApi,
  clearAllFavoritesApi,
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
  getActiveConveyorBatch,
  clearActiveConveyorBatch,
  flushProgressQueue,
  toggleFavoriteApi,
  clearAllFavoritesApi,
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
  getUserNotesLocal,
  saveUserNote,
};

export { getWordTranslation, getWordNotes } from './i18n.js';
