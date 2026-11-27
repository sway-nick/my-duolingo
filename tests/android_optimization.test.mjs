import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { SUPPORTED_LOCALE_CODES } from '../frontend/config/locales.js';

const ROOT = path.resolve('.');
const DATA_DIR = path.join(ROOT, 'frontend', 'assets', 'data');
const WORDS_PATH = path.join(DATA_DIR, 'words.json');
const WORDS_BASE_PATH = path.join(DATA_DIR, 'words_base.json');
const WORDS_LANG_DIR = path.join(DATA_DIR, 'words_lang');
const GRADLE_MAIN_PATH = path.join(ROOT, 'android', 'app', 'build.gradle');
const GRADLE_MIRROR_PATH = path.resolve('c:/projects/my-duolingo-android/android/app/build.gradle');

function reconstructWord(baseItem, shardLang, langMap) {
  const entry = langMap[baseItem.i];
  const trans = Array.isArray(entry) ? (entry[0] || '') : (entry || '');
  const note = Array.isArray(entry) ? (entry[1] || '') : '';
  return {
    id: baseItem.i,
    word: baseItem.w,
    translation: trans,
    transcription: baseItem.p || '',
    level: baseItem.l || '',
    category: baseItem.c || '',
    ...(shardLang !== 'ru' && shardLang !== 'en' ? { translations: { [shardLang]: trans } } : {}),
    ...(note ? { notes: note, ...(shardLang !== 'ru' ? { all_notes: { [shardLang]: note } } : {}) } : {}),
  };
}

test('Android Optimization: words_base.json matches words.json length and has 0 U+FFFD chars', () => {
  assert.ok(fs.existsSync(WORDS_PATH), 'words.json must exist');
  assert.ok(fs.existsSync(WORDS_BASE_PATH), 'words_base.json must exist');

  const rawWords = fs.readFileSync(WORDS_PATH, 'utf8');
  const rawBase = fs.readFileSync(WORDS_BASE_PATH, 'utf8');
  assert.equal(rawWords.includes('\ufffd'), false, 'words.json must have 0 U+FFFD chars');
  assert.equal(rawBase.includes('\ufffd'), false, 'words_base.json must have 0 U+FFFD chars');

  const words = JSON.parse(rawWords);
  const base = JSON.parse(rawBase);
  assert.equal(base.length, words.length, `words_base.json length (${base.length}) must equal words.json (${words.length})`);

  for (let i = 0; i < words.length; i++) {
    assert.equal(base[i].i, words[i].id, `id mismatch at index ${i}`);
    assert.equal(base[i].w, words[i].word, `word mismatch at index ${i}`);
    assert.equal(base[i].p || '', words[i].transcription || '', `transcription mismatch at index ${i}`);
    assert.equal(base[i].l || '', words[i].level || '', `level mismatch at index ${i}`);
    assert.equal(base[i].c || '', words[i].category || '', `category mismatch at index ${i}`);
  }
});

test('Android Optimization: words_lang/ contains exactly the 36 SUPPORTED_LOCALE_CODES shards with 0 U+FFFD chars', () => {
  assert.equal(SUPPORTED_LOCALE_CODES.length, 36, 'SUPPORTED_LOCALE_CODES must have exactly 36 locales');
  assert.equal(SUPPORTED_LOCALE_CODES.includes('mt'), false, 'mt must not be supported');
  assert.equal(SUPPORTED_LOCALE_CODES.includes('ga'), false, 'ga must not be supported');
  assert.ok(fs.existsSync(WORDS_LANG_DIR), 'words_lang directory must exist');

  const files = fs.readdirSync(WORDS_LANG_DIR).filter((f) => f.endsWith('.json')).sort();
  const expectedFiles = SUPPORTED_LOCALE_CODES.map((c) => `${c}.json`).sort();

  assert.equal(files.length, 36, `Expected 36 shard files, found ${files.length}`);
  assert.equal(files.includes('mt.json'), false, 'mt.json must not exist');
  assert.equal(files.includes('ga.json'), false, 'ga.json must not exist');
  assert.deepEqual(files, expectedFiles, 'words_lang files must match SUPPORTED_LOCALE_CODES exactly');

  for (const f of files) {
    const raw = fs.readFileSync(path.join(WORDS_LANG_DIR, f), 'utf8');
    assert.equal(raw.includes('\ufffd'), false, `${f} must have 0 U+FFFD chars`);
  }
});

test('Android Optimization: translation and notes parity between reconstructed shards and words.json', () => {
  const words = JSON.parse(fs.readFileSync(WORDS_PATH, 'utf8'));
  const base = JSON.parse(fs.readFileSync(WORDS_BASE_PATH, 'utf8'));

  const spotLocales = ['ru', 'en', 'de', 'es', 'pt', 'hi', 'zh', 'ur', 'fa', 'kk'];
  const targetWords = new Set(['one', 'five', 'first', 'interested in']);
  // Also include the 5 most recent words at the end of words.json
  for (const w of words.slice(-5)) {
    targetWords.add(w.word);
  }

  for (const lang of spotLocales) {
    const langMap = JSON.parse(fs.readFileSync(path.join(WORDS_LANG_DIR, `${lang}.json`), 'utf8'));
    let checkedTargets = 0;

    for (let i = 0; i < words.length; i++) {
      const orig = words[i];
      const rec = reconstructWord(base[i], lang, langMap);

      const expectedTrans =
        lang === 'ru'
          ? (orig.translation || '')
          : lang === 'en'
            ? ((orig.translations && orig.translations.en) || orig.translation || '')
            : ((orig.translations && orig.translations[lang]) || orig.translation || '');

      const expectedNote =
        lang === 'ru'
          ? (orig.notes || '')
          : ((orig.all_notes && orig.all_notes[lang]) || '');

      assert.equal(rec.translation, expectedTrans, `translation mismatch for "${orig.word}" in ${lang}`);
      if (lang !== 'ru' && lang !== 'en') {
        assert.equal(rec.translations?.[lang], expectedTrans, `translations[${lang}] mismatch for "${orig.word}"`);
      } else {
        assert.equal(rec.translations, undefined, `base lang ${lang} must not embed translations map`);
      }

      if (expectedNote) {
        assert.equal(rec.notes, expectedNote, `notes mismatch for "${orig.word}" in ${lang}`);
        if (lang !== 'ru') {
          assert.equal(rec.all_notes?.[lang], expectedNote, `all_notes[${lang}] mismatch for "${orig.word}"`);
        }
      } else {
        assert.equal(rec.notes, undefined, `unexpected note for "${orig.word}" in ${lang}`);
      }

      if (targetWords.has(orig.word)) {
        checkedTargets++;
      }
    }

    assert.ok(checkedTargets >= 8, `Expected to spot-check numerals and recent words in ${lang}, checked ${checkedTargets}`);
  }
});

test('Android Optimization: both build.gradle files exclude words.json in ignoreAssetsPattern and match each other', () => {
  assert.ok(fs.existsSync(GRADLE_MAIN_PATH), 'android/app/build.gradle must exist');
  assert.ok(fs.existsSync(GRADLE_MIRROR_PATH), 'my-duolingo-android/android/app/build.gradle must exist');

  const mainGradle = fs.readFileSync(GRADLE_MAIN_PATH, 'utf8');
  const mirrorGradle = fs.readFileSync(GRADLE_MIRROR_PATH, 'utf8');

  const patternMatch = mainGradle.match(/ignoreAssetsPattern\s*=\s*'([^']+)'/);
  assert.ok(patternMatch, 'ignoreAssetsPattern must be present in android/app/build.gradle');
  assert.ok(patternMatch[1].includes(':!words.json'), 'ignoreAssetsPattern must include :!words.json');
  assert.equal(mainGradle, mirrorGradle, 'android/app/build.gradle must match c:/projects/my-duolingo-android/android/app/build.gradle');
});

test('Android Optimization: api.js uses sharded dictionary loader, preserves fallback, and uses .webp avatars', () => {
  const apiSrc = fs.readFileSync(path.join(ROOT, 'frontend', 'services', 'api.js'), 'utf8');
  assert.ok(apiSrc.includes('words_base.json'), 'api.js must fetch words_base.json');
  assert.ok(apiSrc.includes('words_lang/${shardLang}.json'), 'api.js must fetch words_lang/${shardLang}.json');
  assert.ok(apiSrc.includes('./assets/data/words.json'), 'api.js must preserve fallback to words.json');
  assert.equal(/avatar_\d+\.png/.test(apiSrc), false, 'BOT_PROFILES in api.js must use .webp instead of .png');
  assert.ok(/avatar_\d+\.webp/.test(apiSrc), 'BOT_PROFILES in api.js must reference .webp avatars');
});

test('Phase 2 Optimization: i18n_lang/ contains strictly 36 locale shards and i18n.js resolves all cleanly', async () => {
  const i18nJsPath = path.join(ROOT, 'frontend', 'services', 'i18n.js');
  const i18nDir = path.join(DATA_DIR, 'i18n_lang');
  assert.ok(fs.existsSync(i18nJsPath), 'i18n.js must exist');
  assert.ok(fs.existsSync(i18nDir), 'frontend/assets/data/i18n_lang must exist');

  const i18nSizeKB = fs.statSync(i18nJsPath).size / 1024;
  assert.ok(i18nSizeKB < 120, `i18n.js must be slimmed below 120 KB (actual: ${i18nSizeKB.toFixed(1)} KB)`);

  const files = fs.readdirSync(i18nDir).filter((f) => f.endsWith('.json')).sort();
  const expectedFiles = SUPPORTED_LOCALE_CODES.map((c) => `${c}.json`).sort();
  assert.equal(files.length, 36, `i18n_lang must have strictly 36 locale files (found ${files.length})`);
  assert.equal(files.includes('mt.json'), false, 'mt.json must not exist');
  assert.equal(files.includes('ga.json'), false, 'ga.json must not exist');
  assert.deepEqual(files, expectedFiles, 'i18n_lang files must match SUPPORTED_LOCALE_CODES');

  for (const f of files) {
    const raw = fs.readFileSync(path.join(i18nDir, f), 'utf8');
    assert.equal(raw.includes('\ufffd'), false, `${f} must have 0 U+FFFD chars`);
    const parsed = JSON.parse(raw);
    assert.ok(parsed.training && parsed.leaderboard && parsed.fav_practice_btn, `${f} must contain core UI keys`);
  }

  const store = new Map();
  const prevStorage = globalThis.localStorage;
  globalThis.localStorage = {
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] ?? null,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
  };
  try {
    const { t, setInterfaceLanguage, ensureLocaleLoaded, getInterfaceLanguage } = await import('../frontend/services/i18n.js');
    const checks = ['ru', 'en', 'uk', 'de', 'es', 'pt', 'pt-br', 'es-mx', 'hi', 'zh', 'ur', 'fa', 'kk'];
    for (const loc of checks) {
      await ensureLocaleLoaded(loc);
      setInterfaceLanguage(loc);
      const active = getInterfaceLanguage();
      assert.ok(SUPPORTED_LOCALE_CODES.includes(active), `Resolved language ${active} from ${loc} must be supported`);
      assert.ok(t('leaderboard').length > 0, `t('leaderboard') non-empty for ${loc}`);
      assert.ok(t('fav_practice_btn').length > 0, `t('fav_practice_btn') non-empty for ${loc}`);
      assert.ok(t('training').length > 0, `t('training') non-empty for ${loc}`);
    }
  } finally {
    if (prevStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = prevStorage;
  }
});

test('Phase 2 Optimization: compressed MP4 videos are valid, synced, and under 1.8 MB total', () => {
  const videoFiles = [
    'cat1.mp4', 'cat2.mp4', 'cat3.mp4', 'cat4.mp4', 'cat5.mp4', 'cat6.mp4',
    'meme_monday_look.mp4', 'meme_monday_what.mp4',
  ];
  const srcVideoDir = path.join(ROOT, 'frontend', 'assets', 'video');
  const androidVideoDir = path.resolve('c:/projects/my-duolingo-android/frontend/assets/video');
  let totalBytes = 0;

  for (const file of videoFiles) {
    const srcFile = path.join(srcVideoDir, file);
    const andFile = path.join(androidVideoDir, file);
    assert.ok(fs.existsSync(srcFile), `Missing compressed video ${srcFile}`);
    assert.ok(fs.existsSync(andFile), `Missing Android video copy ${andFile}`);
    const buf = fs.readFileSync(srcFile);
    assert.ok(buf.length > 10000, `${file} must exceed 10 KB (actual: ${buf.length})`);
    assert.equal(buf.subarray(4, 8).toString('ascii'), 'ftyp', `${file} must have valid MP4 ftyp header`);
    assert.equal(buf.length, fs.statSync(andFile).size, `${file} must be synced byte-for-byte to Android`);
    totalBytes += buf.length;
  }
  assert.ok(totalBytes < 1.8 * 1024 * 1024, `Combined MP4 total (${(totalBytes / 1048576).toFixed(2)} MB) must be < 1.8 MB`);
});

test('Phase 2 Optimization: Android esbuild-minified JS files are valid ESM and preserve version tags', async () => {
  const { execFileSync } = await import('node:child_process');
  const androidFrontend = path.resolve('c:/projects/my-duolingo-android/frontend');
  const sourceFrontend = path.join(ROOT, 'frontend');
  if (!fs.existsSync(androidFrontend)) return;

  function collectJs(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory() && !['node_modules', '.git', 'audio', 'dist'].includes(e.name)) {
        collectJs(f, list);
      } else if (e.isFile() && e.name.endsWith('.js')) {
        list.push(f);
      }
    }
    return list;
  }

  const andFiles = collectJs(androidFrontend);
  const srcFiles = collectJs(sourceFrontend);
  assert.equal(andFiles.length, srcFiles.length, 'Android minified JS count must match source JS count');

  let andTotal = 0;
  let srcTotal = 0;
  for (const f of andFiles) {
    andTotal += fs.statSync(f).size;
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  }
  for (const f of srcFiles) srcTotal += fs.statSync(f).size;

  assert.ok(andTotal < srcTotal, `Minified Android JS (${andTotal}) must be smaller than source JS (${srcTotal})`);
  assert.ok(andTotal < 11.5 * 1024 * 1024, `Minified Android JS (${(andTotal / 1048576).toFixed(2)} MB) must be < 11.5 MB`);

  const andApi = fs.readFileSync(path.join(androidFrontend, 'services', 'api.js'), 'utf8');
  assert.ok(andApi.includes('?v=423.0'), 'Minified Android api.js must preserve ?v=423.0 module tags');
  const andI18n = fs.readFileSync(path.join(androidFrontend, 'services', 'i18n.js'), 'utf8');
  assert.ok(andI18n.includes('ensureLocaleLoaded'), 'Minified Android i18n.js must export ensureLocaleLoaded');

  // Verify source i18n.js remains readable / unminified
  const srcI18n = fs.readFileSync(path.join(sourceFrontend, 'services', 'i18n.js'), 'utf8');
  assert.ok(srcI18n.split('\n').length > 400, 'Source frontend/services/i18n.js must remain readable and unminified');
});
