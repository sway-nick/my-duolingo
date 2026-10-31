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

const MANUAL_OVERRIDES_ES = {
  2088: 'palabra',
  4299: 'llamado, convocatoria, llamada',
  4661: 'delito, infracción, ofensa',
  4984: 'relajarse, enfriar, frío',
  5140: 'triunfo, triunfar',
  5531: 'alegar, afirmar, sostener',
  5808: 'fulminar, despotricar'
};

const WORD_2088_FIXES = {
  de: 'Wort',
  es: 'palabra',
  fr: 'mot',
  pl: 'słowo',
  id: 'kata',
  vi: 'từ',
  bn: 'শব্দ',
  fa: 'کلمه',
  zh: '单词',
  ur: 'لفظ'
};

function cleanSpanish(id, word, originalEs) {
  if (MANUAL_OVERRIDES_ES[id]) {
    return MANUAL_OVERRIDES_ES[id];
  }
  if (!originalEs) return originalEs;

  let cleaned = originalEs.trim();

  // Remove meta-notes
  cleaned = cleaned.replace(/\s*\((según(\s+el)?\s+contexto|call off no corresponde)\)/gi, '');

  // Remove trailing period from non-abbreviation entries
  if (/\.\s*$/.test(cleaned) && !/\b(etc|ej)\.$/i.test(cleaned)) {
    cleaned = cleaned.replace(/\.\s*$/, '');
  }

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
  console.log('🚀 Starting Spanish (es) Vocabulary OTA Synchronization...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  let modifiedCount = 0;
  const esUpdates = {};

  for (const w of words) {
    const origEs = w.translations?.es || '';
    const newEs = cleanSpanish(w.id, w.word, origEs);
    if (origEs !== newEs) {
      modifiedCount++;
      w.translations = w.translations || {};
      w.translations.es = newEs;
      esUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        es: newEs
      };
    }

    // Fix word 2088 ("word") across all affected languages
    if (w.id === 2088) {
      for (const [lang, val] of Object.entries(WORD_2088_FIXES)) {
        w.translations[lang] = val;
      }
    }
  }

  console.log(`1. Total Spanish words refined: ${modifiedCount}`);
  console.log('   Applied global multi-language fix for word 2088 ("word").');

  // Safety checks
  const jsonStr = JSON.stringify(words);
  if (jsonStr.includes('\ufffd')) {
    throw new Error('❌ Detected U+FFFD replacement characters in words.json!');
  }

  const w2088 = words.find(w => w.id === 2088);
  if (w2088.translations?.es !== 'palabra') {
    throw new Error(`Safety check failed: word 2088 es is "${w2088.translations?.es}", expected "palabra"!`);
  }

  const w5531 = words.find(w => w.id === 5531);
  if (!w5531.translations?.es?.includes('alegar')) {
    throw new Error(`Safety check failed: word 5531 es is "${w5531.translations?.es}", expected to include "alegar"!`);
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

  let esMerged = 0;
  for (const [id, update] of Object.entries(esUpdates)) {
    if (!fsMap[id]) {
      fsMap[id] = {
        id: update.id,
        word: update.word,
        translations: { es: update.es }
      };
    } else {
      if (!fsMap[id].translations) fsMap[id].translations = {};
      fsMap[id].translations.es = update.es;
    }
    delete fsMap[id].updatedAt;
    esMerged++;
  }

  // Also merge word 2088 fixes into Firestore map
  if (!fsMap['2088']) {
    fsMap['2088'] = { id: 2088, word: 'word', translation: 'слово', translations: {} };
  }
  for (const [lang, val] of Object.entries(WORD_2088_FIXES)) {
    fsMap['2088'].translations[lang] = val;
  }

  console.log(`   Merged refined Spanish translations for ${esMerged} words into Firestore updates.`);

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
    const errText = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status} - ${errText}`);
  }
  console.log('   ✅ Firestore document updated successfully (OTA published)!');

  // 6. Verify Firestore document
  console.log('\n6. Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  console.log(`   Verified ID 2088 ("word"): es="${verifyMap['2088']?.translations?.es}", de="${verifyMap['2088']?.translations?.de}"`);
  console.log(`   Verified ID 5531 ("allege"): es="${verifyMap['5531']?.translations?.es}"`);
  console.log(`   Verified ID 4005 ("on"): es="${verifyMap['4005']?.translations?.es}"`);
  console.log(`   Verified ID 4299 ("call of"): es="${verifyMap['4299']?.translations?.es}"`);
  console.log(`   Verified ID 4661 ("offence"): es="${verifyMap['4661']?.translations?.es}"`);
  console.log(`   Verified ID 5140 ("trump"): es="${verifyMap['5140']?.translations?.es}"`);

  console.log('\n🎉 SPANISH OTA LOCALIZATION REFINEMENT APPLIED AND PUBLISHED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during sync:', err);
  process.exit(1);
});
