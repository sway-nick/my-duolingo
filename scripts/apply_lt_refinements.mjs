import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "traukinys, treniruoti",
  48: "pareiga, budėjimas",
  231: "rungtynės, degtukas, sutapti",
  267: "ašara, plėšti",
  578: "batas, bagažinė",
  851: "apelsinas, oranžinis",
  965: "nagas, vinis",
  1396: "tai, šis",
  1415: "aukštyn, viršun",
  1537: "taigi, taip, todėl",
  1620: "žaisti, pjesė",
  1641: "parduotuvė, apsipirkti",
  1662: "prieš, atgal",
  1734: "pasiekti, įgyvendinti",
  1923: "suknelė, rengtis",
  1944: "tėvas, motina",
  2046: "apie, maždaug",
  2130: "suktis, verpti",
  3033: "sutuoktinis",
  3175: "galūnė, šaka",
  3772: "šaudyti, filmuoti",
  3784: "būti, yra",
  3786: "iš, nuo",
  3788: "viduje, metu",
  3802: "negu, nei",
  3809: "kalbėti, kalbėtis",
  3815: "jei, ar",
  3842: "prie, pas, į",
  3859: "šis, tas",
  3865: "į, viduje",
  4112: "fakelas, žibintuvėlis",
  5018: "kartu, bendra-",
  5064: "kai ant gluosnio kriaušės augs, niekada",
  5202: "padaryti, įvykdyti",
  5203: "atkakliai siekti tikslo, rodyti atkaklumą",
  5204: "susieti su kuo nors, priklausyti kam nors",
  5205: "prasiskverbti, užpildyti",
  5206: "nuraminti, sušvelninti",
  5207: "postuluoti, priimti be įrodymų",
  6510: "ostrakizmas, atstūmimas, išvarymas",
  6743: "be vargo nebus ir pyrago",
  6818: "pradėti, pradėti veiklą",
  7004: "skystis, skystas",
  7039: "troškinti, troškinys"
};

function cleanLt(id, val) {
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

  const parts = res.split(',').map(p => p.trim().replace(/[.;]$/, '')).filter(Boolean);
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
    const orig = tr.lt;
    if (orig !== undefined) {
      const cleaned = cleanLt(w.id, orig);
      if (cleaned !== orig) {
        tr.lt = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Lithuanian translations in ${filePath}`);
}
