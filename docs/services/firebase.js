// Firebase SDK Integration for English Breakfast (Web & Android Capacitor)
// Compatible with both browser ESM CDN and local bundlers

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  enableIndexedDbPersistence,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

// Default Firebase Configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyReplaceWithActualFirebaseConfig",
  authDomain: "my-duolingo-trainer.firebaseapp.com",
  projectId: "my-duolingo-trainer",
  storageBucket: "my-duolingo-trainer.appspot.com",
  messagingSenderId: "971261131396",
  appId: "1:971261131396:web:1234567890abcdef",
};

function getFirebaseConfig() {
  try {
    const custom = localStorage.getItem('myduo_firebase_config');
    if (custom) {
      return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(custom) };
    }
  } catch (e) {
    console.warn('Failed to parse custom firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

let app = null;
let auth = null;
let db = null;
let isInitialized = false;

export function initFirebase() {
  if (isInitialized) return { app, auth, db };

  try {
    const config = getFirebaseConfig();
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    // Try offline persistence for Firestore
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time.
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the features required to enable persistence
        }
      });
    } catch (e) {}

    isInitialized = true;
    console.log('✅ Firebase successfully initialized');
  } catch (err) {
    console.warn('⚠️ Firebase init skipped or failed (offline/mock mode will be used):', err.message);
  }

  return { app, auth, db };
}

// ----------------- AUTHENTICATION -----------------

export async function loginWithGoogle() {
  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase Auth not available');

  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      id: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      avatar: user.photoURL || '',
      provider: 'google',
    };
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      console.warn('Google Popup closed or blocked');
    }
    throw err;
  }
}

export async function loginWithEmail(email, password) {
  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase Auth not available');

  const res = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = res.user;
  return {
    id: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
    avatar: user.photoURL || '',
    provider: 'email',
  };
}

export async function registerWithEmail(email, password, name = '') {
  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase Auth not available');

  const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = res.user;

  if (name && name.trim().length > 0) {
    try {
      await updateProfile(user, { displayName: name.trim() });
    } catch (e) {
      console.warn('Failed to update displayName:', e);
    }
  }

  return {
    id: user.uid,
    name: name.trim() || user.email.split('@')[0],
    email: user.email,
    avatar: user.photoURL || '',
    provider: 'email',
  };
}

export async function logoutFirebase() {
  const { auth } = initFirebase();
  if (auth) {
    await signOut(auth);
  }
}

export async function deleteCurrentUserAccount() {
  const { auth, db } = initFirebase();
  if (!auth || !auth.currentUser) throw new Error('No active user to delete');

  const uid = auth.currentUser.uid;

  if (db) {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.warn('Failed to delete user doc in firestore:', e);
    }
  }

  await deleteUser(auth.currentUser);
}

export function subscribeToAuthState(callback) {
  const { auth } = initFirebase();
  if (!auth) return () => {};

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || '',
        provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
      });
    } else {
      callback(null);
    }
  });
}

// ----------------- FIRESTORE (PROGRESS & LEADERBOARD) -----------------

export async function saveUserProgressFirestore(userId, wordId, progressObj) {
  const { db } = initFirebase();
  if (!db || !userId) return;

  try {
    const userRef = doc(db, 'users', String(userId), 'progress', String(wordId));
    await setDoc(userRef, {
      ...progressObj,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore progress save failed:', err);
  }
}

export async function loadUserProgressFirestore(userId) {
  const { db } = initFirebase();
  if (!db || !userId) return {};

  try {
    const colRef = collection(db, 'users', String(userId), 'progress');
    const snapshot = await getDocs(colRef);
    const progressMap = {};
    snapshot.forEach((docSnap) => {
      progressMap[docSnap.id] = docSnap.data();
    });
    return progressMap;
  } catch (err) {
    console.warn('Firestore progress load failed:', err);
    return {};
  }
}

export async function syncLeaderboardScoreFirestore(userId, weekKey, xp, userName, userAvatar) {
  const { db } = initFirebase();
  if (!db || !userId || !weekKey) return;

  try {
    const entryRef = doc(db, 'leaderboards', String(weekKey), 'players', String(userId));
    await setDoc(entryRef, {
      userId: String(userId),
      name: userName || 'User',
      avatar: userAvatar || '',
      xp: Number(xp) || 0,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore leaderboard sync failed:', err);
  }
}

export async function getWeeklyLeaderboardFirestore(weekKey, limitCount = 100) {
  const { db } = initFirebase();
  if (!db || !weekKey) return null;

  try {
    const playersCol = collection(db, 'leaderboards', String(weekKey), 'players');
    const q = query(playersCol, orderBy('xp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    const players = [];
    snapshot.forEach((docSnap) => {
      players.push(docSnap.data());
    });
    return players;
  } catch (err) {
    console.warn('Firestore leaderboard fetch failed:', err);
    return null;
  }
}
