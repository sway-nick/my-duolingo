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
  console.log('🚀 Starting Bengali (bn) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: 'স্থানীয়, মাতৃভাষী' },
    { id: 601, word: 'cousin', expected: 'চাচাতো, মামাতো ভাইবোন' },
    { id: 1641, word: 'shop', expected: 'দোকান, কেনাকাটা করা' },
    { id: 2146, word: 'fucking', expected: 'জঘন্য, চরম' },
    { id: 2283, word: 'bitch', expected: 'কুত্তি, দুশ্চরিত্রা' },
    { id: 3772, word: 'shoot', expected: 'গুলি করা, ছবি তোলা' },
    { id: 3784, word: 'am is are', expected: 'হয়, আছেন, আছি' },
    { id: 3802, word: 'than', expected: 'থেকে, চেয়ে' },
    { id: 3815, word: 'if', expected: 'যদি' },
    { id: 3859, word: 'the', expected: 'নির্দিষ্ট, টি, টা' },
    { id: 4007, word: 'prom', expected: 'স্কুলের বিদায়ী অনুষ্ঠান, প্রম' },
    { id: 4091, word: 'used to', expected: 'অতীতে করত, অভ্যস্ত ছিল' },
    { id: 4112, word: 'torch', expected: 'টর্চলাইট, মশাল' },
    { id: 4124, word: 'scared of', expected: 'ভীত, আতঙ্কিত' },
    { id: 4160, word: 'sick of', expected: 'বিরক্ত হয়ে যাওয়া, অতিষ্ঠ' },
    { id: 4174, word: 'black dog', expected: 'বিষণ্ণতা, বিষাদ' },
    { id: 4184, word: 'all the same', expected: 'তবুও, একই কথা' },
    { id: 4197, word: "I don't mind", expected: 'আমার কোনো আপত্তি নেই, ঠিক আছে' },
    { id: 4308, word: "couldn't", expected: 'পারেনি, সক্ষম ছিল না' },
    { id: 4457, word: 'restroom', expected: 'শৌচাগার, বাথরুম' },
    { id: 4787, word: 'indirect', expected: 'পরোক্ষ, অপ্রত্যক্ষ' },
    { id: 5031, word: 'to take something for granted', expected: 'সহজলভ্য মনে করা, গুরুত্ব না দেওয়া' },
    { id: 5064, word: 'when pigs fly', expected: 'কখনোই না, অসম্ভব ব্যাপার' },
    { id: 5775, word: 'vouchsafe', expected: 'অনুগ্রহ করে দেওয়া, সদয় হওয়া' },
    { id: 6012, word: 'acrimony', expected: 'তিক্ততা, খিটখিটে স্বভাব' },
    { id: 6013, word: 'acumen', expected: 'তীক্ষ্ণ বুদ্ধি, বিচক্ষণতা' },
    { id: 6037, word: 'arrant', expected: 'চরম, খাঁটি' },
    { id: 6053, word: 'bacchanalian', expected: 'মাতাল উৎসব, উশৃঙ্খল' },
    { id: 6100, word: 'chauvinist', expected: 'অন্ধ জাতীয়তাবাদী, গোঁড়া' },
    { id: 6109, word: 'clandestine', expected: 'গোপন, গুপ্ত' },
    { id: 6496, word: 'mettle', expected: 'সাহস, মনের জোর' },
    { id: 6510, word: 'stracism', expected: 'সমাজচ্যুতি, নির্বাসন, বয়কট' },
    { id: 6742, word: 'easy come easy go', expected: 'সহজে আসে সহজে যায়' },
    { id: 6743, word: 'no pain no gain', expected: 'কষ্ট না করলে কেষ্ট মেলে না' },
    { id: 6752, word: 'false', expected: 'মিথ্যা, ভুল' },
    { id: 6912, word: 'TRUE', expected: 'সত্য, সঠিক' },
    { id: 6932, word: 'utilise', expected: 'ব্যবহার করা, কাজে লাগানো' },
    { id: 6935, word: 'serve as a lifeline', expected: 'জীবনরক্ষক হওয়া, প্রাণ বাঁচানো' },
    { id: 6940, word: 'stale', expected: 'বাসি' },
    { id: 6941, word: 'starving', expected: 'ক্ষুধার্ত, অনাহারে মৃতপ্রায়' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Bengali entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.bn]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const bnUpdates = {};

  for (const w of currentWords) {
    const origBn = headMap.get(w.id);
    if (origBn !== w.translations.bn) {
      bnUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        bn: w.translations.bn
      };
    }
  }

  // Ensure key sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      bnUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        bn: w.translations.bn
      };
    }
  }

  const updateCount = Object.keys(bnUpdates).length;
  console.log(`   Found ${updateCount} refined Bengali entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.bn !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.bn}", expected "${check.expected}"`);
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

  let bnMerged = 0;
  for (const [idStr, update] of Object.entries(bnUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { bn: update.bn }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.bn = update.bn;
    }
    delete fsMap[idStr].updatedAt;
    bnMerged++;
  }

  console.log(`   Merged refined Bengali translations for ${bnMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.bn;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Bengali (bn) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
