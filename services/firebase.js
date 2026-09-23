// Firebase Integration for English Breakfast (Universal Web & Android Capacitor)
// Uses direct native Google Identity & Firestore REST APIs (100% reliable in all WebViews with zero CDN dependency)

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD_-Zrs0NEhIerHyg3S6jlNsXVt5RevABc",
  authDomain: "english-breakfast-181ba.firebaseapp.com",
  projectId: "english-breakfast-181ba",
  storageBucket: "english-breakfast-181ba.firebasestorage.app",
  messagingSenderId: "249517100642",
  appId: "1:249517100642:web:debbc62ac92f95b7b30b3b",
  measurementId: "G-J1YTNL2LZX"
};

function getFirebaseConfig() {
  try {
    const custom = localStorage.getItem('myduo_firebase_config');
    if (custom) {
      return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(custom) };
    }
  } catch (e) {}
  return DEFAULT_FIREBASE_CONFIG;
}

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${DEFAULT_FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

export function initFirebase() {
  return { config: getFirebaseConfig() };
}

// ----------------- AUTHENTICATION -----------------

export async function registerWithEmail(email, password, name = '') {
  const config = getFirebaseConfig();
  const res = await fetch(`${AUTH_BASE}/accounts:signUp?key=${config.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      password: password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || 'Ошибка регистрации';
    if (msg.includes('EMAIL_EXISTS')) {
      const err = new Error('Этот email уже зарегистрирован. Переключитесь на вкладку «Вход».');
      err.code = 'auth/email-already-in-use';
      throw err;
    }
    if (msg.includes('WEAK_PASSWORD')) {
      const err = new Error('Пароль слишком простой (минимум 6 символов).');
      err.code = 'auth/weak-password';
      throw err;
    }
    if (msg.includes('INVALID_EMAIL')) {
      const err = new Error('Некорректный адрес электронной почты.');
      err.code = 'auth/invalid-email';
      throw err;
    }
    throw new Error(msg);
  }

  const uid = data.localId;
  const idToken = data.idToken;
  const displayName = name.trim() || email.split('@')[0];

  // Update profile name
  if (displayName) {
    try {
      await fetch(`${AUTH_BASE}/accounts:update?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: idToken,
          displayName: displayName,
          returnSecureToken: true,
        }),
      });
    } catch (e) {}
  }

  const user = {
    id: uid,
    name: displayName,
    email: email.trim(),
    avatar: '',
    provider: 'email',
    idToken: idToken,
    refreshToken: data.refreshToken || '',
    expiresAt: Date.now() + (parseInt(data.expiresIn || '3600', 10) * 1000)
  };

  localStorage.setItem('myduo_firebase_user', JSON.stringify(user));
  if (data.refreshToken) {
    try { localStorage.setItem('myduo_refresh_token', data.refreshToken); } catch (e) {}
  }
  return user;
}

export async function loginWithEmail(email, password) {
  const config = getFirebaseConfig();
  const res = await fetch(`${AUTH_BASE}/accounts:signInWithPassword?key=${config.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      password: password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || 'Ошибка входа';
    if (msg.includes('EMAIL_NOT_FOUND') || msg.includes('INVALID_PASSWORD') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
      const err = new Error('Неверный email или пароль. Если у вас ещё нет аккаунта, перейдите на «Регистрацию».');
      err.code = 'auth/invalid-credential';
      throw err;
    }
    if (msg.includes('USER_DISABLED')) {
      const err = new Error('Этот аккаунт отключен.');
      err.code = 'auth/user-disabled';
      throw err;
    }
    throw new Error(msg);
  }

  const user = {
    id: data.localId,
    name: data.displayName || email.split('@')[0],
    email: data.email,
    avatar: '',
    provider: 'email',
    idToken: data.idToken,
    refreshToken: data.refreshToken || '',
    expiresAt: Date.now() + (parseInt(data.expiresIn || '3600', 10) * 1000)
  };

  localStorage.setItem('myduo_firebase_user', JSON.stringify(user));
  if (data.refreshToken) {
    try { localStorage.setItem('myduo_refresh_token', data.refreshToken); } catch (e) {}
  }
  return user;
}

export async function signInWithGoogleIdToken(googleIdToken = '', accessToken = '') {
  if (!googleIdToken && !accessToken) return null;
  try {
    const config = getFirebaseConfig();
    const body = {
      postBody: googleIdToken
        ? `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`
        : `access_token=${encodeURIComponent(accessToken)}&providerId=google.com`,
      requestUri: 'http://localhost',
      returnIdpCredential: true,
      returnSecureToken: true,
    };
    const res = await fetch(`${AUTH_BASE}/accounts:signInWithIdp?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn('Firebase signInWithIdp error:', data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Firebase IDP exchange error:', err);
    return null;
  }
}

export async function loginWithGoogle() {
  // 1. Native Android Bridge (Play Services Auth via AndroidAuthBridge)
  if (window.AndroidAuthBridge && typeof window.AndroidAuthBridge.signInWithGoogle === 'function') {
    const rawNativeUser = await new Promise((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        window.onNativeGoogleSignInSuccess = null;
        window.onNativeGoogleSignInFailure = null;
        window.onNativeGoogleSignInCancelled = null;
      };
      window.onNativeGoogleSignInSuccess = (userObj) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(userObj);
      };
      window.onNativeGoogleSignInFailure = (errObj) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(errObj?.error || 'Ошибка входа через Google'));
      };
      window.onNativeGoogleSignInCancelled = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('cancelled'));
      };

      try {
        window.AndroidAuthBridge.signInWithGoogle();
      } catch (err) {
        if (settled) return;
        settled = true;
        cleanup();
        reject(err);
      }
    });

    let firebaseIdToken = rawNativeUser.idToken || '';
    let firebaseUid = rawNativeUser.id || '';
    let refreshToken = '';
    let expiresAt = Date.now() + 3600 * 1000;

    // Exchange Google ID Token with Firebase REST API for full Firestore access
    if (rawNativeUser.idToken) {
      try {
        const fbRes = await signInWithGoogleIdToken(rawNativeUser.idToken);
        if (fbRes && fbRes.idToken) {
          firebaseIdToken = fbRes.idToken;
          firebaseUid = fbRes.localId || firebaseUid;
          refreshToken = fbRes.refreshToken || '';
          expiresAt = Date.now() + (parseInt(fbRes.expiresIn || '3600', 10) * 1000);
        }
      } catch (e) {
        console.warn('Firebase IDP exchange note:', e);
      }
    }

    const email = (rawNativeUser.email || '').toLowerCase().trim();
    const name = rawNativeUser.name || (email ? email.split('@')[0] : 'User');
    const avatar = rawNativeUser.photoUrl || '';

    const user = {
      id: firebaseUid || String(Date.now()),
      name: name,
      email: email,
      avatar: avatar,
      provider: 'google',
      idToken: firebaseIdToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
    };
    localStorage.setItem('myduo_firebase_user', JSON.stringify(user));
    return user;
  }

  // 2. Capacitor FirebaseAuthentication plugin fallback
  if (!window.Capacitor?.Plugins?.FirebaseAuthentication && (window.androidBridge || window.Capacitor)) {
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (window.Capacitor?.Plugins?.FirebaseAuthentication) break;
    }
  }

  if (window.Capacitor?.Plugins?.FirebaseAuthentication) {
    let result;
    try {
      result = await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();
    } catch (authErr) {
      console.warn('Initial Google Sign-In failed, clearing stale session and retrying:', authErr);
      try {
        await window.Capacitor.Plugins.FirebaseAuthentication.signOut();
      } catch (e) {}
      result = await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();
    }

    const u = result.user || result;
    let idToken = result.credential?.idToken || u.idToken || '';
    if (!idToken && window.Capacitor?.Plugins?.FirebaseAuthentication?.getIdToken) {
      try {
        const tokenRes = await window.Capacitor.Plugins.FirebaseAuthentication.getIdToken();
        if (tokenRes?.token) idToken = tokenRes.token;
      } catch (e) {}
    }

    const user = {
      id: u.uid || u.id || String(Date.now()),
      name: u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'User'),
      email: u.email || '',
      avatar: u.photoUrl || u.photoURL || '',
      provider: 'google',
      idToken: idToken,
    };
    localStorage.setItem('myduo_firebase_user', JSON.stringify(user));
    return user;
  }

  const isAndroid = !!(window.androidBridge || window.AndroidAuthBridge || window.Capacitor?.isNativePlatform?.() || window.Capacitor?.getPlatform?.() === 'android');
  if (isAndroid) {
    throw new Error('Google Sign-In настраивается на этом устройстве. Вы можете войти через Email и пароль.');
  }
  throw new Error('Для входа через Google в браузере используйте кнопку Google.');
}

export async function logoutFirebase() {
  localStorage.removeItem('myduo_firebase_user');
  if (window.AndroidAuthBridge && typeof window.AndroidAuthBridge.signOutGoogle === 'function') {
    try {
      window.AndroidAuthBridge.signOutGoogle();
    } catch (e) {}
  }
  if (window.Capacitor?.Plugins?.FirebaseAuthentication) {
    try {
      await window.Capacitor.Plugins.FirebaseAuthentication.signOut();
    } catch (e) {
      console.warn('Native Firebase signOut note:', e);
    }
  }
}

// Удаляет все Firestore-документы пользователя перед удалением аккаунта.
// Использует REST API напрямую, без Firebase SDK.
async function deleteAllUserFirestoreData(userId, idToken) {
  const config = getFirebaseConfig();
  const authHeader = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};
  const headers = { 'Content-Type': 'application/json', ...authHeader };

  // Вспомогательная функция: DELETE одного документа по URL
  async function delDoc(url) {
    try {
      await fetch(`${url}?key=${config.apiKey}`, { method: 'DELETE', headers });
    } catch (e) {
      console.warn('deleteAllUserFirestoreData: failed to delete', url, e);
    }
  }

  // Вспомогательная функция: список всех документов в подколлекции и их удаление
  async function delSubcollection(subcollPath) {
    try {
      let pageToken = '';
      do {
        const listUrl = `${FIRESTORE_BASE}${subcollPath}?pageSize=300${pageToken ? '&pageToken=' + pageToken : ''}&key=${config.apiKey}`;
        const res = await fetch(listUrl, { headers });
        if (!res.ok) break;
        const data = await res.json();
        const docs = data.documents || [];
        await Promise.all(docs.map((doc) => {
          const docUrl = `https://firestore.googleapis.com/v1/${doc.name}`;
          return fetch(`${docUrl}?key=${config.apiKey}`, { method: 'DELETE', headers }).catch(() => {});
        }));
        pageToken = data.nextPageToken || '';
      } while (pageToken);
    } catch (e) {
      console.warn('deleteAllUserFirestoreData: subcollection error', subcollPath, e);
    }
  }

  const uid = encodeURIComponent(userId);

  // 1. Удаляем подколлекцию progress/* (индивидуальные записи по словам)
  await delSubcollection(`/users/${uid}/progress`);

  // 2. Удаляем подколлекцию settings/*
  await delSubcollection(`/users/${uid}/settings`);

  // 3. Удаляем подколлекцию data/* (favorites, notes, custom_words, weekly_xp_*, progress bulk)
  await delSubcollection(`/users/${uid}/data`);

  // 4. Удаляем корневой документ users/{uid}
  await delDoc(`${FIRESTORE_BASE}/users/${uid}`);

  // 5. Удаляем запись в leaderboard текущей и прошлой недели
  try {
    const now = new Date();
    // Формат weekKey совпадает с syncLeaderboardScoreFirestore: YYYY-WW
    function getISOWeekKey(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const day = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - day);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
    }
    const currentWeek = getISOWeekKey(now);
    const prevWeekDate = new Date(now);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    const prevWeek = getISOWeekKey(prevWeekDate);
    await delDoc(`${FIRESTORE_BASE}/leaderboards/${encodeURIComponent(currentWeek)}/players/${uid}`);
    await delDoc(`${FIRESTORE_BASE}/leaderboards/${encodeURIComponent(prevWeek)}/players/${uid}`);
  } catch (e) {
    console.warn('deleteAllUserFirestoreData: leaderboard cleanup error', e);
  }
}

export async function deleteCurrentUserAccount() {
  const stored = localStorage.getItem('myduo_firebase_user');
  if (!stored) return;
  const user = JSON.parse(stored);
  const config = getFirebaseConfig();

  // idToken живёт 1 час — принудительно берём свежий (refreshToken или нативный плагин).
  let idToken = user.idToken || '';
  try {
    const fresh = await getValidIdToken({ force: true });
    if (fresh) idToken = fresh;
  } catch (e) {
    console.warn('deleteCurrentUserAccount: token refresh failed, trying with stored token', e);
  }

  // 1. Удаляем все данные из Firestore ПЕРЕД удалением аккаунта,
  //    пока idToken ещё валиден и правила разрешают write для этого uid.
  const userId = user.localId || user.uid || user.userId || '';
  if (userId) {
    try {
      await deleteAllUserFirestoreData(userId, idToken);
    } catch (e) {
      console.warn('deleteCurrentUserAccount: Firestore cleanup error (non-fatal):', e);
    }
  }

  // 2. Удаляем Firebase Auth аккаунт
  if (idToken) {
    const res = await fetch(`${AUTH_BASE}/accounts:delete?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('deleteCurrentUserAccount: Firebase returned error:', errData?.error?.message || res.status);
      // Still continue with local cleanup even if remote delete failed
    }
  }
  localStorage.removeItem('myduo_firebase_user');
}


export function subscribeToAuthState(callback) {
  try {
    const stored = localStorage.getItem('myduo_firebase_user');
    if (stored) {
      callback(JSON.parse(stored));
    } else {
      callback(null);
    }
  } catch (e) {
    callback(null);
  }
  return () => {};
}

// ----------------- FIRESTORE (PROGRESS, LEADERBOARD, WORDS) -----------------

function getFirestoreUrl(path) {
  const config = getFirebaseConfig();
  const sep = path.includes('?') ? '&' : '?';
  return `${FIRESTORE_BASE}${path}${sep}key=${config.apiKey}`;
}

// ----------------- ТОКЕНЫ И ИДЕНТИФИКАТОРЫ ПОЛЬЗОВАТЕЛЯ -----------------
// Firebase ID-токен живёт 1 час. Раньше просроченный токен молча отбрасывался:
// запрос уходил без Authorization, правила Firestore видели request.auth == null
// и отвечали 403, а данные (прогресс, XP, лидерборд) не сохранялись в облаке.
// Теперь токен обновляется по refreshToken (или через нативный плагин) ДО отправки запроса.

const FB_USER_KEY = 'myduo_firebase_user';
const CUR_USER_KEY = 'myduo_current_user';
const AUTH_TOKEN_KEY = 'myduo_auth_token';
const REFRESH_TOKEN_KEY = 'myduo_refresh_token';
const SECURETOKEN_URL = 'https://securetoken.googleapis.com/v1/token';
const TOKEN_SKEW_MS = 60 * 1000;
const SYNC_NOTICE_COOLDOWN_MS = 60 * 1000;

let refreshInFlight = null;
// null | 'network' (временно, токен не трогаем) | 'permanent' (сессия мертва, нужен повторный вход)
let lastRefreshFailure = null;
const lastSyncNoticeAt = {};

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Извлекает реальный Firebase Auth UID пользователя для запросов в Firestore.
// Гарантирует совпадение с request.auth.uid в Security Rules даже если вызывающий код
// передал локальный/детерминированный ID (например sway1976_591919916_...).
export function getEffectiveFirestoreUid(providedId = null) {
  // 1. Если передан валидный Firebase UID (буквы+цифры, длина >= 20, без подчёркиваний, не чисто числовой Google Sub)
  if (providedId && typeof providedId === 'string' && providedId.length >= 20 && !providedId.includes('_') && !/^\d+$/.test(providedId)) {
    return providedId;
  }
  // 2. Смотрим myduo_firebase_user.id
  const fb = readJson(FB_USER_KEY);
  if (fb && fb.id && typeof fb.id === 'string' && fb.id.length >= 20 && !fb.id.includes('_') && !/^\d+$/.test(fb.id)) {
    return fb.id;
  }
  // 3. Смотрим myduo_current_user.firebaseUid
  const cur = readJson(CUR_USER_KEY);
  if (cur?.firebaseUid && typeof cur.firebaseUid === 'string' && !cur.firebaseUid.includes('_') && !/^\d+$/.test(cur.firebaseUid)) {
    return cur.firebaseUid;
  }
  // 4. Достаем user_id / sub напрямую из полезной нагрузки JWT-токена (100% совпадение с request.auth.uid)
  const { token } = getStoredToken();
  if (token) {
    try {
      const part = String(token).split('.')[1];
      if (part) {
        const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='));
        const json = JSON.parse(bin);
        if (json.user_id && typeof json.user_id === 'string' && json.user_id.length >= 20) {
          return json.user_id;
        }
        if (json.sub && typeof json.sub === 'string' && json.sub.length >= 20 && !/^\d+$/.test(json.sub)) {
          return json.sub;
        }
      }
    } catch (e) {}
  }
  return providedId || fb?.id || cur?.firebaseUid || cur?.id || '';
}

// Время истечения (мс) из поля exp JWT; 0, если прочитать не удалось.
function getJwtExpiryMs(token) {
  try {
    const part = String(token).split('.')[1];
    if (!part) return 0;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='));
    const json = decodeURIComponent(
      bin.split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    const exp = Number(JSON.parse(json).exp);
    return exp ? exp * 1000 : 0;
  } catch (e) {
    return 0;
  }
}

function getStoredToken() {
  const fb = readJson(FB_USER_KEY) || {};
  const cur = readJson(CUR_USER_KEY) || {};
  let token = fb.idToken || cur.idToken || '';
  if (!token) {
    try { token = localStorage.getItem(AUTH_TOKEN_KEY) || ''; } catch (e) {}
  }
  // 'tok_...' — локальный служебный токен старых версий, не Firebase
  if (!token || token.startsWith('tok_')) return { token: '', expiresAt: 0 };
  const expiresAt = (fb.idToken === token && Number(fb.expiresAt)) || getJwtExpiryMs(token) || 0;
  return { token, expiresAt };
}

function hasFirebaseSession() {
  const fb = readJson(FB_USER_KEY);
  const cur = readJson(CUR_USER_KEY);
  return !!(
    (fb && (fb.idToken || fb.refreshToken)) ||
    (cur && (cur.idToken || cur.refreshToken)) ||
    localStorage.getItem(REFRESH_TOKEN_KEY)
  );
}

// Кладём свежий токен во ВСЕ места, откуда его читают остальные части приложения.
function persistFreshToken(idToken, refreshToken, expiresAt) {
  const fb = readJson(FB_USER_KEY) || {};
  fb.idToken = idToken;
  if (refreshToken) fb.refreshToken = refreshToken;
  fb.expiresAt = expiresAt;
  try { localStorage.setItem(FB_USER_KEY, JSON.stringify(fb)); } catch (e) {}

  const cur = readJson(CUR_USER_KEY) || {};
  if (cur) {
    cur.idToken = idToken;
    if (refreshToken) cur.refreshToken = refreshToken;
    try { localStorage.setItem(CUR_USER_KEY, JSON.stringify(cur)); } catch (e) {}
  }
  try { localStorage.setItem(AUTH_TOKEN_KEY, idToken); } catch (e) {}
  if (refreshToken) {
    try { localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); } catch (e) {}
  }
}

async function doRefreshIdToken() {
  lastRefreshFailure = null;
  const fb = readJson(FB_USER_KEY) || {};
  const cur = readJson(CUR_USER_KEY) || {};
  let refreshToken = fb.refreshToken || cur.refreshToken || '';
  if (!refreshToken) {
    try { refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || ''; } catch (e) {}
  }

  // 1. Email / Google (web, AndroidAuthBridge): обновление через securetoken
  if (refreshToken) {
    try {
      const res = await fetch(`${SECURETOKEN_URL}?key=${getFirebaseConfig().apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id_token) {
        const expiresAt = Date.now() + parseInt(data.expires_in || '3600', 10) * 1000;
        persistFreshToken(data.id_token, data.refresh_token || refreshToken, expiresAt);
        return data.id_token;
      }
      // 400: TOKEN_EXPIRED / USER_DISABLED / USER_NOT_FOUND / INVALID_REFRESH_TOKEN — сессия мертва
      lastRefreshFailure = res.status >= 400 && res.status < 500 ? 'permanent' : 'network';
      console.warn('Firebase token refresh rejected:', data?.error?.message || res.status);
    } catch (e) {
      lastRefreshFailure = 'network';
      console.warn('Firebase token refresh failed (network):', e);
    }
  }

  // 2. Capacitor FirebaseAuthentication: refreshToken в localStorage нет, просим плагин
  const plugin = typeof window !== 'undefined' ? window.Capacitor?.Plugins?.FirebaseAuthentication : null;
  if (plugin && typeof plugin.getIdToken === 'function') {
    try {
      const r = await plugin.getIdToken({ forceRefresh: true });
      if (r && r.token) {
        const expiresAt = getJwtExpiryMs(r.token) || Date.now() + 3600 * 1000;
        persistFreshToken(r.token, '', expiresAt);
        lastRefreshFailure = null;
        return r.token;
      }
    } catch (e) {
      console.warn('Capacitor getIdToken failed:', e);
      lastRefreshFailure = lastRefreshFailure || 'network';
    }
  }

  if (!lastRefreshFailure) lastRefreshFailure = 'permanent'; // обновить нечем
  return null;
}

// Обновление токена «в один поток»: параллельные запросы ждут один и тот же refresh.
export function refreshIdToken() {
  if (!refreshInFlight) {
    refreshInFlight = doRefreshIdToken().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

// Возвращает действующий ID-токен (при необходимости обновляет) либо null.
export async function getValidIdToken({ force = false } = {}) {
  const { token, expiresAt } = getStoredToken();
  if (!force && token && (!expiresAt || Date.now() < expiresAt - TOKEN_SKEW_MS)) return token;

  const fresh = await refreshIdToken();
  if (fresh) return fresh;

  // Обновить не удалось: если старый токен ещё формально жив — используем его до конца
  if (!force && token && expiresAt && Date.now() < expiresAt) return token;
  return null;
}

// Оставлена для совместимости с вызывающим кодом (`headers: getAuthHeaders()`).
// Авторизацию окончательно выставляет firestoreFetch — он же обновляет токен.
function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const { token, expiresAt } = getStoredToken();
  if (token && (!expiresAt || Date.now() < expiresAt - TOKEN_SKEW_MS)) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Событие для UI. Только для вошедших пользователей и не чаще 1 раза в минуту.
function reportSyncIssue(kind, status) {
  if (typeof window === 'undefined' || !hasFirebaseSession()) return;
  const now = Date.now();
  if (now - (lastSyncNoticeAt[kind] || 0) < SYNC_NOTICE_COOLDOWN_MS) return;
  lastSyncNoticeAt[kind] = now;
  try {
    window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind, status } }));
  } catch (e) {}
}

const FIRESTORE_WRITE_METHODS = new Set(['PATCH', 'PUT', 'POST', 'DELETE']);

export async function firestoreFetch(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const isWrite = FIRESTORE_WRITE_METHODS.has(method);

  const send = (token) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    delete headers.Authorization;
    delete headers.authorization;
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  let token = await getValidIdToken();
  let res = await send(token);

  // Firestore REST API при невалидном или истекшем токене отвечает 401 или 403 (PERMISSION_DENIED):
  // выполняем одну принудительную попытку обновления токена и повтор запроса.
  if ((res.status === 401 || res.status === 403) && token) {
    const fresh = await getValidIdToken({ force: true });
    if (fresh && fresh !== token) {
      token = fresh;
      res = await send(fresh);
    }
  }

  // Публичные чтения (GET) могут работать и без токена
  if ((res.status === 401 || res.status === 403) && !isWrite && token) {
    const publicRes = await send(null);
    if (publicRes.ok) {
      res = publicRes;
    }
  }

  if (isWrite && (res.status === 401 || res.status === 403)) {
    if (!token || lastRefreshFailure === 'permanent') {
      reportSyncIssue('relogin', res.status);
    } else {
      reportSyncIssue('denied', res.status);
    }
  }

  return res;
}

export async function saveUserProgressFirestore(userId, wordId, progressObj) {
  if (!userId || !wordId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/progress/${encodeURIComponent(wordId)}`);
    const fields = toFirestoreFields({
      ...progressObj,
      updatedAt: Date.now()
    });

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore progress save failed:', err);
  }
}

export async function saveBulkProgressFirestore(userId, progressMap) {
  if (!userId || !progressMap) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/progress`);
    const fields = {
      progressJson: { stringValue: JSON.stringify(progressMap) },
      updatedAt: { integerValue: String(Date.now()) }
    };

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore bulk progress save failed:', err);
  }
}

export async function loadUserProgressFirestore(userId) {
  if (!userId) return {};
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return {};
  const combinedMap = {};
  try {
    // 1. Fetch bulk progress doc (fast single query)
    const bulkRes = await firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/progress`), {
      headers: getAuthHeaders()
    }).catch(() => null);
    if (bulkRes && bulkRes.ok) {
      const data = await bulkRes.json();
      if (data.fields?.progressJson?.stringValue) {
        try {
          const parsed = JSON.parse(data.fields.progressJson.stringValue);
          Object.assign(combinedMap, parsed);
        } catch (e) {}
      }
    }

    // 2. Fetch individual subcollection docs
    const subRes = await firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/progress`), {
      headers: getAuthHeaders()
    }).catch(() => null);
    if (subRes && subRes.ok) {
      const subData = await subRes.json();
      if (Array.isArray(subData.documents)) {
        for (const doc of subData.documents) {
          const id = doc.name.split('/').pop();
          const obj = {};
          for (const [k, f] of Object.entries(doc.fields || {})) {
            if ('stringValue' in f) obj[k] = f.stringValue;
            else if ('integerValue' in f) obj[k] = Number(f.integerValue);
            else if ('doubleValue' in f) obj[k] = Number(f.doubleValue);
            else if ('booleanValue' in f) obj[k] = f.booleanValue;
          }
          combinedMap[id] = { ...(combinedMap[id] || {}), ...obj };
        }
      }
    }
  } catch (err) {
    console.warn('Firestore progress load failed:', err);
  }
  return combinedMap;
}

const SHARED_ADMIN_UID = 'wB3NVAmBarXHSBrtEzDCriS0XBy2';

export async function syncLeaderboardScoreFirestore(userId, weekKey, xp, userName, userAvatar) {
  if (!userId || !weekKey) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  const newXp = Math.round(Number(xp) || 0);
  const cleanName = (userName != null) ? String(userName) : 'Гость';
  const cleanAvatar = (userAvatar != null) ? String(userAvatar) : '';

  // 1. Primary distributed sync: save to isolated player document /leaderboards/{weekKey}/players/{uid}
  // This scales to 100k+ players without hitting the single-document 1 write/sec limit!
  try {
    const rootUrl = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}/players/${encodeURIComponent(uid)}`);
    await firestoreFetch(rootUrl, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          userId: { stringValue: String(uid) },
          name: { stringValue: cleanName },
          avatar: { stringValue: cleanAvatar },
          xp: { integerValue: String(newXp) },
          updatedAt: { integerValue: String(Date.now()) }
        }
      })
    });
  } catch (err) {
    console.warn('Distributed player leaderboard doc sync warning:', err);
  }

  // 2. Save to user's personal document
  try {
    const userUrl = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/weekly_xp_${encodeURIComponent(weekKey)}`);
    await firestoreFetch(userUrl, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          xp: { integerValue: String(newXp) },
          name: { stringValue: cleanName },
          avatar: { stringValue: cleanAvatar },
          updatedAt: { integerValue: String(Date.now()) }
        }
      })
    });
  } catch (e) {}

}

export async function getUserWeeklyXpFirestore(userId, weekKey) {
  if (!userId || !weekKey) return 0;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return 0;

  // 1. Try distributed player document
  try {
    const rootUrl = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}/players/${encodeURIComponent(uid)}`);
    const res = await firestoreFetch(rootUrl, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (data.fields && data.fields.xp) {
        return Number(data.fields.xp.integerValue || data.fields.xp.doubleValue || 0);
      }
    }
  } catch (e) {}

  // 2. Try personal user document
  try {
    const userUrl = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/weekly_xp_${encodeURIComponent(weekKey)}`);
    const res = await firestoreFetch(userUrl, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (data.fields && data.fields.xp) {
        return Number(data.fields.xp.integerValue || data.fields.xp.doubleValue || 0);
      }
    }
  } catch (e) {}

  // 3. Try shared document fallback
  try {
    const config = getFirebaseConfig();
    const sharedUrl = `${FIRESTORE_BASE}/users/${SHARED_ADMIN_UID}/data/leaderboard_${encodeURIComponent(weekKey)}?key=${config.apiKey}`;
    const res = await fetch(sharedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.fields?.playersJson?.stringValue) {
        const map = JSON.parse(data.fields.playersJson.stringValue);
        if (map && map[userId] && map[userId].xp) {
          return Number(map[userId].xp || 0);
        }
      }
    }
  } catch (e) {}

  return 0;
}

export async function getWeeklyLeaderboardFirestore(weekKey, limitCount = 100) {
  if (!weekKey) return null;

  // 1. Primary query: fetch from distributed /leaderboards/{weekKey}/players collection (Scalable to 100k)
  try {
    const url = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}/players?pageSize=100`);
    const res = await firestoreFetch(url, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        const players = data.documents.map((doc) => {
          const obj = {};
          for (const [k, f] of Object.entries(doc.fields || {})) {
            if ('stringValue' in f) obj[k] = f.stringValue;
            else if ('integerValue' in f) obj[k] = Number(f.integerValue);
            else if ('doubleValue' in f) obj[k] = Number(f.doubleValue);
            else if ('booleanValue' in f) obj[k] = f.booleanValue;
          }
          return obj;
        });
        players.sort((a, b) => (Number(b.xp) || 0) - (Number(a.xp) || 0));
        const topPlayers = players.slice(0, limitCount);

        // Filter out deleted accounts: check users/{uid} existence (rule: allow read: if true)
        // We batch-check all UIDs in parallel; if 404 → user was deleted → remove from leaderboard.
        const config2 = getFirebaseConfig();
        const existChecks = await Promise.all(
          topPlayers.map(async (p) => {
            const uid = p.userId || p.uid;
            if (!uid) return false;
            try {
              const r = await fetch(`${FIRESTORE_BASE}/users/${encodeURIComponent(uid)}?key=${config2.apiKey}`);
              return r.ok; // 200 = exists, 404 = deleted
            } catch (e) {
              return true; // network error → assume exists (don't hide)
            }
          })
        );
        return topPlayers.filter((_, i) => existChecks[i]);
      }
    }
  } catch (err) {
    console.warn('Distributed Firestore leaderboard fetch warning:', err);
  }

  // 2. Fallback: read from legacy shared leaderboard document
  try {
    const config = getFirebaseConfig();
    const sharedUrl = `${FIRESTORE_BASE}/users/${SHARED_ADMIN_UID}/data/leaderboard_${encodeURIComponent(weekKey)}?key=${config.apiKey}`;
    const res = await fetch(sharedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.fields?.playersJson?.stringValue) {
        const map = JSON.parse(data.fields.playersJson.stringValue);
        if (map && typeof map === 'object') {
          const players = Object.values(map).filter(p => p && p.userId && (Number(p.xp) > 0 || p.name));
          players.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
          const topPlayers = players.slice(0, limitCount);

          // Filter out deleted accounts (same as primary path)
          const cfg = getFirebaseConfig();
          const checks = await Promise.all(
            topPlayers.map(async (p) => {
              const uid = p.userId || p.uid;
              if (!uid) return false;
              try {
                const r = await fetch(`${FIRESTORE_BASE}/users/${encodeURIComponent(uid)}?key=${cfg.apiKey}`);
                return r.ok;
              } catch (e) {
                return true;
              }
            })
          );
          return topPlayers.filter((_, i) => checks[i]);
        }
      }
    }
  } catch (sharedErr) {
    console.warn('Shared Firestore leaderboard fetch failed:', sharedErr);
  }

  return null;
}

export async function saveUserProfileFirestore(userId, profileData) {
  if (!userId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const fields = {};
    const maskPaths = ['updatedAt'];
    for (const [k, v] of Object.entries(profileData || {})) {
      if (k === 'email') continue; // Private sensitive field: never store on public user document
      if (typeof v === 'number') {
        fields[k] = { integerValue: String(Math.round(v)) };
        maskPaths.push(k);
      } else if (typeof v === 'boolean') {
        fields[k] = { booleanValue: v };
        maskPaths.push(k);
      } else if (typeof v === 'string') {
        fields[k] = { stringValue: v };
        maskPaths.push(k);
      } else if (Array.isArray(v)) {
        fields[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
        maskPaths.push(k);
      }
    }
    fields.updatedAt = { integerValue: String(Date.now()) };

    const maskParams = maskPaths.map(p => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join('&');
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}?${maskParams}`);

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore profile save failed:', err);
  }
}

export async function saveUserSettingsFirestore(userId, settingsObj) {
  if (!userId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/settings/general`);
    const fields = {};
    for (const [k, v] of Object.entries(settingsObj || {})) {
      if (typeof v === 'number') fields[k] = { integerValue: String(Math.round(v)) };
      else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      else if (typeof v === 'string') fields[k] = { stringValue: v };
    }
    fields.updatedAt = { integerValue: String(Date.now()) };

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore settings save failed:', err);
  }
}

export async function saveUserFavoritesFirestore(userId, favoritesArray) {
  if (!userId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const cleanArr = Array.isArray(favoritesArray)
      ? favoritesArray.map(id => String(id).trim()).filter(Boolean)
      : [];
    const arr = cleanArr.map(id => ({ stringValue: id }));
    const fields = {
      favorites: arr.length > 0 ? { arrayValue: { values: arr } } : { arrayValue: {} },
      items: arr.length > 0 ? { arrayValue: { values: arr } } : { arrayValue: {} },
      updatedAt: { integerValue: String(Date.now()) }
    };

    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/favorites?updateMask.fieldPaths=favorites&updateMask.fieldPaths=items&updateMask.fieldPaths=updatedAt`);

    const res = await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      console.warn('Firestore favorites save failed HTTP', res.status, await res.text());
    }

    // Keep root user doc favorites fields synchronized as well
    try {
      const rootUrl = getFirestoreUrl(`/users/${encodeURIComponent(uid)}?updateMask.fieldPaths=favorites&updateMask.fieldPaths=favorite_words&updateMask.fieldPaths=updatedAt`);
      await firestoreFetch(rootUrl, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fields: {
            favorites: arr.length > 0 ? { arrayValue: { values: arr } } : { arrayValue: {} },
            favorite_words: arr.length > 0 ? { arrayValue: { values: arr } } : { arrayValue: {} },
            updatedAt: { integerValue: String(Date.now()) }
          }
        })
      });
    } catch (rootErr) {}
  } catch (err) {
    console.warn('Firestore favorites save failed:', err);
  }
}

export async function saveUserDeletedFavoritesFirestore(userId, deletedFavoritesArray) {
  if (!userId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const cleanArr = Array.isArray(deletedFavoritesArray)
      ? deletedFavoritesArray.map(id => String(id).trim()).filter(Boolean)
      : [];
    const arr = cleanArr.map(id => ({ stringValue: id }));
    const fields = {
      deletedFavorites: arr.length > 0 ? { arrayValue: { values: arr } } : { arrayValue: {} },
      updatedAt: { integerValue: String(Date.now()) }
    };

    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/deleted_favorites?updateMask.fieldPaths=deletedFavorites&updateMask.fieldPaths=updatedAt`);

    const res = await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      console.warn('Firestore deleted_favorites save failed HTTP', res.status);
    }
  } catch (err) {
    console.warn('Firestore deleted_favorites save failed:', err);
  }
}

export async function saveUserNotesFirestore(userId, notesMap) {
  if (!userId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/notes`);
    const cleanNotes = notesMap && typeof notesMap === 'object' ? notesMap : {};
    const fields = {
      notesJson: { stringValue: JSON.stringify(cleanNotes) },
      updatedAt: { integerValue: String(Date.now()) }
    };

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore notes save failed:', err);
  }
}

export async function loadUserNotesFirestore(userId) {
  if (!userId) return {};
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return {};
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/notes`);
    const res = await firestoreFetch(url, { headers: getAuthHeaders() }).catch(() => null);
    if (!res || !res.ok) return {};
    const data = await res.json();
    if (data.fields?.notesJson?.stringValue) {
      return JSON.parse(data.fields.notesJson.stringValue);
    }
  } catch (err) {
    console.warn('Firestore notes load failed:', err);
  }
  return {};
}

export async function saveUserCustomWordsFirestore(userId, wordsArray) {
  if (!userId) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/custom_words`);
    const cleanWords = Array.isArray(wordsArray) ? wordsArray : [];
    const fields = {
      wordsJson: { stringValue: JSON.stringify(cleanWords) },
      count: { integerValue: String(cleanWords.length) },
      updatedAt: { integerValue: String(Date.now()) }
    };

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore custom words save failed:', err);
  }
}

export async function fetchSharedVocabularyUpdatesFirestore() {
  const config = getFirebaseConfig();
  const url = `${FIRESTORE_BASE}/users/${SHARED_ADMIN_UID}/data/vocabulary_updates?key=${config.apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    if (data.fields?.updatesJson?.stringValue) {
      return JSON.parse(data.fields.updatesJson.stringValue) || {};
    }
  } catch (err) {
    console.warn('fetchSharedVocabularyUpdatesFirestore failed:', err);
  }
  return {};
}

export async function saveSharedVocabularyUpdatesFirestore(newUpdatesMap) {
  if (!newUpdatesMap || Object.keys(newUpdatesMap).length === 0) return;
  const config = getFirebaseConfig();
  const current = await fetchSharedVocabularyUpdatesFirestore();
  Object.keys(newUpdatesMap).forEach(k => {
    if (newUpdatesMap[k]) current[k] = newUpdatesMap[k];
  });

  const url = `${FIRESTORE_BASE}/users/${SHARED_ADMIN_UID}/data/vocabulary_updates?key=${config.apiKey}`;
  try {
    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          updatesJson: { stringValue: JSON.stringify(current) },
          updatedAt: { integerValue: String(Date.now()) },
          totalCount: { integerValue: String(Object.keys(current).length) }
        }
      })
    });
  } catch (e) {}
}

export async function loadUserCustomWordsFirestore(userId) {
  return [];
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: Number(val.toFixed(2)) };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(item => toFirestoreValue(item))
      }
    };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

export async function saveSessionFirestore(sessionId, sessionData, keepalive = false) {
  if (!sessionId || !sessionData) return;
  try {
    const url = getFirestoreUrl(`/sessions/${encodeURIComponent(sessionId)}`);
    const fields = toFirestoreFields({
      ...sessionData,
      updatedAt: Date.now()
    });

    const fetchOptions = {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields })
    };
    if (keepalive && typeof fetchOptions === 'object') {
      fetchOptions.keepalive = true;
    }

    await firestoreFetch(url, fetchOptions);
  } catch (err) {
    console.warn('Firestore session tracking save failed:', err);
  }
}

export async function updateUserSessionSummaryFirestore(userId, summaryData, keepalive = false) {
  if (!userId || !summaryData) return;
  try {
    const cleanData = { ...summaryData, updatedAt: Date.now() };
    const fields = toFirestoreFields(cleanData);
    const maskParams = Object.keys(cleanData)
      .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&');
    const path = `/users/${encodeURIComponent(userId)}${maskParams ? '?' + maskParams : ''}`;
    const url = getFirestoreUrl(path);

    const fetchOptions = {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields })
    };
    if (keepalive) {
      fetchOptions.keepalive = true;
    }

    await firestoreFetch(url, fetchOptions);
  } catch (err) {
    console.warn('Firestore user session summary update failed:', err);
  }
}

export async function saveUserAnalyticsFirestore(userId, analyticsObj) {
  if (!userId) return;
  try {
    const timestamp = Date.now();
    const url = getFirestoreUrl(`/analytics/${encodeURIComponent(userId + '_' + timestamp)}`);
    const fields = toFirestoreFields({
      userId: String(userId),
      timestamp: timestamp,
      ...(analyticsObj || {})
    });

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore analytics save failed:', err);
  }
}

export async function loadFullUserDataFirestore(userId) {
  if (!userId) return null;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return null;
  try {
    const authHeaders = getAuthHeaders();
    const [progress, userDocRes, dataColRes, setDocRes] = await Promise.all([
      loadUserProgressFirestore(uid),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}`), { headers: authHeaders }).catch(() => null),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data`), { headers: authHeaders }).catch(() => null),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/settings/general`), { headers: authHeaders }).catch(() => null),
    ]);

    let userProfile = {};
    let favorites = [];
    let deletedFavorites = [];
    let hasExplicitFavDoc = false;
    let notes = {};
    let customWords = [];

    // Parse all documents in /users/{uid}/data (favorites, deleted_favorites, notes, custom_words)
    // This avoids 404 Not Found network errors when documents do not exist yet!
    if (dataColRes && dataColRes.ok) {
      try {
        const colData = await dataColRes.json();
        const docs = Array.isArray(colData.documents) ? colData.documents : [];
        for (const doc of docs) {
          const docName = doc.name ? doc.name.split('/').pop() : '';
          if (docName === 'deleted_favorites') {
            if (doc.fields?.deletedFavorites?.arrayValue?.values) {
              const sub = doc.fields.deletedFavorites.arrayValue.values.map(v => v.stringValue || '').filter(Boolean);
              deletedFavorites.push(...sub);
            }
          } else if (docName === 'favorites') {
            if (doc.fields) {
              hasExplicitFavDoc = true;
              if (doc.fields.favorites?.arrayValue?.values) {
                const subFavs = doc.fields.favorites.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
                favorites.push(...subFavs);
              } else if (doc.fields.items?.arrayValue?.values) {
                const subFavs = doc.fields.items.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
                favorites.push(...subFavs);
              }
            }
          } else if (docName === 'notes') {
            if (doc.fields?.notesJson?.stringValue) {
              try {
                notes = JSON.parse(doc.fields.notesJson.stringValue);
              } catch (e) {}
            }
          } else if (docName === 'custom_words') {
            if (doc.fields?.wordsJson?.stringValue) {
              try {
                const parsed = JSON.parse(doc.fields.wordsJson.stringValue);
                if (Array.isArray(parsed)) customWords = parsed;
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }

    if (userDocRes && userDocRes.ok) {
      const data = await userDocRes.json();
      if (data.fields) {
        for (const [k, f] of Object.entries(data.fields)) {
          if ('stringValue' in f) userProfile[k] = f.stringValue;
          else if ('integerValue' in f) userProfile[k] = Number(f.integerValue);
          else if ('booleanValue' in f) userProfile[k] = f.booleanValue;
        }
        if (!hasExplicitFavDoc) {
          if (data.fields.favorites?.arrayValue?.values) {
            const rFavs = data.fields.favorites.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
            favorites.push(...rFavs);
          } else if (data.fields.favorite_words?.arrayValue?.values) {
            const rFavs = data.fields.favorite_words.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
            favorites.push(...rFavs);
          }
        }
      }
    }
    favorites = Array.from(new Set(favorites.map(String)));

    let settings = null;
    if (setDocRes && setDocRes.ok) {
      const data = await setDocRes.json();
      if (data.fields) {
        settings = {};
        for (const [k, f] of Object.entries(data.fields)) {
          if ('stringValue' in f) settings[k] = f.stringValue;
          else if ('integerValue' in f) settings[k] = Number(f.integerValue);
          else if ('booleanValue' in f) settings[k] = f.booleanValue;
        }
      }
    }

    return {
      progress,
      profile: userProfile,
      favorites,
      deletedFavorites: Array.from(new Set(deletedFavorites.map(String))),
      settings,
      notes,
      customWords
    };
  } catch (err) {
    console.warn('Load full Firestore user data failed:', err);
    return null;
  }
}

