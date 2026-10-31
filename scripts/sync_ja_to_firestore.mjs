import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const WORDS_JSON_FILES = [
  path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'docs', 'assets', 'data', 'words.json')
];

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

const MANUAL_OVERRIDES_JA = {
  1505: 'ポンド',
  1615: 'よく、上手に、ええと',
  3745: '～かどうか、いずれにせよ',
  4005: '〜の上に、〜で、オンにして',
  4456: '幅',
  4661: '違反、犯罪、攻撃',
  4787: '間接的な',
  5808: '激しく非難する、怒りを爆発させる',
  6766: 'うっかり忘れていました'
};

const WORD_4661_FIXES = {
  translation: 'правонарушение, преступление, обида',
  uk: 'правопорушення, злочин, образа',
  de: 'Straftat, Vergehen, Beleidigung',
  fr: 'infraction, délit, offense',
  pl: 'wykroczenie, przestępstwo, obraza',
  it: 'reato, infrazione, offesa',
  ro: 'infracțiune, delict, ofensă',
  bg: 'правонарушение, престъпление, обида',
  cs: 'přestupek, trestný čin, urážka',
  sk: 'priestupok, trestný čin, urážka',
  hu: 'szabálysértés, bűncselekmény, sértés',
  el: 'αδίκημα, παράβαση, προσβολή',
  sl: 'prekršek, kaznivo dejanje, žalitev',
  et: 'õigusrikkumine, süütegu, solvang',
  lt: 'nusižengimas, teisės pažeidimas, įžeidimas',
  da: 'overtrædelse, lovovertrædelse, fornærmelse',
  fi: 'rikos, rikkomus, loukkaus',
  sv: 'brott, förseelse, förolämpning',
  hr: 'prekršaj, kazneno djelo, uvreda',
  lv: 'pārkāpums, noziedzīgs nodarījums, aizskārums',
  ar: 'جريمة، مخالفة، إساءة',
  vi: 'tội phạm, vi phạm, xúc phạm',
  th: 'การกระทำผิด, ความผิด, การล่วงเกิน',
  ko: '위반, 범죄, 모욕',
  ja: '違反、犯罪、攻撃',
  kk: 'құқық бұзушылық, қылмыс, реніш'
};

function cleanJapanese(id, word, originalJa) {
  if (MANUAL_OVERRIDES_JA[id]) {
    return MANUAL_OVERRIDES_JA[id];
  }
  if (!originalJa) return originalJa;

  let cleaned = originalJa.trim();
  cleaned = cleaned.replace(/[,;、]+$/, '').trim();

  const parts = cleaned.split(/[,、]/).map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const uniqueParts = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join('、');
}

async function run() {
  console.log('🚀 Starting Japanese (ja) Vocabulary OTA Synchronization...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  let modifiedCount = 0;
  const jaUpdates = {};

  for (const w of words) {
    const origJa = w.translations?.ja || '';
    const newJa = cleanJapanese(w.id, w.word, origJa);
    if (origJa !== newJa) {
      modifiedCount++;
      w.translations = w.translations || {};
      w.translations.ja = newJa;
      jaUpdates[String(w.id)] = {
        id: w.id,
        word: w.word,
        ja: newJa
      };
    }

    // Fix word 4661 across all affected languages
    if (w.id === 4661) {
      w.translation = WORD_4661_FIXES.translation;
      for (const [lang, val] of Object.entries(WORD_4661_FIXES)) {
        if (lang !== 'translation') {
          w.translations[lang] = val;
        }
      }
    }
  }

  console.log(`1. Total Japanese words modified: ${modifiedCount}`);
  console.log('   Applied global multi-language fix for word 4661 ("offence").');

  // Safety check: ensure 0 corrupted UTF-8 replacement characters
  const jsonStr = JSON.stringify(words);
  if (jsonStr.includes('\ufffd')) {
    throw new Error('❌ Detected U+FFFD replacement characters in words.json!');
  }

  // 2. Save to all words.json paths
  WORDS_JSON_FILES.forEach(filePath => {
    fs.writeFileSync(filePath, jsonStr, 'utf8');
    console.log(`   Saved ${filePath}`);
  });

  // 3. Update Cloud Firestore shared/vocabulary_updates
  console.log('\n2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  let jaMerged = 0;
  for (const [id, update] of Object.entries(jaUpdates)) {
    if (!fsMap[id]) {
      fsMap[id] = {
        id: update.id,
        word: update.word,
        translations: { ja: update.ja }
      };
    } else {
      if (!fsMap[id].translations) fsMap[id].translations = {};
      fsMap[id].translations.ja = update.ja;
    }
    jaMerged++;
  }

  // Also merge word 4661 fixes into Firestore map
  if (!fsMap['4661']) {
    fsMap['4661'] = { id: 4661, word: 'offence', translation: WORD_4661_FIXES.translation, translations: {} };
  } else {
    fsMap['4661'].translation = WORD_4661_FIXES.translation;
    if (!fsMap['4661'].translations) fsMap['4661'].translations = {};
  }
  for (const [lang, val] of Object.entries(WORD_4661_FIXES)) {
    if (lang !== 'translation') {
      fsMap['4661'].translations[lang] = val;
    }
  }

  console.log(`   Merged Japanese translations for ${jaMerged} words into Firestore updates.`);

  const updatedPayloadStr = JSON.stringify(fsMap);
  const payloadBytes = Buffer.byteLength(updatedPayloadStr, 'utf8');
  console.log(`\n3. Firestore payload summary:`);
  console.log(`   - Total entries in Firestore: ${Object.keys(fsMap).length}`);
  console.log(`   - Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);

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
    const errText = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status} - ${errText}`);
  }
  console.log('   ✅ Firestore document updated successfully (OTA published)!');

  // 6. Verify Firestore document
  console.log('\n6. Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  console.log(`   Verified ID 37 ("train"): ja="${verifyMap['37']?.translations?.ja}"`);
  console.log(`   Verified ID 4005 ("on"): ja="${verifyMap['4005']?.translations?.ja}"`);
  console.log(`   Verified ID 4661 ("offence"): ja="${verifyMap['4661']?.translations?.ja}", ru="${verifyMap['4661']?.translation}"`);
  console.log(`   Verified ID 4787 ("indirect"): ja="${verifyMap['4787']?.translations?.ja}"`);

  console.log('\n🎉 JAPANESE OTA LOCALIZATION FIX APPLIED AND PUBLISHED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during sync:', err);
  process.exit(1);
});
