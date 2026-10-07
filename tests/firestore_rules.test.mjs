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

  // (е) создание alltime с totalXp > 10000 отклоняется, <= 10000 разрешено
  await t.test('(е) Создание alltime с totalXp > 10000 отклоняется, <= 10000 разрешено', async () => {
    const carol = testEnv.authenticatedContext('carol_uid', { email_verified: true });

    // totalXp = 10001 -> rejected
    await assertFails(
      carol.firestore().doc('leaderboard_alltime/carol_uid').set({
        userId: 'carol_uid',
        name: 'Carol',
        totalXp: 10001,
        updatedAt: serverTimestamp()
      })
    );

    // totalXp = 10000 -> allowed
    await assertSucceeds(
      carol.firestore().doc('leaderboard_alltime/carol_uid').set({
        userId: 'carol_uid',
        name: 'Carol',
        totalXp: 10000,
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
        weekKey: currentWeek,
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

  // (к) Сквозной тест REST :commit с increment, REQUEST_TIME и проверкой правил
  await t.test('(к) Сквозной тест REST :commit с increment, REQUEST_TIME и проверкой правил', async () => {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8088';
    const playerA = 'PlayerRestAlpha1234567890';
    const playerB = 'PlayerRestBeta12345678901';

    function setSessionUser(uid) {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({
        user_id: uid,
        sub: uid,
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600
      })).toString('base64url');
      const mockJwt = header + '.' + payload + '.';

      localStorage.setItem('myduo_firebase_config', JSON.stringify({
        projectId: 'demo-rules-test',
        apiKey: 'fake-api-key'
      }));

      localStorage.setItem('myduo_firebase_user', JSON.stringify({
        id: uid,
        idToken: mockJwt,
        expiresAt: Date.now() + 3600000
      }));
    }

    const { commitXpDeltaFirestore } = await import('../frontend/services/firebase.js');

    // 1. Создание нового игрока при дельте > 0 (+100)
    setSessionUser(playerA);
    const resA = await commitXpDeltaFirestore(playerA, currentWeek, 100, 'PlayerA', '');
    assert.equal(resA.success, true, 'Commit with delta > 0 must succeed for new player');

    const snapA_week = await testEnv.unauthenticatedContext().firestore().doc(`leaderboards/${currentWeek}/players/${playerA}`).get();
    assert.equal(snapA_week.exists, true);
    assert.equal(snapA_week.data().xp, 100);
    assert.equal(snapA_week.data().weekKey, currentWeek);

    const snapA_all = await testEnv.unauthenticatedContext().firestore().doc(`leaderboard_alltime/${playerA}`).get();
    assert.equal(snapA_all.exists, true);
    assert.equal(snapA_all.data().totalXp, 100);

    // 2. Создание нового игрока при дельте = 0
    setSessionUser(playerB);
    const resB = await commitXpDeltaFirestore(playerB, currentWeek, 0, 'PlayerB', '');
    assert.equal(resB.success, true, 'Commit with delta = 0 must succeed and initialize documents');

    const snapB_week = await testEnv.unauthenticatedContext().firestore().doc(`leaderboards/${currentWeek}/players/${playerB}`).get();
    assert.equal(snapB_week.exists, true);
    assert.equal(snapB_week.data().xp, 0);

    const snapB_all = await testEnv.unauthenticatedContext().firestore().doc(`leaderboard_alltime/${playerB}`).get();
    assert.equal(snapB_all.exists, true);
    assert.equal(snapB_all.data().totalXp, 0);

    // 3. Дельта < 0:
    // 3a. Для игрока с 0 очков прямая посылка delta < 0 (-5) отклоняется правилом xp >= 0
    const rawNegativeRes = await commitXpDeltaFirestore(playerB, currentWeek, -5, 'PlayerB', '');
    assert.equal(rawNegativeRes.success, false, 'Commit causing xp < 0 must be rejected by rules');

    // 3b. Для игрока с 100 очками (Player A) штраф -5 уменьшает недельный xp до 95, а totalXp не уменьшается
    setSessionUser(playerA);
    const penaltyRes = await commitXpDeltaFirestore(playerA, currentWeek, -5, 'PlayerA', '');
    assert.equal(penaltyRes.success, true, 'Penalty commit for user with enough score must succeed');

    const snapA_penalty_week = await testEnv.unauthenticatedContext().firestore().doc(`leaderboards/${currentWeek}/players/${playerA}`).get();
    assert.equal(snapA_penalty_week.data().xp, 95);

    const snapA_penalty_all = await testEnv.unauthenticatedContext().firestore().doc(`leaderboard_alltime/${playerA}`).get();
    assert.equal(snapA_penalty_all.data().totalXp, 100, 'totalXp must not be decreased by penalty');

    // 4. Обновление в пределах скорости (+10 XP)
    const fairUpdateRes = await commitXpDeltaFirestore(playerA, currentWeek, 10, 'PlayerA', '');
    assert.equal(fairUpdateRes.success, true, 'Fair XP increase within acceptable rate must succeed');

    // 5. Отказ при превышении скорости (+1000 XP мгновенно)
    const cheatUpdateRes = await commitXpDeltaFirestore(playerA, currentWeek, 1000, 'PlayerA', '');
    assert.equal(cheatUpdateRes.success, false, 'Instant excessive XP gain (+1000) must be rejected by rate limit');

    // 6. Отказ при чужом uid
    setSessionUser(playerA);
    const alienRes = await commitXpDeltaFirestore(playerB, currentWeek, 10, 'Alien', '');
    assert.equal(alienRes.success, false, 'Commit targeting foreign uid must be rejected');
  });
});

test.after(async () => {
  await testEnv.cleanup();
});
