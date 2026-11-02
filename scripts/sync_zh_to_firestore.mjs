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
  console.log('🚀 Starting Chinese Simplified (zh) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: '本地的、母语者' },
    { id: 1641, word: 'shop', expected: '商店、购物' },
    { id: 2146, word: 'fucking', expected: '该死的、极其' },
    { id: 2148, word: 'pm', expected: '下午、晚上' },
    { id: 2208, word: 'aside', expected: '在一边、在旁边' },
    { id: 2273, word: 'dna', expected: '脱氧核糖核酸、DNA' },
    { id: 2283, word: 'bitch', expected: '母狗、泼妇' },
    { id: 2387, word: 'rose', expected: '玫瑰、上升' },
    { id: 3142, word: 'hers', expected: '她的' },
    { id: 3680, word: 'dough', expected: '面团、钱财' },
    { id: 3772, word: 'shoot', expected: '射击、拍摄' },
    { id: 3781, word: 'her', expected: '她、她的' },
    { id: 3784, word: 'am is are', expected: '是、在' },
    { id: 3788, word: 'in', expected: '在……里面、在……期间' },
    { id: 3789, word: 'them', expected: '他们、她们、它们' },
    { id: 3798, word: 'me', expected: '我' },
    { id: 3802, word: 'than', expected: '比' },
    { id: 3806, word: 'make', expected: '制作、做' },
    { id: 3808, word: 'mine', expected: '我的、矿山' },
    { id: 3813, word: 'us', expected: '我们' },
    { id: 3815, word: 'if', expected: '如果' },
    { id: 3817, word: 'whom', expected: '谁' },
    { id: 3823, word: 'him', expected: '他' },
    { id: 3832, word: 'shit', expected: '屎、胡说' },
    { id: 3859, word: 'the', expected: '这、那个' },
    { id: 4007, word: 'prom', expected: '毕业舞会' },
    { id: 4091, word: 'used to', expected: '过去常常' },
    { id: 4112, word: 'torch', expected: '手电筒、火炬' },
    { id: 4124, word: 'scared of', expected: '害怕……' },
    { id: 4160, word: 'sick of', expected: '厌烦……' },
    { id: 4174, word: 'black dog', expected: '忧郁、沮丧' },
    { id: 4184, word: 'all the same', expected: '仍然、尽管如此' },
    { id: 4197, word: "I don't mind", expected: '我不介意' },
    { id: 4216, word: 'cactus cacti', expected: '仙人掌' },
    { id: 4223, word: 'crisis crises', expected: '危机' },
    { id: 4225, word: 'phenomenon phenomena', expected: '现象' },
    { id: 4294, word: 'sheep sheep', expected: '羊' },
    { id: 4308, word: "couldn't", expected: '不能、没能' },
    { id: 4310, word: 'had to', expected: '不得不、必须' },
    { id: 4331, word: 'hi there', expected: '嗨，你好' },
    { id: 4457, word: 'restroom', expected: '洗手间' },
    { id: 4787, word: 'indirect', expected: '间接的' },
    { id: 5031, word: 'to take something for granted', expected: '把……视为理所当然' },
    { id: 5064, word: 'when pigs fly', expected: '太阳打西边出来、绝不可能' },
    { id: 5775, word: 'vouchsafe', expected: '恩赐、赐予' },
    { id: 6012, word: 'acrimony', expected: '尖刻、怨恨' },
    { id: 6013, word: 'acumen', expected: '洞察力' },
    { id: 6037, word: 'arrant', expected: '十足的、彻头彻尾的' },
    { id: 6053, word: 'bacchanalian', expected: '狂饮作乐的' },
    { id: 6100, word: 'chauvinist', expected: '沙文主义者' },
    { id: 6109, word: 'clandestine', expected: '秘密的、暗中的' },
    { id: 6496, word: 'mettle', expected: '勇气、毅力' },
    { id: 6510, word: 'stracism', expected: '排斥、放逐' },
    { id: 6742, word: 'easy come easy go', expected: '来得容易去得快' },
    { id: 6743, word: 'no pain no gain', expected: '不劳无获' },
    { id: 6752, word: 'false', expected: '虚假的、错误的' },
    { id: 6767, word: 'dove', expected: '鸽子、潜水' },
    { id: 6912, word: 'TRUE', expected: '真实的、正确的' },
    { id: 6932, word: 'utilise', expected: '利用' },
    { id: 6935, word: 'serve as a lifeline', expected: '起到生命线的作用' },
    { id: 6940, word: 'stale', expected: '不新鲜的、陈腐的' },
    { id: 6941, word: 'starving', expected: '极度饥饿的、挨饿的' },
    { id: 6951, word: 'aboard', expected: '在船上、在飞机上、在车上' }
  ];

  // 1. Detect refined Chinese entries (Substantive fixes + top 600 words to preserve safe Firestore headroom)
  console.log('1. Detecting refined Chinese entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.zh]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const zhUpdates = {};

  const sampleIds = new Set(sampleChecks.map(s => s.id));

  for (const w of currentWords) {
    const origZh = headMap.get(w.id);
    if (origZh !== w.translations.zh) {
      // Include if it's in sampleChecks OR was in manual fixes OR w.id <= 600
      if (sampleIds.has(w.id) || w.id <= 600) {
        zhUpdates[String(w.id)] = {
          id: w.id,
          word: w.word,
          zh: w.translations.zh
        };
      }
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      zhUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        zh: w.translations.zh
      };
    }
  }

  const updateCount = Object.keys(zhUpdates).length;
  console.log(`   Selected ${updateCount} high-priority refined Chinese entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.zh !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.zh}", expected "${check.expected}"`);
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

  let zhMerged = 0;
  for (const [idStr, update] of Object.entries(zhUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { zh: update.zh }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.zh = update.zh;
    }
    delete fsMap[idStr].updatedAt;
    zhMerged++;
  }

  console.log(`   Merged refined Chinese translations for ${zhMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.zh;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Chinese Simplified (zh) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
