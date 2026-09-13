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
  return user;
}

export async function loginWithGoogle() {
  if (window.Capacitor?.Plugins?.FirebaseAuthentication) {
    let result;
    try {
      result = await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();
    } catch (authErr) {
      console.warn('Initial Google Sign-In failed, clearing stale session and retrying:', authErr);
      // If error code 16 or reauth failed, clear native state and retry once
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

  throw new Error('Google Sign-In доступен в мобильном приложении.');
}

export async function logoutFirebase() {
  localStorage.removeItem('myduo_firebase_user');
  if (window.Capacitor?.Plugins?.FirebaseAuthentication) {
    try {
      await window.Capacitor.Plugins.FirebaseAuthentication.signOut();
    } catch (e) {
      console.warn('Native Firebase signOut note:', e);
    }
  }
}

export async function deleteCurrentUserAccount() {
  const stored = localStorage.getItem('myduo_firebase_user');
  if (!stored) return;
  const user = JSON.parse(stored);
  const config = getFirebaseConfig();

  if (user.idToken) {
    try {
      await fetch(`${AUTH_BASE}/accounts:delete?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: user.idToken }),
      });
    } catch (e) {}
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

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const fbUser = JSON.parse(localStorage.getItem('myduo_firebase_user') || '{}');
    const curUser = JSON.parse(localStorage.getItem('myduo_current_user') || '{}');
    const token = fbUser.idToken || curUser.idToken || localStorage.getItem('myduo_auth_token') || '';
    const expiresAt = Number(fbUser.expiresAt) || 0;
    if (token && !token.startsWith('tok_') && (!expiresAt || Date.now() < expiresAt - 60000)) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return headers;
}

export async function firestoreFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (netErr) {
    throw netErr;
  }

  // If request failed with 401 UNAUTHENTICATED (e.g. stale/expired Bearer token from localStorage)
  if (res && res.status === 401 && headers['Authorization']) {
    console.warn('Firestore returned 401 with Bearer token, retrying without Authorization header...');
    const retryHeaders = { ...headers };
    delete retryHeaders['Authorization'];
    try {
      res = await fetch(url, { ...options, headers: retryHeaders });
    } catch (retryErr) {
      throw retryErr;
    }
  }

  return res;
}

export async function saveUserProgressFirestore(userId, wordId, progressObj) {
  if (!userId || !wordId) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(userId)}/progress/${encodeURIComponent(wordId)}`);
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
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(userId)}/data/progress`);
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
  const combinedMap = {};
  try {
    // 1. Fetch bulk progress doc (fast single query)
    const bulkRes = await firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(userId)}/data/progress`), {
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
    const subRes = await firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(userId)}/progress`), {
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

export async function syncLeaderboardScoreFirestore(userId, weekKey, xp, userName, userAvatar) {
  if (!userId || !weekKey) return;
  const newXp = Math.round(Number(xp) || 0);
  try {
    const url = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}/players/${encodeURIComponent(userId)}`);
    
    // Safety check: if attempting to write 0 XP, check if remote already has positive XP
    if (newXp <= 0) {
      const existingXp = await getUserWeeklyXpFirestore(userId, weekKey);
      if (existingXp > 0) return;
    }

    const fields = {
      userId: { stringValue: String(userId) },
      name: { stringValue: String(userName || 'User') },
      avatar: { stringValue: String(userAvatar || '') },
      xp: { integerValue: String(newXp) },
      updatedAt: { integerValue: String(Date.now()) },
    };

    await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('Firestore leaderboard sync failed:', err);
  }
}

export async function getUserWeeklyXpFirestore(userId, weekKey) {
  if (!userId || !weekKey) return 0;
  try {
    const url = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}/players/${encodeURIComponent(userId)}`);
    const res = await firestoreFetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return 0;
    const data = await res.json();
    if (data.fields && data.fields.xp) {
      return Number(data.fields.xp.integerValue || data.fields.xp.doubleValue || 0);
    }
  } catch (err) {
    console.warn('Firestore user weekly XP load failed:', err);
  }
  return 0;
}

export async function getWeeklyLeaderboardFirestore(weekKey, limitCount = 100) {
  if (!weekKey) return null;
  try {
    const url = getFirestoreUrl(`/leaderboards/${encodeURIComponent(weekKey)}/players`);
    const res = await firestoreFetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.documents)) return [];

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

    players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    return players.slice(0, limitCount);
  } catch (err) {
    console.warn('Firestore leaderboard fetch failed:', err);
    return null;
  }
}

export async function saveUserProfileFirestore(userId, profileData) {
  if (!userId) return;
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(userId)}`);
    const fields = {};
    for (const [k, v] of Object.entries(profileData || {})) {
      if (typeof v === 'number') fields[k] = { integerValue: String(Math.round(v)) };
      else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      else if (typeof v === 'string') fields[k] = { stringValue: v };
      else if (Array.isArray(v)) {
        fields[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
      }
    }
    fields.updatedAt = { integerValue: String(Date.now()) };

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
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(userId)}/settings/general`);
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
  try {
    const url = getFirestoreUrl(`/users/${encodeURIComponent(userId)}/data/favorites`);
    const arr = (favoritesArray || []).map(id => ({ stringValue: String(id) }));
    const fields = {
      favorites: {
        arrayValue: {
          values: arr
        }
      },
      items: {
        arrayValue: {
          values: arr
        }
      },
      updatedAt: { integerValue: String(Date.now()) }
    };

    const res = await firestoreFetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      console.warn('Firestore favorites save failed HTTP', res.status, await res.text());
    }
  } catch (err) {
    console.warn('Firestore favorites save failed:', err);
  }
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
  try {
    const authHeaders = getAuthHeaders();
    const [progress, userDocRes, favDocRes, setDocRes] = await Promise.all([
      loadUserProgressFirestore(userId),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(userId)}`), { headers: authHeaders }).catch(() => null),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(userId)}/data/favorites`), { headers: authHeaders }).catch(() => null),
      firestoreFetch(getFirestoreUrl(`/users/${encodeURIComponent(userId)}/settings/general`), { headers: authHeaders }).catch(() => null),
    ]);

    let userProfile = {};
    let favorites = [];
    if (userDocRes && userDocRes.ok) {
      const data = await userDocRes.json();
      if (data.fields) {
        for (const [k, f] of Object.entries(data.fields)) {
          if ('stringValue' in f) userProfile[k] = f.stringValue;
          else if ('integerValue' in f) userProfile[k] = Number(f.integerValue);
          else if ('booleanValue' in f) userProfile[k] = f.booleanValue;
        }
        if (data.fields.favorites?.arrayValue?.values) {
          const rFavs = data.fields.favorites.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
          favorites.push(...rFavs);
        }
        if (data.fields.favorite_words?.arrayValue?.values) {
          const rFavs = data.fields.favorite_words.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
          favorites.push(...rFavs);
        }
      }
    }

    if (favDocRes && favDocRes.ok) {
      const data = await favDocRes.json();
      if (data.fields?.favorites?.arrayValue?.values) {
        const subFavs = data.fields.favorites.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
        favorites.push(...subFavs);
      }
      if (data.fields?.items?.arrayValue?.values) {
        const subFavs = data.fields.items.arrayValue.values.map(v => v.stringValue || v.integerValue || v.doubleValue || '').filter(Boolean);
        favorites.push(...subFavs);
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
      settings
    };
  } catch (err) {
    console.warn('Load full Firestore user data failed:', err);
    return null;
  }
}

