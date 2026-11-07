const fs = require('fs');
const path = require('path');

const wordsPath = path.resolve('frontend/assets/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

const batchFiles = [
  'apply_batch_2352_2401_calibrations.cjs',
  'apply_batch_2402_2451_calibrations.cjs',
  'apply_batch_2452_2501_calibrations.cjs',
  'apply_batch_2502_2551_calibrations.cjs',
  'apply_batch_2552_2601_calibrations.cjs',
  'apply_batch_2602_2651_calibrations.cjs',
  'apply_batch_2652_2701_calibrations.cjs',
  'apply_batch_2702_2751_calibrations.cjs',
  'apply_batch_2752_2801_calibrations.cjs',
  'apply_batch_2802_2851_calibrations.cjs'
];

let totalWordsUpdated = 0;
let totalFieldsUpdated = 0;
const wordsMap = new Map(words.map(w => [w.id, w]));

for (const f of batchFiles) {
  const filePath = path.resolve('scripts', f);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Batch file missing: ${filePath}`);
  }
  const calibs = require(filePath);
  let batchWords = 0;
  for (const [idStr, map] of Object.entries(calibs)) {
    const idNum = parseInt(idStr, 10);
    const wordObj = wordsMap.get(idNum);
    if (!wordObj) {
      console.warn(`Word ID ${idNum} not found in dictionary!`);
      continue;
    }
    batchWords++;
    if (map.ru) {
      wordObj.translation = map.ru;
      totalFieldsUpdated++;
    }
    if (!wordObj.translations) wordObj.translations = {};
    for (const [lang, val] of Object.entries(map)) {
      if (lang === 'ru') continue;
      wordObj.translations[lang] = val;
      totalFieldsUpdated++;
    }
  }
  console.log(`Applied ${batchWords} words from ${f}`);
  totalWordsUpdated += batchWords;
}

fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2), 'utf8');
console.log(`\n✅ Mega-batch complete! Successfully updated ${totalWordsUpdated} words (${totalFieldsUpdated} fields) across 10 parallel batches.`);
