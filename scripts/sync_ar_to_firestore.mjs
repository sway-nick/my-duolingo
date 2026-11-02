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
  console.log('🚀 Starting Arabic (ar) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 11, word: 'competition', expected: 'منافسة، مسابقة' },
    { id: 17, word: 'award', expected: 'جائزة، يمنح جائزة' },
    { id: 37, word: 'train', expected: 'قطار، يتدرب' },
    { id: 44, word: 'native', expected: 'أصلي، ناطق أصلي، محلي' },
    { id: 267, word: 'tear', expected: 'دمعة، يمزق' },
    { id: 578, word: 'boot', expected: 'حذاء، صندوق السيارة' },
    { id: 851, word: 'orange', expected: 'برتقال، برتقالي' },
    { id: 965, word: 'nail', expected: 'ظفر، مسمار' },
    { id: 1620, word: 'play', expected: 'يلعب، مسرحية' },
    { id: 1641, word: 'shop', expected: 'متجر، يتسوق' },
    { id: 1734, word: 'achieve', expected: 'حقق، أنجز' },
    { id: 1923, word: 'dress', expected: 'فستان، يرتدي' },
    { id: 1944, word: 'parent', expected: 'والد، والدة' },
    { id: 2130, word: 'spin spun spun', expected: 'يدور، يلفّ' },
    { id: 3033, word: 'spouse', expected: 'زوج، زوجة' },
    { id: 3175, word: 'limb', expected: 'طرف، غصن' },
    { id: 3772, word: 'shoot', expected: 'يطلق النار، يصور' },
    { id: 3784, word: 'am is are', expected: 'أكون، يكون، نكون' },
    { id: 4112, word: 'torch', expected: 'شعلة، مصباح يدوي' },
    { id: 4151, word: 'care about', expected: 'يهتم بـ، يقلق على' },
    { id: 4160, word: 'sick of', expected: 'ضاق ذرعاً، سئم' },
    { id: 4308, word: "couldn't", expected: 'لم يستطع، عجز عن' },
    { id: 4387, word: 'adverb', expected: 'ظرف، حال' },
    { id: 4457, word: 'restroom', expected: 'حمام، دورة مياه' },
    { id: 4787, word: 'indirect', expected: 'غير مباشر، ملتوٍ' },
    { id: 4903, word: 'sorry', expected: 'آسف، متأسف' },
    { id: 4989, word: 'came out', expected: 'صدر، ظهر' },
    { id: 5023, word: 'won\'t', expected: 'لن، لن يفعل' },
    { id: 5064, word: 'when pigs fly', expected: 'في المشمش، مستحيل' },
    { id: 5775, word: 'vouchsafe', expected: 'تفضل، تكرم، منح' },
    { id: 6012, word: 'acrimony', expected: 'مرارة، حدة، عداوة' },
    { id: 6013, word: 'acumen', expected: 'فطنة، حنكة، بصيرة' },
    { id: 6037, word: 'arrant', expected: 'فاضح، تامّ' },
    { id: 6510, word: 'stracism', expected: 'نبذ، إبعاد، مقاطعة' },
    { id: 6743, word: 'no pain no gain', expected: 'لا نجاح بلا تعب، لا مكسب بلا مشقة' },
    { id: 6932, word: 'utilise', expected: 'يستخدم، يستغلّ' },
    { id: 6940, word: 'stale', expected: 'بائت، قديم' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Arabic entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.ar]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const arUpdates = {};

  for (const w of currentWords) {
    const origAr = headMap.get(w.id);
    if (origAr !== w.translations.ar) {
      arUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ar: w.translations.ar
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      arUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ar: w.translations.ar
      };
    }
  }

  const updateCount = Object.keys(arUpdates).length;
  console.log(`   Found ${updateCount} refined Arabic entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.ar !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.ar}", expected "${check.expected}"`);
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

  let arMerged = 0;
  for (const [idStr, update] of Object.entries(arUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { ar: update.ar }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.ar = update.ar;
    }
    delete fsMap[idStr].updatedAt;
    arMerged++;
  }

  console.log(`   Merged refined Arabic translations for ${arMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.ar;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Arabic (ar) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
