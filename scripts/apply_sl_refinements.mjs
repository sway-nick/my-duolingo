import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "vlak, trenirati",
  48: "dolžnost, obveznost",
  231: "tekma, vžigalica, ujemati se",
  267: "solza, raztrgati",
  578: "škorenj, prtljažnik",
  601: "bratranec, sestrična",
  643: "dragi, draga, spoštovani",
  851: "pomaranča, oranžen",
  965: "noht, žebelj",
  1396: "to, ono",
  1415: "gor, navzgor",
  1537: "torej, tako, zato",
  1620: "igrati, igra",
  1641: "trgovina, nakupovati",
  1662: "nazaj, pred",
  1734: "doseči, uresničiti",
  1923: "obleka, obleči se",
  1944: "starš",
  2046: "o, okoli, približno",
  2130: "vrteti se, presti",
  3033: "zakonec, soprog, soproga",
  3175: "ud, veja",
  3772: "streljati, snemati",
  3784: "biti, je",
  3786: "iz, od",
  3788: "v, znotraj",
  3802: "kot, od",
  3809: "govoriti, pogovarjati se",
  3815: "če, ali",
  3842: "pri, na, v",
  3859: "ta, to",
  3865: "v, znotraj",
  4112: "bakla, žepna svetilka",
  4772: "poročen, poročena",
  4997: "si ga prejel, si prejela",
  5018: "skupaj, so-",
  5064: "ob svetem Nikoli, nikoli",
  5202: "zagrešiti, storiti",
  6510: "ostrakizem, izobčenje, izgnanstvo",
  6743: "brez muke se še čevelj ne obuje",
  6818: "začeti, pričeti",
  7004: "tekočina, tekoč",
  7039: "dušiti, enolončnica"
};

function cleanSl(id, val) {
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
    const orig = tr.sl;
    if (orig !== undefined) {
      const cleaned = cleanSl(w.id, orig);
      if (cleaned !== orig) {
        tr.sl = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Slovenian translations in ${filePath}`);
}
