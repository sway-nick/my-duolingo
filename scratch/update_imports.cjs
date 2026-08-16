const fs = require('fs');
const path = require('path');

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(/from\s+['"](\.[^'"]+\.js)(?:\?v=[\d\.]+)?['"]/g, (match, p1) => {
    return `from '${p1}?v=8.0'`;
  });
  fs.writeFileSync(filePath, updated, 'utf8');
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) processDir(full);
    else if (file.endsWith('.js')) updateImportsInFile(full);
  });
}

processDir('./frontend/components');
processDir('./frontend/services');

console.log('Updated import statements in frontend/ to v=8.0');
