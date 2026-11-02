import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "tog, træne",
  48: "pligt, opgave",
  231: "kamp, tændstik, passe sammen",
  267: "tåre, rive itu",
  578: "støvle, bagagerum",
  851: "appelsin, orange",
  965: "negl, søm",
  1396: "det, den",
  1415: "op, opad",
  1537: "så, altså, derfor",
  1620: "spille, teaterstykke",
  1641: "butik, handle",
  1662: "siden, for ... siden",
  1734: "opnå, fuldføre",
  1923: "kjole, klæde sig",
  1944: "forælder",
  2046: "om, cirka, omkring",
  2130: "snurre, spinde",
  3033: "ægtefælle",
  3175: "lem, gren",
  3772: "skyde, filme",
  3784: "er, være",
  3786: "af, fra",
  3788: "i, indenfor",
  3802: "end",
  3809: "tale, snakke",
  3815: "hvis, om",
  3842: "ved, på, i",
  3859: "den, det",
  3865: "ind i, indeni",
  4112: "fakkel, lommelygte",
  5018: "sammen, sam-",
  5064: "når der er to torsdage i en uge, aldrig",
  5202: "begå, udføre",
  6510: "ostracisme, udstødelse, landsforvisning",
  6743: "uden hårdt arbejde ingen gevinst",
  6818: "begynde, indlede",
  7004: "væske, flydende",
  7039: "stuve, gryderet"
};

function cleanDa(id, val) {
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
    const orig = tr.da;
    if (orig !== undefined) {
      const cleaned = cleanDa(w.id, orig);
      if (cleaned !== orig) {
        tr.da = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Danish translations in ${filePath}`);
}
