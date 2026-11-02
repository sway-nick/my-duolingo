import fs from 'fs';
import path from 'path';

const overridesPath = path.resolve('scratch/manual_uk_overrides.json');
const manualOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

const targetFiles = [
  path.resolve('frontend/assets/data/words.json'),
  path.resolve('assets/data/words.json'),
  path.resolve('docs/assets/data/words.json')
];

function cleanUkrainian(id, originalUk) {
  let ukVal = manualOverrides[id] !== undefined ? manualOverrides[id] : originalUk;
  ukVal = ukVal.replace(/;/g, ',').replace(/\//g, ', ');
  const parts = ukVal.split(',').map(s => s.trim()).filter(Boolean);
  return [...new Set(parts)].join(', ');
}

let totalUpdatedWords = 0;

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) continue;
  console.log(`Processing ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let fileUpdated = 0;
  for (const item of data) {
    if (!item.translations) continue;
    const orig = item.translations.uk || '';
    const cleaned = cleanUkrainian(item.id, orig);
    if (cleaned !== orig) {
      item.translations.uk = cleaned;
      fileUpdated++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${fileUpdated} words in ${path.basename(filePath)}`);
  totalUpdatedWords = fileUpdated;
}

console.log(`Finished applying Ukrainian refinements. Modified words count: ${totalUpdatedWords}`);
