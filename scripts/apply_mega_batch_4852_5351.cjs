const fs = require('fs');
const path = require('path');

const wordsPath = path.resolve('frontend/assets/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

const batchFiles = [
  'apply_batch_4852_4901_calibrations.cjs',
  'apply_batch_4902_4951_calibrations.cjs',
  'apply_batch_4952_5001_calibrations.cjs',
  'apply_batch_5002_5051_calibrations.cjs',
  'apply_batch_5052_5101_calibrations.cjs',
  'apply_batch_5102_5151_calibrations.cjs',
  'apply_batch_5152_5201_calibrations.cjs',
  'apply_batch_5202_5251_calibrations.cjs',
  'apply_batch_5252_5301_calibrations.cjs',
  'apply_batch_5302_5351_calibrations.cjs'
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
