import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const OVERRIDES_FILE = path.join(ROOT_DIR, 'scratch', 'manual_de_overrides.json');
export const GERMAN_WORD_REFINEMENTS = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'));

const TARGET_FILES = [
  path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'assets', 'data', 'words.json'),
  path.join(ROOT_DIR, 'docs', 'assets', 'data', 'words.json')
];

function cleanGerman(id, word, originalDe) {
  if (GERMAN_WORD_REFINEMENTS[id]) {
    return GERMAN_WORD_REFINEMENTS[id];
  }
  if (!originalDe) return originalDe;

  let cleaned = originalDe.trim();

  // Standardize semicolons to commas
  cleaned = cleaned.replace(/;/g, ',');

  // Split by commas, clean and deduplicate parts
  const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const uniqueParts = [];

  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(', ');
}

console.log(`Applying German refinements (${Object.keys(GERMAN_WORD_REFINEMENTS).length} explicit overrides)...`);

for (const filePath of TARGET_FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }

  const words = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  for (const w of words) {
    if (!w.translations) w.translations = {};
    const oldDe = w.translations.de || '';
    const newDe = cleanGerman(w.id, w.word, oldDe);

    if (newDe !== oldDe) {
      w.translations.de = newDe;
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${filePath}: ${updatedCount} words modified.`);
}

console.log('German refinements applied successfully.');
