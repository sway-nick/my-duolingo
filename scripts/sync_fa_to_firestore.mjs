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
  console.log('🚀 Starting Persian (fa) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: 'بومی، زبان‌مادری' },
    { id: 337, word: 'appeal', expected: 'درخواست، جذابیت' },
    { id: 582, word: 'favor', expected: 'لطف، طرفداری' },
    { id: 1641, word: 'shop', expected: 'مغازه، خرید کردن' },
    { id: 2146, word: 'fucking', expected: 'لعنتی، خیلی' },
    { id: 2283, word: 'bitch', expected: 'فاحشه، زن بددهن' },
    { id: 3142, word: 'hers', expected: 'مال او' },
    { id: 3738, word: 'herself', expected: 'خودش' },
    { id: 3772, word: 'shoot', expected: 'شلیک کردن، فیلمبرداری کردن' },
    { id: 3784, word: 'am is are', expected: 'بودن، هست' },
    { id: 3795, word: 'she', expected: 'او' },
    { id: 3802, word: 'than', expected: 'از، نسبت به' },
    { id: 3815, word: 'if', expected: 'اگر' },
    { id: 3859, word: 'the', expected: 'آن، این' },
    { id: 3977, word: 'fewer than', expected: 'کمتر از' },
    { id: 4007, word: 'prom', expected: 'جشن فارغ‌التحصیلی، پرام' },
    { id: 4091, word: 'used to', expected: 'قبلاً عادت داشت' },
    { id: 4112, word: 'torch', expected: 'چراغ‌قوه، مشعل' },
    { id: 4124, word: 'scared of', expected: 'ترسیده از' },
    { id: 4160, word: 'sick of', expected: 'بیزار از' },
    { id: 4174, word: 'black dog', expected: 'افسردگی، غم' },
    { id: 4184, word: 'all the same', expected: 'با این حال، فرقی نمی‌کند' },
    { id: 4197, word: "I don't mind", expected: 'برایم فرقی ندارد، مخالفتی ندارم' },
    { id: 4308, word: "couldn't", expected: 'نتوانست' },
    { id: 4457, word: 'restroom', expected: 'دستشویی' },
    { id: 4787, word: 'indirect', expected: 'غیرمستقیم' },
    { id: 5031, word: 'to take something for granted', expected: 'بدیهی دانستن، قدر ندانستن' },
    { id: 5064, word: 'when pigs fly', expected: 'وقت گل نی، هرگز' },
    { id: 5775, word: 'vouchsafe', expected: 'اعطا کردن، ارزانی داشتن' },
    { id: 6012, word: 'acrimony', expected: 'تلخی و کینه، تندخویی' },
    { id: 6013, word: 'acumen', expected: 'تیزبینی، بصیرت' },
    { id: 6037, word: 'arrant', expected: 'تمام‌عیار، مسلم' },
    { id: 6496, word: 'mettle', expected: 'شهامت، شجاعت' },
    { id: 6510, word: 'stracism', expected: 'طرد، اخراج، بایکوت' },
    { id: 6742, word: 'easy come easy go', expected: 'بادآورده را باد می‌برد' },
    { id: 6743, word: 'no pain no gain', expected: 'نابرده رنج گنج میسر نمی‌شود' },
    { id: 6752, word: 'false', expected: 'نادرست، غلط' },
    { id: 6912, word: 'TRUE', expected: 'درست، واقعی' },
    { id: 6932, word: 'utilise', expected: 'استفاده کردن، به کار بردن' },
    { id: 6935, word: 'serve as a lifeline', expected: 'راه نجات بودن، تکیه‌گاه بودن' },
    { id: 6940, word: 'stale', expected: 'بیات، کهنه' },
    { id: 6941, word: 'starving', expected: 'گرسنه، قحطی‌زده' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Persian entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.fa]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const faUpdates = {};

  for (const w of currentWords) {
    const origFa = headMap.get(w.id);
    if (origFa !== w.translations.fa) {
      faUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        fa: w.translations.fa
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      faUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        fa: w.translations.fa
      };
    }
  }

  const updateCount = Object.keys(faUpdates).length;
  console.log(`   Found ${updateCount} refined Persian entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.fa !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.fa}", expected "${check.expected}"`);
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

  let faMerged = 0;
  for (const [idStr, update] of Object.entries(faUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { fa: update.fa }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.fa = update.fa;
    }
    delete fsMap[idStr].updatedAt;
    faMerged++;
  }

  console.log(`   Merged refined Persian translations for ${faMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.fa;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Persian (fa) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
