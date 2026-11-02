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
  console.log('🚀 Starting Romanian (ro) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 44, word: 'native', expected: 'nativ, vorbitor nativ' },
    { id: 1396, word: 'it', expected: 'acesta, el, ea' },
    { id: 1415, word: 'up', expected: 'sus, în sus' },
    { id: 1468, word: 'reach', expected: 'a atinge, a ajunge la' },
    { id: 1537, word: 'so', expected: 'deci, așa, atât de' },
    { id: 1641, word: 'shop', expected: 'magazin, a cumpăra' },
    { id: 1662, word: 'ago', expected: 'în urmă, în trecut' },
    { id: 1734, word: 'achieve', expected: 'a atinge, a realiza' },
    { id: 2046, word: 'about', expected: 'despre, aproximativ' },
    { id: 2130, word: 'spin spun spun', expected: 'a roti, a toarce' },
    { id: 3033, word: 'spouse', expected: 'soț, soție' },
    { id: 3175, word: 'limb', expected: 'membru, ramură' },
    { id: 3772, word: 'shoot', expected: 'a trage, a filma' },
    { id: 3784, word: 'am is are', expected: 'sunt, este, ești' },
    { id: 3786, word: 'of', expected: 'din, de, despre' },
    { id: 3788, word: 'in', expected: 'în, înăuntru' },
    { id: 3802, word: 'than', expected: 'decât, ca' },
    { id: 3809, word: 'speak', expected: 'a vorbi, a spune' },
    { id: 3815, word: 'if', expected: 'dacă, în caz că' },
    { id: 3842, word: 'at', expected: 'la, în' },
    { id: 3859, word: 'the', expected: 'acesta, cel' },
    { id: 4091, word: 'used to', expected: 'obișnuiam, pe vremuri' },
    { id: 4112, word: 'torch', expected: 'torță, lanternă' },
    { id: 4124, word: 'scared of', expected: 'speriat de, temător de' },
    { id: 4151, word: 'care about', expected: 'a-i păsa de, a-și face griji' },
    { id: 4160, word: 'sick of', expected: 'sătul de, lehamite de' },
    { id: 4174, word: 'black dog', expected: 'depresie, melancolie' },
    { id: 4197, word: "I don't mind", expected: 'nu mă deranjează, nu am nimic împotrivă' },
    { id: 4257, word: 'work out', expected: 'a se antrena, a rezolva' },
    { id: 4308, word: "couldn't", expected: 'nu a putut, nu puteam' },
    { id: 4387, word: 'adverb', expected: 'adverb' },
    { id: 4457, word: 'restroom', expected: 'toaletă, baie' },
    { id: 4787, word: 'indirect', expected: 'indirect, ocolit' },
    { id: 4903, word: 'sorry', expected: 'scuze, îmi pare rău' },
    { id: 4989, word: 'came out', expected: 'a ieșit, a apărut' },
    { id: 5018, word: 'co', expected: 'co-, împreună' },
    { id: 5021, word: 'gotta', expected: 'trebuie, am de' },
    { id: 5023, word: 'won\'t', expected: 'nu va, refuză să' },
    { id: 5031, word: 'to take something for granted', expected: 'a lua de la sine înțeles, a subestima' },
    { id: 5064, word: 'when pigs fly', expected: 'la paștele cailor, când o zbura porcul, niciodată' },
    { id: 5092, word: 'run errands', expected: 'a face comisioane, a rezolva treburi' },
    { id: 5202, word: 'perpetrate', expected: 'a comite, a săvârși' },
    { id: 5775, word: 'vouchsafe', expected: 'a binevoi, a acorda, a dărui' },
    { id: 6012, word: 'acrimony', expected: 'amărăciune, înverșunare, asprime' },
    { id: 6013, word: 'acumen', expected: 'perspicacitate, agerime' },
    { id: 6037, word: 'arrant', expected: 'notoriu, absolut, desăvârșit' },
    { id: 6496, word: 'mettle', expected: 'curaj, bărbăție, îndrăzneală' },
    { id: 6510, word: 'stracism', expected: 'ostracizare, exilare, boicot' },
    { id: 6743, word: 'no pain no gain', expected: 'fără efort nu există câștig, fără muncă nu este răsplată' },
    { id: 6752, word: 'false', expected: 'fals, neadevărat' },
    { id: 7039, word: 'stew', expected: 'a înăbuși, tocăniță' },
    { id: 7043, word: 'thunder', expected: 'tunet, a tuna' },
    { id: 7049, word: 'wonder', expected: 'a se mira, minune' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Romanian entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.ro]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const roUpdates = {};

  for (const w of currentWords) {
    const origRo = headMap.get(w.id);
    if (origRo !== w.translations.ro) {
      roUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ro: w.translations.ro
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      roUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ro: w.translations.ro
      };
    }
  }

  const updateCount = Object.keys(roUpdates).length;
  console.log(`   Found ${updateCount} refined Romanian entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.ro !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.ro}", expected "${check.expected}"`);
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

  let roMerged = 0;
  for (const [idStr, update] of Object.entries(roUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { ro: update.ro }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.ro = update.ro;
    }
    delete fsMap[idStr].updatedAt;
    roMerged++;
  }

  console.log(`   Merged refined Romanian translations for ${roMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.ro;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Romanian (ro) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
