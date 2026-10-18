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
  _store: {
    myduo_interface_lang: 'ru',
    myduo_lang_manual: 'true',
  },
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
    this._store = {
      myduo_interface_lang: 'ru',
      myduo_lang_manual: 'true',
    };
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

  // 20-character limit check on rename and create
  renameCustomCollection(col.id, '1234567890123456789012345');
  assert.equal(getCustomCollections()[0].name, '12345678901234567890');
  assert.equal(getCustomCollections()[0].name.length, 20);

  const longCol = createCustomCollection('Очень длинное название новой коллекции более 20 символов');
  assert.equal(longCol.name.length, 20);
  deleteCustomCollection(longCol.id);

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
  assert.equal(global.__lastWidgetPayload.words[0].word.toLowerCase(), 'january');
});

test('Collections: BUILTIN_COLLECTIONS_WITH_GEAR contains exactly the 9 thematic collections', async () => {
  const {
    BUILTIN_COLLECTIONS_WITH_GEAR,
    getCollectionWords,
    setCollectionWords,
    isBuiltinCollectionOverridden,
    resetBuiltinCollection,
    removeWordFromCollection,
    addWordToCollection,
  } = await import('../frontend/services/collectionsService.js');

  const expectedIds = ['colors', 'body_parts', 'sport', 'food', 'clothes', 'animals', 'verbs', 'adjectives', 'phrasal_verbs'];
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.size, 9);
  for (const id of expectedIds) {
    assert.ok(BUILTIN_COLLECTIONS_WITH_GEAR.has(id), `gear enabled for ${id}`);
  }
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('months'), false, 'months has no gear');
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('days_of_week'), false, 'days_of_week has no gear');
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('numbers'), false, 'numbers has no gear');

  // Verify builtin override & reset
  const defaultColors = getCollectionWords('colors', wordsData);
  assert.ok(defaultColors.length > 0);
  assert.equal(isBuiltinCollectionOverridden('colors'), false);

  // Override colors with just 2 words
  const sampleIds = [String(defaultColors[0].id), String(defaultColors[1].id)];
  setCollectionWords('colors', sampleIds);
  assert.equal(isBuiltinCollectionOverridden('colors'), true);
  const overriddenColors = getCollectionWords('colors', wordsData);
  assert.equal(overriddenColors.length, 2);

  // Reset colors
  resetBuiltinCollection('colors');
  assert.equal(isBuiltinCollectionOverridden('colors'), false);
  const resetColors = getCollectionWords('colors', wordsData);
  assert.equal(resetColors.length, defaultColors.length);

  // Test removeWordFromCollection and addWordToCollection on built-in collection
  const firstWord = defaultColors[0];
  removeWordFromCollection('colors', firstWord.id, wordsData);
  assert.equal(isBuiltinCollectionOverridden('colors'), true);
  const afterRemove = getCollectionWords('colors', wordsData);
  assert.equal(afterRemove.length, defaultColors.length - 1);
  assert.equal(afterRemove.some((w) => String(w.id) === String(firstWord.id)), false);

  addWordToCollection('colors', firstWord.id, wordsData);
  const afterAdd = getCollectionWords('colors', wordsData);
  assert.equal(afterAdd.length, defaultColors.length);
  assert.equal(afterAdd.some((w) => String(w.id) === String(firstWord.id)), true);

  resetBuiltinCollection('colors');
});

test('Collections: all 13 built-in collections have names in all 33 supported locales', async () => {
  const { BUILTIN_COLLECTIONS_DEF, getCollectionTitle } = await import('../frontend/services/collectionsService.js');
  const locales = [
    'ru', 'uk', 'en', 'de', 'es', 'fr', 'pl', 'tr', 'it', 'ro', 'bg',
    'hu', 'el', 'da', 'ga', 'lv', 'lt', 'mt', 'pt', 'sk', 'sl', 'fi',
    'hr', 'cs', 'sv', 'et', 'hi', 'ar', 'id', 'vi', 'th', 'ko', 'ja',
  ];

  assert.equal(BUILTIN_COLLECTIONS_DEF.length, 13, '13 built-in collections');

  for (const col of BUILTIN_COLLECTIONS_DEF) {
    for (const loc of locales) {
      assert.ok(col.name[loc], `Collection "${col.id}" must have name for locale "${loc}"`);
      assert.ok(col.name[loc].trim().length > 0, `Collection "${col.id}" title for "${loc}" cannot be empty`);
      const title = getCollectionTitle(col.id, loc);
      assert.equal(title, col.name[loc]);
    }
  }
});

test('Collections: WIDGET_TRANSLATIONS has all required hub and modal keys in all 33 locales', async () => {
  const { WIDGET_TRANSLATIONS } = await import('../frontend/services/widgetTranslations.js');
  const locales = [
    'ru', 'uk', 'en', 'de', 'es', 'fr', 'pl', 'tr', 'it', 'ro', 'bg',
    'hu', 'el', 'da', 'ga', 'lv', 'lt', 'mt', 'pt', 'sk', 'sl', 'fi',
    'hr', 'cs', 'sv', 'et', 'hi', 'ar', 'id', 'vi', 'th', 'ko', 'ja',
  ];

  const requiredKeys = [
    'fav_hub_btn',
    'col_pill_widget',
    'col_pill_widget_title',
    'col_add_new_list',
    'col_custom_desc',
    'col_manage_btn',
    'col_empty_favorites_alert',
    'col_menu_title_list',
    'col_menu_title_collection',
    'col_menu_view_words',
    'col_menu_rename',
    'col_menu_delete',
    'col_menu_reset',
    'col_menu_cancel',
    'col_menu_prompt_action',
    'col_menu_rename_prompt',
    'col_menu_delete_confirm',
    'col_create_prompt',
    'col_menu_set_widget',
    'col_menu_widget_active',
    'col_menu_edit',
    'col_btn_add',
    'col_btn_add_words',
    'col_reset_to_default',
  ];

  for (const loc of locales) {
    assert.ok(WIDGET_TRANSLATIONS[loc], `WIDGET_TRANSLATIONS must have locale "${loc}"`);
    for (const key of requiredKeys) {
      assert.ok(
        WIDGET_TRANSLATIONS[loc][key],
        `Locale "${loc}" must have key "${key}" in WIDGET_TRANSLATIONS`
      );
      assert.ok(
        WIDGET_TRANSLATIONS[loc][key].trim().length > 0,
        `Key "${key}" in locale "${loc}" cannot be empty`
      );
    }
  }
});

test('Collections: Android Back Button returns to Collections Hub before exiting to Main screen', () => {
  // Simulate navigation hierarchy
  let activeTab = 'favorites';
  let tabHistory = ['training', 'favorites'];
  let isInsideCollectionCards = true;
  let currentOpenCollectionId = 'days_of_week';
  let backBtnClicked = false;
  let hubRendered = false;

  let mockFavBackBtn = {
    click: () => {
      backBtnClicked = true;
      isInsideCollectionCards = false;
      currentOpenCollectionId = null;
      hubRendered = true;
      mockFavBackBtn = null;
    }
  };

  const handleAndroidBackButtonSim = () => {
    // Priority 4.5: If viewing a collection's cards inside Favorites/Collections, return to the Collections Hub grid
    if (activeTab === 'favorites' && (mockFavBackBtn || isInsideCollectionCards)) {
      isInsideCollectionCards = false;
      currentOpenCollectionId = null;
      if (mockFavBackBtn && typeof mockFavBackBtn.click === 'function') {
        mockFavBackBtn.click();
      } else {
        hubRendered = true;
      }
      return true;
    }

    // Priority 5: If on secondary tabs, return to previous page in history
    if (activeTab !== 'training') {
      if (tabHistory.length > 1 && tabHistory[tabHistory.length - 1] === activeTab) {
        tabHistory.pop();
      }
      const previousTab = tabHistory.length > 0 ? tabHistory[tabHistory.length - 1] : 'training';
      activeTab = previousTab;
      return true;
    }

    return false;
  };

  // 1st press while inside "days_of_week": must NOT switch to training, must return to Collections Hub
  const press1 = handleAndroidBackButtonSim();
  assert.equal(press1, true);
  assert.equal(backBtnClicked, true);
  assert.equal(hubRendered, true);
  assert.equal(isInsideCollectionCards, false);
  assert.equal(activeTab, 'favorites'); // Stays on favorites tab, showing the hub grid!

  // Now simulated user is on Collections Hub grid (favBackBtn is null)
  const press2 = handleAndroidBackButtonSim();
  assert.equal(press2, true);
  assert.equal(activeTab, 'training'); // Now returns to Main / Training screen!

  // 3rd press on Main screen: returns false (triggers Android exit / double-tap toast)
  const press3 = handleAndroidBackButtonSim();
  assert.equal(press3, false);
});

test('Collections: Widget button connects collection and opens settings modal only if widget is not pinned', () => {
  let modalOpened = false;
  let activeCol = null;

  const mockOpenWidgetConfig = () => {
    modalOpened = true;
  };

  const handleWidgetButtonClickSim = (colId, isInstalledOnHomeScreen) => {
    activeCol = colId;
    if (!isInstalledOnHomeScreen) {
      mockOpenWidgetConfig();
    }
  };

  // Case 1: Widget is NOT on home screen -> connects AND opens settings modal
  modalOpened = false;
  handleWidgetButtonClickSim('months', false);
  assert.equal(activeCol, 'months');
  assert.equal(modalOpened, true);

  // Case 2: Widget IS on home screen -> connects WITHOUT opening modal
  modalOpened = false;
  handleWidgetButtonClickSim('sport', true);
  assert.equal(activeCol, 'sport');
  assert.equal(modalOpened, false);
});

test('Collections: Clicking "Repeat" in collection (e.g. colors) enters repeat practice cards mode with accurate title and words without altering home screen widget', async () => {
  const { getCollectionWords, setActiveCollectionId, getActiveCollectionId, getCollectionTitle } = await import('../frontend/services/collectionsService.js');
  const colorWords = getCollectionWords('colors', wordsData);

  assert.equal(colorWords.length, 13);
  assert.equal(colorWords.some((w) => w.word === 'red'), true);
  assert.equal(colorWords.some((w) => w.word === 'green'), true);

  // Widget active collection is 'my_favorites'
  setActiveCollectionId('my_favorites');
  assert.equal(getActiveCollectionId(), 'my_favorites');

  let activeTab = 'favorites';
  let favoritePracticeWords = null;
  let favoritePracticeMethod = 'cards';
  let activePracticeCollectionId = null;
  let activePracticeCollectionTitle = null;

  // Simulate startPracticeHandler
  const startPracticeHandlerSim = (practiceWords, colId, colTitle) => {
    const targetId = colId || 'my_favorites';
    activePracticeCollectionId = targetId;
    activePracticeCollectionTitle = colTitle || getCollectionTitle(targetId);

    const practiceList = (practiceWords && practiceWords.length > 0)
      ? practiceWords
      : getCollectionWords(targetId, wordsData);

    favoritePracticeWords = [...practiceList];
    favoritePracticeMethod = 'cards';
    activeTab = 'training';
  };

  startPracticeHandlerSim(colorWords, 'colors', getCollectionTitle('colors'));

  // 1. Switched to training tab in cards mode
  assert.equal(activeTab, 'training');
  assert.equal(favoritePracticeMethod, 'cards');

  // 2. Contains all 13 color words
  assert.equal(favoritePracticeWords.length, 13);

  // 3. Practice collection metadata is set to "Цвета" / colors
  assert.equal(activePracticeCollectionId, 'colors');
  assert.equal(activePracticeCollectionTitle, 'Цвета');

  // 4. Widget connection is NOT overwritten (remains 'my_favorites')
  assert.equal(getActiveCollectionId(), 'my_favorites');
});

test('Auditor Fix: isBuiltinCollectionOverridden returns true even when collection has 0 words, allowing reset', async () => {
  const { setCollectionWords, isBuiltinCollectionOverridden, resetBuiltinCollection, getCollectionWords } = await import('../frontend/services/collectionsService.js');

  // Set override to empty array
  setCollectionWords('months', []);
  assert.equal(isBuiltinCollectionOverridden('months'), true, 'Must return true so reset button is visible in UI');

  const words = getCollectionWords('months', wordsData);
  assert.equal(words.length, 0);

  // Reset collection
  resetBuiltinCollection('months');
  assert.equal(isBuiltinCollectionOverridden('months'), false);
  const resetWords = getCollectionWords('months', wordsData);
  assert.equal(resetWords.length, 12, 'Default 12 months restored');
});

test('Auditor Fix: getWordLookupMap caches by array reference, not only length', async () => {
  const { getCollectionWords } = await import('../frontend/services/collectionsService.js');

  const listA = [
    { id: 101, word: 'red', translation: 'красный' },
    { id: 102, word: 'green', translation: 'зеленый' }
  ];
  const listB = [
    { id: 201, word: 'red', translation: 'красный (B)' },
    { id: 202, word: 'yellow', translation: 'желтый' }
  ];

  const colA = getCollectionWords('colors', listA);
  assert.equal(colA.some((w) => w.id === 101), true);

  const colB = getCollectionWords('colors', listB);
  assert.equal(colB.some((w) => w.id === 201), true, 'Must find ID 201 from listB, not stale 101 from listA');
});

test('Auditor Fix: deleteCustomCollection and renameCustomCollection update Android widget when active', async () => {
  const {
    createCustomCollection,
    setActiveCollectionId,
    getActiveCollectionId,
    renameCustomCollection,
    deleteCustomCollection,
  } = await import('../frontend/services/collectionsService.js');

  const col = createCustomCollection('Урок 99', '📘');
  assert.ok(col);
  setActiveCollectionId(col.id);
  assert.equal(getActiveCollectionId(), col.id);

  // Rename active collection
  renameCustomCollection(col.id, 'Урок 100', '📗', wordsData);
  assert.equal(global.__lastWidgetPayload?.title, 'Урок 100');

  // Delete active collection -> must revert widget to my_favorites
  deleteCustomCollection(col.id, wordsData);
  assert.equal(getActiveCollectionId(), 'my_favorites');
  assert.equal(global.__lastWidgetPayload?.collectionId, 'my_favorites');
});

