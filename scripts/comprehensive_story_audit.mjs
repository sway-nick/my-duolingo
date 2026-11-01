import fs from 'fs';

// 1. Load dictionary
const words = JSON.parse(fs.readFileSync('./frontend/assets/data/words.json', 'utf8'));
const dictMap = new Map();
words.forEach(w => dictMap.set(String(w.word).toLowerCase().trim(), w));

// 2. Load stories & modal code directly
const modal = await import('../frontend/components/modals/MilestoneStoryModal.js');
const { MILESTONE_STORIES: stories, resolveWord, FUNCTION_WORDS_MAP } = modal;

// All 36 locales
const allLocales = [
  'ru', 'uk', 'en', 'de', 'es', 'fr', 'pl', 'tr', 'it', 'ro', 'bg', 'hu', 'el', 'da', 'lv', 'lt',
  'pt', 'sk', 'sl', 'fi', 'hr', 'cs', 'sv', 'et', 'hi', 'bn', 'ar', 'fa', 'ur', 'id', 'vi', 'th',
  'ko', 'ja', 'zh', 'kk'
];

console.log('=== 1. AUDIT OF CLICKABLE STORY WORDS ACROSS ALL 36 LOCALES ===');

const untranslatedReport = {};
const russianArtifactReport = {};

// Russian-specific letters that do NOT exist in Ukrainian:
// Russian has: ы, э, ъ, ё
// Ukrainian has: і, ї, є, ґ (and DOES NOT have ы, э, ъ, ё)
const RU_ONLY_REGEX = /[ыэъё]/i;

for (const lang of allLocales) {
  untranslatedReport[lang] = [];
  russianArtifactReport[lang] = [];

  for (const [mId, s] of Object.entries(stories)) {
    for (const p of s.paragraphs) {
      const norm = p.replace(/[\u2018\u2019\u02BC\u02BB]/g, "'");
      const tokens = norm.match(/[a-zA-Z'-]+|[^a-zA-Z'-]+/g) || [norm];
      for (const token of tokens) {
        if (!/[a-zA-Z]/.test(token)) continue;
        const clean = token.toLowerCase().replace(/^['-]+|['-]+$/g, '');
        if (!clean) continue;

        const res = resolveWord(token, dictMap, lang);
        if (!res || !res.translation || !res.translation.trim()) {
          untranslatedReport[lang].push({ token: clean, milestone: mId });
        } else {
          // Check for Russian artifacts in Ukrainian:
          if (lang === 'uk' && RU_ONLY_REGEX.test(res.translation)) {
            russianArtifactReport[lang].push({ token: clean, translation: res.translation, milestone: mId });
          } else if (!['ru', 'uk', 'bg', 'kk'].includes(lang) && /[а-яА-ЯёЁ]/.test(res.translation)) {
            // Non-cyrillic language containing Cyrillic characters!
            russianArtifactReport[lang].push({ token: clean, translation: res.translation, milestone: mId });
          }
        }
      }
    }
  }
}

let anyUntranslated = false;
for (const [lang, list] of Object.entries(untranslatedReport)) {
  if (list.length > 0) {
    anyUntranslated = true;
    const uniq = [...new Set(list.map(x => x.token))];
    console.log(`[FAIL] Locale "${lang}": ${list.length} untranslated tokens (${uniq.length} unique: ${uniq.join(', ')})`);
  }
}
if (!anyUntranslated) {
  console.log('[PASS] ZERO untranslated word tokens across all 38 stories in ALL 36 locales!');
}

let anyRussianArtifacts = false;
for (const [lang, list] of Object.entries(russianArtifactReport)) {
  if (list.length > 0) {
    anyRussianArtifacts = true;
    const uniq = [...new Set(list.map(x => `${x.token} -> "${x.translation}"`))];
    console.log(`[FAIL] Russian artifacts found in "${lang}": ${list.length} hits (${uniq.length} unique: ${uniq.slice(0, 10).join('; ')})`);
  }
}
if (!anyRussianArtifacts) {
  console.log('[PASS] ZERO Russian character artifacts found in non-Russian translations!');
}

// 2. Audit of full story texts, titles and badges in storyTranslations.js
console.log('\n=== 2. AUDIT OF FULL STORY TEXTS & STRINGS (storyTranslations.js) ===');
const { STORY_TRANSLATIONS } = await import('../frontend/components/modals/storyTranslations.js');

let fullStoryUntranslated = 0;
let fullStoryRussianArtifacts = 0;

for (const lang of allLocales) {
  const bundle = STORY_TRANSLATIONS[lang];
  if (!bundle) {
    console.log(`[FAIL] Entire locale "${lang}" missing in STORY_TRANSLATIONS!`);
    fullStoryUntranslated++;
    continue;
  }

  for (const [mId, s] of Object.entries(stories)) {
    const tKey = s.titleKey;
    const transKey = s.translationKey;
    const bKey = s.badgeKey;

    if (!bundle[tKey]) {
      console.log(`[FAIL] Locale "${lang}" missing title: ${tKey} for milestone ${mId}`);
      fullStoryUntranslated++;
    }
    if (!bundle[bKey]) {
      console.log(`[FAIL] Locale "${lang}" missing badge: ${bKey} for milestone ${mId}`);
      fullStoryUntranslated++;
    }
    if (mId !== '0') {
      const full = bundle[transKey];
      if (!full || (Array.isArray(full) && full.length === 0)) {
        console.log(`[FAIL] Locale "${lang}" missing full translation: ${transKey} for milestone ${mId}`);
        fullStoryUntranslated++;
      } else if (lang === 'uk') {
        const fullStr = Array.isArray(full) ? full.join(' ') : String(full);
        if (RU_ONLY_REGEX.test(fullStr)) {
          console.log(`[FAIL] Ukrainian full story ${transKey} contains Russian letters [ы, э, ъ, ё]!`);
          fullStoryRussianArtifacts++;
        }
      } else if (!['ru', 'uk', 'bg', 'kk'].includes(lang)) {
        const fullStr = Array.isArray(full) ? full.join(' ') : String(full);
        if (/[а-яА-ЯёЁ]/.test(fullStr)) {
          console.log(`[FAIL] Non-cyrillic locale "${lang}" full story ${transKey} contains Cyrillic characters!`);
          fullStoryRussianArtifacts++;
        }
      }
    }
  }
}

if (fullStoryUntranslated === 0) {
  console.log('[PASS] ZERO missing titles, badges, or full story translations across ALL 36 locales!');
}
if (fullStoryRussianArtifacts === 0) {
  console.log('[PASS] ZERO Russian language artifacts in non-Russian story texts!');
}
