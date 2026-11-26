const fs = require('fs');
const path = require('path');
const { optimizeWordsData } = require('./optimize_words_data.cjs');

function minifyCssContent(css) {
  const preserved = [];
  const keep = (str) => {
    const token = `__CSS_KEEP_${preserved.length}__`;
    preserved.push(str);
    return token;
  };

  let out = '';
  let i = 0;
  const len = css.length;

  while (i < len) {
    const ch = css[i];

    // Strip /* ... */ comments (replace with space so adjacent tokens cannot merge)
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? len : end + 2;
      out += ' ';
      continue;
    }

    // Preserve quoted strings '...' or "..."
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < len) {
        if (css[j] === '\\') { j += 2; continue; }
        if (css[j] === quote) { j++; break; }
        j++;
      }
      out += keep(css.slice(i, j));
      i = j;
      continue;
    }

    const prevOk = i === 0 || !/[a-zA-Z0-9_-]/.test(css[i - 1]);

    // Preserve url(...) verbatim
    if (prevOk && (ch === 'u' || ch === 'U') && /^url\s*\(/i.test(css.slice(i, i + 8))) {
      let j = css.indexOf('(', i) + 1;
      let depth = 1;
      while (j < len && depth > 0) {
        if (css[j] === '"' || css[j] === "'") {
          const q = css[j++];
          while (j < len) {
            if (css[j] === '\\') { j += 2; continue; }
            if (css[j] === q) { j++; break; }
            j++;
          }
          continue;
        }
        if (css[j] === '(') depth++;
        else if (css[j] === ')') depth--;
        j++;
      }
      out += keep(css.slice(i, j));
      i = j;
      continue;
    }

    // Preserve spacing inside calc(...), min(...), max(...), clamp(...)
    if (prevOk && /^(calc|min|max|clamp)\(/i.test(css.slice(i, i + 7))) {
      let j = css.indexOf('(', i) + 1;
      let depth = 1;
      while (j < len && depth > 0) {
        if (css[j] === '(') depth++;
        else if (css[j] === ')') depth--;
        j++;
      }
      const expr = css.slice(i, j)
        .replace(/\s+/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/\s*,\s*/g, ',');
      out += keep(expr);
      i = j;
      continue;
    }

    out += ch;
    i++;
  }

  out = out
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/\s+([>~+])\s+/g, '$1')
    .replace(/;}/g, '}')
    .trim();

  return out.replace(/__CSS_KEEP_(\d+)__/g, (_, idx) => preserved[Number(idx)]);
}

function cleanStaleAssetsInRoot(assetRoot) {
  if (!fs.existsSync(assetRoot)) return;
  const staleRelPaths = [
    'icons/test_transparent_512.png',
    'icons/cute_ai_robot.png',
    'icons/golden_crown.png',
    'icons/pro_gem_diamond_512.png',
    'icons/pro_gem_amber_512.png',
    'icons/pro_crown_512.png',
    'images/aladdin_and_the_magic_lamp.png',
    'images/my_lord_bag_of_rice.png',
    'css/app.css',
  ];
  for (const rel of staleRelPaths) {
    const p = path.join(assetRoot, rel);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  const avatarsDir = path.join(assetRoot, 'avatars');
  if (fs.existsSync(avatarsDir)) {
    for (const f of fs.readdirSync(avatarsDir)) {
      if (/^avatar_\d+\.png$/i.test(f)) {
        const webpPartner = path.join(avatarsDir, f.replace(/\.png$/i, '.webp'));
        if (fs.existsSync(webpPartner)) {
          fs.unlinkSync(path.join(avatarsDir, f));
        }
      }
    }
  }
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

  // 0.05. Validate JavaScript syntax of all frontend JS files and inline <script> tags in frontend/index.html
  const { execSync } = require('child_process');
  function validateAllJsSyntax(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory() && !['node_modules', '.git', 'audio', 'dist'].includes(f.name)) {
        validateAllJsSyntax(p);
      } else if (f.isFile() && f.name.endsWith('.js')) {
        try {
          execSync(`node --check "${p}"`, { stdio: 'pipe' });
        } catch (err) {
          throw new Error(`❌ BUILD FAILED: SyntaxError in ${p}!\n${err.stderr ? err.stderr.toString() : err.message}`);
        }
      }
    }
  }
  validateAllJsSyntax(path.join(__dirname, '../frontend'));
  console.log('🔍 Comprehensive JS syntax integrity passed: all frontend JS files valid.');

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
  const APP_BUILD_VERSION = '423.0';
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
  cleanStaleAssetsInRoot('./docs/assets');
  ['./docs/assets/css/main.css'].forEach((cssFile) => {
    if (fs.existsSync(cssFile)) {
      const rawCss = fs.readFileSync(cssFile, 'utf8');
      const minCss = minifyCssContent(rawCss);
      fs.writeFileSync(cssFile, minCss, 'utf8');
      console.log(`🎨 Minified ${cssFile}: ${(Buffer.byteLength(rawCss) / 1024).toFixed(1)} KB -> ${(Buffer.byteLength(minCss) / 1024).toFixed(1)} KB`);
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
  copyRecursiveSync('./frontend/config', './config');
  copyRecursiveSync('./frontend/assets', './assets');
  cleanStaleAssetsInRoot('./assets');
  if (fs.existsSync('./assets/css/main.css')) {
    const rawRootCss = fs.readFileSync('./assets/css/main.css', 'utf8');
    const minRootCss = minifyCssContent(rawRootCss);
    fs.writeFileSync('./assets/css/main.css', minRootCss, 'utf8');
  }
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

if (require.main === module) {
  build();
}

module.exports = { minifyCssContent, cleanStaleAssetsInRoot, build };
