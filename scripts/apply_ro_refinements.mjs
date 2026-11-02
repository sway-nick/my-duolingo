import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  44: "nativ, vorbitor nativ",
  1396: "acesta, el, ea",
  1415: "sus, în sus",
  1468: "a atinge, a ajunge la",
  1537: "deci, așa, atât de",
  1641: "magazin, a cumpăra",
  1662: "în urmă, în trecut",
  1734: "a atinge, a realiza",
  2046: "despre, aproximativ",
  2130: "a roti, a toarce",
  3033: "soț, soție",
  3175: "membru, ramură",
  3772: "a trage, a filma",
  3784: "sunt, este, ești",
  3786: "din, de, despre",
  3788: "în, înăuntru",
  3802: "decât, ca",
  3809: "a vorbi, a spune",
  3815: "dacă, în caz că",
  3842: "la, în",
  3859: "acesta, cel",
  4091: "obișnuiam, pe vremuri",
  4112: "torță, lanternă",
  4124: "speriat de, temător de",
  4151: "a-i păsa de, a-și face griji",
  4160: "sătul de, lehamite de",
  4174: "depresie, melancolie",
  4197: "nu mă deranjează, nu am nimic împotrivă",
  4257: "a se antrena, a rezolva",
  4308: "nu a putut, nu puteam",
  4387: "adverb",
  4457: "toaletă, baie",
  4787: "indirect, ocolit",
  4903: "scuze, îmi pare rău",
  4989: "a ieșit, a apărut",
  5018: "co-, împreună",
  5021: "trebuie, am de",
  5023: "nu va, refuză să",
  5031: "a lua de la sine înțeles, a subestima",
  5064: "la paștele cailor, când o zbura porcul, niciodată",
  5092: "a face comisioane, a rezolva treburi",
  5202: "a comite, a săvârși",
  5775: "a binevoi, a acorda, a dărui",
  6012: "amărăciune, înverșunare, asprime",
  6013: "perspicacitate, agerime",
  6037: "notoriu, absolut, desăvârșit",
  6496: "curaj, bărbăție, îndrăzneală",
  6510: "ostracizare, exilare, boicot",
  6743: "fără efort nu există câștig, fără muncă nu este răsplată",
  6752: "fals, neadevărat",
  7039: "a înăbuși, tocăniță",
  7043: "tunet, a tuna",
  7049: "a se mira, minune"
};

function cleanRo(id, val) {
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
    res = res.replace(/;/g, ',');
  }

  const parts = res.split(/[,;]/).map(p => p.trim()).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
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
    const orig = tr.ro;
    if (orig !== undefined) {
      const cleaned = cleanRo(w.id, orig);
      if (cleaned !== orig) {
        tr.ro = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Romanian translations in ${filePath}`);
}
