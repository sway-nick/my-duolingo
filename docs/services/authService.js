import { logoutFirebase, saveUserProfileFirestore, syncLeaderboardScoreFirestore } from './firebase.js?v=224.0';

const STORAGE_KEY_USER = 'myduo_current_user';
const STORAGE_KEY_TOKEN = 'myduo_auth_token';
const STORAGE_KEY_GUEST_ID = 'myduo_guest_device_id';
const GUEST_WORD_LIMIT = 50;

let currentUser = null;

try {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  }
} catch (e) {
  console.warn('Failed to load user session from localStorage', e);
}

function getGuestId() {
  let guestId = localStorage.getItem(STORAGE_KEY_GUEST_ID);
  if (!guestId) {
    const randomPart =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).substring(2, 10);
    guestId = `guest_${randomPart}`;
    localStorage.setItem(STORAGE_KEY_GUEST_ID, guestId);
  }
  return guestId;
}

function getDeterministicUserId(email) {
  if (!email) return getGuestId();
  const clean = String(email).toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const cleanPrefix = clean.split('@')[0].replace(/[^a-z0-9]/gi, '_').slice(0, 10);
  return `u_${cleanPrefix}_${Math.abs(hash)}`;
}

function getEffectiveUserId() {
  if (currentUser && currentUser.id) {
    return String(currentUser.id);
  }
  return getGuestId();
}

function getGuestTrainingCount() {
  const guestId = getGuestId();
  return Number(localStorage.getItem(`training_count_${guestId}`) || 0);
}

function incrementGuestTrainingCount() {
  if (currentUser) return 0;
  const guestId = getGuestId();
  const current = getGuestTrainingCount();
  const next = current + 1;
  localStorage.setItem(`training_count_${guestId}`, String(next));
  return next;
}

function isGuestLimitReached() {
  if (currentUser) return false;
  return getGuestTrainingCount() >= GUEST_WORD_LIMIT;
}

function getIsoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function migrateGuestData(newUserId, userEmail = '', userName = '', userAvatar = '') {
  if (!newUserId) return;
  const guestId = getGuestId();
  const currentWeek = getIsoWeekKey();

  try {
    const userProgKey = `progress_${newUserId}`;
    let mergedProg = JSON.parse(localStorage.getItem(userProgKey) || '{}');

    const userFavKey = `favs_${newUserId}`;
    let mergedFavs = new Set(JSON.parse(localStorage.getItem(userFavKey) || '[]'));

    const userSetKey = `settings_${newUserId}`;
    let mergedSet = JSON.parse(localStorage.getItem(userSetKey) || '{}');

    const userDatesKey = `study_dates_${newUserId}`;
    let mergedDates = new Set(JSON.parse(localStorage.getItem(userDatesKey) || '[]'));

    let migratedXp = Number(localStorage.getItem(`xp_${newUserId}_${currentWeek}`) || 0);

    // Merge from dl_word_progress (SRS storage) if exists
    try {
      const dlWords = JSON.parse(localStorage.getItem('dl_word_progress') || '{}');
      Object.keys(dlWords).forEach((wordId) => {
        const item = dlWords[wordId];
        if (!mergedProg[wordId]) {
          mergedProg[wordId] = {
            correct: item.correctCount || (item.box > 0 ? 1 : 0),
            error: item.wrongCount || 0,
            quizCorrect: item.correctCount || 0,
            pairsCorrect: 0,
            inputCorrect: item.box >= 4 ? 2 : 0,
            seenInCards: true,
            mastered: item.box >= 4,
            masteredAt: item.box >= 4 ? Date.now() : null,
            lastPracticed: item.lastReviewed || Date.now(),
            hardCount: 0,
          };
        }
      });
    } catch (e) {}

    // Merge from dl_favorites if exists
    try {
      const dlFavs = JSON.parse(localStorage.getItem('dl_favorites') || '[]');
      if (Array.isArray(dlFavs)) {
        dlFavs.forEach((id) => mergedFavs.add(String(id)));
      }
    } catch (e) {}

    // Merge from dl_settings if exists
    try {
      const dlSet = JSON.parse(localStorage.getItem('dl_settings') || '{}');
      if (dlSet && typeof dlSet === 'object') {
        mergedSet = { ...dlSet, ...mergedSet };
      }
    } catch (e) {}

    // Merge from dl_xp if exists
    try {
      const dlXp = Number(localStorage.getItem('dl_xp') || 0);
      if (dlXp > migratedXp) migratedXp = dlXp;
    } catch (e) {}

    const allKeys = Object.keys(localStorage);
    allKeys.forEach((k) => {
      // 1. Deep merge all progress keys
      if (k.startsWith('progress_') && k !== userProgKey) {
        try {
          const progObj = JSON.parse(localStorage.getItem(k) || '{}');
          if (progObj && typeof progObj === 'object') {
            Object.keys(progObj).forEach((wordId) => {
              const src = progObj[wordId];
              const dest = mergedProg[wordId];
              if (!dest) {
                mergedProg[wordId] = src;
              } else {
                mergedProg[wordId] = {
                  ...dest,
                  ...src,
                  correct: Math.max(dest.correct || 0, src.correct || 0),
                  error: Math.max(dest.error || 0, src.error || 0),
                  quizCorrect: Math.max(dest.quizCorrect || 0, src.quizCorrect || 0),
                  pairsCorrect: Math.max(dest.pairsCorrect || 0, src.pairsCorrect || 0),
                  inputCorrect: Math.max(dest.inputCorrect || 0, src.inputCorrect || 0),
                  seenInCards: Boolean(dest.seenInCards || src.seenInCards),
                  mastered: Boolean(dest.mastered || src.mastered),
                  masteredAt: dest.masteredAt || src.masteredAt || null,
                  lastPracticed: Math.max(dest.lastPracticed || 0, src.lastPracticed || 0),
                  hardCount: Math.max(dest.hardCount || 0, src.hardCount || 0),
                };
              }
            });
          }
        } catch (e) {}
      }

      // 2. Migrate all favorites keys
      if ((k.startsWith('favs_') || k.startsWith('favorites_') || k === 'favorites' || k === 'favs' || k === 'myduo_favorites') && !k.includes('deleted') && k !== userFavKey) {
        try {
          const favsArr = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(favsArr)) {
            favsArr.forEach((id) => mergedFavs.add(String(id)));
          }
        } catch (e) {}
      }

      // 3. Migrate settings
      if (k.startsWith('settings_') && k !== userSetKey) {
        try {
          const setObj = JSON.parse(localStorage.getItem(k) || '{}');
          if (setObj && typeof setObj === 'object') {
            mergedSet = { ...setObj, ...mergedSet };
          }
        } catch (e) {}
      }

      // 4. Migrate study dates (streak)
      if (k.startsWith('study_dates_') && k !== userDatesKey) {
        try {
          const datesArr = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(datesArr)) {
            datesArr.forEach((d) => mergedDates.add(String(d)));
          }
        } catch (e) {}
      }

      // 5. Migrate XP
      if (k.startsWith('xp_') && !k.startsWith(`xp_${newUserId}_`)) {
        const match = k.match(/(\d{4}-W\d{2})/);
        const wKey = match ? match[1] : currentWeek;
        const xpVal = Number(localStorage.getItem(k) || 0);
        const targetXpKey = `xp_${newUserId}_${wKey}`;
        const currentTargetXp = Number(localStorage.getItem(targetXpKey) || 0);
        const best = Math.max(currentTargetXp, xpVal);
        if (best > 0) {
          localStorage.setItem(targetXpKey, String(best));
          if (wKey === currentWeek && best > migratedXp) {
            migratedXp = best;
          }
        }
      }

      // 6. Migrate avatar
      if (k.startsWith('avatar_') && k !== `avatar_${newUserId}`) {
        const av = localStorage.getItem(k);
        if (av && !localStorage.getItem(`avatar_${newUserId}`)) {
          localStorage.setItem(`avatar_${newUserId}`, av);
        }
      }
    });

    // Also check plain 'xp' key if present
    const plainXp = Number(localStorage.getItem('xp') || 0);
    if (plainXp > 0) {
      const targetXpKey = `xp_${newUserId}_${currentWeek}`;
      const cur = Number(localStorage.getItem(targetXpKey) || 0);
      const best = Math.max(cur, plainXp);
      localStorage.setItem(targetXpKey, String(best));
      if (best > migratedXp) migratedXp = best;
    }



    // If migratedXp is still 0, calculate from mergedProg
    if (migratedXp <= 0 && mergedProg && Object.keys(mergedProg).length > 0) {
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
      if (calcXp > 0) {
        migratedXp = calcXp;
      }
    }

    if (userAvatar) {
      localStorage.setItem(`avatar_${newUserId}`, userAvatar);
    }

    const deletedFavs = new Set([
      ...(JSON.parse(localStorage.getItem(`favs_deleted_${newUserId}`) || '[]')),
      ...(guestId ? JSON.parse(localStorage.getItem(`favs_deleted_${guestId}`) || '[]') : []),
      ...(JSON.parse(localStorage.getItem('favs_deleted') || '[]'))
    ].map(String));

    const finalFavs = Array.from(mergedFavs)
      .map(String)
      .map(s => s.trim())
      .filter(id => id && !deletedFavs.has(id));

    // Save final merged data to user storage keys
    localStorage.setItem(userProgKey, JSON.stringify(mergedProg));
    localStorage.setItem(userFavKey, JSON.stringify(finalFavs));
    localStorage.setItem(userSetKey, JSON.stringify({ ...mergedSet, userId: newUserId }));
    localStorage.setItem(userDatesKey, JSON.stringify(Array.from(mergedDates).sort()));
    if (migratedXp > 0) {
      localStorage.setItem(`xp_${newUserId}_${currentWeek}`, String(migratedXp));
      localStorage.setItem('xp', String(migratedXp));
    }

    // Broadcast local changes
    if (typeof window !== 'undefined') {
      if (migratedXp > 0) {
        window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: migratedXp } }));
      }
      window.dispatchEvent(new CustomEvent('myduo:progress_updated', { detail: { userId: newUserId, progress: mergedProg } }));
      window.dispatchEvent(new CustomEvent('myduo_favorites_updated', { detail: finalFavs }));
    }
  } catch (e) {
    console.warn('Failed migrating guest data to user:', e);
  }
}

function getCurrentUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.id && parsed.id !== 'guest' && !String(parsed.id).startsWith('guest_') && parsed.email) {
        currentUser = parsed;
      } else {
        currentUser = null;
      }
    } else {
      currentUser = null;
    }
  } catch (e) {
    currentUser = null;
  }
  return currentUser;
}

function setCurrentUser(user, token) {
  if (user && user.id && user.id !== 'guest' && !String(user.id).startsWith('guest_') && user.email) {
    currentUser = user;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    const finalToken = (token && !token.startsWith('tok_')) ? token : (user.idToken || token || '');
    if (finalToken) localStorage.setItem(STORAGE_KEY_TOKEN, finalToken);
    if (user.id) {
      // Automatically migrate guest data into user keys immediately
      migrateGuestData(user.id, user.email || '', user.name || '', user.avatar || '');
    }
  } else {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    try {
      localStorage.removeItem('myduo_firebase_user');
      localStorage.removeItem('myduo_refresh_token');
      localStorage.removeItem('myduo_auth_token');
    } catch (e) {}
  }

  // Dispatch global event for instant UI reaction without page refresh
  try {
    window.dispatchEvent(new CustomEvent('myduo:auth_changed', { detail: { user: currentUser } }));
  } catch (e) {}
}

// Auto-migrate on initial script evaluation if user is already logged in
try {
  if (currentUser && currentUser.id && currentUser.email) {
    migrateGuestData(currentUser.id, currentUser.email || '', currentUser.name || '', currentUser.avatar || '');
  }
} catch (e) {}

function logoutUser() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('myduo:pre_logout'));
    } catch (e) {}
  }
  logoutFirebase();
  setCurrentUser(null, null);
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem('myduo_firebase_user');
    localStorage.removeItem('myduo_refresh_token');
    localStorage.removeItem('myduo_auth_token');
  } catch (e) {}
}

function getAuthToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
}

function getUserAvatar(targetUserId) {
  const userId = targetUserId || getEffectiveUserId();

  // 1. Direct key for this user
  let saved = localStorage.getItem(`avatar_${userId}`);
  if (saved) {
    if (saved.startsWith('./assets/avatars/avatar_') && !saved.includes('?v=')) {
      return `${saved}?v=18.0`;
    }
    return saved;
  }

  // 2. Current user session
  const user = getCurrentUser();
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar;
  }

  // 3. Scan any avatar keys in localStorage (e.g. from guest or prior logins)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('avatar_')) {
        const val = localStorage.getItem(k);
        if (val && val.length > 5) {
          localStorage.setItem(`avatar_${userId}`, val);
          return val;
        }
      }
    }
  } catch (e) {}

  // 4. Check cached leaderboard data for this user's avatar from cloud
  try {
    const allKeys = Object.keys(localStorage);
    for (const k of allKeys) {
      if (k.startsWith('cache_leaderboard_')) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list = JSON.parse(raw);
          const me = list.find((item) => String(item.userId) === String(userId) || (user && item.name === user.name));
          if (me && me.avatar) {
            localStorage.setItem(`avatar_${userId}`, me.avatar);
            return me.avatar;
          }
        }
      }
    }
  } catch (e) {}

  return null;
}

function saveUserAvatar(userId, base64Data) {
  const id = userId || getEffectiveUserId();
  if (!base64Data) {
    localStorage.removeItem(`avatar_${id}`);
  } else {
    localStorage.setItem(`avatar_${id}`, base64Data);
  }
  if (currentUser && String(currentUser.id) === String(id)) {
    currentUser.avatar = base64Data || '';
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {}
  }

  try {
    window.dispatchEvent(new CustomEvent('myduo:avatar_changed', { detail: { userId: id, avatar: base64Data } }));
  } catch (e) {}

  // Direct Firestore cloud sync: strictly for authenticated users only
  try {
    const user = getCurrentUser();
    if (!user || !user.email || !user.id || String(user.id).startsWith('guest')) {
      return;
    }
    const d = new Date();
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    const wKey = `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

    const userName = user.name || user.email.split('@')[0];
    const xp = Number(localStorage.getItem(`xp_${id}_${wKey}`) || 0);

    const fsUid = (user.firebaseUid && !user.firebaseUid.includes('_')) ? user.firebaseUid : user.id;
    saveUserProfileFirestore(fsUid, { avatar: base64Data || '', name: userName }).catch(() => {});
    syncLeaderboardScoreFirestore(fsUid, wKey, xp, userName, base64Data || '').catch(() => {});
  } catch (err) {}
}

function removeUserAvatar(userId) {
  saveUserAvatar(userId, null);
}

function compressAndCropAvatar(file, size = 128) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed loading image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        // Center crop square from original dimensions
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        let resultData = canvas.toDataURL('image/webp', 0.85);
        if (!resultData.startsWith('data:image/webp')) {
          resultData = canvas.toDataURL('image/jpeg', 0.85);
        }
        resolve(resultData);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const VECTOR_AVATARS = Array.from({ length: 16 }, (_, i) => `./assets/avatars/avatar_${i + 1}.png?v=18.0`);

export {
  getCurrentUser,
  setCurrentUser,
  logoutUser,
  getAuthToken,
  getGuestId,
  getEffectiveUserId,
  getGuestTrainingCount,
  incrementGuestTrainingCount,
  isGuestLimitReached,
  migrateGuestData,
  GUEST_WORD_LIMIT,
  getUserAvatar,
  saveUserAvatar,
  removeUserAvatar,
  compressAndCropAvatar,
  getDeterministicUserId,
  VECTOR_AVATARS,
};
