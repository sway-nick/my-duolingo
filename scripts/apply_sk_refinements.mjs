import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "vlak, trénovať",
  48: "povinnosť, služba",
  231: "zápas, zápalka, hodiť sa",
  267: "slza, trhať",
  578: "čižma, kufor auta",
  601: "bratranec, sesternica",
  851: "pomaranč, oranžový",
  965: "necht, klinec",
  1396: "to, ono",
  1415: "hore, nahor",
  1537: "tak, teda, preto",
  1620: "hrať, divadelná hra",
  1641: "obchod, nakupovať",
  1662: "pred, naspäť",
  1734: "dosiahnuť, uskutočniť",
  1923: "šaty, obliecť sa",
  1944: "rodič",
  2046: "o, okolo, približne",
  2130: "točiť sa, priasť",
  3033: "manžel, manželka",
  3175: "končatina, konár",
  3772: "strieľať, natáčať",
  3784: "byť, je",
  3786: "z, zo, od",
  3788: "v, vo, vnútri",
  3802: "než, ako",
  3809: "hovoriť, rozprávať",
  3815: "ak, či",
  3842: "pri, v, na",
  3859: "tento, táto",
  3865: "do, vnútri",
  4112: "pochodeň, baterka",
  4143: "ženatý s, vydatá za",
  4350: "som si istý, som si istá",
  4772: "ženatý, vydatá",
  5018: "spolu, spolu-",
  5064: "keď naprší a uschne, nikdy",
  5202: "spáchať, vykonať",
  5716: "synovský, dcérsky",
  6510: "ostrakizmus, vylúčenie, vyhnanstvo",
  6743: "bez práce nie sú koláče",
  6818: "začať, zahájiť",
  7004: "tekutina, tekutý",
  7039: "dusiť, guláš",
  7049: "čudovať sa, zázrak"
};

function cleanSk(id, val) {
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
    const orig = tr.sk;
    if (orig !== undefined) {
      const cleaned = cleanSk(w.id, orig);
      if (cleaned !== orig) {
        tr.sk = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Slovak translations in ${filePath}`);
}
