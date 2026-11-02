import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "vlak, trenirati",
  48: "dužnost, obveza",
  231: "utakmica, šibica, podudarati se",
  267: "suza, poderati",
  578: "čizma, prtljažnik",
  851: "naranča, narančast",
  965: "nokat, čavao",
  1396: "to, ono",
  1415: "gore, prema gore",
  1537: "tako, dakle, stoga",
  1620: "igrati, predstava",
  1641: "trgovina, kupovati",
  1662: "prije, unatrag",
  1734: "postići, ostvariti",
  1923: "haljina, odjenuti se",
  1944: "roditelj",
  2046: "o, oko, otprilike",
  2130: "vrtjeti se, presti",
  3033: "supružnik, bračni drug",
  3175: "ud, grana",
  3772: "pucati, snimati",
  3784: "sam, si, je, smo, ste, su",
  3786: "od, iz",
  3788: "u, unutar",
  3802: "nego, od",
  3809: "govoriti, razgovarati",
  3815: "ako, da",
  3842: "u, na, kod",
  3859: "ovaj, taj",
  3865: "u, unutra",
  4112: "baklja, džepna svjetiljka",
  4143: "oženjen, udana za",
  4333: "želio bih, željela bih",
  4350: "siguran sam, sigurna sam",
  4362: "budi oprezan, pazi",
  4375: "razumiješ li, jesi li shvatio",
  5018: "zajedno, su-",
  5064: "kad na vrbi rodi grožđe, nikad",
  5202: "počiniti, izvesti",
  6510: "ostrakizam, izopćenje, progonstvo",
  6743: "bez muke nema nauke",
  6818: "započeti, početi",
  7004: "tekućina, tekući",
  7039: "pirjati, varivo"
};

function cleanHr(id, val) {
  if (val === null || val === undefined) return val;
  if (manualOverrides[id] !== undefined) {
    return manualOverrides[id];
  }

  let res = val;
  if (res.includes('(') || res.includes(')')) {
    res = res.replace(/\(.*?\)/g, '');
  }
  if (res.includes('/')) {
    res = res.replace(/\//g, ', ');
  }
  if (res.includes(';')) {
    res = res.replace(/;/g, ', ');
  }

  const parts = res.split(',').map(p => p.trim().replace(/[.]$/, '')).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    const lower = p.toLowerCase();
    if (p && !seen.has(lower)) {
      seen.add(lower);
      deduped.push(p);
    }
  }
  return deduped.join(', ');
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
    const orig = tr.hr;
    if (orig !== undefined) {
      const cleaned = cleanHr(w.id, orig);
      if (cleaned !== orig) {
        tr.hr = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Croatian translations in ${filePath}`);
}
