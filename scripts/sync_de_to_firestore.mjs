import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GERMAN_WORD_REFINEMENTS } from './apply_de_refinements.mjs';

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

async function run() {
  console.log('🚀 Starting German (de) Vocabulary OTA Synchronization...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  const deUpdates = {};
  for (const [idStr, deVal] of Object.entries(GERMAN_WORD_REFINEMENTS)) {
    const id = parseInt(idStr, 10);
    const wordObj = words.find(w => w.id === id);
    if (wordObj) {
      deUpdates[idStr] = {
        id: id,
        word: wordObj.word,
        de: deVal
      };
    }
  }

  console.log(`1. Total German refined entries ready for OTA: ${Object.keys(deUpdates).length}`);

  // Safety assertions
  const w1641 = words.find(w => w.id === 1641);
  if (w1641?.translations?.de !== 'Laden, einkaufen') {
    throw new Error(`Safety check failed: word 1641 de is "${w1641?.translations?.de}", expected "Laden, einkaufen"!`);
  }

  const w1810 = words.find(w => w.id === 1810);
  if (w1810?.translations?.de !== 'primär, grundlegend') {
    throw new Error(`Safety check failed: word 1810 de is "${w1810?.translations?.de}", expected "primär, grundlegend"!`);
  }

  const w6752 = words.find(w => w.id === 6752);
  if (w6752?.translations?.de !== 'falsch') {
    throw new Error(`Safety check failed: word 6752 de is "${w6752?.translations?.de}", expected "falsch"!`);
  }

  const w6912 = words.find(w => w.id === 6912);
  if (w6912?.translations?.de !== 'wahr, richtig') {
    throw new Error(`Safety check failed: word 6912 de is "${w6912?.translations?.de}", expected "wahr, richtig"!`);
  }

  // 2. Fetch current Firestore shared/vocabulary_updates
  console.log('\n2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  let deMerged = 0;
  for (const [idStr, update] of Object.entries(deUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { de: update.de }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.de = update.de;
    }
    delete fsMap[idStr].updatedAt;
    deMerged++;
  }

  console.log(`   Merged refined German translations for ${deMerged} words into Firestore updates.`);

  // Clean redundant fields to preserve headroom
  for (const entry of Object.values(fsMap)) {
    delete entry.updatedAt;
  }

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

  console.log(`   - ID 1641 (shop): "${verifyMap['1641']?.translations?.de}"`);
  console.log(`   - ID 1664 (tough): "${verifyMap['1664']?.translations?.de}"`);
  console.log(`   - ID 1732 (commit): "${verifyMap['1732']?.translations?.de}"`);
  console.log(`   - ID 1810 (primary): "${verifyMap['1810']?.translations?.de}"`);
  console.log(`   - ID 3556 (piss off): "${verifyMap['3556']?.translations?.de}"`);
  console.log(`   - ID 5064 (when pigs fly): "${verifyMap['5064']?.translations?.de}"`);
  console.log(`   - ID 5411 (spike): "${verifyMap['5411']?.translations?.de}"`);
  console.log(`   - ID 6752 (false): "${verifyMap['6752']?.translations?.de}"`);
  console.log(`   - ID 6912 (TRUE): "${verifyMap['6912']?.translations?.de}"`);

  if (
    verifyMap['1641']?.translations?.de !== 'Laden, einkaufen' ||
    verifyMap['1810']?.translations?.de !== 'primär, grundlegend' ||
    verifyMap['6752']?.translations?.de !== 'falsch' ||
    verifyMap['6912']?.translations?.de !== 'wahr, richtig'
  ) {
    throw new Error('Verification mismatch on read-back!');
  }

  console.log('\n✅ OTA Update for German (de) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
