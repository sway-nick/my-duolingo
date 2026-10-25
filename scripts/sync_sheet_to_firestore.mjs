import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary';
const FS_PROJECT_ID = 'english-breakfast-181ba';
const FS_API_KEY = 'AIzaSyD_-Zrs0NEhIerHyg3S6jlNsXVt5RevABc';
const FS_ADMIN_EMAIL = 'sheet-sync-admin@english-breakfast.app';
const FS_ADMIN_PASS = 'SyncPassword2026!Sec';
const FS_DOC_PATH = 'shared/vocabulary_updates';

const WORDS_JSON_FILES = [
  path.join(ROOT_DIR, 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'docs', 'assets', 'data', 'words.json')
];

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (inQuotes) {
      if (char === '"' && nextChar === '"') { currentField += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else currentField += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { currentRow.push(currentField.trim()); currentField = ''; }
      else if (char === '\r') {}
      else if (char === '\n') { currentRow.push(currentField.trim()); rows.push(currentRow); currentRow = []; currentField = ''; }
      else currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
  return rows;
}

function cleanEmptyKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v === null || v === undefined) {
      delete obj[k];
    } else if (typeof v === 'object') {
      cleanEmptyKeys(v);
      if (Object.keys(v).length === 0) delete obj[k];
    }
  }
  return obj;
}

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
  console.log('🚀 Starting Google Sheet -> Firebase Firestore Sync...');

  console.log('1. Fetching current Firestore updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`Failed to fetch Firestore document: HTTP ${fsRes.status}`);
  const fsData = await fsRes.json();
  const currentFsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Found ${Object.keys(currentFsMap).length} existing entries in Firestore.`);

  console.log('2. Fetching Google Sheet vocabulary CSV...');
  const sheetRes = await fetch(SHEET_URL);
  if (!sheetRes.ok) throw new Error(`Failed to download sheet CSV: HTTP ${sheetRes.status}`);
  const csvText = await sheetRes.text();
  const rows = parseCSV(csvText);
  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  console.log(`   Downloaded ${rows.length - 1} rows from Sheet.`);

  const idCol = headers.indexOf('id');
  const wordCol = headers.indexOf('word');
  const ukCol = headers.indexOf('translation_uk');
  const ptCol = headers.indexOf('translation_pt');
  const hiCol = headers.indexOf('translation_hi');

  // Load local words.json
  const localWords = JSON.parse(fs.readFileSync(WORDS_JSON_FILES[0], 'utf8'));
  const localMap = new Map();
  localWords.forEach(w => localMap.set(String(w.id), w));

  const finalMap = {};
  for (const [id, item] of Object.entries(currentFsMap)) {
    finalMap[id] = cleanEmptyKeys({ ...item });
  }

  let ukUpdated = 0;
  let ptUpdated = 0;
  let hiUpdated = 0;
  let wordsUpdatedCount = 0;

  const stalePtReg = /^(veado|usar roupas|jantar|espiga|único|couro|mundo|chão|trancar)$/i;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const id = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const word = wordCol >= 0 ? String(row[wordCol] || '').trim() : '';
    if (!word) continue;

    const localWord = localMap.get(id);
    const fsWord = finalMap[id];

    let sheetUk = ukCol >= 0 ? String(row[ukCol] || '').trim() : '';
    let sheetPt = ptCol >= 0 ? String(row[ptCol] || '').trim() : '';
    let sheetHi = hiCol >= 0 ? String(row[hiCol] || '').trim() : '';

    // Safety guard against offensive or incorrect Brazilian Portuguese regressions
    if (stalePtReg.test(sheetPt) && localWord?.translations?.pt && !stalePtReg.test(localWord.translations.pt)) {
      sheetPt = localWord.translations.pt;
    }

    const refUk = fsWord?.translations?.uk ?? localWord?.translations?.uk ?? '';
    const refPt = fsWord?.translations?.pt ?? localWord?.translations?.pt ?? '';
    const refHi = fsWord?.translations?.hi ?? localWord?.translations?.hi ?? '';

    const changedUk = sheetUk && sheetUk !== refUk;
    const changedPt = sheetPt && sheetPt !== refPt;
    const changedHi = sheetHi && sheetHi !== refHi;

    if (changedUk || changedPt || changedHi) {
      wordsUpdatedCount++;
      if (changedUk) ukUpdated++;
      if (changedPt) ptUpdated++;
      if (changedHi) hiUpdated++;

      if (fsWord) {
        fsWord.translations = fsWord.translations || {};
        if (sheetUk) fsWord.translations.uk = sheetUk;
        if (sheetPt) fsWord.translations.pt = sheetPt;
        if (sheetHi) fsWord.translations.hi = sheetHi;
        cleanEmptyKeys(fsWord);
      } else {
        const delta = {
          id: localWord ? localWord.id : (id || word),
          word: localWord ? localWord.word : word,
          translations: {}
        };
        if (sheetUk) delta.translations.uk = sheetUk;
        if (sheetPt) delta.translations.pt = sheetPt;
        if (sheetHi) delta.translations.hi = sheetHi;
        finalMap[String(id || word)] = delta;
      }

      // Also update local word object for words.json
      if (localWord) {
        localWord.translations = localWord.translations || {};
        if (sheetUk) localWord.translations.uk = sheetUk;
        if (sheetPt) localWord.translations.pt = sheetPt;
        if (sheetHi) localWord.translations.hi = sheetHi;
      }
    }
  }

  console.log(`\n📊 Summary of changes:`);
  console.log(`   - Words updated: ${wordsUpdatedCount}`);
  console.log(`   - Ukrainian (uk) translations updated: ${ukUpdated}`);
  console.log(`   - Portuguese (pt) translations updated: ${ptUpdated}`);
  console.log(`   - Hindi (hi) translations updated: ${hiUpdated}`);
  console.log(`   - Total items in Firestore updates payload: ${Object.keys(finalMap).length}`);

  const jsonPayload = JSON.stringify(finalMap);
  const payloadBytes = Buffer.byteLength(jsonPayload, 'utf8');
  console.log(`   - Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);

  if (payloadBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB limit (${payloadBytes} bytes)! Aborting Firestore write.`);
  }

  console.log('\n3. Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();
  console.log('   Authenticated successfully.');

  console.log('4. Writing updates to Firestore shared/vocabulary_updates...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: jsonPayload },
      updatedAt: { integerValue: String(Date.now()) },
      totalCount: { integerValue: String(Object.keys(finalMap).length) },
    },
  });

  const patchRes = await fetch(fsUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: patchPayload,
  });

  if (!patchRes.ok) {
    const patchErr = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status} - ${patchErr}`);
  }

  console.log('✅ FIRESTORE UPDATE SUCCESSFUL!');

  console.log('\n5. Saving updated local words.json files...');
  const minifiedWordsJson = JSON.stringify(localWords);
  WORDS_JSON_FILES.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, minifiedWordsJson, 'utf8');
      console.log(`   Saved ${filePath}`);
    }
  });

  console.log('\n✨ All updates synchronized to Firebase and local repository!');
}

run().catch(err => {
  console.error('❌ Error during sync:', err);
  process.exit(1);
});
