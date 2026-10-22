const fs = require('fs');
const path = require('path');
const { optimizeWordsData } = require('./optimize_words_data.cjs');

function minifyCssContent(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    if (fs.existsSync(dest)) {
      const destStats = fs.statSync(dest);
      if (destStats.size === stats.size && Math.abs(destStats.mtimeMs - stats.mtimeMs) < 1000) {
        return;
      }
    }
    fs.copyFileSync(src, dest);
  }
}

function build() {
  console.log('📦 Building English Trainer PWA from frontend/ source...');

  // 0. Validate words.json encoding (Zero U+FFFD tolerance) & optimize JSON payload
  const wordsPath = path.join(__dirname, '../frontend/assets/data/words.json');
  if (fs.existsSync(wordsPath)) {
    const rawWords = fs.readFileSync(wordsPath, 'utf8');
    if (rawWords.includes('\ufffd')) {
      throw new Error('❌ BUILD FAILED: Detected corrupted UTF-8 replacement character (U+FFFD) in frontend/assets/data/words.json!');
    }
    optimizeWordsData();
    console.log('🔍 Data integrity & compaction passed: 0 corrupted U+FFFD characters in words.json.');
  }

  // 0.02. Optimize bloated favicon.svg & remove unused test icon assets
  const faviconSvgPath = path.join(__dirname, '../frontend/favicon.svg');
  const icon192Path = fs.existsSync(path.join(__dirname, '../frontend/web-app-manifest-192x192.png'))
    ? path.join(__dirname, '../frontend/web-app-manifest-192x192.png')
    : path.join(__dirname, '../frontend/favicon-96x96.png');
  if (fs.existsSync(faviconSvgPath) && fs.existsSync(icon192Path)) {
    const svgStat = fs.statSync(faviconSvgPath);
    if (svgStat.size > 100000) {
      const b64 = fs.readFileSync(icon192Path).toString('base64');
      const compactSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 192 192" width="192" height="192"><image width="192" height="192" xlink:href="data:image/png;base64,${b64}"/></svg>`;
      fs.writeFileSync(faviconSvgPath, compactSvg, 'utf8');
      console.log(`🎨 Optimized frontend/favicon.svg: ${(svgStat.size / 1024).toFixed(1)} KB -> ${(Buffer.byteLength(compactSvg) / 1024).toFixed(1)} KB`);
    }
  }
  ['../frontend/assets/icons/test_transparent_512.png', '../docs/assets/icons/test_transparent_512.png', '../assets/icons/test_transparent_512.png'].forEach((rel) => {
    const p = path.join(__dirname, rel);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });

  // 0.05. Validate JavaScript syntax of all inline <script> tags in frontend/index.html
  const indexPath0 = path.join(__dirname, '../frontend/index.html');
  if (fs.existsSync(indexPath0)) {
    const html0 = fs.readFileSync(indexPath0, 'utf8');
    const scriptRegex0 = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match0;
    let scriptIdx0 = 0;
    while ((match0 = scriptRegex0.exec(html0)) !== null) {
      const code0 = match0[1].trim();
      if (!code0) continue;
      scriptIdx0++;
      const tmpFile0 = path.join(__dirname, `../.tmp_build_script_${scriptIdx0}.mjs`);
      fs.writeFileSync(tmpFile0, code0, 'utf8');
      try {
        const { execSync } = require('child_process');
        execSync(`node --check "${tmpFile0}"`);
      } catch (err) {
        try { fs.unlinkSync(tmpFile0); } catch (e) {}
        throw new Error(`❌ BUILD FAILED: SyntaxError in frontend/index.html script #${scriptIdx0}!`);
      }
      try { fs.unlinkSync(tmpFile0); } catch (e) {}
    }
    console.log('🔍 HTML/JS syntax integrity passed: all scripts in index.html valid.');
  }

  // 0.1. Automatically generate playlist.json and inject real video list into index.html
  const videoDir = path.join(__dirname, '../frontend/assets/video');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  const videoFiles = fs.readdirSync(videoDir)
    .filter(f => /^cat\d+\.(mp4|webm|mov)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt((a.match(/\d+/) || [0])[0], 10);
      const numB = parseInt((b.match(/\d+/) || [0])[0], 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  const validPlaylist = videoFiles.length > 0 ? videoFiles : ['cat4.mp4'];
  fs.writeFileSync(path.join(videoDir, 'playlist.json'), JSON.stringify(validPlaylist, null, 2));

  // Auto-inject into frontend/index.html so it works synchronously without waiting for async fetch
  const indexPath = path.join(__dirname, '../frontend/index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    const playlistRegex = /let wotdPlaylist = \[.*?\];/;
    const newPlaylistCode = `let wotdPlaylist = ${JSON.stringify(validPlaylist)};`;
    if (playlistRegex.test(indexHtml)) {
      indexHtml = indexHtml.replace(playlistRegex, newPlaylistCode);
      fs.writeFileSync(indexPath, indexHtml, 'utf8');
    }
  }

  // 0.2. Align all ?v= import query versions across frontend to a single APP_BUILD_VERSION
  const APP_BUILD_VERSION = '386.0';
  function normalizeVersionsInDir(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        normalizeVersionsInDir(fullPath);
      } else if (/\.(js|html)$/.test(entry.name)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (/\?v=[0-9.]+/.test(content)) {
          const replaced = content.replace(/\?v=[0-9.]+/g, `?v=${APP_BUILD_VERSION}`);
          if (replaced !== content) {
            fs.writeFileSync(fullPath, replaced, 'utf8');
          }
        }
      }
    });
  }
  normalizeVersionsInDir(path.join(__dirname, '../frontend'));
  console.log(`📌 All module import query versions aligned to ?v=${APP_BUILD_VERSION}`);

  // 1. Sync frontend/ -> docs/
  if (!fs.existsSync('./docs')) fs.mkdirSync('./docs', { recursive: true });
  copyRecursiveSync('./frontend', './docs');

  // 1.1. Minify CSS assets in production docs/ output (used by Capacitor Android & Web)
  ['./docs/assets/css/styles.css', './docs/assets/css/mobile-styles.css'].forEach((cssFile) => {
    if (fs.existsSync(cssFile)) {
      const rawCss = fs.readFileSync(cssFile, 'utf8');
      fs.writeFileSync(cssFile, minifyCssContent(rawCss), 'utf8');
    }
  });

  // 2. Sync all root-level web app & favicon files from frontend/ to root
  const rootFilesToSync = [
    'index.html',
    'favicon.ico',
    'favicon.svg',
    'favicon.png',
    'favicon-96x96.png',
    'apple-touch-icon.png',
    'site.webmanifest',
    'manifest.json',
    'web-app-manifest-192x192.png',
    'web-app-manifest-512x512.png',
    'privacy.html',
    '.nojekyll',
    'sw.js',
    'app-ads.txt'
  ];

  rootFilesToSync.forEach((filename) => {
    const srcFile = path.join('./frontend', filename);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join('./', filename));
    }
  });

  // 3. Sync frontend assets & modules to root for direct root hosting
  copyRecursiveSync('./frontend/components', './components');
  copyRecursiveSync('./frontend/services', './services');
  copyRecursiveSync('./frontend/assets', './assets');
  if (fs.existsSync('./frontend/.well-known')) {
    copyRecursiveSync('./frontend/.well-known', './.well-known');
  }

  // 4. Generate all-in-one backend bundle for Google Apps Script
  try {
    const bundle = require('./bundle_backend.cjs');
    if (typeof bundle.generateBackendBundle === 'function') {
      bundle.generateBackendBundle();
    }
  } catch (e) {
    console.warn('Backend bundle step skipped or failed:', e);
  }

  console.log('✅ Build successful! Single source of truth (frontend/) synchronized to docs/ and root.');
}

build();
