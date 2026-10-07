import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// Mock localStorage for node environment
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(String(k), String(v)),
  removeItem: (k) => storage.delete(String(k)),
  clear: () => storage.clear(),
  key: (i) => Array.from(storage.keys())[i] || null,
  get length() { return storage.size; }
};
globalThis.window = {
  dispatchEvent: () => true
};

const rules = fs.readFileSync('firestore.rules', 'utf8');

// Initialize test environment pointing to local firestore emulator
const testEnv = await initializeTestEnvironment({
  projectId: 'demo-rules-test',
  firestore: {
    host: '127.0.0.1',
    port: 8088,
    rules
  }
});

const { getIsoWeekKey, getIsoWeekStartMs } = await import('../frontend/services/weekKey.js');

test('Firestore Security Rules: Full Verification against Emulator', async (t) => {
  const currentWeek = getIsoWeekKey();
  const currentWeekStartMs = getIsoWeekStartMs(currentWeek);

  // (а) пользователь A пишет и читает свои notes и custom_words
  await t.test('(а) Пользователь A пишет и читает свои notes и custom_words', async () => {
    const alice = testEnv.authenticatedContext('alice_uid', { email_verified: true });
    const db = alice.firestore();

    await assertSucceeds(
      db.doc('users/alice_uid/data/notes').set({
        notesJson: JSON.stringify({ word1: 'my personal note' }),
        updatedAt: Date.now()
      })
    );

    await assertSucceeds(
      db.doc('users/alice_uid/data/custom_words').set({
        wordsJson: JSON.stringify([{ word: 'test', translation: 'тест' }]),
        count: 1,
        updatedAt: Date.now()
      })
    );

    const notesDoc = await db.doc('users/alice_uid/data/notes').get();
    assert.equal(notesDoc.exists, true);

    const wordsDoc = await db.doc('users/alice_uid/data/custom_words').get();
    assert.equal(wordsDoc.exists, true);
  });

  // (б) пользователь B и аноним их не читают
  await t.test('(б) Пользователь B и аноним не читают notes и custom_words пользователя A', async () => {
    const bob = testEnv.authenticatedContext('bob_uid', { email_verified: true });
    const anon = testEnv.unauthenticatedContext();

    await assertFails(bob.firestore().doc('users/alice_uid/data/notes').get());
    await assertFails(bob.firestore().doc('users/alice_uid/data/custom_words').get());

    await assertFails(anon.firestore().doc('users/alice_uid/data/notes').get());
    await assertFails(anon.firestore().doc('users/alice_uid/data/custom_words').get());
  });

  // (в) раньше публичные данные админ-аккаунта больше не читаются без входа
  await t.test('(в) Публичные данные админ-аккаунта больше не читаются без входа', async () => {
    const anon = testEnv.unauthenticatedContext();
    const bob = testEnv.authenticatedContext('bob_uid', { email_verified: true });
    const adminUid = 'wB3NVAmBarXHSBrtEzDCriS0XBy2';

    await assertFails(anon.firestore().doc(`users/${adminUid}/data/vocabulary_updates`).get());
    await assertFails(anon.firestore().doc(`users/${adminUid}/data/notes`).get());
    await assertFails(bob.firestore().doc(`users/${adminUid}/data/vocabulary_updates`).get());
  });

  // (г) shared/vocabulary_updates читается всеми, пишет только админ
  await t.test('(г) shared/vocabulary_updates читается всеми, пишет только админ', async () => {
    const anon = testEnv.unauthenticatedContext();
    const alice = testEnv.authenticatedContext('alice_uid', { email_verified: true });
    const admin = testEnv.authenticatedContext('wB3NVAmBarXHSBrtEzDCriS0XBy2', { email_verified: true });

    // Non-admin writing fails
    await assertFails(
      alice.firestore().doc('shared/vocabulary_updates').set({
        updatesJson: '{}',
        updatedAt: Date.now()
      })
    );

    // Admin writing succeeds
    await assertSucceeds(
      admin.firestore().doc('shared/vocabulary_updates').set({
        updatesJson: '{"word_1":{"word":"apple"}}',
        updatedAt: Date.now()
      })
    );

    // Public read by anon and regular user succeeds
    await assertSucceeds(anon.firestore().doc('shared/vocabulary_updates').get());
    await assertSucceeds(alice.firestore().doc('shared/vocabulary_updates').get());
  });

  // (д) list по /users запрещён, get разрешён
  await t.test('(д) list по /users запрещён, get разрешён', async () => {
    const alice = testEnv.authenticatedContext('alice_uid', { email_verified: true });
    const anon = testEnv.unauthenticatedContext();

    // Listing /users collection is denied
    await assertFails(alice.firestore().collection('users').get());
    await assertFails(anon.firestore().collection('users').get());

    // Single document get on /users/{userId} is permitted
    await assertSucceeds(anon.firestore().doc('users/alice_uid').get());
    await assertSucceeds(alice.firestore().doc('users/alice_uid').get());
  });

  // (е) создание alltime с totalXp > 5000 отклоняется
  await t.test('(е) Создание alltime с totalXp > 5000 отклоняется, <= 5000 разрешено', async () => {
    const carol = testEnv.authenticatedContext('carol_uid', { email_verified: true });

    // totalXp = 5001 -> rejected
    await assertFails(
      carol.firestore().doc('leaderboard_alltime/carol_uid').set({
        userId: 'carol_uid',
        name: 'Carol',
        totalXp: 5001,
        updatedAt: serverTimestamp()
      })
    );

    // totalXp = 5000 -> allowed
    await assertSucceeds(
      carol.firestore().doc('leaderboard_alltime/carol_uid').set({
        userId: 'carol_uid',
        name: 'Carol',
        totalXp: 5000,
        updatedAt: serverTimestamp()
      })
    );
  });

  // (ж) прирост быстрее допустимой скорости отклоняется
  await t.test('(ж) Прирост быстрее допустимой скорости отклоняется', async () => {
    const dave = testEnv.authenticatedContext('dave_uid', { email_verified: true });
    const db = dave.firestore();

    await assertSucceeds(
      db.doc('leaderboard_alltime/dave_uid').set({
        userId: 'dave_uid',
        name: 'Dave',
        totalXp: 100,
        updatedAt: serverTimestamp()
      })
    );

    // Instant increase of +1000 XP with same or immediate timestamp is rejected
    await assertFails(
      db.doc('leaderboard_alltime/dave_uid').update({
        totalXp: 1100,
        updatedAt: serverTimestamp()
      })
    );

    // Fair increase of +10 XP is allowed
    await assertSucceeds(
      db.doc('leaderboard_alltime/dave_uid').update({
        totalXp: 110,
        updatedAt: serverTimestamp()
      })
    );
  });

  // (з) запись с чужим userId отклоняется
  await t.test('(з) Запись с чужим userId отклоняется', async () => {
    const eve = testEnv.authenticatedContext('eve_uid', { email_verified: true });
    const db = eve.firestore();

    // In alien document
    await assertFails(
      db.doc('leaderboard_alltime/frank_uid').set({
        userId: 'frank_uid',
        name: 'Frank',
        totalXp: 100,
        updatedAt: serverTimestamp()
      })
    );

    // In own document path but with mismatched data.userId
    await assertFails(
      db.doc('leaderboard_alltime/eve_uid').set({
        userId: 'frank_uid',
        name: 'Eve',
        totalXp: 100,
        updatedAt: serverTimestamp()
      })
    );

    // Weekly alien document
    await assertFails(
      db.doc(`leaderboards/${currentWeek}/players/frank_uid`).set({
        userId: 'frank_uid',
        name: 'Frank',
        xp: 100,
        weekStartMs: currentWeekStartMs,
        updatedAt: serverTimestamp()
      })
    );
  });

  // (и) подколлекция с именем вне белого списка отклоняется
  await t.test('(и) Подколлекция с именем вне белого списка отклоняется, превышение размера строки отклоняется', async () => {
    const alice = testEnv.authenticatedContext('alice_uid', { email_verified: true });
    const db = alice.firestore();

    // Subcollection outside whitelist ('other_data' not in progress, settings, data, sessions, analytics)
    await assertFails(
      db.doc('users/alice_uid/other_data/doc1').set({
        foo: 'bar'
      })
    );

    // Allowed subcollection 'settings'
    await assertSucceeds(
      db.doc('users/alice_uid/settings/general').set({
        theme: 'dark'
      })
    );

    // String size in subcollection exceeding 900,000 characters is rejected
    const hugeString = 'a'.repeat(900001);
    await assertFails(
      db.doc('users/alice_uid/data/notes').set({
        notesJson: hugeString
      })
    );
  });

  // Регрессия: сохранение и загрузка заметок и своих слов через API на эмуляторе после всех изменений
  await t.test('Регрессия: сохранение и загрузка заметок и своих слов через API на эмуляторе', async () => {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8088';
    const testUid = 'RegressTestUser1234567890abc';

    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      user_id: testUid,
      sub: testUid,
      email_verified: true,
      exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');
    const mockJwt = header + '.' + payload + '.';

    localStorage.setItem('myduo_firebase_config', JSON.stringify({
      projectId: 'demo-rules-test',
      apiKey: 'fake-api-key'
    }));

    localStorage.setItem('myduo_firebase_user', JSON.stringify({
      id: testUid,
      idToken: mockJwt,
      expiresAt: Date.now() + 3600000
    }));

    const {
      saveUserNotesFirestore,
      loadUserNotesFirestore,
      saveUserCustomWordsFirestore,
      loadFullUserDataFirestore
    } = await import('../frontend/services/firebase.js');

    const testNotes = { word_alpha: 'Note on alpha', word_beta: 'Note on beta' };
    await saveUserNotesFirestore(testUid, testNotes);

    const loadedNotes = await loadUserNotesFirestore(testUid);
    assert.deepEqual(loadedNotes, testNotes, 'Loaded notes must match saved notes');

    const testWords = [{ id: 'w1', word: 'cat', translation: 'кот' }];
    await saveUserCustomWordsFirestore(testUid, testWords);

    const fullData = await loadFullUserDataFirestore(testUid);
    assert.ok(fullData, 'Full user data should be loaded');
    assert.deepEqual(fullData.notes, testNotes);
    assert.deepEqual(fullData.customWords, testWords);
  });
});

test.after(async () => {
  await testEnv.cleanup();
});
