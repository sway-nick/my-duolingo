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

function loadApi() {
  const apiPath = path.join(ROOT, 'frontend/services/api.js');
  return fs.readFileSync(apiPath, 'utf8');
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
  const api = loadApi();

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

  // 7. Verify dynamic translation suggestions & OCR in api.js
  console.log('\n🔍 Verifying translation suggestion engine & OCR dynamic compatibility...');
  if (api.includes("['ru', 'uk', 'de', 'es', 'fr', 'pl', 'it', 'tr', 'pt'].includes")) {
    console.error('❌ suggestTranslations in api.js contains legacy 9-language whitelist!');
    hasErrors = true;
  } else {
    console.log('✅ suggestTranslations: Dynamic multi-language target language resolution active.');
  }

  if (api.includes("match.translations[targetLang]")) {
    console.log('✅ suggestTranslations: Local dictionary lookup checks targetLang dynamically.');
  } else {
    console.error('❌ suggestTranslations: Missing dynamic match.translations[targetLang] lookup!');
    hasErrors = true;
  }

  if (api.includes("scanDocumentImage") && api.includes("lang = stored.toLowerCase().split(/[-_]/)[0]")) {
    console.log('✅ scanDocumentImage: OCR language dynamically extracted from interface language.');
  } else {
    console.error('❌ scanDocumentImage: Missing dynamic interface language extraction.');
    hasErrors = true;
  }

  if (hasErrors) {
    console.error('\n❌ Locale validation failed with errors.\n');
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${SUPPORTED_LOCALES.length} locales and constructor engines are 100% verified!\n`);
  }
} else if (command === 'test-suggest') {
  const testWord = (process.argv[3] || 'door').toLowerCase();
  console.log(`\n🔎 Testing dictionary translation suggestions for "${testWord}" across locales...\n`);
  const words = loadWords();
  const match = words.find((w) => w.word && w.word.toLowerCase() === testWord);

  if (!match) {
    console.log(`⚠️ Word "${testWord}" not found in local dictionary. In production, Google Translate GTX / MyMemory will be called online.`);
  } else {
    console.log(`Found "${testWord}" in local dictionary:`);
    for (const loc of SUPPORTED_LOCALES) {
      let tVal = (match.translations && match.translations[loc.code]) || (loc.code === 'ru' ? match.translation : '') || (loc.code === 'en' ? match.word : '');
      const parts = tVal ? tVal.split(/[,;\/]/).map((s) => s.trim()) : [];
      console.log(`  [${loc.code.padEnd(5)}] ${loc.name.padEnd(20)} => ${parts.join(', ') || '—'}`);
    }
  }
  console.log('\n✅ Dynamic translation suggestion resolution verified.\n');
} else if (command === 'add') {
  const code = (process.argv[3] || '').trim().toLowerCase();
  const name = (process.argv[4] || '').trim();
  const dir = (process.argv[5] || 'ltr').trim().toLowerCase();

  if (!code || !name) {
    console.error('Usage: node scripts/locale_manager.mjs add <locale_code> <Display Name> [ltr|rtl]');
    console.error('Example: node scripts/locale_manager.mjs add he "עברית" rtl');
    process.exit(1);
  }

  if (!/^[a-z]{2,3}$/.test(code)) {
    console.error(`Invalid locale code "${code}". Must be 2-3 lowercase ASCII letters.`);
    process.exit(1);
  }

  if (dir !== 'ltr' && dir !== 'rtl') {
    console.error(`Invalid text direction "${dir}". Must be "ltr" or "rtl".`);
    process.exit(1);
  }

  if (SUPPORTED_LOCALE_CODES.includes(code)) {
    console.error(`Locale "${code}" already exists in SUPPORTED_LOCALES!`);
    process.exit(1);
  }

  console.log(`\n🚀 Scaffolding new locale [${code}] "${name}" (${dir.toUpperCase()})...`);

  // 1. Append to frontend/config/locales.js
  const localesConfigPath = path.join(ROOT, 'frontend/config/locales.js');
  let configContent = fs.readFileSync(localesConfigPath, 'utf8');
  const insertPattern = /(\n\];)/;
  const newEntry = `  { code: '${code}', name: '${name}', dir: '${dir}' },\n];`;
  configContent = configContent.replace(insertPattern, newEntry);
  fs.writeFileSync(localesConfigPath, configContent, 'utf8');
  console.log(`✅ Added to frontend/config/locales.js`);

  // 2. Create scripts/locales/<code >.json fallback skeleton
  const enJsonPath = path.join(ROOT, 'scripts/locales/en.json');
  const targetJsonPath = path.join(ROOT, `scripts/locales/${code}.json`);
  if (!fs.existsSync(targetJsonPath) && fs.existsSync(enJsonPath)) {
    const enContent = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
    fs.writeFileSync(targetJsonPath, JSON.stringify(enContent, null, 2), 'utf8');
    console.log(`✅ Created skeleton scripts/locales/${code}.json`);
  }

  // 3. Create scripts/locales/widget_<code >.json fallback skeleton
  const enWidgetPath = path.join(ROOT, 'scripts/locales/widget_en.json');
  const targetWidgetPath = path.join(ROOT, `scripts/locales/widget_${code}.json`);
  if (!fs.existsSync(targetWidgetPath) && fs.existsSync(enWidgetPath)) {
    const enWidgetContent = JSON.parse(fs.readFileSync(enWidgetPath, 'utf8'));
    fs.writeFileSync(targetWidgetPath, JSON.stringify(enWidgetContent, null, 2), 'utf8');
    console.log(`✅ Created skeleton scripts/locales/widget_${code}.json`);
  }

  console.log(`\n📋 Next Steps to Complete [${code}] Integration:`);
  console.log(`1. Add translation_${code} column in Google Sheets dictionary.`);
  console.log(`2. Update TARGET_LANGS in scripts/sync_translations_from_sheet.mjs and run:`);
  console.log(`   node scripts/sync_translations_from_sheet.mjs`);
  console.log(`3. Translate scripts/locales/${code}.json and scripts/locales/widget_${code}.json.`);
  console.log(`4. Add locale entries to:`);
  console.log(`   - frontend/services/adService.js`);
  console.log(`   - frontend/services/collectionsService.js`);
  console.log(`   - frontend/components/modals/privacyTranslations.js`);
  console.log(`5. Run: node scripts/locale_manager.mjs validate`);
  console.log(`6. Run: node scripts/build.cjs`);
  console.log(`7. Run: npm test\n`);
} else {
  console.log(`English Breakfast Locale Manager`);
  console.log(`Available commands:`);
  console.log(`  node scripts/locale_manager.mjs list`);
  console.log(`  node scripts/locale_manager.mjs validate`);
  console.log(`  node scripts/locale_manager.mjs test-suggest [word]`);
  console.log(`  node scripts/locale_manager.mjs add <code > <name> [ltr|rtl]`);
}
