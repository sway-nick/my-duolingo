import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  console.log('🚀 Starting Universal Vocabulary OTA Synchronization (Cloud Firestore)...\n');

  // Key sample checks across batch 1-50, batch 51-100, and recent calibrations
  const sampleChecks = [
    // Batch 1-50
    { id: 2, word: 'good at', lang: 'it', expected: 'bravo a, abile in' },
    { id: 10, word: 'beginning', lang: 'ja', expected: '始まり、初め' },
    { id: 10, word: 'beginning', lang: 'ko', expected: '시작, 처음' },
    { id: 14, word: 'assessment', lang: 'it', expected: 'valutazione, stima' },
    { id: 14, word: 'assessment', lang: 'cs', expected: 'hodnocení, posouzení' },
    { id: 20, word: 'familiar', lang: 'ja', expected: '親しみのある、よく知られた' },
    { id: 24, word: 'lunch', lang: 'it', expected: 'pranzo' },
    { id: 24, word: 'lunch', lang: 'cs', expected: 'oběd' },
    { id: 24, word: 'lunch', lang: 'bg', expected: 'обяд' },
    { id: 24, word: 'lunch', lang: 'hu', expected: 'ebéd' },
    { id: 27, word: 'instruction', lang: 'it', expected: 'istruzione, indicazione' },
    { id: 37, word: 'train', lang: 'de', expected: 'Zug, trainieren' },
    { id: 44, word: 'native', lang: 'ja', expected: '母国語話者、ネイティブ、生まれつきの' },
    { id: 44, word: 'native', lang: 'it', expected: 'nativo, madrelingua' },
    { id: 44, word: 'native', lang: 'pl', expected: 'rodzimy, ojczysty, rodzimy użytkownik języka' },
    { id: 44, word: 'native', lang: 'ru', expected: 'родной, носитель языка' },

    // Batch 51-100
    { id: 51, word: 'launch', lang: 'hu', expected: 'indítás, kilövés' },
    { id: 53, word: 'ring', lang: 'it', expected: 'anello, suonare' },
    { id: 53, word: 'ring', lang: 'cs', expected: 'prsten, kroužek' },
    { id: 57, word: 'neck', lang: 'de', expected: 'Hals, Nacken' },
    { id: 57, word: 'neck', lang: 'hi', expected: 'गर्दन' },
    { id: 61, word: 'complex', lang: 'it', expected: 'complesso' },
    { id: 65, word: 'extremely', lang: 'ja', expected: '極めて、非常に' },
    { id: 65, word: 'extremely', lang: 'da', expected: 'ekstremt, yderst' },
    { id: 68, word: 'prefer', lang: 'it', expected: 'preferire' },
    { id: 74, word: 'danger', lang: 'it', expected: 'pericolo' },
    { id: 77, word: 'traffic', lang: 'ru', expected: 'движение, трафик' },
    { id: 77, word: 'traffic', lang: 'de', expected: 'Verkehr' },
    { id: 78, word: 'plate', lang: 'es', expected: 'plato, placa' },
    { id: 78, word: 'plate', lang: 'it', expected: 'piatto, piastra' },
    { id: 78, word: 'plate', lang: 'ja', expected: '皿、プレート' },
    { id: 78, word: 'plate', lang: 'ko', expected: '접시, 플레이트' },
    { id: 82, word: 'expensive', lang: 'pl', expected: 'drogi' },
    { id: 85, word: 'adopt', lang: 'ru', expected: 'усыновлять, принимать' },
    { id: 85, word: 'adopt', lang: 'ja', expected: '養子にする、採用する' },
    { id: 88, word: 'circle', lang: 'ja', expected: '円、丸、サークル' },
    { id: 90, word: 'solve', lang: 'ru', expected: 'решать, разрешать' },
    { id: 90, word: 'solve', lang: 'de', expected: 'lösen, auflösen' },
    { id: 90, word: 'solve', lang: 'ja', expected: '解決する、解く' },
    { id: 91, word: 'busy', lang: 'it', expected: 'occupato' },
    { id: 93, word: 'requirement', lang: 'ja', expected: '要件、必要条件' },
    { id: 93, word: 'requirement', lang: 'ko', expected: '요구조건, 필요조건' },
    { id: 95, word: 'rain', lang: 'it', expected: 'pioggia, piovere' },
    { id: 100, word: 'exercise', lang: 'ja', expected: '運動、エクササイズ、練習問題' }
  ];

  // 1. Fetch current Firestore shared/vocabulary_updates
  console.log('1. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  const words = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const wordsMap = new Map(words.map(w => [w.id, w]));

  // Read calibrations from batch 1-50 script
  const calib1FileContent = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'apply_batch_1_50_calibrations.mjs'), 'utf8');
  const calib1ObjStr = calib1FileContent.slice(calib1FileContent.indexOf('const calibrations = {') + 'const calibrations = '.length, calib1FileContent.indexOf(';\n\nfor (const filePath'));
  const calibs1 = eval('(' + calib1ObjStr + ')');

  // Read calibrations from batch 51-100 script
  const calib2FileContent = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'apply_batch_51_100_calibrations.cjs'), 'utf8');
  const calib2Start = calib2FileContent.indexOf('const calibrations = [');
  const calib2End = calib2FileContent.indexOf('let totalPatched = 0;');
  const calibs2 = eval(calib2FileContent.slice(calib2Start + 'const calibrations = '.length, calib2End).trim().replace(/;$/, ''));

  // Merge batch 1-50 calibrations into fsMap
  let mergedCount = 0;
  for (const [idStr, langMap] of Object.entries(calibs1)) {
    const idNum = parseInt(idStr, 10);
    const localW = wordsMap.get(idNum);
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: idNum,
        word: localW?.word || '',
        translations: {}
      };
    }
    for (const [lang, val] of Object.entries(langMap)) {
      if (lang === 'ru') {
        fsMap[idStr].translation = val;
      } else {
        if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
        fsMap[idStr].translations[lang] = val;
      }
    }
    delete fsMap[idStr].updatedAt;
    mergedCount++;
  }

  // Merge batch 51-100 calibrations into fsMap
  for (const cal of calibs2) {
    const idStr = String(cal.id);
    const localW = wordsMap.get(cal.id);
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: cal.id,
        word: localW?.word || '',
        translations: {}
      };
    }
    if (cal.translation) {
      fsMap[idStr].translation = cal.translation;
    }
    if (cal.translations) {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      for (const [lang, val] of Object.entries(cal.translations)) {
        fsMap[idStr].translations[lang] = val;
      }
    }
    delete fsMap[idStr].updatedAt;
    mergedCount++;
  }

  // Also ensure key sample check words are synchronized
  for (const check of sampleChecks) {
    const localW = wordsMap.get(check.id);
    if (!localW) continue;
    const idStr = String(check.id);
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: check.id,
        word: localW.word,
        translations: {}
      };
    }
    if (check.lang === 'ru') {
      fsMap[idStr].translation = localW.translation;
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations[check.lang] = localW.translations?.[check.lang];
    }
    delete fsMap[idStr].updatedAt;
  }

  console.log(`   Merged Batch 1-50 & Batch 51-100 calibrations into Firestore updates.`);

  // 2. Prune redundant legacy duplicate fr/vi entries to preserve plenty of headroom (< 1024 KB)
  let pruned = 0;
  for (const [idStr, entry] of Object.entries(fsMap)) {
    const localW = wordsMap.get(Number(idStr));
    if (!localW) continue;
    if (calibs1[idStr]) continue;
    if (calibs2.some(c => String(c.id) === idStr)) continue;

    const trKeys = Object.keys(entry.translations || {});
    if (trKeys.length === 2 && trKeys.includes('fr') && trKeys.includes('vi')) {
      if (entry.translations.fr === localW.translations?.fr && entry.translations.vi === localW.translations?.vi) {
        delete fsMap[idStr];
        pruned++;
      }
    }
  }

  for (const entry of Object.values(fsMap)) {
    delete entry.updatedAt;
  }

  const finalPayloadStr = JSON.stringify(fsMap);
  const finalBytes = Buffer.byteLength(finalPayloadStr, 'utf8');
  console.log(`\n2. Firestore payload optimization:`);
  console.log(`   - Pruned redundant legacy entries: ${pruned}`);
  console.log(`   - Remaining entries in Firestore: ${Object.keys(fsMap).length}`);
  console.log(`   - Final payload size: ${finalBytes} bytes (${(finalBytes / 1024).toFixed(1)} KB / 1024 KB max)`);
  console.log(`   - Headroom remaining: ${(1024 - finalBytes / 1024).toFixed(1)} KB`);

  if (finalBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${finalBytes} bytes)! Aborting write.`);
  }

  // 3. Authenticate with Firebase Admin
  console.log('\n3. Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();
  console.log('   Authenticated successfully.');

  // 4. Patch Firestore
  console.log('4. Writing updates to Firestore shared/vocabulary_updates (OTA)...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: finalPayloadStr },
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

  // 5. Verification read-back
  console.log('\n5. Verifying read-back from Firestore...');
  const verifyRes = await fetch(fsUrl);
  if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status} verifying Firestore readback`);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  for (const check of sampleChecks) {
    const wordEntry = verifyMap[String(check.id)];
    const readVal = check.lang === 'ru' ? wordEntry?.translation : wordEntry?.translations?.[check.lang];
    console.log(`   - ID ${check.id} (${check.word}) [${check.lang}]: "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id} (${check.lang})! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update verified successfully! Users will immediately receive all calibrations over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
