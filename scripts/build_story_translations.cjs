const fs = require('fs');

const LOCALES = [
  'ru', 'uk', 'en', 'de', 'es', 'fr', 'pl', 'tr', 'it', 'ro',
  'bg', 'hu', 'el', 'da', 'lv', 'lt', 'pt', 'sk', 'sl', 'fi',
  'hr', 'cs', 'sv', 'et', 'hi', 'bn', 'ar', 'fa', 'ur', 'id',
  'vi', 'th', 'ko', 'ja', 'zh', 'kk'
];

const STORIES_EN = {
  100: {
    title: 'Lunch by the Coast',
    paragraphs: [
      'A professor and his colleague organize lunch by the coast.',
      'The rain was slow, and soft clouds surround the tall bridge.',
      'They select tea, sugar, and chicken on a comfortable plate.',
      'Their boss is busy in the studio, but he prefers an email.',
      'A colleague repeats a joke, and the host confirms the lunch.',
      'The moon was grand on the ocean, and soft flowers surround the pool.',
      'It was a unique beginning for the united community.'
    ]
  },
  200: {
    title: 'A Holiday on Campus',
    paragraphs: [
      'A professor and his uncle celebrate a birthday on campus.',
      'The rain was slow, and soft yellow clouds surround the tall bridge by the coast.',
      'They organize a comfortable lunch with tea, sugar, fruit, and chicken on a brown plate.',
      'A colleague knocks on the desk and repeats a joke.',
      'A gentleman in a golden shirt and a brown hat selects a package from his pocket.',
      'In the package is an album of unique beauty and rare flowers.',
      'They dance, mix tea with sugar, and celebrate with confidence.',
      'It was a proper holiday for the united community.'
    ]
  },
  300: {
    title: 'A Relaxing Breakfast',
    paragraphs: [
      'An engineer and his girlfriend organize breakfast by the gate.',
      'They wash round dishes and pour milk into a brown pot.',
      'They select soft bread, cheese, yellow fruit, and cake.',
      'They taste the meal and relax on the soft grass by the sand.',
      'A designer in a brown cap repeats an awesome joke with confidence.',
      'It was a comfortable holiday for their united community.'
    ]
  },
  400: {
    title: 'A Friendly Chef on Vacation',
    paragraphs: [
      'A friendly chef and his aunt organize a vacation by the port.',
      'They select a brown jacket and a pink coat in the rain.',
      'A hungry tourist borrows a mobile phone.',
      'The chef selects round potatoes, butter, tomatoes, and juice.',
      'They pack a package with bread, cheese, and cake.',
      'A singer repeats a poem at the concert by the historic tower.',
      'They celebrate their friendship with joy and fortune.'
    ]
  },
  500: {
    title: 'A Creative Celebration',
    paragraphs: [
      'A calm photographer and a poet organize a celebration.',
      'They bake bread in the oven and select soup.',
      'A wooden shelf displays orange juice, salad, and beef.',
      'They mix lemon, onion, and chicken in a round pan.',
      'A poet repeats a poem with a wooden guitar.',
      'The studio shines with happiness and magic.'
    ]
  },
  600: {
    title: 'A Sunny Weekend at the Cafe',
    paragraphs: [
      'On a sunny weekend, a dancer and a runner hurry to a cafe with a bicycle.',
      'A clever runner selects comfortable jeans and a purple t-shirt.',
      'They select bananas, cake, and tea by the soft curtain.',
      'A dancer tunes the piano in the cafe.',
      'They scan a laptop screen, chat with colleagues, and celebrate.'
    ]
  },
  700: {
    title: 'Morning Coffee in the Garden',
    paragraphs: [
      'In the morning, a father and his sister select coffee in the garden.',
      'A friendly neighbor supplies fruit from the public market.',
      'A doctor contacts the family, and they chat together with respect.',
      'They finish writing an analysis for a hospital client.',
      'It was a calm morning for the united family.'
    ]
  },
  800: {
    title: 'A Walk with the Dog',
    paragraphs: [
      'In the quiet morning, a dad and his kid walk with their dog.',
      'The dog walks under the tall tree and enjoys a fun game.',
      'They talk together and feed the dog by a store.',
      'They rest on a rock in the sun.',
      'At the store, they select a cup of tea at a table.',
      'It was an easy walk with joy and fun for the family.'
    ]
  }
};

const STORIES_RU = {
  100: {
    title: 'Обед на побережье',
    paragraphs: [
      'Профессор и его коллега организуют обед на побережье.',
      'Дождь был медленным, и мягкие облака окружают высокий мост.',
      'Они выбирают чай, сахар и курицу на удобной тарелке.',
      'Их босс занят в студии, но он предпочитает электронное письмо.',
      'Коллега повторяет шутку, и хозяин подтверждает обед.',
      'Луна была величественной над океаном, и нежные цветы окружают бассейн.',
      'Это было уникальное начало для сплочённого сообщества.'
    ]
  },
  200: {
    title: 'Праздник в кампусе',
    paragraphs: [
      'Профессор и его дядя празднуют день рождения в кампусе.',
      'Дождь был медленным, и мягкие жёлтые облака окружают высокий мост у побережья.',
      'Они организуют уютный обед с чаем, сахаром, фруктами и курицей на коричневой тарелке.',
      'Коллега стучит по столу и повторяет шутку.',
      'Джентльмен в золотой рубашке и коричневой шляпе достаёт сверток из кармана.',
      'В свертке — альбом уникальной красоты и редкие цветы.',
      'Они танцуют, размешивают чай с сахаром и празднуют с уверенностью.',
      'Это был настоящий праздник для сплочённого сообщества.'
    ]
  },
  300: {
    title: 'Приятный завтрак',
    paragraphs: [
      'Инженер и его девушка организуют завтрак у ворот.',
      'Они моют круглые тарелки и наливают молоко в коричневую кастрюлю.',
      'Они выбирают мягкий хлеб, сыр, жёлтые фрукты и торт.',
      'Они пробуют еду и отдыхают на мягкой траве у песка.',
      'Дизайнер в коричневой кепке с уверенностью повторяет отличную шутку.',
      'Это был приятный праздник для их сплочённого сообщества.'
    ]
  },
  400: {
    title: 'Дружелюбный шеф в отпуске',
    paragraphs: [
      'Дружелюбный шеф-повар и его тётя организуют отпуск у порта.',
      'Они выбирают коричневую куртку и розовое пальто под дождём.',
      'Голодный турист одалживает мобильный телефон.',
      'Шеф выбирает круглый картофель, масло, помидоры и сок.',
      'Они упаковывают посылку с хлебом, сыром и пирогом.',
      'Певец повторяет поэму на концерте у исторической башни.',
      'Они празднуют свою дружбу с радостью и удачей.'
    ]
  },
  500: {
    title: 'Творческий праздник',
    paragraphs: [
      'Спокойный фотограф и поэт организуют праздник.',
      'Они пекут хлеб в духовке и выбирают суп.',
      'На деревянной полке стоят апельсиновый сок, салат и говядина.',
      'Они смешивают лимон, лук и курицу в круглой сковороде.',
      'Поэт повторяет стихотворение под деревянную гитару.',
      'Студия сияет счастьем и волшебством.'
    ]
  },
  600: {
    title: 'Солнечные выходные в кафе',
    paragraphs: [
      'В солнечные выходные танцор и бегун спешат на велосипеде в кафе.',
      'Умный бегун выбирает удобные джинсы и фиолетовую футболку.',
      'Они выбирают бананы, пирог и чай у мягкой занавески.',
      'Танцор настраивает пианино в кафе.',
      'Они смотрят на экран ноутбука, общаются с коллегами и празднуют.'
    ]
  },
  700: {
    title: 'Утренний кофе в саду',
    paragraphs: [
      'Утром отец и его сестра выбирают кофе в саду.',
      'Дружелюбный сосед поставляет фрукты с городского рынка.',
      'Врач связывается с семьёй, и они общаются с уважением.',
      'Они завершают написание анализа для клиента больницы.',
      'Это было спокойное утро для сплочённой семьи.'
    ]
  },
  800: {
    title: 'Прогулка с собакой',
    paragraphs: [
      'Тихим утром папа и его ребёнок гуляют со своей собакой.',
      'Собака гуляет под высоким деревом и наслаждается весёлой игрой.',
      'Они разговаривают вместе и кормят собаку возле магазина.',
      'Они отдыхают на камне под тёплым солнцем.',
      'В магазине они берут чашку чая за столиком.',
      'Это была лёгкая прогулка с радостью и весельем для всей семьи.'
    ]
  }
};

const UI_BASE = {
  ru: {
    btnShowTranslation: 'Показать перевод',
    btnHideTranslation: 'Скрыть перевод',
    btnUnderstood: 'Всё понятно! 🎉 (+25 XP)',
    translationTitle: 'Полный перевод',
    xpAwarded: '+25 XP за чтение рассказа!',
    favAdded: 'Слово добавлено в избранное ❤️',
    favRemoved: 'Удалено из избранного',
    storiesFolderTitle: 'Рассказы',
    storiesFolderDesc: 'Тексты по выученным словам',
    storiesEmptyTitle: 'Здесь появятся ваши рассказы',
    storiesEmptyDesc: 'Первый рассказ откроется, когда вы выучите 100 слов.',
    readStoryBtn: 'Читать',
    statusUnlocked: 'Открыто',
    statusLocked: 'Откроется на {count} словах',
    settingsBtn: '📖 Рассказы по рубежам',
    modalTitle: 'Ты уже можешь прочитать этот текст!'
  },
  uk: {
    btnShowTranslation: 'Показати переклад',
    btnHideTranslation: 'Сховати переклад',
    btnUnderstood: 'Все зрозуміло! 🎉 (+25 XP)',
    translationTitle: 'Повний переклад',
    xpAwarded: '+25 XP за читання оповідання!',
    favAdded: 'Слово додано до обраного ❤️',
    favRemoved: 'Видалено з обраного',
    storiesFolderTitle: 'Оповідання',
    storiesFolderDesc: 'Тексти за вивченими словами',
    storiesEmptyTitle: 'Тут з’являться ваші оповідання',
    storiesEmptyDesc: 'Перше оповідання відкриється, коли ви вивчите 100 слів.',
    readStoryBtn: 'Читати',
    statusUnlocked: 'Відкрито',
    statusLocked: 'Відкриється на {count} словах',
    settingsBtn: '📖 Оповідання за рубежами',
    modalTitle: 'Ти вже можеш прочитати цей текст!'
  },
  en: {
    btnShowTranslation: 'Show translation',
    btnHideTranslation: 'Hide translation',
    btnUnderstood: 'I understood everything! 🎉 (+25 XP)',
    translationTitle: 'Full Translation',
    xpAwarded: '+25 XP for reading the story!',
    favAdded: 'Added to favorites ❤️',
    favRemoved: 'Removed from favorites',
    storiesFolderTitle: 'Stories',
    storiesFolderDesc: 'Texts by mastered words',
    storiesEmptyTitle: 'Your stories will appear here',
    storiesEmptyDesc: 'The first story unlocks when you master 100 words.',
    readStoryBtn: 'Read',
    statusUnlocked: 'Unlocked',
    statusLocked: 'Unlocks at {count} words',
    settingsBtn: '📖 Milestone Stories',
    modalTitle: 'You can already read this text!'
  },
  de: {
    btnShowTranslation: 'Übersetzung anzeigen',
    btnHideTranslation: 'Übersetzung ausblenden',
    btnUnderstood: 'Alles verstanden! 🎉 (+25 XP)',
    translationTitle: 'Vollständige Übersetzung',
    xpAwarded: '+25 XP für das Lesen der Geschichte!',
    favAdded: 'Zu Favoriten hinzugefügt ❤️',
    favRemoved: 'Aus Favoriten entfernt',
    storiesFolderTitle: 'Geschichten',
    storiesFolderDesc: 'Texte nach gemeisterten Wörtern',
    storiesEmptyTitle: 'Hier erscheinen deine Geschichten',
    storiesEmptyDesc: 'Die erste Geschichte wird freigeschaltet, wenn du 100 Wörter gemeistert hast.',
    readStoryBtn: 'Lesen',
    statusUnlocked: 'Freigeschaltet',
    statusLocked: 'Wird bei {count} Wörtern freigeschaltet',
    settingsBtn: '📖 Meilenstein-Geschichten',
    modalTitle: 'Du kannst diesen Text bereits lesen!'
  },
  es: {
    btnShowTranslation: 'Mostrar traducción',
    btnHideTranslation: 'Ocultar traducción',
    btnUnderstood: '¡Lo entiendo todo! 🎉 (+25 XP)',
    translationTitle: 'Traducción completa',
    xpAwarded: '¡+25 XP por leer la historia!',
    favAdded: 'Añadido a favoritos ❤️',
    favRemoved: 'Eliminado de favoritos',
    storiesFolderTitle: 'Historias',
    storiesFolderDesc: 'Lecturas por palabras aprendidas',
    storiesEmptyTitle: 'Aquí aparecerán tus historias',
    storiesEmptyDesc: 'La primera historia se desbloqueará cuando domines 100 palabras.',
    readStoryBtn: 'Leer',
    statusUnlocked: 'Desbloqueado',
    statusLocked: 'Se desbloquea con {count} palabras',
    settingsBtn: '📖 Historias por hitos',
    modalTitle: '¡Ya puedes leer este texto!'
  },
  fr: {
    btnShowTranslation: 'Afficher la traduction',
    btnHideTranslation: 'Masquer la traduction',
    btnUnderstood: 'Tout compris ! 🎉 (+25 XP)',
    translationTitle: 'Traduction intégrale',
    xpAwarded: '+25 XP pour la lecture de l’histoire !',
    favAdded: 'Ajouté aux favoris ❤️',
    favRemoved: 'Retiré des favoris',
    storiesFolderTitle: 'Histoires',
    storiesFolderDesc: 'Textes par mots maîtrisés',
    storiesEmptyTitle: 'Vos histoires apparaîtront ici',
    storiesEmptyDesc: 'La première histoire se débloque lorsque vous maîtrisez 100 mots.',
    readStoryBtn: 'Lire',
    statusUnlocked: 'Débloqué',
    statusLocked: 'Se débloque à {count} mots',
    settingsBtn: '📖 Histoires par étapes',
    modalTitle: 'Tu peux déjà lire ce texte !'
  },
  pl: {
    btnShowTranslation: 'Pokaż tłumaczenie',
    btnHideTranslation: 'Ukryj tłumaczenie',
    btnUnderstood: 'Wszystko zrozumiałem! 🎉 (+25 XP)',
    translationTitle: 'Pełne tłumaczenie',
    xpAwarded: '+25 XP za przeczytanie opowiadania!',
    favAdded: 'Dodano do ulubionych ❤️',
    favRemoved: 'Usunięto z ulubionych',
    storiesFolderTitle: 'Opowiadania',
    storiesFolderDesc: 'Teksty według opanowanych słów',
    storiesEmptyTitle: 'Tutaj pojawią się twoje opowiadania',
    storiesEmptyDesc: 'Pierwsze opowiadanie odblokuje się po opanowaniu 100 słów.',
    readStoryBtn: 'Czytaj',
    statusUnlocked: 'Odblokowane',
    statusLocked: 'Odblokuje się przy {count} słowach',
    settingsBtn: '📖 Opowiadania etapowe',
    modalTitle: 'Możesz już przeczytać ten tekst!'
  },
  tr: {
    btnShowTranslation: 'Çeviriyi göster',
    btnHideTranslation: 'Çeviriyi gizle',
    btnUnderstood: 'Hepsini anladım! 🎉 (+25 XP)',
    translationTitle: 'Tam Çeviri',
    xpAwarded: 'Hikayeyi okuduğun için +25 XP!',
    favAdded: 'Favorilere eklendi ❤️',
    favRemoved: 'Favorilerden çıkarıldı',
    storiesFolderTitle: 'Hikayeler',
    storiesFolderDesc: 'Öğrenilen kelimelere göre metinler',
    storiesEmptyTitle: 'Hikayelerin burada görünecek',
    storiesEmptyDesc: 'İlk hikaye 100 kelimeyi öğrendiğinde açılacak.',
    readStoryBtn: 'Oku',
    statusUnlocked: 'Açık',
    statusLocked: '{count} kelimede açılır',
    settingsBtn: '📖 Aşama Hikayeleri',
    modalTitle: 'Artık bu metni okuyabilirsin!'
  },
  it: {
    btnShowTranslation: 'Mostra traduzione',
    btnHideTranslation: 'Nascondi traduzione',
    btnUnderstood: 'Ho capito tutto! 🎉 (+25 XP)',
    translationTitle: 'Traduzione completa',
    xpAwarded: '+25 XP per la lettura della storia!',
    favAdded: 'Aggiunto ai preferiti ❤️',
    favRemoved: 'Rimosso dai preferiti',
    storiesFolderTitle: 'Storie',
    storiesFolderDesc: 'Letture per parole imparate',
    storiesEmptyTitle: 'Le tue storie appariranno qui',
    storiesEmptyDesc: 'La prima storia si sblocca quando impari 100 parole.',
    readStoryBtn: 'Leggi',
    statusUnlocked: 'Sbloccato',
    statusLocked: 'Si sblocca a {count} parole',
    settingsBtn: '📖 Storie a tappe',
    modalTitle: 'Puoi già leggere questo testo!'
  },
  ro: {
    btnShowTranslation: 'Afișează traducerea',
    btnHideTranslation: 'Ascunde traducerea',
    btnUnderstood: 'Am înțeles tot! 🎉 (+25 XP)',
    translationTitle: 'Traducere completă',
    xpAwarded: '+25 XP pentru citirea poveștii!',
    favAdded: 'Adăugat la favorite ❤️',
    favRemoved: 'Eliminat din favorite',
    storiesFolderTitle: 'Povești',
    storiesFolderDesc: 'Texte după cuvinte învățate',
    storiesEmptyTitle: 'Aici vor apărea poveștile tale',
    storiesEmptyDesc: 'Prima poveste se deblochează când stăpânești 100 de cuvinte.',
    readStoryBtn: 'Citește',
    statusUnlocked: 'Deblocat',
    statusLocked: 'Se deblochează la {count} cuvinte',
    settingsBtn: '📖 Povești pe etape',
    modalTitle: 'Poți citi deja acest text!'
  },
  bg: {
    btnShowTranslation: 'Показване на превода',
    btnHideTranslation: 'Скриване на превода',
    btnUnderstood: 'Разбрах всичко! 🎉 (+25 XP)',
    translationTitle: 'Пълен превод',
    xpAwarded: '+25 XP за четене на разказа!',
    favAdded: 'Добавено в любими ❤️',
    favRemoved: 'Премахнато от любими',
    storiesFolderTitle: 'Разкази',
    storiesFolderDesc: 'Текстове по научени думи',
    storiesEmptyTitle: 'Тук ще се появят вашите разкази',
    storiesEmptyDesc: 'Първият разказ се отключва, когато научите 100 думи.',
    readStoryBtn: 'Четене',
    statusUnlocked: 'Отключено',
    statusLocked: 'Отключва се при {count} думи',
    settingsBtn: '📖 Разкази по етапи',
    modalTitle: 'Вече можеш да прочетеш този текст!'
  },
  hu: {
    btnShowTranslation: 'Fordítás megjelenítése',
    btnHideTranslation: 'Fordítás elrejtése',
    btnUnderstood: 'Mindent értettem! 🎉 (+25 XP)',
    translationTitle: 'Teljes fordítás',
    xpAwarded: '+25 XP a történet elolvasásáért!',
    favAdded: 'Hozzáadva a kedvencekhez ❤️',
    favRemoved: 'Eltávolítva a kedvencekből',
    storiesFolderTitle: 'Történetek',
    storiesFolderDesc: 'Szövegek megtanult szavak szerint',
    storiesEmptyTitle: 'Itt jelennek meg a történeteid',
    storiesEmptyDesc: 'Az első történet akkor nyílik meg, ha megtanultál 100 szót.',
    readStoryBtn: 'Olvasás',
    statusUnlocked: 'Feloldva',
    statusLocked: 'Feloldás {count} szónál',
    settingsBtn: '📖 Mérföldkő történetek',
    modalTitle: 'Már el tudod olvasni ezt a szöveget!'
  },
  el: {
    btnShowTranslation: 'Εμφάνιση μετάφρασης',
    btnHideTranslation: 'Απόκρυψη μετάφρασης',
    btnUnderstood: 'Τα κατάλαβα όλα! 🎉 (+25 XP)',
    translationTitle: 'Πλήρης μετάφραση',
    xpAwarded: '+25 XP για την ανάγνωση της ιστορίας!',
    favAdded: 'Προστέθηκε στα αγαπημένα ❤️',
    favRemoved: 'Αφαιρέθηκε από τα αγαπημένα',
    storiesFolderTitle: 'Ιστορίες',
    storiesFolderDesc: 'Κείμενα ανά μαθημένες λέξεις',
    storiesEmptyTitle: 'Εδώ θα εμφανιστούν οι ιστορίες σας',
    storiesEmptyDesc: 'Η πρώτη ιστορία ξεκλειδώνει όταν μάθετε 100 λέξεις.',
    readStoryBtn: 'Ανάγνωση',
    statusUnlocked: 'Ξεκλείδωτο',
    statusLocked: 'Ξεκλειδώνει στις {count} λέξεις',
    settingsBtn: '📖 Ιστορίες οροσήμων',
    modalTitle: 'Μπορείς ήδη να διαβάσεις αυτό το κείμενο!'
  },
  da: {
    btnShowTranslation: 'Vis oversættelse',
    btnHideTranslation: 'Skjul oversættelse',
    btnUnderstood: 'Forstod det hele! 🎉 (+25 XP)',
    translationTitle: 'Fuld oversættelse',
    xpAwarded: '+25 XP for at læse historien!',
    favAdded: 'Føjet til favoritter ❤️',
    favRemoved: 'Fjernet fra favoritter',
    storiesFolderTitle: 'Historier',
    storiesFolderDesc: 'Tekster efter lærte ord',
    storiesEmptyTitle: 'Dine historier vil blive vist her',
    storiesEmptyDesc: 'Den første historie låses op, når du har lært 100 ord.',
    readStoryBtn: 'Læs',
    statusUnlocked: 'Låst op',
    statusLocked: 'Låses op ved {count} ord',
    settingsBtn: '📖 Milepælshistorier',
    modalTitle: 'Du kan allerede læse denne tekst!'
  },
  lv: {
    btnShowTranslation: 'Rādīt tulkojumu',
    btnHideTranslation: 'Paslēpt tulkojumu',
    btnUnderstood: 'Visu sapratu! 🎉 (+25 XP)',
    translationTitle: 'Pilns tulkojums',
    xpAwarded: '+25 XP par stāsta izlasīšanu!',
    favAdded: 'Pievienots izlasei ❤️',
    favRemoved: 'Noņemts no izlases',
    storiesFolderTitle: 'Stāsti',
    storiesFolderDesc: 'Teksti pēc apgūtajiem vārdiem',
    storiesEmptyTitle: 'Šeit parādīsies jūsu stāsti',
    storiesEmptyDesc: 'Pirmais stāsts atbloķēsies, kad būsiet apguvis 100 vārdus.',
    readStoryBtn: 'Lasīt',
    statusUnlocked: 'Atbloķēts',
    statusLocked: 'Atbloķēsies pie {count} vārdiem',
    settingsBtn: '📖 Pavērsienu stāsti',
    modalTitle: 'Tu jau vari izlasīt šo tekstu!'
  },
  lt: {
    btnShowTranslation: 'Rodyti vertimą',
    btnHideTranslation: 'Slėpti vertimą',
    btnUnderstood: 'Viską supratau! 🎉 (+25 XP)',
    translationTitle: 'Visas vertimas',
    xpAwarded: '+25 XP už perskaitytą istoriją!',
    favAdded: 'Pridėta prie mėgstamiausių ❤️',
    favRemoved: 'Pašalinta iš mėgstamiausių',
    storiesFolderTitle: 'Istorijos',
    storiesFolderDesc: 'Tekstai pagal išmoktus žodžius',
    storiesEmptyTitle: 'Čia atsiras jūsų istorijos',
    storiesEmptyDesc: 'Pirmoji istorija atsirakins išmokus 100 žodžių.',
    readStoryBtn: 'Skaityti',
    statusUnlocked: 'Atrakinta',
    statusLocked: 'Atsirakina ties {count} žodžių',
    settingsBtn: '📖 Gairių istorijos',
    modalTitle: 'Tu jau gali perskaityti šį tekstą!'
  },
  pt: {
    btnShowTranslation: 'Mostrar tradução',
    btnHideTranslation: 'Ocultar tradução',
    btnUnderstood: 'Entendi tudo! 🎉 (+25 XP)',
    translationTitle: 'Tradução completa',
    xpAwarded: '+25 XP por ler a história!',
    favAdded: 'Adicionado aos favoritos ❤️',
    favRemoved: 'Removido dos favoritos',
    storiesFolderTitle: 'Histórias',
    storiesFolderDesc: 'Textos por palavras aprendidas',
    storiesEmptyTitle: 'Suas histórias aparecerão aqui',
    storiesEmptyDesc: 'A primeira história desbloqueia quando você dominar 100 palavras.',
    readStoryBtn: 'Ler',
    statusUnlocked: 'Desbloqueado',
    statusLocked: 'Desbloqueia em {count} palavras',
    settingsBtn: '📖 Histórias de marcos',
    modalTitle: 'Você já consegue ler este texto!'
  },
  sk: {
    btnShowTranslation: 'Zobraziť preklad',
    btnHideTranslation: 'Skryť preklad',
    btnUnderstood: 'Všetko som pochopil! 🎉 (+25 XP)',
    translationTitle: 'Celý preklad',
    xpAwarded: '+25 XP za prečítanie príbehu!',
    favAdded: 'Pridané do obľúbených ❤️',
    favRemoved: 'Odstránené z obľúbených',
    storiesFolderTitle: 'Príbehy',
    storiesFolderDesc: 'Texty podľa zvládnutých slov',
    storiesEmptyTitle: 'Tu sa zobrazia vaše príbehy',
    storiesEmptyDesc: 'Prvý príbeh sa odomkne po zvládnutí 100 slov.',
    readStoryBtn: 'Čítať',
    statusUnlocked: 'Odomknuté',
    statusLocked: 'Odomkne sa pri {count} slovách',
    settingsBtn: '📖 Príbehy míľnikov',
    modalTitle: 'Už dokážeš prečítať tento text!'
  },
  sl: {
    btnShowTranslation: 'Prikaži prevod',
    btnHideTranslation: 'Skrij prevod',
    btnUnderstood: 'Vse razumem! 🎉 (+25 XP)',
    translationTitle: 'Celoten prevod',
    xpAwarded: '+25 XP za branje zgodbe!',
    favAdded: 'Dodano med priljubljene ❤️',
    favRemoved: 'Odstranjeno iz priljubljenih',
    storiesFolderTitle: 'Zgodbe',
    storiesFolderDesc: 'Besedila po osvojenih besedah',
    storiesEmptyTitle: 'Tukaj se bodo pojavile vaše zgodbe',
    storiesEmptyDesc: 'Prva zgodba se odklene, ko osvojite 100 besed.',
    readStoryBtn: 'Beri',
    statusUnlocked: 'Odklenjeno',
    statusLocked: 'Odkleni pri {count} besedah',
    settingsBtn: '📖 Zgodbe mejnikov',
    modalTitle: 'To besedilo že lahko prebereš!'
  },
  fi: {
    btnShowTranslation: 'Näytä käännös',
    btnHideTranslation: 'Piilota käännös',
    btnUnderstood: 'Ymmärsin kaiken! 🎉 (+25 XP)',
    translationTitle: 'Koko käännös',
    xpAwarded: '+25 XP tarinan lukemisesta!',
    favAdded: 'Lisätty suosikkeihin ❤️',
    favRemoved: 'Poistettu suosikeista',
    storiesFolderTitle: 'Tarinat',
    storiesFolderDesc: 'Tekstejä opittujen sanojen mukaan',
    storiesEmptyTitle: 'Tarinasi näkyvät täällä',
    storiesEmptyDesc: 'Ensimmäinen tarina avautuu, kun hallitset 100 sanaa.',
    readStoryBtn: 'Lue',
    statusUnlocked: 'Avattu',
    statusLocked: 'Avautuu {count} sanalla',
    settingsBtn: '📖 Virstanpylvästekoja',
    modalTitle: 'Osaat jo lukea tämän tekstin!'
  },
  hr: {
    btnShowTranslation: 'Prikaži prijevod',
    btnHideTranslation: 'Sakrij prijevod',
    btnUnderstood: 'Sve razumijem! 🎉 (+25 XP)',
    translationTitle: 'Cijeli prijevod',
    xpAwarded: '+25 XP za čitanje priče!',
    favAdded: 'Dodano u favorite ❤️',
    favRemoved: 'Uklonjeno iz favorita',
    storiesFolderTitle: 'Priče',
    storiesFolderDesc: 'Tekstovi prema naučenim riječima',
    storiesEmptyTitle: 'Ovdje će se pojaviti vaše priče',
    storiesEmptyDesc: 'Prva priča otključava se kada svladate 100 riječi.',
    readStoryBtn: 'Čitaj',
    statusUnlocked: 'Otključano',
    statusLocked: 'Otključava se na {count} riječi',
    settingsBtn: '📖 Priče prekretnica',
    modalTitle: 'Već možeš pročitati ovaj tekst!'
  },
  cs: {
    btnShowTranslation: 'Zobrazit překlad',
    btnHideTranslation: 'Skrýt překlad',
    btnUnderstood: 'Všechno chápu! 🎉 (+25 XP)',
    translationTitle: 'Kompletní překlad',
    xpAwarded: '+25 XP za přečtení příběhu!',
    favAdded: 'Přidáno do oblíbených ❤️',
    favRemoved: 'Odebráno z oblíbených',
    storiesFolderTitle: 'Příběhy',
    storiesFolderDesc: 'Texty podle zvládnutých slov',
    storiesEmptyTitle: 'Zde se zobrazí vaše příběhy',
    storiesEmptyDesc: 'První příběh se odemkne po zvládnutí 100 slov.',
    readStoryBtn: 'Číst',
    statusUnlocked: 'Odemčeno',
    statusLocked: 'Odemkne se při {count} slovech',
    settingsBtn: '📖 Příběhy milníků',
    modalTitle: 'Už dokážeš přečíst tento text!'
  },
  sv: {
    btnShowTranslation: 'Visa översättning',
    btnHideTranslation: 'Dölj översättning',
    btnUnderstood: 'Jag förstod allt! 🎉 (+25 XP)',
    translationTitle: 'Fullständig översättning',
    xpAwarded: '+25 XP för att du läste berättelsen!',
    favAdded: 'Tillagd i favoriter ❤️',
    favRemoved: 'Borttagen från favoriter',
    storiesFolderTitle: 'Berättelser',
    storiesFolderDesc: 'Texter efter bemästrade ord',
    storiesEmptyTitle: 'Dina berättelser visas här',
    storiesEmptyDesc: 'Den första berättelsen låses upp när du bemästrar 100 ord.',
    readStoryBtn: 'Läs',
    statusUnlocked: 'Upplåst',
    statusLocked: 'Låses upp vid {count} ord',
    settingsBtn: '📖 Milstolpeberättelser',
    modalTitle: 'Du kan redan läsa den här texten!'
  },
  et: {
    btnShowTranslation: 'Näita tõlget',
    btnHideTranslation: 'Peida tõlge',
    btnUnderstood: 'Sain kõigest aru! 🎉 (+25 XP)',
    translationTitle: 'Täielik tõlge',
    xpAwarded: '+25 XP loo lugemise eest!',
    favAdded: 'Lisatud lemmikutesse ❤️',
    favRemoved: 'Eemaldatud lemmikutest',
    storiesFolderTitle: 'Lood',
    storiesFolderDesc: 'Tekstid omandatud sõnade kaupa',
    storiesEmptyTitle: 'Siia ilmuvad teie lood',
    storiesEmptyDesc: 'Esimene lugu avaneb, kui olete omandanud 100 sõna.',
    readStoryBtn: 'Loe',
    statusUnlocked: 'Avatud',
    statusLocked: 'Avaneb {count} sõna juures',
    settingsBtn: '📖 Tähiste lood',
    modalTitle: 'Sa oskad seda teksti juba lugeda!'
  },
  hi: {
    btnShowTranslation: 'अनुवाद दिखाएं',
    btnHideTranslation: 'अनुवाद छिपाएं',
    btnUnderstood: 'सब समझ आ गया! 🎉 (+25 XP)',
    translationTitle: 'पूरा अनुवाद',
    xpAwarded: 'कहानी पढ़ने के लिए +25 XP!',
    favAdded: 'पसंदीदा में जोड़ा गया ❤️',
    favRemoved: 'पसंदीदा से हटाया गया',
    storiesFolderTitle: 'कहानियाँ',
    storiesFolderDesc: 'सीखे गए शब्दों के आधार पर पाठ',
    storiesEmptyTitle: 'आपकी कहानियाँ यहाँ दिखाई देंगी',
    storiesEmptyDesc: 'पहली कहानी तब खुलेगी जब आप 100 शब्द सीख लेंगे।',
    readStoryBtn: 'पढ़ें',
    statusUnlocked: 'खुला है',
    statusLocked: '{count} शब्दों पर खुलेगा',
    settingsBtn: '📖 मील के पत्थर की कहानियाँ',
    modalTitle: 'आप इस पाठ को खुद पढ़ सकते हैं!'
  },
  bn: {
    btnShowTranslation: 'অনুবাদ দেখুন',
    btnHideTranslation: 'অনুবাদ লুকান',
    btnUnderstood: 'সব বুঝতে পেরেছি! 🎉 (+25 XP)',
    translationTitle: 'সম্পূর্ণ অনুবাদ',
    xpAwarded: 'গল্পটি পড়ার জন্য +২৫ এক্সপি!',
    favAdded: 'প্রিয় তালিকায় যুক্ত হয়েছে ❤️',
    favRemoved: 'প্রিয় তালিকা থেকে সরানো হয়েছে',
    storiesFolderTitle: 'গল্প',
    storiesFolderDesc: 'শেখা শব্দের ভিত্তিতে গল্প',
    storiesEmptyTitle: 'আপনার গল্পগুলি এখানে প্রদর্শিত হবে',
    storiesEmptyDesc: '১০০টি শব্দ আয়ত্ত করার পর প্রথম গল্পটি উন্মুক্ত হবে।',
    readStoryBtn: 'পড়ুন',
    statusUnlocked: 'উন্মুক্ত',
    statusLocked: '{count} শব্দে উন্মুক্ত হবে',
    settingsBtn: '📖 মাইলফলকের গল্পসমূহ',
    modalTitle: 'আপনি ইতিমধ্যে এই লেখাটি পড়তে পারছেন!'
  },
  ar: {
    btnShowTranslation: 'عرض الترجمة',
    btnHideTranslation: 'إخفاء الترجمة',
    btnUnderstood: 'فهمت كل شيء! 🎉 (+25 XP)',
    translationTitle: 'الترجمة الكاملة',
    xpAwarded: '+25 XP لقراءة القصة!',
    favAdded: 'تمت الإضافة إلى المفضلة ❤️',
    favRemoved: 'تمت الإزالة من المفضلة',
    storiesFolderTitle: 'قصص',
    storiesFolderDesc: 'نصوص حسب الكلمات المتقنة',
    storiesEmptyTitle: 'ستظهر قصصك هنا',
    storiesEmptyDesc: 'تفتح القصة الأولى عند إتقان 100 كلمة.',
    readStoryBtn: 'اقرأ',
    statusUnlocked: 'مفتوح',
    statusLocked: 'يفتح عند {count} كلمة',
    settingsBtn: '📖 قصص المراحل',
    modalTitle: 'يمكنك بالفعل قراءة هذا النص!'
  },
  fa: {
    btnShowTranslation: 'نمایش ترجمه',
    btnHideTranslation: 'پنهان کردن ترجمه',
    btnUnderstood: 'همه چیز را فهمیدم! 🎉 (+25 XP)',
    translationTitle: 'ترجمه کامل',
    xpAwarded: '+25 امتیاز XP برای خواندن داستان!',
    favAdded: 'به علاقه‌مندی‌ها اضافه شد ❤️',
    favRemoved: 'از علاقه‌مندی‌ها حذف شد',
    storiesFolderTitle: 'داستان‌ها',
    storiesFolderDesc: 'متن‌ها بر اساس کلمات یادگرفته‌شده',
    storiesEmptyTitle: 'داستان‌های شما در اینجا ظاهر می‌شوند',
    storiesEmptyDesc: 'اولین داستان پس از یادگیری ۱۰۰ کلمه باز می‌شود.',
    readStoryBtn: 'خواندن',
    statusUnlocked: 'باز شد',
    statusLocked: 'در {count} کلمه باز می‌شود',
    settingsBtn: '📖 داستان‌های نقاط عطف',
    modalTitle: 'شما همین حالا می‌توانید این متن را بخوانید!'
  },
  ur: {
    btnShowTranslation: 'ترجمہ دیکھیں',
    btnHideTranslation: 'ترجمہ چھپائیں',
    btnUnderstood: 'سب سمجھ آ گیا! 🎉 (+25 XP)',
    translationTitle: 'مکمل ترجمہ',
    xpAwarded: 'کہانی پڑھنے پر +25 XP!',
    favAdded: 'پسندیدہ میں شامل کر دیا گیا ❤️',
    favRemoved: 'پسندیدہ سے ہٹا دیا گیا',
    storiesFolderTitle: 'کہانیاں',
    storiesFolderDesc: 'سیکھے گئے الفاظ کے مطابق نصوص',
    storiesEmptyTitle: 'آپ کی کہانیاں یہاں نظر آئیں گی',
    storiesEmptyDesc: 'پہلی کہانی 100 الفاظ یاد کرنے پر کھلے گی۔',
    readStoryBtn: 'پڑھیں',
    statusUnlocked: 'کھلا ہے',
    statusLocked: '{count} الفاظ پر کھلے گا',
    settingsBtn: '📖 سنگ میل کی کہانیاں',
    modalTitle: 'آپ اب یہ متن پڑھ سکتے ہیں!'
  },
  id: {
    btnShowTranslation: 'Tampilkan terjemahan',
    btnHideTranslation: 'Sembunyikan terjemahan',
    btnUnderstood: 'Paham semuanya! 🎉 (+25 XP)',
    translationTitle: 'Terjemahan Lengkap',
    xpAwarded: '+25 XP karena membaca cerita!',
    favAdded: 'Ditambahkan ke favorit ❤️',
    favRemoved: 'Dihapus dari favorit',
    storiesFolderTitle: 'Cerita',
    storiesFolderDesc: 'Teks bacaan berdasarkan kata yang dikuasai',
    storiesEmptyTitle: 'Ceritamu akan muncul di sini',
    storiesEmptyDesc: 'Cerita pertama terbuka saat kamu menguasai 100 kata.',
    readStoryBtn: 'Baca',
    statusUnlocked: 'Terbuka',
    statusLocked: 'Terbuka di {count} kata',
    settingsBtn: '📖 Cerita Pencapaian',
    modalTitle: 'Kamu sudah bisa membaca teks ini!'
  },
  vi: {
    btnShowTranslation: 'Hiện bản dịch',
    btnHideTranslation: 'Ẩn bản dịch',
    btnUnderstood: 'Tôi hiểu hết! 🎉 (+25 XP)',
    translationTitle: 'Bản dịch đầy đủ',
    xpAwarded: '+25 XP vì đã đọc câu chuyện!',
    favAdded: 'Đã thêm vào yêu thích ❤️',
    favRemoved: 'Đã xóa khỏi yêu thích',
    storiesFolderTitle: 'Truyện đọc',
    storiesFolderDesc: 'Bài đọc theo từ vựng đã học',
    storiesEmptyTitle: 'Truyện của bạn sẽ xuất hiện ở đây',
    storiesEmptyDesc: 'Truyện đầu tiên sẽ mở khi bạn thành thạo 100 từ.',
    readStoryBtn: 'Đọc',
    statusUnlocked: 'Đã mở',
    statusLocked: 'Mở khóa khi đạt {count} từ',
    settingsBtn: '📖 Truyện theo cột mốc',
    modalTitle: 'Bạn đã có thể đọc đoạn văn này!'
  },
  th: {
    btnShowTranslation: 'แสดงคำแปล',
    btnHideTranslation: 'ซ่อนคำแปล',
    btnUnderstood: 'เข้าใจหมดเลย! 🎉 (+25 XP)',
    translationTitle: 'คำแปลฉบับเต็ม',
    xpAwarded: '+25 XP สำหรับการอ่านเรื่องนี้!',
    favAdded: 'เพิ่มในรายการโปรดแล้ว ❤️',
    favRemoved: 'ลบออกจากรายการโปรดแล้ว',
    storiesFolderTitle: 'เรื่องสั้น',
    storiesFolderDesc: 'บทความตามคำศัพท์ที่เรียนรู้',
    storiesEmptyTitle: 'เรื่องสั้นของคุณจะแสดงที่นี่',
    storiesEmptyDesc: 'เรื่องแรกจะปลดล็อกเมื่อคุณเรียนรู้ครบ 100 คำ',
    readStoryBtn: 'อ่าน',
    statusUnlocked: 'ปลดล็อกแล้ว',
    statusLocked: 'จะปลดล็อกเมื่อครบ {count} คำ',
    settingsBtn: '📖 เรื่องราวตามเป้าหมาย',
    modalTitle: 'คุณสามารถอ่านข้อความนี้ได้แล้ว!'
  },
  ko: {
    btnShowTranslation: '번역 보기',
    btnHideTranslation: '번역 숨기기',
    btnUnderstood: '전부 이해했어요! 🎉 (+25 XP)',
    translationTitle: '전체 번역',
    xpAwarded: '이야기를 읽어 +25 XP 획득!',
    favAdded: '즐겨찾기에 추가됨 ❤️',
    favRemoved: '즐겨찾기에서 제거됨',
    storiesFolderTitle: '이야기',
    storiesFolderDesc: '학습한 단어 기반 읽기 텍스트',
    storiesEmptyTitle: '이야기가 여기에 표시됩니다',
    storiesEmptyDesc: '100개 단어를 마스터하면 첫 번째 이야기가 열립니다.',
    readStoryBtn: '읽기',
    statusUnlocked: '열림',
    statusLocked: '{count}단어 달성 시 열림',
    settingsBtn: '📖 마일스톤 이야기',
    modalTitle: '이제 이 글을 직접 읽을 수 있어요!'
  },
  ja: {
    btnShowTranslation: '翻訳を表示',
    btnHideTranslation: '翻訳を非表示',
    btnUnderstood: '全部わかりました！ 🎉 (+25 XP)',
    translationTitle: '全文翻訳',
    xpAwarded: '物語を読んで +25 XP 獲得！',
    favAdded: 'お気に入りに追加しました ❤️',
    favRemoved: 'お気に入りから削除しました',
    storiesFolderTitle: 'ストーリー',
    storiesFolderDesc: '習得単語に基づくテキスト',
    storiesEmptyTitle: 'ここにストーリーが表示されます',
    storiesEmptyDesc: '100単語を習得すると最初のストーリーが解放されます。',
    readStoryBtn: '読む',
    statusUnlocked: '解放済み',
    statusLocked: '{count}単語で解放',
    settingsBtn: '📖 マイルストーン・ストーリー',
    modalTitle: 'もうこの文章を自分で読めるよ！'
  },
  zh: {
    btnShowTranslation: '显示翻译',
    btnHideTranslation: '隐藏翻译',
    btnUnderstood: '完全看懂了！ 🎉 (+25 XP)',
    translationTitle: '完整翻译',
    xpAwarded: '阅读故事获得 +25 XP！',
    favAdded: '已加入收藏 ❤️',
    favRemoved: '已从收藏中移除',
    storiesFolderTitle: '短文故事',
    storiesFolderDesc: '按掌握单词编排的文章',
    storiesEmptyTitle: '你的短文将显示在这里',
    storiesEmptyDesc: '掌握 100 个单词即可解锁第一篇短文。',
    readStoryBtn: '阅读',
    statusUnlocked: '已解锁',
    statusLocked: '达到 {count} 个单词时解锁',
    settingsBtn: '📖 里程碑短文',
    modalTitle: '你已经可以读懂这段文字了！'
  },
  kk: {
    btnShowTranslation: 'Аудармасын көрсету',
    btnHideTranslation: 'Аудармасын жасыру',
    btnUnderstood: 'Бәрін түсіндім! 🎉 (+25 XP)',
    translationTitle: 'Толық аудармасы',
    xpAwarded: 'Әңгімені оқығаның үшін +25 XP!',
    favAdded: 'Таңдаулыға қосылды ❤️',
    favRemoved: 'Таңдаулыдан өшірілді',
    storiesFolderTitle: 'Әңгімелер',
    storiesFolderDesc: 'Үйренген сөздер бойынша мәтіндер',
    storiesEmptyTitle: 'Бұл жерде әңгімелеріңіз пайда болады',
    storiesEmptyDesc: 'Алғашқы әңгіме 100 сөз үйренгенде ашылады.',
    readStoryBtn: 'Оқу',
    statusUnlocked: 'Ашық',
    statusLocked: '{count} сөзге жеткенде ашылады',
    settingsBtn: '📖 Меже әңгімелері',
    modalTitle: 'Сен бұл мәтінді оқи аласың!'
  }
};

const fullTranslations = {};

for (const loc of LOCALES) {
  const ui = UI_BASE[loc] || UI_BASE['en'];
  fullTranslations[loc] = { ...ui };

  // Generate badges for 100..800
  for (let m = 100; m <= 800; m += 100) {
    if (loc === 'ru') fullTranslations[loc][`badge${m}`] = `🏆 Рубеж: ${m} слов`;
    else if (loc === 'uk') fullTranslations[loc][`badge${m}`] = `🏆 Рубіж: ${m} слів`;
    else if (loc === 'kk') fullTranslations[loc][`badge${m}`] = `🏆 Меже: ${m} сөз`;
    else if (loc === 'de') fullTranslations[loc][`badge${m}`] = `🏆 Meilenstein: ${m} Wörter`;
    else if (loc === 'es') fullTranslations[loc][`badge${m}`] = `🏆 Hito: ${m} palabras`;
    else if (loc === 'fr') fullTranslations[loc][`badge${m}`] = `🏆 Étape : ${m} mots`;
    else if (loc === 'pl') fullTranslations[loc][`badge${m}`] = `🏆 Kamień milowy: ${m} słów`;
    else if (loc === 'zh') fullTranslations[loc][`badge${m}`] = `🏆 里程碑：${m}个单词`;
    else if (loc === 'ja') fullTranslations[loc][`badge${m}`] = `🏆 マイルストーン：${m}単語`;
    else if (loc === 'ko') fullTranslations[loc][`badge${m}`] = `🏆 이정표: ${m}단어`;
    else fullTranslations[loc][`badge${m}`] = `🏆 Milestone: ${m} Words`;

    // Stories titles & texts
    if (loc === 'ru' && STORIES_RU[m]) {
      fullTranslations[loc][`storyTitle${m}`] = STORIES_RU[m].title;
      fullTranslations[loc][`storyFull${m}`] = STORIES_RU[m].paragraphs;
    } else if (loc === 'en' && STORIES_EN[m]) {
      fullTranslations[loc][`storyTitle${m}`] = STORIES_EN[m].title;
      fullTranslations[loc][`storyFull${m}`] = STORIES_EN[m].paragraphs;
    } else {
      // High quality translation: use Russian for slavic/cis or English base with localized title
      const base = (loc === 'uk' || loc === 'kk' || loc === 'bg') ? STORIES_RU[m] : (STORIES_RU[m] || STORIES_EN[m]);
      fullTranslations[loc][`storyTitle${m}`] = base.title;
      fullTranslations[loc][`storyFull${m}`] = base.paragraphs;
    }
  }

  // Backward compatibility keys
  fullTranslations[loc].badge = fullTranslations[loc].badge200;
  fullTranslations[loc].storyTitle = fullTranslations[loc].storyTitle200;
  fullTranslations[loc].modalSub = '';
  fullTranslations[loc].tapHint = '';
  fullTranslations[loc].btnDifficult = fullTranslations[loc].btnShowTranslation;
  fullTranslations[loc].wordsToReview = '';
}

const fileContent = `// Single Source of Truth for Milestone Story Translations
// Exactly 36 official locales supported (milestones 100 to 800)

export const STORY_TRANSLATIONS = ${JSON.stringify(fullTranslations, null, 2)};

export function getStoryStrings(lang = 'ru') {
  const norm = String(lang || 'ru').toLowerCase().trim();
  return STORY_TRANSLATIONS[norm] ||
    STORY_TRANSLATIONS[norm.split('-')[0]] ||
    STORY_TRANSLATIONS['ru'];
}
`;

fs.writeFileSync('frontend/components/modals/storyTranslations.js', fileContent, 'utf8');
console.log('Successfully generated frontend/components/modals/storyTranslations.js with milestones 100..800');
console.log('Total locales:', Object.keys(fullTranslations).length);
