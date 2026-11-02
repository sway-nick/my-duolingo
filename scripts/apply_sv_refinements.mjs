import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "tåg, träna",
  48: "plikt, skyldighet",
  231: "match, tändsticka, passa ihop",
  267: "tår, riva sönder",
  578: "stövel, bagageutrymme",
  851: "apelsin, orange",
  965: "nagel, spik",
  1396: "det, den",
  1415: "upp, uppåt",
  1537: "så, alltså, därför",
  1620: "spela, pjäs",
  1641: "butik, handla",
  1662: "sedan, för ... sedan",
  1734: "uppnå, åstadkomma",
  1923: "klänning, klä sig",
  1944: "förälder",
  2046: "om, cirka, ungefär",
  2130: "snurra, spinna",
  3033: "make, maka, äkta hälft",
  3175: "lem, gren",
  3772: "skjuta, filma",
  3784: "är, vara",
  3786: "av, från",
  3788: "i, inuti",
  3802: "än",
  3809: "tala, prata",
  3815: "om, ifall",
  3842: "vid, på, i",
  3859: "den, det",
  3865: "in i, inuti",
  4112: "fackla, ficklampa",
  5018: "tillsammans, sam-",
  5064: "när grisar kan flyga, aldrig",
  5202: "begå, föröva",
  6510: "ostracism, uteslutning, landsförvisning",
  6743: "ingen möda, ingen lön",
  6818: "påbörja, inleda",
  7004: "vätska, flytande",
  7039: "stuva, gryta"
};

function cleanSv(id, val) {
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
    const orig = tr.sv;
    if (orig !== undefined) {
      const cleaned = cleanSv(w.id, orig);
      if (cleaned !== orig) {
        tr.sv = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Swedish translations in ${filePath}`);
}
