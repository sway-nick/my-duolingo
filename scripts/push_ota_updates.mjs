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

  // Key sample checks across batch 1-50, 51-100, 101-150, 151-200, 201-250, 251-300, 301-350, 351-400
  const sampleChecks = [
    // Batch 1-50
    { id: 2, word: 'good at', lang: 'it', expected: 'bravo a, abile in' },
    { id: 10, word: 'beginning', lang: 'ja', expected: '始まり、初め' },
    { id: 24, word: 'lunch', lang: 'it', expected: 'pranzo' },
    { id: 44, word: 'native', lang: 'ja', expected: '母国語話者、ネイティブ、生まれつきの' },

    // Batch 51-100
    { id: 51, word: 'launch', lang: 'hu', expected: 'indítás, kilövés' },
    { id: 53, word: 'ring', lang: 'it', expected: 'anello, suonare' },
    { id: 78, word: 'plate', lang: 'es', expected: 'plato, placa' },
    { id: 78, word: 'plate', lang: 'ja', expected: '皿、プレート' },

    // Batch 101-150
    { id: 105, word: 'united', lang: 'fr', expected: 'uni' },
    { id: 106, word: 'pool', lang: 'ko', expected: '수영장, 공동 기금' },
    { id: 134, word: 'bear', lang: 'it', expected: 'orso, sopportare' },
    { id: 147, word: 'domestic', lang: 'ja', expected: '国内の、家庭の' },

    // Batch 151-200
    { id: 160, word: 'sentence', lang: 'fr', expected: 'phrase, sentence' },
    { id: 160, word: 'sentence', lang: 'it', expected: 'frase, condanna' },
    { id: 160, word: 'sentence', lang: 'cs', expected: 'věta, rozsudek' },
    { id: 188, word: 'desk', lang: 'fr', expected: 'bureau' },
    { id: 188, word: 'desk', lang: 'it', expected: 'scrivania' },

    // Batch 201-250
    { id: 213, word: 'surgery', lang: 'de', expected: 'Chirurgie, Operation' },
    { id: 213, word: 'surgery', lang: 'ja', expected: '手術、外科' },
    { id: 229, word: 'fat', lang: 'kk', expected: 'семіз, майлы, май' },
    { id: 241, word: 'breast', lang: 'fi', expected: 'rinta' },
    { id: 248, word: 'overall', lang: 'cs', expected: 'celkový, obecný' },
    { id: 248, word: 'overall', lang: 'ko', expected: '전반적인, 전반적으로' },

    // Batch 251-300
    { id: 260, word: 'airport', lang: 'cs', expected: 'letiště' },
    { id: 269, word: 'initial', lang: 'de', expected: 'anfänglich, erst' },
    { id: 271, word: 'guide', lang: 'de', expected: 'Leitfaden, Führer' },
    { id: 277, word: 'escape', lang: 'da', expected: 'undslippe, flugt' },
    { id: 277, word: 'escape', lang: 'ja', expected: '逃げる、脱出する' },
    { id: 282, word: 'fault', lang: 'da', expected: 'fejl, skyld' },
    { id: 282, word: 'fault', lang: 'ja', expected: '過失、責任、欠陥' },
    { id: 282, word: 'fault', lang: 'ko', expected: '잘못, 과실' },
    { id: 292, word: 'slip', lang: 'fi', expected: 'liukastua, lipsahtaa' },
    { id: 299, word: 'mass', lang: 'fr', expected: 'masse' },

    // Batch 301-350
    { id: 307, word: 'golden', lang: 'fr', expected: 'doré' },
    { id: 307, word: 'golden', lang: 'it', expected: 'dorato' },
    { id: 307, word: 'golden', lang: 'cs', expected: 'zlatý' },
    { id: 322, word: 'mad', lang: 'fr', expected: 'en colère, fou' },
    { id: 322, word: 'mad', lang: 'it', expected: 'arrabbiato, pazzo' },
    { id: 327, word: 'opening', lang: 'da', expected: 'åbning, indvielse' },
    { id: 327, word: 'opening', lang: 'ja', expected: '開始、オープニング、開幕' },
    { id: 327, word: 'opening', lang: 'ko', expected: '개장, 개막, 시작' },
    { id: 329, word: 'frequently', lang: 'it', expected: 'spesso' },
    { id: 330, word: 'employ', lang: 'ro', expected: 'angaja' },
    { id: 330, word: 'employ', lang: 'cs', expected: 'zaměstnat' },
    { id: 337, word: 'appeal', lang: 'fr', expected: 'faire appel, attrait' },
    { id: 337, word: 'appeal', lang: 'it', expected: 'fare appello, fascino' },
    { id: 337, word: 'appeal', lang: 'cs', expected: 'odvolání, apelovat' },
    { id: 337, word: 'appeal', lang: 'ja', expected: '訴える、魅力' },
    { id: 337, word: 'appeal', lang: 'ko', expected: '항소하다, 매력' },
    { id: 338, word: 'quote', lang: 'fr', expected: 'citer, citation' },
    { id: 338, word: 'quote', lang: 'it', expected: 'citare, citazione' },
    { id: 344, word: 'row', lang: 'fi', expected: 'rivi, meloa' },

    // Batch 351-400
    { id: 370, word: 'agenda', lang: 'es', expected: 'agenda, orden del día' },
    { id: 381, word: 'tank', lang: 'cs', expected: 'tank, nádrž' },
    { id: 387, word: 'perfectly', lang: 'it', expected: 'perfettamente' },
    { id: 390, word: 'disagree', lang: 'cs', expected: 'nesouhlasit' },
    { id: 395, word: 'waste', lang: 'fr', expected: 'gaspiller, déchets' },
    { id: 398, word: 'wrap', lang: 'da', expected: 'pakke ind, vikle' },
    { id: 398, word: 'wrap', lang: 'fi', expected: 'kääriä, paketoida' },
    { id: 398, word: 'wrap', lang: 'ja', expected: '包む、包装する' },

    // Batch 401-450
    { id: 401, word: 'rush', lang: 'fr', expected: 'se dépêcher, précipiter, ruée' },
    { id: 402, word: 'gate', lang: 'de', expected: 'Tor, Pforte, Flugsteig' },
    { id: 413, word: 'deeply', lang: 'it', expected: 'profondamente' },
    { id: 416, word: 'fairly', lang: 'fr', expected: 'assez, plutôt, équitablement' },
    { id: 426, word: 'violent', lang: 'de', expected: 'gewalttätig, gewaltsam' },
    { id: 442, word: 'round', lang: 'kk', expected: 'дөңгелек, жұмыр, раунд' },
    { id: 443, word: 'detective', lang: 'it', expected: 'investigatore, detective' },
    { id: 444, word: 'pack', lang: 'fr', expected: 'emballer, paquet, meute' },
    { id: 450, word: 'command', lang: 'fr', expected: 'ordre, commander, commandement' },
    { id: 450, word: 'command', lang: 'it', expected: 'ordine, comandare, comando' },
    { id: 450, word: 'command', lang: 'ja', expected: '命令、指揮する、指令' },

    // Batch 451-500
    { id: 451, word: 'shooting', lang: 'fr', expected: 'tir, tournage' },
    { id: 456, word: 'pure', lang: 'fr', expected: 'pur, sans mélange, authentique' },
    { id: 459, word: 'fellow', lang: 'de', expected: 'Kollege, Gefährte, Kerl' },
    { id: 464, word: 'sharp', lang: 'fr', expected: 'tranchant, pointu, aiguisé' },
    { id: 464, word: 'sharp', lang: 'it', expected: 'affilato, tagliente, acuto' },
    { id: 464, word: 'sharp', lang: 'ja', expected: '鋭い、尖った' },
    { id: 471, word: 'load', lang: 'fr', expected: 'charge, chargement, charger' },
    { id: 471, word: 'load', lang: 'it', expected: 'carico, caricare, carico di lavoro' },
    { id: 485, word: 'advance', lang: 'fr', expected: 'avancer, progrès, avance' },
    { id: 490, word: 'rural', lang: 'fr', expected: 'rural, champêtre' },
    { id: 490, word: 'rural', lang: 'it', expected: 'rurale, campestre' },
    { id: 491, word: 'wage', lang: 'fr', expected: 'salaire, rémunération, mener' },
    { id: 491, word: 'wage', lang: 'de', expected: 'Lohn, Gehalt, führen' },
    { id: 491, word: 'wage', lang: 'ja', expected: '賃金、給料、行う' },

    // Batch 501-550
    { id: 501, word: 'transfer', lang: 'fr', expected: 'transfert, transférer, virement' },
    { id: 506, word: 'owe', lang: 'cs', expected: 'dlužit, vděčit' },
    { id: 506, word: 'owe', lang: 'fr', expected: 'devoir, être redevable' },
    { id: 511, word: 'abandon', lang: 'cs', expected: 'opustit, zanechat, vzdát se' },
    { id: 514, word: 'suggestion', lang: 'fr', expected: 'suggestion, proposition, conseil' },
    { id: 514, word: 'suggestion', lang: 'it', expected: 'suggerimento, proposta, consiglio' },
    { id: 514, word: 'suggestion', lang: 'ja', expected: '提案、助言、示唆' },
    { id: 528, word: 'leading', lang: 'da', expected: 'førende, ledende' },
    { id: 529, word: 'widely', lang: 'cs', expected: 'široce, hojně' },
    { id: 535, word: 'cap', lang: 'es', expected: 'gorra, gorro, tapa, tope' },
    { id: 536, word: 'secure', lang: 'cs', expected: 'bezpečný, spolehlivý, zajistit' },
    { id: 542, word: 'boyfriend', lang: 'fr', expected: 'petit ami, copain' },
    { id: 545, word: 'preserve', lang: 'fr', expected: 'préserver, conserver, confiture' },
    { id: 545, word: 'preserve', lang: 'cs', expected: 'zachovat, uchovat, chránit' },
    { id: 545, word: 'preserve', lang: 'ja', expected: '保存する、保護する、ジャム' }
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

  // Read calibrations from batch scripts
  function loadBatchCalibs(relPath) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    const start = content.indexOf('const calibrations = [');
    const end = content.indexOf('let totalPatched = 0;');
    return eval(content.slice(start + 'const calibrations = '.length, end).trim().replace(/;$/, ''));
  }

  const calib1FileContent = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'apply_batch_1_50_calibrations.mjs'), 'utf8');
  const calib1ObjStr = calib1FileContent.slice(calib1FileContent.indexOf('const calibrations = {') + 'const calibrations = '.length, calib1FileContent.indexOf(';\n\nfor (const filePath'));
  const calibs1 = eval('(' + calib1ObjStr + ')');

  const calibs2 = loadBatchCalibs('scripts/apply_batch_51_100_calibrations.cjs');
  const calibs3 = loadBatchCalibs('scripts/apply_batch_101_150_calibrations.cjs');
  const calibs4 = loadBatchCalibs('scripts/apply_batch_151_200_calibrations.cjs');
  const calibs5 = loadBatchCalibs('scripts/apply_batch_201_250_calibrations.cjs');
  const calibs6 = loadBatchCalibs('scripts/apply_batch_251_300_calibrations.cjs');
  const calibs7 = loadBatchCalibs('scripts/apply_batch_301_350_calibrations.cjs');
  const calibs8 = loadBatchCalibs('scripts/apply_batch_351_400_calibrations.cjs');
  const calibs9 = loadBatchCalibs('scripts/apply_batch_401_450_calibrations.cjs');
  const calibs10 = loadBatchCalibs('scripts/apply_batch_451_500_calibrations.cjs');
  const calibs11 = loadBatchCalibs('scripts/apply_batch_501_550_calibrations.cjs');

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

  // Merge batch 51-100, 101-150, 151-200, 201-250, 251-300, 301-350, 351-400, 401-450, 451-500, 501-550 calibrations into fsMap
  for (const cal of [...calibs2, ...calibs3, ...calibs4, ...calibs5, ...calibs6, ...calibs7, ...calibs8, ...calibs9, ...calibs10, ...calibs11]) {
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

  console.log(`   Merged Batch 1-50, 51-100, 101-150, 151-200, 201-250, 251-300, 301-350 calibrations into Firestore updates.`);

  // 2. Prune redundant legacy duplicate fr/vi entries to preserve plenty of headroom (< 1024 KB)
  let pruned = 0;
  const allCalibIds = new Set([
    ...Object.keys(calibs1),
    ...calibs2.map(c => String(c.id)),
    ...calibs3.map(c => String(c.id)),
    ...calibs4.map(c => String(c.id)),
    ...calibs5.map(c => String(c.id)),
    ...calibs6.map(c => String(c.id)),
    ...calibs7.map(c => String(c.id))
  ]);

  for (const [idStr, entry] of Object.entries(fsMap)) {
    const localW = wordsMap.get(Number(idStr));
    if (!localW) continue;
    if (allCalibIds.has(idStr)) continue;

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
