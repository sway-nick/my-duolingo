import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "juna, harjoitella",
  48: "velvollisuus, tehtävä",
  231: "ottelu, tulitikku, sopia yhteen",
  267: "kyynel, repiä",
  578: "saapas, tavaratila",
  851: "appelsiini, oranssi",
  965: "kynsi, naula",
  1396: "se, tämä",
  1415: "ylös, ylhäällä",
  1537: "joten, niin, siksi",
  1620: "pelata, leikkiä, näytelmä",
  1641: "kauppa, tehdä ostoksia",
  1662: "sitten",
  1734: "saavuttaa, toteuttaa",
  1923: "mekko, pukeutua",
  1944: "vanhempi",
  2046: "noin, kohteesta",
  2130: "pyöriä, kehrätä",
  3033: "puoliso",
  3175: "raaja, oksa",
  3772: "ampua, kuvata",
  3784: "olla, on",
  3786: "alkaen, -sta",
  3788: "sisällä, -ssa",
  3802: "kuin",
  3809: "puhua, keskustella",
  3815: "jos",
  3842: "luona, -lla",
  3859: "se, tämä",
  3865: "sisään, sisälle",
  4112: "soihtu, taskulamppu",
  5018: "yhdessä, yhteis-",
  5064: "kun lehmät lentävät, ei koskaan",
  5202: "tehdä, syyllistyä",
  6510: "ostrakismi, karkotus, eristäminen",
  6743: "ei työtä ilman tuskaa",
  6818: "aloittaa, alkaa",
  7004: "neste, nestemäinen",
  7022: "nuoliviini, viini",
  7039: "hauduttaa, muhennos",
  7049: "ihmetellä, ihme"
};

function cleanFi(id, val) {
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
    const orig = tr.fi;
    if (orig !== undefined) {
      const cleaned = cleanFi(w.id, orig);
      if (cleaned !== orig) {
        tr.fi = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Finnish translations in ${filePath}`);
}
