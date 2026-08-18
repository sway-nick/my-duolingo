const STORAGE_KEY_USER = 'myduo_current_user';
const STORAGE_KEY_TOKEN = 'myduo_auth_token';
const STORAGE_KEY_GUEST_ID = 'myduo_guest_device_id';
const GUEST_WORD_LIMIT = 100;

let currentUser = null;

try {
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    currentUser = JSON.parse(saved);
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

function migrateGuestData(newUserId) {
  const guestId = getGuestId();
  if (!guestId || !newUserId || String(guestId) === String(newUserId)) return;

  try {
    // 1. Migrate Progress
    const guestProgKey = `progress_${guestId}`;
    const userProgKey = `progress_${newUserId}`;
    const guestProg = JSON.parse(localStorage.getItem(guestProgKey) || '{}');
    const userProg = JSON.parse(localStorage.getItem(userProgKey) || '{}');
    const mergedProg = { ...guestProg, ...userProg };
    localStorage.setItem(userProgKey, JSON.stringify(mergedProg));

    // 2. Migrate Favorites
    const guestFavKey = `favs_${guestId}`;
    const userFavKey = `favs_${newUserId}`;
    const guestFavs = JSON.parse(localStorage.getItem(guestFavKey) || '[]');
    const userFavs = JSON.parse(localStorage.getItem(userFavKey) || '[]');
    const mergedFavs = Array.from(new Set([...guestFavs, ...userFavs]));
    localStorage.setItem(userFavKey, JSON.stringify(mergedFavs));

    // 3. Migrate Settings
    const guestSetKey = `settings_${guestId}`;
    const userSetKey = `settings_${newUserId}`;
    const guestSet = JSON.parse(localStorage.getItem(guestSetKey) || '{}');
    const userSet = JSON.parse(localStorage.getItem(userSetKey) || '{}');
    const mergedSet = { ...guestSet, ...userSet, userId: newUserId };
    localStorage.setItem(userSetKey, JSON.stringify(mergedSet));

    // 4. Migrate Weekly XP & Avatar
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((k) => {
      if (k.startsWith(`xp_${guestId}_`) || k.startsWith('xp_guest_')) {
        const wKey = k.startsWith(`xp_${guestId}_`)
          ? k.replace(`xp_${guestId}_`, '')
          : k.replace('xp_guest_', '');
        const guestXp = Number(localStorage.getItem(k) || 0);
        const userXpKey = `xp_${newUserId}_${wKey}`;
        const userXp = Number(localStorage.getItem(userXpKey) || 0);
        const totalXp = Math.max(guestXp, userXp);
        if (totalXp > 0) {
          localStorage.setItem(userXpKey, String(totalXp));
        }
      }
      if (k === `avatar_${guestId}` || k === 'avatar_guest') {
        const guestAvatar = localStorage.getItem(k);
        if (guestAvatar && !localStorage.getItem(`avatar_${newUserId}`)) {
          localStorage.setItem(`avatar_${newUserId}`, guestAvatar);
        }
      }
    });
  } catch (e) {
    console.warn('Failed migrating guest data to user:', e);
  }
}

function getCurrentUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      currentUser = JSON.parse(saved);
    } else {
      currentUser = null;
    }
  } catch (e) {
    console.warn('Failed reading current user from storage:', e);
  }
  return currentUser;
}

function setCurrentUser(user, token) {
  if (user && user.id) {
    // Automatically migrate guest data to the authenticated user!
    migrateGuestData(user.id);
  }

  currentUser = user;
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  // Dispatch global event for instant UI reaction without page refresh
  try {
    window.dispatchEvent(new CustomEvent('myduo:auth_changed', { detail: { user } }));
  } catch (e) {}
}

function logoutUser() {
  setCurrentUser(null, null);
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

const API_URL = 'https://script.google.com/macros/s/AKfycbwnXMvc0F37phkEvq7fEXcqLoFCVrAUYrC88d09pjDjer039oDmsciF-u18mZbuhngjxQ/exec';

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

  // Direct cloud sync
  try {
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    const wKey = `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

    const user = currentUser;
    const userName = user && user.name ? user.name : 'Гость';
    const xp = Number(localStorage.getItem(`xp_${id}_${wKey}`) || 0);

    fetch(`${API_URL}?route=leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        route: 'leaderboard',
        action: 'leaderboard',
        userId: id,
        weekKey: wKey,
        xp,
        name: userName,
        avatar: base64Data || '',
      }),
    }).catch(() => {});
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
  VECTOR_AVATARS,
};
