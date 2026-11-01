import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load the 44 paragraphs of "My Lord Bag of Rice"
const auditScript = fs.readFileSync(path.join(rootDir, 'scripts', 'audit_story_bag_of_rice.py'), 'utf-8');
const match = auditScript.match(/STORY_TEXT\s*=\s*"""([\s\S]*?)"""/);
if (!match) throw new Error('Could not find STORY_TEXT in audit_story_bag_of_rice.py');

const storyParagraphs = match[1]
  .trim()
  .split('\n')
  .map(p => p.trim())
  .filter(p => p.length > 0);

console.log(`Parsed ${storyParagraphs.length} paragraphs for My Lord Bag of Rice.`);

// 36 Locale Titles
const LOCALIZED_TITLES = {
  'ru': 'Мой господин Мешок Риса',
  'uk': 'Мій пане Мішок Рису',
  'en': 'My Lord Bag of Rice',
  'de': 'Mein Herr Reissack',
  'es': 'Mi Señor Saco de Arroz',
  'fr': 'Mon Seigneur Sac de Riz',
  'pl': 'Mój Pan Wór Ryżu',
  'tr': 'Efendim Pirinç Çuvalı',
  'it': 'Mio Signore Sacco di Riso',
  'ro': 'Stăpânul meu Sacul de Orez',
  'bg': 'Господарю мой Торба Ориз',
  'hu': 'Rizseszsák uram',
  'el': 'Ο Άρχοντάς μου Σάκος Ρυζιού',
  'da': 'Min Herre Rissæk',
  'lv': 'Mans kungs Rīsu maiss',
  'lt': 'Mano valdove Ryžių maiše',
  'pt': 'Meu Senhor Saco de Arroz',
  'sk': 'Môj pán Vrece ryže',
  'sl': 'Moj gospod Vreča riža',
  'fi': 'Herrani Riisisäkki',
  'hr': 'Moj gospodaru Vrećo riže',
  'cs': 'Můj pane Pytel rýže',
  'sv': 'Min Herre Rissäck',
  'et': 'Mu isand Riisikott',
  'hi': 'माई लॉर्ड चावल का थैला',
  'bn': 'মাই লর্ড চালের বস্তা',
  'ar': 'سيدي كيس الأرز',
  'fa': 'ارباب من کیسه برنج',
  'ur': 'مائی لارڈ چاول کی بوری',
  'id': 'Tuanku Karung Beras',
  'vi': 'Lãnh chúa Bao Gạo',
  'th': 'ท่านลอร์ดกระสอบข้าว',
  'ko': '쌀자루 나리',
  'ja': '俵藤太（米袋の殿様）',
  'zh': '米袋领主',
  'kk': 'Менің әміршім Күріш Қабы'
};

// 2. Import existing modules
const { MILESTONE_STORIES } = await import('../frontend/components/modals/MilestoneStoryModal.js');
const { STORY_TRANSLATIONS } = await import('../frontend/components/modals/storyTranslations.js');

// 3. Shift MILESTONE_STORIES
const newStories = {};

// Zero story
newStories["0"] = {
  milestone: 0,
  titleKey: "storyTitle0",
  translationKey: "storyFull0",
  badgeKey: "badge0",
  title: "My Lord Bag of Rice",
  author: "Yei Theodora Ozaki",
  coverImage: "assets/images/my_lord_bag_of_rice.webp",
  hideFullTranslation: true,
  paragraphs: storyParagraphs
};

// Shift 0..1800 to 50..1850
for (let m = 0; m <= 1800; m += 50) {
  const oldStory = MILESTONE_STORIES[String(m)];
  if (!oldStory) continue;
  const newM = m + 50;
  newStories[String(newM)] = {
    milestone: newM,
    titleKey: `storyTitle${newM}`,
    translationKey: `storyFull${newM}`,
    badgeKey: `badge${newM}`,
    title: oldStory.title,
    paragraphs: oldStory.paragraphs
  };
}

console.log(`Constructed new MILESTONE_STORIES with ${Object.keys(newStories).length} stories (0 to 1850).`);

// 4. Shift STORY_TRANSLATIONS
const newTranslations = {};
const locales = Object.keys(STORY_TRANSLATIONS);

for (const loc of locales) {
  const oldLoc = STORY_TRANSLATIONS[loc];
  const newLoc = {};

  // Copy basic UI keys
  const standardKeys = [
    'btnShowTranslation', 'btnHideTranslation', 'btnUnderstood', 'translationTitle',
    'xpAwarded', 'favAdded', 'favRemoved', 'storiesFolderTitle', 'storiesFolderDesc',
    'storiesEmptyTitle', 'storiesEmptyDesc', 'readStoryBtn', 'statusUnlocked',
    'statusLocked', 'settingsBtn', 'modalTitle'
  ];
  for (const k of standardKeys) {
    if (oldLoc[k] !== undefined) newLoc[k] = oldLoc[k];
  }

  // Set milestone 0
  newLoc['badge0'] = oldLoc['badge0'] || '🏆 Старт: 0 слов';
  newLoc['storyTitle0'] = LOCALIZED_TITLES[loc] || 'My Lord Bag of Rice';
  newLoc['storyFull0'] = [];

  // Template badge for 50..1850
  const badgeTemplate = oldLoc['badge1800'] || oldLoc['badge50'] || '🏆 Рубеж: {N} слов';

  // Shift milestones 0..1800 -> 50..1850
  for (let m = 0; m <= 1800; m += 50) {
    const newM = m + 50;
    const oldTitle = oldLoc[`storyTitle${m}`];
    const oldFull = oldLoc[`storyFull${m}`];

    // Format new badge with exact localized word for milestone & words
    newLoc[`badge${newM}`] = badgeTemplate.replace(/\b1800\b|\b50\b|\b\d+\b/, String(newM));
    newLoc[`storyTitle${newM}`] = oldTitle || `Story ${newM}`;
    newLoc[`storyFull${newM}`] = oldFull || [];
  }

  newTranslations[loc] = newLoc;
}

console.log(`Constructed new STORY_TRANSLATIONS for ${Object.keys(newTranslations).length} locales.`);

// 5. Write updated storyTranslations.js
const translationsFile = path.join(rootDir, 'frontend', 'components', 'modals', 'storyTranslations.js');
const translationsContent = `// Single Source of Truth for Milestone Story Translations
// Exactly 36 official locales supported (milestones 0 to 1850, every 50 words)

export const STORY_TRANSLATIONS = ${JSON.stringify(newTranslations, null, 2)};

export function getStoryStrings(lang = 'ru') {
  const normalized = (lang || 'ru').toLowerCase();
  return STORY_TRANSLATIONS[normalized] || STORY_TRANSLATIONS['ru'];
}
`;
fs.writeFileSync(translationsFile, translationsContent, 'utf-8');
console.log(`Updated ${translationsFile} (${translationsContent.length} bytes).`);

// 6. Update MilestoneStoryModal.js
const modalFile = path.join(rootDir, 'frontend', 'components', 'modals', 'MilestoneStoryModal.js');
let modalCode = fs.readFileSync(modalFile, 'utf-8');

// Replace MILESTONE_STORIES object definition
const storiesDeclaration = `export const MILESTONE_STORIES = ${JSON.stringify(newStories, null, 2)};\n`;
modalCode = modalCode.replace(/export const MILESTONE_STORIES = \{[\s\S]*?\n\};\n/, storiesDeclaration);

// Add cover image support inside story modal body if not present
if (!modalCode.includes('story-cover-image')) {
  modalCode = modalCode.replace(
    `<div class="story-text-container" id="story-tokens-wrapper">`,
    `\${story.coverImage ? \`
          <div class="story-cover-wrapper" style="margin-bottom: 20px; text-align: center;">
            <img src="\${story.coverImage}" alt="\${escapeHtml(storyTitle)}" class="story-cover-image" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); display: block;" />
          </div>
        \` : ''}
        <div class="story-text-container" id="story-tokens-wrapper">`
  );
}

// Make full translation footer conditional on !story.hideFullTranslation
if (modalCode.includes('<div class="milestone-story-footer">')) {
  modalCode = modalCode.replace(
    `<div class="milestone-story-footer">
        <button class="story-btn-translation btn-orange" id="story-toggle-translation-btn">
          🎬 <span id="story-translation-btn-label">\${strings.btnShowTranslation}</span>
        </button>
      </div>`,
    `\${!story.hideFullTranslation && translationParagraphs.length > 0 ? \`
      <div class="milestone-story-footer">
        <button class="story-btn-translation btn-orange" id="story-toggle-translation-btn">
          🎬 <span id="story-translation-btn-label">\${strings.btnShowTranslation}</span>
        </button>
      </div>
      \` : ''}`
  );
}

// Guard toggleTranslationBtn listener
modalCode = modalCode.replace(
  `toggleTranslationBtn.addEventListener('click', async () => {`,
  `if (toggleTranslationBtn) toggleTranslationBtn.addEventListener('click', async () => {`
);

fs.writeFileSync(modalFile, modalCode, 'utf-8');
console.log(`Updated ${modalFile}.`);

// 7. Update StoriesView.js
const storiesViewFile = path.join(rootDir, 'frontend', 'components', 'favorites', 'StoriesView.js');
let storiesViewCode = fs.readFileSync(storiesViewFile, 'utf-8');

// Dynamic milestones from MILESTONE_STORIES
storiesViewCode = storiesViewCode.replace(
  `const allMilestones = Array.from({ length: 37 }, (_, i) => i * 50);`,
  `const allMilestones = Object.keys(MILESTONE_STORIES).map(Number).sort((a, b) => a - b);`
);

// Add cover image to unlocked card if not present
if (!storiesViewCode.includes('story-card-cover-wrapper')) {
  storiesViewCode = storiesViewCode.replace(
    `<h3 class="story-card-title">\${escapeHtml(title)}</h3>`,
    `\${story.coverImage ? \`
            <div class="story-card-cover-wrapper" style="margin: 8px 0 12px 0; border-radius: 12px; overflow: hidden; max-height: 140px;">
              <img src="\${story.coverImage}" alt="\${escapeHtml(title)}" style="width: 100%; height: 140px; object-fit: cover; display: block;" />
            </div>
          \` : ''}
          <h3 class="story-card-title">\${escapeHtml(title)}</h3>`
  );
}

fs.writeFileSync(storiesViewFile, storiesViewCode, 'utf-8');
console.log(`Updated ${storiesViewFile}.`);

// 8. Update index.html
const indexHtmlFile = path.join(rootDir, 'frontend', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlFile, 'utf-8');
indexHtml = indexHtml.replace(
  `if (currentPassedMilestone > savedHighest && currentPassedMilestone <= 1800) {`,
  `if (currentPassedMilestone > savedHighest && currentPassedMilestone <= 1850) {`
);
fs.writeFileSync(indexHtmlFile, indexHtml, 'utf-8');
console.log(`Updated ${indexHtmlFile}.`);

// 9. Update tests/release_quality_gates.test.mjs
const testFile = path.join(rootDir, 'tests', 'release_quality_gates.test.mjs');
let testCode = fs.readFileSync(testFile, 'utf-8');
testCode = testCode.replace(
  `assert.equal(Object.keys(MILESTONE_STORIES).length, 37, 'MILESTONE_STORIES must include all 37 dialogues');`,
  `assert.equal(Object.keys(MILESTONE_STORIES).length, 38, 'MILESTONE_STORIES must include all 38 stories');`
);
testCode = testCode.replace(
  `for (let i = 0; i < 37; i++) {`,
  `for (let i = 0; i < 38; i++) {`
);
fs.writeFileSync(testFile, testCode, 'utf-8');
console.log(`Updated ${testFile}.`);

console.log('Migration completed successfully!');
