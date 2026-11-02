import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const WORDS_JSON_PATH = path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json');

const FS_PROJECT_ID = 'english-breakfast-181ba';
const FS_API_KEY = 'AIzaSyD_-Zrs0NEhIerHyg3S6jlNsXVt5RevABc';
const FS_ADMIN_EMAIL = 'sheet-sync-admin@english-breakfast.app';
const FS_ADMIN_PASS = 'SyncPassword2026!Sec';
const FS_DOC_PATH = 'shared/vocabulary_updates';

async function getFirebaseAuthToken() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FS_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: FS_ADMIN_EMAIL,
      password: FS_ADMIN_PASS,
      returnSecureToken: true
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firebase Auth error: ${errText}`);
  }
  const data = await res.json();
  return data.idToken;
}

async function run() {
  console.log('🚀 Starting Portuguese (pt) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 702, word: 'working', expected: 'ativo, em funcionamento' },
    { id: 1810, word: 'primary', expected: 'primário, principal' },
    { id: 3753, word: 'thousand', expected: 'mil' },
    { id: 3765, word: 'Monday', expected: 'segunda-feira' },
    { id: 3777, word: 'April', expected: 'abril' },
    { id: 3801, word: 'what', expected: 'o que, que, qual' },
    { id: 3807, word: 'three', expected: 'três' },
    { id: 3813, word: 'us', expected: 'nos, nós, conosco' },
    { id: 3815, word: 'if', expected: 'se' },
    { id: 3826, word: 'and', expected: 'e' },
    { id: 3844, word: 'two', expected: 'dois, duas' },
    { id: 3852, word: 'okay', expected: 'certo, tudo bem, ok' },
    { id: 6510, word: 'stracism', expected: 'ostracismo, exclusão' },
    { id: 6752, word: 'false', expected: 'falso' },
    { id: 6912, word: 'TRUE', expected: 'verdadeiro, verídico' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Portuguese entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.pt]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const ptUpdates = {};

  for (const w of currentWords) {
    const origPt = headMap.get(w.id);
    if (origPt !== w.translations.pt) {
      ptUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        pt: w.translations.pt
      };
    }
  }

  // Ensure key sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      ptUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        pt: w.translations.pt
      };
    }
  }

  const updateCount = Object.keys(ptUpdates).length;
  console.log(`   Found ${updateCount} refined Portuguese entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.pt !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.pt}", expected "${check.expected}"`);
    }
  }
  console.log('   All safety checks passed.');

  // 2. Fetch current Firestore shared/vocabulary_updates
  console.log('\n2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  let ptMerged = 0;
  for (const [idStr, update] of Object.entries(ptUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { pt: update.pt }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.pt = update.pt;
    }
    delete fsMap[idStr].updatedAt;
    ptMerged++;
  }

  console.log(`   Merged refined Portuguese translations for ${ptMerged} words into Firestore updates.`);

  // Clean redundant fields
  for (const entry of Object.values(fsMap)) {
    delete entry.updatedAt;
  }

  const updatedPayloadStr = JSON.stringify(fsMap);
  const payloadBytes = Buffer.byteLength(updatedPayloadStr, 'utf8');
  console.log('\n3. Firestore payload summary:');
  console.log(`   - Total entries in Firestore: ${Object.keys(fsMap).length}`);
  console.log(`   - Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);
  console.log(`   - Headroom remaining: ${(1024 - payloadBytes / 1024).toFixed(1)} KB`);

  if (payloadBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${payloadBytes} bytes)! Aborting write.`);
  }

  // 4. Authenticate with Firebase Admin
  console.log('\n4. Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();
  console.log('   Authenticated successfully.');

  // 5. Patch Firestore
  console.log('5. Writing updates to Firestore shared/vocabulary_updates (OTA)...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: updatedPayloadStr },
      updatedAt: { integerValue: String(Date.now()) },
      totalCount: { integerValue: String(Object.keys(fsMap).length) }
    }
  });

  const patchRes = await fetch(fsUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: patchPayload
  });

  if (!patchRes.ok) {
    const patchErr = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status}: ${patchErr}`);
  }

  const patchData = await patchRes.json();
  console.log('   Successfully patched shared/vocabulary_updates in Cloud Firestore!');
  console.log(`   Doc update time: ${patchData.updateTime}`);

  // 6. Verification read-back
  console.log('\n6. Verifying read-back from Firestore...');
  const verifyRes = await fetch(fsUrl);
  if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status} verifying Firestore readback`);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  for (const check of sampleChecks) {
    const readVal = verifyMap[String(check.id)]?.translations?.pt;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Portuguese (pt) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
