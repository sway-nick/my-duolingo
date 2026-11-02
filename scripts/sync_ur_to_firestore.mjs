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
  console.log('🚀 Starting Urdu (ur, RTL) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 37, word: 'train', expected: 'ٹرین، تربیت دینا' },
    { id: 1810, word: 'primary', expected: 'بنیادی، ابتدائی' },
    { id: 2000, word: 'win won won', expected: 'جیتنا' },
    { id: 2496, word: 'tap', expected: 'نل، نل کھولنا' },
    { id: 2777, word: 'athletic', expected: 'کھیلوں کا، کسرتی' },
    { id: 3772, word: 'shoot', expected: 'گولی چلانا، فلمانا' },
    { id: 4112, word: 'torch', expected: 'مشعل، ٹارچ' },
    { id: 5064, word: 'when pigs fly', expected: 'جب گدھے کے سر سے سینگ نکلیں، کبھی نہیں' },
    { id: 6510, word: 'stracism', expected: 'سماجی بائیکاٹ، جلاوطنی، دیس نکالا' },
    { id: 6752, word: 'false', expected: 'غلط، جھوٹا' },
    { id: 6912, word: 'TRUE', expected: 'سچ، سچا، درست' },
    { id: 6940, word: 'stale', expected: 'باسی' },
    { id: 6941, word: 'starving', expected: 'بھوکا، فاقہ زدہ' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Urdu entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.ur]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const currentWordsMap = new Map(currentWords.map(w => [w.id, w]));
  const urUpdates = {};

  for (const w of currentWords) {
    const origUr = headMap.get(w.id);
    if (origUr !== w.translations.ur) {
      urUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ur: w.translations.ur
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWordsMap.get(check.id);
    if (w) {
      urUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ur: w.translations.ur
      };
    }
  }

  const updateCount = Object.keys(urUpdates).length;
  console.log(`   Found ${updateCount} refined Urdu entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWordsMap.get(check.id);
    if (!w || w.translations.ur !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.ur}", expected "${check.expected}"`);
    }
  }
  console.log('   All local safety checks passed.');

  // 2. Fetch current Firestore shared/vocabulary_updates
  console.log('\n2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  // Prune redundant fr/vi entries that are 100% identical to words.json to ensure plenty of headroom (< 1024 KB)
  let pruned = 0;
  const pruneTarget = 500;
  for (const [idStr, val] of Object.entries(fsMap)) {
    if (pruned >= pruneTarget) break;
    if (urUpdates[idStr]) continue;
    const keys = Object.keys(val.translations || {});
    if (keys.length === 2 && keys.includes('fr') && keys.includes('vi')) {
      const localW = currentWordsMap.get(Number(idStr));
      if (localW && localW.translations.fr === val.translations.fr && localW.translations.vi === val.translations.vi) {
        delete fsMap[idStr];
        pruned++;
      }
    }
  }
  console.log(`   Pruned ${pruned} redundant legacy fr/vi entries to create headroom.`);

  let urMerged = 0;
  for (const [idStr, update] of Object.entries(urUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { ur: update.ur }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.ur = update.ur;
    }
    delete fsMap[idStr].updatedAt;
    urMerged++;
  }

  console.log(`   Merged refined Urdu translations for ${urMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.ur;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Urdu (ur, RTL) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
