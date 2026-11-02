const fs = require('fs');

const words = JSON.parse(fs.readFileSync('frontend/assets/data/words.json', 'utf8'));
const batch = words.filter(w => w.id >= 51 && w.id <= 100);

let out = '';
for (const w of batch) {
  out += `\n=== ID ${w.id}: "${w.word}" (RU: "${w.translation}") ===\n`;
  const t = w.translations;
  const langs = Object.keys(t);
  for (let i = 0; i < langs.length; i += 7) {
    out += langs.slice(i, i + 7).map(k => `${k}: ${t[k]}`).join(' | ') + '\n';
  }
}
fs.writeFileSync('scripts/detailed_51_100.txt', out, 'utf8');
console.log('Saved utf8 inspection file');
