import fs from 'fs';
import path from 'path';

const manualOverrides = {
  44: "بومی، زبان‌مادری",
  337: "درخواست، جذابیت",
  582: "لطف، طرفداری",
  1641: "مغازه، خرید کردن",
  2146: "لعنتی، خیلی",
  2283: "فاحشه، زن بددهن",
  3142: "مال او",
  3738: "خودش",
  3772: "شلیک کردن، فیلمبرداری کردن",
  3784: "بودن، هست",
  3795: "او",
  3802: "از، نسبت به",
  3815: "اگر",
  3859: "آن، این",
  3977: "کمتر از",
  4007: "جشن فارغ‌التحصیلی، پرام",
  4091: "قبلاً عادت داشت",
  4112: "چراغ‌قوه، مشعل",
  4124: "ترسیده از",
  4160: "بیزار از",
  4174: "افسردگی، غم",
  4184: "با این حال، فرقی نمی‌کند",
  4197: "برایم فرقی ندارد، مخالفتی ندارم",
  4308: "نتوانست",
  4457: "دستشویی",
  4787: "غیرمستقیم",
  5031: "بدیهی دانستن، قدر ندانستن",
  5064: "وقت گل نی، هرگز",
  5775: "اعطا کردن، ارزانی داشتن",
  6012: "تلخی و کینه، تندخویی",
  6013: "تیزبینی، بصیرت",
  6037: "تمام‌عیار، مسلم",
  6496: "شهامت، شجاعت",
  6510: "طرد، اخراج، بایکوت",
  6742: "بادآورده را باد می‌برد",
  6743: "نابرده رنج گنج میسر نمی‌شود",
  6752: "نادرست، غلط",
  6912: "درست، واقعی",
  6932: "استفاده کردن، به کار بردن",
  6935: "راه نجات بودن، تکیه‌گاه بودن",
  6940: "بیات، کهنه",
  6941: "گرسنه، قحطی‌زده"
};

const targetFiles = [
  path.resolve('frontend/assets/data/words.json'),
  path.resolve('assets/data/words.json'),
  path.resolve('docs/assets/data/words.json')
];

function cleanFarsi(id, originalFa) {
  if (manualOverrides[id] !== undefined) return manualOverrides[id];
  if (!originalFa) return originalFa;
  let val = originalFa.replace(/\s*[（(][^）)]*[）)]/g, '').trim();
  const parts = val.split(/[،,؛;]/).map(s => s.trim()).filter(Boolean);
  return [...new Set(parts)].join('، ');
}

let totalUpdatedWords = 0;

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) continue;
  console.log(`Processing ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let fileUpdated = 0;
  for (const item of data) {
    if (!item.translations) continue;
    const orig = item.translations.fa || '';
    const cleaned = cleanFarsi(item.id, orig);
    if (cleaned !== orig) {
      item.translations.fa = cleaned;
      fileUpdated++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${fileUpdated} words in ${path.basename(filePath)}`);
  totalUpdatedWords = fileUpdated;
}

console.log(`Finished applying Persian refinements. Modified words count: ${totalUpdatedWords}`);
