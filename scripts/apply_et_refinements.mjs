import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "rong, treenima",
  48: "kohustus, teenistus",
  231: "mäng, tikk, sobima kokku",
  267: "pisar, rebima",
  578: "saabas, pagasiruum",
  851: "apelsin, oranž",
  965: "küüs, nael",
  1396: "see, tema",
  1415: "üles, ülespoole",
  1537: "nii, seega, järelikult",
  1620: "mängima, näidend",
  1641: "pood, ostlema",
  1662: "tagasi, varem",
  1734: "saavutama, ellu viima",
  1923: "kleit, riietuma",
  1944: "lapsevanem",
  2046: "kohta, umbes, ligikaudu",
  2130: "pöörlema, ketrama",
  3033: "abikaasa",
  3175: "jäse, oks",
  3772: "tulistama, filmima",
  3784: "olema, on",
  3786: "kohta, -st",
  3788: "sees, ajal",
  3802: "kui",
  3809: "rääkima, vestlema",
  3815: "kui, kas",
  3842: "juures, kohal",
  3859: "see",
  3865: "sisse, sees",
  4112: "tõrvik, taskulamp",
  5018: "koos, kaas-",
  5064: "kui lehm lendama hakkab, mitte kunagi",
  5202: "toime panema, sooritama",
  6510: "ostratsism, tagakiusamine, pagendamine",
  6743: "ilma vaevata ei saavuta midagi",
  6818: "alustama, algama",
  7004: "vedelik, vedel",
  7039: "hautama, hautis"
};

function cleanEt(id, val) {
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
    const orig = tr.et;
    if (orig !== undefined) {
      const cleaned = cleanEt(w.id, orig);
      if (cleaned !== orig) {
        tr.et = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Estonian translations in ${filePath}`);
}
