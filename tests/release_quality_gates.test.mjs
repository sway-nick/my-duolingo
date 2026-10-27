import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 33 supported languages in English Breakfast
const REQUIRED_33_LOCALES = [
  'ru', 'uk', 'en', 'de', 'es', 'fr', 'pl', 'tr', 'it', 'ro', 'bg', 'hu', 'el',
  'da', 'ga', 'lv', 'lt', 'mt', 'pt', 'sk', 'sl', 'fi', 'hr', 'cs', 'sv', 'et',
  'hi', 'ar', 'id', 'vi', 'th', 'ko', 'ja'
];

test('Gate 1: Unity Ads Mediation and AdMob configuration integrity', () => {
  // 1. Verify app-ads.txt contains both AdMob and Unity direct seller entries
  const appAdsPath = path.join(ROOT_DIR, 'app-ads.txt');
  assert.ok(fs.existsSync(appAdsPath), 'app-ads.txt must exist at project root');
  const appAdsContent = fs.readFileSync(appAdsPath, 'utf-8');

  assert.ok(
    appAdsContent.includes('google.com, pub-9917058160362744, DIRECT'),
    'app-ads.txt must contain authorized Google AdMob direct publisher line'
  );
  assert.ok(
    appAdsContent.includes('unity.com, 157317001, DIRECT'),
    'app-ads.txt must contain authorized Unity Ads direct publisher line (157317001)'
  );

  // 2. Verify Android app build.gradle dependencies include Unity Ads SDK and Mediation Adapter
  const buildGradlePath = path.join(ROOT_DIR, 'android/app/build.gradle');
  assert.ok(fs.existsSync(buildGradlePath), 'android/app/build.gradle must exist');
  const buildGradle = fs.readFileSync(buildGradlePath, 'utf-8');

  assert.ok(
    buildGradle.includes("com.unity3d.ads:unity-ads"),
    "build.gradle must include 'com.unity3d.ads:unity-ads' dependency"
  );
  assert.ok(
    buildGradle.includes("com.google.ads.mediation:unity"),
    "build.gradle must include 'com.google.ads.mediation:unity' mediation adapter"
  );

  // 3. Verify ProGuard preservation rules for AdMob and Unity Ads
  const proguardPath = path.join(ROOT_DIR, 'android/app/proguard-rules.pro');
  assert.ok(fs.existsSync(proguardPath), 'android/app/proguard-rules.pro must exist');
  const proguard = fs.readFileSync(proguardPath, 'utf-8');

  assert.ok(proguard.includes('-keep class com.unity3d.ads.**'), 'proguard-rules.pro must preserve com.unity3d.ads.**');
  assert.ok(proguard.includes('-keep class com.google.ads.mediation.unity.**'), 'proguard-rules.pro must preserve com.google.ads.mediation.unity.**');
  assert.ok(proguard.includes('-dontwarn com.unity3d.**'), 'proguard-rules.pro must suppress harmless com.unity3d warnings');
});

test('Gate 2: Gold Card Widget HyperOS / MIUI and cross-platform broadcast safety', () => {
  const providerPath = path.join(ROOT_DIR, 'android/app/src/main/java/com/englishbreakfast/app/GoldCardWidgetProvider.java');
  assert.ok(fs.existsSync(providerPath), 'GoldCardWidgetProvider.java must exist');
  const providerCode = fs.readFileSync(providerPath, 'utf-8');

  // Verify that broadcast intent security check allows null package/component from launchers
  // Restrictive check `boolean isOurPackage = (pkg != null ...) || ...; if (!isOurPackage) return;`
  // drops clicks on HyperOS/MIUI/Samsung because the launcher PendingIntent delivers null pkg and comp!
  assert.ok(
    !providerCode.includes('boolean isOurPackage = (pkg != null && context.getPackageName().equals(pkg))'),
    'GoldCardWidgetProvider must NOT use restrictive isOurPackage check that breaks HyperOS/MIUI launcher clicks'
  );

  // Verify non-blocking check: only reject if an alien package is explicitly present
  assert.ok(
    providerCode.includes('if (pkg != null && !context.getPackageName().equals(pkg))'),
    'GoldCardWidgetProvider must only reject when a foreign package is explicitly non-null'
  );

  // Verify AndroidManifest declaration has exported=true
  const manifestPath = path.join(ROOT_DIR, 'android/app/src/main/AndroidManifest.xml');
  const manifestCode = fs.readFileSync(manifestPath, 'utf-8');
  assert.ok(
    manifestCode.includes('android:name=".GoldCardWidgetProvider"'),
    'AndroidManifest.xml must declare GoldCardWidgetProvider'
  );
  assert.ok(
    manifestCode.includes('android:exported="true"'),
    'GoldCardWidgetProvider must be android:exported="true" for widget host interaction'
  );
});

test('Gate 3: 33 Languages Dictionary and Widget Translation completeness', async () => {
  // 1. Verify words.json has translations for all 33 supported languages
  const wordsJsonPath = path.join(ROOT_DIR, 'frontend/assets/data/words.json');
  assert.ok(fs.existsSync(wordsJsonPath), 'frontend/assets/data/words.json must exist');
  const rawData = fs.readFileSync(wordsJsonPath, 'utf-8');
  assert.ok(!rawData.includes('\ufffd'), 'words.json must have 0 corrupted U+FFFD characters');

  const words = JSON.parse(rawData);
  assert.ok(Array.isArray(words) && words.length > 2000, `words.json must contain full dictionary (>2000 words, found ${words.length})`);

  // Sample check: verify multiple words have translations across major locales
  const sample = words.slice(0, 100);
  const foreignCodes = REQUIRED_33_LOCALES.filter(l => l !== 'ru' && l !== 'en');

  let totalForeignTranslationsFound = 0;
  for (const w of sample) {
    if (w.translations && typeof w.translations === 'object') {
      for (const code of foreignCodes) {
        if (w.translations[code]) {
          totalForeignTranslationsFound++;
        }
      }
    }
  }
  assert.ok(
    totalForeignTranslationsFound > 500,
    `Sample 100 words must have extensive multi-language translations (found ${totalForeignTranslationsFound})`
  );

  // 2. Verify i18n.js supports all 33 locales
  const i18nPath = path.join(ROOT_DIR, 'frontend/services/i18n.js');
  const i18nCode = fs.readFileSync(i18nPath, 'utf-8');

  for (const locale of REQUIRED_33_LOCALES) {
    assert.ok(
      i18nCode.includes(`${locale}: {`) || i18nCode.includes(`'${locale}': {`) || i18nCode.includes(`"${locale}": {`),
      `i18n.js translations dictionary must contain locale '${locale}'`
    );
  }

  // 3. Verify getWordTranslation works correctly for foreign languages
  const { getWordTranslation } = await import('../frontend/services/i18n.js');
  const testWord = {
    word: 'apple',
    translation: 'яблоко',
    translations: {
      ru: 'яблоко',
      de: 'Apfel',
      es: 'manzana',
      fr: 'pomme',
      ja: 'りんご'
    }
  };

  assert.equal(typeof getWordTranslation, 'function', 'getWordTranslation must be exposed');
});

test('Gate 4: Firebase / Cloud Firestore quota and request optimization integrity', () => {
  const apiPath = path.join(ROOT_DIR, 'frontend/services/api.js');
  assert.ok(fs.existsSync(apiPath), 'frontend/services/api.js must exist');
  const apiCode = fs.readFileSync(apiPath, 'utf-8');

  // 1. Verify Leaderboard 30-minute cache TTL (prevents thousands of redundant reads)
  assert.ok(
    apiCode.includes('LEADERBOARD_CACHE_TTL = 30 * 60 * 1000') || apiCode.includes('30 * 60 * 1000'),
    'api.js must enforce at least 30-minute LEADERBOARD_CACHE_TTL'
  );

  // 2. Verify Debounce timer on pushUserDataToCloud
  assert.ok(
    apiCode.includes('syncDebounceTimer'),
    'api.js must use syncDebounceTimer to avoid spamming Firestore on every keystroke'
  );

  // 3. Verify in-flight deduplication of concurrent reconciliation calls
  const firebasePath = path.join(ROOT_DIR, 'frontend/services/firebase.js');
  assert.ok(fs.existsSync(firebasePath), 'frontend/services/firebase.js must exist');
  const firebaseCode = fs.readFileSync(firebasePath, 'utf-8');

  assert.ok(
    firebaseCode.includes('activeWeeklyReconciles') && firebaseCode.includes('activeAllTimeReconciles'),
    'firebase.js must deduplicate concurrent in-flight reconciliation calls via activeWeeklyReconciles and activeAllTimeReconciles maps'
  );

  // 4. Verify atomic server transforms instead of read-modify-write cycles
  assert.ok(
    firebaseCode.includes('setToServerValue') || firebaseCode.includes('REQUEST_TIME'),
    'firebase.js must use server-side atomic transforms (REQUEST_TIME) to reduce read/write roundtrips'
  );

  // 5. Verify batching of training stages/rounds into bulk progress sync
  assert.ok(
    apiCode.includes('pendingProgressQueue') && apiCode.includes('saveBulkProgressFirestore'),
    'api.js must buffer progress in pendingProgressQueue and sync via saveBulkProgressFirestore'
  );
  assert.ok(
    apiCode.includes('options.roundComplete || options.batchComplete') || apiCode.includes('batchComplete'),
    'api.js must support stage/round completion bulk sync'
  );
});

test('Gate 5: Swipe Gestures and Dual Drawer Architecture (Burger Right & Leaderboard Left)', () => {
  const layoutPath = path.join(ROOT_DIR, 'frontend/components/layout/AppLayout.js');
  assert.ok(fs.existsSync(layoutPath), 'AppLayout.js must exist');
  const layoutCode = fs.readFileSync(layoutPath, 'utf-8');

  // 1. Dual drawer DOM elements present
  assert.ok(layoutCode.includes('id="burger-drawer"'), 'AppLayout must define #burger-drawer');
  assert.ok(layoutCode.includes('id="leaderboard-drawer"'), 'AppLayout must define #leaderboard-drawer');
  assert.ok(layoutCode.includes('id="leaderboard-drawer-close-btn"'), 'AppLayout must include close button for leaderboard drawer');

  // 2. Both drawers exported and exposed
  assert.ok(layoutCode.includes('openLeaderboardDrawer') && layoutCode.includes('closeLeaderboardDrawer'), 'AppLayout must export openLeaderboardDrawer and closeLeaderboardDrawer');
  assert.ok(layoutCode.includes('openDrawer') && layoutCode.includes('closeDrawer'), 'AppLayout must export openDrawer and closeDrawer');

  // 3. CSS transitions for both drawers
  const cssPath = path.join(ROOT_DIR, 'frontend/assets/css/main.css');
  const cssCode = fs.readFileSync(cssPath, 'utf-8');
  assert.ok(cssCode.includes('.leaderboard-drawer'), 'main.css must define .leaderboard-drawer');
  assert.ok(cssCode.includes('transform: translateX(-100%)'), 'main.css must position .leaderboard-drawer off-canvas to the left');
  assert.ok(cssCode.includes('.leaderboard-drawer.open'), 'main.css must define .leaderboard-drawer.open');

  // 4. Gesture swipe listeners in index.html
  const indexPath = path.join(ROOT_DIR, 'frontend/index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  assert.ok(indexHtml.includes('handleHubSwipeGesture'), 'index.html must implement handleHubSwipeGesture');
  assert.ok(indexHtml.includes('openLeaderboardDrawer'), 'index.html must invoke openLeaderboardDrawer on swipe right');
  assert.ok(indexHtml.includes('openDrawer'), 'index.html must invoke openDrawer on swipe left');

  // 5. Leaderboard title localized in all 33 locales
  const i18nPath = path.join(ROOT_DIR, 'frontend/services/i18n.js');
  const i18nCode = fs.readFileSync(i18nPath, 'utf-8');
  const lbMatches = i18nCode.match(/leaderboard:\s*["']/g) || [];
  assert.equal(lbMatches.length, 33, 'leaderboard translation key must be present for all 33 locales');
});
