// Firebase Integration for English Breakfast (Universal Web & Android Capacitor)
// Uses direct native Google Identity & Firestore REST APIs (100% reliable in all WebViews with zero CDN dependency)

import { getIsoWeekKey, getRecentWeekKeys, getIsoWeekStartMs } from './weekKey.js?v=385.0';

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

export function getFirestoreBase() {
  const config = getFirebaseConfig();
  if (typeof process !== 'undefined' && process.env && process.env.FIRESTORE_EMULATOR_HOST) {
    return `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${config.projectId}/databases/(default)/documents`;
  }
  if (config.firestoreBase) {
    return `${config.firestoreBase}/projects/${config.projectId}/databases/(default)/documents`;
  }
  return `https://firestore.googleapis.com/v1/projects/${config.projectId || DEFAULT_FIREBASE_CONFIG.projectId}/databases/(default)/documents`;
}

// For existing template literals
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${DEFAULT_FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

export function initFirebase() {
  return { config: getFirebaseConfig() };
}

// ----------------- AUTHENTICATION -----------------
const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';

export async function sendEmailVerification(idToken = '') {
  const config = getFirebaseConfig();
  const token = idToken || (await getValidIdToken());
  if (!token) throw new Error('Не авторизован');
  const res = await fetch(`${AUTH_BASE}/accounts:sendOobCode?key=${config.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'VERIFY_EMAIL',
      idToken: token
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Ошибка отправки письма подтверждения');
  }
  return true;
}

export function isEmailVerified() {
  const fb = readJson(FB_USER_KEY);
  if (fb?.provider === 'google') return true;
  const { token } = getStoredToken();
  if (token) {
    try {
      const part = String(token).split('.')[1];
      if (part) {
        const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='));
        const json = JSON.parse(bin);
        if (json.email_verified === true) return true;
      }
    } catch (e) {}
  }
  return false;
}

export async function checkAndRefreshEmailVerification() {
  await getValidIdToken({ force: true });
  const verified = isEmailVerified();
  if (verified && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('myduo:email_verified_updated', { detail: { verified: true } }));
  }
  return verified;
}

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
  // Automatically send email verification link upon registration
  sendEmailVerification(idToken).catch((e) => console.warn('sendEmailVerification:', e));
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
export async function deleteAllUserFirestoreData(userId, idToken) {
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
        const listUrl = `${getFirestoreBase()}${subcollPath}?pageSize=300${pageToken ? '&pageToken=' + pageToken : ''}&key=${config.apiKey}`;
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

  // 4. Удаляем подколлекцию sessions/* и analytics/*
  await delSubcollection(`/users/${uid}/sessions`);
  await delSubcollection(`/users/${uid}/analytics`);

  // 5. Удаляем корневой документ users/{uid}
  await delDoc(`${getFirestoreBase()}/users/${uid}`);

  // 6. Удаляем all-time leaderboard документ
  await delDoc(`${getFirestoreBase()}/leaderboard_alltime/${uid}`);

  // 7. Обнуляем и удаляем записи в leaderboards за последние 8 недель
  try {
    const weekKeys = getRecentWeekKeys(8);
    for (const wKey of weekKeys) {
      // 1) Сначала обнуляем счёт (разрешено правилами create/update)
      const zeroUrl = `${getFirestoreBase()}/leaderboards/${encodeURIComponent(wKey)}/players/${uid}?key=${config.apiKey}`;
      try {
        await fetch(zeroUrl, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            fields: {
              userId: { stringValue: String(userId) },
              name: { stringValue: 'Deleted' },
              xp: { integerValue: '0' },
              updatedAt: { integerValue: String(Date.now()) }
            }
          })
        });
      } catch (e) {}
      // 2) Затем удаляем документ недели полностью
      await delDoc(`${getFirestoreBase()}/leaderboards/${encodeURIComponent(wKey)}/players/${uid}`);
      // 3) Удаляем личную недельную копию в users/{uid}/data
      await delDoc(`${getFirestoreBase()}/users/${uid}/data/weekly_xp_${encodeURIComponent(wKey)}`);
    }
  } catch (e) {
    console.warn('deleteAllUserFirestoreData: leaderboard cleanup error', e);
  }

  // 8. Очищаем локальные кэши рейтингов
  try {
    localStorage.removeItem('cache_leaderboard_all');
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cache_leaderboard_') || k.startsWith(`xp_${uid}_`))) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {}
}

export async function deleteCurrentUserAccount() {
  const stored = localStorage.getItem('myduo_firebase_user');
  let fbUser = null;
  try {
    if (stored) fbUser = JSON.parse(stored);
  } catch (e) {}

  let curUser = null;
  try {
    const rawCur = localStorage.getItem('myduo_user') || localStorage.getItem('myduo_current_user');
    if (rawCur) curUser = JSON.parse(rawCur);
  } catch (e) {}

  const config = getFirebaseConfig();

  // idToken живёт 1 час — принудительно берём свежий (refreshToken или нативный плагин).
  let idToken = fbUser?.idToken || curUser?.idToken || '';
  try {
    const fresh = await getValidIdToken({ force: true });
    if (fresh) idToken = fresh;
  } catch (e) {
    console.warn('deleteCurrentUserAccount: token refresh failed, trying with stored token', e);
  }

  // 1. Удаляем все данные из Firestore ПЕРЕД удалением аккаунта,
  //    пока idToken ещё валиден и правила разрешают write для этого uid.
  const effectiveUid = getEffectiveFirestoreUid();
  const userId = effectiveUid || fbUser?.id || fbUser?.localId || fbUser?.uid || curUser?.firebaseUid || curUser?.id || '';
  if (userId && !String(userId).startsWith('guest')) {
    try {
      await deleteAllUserFirestoreData(userId, idToken);
    } catch (e) {
      console.warn('deleteCurrentUserAccount: Firestore cleanup error (non-fatal):', e);
    }
  }

  // Также проверяем альтернативный ID из локального профиля (если отличается от Firebase UID)
  try {
    const otherId = curUser?.id;
    if (otherId && otherId !== userId && !String(otherId).startsWith('guest')) {
      await deleteAllUserFirestoreData(otherId, idToken);
    }
  } catch (e) {}

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
    }
  }
  localStorage.removeItem('myduo_firebase_user');
  localStorage.removeItem('myduo_user');
  localStorage.removeItem('myduo_current_user');
  localStorage.removeItem('myduo_auth_token');
  localStorage.removeItem('myduo_refresh_token');
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
  return `${getFirestoreBase()}${path}${sep}key=${config.apiKey}`;
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

  // 5. Strictly validate candidate before returning — NEVER return guest IDs or dummy strings
  const candidate = fb?.id || cur?.firebaseUid || providedId || '';
  if (candidate && typeof candidate === 'string' && candidate.length >= 20 && !candidate.includes('_') && !candidate.startsWith('guest') && !/^\d+$/.test(candidate)) {
    return candidate;
  }
  return '';
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

let appCheckConfig = {
  enabled: false,
  siteKey: '', // reCAPTCHA v3 site key for web
  playIntegrityProjectId: '',
  isAndroid: false
};
let appCheckTokenCache = null;

export function configureAppCheck(options = {}) {
  appCheckConfig = { ...appCheckConfig, ...options };
}

export async function getAppCheckToken() {
  if (!appCheckConfig.enabled) return null;
  if (appCheckTokenCache && appCheckTokenCache.expiresAt > Date.now() + 60000) {
    return appCheckTokenCache.token;
  }
  const config = getFirebaseConfig();
  try {
    if (appCheckConfig.isAndroid && typeof window !== 'undefined' && window.Capacitor?.Plugins?.PlayIntegrity) {
      const integrityResult = await window.Capacitor.Plugins.PlayIntegrity.requestIntegrityToken();
      if (integrityResult?.token) {
        const exchangeUrl = `https://content-firebaseappcheck.googleapis.com/v1/projects/${config.projectId}/apps/${config.appId}:exchangePlayIntegrityToken?key=${config.apiKey}`;
        const res = await fetch(exchangeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playIntegrityToken: integrityResult.token })
        });
        if (res.ok) {
          const data = await res.json();
          const ttlMs = (parseInt(data.ttl, 10) || 3600) * 1000;
          appCheckTokenCache = { token: data.token, expiresAt: Date.now() + ttlMs };
          return data.token;
        }
      }
    }

    if (typeof window !== 'undefined' && window.grecaptcha && appCheckConfig.siteKey) {
      const recaptchaToken = await new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          try {
            const tok = await window.grecaptcha.execute(appCheckConfig.siteKey, { action: 'firestore' });
            resolve(tok);
          } catch (e) {
            resolve(null);
          }
        });
      });

      if (recaptchaToken) {
        const exchangeUrl = `https://content-firebaseappcheck.googleapis.com/v1/projects/${config.projectId}/apps/${config.appId}:exchangeRecaptchaV3Token?key=${config.apiKey}`;
        const res = await fetch(exchangeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recaptchaV3Token: recaptchaToken })
        });
        if (res.ok) {
          const data = await res.json();
          const ttlMs = (parseInt(data.ttl, 10) || 3600) * 1000;
          appCheckTokenCache = { token: data.token, expiresAt: Date.now() + ttlMs };
          return data.token;
        }
      }
    }
  } catch (err) {
    console.warn('App Check token fetch error:', err);
  }
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
  if (appCheckTokenCache?.token) {
    headers['X-Firebase-AppCheck'] = appCheckTokenCache.token;
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
    const authHeaders = getAuthHeaders();
    // Fetch collections in parallel — listing collections returns 200 OK with empty array, NEVER 404!
    const [subRes, dataColRes] = await Promise.all([
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/progress`), { headers: authHeaders }).catch(() => null),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data`), { headers: authHeaders }).catch(() => null)
    ]);

    if (dataColRes && dataColRes.ok) {
      const colData = await dataColRes.json();
      const docs = Array.isArray(colData.documents) ? colData.documents : [];
      const progDoc = docs.find(d => (d.name ? d.name.split('/').pop() : '') === 'progress');
      if (progDoc?.fields?.progressJson?.stringValue) {
        try {
          Object.assign(combinedMap, JSON.parse(progDoc.fields.progressJson.stringValue));
        } catch (e) {}
      }
    }

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

let pendingLeaderboardIncrementsCount = 0;

export function hasPendingLeaderboardIncrements() {
  return pendingLeaderboardIncrementsCount > 0;
}

async function sendCommitXpDeltaSingle(userId, weekKey, weeklyDelta, userName, userAvatar) {
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return { success: false, reason: 'not_authenticated' };

  const delta = Math.round(Number(weeklyDelta) || 0);

  const cleanName = (userName != null) ? String(userName).slice(0, 50) : 'Гость';
  const cleanAvatar = (userAvatar != null) ? String(userAvatar) : '';
  const nowMs = Date.now();
  const expireAtIso = new Date(nowMs + 35 * 86400000).toISOString();

  // In totalXp go strictly positive increments (penalties do not reduce totalXp)
  const totalDelta = Math.max(0, delta);

  const config = getFirebaseConfig();
  const projectId = config.projectId || DEFAULT_FIREBASE_CONFIG.projectId;
  const dbDocPrefix = `projects/${projectId}/databases/(default)/documents`;

  const weeklyDocPath = `${dbDocPrefix}/leaderboards/${encodeURIComponent(weekKey)}/players/${encodeURIComponent(uid)}`;
  const alltimeDocPath = `${dbDocPrefix}/leaderboard_alltime/${encodeURIComponent(uid)}`;
  const userWeeklyDocPath = `${dbDocPrefix}/users/${encodeURIComponent(uid)}/data/weekly_xp_${encodeURIComponent(weekKey)}`;

  const weekStartMs = getIsoWeekStartMs(weekKey);

  const writes = [
    // 1. Weekly leaderboard player doc:
    // Update metadata, weekKey, weekStartMs and apply atomic increment on xp with server timestamp
    {
      update: {
        name: weeklyDocPath,
        fields: {
          userId: { stringValue: String(uid) },
          name: { stringValue: cleanName },
          avatar: { stringValue: cleanAvatar },
          weekKey: { stringValue: String(weekKey) },
          weekStartMs: { integerValue: String(weekStartMs) },
          expireAt: { timestampValue: expireAtIso }
        }
      },
      updateMask: {
        fieldPaths: ['userId', 'name', 'avatar', 'weekKey', 'weekStartMs', 'expireAt']
      },
      updateTransforms: [
        {
          fieldPath: 'updatedAt',
          setToServerValue: 'REQUEST_TIME'
        },
        {
          fieldPath: 'xp',
          increment: { integerValue: String(delta) }
        }
      ]
    },
    // 2. Personal weekly copy: users/{uid}/data/weekly_xp_{week}
    {
      update: {
        name: userWeeklyDocPath,
        fields: {
          name: { stringValue: cleanName },
          avatar: { stringValue: cleanAvatar },
          updatedAt: { integerValue: String(nowMs) }
        }
      },
      updateMask: {
        fieldPaths: ['name', 'avatar', 'updatedAt']
      },
      updateTransforms: [
        {
          fieldPath: 'xp',
          increment: { integerValue: String(delta) }
        }
      ]
    },
    // 3. All-time global leaderboard doc:
    // ALWAYS includes totalXp transform (even when delta <= 0, totalDelta = 0)
    // so leaderboard_alltime document contains totalXp upon creation
    {
      update: {
        name: alltimeDocPath,
        fields: {
          userId: { stringValue: String(uid) },
          name: { stringValue: cleanName },
          avatar: { stringValue: cleanAvatar }
        }
      },
      updateMask: {
        fieldPaths: ['userId', 'name', 'avatar']
      },
      updateTransforms: [
        {
          fieldPath: 'updatedAt',
          setToServerValue: 'REQUEST_TIME'
        },
        {
          fieldPath: 'totalXp',
          increment: { integerValue: String(totalDelta) }
        }
      ]
    }
  ];

  const commitUrl = `${getFirestoreBase()}:commit?key=${config.apiKey}`;

  pendingLeaderboardIncrementsCount++;
  try {
    const res = await firestoreFetch(commitUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ writes })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('Firestore atomic commit delta failed:', res.status, errText);
      if (res.status === 403 && typeof window !== 'undefined') {
        const kind = !isEmailVerified() ? 'email_not_verified' : 'permission_denied';
        window.dispatchEvent(new CustomEvent('myduo:sync-issue', {
          detail: {
            kind,
            status: 403,
            message: kind === 'email_not_verified'
              ? 'Для участия в рейтинге подтвердите email. Проверьте ваш почтовый ящик.'
              : 'Ошибка синхронизации рейтинга: доступ ограничен.'
          }
        }));
      }
      return { success: false, status: res.status, error: errText };
    }
    const data = await res.json().catch(() => ({}));
    return { success: true, data, acceptedDelta: delta };
  } catch (err) {
    console.warn('Firestore atomic commit delta exception:', err);
    return { success: false, error: err.message };
  } finally {
    pendingLeaderboardIncrementsCount = Math.max(0, pendingLeaderboardIncrementsCount - 1);
  }
}

export async function commitXpDeltaFirestore(userId, weekKey, weeklyDelta, userName, userAvatar) {
  if (!userId || !weekKey) return { success: false, reason: 'missing_args' };
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return { success: false, reason: 'not_authenticated' };

  const delta = Math.round(Number(weeklyDelta) || 0);
  if (delta === 0) {
    return sendCommitXpDeltaSingle(uid, weekKey, 0, userName, userAvatar);
  }

  // Single write limit in firestore.rules is 1000 per atomic commit (no more than 1000 XP per session).
  const clampedDelta = delta > 1000 ? 1000 : (delta < -1000 ? -1000 : delta);
  return sendCommitXpDeltaSingle(uid, weekKey, clampedDelta, userName, userAvatar);
}

const activeWeeklyReconciles = new Map();
const activeAllTimeReconciles = new Map();

export async function reconcileWeeklyXpFirestore(userId, weekKey, localXp, userName, userAvatar) {
  if (!userId || !weekKey) return null;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return null;

  const key = `${uid}_${weekKey}`;
  if (activeWeeklyReconciles.has(key)) {
    return activeWeeklyReconciles.get(key);
  }

  const promise = (async () => {
    if (hasPendingLeaderboardIncrements()) {
      return { skipped: true, reason: 'pending_increments' };
    }

    const cleanLocalXp = Math.max(0, Math.round(Number(localXp) || 0));

    let serverXp = 0;
    try {
      const config = getFirebaseConfig();
      const docUrl = `${getFirestoreBase()}/leaderboards/${encodeURIComponent(weekKey)}/players/${encodeURIComponent(uid)}?key=${config.apiKey}`;
      const res = await firestoreFetch(docUrl, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        serverXp = Number(data.fields?.xp?.integerValue || data.fields?.xp?.doubleValue || 0);
      } else if (res.status === 404) {
        serverXp = 0;
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }

    if (cleanLocalXp > serverXp) {
      const diff = cleanLocalXp - serverXp;
      const commitRes = await commitXpDeltaFirestore(uid, weekKey, diff, userName, userAvatar);
      if (!commitRes || !commitRes.success) {
        return { reconciled: false, localXp: cleanLocalXp, serverXp, error: commitRes?.error || 'commit_failed' };
      }
      const acceptedDelta = commitRes.acceptedDelta !== undefined ? commitRes.acceptedDelta : Math.min(diff, 1000);
      const newServerXp = serverXp + acceptedDelta;
      return { reconciled: true, localXp: cleanLocalXp, serverXp: newServerXp };
    } else if (serverXp > cleanLocalXp) {
      try {
        localStorage.setItem(`xp_${uid}_${weekKey}`, String(serverXp));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('myduo:xp_changed', { detail: { xp: serverXp, delta: 0 } }));
        }
      } catch (e) {}
      return { reconciled: true, localXp: serverXp, serverXp };
    }

    return { reconciled: false, localXp: cleanLocalXp, serverXp };
  })();

  activeWeeklyReconciles.set(key, promise);
  try {
    return await promise;
  } finally {
    activeWeeklyReconciles.delete(key);
  }
}

export async function reconcileAllTimeXpFirestore(userId, userName, userAvatar) {
  if (!userId) return null;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return null;

  if (activeAllTimeReconciles.has(uid)) {
    return activeAllTimeReconciles.get(uid);
  }

  const promise = (async () => {
    if (hasPendingLeaderboardIncrements()) {
      return { skipped: true, reason: 'pending_increments' };
    }

    const cleanName = (userName != null) ? String(userName).slice(0, 50) : 'Гость';
    const cleanAvatar = (userAvatar != null) ? String(userAvatar) : '';

    let totalLocalXp = 0;
    try {
      const prefix = `xp_${uid}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          totalLocalXp += Number(localStorage.getItem(k) || 0);
        }
      }
    } catch (e) {}

    const config = getFirebaseConfig();
    const projectId = config.projectId || DEFAULT_FIREBASE_CONFIG.projectId;
    const alltimeDocName = `projects/${projectId}/databases/(default)/documents/leaderboard_alltime/${encodeURIComponent(uid)}`;
    const docUrl = `${getFirestoreBase()}/leaderboard_alltime/${encodeURIComponent(uid)}?key=${config.apiKey}`;

    let docExists = false;
    let serverTotalXp = 0;
    try {
      const res = await firestoreFetch(docUrl, { headers: getAuthHeaders() });
      if (res.ok) {
        docExists = true;
        const data = await res.json();
        serverTotalXp = Number(data.fields?.totalXp?.integerValue || data.fields?.totalXp?.doubleValue || 0);
      } else if (res.status === 404) {
        docExists = false;
        serverTotalXp = 0;
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }

    if (!docExists) {
      if (totalLocalXp <= 0) return null;

      const initialTotalXp = totalLocalXp;
      const createWriteAlltime = {
        update: {
          name: alltimeDocName,
          fields: {
            userId: { stringValue: String(uid) },
            name: { stringValue: cleanName },
            avatar: { stringValue: cleanAvatar },
            totalXp: { integerValue: String(initialTotalXp) }
          }
        },
        updateMask: {
          fieldPaths: ['userId', 'name', 'avatar', 'totalXp']
        },
        updateTransforms: [
          {
            fieldPath: 'updatedAt',
            setToServerValue: 'REQUEST_TIME'
          }
        ]
      };

      pendingLeaderboardIncrementsCount++;
      try {
        const commitUrl = `${getFirestoreBase()}:commit?key=${config.apiKey}`;
        const cRes = await firestoreFetch(commitUrl, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ writes: [createWriteAlltime] })
        });
        if (!cRes.ok) return { reconciled: false, totalXp: serverTotalXp };
      } finally {
        pendingLeaderboardIncrementsCount = Math.max(0, pendingLeaderboardIncrementsCount - 1);
      }
      return { reconciled: true, totalXp: initialTotalXp };
    } else {
      // Document exists: reconcile UPWARDS only, step capped at 1000
      if (totalLocalXp > serverTotalXp) {
        const chunk = Math.min(totalLocalXp - serverTotalXp, 1000);
        const incWriteAlltime = {
          update: {
            name: alltimeDocName,
            fields: {
              userId: { stringValue: String(uid) },
              name: { stringValue: cleanName },
              avatar: { stringValue: cleanAvatar }
            }
          },
          updateMask: {
            fieldPaths: ['userId', 'name', 'avatar']
          },
          updateTransforms: [
            {
              fieldPath: 'updatedAt',
              setToServerValue: 'REQUEST_TIME'
            },
            {
              fieldPath: 'totalXp',
              increment: { integerValue: String(chunk) }
            }
          ]
        };

        pendingLeaderboardIncrementsCount++;
        try {
          const commitUrl = `${getFirestoreBase()}:commit?key=${config.apiKey}`;
          const cRes = await firestoreFetch(commitUrl, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ writes: [incWriteAlltime] })
          });
          if (!cRes.ok) {
            const errText = await cRes.text().catch(() => '');
            return { reconciled: false, totalXp: serverTotalXp, error: errText };
          }
        } finally {
          pendingLeaderboardIncrementsCount = Math.max(0, pendingLeaderboardIncrementsCount - 1);
        }
        return { reconciled: true, totalXp: serverTotalXp + chunk };
      }

      return { reconciled: false, totalXp: serverTotalXp };
    }
  })();

  activeAllTimeReconciles.set(uid, promise);
  try {
    return await promise;
  } finally {
    activeAllTimeReconciles.delete(uid);
  }
}

export async function syncLeaderboardScoreFirestore(userId, weekKey, xp, userName, userAvatar) {
  if (!userId || !weekKey) return;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return;
  const cleanName = (userName != null) ? String(userName).slice(0, 50) : 'Гость';
  const cleanAvatar = (userAvatar != null) ? String(userAvatar) : '';
  await reconcileWeeklyXpFirestore(uid, weekKey, xp, cleanName, cleanAvatar).catch(() => {});
  reconcileAllTimeXpFirestore(uid, cleanName, cleanAvatar).catch(() => {});
}

export async function getUserWeeklyXpFirestore(userId, weekKey) {
  if (!userId || !weekKey) return 0;
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return 0;

  // Try personal user data collection (listing collection never 404s)
  try {
    const colUrl = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data`);
    const res = await firestoreFetch(colUrl, { headers: getAuthHeaders() });
    if (res.ok) {
      const colData = await res.json();
      const docs = Array.isArray(colData.documents) ? colData.documents : [];
      const targetName = `weekly_xp_${weekKey}`;
      const doc = docs.find(d => (d.name ? d.name.split('/').pop() : '') === targetName);
      if (doc?.fields?.xp) {
        return Number(doc.fields.xp.integerValue || doc.fields.xp.doubleValue || 0);
      }
    }
  } catch (e) {}

  return 0;
}

export async function getWeeklyLeaderboardFirestore(weekKey, limitCount = 100) {
  if (!weekKey) return null;

  // 1. Primary query: structuredQuery via :runQuery ordered by xp DESCENDING
  try {
    const url = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}:runQuery`);
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'players' }],
        orderBy: [{ field: { fieldPath: 'xp' }, direction: 'DESCENDING' }],
        limit: Math.max(10, limitCount + 10) // Buffer for filtered deleted players
      }
    };

    const res = await firestoreFetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(queryBody)
    });

    if (res.ok) {
      const data = await res.json();
      const docs = (Array.isArray(data) ? data : [])
        .map(item => item && item.document)
        .filter(Boolean);

      if (docs.length > 0) {
        const players = docs.map((doc) => {
          const obj = {};
          for (const [k, f] of Object.entries(doc.fields || {})) {
            if ('stringValue' in f) obj[k] = f.stringValue;
            else if ('integerValue' in f) obj[k] = Number(f.integerValue);
            else if ('doubleValue' in f) obj[k] = Number(f.doubleValue);
            else if ('booleanValue' in f) obj[k] = f.booleanValue;
          }
          return obj;
        });

        const validPlayers = players.filter(p => {
          if (!p || !p.userId) return false;
          if (p.name === 'Deleted') return false;
          if (Number(p.xp || 0) <= 0) return false;
          return true;
        });

        validPlayers.sort((a, b) => (Number(b.xp) || 0) - (Number(a.xp) || 0));
        return validPlayers.slice(0, limitCount);
      }
    }
  } catch (err) {
    console.warn('Distributed Firestore weekly leaderboard runQuery warning:', err);
  }

  return null;
}

export async function getAllTimeLeaderboardFirestore(limitCount = 100) {
  try {
    const url = getFirestoreUrl(':runQuery');
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'leaderboard_alltime' }],
        orderBy: [{ field: { fieldPath: 'totalXp' }, direction: 'DESCENDING' }],
        limit: Math.max(10, limitCount + 10)
      }
    };

    const res = await firestoreFetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(queryBody)
    });

    if (res.ok) {
      const data = await res.json();
      const docs = (Array.isArray(data) ? data : [])
        .map(item => item && item.document)
        .filter(Boolean);

      if (docs.length > 0) {
        const players = docs.map((doc) => {
          const obj = {};
          for (const [k, f] of Object.entries(doc.fields || {})) {
            if ('stringValue' in f) obj[k] = f.stringValue;
            else if ('integerValue' in f) obj[k] = Number(f.integerValue);
            else if ('doubleValue' in f) obj[k] = Number(f.doubleValue);
            else if ('booleanValue' in f) obj[k] = f.booleanValue;
          }
          obj.xp = Number(obj.totalXp != null ? obj.totalXp : (obj.xp || 0));
          return obj;
        });

        const validPlayers = players.filter(p => {
          if (!p || !p.userId) return false;
          if (p.name === 'Deleted') return false;
          if (Number(p.xp || 0) <= 0) return false;
          return true;
        });

        validPlayers.sort((a, b) => (Number(b.xp) || 0) - (Number(a.xp) || 0));
        return validPlayers.slice(0, limitCount);
      }
    }
  } catch (err) {
    console.warn('Distributed Firestore all-time leaderboard runQuery warning:', err);
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
  const cleanNotes = notesMap && typeof notesMap === 'object' ? notesMap : {};
  const notesStr = JSON.stringify(cleanNotes);
  const notesBytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(notesStr).length
    : Buffer.byteLength(notesStr, 'utf8');
  if (notesBytes > 900000) {
    const errMsg = `Размер заметок (${notesBytes} байт) превышает лимит Firestore (900 000 байт). Сохранение отменено.`;
    console.error(errMsg);
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind: 'notes_save', message: errMsg } }));
      } catch (e) {}
    }
    throw new Error(errMsg);
  }

  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/notes`);
    const fields = {
      notesJson: { stringValue: notesStr },
      updatedAt: { integerValue: String(Date.now()) }
    };

    const res = await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const errMsg = `Ошибка сохранения заметок в Firestore: HTTP ${res.status}`;
      console.error(errMsg);
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind: 'notes_save', status: res.status, message: errMsg } }));
        } catch (e) {}
      }
      throw new Error(errMsg);
    }
  } catch (err) {
    console.error('Firestore notes save failed:', err);
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind: 'notes_save', message: err.message } }));
      } catch (e) {}
    }
    throw err;
  }
}

export async function loadUserNotesFirestore(userId) {
  if (!userId) return {};
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return {};
  try {
    const colUrl = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data`);
    const res = await firestoreFetch(colUrl, { headers: getAuthHeaders() }).catch(() => null);
    if (!res || !res.ok) return {};
    const colData = await res.json();
    const docs = Array.isArray(colData.documents) ? colData.documents : [];
    const doc = docs.find(d => (d.name ? d.name.split('/').pop() : '') === 'notes');
    if (doc?.fields?.notesJson?.stringValue) {
      return JSON.parse(doc.fields.notesJson.stringValue);
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
  const cleanWords = Array.isArray(wordsArray) ? wordsArray : [];
  const wordsStr = JSON.stringify(cleanWords);
  const wordsBytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(wordsStr).length
    : Buffer.byteLength(wordsStr, 'utf8');
  if (wordsBytes > 900000) {
    const errMsg = `Размер словаря (${wordsBytes} байт) превышает лимит Firestore (900 000 байт). Сохранение отменено.`;
    console.error(errMsg);
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind: 'custom_words_save', message: errMsg } }));
      } catch (e) {}
    }
    throw new Error(errMsg);
  }

  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/data/custom_words`);
    const fields = {
      wordsJson: { stringValue: wordsStr },
      count: { integerValue: String(cleanWords.length) },
      updatedAt: { integerValue: String(Date.now()) }
    };

    const res = await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const errMsg = `Ошибка сохранения пользовательских слов в Firestore: HTTP ${res.status}`;
      console.error(errMsg);
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind: 'custom_words_save', status: res.status, message: errMsg } }));
        } catch (e) {}
      }
      throw new Error(errMsg);
    }
  } catch (err) {
    console.error('Firestore custom words save failed:', err);
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('myduo:sync-issue', { detail: { kind: 'custom_words_save', message: err.message } }));
      } catch (e) {}
    }
    throw err;
  }
}

export async function fetchSharedVocabularyUpdatesFirestore() {
  const config = getFirebaseConfig();
  const url = `${getFirestoreBase()}/shared/vocabulary_updates?key=${config.apiKey}`;
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

  const url = `${getFirestoreBase()}/shared/vocabulary_updates?key=${config.apiKey}`;
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
  const uid = getEffectiveFirestoreUid(sessionData.userId);
  if (!uid) return; // Guest or unauthenticated - skip to avoid 403!
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/sessions/${encodeURIComponent(sessionId)}`);
    const fields = toFirestoreFields({
      ...sessionData,
      userId: uid,
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
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return; // Guest or unauthenticated - skip to avoid 403!
  try {
    const cleanData = { ...summaryData, updatedAt: Date.now() };
    const fields = toFirestoreFields(cleanData);
    const maskParams = Object.keys(cleanData)
      .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&');
    const path = `/users/${encodeURIComponent(uid)}${maskParams ? '?' + maskParams : ''}`;
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
  const uid = getEffectiveFirestoreUid(userId);
  if (!uid) return; // Guest or unauthenticated - skip to avoid 403!
  try {
    const timestamp = Date.now();
    const url = getFirestoreUrl(`/users/${encodeURIComponent(uid)}/analytics/${encodeURIComponent(uid + '_' + timestamp)}`);
    const fields = toFirestoreFields({
      userId: String(uid),
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
    const config = getFirebaseConfig();
    const authHeaders = getAuthHeaders();
    const fetchAllDataDocs = async () => {
      let docs = [];
      let pageToken = '';
      do {
        let pageUrl = `${getFirestoreBase()}/users/${encodeURIComponent(uid)}/data?pageSize=100&key=${config.apiKey}`;
        if (pageToken) {
          pageUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
        }
        const res = await firestoreFetch(pageUrl, { headers: authHeaders }).catch(() => null);
        if (!res || !res.ok) break;
        const data = await res.json().catch(() => null);
        if (!data) break;
        if (Array.isArray(data.documents)) {
          docs.push(...data.documents);
        }
        pageToken = data.nextPageToken || '';
      } while (pageToken);
      return docs;
    };

    const [progress, userDocRes, dataDocs, setDocRes] = await Promise.all([
      loadUserProgressFirestore(uid),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}`), { headers: authHeaders }).catch(() => null),
      fetchAllDataDocs().catch(() => []),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(uid)}/settings`), { headers: authHeaders }).catch(() => null),
    ]);

    let userProfile = {};
    let favorites = [];
    let deletedFavorites = [];
    let hasExplicitFavDoc = false;
    let notes = {};
    let customWords = [];

    // Parse all documents in /users/{uid}/data (favorites, deleted_favorites, notes, custom_words, progress)
    // This avoids 404 Not Found network errors when documents do not exist yet!
    if (Array.isArray(dataDocs) && dataDocs.length > 0) {
      try {
        const docs = dataDocs;
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
          } else if (docName === 'progress') {
            if (doc.fields?.progressJson?.stringValue) {
              try {
                Object.assign(progress, JSON.parse(doc.fields.progressJson.stringValue));
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
      try {
        const data = await setDocRes.json();
        const docs = Array.isArray(data.documents) ? data.documents : [];
        const genDoc = docs.find(d => (d.name ? d.name.split('/').pop() : '') === 'general');
        if (genDoc && genDoc.fields) {
          settings = {};
          for (const [k, f] of Object.entries(genDoc.fields)) {
            if ('stringValue' in f) settings[k] = f.stringValue;
            else if ('integerValue' in f) settings[k] = Number(f.integerValue);
            else if ('booleanValue' in f) settings[k] = f.booleanValue;
          }
        }
      } catch (e) {}
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

