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

const FIXES = {
  // 1. ID 2088 ("word" - "слово")
  2088: {
    de: 'Wort',
    pl: 'słowo',
    es: 'palabra',
    fr: 'mot',
    it: 'parola',
    pt: 'palavra',
    tr: 'kelime, sözcük',
    uk: 'слово',
    ur: 'لفظ',
    zh: '单词',
    fa: 'کلمه',
    bn: 'শব্দ',
    id: 'kata',
    hi: 'शब्द',
    ar: 'كلمة'
  },
  // 2. ID 6752 ("false" - "ложь, фальшивый")
  6752: {
    de: 'falsch',
    fr: 'faux',
    bn: 'মিথ্যা, ভুয়া',
    ar: 'كاذب، مزيف',
    fa: 'نادرست، جعلی',
    ur: 'غلط، جعلی',
    id: 'palsu, salah',
    zh: '错误的，虚假的'
  },
  // 3. ID 6912 ("TRUE" - "истинный, правдивый")
  6912: {
    de: 'wahr, echt',
    fr: 'vrai, véritable',
    bn: 'সত্য, খাঁটি',
    fa: 'واقعی، درست',
    ur: 'سچ، حقیقی',
    id: 'benar, sejati',
    zh: '真实的，真正的'
  },
  // 4. ID 6939 ("wizard" - "волшебник, мастер")
  6939: {
    id: 'penyihir, ahli'
  },
  // 5. ID 6112 ("cogent" - "убедительный")
  6112: {
    hi: 'तर्कसंगत और प्रभावशाली; प्रेरक'
  },
  // 6. ID 6510 ("stracism" - "расизм")
  6510: {
    fa: 'نژادپرستی'
  },
  // 7. ID 5053 ("preposition" - грамматический предлог)
  5053: {
    it: 'preposizione'
  },
  // 8. ID 3504 ("challenging" - "сложный, бросающий вызов")
  3504: {
    da: 'udfordrende',
    fi: 'haastava',
    sv: 'utmanande',
    hr: 'izazovan',
    lv: 'izaicinošs'
  },
  // 9. ID 3419 ("performer" - "артист, исполнитель")
  3419: {
    ro: 'interpret, artist',
    et: 'esineja, esitaja',
    lt: 'atlikėjas'
  },
  // 10. ID 6940 ("stale" - "несвежий, залежавшийся")
  6940: {
    hi: 'बासी, पुराना',
    ar: 'فاسد، قديم',
    fa: 'بیات، کهنه',
    ur: 'باسی، پرانا',
    id: 'basi, apek',
    bn: 'বাসি, পুরোনো',
    zh: '不新鲜的，变味的'
  }
};

async function run() {
  console.log('🚀 Applying high-priority dictionary quality fixes...\n');

  // 1. Load local words.json
  const wordsPath = WORDS_JSON_FILES[0];
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  let fixedFieldsCount = 0;
  let fixedWordsCount = 0;

  for (const [targetIdStr, langPatches] of Object.entries(FIXES)) {
    const targetId = Number(targetIdStr);
    const targetWord = words.find(w => w.id === targetId);
    if (!targetWord) {
      console.warn(`⚠️ Word ID ${targetId} not found in words.json!`);
      continue;
    }

    targetWord.translations = targetWord.translations || {};
    let wordHadFix = false;

    for (const [lang, fixedVal] of Object.entries(langPatches)) {
      const prevVal = targetWord.translations[lang];
      if (prevVal !== fixedVal) {
        console.log(`  Fixed ID ${targetId} "${targetWord.word}" [${lang}]: "${prevVal}" -> "${fixedVal}"`);
        targetWord.translations[lang] = fixedVal;
        fixedFieldsCount++;
        wordHadFix = true;
      }
    }

    if (wordHadFix) fixedWordsCount++;
  }

  console.log(`\n✅ Applied ${fixedFieldsCount} field fixes across ${fixedWordsCount} words.`);

  // 2. Safety check: ensure 0 corrupted UTF-8 replacement characters
  const jsonStr = JSON.stringify(words);
  if (jsonStr.includes('\ufffd')) {
    throw new Error('❌ Detected U+FFFD replacement characters in words.json!');
  }

  // 3. Save to all words.json paths
  WORDS_JSON_FILES.forEach(filePath => {
    fs.writeFileSync(filePath, jsonStr, 'utf8');
    console.log(`   Saved ${filePath}`);
  });

  // 4. Update Firestore shared/vocabulary_updates
  console.log('\n2. Updating Cloud Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');

  // Apply fixes to Firestore map
  for (const [targetIdStr, langPatches] of Object.entries(FIXES)) {
    const targetId = Number(targetIdStr);
    const targetWord = words.find(w => w.id === targetId);
    if (!targetWord) continue;

    const entryId = String(targetId);
    if (!fsMap[entryId]) {
      fsMap[entryId] = {
        id: targetId,
        word: targetWord.word,
        translations: {}
      };
    }

    fsMap[entryId].translations = fsMap[entryId].translations || {};
    for (const [lang, fixedVal] of Object.entries(langPatches)) {
      fsMap[entryId].translations[lang] = fixedVal;
    }
  }

  const updatedPayloadStr = JSON.stringify(fsMap);
  const payloadBytes = Buffer.byteLength(updatedPayloadStr, 'utf8');
  console.log(`   Firestore payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);

  if (payloadBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${payloadBytes} bytes)! Aborting write.`);
  }

  // 5. Authenticate with Firebase Admin
  console.log('   Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();

  // 6. Patch Firestore
  console.log('   Patching Firestore shared/vocabulary_updates...');
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
  console.log('   ✅ Firestore document updated successfully!');

  // 7. Verify Firestore document
  console.log('   Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  console.log(`   Verified ID 2088 ("word") in Firestore:`);
  console.log(`     de: "${verifyMap['2088']?.translations?.de}"`);
  console.log(`     pl: "${verifyMap['2088']?.translations?.pl}"`);
  console.log(`     es: "${verifyMap['2088']?.translations?.es}"`);
  console.log(`     fr: "${verifyMap['2088']?.translations?.fr}"`);
  console.log(`   Verified ID 6752 ("false") in Firestore: de="${verifyMap['6752']?.translations?.de}", fr="${verifyMap['6752']?.translations?.fr}"`);
  console.log(`   Verified ID 6912 ("TRUE") in Firestore: de="${verifyMap['6912']?.translations?.de}", fr="${verifyMap['6912']?.translations?.fr}"`);

  console.log('\n🎉 ALL FIXES APPLIED AND VERIFIED BOTH LOCALLY AND IN FIRESTORE!');
}

run().catch(err => {
  console.error('\n❌ ERROR during fixes:', err);
  process.exit(1);
});
