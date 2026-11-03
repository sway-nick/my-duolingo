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
