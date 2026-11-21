import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test runner
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

import {
  isExcludedFromConveyor,
  FUNCTIONAL_GRAMMAR_WORDS,
  getQueueForCards,
  prepareTrainingBatch
} from '../frontend/services/api.js';

test('Functional words exclusion: all 19 functional words are excluded by helper', () => {
  const targetWords = [
    'the', 'it', 'this', 'that', 'these', 'those', 'its',
    'in', 'at', 'into', 'on', 'upon', 'of', 'from', 'for', 'with', 'by', 'than', 'as'
  ];

  targetWords.forEach(w => {
    assert.strictEqual(
      FUNCTIONAL_GRAMMAR_WORDS.has(w),
      true,
      `Expected ${w} to be in FUNCTIONAL_GRAMMAR_WORDS`
    );
    assert.strictEqual(
      isExcludedFromConveyor({ word: w }),
      true,
      `Expected ${w} to be excluded by isExcludedFromConveyor`
    );
    assert.strictEqual(
      isExcludedFromConveyor({ word: `  ${w.toUpperCase()}  ` }),
      true,
      `Expected uppercase/whitespace trimmed ${w} to be excluded`
    );
  });

  // Regular vocabulary words must NOT be excluded
  assert.strictEqual(isExcludedFromConveyor({ word: 'apple' }), false);
  assert.strictEqual(isExcludedFromConveyor({ word: 'table' }), false);
  assert.strictEqual(isExcludedFromConveyor({ word: 'wait for' }), false);
});

test('Functional words exclusion: getQueueForCards excludes functional words even if in list', () => {
  const testWords = [
    { id: 3859, word: 'the', category: 'Advanced' },
    { id: 3788, word: 'in', category: 'Advanced' },
    { id: 100, word: 'bread', category: 'Elementary' },
    { id: 101, word: 'water', category: 'Elementary' }
  ];

  const queue = getQueueForCards(testWords, {}, []);
  const ids = queue.map(w => w.id);

  assert.strictEqual(ids.includes(3859), false, 'the must NOT be in Cards queue');
  assert.strictEqual(ids.includes(3788), false, 'in must NOT be in Cards queue');
  assert.strictEqual(ids.includes(100), true, 'bread must be in Cards queue');
  assert.strictEqual(ids.includes(101), true, 'water must be in Cards queue');
});

test('Functional words exclusion: prepareTrainingBatch never injects functional words', () => {
  const testWords = [
    { id: 1396, word: 'it', category: 'Advanced' },
    { id: 3909, word: 'this', category: 'Advanced' },
    { id: 4005, word: 'on', category: 'Advanced' },
    { id: 200, word: 'morning', category: 'Elementary' },
    { id: 201, word: 'evening', category: 'Elementary' }
  ];

  const batch = prepareTrainingBatch(testWords, {}, []);
  const wordsInBatch = batch.map(w => w.word);

  assert.strictEqual(wordsInBatch.includes('it'), false);
  assert.strictEqual(wordsInBatch.includes('this'), false);
  assert.strictEqual(wordsInBatch.includes('on'), false);
  assert.strictEqual(wordsInBatch.includes('morning'), true);
  assert.strictEqual(wordsInBatch.includes('evening'), true);
});

test('Conveyor batch composition: 5 new words + 3 oldest favorites + 2 oldest mastered = 10 words', () => {
  const categoryWords = [
    // 8 unstarted new words
    { id: 1, word: 'new1', category: 'Elementary', zipf: 7.0 },
    { id: 2, word: 'new2', category: 'Elementary', zipf: 6.9 },
    { id: 3, word: 'new3', category: 'Elementary', zipf: 6.8 },
    { id: 4, word: 'new4', category: 'Elementary', zipf: 6.7 },
    { id: 5, word: 'new5', category: 'Elementary', zipf: 6.6 },
    { id: 6, word: 'new6', category: 'Elementary', zipf: 6.5 },
    { id: 7, word: 'new7', category: 'Elementary', zipf: 6.4 },
    { id: 8, word: 'new8', category: 'Elementary', zipf: 6.3 },
    // 5 favorite words
    { id: 101, word: 'fav1', category: 'Elementary', zipf: 5.0 },
    { id: 102, word: 'fav2', category: 'Elementary', zipf: 5.0 },
    { id: 103, word: 'fav3', category: 'Elementary', zipf: 5.0 },
    { id: 104, word: 'fav4', category: 'Elementary', zipf: 5.0 },
    { id: 105, word: 'fav5', category: 'Elementary', zipf: 5.0 },
    // 5 mastered words
    { id: 201, word: 'mast1', category: 'Elementary', zipf: 4.0 },
    { id: 202, word: 'mast2', category: 'Elementary', zipf: 4.0 },
    { id: 203, word: 'mast3', category: 'Elementary', zipf: 4.0 },
    { id: 204, word: 'mast4', category: 'Elementary', zipf: 4.0 },
    { id: 205, word: 'mast5', category: 'Elementary', zipf: 4.0 },
  ];

  const progress = {
    101: { lastReviewedAt: 500 },
    102: { lastReviewedAt: 100 }, // oldest fav #1
    103: { lastReviewedAt: 300 }, // oldest fav #3
    104: { lastReviewedAt: 200 }, // oldest fav #2
    105: { lastReviewedAt: 400 },
    201: { mastered: true, lastReviewedAt: 900 },
    202: { mastered: true, lastReviewedAt: 150 }, // oldest mastered #1
    203: { mastered: true, lastReviewedAt: 250 }, // oldest mastered #2
    204: { mastered: true, lastReviewedAt: 350 }, // oldest mastered #3 (used if favs < 3)
    205: { mastered: true, lastReviewedAt: 450 },
  };
  const favorites = ['101', '102', '103', '104', '105'];

  // 1. Standard case: 5 new + 3 oldest favs + 2 oldest mastered = 10
  const batch = prepareTrainingBatch(categoryWords, progress, favorites);
  assert.strictEqual(batch.length, 10, 'Batch should have exactly 10 words');
  assert.deepStrictEqual(
    batch.map(w => w.id),
    [1, 2, 3, 4, 5, 102, 104, 103, 202, 203],
    'Batch should contain top 5 new words, 3 oldest favorites, and 2 oldest mastered words'
  );

  // 2. Fallback when only 1 favorite exists: 5 new + 1 fav + 4 oldest mastered = 10
  const batchOneFav = prepareTrainingBatch(categoryWords, progress, ['102']);
  assert.strictEqual(batchOneFav.length, 10, 'Batch with 1 fav should still fill up to 10 words using mastered');
  assert.deepStrictEqual(
    batchOneFav.map(w => w.id),
    [1, 2, 3, 4, 5, 102, 202, 203, 204, 205]
  );

  // 3. Cards intake queue finishes after 5 words are picked in round
  const cardsProgress = {
    1: { roundCardsDone: true },
    2: { roundCardsDone: true },
    3: { roundCardsDone: true },
    4: { roundCardsDone: true },
    5: { roundCardsDone: true },
  };
  const remainingCardsQueue = getQueueForCards(categoryWords, cardsProgress, favorites);
  assert.strictEqual(remainingCardsQueue.length, 0, 'Cards queue should close once 5 new words are picked');
});
