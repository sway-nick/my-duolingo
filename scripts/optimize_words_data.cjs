const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WORDS_PATH = path.join(ROOT, 'frontend', 'assets', 'data', 'words.json');
const WORDS_BASE_PATH = path.join(ROOT, 'frontend', 'assets', 'data', 'words_base.json');
const WORDS_LANG_DIR = path.join(ROOT, 'frontend', 'assets', 'data', 'words_lang');
const LOCALES_PATH = path.join(ROOT, 'frontend', 'config', 'locales.js');

function getSupportedLocaleCodes() {
  const src = fs.readFileSync(LOCALES_PATH, 'utf8');
  const match = src.match(/SUPPORTED_LOCALES\s*=\s*\[([\s\S]*?)\];/);
  if (!match) {
    throw new Error('Could not parse SUPPORTED_LOCALES from frontend/config/locales.js');
  }
  const codes = [];
  const re = /code:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    codes.push(m[1]);
  }
  if (codes.length !== 36 || codes.includes('mt') || codes.includes('ga')) {
    throw new Error(`Invalid locale set from locales.js: expected 36 without mt/ga, got ${codes.length}`);
  }
  return codes;
}

function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing === content) return false;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function optimizeWordsData() {
  if (!fs.existsSync(WORDS_PATH)) {
    console.error('words.json not found at', WORDS_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(WORDS_PATH, 'utf8');
  if (raw.includes('\ufffd')) {
    throw new Error('Corrupted UTF-8 replacement character (U+FFFD) found in words.json');
  }
  const words = JSON.parse(raw);
  const localeCodes = getSupportedLocaleCodes();

  const cleanedFull = [];

  for (const w of words) {
    const fullObj = {
      id: w.id,
      word: w.word,
      translation: w.translation || '',
    };
    if (w.transcription) fullObj.transcription = w.transcription;
    if (w.level) fullObj.level = w.level;
    if (w.category) fullObj.category = w.category;
    if (w.notes) fullObj.notes = w.notes;

    if (w.translations && typeof w.translations === 'object') {
      const cleanTrans = {};
      for (const [lang, val] of Object.entries(w.translations)) {
        if (!val) continue;
        // Deduplicate translations.ru when identical to root w.translation
        if (lang === 'ru' && val === fullObj.translation) continue;
        cleanTrans[lang] = val;
      }
      if (Object.keys(cleanTrans).length > 0) {
        fullObj.translations = cleanTrans;
      }
    }

    if (w.all_notes && typeof w.all_notes === 'object') {
      const cleanNotes = {};
      for (const [lang, val] of Object.entries(w.all_notes)) {
        if (!val) continue;
        // Deduplicate all_notes.ru when identical to root w.notes
        if (lang === 'ru' && val === fullObj.notes) continue;
        cleanNotes[lang] = val;
      }
      if (Object.keys(cleanNotes).length > 0) {
        fullObj.all_notes = cleanNotes;
      }
    }

    cleanedFull.push(fullObj);
  }

  const fullMinified = JSON.stringify(cleanedFull);
  if (fullMinified !== raw) {
    fs.writeFileSync(WORDS_PATH, fullMinified, 'utf8');
  }

  // Generate compact words_base.json
  const baseList = cleanedFull.map((w) => {
    const b = { i: w.id, w: w.word };
    if (w.transcription) b.p = w.transcription;
    if (w.level) b.l = w.level;
    if (w.category) b.c = w.category;
    return b;
  });
  const baseMinified = JSON.stringify(baseList);
  writeIfChanged(WORDS_BASE_PATH, baseMinified);

  // Generate per-locale shards in frontend/assets/data/words_lang/<code>.json
  if (!fs.existsSync(WORDS_LANG_DIR)) {
    fs.mkdirSync(WORDS_LANG_DIR, { recursive: true });
  }
  const localeSet = new Set(localeCodes);
  for (const entry of fs.readdirSync(WORDS_LANG_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      const code = entry.name.slice(0, -5);
      if (!localeSet.has(code)) {
        fs.unlinkSync(path.join(WORDS_LANG_DIR, entry.name));
        console.log(`[optimize_words_data] Removed stale shard: ${entry.name}`);
      }
    }
  }

  let totalLangBytes = 0;
  let updatedShards = 0;
  for (const code of localeCodes) {
    const langMap = {};
    for (const w of cleanedFull) {
      let trans = '';
      let note = '';
      if (code === 'ru') {
        trans = w.translation || '';
        note = w.notes || '';
      } else if (code === 'en') {
        trans = (w.translations && w.translations.en) || w.translation || '';
        note = (w.all_notes && w.all_notes.en) || '';
      } else {
        trans = (w.translations && w.translations[code]) || w.translation || '';
        note = (w.all_notes && w.all_notes[code]) || '';
      }
      langMap[w.id] = note ? [trans, note] : trans;
    }
    const langMinified = JSON.stringify(langMap);
    totalLangBytes += Buffer.byteLength(langMinified);
    const shardPath = path.join(WORDS_LANG_DIR, `${code}.json`);
    if (writeIfChanged(shardPath, langMinified)) {
      updatedShards++;
    }
  }

  const fullBytes = Buffer.byteLength(fullMinified);
  const baseBytes = Buffer.byteLength(baseMinified);
  const avgLangKiB = totalLangBytes / localeCodes.length / 1024;
  console.log(
    `[optimize_words_data] Done: words.json=${(fullBytes / 1024 / 1024).toFixed(2)} MiB (${fullBytes} bytes), words_base.json=${(baseBytes / 1024).toFixed(1)} KiB (${baseBytes} bytes), words_lang (${localeCodes.length} locales)=${(totalLangBytes / 1024 / 1024).toFixed(2)} MiB total (avg ${avgLangKiB.toFixed(1)} KiB/locale, ${updatedShards} updated)`
  );
}

if (require.main === module) {
  optimizeWordsData();
}

module.exports = { optimizeWordsData };
