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
  console.log('🚀 Starting Thai (th) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: 'พื้นเมือง, เจ้าของภาษา' },
    { id: 1396, word: 'it', expected: 'มัน, สิ่งนี้' },
    { id: 1415, word: 'up', expected: 'ขึ้น, ข้างบน' },
    { id: 1537, word: 'so', expected: 'ดังนั้น, มาก' },
    { id: 1641, word: 'shop', expected: 'ร้านค้า, ซื้อของ' },
    { id: 1923, word: 'dress', expected: 'ชุดเดรส, แต่งตัว' },
    { id: 2046, word: 'about', expected: 'เกี่ยวกับ, ประมาณ' },
    { id: 3772, word: 'shoot', expected: 'ยิง, ถ่ายภาพ' },
    { id: 3784, word: 'am is are', expected: 'เป็น, อยู่, คือ' },
    { id: 3786, word: 'of', expected: 'ของ, จาก' },
    { id: 3788, word: 'in', expected: 'ใน, ข้างใน' },
    { id: 3802, word: 'than', expected: 'กว่า, มากกว่า' },
    { id: 3809, word: 'speak', expected: 'พูด, คุย' },
    { id: 3815, word: 'if', expected: 'ถ้า, หาก' },
    { id: 3842, word: 'at', expected: 'ที่, ใน' },
    { id: 3859, word: 'the', expected: 'นี้, นั้น' },
    { id: 3865, word: 'into', expected: 'เข้าไปใน, สู่' },
    { id: 4091, word: 'used to', expected: 'เคย, เคยชิน' },
    { id: 4112, word: 'torch', expected: 'คบเพลิง, ไฟฉาย' },
    { id: 4124, word: 'scared of', expected: 'กลัว, หวาดกลัว' },
    { id: 4160, word: 'sick of', expected: 'เบื่อหน่าย, เอือมระอา' },
    { id: 4174, word: 'black dog', expected: 'ความซึมเศร้า, ความหดหู่' },
    { id: 4184, word: 'all the same', expected: 'อย่างไรก็ตาม, เหมือนกันหมด' },
    { id: 4197, word: "I don't mind", expected: 'ไม่เป็นไร, ไม่ขัดข้อง' },
    { id: 4308, word: "can't", expected: 'ไม่สามารถ, ทำไม่ได้' },
    { id: 4457, word: 'restroom', expected: 'ห้องน้ำ' },
    { id: 4787, word: 'indirect', expected: 'ทางอ้อม, โดยอ้อม' },
    { id: 4989, word: 'came out', expected: 'ออกมา, ปรากฏ' },
    { id: 5018, word: 'co', expected: 'ร่วมกัน, ด้วยกัน' },
    { id: 5031, word: 'to take something for granted', expected: 'มองข้ามความสำคัญ, ทึกทักเอาเอง' },
    { id: 5064, word: 'when pigs fly', expected: 'ไม่มีทางเป็นไปได้, ชาติหน้าตอนบ่ายๆ' },
    { id: 5202, word: 'perpetrate', expected: 'ก่อกรรม, ก่ออาชญากรรม' },
    { id: 5775, word: 'vouchsafe', expected: 'ประทาน, พระราชทาน, มอบให้' },
    { id: 6012, word: 'acrimony', expected: 'ความรุนแรง, ความเจ็บแค้น' },
    { id: 6013, word: 'acumen', expected: 'ความเฉียบแหลม, ไหวพริบ' },
    { id: 6037, word: 'arrant', expected: 'อย่างยิ่ง, โดยสิ้นเชิง' },
    { id: 6142, word: 'crescendo', expected: 'ดังขึ้นเรื่อยๆ, เครเชนโด' },
    { id: 6496, word: 'mettle', expected: 'ความกล้าหาญ, ความทรหด' },
    { id: 6510, word: 'stracism', expected: 'การขับไล่, การคว่ำบาตร, การเนรเทศ' },
    { id: 6743, word: 'no pain no gain', expected: 'ไม่มีความสำเร็จใดได้มาโดยง่าย, ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น' },
    { id: 6752, word: 'false', expected: 'เท็จ, ปลอม' },
    { id: 6940, word: 'stale', expected: 'ไม่สดใหม่, ค้างคืน' },
    { id: 6941, word: 'starving', expected: 'หิวโซ, อดอยาก' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Thai entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.th]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const thUpdates = {};

  for (const w of currentWords) {
    const origTh = headMap.get(w.id);
    if (origTh !== w.translations.th) {
      thUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        th: w.translations.th
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      thUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        th: w.translations.th
      };
    }
  }

  const updateCount = Object.keys(thUpdates).length;
  console.log(`   Found ${updateCount} refined Thai entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.th !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.th}", expected "${check.expected}"`);
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

  let thMerged = 0;
  for (const [idStr, update] of Object.entries(thUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { th: update.th }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.th = update.th;
    }
    delete fsMap[idStr].updatedAt;
    thMerged++;
  }

  console.log(`   Merged refined Thai translations for ${thMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.th;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Thai (th) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
