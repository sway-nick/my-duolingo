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

function getUserAvatar(targetUserId) {
  const userId = targetUserId || getEffectiveUserId();
  const saved = localStorage.getItem(`avatar_${userId}`);
  if (saved) return saved;
  const user = getCurrentUser();
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar;
  }
  return null;
}

function saveUserAvatar(userId, base64Data) {
  const id = userId || getEffectiveUserId();
  if (!base64Data) {
    localStorage.removeItem(`avatar_${id}`);
  } else {
    localStorage.setItem(`avatar_${id}`, base64Data);
  }
  try {
    window.dispatchEvent(new CustomEvent('myduo:avatar_changed', { detail: { userId: id, avatar: base64Data } }));
  } catch (e) {}
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

const VECTOR_AVATARS = Array.from({ length: 16 }, (_, i) => `./assets/avatars/avatar_${i + 1}.png`);

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
