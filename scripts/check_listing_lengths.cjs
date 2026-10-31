const fs = require('fs');

function extractDescription(filePath, headerRu, headerEn) {
  const content = fs.readFileSync(filePath, 'utf8');
  let desc = '';
  if (content.includes(headerRu)) {
    desc = content.split(headerRu)[1].trim();
  } else if (content.includes(headerEn)) {
    desc = content.split(headerEn)[1].trim();
  } else {
    desc = content.trim();
  }
  return desc;
}

const ru = extractDescription('google_play_assets/store_listings/ru.md', '### Полное описание (до 4000 символов)', '### Full Description');
const en = extractDescription('google_play_assets/store_listings/en.md', '### Полное описание', '### Full Description (up to 4000 chars)');

console.log('RU file current desc length:', ru.length);
console.log('EN file current desc length:', en.length);
