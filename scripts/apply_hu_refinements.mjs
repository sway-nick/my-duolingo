import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "vonat, edz",
  44: "anyanyelvi, őshonos, anyanyelvi beszélő",
  267: "könny, szakít",
  851: "narancs, narancssárga",
  965: "köröm, szög",
  1396: "az, ez, ő",
  1415: "fel, felfelé",
  1468: "elér, odanyúl",
  1537: "így, úgy, annyira",
  1620: "játszik, színdarab",
  1641: "bolt, vásárol",
  1662: "ezelőtt, korábban",
  1734: "elér, megvalósít",
  1923: "ruha, felöltözik",
  2046: "körülbelül, -ról, -ről",
  2130: "forog, fon",
  3175: "végtag, faág",
  3772: "lő, felvesz, forgat",
  3784: "vagyok, vagy, van, vagyunk, vagytok, vannak",
  3786: "-ból, -ből, -ról, -ről",
  3788: "-ban, -ben, bent",
  3797: "-tól, -től",
  3802: "mint",
  3809: "beszél, mond",
  3815: "ha, amennyiben",
  3842: "-nál, -nél, -on, -en, -ön",
  3859: "a, az",
  3865: "-ba, -be, bele",
  4007: "szalagavató bál, bál",
  4091: "valaha csináltam, régen",
  4112: "fáklya, zseblámpa",
  4124: "fél valamitől, megijed",
  4151: "törődik vele, aggódik miatta",
  4160: "torkig van, elege van",
  4174: "depresszió, melankólia",
  4184: "mindegy, mégis",
  4197: "nem bánom, nincs ellene kifogásom",
  4257: "edz, megold, kidolgoz",
  4308: "nem tudott, képtelen volt",
  4387: "határozószó",
  4457: "mosdó, vécé",
  4787: "közvetett, burkolt",
  4903: "sajnálom, elnézést",
  4989: "kijött, megjelent",
  5018: "társ-, együtt",
  5021: "kell, muszáj",
  5023: "nem fog, nem hajlandó",
  5031: "magától értetődőnek vesz, alábecsül",
  5064: "majd ha piros hó esik, soha",
  5092: "ügyeket intéz, szaladgál",
  5202: "elkövet, véghezvisz",
  5775: "méltóztat, megad, kegyeskedik",
  6012: "keserűség, elkeseredettség, maró gúny",
  6013: "éleselméjűség, éleslátás, rátermettség",
  6037: "megrögzött, nyilvánvaló, teljes",
  6496: "bátorság, rátermettség, kitartás",
  6510: "kiközösítés, száműzetés, bojkott",
  6743: "nincs siker munka nélkül",
  6940: "állott, száraz",
  6941: "éhező, farkaséhes",
  7004: "folyadék, folyékony",
  7039: "párol, ragu",
  7049: "csodálkozik, csoda"
};

function cleanHu(id, val) {
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
    const orig = tr.hu;
    if (orig !== undefined) {
      const cleaned = cleanHu(w.id, orig);
      if (cleaned !== orig) {
        tr.hu = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Hungarian translations in ${filePath}`);
}
