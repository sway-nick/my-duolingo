import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Read i18n.js
const i18nContent = fs.readFileSync(path.join(ROOT_DIR, 'frontend/services/i18n.js'), 'utf8');

// Parse translations object
const match = i18nContent.match(/const translations\s*=\s*(\{[\s\S]*?\n\};)/);
if (!match) {
  console.error('Could not find translations object in i18n.js');
  process.exit(1);
}

// Evaluate translations object safely in sandbox
const context = {};
vm.runInNewContext(match[0].replace(/^const\s+/, 'var '), context);
const translations = context.translations;

const locales = Object.keys(translations);
console.log(`Defined locales in i18n.js (${locales.length}):`, locales.join(', '));

// Collect all unique keys across all locales
const allKnownKeys = new Set();
locales.forEach(loc => {
  Object.keys(translations[loc]).forEach(k => allKnownKeys.add(k));
});
console.log('Total unique translation keys in i18n.js dictionary:', allKnownKeys.size);

// 2. Scan all JS and HTML files in frontend/ for t('...') or data-i18n
function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'audio' && file !== 'dist') {
        results = results.concat(findFiles(fullPath, filter));
      }
    } else if (filter.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const jsFiles = findFiles(path.join(ROOT_DIR, 'frontend'), /\.(js|html)$/);
console.log('Scanned UI files:', jsFiles.length);

const usedKeys = new Set();
const keyRegex = /\bt\(\s*['"]([a-zA-Z0-9_-]+)['"]/g;
const dataI18nRegex = /data-i18n=['"]([a-zA-Z0-9_-]+)['"]/g;

jsFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = keyRegex.exec(content)) !== null) {
    usedKeys.add(m[1]);
  }
  while ((m = dataI18nRegex.exec(content)) !== null) {
    usedKeys.add(m[1]);
  }
});

console.log('Unique t() / data-i18n keys actively referenced in UI code:', usedKeys.size);

// 1b. Read widgetTranslations.js
const widgetContent = fs.readFileSync(path.join(ROOT_DIR, 'frontend/services/widgetTranslations.js'), 'utf8');
const widgetMatch = widgetContent.match(/export const WIDGET_TRANSLATIONS\s*=\s*(\{[\s\S]*?\n\};)/);
let widgetTranslations = {};
if (widgetMatch) {
  const wContext = {};
  vm.runInNewContext(widgetMatch[0].replace(/^export const\s+/, 'var '), wContext);
  widgetTranslations = wContext.WIDGET_TRANSLATIONS || {};
}
console.log(`Loaded WIDGET_TRANSLATIONS for ${Object.keys(widgetTranslations).length} locales.`);

// 3. Check coverage for each locale
console.log('\n========================================');
console.log('📊 COMBINED (CORE + WIDGET) LOCALE COVERAGE AUDIT REPORT');
console.log('========================================');
const missingByLocale = {};
locales.forEach(loc => {
  const locObj = translations[loc] || {};
  const wObj = widgetTranslations[loc] || {};
  const missing = [];
  usedKeys.forEach(k => {
    const hasInCore = typeof locObj[k] === 'string' && locObj[k].length > 0;
    const hasInWidget = typeof wObj[k] === 'string' && wObj[k].length > 0;
    if (!hasInCore && !hasInWidget) {
      missing.push(k);
    }
  });
  if (missing.length > 0) {
    missingByLocale[loc] = missing;
  }
  const statusIcon = missing.length === 0 ? '✅' : '⚠️';
  const totalKeys = Object.keys(locObj).length + Object.keys(wObj).length;
  console.log(`${statusIcon} [${loc.padEnd(5)}] Combined keys: ${String(totalKeys).padStart(3)} | Missing UI keys: ${missing.length}`);
});

if (Object.keys(missingByLocale).length > 0) {
  console.log('\n⚠️ Details of missing keys by locale:');
  for (const [loc, keys] of Object.entries(missingByLocale)) {
    console.log(`\nLocale "${loc}" (${keys.length} missing):`);
    console.log(keys.join(', '));
  }
} else {
  console.log('\n🎉 PERFECT 100% COVERAGE! All used UI keys exist in all 33 locales.');
}

// 4. Check for U+FFFD corruptions in i18n.js
const hasCorrupt = i18nContent.includes('\ufffd');
console.log('\nZero U+FFFD corruption check in i18n.js:', hasCorrupt ? '❌ FAILED (found corrupted chars)' : '✅ PASSED (0 corrupted chars)');

// 5. Check Android native strings.xml for all locales
console.log('\n--- Android native strings.xml check ---');
const resDir = path.join(ROOT_DIR, 'android/app/src/main/res');
const valueDirs = fs.readdirSync(resDir).filter(d => d.startsWith('values'));
console.log(`Found ${valueDirs.length} values directories:`, valueDirs.join(', '));

valueDirs.forEach(d => {
  const strXml = path.join(resDir, d, 'strings.xml');
  if (fs.existsSync(strXml)) {
    const xmlContent = fs.readFileSync(strXml, 'utf8');
    const appNameMatch = xmlContent.match(/name="app_name">([^<]+)<\/string>/);
    const appName = appNameMatch ? appNameMatch[1] : 'NOT FOUND';
    const hasUfffd = xmlContent.includes('\ufffd');
    console.log(`[${d}] app_name: "${appName}" | U+FFFD: ${hasUfffd ? 'CORRUPT' : 'CLEAN'}`);
  }
});
