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

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary';
const FS_PROJECT_ID = 'english-breakfast-181ba';
const FS_API_KEY = 'AIzaSyD_-Zrs0NEhIerHyg3S6jlNsXVt5RevABc';
const FS_ADMIN_EMAIL = 'sheet-sync-admin@english-breakfast.app';
const FS_ADMIN_PASS = 'SyncPassword2026!Sec';
const FS_DOC_PATH = 'shared/vocabulary_updates';

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
  console.log('🚀 Starting Turkish (tr) Localization Sync to Firestore and words.json...\n');

  // 1. Fetch Google Sheet data
  console.log('1. Fetching Vocabulary from Google Sheet...');
  const sheetRes = await fetch(SHEET_URL);
  if (!sheetRes.ok) throw new Error(`Failed to download sheet CSV: HTTP ${sheetRes.status}`);
  const csvText = await sheetRes.text();
  const rows = parseCSV(csvText);
  if (rows.length < 2) throw new Error('Sheet returned no rows');

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  const idCol = headers.indexOf('id');
  const wordCol = headers.indexOf('word');
  const trCol = headers.indexOf('translation_tr');
  const notesTrCol = headers.indexOf('notes_tr');

  if (trCol < 0) throw new Error('Column "translation_tr" not found in Google Sheet!');
  console.log(`   Headers index: id=${idCol}, word=${wordCol}, translation_tr=${trCol}, notes_tr=${notesTrCol}`);
  console.log(`   Total sheet rows: ${rows.length - 1}`);

  const sheetByIdAndWord = new Map();
  const sheetByWord = new Map();
  const sheetById = new Map();

  let trFilledCount = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const id = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const word = wordCol >= 0 ? String(row[wordCol] || '').trim() : '';
    const tr = String(row[trCol] || '').trim();
    const notesTr = notesTrCol >= 0 ? String(row[notesTrCol] || '').trim() : '';

    if (tr) trFilledCount++;
    const item = { id, word, tr, notesTr };
    if (id && word) sheetByIdAndWord.set(`${id}:${word.toLowerCase()}`, item);
    if (word) sheetByWord.set(word.toLowerCase(), item);
    if (id) sheetById.set(id, item);
  }
  console.log(`   Total non-empty Turkish translations in sheet: ${trFilledCount}`);

  // 2. Load and verify local words.json
  console.log('\n2. Updating Turkish in local words.json files...');
  const localWords = JSON.parse(fs.readFileSync(WORDS_JSON_FILES[0], 'utf8'));

  // Snapshot before update by array index to guarantee 100% identity of all other languages
  const beforeSnapshots = localWords.map(w => ({
    id: w.id,
    word: w.word,
    translation: w.translation,
    otherTranslations: Object.fromEntries(
      Object.entries(w.translations || {}).filter(([k]) => k !== 'tr')
    )
  }));

  let wordsTrUpdated = 0;
  for (let i = 0; i < localWords.length; i++) {
    const w = localWords[i];
    const id = String(w.id || '').trim();
    const wordKey = String(w.word || '').toLowerCase().trim();

    const sheetItem = (id && wordKey ? sheetByIdAndWord.get(`${id}:${wordKey}`) : null)
      || sheetByWord.get(wordKey)
      || (id ? sheetById.get(id) : null);

    if (sheetItem && sheetItem.tr) {
      w.translations = w.translations || {};
      if (w.translations.tr !== sheetItem.tr) {
        w.translations.tr = sheetItem.tr;
        wordsTrUpdated++;
      }
      if (sheetItem.notesTr) {
        w.all_notes = w.all_notes || {};
        w.all_notes.tr = sheetItem.notesTr;
      }
    }
  }

  console.log(`   Updated Turkish translations in words.json: ${wordsTrUpdated} entries.`);

  // Verify other languages in words.json are strictly unchanged
  for (let i = 0; i < localWords.length; i++) {
    const w = localWords[i];
    const before = beforeSnapshots[i];

    if (before.word !== w.word) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: Word changed at index ${i} (${before.word} -> ${w.word})!`);
    }
    if (before.translation !== w.translation) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: Root translation changed for word ${w.word}!`);
    }

    const currentOther = Object.fromEntries(
      Object.entries(w.translations || {}).filter(([k]) => k !== 'tr')
    );
    if (JSON.stringify(before.otherTranslations) !== JSON.stringify(currentOther)) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: Non-Turkish translations changed for word ${w.word}!`);
    }
  }
  console.log('   ✅ STRICT INTEGRITY VERIFIED: 100% of other languages in words.json are untouched.');

  // Save to words.json files
  const minifiedWords = JSON.stringify(localWords);
  if (minifiedWords.includes('\ufffd')) {
    throw new Error('Detected U+FFFD in words.json payload!');
  }
  WORDS_JSON_FILES.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, minifiedWords, 'utf8');
      console.log(`   Saved ${filePath}`);
    }
  });

  // 3. Fetch Firestore updates
  console.log('\n3. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  const initialCount = Object.keys(fsMap).length;
  console.log(`   Current entries in Firestore: ${initialCount}`);

  // Snapshot before update of Firestore entries
  const beforeFsSnapshot = new Map();
  for (const [id, entry] of Object.entries(fsMap)) {
    const otherTranslations = Object.fromEntries(
      Object.entries(entry.translations || {}).filter(([k]) => k !== 'tr')
    );
    beforeFsSnapshot.set(id, {
      word: entry.word,
      translation: entry.translation,
      otherTranslations
    });
  }

  // Update Turkish in Firestore entries
  let fsUpdatedCount = 0;
  for (const [id, entry] of Object.entries(fsMap)) {
    const entryId = String(entry.id || id).trim();
    const entryWord = String(entry.word || '').toLowerCase().trim();

    const sheetItem = (entryId && entryWord ? sheetByIdAndWord.get(`${entryId}:${entryWord}`) : null)
      || sheetByWord.get(entryWord)
      || (entryId ? sheetById.get(entryId) : null);

    if (sheetItem && sheetItem.tr) {
      entry.translations = entry.translations || {};
      if (entry.translations.tr !== sheetItem.tr) {
        entry.translations.tr = sheetItem.tr;
        fsUpdatedCount++;
      }
    }
    delete entry.updatedAt;
  }

  console.log(`   Updated Turkish translations in Firestore map: ${fsUpdatedCount} entries.`);

  // Strict verification of Firestore entries:
  // 1. Entry count must be unchanged
  if (Object.keys(fsMap).length !== initialCount) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Firestore entry count changed from ${initialCount} to ${Object.keys(fsMap).length}!`);
  }

  // 2. Every other language in every entry must be 100% identical
  for (const [id, entry] of Object.entries(fsMap)) {
    const before = beforeFsSnapshot.get(id);
    if (!before) throw new Error(`CRITICAL: ID ${id} not found in before snapshot!`);
    if (before.word !== entry.word) throw new Error(`CRITICAL: Word changed for ID ${id}!`);
    if (before.translation !== entry.translation) throw new Error(`CRITICAL: Root translation changed for ID ${id}!`);

    const currentOther = Object.fromEntries(
      Object.entries(entry.translations || {}).filter(([k]) => k !== 'tr')
    );
    if (JSON.stringify(before.otherTranslations) !== JSON.stringify(currentOther)) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: Non-Turkish translation modified in Firestore for ID ${id}!`);
    }
  }
  console.log('   ✅ STRICT INTEGRITY VERIFIED: 100% of non-Turkish translations in Firestore are identical.');

  // Check payload size
  const jsonStr = JSON.stringify(fsMap);
  const payloadBytes = Buffer.byteLength(jsonStr, 'utf8');
  console.log(`   Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);
  if (payloadBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${payloadBytes} bytes)! Aborting write.`);
  }

  // 4. Authenticate with Firebase Admin
  console.log('\n4. Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();
  console.log('   Authenticated successfully.');

  // 5. Patch Firestore
  console.log('5. Writing updates to Firestore shared/vocabulary_updates...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: jsonStr },
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
  console.log('   ✅ FIRESTORE UPDATE SUCCESSFUL!');

  // 6. Verification read-back from Firestore
  console.log('\n6. Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  let trCountInFirestore = 0;
  for (const k in verifyMap) {
    if (verifyMap[k]?.translations?.tr) trCountInFirestore++;
  }
  console.log(`   Verified Firestore entries count: ${Object.keys(verifyMap).length}`);
  console.log(`   Verified Turkish entries count in Firestore: ${trCountInFirestore} / ${Object.keys(verifyMap).length}`);

  console.log('\n🎉 ALL TURKISH UPDATES AND INTEGRITY CHECKS COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during Turkish sync:', err);
  process.exit(1);
});
