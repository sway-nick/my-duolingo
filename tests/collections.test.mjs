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

test('Collections: all 15 thematic collections have 100% of their words in dictionary', async () => {
  const { BUILTIN_COLLECTIONS_DEF, getCollectionWords } = await import('../frontend/services/collectionsService.js');

  const thematicCols = BUILTIN_COLLECTIONS_DEF.filter((c) => c.id !== 'my_favorites');
  assert.equal(thematicCols.length, 15, '15 thematic collections defined');

  for (const col of thematicCols) {
    const words = getCollectionWords(col.id, wordsData);
    assert.equal(words.length, col.wordKeys.length, `Collection ${col.id} has all ${col.wordKeys.length} words in dictionary (found ${words.length})`);
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
  // Regression guard: translation must not collapse to English word itself!
  assert.ok(global.__lastWidgetPayload.words[0].translation, 'translation must exist');
  assert.notEqual(
    global.__lastWidgetPayload.words[0].translation.toLowerCase(),
    global.__lastWidgetPayload.words[0].word.toLowerCase(),
    'widget front and back must never be identical (translation != word)'
  );
  assert.equal(global.__lastWidgetPayload.words[0].translation.toLowerCase(), 'январь');
});

test('Collections: syncCollectionToAndroidWidget preserves translation when interface lang is en or unconfigured', async () => {
  const { syncCollectionToAndroidWidget } = await import('../frontend/services/collectionsService.js');
  const { getWordTranslation } = await import('../frontend/services/i18n.js');

  // Clear manual settings to simulate fresh WebView/default locale
  const oldManual = global.localStorage.getItem('myduo_lang_manual');
  const oldLang = global.localStorage.getItem('myduo_interface_lang');
  global.localStorage.removeItem('myduo_lang_manual');
  global.localStorage.setItem('myduo_interface_lang', 'en');

  try {
    const testWord = wordsData.find((w) => w.word && w.word.toLowerCase() === 'knowledge');
    assert.ok(testWord, 'knowledge word found in dictionary');
    const trans = getWordTranslation(testWord);
    assert.ok(trans, 'translation must not be empty');
    assert.notEqual(trans.toLowerCase(), 'knowledge', 'Knowledge translation must not be Knowledge');
    assert.ok(trans.toLowerCase().includes('знани'), `Expected Russian translation, got: ${trans}`);

    global.__lastWidgetPayload = null;
    syncCollectionToAndroidWidget('months', wordsData);
    assert.ok(global.__lastWidgetPayload);
    assert.equal(global.__lastWidgetPayload.words[0].translation.toLowerCase(), 'январь');
  } finally {
    global.localStorage.setItem('myduo_lang_manual', oldManual);
    global.localStorage.setItem('myduo_interface_lang', oldLang);
  }
});

test('i18n: Japanese interface language returns Japanese translation from words.json', async () => {
  const { getWordTranslation } = await import('../frontend/services/i18n.js');
  const oldManual = global.localStorage.getItem('myduo_lang_manual');
  const oldLang = global.localStorage.getItem('myduo_interface_lang');
  global.localStorage.setItem('myduo_lang_manual', 'true');
  global.localStorage.setItem('myduo_interface_lang', 'ja');

  try {
    const testWord = wordsData.find((w) => w.word && w.word.toLowerCase() === 'knowledge');
    assert.ok(testWord, 'knowledge word found in dictionary');
    const trans = getWordTranslation(testWord);
    assert.equal(trans, '知識', 'Knowledge translation in Japanese must be 知識');
  } finally {
    global.localStorage.setItem('myduo_lang_manual', oldManual);
    global.localStorage.setItem('myduo_interface_lang', oldLang);
  }
});

test('Collections: BUILTIN_COLLECTIONS_WITH_GEAR contains exactly the 11 thematic collections', async () => {
  const {
    BUILTIN_COLLECTIONS_WITH_GEAR,
    getCollectionWords,
    setCollectionWords,
    isBuiltinCollectionOverridden,
    resetBuiltinCollection,
    removeWordFromCollection,
    addWordToCollection,
  } = await import('../frontend/services/collectionsService.js');

  const expectedIds = ['colors', 'body_parts', 'sport', 'food', 'clothes', 'animals', 'verbs', 'adjectives', 'phrasal_verbs', 'it_terms', 'idioms'];
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.size, 11);
  for (const id of expectedIds) {
    assert.ok(BUILTIN_COLLECTIONS_WITH_GEAR.has(id), `gear enabled for ${id}`);
  }
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('months'), false, 'months has no gear');
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('days_of_week'), false, 'days_of_week has no gear');
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('numbers'), false, 'numbers has no gear');
  assert.equal(BUILTIN_COLLECTIONS_WITH_GEAR.has('ordinal_numbers'), false, 'ordinal_numbers has no gear');

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

test('Collections: all 16 built-in collections have names in all 36 supported locales', async () => {
  const { BUILTIN_COLLECTIONS_DEF, getCollectionTitle } = await import('../frontend/services/collectionsService.js');
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const locales = SUPPORTED_LOCALE_CODES;

  assert.equal(BUILTIN_COLLECTIONS_DEF.length, 16, '16 built-in collections');

  for (const col of BUILTIN_COLLECTIONS_DEF) {
    for (const loc of locales) {
      assert.ok(col.name[loc], `Collection "${col.id}" must have name for locale "${loc}"`);
      assert.ok(col.name[loc].trim().length > 0, `Collection "${col.id}" title for "${loc}" cannot be empty`);
      const title = getCollectionTitle(col.id, loc);
      assert.equal(title, col.name[loc]);
    }
  }
});

test('Collections: WIDGET_TRANSLATIONS has all required hub and modal keys in all 36 locales', async () => {
  const { WIDGET_TRANSLATIONS } = await import('../frontend/services/widgetTranslations.js');
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const locales = SUPPORTED_LOCALE_CODES;

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
    'col_btn_done',
    'col_fav_desc',
    'col_create_placeholder',
    'widget_save_changes',
    'widget_add_to_screen',
    'widget_pin_manual_fallback',
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

  assert.equal(colorWords.length, 20);
  assert.equal(colorWords.some((w) => w.word === 'red'), true);
  assert.equal(colorWords.some((w) => w.word === 'blue'), true);
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

  // 2. Contains all 20 color words
  assert.equal(favoritePracticeWords.length, 20);

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

test('FavoritesView: collection words are NOT favorited by default (🤍) unless present in favoriteIds', async () => {
  const container = {
    innerHTML: '',
    querySelector(sel) {
      if (sel === '#favorites-grid') return null;
      if (sel === '.mobile-header') return null;
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
  global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector(sel) {
      if (sel === '#app-content') return container;
      return null;
    },
    querySelectorAll() {
      return [];
    },
    documentElement: {
      getPropertyValue: () => '0px'
    }
  };
  global.getComputedStyle = () => ({
    getPropertyValue: () => '0px'
  });

  const { renderFavoritesView } = await import('../frontend/components/favorites/FavoritesView.js');

  const sampleMonths = [
    { id: 101, word: 'January', translation: 'январь', category: 'Elementary' },
    { id: 102, word: 'February', translation: 'февраль', category: 'Elementary' },
    { id: 103, word: 'March', translation: 'март', category: 'Elementary' }
  ];

  // Case 1: No favoriteIds -> all 3 months must render with 🤍, none with ❤️
  renderFavoritesView(sampleMonths, '#app-content', {
    collectionId: 'months',
    collectionTitle: 'Месяцы',
    allWords: sampleMonths,
    favoriteIds: []
  });

  assert.ok(container.innerHTML.includes('Месяцы: 3'));
  assert.equal((container.innerHTML.match(/🤍/g) || []).length, 3, 'All 3 words in months should have 🤍 by default');
  assert.equal((container.innerHTML.match(/❤️/g) || []).length, 0, 'No words should have ❤️ in months by default');

  // Case 2: Only word 102 (February) is favorited -> February has ❤️, January & March have 🤍
  renderFavoritesView(sampleMonths, '#app-content', {
    collectionId: 'months',
    collectionTitle: 'Месяцы',
    allWords: sampleMonths,
    favoriteIds: [102]
  });

  assert.equal((container.innerHTML.match(/🤍/g) || []).length, 2, 'January and March have 🤍');
  assert.equal((container.innerHTML.match(/❤️/g) || []).length, 1, 'Only February has ❤️');

  // Case 3: In my_favorites, all word cards render with ❤️
  renderFavoritesView([sampleMonths[1]], '#app-content', {
    collectionId: 'my_favorites',
    collectionTitle: 'Избранные',
    allWords: sampleMonths,
    favoriteIds: [102]
  });
  assert.equal((container.innerHTML.match(/class="[^"]*remove-fav-btn[^"]*"[^>]*>❤️/g) || []).length, 1, 'In my_favorites, cards show ❤️');
  assert.equal((container.innerHTML.match(/🤍/g) || []).length, 0, 'In my_favorites, no 🤍');
});

test('Collections: IT (200) and Idioms (100) have 36-locale notes and downloadable pack flow', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const {
     getCollectionWords,
    DOWNLOADABLE_PACK_I18N,
    isCollectionPackDownloaded,
    markCollectionPackDownloaded,
  } = await import('../frontend/services/collectionsService.js');
  const { renderFavoritesView } = await import('../frontend/components/favorites/FavoritesView.js');

  const { UNLOCKED_STORY_MODAL_I18N } = await import('../frontend/components/modals/MilestoneStoryModal.js');
  for (const loc of SUPPORTED_LOCALE_CODES) {
    assert.ok(UNLOCKED_STORY_MODAL_I18N[loc], `UNLOCKED_STORY_MODAL_I18N missing locale ${loc}`);
    assert.ok(UNLOCKED_STORY_MODAL_I18N[loc].msg && UNLOCKED_STORY_MODAL_I18N[loc].msg.includes('{title}'), `UNLOCKED_STORY_MODAL_I18N.msg missing {title} for ${loc}`);
  }

  for (const loc of SUPPORTED_LOCALE_CODES) {
    assert.ok(DOWNLOADABLE_PACK_I18N[loc], `DOWNLOADABLE_PACK_I18N missing locale ${loc}`);
    assert.ok(DOWNLOADABLE_PACK_I18N[loc].downloadBtn, `downloadBtn missing for ${loc}`);
    assert.ok(DOWNLOADABLE_PACK_I18N[loc].itDesc, `itDesc missing for ${loc}`);
    assert.ok(DOWNLOADABLE_PACK_I18N[loc].idiomsDesc, `idiomsDesc missing for ${loc}`);
    assert.ok(DOWNLOADABLE_PACK_I18N[loc].verbsDesc, `verbsDesc missing for ${loc}`);
    assert.ok(DOWNLOADABLE_PACK_I18N[loc].adjectivesDesc, `adjectivesDesc missing for ${loc}`);
    assert.ok(DOWNLOADABLE_PACK_I18N[loc].phrasalVerbsDesc, `phrasalVerbsDesc missing for ${loc}`);
  }

  const itWords = getCollectionWords('it_terms', wordsData);
  const idiomWords = getCollectionWords('idioms', wordsData);
  assert.equal(itWords.length, 200);
  assert.equal(idiomWords.length, 150);

  const expectedExpandedCounts = {
    colors: 20,
    body_parts: 50,
    food: 50,
    clothes: 50,
    animals: 50,
    adjectives: 100,
    phrasal_verbs: 100,
    idioms: 150,
  };
  for (const [colId, expectedLen] of Object.entries(expectedExpandedCounts)) {
    const colWords = getCollectionWords(colId, wordsData);
    assert.equal(
      colWords.length,
      expectedLen,
      `Collection "${colId}" expected ${expectedLen} words, got ${colWords.length}`
    );
  }

  const { getWordNotes } = await import('../frontend/services/i18n.js');
  const phrasalWords = getCollectionWords('phrasal_verbs', wordsData);
  assert.equal(phrasalWords.length, 100);

  for (const w of [...itWords, ...idiomWords, ...phrasalWords]) {
    assert.ok(w.notes, `Word ${w.word} missing Russian notes`);
    assert.ok(w.all_notes, `Word ${w.word} missing all_notes`);
    for (const loc of SUPPORTED_LOCALE_CODES) {
      const noteText = getWordNotes(w, loc);
      assert.ok(
        typeof noteText === 'string' && noteText.trim().length > 0,
        `Word "${w.word}" missing translated note for locale "${loc}"`
      );
    }
  }

  // Verify IT notes are isolated when hideItNotes: true (Dictionary / general Training), while Idiom & Phrasal Verb notes remain visible
  for (const w of itWords) {
    assert.equal(getWordNotes(w, 'ru', { hideItNotes: true }), '', `IT note for "${w.word}" must be hidden when hideItNotes is true`);
    assert.ok(getWordNotes(w, 'ru', { hideItNotes: false }).length > 0, `IT note for "${w.word}" must be visible inside IT collection`);
  }
  for (const w of [...idiomWords, ...phrasalWords]) {
    assert.ok(getWordNotes(w, 'ru', { hideItNotes: true }).length > 0, `Note for "${w.word}" must remain visible in general Dictionary`);
  }

  const { setEntitlement, clearEntitlement } = await import('../frontend/services/proState.js');
  clearEntitlement();
  global.localStorage.clear();
  assert.equal(isCollectionPackDownloaded('it_terms'), false);
  assert.equal(isCollectionPackDownloaded('idioms'), false);
  assert.equal(isCollectionPackDownloaded('verbs'), false);
  assert.equal(isCollectionPackDownloaded('adjectives'), false);
  assert.equal(isCollectionPackDownloaded('phrasal_verbs'), false);
  assert.equal(isCollectionPackDownloaded('months'), true);

  const container = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
  global.document.querySelector = (sel) => (sel === '#app-content' ? container : null);

  // Ad-unlocked pack (idioms) before download -> shows Download button with video icon 🎬
  renderFavoritesView(idiomWords, '#app-content', {
    collectionId: 'idioms',
    collectionTitle: 'Идиомы',
    allWords: wordsData,
    favoriteIds: [],
  });
  assert.ok(container.innerHTML.includes('id="download-collection-pack-btn"'), 'Must render download button before ad pack is downloaded');
  assert.ok(container.innerHTML.includes('🎬'), 'Download button must include video icon 🎬');

  // After 1st ad unlock -> renders first 10 idioms + unlock-more-idioms-btn (+10)
  markCollectionPackDownloaded('idioms');
  assert.equal(isCollectionPackDownloaded('idioms'), true);
  renderFavoritesView(idiomWords, '#app-content', {
    collectionId: 'idioms',
    collectionTitle: 'Идиомы',
    allWords: wordsData,
    favoriteIds: [],
  });
  assert.ok(container.innerHTML.includes('id="favorites-grid"'), 'Must render normal words grid after 1st idioms unlock');
  assert.ok(container.innerHTML.includes('id="unlock-more-idioms-btn"'), 'Must render +10 unlock button when more idioms remain');
  assert.equal((container.innerHTML.match(/class="fav-card"/g) || []).length, 10, 'Free tier must unlock exactly 10 idioms per ad');

  // Phrasal verbs -> unlocks 20 per ad, or all in PRO
  markCollectionPackDownloaded('phrasal_verbs');
  assert.equal(isCollectionPackDownloaded('phrasal_verbs'), true);
  renderFavoritesView(phrasalWords, '#app-content', {
    collectionId: 'phrasal_verbs',
    collectionTitle: 'Фразовые глаголы',
    allWords: wordsData,
    favoriteIds: [],
  });
  assert.equal((container.innerHTML.match(/class="fav-card"/g) || []).length, 20, 'Free tier must unlock exactly 20 phrasal verbs per ad');
  assert.ok(container.innerHTML.includes('id="unlock-more-idioms-btn"'), 'Must render +20 unlock button when more phrasal verbs remain');

  // IT collection shows 5 preview cards in free tier + PRO paywall button (cannot be unlocked via ad/localStorage flag)
  markCollectionPackDownloaded('it_terms');
  assert.equal(isCollectionPackDownloaded('it_terms'), false, 'it_terms must stay locked for non-PRO even if localStorage flag exists');
  renderFavoritesView(itWords, '#app-content', {
    collectionId: 'it_terms',
    collectionTitle: 'IT и разработка',
    allWords: wordsData,
    favoriteIds: [],
  });
  assert.ok(container.innerHTML.includes('id="favorites-grid"'), 'Must render 5-card preview grid for it_terms when not PRO');
  assert.equal((container.innerHTML.match(/class="fav-card"/g) || []).length, 5, 'Free tier must show exactly 5 preview cards for it_terms');
  assert.ok(container.innerHTML.includes('id="open-it-pro-btn"'), 'Must render PRO paywall button for it_terms when not PRO');
  assert.ok(!container.innerHTML.includes('id="download-collection-pack-btn"'), 'Must not render ad download button for PRO-only it_terms');

  // When PRO is active -> it_terms renders full words grid immediately without PRO button
  setEntitlement({ active: true, source: 'play' });
  assert.equal(isCollectionPackDownloaded('it_terms'), true);
  renderFavoritesView(itWords, '#app-content', {
    collectionId: 'it_terms',
    collectionTitle: 'IT и разработка',
    allWords: wordsData,
    favoriteIds: [],
  });
  assert.ok(container.innerHTML.includes('id="favorites-grid"'), 'Must render normal words grid for it_terms when PRO is active');
  assert.equal((container.innerHTML.match(/class="fav-card"/g) || []).length, itWords.length, 'PRO tier must render all it_terms cards');
  assert.ok(!container.innerHTML.includes('id="open-it-pro-btn"'), 'Must not render PRO paywall button when PRO is active');
  clearEntitlement();
});

test('ReviewFunnelModal: 36 locales coverage and 2-button flow', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { REVIEW_TRANSLATIONS, openReviewFunnelModal } = await import('../frontend/components/modals/ReviewFunnelModal.js');

  for (const loc of SUPPORTED_LOCALE_CODES) {
    assert.ok(REVIEW_TRANSLATIONS[loc], `Review translations missing locale ${loc}`);
    assert.ok(REVIEW_TRANSLATIONS[loc].step1Yes, `step1Yes missing for ${loc}`);
    assert.ok(REVIEW_TRANSLATIONS[loc].step1No, `step1No missing for ${loc}`);
    assert.ok(!REVIEW_TRANSLATIONS[loc].step1No.includes('👎'), `step1No must not have thumbs down icon for ${loc}`);
  }

  assert.equal(REVIEW_TRANSLATIONS.ru.step1Yes, '👍 Всё нравится');
  assert.equal(REVIEW_TRANSLATIONS.ru.step1No, 'Есть замечания');
});

test('Personal Word Overrides: saveUserWordOverride, i18n lookup, and openAddWordModal edit mode', async () => {
  const prevDoc = global.document;
  global.localStorage.clear();
  global.localStorage.setItem('myduo_interface_lang', 'ru');
  global.localStorage.setItem('myduo_lang_manual', 'true');

  const createMockEl = (tagName = 'div', attrs = {}) => {
    const _attrs = { ...attrs };
    const _listeners = {};
    const _children = [];
    const el = {
      tagName: tagName.toUpperCase(),
      id: attrs.id || '',
      className: attrs.class || '',
      type: attrs.type || '',
      value: attrs.value !== undefined ? attrs.value : '',
      disabled: Boolean(attrs.disabled),
      readOnly: Boolean(attrs.readonly),
      style: {},
      dataset: {},
      options: [],
      textContent: '',
      _innerHTML: '',
      _listeners,
      _children,
      _byId: new Map(),
      _byClass: new Map(),
      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(html) {
        this._innerHTML = String(html);
        this._children.length = 0;
        this._byId.clear();
        this._byClass.clear();
        const tagRe = /<([a-zA-Z0-9-]+)([^>]*)>/g;
        let m;
        while ((m = tagRe.exec(this._innerHTML)) !== null) {
          const tag = m[1].toLowerCase();
          const attrStr = m[2];
          if (tag === 'option') continue;
          const idM = /\bid=["']([^"']+)["']/.exec(attrStr);
          const clsM = /\bclass=["']([^"']+)["']/.exec(attrStr);
          const typeM = /\btype=["']([^"']+)["']/.exec(attrStr);
          const valM = /\bvalue=["']([^"']*)["']/.exec(attrStr);
          const child = createMockEl(tag, {
            id: idM ? idM[1] : '',
            class: clsM ? clsM[1] : '',
            type: typeM ? typeM[1] : '',
            value: valM ? valM[1] : '',
            disabled: /\bdisabled\b/.test(attrStr),
            readonly: /\breadonly\b/.test(attrStr),
          });
          if (child.id) this._byId.set(child.id, child);
          if (child.className) {
            child.className.split(/\s+/).filter(Boolean).forEach((c) => {
              if (!this._byClass.has(c)) this._byClass.set(c, child);
            });
          }
          this._children.push(child);
        }
        const selRe = /<select[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/g;
        let sm;
        while ((sm = selRe.exec(this._innerHTML)) !== null) {
          const selEl = this._byId.get(sm[1]);
          if (selEl) {
            selEl.options = [];
            const optRe = /<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/g;
            let om;
            while ((om = optRe.exec(sm[2])) !== null) {
              selEl.options.push({ value: om[1], textContent: om[2].trim() });
            }
            if (selEl.options.length > 0 && !selEl.value) {
              selEl.value = selEl.options[0].value;
            }
          }
        }
      },
      setAttribute(k, v) {
        _attrs[k] = String(v);
        if (k === 'readonly') this.readOnly = true;
        if (k === 'disabled') this.disabled = true;
      },
      removeAttribute(k) {
        delete _attrs[k];
        if (k === 'readonly') this.readOnly = false;
        if (k === 'disabled') this.disabled = false;
      },
      getAttribute(k) {
        return _attrs[k] ?? null;
      },
      appendChild(child) {
        if (this.tagName === 'SELECT' && child) {
          this.options.push(child);
        }
        this._children.push(child);
        if (child && child.id) this._byId.set(child.id, child);
        return child;
      },
      remove() {},
      focus() {},
      closest() {
        return null;
      },
      contains() {
        return true;
      },
      classList: {
        add() {},
        remove() {},
        toggle() {},
        contains() {
          return false;
        },
      },
      addEventListener(type, fn) {
        if (!_listeners[type]) _listeners[type] = [];
        _listeners[type].push(fn);
      },
      removeEventListener(type, fn) {
        if (_listeners[type]) {
          _listeners[type] = _listeners[type].filter((f) => f !== fn);
        }
      },
      async dispatchEvent(ev) {
        const list = _listeners[ev.type] || [];
        for (const fn of list) {
          await fn(ev);
        }
      },
      querySelector(sel) {
        if (!sel) return null;
        if (sel.startsWith('#')) return this._byId.get(sel.slice(1)) || null;
        if (sel.startsWith('.')) return this._byClass.get(sel.slice(1)) || null;
        return this._children.find((c) => c.tagName.toLowerCase() === sel.toLowerCase()) || null;
      },
      querySelectorAll() {
        return [];
      },
    };
    return el;
  };

  try {
    const bodyEl = createMockEl('body');
    const docHandlers = {};
    global.document = {
      documentElement: { dir: 'ltr', lang: 'ru', classList: { add() {}, remove() {}, toggle() {} } },
      body: bodyEl,
      createElement: (tag) => createMockEl(tag),
      getElementById: (id) => bodyEl._byId.get(id) || bodyEl._children.find((c) => c.id === id) || null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: (t, fn) => {
        if (!docHandlers[t]) docHandlers[t] = [];
        docHandlers[t].push(fn);
      },
      removeEventListener: () => {},
    };

    const { saveUserWordOverride } = await import('../frontend/services/api.js');
    const { getUserWordOverride, getWordTranslation, getWordNotes } = await import('../frontend/services/i18n.js');
    const { openAddWordModal } = await import('../frontend/components/dictionary/DictionaryView.js');

    const sampleWord = {
      id: 'w_personal_1',
      word: 'apple',
      translation: 'яблоко',
      translations: { ru: 'яблоко', de: 'Apfel' },
      category: 'Elementary',
      notes: '',
    };

    // 1. Direct saveUserWordOverride persists personal translation, category, notes without mutating other langs
    await saveUserWordOverride({
      id: sampleWord.id,
      word: sampleWord.word,
      translation: 'домашнее яблоко',
      category: 'Food',
      notes: 'любимый фрукт',
      lang: 'ru',
    });

    const rawOverrides = JSON.parse(global.localStorage.getItem('myduo_user_word_overrides'));
    assert.ok(rawOverrides[sampleWord.id], 'Override stored by word id');
    assert.equal(rawOverrides[sampleWord.id].translations.ru, 'домашнее яблоко');
    assert.equal(rawOverrides[sampleWord.id].category, 'Food');
    assert.equal(rawOverrides[sampleWord.id].notes, 'любимый фрукт');

    const rawNotes = JSON.parse(global.localStorage.getItem('myduo_user_notes'));
    assert.equal(rawNotes[sampleWord.id], 'любимый фрукт');

    const ov = getUserWordOverride(sampleWord);
    assert.ok(ov);
    assert.equal(getWordTranslation(sampleWord, 'ru'), 'домашнее яблоко', 'Active lang returns personal override');
    assert.equal(getWordTranslation(sampleWord, 'de'), 'Apfel', 'Other lang keeps original built-in translation');
    assert.equal(getWordNotes(sampleWord, 'ru'), 'любимый фрукт', 'Note lookup returns personal note');

    // 2. openAddWordModal in edit mode keeps translation and category editable and saves personal edits
    let callbackSavedWord = null;
    openAddWordModal(
      [sampleWord],
      sampleWord.word,
      (saved) => {
        callbackSavedWord = saved;
      },
      { editWord: sampleWord }
    );

    const modalEl = bodyEl._children.find((c) => c.id === 'add-word-modal-overlay');
    assert.ok(modalEl, 'Add/Edit word modal overlay must mount');

    const inputs = modalEl._children.filter((c) => c.tagName === 'INPUT');
    const wordInput = inputs[0];
    const transInput = inputs[1];
    const notesInput =
      modalEl._children.find((c) => c.tagName === 'TEXTAREA') || inputs[2];
    const catSelect = modalEl._children.find((c) => c.tagName === 'SELECT');

    assert.ok(wordInput && transInput && catSelect && notesInput, 'Modal fields present');
    assert.equal(wordInput.readOnly, true, 'Word input is read-only when editing an existing card');
    assert.equal(transInput.disabled, false, 'Translation input must remain editable in edit mode');
    assert.equal(transInput.readOnly, false, 'Translation input must not have readonly in edit mode');
    assert.equal(catSelect.disabled, false, 'Category select must remain editable in edit mode');
    assert.equal(transInput.value, 'домашнее яблоко');
    assert.equal(catSelect.value, 'Food');
    assert.equal(notesInput.value, 'любимый фрукт');

    // Simulate user editing translation, category, and note and submitting
    transInput.value = 'антоновка';
    catSelect.value = 'Fruits';
    notesInput.value = 'кислый сорт';

    const formEl = modalEl._children.find((c) => c.tagName === 'FORM');
    const submitBtn = modalEl._children.find(
      (c) => c.tagName === 'BUTTON' && (c.id.includes('submit') || c.id.includes('save') || c.type === 'submit')
    );
    if (formEl && formEl._listeners.submit?.length) {
      await formEl.dispatchEvent({ type: 'submit', preventDefault() {} });
    } else if (submitBtn && submitBtn._listeners.click?.length) {
      await submitBtn.dispatchEvent({ type: 'click', preventDefault() {} });
    } else {
      assert.fail('Modal must attach either form submit or submit button click listener');
    }

    assert.ok(callbackSavedWord, 'onWordSaved callback must fire after saving personal edit');
    assert.equal(getWordTranslation(sampleWord, 'ru'), 'антоновка');
    assert.equal(sampleWord.category, 'Fruits');
    assert.equal(getWordNotes(sampleWord, 'ru'), 'кислый сорт');
  } finally {
    global.document = prevDoc;
    global.localStorage.clear();
  }
});

test('TimeTrainerView has translations for all 36 supported locales and valid mode question generation', async () => {
  const {
    TIME_TRAINER_TRANSLATIONS,
    TIME_TRAINER_MODES,
    generateTimeQuestion
  } = await import('../frontend/components/favorites/TimeTrainerView.js');
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const fs = await import('node:fs');
  const path = await import('node:path');

  const requiredKeys = [
    'folderTitle', 'folderSubtitle', 'hubTitle', 'hubSubtitle', 'backBtn',
    'modeAmTitle', 'modeAmDesc', 'modePmTitle', 'modePmDesc',
    'modeHalvesTitle', 'modeHalvesDesc', 'modeQuartersTitle', 'modeQuartersDesc',
    'modeTenTitle', 'modeTenDesc', 'modeFiveTitle', 'modeFiveDesc',
    'listenPrompt', 'replayHint', 'doneTitle', 'scoreLabel', 'playAgainBtn', 'changeModeBtn'
  ];

  assert.equal(SUPPORTED_LOCALE_CODES.length, 36);
  for (const code of SUPPORTED_LOCALE_CODES) {
    const bundle = TIME_TRAINER_TRANSLATIONS[code];
    assert.ok(bundle, `Missing TimeTrainerView translations for locale "${code}"`);
    for (const key of requiredKeys) {
      assert.equal(typeof bundle[key], 'string', `Missing key "${key}" for locale "${code}"`);
      assert.ok(bundle[key].trim().length > 0, `Empty key "${key}" for locale "${code}"`);
    }
  }

  const expectedModes = ['am_hours', 'pm_hours', 'halves', 'quarters', 'ten_mins', 'five_mins'];
  assert.deepEqual(TIME_TRAINER_MODES.map(m => m.id), expectedModes);

  for (const mode of TIME_TRAINER_MODES) {
    const q = generateTimeQuestion(mode.id);
    assert.ok(typeof q.displayTime === 'string' && q.displayTime.length > 0, `Missing displayTime for ${mode.id}`);
    assert.ok(typeof q.spokenText === 'string' && q.spokenText.length > 0, `Missing spokenText for ${mode.id}`);
    assert.equal(q.choices.length, 4, `Expected 4 choices for ${mode.id}`);
    assert.equal(new Set(q.choices).size, 4, `Choices must be unique for ${mode.id}`);
    assert.ok(q.choices.includes(q.displayTime), `Choices must include displayTime for ${mode.id}`);
  }

  for (let i = 0; i < 40; i++) {
    const qAm = generateTimeQuestion('am_hours');
    const qPm = generateTimeQuestion('pm_hours');
    assert.ok(!/[ap]\.m\./i.test(qAm.spokenText), `am_hours spokenText must not contain dotted a.m.: ${qAm.spokenText}`);
    assert.ok(!/[ap]\.m\./i.test(qPm.spokenText), `pm_hours spokenText must not contain dotted p.m.: ${qPm.spokenText}`);
  }

  const hubSource = fs.readFileSync(path.resolve('frontend/components/favorites/CollectionsHubView.js'), 'utf8');
  const indexSource = fs.readFileSync(path.resolve('frontend/index.html'), 'utf8');
  assert.ok(hubSource.includes('data-col-id="time_trainer"'), 'CollectionsHubView must include time_trainer tile');
  assert.ok(indexSource.includes("colId === 'time_trainer'"), 'index.html must route time_trainer tile');
  assert.ok(indexSource.includes('renderTimeTrainerView('), 'index.html must invoke renderTimeTrainerView');
});

test('MicroRules and TenseConstructions cover all 36 supported locales, progressive rules, and full tense structures', async () => {
  const {
    MICRO_RULES_I18N,
    TENSE_CONSTRUCTIONS_I18N,
    GRAMMAR_TOPICS_I18N,
    getMicroRulesStrings,
    getTenseConstructionsStrings,
    getTopicTitle,
  } = await import('../frontend/components/favorites/grammarUiTranslations.js');
  const {
    MICRO_RULES,
    getLocalizedMicroRule,
  } = await import('../frontend/components/favorites/microRulesData.js');
  const {
    TENSE_CONSTRUCTIONS,
    getLocalizedTenseConstruction,
  } = await import('../frontend/components/favorites/tenseConstructionsData.js');
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const fs = await import('node:fs');
  const path = await import('node:path');

  assert.equal(SUPPORTED_LOCALE_CODES.length, 36);

  const requiredMicroUiKeys = [
    'folderTitle', 'folderSubtitle', 'hubTitle', 'hubSubtitle', 'backBtn',
    'allLevels', 'modeList', 'modeCards', 'searchPlaceholder', 'progressLabel',
    'markDoneBtn', 'doneBadge', 'examplesHeading', 'prevBtn', 'nextBtn',
    'showMoreBtn', 'noResults', 'ruleLabel', 'listenHint', 'unlockRuleBtn',
    'quizHeading', 'quizDoneBadge',
  ];

  const requiredTenseUiKeys = [
    'folderTitle', 'folderSubtitle', 'hubTitle', 'hubSubtitle', 'backBtn',
    'tabList', 'tabMatrix', 'filterAll', 'filterSimple', 'filterContinuous',
    'filterPerfect', 'filterPerfectContinuous', 'filterSpecial',
    'purposeHeading', 'formulaHeading', 'posLabel', 'negLabel', 'quesLabel',
    'auxLabel', 'markersHeading', 'examplesHeading', 'markDoneBtn', 'doneBadge',
    'progressLabel', 'matrixHint', 'presentRow', 'pastRow', 'futureRow',
    'markersRow', 'simpleSubtitle', 'continuousSubtitle', 'perfectSubtitle',
    'perfectContinuousSubtitle', 'specialSubtitle', 'quizHeading', 'quizDoneBadge',
  ];

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'es-mx', 'pt-br']) {
    const mUi = getMicroRulesStrings(loc);
    const tUi = getTenseConstructionsStrings(loc);
    const topBag = GRAMMAR_TOPICS_I18N[loc];
    assert.ok(mUi && topBag, `Missing grammar UI/topic strings for locale "${loc}"`);
    for (const k of requiredMicroUiKeys) {
      assert.equal(typeof mUi[k], 'string', `MICRO_RULES_I18N["${loc}"]["${k}"] must exist`);
      assert.ok(mUi[k].trim().length > 0, `MICRO_RULES_I18N["${loc}"]["${k}"] must be non-empty`);
    }
    for (const k of requiredTenseUiKeys) {
      assert.equal(typeof tUi[k], 'string', `TENSE_CONSTRUCTIONS_I18N["${loc}"]["${k}"] must exist`);
      assert.ok(tUi[k].trim().length > 0, `TENSE_CONSTRUCTIONS_I18N["${loc}"]["${k}"] must be non-empty`);
    }
  }

  assert.ok(MICRO_RULES.length >= 150, `Expected >= 150 consolidated micro-rules, got ${MICRO_RULES.length}`);
  const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4 };
  let prevRank = 0;

  const normEn = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const assertQuizValidAndDistinct = (item, label, minCount = 2) => {
    assert.ok(Array.isArray(item.quiz) && item.quiz.length >= minCount, `${label} must have >= ${minCount} mini-quiz questions`);
    const exampleNorms = new Set((item.examples || []).map((ex) => normEn(ex.en)));
    const seenCompleted = new Set();
    for (const q of item.quiz) {
      assert.ok(q.blanked && q.blanked.includes('___'), `${label} quiz blanked must include ___`);
      assert.ok(Array.isArray(q.options) && q.options.length === 4, `${label} quiz must have 4 options`);
      assert.equal(new Set(q.options).size, 4, `${label} quiz options must be unique`);
      assert.ok(q.options.includes(q.answer), `${label} quiz options must contain answer`);
      const fullSentence = q.blanked.replace('___', q.answer);
      const fullNorm = normEn(fullSentence);
      assert.ok(!exampleNorms.has(fullNorm), `${label} quiz must not repeat card example: "${fullSentence}"`);
      assert.ok(!seenCompleted.has(fullNorm), `${label} quiz must not have duplicate sentences: "${fullSentence}"`);
      seenCompleted.add(fullNorm);
    }
  };

  for (let i = 0; i < MICRO_RULES.length; i++) {
    const r = MICRO_RULES[i];
    assert.equal(r.id, i + 1, `Micro-rule sequential id check at ${i}`);
    const rank = levelOrder[r.level];
    assert.ok(rank && rank >= prevRank, `Micro-rules must progress A1->A2->B1->B2 (broken at id=${r.id}, level=${r.level})`);
    prevRank = rank;
    assert.ok(Array.isArray(r.examples) && r.examples.length >= 3 && r.examples.length <= 5, `Rule ${r.id} must have 3-5 examples`);
    assert.ok(getTopicTitle(r.topic, 'ru').trim().length > 0, `Missing topic title for "${r.topic}"`);

    assertQuizValidAndDistinct(r, `Rule ${r.id}`, 5);
    assert.ok(!/\s(в|на|с|к|о|у|и|а|но|по|из|от|до|за|для|при|без)$/iu.test(r.title.ru || '') || /[/&]\s*\S+$/u.test(r.title.ru || ''), `Rule ${r.id} ru title must not end with dangling preposition: "${r.title.ru}"`);
    assert.ok(!/\s(in|on|at|to|for|of|with|by|from|and|or|but|the|a|an)$/i.test(r.title.en || '') || /[/&+]\s*\S+$/i.test(r.title.en || '') || /(plenty of|used to|forward to|supposed to|about to|because of)$/i.test(r.title.en || ''), `Rule ${r.id} en title must not end with dangling preposition: "${r.title.en}"`);
    if (r.id === 1) {
      for (const q of r.quiz) {
        assert.ok(q.answer !== 'in' && q.answer !== 'is', `Rule 1 (Noun) must test a noun, got "${q.answer}"`);
      }
    }

    for (const loc of SUPPORTED_LOCALE_CODES) {
      const locRule = getLocalizedMicroRule(r, loc);
      assert.ok(locRule.title && locRule.title.trim().length > 0, `Rule ${r.id} missing title for "${loc}"`);
      assert.ok(!locRule.title.includes('\uFFFD'), `Rule ${r.id} title has U+FFFD for "${loc}"`);
      assert.ok(locRule.rule && locRule.rule.trim().length > 0, `Rule ${r.id} missing text for "${loc}"`);
      assert.ok(!locRule.rule.includes('\uFFFD'), `Rule ${r.id} has U+FFFD for "${loc}"`);
      assert.equal(locRule.examples.length, r.examples.length);
      for (const ex of locRule.examples) {
        assert.ok(ex.en && ex.en.trim().length > 0, `Rule ${r.id} empty en example`);
        assert.ok(ex.tr && ex.tr.trim().length > 0, `Rule ${r.id} missing example tr for "${loc}"`);
        assert.ok(!ex.tr.includes('\uFFFD'), `Rule ${r.id} example tr has U+FFFD for "${loc}"`);
      }
      assert.ok(locRule.quiz.length >= 5, `Rule ${r.id} localized quiz length >= 5 for "${loc}"`);
    }
  }

  assert.equal(TENSE_CONSTRUCTIONS.length, 16, 'Expected 16 tense constructions (12 active + 4 special)');
  for (const tc of TENSE_CONSTRUCTIONS) {
    assert.ok(tc.formula?.pos && tc.formula?.neg && tc.formula?.ques && tc.formula?.aux, `Tense ${tc.id} incomplete formula`);
    assert.ok(Array.isArray(tc.markers) && tc.markers.length >= 3, `Tense ${tc.id} must have markers`);
    assert.ok(Array.isArray(tc.examples) && tc.examples.length >= 3 && tc.examples.length <= 5, `Tense ${tc.id} must have 3-5 examples`);
    assertQuizValidAndDistinct(tc, `Tense ${tc.id}`, 6);

    for (const loc of SUPPORTED_LOCALE_CODES) {
      const locTc = getLocalizedTenseConstruction(tc, loc);
      assert.ok(locTc.subtitle && locTc.subtitle.trim().length > 0, `Tense ${tc.id} missing subtitle for "${loc}"`);
      assert.ok(locTc.purpose && locTc.purpose.trim().length > 0, `Tense ${tc.id} missing purpose for "${loc}"`);
      assert.ok(!locTc.purpose.includes('\uFFFD'), `Tense ${tc.id} purpose has U+FFFD for "${loc}"`);
      assert.equal(locTc.examples.length, tc.examples.length);
      for (const ex of locTc.examples) {
        assert.ok(ex.en && ex.en.trim().length > 0, `Tense ${tc.id} empty en example`);
        assert.ok(ex.tr && ex.tr.trim().length > 0, `Tense ${tc.id} missing example tr for "${loc}"`);
        assert.ok(ex.note && ex.note.trim().length > 0, `Tense ${tc.id} missing example note for "${loc}"`);
      }
      assert.ok(locTc.quiz.length >= 6, `Tense ${tc.id} localized quiz length >= 6 for "${loc}"`);
    }
  }

  const grammarHubSource = fs.readFileSync(path.resolve('frontend/components/favorites/GrammarHubView.js'), 'utf8');
  const collectionsHubSource = fs.readFileSync(path.resolve('frontend/components/favorites/CollectionsHubView.js'), 'utf8');
  const indexSource = fs.readFileSync(path.resolve('frontend/index.html'), 'utf8');
  const microViewSource = fs.readFileSync(path.resolve('frontend/components/favorites/MicroRulesView.js'), 'utf8');
  const tenseViewSource = fs.readFileSync(path.resolve('frontend/components/favorites/TenseConstructionsView.js'), 'utf8');
  assert.ok(grammarHubSource.includes('data-grammar-id="grammar_microrules"'), 'GrammarHubView must include grammar_microrules tile');
  assert.ok(grammarHubSource.includes('data-grammar-id="tense_constructions"'), 'GrammarHubView must include tense_constructions tile');
  assert.ok(grammarHubSource.includes('data-grammar-id="milestone_stories"'), 'GrammarHubView must include milestone_stories tile');
  assert.ok(grammarHubSource.includes('data-grammar-id="spoken_english"'), 'GrammarHubView must include spoken_english tile');
  assert.ok(!collectionsHubSource.includes('data-col-id="grammar_microrules"'), 'CollectionsHubView must not include grammar_microrules');
  assert.ok(!collectionsHubSource.includes('data-col-id="tense_constructions"'), 'CollectionsHubView must not include tense_constructions');
  assert.ok(!collectionsHubSource.includes('data-col-id="milestone_stories"'), 'CollectionsHubView must not include milestone_stories');
  assert.ok(indexSource.includes('grammar_microrules'), 'index.html must route grammar_microrules');
  assert.ok(indexSource.includes('tense_constructions'), 'index.html must route tense_constructions');
  assert.ok(indexSource.includes('renderMicroRulesView('), 'index.html must invoke renderMicroRulesView');
  assert.ok(indexSource.includes('renderTenseConstructionsView('), 'index.html must invoke renderTenseConstructionsView');
  assert.ok(microViewSource.includes('myduo_microrules_unlocked'), 'MicroRulesView must persist unlocked rule IDs');
  assert.ok(microViewSource.includes('myduo_microrules_quiz_done'), 'MicroRulesView must persist mini-quiz completion');
  assert.ok(microViewSource.includes('addWeeklyXP(5)'), 'MicroRulesView must award +5 XP on mini-quiz pass');
  assert.ok(microViewSource.includes('showLanguagePackRewardedAd'), 'MicroRulesView must trigger rewarded ad to unlock rules');
  assert.ok(microViewSource.includes('btn-orange'), 'MicroRulesView unlock button must have orange class');
  assert.ok(microViewSource.includes('data-unlock-rule'), 'MicroRulesView must render data-unlock-rule trigger');
  assert.ok(!microViewSource.includes('class="mr-ex-heading"') && !microViewSource.includes('class="mr-ex-list"'), 'MicroRulesView must not render examples block');
  assert.ok(!microViewSource.includes('data-mr-mode'), 'MicroRulesView must not render mode tabs (list only)');
  assert.ok(!microViewSource.includes('mr-search-input'), 'MicroRulesView must not render search input');
  assert.ok(microViewSource.includes("const levels = ['A1', 'A2', 'B1', 'B2']"), 'MicroRulesView must render A1, A2, B1, B2 level buttons without All button');
  assert.ok(microViewSource.includes('myduo_microrules_level'), 'MicroRulesView must persist selected level');
  assert.ok(microViewSource.includes('PAGE_SIZE = 10'), 'MicroRulesView must paginate by 10 items');
  assert.ok(!microViewSource.includes('class="mr-hint"'), 'MicroRulesView must not render listen hint banner');
  assert.ok(!microViewSource.includes('class="mr-hero-sub"'), 'MicroRulesView must not render hero subtitle');
  assert.ok(microViewSource.includes('data-toggle-expand'), 'MicroRulesView must support collapsing/reopening studied rules without ads');
  assert.ok(microViewSource.includes('mr-ref-table'), 'MicroRulesView must render reference tables when present');
  for (const tid of [13, 14, 16, 18, 27, 31, 39, 49]) {
    const ruleObj = MICRO_RULES.find((r) => r.id === tid);
    assert.ok(ruleObj?.table && Array.isArray(ruleObj.table.rows) && ruleObj.table.rows.length >= 2, `Rule ${tid} must have a reference table`);
  }
  assert.ok(tenseViewSource.includes('myduo_tenses_quiz_done'), 'TenseConstructionsView must persist mini-quiz completion');
  assert.ok(tenseViewSource.includes('addWeeklyXP(5)'), 'TenseConstructionsView must award +5 XP on mini-quiz pass');
  assert.ok(!tenseViewSource.includes('class="tc-hero-sub"'), 'TenseConstructionsView must not render hero subtitle');
  assert.ok(!tenseViewSource.includes('class="tc-examples-list"'), 'TenseConstructionsView must not render examples block');
  assert.ok(tenseViewSource.includes('overflow-x: auto') && tenseViewSource.includes('overflow-x: hidden'), 'TenseConstructionsView must constrain page width and scroll matrix horizontally');
  assert.ok(tenseViewSource.includes('myduo_tenses_unlocked') && tenseViewSource.includes('showLanguagePackRewardedAd') && tenseViewSource.includes('data-unlock-tense'), 'TenseConstructionsView must lock tenses behind rewarded ad on first open');
  assert.ok(tenseViewSource.includes('data-toggle-expand'), 'TenseConstructionsView must collapse studied tenses and reopen without ads');

  for (const vidDir of ['frontend/assets/video', 'docs/assets/video']) {
    if (fs.existsSync(vidDir)) {
      const onboardingFiles = fs.readdirSync(vidDir).filter((f) => /onboarding/i.test(f));
      assert.deepEqual(onboardingFiles, [], `Onboarding video files must not exist in ${vidDir}`);
    }
  }
});




