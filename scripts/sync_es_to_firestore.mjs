import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  console.log('🚀 Updating translation_es in Firestore shared/vocabulary_updates safely...');

  // 1. Load local words.json
  const words = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const wordsById = new Map();
  const wordsByText = new Map();
  words.forEach(w => {
    wordsById.set(String(w.id), w);
    if (w.word) wordsByText.set(String(w.word).toLowerCase().trim(), w);
  });

  // 2. Fetch current Firestore updates
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status}`);
  const fsData = await fsRes.json();
  const map = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');

  console.log(`Current entries in Firestore: ${Object.keys(map).length}`);

  let updatedEsCount = 0;

  for (const [id, entry] of Object.entries(map)) {
    const match = wordsById.get(String(entry.id || id)) || wordsByText.get(String(entry.word || '').toLowerCase().trim());
    if (match && match.translations && match.translations.es) {
      const newEs = match.translations.es;
      entry.translations = entry.translations || {};
      if (entry.translations.es !== newEs) {
        entry.translations.es = newEs;
        updatedEsCount++;
      }
    }
    // Clean redundant updatedAt to preserve document headroom
    delete entry.updatedAt;
  }

  // Safety checks
  if (!map['6937'] || !map['6937'].translation || map['6937'].translation !== 'термос') {
    throw new Error('Safety check failed: 6937 thermos translation corrupted!');
  }
  if (!map['6938'] || !map['6938'].translation) {
    throw new Error('Safety check failed: 6938 comparative translation corrupted!');
  }

  console.log(`Updated Spanish translations: ${updatedEsCount} entries.`);

  const jsonStr = JSON.stringify(map);
  const payloadBytes = Buffer.byteLength(jsonStr, 'utf8');
  console.log(`Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);

  if (payloadBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${payloadBytes} bytes)! Aborting write.`);
  }

  // 3. Authenticate
  console.log('Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();

  // 4. Patch Firestore
  console.log('Writing updates to Firestore...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: jsonStr },
      updatedAt: { integerValue: String(Date.now()) },
      totalCount: { integerValue: String(Object.keys(map).length) }
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

  console.log('✅ FIRESTORE UPDATE SUCCESSFUL!');
}

run().catch(err => {
  console.error('❌ Error during sync:', err);
  process.exit(1);
});
