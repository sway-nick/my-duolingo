import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "ٹرین، تربیت دینا",
  2496: "نل، نل کھولنا",
  3772: "گولی چلانا، فلمانا",
  4112: "مشعل، ٹارچ",
  6510: "سماجی بائیکاٹ، جلاوطنی، دیس نکالا",
  6940: "باسی",
  6941: "بھوکا، فاقہ زدہ",
  7023: "خزندہ"
};

function cleanUr(id, val) {
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

  const parts = res.split(/[,،؛;]/).map(p => p.trim().replace(/[۔.]$/, '')).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (p && !seen.has(p)) {
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
    const orig = tr.ur;
    if (orig !== undefined) {
      const cleaned = cleanUr(w.id, orig);
      if (cleaned !== orig) {
        tr.ur = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Urdu translations in ${filePath}`);
}
