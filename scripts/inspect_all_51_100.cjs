const fs = require('fs');

const words = JSON.parse(fs.readFileSync('frontend/assets/data/words.json', 'utf8'));
const batch = words.filter(w => w.id >= 51 && w.id <= 100);

for (const w of batch) {
  console.log(`\n=== ID ${w.id}: "${w.word}" ===`);
  const t = w.translations;
  console.log(`ru: ${t.ru} | uk: ${t.uk} | de: ${t.de} | fr: ${t.fr} | es: ${t.es} | it: ${t.it} | pl: ${t.pl}`);
  console.log(`tr: ${t.tr} | pt: ${t.pt} | ja: ${t.ja} | ko: ${t.ko} | zh: ${t.zh} | ar: ${t.ar} | fa: ${t.fa} | ur: ${t.ur}`);
  console.log(`hi: ${t.hi} | bn: ${t.bn} | th: ${t.th} | vi: ${t.vi} | id: ${t.id} | kk: ${t.kk}`);
}
