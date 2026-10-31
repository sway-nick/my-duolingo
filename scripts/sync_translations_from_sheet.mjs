import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyPtFixesToWordsArray } from './apply_pt_br_fixes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WORDS_JSON_PATH = path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json');
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary';

// Standard RFC 4180 CSV parser
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}

async function run() {
  console.log('📥 Fetching vocabulary from Google Sheets...');
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const csvText = await res.text();

  console.log('🔄 Parsing CSV data...');
  const rows = parseCSV(csvText);
  if (rows.length < 2) throw new Error('Sheet is empty or invalid format');

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  console.log(`✅ Total rows in sheet: ${rows.length - 1}`);

  const TARGET_LANGS = [
    'ru', 'uk', 'de', 'es', 'fr', 'pl', 'it', 'tr',
    'pt', 'ro', 'bg', 'cs', 'sk', 'hu', 'el', 'sl',
    'et', 'lt', 'da', 'fi', 'sv', 'hr', 'lv', 'zh',
    'hi', 'bn', 'ar', 'fa', 'ur', 'id', 'vi', 'th', 'ko', 'ja', 'kk'
  ];

  const colIndices = {};
  TARGET_LANGS.forEach(lang => {
    let idx = headers.indexOf('translation_' + lang);
    if (idx < 0 && lang === 'ru') {
      idx = headers.indexOf('translation');
      if (idx < 0) idx = headers.indexOf('translation_ru');
    }
    if (idx >= 0) colIndices[lang] = idx;
  });

  const notesColIndices = {};
  TARGET_LANGS.forEach(lang => {
    let idx = headers.indexOf('notes_' + lang);
    if (idx < 0 && lang === 'ru') {
      idx = headers.indexOf('notes');
      if (idx < 0) idx = headers.indexOf('notes_ru');
    }
    if (idx >= 0) notesColIndices[lang] = idx;
  });

  const idCol = headers.indexOf('id');
  const wordCol = headers.indexOf('word');
  const transIpaCol = headers.indexOf('transcription_ipa') >= 0 ? headers.indexOf('transcription_ipa') : headers.indexOf('transcription');
  const catCol = headers.indexOf('category');
  const lvlCol = headers.indexOf('level');
  const zipfCol = headers.findIndex(h => h.includes('zipf'));

  console.log('Found translation columns:', Object.keys(colIndices));

  // Load existing local words.json
  const existingWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const wordMap = new Map();
  existingWords.forEach((w, index) => {
    if (w.id !== undefined && w.id !== '') {
      wordMap.set('id:' + String(w.id), w);
    }
    if (w.word) {
      wordMap.set('word:' + String(w.word).trim().toLowerCase(), w);
    }
  });

  let updatedCount = 0;
  let newlyAddedCount = 0;
  const finalWords = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rawWord = wordCol >= 0 ? String(row[wordCol] || '').trim() : '';
    if (!rawWord) continue;

    const rawId = idCol >= 0 ? String(row[idCol] || '').trim() : '';
    const cleanWordKey = rawWord.toLowerCase();

    let targetWordObj = (rawId ? wordMap.get('id:' + rawId) : null) || wordMap.get('word:' + cleanWordKey);

    if (!targetWordObj) {
      targetWordObj = {
        id: rawId ? (isNaN(Number(rawId)) ? rawId : Number(rawId)) : r,
        word: rawWord,
        transcription: transIpaCol >= 0 ? String(row[transIpaCol] || '').trim() : '',
        translation: colIndices['ru'] !== undefined ? String(row[colIndices['ru']] || '').trim() : '',
        translations: {},
        category: catCol >= 0 ? String(row[catCol] || 'Elementary').trim() : 'Elementary',
        level: lvlCol >= 0 ? String(row[lvlCol] || '').trim() : '',
        notes: notesColIndices['ru'] !== undefined ? String(row[notesColIndices['ru']] || '').trim() : '',
        all_notes: {},
        zipf: zipfCol >= 0 ? (parseFloat(row[zipfCol]) || 3.5) : 3.5
      };
      newlyAddedCount++;
    }

    if (!targetWordObj.translations) targetWordObj.translations = {};
    if (!targetWordObj.all_notes) targetWordObj.all_notes = {};

    let hasChange = false;
    if (rawWord && targetWordObj.word !== rawWord) {
      targetWordObj.word = rawWord;
      hasChange = true;
    }
    TARGET_LANGS.forEach(lang => {
      const idx = colIndices[lang];
      if (idx !== undefined && row[idx]) {
        const val = String(row[idx]).trim();
        if (val && targetWordObj.translations[lang] !== val) {
          targetWordObj.translations[lang] = val;
          hasChange = true;
        }
      }
      const nIdx = notesColIndices[lang];
      if (nIdx !== undefined && row[nIdx]) {
        const nVal = String(row[nIdx]).trim();
        if (nVal && targetWordObj.all_notes[lang] !== nVal) {
          targetWordObj.all_notes[lang] = nVal;
        }
      }
    });

    if (targetWordObj.translations) {
      delete targetWordObj.translations.ga;
      delete targetWordObj.translations.mt;
    }
    if (targetWordObj.all_notes) {
      delete targetWordObj.all_notes.ga;
      delete targetWordObj.all_notes.mt;
    }

    if (hasChange) updatedCount++;
    finalWords.push(targetWordObj);
  }

  console.log(`📊 Result:`);
  console.log(`   - Existing words updated: ${updatedCount}`);
  console.log(`   - New words added:        ${newlyAddedCount}`);
  console.log(`   - Total words in dataset: ${finalWords.length}`);

  const ptFixed = applyPtFixesToWordsArray(finalWords);
  console.log(`   - PT-BR curated fixes:    ${ptFixed}`);

  // Safety check: ensure 0 corrupted UTF-8 replacement characters
  const jsonOutput = JSON.stringify(finalWords, null, 2);
  if (jsonOutput.includes('\ufffd')) {
    throw new Error('❌ Detected U+FFFD replacement characters in output!');
  }

  fs.writeFileSync(WORDS_JSON_PATH, jsonOutput, 'utf8');
  console.log(`💾 Successfully updated ${WORDS_JSON_PATH}!`);

  // Verify sample
  const sample = existingWords.find(w => w.word === 'the' || w.word === 'interested in');
  console.log('Sample translations for "' + sample.word + '":', Object.keys(sample.translations));
  console.log('Sample hi:', sample.translations.hi);
  console.log('Sample ar:', sample.translations.ar);
  console.log('Sample ja:', sample.translations.ja);
}

run().catch(console.error);
