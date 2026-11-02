import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "tren, entrenar",
  48: "deber, obligación, turno",
  231: "partido, cerillo, fósforo, coincidir",
  267: "lágrima, rasgar",
  578: "bota, maletero",
  851: "naranja, anaranjado",
  965: "uña, clavo",
  1396: "eso, ello",
  1415: "arriba, hacia arriba",
  1537: "tan, así que, por tanto",
  1620: "jugar, obra de teatro",
  1641: "tienda, comprar",
  1662: "hace, atrás",
  1734: "lograr, alcanzar",
  1923: "vestido, vestirse",
  1944: "padre, madre, progenitor",
  2046: "sobre, acerca de, alrededor",
  2130: "girar, hilar",
  3033: "cónyuge, esposo, esposa",
  3175: "miembro, extremidad, rama",
  3772: "disparar, filmar",
  3784: "ser, estar",
  3786: "de, desde",
  3788: "en, dentro",
  3802: "que, de",
  3809: "hablar, conversar",
  3815: "si",
  3842: "en, junto a",
  3859: "el, la, este",
  3865: "en, hacia adentro",
  4112: "antorcha, linterna",
  4208: "niño, niña – niños, niñas",
  5018: "juntos, co-",
  5064: "cuando las ranas críen pelo, nunca",
  5202: "cometer, perpetrar",
  6510: "ostracismo, marginación, destierro",
  6743: "sin esfuerzo no hay recompensa",
  6818: "comenzar, iniciar",
  7004: "líquido",
  7039: "estofar, guisar, estofado",
  7045: "pisadas pesadas, pasos pesados",
  7049: "maravillarse, asombro"
};

function cleanEs(id, val) {
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
    const orig = tr.es;
    if (orig !== undefined) {
      const cleaned = cleanEs(w.id, orig);
      if (cleaned !== orig) {
        tr.es = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Spanish translations in ${filePath}`);
}
