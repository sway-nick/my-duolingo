import { getUserFavorites, toggleFavoriteApi } from './api.js?v=385.0';
import { getInterfaceLanguage, getWordTranslation } from './i18n.js?v=385.0';

const STORAGE_KEY_CUSTOM_COLLECTIONS = 'myduo_custom_collections';
const STORAGE_KEY_ACTIVE_COLLECTION = 'myduo_active_collection_id';

export const BUILTIN_COLLECTIONS_DEF = [
  {
    id: 'my_favorites',
    isBuiltin: true,
    icon: '⭐',
    name: {
      ru: 'Мои фавориты',
      uk: 'Мої фаворити',
      en: 'My Favorites',
      de: 'Meine Favoriten',
      es: 'Mis Favoritos',
      fr: 'Mes Favoris',
    },
  },
  {
    id: 'months',
    isBuiltin: true,
    icon: '📅',
    name: {
      ru: 'Месяцы',
      uk: 'Місяці',
      en: 'Months',
      de: 'Monate',
      es: 'Meses',
      fr: 'Mois',
    },
    wordKeys: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  },
  {
    id: 'days_of_week',
    isBuiltin: true,
    icon: '🗓️',
    name: {
      ru: 'Дни недели',
      uk: 'Дні тижня',
      en: 'Days of the week',
      de: 'Wochentage',
      es: 'Días de la semana',
      fr: 'Jours de la semaine',
    },
    wordKeys: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  {
    id: 'colors',
    isBuiltin: true,
    icon: '🎨',
    name: {
      ru: 'Цвета',
      uk: 'Кольори',
      en: 'Colors',
      de: 'Farben',
      es: 'Colores',
      fr: 'Couleurs',
    },
    wordKeys: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown', 'grey', 'gray', 'gold', 'silver'],
  },
  {
    id: 'numbers',
    isBuiltin: true,
    icon: '🔢',
    name: {
      ru: 'Числа',
      uk: 'Числа',
      en: 'Numbers',
      de: 'Zahlen',
      es: 'Números',
      fr: 'Nombres',
    },
    wordKeys: [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
      'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million',
      'first', 'second', 'third', 'fourth', 'fifth'
    ],
  },
  {
    id: 'body_parts',
    isBuiltin: true,
    icon: '🫀',
    name: {
      ru: 'Части тела',
      uk: 'Частини тіла',
      en: 'Body parts',
      de: 'Körperteile',
      es: 'Partes del cuerpo',
      fr: 'Parties du corps',
    },
    wordKeys: [
      'head', 'arm', 'leg', 'hand', 'foot', 'feet', 'eye', 'ear', 'nose', 'mouth',
      'heart', 'finger', 'tooth', 'teeth', 'hair', 'face', 'back', 'shoulder', 'neck',
      'brain', 'skin', 'blood', 'bone', 'knee', 'chest', 'stomach', 'lip', 'tongue', 'throat'
    ],
  },
  {
    id: 'sport',
    isBuiltin: true,
    icon: '⚽',
    name: {
      ru: 'Спорт',
      uk: 'Спорт',
      en: 'Sport',
      de: 'Sport',
      es: 'Deporte',
      fr: 'Sport',
    },
    wordKeys: [
      'football', 'basketball', 'tennis', 'baseball', 'run', 'running', 'swimming', 'swim',
      'ball', 'match', 'team', 'game', 'player', 'coach', 'champion', 'championship',
      'fitness', 'gym', 'race', 'score', 'stadium', 'athlete', 'sport'
    ],
  },
  {
    id: 'food',
    isBuiltin: true,
    icon: '🍕',
    name: {
      ru: 'Еда и напитки',
      uk: 'Їжа та напої',
      en: 'Food & drinks',
      de: 'Essen & Trinken',
      es: 'Comida y bebidas',
      fr: 'Nourriture et boissons',
    },
    wordKeys: [
      'bread', 'water', 'tea', 'coffee', 'milk', 'meat', 'cheese', 'pizza', 'fish', 'sugar',
      'egg', 'eggs', 'fruit', 'vegetable', 'soup', 'rice', 'apple', 'banana', 'orange',
      'chicken', 'butter', 'cake', 'salt', 'juice', 'beer', 'wine', 'potato', 'tomato',
      'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant'
    ],
  },
  {
    id: 'clothes',
    isBuiltin: true,
    icon: '👕',
    name: {
      ru: 'Одежда',
      uk: 'Одяг',
      en: 'Clothes',
      de: 'Kleidung',
      es: 'Ropa',
      fr: 'Vêtements',
    },
    wordKeys: [
      'shirt', 'shoes', 'shoe', 'pants', 'dress', 'coat', 'hat', 'jacket', 'socks', 'suit',
      'boots', 'skirt', 'jeans', 't-shirt', 'wear', 'belt', 'gloves', 'scarf', 'cap', 'uniform', 'tie'
    ],
  },
  {
    id: 'animals',
    isBuiltin: true,
    icon: '🐾',
    name: {
      ru: 'Животные',
      uk: 'Тварини',
      en: 'Animals',
      de: 'Tiere',
      es: 'Animales',
      fr: 'Animaux',
    },
    wordKeys: [
      'dog', 'cat', 'bird', 'horse', 'fish', 'bear', 'lion', 'wolf', 'elephant', 'tiger',
      'monkey', 'mouse', 'rabbit', 'duck', 'sheep', 'cow', 'pig', 'animal', 'pet', 'snake',
      'fox', 'deer', 'eagle', 'whale', 'dolphin', 'shark'
    ],
  },
  {
    id: 'verbs',
    isBuiltin: true,
    icon: '⚡',
    name: {
      ru: 'Популярные глаголы',
      uk: 'Популярні дієслова',
      en: 'Popular verbs',
      de: 'Beliebte Verben',
      es: 'Verbos populares',
      fr: 'Verbes populaires',
    },
    wordKeys: [
      'be', 'have', 'do', 'say', 'go', 'get', 'make', 'know', 'think', 'take', 'see', 'come',
      'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'call', 'try', 'ask', 'need',
      'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help',
      'talk', 'turn', 'start', 'show', 'hear', 'play', 'run', 'move', 'like', 'live',
      'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose',
      'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand',
      'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow',
      'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy',
      'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach',
      'kill', 'remain', 'suggest', 'raise', 'pass', 'sell', 'require', 'report', 'decide', 'pull'
    ],
  },
  {
    id: 'adjectives',
    isBuiltin: true,
    icon: '🌟',
    name: {
      ru: 'Прилагательные',
      uk: 'Прикметники',
      en: 'Adjectives',
      de: 'Adjektive',
      es: 'Adjetivos',
      fr: 'Adjectifs',
    },
    wordKeys: [
      'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old',
      'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young',
      'important', 'few', 'public', 'bad', 'same', 'able', 'free', 'easy', 'strong',
      'true', 'clear', 'full', 'whole', 'real', 'hard', 'poor', 'best', 'special',
      'simple', 'fine', 'sure', 'dark', 'short', 'major', 'happy', 'serious', 'ready',
      'hot', 'cold', 'beautiful', 'bright', 'clean', 'deep', 'fast', 'heavy', 'kind',
      'nice', 'rich', 'safe', 'sweet', 'warm'
    ],
  },
  {
    id: 'phrasal_verbs',
    isBuiltin: true,
    icon: '🔄',
    name: {
      ru: 'Фразовые глаголы',
      uk: 'Фразові дієслова',
      en: 'Phrasal verbs',
      de: 'Phrasale Verben',
      es: 'Verbos compuestos',
      fr: 'Verbes à particule',
    },
    wordKeys: [
      'have to', 'get in', 'get on', 'turn on', 'turn off', 'wake up', 'get up', 'come in',
      'go on', 'find out', 'set up', 'take off', 'pick up', 'put on', 'look at', 'look after',
      'carry on', 'bring up', 'run out', 'break down', 'check in', 'check out', 'calm down',
      'come back', 'figure out', 'get along', 'hang out', 'hold on', 'keep up', 'make up',
      'point out', 'run into', 'show up', 'slow down', 'work out', 'look for', 'give up'
    ],
  },
];

let cachedWordMap = null;
function getWordLookupMap(allWords) {
  if (cachedWordMap && cachedWordMap._sourceLen === (allWords ? allWords.length : 0)) {
    return cachedWordMap;
  }
  const map = new Map();
  if (Array.isArray(allWords)) {
    allWords.forEach((w) => {
      if (w && w.word) {
        map.set(w.word.toLowerCase().trim(), w);
      }
    });
  }
  map._sourceLen = allWords ? allWords.length : 0;
  cachedWordMap = map;
  return map;
}

export function getCustomCollections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_COLLECTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading custom collections:', e);
  }
  return [];
}

export function saveCustomCollections(collections) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_COLLECTIONS, JSON.stringify(collections || []));
    window.dispatchEvent(new CustomEvent('myduo_collections_updated', { detail: collections }));
  } catch (e) {
    console.error('Error saving custom collections:', e);
  }
}

export function createCustomCollection(name, icon = '📘') {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) return null;

  const collections = getCustomCollections();
  const newCol = {
    id: 'col_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: trimmedName,
    icon: icon || '📘',
    wordIds: [],
    createdAt: Date.now(),
  };

  collections.push(newCol);
  saveCustomCollections(collections);
  return newCol;
}

export function deleteCustomCollection(collectionId) {
  const collections = getCustomCollections();
  const filtered = collections.filter((c) => c.id !== collectionId);
  saveCustomCollections(filtered);

  if (getActiveCollectionId() === collectionId) {
    setActiveCollectionId('my_favorites');
  }
}

export function renameCustomCollection(collectionId, newName, newIcon) {
  const trimmedName = String(newName || '').trim();
  if (!trimmedName) return;

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target) {
    target.name = trimmedName;
    if (newIcon) target.icon = newIcon;
    saveCustomCollections(collections);
  }
}

export function addWordToCollection(collectionId, wordId) {
  if (collectionId === 'my_favorites') {
    const currentFavs = getUserFavorites();
    if (!currentFavs.includes(wordId)) {
      toggleFavoriteApi(wordId);
    }
    return;
  }

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target) {
    const idStr = String(wordId);
    if (!target.wordIds.map(String).includes(idStr)) {
      target.wordIds.push(wordId);
      saveCustomCollections(collections);
    }
  }
}

export function removeWordFromCollection(collectionId, wordId) {
  if (collectionId === 'my_favorites') {
    const currentFavs = getUserFavorites();
    if (currentFavs.includes(wordId)) {
      toggleFavoriteApi(wordId);
    }
    return;
  }

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target) {
    const idStr = String(wordId);
    target.wordIds = target.wordIds.filter((id) => String(id) !== idStr);
    saveCustomCollections(collections);
  }
}

export function isWordInCollection(collectionId, wordId, allWords = []) {
  const idStr = String(wordId);
  if (collectionId === 'my_favorites') {
    return getUserFavorites().map(String).includes(idStr);
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin && builtin.wordKeys) {
    const wordObj = (allWords || []).find((w) => String(w.id) === idStr);
    if (!wordObj || !wordObj.word) return false;
    return builtin.wordKeys.includes(wordObj.word.toLowerCase().trim());
  }

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  return target ? target.wordIds.map(String).includes(idStr) : false;
}

export function getCollectionWords(collectionId, allWords = []) {
  if (!Array.isArray(allWords) || allWords.length === 0) return [];

  if (collectionId === 'my_favorites') {
    const favSet = new Set(getUserFavorites().map(String));
    return allWords.filter((w) => favSet.has(String(w.id)));
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin && builtin.wordKeys) {
    const map = getWordLookupMap(allWords);
    const result = [];
    builtin.wordKeys.forEach((key) => {
      const match = map.get(key.toLowerCase().trim());
      if (match) result.push(match);
    });
    return result;
  }

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target && Array.isArray(target.wordIds)) {
    const idSet = new Set(target.wordIds.map(String));
    return allWords.filter((w) => idSet.has(String(w.id)));
  }

  return [];
}

export function getCollectionTitle(collectionId, lang = null) {
  const currentLang = (lang || getInterfaceLanguage() || 'ru').toLowerCase();

  if (collectionId === 'my_favorites') {
    return BUILTIN_COLLECTIONS_DEF[0].name[currentLang] || BUILTIN_COLLECTIONS_DEF[0].name.ru;
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin) {
    return builtin.name[currentLang] || builtin.name.ru || builtin.name.en;
  }

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target) return target.name;

  return 'Коллекция';
}

export function getActiveCollectionId() {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_COLLECTION) || 'my_favorites';
  } catch (e) {
    return 'my_favorites';
  }
}

export function setActiveCollectionId(collectionId) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_COLLECTION, collectionId || 'my_favorites');
    window.dispatchEvent(new CustomEvent('myduo_active_collection_changed', { detail: collectionId }));
  } catch (e) {}
}

export function setCollectionWords(collectionId, wordIds = []) {
  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target) {
    target.wordIds = Array.from(new Set(wordIds.map(String)));
    saveCustomCollections(collections);
  }
}

export function getAllCollectionsSummary(allWords = []) {
  const favWords = getCollectionWords('my_favorites', allWords);
  const myFavTitle = getCollectionTitle('my_favorites');

  const customCols = getCustomCollections().map((c) => ({
    id: c.id,
    icon: c.icon || '📘',
    title: c.name,
    isBuiltin: false,
    isCustom: true,
    count: Array.isArray(c.wordIds) ? c.wordIds.length : 0,
    raw: c,
  }));

  const builtinCols = BUILTIN_COLLECTIONS_DEF.slice(1).map((b) => ({
    id: b.id,
    icon: b.icon,
    title: getCollectionTitle(b.id),
    isBuiltin: true,
    isCustom: false,
    count: getCollectionWords(b.id, allWords).length,
    raw: b,
  }));

  return {
    myFavorites: {
      id: 'my_favorites',
      icon: '⭐',
      title: myFavTitle,
      isBuiltin: true,
      isCustom: false,
      count: favWords.length,
    },
    customCollections: customCols,
    builtinCollections: builtinCols,
  };
}

export function syncCollectionToAndroidWidget(collectionId, allWords) {
  if (typeof window === 'undefined') return;
  const words = getCollectionWords(collectionId, allWords);
  const title = getCollectionTitle(collectionId);

  if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.syncFavorites === 'function') {
    try {
      const payload = {
        title: title,
        collectionId: collectionId,
        hasFavorites: words.length > 0,
        words: words.map((w) => ({
          id: w.id,
          word: w.word,
          transcription: w.transcription,
          translation: getWordTranslation(w),
          category: w.category || title,
        })),
      };
      window.AndroidWidgetBridge.syncFavorites(JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to sync collection to widget:', err);
    }
  }
}

