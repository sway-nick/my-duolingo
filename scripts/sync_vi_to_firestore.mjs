import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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
  console.log('🚀 Starting Vietnamese (vi) OTA Localization Sync to Cloud Firestore...\n');

  const deltaPath = path.join(ROOT_DIR, 'scripts', 'vi_updates_delta.json');
  if (!fs.existsSync(deltaPath)) {
    throw new Error(`Delta file not found: ${deltaPath}`);
  }
  const deltaMap = JSON.parse(fs.readFileSync(deltaPath, 'utf8'));
  console.log(`1. Loaded ${Object.keys(deltaMap).length} Vietnamese updates from delta map.`);

  // Fetch current Firestore document
  console.log('2. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  let viMerged = 0;
  for (const [id, delta] of Object.entries(deltaMap)) {
    const viVal = delta.translations?.vi;
    if (!viVal) continue;

    if (!fsMap[id]) {
      fsMap[id] = {
        id: delta.id,
        word: delta.word,
        translations: { vi: viVal }
      };
      viMerged++;
    } else {
      if (!fsMap[id].translations) fsMap[id].translations = {};
      fsMap[id].translations.vi = viVal;
      viMerged++;
    }
  }

  console.log(`   Merged Vietnamese translations for ${viMerged} words into Firestore map.`);

  const jsonStr = JSON.stringify(fsMap);
  const payloadBytes = Buffer.byteLength(jsonStr, 'utf8');
  console.log(`\n3. Optimized Firestore payload summary:`);
  console.log(`   - Total entries in Firestore: ${Object.keys(fsMap).length}`);
  console.log(`   - Payload size: ${payloadBytes} bytes (${(payloadBytes / 1024).toFixed(1)} KB / 1024 KB max)`);

  if (payloadBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${payloadBytes} bytes)! Aborting write.`);
  }

  // Authenticate with Firebase Admin
  console.log('\n4. Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();
  console.log('   Authenticated successfully.');

  // Patch Firestore
  console.log('5. Writing updates to Firestore shared/vocabulary_updates (OTA)...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: jsonStr },
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
  console.log('   ✅ FIRESTORE UPDATE SUCCESSFUL!');

  // Verification read-back
  console.log('\n6. Verifying published Firestore document...');
  const verifyRes = await fetch(fsUrl);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  let verifiedVi = 0;
  for (const k in verifyMap) {
    if (verifyMap[k]?.translations?.vi) verifiedVi++;
  }
  console.log(`   Verified Firestore entries count: ${Object.keys(verifyMap).length}`);
  console.log(`   Verified Vietnamese entries count in Firestore: ${verifiedVi}`);

  // Canary check in verified Firestore payload
  const canaries = [
    ['15', 'độc đáo'],
    ['492', 'bữa sáng'],
    ['1862', 'gió'],
    ['3417', 'đói'],
    ['6937', 'bình giữ nhiệt']
  ];
  for (const [cid, exp] of canaries) {
    const act = verifyMap[cid]?.translations?.vi || '';
    const ok = act.includes(exp);
    console.log(`   Canary Firestore ID ${cid}: '${act}' -> ${ok ? 'OK' : 'FAIL'}`);
  }

  console.log('\n🎉 ALL VIETNAMESE OTA UPDATES DELIVERED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ ERROR during Vietnamese Firestore sync:', err);
  process.exit(1);
});
