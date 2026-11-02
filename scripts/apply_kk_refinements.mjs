import fs from 'fs';
import path from 'path';

const manualOverrides = {
  44: "туған, ана тілінде сөйлеуші",
  1396: "бұл, ол",
  1415: "жоғары",
  1537: "сондықтан, сондай",
  1641: "дүкен, сатып алу",
  1662: "бұрын",
  2046: "туралы, шамамен",
  2437: "печенье",
  3772: "ату, түсіру",
  3784: "болу, бар",
  3786: "туралы, -дан, -ден",
  3788: "ішінде, -да, -де",
  3802: "қарағанда, гөрі",
  3809: "сөйлеу, айту",
  3815: "егер",
  3842: "жанында, -да, -де",
  3859: "бұл, сол, осы",
  3865: "ішіне, ішіне қарай",
  4007: "бітіру кеші, балл",
  4091: "бұрын істейтін, үйренген",
  4112: "алау, қолшам",
  4124: "қорыққан, сескенген",
  4160: "жалыққан, мезі болған",
  4174: "көңілсіздік, күйзеліс",
  4184: "бәрібір, сонда да",
  4197: "қарсы емеспін, бәрібір",
  4308: "істей алмады, қолынан келмеді",
  4457: "дәретхана",
  4787: "жанама, тікелей емес",
  5018: "бірге, қоса",
  5021: "керек, тиіс",
  5023: "болмайды, істемейді",
  5031: "қадірін білмеу, тиісті деп санау",
  5064: "Түйенің құйрығы жерге тигенде, ешқашан",
  5202: "жасау, қылмыс жасау",
  5775: "сыйлау, нәсіп ету, рақым ету",
  6012: "ащылық, қастық, ыза",
  6013: "тапқырлық, зеректік",
  6037: "нағыз, сорақы",
  6496: "қайрат, жігер, батылдық",
  6510: "шеттету, қуғындау, остракизм",
  6742: "Оңай келген оңай кетер, желмен келген желге кетер",
  6743: "Еңбексіз өмір жоқ, бейнет түбі — зейнет",
  6752: "өтірік, жалған",
  6912: "шын, шыншыл",
  6932: "пайдалану, кәдеге жарату",
  6935: "құтқарушы болу, сүйеніш болу",
  6940: "ескірген",
  6941: "аш, ашыққан",
  7004: "сұйықтық, сұйық",
  7022: "қорамсақ",
  7039: "бұқтыру, бұқтырылған ет",
  7048: "форель, бахтах",
  7049: "таңғалу, ғажап"
};

const targetFiles = [
  path.resolve('frontend/assets/data/words.json'),
  path.resolve('assets/data/words.json'),
  path.resolve('docs/assets/data/words.json')
];

function cleanKazakh(id, originalKk) {
  if (manualOverrides[id] !== undefined) return manualOverrides[id];
  if (!originalKk) return originalKk;
  let val = originalKk.replace(/\s*[（(][^）)]*[）)]/g, '').trim();
  const parts = val.split(/[,;；]/).map(s => s.trim()).filter(Boolean);
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
    const orig = item.translations.kk || '';
    const cleaned = cleanKazakh(item.id, orig);
    if (cleaned !== orig) {
      item.translations.kk = cleaned;
      fileUpdated++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${fileUpdated} words in ${path.basename(filePath)}`);
  totalUpdatedWords = fileUpdated;
}

console.log(`Finished applying Kazakh refinements. Modified words count: ${totalUpdatedWords}`);
