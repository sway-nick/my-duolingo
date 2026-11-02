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
  console.log('🚀 Starting Greek (el) Vocabulary OTA Synchronization...\n');

  const sampleChecks = [
    { id: 37, word: 'train', expected: 'τρένο, προπονούμαι' },
    { id: 44, word: 'native', expected: 'γηγενής, μητρικός, φυσικός ομιλητής' },
    { id: 267, word: 'tear', expected: 'δάκρυ, σκίζω' },
    { id: 578, word: 'boot', expected: 'μπότα, πορτμπαγκάζ' },
    { id: 851, word: 'orange', expected: 'πορτοκάλι, πορτοκαλί' },
    { id: 965, word: 'nail', expected: 'νύχι, καρφί' },
    { id: 1396, word: 'it', expected: 'αυτό, εκείνο' },
    { id: 1398, word: 'where', expected: 'πού, προς τα πού' },
    { id: 1415, word: 'up', expected: 'επάνω, ψηλά' },
    { id: 1468, word: 'reach', expected: 'φτάνω, αγγίζω' },
    { id: 1537, word: 'so', expected: 'έτσι, τόσο, ώστε' },
    { id: 1585, word: 'sure', expected: 'φυσικά, σίγουρος' },
    { id: 1620, word: 'play', expected: 'παίζω, θεατρικό έργο' },
    { id: 1641, word: 'shop', expected: 'κατάστημα, ψωνίζω' },
    { id: 1662, word: 'ago', expected: 'πριν, παλαιότερα' },
    { id: 1734, word: 'achieve', expected: 'πετυχαίνω, κατορθώνω' },
    { id: 1923, word: 'dress', expected: 'φόρεμα, ντύνομαι' },
    { id: 2046, word: 'about', expected: 'περίπου, σχετικά με' },
    { id: 2130, word: 'spin spun spun', expected: 'γυρίζω, στριφογυρίζω, γνέθω' },
    { id: 3175, word: 'limb', expected: 'μέλος σώματος, κλαδί' },
    { id: 3382, word: 'darling', expected: 'αγαπημένος, καλέ μου' },
    { id: 3772, word: 'shoot', expected: 'πυροβολώ, κινηματογραφώ, τραβώ' },
    { id: 3784, word: 'am is are', expected: 'είμαι, είσαι, είναι, είμαστε, είστε' },
    { id: 3786, word: 'of', expected: 'από, του, της' },
    { id: 3788, word: 'in', expected: 'σε, μέσα, εντός' },
    { id: 3802, word: 'than', expected: 'παρά, από' },
    { id: 3809, word: 'speak', expected: 'μιλώ, λέω' },
    { id: 3815, word: 'if', expected: 'αν, εάν' },
    { id: 3821, word: 'how', expected: 'πώς' },
    { id: 3842, word: 'at', expected: 'σε, στο, στη' },
    { id: 3859, word: 'the', expected: 'ο, η, το' },
    { id: 3865, word: 'into', expected: 'μέσα σε, προς τα μέσα' },
    { id: 3885, word: 'what\'s up', expected: 'τι γίνεται, πώς πάει' },
    { id: 3949, word: 'so what', expected: 'και λοιπόν, τι έγινε' },
    { id: 3975, word: 'what who where when', expected: 'τι, ποιος, πού, πότε' },
    { id: 4007, word: 'prom', expected: 'χορός αποφοίτησης' },
    { id: 4091, word: 'used to', expected: 'συνήθιζα, παλιά' },
    { id: 4112, word: 'torch', expected: 'πυρσός, φακός' },
    { id: 4124, word: 'scared of', expected: 'φοβάμαι, τρομαγμένος από' },
    { id: 4140, word: 'kind to', expected: 'ευγενικός με, καλός με' },
    { id: 4151, word: 'care about', expected: 'νοιάζομαι για, ενδιαφέρομαι' },
    { id: 4160, word: 'sick of', expected: 'αηδίασα με, μπούχτισα από' },
    { id: 4170, word: 'who can tell', expected: 'ποιος ξέρει' },
    { id: 4174, word: 'black dog', expected: 'κατάθλιψη, μελαγχολία' },
    { id: 4184, word: 'all the same', expected: 'παρ\' όλα αυτά, το ίδιο κάνει' },
    { id: 4188, word: 'how you been', expected: 'πώς είσαι, πώς περνάς' },
    { id: 4197, word: "I don't mind", expected: 'δεν με πειράζει, δεν έχω αντίρρηση' },
    { id: 4257, word: 'work out', expected: 'γυμνάζομαι, επιλύω' },
    { id: 4284, word: 'what gives?', expected: 'τι συμβαίνει, τι τρέχει' },
    { id: 4308, word: "couldn't", expected: 'δεν μπορούσα, δεν στάθηκε δυνατό' },
    { id: 4350, word: "I'm sure", expected: 'είμαι σίγουρος' },
    { id: 4354, word: 'how much', expected: 'πόσο κάνει, πόσο' },
    { id: 4368, word: 'any news', expected: 'κανένα νέο' },
    { id: 4371, word: 'is it far?', expected: 'είναι μακριά' },
    { id: 4372, word: 'since when?', expected: 'από πότε' },
    { id: 4373, word: 'so what?', expected: 'και λοιπόν' },
    { id: 4375, word: 'got it?', expected: 'κατάλαβες, έγινε σαφές' },
    { id: 4387, word: 'adverb', expected: 'επίρρημα' },
    { id: 4457, word: 'restroom', expected: 'τουαλέτα, λουτρό' },
    { id: 4787, word: 'indirect', expected: 'έμμεσος, πλάγιος' },
    { id: 4903, word: 'sorry', expected: 'συγγνώμη, λυπάμαι' },
    { id: 4989, word: 'came out', expected: 'βγήκε, κυκλοφόρησε' },
    { id: 4997, word: 'did you get?', expected: 'το έλαβες, κατάλαβες' },
    { id: 5018, word: 'co', expected: 'συν-, μαζί' },
    { id: 5021, word: 'gotta', expected: 'πρέπει, οφείλω' },
    { id: 5023, word: 'won\'t', expected: 'δεν θα, αρνείται να' },
    { id: 5031, word: 'to take something for granted', expected: 'θεωρώ δεδομένο, υποτιμώ' },
    { id: 5064, word: 'when pigs fly', expected: 'του Αγίου Ποτέ, ποτέ' },
    { id: 5092, word: 'run errands', expected: 'τρέχω για δουλειές, κάνω θελήματα' },
    { id: 5165, word: 'subordinate', expected: 'υφιστάμενος, κατώτερος' },
    { id: 5166, word: 'cheeky', expected: 'αυθάδης, αναιδής, προκλητικός' },
    { id: 5202, word: 'perpetrate', expected: 'διαπράττω, κάνω' },
    { id: 5775, word: 'vouchsafe', expected: 'καταδέχομαι, παραχωρώ, παρέχω' },
    { id: 6012, word: 'acrimony', expected: 'πικρία, δριμύτητα, οξύτητα' },
    { id: 6013, word: 'acumen', expected: 'οξυδέρκεια, διορατικότητα' },
    { id: 6037, word: 'arrant', expected: 'διαβόητος, απόλυτος, σκέτος' },
    { id: 6496, word: 'mettle', expected: 'θάρρος, ψυχικό σθένος, τόλμη' },
    { id: 6510, word: 'stracism', expected: 'οστρακισμός, εξορία, αποκλεισμός' },
    { id: 6742, word: 'easy come easy go', expected: 'όπως ήρθαν, έτσι έφυγαν' },
    { id: 6743, word: 'no pain no gain', expected: 'αγαθά κόποις κτώνται' },
    { id: 6940, word: 'stale', expected: 'μπαγιάτικος, παλιός' },
    { id: 6941, word: 'starving', expected: 'λιμοκτονώ, είμαι κατάπεινος' },
    { id: 7039, word: 'stew', expected: 'σιγοβράζω, στιφάδο' }
  ];

  // 1. Detect all changed words in words.json compared to git HEAD
  console.log('1. Detecting refined Greek entries...');
  const headWordsStr = execSync('git show HEAD:frontend/assets/data/words.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
  const headWords = JSON.parse(headWordsStr);
  const headMap = new Map(headWords.map(w => [w.id, w.translations.el]));

  const currentWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const elUpdates = {};

  for (const w of currentWords) {
    const origEl = headMap.get(w.id);
    if (origEl !== w.translations.el) {
      elUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        el: w.translations.el
      };
    }
  }

  // Ensure ALL sample checks are present
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (w) {
      elUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        el: w.translations.el
      };
    }
  }

  const updateCount = Object.keys(elUpdates).length;
  console.log(`   Found ${updateCount} refined Greek entries ready for OTA.`);

  // Safety assertions on key IDs
  for (const check of sampleChecks) {
    const w = currentWords.find(item => item.id === check.id);
    if (!w || w.translations.el !== check.expected) {
      throw new Error(`Safety check failed: word ${check.id} (${check.word}) is "${w?.translations?.el}", expected "${check.expected}"`);
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

  let elMerged = 0;
  for (const [idStr, update] of Object.entries(elUpdates)) {
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: update.id,
        word: update.word,
        translations: { el: update.el }
      };
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations.el = update.el;
    }
    delete fsMap[idStr].updatedAt;
    elMerged++;
  }

  console.log(`   Merged refined Greek translations for ${elMerged} words into Firestore updates.`);

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
    const readVal = verifyMap[String(check.id)]?.translations?.el;
    console.log(`   - ID ${check.id} (${check.word}): "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id}! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update for Greek (el) verified successfully! Users will automatically receive all updates over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
