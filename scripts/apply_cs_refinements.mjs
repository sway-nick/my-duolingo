import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  2: "být dobrý v, ovládat",
  44: "rodilý, rodilý mluvčí, domorodý",
  643: "drahý, vážený, milý",
  1396: "to, ono, ten",
  1415: "nahoru, nahoře",
  1468: "dosáhnout, dospět k",
  1537: "tak, tedy, natolik",
  1662: "před, zpátky",
  1734: "dosáhnout, uskutečnit",
  2046: "o, kolem, přibližně",
  2130: "točit se, příst",
  3033: "manžel, manželka",
  3175: "končetina, větev",
  3772: "střílet, natáčet, fotit",
  3784: "jsem, jsi, je, jsou",
  3786: "z, ze, od",
  3788: "v, ve, uvnitř",
  3802: "než",
  3809: "mluvit, říci",
  3815: "pokud, jestliže, když",
  3842: "u, v, na",
  3859: "ten, ta, to",
  3865: "do, dovnitř",
  3974: "tak akorát, jakž takž",
  4007: "maturitní ples, ples",
  4091: "mívat ve zvyku, dříve",
  4112: "pochodeň, baterka",
  4143: "ženatý s, vdaná za",
  4151: "záležet na, dělat si starosti",
  4160: "mít po krk, otrávený z",
  4174: "deprese, těžká melancholie",
  4197: "nevadí mi, nemám nic proti",
  4257: "vyřešit, trénovat, cvičit",
  4308: "nemohl, nedokázal",
  4333: "chtěl bych, ráda bych",
  4350: "jsem si jistý, nepochybně",
  4387: "příslovce",
  4457: "toaleta, záchod",
  4787: "nepřímý, oklikou",
  4989: "vyšel, objevil se",
  5018: "spolu-, spolupracovník",
  5021: "muset, je třeba",
  5023: "nebude, odmítá",
  5031: "brát jako samozřejmost, podceňovat",
  5034: "cítit se vyloučený, cítit se odstrčený",
  5064: "až naprší a uschne, nikdy",
  5092: "vyřizovat pochůzky, běhat po úřadech",
  5202: "spáchat, dopustit se",
  5716: "synovský, dceřiný",
  5775: "ráčit, dopřát, milostivě udělit",
  6012: "hořkost, jízlivost, zášť",
  6013: "bystrost, prozíravost, vnímavost",
  6037: "naprostý, bezostyšný, zjevný",
  6496: "odvaha, kuráž, nezdolnost",
  6510: "ostrakismus, vyloučení, vyhnanství",
  6742: "lehce nabyl, lehce pozbyl",
  6743: "bez práce nejsou koláče",
  7004: "tekutina, tekutý",
  7039: "dusit, dušené maso",
  7043: "hrom, hřmít"
};

function cleanCs(id, val) {
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
    const orig = tr.cs;
    if (orig !== undefined) {
      const cleaned = cleanCs(w.id, orig);
      if (cleaned !== orig) {
        tr.cs = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Czech translations in ${filePath}`);
}
