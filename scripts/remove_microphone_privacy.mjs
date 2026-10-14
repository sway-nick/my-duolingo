import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function run() {
  const targetFiles = [
    path.join(ROOT, 'frontend/components/modals/privacyTranslations.js'),
    path.join(ROOT, 'components/modals/privacyTranslations.js'),
    path.join(ROOT, 'docs/components/modals/privacyTranslations.js'),
  ];

  const { PRIVACY_POLICY_DATA } = await import('../frontend/components/modals/privacyTranslations.js');
  const b0Texts = new Set(Object.values(PRIVACY_POLICY_DATA).map(d => d.sections[1].bullets[0].bold));

  console.log(`Found ${b0Texts.size} distinct microphone headers across 33 languages.`);

  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let removed = 0;
    const filteredLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let matchesMic = false;
      for (const boldText of b0Texts) {
        if (line.includes(`bold: '${boldText}'`) || line.includes(`bold: "${boldText}"`)) {
          matchesMic = true;
          break;
        }
      }
      if (matchesMic) {
        removed++;
      } else {
        filteredLines.push(line);
      }
    }

    fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf8');
    console.log(`✅ ${filePath}: removed ${removed} microphone bullet lines.`);
  }

  // Update privacy.html across docs, frontend, and root
  const privacyHtmlFiles = [
    path.join(ROOT, 'privacy.html'),
    path.join(ROOT, 'frontend/privacy.html'),
    path.join(ROOT, 'docs/privacy.html'),
  ];

  for (const pHtml of privacyHtmlFiles) {
    if (!fs.existsSync(pHtml)) continue;
    let htmlContent = fs.readFileSync(pHtml, 'utf8');
    // Remove Russian mic bullet
    htmlContent = htmlContent.replace(/<li><strong>Микрофон:<\/strong>[^<]*<\/li>\s*/gi, '');
    // Remove English mic bullet
    htmlContent = htmlContent.replace(/<li><strong>Microphone:<\/strong>[^<]*<\/li>\s*/gi, '');
    fs.writeFileSync(pHtml, htmlContent, 'utf8');
    console.log(`✅ ${pHtml}: removed microphone bullet in RU and EN.`);
  }

  console.log('\n🎉 Successfully updated privacy policy across all 33 languages and HTML pages!');
}

run().catch(console.error);
