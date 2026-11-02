import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "قطار، يتدرب",
  44: "أصلي، ناطق أصلي، محلي",
  267: "دمعة، يمزق",
  578: "حذاء، صندوق السيارة",
  851: "برتقال، برتقالي",
  965: "ظفر، مسمار",
  1620: "يلعب، مسرحية",
  1641: "متجر، يتسوق",
  1734: "حقق، أنجز",
  1923: "فستان، يرتدي",
  1944: "والد، والدة",
  3033: "زوج، زوجة",
  3175: "طرف، غصن",
  3772: "يطلق النار، يصور",
  3784: "أكون، يكون، نكون",
  4112: "شعلة، مصباح يدوي",
  4151: "يهتم بـ، يقلق على",
  4160: "ضاق ذرعاً، سئم",
  4308: "لم يستطع، عجز عن",
  4387: "ظرف، حال",
  4457: "حمام، دورة مياه",
  4787: "غير مباشر، ملتوٍ",
  4903: "آسف، متأسف",
  4989: "صدر، ظهر",
  5064: "في المشمش، مستحيل",
  5775: "تفضل، تكرم، منح",
  6012: "مرارة، حدة، عداوة",
  6013: "فطنة، حنكة، بصيرة",
  6510: "نبذ، إبعاد، مقاطعة",
  6743: "لا نجاح بلا تعب، لا مكسب بلا مشقة",
  6940: "بائت، قديم"
};

function cleanAr(id, val) {
  if (val === null || val === undefined) return val;
  if (manualOverrides[id] !== undefined) {
    return manualOverrides[id];
  }

  let res = val;
  if (res.includes('(') || res.includes(')')) {
    res = res.replace(/\(.*?\)/g, '');
  }
  if (res.includes('/')) {
    res = res.replace(/\//g, '، ');
  }

  const parts = res.split(/[,،؛;]/).map(p => p.trim()).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      deduped.push(p);
    }
  }
  return deduped.join('، ');
}

const targetFiles = [
  path.join(rootDir, 'frontend', 'assets', 'data', 'words.json'),
  path.join(rootDir, 'assets', 'data', 'words.json'),
  path.join(rootDir, 'docs', 'assets', 'data', 'words.json')
];

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const words = JSON.parse(content);
  let updatedCount = 0;

  for (const w of words) {
    const tr = w.translations || {};
    const orig = tr.ar;
    if (orig !== undefined) {
      const cleaned = cleanAr(w.id, orig);
      if (cleaned !== orig) {
        tr.ar = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Arabic translations in ${filePath}`);
}
