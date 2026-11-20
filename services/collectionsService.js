import { getUserFavorites, toggleFavoriteApi } from './api.js?v=386.0';
import { getInterfaceLanguage, getWordTranslation, getWordNotes } from './i18n.js?v=386.0';
import { isProActive } from './proState.js?v=386.0';
import { getPairWordKeys } from './confusablePairsData.js?v=386.0';

const STORAGE_KEY_CUSTOM_COLLECTIONS = 'myduo_custom_collections';
const STORAGE_KEY_ACTIVE_COLLECTION = 'myduo_active_collection_id';
const STORAGE_KEY_BUILTIN_OVERRIDES = 'myduo_builtin_collections_overrides';
export const IDIOMS_UNLOCK_STEP = 10;
export const PARTIAL_UNLOCK_COLLECTIONS = {
  idioms: { storageKey: 'myduo_idioms_unlocked_count', step: 10 },
  phrasal_verbs: { storageKey: 'myduo_phrasal_verbs_unlocked_count', step: 20 },
};

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
  'it_terms',
  'idioms',
]);

export const DOWNLOADABLE_PACK_COLLECTIONS = new Set([
  'verbs',
  'adjectives',
  'phrasal_verbs',
  'it_terms',
  'idioms',
]);

export function getCollectionUnlockStep(collectionId) {
  return PARTIAL_UNLOCK_COLLECTIONS[collectionId]?.step || 0;
}

export function getCollectionUnlockedCount(collectionId) {
  const cfg = PARTIAL_UNLOCK_COLLECTIONS[collectionId];
  if (!cfg || isProActive()) return Infinity;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = parseInt(localStorage.getItem(cfg.storageKey) || '0', 10);
      if (Number.isFinite(raw) && raw > 0) return raw;
    }
  } catch (e) {}
  return 0;
}

export function unlockMoreCollectionItems(collectionId, step) {
  const cfg = PARTIAL_UNLOCK_COLLECTIONS[collectionId];
  if (!cfg) return Infinity;
  const current = getCollectionUnlockedCount(collectionId);
  if (!Number.isFinite(current)) return current;
  const next = current + Math.max(1, Number(step) || cfg.step);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cfg.storageKey, String(next));
    }
  } catch (e) {}
  return next;
}

export function getIdiomsUnlockedCount() {
  return getCollectionUnlockedCount('idioms');
}

export function unlockMoreIdioms(step = IDIOMS_UNLOCK_STEP) {
  return unlockMoreCollectionItems('idioms', step);
}

export function isCollectionPackDownloaded(collectionId) {
  if (collectionId === 'it_terms') {
    return isProActive();
  }
  if (!DOWNLOADABLE_PACK_COLLECTIONS.has(collectionId)) return true;
  if (isProActive()) return true;
  if (PARTIAL_UNLOCK_COLLECTIONS[collectionId]) {
    return getCollectionUnlockedCount(collectionId) > 0;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`myduo_pack_downloaded_${collectionId}`) === 'true';
    }
  } catch (e) {}
  return false;
}

export function markCollectionPackDownloaded(collectionId) {
  if (PARTIAL_UNLOCK_COLLECTIONS[collectionId]) {
    if (getCollectionUnlockedCount(collectionId) <= 0) {
      unlockMoreCollectionItems(collectionId);
    }
    return;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`myduo_pack_downloaded_${collectionId}`, 'true');
    }
  } catch (e) {}
}

export const DOWNLOADABLE_PACK_I18N = {
  ru: {
    downloadBtn: 'Скачать',
    downloading: 'Скачивание...',
    itDesc: '200 ключевых IT-терминов с понятными объяснениями и озвучкой произношения.',
    idiomsDesc: '150 популярных английских идиом и поговорок с объяснением смысла и озвучкой.',
    verbsDesc: '100 самых популярных английских глаголов для повседневного общения с переводом и озвучкой.',
    adjectivesDesc: '100 базовых и выразительных прилагательных для точного описания с переводом и озвучкой.',
    phrasalVerbsDesc: '100 востребованных фразовых глаголов с понятными объяснениями, переводом и озвучкой.',
    watchAdHint: 'Откроется навсегда после короткого видео',
  },
  uk: {
    downloadBtn: 'Завантажити',
    downloading: 'Завантаження...',
    itDesc: '200 ключових IT-термінів із зрозумілими поясненнями та озвученням вимови.',
    idiomsDesc: '150 популярних англійських ідіом та приказок із поясненням змісту та озвученням.',
    verbsDesc: '100 найпопулярніших англійських дієслів для щоденного спілкування з перекладом та озвученням.',
    adjectivesDesc: '100 базових і виразних прикметників для точного опису з перекладом та озвученням.',
    phrasalVerbsDesc: '100 затребуваних фразових дієслів із зрозумілими поясненнями, перекладом та озвученням.',
    watchAdHint: 'Відкриється назавжди після короткого відео',
  },
  en: {
    downloadBtn: 'Download',
    downloading: 'Downloading...',
    itDesc: '200 essential IT terms with clear explanations and audio pronunciation.',
    idiomsDesc: '150 popular English idioms and proverbs with meaning explanations and audio.',
    verbsDesc: '100 most popular English verbs for everyday communication with translations and audio.',
    adjectivesDesc: '100 essential and expressive adjectives for vivid descriptions with translations and audio.',
    phrasalVerbsDesc: '100 high-frequency phrasal verbs with clear explanations, translations and audio.',
    watchAdHint: 'Unlocks permanently after a short video',
  },
  de: {
    downloadBtn: 'Herunterladen',
    downloading: 'Wird heruntergeladen...',
    itDesc: '200 wichtige IT-Begriffe mit klaren Erklärungen und Audio-Aussprache.',
    idiomsDesc: '150 beliebte englische Redewendungen und Sprichwörter mit Bedeutungserklärungen.',
    verbsDesc: 'Die 100 beliebtesten englischen Verben für den Alltag mit Übersetzung und Audio.',
    adjectivesDesc: '100 grundlegende und ausdrucksstarke Adjektive mit Übersetzung und Audio.',
    phrasalVerbsDesc: '100 häufige Phrasal Verbs mit klaren Erklärungen, Übersetzung und Audio.',
    watchAdHint: 'Wird nach einem kurzen Video dauerhaft freigeschaltet',
  },
  es: {
    downloadBtn: 'Descargar',
    downloading: 'Descargando...',
    itDesc: '200 términos clave de TI con explicaciones claras y pronunciación en audio.',
    idiomsDesc: '150 modismos y proverbios populares en inglés con explicación de su significado.',
    verbsDesc: 'Los 100 verbos más populares del inglés para el día a día con traducción y audio.',
    adjectivesDesc: '100 adjetivos esenciales y expresivos para describir con precisión, con traducción y audio.',
    phrasalVerbsDesc: '100 phrasal verbs muy usados con explicaciones claras, traducción y audio.',
    watchAdHint: 'Se desbloquea para siempre tras un breve video',
  },
  'es-mx': {
    downloadBtn: 'Descargar',
    downloading: 'Descargando...',
    itDesc: '200 términos clave de TI con explicaciones claras y pronunciación en audio.',
    idiomsDesc: '150 modismos y proverbios populares en inglés con explicación de su significado.',
    verbsDesc: 'Los 100 verbos más populares del inglés para el día a día con traducción y audio.',
    adjectivesDesc: '100 adjetivos esenciales y expresivos para describir con precisión, con traducción y audio.',
    phrasalVerbsDesc: '100 phrasal verbs muy usados con explicaciones claras, traducción y audio.',
    watchAdHint: 'Se desbloquea para siempre tras un breve video',
  },
  fr: {
    downloadBtn: 'Télécharger',
    downloading: 'Téléchargement...',
    itDesc: '200 termes IT essentiels avec des explications claires et la prononciation audio.',
    idiomsDesc: '150 expressions idiomatiques et proverbes anglais populaires avec explications.',
    verbsDesc: 'Les 100 verbes anglais les plus courants pour le quotidien avec traduction et audio.',
    adjectivesDesc: '100 adjectifs essentiels et expressifs pour des descriptions précises avec traduction et audio.',
    phrasalVerbsDesc: '100 verbes à particule indispensables avec explications claires, traduction et audio.',
    watchAdHint: 'Débloqué définitivement après une courte vidéo',
  },
  pl: {
    downloadBtn: 'Pobierz',
    downloading: 'Pobieranie...',
    itDesc: '200 kluczowych terminów IT z przystępnymi wyjaśnieniami i wymową audio.',
    idiomsDesc: '150 popularnych angielskich idiomów i przysłów z wyjaśnieniem znaczenia.',
    verbsDesc: '100 najpopularniejszych angielskich czasowników na co dzień z tłumaczeniem i lektorem.',
    adjectivesDesc: '100 podstawowych i wyrazistych przymiotników do trafnych opisów z tłumaczeniem i lektorem.',
    phrasalVerbsDesc: '100 często używanych czasowników frazowych z jasnymi objaśnieniami, tłumaczeniem i lektorem.',
    watchAdHint: 'Odblokowuje się na stałe po krótkim wideo',
  },
  tr: {
    downloadBtn: 'İndir',
    downloading: 'İndiriliyor...',
    itDesc: 'Açık açıklamalar ve sesli telaffuz ile 200 temel bilişim (IT) terimi.',
    idiomsDesc: 'Anlam açıklamaları ve seslendirmeyle 150 popüler İngilizce deyim ve atasözü.',
    verbsDesc: 'Günlük iletişim için çeviri ve seslendirmeyle en popüler 100 İngilizce fiil.',
    adjectivesDesc: 'Net betimlemeler için çeviri ve seslendirmeyle 100 temel ve güçlü sıfat.',
    phrasalVerbsDesc: 'Açık anlatım, çeviri ve seslendirmeyle en çok kullanılan 100 deyimsel fiil.',
    watchAdHint: 'Kısa bir videodan sonra kalıcı olarak açılır',
  },
  it: {
    downloadBtn: 'Scarica',
    downloading: 'Scaricamento...',
    itDesc: '200 termini IT essenziali con spiegazioni chiare e pronuncia audio.',
    idiomsDesc: '150 modi di dire e proverbi inglesi popolari con spiegazione del significato.',
    verbsDesc: 'I 100 verbi inglesi più usati nella vita quotidiana con traduzione e audio.',
    adjectivesDesc: '100 aggettivi essenziali ed espressivi per descrivere con precisione, con traduzione e audio.',
    phrasalVerbsDesc: '100 phrasal verbs molto richiesti con spiegazioni chiare, traduzione e audio.',
    watchAdHint: 'Si sblocca per sempre dopo un breve video',
  },
  ro: {
    downloadBtn: 'Descarcă',
    downloading: 'Se descarcă...',
    itDesc: '200 de termeni IT esențiali cu explicații clare și pronunție audio.',
    idiomsDesc: '150 de expresii idiomatice și proverbe englezești populare cu explicații.',
    verbsDesc: 'Cele mai populare 100 de verbe englezești pentru conversația zilnică, cu traducere și audio.',
    adjectivesDesc: '100 de adjective esențiale și expresive pentru descrieri precise, cu traducere și audio.',
    phrasalVerbsDesc: '100 de verbe frazale frecvente cu explicații clare, traducere și audio.',
    watchAdHint: 'Se deblochează permanent după un scurt videoclip',
  },
  bg: {
    downloadBtn: 'Изтегли',
    downloading: 'Изтегляне...',
    itDesc: '200 ключови ИТ термина с ясни обяснения и аудио произношение.',
    idiomsDesc: '150 популярни английски идиома и поговорки с обяснение на значението.',
    verbsDesc: '100-те най-популярни английски глагола за ежедневно общуване с превод и озвучаване.',
    adjectivesDesc: '100 основни и изразителни прилагателни за точно описание с превод и озвучаване.',
    phrasalVerbsDesc: '100 търсени фразови глагола с ясни обяснения, превод и озвучаване.',
    watchAdHint: 'Отключва се завинаги след кратко видео',
  },
  hu: {
    downloadBtn: 'Letöltés',
    downloading: 'Letöltés...',
    itDesc: '200 alapvető IT-kifejezés érthető magyarázattal és kiejtéssel.',
    idiomsDesc: '150 népszerű angol szólás és közmondás jelentésmagyarázattal.',
    verbsDesc: 'A 100 legnépszerűbb angol ige a mindennapi kommunikációhoz fordítással és hanggal.',
    adjectivesDesc: '100 alapvető és kifejező melléknév pontos leírásokhoz fordítással és hanggal.',
    phrasalVerbsDesc: '100 gyakori vonzatos ige érthető magyarázatokkal, fordítással és hanggal.',
    watchAdHint: 'Egy rövid videó után örökre feloldódik',
  },
  el: {
    downloadBtn: 'Λήψη',
    downloading: 'Λήψη...',
    itDesc: '200 βασικοί όροι πληροφορικής (IT) με σαφείς επεξηγήσεις και ηχητική προφορά.',
    idiomsDesc: '150 δημοφιλείς αγγλικοί ιδιωματισμοί και παροιμίες με επεξήγηση σημασίας.',
    verbsDesc: 'Τα 100 πιο δημοφιλή αγγλικά ρήματα για καθημερινή επικοινωνία με μετάφραση και ήχο.',
    adjectivesDesc: '100 βασικά και εκφραστικά επίθετα για ακριβείς περιγραφές με μετάφραση και ήχο.',
    phrasalVerbsDesc: '100 συνηθισμένα phrasal verbs με σαφείς εξηγήσεις, μετάφραση και ήχο.',
    watchAdHint: 'Ξεκλειδώνει μόνιμα μετά από ένα σύντομο βίντεο',
  },
  da: {
    downloadBtn: 'Download',
    downloading: 'Downloader...',
    itDesc: '200 vigtige IT-begreber med klare forklaringer og lydudtale.',
    idiomsDesc: '150 populære engelske talemåder og ordsprog med betydningsforklaring.',
    verbsDesc: 'De 100 mest populære engelske verber til hverdagen med oversættelse og lyd.',
    adjectivesDesc: '100 vigtige og udtryksfulde adjektiver til præcise beskrivelser med oversættelse og lyd.',
    phrasalVerbsDesc: '100 hyppige phrasal verbs med klare forklaringer, oversættelse og lyd.',
    watchAdHint: 'Låses permanent op efter en kort video',
  },
  lv: {
    downloadBtn: 'Lejupielādēt',
    downloading: 'Lejupielādē...',
    itDesc: '200 svarīgi IT termini ar skaidriem paskaidrojumiem un audio izrunu.',
    idiomsDesc: '150 populāras angļu valodas idiomas un sakāmvārdi ar nozīmes skaidrojumu.',
    verbsDesc: '100 populārākie angļu darbības vārdi ikdienas saziņai ar tulkojumu un izrunu.',
    adjectivesDesc: '100 būtiski un izteiksmīgi īpašības vārdi precīzam aprakstam ar tulkojumu un izrunu.',
    phrasalVerbsDesc: '100 bieži lietoti frāzu darbības vārdi ar skaidrojumiem, tulkojumu un izrunu.',
    watchAdHint: 'Atbloķējas uz visiem laikiem pēc īsa video',
  },
  lt: {
    downloadBtn: 'Atsisiųsti',
    downloading: 'Atsisiunčiama...',
    itDesc: '200 svarbiausi IT terminai su aiškiais paaiškinimais ir garso tarimu.',
    idiomsDesc: '150 populiarių anglų kalbos idiomų ir patarlių su reikšmės paaiškinimu.',
    verbsDesc: '100 populiariausių anglų veiksmažodžių kasdieniam bendravimui su vertimu ir įgarsinimu.',
    adjectivesDesc: '100 pagrindinių ir išraiškingų būdvardžių tiksliam apibūdinimui su vertimu ir įgarsinimu.',
    phrasalVerbsDesc: '100 dažnų frazinių veiksmažodžių su aiškiais paaiškinimais, vertimu ir įgarsinimu.',
    watchAdHint: 'Visam laikui atrakinama po trumpo vaizdo įrašo',
  },
  pt: {
    downloadBtn: 'Baixar',
    downloading: 'Baixando...',
    itDesc: '200 termos essenciais de TI com explicações claras e pronúncia em áudio.',
    idiomsDesc: '150 expressões idiomáticas e provérbios populares em inglês com explicação.',
    verbsDesc: 'Os 100 verbos ingleses mais populares para o dia a dia com tradução e áudio.',
    adjectivesDesc: '100 adjetivos essenciais e expressivos para descrições precisas com tradução e áudio.',
    phrasalVerbsDesc: '100 phrasal verbs muito usados com explicações claras, tradução e áudio.',
    watchAdHint: 'Desbloqueia para sempre após um vídeo curto',
  },
  'pt-br': {
    downloadBtn: 'Baixar',
    downloading: 'Baixando...',
    itDesc: '200 termos essenciais de TI com explicações claras e pronúncia em áudio.',
    idiomsDesc: '150 expressões idiomáticas e provérbios populares em inglês com explicação.',
    verbsDesc: 'Os 100 verbos em inglês mais populares para o dia a dia com tradução e áudio.',
    adjectivesDesc: '100 adjetivos essenciais e expressivos para descrições precisas com tradução e áudio.',
    phrasalVerbsDesc: '100 phrasal verbs mais usados com explicações claras, tradução e áudio.',
    watchAdHint: 'Desbloqueia para sempre após um vídeo curto',
  },
  sk: {
    downloadBtn: 'Stiahnuť',
    downloading: 'Sťahuje sa...',
    itDesc: '200 kľúčových IT pojmov so zrozumiteľným vysvetlením a výslovnosťou.',
    idiomsDesc: '150 obľúbených anglických idiómov a prísloví s vysvetlením významu.',
    verbsDesc: '100 najobľúbenejších anglických slovies na každý deň s prekladom a zvukom.',
    adjectivesDesc: '100 základných a výstižných prídavných mien na presný opis s prekladom a zvukom.',
    phrasalVerbsDesc: '100 žiadaných frázových slovies so zrozumiteľným vysvetlením, prekladom a zvukom.',
    watchAdHint: 'Odomkne sa navždy po krátkom videu',
  },
  sl: {
    downloadBtn: 'Prenesi',
    downloading: 'Prenašanje...',
    itDesc: '200 ključnih IT-izrazov z jasnimi razlagami in zvočno izgovorjavo.',
    idiomsDesc: '150 priljubljenih angleških idiomov in pregovorov z razlago pomena.',
    verbsDesc: '100 najbolj priljubljenih angleških glagolov za vsakdanjo rabo s prevodom in zvokom.',
    adjectivesDesc: '100 osnovnih in izraznih pridevnikov za natančne opise s prevodom in zvokom.',
    phrasalVerbsDesc: '100 pogostih fraznih glagolov z jasnimi razlagami, prevodom in zvokom.',
    watchAdHint: 'Trajno se odklene po kratkem videu',
  },
  fi: {
    downloadBtn: 'Lataa',
    downloading: 'Ladataan...',
    itDesc: '200 keskeistä IT-termiä selkeillä selityksillä ja ääntämyksellä.',
    idiomsDesc: '150 suosittua englannin idiomia ja sananlaskua merkityksen selityksellä.',
    verbsDesc: '100 suosituinta englannin verbiä arkipäivän viestintään käännöksellä ja ääntämyksellä.',
    adjectivesDesc: '100 keskeistä ja ilmeikästä adjektiivia tarkkaan kuvailuun käännöksellä ja ääntämyksellä.',
    phrasalVerbsDesc: '100 yleistä fraasiverbiä selkeillä selityksillä, käännöksellä ja ääntämyksellä.',
    watchAdHint: 'Avautuu pysyvästi lyhyen videon jälkeen',
  },
  hr: {
    downloadBtn: 'Preuzmi',
    downloading: 'Preuzimanje...',
    itDesc: '200 ključnih IT pojmova s jasnim objašnjenjima i zvučnim izgovorom.',
    idiomsDesc: '150 popularnih engleskih idioma i poslovica s objašnjenjem značenja.',
    verbsDesc: '100 najpopularnijih engleskih glagola za svakodnevnu komunikaciju s prijevodom i zvukom.',
    adjectivesDesc: '100 osnovnih i izražajnih pridjeva za precizne opise s prijevodom i zvukom.',
    phrasalVerbsDesc: '100 traženih fraznih glagola s jasnim objašnjenjima, prijevodom i zvukom.',
    watchAdHint: 'Trajno se otključava nakon kratkog videa',
  },
  cs: {
    downloadBtn: 'Stáhnout',
    downloading: 'Stahování...',
    itDesc: '200 klíčových IT pojmů se srozumitelným vysvětlením a výslovností.',
    idiomsDesc: '150 oblíbených anglických idiomů a přísloví s vysvětlením významu.',
    verbsDesc: '100 nejoblíbenějších anglických sloves pro každodenní komunikaci s překladem a zvukem.',
    adjectivesDesc: '100 základních a výstižných přídavných jmen pro přesný popis s překladem a zvukem.',
    phrasalVerbsDesc: '100 žádaných frázových sloves s jasným vysvětlením, překladem a zvukem.',
    watchAdHint: 'Odemkne se navždy po krátkém videu',
  },
  sv: {
    downloadBtn: 'Ladda ner',
    downloading: 'Laddar ner...',
    itDesc: '200 viktiga IT-termer med tydliga förklaringar och ljuduttal.',
    idiomsDesc: '150 populära engelska idiom och ordspråk med betydelseförklaring.',
    verbsDesc: 'De 100 mest populära engelska verben för vardagen med översättning och ljud.',
    adjectivesDesc: '100 viktiga och uttrycksfulla adjektiv för träffsäkra beskrivningar med översättning och ljud.',
    phrasalVerbsDesc: '100 vanliga partikelverb med tydliga förklaringar, översättning och ljud.',
    watchAdHint: 'Låses upp permanent efter en kort video',
  },
  et: {
    downloadBtn: 'Laadi alla',
    downloading: 'Allalaadimine...',
    itDesc: '200 olulist IT-terminit selgete selgituste ja hääldusega.',
    idiomsDesc: '150 populaarset inglise idioomi ja vanasõna tähenduse selgitusega.',
    verbsDesc: '100 populaarseimat inglise tegusõna igapäevaseks suhtluseks koos tõlke ja hääldusega.',
    adjectivesDesc: '100 olulist ja ilmekat omadussõna täpseks kirjeldamiseks koos tõlke ja hääldusega.',
    phrasalVerbsDesc: '100 enimkasutatavat ühendverbi selgete selgituste, tõlke ja hääldusega.',
    watchAdHint: 'Avaneb püsivalt pärast lühikest videot',
  },
  hi: {
    downloadBtn: 'डाउनलोड करें',
    downloading: 'डाउनलोड हो रहा है...',
    itDesc: 'आसान व्याख्या और ऑडियो उच्चारण के साथ 200 प्रमुख IT शब्द।',
    idiomsDesc: 'अर्थ की व्याख्या और ऑडियो के साथ 150 लोकप्रिय अंग्रेज़ी मुहावरे और कहावतें।',
    verbsDesc: 'रोज़मर्रा की बातचीत के लिए अनुवाद और ऑडियो के साथ 100 सबसे लोकप्रिय अंग्रेज़ी क्रियाएँ।',
    adjectivesDesc: 'सटीक वर्णन के लिए अनुवाद और ऑडियो के साथ 100 आवश्यक और प्रभावशाली विशेषण।',
    phrasalVerbsDesc: 'स्पष्ट व्याख्या, अनुवाद और ऑडियो के साथ 100 उपयोगी फ़्रेज़ल वर्ब्स।',
    watchAdHint: 'एक छोटे वीडियो के बाद हमेशा के लिए अनलॉक हो जाएगा',
  },
  bn: {
    downloadBtn: 'ডাউনলোড করুন',
    downloading: 'ডাউনলোড হচ্ছে...',
    itDesc: 'সহজ ব্যাখ্যা ও অডিও উচ্চারণসহ ১৮৭টি গুরুত্বপূর্ণ IT শব্দ।',
    idiomsDesc: 'অর্থের ব্যাখ্যা ও অডিওসহ ১৫০টি জনপ্রিয় ইংরেজি বাগধারা ও প্রবাদ।',
    verbsDesc: 'দৈনন্দিন কথোপকথনের জন্য অনুবাদ ও অডিওসহ ১০০টি সবচেয়ে জনপ্রিয় ইংরেজি ক্রিয়া।',
    adjectivesDesc: 'সঠিক বর্ণনার জন্য অনুবাদ ও অডিওসহ ১০০টি প্রয়োজনীয় ও প্রাণবন্ত বিশেষণ।',
    phrasalVerbsDesc: 'স্পষ্ট ব্যাখ্যা, অনুবাদ ও অডিওসহ ১০০টি বহুল ব্যবহৃত ফ্রেজাল ভার্ব।',
    watchAdHint: 'একটি সংক্ষিপ্ত ভিডিওর পর স্থায়ীভাবে আনলক হবে',
  },
  ar: {
    downloadBtn: 'تنزيل',
    downloading: 'جارٍ التنزيل...',
    itDesc: '200 مصطلح أساسي في تقنية المعلومات (IT) مع شرح واضح ونطق صوتي.',
    idiomsDesc: '150 من أشهر التعابير الاصطلاحية والأمثال الإنجليزية مع شرح المعنى والنطق.',
    verbsDesc: '100 من أشهر الأفعال الإنجليزية للتواصل اليومي مع الترجمة والنطق الصوتي.',
    adjectivesDesc: '100 صفة أساسية ومعبّرة للوصف الدقيق مع الترجمة والنطق الصوتي.',
    phrasalVerbsDesc: '100 فعل مركب شائع مع شروحات واضحة وترجمة ونطق صوتي.',
    watchAdHint: 'يُفتح بشكل دائم بعد فيديو قصير',
  },
  fa: {
    downloadBtn: 'دانلود',
    downloading: 'در حال دانلود...',
    itDesc: '۱۸۷ اصطلاح کلیدی فناوری اطلاعات (IT) با توضیحات روشن و تلفظ صوتی.',
    idiomsDesc: '۱۵۰ اصطلاح و ضرب‌المثل پرکاربرد انگلیسی همراه با توضیح معنا و تلفظ.',
    verbsDesc: '۱۰۰ فعل پرکاربرد انگلیسی برای مکالمه روزمره با ترجمه و تلفظ صوتی.',
    adjectivesDesc: '۱۰۰ صفت ضروری و گویا برای توصیف دقیق با ترجمه و تلفظ صوتی.',
    phrasalVerbsDesc: '۱۰۰ فعل عبارتی پرطرفدار با توضیح روشن، ترجمه و تلفظ صوتی.',
    watchAdHint: 'پس از یک ویدیوی کوتاه برای همیشه باز می‌شود',
  },
  ur: {
    downloadBtn: 'ڈاؤن لوڈ کریں',
    downloading: 'ڈاؤن لوڈ ہو رہا ہے...',
    itDesc: 'واضح تشریح اور آڈیو تلفظ کے ساتھ 200 اہم آئی ٹی (IT) اصطلاحات۔',
    idiomsDesc: 'مفہوم کی وضاحت اور آڈیو کے ساتھ 150 مشہور انگریزی محاورے اور ضرب الامثال۔',
    verbsDesc: 'روزمرہ گفتگو کے لیے ترجمے اور آڈیو کے ساتھ 100 مقبول ترین انگریزی افعال۔',
    adjectivesDesc: 'درست بیان کے لیے ترجمے اور آڈیو کے ساتھ 100 بنیادی اور مؤثر صفات۔',
    phrasalVerbsDesc: 'واضح تشریح، ترجمے اور آڈیو کے ساتھ 100 اہم فریزل وربز۔',
    watchAdHint: 'ایک مختصر ویڈیو کے بعد ہمیشہ کے لیے کھل جائے گا',
  },
  id: {
    downloadBtn: 'Unduh',
    downloading: 'Mengunduh...',
    itDesc: '200 istilah TI penting dengan penjelasan jelas dan audio pelafalan.',
    idiomsDesc: '150 idiom dan peribahasa bahasa Inggris populer dengan penjelasan makna.',
    verbsDesc: '100 kata kerja bahasa Inggris paling populer untuk percakapan sehari-hari dengan terjemahan dan audio.',
    adjectivesDesc: '100 kata sifat penting dan ekspresif untuk deskripsi tepat dengan terjemahan dan audio.',
    phrasalVerbsDesc: '100 phrasal verb yang sering dipakai dengan penjelasan jelas, terjemahan, dan audio.',
    watchAdHint: 'Terbuka permanen setelah video singkat',
  },
  vi: {
    downloadBtn: 'Tải xuống',
    downloading: 'Đang tải xuống...',
    itDesc: '200 thuật ngữ CNTT quan trọng kèm giải thích dễ hiểu và phát âm chuẩn.',
    idiomsDesc: '150 thành ngữ và tục ngữ tiếng Anh phổ biến kèm giải thích ý nghĩa.',
    verbsDesc: '100 động từ tiếng Anh phổ biến nhất cho giao tiếp hằng ngày kèm nghĩa và phát âm.',
    adjectivesDesc: '100 tính từ thiết yếu và giàu sắc thái để miêu tả chuẩn xác kèm nghĩa và phát âm.',
    phrasalVerbsDesc: '100 cụm động từ thông dụng kèm giải thích dễ hiểu, nghĩa tiếng Việt và phát âm.',
    watchAdHint: 'Mở khóa vĩnh viễn sau một video ngắn',
  },
  th: {
    downloadBtn: 'ดาวน์โหลด',
    downloading: 'กำลังดาวน์โหลด...',
    itDesc: '200 คำศัพท์ไอทีสำคัญพร้อมคำอธิบายที่เข้าใจง่ายและเสียงอ่าน',
    idiomsDesc: '150 สำนวนและสุภาษิตภาษาอังกฤษยอดนิยมพร้อมคำอธิบายความหมาย',
    verbsDesc: '100 คำกริยาภาษาอังกฤษยอดนิยมสำหรับการสื่อสารประจำวัน พร้อมคำแปลและเสียงอ่าน',
    adjectivesDesc: '100 คำคุณศัพท์พื้นฐานที่สื่อความหมายชัดเจน พร้อมคำแปลและเสียงอ่าน',
    phrasalVerbsDesc: '100 กริยาวลีที่ใช้บ่อย พร้อมคำอธิบายเข้าใจง่าย คำแปล และเสียงอ่าน',
    watchAdHint: 'ปลดล็อกถาวรหลังดูวิดีโอสั้นๆ',
  },
  ko: {
    downloadBtn: '다운로드',
    downloading: '다운로드 중...',
    itDesc: '명확한 설명과 원어민 발음이 포함된 핵심 IT 용어 200개.',
    idiomsDesc: '의미 설명과 음성 발음이 포함된 인기 영어 관용구 및 속담 150선.',
    verbsDesc: '일상 대화에 꼭 필요한 인기 영어 동사 100개를 번역과 음성으로 학습하세요.',
    adjectivesDesc: '정확한 묘사를 위한 핵심 형용사 100개를 번역과 음성으로 학습하세요.',
    phrasalVerbsDesc: '자주 쓰이는 구동사 100개를 쉬운 설명, 번역, 음성과 함께 익히세요.',
    watchAdHint: '짧은 광고 시청 후 영구적으로 잠금 해제됩니다',
  },
  ja: {
    downloadBtn: 'ダウンロード',
    downloading: 'ダウンロード中...',
    itDesc: '分かりやすい解説と音声発音付きの重要IT用語200語。',
    idiomsDesc: '意味の解説と音声付きの定番英語イディオム＆ことわざ150選。',
    verbsDesc: '日常会話でよく使う人気の英語動詞100語を、日本語訳と音声付きで学べます。',
    adjectivesDesc: '的確な表現に役立つ基本＆豊かな形容詞100語を、日本語訳と音声付きで収録。',
    phrasalVerbsDesc: '頻出の句動詞100語を、わかりやすい解説・日本語訳・音声付きで学べます。',
    watchAdHint: '短い動画の視聴後に永久に解放されます',
  },
  zh: {
    downloadBtn: '下载',
    downloading: '正在下载...',
    itDesc: '200 个核心 IT 术语，配有清晰释义与标准发音。',
    idiomsDesc: '150 个常用英语习语与谚语，配有含义解析与发音。',
    verbsDesc: '精选 100 个日常高频英语动词，配有中文释义和标准发音。',
    adjectivesDesc: '100 个核心且富有表现力的形容词，配有中文释义和标准发音。',
    phrasalVerbsDesc: '100 个常用短语动词，配有清晰讲解、中文释义和标准发音。',
    watchAdHint: '观看简短视频后永久解锁',
  },
  kk: {
    downloadBtn: 'Жүктеп алу',
    downloading: 'Жүктелуде...',
    itDesc: 'Түсінікті түсіндірмесі мен дыбысталуы бар 200 негізгі IT термині.',
    idiomsDesc: 'Мағынасы түсіндірілген және дыбысталған 150 танымал ағылшын идиомасы мен мақалы.',
    verbsDesc: 'Күнделікті сөйлесуге арналған аудармасы мен дыбысы бар ең танымал 100 ағылшын етістігі.',
    adjectivesDesc: 'Дәл сипаттауға арналған аудармасы мен дыбысы бар 100 негізгі және мәнерлі сын есім.',
    phrasalVerbsDesc: 'Түсінікті анықтамасы, аудармасы және дыбысы бар 100 жиі қолданылатын фразалық етістік.',
    watchAdHint: 'Қысқа видеодан кейін біржола ашылады',
  },
};

export function getDownloadablePackStrings(lang = null) {
  const currentLang = (lang || getInterfaceLanguage() || 'ru').toLowerCase().trim();
  return DOWNLOADABLE_PACK_I18N[currentLang] || DOWNLOADABLE_PACK_I18N[currentLang.split('-')[0]] || DOWNLOADABLE_PACK_I18N.en;
}

function getBuiltinOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUILTIN_OVERRIDES);
    const parsed = raw ? JSON.parse(raw) : {};
    if (localStorage.getItem('myduo_it_idioms_override_clean_v1') !== '1') {
      let changed = false;
      if (Array.isArray(parsed.it_terms) && parsed.it_terms.length > 0 && parsed.it_terms.length < 200) {
        delete parsed.it_terms;
        changed = true;
      }
      if (Array.isArray(parsed.idioms) && parsed.idioms.length > 0 && parsed.idioms.length < 150) {
        delete parsed.idioms;
        changed = true;
      }
      localStorage.setItem('myduo_it_idioms_override_clean_v1', '1');
      if (changed) {
        localStorage.setItem(STORAGE_KEY_BUILTIN_OVERRIDES, JSON.stringify(parsed));
      }
    }
    return parsed;
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
          "lv": "Mani favorīti",
          "lt": "Mano mėgstamiausi",
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
          "ja": "お気に入り",
          "bn": "আমার পছন্দসমূহ",
          "fa": "علاقه‌مندی‌های من",
          "zh": "我的收藏",
          "ur": "میرے پسندیدہ",
          "kk": "Менің таңдаулыларым"
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
          "lv": "Mēneši",
          "lt": "Mėnesiai",
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
          "ja": "月",
          "bn": "মাসসমূহ",
          "fa": "ماه‌ها",
          "zh": "月份",
          "ur": "مہینے",
          "kk": "Айлар"
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
          "lv": "Nedēļas dienas",
          "lt": "Savaitės dienos",
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
          "ja": "曜日",
          "bn": "সপ্তাহের দিন",
          "fa": "روزهای هفته",
          "zh": "星期",
          "ur": "ہفتے کے دن",
          "kk": "Апта күндері"
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
          "lv": "Krāsas",
          "lt": "Spalvos",
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
          "ja": "色",
          "bn": "রং",
          "fa": "رنگ‌ها",
          "zh": "颜色",
          "ur": "رنگ",
          "kk": "Түстер"
    },
    wordKeys: [
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown',
      'grey', 'beige', 'silver', 'navy', 'olive', 'coral', 'peach', 'bronze', 'cream', 'golden'
    ],
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
          "lv": "Skaitļi",
          "lt": "Skaičiai",
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
          "ja": "数字",
          "bn": "সংখ্যা",
          "fa": "اعداد",
          "zh": "数字",
          "ur": "نمبرز",
          "kk": "Сандар"
    },
    wordKeys: [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
      'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million'
    ],
  },
  {
    id: 'ordinal_numbers',
    isBuiltin: true,
    icon: '🥇',
    name: {
          "ru": "Порядковые числа",
          "uk": "Порядкові числівники",
          "en": "Ordinal numbers",
          "de": "Ordnungszahlen",
          "es": "Números ordinales",
          "fr": "Nombres ordinaux",
          "pl": "Liczebniki porządkowe",
          "tr": "Sıra sayıları",
          "it": "Numeri ordinali",
          "ro": "Numere ordinale",
          "bg": "Редни числителни",
          "hu": "Sorszámnevek",
          "el": "Τακτικοί αριθμοί",
          "da": "Ordenstal",
          "lv": "Kārtas skaitļa vārdi",
          "lt": "Kelintiniai skaitvardžiai",
          "pt": "Números ordinais",
          "sk": "Radové číslovky",
          "sl": "Vrstilni števniki",
          "fi": "Järjestysluvut",
          "hr": "Redni brojevi",
          "cs": "Řadové číslovky",
          "sv": "Ordningstal",
          "et": "Järgarvud",
          "hi": "क्रमवाचक संख्याएं",
          "ar": "الأعداد الترتيبية",
          "id": "Bilangan bertingkat",
          "vi": "Số thứ tự",
          "th": "เลขลำดับที่",
          "ko": "서수",
          "ja": "序数",
          "bn": "ক্রমবাচক সংখ্যা",
          "fa": "اعداد ترتیبی",
          "zh": "序数词",
          "ur": "ترتیبی اعداد",
          "kk": "Реттік сан есімдер"
    },
    wordKeys: [
      'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
      'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'
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
          "lv": "Ķermeņa daļas",
          "lt": "Kūno dalys",
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
          "ja": "体の部位",
          "bn": "শরীরের অঙ্গ",
          "fa": "اعضای بدن",
          "zh": "身体部位",
          "ur": "جسم کے اعضاء",
          "kk": "Дене мүшелері"
    },
    wordKeys: [
      'head', 'arm', 'leg', 'hand', 'foot', 'feet', 'eye', 'ear', 'nose', 'mouth',
      'heart', 'finger', 'tooth', 'teeth', 'hair', 'face', 'back', 'shoulder', 'neck',
      'brain', 'skin', 'blood', 'bone', 'knee', 'chest', 'stomach', 'lip', 'tongue', 'throat',
      'chin', 'cheek', 'forehead', 'eyebrow', 'jaw', 'wrist', 'elbow', 'ankle', 'heel', 'toe',
      'thumb', 'palm', 'nail', 'hip', 'lung', 'liver', 'muscle', 'nerve', 'skull', 'beard', 'belly'
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
          "lv": "Sports",
          "lt": "Sportas",
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
          "ja": "スポーツ",
          "bn": "খেলাধুলা",
          "fa": "ورزش",
          "zh": "体育运动",
          "ur": "کھیل",
          "kk": "Спорт"
    },
    wordKeys: [
      'football', 'basketball', 'tennis', 'baseball', 'hockey', 'golf', 'skiing', 'run', 'running', 'swimming',
      'swim', 'ball', 'match', 'team', 'game', 'player', 'coach', 'champion', 'championship', 'tournament',
      'fitness', 'gym', 'workout', 'race', 'score', 'goal', 'medal', 'stadium', 'athlete', 'sport'
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
          "lv": "Ēdiens un dzērieni",
          "lt": "Maistas ir gėrimai",
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
          "ja": "食べ物と飲み物",
          "bn": "খাবার",
          "fa": "غذا",
          "zh": "美食与餐饮",
          "ur": "کھانا اور مشروبات",
          "kk": "Тағам мен сусындар"
    },
    wordKeys: [
      'bread', 'water', 'tea', 'coffee', 'milk', 'meat', 'cheese', 'pizza', 'fish', 'sugar',
      'egg', 'eggs', 'fruit', 'vegetable', 'soup', 'rice', 'apple', 'banana', 'orange',
      'chicken', 'butter', 'cake', 'salt', 'juice', 'beer', 'wine', 'potato', 'tomato',
      'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant',
      'beef', 'pork', 'salad', 'sandwich', 'pasta', 'sauce', 'oil', 'pepper', 'onion',
      'garlic', 'carrot', 'lemon', 'grape', 'pear', 'honey', 'chocolate'
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
          "lv": "Apģērbs",
          "lt": "Drabužiai",
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
          "ja": "服",
          "bn": "পোশাক",
          "fa": "لباس",
          "zh": "服饰与穿搭",
          "ur": "لباس اور کپڑے",
          "kk": "Киім-кешек"
    },
    wordKeys: [
      'shirt', 'shoes', 'shoe', 'pants', 'dress', 'coat', 'hat', 'jacket', 'socks', 'suit',
      'boots', 'skirt', 'jeans', 't-shirt', 'wear', 'belt', 'gloves', 'scarf', 'cap', 'uniform', 'tie',
      'sweater', 'trousers', 'underwear', 'sneakers', 'slippers', 'sock', 'glove', 'boot',
      'pocket', 'button', 'sleeve', 'collar', 'zipper', 'outfit', 'costume', 'clothing',
      'cloth', 'fabric', 'cotton', 'wool', 'silk', 'leather', 'fur', 'bag', 'purse',
      'wallet', 'watch', 'ring', 'necklace'
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
          "lv": "Dzīvnieki",
          "lt": "Gyvūnai",
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
          "ja": "動物",
          "bn": "প্রাণী",
          "fa": "حیوانات",
          "zh": "动物世界",
          "ur": "جانور",
          "kk": "Жануарлар"
    },
    wordKeys: [
      'dog', 'cat', 'bird', 'horse', 'fish', 'bear', 'lion', 'wolf', 'elephant', 'tiger',
      'monkey', 'mouse', 'rabbit', 'duck', 'sheep', 'cow', 'pig', 'animal', 'pet', 'snake',
      'fox', 'deer', 'eagle', 'whale', 'dolphin', 'shark',
      'frog', 'turtle', 'bee', 'spider', 'fly', 'mosquito', 'insect', 'bug', 'chicken', 'hen',
      'turkey', 'goat', 'bat', 'rat', 'owl', 'crow', 'seal', 'crab', 'bull', 'lamb',
      'dove', 'salmon', 'trout', 'squid'
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
          "lv": "Biežāk lietotie darbības vārdi",
          "lt": "Populiarūs veiksmažodžiai",
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
          "ja": "よく使われる動詞",
          "bn": "ক্রিয়াপদ",
          "fa": "افعال",
          "zh": "常用动词",
          "ur": "اہم افعال",
          "kk": "Жиі қолданылатын етістіктер"
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
          "lv": "Īpašības vārdi",
          "lt": "Būdvardžiai",
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
          "ja": "形容詞",
          "bn": "বিশেষণ",
          "fa": "صفات",
          "zh": "常用形容词",
          "ur": "اہم صفات",
          "kk": "Сын есімдер"
    },
    wordKeys: [
      'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old',
      'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young',
      'important', 'few', 'public', 'bad', 'same', 'able', 'free', 'easy', 'strong',
      'true', 'clear', 'full', 'whole', 'real', 'hard', 'poor', 'best', 'special',
      'simple', 'fine', 'sure', 'dark', 'short', 'major', 'happy', 'serious', 'ready',
      'hot', 'cold', 'beautiful', 'bright', 'clean', 'deep', 'fast', 'heavy', 'kind',
      'nice', 'rich', 'safe', 'sweet', 'warm',
      'possible', 'local', 'national', 'personal', 'private', 'common', 'general', 'main',
      'single', 'open', 'closed', 'wrong', 'final', 'natural', 'modern', 'popular', 'famous',
      'foreign', 'similar', 'available', 'necessary', 'useful', 'helpful', 'effective',
      'successful', 'powerful', 'dangerous', 'difficult', 'impossible', 'expensive', 'cheap',
      'quick', 'slow', 'quiet', 'loud', 'soft', 'wet', 'dry', 'dirty', 'empty'
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
          "lv": "Frāzālie darbības vārdi",
          "lt": "Fraziniai veiksmažodžiai",
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
          "ja": "句動詞",
          "bn": "Phrasal Verbs",
          "fa": "افعال عبارتی",
          "zh": "短语动词",
          "ur": "مرکب افعال",
          "kk": "Тіркесті етістіктер"
    },
    wordKeys: [
      'have to', 'get in', 'get on', 'turn on', 'turn off', 'wake up', 'get up', 'come in',
      'go on', 'find out', 'set up', 'take off', 'pick up', 'put on', 'look at', 'look after',
      'carry on', 'bring up', 'run out', 'break down', 'check in', 'check out', 'calm down',
      'come back', 'figure out', 'get along', 'hang out', 'hold on', 'keep up', 'make up',
      'point out', 'run into', 'show up', 'slow down', 'work out', 'look for', 'give up',
      'give back', 'bring back', 'stand up', 'sit down', 'go out', 'go back', 'try on',
      'call back', 'call off', 'grow up', 'deal with', 'come across', 'break up', 'call on',
      'run away', 'hurry up', 'pay back', 'look out', 'cheer up', 'look up to', 'look over',
      'let go', 'end up', 'catch up', 'get rid of', 'fill out', 'keep on', 'come on',
      'get back', 'get out', 'take back', 'break out', 'cut off', 'turn up', 'turn down',
      'put away', 'throw away', 'throw out', 'look into', 'go through', 'set off', 'move on',
      'lash out', 'look back', 'stand out', 'drop out', 'drop off', 'come over', 'head out',
      'drop in', 'save up', 'plug in', 'look forward to', 'rely on', 'depend on', 'focus on',
      'concentrate on', 'insist on', 'wait for', 'search for', 'apply for', 'ask for', 'care for'
    ],
  },
  {
    "id": "it_terms",
    "isBuiltin": true,
    "icon": "💻",
    "name": {
        "ru": "IT и разработка",
        "uk": "IT та розробка",
        "en": "IT & Tech",
        "de": "IT & Entwicklung",
        "es": "TI y Desarrollo",
        "fr": "IT & Développement",
        "pl": "IT i Technologie",
        "tr": "Bilişim ve Yazılım",
        "it": "IT e Sviluppo",
        "ro": "IT și Dezvoltare",
        "bg": "ИТ и разработка",
        "hu": "IT és Fejlesztés",
        "el": "IT & Ανάπτυξη",
        "da": "IT & Udvikling",
        "lv": "IT un izstrāde",
        "lt": "IT ir programavimas",
        "pt": "TI e Tecnologia",
        "sk": "IT a vývoj",
        "sl": "IT in razvoj",
        "fi": "IT ja ohjelmointi",
        "hr": "IT i tehnologija",
        "cs": "IT a vývoj",
        "sv": "IT & utveckling",
        "et": "IT ja arendus",
        "hi": "आईटी और टेक",
        "bn": "আইটি ও প্রযুক্তি",
        "ar": "تكنولوجيا المعلومات والبرمجة",
        "fa": "فناوری اطلاعات و توسعه",
        "ur": "آئی ٹی اور ٹیکنالوجی",
        "id": "TI & Teknologi",
        "vi": "CNTT & Phát triển",
        "th": "ไอทีและการพัฒนา",
        "ko": "IT 및 개발",
        "ja": "IT・テクノロジー",
        "zh": "IT与开发",
        "kk": "IT және бағдарламалау"
    },
    "wordKeys": [
        "abstraction",
        "accuracy",
        "affordance",
        "aggregation",
        "agile",
        "algorithm",
        "alignment",
        "analytics",
        "anomaly",
        "architecture",
        "argument",
        "array",
        "assessment",
        "asset",
        "asynchronous",
        "attribution",
        "authentication",
        "authorization",
        "avatar",
        "backend",
        "backlog",
        "badge",
        "banner",
        "benchmark",
        "blocker",
        "boilerplate",
        "bottleneck",
        "branch",
        "breakpoint",
        "bug",
        "burnout",
        "button",
        "cache",
        "candidate",
        "canvas",
        "capacity",
        "carousel",
        "challenge",
        "checkout",
        "churn",
        "classification",
        "client",
        "cohort",
        "commit",
        "compensation",
        "compiler",
        "concurrency",
        "container",
        "contrast",
        "conversion",
        "correlation",
        "dashboard",
        "database",
        "dataset",
        "deadline",
        "debugger",
        "deliverable",
        "dependency",
        "deploy",
        "deployment",
        "deprecated",
        "dimension",
        "dropdown",
        "encapsulation",
        "endpoint",
        "environment",
        "epic",
        "estimation",
        "event",
        "exception",
        "experience",
        "feature",
        "feedback",
        "firewall",
        "font",
        "footer",
        "framework",
        "frontend",
        "fullstack",
        "funnel",
        "gateway",
        "gradient",
        "grid",
        "header",
        "hierarchy",
        "hotfix",
        "hypothesis",
        "icon",
        "impediment",
        "incident",
        "index",
        "inference",
        "inheritance",
        "interaction",
        "interface",
        "interpreter",
        "interview",
        "issue",
        "kanban",
        "lakehouse",
        "latency",
        "layout",
        "legacy",
        "library",
        "logging",
        "metric",
        "microservice",
        "middleware",
        "migration",
        "milestone",
        "mockup",
        "modal",
        "model",
        "module",
        "monolith",
        "navigation",
        "offer",
        "onboarding",
        "package",
        "palette",
        "parameter",
        "patch",
        "payload",
        "pipeline",
        "polymorphism",
        "popup",
        "postmortem",
        "precision",
        "prediction",
        "probation",
        "production",
        "promotion",
        "protocol",
        "prototype",
        "proxy",
        "query",
        "queue",
        "recall",
        "recruiter",
        "refactor",
        "regression",
        "repository",
        "requirement",
        "resolution",
        "responsive",
        "retention",
        "retrospective",
        "roadmap",
        "rollback",
        "runtime",
        "salary",
        "scaffolding",
        "schema",
        "scrum",
        "security",
        "segmentation",
        "server",
        "serverless",
        "sidebar",
        "slider",
        "spacing",
        "sprint",
        "stack",
        "staging",
        "stakeholder",
        "standup",
        "streaming",
        "synchronous",
        "syntax",
        "telemetry",
        "throughput",
        "thumbnail",
        "ticket",
        "toggle",
        "tooltip",
        "trade-off",
        "typography",
        "usability",
        "vector",
        "velocity",
        "version",
        "viewport",
        "vulnerability",
        "warehouse",
        "waterfall",
        "whitespace",
        "wireframe",
      "webhook",
      "idempotency",
      "serialization",
      "sharding",
      "observability",
      "throttling",
      "containerization",
      "backpressure",
      "orchestration",
      "partitioning",
      "canary",
      "deadlock",
      "sandbox"
    ]
  },
  {
    "id": "idioms",
    "isBuiltin": true,
    "icon": "💬",
    "name": {
      "ru": "Идиомы и поговорки",
      "uk": "Ідіоми та приказки",
      "en": "Idioms & Proverbs",
      "de": "Redewendungen & Sprichwörter",
      "es": "Modismos y proverbios",
      "es-mx": "Modismos y proverbios",
      "fr": "Idiomes et proverbes",
      "pl": "Idiomy i przysłowia",
      "tr": "Deyimler ve Atasözleri",
      "it": "Modi di dire e proverbi",
      "ro": "Idiomuri și proverbe",
      "bg": "Идиоми и поговорки",
      "hu": "Idiómák és közmondások",
      "el": "Ιδιωματισμοί και παροιμίες",
      "da": "Idiotiske vendinger og ordsprog",
      "lv": "Idiomas un sakāmvārdi",
      "lt": "Idiomos ir patarlės",
      "pt": "Expressões e provérbios",
      "pt-br": "Expressões e provérbios",
      "sk": "Idiómy a príslovia",
      "sl": "Idiomi in pregovori",
      "fi": "Idioomit ja sananlaskut",
      "hr": "Fraze i poslovice",
      "cs": "Idiomy a přísloví",
      "sv": "Idiom och ordspråk",
      "et": "Idioomid ja vanasõnad",
      "hi": "मुहावरे और कहावतें",
      "bn": "বাগধারা ও প্রবাদ",
      "ar": "التعابير الاصطلاحية والأمثال",
      "fa": "اصطلاحات و ضرب‌المثل‌ها",
      "ur": "محاورے اور ضرب الامثال",
      "id": "Idiom & Peribahasa",
      "vi": "Thành ngữ và tục ngữ",
      "th": "สำนวนและสุภาษิต",
      "ko": "관용구 및 속담",
      "ja": "慣用句とことわざ",
      "zh": "成语与习语",
      "kk": "Тұрақты тіркестер мен мақалдар"
    },
    "wordKeys": [
      "actions speak louder than words",
      "back to the drawing board",
      "barking up the wrong tree",
      "beat around the bush",
      "best of both worlds",
      "better late than never",
      "bite the bullet",
      "blessing in disguise",
      "break a leg",
      "break the bank",
      "break the ice",
      "burn bridges",
      "burn the midnight oil",
      "by the book",
      "call it a day",
      "call the shots",
      "cost an arm and a leg",
      "cry over spilled milk",
      "cut corners",
      "cut to the chase",
      "devil's advocate",
      "down to earth",
      "drop the ball",
      "easier said than done",
      "elephant in the room",
      "every cloud has a silver lining",
      "face the music",
      "foot the bill",
      "get a grip",
      "get cold feet",
      "get out of hand",
      "get the hang of it",
      "give someone the benefit of the doubt",
      "go the extra mile",
      "hang in there",
      "hit the books",
      "hit the ground running",
      "hit the nail on the head",
      "hit the sack",
      "in a nutshell",
      "in the heat of the moment",
      "it's not rocket science",
      "keep an eye on",
      "keep your chin up",
      "kill two birds with one stone",
      "leave no stone unturned",
      "let the cat out of the bag",
      "long story short",
      "make ends meet",
      "miss the boat",
      "no pain no gain",
      "no-brainer",
      "not my cup of tea",
      "off the record",
      "on cloud nine",
      "on the fence",
      "on the fly",
      "on the house",
      "on the same page",
      "once in a blue moon",
      "out of the blue",
      "pass with flying colors",
      "piece of cake",
      "play it by ear",
      "practice makes perfect",
      "pull someone's leg",
      "pull yourself together",
      "rain check",
      "red tape",
      "rule of thumb",
      "safe and sound",
      "second to none",
      "see eye to eye",
      "silver lining",
      "skate on thin ice",
      "sleep on it",
      "so far so good",
      "speak of the devil",
      "spill the beans",
      "spill the tea",
      "stand your ground",
      "start from scratch",
      "steal someone's thunder",
      "take it with a grain of salt",
      "taste of your own medicine",
      "the ball is in your court",
      "the last straw",
      "think outside the box",
      "through thick and thin",
      "throw in the towel",
      "time flies",
      "touch base",
      "under the table",
      "under the weather",
      "up in the air",
      "weather the storm",
      "when pigs fly",
      "wrap up",
      "you can say that again",
      "your guess is as good as mine",
      "easy come easy go",
      "all that glitters is not gold",
      "it is what it is",
      "no big deal",
      "better safe than sorry",
      "the sooner the better",
      "it never hurts to ask",
      "you can't please everyone",
      "it slipped my mind",
      "make up one's mind",
      "keep in touch",
      "climb the career ladder",
      "best is yet to come",
      "to take something for granted",
      "feel left out",
      "go bananas",
      "take your time",
      "keep the change",
      "not too shabby",
      "i second that",
      "inside out",
      "black dog",
      "take a side",
      "never mind",
      "no doubt",
      "i mean it",
      "beat it",
      "who cares",
      "all the same",
      "take risks",
      "comfort zone",
      "spread rumours",
      "play truant",
      "straight a student",
      "worth it",
      "serve as a lifeline",
      "play a dominant role",
      "pursue happiness",
      "feel at peace",
      "heart warming",
      "vivid memory",
      "digital detox",
      "gap year",
      "as a matter of fact",
      "by the way",
      "right away",
      "before too long",
      "in advance",
      "on time",
      "no way"
    ]
  },
  {
    id: 'tricky_sounds',
    isBuiltin: true,
    icon: '🎧',
    name: {
          "ru": "Ловушки на слух",
          "uk": "Пастки для слуху",
          "en": "Tricky Sounds",
          "de": "Klangfallen",
          "es": "Trampas del oído",
          "fr": "Pièges d'oreille",
          "pl": "Pułapki słuchowe",
          "tr": "Kulak Tuzakları",
          "it": "Trappole dell'orecchio",
          "ro": "Capcane auditive",
          "bg": "Капани за слуха",
          "hu": "Fülcsapdák",
          "el": "Παγίδες ακοής",
          "da": "Lydfælder",
          "lv": "Dzirdes lamatas",
          "lt": "Klausos spąstai",
          "pt": "Armadilhas de som",
          "sk": "Sluchové pasce",
          "sl": "Slušne pasti",
          "fi": "Kuulon ansat",
          "hr": "Slušne zamke",
          "cs": "Sluchové pasti",
          "sv": "Hörselfällor",
          "et": "Kuulmislõksud",
          "hi": "सुनने के जाल",
          "ar": "فخاخ السمع",
          "id": "Jebakan Pendengaran",
          "vi": "Bẫy thính giác",
          "th": "กับดักเสียง",
          "ko": "발음 함정",
          "ja": "聞き分けトラップ",
          "bn": "শোনার ফাঁদ",
          "fa": "تله‌های شنیداری",
          "zh": "听音陷阱",
          "ur": "سماعت کے جال",
          "kk": "Есту тұзақтары"
    },
    wordKeys: getPairWordKeys('tricky_sounds'),
  },
  {
    id: 'confusing_words',
    isBuiltin: true,
    icon: '👯',
    name: {
          "ru": "Коварные близнецы",
          "uk": "Підступні близнюки",
          "en": "Look-Alike Twins",
          "de": "Fiese Zwillinge",
          "es": "Gemelos traicioneros",
          "fr": "Faux jumeaux",
          "pl": "Podstępne bliźniaki",
          "tr": "Sinsi İkizler",
          "it": "Gemelli ingannevoli",
          "ro": "Gemeni înșelători",
          "bg": "Коварни близнаци",
          "hu": "Alattomos ikrek",
          "el": "Ύπουλοι δίδυμοι",
          "da": "Lumske tvillinger",
          "lv": "Viltīgie dvīņi",
          "lt": "Klastingi dvyniai",
          "pt": "Gêmeos traiçoeiros",
          "sk": "Zákerné dvojčatá",
          "sl": "Zahrbtni dvojčki",
          "fi": "Salakavalat kaksoset",
          "hr": "Podmukli blizanci",
          "cs": "Záludná dvojčata",
          "sv": "Lömska tvillingar",
          "et": "Salakavalad kaksikud",
          "hi": "धोखेबाज़ जुड़वाँ",
          "ar": "التوائم الماكرة",
          "id": "Kembar Menjebak",
          "vi": "Cặp song sinh dễ nhầm",
          "th": "ฝาแฝดจอมลวง",
          "ko": "헷갈리는 쌍둥이",
          "ja": "まぎらわしい双子",
          "bn": "ধোঁকাবাজ যমজ",
          "fa": "دوقلوهای فریبکار",
          "zh": "易混淆的双胞胎",
          "ur": "دھوکے باز جڑواں",
          "kk": "Алдамшы егіздер"
    },
    wordKeys: getPairWordKeys('confusing_words'),
  }
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
    const currentFavs = getUserFavorites().map(String);
    const idStr = String(wordId);
    if (!currentFavs.includes(idStr)) {
      return toggleFavoriteApi(wordId, true);
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
    const currentFavs = getUserFavorites().map(String);
    const idStr = String(wordId);
    if (currentFavs.includes(idStr)) {
      toggleFavoriteApi(wordId, false);
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

  return { ru: 'Коллекция', uk: 'Колекція', en: 'Collection', pt: 'Coleção', es: 'Colección', de: 'Sammlung', fr: 'Collection' }[currentLang] || 'Collection';
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
  // Fallback to the cached dictionary so the widget is never synced with an empty deck
  const effectiveAllWords = (Array.isArray(allWords) && allWords.length > 0)
    ? allWords
    : (Array.isArray(_cachedAllWords) ? _cachedAllWords : []);
  let words = getCollectionWords(targetId, effectiveAllWords);
  const title = getCollectionTitle(targetId);
  const hasFavs = words.length > 0;

  if (words.length === 0 && effectiveAllWords.length > 0) {
    // Curated starter words if collection/favorites is empty
    words = effectiveAllWords.slice(0, 50);
  } else if (words.length > 100) {
    // Cap at 100 words for Android widget to prevent SharedPreferences memory bloat and ANR
    words = words.slice(0, 100);
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
          example: String(w.example || getWordNotes(w, null, { hideItNotes: targetId !== 'it_terms' }) || '').trim(),
          isFavorite: hasFavs,
        })),
      };
      window.AndroidWidgetBridge.syncFavorites(JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to sync collection to widget:', err);
    }
  }
}

