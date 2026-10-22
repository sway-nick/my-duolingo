const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WORDS_PATH = path.join(ROOT, 'frontend', 'assets', 'data', 'words.json');

function optimizeWordsData() {
  if (!fs.existsSync(WORDS_PATH)) {
    console.error('words.json not found at', WORDS_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(WORDS_PATH, 'utf8');
  const words = JSON.parse(raw);

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
  fs.writeFileSync(WORDS_PATH, fullMinified, 'utf8');

  console.log(
    `[optimize_words_data] Done: words.json=${(Buffer.byteLength(fullMinified) / 1024 / 1024).toFixed(2)} MiB (${Buffer.byteLength(fullMinified)} bytes)`
  );
}

if (require.main === module) {
  optimizeWordsData();
}

module.exports = { optimizeWordsData };
