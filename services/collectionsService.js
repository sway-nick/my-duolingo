import { getUserFavorites, toggleFavoriteApi } from './api.js?v=386.0';
import { getInterfaceLanguage, getWordTranslation } from './i18n.js?v=386.0';

const STORAGE_KEY_CUSTOM_COLLECTIONS = 'myduo_custom_collections';
const STORAGE_KEY_ACTIVE_COLLECTION = 'myduo_active_collection_id';
const STORAGE_KEY_BUILTIN_OVERRIDES = 'myduo_builtin_collections_overrides';

export const BUILTIN_COLLECTIONS_WITH_GEAR = new Set([
  'colors',
  'body_parts',
  'sport',
  'food',
  'clothes',
  'animals',
  'verbs',
  'adjectives',
  'phrasal_verbs',
]);

function getBuiltinOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUILTIN_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveBuiltinOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY_BUILTIN_OVERRIDES, JSON.stringify(overrides));
  } catch (e) {}
}

export function isBuiltinCollectionOverridden(collectionId) {
  const overrides = getBuiltinOverrides();
  return Array.isArray(overrides[collectionId]);
}

export function resetBuiltinCollection(collectionId) {
  const overrides = getBuiltinOverrides();
  if (overrides[collectionId]) {
    delete overrides[collectionId];
    saveBuiltinOverrides(overrides);
  }
}

export function getBuiltinDefaultCount(collectionId, allWords = []) {
  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (!builtin || !builtin.wordKeys) return 0;
  if (!allWords || allWords.length === 0) return builtin.wordKeys.length;
  const map = getWordLookupMap(allWords);
  let count = 0;
  builtin.wordKeys.forEach((key) => {
    if (map.get(key.toLowerCase().trim())) count++;
  });
  return count;
}

export const BUILTIN_COLLECTIONS_DEF = [
  {
    id: 'my_favorites',
    isBuiltin: true,
    icon: '⭐',
    name: {
          "ru": "Мои фавориты",
          "uk": "Мої фаворити",
          "en": "My Favorites",
          "de": "Meine Favoriten",
          "es": "Mis Favoritos",
          "fr": "Mes Favoris",
          "pl": "Moje ulubione",
          "tr": "Favorilerim",
          "it": "I miei preferiti",
          "ro": "Favoritele mele",
          "bg": "Любими",
          "hu": "Kedvenceim",
          "el": "Τα αγαπημένα μου",
          "da": "Mine favoritter",
          "ga": "Mo Chuid Roghanna",
          "lv": "Mani favorīti",
          "lt": "Mano mėgstamiausi",
          "mt": "Il-favoriti tiegħi",
          "pt": "Meus Favoritos",
          "sk": "Moje obľúbené",
          "sl": "Moji priljubljeni",
          "fi": "Omat suosikit",
          "hr": "Moji favoriti",
          "cs": "Moje oblíbené",
          "sv": "Mina favoriter",
          "et": "Minu lemmikud",
          "hi": "मेरे पसंदीदा",
          "ar": "مفضلاتي",
          "id": "Favorit Saya",
          "vi": "Yêu thích của tôi",
          "th": "รายการโปรดของฉัน",
          "ko": "내 즐겨찾기",
          "ja": "お気に入り"
    },
  },
  {
    id: 'months',
    isBuiltin: true,
    icon: '📅',
    name: {
          "ru": "Месяцы",
          "uk": "Місяці",
          "en": "Months",
          "de": "Monate",
          "es": "Meses",
          "fr": "Mois",
          "pl": "Miesiące",
          "tr": "Aylar",
          "it": "Mesi",
          "ro": "Luni",
          "bg": "Месеци",
          "hu": "Hónapok",
          "el": "Μήνες",
          "da": "Måneder",
          "ga": "Míonna",
          "lv": "Mēneši",
          "lt": "Mėnesiai",
          "mt": "Xhur",
          "pt": "Meses",
          "sk": "Mesiace",
          "sl": "Meseci",
          "fi": "Kuukaudet",
          "hr": "Mjeseci",
          "cs": "Měsíce",
          "sv": "Månader",
          "et": "Kuud",
          "hi": "महीने",
          "ar": "الشهور",
          "id": "Bulan",
          "vi": "Các tháng",
          "th": "เดือน",
          "ko": "월",
          "ja": "月"
    },
    wordKeys: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  },
  {
    id: 'days_of_week',
    isBuiltin: true,
    icon: '🗓️',
    name: {
          "ru": "Дни недели",
          "uk": "Дні тижня",
          "en": "Days of the week",
          "de": "Wochentage",
          "es": "Días de la semana",
          "fr": "Jours de la semaine",
          "pl": "Dni tygodnia",
          "tr": "Haftanın günleri",
          "it": "Giorni della settimana",
          "ro": "Zilele săptămânii",
          "bg": "Дни от седмицата",
          "hu": "A hét napjai",
          "el": "Ημέρες της εβδομάδας",
          "da": "Ugedage",
          "ga": "Laethanta na seachtaine",
          "lv": "Nedēļas dienas",
          "lt": "Savaitės dienos",
          "mt": "Ġranet tal-ġimgħa",
          "pt": "Dias da semana",
          "sk": "Dni v týždni",
          "sl": "Dnevi v tednu",
          "fi": "Viikonpäivät",
          "hr": "Dani u tjednu",
          "cs": "Dny v týdnu",
          "sv": "Veckodagar",
          "et": "Nädalapäevad",
          "hi": "सप्ताह के दिन",
          "ar": "أيام الأسبوع",
          "id": "Hari dalam seminggu",
          "vi": "Các ngày trong tuần",
          "th": "วันในสัปดาห์",
          "ko": "요일",
          "ja": "曜日"
    },
    wordKeys: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  {
    id: 'colors',
    isBuiltin: true,
    icon: '🎨',
    name: {
          "ru": "Цвета",
          "uk": "Кольори",
          "en": "Colors",
          "de": "Farben",
          "es": "Colores",
          "fr": "Couleurs",
          "pl": "Kolory",
          "tr": "Renkler",
          "it": "Colori",
          "ro": "Culori",
          "bg": "Цветове",
          "hu": "Színek",
          "el": "Χρώματα",
          "da": "Farver",
          "ga": "Dathanna",
          "lv": "Krāsas",
          "lt": "Spalvos",
          "mt": "Kuluri",
          "pt": "Cores",
          "sk": "Farby",
          "sl": "Barve",
          "fi": "Värit",
          "hr": "Boje",
          "cs": "Barvy",
          "sv": "Färger",
          "et": "Värvid",
          "hi": "रंग",
          "ar": "الألوان",
          "id": "Warna",
          "vi": "Màu sắc",
          "th": "สี",
          "ko": "색상",
          "ja": "色"
    },
    wordKeys: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown', 'grey', 'gray', 'gold', 'silver'],
  },
  {
    id: 'numbers',
    isBuiltin: true,
    icon: '🔢',
    name: {
          "ru": "Числа",
          "uk": "Числа",
          "en": "Numbers",
          "de": "Zahlen",
          "es": "Números",
          "fr": "Nombres",
          "pl": "Liczby",
          "tr": "Sayılar",
          "it": "Numeri",
          "ro": "Numere",
          "bg": "Числа",
          "hu": "Számok",
          "el": "Αριθμοί",
          "da": "Tal",
          "ga": "Uimhreacha",
          "lv": "Skaitļi",
          "lt": "Skaičiai",
          "mt": "Numri",
          "pt": "Números",
          "sk": "Čísla",
          "sl": "Številke",
          "fi": "Numerot",
          "hr": "Brojevi",
          "cs": "Čísla",
          "sv": "Siffror",
          "et": "Numbrid",
          "hi": "संख्याएं",
          "ar": "الأرقام",
          "id": "Angka",
          "vi": "Con số",
          "th": "ตัวเลข",
          "ko": "숫자",
          "ja": "数字"
    },
    wordKeys: [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
      'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million'
    ],
  },
  {
    id: 'body_parts',
    isBuiltin: true,
    icon: '🫀',
    name: {
          "ru": "Части тела",
          "uk": "Частини тіла",
          "en": "Body parts",
          "de": "Körperteile",
          "es": "Partes del cuerpo",
          "fr": "Parties du corps",
          "pl": "Części ciała",
          "tr": "Vücut parçaları",
          "it": "Parti del corpo",
          "ro": "Părțile corpului",
          "bg": "Части на тялото",
          "hu": "Testrészek",
          "el": "Μέρη του σώματος",
          "da": "Kropsdele",
          "ga": "Codanna den chorp",
          "lv": "Ķermeņa daļas",
          "lt": "Kūno dalys",
          "mt": "Partijiet tal-ġisem",
          "pt": "Partes do corpo",
          "sk": "Časti tela",
          "sl": "Deli telesa",
          "fi": "Ruumiinosat",
          "hr": "Dijelovi tijela",
          "cs": "Části těla",
          "sv": "Kroppsdelar",
          "et": "Kehaosad",
          "hi": "शरीर के अंग",
          "ar": "أجزاء الجسم",
          "id": "Bagian tubuh",
          "vi": "Bộ phận cơ thể",
          "th": "ส่วนต่างๆ ของร่างกาย",
          "ko": "신체 부위",
          "ja": "体の部位"
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
          "ru": "Спорт",
          "uk": "Спорт",
          "en": "Sport",
          "de": "Sport",
          "es": "Deporte",
          "fr": "Sport",
          "pl": "Sport",
          "tr": "Spor",
          "it": "Sport",
          "ro": "Sport",
          "bg": "Спорт",
          "hu": "Sport",
          "el": "Αθλητισμός",
          "da": "Sport",
          "ga": "Spórt",
          "lv": "Sports",
          "lt": "Sportas",
          "mt": "Sport",
          "pt": "Esporte",
          "sk": "Šport",
          "sl": "Šport",
          "fi": "Urheilu",
          "hr": "Sport",
          "cs": "Sport",
          "sv": "Sport",
          "et": "Sport",
          "hi": "खेल",
          "ar": "الرياضة",
          "id": "Olahraga",
          "vi": "Thể thao",
          "th": "กีฬา",
          "ko": "스포츠",
          "ja": "スポーツ"
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
          "ru": "Еда и напитки",
          "uk": "Їжа та напої",
          "en": "Food & drinks",
          "de": "Essen & Trinken",
          "es": "Comida y bebidas",
          "fr": "Nourriture et boissons",
          "pl": "Jedzenie i napoje",
          "tr": "Yiyecek ve içecekler",
          "it": "Cibo e bevande",
          "ro": "Mâncare și băuturi",
          "bg": "Храна и напитки",
          "hu": "Ételek és italok",
          "el": "Φαγητό και ποτά",
          "da": "Mad og drikke",
          "ga": "Bia agus deochanna",
          "lv": "Ēdiens un dzērieni",
          "lt": "Maistas ir gėrimai",
          "mt": "Ikel u xorb",
          "pt": "Comida e bebidas",
          "sk": "Jedlo a nápoje",
          "sl": "Hrana in pijača",
          "fi": "Ruoka ja juoma",
          "hr": "Hrana i piće",
          "cs": "Jídlo a pití",
          "sv": "Mat och dryck",
          "et": "Toit ja joogid",
          "hi": "भोजन और पेय",
          "ar": "الطعام والمشروبات",
          "id": "Makanan & minuman",
          "vi": "Thức ăn & đồ uống",
          "th": "อาหารและเครื่องดื่ม",
          "ko": "음식 및 음료",
          "ja": "食べ物と飲み物"
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
          "ru": "Одежда",
          "uk": "Одяг",
          "en": "Clothes",
          "de": "Kleidung",
          "es": "Ropa",
          "fr": "Vêtements",
          "pl": "Ubrania",
          "tr": "Kıyafetler",
          "it": "Abbigliamento",
          "ro": "Haine",
          "bg": "Дрехи",
          "hu": "Ruházat",
          "el": "Ρούχα",
          "da": "Tøj",
          "ga": "Éadaí",
          "lv": "Apģērbs",
          "lt": "Drabužiai",
          "mt": "Ħwejjeġ",
          "pt": "Roupas",
          "sk": "Oblečenie",
          "sl": "Oblačila",
          "fi": "Vaatteet",
          "hr": "Odjeća",
          "cs": "Oblečení",
          "sv": "Kläder",
          "et": "Riided",
          "hi": "कपड़े",
          "ar": "الملابس",
          "id": "Pakaian",
          "vi": "Quần áo",
          "th": "เสื้อผ้า",
          "ko": "옷",
          "ja": "服"
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
          "ru": "Животные",
          "uk": "Тварини",
          "en": "Animals",
          "de": "Tiere",
          "es": "Animales",
          "fr": "Animaux",
          "pl": "Zwierzęta",
          "tr": "Hayvanlar",
          "it": "Animali",
          "ro": "Animale",
          "bg": "Животни",
          "hu": "Állatok",
          "el": "Ζώα",
          "da": "Dyr",
          "ga": "Ainmhithe",
          "lv": "Dzīvnieki",
          "lt": "Gyvūnai",
          "mt": "Annimali",
          "pt": "Animais",
          "sk": "Zvieratá",
          "sl": "Živali",
          "fi": "Eläimet",
          "hr": "Životinje",
          "cs": "Zvířata",
          "sv": "Djur",
          "et": "Loomad",
          "hi": "जानवर",
          "ar": "الحيوانات",
          "id": "Hewan",
          "vi": "Động vật",
          "th": "สัตว์",
          "ko": "동물",
          "ja": "動物"
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
          "ru": "Популярные глаголы",
          "uk": "Популярні дієслова",
          "en": "Popular verbs",
          "de": "Beliebte Verben",
          "es": "Verbos populares",
          "fr": "Verbes populaires",
          "pl": "Popularne czasowniki",
          "tr": "Popüler fiiller",
          "it": "Verbi comuni",
          "ro": "Verbe populare",
          "bg": "Популярни глаголи",
          "hu": "Gyakori igék",
          "el": "Δημοφιλή ρήματα",
          "da": "Populære udsagnsord",
          "ga": "Briathra coitianta",
          "lv": "Biežāk lietotie darbības vārdi",
          "lt": "Populiarūs veiksmažodžiai",
          "mt": "Verbi popolari",
          "pt": "Verbos populares",
          "sk": "Populárne slovesá",
          "sl": "Priljubljeni glagoli",
          "fi": "Yleiset verbit",
          "hr": "Popularni glagoli",
          "cs": "Populární slovesa",
          "sv": "Populära verb",
          "et": "Levinud tegusõnad",
          "hi": "लोकप्रिय क्रियाएं",
          "ar": "أفعال شائعة",
          "id": "Kata kerja populer",
          "vi": "Động từ phổ biến",
          "th": "คำกริยายอดนิยม",
          "ko": "자주 쓰는 동사",
          "ja": "よく使われる動詞"
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
          "ru": "Прилагательные",
          "uk": "Прикметники",
          "en": "Adjectives",
          "de": "Adjektive",
          "es": "Adjetivos",
          "fr": "Adjectifs",
          "pl": "Przymiotniki",
          "tr": "Sıfatlar",
          "it": "Aggettivi",
          "ro": "Adjective",
          "bg": "Прилагателни",
          "hu": "Melléknevek",
          "el": "Επίθετα",
          "da": "Tillægsord",
          "ga": "Aidiachtaí",
          "lv": "Īpašības vārdi",
          "lt": "Būdvardžiai",
          "mt": "Aġġettivi",
          "pt": "Adjetivos",
          "sk": "Prídavné mená",
          "sl": "Pridavniki",
          "fi": "Adjektiivit",
          "hr": "Pridjevi",
          "cs": "Přídavná jména",
          "sv": "Adjektiv",
          "et": "Omadussõnad",
          "hi": "विशेषण",
          "ar": "الصفات",
          "id": "Kata sifat",
          "vi": "Tính từ",
          "th": "คำคุณศัพท์",
          "ko": "형용사",
          "ja": "形容詞"
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
          "ru": "Фразовые глаголы",
          "uk": "Фразові дієслова",
          "en": "Phrasal verbs",
          "de": "Phrasale Verben",
          "es": "Verbos compuestos",
          "fr": "Verbes à particule",
          "pl": "Czasowniki frazowe",
          "tr": "Deyimsel fiiller",
          "it": "Verbi frasali",
          "ro": "Verbe frazale",
          "bg": "Фразови глаголи",
          "hu": "Vonzatos igék",
          "el": "Φραστικά ρήματα",
          "da": "Frasalverber",
          "ga": "Briathra frásacha",
          "lv": "Frāzālie darbības vārdi",
          "lt": "Fraziniai veiksmažodžiai",
          "mt": "Verbi frażali",
          "pt": "Verbos frasais",
          "sk": "Frázové slovesá",
          "sl": "Frazni glagoli",
          "fi": "Fraasiverbit",
          "hr": "Frazni glagoli",
          "cs": "Frázová slovesa",
          "sv": "Frasverb",
          "et": "Ühendverbid",
          "hi": "वाक्यांश क्रियाएं",
          "ar": "الأفعال المركبة",
          "id": "Kata kerja frasa",
          "vi": "Cụm động từ",
          "th": "กริยาวลี",
          "ko": "구동사",
          "ja": "句動詞"
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
  if (cachedWordMap && cachedWordMap._sourceRef === allWords && cachedWordMap._sourceLen === (allWords ? allWords.length : 0)) {
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
  map._sourceRef = allWords;
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

export const MAX_CUSTOM_COLLECTIONS = 50;

export function createCustomCollection(name, icon = '📘') {
  const trimmedName = Array.from(String(name || '').trim()).slice(0, 20).join('');
  if (!trimmedName) return null;

  const collections = getCustomCollections();
  if (collections.length >= MAX_CUSTOM_COLLECTIONS) {
    return null;
  }
  const isDuplicate = collections.some((c) => c.name.toLowerCase().trim() === trimmedName.toLowerCase().trim());
  if (isDuplicate) {
    return null;
  }

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

export function deleteCustomCollection(collectionId, allWords = []) {
  const collections = getCustomCollections();
  const filtered = collections.filter((c) => c.id !== collectionId);
  saveCustomCollections(filtered);

  if (getActiveCollectionId() === collectionId) {
    setActiveCollectionId('my_favorites');
    const words = (allWords && allWords.length > 0) ? allWords : _cachedAllWords;
    syncCollectionToAndroidWidget('my_favorites', words);
  }
}

export function renameCustomCollection(collectionId, newName, newIcon, allWords = []) {
  const trimmedName = Array.from(String(newName || '').trim()).slice(0, 20).join('');
  if (!trimmedName) return;

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  if (target) {
    const isDuplicate = collections.some((c) => c.id !== collectionId && c.name.toLowerCase().trim() === trimmedName.toLowerCase().trim());
    if (isDuplicate) return;

    target.name = trimmedName;
    if (newIcon) target.icon = newIcon;
    saveCustomCollections(collections);

    if (getActiveCollectionId() === collectionId) {
      const words = (allWords && allWords.length > 0) ? allWords : _cachedAllWords;
      syncCollectionToAndroidWidget(collectionId, words);
    }
  }
}

let _cachedAllWords = [];

export function setCachedAllWords(words) {
  if (Array.isArray(words) && words.length >= _cachedAllWords.length) {
    _cachedAllWords = words;
  }
}

export function addWordToCollection(collectionId, wordId, allWords = []) {
  if (Array.isArray(allWords) && allWords.length >= _cachedAllWords.length) {
    _cachedAllWords = allWords;
  }

  if (collectionId === 'my_favorites') {
    const currentFavs = getUserFavorites();
    if (!currentFavs.includes(wordId)) {
      toggleFavoriteApi(wordId);
    }
    return;
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin) {
    const words = (allWords && allWords.length > 0) ? allWords : _cachedAllWords;
    const currentWords = getCollectionWords(collectionId, words);
    const currentIds = currentWords.map((w) => String(w.id));
    const targetIdStr = String(wordId);
    if (!currentIds.includes(targetIdStr)) {
      currentIds.push(targetIdStr);
      setCollectionWords(collectionId, currentIds);
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

export function removeWordFromCollection(collectionId, wordId, allWords = []) {
  if (Array.isArray(allWords) && allWords.length >= _cachedAllWords.length) {
    _cachedAllWords = allWords;
  }

  if (collectionId === 'my_favorites') {
    const currentFavs = getUserFavorites();
    if (currentFavs.includes(wordId)) {
      toggleFavoriteApi(wordId);
    }
    return;
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin) {
    const words = (allWords && allWords.length > 0) ? allWords : _cachedAllWords;
    const currentWords = getCollectionWords(collectionId, words);
    const targetIdStr = String(wordId);
    const newWordIds = currentWords
      .map((w) => String(w.id))
      .filter((id) => id !== targetIdStr);
    setCollectionWords(collectionId, newWordIds);
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
  if (Array.isArray(allWords) && allWords.length >= _cachedAllWords.length) {
    _cachedAllWords = allWords;
  }

  const idStr = String(wordId);
  if (collectionId === 'my_favorites') {
    return getUserFavorites().map(String).includes(idStr);
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin && builtin.wordKeys) {
    const words = (allWords && allWords.length > 0) ? allWords : _cachedAllWords;
    const colWords = getCollectionWords(collectionId, words);
    return colWords.some((w) => String(w.id) === idStr);
  }

  const collections = getCustomCollections();
  const target = collections.find((c) => c.id === collectionId);
  return target ? target.wordIds.map(String).includes(idStr) : false;
}

export function getCollectionWords(collectionId, allWords = []) {
  if (Array.isArray(allWords) && allWords.length >= _cachedAllWords.length) {
    _cachedAllWords = allWords;
  }
  const effectiveWords = (Array.isArray(allWords) && allWords.length > 0) ? allWords : _cachedAllWords;
  if (!Array.isArray(effectiveWords) || effectiveWords.length === 0) return [];

  if (collectionId === 'my_favorites') {
    const favSet = new Set(getUserFavorites().map(String));
    return effectiveWords.filter((w) => favSet.has(String(w.id)));
  }

  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin && builtin.wordKeys) {
    const overrides = getBuiltinOverrides();
    if (Array.isArray(overrides[collectionId])) {
      const wordById = new Map();
      effectiveWords.forEach((w) => {
        if (w && w.id != null) wordById.set(String(w.id), w);
      });
      const result = [];
      overrides[collectionId].forEach((id) => {
        const w = wordById.get(String(id));
        if (w) result.push(w);
      });
      return result;
    }

    const map = getWordLookupMap(effectiveWords);
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
    const wordById = new Map();
    effectiveWords.forEach((w) => {
      if (w && w.id != null) wordById.set(String(w.id), w);
    });
    const result = [];
    target.wordIds.forEach((id) => {
      const w = wordById.get(String(id));
      if (w) result.push(w);
    });
    return result;
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
  const builtin = BUILTIN_COLLECTIONS_DEF.find((b) => b.id === collectionId);
  if (builtin) {
    const overrides = getBuiltinOverrides();
    overrides[collectionId] = Array.from(new Set(wordIds.map(String)));
    saveBuiltinOverrides(overrides);
    return;
  }

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

export function syncCollectionToAndroidWidget(collectionId = null, allWords = []) {
  if (typeof window === 'undefined') return;
  const targetId = collectionId || getActiveCollectionId() || 'my_favorites';
  let words = getCollectionWords(targetId, allWords);
  const title = getCollectionTitle(targetId);
  const hasFavs = words.length > 0;

  if (words.length === 0 && Array.isArray(allWords) && allWords.length > 0) {
    // Curated starter words if collection/favorites is empty
    words = allWords.slice(0, 50);
  }

  if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.syncFavorites === 'function') {
    try {
      const payload = {
        title: title,
        collectionId: targetId,
        hasFavorites: hasFavs,
        words: words.map((w) => ({
          id: String(w.id || w.word || ''),
          word: String(w.word || ''),
          transcription: String(w.transcription || ''),
          translation: String(getWordTranslation(w) || w.translation || ''),
          level: String(w.category || w.level || title || 'ELEMENTARY'),
          example: String(w.example || w.notes || '').trim(),
          isFavorite: hasFavs,
        })),
      };
      window.AndroidWidgetBridge.syncFavorites(JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to sync collection to widget:', err);
    }
  }
}

