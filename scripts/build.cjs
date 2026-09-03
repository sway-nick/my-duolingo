const fs = require('fs');
const path = require('path');

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

  // 0. Automatically generate playlist.json for all videos in frontend/assets/video
  const videoDir = path.join(__dirname, '../frontend/assets/video');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  const videoFiles = fs.readdirSync(videoDir).filter(f => /\.(mp4|webm|mov)$/i.test(f)).sort();
  fs.writeFileSync(path.join(videoDir, 'playlist.json'), JSON.stringify(videoFiles.length > 0 ? videoFiles : ['cat.mp4'], null, 2));

  // 1. Sync frontend/ -> docs/
  if (!fs.existsSync('./docs')) fs.mkdirSync('./docs', { recursive: true });
  copyRecursiveSync('./frontend', './docs');

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
    'sw.js'
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
