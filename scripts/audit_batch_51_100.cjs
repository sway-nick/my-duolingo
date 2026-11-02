const fs = require('fs');

const words = JSON.parse(fs.readFileSync('frontend/assets/data/words.json', 'utf8'));
const batch = words.filter(w => w.id >= 51 && w.id <= 100);
console.log('Words loaded in batch 51..100:', batch.length);

// Let's print out all words and inspect potential issues across all 35 languages
for (const w of batch) {
  const issues = [];
  for (const [lang, val] of Object.entries(w.translations || {})) {
    if (typeof val === 'string') {
      if (val.includes('(') || val.includes('/') || val.includes(';')) {
        issues.push(`${lang}: noisy "${val}"`);
      }
      if (/^[A-ZА-ЯЁ]/.test(val) && !['de'].includes(lang)) {
        // check if capital letter in non-German language
        issues.push(`${lang}: Capitalized "${val}"`);
      }
      if (val.split(',').length > 5) {
        issues.push(`${lang}: overly long list (${val.split(',').length}) "${val}"`);
      }
    }
  }
  if (issues.length > 0) {
    console.log(`[ID ${w.id} - ${w.word}] -> ${issues.join(' | ')}`);
  }
}
