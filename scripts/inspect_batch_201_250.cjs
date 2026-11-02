const fs = require('fs');

const words = JSON.parse(fs.readFileSync('frontend/assets/data/words.json', 'utf8'));
const batch = words.filter(w => w.id >= 201 && w.id <= 250);
console.log('Words loaded in batch 201..250:', batch.length);

let out = '';
for (const w of batch) {
  out += `\n=== ID ${w.id}: "${w.word}" (RU: "${w.translation}") ===\n`;
  const t = w.translations || {};
  const langs = Object.keys(t);
  for (let i = 0; i < langs.length; i += 7) {
    out += langs.slice(i, i + 7).map(k => `${k}: ${t[k]}`).join(' | ') + '\n';
  }
}
fs.writeFileSync('scripts/detailed_201_250.txt', out, 'utf8');
console.log('Saved utf8 inspection file for 201..250');

// Check capitalization & noise
for (const w of batch) {
  const issues = [];
  for (const [lang, val] of Object.entries(w.translations || {})) {
    if (typeof val === 'string') {
      if (val.includes('(') || val.includes('/') || val.includes(';')) {
        issues.push(`${lang}: noisy "${val}"`);
      }
      if (/^[A-ZА-ЯЁ]/.test(val) && !['de'].includes(lang)) {
        issues.push(`${lang}: Capitalized "${val}"`);
      }
    }
  }
  if (issues.length > 0) {
    console.log(`[ID ${w.id} - ${w.word}] -> ${issues.join(' | ')}`);
  }
}
