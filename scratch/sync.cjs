const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

fs.copyFileSync('./frontend/index.html', './index.html');
fs.copyFileSync('./frontend/index.html', './docs/index.html');

copyRecursiveSync('./frontend/components', './components');
copyRecursiveSync('./frontend/services', './services');
copyRecursiveSync('./frontend/assets', './assets');

copyRecursiveSync('./frontend/components', './docs/components');
copyRecursiveSync('./frontend/services', './docs/services');
copyRecursiveSync('./frontend/assets', './docs/assets');

console.log('Successfully synced all frontend files to root / and docs/');
