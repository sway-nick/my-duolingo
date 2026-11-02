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
  console.log('🚀 Starting Kazakh (kk) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: 'туған, ана тілінде сөйлеуші' },
    { id: 1396, word: 'it', expected: 'бұл, ол' },
    { id: 1415, word: 'up', expected: 'жоғары' },
    { id: 1537, word: 'so', expected: 'сондықтан, сондай' },
    { id: 1641, word: 'shop', expected: 'дүкен, сатып алу' },
    { id: 1662, word: 'ago', expected: 'бұрын' },
    { id: 2046, word: 'about', expected: 'туралы, шамамен' },
    { id: 2437, word: 'cookie', expected: 'печенье' },
    { id: 3772, word: 'shoot', expected: 'ату, түсіру' },
    { id: 3784, word: 'am is are', expected: 'болу, бар' },
    { id: 3786, word: 'of', expected: 'туралы, -дан, -ден' },
    { id: 3788, word: 'in', expected: 'ішінде, -да, -де' },
    { id: 3802, word: 'than', expected: 'қарағанда, гөрі' },
    { id: 3809, word: 'speak', expected: 'сөйлеу, айту' },
    { id: 3815, word: 'if', expected: 'егер' },
    { id: 3842, word: 'at', expected: 'жанында, -да, -де' },
    { id: 3859, word: 'the', expected: 'бұл, сол, осы' },
    { id: 3865, word: 'into', expected: 'ішіне, ішіне қарай' },
    { id: 4007, word: 'prom', expected: 'бітіру кеші, балл' },
    { id: 4091, word: 'used to', expected: 'бұрын істейтін, үйренген' },
    { id: 4112, word: 'torch', expected: 'алау, қолшам' },
    { id: 4124, word: 'scared of', expected: 'қорыққан, сескенген' },
    { id: 4160, word: 'sick of', expected: 'жалыққан, мезі болған' },
    { id: 4174, word: 'black dog', expected: 'көңілсіздік, күйзеліс' },
    { id: 4184, word: 'all the same', expected: 'бәрібір, сонда да' },
    { id: 4197, word: "I don't mind", expected: 'қарсы емеспін, бәрібір' },
    { id: 4308, word: "couldn't", expected: 'істей алмады, қолынан келмеді' },
    { id: 4457, word: 'restroom', expected: 'дәретхана' },
    { id: 4787, word: 'indirect', expected: 'жанама, тікелей емес' },
    { id: 5018, word: 'co', expected: 'бірге, қоса' },
    { id: 5021, word: 'gotta', expected: 'керек, тиіс' },
    { id: 5023, word: 'won\'t', expected: 'болмайды, істемейді' },
    { id: 5031, word: 'to take something for granted', expected: 'қадірін білмеу, тиісті деп санау' },
    { id: 5064, word: 'when pigs fly', expected: 'Түйенің құйрығы жерге тигенде, ешқашан' },
    { id: 5202, word: 'perpetrate', expected: 'жасау, қылмыс жасау' },
    { id: 5775, word: 'vouchsafe', expected: 'сыйлау, нәсіп ету, рақым ету' },
    { id: 6012, word: 'acrimony', expected: 'ащылық, қастық, ыза' },
    { id: 6013, word: 'acumen', expected: 'тапқырлық, зеректік' },
    { id: 6037, word: 'arrant', expected: 'нағыз, сорақы' },
    { id: 6496, word: 'mettle', expected: 'қайрат, жігер, батылдық' },
    { id: 6510, word: 'stracism', expected: 'шеттету, қуғындау, остракизм' },
    { id: 6742, word: 'easy come easy go', expected: 'Оңай келген оңай кетер, желмен келген желге кетер' },
    { id: 6743, word: 'no pain no gain', expected: 'Еңбексіз өмір жоқ, бейнет түбі — зейнет' },
    { id: 6752, word: 'false', expected: 'өтірік, жалған' },
    { id: 6912, word: 'TRUE', expected: 'шын, шыншыл' },
    { id: 6932, word: 'utilise', expected: 'пайдалану, кәдеге жарату' },
    { id: 6935, word: 'serve as a lifeline', expected: 'құтқарушы болу, сүйеніш болу' },
    { id: 6940, word: 'stale', expected: 'ескірген' },
    { id: 6941, word: 'starving', expected: 'аш, ашыққан' },
    { id: 7004, word: 'liquid', expected: 'сұйықтық, сұйық' },
    { id: 7022, word: 'quiver', expected: 'қорамсақ' },
    { id: 7039, word: 'stew', expected: 'бұқтыру, бұқтырылған ет' },
    { id: 7048, word: 'trout', expected: 'форель, бахтах' },
    { id: 7049, word: 'wonder', expected: 'таңғалу, ғажап' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Kazakh entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.kk]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const kkUpdates = {};

  for (const w of currentWords) {
    const origKk = headMap.get(w.id);
    if (origKk !== w.translations.kk) {
      kkUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        kk: w.translations.kk
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      kkUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        kk: w.translations.kk
      };
    }
  }

  const updateCount = Object.keys(kkUpdates).length;
  console.log(`   Found ${updateCount} refined Kazakh entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.kk !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.kk}", expected "${check.expected}"`);
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

  let kkMerged = 0;
  for (const [idStr, update] of Object.entries(kkUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { kk: update.kk }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.kk = update.kk;
    }
    delete fsMap[idStr].updatedAt;
    kkMerged++;
  }

  console.log(`   Merged refined Kazakh translations for ${kkMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.kk;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Kazakh (kk) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
