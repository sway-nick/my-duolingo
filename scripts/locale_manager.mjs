import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTED_LOCALES, SUPPORTED_LOCALE_CODES, getLocaleDisplayName } from '../frontend/config/locales.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const command = process.argv[2] || 'list';

function loadWords() {
  const wordsPath = path.join(ROOT, 'frontend/assets/data/words.json');
  return JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
}

function loadI18n() {
  const i18nPath = path.join(ROOT, 'frontend/services/i18n.js');
  return fs.readFileSync(i18nPath, 'utf8');
}

function loadWidget() {
  const widgetPath = path.join(ROOT, 'frontend/services/widgetTranslations.js');
  return fs.readFileSync(widgetPath, 'utf8');
}

function loadAdService() {
  const adPath = path.join(ROOT, 'frontend/services/adService.js');
  return fs.readFileSync(adPath, 'utf8');
}

function loadCollectionsService() {
  const colPath = path.join(ROOT, 'frontend/services/collectionsService.js');
  return fs.readFileSync(colPath, 'utf8');
}

function loadPrivacy() {
  const privPath = path.join(ROOT, 'frontend/components/modals/privacyTranslations.js');
  return fs.readFileSync(privPath, 'utf8');
}

if (command === 'list') {
  console.log(`\n🌍 English Breakfast — Supported Locales Registry (${SUPPORTED_LOCALES.length} locales)`);
  console.log('='.repeat(80));
  console.log(
    'Code'.padEnd(6) +
    'Display Name'.padEnd(24) +
    'Dir'.padEnd(6) +
    'Dictionary Words'.padEnd(20) +
    'Status'
  );
  console.log('-'.repeat(80));

  const words = loadWords();
  const totalWords = words.length;

  for (const loc of SUPPORTED_LOCALES) {
    let wordCount = 0;
    for (const w of words) {
      if (loc.code === 'en') {
        if (w.word) wordCount++;
      } else if (loc.code === 'ru') {
        if (w.translation || (w.translations && w.translations.ru)) wordCount++;
      } else {
        if (w.translations && w.translations[loc.code]) wordCount++;
      }
    }
    const pct = ((wordCount / totalWords) * 100).toFixed(1);
    const displayName = getLocaleDisplayName(loc.code, true);
    const status = wordCount === totalWords ? '✅ 100%' : `⚠️ ${pct}%`;

    console.log(
      loc.code.padEnd(6) +
      displayName.padEnd(24) +
      loc.dir.padEnd(6) +
      `${wordCount} / ${totalWords}`.padEnd(20) +
      status
    );
  }
  console.log('='.repeat(80) + '\n');
} else if (command === 'validate') {
  console.log(`\n🔍 Validating all ${SUPPORTED_LOCALES.length} registered locales across codebase...`);
  const words = loadWords();
  const i18n = loadI18n();
  const widget = loadWidget();
  const ad = loadAdService();
  const coll = loadCollectionsService();
  const priv = loadPrivacy();

  let hasErrors = false;

  for (const loc of SUPPORTED_LOCALES) {
    const issues = [];

    // 1. Dictionary
    let wordCount = 0;
    for (const w of words) {
      if (loc.code === 'en') {
        if (w.word) wordCount++;
      } else if (loc.code === 'ru') {
        if (w.translation || (w.translations && w.translations.ru)) wordCount++;
      } else {
        if (w.translations && w.translations[loc.code]) wordCount++;
      }
    }
    if (wordCount !== words.length) {
      issues.push(`Dictionary: ${wordCount}/${words.length} words`);
    }

    // 2. i18n
    if (!i18n.includes(`\n  ${loc.code}: {`)) {
      issues.push(`Missing translations in i18n.js`);
    }

    // 3. Widget
    if (!widget.includes(`\n  ${loc.code}: {`)) {
      issues.push(`Missing in widgetTranslations.js`);
    }

    // 4. AdService
    if (!ad.includes(`"${loc.code}": {`)) {
      issues.push(`Missing in adService.js`);
    }

    // 5. CollectionsService
    if (!coll.includes(`"${loc.code}":`)) {
      issues.push(`Missing in collectionsService.js`);
    }

    // 6. Privacy
    if (!priv.includes(`\n  ${loc.code}: {`)) {
      issues.push(`Missing in privacyTranslations.js`);
    }

    if (issues.length > 0) {
      console.error(`❌ [${loc.code}] ${loc.name}: ${issues.join(', ')}`);
      hasErrors = true;
    } else {
      console.log(`✅ [${loc.code}] ${loc.name} (${loc.code}): 100% complete across all 6 systems.`);
    }
  }

  if (hasErrors) {
    console.error('\n❌ Locale validation failed with errors.\n');
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${SUPPORTED_LOCALES.length} locales are 100% complete and validated!\n`);
  }
} else {
  console.log(`Unknown command: ${command}. Available commands: list, validate`);
}
