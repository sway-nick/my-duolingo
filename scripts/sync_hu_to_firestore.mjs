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
  console.log('🚀 Starting Hungarian (hu) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 37, word: 'train', expected: 'vonat, edz' },
    { id: 44, word: 'native', expected: 'anyanyelvi, őshonos, anyanyelvi beszélő' },
    { id: 267, word: 'tear', expected: 'könny, szakít' },
    { id: 851, word: 'orange', expected: 'narancs, narancssárga' },
    { id: 965, word: 'nail', expected: 'köröm, szög' },
    { id: 1396, word: 'it', expected: 'az, ez, ő' },
    { id: 1415, word: 'up', expected: 'fel, felfelé' },
    { id: 1468, word: 'reach', expected: 'elér, odanyúl' },
    { id: 1537, word: 'so', expected: 'így, úgy, annyira' },
    { id: 1620, word: 'play', expected: 'játszik, színdarab' },
    { id: 1641, word: 'shop', expected: 'bolt, vásárol' },
    { id: 1662, word: 'ago', expected: 'ezelőtt, korábban' },
    { id: 1734, word: 'achieve', expected: 'elér, megvalósít' },
    { id: 1923, word: 'dress', expected: 'ruha, felöltözik' },
    { id: 2046, word: 'about', expected: 'körülbelül, -ról, -ről' },
    { id: 2130, word: 'spin spun spun', expected: 'forog, fon' },
    { id: 3033, word: 'spouse', expected: 'házastárs' },
    { id: 3175, word: 'limb', expected: 'végtag, faág' },
    { id: 3772, word: 'shoot', expected: 'lő, felvesz, forgat' },
    { id: 3784, word: 'am is are', expected: 'vagyok, vagy, van, vagyunk, vagytok, vannak' },
    { id: 3786, word: 'of', expected: '-ból, -ből, -ról, -ről' },
    { id: 3788, word: 'in', expected: '-ban, -ben, bent' },
    { id: 3797, word: 'from', expected: '-tól, -től' },
    { id: 3802, word: 'than', expected: 'mint' },
    { id: 3809, word: 'speak', expected: 'beszél, mond' },
    { id: 3815, word: 'if', expected: 'ha, amennyiben' },
    { id: 3842, word: 'at', expected: '-nál, -nél, -on, -en, -ön' },
    { id: 3859, word: 'the', expected: 'a, az' },
    { id: 3865, word: 'into', expected: '-ba, -be, bele' },
    { id: 4007, word: 'prom', expected: 'szalagavató bál, bál' },
    { id: 4091, word: 'used to', expected: 'valaha csináltam, régen' },
    { id: 4112, word: 'torch', expected: 'fáklya, zseblámpa' },
    { id: 4124, word: 'scared of', expected: 'fél valamitől, megijed' },
    { id: 4151, word: 'care about', expected: 'törődik vele, aggódik miatta' },
    { id: 4160, word: 'sick of', expected: 'torkig van, elege van' },
    { id: 4174, word: 'black dog', expected: 'depresszió, melankólia' },
    { id: 4184, word: 'all the same', expected: 'mindegy, mégis' },
    { id: 4197, word: "I don't mind", expected: 'nem bánom, nincs ellene kifogásom' },
    { id: 4257, word: 'work out', expected: 'edz, megold, kidolgoz' },
    { id: 4308, word: "couldn't", expected: 'nem tudott, képtelen volt' },
    { id: 4387, word: 'adverb', expected: 'határozószó' },
    { id: 4457, word: 'restroom', expected: 'mosdó, vécé' },
    { id: 4787, word: 'indirect', expected: 'közvetett, burkolt' },
    { id: 4903, word: 'sorry', expected: 'sajnálom, elnézést' },
    { id: 4989, word: 'came out', expected: 'kijött, megjelent' },
    { id: 5018, word: 'co', expected: 'társ-, együtt' },
    { id: 5021, word: 'gotta', expected: 'kell, muszáj' },
    { id: 5023, word: 'won\'t', expected: 'nem fog, nem hajlandó' },
    { id: 5031, word: 'to take something for granted', expected: 'magától értetődőnek vesz, alábecsül' },
    { id: 5064, word: 'when pigs fly', expected: 'majd ha piros hó esik, soha' },
    { id: 5092, word: 'run errands', expected: 'ügyeket intéz, szaladgál' },
    { id: 5202, word: 'perpetrate', expected: 'elkövet, véghezvisz' },
    { id: 5775, word: 'vouchsafe', expected: 'méltóztat, megad, kegyeskedik' },
    { id: 6012, word: 'acrimony', expected: 'keserűség, elkeseredettség, maró gúny' },
    { id: 6013, word: 'acumen', expected: 'éleselméjűség, éleslátás, rátermettség' },
    { id: 6037, word: 'arrant', expected: 'megrögzött, nyilvánvaló, teljes' },
    { id: 6496, word: 'mettle', expected: 'bátorság, rátermettség, kitartás' },
    { id: 6510, word: 'stracism', expected: 'kiközösítés, száműzetés, bojkott' },
    { id: 6742, word: 'easy come easy go', expected: 'könnyen jött, könnyen ment' },
    { id: 6743, word: 'no pain no gain', expected: 'nincs siker munka nélkül' },
    { id: 6940, word: 'stale', expected: 'állott, száraz' },
    { id: 6941, word: 'starving', expected: 'éhező, farkaséhes' },
    { id: 7004, word: 'liquid', expected: 'folyadék, folyékony' },
    { id: 7039, word: 'stew', expected: 'párol, ragu' },
    { id: 7049, word: 'wonder', expected: 'csodálkozik, csoda' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Hungarian entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.hu]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const huUpdates = {};

  for (const w of currentWords) {
    const origHu = headMap.get(w.id);
    if (origHu !== w.translations.hu) {
      huUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        hu: w.translations.hu
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      huUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        hu: w.translations.hu
      };
    }
  }

  const updateCount = Object.keys(huUpdates).length;
  console.log(`   Found ${updateCount} refined Hungarian entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.hu !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.hu}", expected "${check.expected}"`);
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

  let huMerged = 0;
  for (const [idStr, update] of Object.entries(huUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { hu: update.hu }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.hu = update.hu;
    }
    delete fsMap[idStr].updatedAt;
    huMerged++;
  }

  console.log(`   Merged refined Hungarian translations for ${huMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.hu;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Hungarian (hu) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
