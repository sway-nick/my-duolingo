import {
  CEFR_LEVEL_BLUEPRINTS,
  computeLevelReadiness,
  loadPassedCefrExams,
  getLevelMatrixStrings,
} from '../components/favorites/levelMatrixData.js?v=423.0';
import { MICRO_RULES, getLocalizedMicroRule } from '../components/favorites/microRulesData.js?v=423.0';
import { TENSE_CONSTRUCTIONS, getLocalizedTenseConstruction } from '../components/favorites/tenseConstructionsData.js?v=423.0';
import { getUserProgress, isWordMastered } from './api.js?v=423.0';
import { isProActive, getTestLearnedCount, PRO_LIMITS, getMicroRuleQuota } from './proState.js?v=423.0';

const STORAGE_KEY_MICRORULES_DONE = 'myduo_microrules_done';
const STORAGE_KEY_MICRORULES_UNLOCKED = 'myduo_microrules_unlocked';
const STORAGE_KEY_TENSES_DONE = 'myduo_tenses_done';
const STORAGE_KEY_TENSES_UNLOCKED = 'myduo_tenses_unlocked';

function buildEvenWaves(prevEnd, end, count = 50) {
  const out = [];
  const span = end - prevEnd;
  for (let i = 1; i <= count; i++) {
    out.push(prevEnd + Math.round((span * i) / count));
  }
  out[out.length - 1] = end;
  return out;
}

export const SMART_PATH_WAVE_TARGETS = {
  A1: buildEvenWaves(0, 1250, 50),
  A2: buildEvenWaves(1250, 2554, 50),
  B1: buildEvenWaves(2554, 3680, 50),
  B2: buildEvenWaves(3680, 4803, 50),
  C1: buildEvenWaves(4803, 6433, 50),
};

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

function safeReadSet(key, asNumbers = false) {
  try {
    if (typeof localStorage === 'undefined') return new Set();
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(asNumbers ? parsed.map(Number) : parsed.map(String));
  } catch (_) {
    return new Set();
  }
}

function defaultVocabCategoryForLevel(levelId) {
  if (levelId === 'A1' || levelId === 'A2') return 'Elementary';
  if (levelId === 'B1' || levelId === 'B2') return 'Intermediate';
  return 'Advanced';
}

function distributeIntoWaves(items, totalWaves, startOffset = 0) {
  const buckets = Array.from({ length: totalWaves }, () => []);
  const n = items.length;
  if (n === 0 || totalWaves <= 0) return buckets;
  const offset = Math.min(Math.max(0, startOffset), Math.max(0, totalWaves - 1));
  const span = Math.max(1, totalWaves - offset);
  for (let i = 0; i < n; i++) {
    const waveIdx = Math.min(totalWaves - 1, offset + Math.floor((i * span) / n));
    buckets[waveIdx].push(items[i]);
  }
  return buckets;
}

export function buildSmartPathPlan(allWords = [], lang = 'ru', options = {}) {
  const normLang = String(lang || 'ru').toLowerCase().trim();
  const skipOffset = Math.max(0, Number(options.skipOffset) || 0);
  const passedExams = loadPassedCefrExams();

  const levelId = options.forceLevel
    ? String(options.forceLevel).toUpperCase().trim()
    : (LEVEL_ORDER.find((lvl) => !passedExams.has(lvl)) || 'C1');

  const waveTargets = SMART_PATH_WAVE_TARGETS[levelId] || SMART_PATH_WAVE_TARGETS.A1;
  const totalWaves = waveTargets.length;
  const readiness = computeLevelReadiness(levelId, allWords, normLang);
  const lmStrings = getLevelMatrixStrings(normLang);

  let progress = {};
  try {
    progress = getUserProgress() || {};
  } catch (_) {}

  const wordsArr = Array.isArray(allWords) ? allWords : [];
  let totalMastered = 0;
  for (let i = 0; i < wordsArr.length; i++) {
    const w = wordsArr[i];
    if (!w) continue;
    const p = progress[w.id] ?? progress[String(w.id)];
    if (isWordMastered(p)) totalMastered++;
  }

  const proActive = isProActive();
  const testLearned = getTestLearnedCount(progress);
  const microQuota = proActive ? MICRO_RULES.length : getMicroRuleQuota(testLearned);
  const microDone = safeReadSet(STORAGE_KEY_MICRORULES_DONE, true);
  const microUnlocked = safeReadSet(STORAGE_KEY_MICRORULES_UNLOCKED, true);
  const tensesDone = safeReadSet(STORAGE_KEY_TENSES_DONE, false);
  const tensesUnlocked = safeReadSet(STORAGE_KEY_TENSES_UNLOCKED, false);
  tensesUnlocked.add('present_simple');

  const bp = CEFR_LEVEL_BLUEPRINTS[levelId] || CEFR_LEVEL_BLUEPRINTS.A1;

  // Pending Micro-rules for this level (or all remaining for C1)
  const levelRules = bp.microRuleAll
    ? MICRO_RULES
    : MICRO_RULES.filter((r) => r.level === (bp.microRuleLevel || levelId));

  const allLevelRules = [];
  for (const r of levelRules) {
    const unlocked = proActive || microUnlocked.has(r.id);
    const locRule = getLocalizedMicroRule(r, normLang);
    allLevelRules.push({
      id: `mr:${r.id}`,
      ruleId: r.id,
      stepType: 'micro_rule',
      icon: '📘',
      title: `#${r.id} · ${locRule.title || r.id}`,
      detail: `${r.level || levelId} · ${lmStrings.microrules_block.replace('{level}', r.level || levelId)}`,
      unlocked,
      requiresAdUnlock: !unlocked,
      done: microDone.has(r.id),
      linkTarget: { targetType: 'grammar_microrules', ruleId: r.id, level: r.level || levelId },
    });
  }

  // All Tense Constructions for this level (keep fixed proportional slots; skip done inside wave loop)
  const levelTenses = bp.tenseAll
    ? TENSE_CONSTRUCTIONS
    : TENSE_CONSTRUCTIONS.filter((t) => t.level === (bp.tenseLevel || levelId));

  const allLevelTenses = [];
  for (const tObj of levelTenses) {
    const unlocked = proActive || tensesUnlocked.has(tObj.id);
    const locT = getLocalizedTenseConstruction(tObj, normLang);
    allLevelTenses.push({
      id: `tc:${tObj.id}`,
      tenseId: tObj.id,
      stepType: 'tense',
      icon: '⏳',
      title: tObj.title,
      detail: locT.subtitle || '',
      unlocked,
      requiresAdUnlock: !unlocked,
      done: tensesDone.has(tObj.id),
      linkTarget: { targetType: 'tense_construction', targetId: tObj.id, level: tObj.level || levelId },
    });
  }

  // All Grammar Ref, Collections, Irregular Packs, Spoken from readiness.blocks (keep fixed slots)
  const allGrammarRef = [];
  const allCollections = [];
  const allIrregular = [];
  const allSpoken = [];

  for (const b of readiness.blocks || []) {
    const isDone = Boolean(b.done);
    if (b.category === 'grammar_ref') {
      allGrammarRef.push({
        id: b.id,
        stepType: 'grammar_ref',
        icon: b.icon || '🧭',
        title: b.title,
        detail: `${b.current}/${b.target}`,
        unlocked: true,
        done: isDone,
        linkTarget: b.linkTarget,
      });
    } else if (b.category === 'collections') {
      allCollections.push({
        id: b.id,
        stepType: 'collection',
        icon: b.icon || '📚',
        title: b.title,
        detail: `${b.current}/${b.target}`,
        unlocked: true,
        done: isDone,
        linkTarget: b.linkTarget,
      });
    } else if (b.category === 'irregular') {
      allIrregular.push({
        id: b.id,
        stepType: 'irregular',
        icon: b.icon || '⚡',
        title: b.title,
        detail: `${b.current}/${b.target}`,
        unlocked: true,
        done: isDone,
        linkTarget: b.linkTarget,
      });
    } else if (b.category === 'spoken') {
      allSpoken.push({
        id: b.id,
        stepType: 'spoken',
        icon: b.icon || '🗣️',
        title: b.title,
        detail: `${b.current}/${b.target}`,
        unlocked: true,
        done: isDone,
        linkTarget: b.linkTarget,
      });
    }
  }

  // Fixed proportional distribution across all waves so 80% vocab = ~80% of every category
  const ruleBuckets = distributeIntoWaves(allLevelRules, totalWaves, 0);
  const tenseBuckets = distributeIntoWaves(allLevelTenses, totalWaves, 1);
  const grefBuckets = distributeIntoWaves(allGrammarRef, totalWaves, 2);
  const colBuckets = distributeIntoWaves(allCollections, totalWaves, 3);
  const irrBuckets = distributeIntoWaves(allIrregular, totalWaves, 4);
  const spokenBuckets = distributeIntoWaves(allSpoken, totalWaves, 5);

  const vocabCategory = bp.vocabCategory?.category || defaultVocabCategoryForLevel(levelId);
  const vocabBlock = (readiness.blocks || []).find((b) => b.category === 'vocabulary' && !b.done)
    || (readiness.blocks || []).find((b) => b.category === 'vocabulary');

  const queue = [];
  let firstPendingWave = totalWaves;
  let totalSteps = 0;
  let completedSteps = 0;

  for (let w = 0; w < totalWaves; w++) {
    const waveTarget = waveTargets[w];
    const waveSteps = [];

    // Round-robin interleave across topic types so no two micro-rules stack back-to-back
    const perTypeLists = [
      ruleBuckets[w],
      tenseBuckets[w],
      grefBuckets[w],
      colBuckets[w],
      irrBuckets[w],
      spokenBuckets[w],
    ];
    const maxLen = Math.max(0, ...perTypeLists.map((arr) => arr.length));
    const allNonVocabInWave = [];
    const pendingNonVocab = [];
    for (let idx = 0; idx < maxLen; idx++) {
      for (const list of perTypeLists) {
        if (idx < list.length) {
          allNonVocabInWave.push(list[idx]);
          totalSteps++;
          if (list[idx].done) {
            completedSteps++;
          } else {
            pendingNonVocab.push({ ...list[idx], wave: w + 1 });
          }
        }
      }
    }

    const isLastWave = w === totalWaves - 1;
    const waveHasVocabSlot = allNonVocabInWave.length > 0 || isLastWave;
    if (waveHasVocabSlot) {
      totalSteps++;
      if (totalMastered >= waveTarget) {
        completedSteps++;
      }
    }
    // Only emit a vocab step if this wave has non-vocab items to pair with it (or it's the final wave),
    // preventing two consecutive "Словарь" steps back-to-back.
    if (totalMastered < waveTarget && (pendingNonVocab.length > 0 || isLastWave)) {
      const waveVocabTitle = lmStrings.vocabTargetBlockTitle
        ? lmStrings.vocabTargetBlockTitle
          .replace('{level}', levelId)
          .replace('{target}', String(waveTarget))
        : (vocabBlock?.title || `${levelId} · ${waveTarget}`);
      waveSteps.push({
        id: `vocab:${levelId}:w${w + 1}`,
        stepType: 'vocab',
        wave: w + 1,
        icon: '🧠',
        title: waveVocabTitle,
        targetWords: waveTarget,
        unlocked: true,
        linkTarget: {
          targetType: 'smart_vocab',
          category: vocabCategory,
          targetWords: waveTarget,
          level: levelId,
        },
      });
    }

    waveSteps.push(...pendingNonVocab);

    if (waveSteps.length > 0 && firstPendingWave === totalWaves) {
      firstPendingWave = w + 1;
    }
    queue.push(...waveSteps);
  }

  // Always end with level comprehensive exam if not yet passed
  totalSteps++;
  if (readiness.examPassed) {
    completedSteps++;
  } else {
    queue.push({
      id: `exam:${levelId}`,
      stepType: 'exam',
      wave: totalWaves,
      icon: '🎓',
      title: `${levelId} · ${lmStrings.examTab || 'Exam'}`,
      detail: '',
      unlocked: true,
      linkTarget: { targetType: 'level_matrix_exams', level: levelId, mode: 'exam' },
    });
  }

  let currentStep = null;
  let remainingQueue = queue;

  if (queue.length > 0) {
    if (skipOffset === 0) {
      currentStep = queue[0];
      remainingQueue = queue.slice(1);
    } else {
      // Distinct step cycling so "Another step" gives variety before repeating types
      const distinctOrder = [];
      const seenTypes = new Set();
      for (let i = 0; i < queue.length; i++) {
        if (!seenTypes.has(queue[i].stepType)) {
          seenTypes.add(queue[i].stepType);
          distinctOrder.push(i);
        }
      }
      for (let i = 0; i < queue.length; i++) {
        if (!distinctOrder.includes(i)) distinctOrder.push(i);
      }
      const pickedIdx = distinctOrder[skipOffset % distinctOrder.length];
      currentStep = queue[pickedIdx];
      remainingQueue = [...queue.slice(pickedIdx + 1), ...queue.slice(0, pickedIdx)];
    }
  }

  const currentWave = currentStep?.wave || Math.min(totalWaves, Math.max(1, firstPendingWave));

  const levelVocabTarget = waveTargets[waveTargets.length - 1] || 1000;
  const vocabPct = Math.min(100, Math.round((totalMastered / Math.max(1, levelVocabTarget)) * 100));
  const doneRulesCount = allLevelRules.filter((r) => r.done).length;
  const microRulesPct = allLevelRules.length > 0 ? Math.round((doneRulesCount / allLevelRules.length) * 100) : 100;
  const doneTensesCount = allLevelTenses.filter((t) => t.done).length;
  const tensesPct = allLevelTenses.length > 0 ? Math.round((doneTensesCount / allLevelTenses.length) * 100) : 100;
  const practiceBlocks = [...allCollections, ...allGrammarRef, ...allIrregular, ...allSpoken];
  const donePracticeCount = practiceBlocks.filter((b) => b.done).length;
  const collectionsPct = practiceBlocks.length > 0 ? Math.round((donePracticeCount / practiceBlocks.length) * 100) : 100;
  const parallelPercent = Math.round((vocabPct + microRulesPct + collectionsPct + tensesPct) / 4);

  const currentStepNumber = queue.length === 0
    ? totalSteps
    : Math.min(totalSteps, completedSteps + 1);

  return {
    levelId,
    readinessPercent: parallelPercent,
    closedBlocks: readiness.closedBlocks,
    totalBlocks: readiness.totalBlocks,
    totalMastered,
    currentWave,
    totalWaves,
    currentStepNumber,
    totalSteps,
    completedSteps,
    currentStep,
    upcomingSteps: remainingQueue.slice(0, 20),
    totalPendingSteps: queue.length,
    allDone: queue.length === 0,
    categoryProgress: {
      vocab: vocabPct,
      microRules: microRulesPct,
      collections: collectionsPct,
      tenses: tensesPct,
    },
  };
}
