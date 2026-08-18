const fs = require('fs');
const path = require('path');

const files = [
  'frontend/services/api.js',
  'frontend/services/authService.js',
  'frontend/services/audioService.js',
  'frontend/components/layout/AppLayout.js',
  'frontend/components/training/TrainingCard.js',
  'frontend/components/stats/StatsView.js',
  'frontend/components/settings/SettingsView.js',
  'frontend/components/favorites/FavoritesView.js',
  'frontend/components/dictionary/DictionaryView.js',
  'frontend/components/leaderboard/LeaderboardView.js',
  'frontend/components/auth/AuthModal.js',
  'frontend/components/settings/AvatarPickerModal.js',
  'frontend/components/modals/PrizePodiumModal.js'
];

const exportMap = {};

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const exports = new Set();
  const exportBlockMatch = code.match(/export\s*\{([^}]+)\}/);
  if (exportBlockMatch) {
    exportBlockMatch[1].split(',').forEach(s => {
      const name = s.trim().split(/\s+as\s+/)[0].trim();
      if (name) exports.add(name);
    });
  }
  const funcMatches = code.matchAll(/export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/g);
  for (const m of funcMatches) {
    exports.add(m[1]);
  }
  const constMatches = code.matchAll(/export\s+const\s+([a-zA-Z0-9_$]+)/g);
  for (const m of constMatches) {
    exports.add(m[1]);
  }
  exportMap[path.normalize(file).replace(/\\/g, '/')] = exports;
});

console.log('--- Checking Imports ---');
let hasError = false;

// Check index.html imports
const indexHtml = fs.readFileSync('frontend/index.html', 'utf8');
const indexImports = indexHtml.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g);
for (const m of indexImports) {
  const importedSymbols = m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
  const rawPath = m[2].split('?')[0];
  const targetPath = path.normalize(path.join('frontend', rawPath)).replace(/\\/g, '/');
  const targetExports = exportMap[targetPath];
  if (!targetExports) {
    console.error('❌ Target file not found for index.html import ->', targetPath);
    hasError = true;
  } else {
    importedSymbols.forEach(sym => {
      if (!targetExports.has(sym)) {
        console.error('❌ Missing export:', sym, 'in', targetPath, 'imported by index.html');
        hasError = true;
      }
    });
  }
}

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const importMatches = code.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g);
  for (const m of importMatches) {
    const importedSymbols = m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
    const rawPath = m[2].split('?')[0];
    const targetPath = path.normalize(path.join(dir, rawPath)).replace(/\\/g, '/');
    const targetExports = exportMap[targetPath];
    if (!targetExports) {
      console.error('❌ Target file not found for import:', file, '->', targetPath);
      hasError = true;
    } else {
      importedSymbols.forEach(sym => {
        if (!targetExports.has(sym)) {
          console.error('❌ Missing export:', sym, 'in', targetPath, 'imported by', file);
          hasError = true;
        }
      });
    }
  }
});

if (!hasError) {
  console.log('✅ ALL IMPORTS AND EXPORTS ARE 100% VALID AND RESOLVED!');
}
