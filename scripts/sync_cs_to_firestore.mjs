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

const MANUAL_OVERRIDES_CS = {
  1398: 'kde, kam',
  1505: 'libra, bušit',
  1641: 'obchod, nakupovat',
  3949: 'no a co, a co jako',
  4005: 'na, o, zapnuto',
  4124: 'bát se, mít strach z',
  4292: 's tím naprosto souhlasím',
  4311: 'bude muset',
  4324: 'docela dobré',
  4456: 'šířka',
  4787: 'nepřímý, oklikou',
  4863: 'zamýšlený, určený',
  4903: 'promiňte, omlouvám se, líto',
  5045: 'tady to máte, prosím',
  5531: 'tvrdit, prohlašovat, údajně tvrdit',
  6766: 'zapomněl jsem na to'
};

function cleanCzech(id, word, originalCs) {
  if (MANUAL_OVERRIDES_CS[id]) {
    return MANUAL_OVERRIDES_CS[id];
  }
  if (!originalCs) return originalCs;

  let cleaned = String(originalCs).trim();

  // Remove trailing period from non-abbreviation entries
  if (/\.\s*$/.test(cleaned) && !/\b(apod|atd|tzv|např)\.$/i.test(cleaned)) {
    cleaned = cleaned.replace(/\.\s*$/, '');
  }

  // Remove trailing commas/semicolons
  cleaned = cleaned.replace(/[,;]\s*$/, '');

  // Standardize semicolons to commas
  cleaned = cleaned.replace(/;/g, ',');

  // Split by commas, clean and deduplicate parts
  const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const uniqueParts = [];

  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(', ');
}

async function run() {
  console.log('🚀 Starting Czech (cs) Vocabulary OTA Synchronization...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  let modifiedCount = 0;
  const csUpdates = {};

  for (const w of words) {
    const origCs = w.translations?.cs || '';
    const newCs = cleanCzech(w.id, w.word, origCs);
    if (origCs !== newCs) {
      modifiedCount++;
      w.translations = w.translations || {};
      w.translations.cs = newCs;
      csUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        cs: newCs
      };
    }
  }

  console.log(`1. Total Czech words refined: ${modifiedCount}`);

  // Safety checks
  const jsonStr = JSON.stringify(words);
  if (jsonStr.includes('\ufffd')) {
    throw new Error('❌ Detected U+FFFD replacement characters in words.json!');
  }

  const w4787 = words.find(w => w.id === 4787);
  if (w4787.translations?.cs?.includes('Internet')) {
    throw new Error(`Safety check failed: word 4787 cs contains "Internet"!`);
  }

  const w5531 = words.find(w => w.id === 5531);
  if (w5531.translations?.cs === 'schválit') {
    throw new Error(`Safety check failed: word 5531 cs is "schválit"!`);
  }

  // 2. Save to all words.json paths
  WORDS_JSON_FILES.forEach(filePath => {
    fs.writeFileSync(filePath, jsonStr, 'utf8');
    console.log(`   Saved ${filePath}`);
  });

  // 3. Fetch current Firestore shared/vocabulary_updates
  console.log('\n2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  let csMerged = 0;
  for (const [id, update] of Object.entries(csUpdates)) {
    if (!fsMap[id]) {
      fsMap[id] = {
        id: update.id,
        word: update.word,
        translations: { cs: update.cs }
      };
    } else {
      if (!fsMap[id].translations) fsMap[id].translations = {};
      fsMap[id].translations.cs = update.cs;
    }
    delete fsMap[id].updatedAt;
    csMerged++;
  }

  console.log(`   Merged refined Czech translations for ${csMerged} words into Firestore updates.`);

  // Clean redundant fields
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
    const errText = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status} - ${errText}`);
  }
  console.log('   ✅ Firestore document updated successfully (OTA published)!');

  // 6. Verify Firestore document
  console.log('\n6. Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  console.log(`   Verified ID 4787 ("indirect"): cs="${verifyMap['4787']?.translations?.cs}"`);
  console.log(`   Verified ID 5531 ("allege"): cs="${verifyMap['5531']?.translations?.cs}"`);
  console.log(`   Verified ID 1641 ("shop"): cs="${verifyMap['1641']?.translations?.cs}"`);
  console.log(`   Verified ID 4124 ("scared of"): cs="${verifyMap['4124']?.translations?.cs}"`);
  console.log(`   Verified ID 4005 ("on"): cs="${verifyMap['4005']?.translations?.cs}"`);
  console.log(`   Verified ID 37 ("train"): cs="${verifyMap['37']?.translations?.cs}"`);

  console.log('\n🎉 CZECH OTA LOCALIZATION REFINEMENT APPLIED AND PUBLISHED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during sync:', err);
  process.exit(1);
});
