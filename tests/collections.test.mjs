import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Setup minimal browser-like globals for collectionsService
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  AndroidWidgetBridge: {
    syncFavorites: (payload) => {
      global.__lastWidgetPayload = JSON.parse(payload);
    },
  },
};
global.localStorage = {
  _store: {},
  getItem(k) {
    return this._store[k] || null;
  },
  setItem(k, v) {
    this._store[k] = String(v);
  },
  removeItem(k) {
    delete this._store[k];
  },
  clear() {
    this._store = {};
  },
};
global.CustomEvent = class {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts ? opts.detail : null;
  }
};

const wordsJsonPath = path.resolve('frontend/assets/data/words.json');
const wordsData = JSON.parse(fs.readFileSync(wordsJsonPath, 'utf8'));

test('Collections: words.json has 0 U+FFFD characters', () => {
  const rawText = fs.readFileSync(wordsJsonPath, 'utf8');
  assert.equal(rawText.includes('\ufffd'), false, 'words.json must not have replacement character U+FFFD');
});

test('Collections: months and days_of_week are complete in words.json', async () => {
  const { BUILTIN_COLLECTIONS_DEF, getCollectionWords } = await import('../frontend/services/collectionsService.js');

  const monthsDef = BUILTIN_COLLECTIONS_DEF.find((c) => c.id === 'months');
  assert.ok(monthsDef, 'months collection definition exists');
  assert.equal(monthsDef.wordKeys.length, 12, '12 months defined');

  const monthWords = getCollectionWords('months', wordsData);
  assert.equal(monthWords.length, 12, 'all 12 months present in dictionary');

  const daysDef = BUILTIN_COLLECTIONS_DEF.find((c) => c.id === 'days_of_week');
  assert.ok(daysDef, 'days_of_week collection definition exists');
  assert.equal(daysDef.wordKeys.length, 7, '7 days of week defined');

  const dayWords = getCollectionWords('days_of_week', wordsData);
  assert.equal(dayWords.length, 7, 'all 7 days present in dictionary');
});

test('Collections: all 12 thematic collections have non-empty words in dictionary', async () => {
  const { BUILTIN_COLLECTIONS_DEF, getCollectionWords } = await import('../frontend/services/collectionsService.js');

  const thematicCols = BUILTIN_COLLECTIONS_DEF.filter((c) => c.id !== 'my_favorites');
  assert.equal(thematicCols.length, 12, '12 thematic collections defined');

  for (const col of thematicCols) {
    const words = getCollectionWords(col.id, wordsData);
    assert.ok(words.length > 0, `Collection ${col.id} has words in dictionary (found ${words.length})`);
  }
});

test('Collections: Custom collections CRUD operations work as expected', async () => {
  const {
    createCustomCollection,
    getCustomCollections,
    renameCustomCollection,
    addWordToCollection,
    removeWordFromCollection,
    deleteCustomCollection,
    getCollectionWords,
  } = await import('../frontend/services/collectionsService.js');

  global.localStorage.clear();

  // Create
  const col = createCustomCollection('Урок 5', '📘');
  assert.ok(col);
  assert.equal(col.name, 'Урок 5');
  assert.equal(col.icon, '📘');

  // Add words
  addWordToCollection(col.id, wordsData[0].id);
  addWordToCollection(col.id, wordsData[1].id);

  let customWords = getCollectionWords(col.id, wordsData);
  assert.equal(customWords.length, 2);

  // Rename
  renameCustomCollection(col.id, 'Урок 5 (Продвинутый)');
  const updatedList = getCustomCollections();
  assert.equal(updatedList[0].name, 'Урок 5 (Продвинутый)');

  // Remove word
  removeWordFromCollection(col.id, wordsData[0].id);
  customWords = getCollectionWords(col.id, wordsData);
  assert.equal(customWords.length, 1);
  assert.equal(customWords[0].id, wordsData[1].id);

  // Delete
  deleteCustomCollection(col.id);
  assert.equal(getCustomCollections().length, 0);
});

test('Collections: syncCollectionToAndroidWidget sends valid payload to widget', async () => {
  const { syncCollectionToAndroidWidget } = await import('../frontend/services/collectionsService.js');

  global.__lastWidgetPayload = null;
  syncCollectionToAndroidWidget('months', wordsData);

  assert.ok(global.__lastWidgetPayload, 'payload received by AndroidWidgetBridge');
  assert.equal(global.__lastWidgetPayload.collectionId, 'months');
  assert.equal(global.__lastWidgetPayload.title, 'Месяцы');
  assert.equal(global.__lastWidgetPayload.hasFavorites, true);
  assert.equal(global.__lastWidgetPayload.words.length, 12);
  assert.equal(global.__lastWidgetPayload.words[0].word, 'january');
});
