import fs from 'fs';
import path from 'path';

const overridesPath = path.resolve('scratch/manual_pt_overrides.json');
const manualOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

// Polish 5038
manualOverrides[5038] = 'solução alternativa';

const targetFiles = [
  path.resolve('frontend/assets/data/words.json'),
  path.resolve('assets/data/words.json'),
  path.resolve('docs/assets/data/words.json')
];

function cleanPortuguese(id, originalPt) {
  let pt = manualOverrides[id] !== undefined ? manualOverrides[id] : originalPt;
  pt = pt.replace(/;/g, ',');
  const parts = pt.split(',').map(s => s.trim()).filter(Boolean);
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
    const orig = item.translations.pt || '';
    const cleaned = cleanPortuguese(item.id, orig);
    if (cleaned !== orig) {
      item.translations.pt = cleaned;
      fileUpdated++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${fileUpdated} words in ${path.basename(filePath)}`);
  totalUpdatedWords = fileUpdated;
}

console.log(`Finished applying Portuguese refinements. Modified words count: ${totalUpdatedWords}`);
