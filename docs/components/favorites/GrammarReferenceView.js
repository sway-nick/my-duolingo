import { PREPOSITIONS_GROUPS, PREPOSITIONS_META_I18N } from './prepositionsData.js?v=423.0';
import { PRONOUNS_MATRIX, PRONOUNS_GROUPS, PRONOUNS_META_I18N } from './pronounsData.js?v=423.0';
import { CONJUNCTIONS_SECTIONS, CONJUNCTIONS_META_I18N } from './conjunctionsData.js?v=423.0';
import { speakWord } from '../../services/audioService.js?v=423.0';
import { getInterfaceLanguage, t } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { getRelatedMicroRulesForCollection, getCrossLinkStrings } from './crossLinksMap.js?v=423.0';
import { navigateWithReturn } from '../../services/navigationStack.js?v=423.0';
import { getActiveCollectionId, setActiveCollectionId } from '../../services/collectionsService.js?v=423.0';
import { openWidgetConfigBottomSheet } from '../modals/WidgetConfigBottomSheet.js?v=423.0';

const STORAGE_KEY_DONE = 'myduo_grammar_ref_done';

export const PRONOUN_MATRIX_LABEL_I18N = {
  ar: 'المصفوفة',
  bn: 'ম্যাট্রিক্স',
  bg: 'Матрица',
  zh: '矩阵',
  hr: 'Matrica',
  cs: 'Matice',
  da: 'Matrix',
  en: 'Matrix',
  et: 'Maatriks',
  fi: 'Matriisi',
  fr: 'Matrice',
  de: 'Matrix',
  el: 'Πίνακας',
  hi: 'मैट्रिक्स',
  hu: 'Mátrix',
  id: 'Matriks',
  it: 'Matrice',
  ja: 'マトリクス',
  kk: 'Матрица',
  ko: '매트릭스',
  lv: 'Matrica',
  lt: 'Matrica',
  fa: 'ماتریس',
  pl: 'Matryca',
  pt: 'Matriz',
  'pt-br': 'Matriz',
  ro: 'Matrice',
  ru: 'Матрица',
  sk: 'Matica',
  sl: 'Matrika',
  es: 'Matriz',
  'es-mx': 'Matriz',
  sv: 'Matris',
  th: 'เมทริกซ์',
  tr: 'Matris',
  uk: 'Матриця',
  ur: 'میٹرکس',
  vi: 'Ma trận',
};

export function getPronounMatrixLabel(lang = 'en') {
  const raw = String(lang || 'en').toLowerCase().trim();
  return PRONOUN_MATRIX_LABEL_I18N[raw] || PRONOUN_MATRIX_LABEL_I18N[raw.split(/[-_]/)[0]] || PRONOUN_MATRIX_LABEL_I18N.en;
}

const PERSONAL_PRONOUNS_GROUP_I18N = {
  ar: 'مجموعة الضمائر الشخصية',
  bn: 'ব্যক্তিবাচক সর্বনামের দল',
  bg: 'Група на личните местоимения',
  zh: '人称代词组',
  hr: 'Skupina osobnih zamjenica',
  cs: 'Skupina osobních zájmen',
  da: 'Personlige pronominer',
  en: 'Personal pronouns group',
  et: 'Isikuliste asesõnade rühm',
  fi: 'Persoonapronominien ryhmä',
  fr: 'Groupe des pronoms personnels',
  de: 'Gruppe der Personalpronomen',
  el: 'Ομάδα προσωπικών αντωνυμιών',
  hi: 'पुरुषवाचक सर्वनाम समूह',
  hu: 'Személyes névmások csoportja',
  id: 'Kelompok kata ganti orang',
  it: 'Gruppo dei pronomi personali',
  ja: '人称代名詞グループ',
  kk: 'Жіктеу есімдіктері тобы',
  ko: '인칭대명사 그룹',
  lv: 'Personu vietniekvārdu grupa',
  lt: 'Asmeninių įvardžių grupė',
  fa: 'گروه ضمایر شخصی',
  pl: 'Grupa zaimków osobowych',
  pt: 'Grupo dos pronomes pessoais',
  'pt-br': 'Grupo dos pronomes pessoais',
  ro: 'Grupul pronumelor personale',
  ru: 'Группа личных местоимений',
  sk: 'Skupina osobných zámen',
  sl: 'Skupina osebnih zaimkov',
  es: 'Grupo de pronombres personales',
  'es-mx': 'Grupo de pronombres personales',
  sv: 'Grupp med personliga pronomen',
  th: 'กลุ่มคำสรรพนามบุรุษ',
  tr: 'Kişi zamirleri grubu',
  uk: 'Група особових займенників',
  ur: 'شخصی ضمائر کا گروپ',
  vi: 'Nhóm đại từ nhân xưng',
};

function getPersonalPronounsGroupLabel(lang = 'en') {
  const raw = String(lang || 'en').toLowerCase().trim();
  return PERSONAL_PRONOUNS_GROUP_I18N[raw] || PERSONAL_PRONOUNS_GROUP_I18N[raw.split(/[-_]/)[0]] || PERSONAL_PRONOUNS_GROUP_I18N.en;
}

const CONJUNCTIONS_INTRO_I18N = {
  ru: {
    title: 'Как устроены 4 вида союзов и связок',
    c1Badge: 'Сочинительные',
    c1Desc: 'соединяют равноправные слова и части предложения — «I was tired, but I finished.»',
    c2Badge: 'Парные',
    c2Desc: 'всегда работают парой для выбора или усиления — «Either call me or text me.»',
    c3Badge: 'Подчинительные',
    c3Desc: 'вводят зависимую часть (причина, время, условие) — «Stay home because it’s raining.»',
    c4Badge: 'Союзные наречия',
    c4Desc: 'связывают два отдельных предложения по смыслу — «It rained; however, we went out.»',
  },
  uk: {
    title: 'Як влаштовані 4 види сполучників і зв’язок',
    c1Badge: 'Сурядні',
    c1Desc: 'поєднують рівноправні слова та частини речення — «I was tired, but I finished.»',
    c2Badge: 'Парні',
    c2Desc: 'завжди працюють парою для вибору чи підсилення — «Either call me or text me.»',
    c3Badge: 'Підрядні',
    c3Desc: 'вводять залежну частину (причина, час, умова) — «Stay home because it’s raining.»',
    c4Badge: 'Сполучні прислівники',
    c4Desc: 'поєднують два окремих речення за змістом — «It rained; however, we went out.»',
  },
  en: {
    title: '4 types of conjunctions & connectors at a glance',
    c1Badge: 'Coordinating',
    c1Desc: 'join equal words or clauses — “I was tired, but I finished.”',
    c2Badge: 'Correlative',
    c2Desc: 'work in pairs to link two choices or ideas — “Either call me or text me.”',
    c3Badge: 'Subordinating',
    c3Desc: 'introduce a dependent clause (reason, time, condition) — “Stay home because it’s raining.”',
    c4Badge: 'Conjunctive adverbs',
    c4Desc: 'connect two full sentences smoothly — “It rained; however, we went out.”',
  },
  de: {
    title: 'Die 4 Arten von Konjunktionen im Überblick',
    c1Badge: 'Beiordnend',
    c1Desc: 'verbinden gleichrangige Wörter oder Sätze — „I was tired, but I finished.“',
    c2Badge: 'Mehrteilig',
    c2Desc: 'arbeiten paarweise für Auswahl oder Betonung — „Either call me or text me.“',
    c3Badge: 'Unterordnend',
    c3Desc: 'leiten einen Nebensatz ein (Grund, Zeit, Bedingung) — „Stay home because it’s raining.“',
    c4Badge: 'Konjunktionaladverbien',
    c4Desc: 'verknüpfen zwei eigenständige Sätze — „It rained; however, we went out.“',
  },
  es: {
    title: 'Los 4 tipos de conjunciones y conectores',
    c1Badge: 'Coordinantes',
    c1Desc: 'unen palabras u oraciones iguales — «I was tired, but I finished.»',
    c2Badge: 'Correlativas',
    c2Desc: 'funcionan en pares para opciones o énfasis — «Either call me or text me.»',
    c3Badge: 'Subordinantes',
    c3Desc: 'introducen una cláusula dependiente (causa, tiempo, condición) — «Stay home because it’s raining.»',
    c4Badge: 'Adverbios conjuntivos',
    c4Desc: 'conectan dos oraciones completas — «It rained; however, we went out.»',
  },
  'es-mx': {
    title: 'Los 4 tipos de conjunciones y conectores',
    c1Badge: 'Coordinantes',
    c1Desc: 'unen palabras u oraciones iguales — «I was tired, but I finished.»',
    c2Badge: 'Correlativas',
    c2Desc: 'funcionan en pares para opciones o énfasis — «Either call me or text me.»',
    c3Badge: 'Subordinantes',
    c3Desc: 'introducen una cláusula dependiente (causa, tiempo, condición) — «Stay home because it’s raining.»',
    c4Badge: 'Adverbios conjuntivos',
    c4Desc: 'conectan dos oraciones completas — «It rained; however, we went out.»',
  },
  fr: {
    title: 'Les 4 types de conjonctions et connecteurs',
    c1Badge: 'Coordination',
    c1Desc: 'relient des éléments de même rang — « I was tired, but I finished. »',
    c2Badge: 'Corrélatives',
    c2Desc: 'fonctionnent par paires — « Either call me or text me. »',
    c3Badge: 'Subordination',
    c3Desc: 'introduisent une subordonnée (cause, temps, condition) — « Stay home because it’s raining. »',
    c4Badge: 'Adverbes de liaison',
    c4Desc: 'relient deux phrases complètes — « It rained; however, we went out. »',
  },
  pl: {
    title: '4 rodzaje spójników i łączników w skrócie',
    c1Badge: 'Współrzędne',
    c1Desc: 'łączą równorzędne słowa i zdania — „I was tired, but I finished.”',
    c2Badge: 'Parzyste',
    c2Desc: 'działają zawsze w parze — „Either call me or text me.”',
    c3Badge: 'Podrzędne',
    c3Desc: 'wprowadzają zdanie podrzędne (przyczyna, czas, warunek) — „Stay home because it’s raining.”',
    c4Badge: 'Przysłówki łączące',
    c4Desc: 'łączą dwa osobne zdania — „It rained; however, we went out.”',
  },
  tr: {
    title: '4 tür bağlaç ve geçiş ifadesi',
    c1Badge: 'Eşgüdümlü',
    c1Desc: 'eşit sözcük veya cümleleri bağlar — “I was tired, but I finished.”',
    c2Badge: 'Eşli bağlaçlar',
    c2Desc: 'her zaman çift hâlinde kullanılır — “Either call me or text me.”',
    c3Badge: 'Yan cümle',
    c3Desc: 'neden, zaman, koşul yan cümlesi kurar — “Stay home because it’s raining.”',
    c4Badge: 'Bağlaç zarfları',
    c4Desc: 'iki ayrı cümleyi akıcı biçimde bağlar — “It rained; however, we went out.”',
  },
  it: {
    title: 'I 4 tipi di congiunzioni e connettivi',
    c1Badge: 'Coordinanti',
    c1Desc: 'collegano parole o frasi sullo stesso piano — «I was tired, but I finished.»',
    c2Badge: 'Correlative',
    c2Desc: 'lavorano in coppia per alternative o enfasi — «Either call me or text me.»',
    c3Badge: 'Subordinanti',
    c3Desc: 'introducono una subordinata (causa, tempo, condizione) — «Stay home because it’s raining.»',
    c4Badge: 'Avverbi congiuntivi',
    c4Desc: 'collegano due frasi complete — «It rained; however, we went out.»',
  },
  ro: {
    title: 'Cele 4 tipuri de conjuncții și conectori',
    c1Badge: 'Coordonatoare',
    c1Desc: 'leagă cuvinte sau propoziții egale — „I was tired, but I finished.”',
    c2Badge: 'Corelative',
    c2Desc: 'funcționează în perechi — „Either call me or text me.”',
    c3Badge: 'Subordonatoare',
    c3Desc: 'introduc o propoziție subordonată (cauză, timp, condiție) — „Stay home because it’s raining.”',
    c4Badge: 'Adverbe conjunctive',
    c4Desc: 'leagă două propoziții complete — „It rained; however, we went out.”',
  },
  bg: {
    title: '4-те вида съюзи и свързващи думи накратко',
    c1Badge: 'Съчинителни',
    c1Desc: 'свързват равноправни думи и изречения — „I was tired, but I finished.“',
    c2Badge: 'Двойни',
    c2Desc: 'винаги работят по двойки — „Either call me or text me.“',
    c3Badge: 'Подчинителни',
    c3Desc: 'въвеждат зависимо изречение (причина, време, условие) — „Stay home because it’s raining.“',
    c4Badge: 'Съюзни наречия',
    c4Desc: 'свързват две отделни изречения по смисъл — „It rained; however, we went out.“',
  },
  hu: {
    title: 'A 4 kötőszótípus röviden',
    c1Badge: 'Mellérendelő',
    c1Desc: 'egyenrangú szavakat vagy tagmondatokat köt össze — „I was tired, but I finished.”',
    c2Badge: 'Páros',
    c2Desc: 'mindig párban működnek — „Either call me or text me.”',
    c3Badge: 'Alárendelő',
    c3Desc: 'mellékmondatot vezet be (ok, idő, feltétel) — „Stay home because it’s raining.”',
    c4Badge: 'Kötőszói határozók',
    c4Desc: 'két teljes mondatot kapcsol össze — „It rained; however, we went out.”',
  },
  el: {
    title: 'Οι 4 τύποι συνδέσμων με μια ματιά',
    c1Badge: 'Παρατακτικοί',
    c1Desc: 'συνδέουν ισότιμες λέξεις ή προτάσεις — «I was tired, but I finished.»',
    c2Badge: 'Ζευγάρια',
    c2Desc: 'χρησιμοποιούνται πάντα σε ζεύγη — «Either call me or text me.»',
    c3Badge: 'Υποτακτικοί',
    c3Desc: 'εισάγουν δευτερεύουσα πρόταση (αιτία, χρόνος, όρος) — «Stay home because it’s raining.»',
    c4Badge: 'Συνδετικά επιρρήματα',
    c4Desc: 'συνδέουν ομαλά δύο ανεξάρτητες προτάσεις — «It rained; however, we went out.»',
  },
  da: {
    title: 'De 4 typer konjunktioner og bindeord',
    c1Badge: 'Sideordnende',
    c1Desc: 'forbinder ligestillede ord eller sætninger — “I was tired, but I finished.”',
    c2Badge: 'Parvise',
    c2Desc: 'bruges altid i par — “Either call me or text me.”',
    c3Badge: 'Underordnende',
    c3Desc: 'indleder en ledsætning (årsag, tid, betingelse) — “Stay home because it’s raining.”',
    c4Badge: 'Bindeordsadverbier',
    c4Desc: 'forbinder to hele sætninger — “It rained; however, we went out.”',
  },
  lv: {
    title: '4 saikļu un savienotāju veidi īsumā',
    c1Badge: 'Sakārtojuma',
    c1Desc: 'savieno līdzvērtīgus vārdus vai teikumus — “I was tired, but I finished.”',
    c2Badge: 'Pāra saikļi',
    c2Desc: 'vienmēr darbojas pārī — “Either call me or text me.”',
    c3Badge: 'Pakārtojuma',
    c3Desc: 'ievada palīgteikumu (iemesls, laiks, nosacījums) — “Stay home because it’s raining.”',
    c4Badge: 'Saikļa apstākļa vārdi',
    c4Desc: 'savieno divus patstāvīgus teikumus — “It rained; however, we went out.”',
  },
  lt: {
    title: '4 jungtukų ir jungiamųjų žodžių tipai',
    c1Badge: 'Sujungiamieji',
    c1Desc: 'jungia lygiaverčius žodžius ar sakinius — „I was tired, but I finished.“',
    c2Badge: 'Poriniai',
    c2Desc: 'visada veikia poroje — „Either call me or text me.“',
    c3Badge: 'Prijungiamieji',
    c3Desc: 'įveda šalutinį sakinį (priežastis, laikas, sąlyga) — „Stay home because it’s raining.“',
    c4Badge: 'Jungiamieji prieveiksmiai',
    c4Desc: 'sujungia du atskirus sakinius — „It rained; however, we went out.“',
  },
  pt: {
    title: 'Os 4 tipos de conjunções e conectores',
    c1Badge: 'Coordenativas',
    c1Desc: 'ligam palavras ou orações iguais — “I was tired, but I finished.”',
    c2Badge: 'Correlativas',
    c2Desc: 'funcionam em pares — “Either call me or text me.”',
    c3Badge: 'Subordinativas',
    c3Desc: 'introduzem uma oração dependente (causa, tempo, condição) — “Stay home because it’s raining.”',
    c4Badge: 'Advérbios conjuntivos',
    c4Desc: 'conectam duas frases completas — “It rained; however, we went out.”',
  },
  'pt-br': {
    title: 'Os 4 tipos de conjunções e conectores',
    c1Badge: 'Coordenativas',
    c1Desc: 'ligam palavras ou orações iguais — “I was tired, but I finished.”',
    c2Badge: 'Correlativas',
    c2Desc: 'funcionam sempre em par — “Either call me or text me.”',
    c3Badge: 'Subordinativas',
    c3Desc: 'introduzem uma oração dependente (causa, tempo, condição) — “Stay home because it’s raining.”',
    c4Badge: 'Advérbios conjuntivos',
    c4Desc: 'conectam duas frases completas — “It rained; however, we went out.”',
  },
  sk: {
    title: '4 typy spojok a spájacích výrazov v skratke',
    c1Badge: 'Priraďovacie',
    c1Desc: 'spájajú rovnocenné slová alebo vety — „I was tired, but I finished.“',
    c2Badge: 'Párové',
    c2Desc: 'vždy fungujú v páre — „Either call me or text me.“',
    c3Badge: 'Podraďovacie',
    c3Desc: 'uvádzajú vedľajšiu vetu (príčina, čas, podmienka) — „Stay home because it’s raining.“',
    c4Badge: 'Spájacie príslovky',
    c4Desc: 'spájajú dve samostatné vety — „It rained; however, we went out.“',
  },
  sl: {
    title: '4 vrste veznikov in povezovalcev na kratko',
    c1Badge: 'Priredni',
    c1Desc: 'povezujejo enakovredne besede ali stavke — “I was tired, but I finished.”',
    c2Badge: 'Dvodelni',
    c2Desc: 'vedno delujejo v paru — “Either call me or text me.”',
    c3Badge: 'Podredni',
    c3Desc: 'uvajajo odvisnik (vzrok, čas, pogoj) — “Stay home because it’s raining.”',
    c4Badge: 'Vezni prislovi',
    c4Desc: 'povezujejo dva samostojna stavka — “It rained; however, we went out.”',
  },
  fi: {
    title: '4 konjunktiotyyppiä lyhyesti',
    c1Badge: 'Rinnastus',
    c1Desc: 'yhdistävät samanarvoisia sanoja tai lauseita — “I was tired, but I finished.”',
    c2Badge: 'Parikonjunktiot',
    c2Desc: 'toimivat aina pareittain — “Either call me or text me.”',
    c3Badge: 'Alistus',
    c3Desc: 'aloittavat sivulauseen (syy, aika, ehto) — “Stay home because it’s raining.”',
    c4Badge: 'Sidosadverbit',
    c4Desc: 'yhdistävät kaksi erillistä virkettä — “It rained; however, we went out.”',
  },
  hr: {
    title: '4 vrste veznika i poveznica ukratko',
    c1Badge: 'Nezavisni',
    c1Desc: 'povezuju ravnopravne riječi ili rečenice — „I was tired, but I finished.”',
    c2Badge: 'Parni',
    c2Desc: 'uvijek dolaze u paru — „Either call me or text me.”',
    c3Badge: 'Zavisni',
    c3Desc: 'uvode zavisnu rečenicu (uzrok, vrijeme, uvjet) — „Stay home because it’s raining.”',
    c4Badge: 'Veznički prilozi',
    c4Desc: 'povezuju dvije zasebne rečenice — „It rained; however, we went out.”',
  },
  cs: {
    title: '4 druhy spojek a spojovacích výrazů',
    c1Badge: 'Souřadicí',
    c1Desc: 'spojují rovnocenná slova nebo věty — „I was tired, but I finished.“',
    c2Badge: 'Párové',
    c2Desc: 'vždy fungují ve dvojici — „Either call me or text me.“',
    c3Badge: 'Podřadicí',
    c3Desc: 'uvádějí vedlejší větu (příčina, čas, podmínka) — „Stay home because it’s raining.“',
    c4Badge: 'Spojovací příslovce',
    c4Desc: 'propojují dvě samostatné věty — „It rained; however, we went out.“',
  },
  sv: {
    title: '4 typer av konjunktioner och bindeord',
    c1Badge: 'Samordnande',
    c1Desc: 'binder samman likvärdiga ord eller satser — “I was tired, but I finished.”',
    c2Badge: 'Parvisa',
    c2Desc: 'används alltid i par — “Either call me or text me.”',
    c3Badge: 'Underordnande',
    c3Desc: 'inleder en bisats (orsak, tid, villkor) — “Stay home because it’s raining.”',
    c4Badge: 'Bindeordsadverb',
    c4Desc: 'kopplar ihop två hela meningar — “It rained; however, we went out.”',
  },
  et: {
    title: '4 tüüpi sidesõnu lühidalt',
    c1Badge: 'Rindsiduvad',
    c1Desc: 'ühendavad võrdväärseid sõnu või lauseid — „I was tired, but I finished.“',
    c2Badge: 'Paarissidesõnad',
    c2Desc: 'töötavad alati paarina — „Either call me or text me.“',
    c3Badge: 'Alistavad',
    c3Desc: 'juhatavad sisse kõrvallause (põhjus, aeg, tingimus) — „Stay home because it’s raining.“',
    c4Badge: 'Siduvad määrsõnad',
    c4Desc: 'seovad kahte eraldi lauset — „It rained; however, we went out.“',
  },
  hi: {
    title: '4 प्रकार के संयोजक (Conjunctions) संक्षेप में',
    c1Badge: 'समान संयोजक',
    c1Desc: 'समान शब्दों या वाक्यों को जोड़ते हैं — “I was tired, but I finished.”',
    c2Badge: 'युग्म संयोजक',
    c2Desc: 'हमेशा जोड़े में काम करते हैं — “Either call me or text me.”',
    c3Badge: 'आश्रित संयोजक',
    c3Desc: 'कारण, समय या शर्त वाला उपवाक्य जोड़ते हैं — “Stay home because it’s raining.”',
    c4Badge: 'संयोजक क्रिया-विशेषण',
    c4Desc: 'दो पूरे वाक्यों को जोड़ते हैं — “It rained; however, we went out.”',
  },
  bn: {
    title: '৪ ধরনের সংযোজক শব্দ এক নজরে',
    c1Badge: 'সমান সংযোজক',
    c1Desc: 'সমান শব্দ বা বাক্যাংশ যুক্ত করে — “I was tired, but I finished.”',
    c2Badge: 'যুগল সংযোজক',
    c2Desc: 'সবসময় জোড়ায় কাজ করে — “Either call me or text me.”',
    c3Badge: 'অধীনস্থ সংযোজক',
    c3Desc: 'কারণ, সময় বা শর্তযুক্ত খণ্ডবাক্য আনে — “Stay home because it’s raining.”',
    c4Badge: 'সংযোজক ক্রিয়াবিশেষণ',
    c4Desc: 'দুটি পূর্ণ বাক্যকে যুক্ত করে — “It rained; however, we went out.”',
  },
  ar: {
    title: 'الأنواع الأربعة لأدوات الربط باختصار',
    c1Badge: 'أدوات العطف',
    c1Desc: 'تربط كلمات أو جملاً متكافئة — “I was tired, but I finished.”',
    c2Badge: 'الأدوات المزدوجة',
    c2Desc: 'تعمل دائماً في أزواج — “Either call me or text me.”',
    c3Badge: 'أدوات التبعية',
    c3Desc: 'تُدخل جملة تابعة (السبب، الوقت، الشرط) — “Stay home because it’s raining.”',
    c4Badge: 'الظروف الرابطة',
    c4Desc: 'تربط بين جملتين كاملتين بسلاسة — “It rained; however, we went out.”',
  },
  fa: {
    title: '۴ نوع حرف ربط در یک نگاه',
    c1Badge: 'هم‌پایه‌ساز',
    c1Desc: 'واژه‌ها یا جمله‌های هم‌سطح را به هم وصل می‌کنند — “I was tired, but I finished.”',
    c2Badge: 'جفتی',
    c2Desc: 'همیشه به‌صورت جفت به کار می‌روند — “Either call me or text me.”',
    c3Badge: 'وابسته‌ساز',
    c3Desc: 'جمله پیرو (دلیل، زمان، شرط) می‌سازند — “Stay home because it’s raining.”',
    c4Badge: 'قیدهای ربطی',
    c4Desc: 'دو جمله مستقل را به هم پیوند می‌دهند — “It rained; however, we went out.”',
  },
  ur: {
    title: 'حروفِ عطف کی 4 اقسام مختصراً',
    c1Badge: 'مساوی حروفِ ربط',
    c1Desc: 'برابر الفاظ یا جملوں کو جوڑتے ہیں — “I was tired, but I finished.”',
    c2Badge: 'جوڑی حروفِ ربط',
    c2Desc: 'ہمیشہ جوڑے میں استعمال ہوتے ہیں — “Either call me or text me.”',
    c3Badge: 'ماتحت حروفِ ربط',
    c3Desc: 'وجہ، وقت یا شرط والا ذیلی جملہ جوڑتے ہیں — “Stay home because it’s raining.”',
    c4Badge: 'ربطی متعلقِ فعل',
    c4Desc: 'دو مکمل جملوں کو آپس میں جوڑتے ہیں — “It rained; however, we went out.”',
  },
  id: {
    title: '4 jenis kata hubung secara singkat',
    c1Badge: 'Setara',
    c1Desc: 'menghubungkan kata atau klausa setara — “I was tired, but I finished.”',
    c2Badge: 'Berpasangan',
    c2Desc: 'selalu digunakan berpasangan — “Either call me or text me.”',
    c3Badge: 'Bertingkat',
    c3Desc: 'memperkenalkan anak kalimat (sebab, waktu, syarat) — “Stay home because it’s raining.”',
    c4Badge: 'Adverbia penghubung',
    c4Desc: 'menghubungkan dua kalimat penuh — “It rained; however, we went out.”',
  },
  vi: {
    title: '4 loại liên từ và từ nối ngắn gọn',
    c1Badge: 'Đẳng lập',
    c1Desc: 'nối từ hoặc mệnh đề ngang hàng — “I was tired, but I finished.”',
    c2Badge: 'Tương quan',
    c2Desc: 'luôn đi theo cặp — “Either call me or text me.”',
    c3Badge: 'Phụ thuộc',
    c3Desc: 'mở đầu mệnh đề phụ (lý do, thời gian, điều kiện) — “Stay home because it’s raining.”',
    c4Badge: 'Trạng từ liên kết',
    c4Desc: 'nối hai câu độc lập mượt mà — “It rained; however, we went out.”',
  },
  th: {
    title: 'คำสันธานและคำเชื่อม 4 ประเภทโดยย่อ',
    c1Badge: 'เชื่อมเท่ากัน',
    c1Desc: 'เชื่อมคำหรือประโยคที่เท่าเทียมกัน — “I was tired, but I finished.”',
    c2Badge: 'เชื่อมเป็นคู่',
    c2Desc: 'ใช้คู่กันเสมอ — “Either call me or text me.”',
    c3Badge: 'เชื่อมอนุประโยค',
    c3Desc: 'เชื่อมเหตุผล เวลา หรือเงื่อนไข — “Stay home because it’s raining.”',
    c4Badge: 'กริยาวิเศษณ์เชื่อม',
    c4Desc: 'เชื่อมประโยคสมบูรณ์สองประโยค — “It rained; however, we went out.”',
  },
  ko: {
    title: '접속사·연결어 4가지 한눈에 보기',
    c1Badge: '등위 접속사',
    c1Desc: '대등한 단어나 절을 연결 — “I was tired, but I finished.”',
    c2Badge: '상관 접속사',
    c2Desc: '항상 짝을 이루어 사용 — “Either call me or text me.”',
    c3Badge: '종속 접속사',
    c3Desc: '이유·시간·조건의 종속절을 이끎 — “Stay home because it’s raining.”',
    c4Badge: '접속 부사',
    c4Desc: '두 개의 독립된 문장을 연결 — “It rained; however, we went out.”',
  },
  ja: {
    title: '接続詞・つなぎ言葉の4タイプ',
    c1Badge: '等位接続詞',
    c1Desc: '対等な語や節をつなぐ — “I was tired, but I finished.”',
    c2Badge: '相関接続詞',
    c2Desc: '必ずペアで使う — “Either call me or text me.”',
    c3Badge: '従属接続詞',
    c3Desc: '理由・時・条件の節を導く — “Stay home because it’s raining.”',
    c4Badge: '接続副詞',
    c4Desc: '2つの文を滑らかにつなぐ — “It rained; however, we went out.”',
  },
  zh: {
    title: '4类连词与连接词一览',
    c1Badge: '并列连词',
    c1Desc: '连接同等词或分句 — “I was tired, but I finished.”',
    c2Badge: '关联连词',
    c2Desc: '总是成对使用 — “Either call me or text me.”',
    c3Badge: '从属连词',
    c3Desc: '引导原因、时间或条件从句 — “Stay home because it’s raining.”',
    c4Badge: '连接副词',
    c4Desc: '衔接两个独立完整句子 — “It rained; however, we went out.”',
  },
  kk: {
    title: 'Жалғаулықтардың 4 түрі қысқаша',
    c1Badge: 'Салалас',
    c1Desc: 'тең дәрежелі сөздер мен сөйлемдерді байланыстырады — «I was tired, but I finished.»',
    c2Badge: 'Жұптық',
    c2Desc: 'әрқашан жұп болып қолданылады — «Either call me or text me.»',
    c3Badge: 'Сабақтас',
    c3Desc: 'себеп, уақыт, шарт бағыныңқы бөлігін енгізеді — «Stay home because it’s raining.»',
    c4Badge: 'Жалғаулық үстеулер',
    c4Desc: 'екі бөлек сөйлемді мағыналық байланыстырады — «It rained; however, we went out.»',
  },
};

function getConjunctionsIntro(lang = 'en') {
  const raw = String(lang || 'en').toLowerCase().trim();
  return CONJUNCTIONS_INTRO_I18N[raw] || CONJUNCTIONS_INTRO_I18N[raw.split(/[-_]/)[0]] || CONJUNCTIONS_INTRO_I18N.en;
}

export const GRAMMAR_REF_I18N = {
  ar: {
    backBtn: 'رجوع',
    practiceGroupBtn: '🎓 تدرب',
    markDoneBtn: 'تحديد كمُتقَن',
    doneBadge: '✓ مُتقَن',
    progressLabel: 'المُتقَن: {done} / {total}',
    allGroups: 'الكل',
    exampleLabel: 'مثال:',
    groupTestHeading: 'اختبار المجموعة المصغّر',
    groupTestSubtitle: 'اجتز الاختبار (≥ 80%) لاعتماد المجموعة في مصفوفة المعرفة',
    groupTestPassedMsg: '🎉 تم اجتياز المجموعة واعتمادها!',
    groupTestRetryBtn: '🔄 إعادة الاختبار',
    groupTestNextBtn: 'التالي →',
    groupTestFinishBtn: 'إنهاء الاختبار',
    groupTestFailMsg: 'النتيجة: {score} / {total} ({pct}%). المطلوب ≥ 80% للاعتماد.',
  },
  bn: {
    backBtn: 'পিছনে',
    practiceGroupBtn: '🎓 অনুশীলন',
    markDoneBtn: 'শেখা হয়েছে',
    doneBadge: '✓ শেখা হয়েছে',
    progressLabel: 'সম্পন্ন: {done} / {total}',
    allGroups: 'সবগুলো',
    exampleLabel: 'উদাহরণ:',
    groupTestHeading: 'গ্রুপ মিনি-টেস্ট',
    groupTestSubtitle: 'নলেজ ম্যাট্রিক্সে সম্পন্ন হিসেবে গণ্য হতে ≥ 80% স্কোর করুন',
    groupTestPassedMsg: '🎉 গ্রুপটি পাস ও সম্পন্ন হয়েছে!',
    groupTestRetryBtn: '🔄 আবার পরীক্ষা দিন',
    groupTestNextBtn: 'পরবর্তী →',
    groupTestFinishBtn: 'পরীক্ষা শেষ করুন',
    groupTestFailMsg: 'স্কোর: {score} / {total} ({pct}%)। সম্পন্ন করতে ≥ 80% প্রয়োজন।',
  },
  bg: {
    backBtn: 'Назад',
    practiceGroupBtn: '🎓 Тренировка',
    markDoneBtn: 'Научено',
    doneBadge: '✓ Научено',
    progressLabel: 'Усвоено: {done} / {total}',
    allGroups: 'Всички',
    exampleLabel: 'Пример:',
    groupTestHeading: 'Мини-тест за групата',
    groupTestSubtitle: 'Покрийте теста (≥ 80%), за да се зачете групата в матрицата на знанията',
    groupTestPassedMsg: '🎉 Групата е премината и зачетена!',
    groupTestRetryBtn: '🔄 Повтори теста',
    groupTestNextBtn: 'Напред →',
    groupTestFinishBtn: 'Завърши теста',
    groupTestFailMsg: 'Резултат: {score} / {total} ({pct}%). Нужни са ≥ 80% за зачитане.',
  },
  zh: {
    backBtn: '返回',
    practiceGroupBtn: '🎓 练习',
    markDoneBtn: '标记已学',
    doneBadge: '✓ 已掌握',
    progressLabel: '已掌握：{done} / {total}',
    allGroups: '全部',
    exampleLabel: '例句：',
    groupTestHeading: '本组小测验',
    groupTestSubtitle: '正确率 ≥ 80% 即可在知识矩阵中点亮本组',
    groupTestPassedMsg: '🎉 本组已通过并计入掌握！',
    groupTestRetryBtn: '🔄 重新测试',
    groupTestNextBtn: '下一题 →',
    groupTestFinishBtn: '完成测试',
    groupTestFailMsg: '得分：{score} / {total}（{pct}%），需达到 ≥ 80% 才算完成。',
  },
  hr: {
    backBtn: 'Natrag',
    practiceGroupBtn: '🎓 Vježba',
    markDoneBtn: 'Naučeno',
    doneBadge: '✓ Naučeno',
    progressLabel: 'Savladano: {done} / {total}',
    allGroups: 'Sve',
    exampleLabel: 'Primjer:',
    groupTestHeading: 'Mini-test grupe',
    groupTestSubtitle: 'Položite test (≥ 80%) kako bi se grupa računala u matrici znanja',
    groupTestPassedMsg: '🎉 Grupa položena i zabilježena!',
    groupTestRetryBtn: '🔄 Ponovi test',
    groupTestNextBtn: 'Dalje →',
    groupTestFinishBtn: 'Završi test',
    groupTestFailMsg: 'Rezultat: {score} / {total} ({pct}%). Za prolaz je potrebno ≥ 80%.',
  },
  cs: {
    backBtn: 'Zpět',
    practiceGroupBtn: '🎓 Procvičit',
    markDoneBtn: 'Naučeno',
    doneBadge: '✓ Naučeno',
    progressLabel: 'Zvládnuto: {done} / {total}',
    allGroups: 'Vše',
    exampleLabel: 'Příklad:',
    groupTestHeading: 'Mini-test skupiny',
    groupTestSubtitle: 'Splňte test (≥ 80 %), aby se skupina započítala do matice znalostí',
    groupTestPassedMsg: '🎉 Skupina splněna a započítána!',
    groupTestRetryBtn: '🔄 Zkusit znovu',
    groupTestNextBtn: 'Další →',
    groupTestFinishBtn: 'Dokončit test',
    groupTestFailMsg: 'Výsledek: {score} / {total} ({pct} %). Ke splnění je třeba ≥ 80 %.',
  },
  da: {
    backBtn: 'Tilbage',
    practiceGroupBtn: '🎓 Øv',
    markDoneBtn: 'Lært',
    doneBadge: '✓ Lært',
    progressLabel: 'Lært: {done} / {total}',
    allGroups: 'Alle',
    exampleLabel: 'Eksempel:',
    groupTestHeading: 'Mini-test for gruppen',
    groupTestSubtitle: 'Bestå testen (≥ 80%) for at få gruppen godkendt i vidensmatricen',
    groupTestPassedMsg: '🎉 Gruppen er bestået og registreret!',
    groupTestRetryBtn: '🔄 Tag test igen',
    groupTestNextBtn: 'Næste →',
    groupTestFinishBtn: 'Afslut test',
    groupTestFailMsg: 'Resultat: {score} / {total} ({pct}%). Kræver ≥ 80% for bestået.',
  },
  en: {
    backBtn: 'Back',
    practiceGroupBtn: '🎓 Practice',
    markDoneBtn: 'Mark learned',
    doneBadge: '✓ Learned',
    progressLabel: 'Mastered: {done} / {total}',
    allGroups: 'All',
    exampleLabel: 'Example:',
    groupTestHeading: 'Group Mini-Test',
    groupTestSubtitle: 'Pass (≥ 80%) to mark this group mastered in the Knowledge Matrix',
    groupTestPassedMsg: '🎉 Group passed & mastered!',
    groupTestRetryBtn: '🔄 Retake test',
    groupTestNextBtn: 'Next →',
    groupTestFinishBtn: 'Finish test',
    groupTestFailMsg: 'Score: {score} / {total} ({pct}%). Need ≥ 80% to pass.',
  },
  et: {
    backBtn: 'Tagasi',
    practiceGroupBtn: '🎓 Treening',
    markDoneBtn: 'Õpitud',
    doneBadge: '✓ Õpitud',
    progressLabel: 'Omandatud: {done} / {total}',
    allGroups: 'Kõik',
    exampleLabel: 'Näide:',
    groupTestHeading: 'Rühma minitest',
    groupTestSubtitle: 'Läbi test (≥ 80%), et rühm läheks teadmiste maatriksis kirja',
    groupTestPassedMsg: '🎉 Rühm läbitud ja omandatud!',
    groupTestRetryBtn: '🔄 Tee test uuesti',
    groupTestNextBtn: 'Edasi →',
    groupTestFinishBtn: 'Lõpeta test',
    groupTestFailMsg: 'Tulemus: {score} / {total} ({pct}%). Läbimiseks on vaja ≥ 80%.',
  },
  fi: {
    backBtn: 'Takaisin',
    practiceGroupBtn: '🎓 Harjoittelu',
    markDoneBtn: 'Opittu',
    doneBadge: '✓ Opittu',
    progressLabel: 'Hallittu: {done} / {total}',
    allGroups: 'Kaikki',
    exampleLabel: 'Esimerkki:',
    groupTestHeading: 'Ryhmän minitesti',
    groupTestSubtitle: 'Läpäise testi (≥ 80 %), jotta ryhmä kirjataan osaamismatriisiin',
    groupTestPassedMsg: '🎉 Ryhmä läpäisty ja hallittu!',
    groupTestRetryBtn: '🔄 Tee testi uudelleen',
    groupTestNextBtn: 'Seuraava →',
    groupTestFinishBtn: 'Lopeta testi',
    groupTestFailMsg: 'Tulos: {score} / {total} ({pct} %). Läpäisyyn tarvitaan ≥ 80 %.',
  },
  fr: {
    backBtn: 'Retour',
    practiceGroupBtn: '🎓 Entraînement',
    markDoneBtn: 'Appris',
    doneBadge: '✓ Appris',
    progressLabel: 'Maîtrisé : {done} / {total}',
    allGroups: 'Tout',
    exampleLabel: 'Exemple :',
    groupTestHeading: 'Mini-test du groupe',
    groupTestSubtitle: 'Réussissez le test (≥ 80 %) pour valider ce groupe dans la matrice',
    groupTestPassedMsg: '🎉 Groupe réussi et validé !',
    groupTestRetryBtn: '🔄 Refaire le test',
    groupTestNextBtn: 'Suivant →',
    groupTestFinishBtn: 'Terminer le test',
    groupTestFailMsg: 'Score : {score} / {total} ({pct} %). Il faut ≥ 80 % pour valider.',
  },
  de: {
    backBtn: 'Zurück',
    practiceGroupBtn: '🎓 Training',
    markDoneBtn: 'Gelernt',
    doneBadge: '✓ Gelernt',
    progressLabel: 'Gelernt: {done} / {total}',
    allGroups: 'Alle',
    exampleLabel: 'Beispiel:',
    groupTestHeading: 'Gruppen-Minitest',
    groupTestSubtitle: 'Bestehe den Test (≥ 80 %), um die Gruppe in der Wissensmatrix abzuschließen',
    groupTestPassedMsg: '🎉 Gruppe bestanden & abgeschlossen!',
    groupTestRetryBtn: '🔄 Test wiederholen',
    groupTestNextBtn: 'Weiter →',
    groupTestFinishBtn: 'Test beenden',
    groupTestFailMsg: 'Ergebnis: {score} / {total} ({pct} %). Für den Abschluss sind ≥ 80 % nötig.',
  },
  el: {
    backBtn: 'Πίσω',
    practiceGroupBtn: '🎓 Εξάσκηση',
    markDoneBtn: 'Έμαθα',
    doneBadge: '✓ Ολοκληρώθηκε',
    progressLabel: 'Πρόοδος: {done} / {total}',
    allGroups: 'Όλα',
    exampleLabel: 'Παράδειγμα:',
    groupTestHeading: 'Μίνι τεστ ομάδας',
    groupTestSubtitle: 'Περάστε το τεστ (≥ 80%) για να καταχωρηθεί στον πίνακα γνώσεων',
    groupTestPassedMsg: '🎉 Η ομάδα ολοκληρώθηκε με επιτυχία!',
    groupTestRetryBtn: '🔄 Επανάληψη τεστ',
    groupTestNextBtn: 'Επόμενο →',
    groupTestFinishBtn: 'Τέλος τεστ',
    groupTestFailMsg: 'Αποτέλεσμα: {score} / {total} ({pct}%). Απαιτείται ≥ 80%.',
  },
  hi: {
    backBtn: 'वापस',
    practiceGroupBtn: '🎓 अभ्यास करें',
    markDoneBtn: 'सीख लिया',
    doneBadge: '✓ सीखा हुआ',
    progressLabel: 'पूरा हुआ: {done} / {total}',
    allGroups: 'सभी',
    exampleLabel: 'उदाहरण:',
    groupTestHeading: 'समूह मिनी-टेस्ट',
    groupTestSubtitle: 'नॉलेज मैट्रिक्स में पूरा करने के लिए ≥ 80% अंक प्राप्त करें',
    groupTestPassedMsg: '🎉 समूह पास और पूरा हो गया!',
    groupTestRetryBtn: '🔄 फिर से टेस्ट दें',
    groupTestNextBtn: 'अगला →',
    groupTestFinishBtn: 'टेस्ट समाप्त करें',
    groupTestFailMsg: 'स्कोर: {score} / {total} ({pct}%)। पास होने के लिए ≥ 80% ज़रूरी है।',
  },
  hu: {
    backBtn: 'Vissza',
    practiceGroupBtn: '🎓 Gyakorlás',
    markDoneBtn: 'Megtanulva',
    doneBadge: '✓ Megtanulva',
    progressLabel: 'Elsajátítva: {done} / {total}',
    allGroups: 'Mind',
    exampleLabel: 'Példa:',
    groupTestHeading: 'Csoport miniteszt',
    groupTestSubtitle: 'Érj el ≥ 80%-ot a csoport tudásmátrixban való jóváhagyásához',
    groupTestPassedMsg: '🎉 Csoport teljesítve!',
    groupTestRetryBtn: '🔄 Teszt megismétlése',
    groupTestNextBtn: 'Tovább →',
    groupTestFinishBtn: 'Teszt befejezése',
    groupTestFailMsg: 'Eredmény: {score} / {total} ({pct}%). Legalább ≥ 80% szükséges.',
  },
  id: {
    backBtn: 'Kembali',
    practiceGroupBtn: '🎓 Latihan',
    markDoneBtn: 'Sudah dipelajari',
    doneBadge: '✓ Dipelajari',
    progressLabel: 'Dikuasai: {done} / {total}',
    allGroups: 'Semua',
    exampleLabel: 'Contoh:',
    groupTestHeading: 'Mini-Tes Grup',
    groupTestSubtitle: 'Lulus tes (≥ 80%) agar grup tercatat dikuasai di Matriks Pengetahuan',
    groupTestPassedMsg: '🎉 Grup lulus & dikuasai!',
    groupTestRetryBtn: '🔄 Ulangi tes',
    groupTestNextBtn: 'Berikutnya →',
    groupTestFinishBtn: 'Selesaikan tes',
    groupTestFailMsg: 'Skor: {score} / {total} ({pct}%). Butuh ≥ 80% untuk lulus.',
  },
  it: {
    backBtn: 'Indietro',
    practiceGroupBtn: '🎓 Allenamento',
    markDoneBtn: 'Imparato',
    doneBadge: '✓ Imparato',
    progressLabel: 'Completati: {done} / {total}',
    allGroups: 'Tutti',
    exampleLabel: 'Esempio:',
    groupTestHeading: 'Mini-test del gruppo',
    groupTestSubtitle: 'Supera il test (≥ 80%) per registrare il gruppo nella matrice',
    groupTestPassedMsg: '🎉 Gruppo superato e completato!',
    groupTestRetryBtn: '🔄 Ripeti test',
    groupTestNextBtn: 'Avanti →',
    groupTestFinishBtn: 'Termina test',
    groupTestFailMsg: 'Punteggio: {score} / {total} ({pct}%). Serve ≥ 80% per superare.',
  },
  ja: {
    backBtn: '戻る',
    practiceGroupBtn: '🎓 練習する',
    markDoneBtn: '学習済みにする',
    doneBadge: '✓ 学習済み',
    progressLabel: '習得：{done} / {total}',
    allGroups: 'すべて',
    exampleLabel: '例文：',
    groupTestHeading: 'グループ小テスト',
    groupTestSubtitle: '80%以上で合格し、知識マトリックスに記録されます',
    groupTestPassedMsg: '🎉 合格して習得済みになりました！',
    groupTestRetryBtn: '🔄 もう一度受ける',
    groupTestNextBtn: '次へ →',
    groupTestFinishBtn: 'テスト終了',
    groupTestFailMsg: 'スコア：{score} / {total}（{pct}%）。合格には80%以上必要です。',
  },
  kk: {
    backBtn: 'Артқа',
    practiceGroupBtn: '🎓 Жаттығу',
    markDoneBtn: 'Меңгерілді',
    doneBadge: '✓ Меңгерілді',
    progressLabel: 'Меңгерілді: {done} / {total}',
    allGroups: 'Барлығы',
    exampleLabel: 'Мысал:',
    groupTestHeading: 'Топ бойынша шағын тест',
    groupTestSubtitle: 'Білім матрицасында есептелуі үшін тестті тапсырыңыз (≥ 80%)',
    groupTestPassedMsg: '🎉 Топ сәтті өтілді!',
    groupTestRetryBtn: '🔄 Қайта тапсыру',
    groupTestNextBtn: 'Келесі →',
    groupTestFinishBtn: 'Тестті аяқтау',
    groupTestFailMsg: 'Нәтиже: {score} / {total} ({pct}%). Өту үшін ≥ 80% қажет.',
  },
  ko: {
    backBtn: '뒤로',
    practiceGroupBtn: '🎓 연습하기',
    markDoneBtn: '학습 완료',
    doneBadge: '✓ 완료',
    progressLabel: '완료: {done} / {total}',
    allGroups: '전체',
    exampleLabel: '예문:',
    groupTestHeading: '그룹 미니 테스트',
    groupTestSubtitle: '80% 이상 통과하면 지식 매트릭스에 완료로 반영됩니다',
    groupTestPassedMsg: '🎉 그룹 테스트 통과 및 완료!',
    groupTestRetryBtn: '🔄 다시 풀기',
    groupTestNextBtn: '다음 →',
    groupTestFinishBtn: '테스트 완료',
    groupTestFailMsg: '점수: {score} / {total} ({pct}%). 통과하려면 ≥ 80%가 필요합니다.',
  },
  lv: {
    backBtn: 'Atpakaļ',
    practiceGroupBtn: '🎓 Treniņš',
    markDoneBtn: 'Apgūts',
    doneBadge: '✓ Apgūts',
    progressLabel: 'Apgūts: {done} / {total}',
    allGroups: 'Visi',
    exampleLabel: 'Piemērs:',
    groupTestHeading: 'Grupas minitests',
    groupTestSubtitle: 'Nokārtojiet testu (≥ 80%), lai grupa tiktu ieskaitīta zināšanu matricā',
    groupTestPassedMsg: '🎉 Grupa nokārtota un ieskaitīta!',
    groupTestRetryBtn: '🔄 Atkārtot testu',
    groupTestNextBtn: 'Tālāk →',
    groupTestFinishBtn: 'Pabeigt testu',
    groupTestFailMsg: 'Rezultāts: {score} / {total} ({pct}%). Nepieciešami ≥ 80%.',
  },
  lt: {
    backBtn: 'Atgal',
    practiceGroupBtn: '🎓 Treniruotė',
    markDoneBtn: 'Išmokta',
    doneBadge: '✓ Išmokta',
    progressLabel: 'Išmokta: {done} / {total}',
    allGroups: 'Visi',
    exampleLabel: 'Pavyzdys:',
    groupTestHeading: 'Grupės mini testas',
    groupTestSubtitle: 'Išlaikykite testą (≥ 80 %), kad grupė būtų įskaityta žinių matricoje',
    groupTestPassedMsg: '🎉 Grupė išlaikyta ir įskaityta!',
    groupTestRetryBtn: '🔄 Kartoti testą',
    groupTestNextBtn: 'Toliau →',
    groupTestFinishBtn: 'Baigti testą',
    groupTestFailMsg: 'Rezultatas: {score} / {total} ({pct} %). Reikia bent ≥ 80 %.',
  },
  fa: {
    backBtn: 'بازگشت',
    practiceGroupBtn: '🎓 تمرین',
    markDoneBtn: 'یاد گرفته شد',
    doneBadge: '✓ یاد گرفته شد',
    progressLabel: 'تسلط: {done} / {total}',
    allGroups: 'همه',
    exampleLabel: 'مثال:',
    groupTestHeading: 'آزمونک گروه',
    groupTestSubtitle: 'برای ثبت در ماتریس دانش، آزمون را با نمره ≥ 80% بگذرانید',
    groupTestPassedMsg: '🎉 گروه با موفقیت گذرانده شد!',
    groupTestRetryBtn: '🔄 تکرار آزمون',
    groupTestNextBtn: 'بعدی →',
    groupTestFinishBtn: 'پایان آزمون',
    groupTestFailMsg: 'امتیاز: {score} / {total} ({pct}%). برای قبولی ≥ 80% لازم است.',
  },
  pl: {
    backBtn: 'Wstecz',
    practiceGroupBtn: '🎓 Trening',
    markDoneBtn: 'Opanowane',
    doneBadge: '✓ Opanowane',
    progressLabel: 'Opanowano: {done} / {total}',
    allGroups: 'Wszystkie',
    exampleLabel: 'Przykład:',
    groupTestHeading: 'Mini-test grupy',
    groupTestSubtitle: 'Zdaj test (≥ 80%), aby zaliczyć grupę w matrycy wiedzy',
    groupTestPassedMsg: '🎉 Grupa zaliczona!',
    groupTestRetryBtn: '🔄 Powtórz test',
    groupTestNextBtn: 'Dalej →',
    groupTestFinishBtn: 'Zakończ test',
    groupTestFailMsg: 'Wynik: {score} / {total} ({pct}%). Do zaliczenia potrzeba ≥ 80%.',
  },
  pt: {
    backBtn: 'Voltar',
    practiceGroupBtn: '🎓 Praticar',
    markDoneBtn: 'Aprendido',
    doneBadge: '✓ Aprendido',
    progressLabel: 'Dominado: {done} / {total}',
    allGroups: 'Todos',
    exampleLabel: 'Exemplo:',
    groupTestHeading: 'Miniteste do grupo',
    groupTestSubtitle: 'Passe no teste (≥ 80%) para concluir este grupo na matriz de conhecimento',
    groupTestPassedMsg: '🎉 Grupo concluído com sucesso!',
    groupTestRetryBtn: '🔄 Refazer teste',
    groupTestNextBtn: 'Seguinte →',
    groupTestFinishBtn: 'Concluir teste',
    groupTestFailMsg: 'Pontuação: {score} / {total} ({pct}%). Precisa de ≥ 80% para passar.',
  },
  'pt-br': {
    backBtn: 'Voltar',
    practiceGroupBtn: '🎓 Тренировка',
    markDoneBtn: 'Aprendido',
    doneBadge: '✓ Aprendido',
    progressLabel: 'Dominado: {done} / {total}',
    allGroups: 'Todos',
    exampleLabel: 'Exemplo:',
    groupTestHeading: 'Miniteste do grupo',
    groupTestSubtitle: 'Passe no teste (≥ 80%) para concluir este grupo na matriz de conhecimento',
    groupTestPassedMsg: '🎉 Grupo aprovado e concluído!',
    groupTestRetryBtn: '🔄 Refazer teste',
    groupTestNextBtn: 'Próximo →',
    groupTestFinishBtn: 'Finalizar teste',
    groupTestFailMsg: 'Pontuação: {score} / {total} ({pct}%). Precisa de ≥ 80% para passar.',
  },
  ro: {
    backBtn: 'Înapoi',
    practiceGroupBtn: '🎓 Antrenament',
    markDoneBtn: 'Învățat',
    doneBadge: '✓ Învățat',
    progressLabel: 'Stăpânit: {done} / {total}',
    allGroups: 'Toate',
    exampleLabel: 'Exemplu:',
    groupTestHeading: 'Minitest de grup',
    groupTestSubtitle: 'Treceți testul (≥ 80%) pentru a valida grupul în matricea de cunoștințe',
    groupTestPassedMsg: '🎉 Grup promovat și învățat!',
    groupTestRetryBtn: '🔄 Repetă testul',
    groupTestNextBtn: 'Următorul →',
    groupTestFinishBtn: 'Finalizează testul',
    groupTestFailMsg: 'Scor: {score} / {total} ({pct}%). Ai nevoie de ≥ 80% pentru promovare.',
  },
  ru: {
    backBtn: 'Назад',
    practiceGroupBtn: '🎓 Тренировка',
    markDoneBtn: 'Отметить изученным',
    doneBadge: '✓ Изучено',
    progressLabel: 'Изучено: {done} / {total}',
    allGroups: 'Все',
    exampleLabel: 'Пример:',
    groupTestHeading: 'Тест по группе',
    groupTestSubtitle: 'Пройдите тест (≥ 80%), чтобы группа засчиталась в Матрице знаний',
    groupTestPassedMsg: '🎉 Группа пройдена и засчитана!',
    groupTestRetryBtn: '🔄 Пройти тест ещё раз',
    groupTestNextBtn: 'Далее →',
    groupTestFinishBtn: 'Завершить тест',
    groupTestFailMsg: 'Результат: {score} / {total} ({pct}%). Нужно ≥ 80% для зачёта.',
  },
  sk: {
    backBtn: 'Späť',
    practiceGroupBtn: '🎓 Precvičiť',
    markDoneBtn: 'Naučené',
    doneBadge: '✓ Naučené',
    progressLabel: 'Zvládnuté: {done} / {total}',
    allGroups: 'Všetko',
    exampleLabel: 'Príklad:',
    groupTestHeading: 'Minikvíz skupiny',
    groupTestSubtitle: 'Zvládnite test (≥ 80 %), aby sa skupina započítala do matice znalostí',
    groupTestPassedMsg: '🎉 Skupina splnená a započítaná!',
    groupTestRetryBtn: '🔄 Zopakovať test',
    groupTestNextBtn: 'Ďalej →',
    groupTestFinishBtn: 'Dokončiť test',
    groupTestFailMsg: 'Výsledok: {score} / {total} ({pct} %). Na splnenie treba ≥ 80 %.',
  },
  sl: {
    backBtn: 'Nazaj',
    practiceGroupBtn: '🎓 Vadba',
    markDoneBtn: 'Naučeno',
    doneBadge: '✓ Naučeno',
    progressLabel: 'Osvojeno: {done} / {total}',
    allGroups: 'Vse',
    exampleLabel: 'Primer:',
    groupTestHeading: 'Mini preizkus skupine',
    groupTestSubtitle: 'Opravite preizkus (≥ 80 %), da se skupina zabeleži v matriki znanja',
    groupTestPassedMsg: '🎉 Skupina opravljena in osvojena!',
    groupTestRetryBtn: '🔄 Ponovi preizkus',
    groupTestNextBtn: 'Naprej →',
    groupTestFinishBtn: 'Končaj preizkus',
    groupTestFailMsg: 'Rezultat: {score} / {total} ({pct} %). Za uspeh potrebujete ≥ 80 %.',
  },
  es: {
    backBtn: 'Atrás',
    practiceGroupBtn: '🎓 Practicar',
    markDoneBtn: 'Aprendido',
    doneBadge: '✓ Aprendido',
    progressLabel: 'Dominado: {done} / {total}',
    allGroups: 'Todos',
    exampleLabel: 'Ejemplo:',
    groupTestHeading: 'Minitest del grupo',
    groupTestSubtitle: 'Supera el test (≥ 80%) para validar este grupo en la matriz de conocimiento',
    groupTestPassedMsg: '🎉 ¡Grupo aprobado y completado!',
    groupTestRetryBtn: '🔄 Repetir test',
    groupTestNextBtn: 'Siguiente →',
    groupTestFinishBtn: 'Finalizar test',
    groupTestFailMsg: 'Puntuación: {score} / {total} ({pct}%). Necesitas ≥ 80% para aprobar.',
  },
  'es-mx': {
    backBtn: 'Atrás',
    practiceGroupBtn: '🎓 Practicar',
    markDoneBtn: 'Aprendido',
    doneBadge: '✓ Aprendido',
    progressLabel: 'Dominado: {done} / {total}',
    allGroups: 'Todos',
    exampleLabel: 'Ejemplo:',
    groupTestHeading: 'Minitest del grupo',
    groupTestSubtitle: 'Pasa el test (≥ 80%) para acreditar este grupo en la matriz de conocimiento',
    groupTestPassedMsg: '🎉 ¡Grupo aprobado y completado!',
    groupTestRetryBtn: '🔄 Repetir test',
    groupTestNextBtn: 'Siguiente →',
    groupTestFinishBtn: 'Terminar test',
    groupTestFailMsg: 'Resultado: {score} / {total} ({pct}%). Necesitas ≥ 80% para aprobar.',
  },
  sv: {
    backBtn: 'Tillbaka',
    practiceGroupBtn: '🎓 Öva',
    markDoneBtn: 'Inlärd',
    doneBadge: '✓ Inlärd',
    progressLabel: 'Behärskat: {done} / {total}',
    allGroups: 'Alla',
    exampleLabel: 'Exempel:',
    groupTestHeading: 'Gruppens minitest',
    groupTestSubtitle: 'Klara testet (≥ 80%) för att få gruppen godkänd i kunskapsmatrisen',
    groupTestPassedMsg: '🎉 Gruppen godkänd och avklarad!',
    groupTestRetryBtn: '🔄 Gör om testet',
    groupTestNextBtn: 'Nästa →',
    groupTestFinishBtn: 'Avsluta test',
    groupTestFailMsg: 'Resultat: {score} / {total} ({pct}%). Kräver ≥ 80% för godkänt.',
  },
  th: {
    backBtn: 'ย้อนกลับ',
    practiceGroupBtn: '🎓 ฝึกฝน',
    markDoneBtn: 'เรียนแล้ว',
    doneBadge: '✓ เรียนแล้ว',
    progressLabel: 'เชี่ยวชาญแล้ว: {done} / {total}',
    allGroups: 'ทั้งหมด',
    exampleLabel: 'ตัวอย่าง:',
    groupTestHeading: 'มินิเทสต์ประจำกลุ่ม',
    groupTestSubtitle: 'สอบผ่าน (≥ 80%) เพื่อบันทึกว่าเรียนจบกลุ่มนี้ในเมทริกซ์ความรู้',
    groupTestPassedMsg: '🎉 ผ่านการทดสอบและบันทึกผลแล้ว!',
    groupTestRetryBtn: '🔄 ทำแบบทดสอบอีกครั้ง',
    groupTestNextBtn: 'ถัดไป →',
    groupTestFinishBtn: 'จบการทดสอบ',
    groupTestFailMsg: 'คะแนน: {score} / {total} ({pct}%) ต้องได้ ≥ 80% จึงจะผ่าน',
  },
  tr: {
    backBtn: 'Geri',
    practiceGroupBtn: '🎓 Pratik yap',
    markDoneBtn: 'Öğrenildi',
    doneBadge: '✓ Öğrenildi',
    progressLabel: 'Tamamlanan: {done} / {total}',
    allGroups: 'Tümü',
    exampleLabel: 'Örnek:',
    groupTestHeading: 'Grup Mini Testi',
    groupTestSubtitle: 'Grubun Bilgi Matrisi’nde tamamlanması için testi geçin (≥ %80)',
    groupTestPassedMsg: '🎉 Grup geçildi ve tamamlandı!',
    groupTestRetryBtn: '🔄 Testi tekrarla',
    groupTestNextBtn: 'Sonraki →',
    groupTestFinishBtn: 'Testi bitir',
    groupTestFailMsg: 'Puan: {score} / {total} (%{pct}). Geçmek için ≥ %80 gerekli.',
  },
  uk: {
    backBtn: 'Назад',
    practiceGroupBtn: '🎓 Тренування',
    markDoneBtn: 'Позначити вивченим',
    doneBadge: '✓ Вивчено',
    progressLabel: 'Вивчено: {done} / {total}',
    allGroups: 'Усі',
    exampleLabel: 'Приклад:',
    groupTestHeading: 'Тест за групою',
    groupTestSubtitle: 'Пройдіть тест (≥ 80%), щоб група зарахувалася в Матриці знань',
    groupTestPassedMsg: '🎉 Групу пройдено та зараховано!',
    groupTestRetryBtn: '🔄 Пройти тест ще раз',
    groupTestNextBtn: 'Далі →',
    groupTestFinishBtn: 'Завершити тест',
    groupTestFailMsg: 'Результат: {score} / {total} ({pct}%). Потрібно ≥ 80% для зарахування.',
  },
  ur: {
    backBtn: 'واپس',
    practiceGroupBtn: '🎓 مشق',
    markDoneBtn: 'سیکھ لیا',
    doneBadge: '✓ سیکھ لیا',
    progressLabel: 'مکمل: {done} / {total}',
    allGroups: 'سب',
    exampleLabel: 'مثال:',
    groupTestHeading: 'گروپ منی ٹیسٹ',
    groupTestSubtitle: 'نالج میٹرکس میں مکمل شمار ہونے کے لیے ≥ 80% اسکور کریں',
    groupTestPassedMsg: '🎉 گروپ پاس اور مکمل ہو گیا!',
    groupTestRetryBtn: '🔄 ٹیسٹ دوبارہ دیں',
    groupTestNextBtn: 'اگلا →',
    groupTestFinishBtn: 'ٹیسٹ ختم کریں',
    groupTestFailMsg: 'اسکور: {score} / {total} ({pct}%)۔ کامیابی کے لیے ≥ 80% درکار ہے۔',
  },
  vi: {
    backBtn: 'Quay lại',
    practiceGroupBtn: '🎓 Luyện tập',
    markDoneBtn: 'Đã học',
    doneBadge: '✓ Đã học',
    progressLabel: 'Đã nắm vững: {done} / {total}',
    allGroups: 'Tất cả',
    exampleLabel: 'Ví dụ:',
    groupTestHeading: 'Bài kiểm tra nhóm',
    groupTestSubtitle: 'Đạt ≥ 80% để hoàn thành nhóm này trong Ma trận kiến thức',
    groupTestPassedMsg: '🎉 Đã vượt qua và hoàn thành nhóm!',
    groupTestRetryBtn: '🔄 Làm lại bài kiểm tra',
    groupTestNextBtn: 'Tiếp theo →',
    groupTestFinishBtn: 'Hoàn tất bài kiểm tra',
    groupTestFailMsg: 'Điểm: {score} / {total} ({pct}%). Cần đạt ≥ 80% để hoàn thành.',
  },
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeLang(lang) {
  const raw = String(lang || 'ru').toLowerCase();
  if (raw === 'pt-br' || raw === 'es-mx') return raw;
  return raw.split(/[-_]/)[0] || 'ru';
}

function pickLocale(map, lang, fallbackKey = 'en') {
  if (!map || typeof map !== 'object') return '';
  const norm = normalizeLang(lang);
  if (map[norm] !== undefined) return map[norm];
  const base = norm.split('-')[0];
  if (map[base] !== undefined) return map[base];
  return map[fallbackKey] ?? map.ru ?? '';
}

function cleanPracticeWord(raw) {
  let s = String(raw || '').trim();
  if (!s) return '';
  if (s === 'not only ... but (also)') return 'not only ... but also';
  if (s === 'the (more) ... the (more)') return 'the more ... the more';
  if (s === 'that is (i.e.)') return 'that is';
  if (s === 'versus (vs.)') return 'versus';
  s = s.replace(/\s*\([^)]*\)/g, '').trim();
  return s;
}

function toSpeakableText(raw) {
  let s = cleanPracticeWord(raw);
  if (s.includes(' / ')) {
    s = s.split(' / ')[0].trim();
  }
  s = s.replace(/\s*\.\.\.\s*/g, ' ... ').replace(/\s+/g, ' ').trim();
  return s;
}

export function loadGrammarRefDoneSet() {
  try {
    if (typeof localStorage === 'undefined') return new Set();
    const raw = localStorage.getItem(STORAGE_KEY_DONE);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch (_) {
    return new Set();
  }
}

export function saveGrammarRefDoneSet(set) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_DONE, JSON.stringify([...set]));
  } catch (_) {}
}

function getCefrStyle(level) {
  switch (level) {
    case 'A1':
      return 'background: rgba(34,197,94,0.16); color: var(--gref-a1, #15803d); border-color: rgba(34,197,94,0.35);';
    case 'A2':
      return 'background: var(--gref-accent-soft); color: var(--gref-accent); border-color: var(--gref-accent-border);';
    case 'B1':
      return 'background: rgba(245,158,11,0.16); color: var(--gref-b1, #b45309); border-color: rgba(245,158,11,0.35);';
    default:
      return 'background: rgba(168,85,247,0.16); color: var(--gref-b2, #7e22ce); border-color: rgba(168,85,247,0.35);';
  }
}

function getStylesHtml() {
  return `
    <style>
      .gref-page {
        --gref-accent: #2563eb;
        --gref-accent-soft: rgba(37, 99, 235, 0.11);
        --gref-accent-border: rgba(37, 99, 235, 0.38);
        --gref-surface-muted: rgba(148, 163, 184, 0.10);
        --gref-a1: #15803d;
        --gref-b1: #b45309;
        --gref-b2: #7e22ce;
        width: 100%;
        max-width: 760px;
        min-width: 0;
        margin: 0 auto;
        padding: 4px 14px calc(max(52px, var(--safe-bottom, env(safe-area-inset-bottom, 0px))) + 24px);
        box-sizing: border-box;
        overflow-x: hidden;
      }
      body.dark-theme .gref-page,
      .dark-theme .gref-page,
      [data-theme="dark"] .gref-page {
        --gref-accent: #38bdf8;
        --gref-accent-soft: rgba(56, 189, 248, 0.14);
        --gref-accent-border: rgba(56, 189, 248, 0.42);
        --gref-a1: #4ade80;
        --gref-b1: #fbbf24;
        --gref-b2: #c084fc;
      }
      .gref-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }
      .gref-back-btn {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.28));
        color: var(--text-main, #0f172a);
        border-radius: 12px;
        padding: 7px 14px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .gref-back-btn:active { transform: scale(0.97); }
      .gref-progress-pill {
        font-size: 12.5px;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 999px;
        background: var(--gref-accent-soft);
        border: 1px solid var(--gref-accent-border);
        color: var(--gref-accent);
        white-space: nowrap;
      }
      .gref-hero {
        margin-bottom: 14px;
      }
      .gref-hero-title {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        line-height: 1.25;
      }
      .gref-hero-sub {
        margin: 5px 0 0;
        font-size: 13.5px;
        color: var(--text-muted, #64748b);
        line-height: 1.45;
      }
      .gref-intro-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--gref-accent-border);
        border-radius: 16px;
        padding: 13px 14px;
        margin-bottom: 14px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
      }
      body.dark-theme .gref-intro-card,
      .dark-theme .gref-intro-card,
      [data-theme="dark"] .gref-intro-card {
        background: rgba(30, 41, 59, 0.72);
      }
      .gref-intro-title {
        margin: 0 0 9px;
        font-size: 14px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
      }
      body.dark-theme .gref-intro-title,
      .dark-theme .gref-intro-title {
        color: #f8fafc;
      }
      .gref-intro-rows {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .gref-intro-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--text-muted, #475569);
      }
      body.dark-theme .gref-intro-row,
      .dark-theme .gref-intro-row {
        color: #cbd5e1;
      }
      .gref-intro-badge {
        flex-shrink: 0;
        font-size: 11px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--gref-accent-soft);
        color: var(--gref-accent);
        border: 1px solid var(--gref-accent-border);
      }
      .gref-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }
      .gref-tab-btn {
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.28));
        background: var(--card-bg, #ffffff);
        color: var(--text-muted, #64748b);
        border-radius: 12px;
        padding: 7px 12px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .gref-tab-btn.is-active {
        background: var(--gref-accent);
        border-color: var(--gref-accent);
        color: #ffffff;
      }
      body.dark-theme .gref-tab-btn.is-active,
      .dark-theme .gref-tab-btn.is-active,
      [data-theme="dark"] .gref-tab-btn.is-active {
        color: #0f172a;
      }
      .gref-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
      }
      .gref-filter-chip {
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.28));
        background: var(--card-bg, #ffffff);
        color: var(--text-muted, #64748b);
        border-radius: 999px;
        padding: 5px 11px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .gref-filter-chip.is-active {
        background: var(--gref-accent-soft);
        border-color: var(--gref-accent-border);
        color: var(--gref-accent);
      }
      .gref-callout {
        background: rgba(245, 158, 11, 0.10);
        border: 1.5px solid rgba(245, 158, 11, 0.36);
        border-radius: 16px;
        padding: 13px 14px;
        margin-bottom: 14px;
      }
      .gref-callout-title {
        margin: 0 0 6px;
        font-size: 14.5px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
      }
      .gref-callout-rule {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.45;
        color: var(--text-main, #0f172a);
      }
      .gref-callout-examples {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .gref-callout-ex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.22));
        border-radius: 10px;
        padding: 7px 10px;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main, #0f172a);
      }
      .gref-card {
        background: var(--card-bg, #ffffff);
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.24));
        border-radius: 18px;
        padding: 14px;
        margin-bottom: 14px;
        box-shadow: var(--shadow-sm, 0 4px 12px rgba(15, 23, 42, 0.05));
      }
      .gref-card.is-done {
        border-color: rgba(16, 185, 129, 0.45);
      }
      .gref-card-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }
      .gref-card-title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
      }
      .gref-card-title {
        margin: 0;
        font-size: 16.5px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
      }
      .gref-cefr-badge {
        font-size: 11px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid transparent;
      }
      .gref-card-desc {
        margin: 4px 0 0;
        font-size: 13px;
        color: var(--text-muted, #64748b);
        line-height: 1.4;
      }
      .gref-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .gref-done-btn,
      .gref-practice-btn {
        border-radius: 10px;
        padding: 6px 11px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.3));
        background: transparent;
        color: var(--text-main, #0f172a);
      }
      .gref-done-btn.is-done {
        background: rgba(16, 185, 129, 0.16);
        border-color: #10b981;
        color: #10b981;
      }
      .gref-practice-btn {
        border: none;
        border-radius: 12px;
        padding: 9px 16px;
        font-size: 13.5px;
        font-weight: 800;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 3px 10px rgba(22, 163, 74, 0.28);
        transition: transform 0.12s ease;
      }
      .gref-practice-btn:active,
      .gref-done-btn:active {
        transform: scale(0.96);
      }
      .gref-matrix-wrap {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-radius: 12px;
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.22));
      }
      .gref-matrix-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 560px;
        font-size: 12.5px;
      }
      .gref-matrix-table th,
      .gref-matrix-table td {
        padding: 8px 9px;
        border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
        border-right: 1px solid var(--border-color, rgba(148, 163, 184, 0.14));
        text-align: left;
        vertical-align: top;
      }
      .gref-matrix-table th {
        background: var(--gref-surface-muted);
        font-weight: 800;
        color: var(--text-main, #0f172a);
        font-size: 11.5px;
      }
      .gref-matrix-rowhead {
        font-weight: 700;
        color: var(--text-muted, #64748b);
        white-space: nowrap;
        background: var(--gref-surface-muted);
      }
      .gref-matrix-cell-btn {
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        text-align: left;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
        color: inherit;
      }
      .gref-matrix-word {
        font-weight: 800;
        font-size: 13.5px;
        color: var(--gref-accent);
      }
      .gref-matrix-tr {
        font-size: 11px;
        color: var(--text-muted, #64748b);
        line-height: 1.25;
      }
      .gref-items-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .gref-item-row {
        background: var(--gref-surface-muted);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
        border-radius: 12px;
        padding: 10px 12px;
      }
      .gref-item-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }
      .gref-item-word-wrap {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
      }
      .gref-fanboys-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: var(--gref-accent);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 900;
        flex-shrink: 0;
      }
      body.dark-theme .gref-fanboys-badge,
      .dark-theme .gref-fanboys-badge,
      [data-theme="dark"] .gref-fanboys-badge {
        color: #0f172a;
      }
      .gref-item-word {
        font-size: 15px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        direction: ltr;
        unicode-bidi: isolate;
      }
      .gref-speak-btn {
        border: 1px solid var(--gref-accent-border);
        background: var(--gref-accent-soft);
        color: var(--gref-accent);
        border-radius: 8px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .gref-speak-btn:active { transform: scale(0.92); }
      .gref-item-tr {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--gref-accent);
      }
      .gref-item-note {
        margin: 5px 0 0;
        font-size: 12px;
        color: var(--text-muted, #64748b);
        line-height: 1.35;
      }
      .gref-item-example {
        margin-top: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 12.5px;
        color: var(--text-main, #0f172a);
        padding-top: 6px;
        border-top: 1px dashed var(--border-color, rgba(148, 163, 184, 0.22));
      }
      .gref-ex-text-wrap {
        min-width: 0;
        flex: 1;
      }
      .gref-ex-label {
        font-weight: 700;
        color: var(--text-muted, #64748b);
        margin-inline-end: 4px;
      }
      .gref-ex-en {
        direction: ltr;
        unicode-bidi: isolate;
        font-weight: 600;
      }
      .gref-cross-box {
        margin-top: 18px;
        padding: 13px 14px;
        border-radius: 16px;
        background: var(--card-bg, #ffffff);
        border: 1px solid var(--border-color, rgba(148, 163, 184, 0.24));
      }
      .gref-cross-title {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 800;
        color: var(--text-muted, #64748b);
      }
      .gref-cross-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }
      .gref-cross-chip {
        border: 1px solid var(--gref-accent-border);
        background: var(--gref-accent-soft);
        color: var(--gref-accent);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .gref-cross-chip:active { transform: scale(0.96); }
      .gref-filter-chip.is-done:not(.is-active) {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.12);
        color: #15803d;
      }
      body.dark-theme .gref-filter-chip.is-done:not(.is-active),
      .dark-theme .gref-filter-chip.is-done:not(.is-active),
      [data-theme="dark"] .gref-filter-chip.is-done:not(.is-active) {
        border-color: rgba(74, 222, 128, 0.72);
        background: rgba(34, 197, 94, 0.16);
        color: #86efac;
      }
      .gref-card.is-done {
        border: 2px solid #22c55e !important;
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.2);
      }
      .gref-done-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border-radius: 10px;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: 800;
        background: rgba(34, 197, 94, 0.16);
        border: 1px solid #22c55e;
        color: #15803d;
      }
      body.dark-theme .gref-done-pill,
      .dark-theme .gref-done-pill,
      [data-theme="dark"] .gref-done-pill {
        color: #86efac;
      }
      .gref-test-box {
        margin-top: 14px;
        padding: 13px;
        border-radius: 14px;
        border: 1.5px solid var(--gref-accent-border);
        background: var(--gref-surface-muted);
      }
      .gref-test-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }
      .gref-test-title {
        margin: 0;
        font-size: 14.5px;
        font-weight: 800;
        color: var(--gref-accent);
      }
      .gref-test-counter {
        font-size: 12px;
        font-weight: 800;
        color: var(--text-muted, #64748b);
      }
      .gref-test-sub {
        margin: 0 0 10px;
        font-size: 12.5px;
        color: var(--text-muted, #64748b);
      }
      .gref-test-prompt {
        font-size: 14.5px;
        font-weight: 800;
        color: var(--text-main, #0f172a);
        line-height: 1.45;
        margin-bottom: 6px;
      }
      .gref-test-hint {
        font-size: 12.5px;
        color: var(--text-muted, #64748b);
        margin-bottom: 10px;
      }
      .gref-filled-answer {
        color: #15803d;
        background: rgba(34, 197, 94, 0.16);
        padding: 1px 6px;
        border-radius: 6px;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      body.dark-theme .gref-filled-answer,
      .dark-theme .gref-filled-answer,
      [data-theme="dark"] .gref-filled-answer {
        color: #4ade80;
        background: rgba(34, 197, 94, 0.22);
      }
      .gref-test-opts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      @media (max-width: 440px) {
        .gref-test-opts { grid-template-columns: 1fr; }
      }
      .gref-test-opt {
        border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.3));
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #0f172a);
        border-radius: 11px;
        padding: 9px 11px;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
      }
      .gref-test-opt.is-correct {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.16);
        color: #15803d;
      }
      .gref-test-opt.is-wrong {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.14);
        color: #b91c1c;
      }
      body.dark-theme .gref-test-opt.is-correct,
      .dark-theme .gref-test-opt.is-correct,
      [data-theme="dark"] .gref-test-opt.is-correct {
        color: #86efac;
        background: rgba(34, 197, 94, 0.2);
      }
      body.dark-theme .gref-test-opt.is-wrong,
      .dark-theme .gref-test-opt.is-wrong,
      [data-theme="dark"] .gref-test-opt.is-wrong {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.2);
      }
      .gref-test-next-btn {
        width: 100%;
        border: none;
        border-radius: 11px;
        padding: 9px 14px;
        font-size: 13.5px;
        font-weight: 800;
        background: var(--gref-accent);
        color: #ffffff;
        cursor: pointer;
      }
      body.dark-theme .gref-test-next-btn,
      .dark-theme .gref-test-next-btn,
      [data-theme="dark"] .gref-test-next-btn {
        color: #0f172a;
      }
      .gref-test-result {
        font-size: 13.5px;
        font-weight: 800;
        margin-bottom: 8px;
      }
      .gref-test-result.is-pass { color: #15803d; }
      .gref-test-result.is-fail { color: #d97706; }
      body.dark-theme .gref-test-result.is-pass,
      .dark-theme .gref-test-result.is-pass,
      [data-theme="dark"] .gref-test-result.is-pass { color: #86efac; }
      body.dark-theme .gref-test-result.is-fail,
      .dark-theme .gref-test-result.is-fail,
      [data-theme="dark"] .gref-test-result.is-fail { color: #fbbf24; }
    </style>
  `;
}

export function renderGrammarReferenceView(kind, containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const normalizedKind = ['prepositions', 'pronouns', 'conjunctions'].includes(kind)
    ? kind
    : 'prepositions';

  const {
    onBack = () => {},
    onStartPractice = null,
    onNavigateLink = null,
    initialGroup = 'all',
    initialSection = null,
  } = options;

  const lang = getInterfaceLanguage();
  const normLang = normalizeLang(lang);
  const baseLang = normLang.split('-')[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const ui = GRAMMAR_REF_I18N[normLang] || GRAMMAR_REF_I18N[baseLang] || GRAMMAR_REF_I18N.en;

  const metaMap =
    normalizedKind === 'pronouns'
      ? PRONOUNS_META_I18N
      : normalizedKind === 'conjunctions'
        ? CONJUNCTIONS_META_I18N
        : PREPOSITIONS_META_I18N;
  const meta = metaMap[normLang] || metaMap[baseLang] || metaMap.en;

  let activeSection =
    normalizedKind === 'conjunctions'
      ? (initialSection && initialSection !== 'all' ? initialSection : 'coordinating')
      : null;
  let activeGroup = initialGroup && initialGroup !== 'all' ? initialGroup : '';
  const doneSet = loadGrammarRefDoneSet();
  const groupTests = new Map();

  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen(`grammar_ref_${normalizedKind}`, 'GrammarReferenceView');
  }

  function getAllProgressKeys() {
    if (normalizedKind === 'prepositions') {
      return PREPOSITIONS_GROUPS.map((g) => `prepositions:${g.id}`);
    }
    if (normalizedKind === 'pronouns') {
      return ['pronouns:matrix', ...PRONOUNS_GROUPS.map((g) => `pronouns:${g.id}`)];
    }
    const keys = [];
    for (const sec of CONJUNCTIONS_SECTIONS) {
      if (Array.isArray(sec.groups)) {
        for (const g of sec.groups) keys.push(`conjunctions:${g.id}`);
      } else {
        keys.push(`conjunctions:${sec.id}`);
      }
    }
    return keys;
  }

  function buildPracticeWords(groupId, groupTitle, items) {
    return (items || []).map((it, i) => {
      const cleanWord = cleanPracticeWord(it.word);
      const locTr = pickLocale(it.tr, normLang, 'en') || cleanWord;
      return {
        id: `gref_${normalizedKind}_${groupId}_${i}`,
        word: cleanWord,
        translation: locTr,
        translations: {
          ...(it.tr || {}),
          [baseLang]: locTr,
          ru: it.tr?.ru || locTr,
          en: it.tr?.en || cleanWord,
        },
        notes: it.customNote || groupTitle,
        example: it.example || '',
      };
    });
  }

  function shuffleLocal(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getAllKindWordsPool() {
    const out = [];
    if (normalizedKind === 'prepositions') {
      for (const g of PREPOSITIONS_GROUPS) for (const it of g.items || []) out.push(cleanPracticeWord(it.word));
    } else if (normalizedKind === 'pronouns') {
      for (const row of PRONOUNS_MATRIX.rows) {
        for (const c of ['subject', 'object', 'possessiveDep', 'possessiveAbs', 'reflexive']) {
          out.push(cleanPracticeWord(row[c].word));
        }
      }
      for (const g of PRONOUNS_GROUPS) for (const it of g.items || []) out.push(cleanPracticeWord(it.word));
    } else {
      for (const sec of CONJUNCTIONS_SECTIONS) {
        if (Array.isArray(sec.groups)) {
          for (const g of sec.groups) for (const it of g.items || []) out.push(cleanPracticeWord(it.word));
        } else {
          for (const it of sec.items || []) out.push(cleanPracticeWord(it.word));
        }
      }
    }
    return [...new Set(out.map((w) => w.split(' / ')[0].trim()).filter(Boolean))];
  }

const PRONOUN_MATRIX_CLOZE_BANK = [
  { col: 'subject', sentence: 'My name is Alex. ___ live in London.', answer: 'I', distractors: ['Me', 'My', 'Myself'] },
  { col: 'object', sentence: 'I forgot my umbrella at home. Can you lend ___ yours?', answer: 'me', distractors: ['I', 'my', 'mine'] },
  { col: 'possessiveDep', sentence: 'I bought a new bike yesterday. ___ bike is bright red.', answer: 'My', distractors: ['I', 'Me', 'Mine'] },
  { col: 'possessiveAbs', sentence: 'I left my backpack on the desk. That blue backpack is ___.', answer: 'mine', distractors: ['my', 'me', 'myself'] },
  { col: 'reflexive', sentence: 'I didn’t ask anyone for help. I fixed the computer all by ___.', answer: 'myself', distractors: ['me', 'my', 'mine'] },

  { col: 'subject', sentence: 'Hi, Tom! ___ look very happy today.', answer: 'You', distractors: ['Your', 'Yours', 'Yourself'] },
  { col: 'object', sentence: 'Hey, Anna, wait a second! I want to tell ___ something important.', answer: 'you', distractors: ['your', 'yours', 'yourself'] },
  { col: 'possessiveDep', sentence: 'You dropped a key on the floor, Mike. Is this ___ key?', answer: 'your', distractors: ['you', 'yours', 'yourself'] },
  { col: 'possessiveAbs', sentence: 'You forgot to take your jacket, Kate. This green jacket is ___.', answer: 'yours', distractors: ['your', 'you', 'yourself'] },
  { col: 'reflexive', sentence: 'Be careful with that sharp knife, Sam! Don’t cut ___.', answer: 'yourself', distractors: ['you', 'your', 'yourselves'] },

  { col: 'subject', sentence: 'Tom is my older brother. ___ works as a pilot.', answer: 'He', distractors: ['Him', 'His', 'Himself'] },
  { col: 'object', sentence: 'Mark is calling right now. Please answer ___.', answer: 'him', distractors: ['he', 'his', 'himself'] },
  { col: 'possessiveDep', sentence: 'David bought a new laptop. ___ laptop is super fast.', answer: 'His', distractors: ['He', 'Him', 'Himself'] },
  { col: 'possessiveAbs', sentence: 'That suitcase belongs to John. The black suitcase is ___.', answer: 'his', distractors: ['him', 'he', 'himself'] },
  { col: 'reflexive', sentence: 'Jack didn’t hire a mechanic. He repaired the car ___.', answer: 'himself', distractors: ['him', 'his', 'themselves'] },

  { col: 'subject', sentence: 'Emma speaks three languages. ___ teaches French at a college.', answer: 'She', distractors: ['Her', 'Hers', 'Herself'] },
  { col: 'object', sentence: 'It is Sarah’s birthday today. We bought a gift for ___.', answer: 'her', distractors: ['she', 'hers', 'herself'] },
  { col: 'possessiveDep', sentence: 'Lisa loves painting. ___ paintings hang in the living room.', answer: 'Her', distractors: ['She', 'Hers', 'Herself'] },
  { col: 'possessiveAbs', sentence: 'Emily brought an umbrella to work. This yellow umbrella is ___.', answer: 'hers', distractors: ['her', 'she', 'herself'] },
  { col: 'reflexive', sentence: 'Maria learned Spanish without a tutor. She taught ___.', answer: 'herself', distractors: ['her', 'hers', 'himself'] },

  { col: 'subject', sentence: 'Look at that tall tower! ___ was built 200 years ago.', answer: 'It', distractors: ['Its', 'Itself', 'They'] },
  { col: 'object', sentence: 'I finished reading that novel. I really enjoyed ___.', answer: 'it', distractors: ['its', 'itself', 'them'] },
  { col: 'possessiveDep', sentence: 'The cat is drinking milk from a bowl. ___ fur is soft and white.', answer: 'Its', distractors: ['It', 'Itself', 'Their'] },
  { col: 'reflexive', sentence: 'This phone has a smart battery saver. The screen turns ___ off after one minute.', answer: 'itself', distractors: ['it', 'its', 'himself'] },

  { col: 'subject', sentence: 'My sister and I love hiking. ___ go to the mountains every summer.', answer: 'We', distractors: ['Us', 'Our', 'Ourselves'] },
  { col: 'object', sentence: 'My friends and I are lost. Could you show ___ the way to the station?', answer: 'us', distractors: ['we', 'our', 'ours'] },
  { col: 'possessiveDep', sentence: 'My family moved to a new street. ___ house has a big garden.', answer: 'Our', distractors: ['We', 'Us', 'Ours'] },
  { col: 'possessiveAbs', sentence: 'We parked our car near the gate. That silver car is ___.', answer: 'ours', distractors: ['our', 'us', 'ourselves'] },
  { col: 'reflexive', sentence: 'We didn’t order catering for the party. We cooked all the food ___.', answer: 'ourselves', distractors: ['us', 'our', 'themselves'] },

  { col: 'reflexive', sentence: 'Welcome to the party, everyone! Please help ___ to some snacks.', answer: 'yourselves', distractors: ['yourself', 'you', 'your'] },

  { col: 'subject', sentence: 'My parents live in Italy. ___ run a small bakery there.', answer: 'They', distractors: ['Them', 'Their', 'Themselves'] },
  { col: 'object', sentence: 'The children are waiting outside. Please invite ___ inside.', answer: 'them', distractors: ['they', 'their', 'theirs'] },
  { col: 'possessiveDep', sentence: 'The students finished the project early. ___ presentation won first prize.', answer: 'Their', distractors: ['They', 'Them', 'Theirs'] },
  { col: 'possessiveAbs', sentence: 'That dog belongs to our neighbors. The friendly golden retriever is ___.', answer: 'theirs', distractors: ['their', 'them', 'themselves'] },
  { col: 'reflexive', sentence: 'The kids cleaned the whole room without help. They did it all by ___.', answer: 'themselves', distractors: ['them', 'their', 'ourselves'] },
];

function buildGroupMiniTestQuestions(gId, groupObj, isMatrix) {
    if (isMatrix) {
      return shuffleLocal(PRONOUN_MATRIX_CLOZE_BANK)
        .slice(0, 32)
        .map((q) => {
          const hdr = pickLocale(PRONOUNS_MATRIX.headers[q.col], normLang, 'en');
          return {
            blanked: q.sentence,
            prompt: q.sentence,
            hint: hdr,
            answer: q.answer,
            options: shuffleLocal([q.answer, ...q.distractors]),
          };
        });
    }
    const items = [];
    {
      for (const it of groupObj.items || []) {
        const rawW = cleanPracticeWord(it.word);
        const primary = rawW.split(' / ')[0].trim();
        const tr = pickLocale(it.tr, normLang, 'en');
        if (primary) items.push({ answer: primary, hint: tr, example: String(it.example || '') });
      }
    }

    const globalPool = getAllKindWordsPool();
    const localPool = [...new Set(items.map((x) => x.answer).filter(Boolean))];
    const targetQuizCount = items.length >= 10
      ? Math.min(15, Math.max(10, Math.ceil(items.length * 0.55)))
      : items.length;
    const pickedItems = shuffleLocal(items).slice(0, Math.max(3, targetQuizCount));
    const questions = [];

    for (const item of pickedItems) {
      const ans = item.answer;
      const distractors = [];
      const seen = new Set([ans.toLowerCase()]);
      for (const cand of shuffleLocal([...localPool, ...globalPool])) {
        if (!cand || seen.has(cand.toLowerCase())) continue;
        seen.add(cand.toLowerCase());
        distractors.push(cand);
        if (distractors.length >= 3) break;
      }
      if (distractors.length < 3) continue;

      let blanked = '';
      if (item.example && !ans.includes('...')) {
        const escAns = ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`\\b${escAns}\\b`, 'i');
        if (re.test(item.example)) {
          blanked = item.example.replace(re, '___');
        }
      }
      const promptText = blanked
        || (item.promptLabel ? `${item.promptLabel} → ___` : `${item.hint} → ___`);
      const hintText = blanked
        ? item.hint
        : (item.promptLabel ? item.hint : '');
      questions.push({
        blanked,
        prompt: promptText,
        hint: hintText,
        answer: ans,
        options: shuffleLocal([ans, ...distractors]),
      });
    }
    return questions;
  }

  function getOrInitGroupTest(gId, groupObj, isMatrix) {
    if (!groupTests.has(gId)) {
      groupTests.set(gId, {
        questions: buildGroupMiniTestQuestions(gId, groupObj, isMatrix),
        idx: 0,
        selectedOpt: null,
        checked: false,
        score: 0,
        finished: false,
      });
    }
    return groupTests.get(gId);
  }

  function renderGroupMiniTestHtml(gId, groupObj, isMatrix, isDone) {
    const st = getOrInitGroupTest(gId, groupObj, isMatrix);
    if (!st.questions.length) return '';

    if (st.finished) {
      const total = st.questions.length;
      const pct = Math.round((st.score / total) * 100);
      const passed = pct >= 80;
      const msg = passed
        ? ui.groupTestPassedMsg
        : String(ui.groupTestFailMsg || '{score}/{total} ({pct}%)')
            .replace('{score}', String(st.score))
            .replace('{total}', String(total))
            .replace('{pct}', String(pct));
      return `
        <div class="gref-test-box" data-group-test-box="${escapeHtml(gId)}">
          <div class="gref-test-head">
            <h4 class="gref-test-title">🎯 ${escapeHtml(ui.groupTestHeading)}</h4>
            <span class="gref-test-counter" dir="ltr">${st.score} / ${total} (${pct}%)</span>
          </div>
          <div class="gref-test-result ${passed ? 'is-pass' : 'is-fail'}">${escapeHtml(msg)}</div>
          <button type="button" class="gref-test-next-btn" data-gtest-retry="${escapeHtml(gId)}">${escapeHtml(ui.groupTestRetryBtn)}</button>
        </div>
      `;
    }

    const q = st.questions[st.idx];
    const total = st.questions.length;
    let promptHtml = '';
    if (st.checked && q.prompt.includes('___')) {
      const iPos = q.prompt.indexOf('___');
      promptHtml = `${escapeHtml(q.prompt.slice(0, iPos))}<strong class="gref-filled-answer">${escapeHtml(q.answer)}</strong>${escapeHtml(q.prompt.slice(iPos + 3))}`;
    } else {
      promptHtml = escapeHtml(q.prompt);
    }

    const optsHtml = q.options
      .map((opt, oIdx) => {
        let cls = 'gref-test-opt';
        if (st.checked) {
          if (opt === q.answer) cls += ' is-correct';
          else if (opt === st.selectedOpt) cls += ' is-wrong';
        }
        return `<button type="button" class="${cls}" dir="ltr" data-gtest-opt="${escapeHtml(gId)}:${oIdx}" ${st.checked ? 'disabled' : ''}>${escapeHtml(opt)}</button>`;
      })
      .join('');

    const isLast = st.idx >= total - 1;
    return `
      <div class="gref-test-box" data-group-test-box="${escapeHtml(gId)}">
        <div class="gref-test-head">
          <h4 class="gref-test-title">🎯 ${escapeHtml(ui.groupTestHeading)}</h4>
          <span class="gref-test-counter" dir="ltr">${st.idx + 1} / ${total}</span>
        </div>
        ${!isDone ? `<p class="gref-test-sub">${escapeHtml(ui.groupTestSubtitle)}</p>` : ''}
        <div class="gref-test-prompt" dir="ltr">${promptHtml}</div>
        ${q.hint ? `<div class="gref-test-hint">💡 ${escapeHtml(q.hint)}</div>` : ''}
        <div class="gref-test-opts">${optsHtml}</div>
        ${
          st.checked
            ? `<button type="button" class="gref-test-next-btn" data-gtest-next="${escapeHtml(gId)}">${escapeHtml(isLast ? ui.groupTestFinishBtn : ui.groupTestNextBtn)}</button>`
            : ''
        }
      </div>
    `;
  }

  function saveReturnPoint() {
    try {
      if (typeof navigateWithReturn === 'function') {
        navigateWithReturn({
          view: 'grammar_ref',
          kind: normalizedKind,
          group: activeGroup,
          section: activeSection,
          restore: () =>
            renderGrammarReferenceView(normalizedKind, containerSelector, {
              ...options,
              initialGroup: activeGroup,
              initialSection: activeSection,
            }),
        });
      }
    } catch (_) {}
  }

  const heartIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="none" aria-hidden="true" style="flex-shrink: 0;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const repeatBtnText = (t('fav_practice_btn') || '').replace(/^🔥\s*/, '') || ui.practiceGroupBtn;
  const widgetBtnText = t('col_pill_widget') || 'Виджет';

  function renderStandardGroupActions(gId) {
    const colKey = `gref_${normalizedKind}_${gId}`;
    const isWidgetActive = getActiveCollectionId() === colKey;
    return `
      <div class="gref-std-actions" style="display: flex; flex-direction: column; gap: 10px; margin: 12px 0 14px; width: 100%; box-sizing: border-box;">
        <button type="button" class="secondary-button ${isWidgetActive ? 'is-active-widget-btn' : ''}" data-widget-group="${escapeHtml(gId)}" style="width: 100%; min-width: 0; height: 42px; min-height: 42px; font-size: 14px; font-weight: 600; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; cursor: pointer; ${isWidgetActive ? 'border: 1.5px solid #22c55e; color: #16a34a; background: rgba(34, 197, 94, 0.12);' : ''}">
          <span style="font-size: 15px;">${isWidgetActive ? '✓' : '📱'}</span>
          <span>${escapeHtml(widgetBtnText)}</span>
        </button>
        <button type="button" class="primary-button btn-green" data-practice-group="${escapeHtml(gId)}" style="width: 100%; min-width: 0; min-height: 44px; height: 44px; font-size: clamp(13px, 3.4vw, 14.5px); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 10px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; border-radius: 14px; cursor: pointer;">
          ${heartIconSvg}
          <span>${escapeHtml(repeatBtnText)}</span>
        </button>
      </div>
    `;
  }

  function renderMatrixCard() {
    const doneKey = 'pronouns:matrix';
    const isDone = doneSet.has(doneKey);
    const hdr = PRONOUNS_MATRIX.headers;
    const cols = ['subject', 'object', 'possessiveDep', 'possessiveAbs', 'reflexive'];

    const rowsHtml = PRONOUNS_MATRIX.rows
      .map((row) => {
        const personTxt = pickLocale(row.personLabel, normLang, 'en');
        const cellsHtml = cols
          .map((c) => {
            const cellObj = row[c];
            const cellTr = pickLocale(cellObj.tr, normLang, 'en');
            return `
              <td>
                <button type="button" class="gref-matrix-cell-btn" data-speak-text="${escapeHtml(cellObj.word)}">
                  <span class="gref-matrix-word" dir="ltr">${escapeHtml(cellObj.word)}</span>
                  <span class="gref-matrix-tr">${escapeHtml(cellTr)}</span>
                </button>
              </td>
            `;
          })
          .join('');
        return `
          <tr>
            <td class="gref-matrix-rowhead">${escapeHtml(personTxt)}</td>
            ${cellsHtml}
          </tr>
        `;
      })
      .join('');

    return `
      <section class="gref-card ${isDone ? 'is-done' : ''}" data-group-card="matrix">
        <div class="gref-card-head">
          <div>
            <div class="gref-card-title-row">
              <h3 class="gref-card-title">📊 ${escapeHtml(meta.matrixTitle || getPronounMatrixLabel(normLang))}</h3>
              <span class="gref-cefr-badge" style="${getCefrStyle('A1')}">A1</span>
            </div>
          </div>
          <div class="gref-card-actions">
            ${isDone ? `<span class="gref-done-pill">${escapeHtml(ui.doneBadge)}</span>` : ''}
          </div>
        </div>
        ${renderStandardGroupActions('matrix')}
        <div class="gref-matrix-wrap" dir="ltr">
          <table class="gref-matrix-table">
            <thead>
              <tr>
                <th>${escapeHtml(pickLocale(hdr.person, normLang, 'en'))}</th>
                ${cols.map((c) => `<th>${escapeHtml(pickLocale(hdr[c], normLang, 'en'))}</th>`).join('')}
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        ${renderGroupMiniTestHtml('matrix', null, true, isDone)}
      </section>
    `;
  }

  function renderGroupCard(groupObj, sectionId = null) {
    const gId = groupObj.id;
    const doneKey = `${normalizedKind}:${gId}`;
    const isDone = doneSet.has(doneKey);
    const title = pickLocale(groupObj.title, normLang, 'en');
    const desc = pickLocale(groupObj.desc, normLang, 'en');
    const cefr = groupObj.cefr || 'A1';

    const itemsHtml = (groupObj.items || [])
      .map((it) => {
        const locTr = pickLocale(it.tr, normLang, 'en');
        const noteText = it.note ? pickLocale(it.note, normLang, 'en') : '';
        const speakWordText = toSpeakableText(it.word);
        return `
          <div class="gref-item-row">
            <div class="gref-item-top">
              <div class="gref-item-word-wrap">
                ${it.letter ? `<span class="gref-fanboys-badge">${escapeHtml(it.letter)}</span>` : ''}
                <span class="gref-item-word" dir="ltr">${escapeHtml(it.word)}</span>
                <button type="button" class="gref-speak-btn" data-speak-text="${escapeHtml(speakWordText)}" aria-label="Listen">🔊</button>
              </div>
              <span class="gref-item-tr">${escapeHtml(locTr)}</span>
            </div>
            ${noteText ? `<p class="gref-item-note">${escapeHtml(noteText)}</p>` : ''}
            ${
              it.example
                ? `
              <div class="gref-item-example">
                <div class="gref-ex-text-wrap">
                  <span class="gref-ex-label">${escapeHtml(ui.exampleLabel)}</span>
                  <span class="gref-ex-en" dir="ltr">${escapeHtml(it.example)}</span>
                </div>
                <button type="button" class="gref-speak-btn" data-speak-text="${escapeHtml(it.example)}" aria-label="Listen example">🔊</button>
              </div>
            `
                : ''
            }
          </div>
        `;
      })
      .join('');

    return `
      <section class="gref-card ${isDone ? 'is-done' : ''}" data-group-card="${escapeHtml(gId)}" ${sectionId ? `data-section-id="${escapeHtml(sectionId)}"` : ''}>
        <div class="gref-card-head">
          <div>
            <div class="gref-card-title-row">
              <h3 class="gref-card-title">${escapeHtml(groupObj.icon || '')} ${escapeHtml(title)}</h3>
              <span class="gref-cefr-badge" style="${getCefrStyle(cefr)}">${escapeHtml(cefr)}</span>
            </div>
            ${desc ? `<p class="gref-card-desc">${escapeHtml(desc)}</p>` : ''}
          </div>
          <div class="gref-card-actions">
            ${isDone ? `<span class="gref-done-pill">${escapeHtml(ui.doneBadge)}</span>` : ''}
          </div>
        </div>
        ${renderStandardGroupActions(gId)}
        <div class="gref-items-list">${itemsHtml}</div>
        ${renderGroupMiniTestHtml(gId, groupObj, false, isDone)}
      </section>
    `;
  }

  function renderPunctuationCallout() {
    if (normalizedKind !== 'conjunctions') return '';
    if (activeSection !== 'all' && activeSection !== 'conjunctive_adverbs') return '';
    const examples = Array.isArray(meta.punctuationExamples) ? meta.punctuationExamples : [];
    return `
      <div class="gref-callout">
        <h3 class="gref-callout-title">💡 ${escapeHtml(meta.punctuationTitle || '')}</h3>
        <p class="gref-callout-rule">${escapeHtml(meta.punctuationRule || '')}</p>
        <div class="gref-callout-examples">
          ${examples
            .map(
              (ex) => `
            <div class="gref-callout-ex">
              <span dir="ltr">${escapeHtml(ex)}</span>
              <button type="button" class="gref-speak-btn" data-speak-text="${escapeHtml(ex)}" aria-label="Listen">🔊</button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  function renderCrossLinksBox() {
    let related = [];
    let crossStrings = {};
    try {
      related = getRelatedMicroRulesForCollection?.(normalizedKind) || [];
    } catch (_) {}
    try {
      crossStrings = getCrossLinkStrings?.(baseLang) || {};
    } catch (_) {}

    if (!Array.isArray(related) || related.length === 0) return '';

    const heading =
      crossStrings.relatedMicroRulesTitle ||
      crossStrings.relatedTitle ||
      crossStrings.heading ||
      crossStrings.title ||
      '📘 Related Micro-Rules';

    return `
      <div class="gref-cross-box">
        <h4 class="gref-cross-title">${escapeHtml(heading)}</h4>
        <div class="gref-cross-chips">
          ${related
            .map((rule) => {
              const rId = typeof rule === 'object' ? (rule.id ?? rule.ruleId ?? '') : rule;
              const rawTitle =
                typeof rule === 'object'
                  ? pickLocale(rule.title, normLang, 'en') ||
                    (typeof rule.title === 'string' ? rule.title : '') ||
                    (typeof rule.label === 'object' ? pickLocale(rule.label, normLang, 'en') : rule.label) ||
                    `#${rId}`
                  : `#${rId}`;
              const cefr = typeof rule === 'object' && (rule.cefr || rule.level) ? ` · ${rule.cefr || rule.level}` : '';
              return `
                <button type="button" class="gref-cross-chip" data-cross-rule-id="${escapeHtml(rId)}">
                  ${escapeHtml(rawTitle)}${escapeHtml(cefr)}
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function getVisibleGroupsAndMap() {
    const groupMap = new Map();
    const filterList = [];

    if (normalizedKind === 'prepositions') {
      for (const g of PREPOSITIONS_GROUPS) {
        groupMap.set(g.id, { group: g, sectionId: null });
        filterList.push({ id: g.id, label: `${g.icon} ${pickLocale(g.title, normLang, 'en')}` });
      }
    } else if (normalizedKind === 'pronouns') {
      const matrixItems = [];
      const cols = ['subject', 'object', 'possessiveDep', 'possessiveAbs', 'reflexive'];
      const personalGroupNote = getPersonalPronounsGroupLabel(normLang);
      for (const row of PRONOUNS_MATRIX.rows) {
        for (const c of cols) {
          matrixItems.push({
            word: row[c].word,
            tr: row[c].tr,
            customNote: personalGroupNote,
            example: pickLocale(PRONOUNS_MATRIX.headers[c], normLang, 'en'),
          });
        }
      }
      groupMap.set('matrix', {
        isMatrix: true,
        group: { id: 'matrix', title: { [baseLang]: meta.matrixTitle, en: 'Matrix', ru: 'Матрица' }, items: matrixItems },
      });
      filterList.push({ id: 'matrix', label: `📊 ${getPronounMatrixLabel(normLang)}` });
      for (const g of PRONOUNS_GROUPS) {
        groupMap.set(g.id, { group: g, sectionId: null });
        filterList.push({ id: g.id, label: `${g.icon} ${pickLocale(g.title, normLang, 'en')}` });
      }
    } else {
      for (const sec of CONJUNCTIONS_SECTIONS) {
        const secVisible = !activeSection || activeSection === 'all' || activeSection === sec.id;
        if (Array.isArray(sec.groups)) {
          for (const g of sec.groups) {
            groupMap.set(g.id, { group: g, sectionId: sec.id });
            if (secVisible) {
              filterList.push({ id: g.id, label: `${g.icon} ${pickLocale(g.title, normLang, 'en')}` });
            }
          }
        } else {
          groupMap.set(sec.id, { group: sec, sectionId: sec.id });
          if (secVisible) {
            filterList.push({ id: sec.id, label: `${sec.icon} ${pickLocale(sec.title, normLang, 'en')}` });
          }
        }
      }
    }

    if (!activeGroup || activeGroup === 'all' || !filterList.some((f) => f.id === activeGroup)) {
      activeGroup = filterList[0]?.id || '';
    }

    return { groupMap, filterList };
  }

  function render() {
    const progressKeys = getAllProgressKeys();
    const doneCount = progressKeys.filter((k) => doneSet.has(k)).length;
    const progressText = String(ui.progressLabel || '{done} / {total}')
      .replace('{done}', String(doneCount))
      .replace('{total}', String(progressKeys.length));

    const { groupMap, filterList } = getVisibleGroupsAndMap();

    const sectionTabsHtml =
      normalizedKind === 'conjunctions'
        ? `
        <div class="gref-tabs">
          ${CONJUNCTIONS_SECTIONS.map(
            (sec) => `
            <button type="button" class="gref-tab-btn ${activeSection === sec.id ? 'is-active' : ''}" data-section-tab="${escapeHtml(sec.id)}">
              ${escapeHtml(sec.icon)} ${escapeHtml(pickLocale(sec.title, normLang, 'en'))}
            </button>
          `
          ).join('')}
        </div>
      `
        : '';

    const filtersHtml = filterList.length > 1
      ? `
      <div class="gref-filters">
        ${filterList
          .map((f) => {
            const chipDone = doneSet.has(`${normalizedKind}:${f.id}`);
            return `
              <button type="button" class="gref-filter-chip ${activeGroup === f.id ? 'is-active' : ''} ${chipDone ? 'is-done' : ''}" data-group-filter="${escapeHtml(f.id)}">
                ${chipDone ? '✅ ' : ''}${escapeHtml(f.label)}
              </button>
            `;
          })
          .join('')}
      </div>
    `
      : '';

    const visibleEntries = filterList
      .filter((f) => activeGroup === 'all' || activeGroup === f.id)
      .map((f) => groupMap.get(f.id))
      .filter(Boolean);

    const cardsHtml = visibleEntries
      .map((entry) => {
        if (entry.isMatrix) return renderMatrixCard();
        return renderGroupCard(entry.group, entry.sectionId);
      })
      .join('');

    const heroIcon =
      normalizedKind === 'pronouns' ? '🗣️' : normalizedKind === 'conjunctions' ? '🔗' : '🧭';

    const conjIntroHtml = normalizedKind === 'conjunctions'
      ? (() => {
          const ci = getConjunctionsIntro(normLang);
          return `
            <div class="gref-intro-card">
              <h3 class="gref-intro-title">${escapeHtml(ci.title)}</h3>
              <div class="gref-intro-rows">
                <div class="gref-intro-row"><span class="gref-intro-badge">${escapeHtml(ci.c1Badge)}</span><span>${escapeHtml(ci.c1Desc)}</span></div>
                <div class="gref-intro-row"><span class="gref-intro-badge">${escapeHtml(ci.c2Badge)}</span><span>${escapeHtml(ci.c2Desc)}</span></div>
                <div class="gref-intro-row"><span class="gref-intro-badge">${escapeHtml(ci.c3Badge)}</span><span>${escapeHtml(ci.c3Desc)}</span></div>
                <div class="gref-intro-row"><span class="gref-intro-badge">${escapeHtml(ci.c4Badge)}</span><span>${escapeHtml(ci.c4Desc)}</span></div>
              </div>
            </div>
          `;
        })()
      : '';

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="gref-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="gref-topbar">
          <button type="button" class="gref-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(ui.backBtn)}</button>
          <span class="gref-progress-pill">${escapeHtml(progressText)}</span>
        </div>

        <div class="gref-hero">
          <h2 class="gref-hero-title">${heroIcon} ${escapeHtml(meta.hubTitle || meta.tileTitle || '')}</h2>
          <p class="gref-hero-sub">${escapeHtml(meta.hubSubtitle || meta.tileSubtitle || '')}</p>
        </div>

        ${conjIntroHtml}
        ${sectionTabsHtml}
        ${filtersHtml}
        ${renderPunctuationCallout()}
        ${cardsHtml}
        ${renderCrossLinksBox()}
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      try { window._cancelSmartPathReturn?.(); } catch (_) {}
      onBack();
    });

    container.querySelectorAll('[data-section-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeSection = btn.getAttribute('data-section-tab') || 'coordinating';
        activeGroup = '';
        render();
      });
    });

    container.querySelectorAll('[data-group-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeGroup = btn.getAttribute('data-group-filter') || filterList[0]?.id || '';
        render();
      });
    });

    container.querySelectorAll('[data-speak-text]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-speak-text');
        if (text) {
          speakWord(text, null, null, null, true);
        }
      });
    });

    container.querySelectorAll('[data-gtest-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = btn.getAttribute('data-gtest-opt') || '';
        const sep = raw.lastIndexOf(':');
        if (sep < 0) return;
        const gId = raw.slice(0, sep);
        const oIdx = Number(raw.slice(sep + 1));
        const st = groupTests.get(gId);
        if (!st || st.checked || st.finished) return;
        const q = st.questions[st.idx];
        const chosen = q?.options?.[oIdx];
        if (chosen === undefined) return;
        st.selectedOpt = chosen;
        st.checked = true;
        if (chosen === q.answer) st.score += 1;
        render();
      });
    });

    container.querySelectorAll('[data-gtest-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-gtest-next');
        const st = gId ? groupTests.get(gId) : null;
        if (!st) return;
        if (st.idx < st.questions.length - 1) {
          st.idx += 1;
          st.selectedOpt = null;
          st.checked = false;
        } else {
          st.finished = true;
          const pct = st.questions.length > 0 ? Math.round((st.score / st.questions.length) * 100) : 0;
          if (pct >= 80) {
            doneSet.add(`${normalizedKind}:${gId}`);
            saveGrammarRefDoneSet(doneSet);
            if (typeof window !== 'undefined' && window._returnToSmartPath && typeof window._completeSmartPathStep === 'function') {
              window._completeSmartPathStep({ delayMs: 900 });
            } else if (typeof window !== 'undefined' && typeof window._checkCefrMilestoneNudge === 'function') {
              setTimeout(() => window._checkCefrMilestoneNudge(), 350);
            }
          }
        }
        render();
      });
    });

    container.querySelectorAll('[data-gtest-retry]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-gtest-retry');
        if (!gId) return;
        groupTests.delete(gId);
        render();
      });
    });

    container.querySelectorAll('[data-widget-group]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-widget-group');
        const entry = groupMap.get(gId);
        if (!entry) return;
        const gTitle =
          entry.isMatrix
            ? meta.matrixTitle || meta.hubTitle
            : pickLocale(entry.group.title, normLang, 'en');
        const colKey = `gref_${normalizedKind}_${gId}`;
        const words = buildPracticeWords(gId, gTitle, entry.group.items);
        setActiveCollectionId(colKey);
        if (typeof window !== 'undefined' && window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.syncFavorites === 'function') {
          try {
            window.AndroidWidgetBridge.syncFavorites(JSON.stringify({
              title: gTitle,
              collectionId: colKey,
              hasFavorites: words.length > 0,
              words: words.slice(0, 100).map((w) => ({
                id: String(w.id || w.word || ''),
                word: String(w.word || ''),
                transcription: String(w.transcription || ''),
                translation: String(w.translation || ''),
                level: gTitle,
                example: String(w.example || ''),
                isFavorite: true,
              })),
            }));
          } catch (_) {}
        }
        try {
          openWidgetConfigBottomSheet({
            activeCollectionId: colKey,
            activeCollectionTitle: gTitle,
            allWords: words,
          });
        } catch (_) {}
        render();
      });
    });

    container.querySelectorAll('[data-practice-group]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-practice-group');
        const entry = groupMap.get(gId);
        if (!entry) return;
        const gTitle =
          entry.isMatrix
            ? meta.matrixTitle || meta.hubTitle
            : pickLocale(entry.group.title, normLang, 'en');
        const words = buildPracticeWords(gId, gTitle, entry.group.items);
        saveReturnPoint();
        if (typeof onStartPractice === 'function') {
          onStartPractice(words, `gref_${normalizedKind}_${gId}`, gTitle);
        }
      });
    });

    container.querySelectorAll('[data-cross-rule-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ruleId = btn.getAttribute('data-cross-rule-id');
        saveReturnPoint();
        if (typeof onNavigateLink === 'function') {
          onNavigateLink({ type: 'microrule', id: ruleId });
        }
      });
    });
  }

  render();
}
