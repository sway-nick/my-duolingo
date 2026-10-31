import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const WORDS_JSON_FILES = [
  path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'docs', 'assets', 'data', 'words.json')
];

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

const MANUAL_OVERRIDES = {
  68: 'preferire',
  505: 'rilassarsi',
  1505: 'libbra, sterlina',
  2390: 'evolversi',
  3745: 'se, sia che... sia che...',
  4311: 'dovrà',
  4324: 'piuttosto buono',
  4454: 'muoversi furtivamente',
  4456: 'larghezza',
  4787: 'indiretto',
  5045: 'ecco a te',
  5140: 'briscola',
  5531: 'sostenere, asserire',
  5808: 'fulminare, inveire',
  6759: 'scozzese'
};

function cleanItalian(id, word, originalIt) {
  if (MANUAL_OVERRIDES[id]) {
    return MANUAL_OVERRIDES[id];
  }
  if (!originalIt) return originalIt;

  let cleaned = originalIt.trim();
  cleaned = cleaned.replace(/[,;]+$/, '').trim();

  const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const uniqueParts = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(', ');
}

async function run() {
  console.log('🚀 Starting Italian (it) Vocabulary OTA Synchronization...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  let modifiedCount = 0;
  const itUpdates = {};

  for (const w of words) {
    const origIt = w.translations?.it || '';
    const newIt = cleanItalian(w.id, w.word, origIt);
    if (origIt !== newIt) {
      modifiedCount++;
      w.translations = w.translations || {};
      w.translations.it = newIt;
      itUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        it: newIt
      };
    }
  }

  console.log(`1. Total Italian words modified: ${modifiedCount}`);

  // Safety check: ensure 0 corrupted UTF-8 replacement characters
  const jsonStr = JSON.stringify(words);
  if (jsonStr.includes('\ufffd')) {
    throw new Error('❌ Detected U+FFFD replacement characters in words.json!');
  }

  // 2. Save to all words.json paths
  WORDS_JSON_FILES.forEach(filePath => {
    fs.writeFileSync(filePath, jsonStr, 'utf8');
    console.log(`   Saved ${filePath}`);
  });

  // 3. Update Cloud Firestore shared/vocabulary_updates
  console.log('\n2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  let itMerged = 0;
  for (const [id, update] of Object.entries(itUpdates)) {
    if (!fsMap[id]) {
      fsMap[id] = {
        id: update.id,
        word: update.word,
        translations: { it: update.it }
      };
    } else {
      if (!fsMap[id].translations) fsMap[id].translations = {};
      fsMap[id].translations.it = update.it;
    }
    itMerged++;
  }

  console.log(`   Merged Italian translations for ${itMerged} words into Firestore updates.`);

  const updatedPayloadStr = JSON.stringify(fsMap);
  const payloadBytes = Buffer.byteLength(updatedPayloadStr, 'utf8');
  console.log(`\n3. Firestore payload summary:`);
  console.log(`   - Total entries in Firestore: ${Object.keys(fsMap).length}`);
  console.log(`   - Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);

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
    const errText = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status} - ${errText}`);
  }
  console.log('   ✅ Firestore document updated successfully (OTA published)!');

  // 6. Verify Firestore document
  console.log('\n6. Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  console.log(`   Verified ID 37 ("train"): it="${verifyMap['37']?.translations?.it}"`);
  console.log(`   Verified ID 68 ("prefer"): it="${verifyMap['68']?.translations?.it}"`);
  console.log(`   Verified ID 4787 ("indirect"): it="${verifyMap['4787']?.translations?.it}"`);
  console.log(`   Verified ID 5140 ("trump"): it="${verifyMap['5140']?.translations?.it}"`);

  console.log('\n🎉 ITALIAN OTA LOCALIZATION FIX APPLIED AND PUBLISHED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during sync:', err);
  process.exit(1);
});
