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
  100: 'exercițiu',
  1505: 'livră, liră',
  3745: 'dacă, fie... fie...',
  4311: 'va trebui să',
  4324: 'destul de bine',
  4456: 'lățime',
  4787: 'indirect, oblic',
  5045: 'poftim',
  5531: 'a pretinde, a susține',
  5808: 'a fulmina'
};

function normalizeDiacritics(str) {
  return str
    .replace(/\u015f/g, '\u0219') // ş -> ș
    .replace(/\u0163/g, '\u021b') // ţ -> ț
    .replace(/\u015e/g, '\u0218') // Ş -> Ș
    .replace(/\u0162/g, '\u021a'); // Ţ -> Ț
}

function cleanRomanian(id, word, originalRo) {
  if (MANUAL_OVERRIDES[id]) {
    return MANUAL_OVERRIDES[id];
  }
  if (!originalRo) return originalRo;

  let cleaned = normalizeDiacritics(originalRo).trim();
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
  console.log('🚀 Starting Romanian (ro) Vocabulary OTA Synchronization...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  let modifiedCount = 0;
  const roUpdates = {};

  for (const w of words) {
    const origRo = w.translations?.ro || '';
    const newRo = cleanRomanian(w.id, w.word, origRo);
    if (origRo !== newRo) {
      modifiedCount++;
      w.translations = w.translations || {};
      w.translations.ro = newRo;
      roUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ro: newRo
      };
    }
  }

  console.log(`1. Total Romanian words modified: ${modifiedCount}`);

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

  let roMerged = 0;
  for (const [id, update] of Object.entries(roUpdates)) {
    if (!fsMap[id]) {
      fsMap[id] = {
        id: update.id,
        word: update.word,
        translations: { ro: update.ro }
      };
    } else {
      if (!fsMap[id].translations) fsMap[id].translations = {};
      fsMap[id].translations.ro = update.ro;
    }
    roMerged++;
  }

  console.log(`   Merged Romanian translations for ${roMerged} words into Firestore updates.`);

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

  console.log(`   Verified ID 6 ("difference"): ro="${verifyMap['6']?.translations?.ro}"`);
  console.log(`   Verified ID 37 ("train"): ro="${verifyMap['37']?.translations?.ro}"`);
  console.log(`   Verified ID 100 ("exercise"): ro="${verifyMap['100']?.translations?.ro}"`);
  console.log(`   Verified ID 4787 ("indirect"): ro="${verifyMap['4787']?.translations?.ro}"`);

  console.log('\n🎉 ROMANIAN OTA LOCALIZATION FIX APPLIED AND PUBLISHED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during sync:', err);
  process.exit(1);
});
