import fs from 'fs';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary';

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}

async function main() {
  console.log('Downloading CSV from Google Sheets...');
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = parseCSV(text);

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  const wordIdx = headers.indexOf('word');
  const transRuIdx = headers.indexOf('translation');

  const transCols = [];
  headers.forEach((h, idx) => {
    if (h.startsWith('translation_')) {
      transCols.push({ lang: h.replace('translation_', ''), colIdx: idx, name: h });
    }
  });

  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Translation columns: ${transCols.length} (${transCols.map(t => t.lang).join(', ')})`);

  const missingPerLang = {};
  transCols.forEach(t => missingPerLang[t.lang] = 0);

  const rowsWithMissing = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const word = row[wordIdx];
    if (!word) continue;

    const missingInRow = [];
    transCols.forEach(t => {
      const val = row[t.colIdx];
      if (!val || val.trim() === '') {
        missingPerLang[t.lang]++;
        missingInRow.push(t.lang);
      }
    });

    if (missingInRow.length > 0) {
      rowsWithMissing.push({ rowNumber: r + 1, word, missingCount: missingInRow.length, langs: missingInRow.slice(0, 5) });
    }
  }

  console.log('\n--- Missing translations per language ---');
  Object.entries(missingPerLang)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang, count]) => {
      if (count > 0) console.log(`  ${lang.padEnd(5)}: ${count} missing cells`);
    });

  console.log(`\nTotal rows having at least 1 missing translation: ${rowsWithMissing.length} out of ${rows.length - 1}`);
  if (rowsWithMissing.length > 0) {
    console.log('First 5 rows with missing:');
    rowsWithMissing.slice(0, 5).forEach(m => console.log(`  Row ${m.rowNumber} (${m.word}): missing ${m.missingCount} langs (${m.langs.join(', ')}...)`));
    console.log('Last 5 rows with missing:');
    rowsWithMissing.slice(-5).forEach(m => console.log(`  Row ${m.rowNumber} (${m.word}): missing ${m.missingCount} langs (${m.langs.join(', ')}...)`));
  }
}

main().catch(console.error);
