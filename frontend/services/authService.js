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
}

function logoutUser() {
  setCurrentUser(null, null);
}

function getAuthToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
}

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
};
