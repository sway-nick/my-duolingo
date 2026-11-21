import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage and window for Node test environment
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  get length() { return storage.size; },
  key: (i) => Array.from(storage.keys())[i] || null,
};
globalThis.window = {
  location: { hostname: 'localhost' },
  localStorage: global.localStorage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};

import {
  evaluateWordleStatuses,
  getTrapLetters,
} from '../frontend/components/exercises/WordBlocksExercise.js';
import {
  isWordProblematicForBlocks,
  saveProgress,
  getUserProgress,
  clearActiveConveyorBatch,
  getUserWeeklyXP,
  addWeeklyXP,
  getEffectiveUserId,
} from '../frontend/services/api.js';
import { t } from '../frontend/services/i18n.js';
import { SUPPORTED_LOCALE_CODES } from '../frontend/config/locales.js';

test('Word Blocks: Wordle status evaluation with duplicate letters', () => {
  // 1. Exact match
  const res1 = evaluateWordleStatuses(['C', 'A', 'T'], ['C', 'A', 'T']);
  assert.deepEqual(res1, ['green', 'green', 'green']);

  // 2. Transposed letters
  const res2 = evaluateWordleStatuses(['A', 'C', 'T'], ['C', 'A', 'T']);
  assert.deepEqual(res2, ['yellow', 'yellow', 'green']);

  // 3. Letters not in target
  const res3 = evaluateWordleStatuses(['X', 'Y', 'Z'], ['C', 'A', 'T']);
  assert.deepEqual(res3, ['gray', 'gray', 'gray']);

  // 4. Duplicate letter logic:
  // Target: APPLE (A:1, P:2, L:1, E:1)
  // Guess:  PAPPL (P:3, A:1, L:1)
  const target = ['A', 'P', 'P', 'L', 'E'];
  const guess = ['P', 'A', 'P', 'P', 'L'];
  const res4 = evaluateWordleStatuses(guess, target);
  assert.deepEqual(res4, ['yellow', 'yellow', 'green', 'gray', 'yellow']);
});

test('Word Blocks: Trap letters generation', () => {
  const targetWord = 'apple';
  const neighborWords = [
    { id: 1, word: 'orange' },
    { id: 2, word: 'banana' },
  ];

  for (let i = 0; i < 20; i++) {
    const traps = getTrapLetters(targetWord, neighborWords);
    assert.equal(traps.length, 3, 'Must return exactly 3 trap letters');

    const targetSet = new Set(['A', 'P', 'L', 'E']);
    for (const trap of traps) {
      assert.ok(!targetSet.has(trap), `Trap letter ${trap} must not be in target word apple`);
      assert.match(trap, /^[A-Z]$/, 'Trap letter must be a single uppercase letter');
    }

    // Must be 3 distinct letters
    const uniqueTraps = new Set(traps);
    assert.equal(uniqueTraps.size, 3, 'Traps must be 3 unique letters');
  }
});

test('Word Blocks: isWordProblematicForBlocks identification', () => {
  const word = { id: 101, word: 'house' };

  // 1. Clean word -> false
  assert.equal(isWordProblematicForBlocks(word, { correct: 2, error: 0 }), false);

  // 2. Mistake in Quiz -> true
  assert.equal(
    isWordProblematicForBlocks(word, { roundQuizMistakes: 1 }),
    true
  );
  assert.equal(
    isWordProblematicForBlocks(word, { quizMistakes: 1 }),
    true
  );

  // 3. Mistake in Pairs -> true
  assert.equal(
    isWordProblematicForBlocks(word, { roundPairsMistakes: 1 }),
    true
  );
  assert.equal(
    isWordProblematicForBlocks(word, { pairsMistakes: 1 }),
    true
  );

  // 3b. Mistake in Test (input) -> true
  assert.equal(
    isWordProblematicForBlocks(word, { roundInputMistakes: 1 }),
    true
  );
  assert.equal(
    isWordProblematicForBlocks(word, { inputMistakes: 1 }),
    true
  );

  // 4. General error in current progress -> true
  assert.equal(
    isWordProblematicForBlocks(word, { error: 1, quizCorrect: 2 }),
    true
  );

  // 5. Already completed blocks in this round -> false
  assert.equal(
    isWordProblematicForBlocks(word, { roundQuizMistakes: 1, roundBlocksDone: true }),
    false
  );

  // 6. Mastered word -> false
  assert.equal(
    isWordProblematicForBlocks(word, { roundQuizMistakes: 1, mastered: true }),
    false
  );
});

test('Word Blocks: saveProgress and clearActiveConveyorBatch lifecycle', async () => {
  const wordId = 'test_wb_999';

  // Mark blocks as solved
  await saveProgress(wordId, true, 'blocks');
  const prog = getUserProgress()[wordId];
  assert.ok(prog, 'Progress record must exist');
  assert.equal(prog.roundBlocksDone, true, 'roundBlocksDone must be true');

  // Mistake in Test (input) after Shield ad resets roundBlocksDone and queues Word Blocks immediately
  await saveProgress(wordId, false, 'input', { shieldUsed: true });
  const afterTestMistake = getUserProgress()[wordId];
  assert.equal(afterTestMistake.roundBlocksDone, false, 'Test mistake must reset roundBlocksDone to false');
  assert.equal(afterTestMistake.roundInputMistakes, 1, 'Test mistake must increment roundInputMistakes');
  assert.equal(
    isWordProblematicForBlocks({ id: wordId, word: 'apple' }, afterTestMistake),
    true,
    'Word must be flagged for Word Blocks immediately after Test mistake'
  );

  // Solving Word Blocks again clears queue for this mistake while preserving needsTestRepeat
  await saveProgress(wordId, true, 'blocks');
  const afterBlocksFix = getUserProgress()[wordId];
  assert.equal(afterBlocksFix.roundBlocksDone, true, 'Solving Word Blocks must set roundBlocksDone back to true');
  assert.equal(afterBlocksFix.needsTestRepeat, true, 'needsTestRepeat must remain true so Test re-checks typing');

  // Reset batch
  clearActiveConveyorBatch([ { id: wordId } ]);
  const updatedProg = getUserProgress()[wordId];
  assert.equal(updatedProg?.roundBlocksDone, undefined, 'roundBlocksDone must be cleared on batch reset');
  assert.equal(updatedProg?.roundInputMistakes, undefined, 'roundInputMistakes must be cleared on batch reset');
});

test('Word Blocks: All 36 locales have translations for badge and hint', () => {
  assert.equal(SUPPORTED_LOCALE_CODES.length, 36, 'Project must have exactly 36 locales');

  for (const locale of SUPPORTED_LOCALE_CODES) {
    global.localStorage.setItem('myduo_interface_lang', locale);

    const badgeText = t('train_blocks_badge');
    assert.ok(badgeText && badgeText.length > 0, `Missing train_blocks_badge for locale ${locale}`);

    const hintText = t('train_blocks_hint');
    assert.ok(hintText && hintText.length > 0, `Missing train_blocks_hint for locale ${locale}`);

    const loadingText = t('ad_loading');
    assert.ok(loadingText && loadingText.length > 0, `Missing ad_loading for locale ${locale}`);
  }

  global.localStorage.setItem('myduo_interface_lang', 'ru');
  assert.equal(t('train_blocks_badge'), 'Кубики', 'Badge in Russian should be Кубики');
  assert.equal(t('ad_loading'), 'Загрузка', 'ad_loading in Russian should be Загрузка');

  // Restore
  global.localStorage.setItem('myduo_interface_lang', 'ru');
});

test('Favorites & Collections: saveProgress tracks Quiz, Pairs, and Test mistakes for Word Blocks without XP change', async () => {
  const userId = getEffectiveUserId();
  const baseXp = getUserWeeklyXP(userId);
  addWeeklyXP(100, userId);
  const expectedXp = baseXp + 100;

  const quizWordId = 'fav_wb_quiz_1';
  const pairsWordId = 'fav_wb_pairs_2';
  const inputWordId = 'fav_wb_input_3';

  const resQuiz = await saveProgress(quizWordId, false, 'quiz', { isFavPractice: true });
  assert.equal(resQuiz.roundQuizMistakes, 1, 'Quiz mistake in isFavPractice must increment roundQuizMistakes');
  assert.equal(resQuiz.roundBlocksDone, false, 'Quiz mistake in isFavPractice must set roundBlocksDone = false');
  assert.equal(getUserWeeklyXP(userId), expectedXp, 'isFavPractice Quiz must not change XP');

  const resPairs = await saveProgress(pairsWordId, false, 'pairs', { isFavPractice: true });
  assert.equal(resPairs.roundPairsMistakes, 1, 'Pairs mistake in isFavPractice must increment roundPairsMistakes');
  assert.equal(resPairs.roundBlocksDone, false, 'Pairs mistake in isFavPractice must set roundBlocksDone = false');
  assert.equal(getUserWeeklyXP(userId), expectedXp, 'isFavPractice Pairs must not change XP');

  const resInput = await saveProgress(inputWordId, false, 'input', { isFavPractice: true });
  assert.equal(resInput.roundInputMistakes, 1, 'Test mistake in isFavPractice must increment roundInputMistakes');
  assert.equal(resInput.needsTestRepeat, true, 'Test mistake in isFavPractice must set needsTestRepeat = true');
  assert.equal(resInput.roundBlocksDone, false, 'Test mistake in isFavPractice must set roundBlocksDone = false');
  assert.equal(getUserWeeklyXP(userId), expectedXp, 'isFavPractice Test must not change XP');

  const solvedBlocks = await saveProgress(quizWordId, true, 'blocks', { isFavPractice: true });
  assert.equal(solvedBlocks.roundBlocksDone, true, 'Solving Word Blocks in isFavPractice must mark roundBlocksDone = true');
  assert.equal(getUserWeeklyXP(userId), expectedXp, 'Solving Word Blocks in isFavPractice must not change XP');
});

test('Favorites & Collections: remaining counter, forward stage progression, and Word Blocks flow', () => {
  const trainingCardCode = fs.readFileSync(
    path.resolve(process.cwd(), 'frontend/components/training/TrainingCard.js'),
    'utf8'
  );
  const indexHtmlCode = fs.readFileSync(
    path.resolve(process.cwd(), 'frontend/index.html'),
    'utf8'
  ).replace(/\r\n/g, '\n');

  // Counter uses currentWordIndex for both Quiz and Test when isFavPractice is active
  const matches = trainingCardCode.match(/isFavPractice \? Math\.max\(1, activeWords\.length - currentWordIndex\) : activeWords\.length/g) || [];
  assert.equal(matches.length, 2, 'TrainingCard must compute remaining words from currentWordIndex in both Quiz and Test for isFavPractice');

  // Pairs in isFavPractice takes sequential slice starting at currentWordIndex and advances by 5
  assert.ok(
    trainingCardCode.includes('activeWords.slice(currentWordIndex, currentWordIndex + TARGET_PAIRS_COUNT)'),
    'Pairs in isFavPractice must take sequential slice from currentWordIndex'
  );
  assert.ok(
    indexHtmlCode.includes("else if (currentMethod === 'pairs' && isFavPracticeActive) {\n              currentWordIndex += 5;\n            }"),
    'Pairs completion in isFavPracticeActive must advance currentWordIndex by 5'
  );

  // Stage progression in isFavPracticeActive: cards -> quiz -> pairs -> input -> exit only after input & blocks
  assert.ok(
    indexHtmlCode.includes("if (currentMethod === 'cards') {\n            favoritePracticeMethod = 'quiz';") &&
    indexHtmlCode.includes("if (currentMethod === 'quiz') {\n            favoritePracticeMethod = 'pairs';") &&
    indexHtmlCode.includes("if (currentMethod === 'pairs') {\n            favoritePracticeMethod = 'input';") &&
    indexHtmlCode.includes("if (currentMethod === 'input' && getBlocksWordsForInput(userProgress).length === 0)"),
    'Favorites/Collections practice must advance cards -> quiz -> pairs -> input and only exit after input + Word Blocks'
  );

  // Word Blocks triggers on Quiz, Pairs, and Test mistakes in isFavPracticeActive
  assert.ok(
    indexHtmlCode.includes('(p.roundQuizMistakes || 0) > 0') &&
    indexHtmlCode.includes('(p.roundPairsMistakes || 0) > 0') &&
    indexHtmlCode.includes('(p.roundInputMistakes || 0) > 0'),
    'getBlocksWordsForInput in isFavPracticeActive must check roundQuizMistakes, roundPairsMistakes, and roundInputMistakes'
  );
});
