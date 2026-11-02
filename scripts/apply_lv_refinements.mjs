import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "vilciens, trenēt",
  48: "pienākums, dežūra",
  231: "mačs, sērkociņš, sakrist",
  267: "asara, plēst",
  578: "zābaks, bagāžnieks",
  851: "apelsīns, oranžs",
  965: "nags, nagla",
  1396: "tas, šis",
  1415: "augšup, uz augšu",
  1537: "tā, tātad, tik",
  1620: "spēlēt, luga",
  1641: "veikals, iepirkties",
  1662: "pirms, atpakaļ",
  1734: "sasniegt, īstenot",
  1923: "kleita, ģērbties",
  1944: "vecāks",
  2046: "par, ap, aptuveni",
  2130: "griezties, vērpt",
  3033: "laulātais",
  3175: "loceklis, zars",
  3772: "šaut, filmēt",
  3784: "ir, būt",
  3786: "no",
  3788: "iekšā, laikā",
  3802: "nekā",
  3809: "runāt, stāstīt",
  3815: "ja, vai",
  3842: "pie, pieņemot",
  3859: "šis, tas",
  3865: "iekšā, iekšpusē",
  4112: "lāpa, kabatas lukturītis",
  5018: "kopā, līdz-",
  5064: "kad pūcei aste ziedēs, nekad",
  5202: "izdarīt, pastrādāt",
  6510: "ostrakisms, izstumšana, izraidīšana",
  6743: "bez pūlēm nav augļu",
  6818: "uzsākt, sākt",
  7004: "šķidrums, šķidrs",
  7039: "sautēt, sautējums"
};

function cleanLv(id, val) {
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
    const orig = tr.lv;
    if (orig !== undefined) {
      const cleaned = cleanLv(w.id, orig);
      if (cleaned !== orig) {
        tr.lv = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Latvian translations in ${filePath}`);
}
