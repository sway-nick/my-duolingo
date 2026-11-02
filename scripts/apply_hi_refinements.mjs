import fs from 'fs';
import path from 'path';

const overridesPath = path.resolve('scratch/manual_hi_overrides.json');
const manualOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

// Additional polish
manualOverrides[6496] = 'साहस, हिम्मत';

const targetFiles = [
  path.resolve('frontend/assets/data/words.json'),
  path.resolve('assets/data/words.json'),
  path.resolve('docs/assets/data/words.json')
];

function cleanHindi(id, originalHi) {
  let hi = manualOverrides[id] !== undefined ? manualOverrides[id] : originalHi;
  hi = hi.replace(/;/g, ',');
  const parts = hi.split(',').map(s => s.trim()).filter(Boolean);
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
    const orig = item.translations.hi || '';
    const cleaned = cleanHindi(item.id, orig);
    if (cleaned !== orig) {
      item.translations.hi = cleaned;
      fileUpdated++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${fileUpdated} words in ${path.basename(filePath)}`);
  totalUpdatedWords = fileUpdated;
}

console.log(`Finished applying Hindi refinements. Modified words count: ${totalUpdatedWords}`);
