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
  console.log('🚀 Starting Korean (ko) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: '원주민의, 모국어 화자' },
    { id: 1641, word: 'shop', expected: '가게, 상점' },
    { id: 3772, word: 'shoot', expected: '쏘다, 촬영하다' },
    { id: 3784, word: 'am is are', expected: '~이다, 있다' },
    { id: 3802, word: 'than', expected: '~보다' },
    { id: 3815, word: 'if', expected: '만약, ~라면' },
    { id: 3859, word: 'the', expected: '그, 저' },
    { id: 4007, word: 'prom', expected: '프롬, 졸업 무도회' },
    { id: 4091, word: 'used to', expected: '~하곤 했다, 예전의' },
    { id: 4112, word: 'torch', expected: '횃불, 손전등' },
    { id: 4124, word: 'scared of', expected: '~을 두려워하는, 무서워하는' },
    { id: 4160, word: 'sick of', expected: '~에 진절머리 난, 질린' },
    { id: 4174, word: 'black dog', expected: '우울증, 우울' },
    { id: 4197, word: "I don't mind", expected: '상관없어요, 괜찮아요' },
    { id: 4457, word: 'restroom', expected: '화장실' },
    { id: 4787, word: 'indirect', expected: '간접적인, 우회적인' },
    { id: 5064, word: 'when pigs fly', expected: '해가 서쪽에서 뜰 일, 불가능한 일' },
    { id: 5775, word: 'vouchsafe', expected: '하사하다, 베풀다' },
    { id: 6012, word: 'acrimony', expected: '신랄함, 악감정' },
    { id: 6013, word: 'acumen', expected: '통찰력, 안목' },
    { id: 6037, word: 'arrant', expected: '순전한, 악명 높은' },
    { id: 6496, word: 'mettle', expected: '패기, 용기' },
    { id: 6510, word: 'stracism', expected: '배척, 추방, 따돌림' },
    { id: 6743, word: 'no pain no gain', expected: '고통 없이는 얻는 것도 없다, 고진감래' },
    { id: 6932, word: 'utilise', expected: '활용하다, 이용하다' },
    { id: 6940, word: 'stale', expected: '신선하지 않은, 바랜' },
    { id: 6941, word: 'starving', expected: '배고파 죽을 지경인, 굶주린' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Korean entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.ko]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const koUpdates = {};

  for (const w of currentWords) {
    const origKo = headMap.get(w.id);
    if (origKo !== w.translations.ko) {
      koUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ko: w.translations.ko
      };
    }
  }

  // Ensure key sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      koUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ko: w.translations.ko
      };
    }
  }

  const updateCount = Object.keys(koUpdates).length;
  console.log(`   Found ${updateCount} refined Korean entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.ko !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.ko}", expected "${check.expected}"`);
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

  let koMerged = 0;
  for (const [idStr, update] of Object.entries(koUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { ko: update.ko }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.ko = update.ko;
    }
    delete fsMap[idStr].updatedAt;
    koMerged++;
  }

  console.log(`   Merged refined Korean translations for ${koMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.ko;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Korean (ko) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
