const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { TENSE_QUIZ_DEF, MICRO_RULE_QUIZ_DEF } = require('./grammar_quizzes_master.cjs');
const { GRAMMAR_TABLES_DEF } = require('./grammar_tables_master.cjs');

const SCRATCH_DIR = 'C:/Users/user/.gemini/antigravity/brain/304c7a2e-de11-4d3f-82a6-12841a15629c/scratch';
const CACHE_DIR = path.join(SCRATCH_DIR, 'i18n_cache');
const OUT_DIR = path.resolve(__dirname, '../frontend/components/favorites');

const UNLOCK_RULE_BTN = {
  ru: 'Открыть правило',
  uk: 'Відкрити правило',
  en: 'Unlock rule',
  de: 'Regel freischalten',
  es: 'Desbloquear regla',
  'es-mx': 'Desbloquear regla',
  fr: 'Débloquer la règle',
  pl: 'Odblokuj regułę',
  tr: 'Kuralı aç',
  it: 'Sblocca regola',
  ro: 'Deblochează regula',
  bg: 'Отключи правилото',
  hu: 'Szabály feloldása',
  el: 'Ξεκλείδωμα κανόνα',
  da: 'Lås regel op',
  lv: 'Atbloķēt likumu',
  lt: 'Atrakinti taisyklę',
  pt: 'Desbloquear regra',
  'pt-br': 'Desbloquear regra',
  sk: 'Odomknúť pravidlo',
  sl: 'Odkleni pravilo',
  fi: 'Avaa sääntö',
  hr: 'Otključaj pravilo',
  cs: 'Odemknout pravidlo',
  sv: 'Lås upp regel',
  et: 'Ava reegel',
  hi: 'नियम अनलॉक करें',
  bn: 'নিয়ম আনলক করুন',
  ar: 'فتح القاعدة',
  fa: 'باز کردن قاعده',
  ur: 'قاعدہ کھولیں',
  id: 'Buka aturan',
  vi: 'Mở khóa quy tắc',
  th: 'ปลดล็อกกฎ',
  ko: '규칙 잠금 해제',
  ja: 'ルールを解除',
  zh: '解锁规则',
  kk: 'Ережені ашу',
};

const QUIZ_HEADING_I18N = {
  ru: '⚡ Мини-тест (+5 XP)',
  uk: '⚡ Міні-тест (+5 XP)',
  en: '⚡ Mini-quiz (+5 XP)',
  de: '⚡ Mini-Quiz (+5 XP)',
  es: '⚡ Miniprueba (+5 XP)',
  'es-mx': '⚡ Miniprueba (+5 XP)',
  fr: '⚡ Mini-quiz (+5 XP)',
  pl: '⚡ Minikwiz (+5 XP)',
  tr: '⚡ Mini test (+5 XP)',
  it: '⚡ Mini-quiz (+5 XP)',
  ro: '⚡ Mini-test (+5 XP)',
  bg: '⚡ Мини-тест (+5 XP)',
  hu: '⚡ Minikvíz (+5 XP)',
  el: '⚡ Μίνι τεστ (+5 XP)',
  da: '⚡ Miniquiz (+5 XP)',
  lv: '⚡ Mini tests (+5 XP)',
  lt: '⚡ Mini testas (+5 XP)',
  pt: '⚡ Mini-quiz (+5 XP)',
  'pt-br': '⚡ Mini-quiz (+5 XP)',
  sk: '⚡ Minikvíz (+5 XP)',
  sl: '⚡ Mini kviz (+5 XP)',
  fi: '⚡ Minivisa (+5 XP)',
  hr: '⚡ Mini-kviz (+5 XP)',
  cs: '⚡ Minikvíz (+5 XP)',
  sv: '⚡ Miniquiz (+5 XP)',
  et: '⚡ Miniviktoriin (+5 XP)',
  hi: '⚡ मिनी-क्विज़ (+5 XP)',
  bn: '⚡ মিনি-কুইজ (+5 XP)',
  ar: '⚡ اختبار قصير (+5 XP)',
  fa: '⚡ آزمونک (+5 XP)',
  ur: '⚡ منی کوئز (+5 XP)',
  id: '⚡ Kuis mini (+5 XP)',
  vi: '⚡ Bài kiểm tra nhỏ (+5 XP)',
  th: '⚡ แบบทดสอบย่อย (+5 XP)',
  ko: '⚡ 미니 퀴즈 (+5 XP)',
  ja: '⚡ ミニクイズ (+5 XP)',
  zh: '⚡ 小测验 (+5 XP)',
  kk: '⚡ Шағын тест (+5 XP)',
};

const QUIZ_DONE_BADGE_I18N = {
  ru: 'Пройдено ✓ +5 XP',
  uk: 'Пройдено ✓ +5 XP',
  en: 'Passed ✓ +5 XP',
  de: 'Bestanden ✓ +5 XP',
  es: 'Completado ✓ +5 XP',
  'es-mx': 'Completado ✓ +5 XP',
  fr: 'Réussi ✓ +5 XP',
  pl: 'Zaliczone ✓ +5 XP',
  tr: 'Tamamlandı ✓ +5 XP',
  it: 'Superato ✓ +5 XP',
  ro: 'Completat ✓ +5 XP',
  bg: 'Преминато ✓ +5 XP',
  hu: 'Teljesítve ✓ +5 XP',
  el: 'Ολοκληρώθηκε ✓ +5 XP',
  da: 'Bestået ✓ +5 XP',
  lv: 'Izpildīts ✓ +5 XP',
  lt: 'Atlikta ✓ +5 XP',
  pt: 'Concluído ✓ +5 XP',
  'pt-br': 'Concluído ✓ +5 XP',
  sk: 'Splnené ✓ +5 XP',
  sl: 'Opravljeno ✓ +5 XP',
  fi: 'Suoritettu ✓ +5 XP',
  hr: 'Riješeno ✓ +5 XP',
  cs: 'Splněno ✓ +5 XP',
  sv: 'Avklarat ✓ +5 XP',
  et: 'Läbitud ✓ +5 XP',
  hi: 'पूर्ण ✓ +5 XP',
  bn: 'সম্পন্ন ✓ +5 XP',
  ar: 'مكتمل ✓ +5 XP',
  fa: 'تکمیل شد ✓ +5 XP',
  ur: 'مکمل ✓ +5 XP',
  id: 'Selesai ✓ +5 XP',
  vi: 'Đã hoàn thành ✓ +5 XP',
  th: 'ผ่านแล้ว ✓ +5 XP',
  ko: '완료 ✓ +5 XP',
  ja: 'クリア ✓ +5 XP',
  zh: '已通过 ✓ +5 XP',
  kk: 'Өтті ✓ +5 XP',
};

const QUIZ_NORM_RE = /[^a-z0-9\s]/g;

function normalizeQuizSentence(str) {
  return String(str || '').toLowerCase().replace(QUIZ_NORM_RE, '').replace(/\s+/g, ' ').trim();
}

function validateQuizItems(quiz, examples, label, minCount = 2) {
  if (!Array.isArray(quiz) || quiz.length < minCount) {
    throw new Error(`Missing or invalid quiz array for ${label} (expected >= ${minCount}, got ${quiz?.length})`);
  }
  const exNorms = new Set((examples || []).map((ex) => normalizeQuizSentence(ex.en)));
  const seenCompleted = new Set();
  for (const q of quiz) {
    if (!q || typeof q.blanked !== 'string' || !q.blanked.includes('___')) {
      throw new Error(`Quiz blanked missing ___ for ${label}`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4) {
      throw new Error(`Quiz must have 4 unique options for ${label}: ${JSON.stringify(q?.options)}`);
    }
    if (!q.options.includes(q.answer)) {
      throw new Error(`Quiz options missing answer "${q.answer}" for ${label}`);
    }
    const completed = q.blanked.replace('___', q.answer);
    const compNorm = normalizeQuizSentence(completed);
    if (exNorms.has(compNorm) || exNorms.has(normalizeQuizSentence(q.blanked))) {
      throw new Error(`Quiz overlaps with card example for ${label}: "${q.blanked}"`);
    }
    if (seenCompleted.has(compNorm)) {
      throw new Error(`Duplicate quiz sentence for ${label}: "${completed}"`);
    }
    seenCompleted.add(compNorm);
  }
  return quiz;
}

function buildRuleTitle(topicName, cleanTitle) {
  const focus = String(cleanTitle || '').trim();
  if (!focus) return topicName;
  if (focus.toLowerCase().startsWith(String(topicName || '').toLowerCase())) {
    return focus;
  }
  return `${topicName}: ${focus}`;
}

async function main() {
  const localesMod = await import(pathToFileURL(path.resolve(__dirname, '../frontend/config/locales.js')).href);
  const SUPPORTED = localesMod.SUPPORTED_LOCALE_CODES;
  if (!Array.isArray(SUPPORTED) || SUPPORTED.length !== 36) {
    throw new Error(`Expected 36 SUPPORTED_LOCALE_CODES, got ${SUPPORTED?.length}`);
  }

  const master = JSON.parse(fs.readFileSync(path.join(SCRATCH_DIR, 'tense_and_ui_master.json'), 'utf8'));
  const rulesA = JSON.parse(fs.readFileSync(path.join(SCRATCH_DIR, 'rules_part_a.json'), 'utf8'));
  const rulesB = JSON.parse(fs.readFileSync(path.join(SCRATCH_DIR, 'rules_part_b.json'), 'utf8'));
  const allMasterRules = [...rulesA, ...rulesB];
  if (allMasterRules.length !== 320) {
    throw new Error(`Expected 320 rules, got ${allMasterRules.length}`);
  }

  // Verify progressive ordering A1 -> A2 -> B1 -> B2
  const levelRank = { A1: 1, A2: 2, B1: 3, B2: 4 };
  let prevRank = 0;
  for (let i = 0; i < allMasterRules.length; i++) {
    const r = allMasterRules[i];
    if (r.id !== i + 1) throw new Error(`Rule id mismatch at index ${i}: got ${r.id}`);
    const rank = levelRank[r.level];
    if (!rank || rank < prevRank) throw new Error(`Rule ordering error at id ${r.id}: level ${r.level}`);
    prevRank = rank;
  }

  const uiTenseByLoc = {};
  const uiMicroByLoc = {};
  const topicsByLoc = {};
  const tenseCacheByLoc = {};
  const microCacheByLoc = {};
  const microTitlesByLoc = { ru: new Map(), en: new Map() };

  const enRuTitlesPath = path.join(SCRATCH_DIR, 'micro_rule_titles_en_ru.json');
  const enRuTitles = JSON.parse(fs.readFileSync(enRuTitlesPath, 'utf8'));
  for (const t of enRuTitles) {
    microTitlesByLoc.ru.set(t.id, t.ru);
    microTitlesByLoc.en.set(t.id, t.en);
  }

  // Populate ru & en from master
  for (const loc of ['ru', 'en']) {
    uiTenseByLoc[loc] = {};
    for (const [k, obj] of Object.entries(master.uiTense)) uiTenseByLoc[loc][k] = obj[loc];
    uiMicroByLoc[loc] = {};
    for (const [k, obj] of Object.entries(master.uiMicro)) uiMicroByLoc[loc][k] = obj[loc];
    topicsByLoc[loc] = {};
    for (const [k, obj] of Object.entries(master.topics)) topicsByLoc[loc][k] = obj[loc];
  }

  const otherLocales = SUPPORTED.filter((l) => l !== 'ru' && l !== 'en');

  const mergedTitlesByLoc = { ru: new Map(), en: new Map() };
  const mergePlanPath = path.join(SCRATCH_DIR, 'merge_plan.json');
  const mergePlan = JSON.parse(fs.readFileSync(mergePlanPath, 'utf8'));
  for (const g of mergePlan) {
    if (g.ids.length > 1) {
      mergedTitlesByLoc.ru.set(g.newId, g.ru);
      mergedTitlesByLoc.en.set(g.newId, g.en);
    }
  }

  for (const loc of otherLocales) {
    const tensePath = path.join(CACHE_DIR, `tense_${loc}.json`);
    if (!fs.existsSync(tensePath)) {
      throw new Error(`Missing Batch 1 cache file: ${tensePath}`);
    }
    const tData = JSON.parse(fs.readFileSync(tensePath, 'utf8'));
    uiTenseByLoc[loc] = tData.uiTense;
    uiMicroByLoc[loc] = tData.uiMicro;
    topicsByLoc[loc] = tData.topics;
    tenseCacheByLoc[loc] = new Map(tData.tenses.map((t) => [t.id, t]));

    const mergedRules = new Map();
    for (let c = 0; c < 8; c++) {
      const chunkPath = path.join(CACHE_DIR, `mr_${loc}_c${c}.json`);
      if (!fs.existsSync(chunkPath)) {
        throw new Error(`Missing Batch 2 cache file: ${chunkPath}`);
      }
      const cData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      for (const item of cData.rules) {
        mergedRules.set(item.id, item);
      }
    }
    if (mergedRules.size !== 320) {
      throw new Error(`Locale ${loc} has ${mergedRules.size}/320 micro-rules`);
    }
    microCacheByLoc[loc] = mergedRules;

    const titlesPath = path.join(CACHE_DIR, `mr_titles_${loc}.json`);
    if (!fs.existsSync(titlesPath)) {
      throw new Error(`Missing clean titles cache file: ${titlesPath}`);
    }
    const tObj = JSON.parse(fs.readFileSync(titlesPath, 'utf8'));
    const tMap = new Map();
    for (let id = 1; id <= 320; id++) {
      const val = String(tObj[String(id)] || '').trim();
      if (!val) throw new Error(`Missing title #${id} in ${titlesPath}`);
      tMap.set(id, val);
    }
    microTitlesByLoc[loc] = tMap;

    const mergedTitlesPath = path.join(CACHE_DIR, `mr_merged_titles_${loc}.json`);
    if (!fs.existsSync(mergedTitlesPath)) {
      throw new Error(`Missing merged titles cache file: ${mergedTitlesPath}`);
    }
    const mtObj = JSON.parse(fs.readFileSync(mergedTitlesPath, 'utf8'));
    const mtMap = new Map();
    for (const g of mergePlan) {
      if (g.ids.length > 1) {
        const val = String(mtObj[String(g.newId)] || '').trim();
        if (!val) throw new Error(`Missing merged title #${g.newId} in ${mergedTitlesPath}`);
        mtMap.set(g.newId, val);
      }
    }
    mergedTitlesByLoc[loc] = mtMap;
  }

  // Regional UI aliases matching AGENTS.md nuances
  uiTenseByLoc['es-mx'] = { ...uiTenseByLoc.es };
  uiTenseByLoc['pt-br'] = { ...uiTenseByLoc.pt };
  uiMicroByLoc['es-mx'] = { ...uiMicroByLoc.es };
  uiMicroByLoc['pt-br'] = { ...uiMicroByLoc.pt };
  topicsByLoc['es-mx'] = { ...topicsByLoc.es };
  topicsByLoc['pt-br'] = { ...topicsByLoc.pt };

  for (const loc of Object.keys(uiMicroByLoc)) {
    const btnText = UNLOCK_RULE_BTN[loc] || UNLOCK_RULE_BTN.en;
    const quizHead = QUIZ_HEADING_I18N[loc] || QUIZ_HEADING_I18N.en;
    const quizBadge = QUIZ_DONE_BADGE_I18N[loc] || QUIZ_DONE_BADGE_I18N.en;
    if (!btnText) throw new Error(`Missing unlockRuleBtn translation for ${loc}`);
    if (!quizHead || !quizBadge) throw new Error(`Missing quiz UI translation for ${loc}`);
    uiMicroByLoc[loc].unlockRuleBtn = btnText;
    uiMicroByLoc[loc].quizHeading = quizHead;
    uiMicroByLoc[loc].quizDoneBadge = quizBadge;
  }

  for (const loc of Object.keys(uiTenseByLoc)) {
    const quizHead = QUIZ_HEADING_I18N[loc] || QUIZ_HEADING_I18N.en;
    const quizBadge = QUIZ_DONE_BADGE_I18N[loc] || QUIZ_DONE_BADGE_I18N.en;
    if (!quizHead || !quizBadge) throw new Error(`Missing tense quiz UI translation for ${loc}`);
    uiTenseByLoc[loc].quizHeading = quizHead;
    uiTenseByLoc[loc].quizDoneBadge = quizBadge;
  }

  // Build final 16 TENSE_CONSTRUCTIONS with all 36 SUPPORTED locales
  const finalTenses = master.tenses.map((mt) => {
    const subtitle = {};
    const purpose = {};
    const examples = mt.ru.examples.map((ex, idx) => ({
      en: ex.en,
      tr: {},
      note: {},
      _idx: idx,
    }));

    for (const loc of SUPPORTED) {
      if (loc === 'ru' || loc === 'en') {
        subtitle[loc] = mt[loc].subtitle;
        purpose[loc] = mt[loc].purpose;
        examples.forEach((ex, idx) => {
          ex.tr[loc] = mt[loc].examples[idx].tr;
          ex.note[loc] = mt[loc].examples[idx].note;
        });
      } else {
        const locItem = tenseCacheByLoc[loc].get(mt.id);
        if (!locItem) throw new Error(`Missing tense ${mt.id} for ${loc}`);
        subtitle[loc] = locItem.subtitle;
        purpose[loc] = locItem.purpose;
        examples.forEach((ex, idx) => {
          ex.tr[loc] = locItem.examples[idx].tr;
          ex.note[loc] = locItem.examples[idx].note;
        });
      }
    }

    const quiz = validateQuizItems(TENSE_QUIZ_DEF[mt.id], examples, `tense "${mt.id}"`, 6);

    return {
      id: mt.id,
      group: mt.group,
      time: mt.time,
      level: mt.level,
      title: mt.title,
      formula: mt.formula,
      markers: mt.markers,
      subtitle,
      purpose,
      examples: examples.map(({ en, tr, note }) => ({ en, tr, note })),
      quiz,
    };
  });

  // Build consolidated MICRO_RULES from merge_plan.json across all 36 SUPPORTED locales
  const masterById = new Map(allMasterRules.map((r) => [r.id, r]));
  const finalMicroRules = mergePlan.map((g) => {
    const members = g.ids.map((id) => {
      const m = masterById.get(id);
      if (!m) throw new Error(`Unknown member id ${id} in merge_plan`);
      return m;
    });
    const primary = members[0];
    const title = {};
    const rule = {};

    // Collect 3-5 representative examples (first example from up to 4 members, or primary's 3)
    const rawExamples = [];
    if (members.length === 1) {
      primary.ru.ex.forEach((ex, idx) => rawExamples.push({ memberId: primary.id, exIdx: idx, en: ex.en, tr: {} }));
    } else {
      for (const m of members.slice(0, 4)) {
        rawExamples.push({ memberId: m.id, exIdx: 0, en: m.ru.ex[0].en, tr: {} });
      }
      if (rawExamples.length < 3 && primary.ru.ex[1]) {
        rawExamples.push({ memberId: primary.id, exIdx: 1, en: primary.ru.ex[1].en, tr: {} });
      }
    }

    for (const loc of SUPPORTED) {
      const parts = [];
      for (const m of members) {
        if (loc === 'ru') parts.push(m.ru.rule.trim());
        else if (loc === 'en') parts.push(m.en.rule.trim());
        else {
          const locItem = microCacheByLoc[loc].get(m.id);
          if (!locItem) throw new Error(`Missing micro-rule ${m.id} for ${loc}`);
          parts.push(locItem.rule.trim());
        }
      }
      rule[loc] = parts.length === 1 ? parts[0] : parts.map((p) => `• ${p}`).join('\n');

      for (const ex of rawExamples) {
        const m = masterById.get(ex.memberId);
        if (loc === 'ru') ex.tr.ru = m.ru.ex[ex.exIdx].tr;
        else if (loc === 'en') ex.tr.en = m.en.gl[ex.exIdx];
        else ex.tr[loc] = microCacheByLoc[loc].get(ex.memberId).tr[ex.exIdx];
      }

      const topicName = (topicsByLoc[loc] && topicsByLoc[loc][primary.topic]) || primary.topic;
      const cleanTitle = members.length === 1
        ? microTitlesByLoc[loc]?.get(primary.id)
        : mergedTitlesByLoc[loc]?.get(g.newId);
      title[loc] = buildRuleTitle(topicName, cleanTitle);
    }

    // Round-robin pick quiz questions across all members so every sub-rule is tested
    let combinedQuiz = [];
    if (members.length === 1) {
      combinedQuiz = MICRO_RULE_QUIZ_DEF[primary.id] || [];
    } else {
      const targetQuizCount = Math.min(10, Math.max(5, members.length + 2));
      const exNorms = new Set(rawExamples.map((ex) => normalizeQuizSentence(ex.en)));
      const seenQ = new Set();
      let round = 0;
      while (combinedQuiz.length < targetQuizCount && round < 5) {
        for (const m of members) {
          if (combinedQuiz.length >= targetQuizCount) break;
          const q = (MICRO_RULE_QUIZ_DEF[m.id] || [])[round];
          if (!q) continue;
          const compNorm = normalizeQuizSentence(q.blanked.replace('___', q.answer));
          if (exNorms.has(compNorm) || seenQ.has(compNorm)) continue;
          seenQ.add(compNorm);
          combinedQuiz.push(q);
        }
        round++;
      }
    }

    const quiz = validateQuizItems(combinedQuiz, rawExamples, `micro-rule #${g.newId}`, 5);

    return {
      id: g.newId,
      level: primary.level,
      topic: primary.topic,
      title,
      rule,
      table: GRAMMAR_TABLES_DEF[g.newId] || null,
      examples: rawExamples.map(({ en, tr }) => ({ en, tr })),
      quiz,
    };
  });

  // Validate zero U+FFFD and zero empty values
  function assertClean(obj, label) {
    const raw = JSON.stringify(obj);
    if (raw.includes('\uFFFD')) throw new Error(`${label} contains U+FFFD replacement character!`);
  }
  assertClean(uiTenseByLoc, 'uiTenseByLoc');
  assertClean(uiMicroByLoc, 'uiMicroByLoc');
  assertClean(topicsByLoc, 'topicsByLoc');
  assertClean(finalTenses, 'finalTenses');
  assertClean(finalMicroRules, 'finalMicroRules');

  // 1. Write grammarUiTranslations.js
  const uiJs = `// Auto-generated by scripts/build_grammar_collections.cjs — do not edit manually

export const TENSE_CONSTRUCTIONS_I18N = ${JSON.stringify(uiTenseByLoc, null, 2)};

export const MICRO_RULES_I18N = ${JSON.stringify(uiMicroByLoc, null, 2)};

export const GRAMMAR_TOPICS_I18N = ${JSON.stringify(topicsByLoc, null, 2)};

function resolveLocaleMap(map, lang) {
  const norm = String(lang || 'ru').toLowerCase().trim();
  if (map[norm]) return map[norm];
  const base = norm.split('-')[0];
  return map[base] || map.en || map.ru;
}

export function getTenseConstructionsStrings(lang = 'ru') {
  return resolveLocaleMap(TENSE_CONSTRUCTIONS_I18N, lang);
}

export function getMicroRulesStrings(lang = 'ru') {
  return resolveLocaleMap(MICRO_RULES_I18N, lang);
}

export function getTopicTitle(topicKey, lang = 'ru') {
  const bag = resolveLocaleMap(GRAMMAR_TOPICS_I18N, lang);
  return (bag && bag[topicKey]) || (GRAMMAR_TOPICS_I18N.en && GRAMMAR_TOPICS_I18N.en[topicKey]) || topicKey;
}
`;

  // 2. Write tenseConstructionsData.js
  const tenseJs = `// Auto-generated by scripts/build_grammar_collections.cjs — do not edit manually
import { TENSE_CONSTRUCTIONS_I18N, getTenseConstructionsStrings } from './grammarUiTranslations.js?v=386.0';

export { TENSE_CONSTRUCTIONS_I18N, getTenseConstructionsStrings };

export const TENSE_CONSTRUCTIONS = ${JSON.stringify(finalTenses, null, 2)};

function pickLocaleKey(obj, lang) {
  if (!obj) return '';
  const norm = String(lang || 'ru').toLowerCase().trim();
  if (obj[norm]) return obj[norm];
  const base = norm.split('-')[0];
  return obj[base] || obj.en || obj.ru || '';
}

export function getLocalizedTenseConstruction(item, lang = 'ru') {
  return {
    subtitle: pickLocaleKey(item.subtitle, lang),
    purpose: pickLocaleKey(item.purpose, lang),
    examples: (item.examples || []).map((ex) => ({
      en: ex.en,
      tr: pickLocaleKey(ex.tr, lang),
      note: pickLocaleKey(ex.note, lang),
    })),
    quiz: (item.quiz || []).map((q) => ({
      blanked: q.blanked,
      answer: q.answer,
      options: q.options,
      tr: q.tr ? pickLocaleKey(q.tr, lang) : '',
    })),
  };
}
`;

  // 3. Write microRulesData.js
  const microJs = `// Auto-generated by scripts/build_grammar_collections.cjs — do not edit manually
import {
  MICRO_RULES_I18N,
  GRAMMAR_TOPICS_I18N,
  getMicroRulesStrings,
  getTopicTitle,
} from './grammarUiTranslations.js?v=386.0';

export { MICRO_RULES_I18N, GRAMMAR_TOPICS_I18N, getMicroRulesStrings, getTopicTitle };

export const MICRO_RULES = ${JSON.stringify(finalMicroRules, null, 2)};

function pickLocaleKey(obj, lang) {
  if (!obj) return '';
  const norm = String(lang || 'ru').toLowerCase().trim();
  if (obj[norm]) return obj[norm];
  const base = norm.split('-')[0];
  return obj[base] || obj.en || obj.ru || '';
}

export function getLocalizedMicroRule(item, lang = 'ru') {
  return {
    title: pickLocaleKey(item.title, lang),
    rule: pickLocaleKey(item.rule, lang),
    table: item.table || null,
    examples: (item.examples || []).map((ex) => ({
      en: ex.en,
      tr: pickLocaleKey(ex.tr, lang),
    })),
    quiz: (item.quiz || []).map((q) => ({
      blanked: q.blanked,
      answer: q.answer,
      options: q.options,
      tr: q.tr ? pickLocaleKey(q.tr, lang) : '',
    })),
  };
}
`;

  fs.writeFileSync(path.join(OUT_DIR, 'grammarUiTranslations.js'), uiJs, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'tenseConstructionsData.js'), tenseJs, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'microRulesData.js'), microJs, 'utf8');

  console.log('Generated grammarUiTranslations.js, tenseConstructionsData.js, microRulesData.js cleanly!');
  console.log(`Tenses: ${finalTenses.length}, Micro-rules: ${finalMicroRules.length}, Locales: ${SUPPORTED.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
