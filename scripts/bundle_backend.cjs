const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'backend', 'src');
const distDir = path.join(rootDir, 'backend', 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Order of inclusion
const filesOrder = [
  'utils/response.js',
  'utils/request.js',
  'services/spreadsheet.js',
  'api/health.js',
  'api/auth.js',
  'api/words.js',
  'api/progress.js',
  'api/settings.js',
  'api/leaderboard.js',
  'api/sync.js',
  'api/transcribe.js',
  'api/analytics.js',
  'router.js',
  'postRouter.js',
  'Code.js',
];

function generateBackendBundle() {
  let bundleContent = `/**
 * My Duolingo Backend - All In One Bundle
 * Generated on: ${new Date().toISOString()}
 * 
 * Paste this entire file into your Google Apps Script editor (Code.gs)
 */\n\n`;

  for (const relPath of filesOrder) {
    const fullPath = path.join(srcDir, ...relPath.split('/'));
    if (fs.existsSync(fullPath)) {
      const code = fs.readFileSync(fullPath, 'utf8');
      bundleContent += `// ==========================================\n`;
      bundleContent += `// FILE: ${relPath}\n`;
      bundleContent += `// ==========================================\n`;
      bundleContent += code + '\n\n';
    } else {
      console.warn('⚠️ File not found during bundle:', fullPath);
    }
  }

  const outputPath = path.join(distDir, 'Code.gs');
  fs.writeFileSync(outputPath, bundleContent, 'utf8');
  console.log('✅ Backend bundle generated at:', outputPath);
}

generateBackendBundle();
module.exports = { generateBackendBundle };

