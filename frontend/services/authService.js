const STORAGE_KEY_USER = 'myduo_current_user';
const STORAGE_KEY_TOKEN = 'myduo_auth_token';

let currentUser = null;

try {
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    currentUser = JSON.parse(saved);
  }
} catch (e) {
  console.warn('Failed to load user session from localStorage', e);
}

function getCurrentUser() {
  return currentUser;
}

function setCurrentUser(user, token) {
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

export { getCurrentUser, setCurrentUser, logoutUser, getAuthToken };
