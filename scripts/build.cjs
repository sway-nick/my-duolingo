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
    fs.copyFileSync(src, dest);
  }
}

function build() {
  console.log('📦 Building English Trainer PWA from frontend/ source...');

  // 1. Sync frontend/ -> docs/
  if (!fs.existsSync('./docs')) fs.mkdirSync('./docs', { recursive: true });
  copyRecursiveSync('./frontend', './docs');

  // 2. Sync root index.html from frontend/index.html
  fs.copyFileSync('./frontend/index.html', './index.html');

  // 3. Sync frontend assets & modules to root for direct root hosting
  copyRecursiveSync('./frontend/components', './components');
  copyRecursiveSync('./frontend/services', './services');
  copyRecursiveSync('./frontend/assets', './assets');

  console.log('✅ Build successful! Single source of truth (frontend/) synchronized to docs/ and root.');
}

build();
