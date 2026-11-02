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
  console.log('🚀 Starting Bulgarian (bg) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 37, word: 'train', expected: 'влак, тренирам' },
    { id: 44, word: 'native', expected: 'роден, роден език, местен' },
    { id: 267, word: 'tear', expected: 'сълза, късам' },
    { id: 390, word: 'disagree', expected: 'не съм съгласен' },
    { id: 578, word: 'boot', expected: 'ботуш, багажник' },
    { id: 851, word: 'orange', expected: 'портокал, оранжев' },
    { id: 1396, word: 'it', expected: 'то, това' },
    { id: 1415, word: 'up', expected: 'нагоре, горе' },
    { id: 1468, word: 'reach', expected: 'достигам, стигам до' },
    { id: 1537, word: 'so', expected: 'така, толкова, затова' },
    { id: 1620, word: 'play', expected: 'играя, пиеса' },
    { id: 1641, word: 'shop', expected: 'магазин, пазарувам' },
    { id: 1662, word: 'ago', expected: 'преди, назад' },
    { id: 1734, word: 'achieve', expected: 'постигам, реализирам' },
    { id: 1923, word: 'dress', expected: 'рокля, обличам се' },
    { id: 2046, word: 'about', expected: 'за, относно, около' },
    { id: 2130, word: 'spin spun spun', expected: 'въртя се, преда' },
    { id: 3033, word: 'spouse', expected: 'съпруг, съпруга' },
    { id: 3175, word: 'limb', expected: 'крайник, клон' },
    { id: 3772, word: 'shoot', expected: 'стрелям, снимам' },
    { id: 3784, word: 'am is are', expected: 'съм, си, е, сме, сте, са' },
    { id: 3786, word: 'of', expected: 'от, на' },
    { id: 3788, word: 'in', expected: 'в, във, вътре' },
    { id: 3802, word: 'than', expected: 'отколкото, от' },
    { id: 3809, word: 'speak', expected: 'говоря, казвам' },
    { id: 3815, word: 'if', expected: 'ако, дали' },
    { id: 3842, word: 'at', expected: 'на, при, в' },
    { id: 3859, word: 'the', expected: 'този, онзи' },
    { id: 3865, word: 'into', expected: 'в, вътре в' },
    { id: 4007, word: 'prom', expected: 'абитуриентски бал, бал' },
    { id: 4091, word: 'used to', expected: 'преди правех, свикнал съм' },
    { id: 4112, word: 'torch', expected: 'факла, фенерче' },
    { id: 4124, word: 'scared of', expected: 'уплашен от, боя се от' },
    { id: 4143, word: 'married to', expected: 'женен за, омъжена за' },
    { id: 4150, word: 'agree on', expected: 'съгласен с, единодушен за' },
    { id: 4151, word: 'care about', expected: 'грижа се за, тревожа се за' },
    { id: 4160, word: 'sick of', expected: 'писна ми от, омръзна ми' },
    { id: 4174, word: 'black dog', expected: 'депресия, меланхолия' },
    { id: 4184, word: 'all the same', expected: 'все едно, въпреки това' },
    { id: 4197, word: "I don't mind", expected: 'нямам нищо против, не възразявам' },
    { id: 4257, word: 'work out', expected: 'тренирам, решавам' },
    { id: 4308, word: "couldn't", expected: 'не можех, не успях' },
    { id: 4333, word: "I'd like to", expected: 'бих искал да' },
    { id: 4387, word: 'adverb', expected: 'наречие' },
    { id: 4457, word: 'restroom', expected: 'тоалетна' },
    { id: 4772, word: 'married', expected: 'женен, омъжена' },
    { id: 4787, word: 'indirect', expected: 'косвен, заобиколен' },
    { id: 4903, word: 'sorry', expected: 'съжалявам, извинявай' },
    { id: 4989, word: 'came out', expected: 'излезе, появи се' },
    { id: 5018, word: 'co', expected: 'съ-, съвместно' },
    { id: 5021, word: 'gotta', expected: 'трябва, налага се' },
    { id: 5023, word: 'won\'t', expected: 'няма да, отказва да' },
    { id: 5031, word: 'to take something for granted', expected: 'приемам за даденост, подценявам' },
    { id: 5056, word: 'I wish I was', expected: 'бих искал да бъда' },
    { id: 5064, word: 'when pigs fly', expected: 'когато цъфнат налъмите, никога' },
    { id: 5092, word: 'run errands', expected: 'въртя поръчки, върша задачи' },
    { id: 5202, word: 'perpetrate', expected: 'извършвам, правя' },
    { id: 5775, word: 'vouchsafe', expected: 'благоволявам, дарявам, отпускам' },
    { id: 6012, word: 'acrimony', expected: 'ожесточение, горчивина, язвителност' },
    { id: 6013, word: 'acumen', expected: 'проницателност, съобразителност' },
    { id: 6037, word: 'arrant', expected: 'пълен, завършен, явен' },
    { id: 6496, word: 'mettle', expected: 'кураж, смелост, непоколебимост' },
    { id: 6510, word: 'stracism', expected: 'остракизъм, изгнание, бойкот' },
    { id: 6742, word: 'easy come easy go', expected: 'лесно дошло, лесно отишло' },
    { id: 6743, word: 'no pain no gain', expected: 'без труд няма сполука' },
    { id: 6940, word: 'stale', expected: 'застоял, стар' },
    { id: 6941, word: 'starving', expected: 'гладуващ, прегладнял' },
    { id: 6950, word: 'expire', expected: 'изтичам, свършвам' },
    { id: 7004, word: 'liquid', expected: 'течност, течен' },
    { id: 7027, word: 'roast', expected: 'пека, печено' },
    { id: 7039, word: 'stew', expected: 'задушавам, яхния' },
    { id: 7043, word: 'thunder', expected: 'гръм, гърмя' },
    { id: 7049, word: 'wonder', expected: 'чудя се, чудо' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Bulgarian entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.bg]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const bgUpdates = {};

  for (const w of currentWords) {
    const origBg = headMap.get(w.id);
    if (origBg !== w.translations.bg) {
      bgUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        bg: w.translations.bg
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      bgUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        bg: w.translations.bg
      };
    }
  }

  const updateCount = Object.keys(bgUpdates).length;
  console.log(`   Found ${updateCount} refined Bulgarian entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.bg !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.bg}", expected "${check.expected}"`);
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

  let bgMerged = 0;
  for (const [idStr, update] of Object.entries(bgUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { bg: update.bg }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.bg = update.bg;
    }
    delete fsMap[idStr].updatedAt;
    bgMerged++;
  }

  console.log(`   Merged refined Bulgarian translations for ${bgMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.bg;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Bulgarian (bg) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
