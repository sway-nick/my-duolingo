import test from 'node:test';
import assert from 'node:assert/strict';

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

  // Reset batch
  clearActiveConveyorBatch([ { id: wordId } ]);
  const updatedProg = getUserProgress()[wordId];
  assert.equal(updatedProg?.roundBlocksDone, undefined, 'roundBlocksDone must be cleared on batch reset');
});

test('Word Blocks: All 36 locales have translations for badge and hint', () => {
  assert.equal(SUPPORTED_LOCALE_CODES.length, 36, 'Project must have exactly 36 locales');

  for (const locale of SUPPORTED_LOCALE_CODES) {
    global.localStorage.setItem('myduo_lang', locale);

    const badgeText = t('train_blocks_badge');
    assert.ok(badgeText && badgeText.length > 0, `Missing train_blocks_badge for locale ${locale}`);

    const hintText = t('train_blocks_hint');
    assert.ok(hintText && hintText.length > 0, `Missing train_blocks_hint for locale ${locale}`);
  }

  global.localStorage.setItem('myduo_lang', 'ru');
  assert.equal(t('train_blocks_badge'), 'Кубики', 'Badge in Russian should be Кубики');

  // Restore
  global.localStorage.setItem('myduo_lang', 'ru');
});
