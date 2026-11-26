import { getCollectionWords } from '../../services/collectionsService.js?v=423.0';
import { getInterfaceLanguage, t } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { pushNavReturn, navigateWithReturn } from '../../services/navigationStack.js?v=423.0';
import { getUserProgress, isWordMastered } from '../../services/api.js?v=423.0';
import { renderNumberAudioTrainerView, NUMBER_AUDIO_ROUND_SIZE } from './NumberAudioTrainerView.js?v=423.0';

export const NUMBERS_FOLDER_I18N = {
  ar: {
    folderTitle: 'الأرقام والأعداد الترتيبية',
    folderSubtitle: 'مجلدان فرعيان',
    backBtn: 'رجوع',
    cardinalsTitle: 'الأعداد الأساسية',
    cardinalsDesc: '1, 2, 3... من واحد إلى مليون',
    ordinalsTitle: 'الأعداد الترتيبية',
    ordinalsDesc: 'الأول، الثاني، الثالث... الترتيب والتواريخ',
    relatedRuleBtn: '📖 القاعدة المصغرة #6: الأعداد الأساسية والترتيبية',
    wordsSuffix: 'كلمة',
  },
  bn: {
    folderTitle: 'সংখ্যা ও ক্রমবাচক সংখ্যা',
    folderSubtitle: '২টি সাবফোল্ডার',
    backBtn: 'ফিরে যান',
    cardinalsTitle: 'মৌলিক সংখ্যা',
    cardinalsDesc: '1, 2, 3... এক থেকে এক মিলিয়ন পর্যন্ত',
    ordinalsTitle: 'ক্রমবাচক সংখ্যা',
    ordinalsDesc: '১ম, ২য়, ৩য়... ক্রম ও তারিখ',
    relatedRuleBtn: '📖 মাইক্রো-নিয়ম #6: মৌলিক ও ক্রমবাচক সংখ্যা',
    wordsSuffix: 'টি শব্দ',
  },
  bg: {
    folderTitle: 'Числа и числителни',
    folderSubtitle: '2 подпапки',
    backBtn: 'Назад',
    cardinalsTitle: 'Бройни числителни',
    cardinalsDesc: '1, 2, 3... от едно до милион',
    ordinalsTitle: 'Редни числителни',
    ordinalsDesc: '1-ви, 2-ри, 3-ти... ред и дати',
    relatedRuleBtn: '📖 Микроправило #6: Бройни и редни числителни',
    wordsSuffix: 'думи',
  },
  zh: {
    folderTitle: '基数词与序数词',
    folderSubtitle: '2个子文件夹',
    backBtn: '返回',
    cardinalsTitle: '基数词',
    cardinalsDesc: '1, 2, 3... 从一到一百万',
    ordinalsTitle: '序数词',
    ordinalsDesc: '第1、第2、第3... 顺序与日期',
    relatedRuleBtn: '📖 微规则 #6：基数词与序数词',
    wordsSuffix: '个单词',
  },
  hr: {
    folderTitle: 'Brojevi i redni brojevi',
    folderSubtitle: '2 podmape',
    backBtn: 'Natrag',
    cardinalsTitle: 'Glavni brojevi',
    cardinalsDesc: '1, 2, 3... od jedan do milijun',
    ordinalsTitle: 'Redni brojevi',
    ordinalsDesc: '1., 2., 3.... redoslijed i datumi',
    relatedRuleBtn: '📖 Mikropravilo #6: Glavni i redni brojevi',
    wordsSuffix: 'riječi',
  },
  cs: {
    folderTitle: 'Čísla a číslovky',
    folderSubtitle: '2 podsložky',
    backBtn: 'Zpět',
    cardinalsTitle: 'Základní číslovky',
    cardinalsDesc: '1, 2, 3... od jedné do milionu',
    ordinalsTitle: 'Řadové číslovky',
    ordinalsDesc: '1., 2., 3.... pořadí a data',
    relatedRuleBtn: '📖 Mikropravidlo #6: Základní a řadové číslovky',
    wordsSuffix: 'slov',
  },
  da: {
    folderTitle: 'Tal og ordenstal',
    folderSubtitle: '2 undermapper',
    backBtn: 'Tilbage',
    cardinalsTitle: 'Mængdetal',
    cardinalsDesc: '1, 2, 3... fra én til en million',
    ordinalsTitle: 'Ordenstal',
    ordinalsDesc: '1., 2., 3.... rækkefølge og datoer',
    relatedRuleBtn: '📖 Mikroregel #6: Mængdetal og ordenstal',
    wordsSuffix: 'ord',
  },
  en: {
    folderTitle: 'Numbers & Ordinals',
    folderSubtitle: '2 subfolders',
    backBtn: 'Back',
    cardinalsTitle: 'Cardinal numbers',
    cardinalsDesc: '1, 2, 3... from one to a million',
    ordinalsTitle: 'Ordinal numbers',
    ordinalsDesc: '1st, 2nd, 3rd... order & dates',
    relatedRuleBtn: '📖 Micro-rule #6: Cardinal and Ordinal Numbers',
    wordsSuffix: 'words',
  },
  et: {
    folderTitle: 'Arvud ja järgarvud',
    folderSubtitle: '2 alamkausta',
    backBtn: 'Tagasi',
    cardinalsTitle: 'Põhiarvud',
    cardinalsDesc: '1, 2, 3... ühest miljonini',
    ordinalsTitle: 'Järgarvud',
    ordinalsDesc: '1., 2., 3.... järjekord ja kuupäevad',
    relatedRuleBtn: '📖 Mikroreegel #6: Põhiarvud ja järgarvud',
    wordsSuffix: 'sõna',
  },
  fi: {
    folderTitle: 'Numerot ja järjestysluvut',
    folderSubtitle: '2 alikansiota',
    backBtn: 'Takaisin',
    cardinalsTitle: 'Perusluvut',
    cardinalsDesc: '1, 2, 3... yhdestä miljoonaan',
    ordinalsTitle: 'Järjestysluvut',
    ordinalsDesc: '1., 2., 3.... järjestys ja päivämäärät',
    relatedRuleBtn: '📖 Mikrosääntö #6: Perusluvut ja järjestysluvut',
    wordsSuffix: 'sanaa',
  },
  fr: {
    folderTitle: 'Nombres et ordinaux',
    folderSubtitle: '2 sous-dossiers',
    backBtn: 'Retour',
    cardinalsTitle: 'Nombres cardinaux',
    cardinalsDesc: '1, 2, 3... de un à un million',
    ordinalsTitle: 'Nombres ordinaux',
    ordinalsDesc: '1er, 2e, 3e... ordre et dates',
    relatedRuleBtn: '📖 Microrègle #6 : Nombres cardinaux et ordinaux',
    wordsSuffix: 'mots',
  },
  de: {
    folderTitle: 'Zahlen & Ordnungszahlen',
    folderSubtitle: '2 Unterordner',
    backBtn: 'Zurück',
    cardinalsTitle: 'Kardinalzahlen',
    cardinalsDesc: '1, 2, 3... von eins bis eine Million',
    ordinalsTitle: 'Ordinalzahlen',
    ordinalsDesc: '1., 2., 3.... Reihenfolge & Daten',
    relatedRuleBtn: '📖 Mikroregel #6: Kardinal- und Ordinalzahlen',
    wordsSuffix: 'Wörter',
  },
  el: {
    folderTitle: 'Αριθμοί και τακτικά αριθμητικά',
    folderSubtitle: '2 υποφάκελοι',
    backBtn: 'Πίσω',
    cardinalsTitle: 'Απόλυτοι αριθμοί',
    cardinalsDesc: '1, 2, 3... από το ένα έως το ένα εκατομμύριο',
    ordinalsTitle: 'Τακτικοί αριθμοί',
    ordinalsDesc: '1ος, 2ος, 3ος... σειρά και ημερομηνίες',
    relatedRuleBtn: '📖 Μικροκανόνας #6: Απόλυτοι και τακτικοί αριθμοί',
    wordsSuffix: 'λέξεις',
  },
  hi: {
    folderTitle: 'संख्याएँ और क्रमवाचक संख्याएँ',
    folderSubtitle: '2 उप-फ़ोल्डर',
    backBtn: 'वापस',
    cardinalsTitle: 'गणनावाचक संख्याएँ',
    cardinalsDesc: '1, 2, 3... एक से दस लाख तक',
    ordinalsTitle: 'क्रमवाचक संख्याएँ',
    ordinalsDesc: 'पहला, दूसरा, तीसरा... क्रम और तारीखें',
    relatedRuleBtn: '📖 सूक्ष्म नियम #6: गणनावाचक और क्रमवाचक संख्याएँ',
    wordsSuffix: 'शब्द',
  },
  hu: {
    folderTitle: 'Számok és sorszámnevek',
    folderSubtitle: '2 almappa',
    backBtn: 'Vissza',
    cardinalsTitle: 'Tőszámnevek',
    cardinalsDesc: '1, 2, 3... egytől egymillióig',
    ordinalsTitle: 'Sorszámnevek',
    ordinalsDesc: '1., 2., 3.... sorrend és dátumok',
    relatedRuleBtn: '📖 Mikroszabály #6: Tő- és sorszámnevek',
    wordsSuffix: 'szó',
  },
  id: {
    folderTitle: 'Angka & Bilangan Bertingkat',
    folderSubtitle: '2 subfolder',
    backBtn: 'Kembali',
    cardinalsTitle: 'Angka kardinal',
    cardinalsDesc: '1, 2, 3... dari satu sampai satu juta',
    ordinalsTitle: 'Bilangan ordinal',
    ordinalsDesc: 'ke-1, ke-2, ke-3... urutan & tanggal',
    relatedRuleBtn: '📖 Aturan Mikro #6: Angka Kardinal dan Ordinal',
    wordsSuffix: 'kata',
  },
  it: {
    folderTitle: 'Numeri e ordinali',
    folderSubtitle: '2 sottocartelle',
    backBtn: 'Indietro',
    cardinalsTitle: 'Numeri cardinali',
    cardinalsDesc: '1, 2, 3... da uno a un milione',
    ordinalsTitle: 'Numeri ordinali',
    ordinalsDesc: '1°, 2°, 3°... ordine e date',
    relatedRuleBtn: '📖 Microregola #6: Numeri cardinali e ordinali',
    wordsSuffix: 'parole',
  },
  ja: {
    folderTitle: '基数と序数',
    folderSubtitle: '2つのサブフォルダ',
    backBtn: '戻る',
    cardinalsTitle: '基数',
    cardinalsDesc: '1, 2, 3... 1から100万まで',
    ordinalsTitle: '序数',
    ordinalsDesc: '1番目、2番目、3番目... 順序と日付',
    relatedRuleBtn: '📖 マイクロルール #6：基数と序数',
    wordsSuffix: '語',
  },
  kk: {
    folderTitle: 'Сандар және реттік сандар',
    folderSubtitle: '2 ішкі қалта',
    backBtn: 'Артқа',
    cardinalsTitle: 'Есептік сандар',
    cardinalsDesc: '1, 2, 3... бірден миллионға дейін',
    ordinalsTitle: 'Реттік сандар',
    ordinalsDesc: '1-ші, 2-ші, 3-ші... реттілік пен күндер',
    relatedRuleBtn: '📖 Шағын ереже #6: Есептік және реттік сандар',
    wordsSuffix: 'сөз',
  },
  ko: {
    folderTitle: '숫자와 서수',
    folderSubtitle: '하위 폴더 2개',
    backBtn: '뒤로',
    cardinalsTitle: '기수',
    cardinalsDesc: '1, 2, 3... 1부터 백만까지',
    ordinalsTitle: '서수',
    ordinalsDesc: '1번째, 2번째, 3번째... 순서와 날짜',
    relatedRuleBtn: '📖 마이크로 규칙 #6: 기수와 서수',
    wordsSuffix: '개 단어',
  },
  lv: {
    folderTitle: 'Skaitļi un kārtas skaitļi',
    folderSubtitle: '2 apakšmapes',
    backBtn: 'Atpakaļ',
    cardinalsTitle: 'Pamata skaitļi',
    cardinalsDesc: '1, 2, 3... no viena līdz miljonam',
    ordinalsTitle: 'Kārtas skaitļi',
    ordinalsDesc: '1., 2., 3.... secība un datumi',
    relatedRuleBtn: '📖 Mikronoteikums #6: Pamata un kārtas skaitļi',
    wordsSuffix: 'vārdi',
  },
  lt: {
    folderTitle: 'Skaičiai ir kelintiniai skaitvardžiai',
    folderSubtitle: '2 poaplankiai',
    backBtn: 'Atgal',
    cardinalsTitle: 'Kiekiniai skaitvardžiai',
    cardinalsDesc: '1, 2, 3... nuo vieno iki milijono',
    ordinalsTitle: 'Kelintiniai skaitvardžiai',
    ordinalsDesc: '1-as, 2-as, 3-ias... tvarka ir datos',
    relatedRuleBtn: '📖 Mikrotaisyklė #6: Kiekiniai ir kelintiniai skaitvardžiai',
    wordsSuffix: 'žodžių',
  },
  fa: {
    folderTitle: 'اعداد و اعداد ترتیبی',
    folderSubtitle: '۲ زیرپوشه',
    backBtn: 'بازگشت',
    cardinalsTitle: 'اعداد اصلی',
    cardinalsDesc: '1, 2, 3... از یک تا یک میلیون',
    ordinalsTitle: 'اعداد ترتیبی',
    ordinalsDesc: 'اول، دوم، سوم... ترتیب و تاریخ‌ها',
    relatedRuleBtn: '📖 نکته کوتاه #6: اعداد اصلی و ترتیبی',
    wordsSuffix: 'کلمه',
  },
  pl: {
    folderTitle: 'Liczby i liczebniki porządkowe',
    folderSubtitle: '2 podfoldery',
    backBtn: 'Wstecz',
    cardinalsTitle: 'Liczebniki główne',
    cardinalsDesc: '1, 2, 3... od jednego do miliona',
    ordinalsTitle: 'Liczebniki porządkowe',
    ordinalsDesc: '1., 2., 3.... kolejność i daty',
    relatedRuleBtn: '📖 Mikroreguła #6: Liczebniki główne i porządkowe',
    wordsSuffix: 'słów',
  },
  pt: {
    folderTitle: 'Números e Ordinais',
    folderSubtitle: '2 subpastas',
    backBtn: 'Voltar',
    cardinalsTitle: 'Números cardinais',
    cardinalsDesc: '1, 2, 3... de um até um milhão',
    ordinalsTitle: 'Números ordinais',
    ordinalsDesc: '1º, 2º, 3º... ordem e datas',
    relatedRuleBtn: '📖 Microrregra #6: Números Cardinais e Ordinais',
    wordsSuffix: 'palavras',
  },
  ro: {
    folderTitle: 'Numere și numerale ordinale',
    folderSubtitle: '2 subdosare',
    backBtn: 'Înapoi',
    cardinalsTitle: 'Numere cardinale',
    cardinalsDesc: '1, 2, 3... de la unu la un milion',
    ordinalsTitle: 'Numerale ordinale',
    ordinalsDesc: 'al 1-lea, al 2-lea, al 3-lea... ordine și date',
    relatedRuleBtn: '📖 Microregulă #6: Numere cardinale și ordinale',
    wordsSuffix: 'cuvinte',
  },
  ru: {
    folderTitle: 'Числа и числительные',
    folderSubtitle: '2 подпапки',
    backBtn: 'Назад',
    cardinalsTitle: 'Количественные числа',
    cardinalsDesc: '1, 2, 3... от одного до миллиона',
    ordinalsTitle: 'Порядковые числительные',
    ordinalsDesc: '1-й, 2-й, 3-й... порядок и даты',
    relatedRuleBtn: '📖 Микроправило #6: Количественные и порядковые числа',
    wordsSuffix: 'слов',
  },
  sk: {
    folderTitle: 'Čísla a číslovky',
    folderSubtitle: '2 podpriečinky',
    backBtn: 'Späť',
    cardinalsTitle: 'Základné číslovky',
    cardinalsDesc: '1, 2, 3... od jednej do milióna',
    ordinalsTitle: 'Radové číslovky',
    ordinalsDesc: '1., 2., 3.... poradie a dátumy',
    relatedRuleBtn: '📖 Mikropravidlo #6: Základné a radové číslovky',
    wordsSuffix: 'slov',
  },
  sl: {
    folderTitle: 'Števila in vrstilni števniki',
    folderSubtitle: '2 podmapi',
    backBtn: 'Nazaj',
    cardinalsTitle: 'Glavni števniki',
    cardinalsDesc: '1, 2, 3... od ena do milijon',
    ordinalsTitle: 'Vrstilni števniki',
    ordinalsDesc: '1., 2., 3.... vrstni red in datumi',
    relatedRuleBtn: '📖 Mikropravilo #6: Glavni in vrstilni števniki',
    wordsSuffix: 'besed',
  },
  es: {
    folderTitle: 'Números y ordinales',
    folderSubtitle: '2 subcarpetas',
    backBtn: 'Atrás',
    cardinalsTitle: 'Números cardinales',
    cardinalsDesc: '1, 2, 3... del uno al millón',
    ordinalsTitle: 'Números ordinales',
    ordinalsDesc: '1.º, 2.º, 3.º... orden y fechas',
    relatedRuleBtn: '📖 Microrregla #6: Números cardinales y ordinales',
    wordsSuffix: 'palabras',
  },
  sv: {
    folderTitle: 'Siffror och ordningstal',
    folderSubtitle: '2 undermappar',
    backBtn: 'Tillbaka',
    cardinalsTitle: 'Grundtal',
    cardinalsDesc: '1, 2, 3... från ett till en miljon',
    ordinalsTitle: 'Ordningstal',
    ordinalsDesc: '1:a, 2:a, 3:e... ordning och datum',
    relatedRuleBtn: '📖 Mikroregel #6: Grundtal och ordningstal',
    wordsSuffix: 'ord',
  },
  th: {
    folderTitle: 'ตัวเลขและเลขลำดับที่',
    folderSubtitle: '2 โฟลเดอร์ย่อย',
    backBtn: 'ย้อนกลับ',
    cardinalsTitle: 'เลขจำนวนนับ',
    cardinalsDesc: '1, 2, 3... ตั้งแต่หนึ่งถึงหนึ่งล้าน',
    ordinalsTitle: 'เลขลำดับที่',
    ordinalsDesc: 'ที่ 1, ที่ 2, ที่ 3... ลำดับและวันที่',
    relatedRuleBtn: '📖 กฎย่อย #6: เลขจำนวนนับและเลขลำดับที่',
    wordsSuffix: 'คำ',
  },
  tr: {
    folderTitle: 'Sayılar ve Sıra Sayıları',
    folderSubtitle: '2 alt klasör',
    backBtn: 'Geri',
    cardinalsTitle: 'Sayma sayıları',
    cardinalsDesc: '1, 2, 3... birden bir milyona kadar',
    ordinalsTitle: 'Sıra sayıları',
    ordinalsDesc: '1., 2., 3.... sıra ve tarihler',
    relatedRuleBtn: '📖 Mikro Kural #6: Sayma ve Sıra Sayıları',
    wordsSuffix: 'kelime',
  },
  uk: {
    folderTitle: 'Числа та числівники',
    folderSubtitle: '2 підтеки',
    backBtn: 'Назад',
    cardinalsTitle: 'Кількісні числа',
    cardinalsDesc: '1, 2, 3... від одного до мільйона',
    ordinalsTitle: 'Порядкові числівники',
    ordinalsDesc: '1-й, 2-й, 3-й... порядок і дати',
    relatedRuleBtn: '📖 Мікроправило #6: Кількісні та порядкові числа',
    wordsSuffix: 'слів',
  },
  ur: {
    folderTitle: 'اعداد اور ترتیبی اعداد',
    folderSubtitle: '2 ذیلی فولڈر',
    backBtn: 'واپس',
    cardinalsTitle: 'بنیادی اعداد',
    cardinalsDesc: '1, 2, 3... ایک سے دس لاکھ تک',
    ordinalsTitle: 'ترتیبی اعداد',
    ordinalsDesc: 'پہلا، دوسرا، تیسرا... ترتیب اور تاریخیں',
    relatedRuleBtn: '📖 مائیکرو اصول #6: بنیادی اور ترتیبی اعداد',
    wordsSuffix: 'الفاظ',
  },
  vi: {
    folderTitle: 'Số đếm & Số thứ tự',
    folderSubtitle: '2 thư mục con',
    backBtn: 'Quay lại',
    cardinalsTitle: 'Số đếm',
    cardinalsDesc: '1, 2, 3... từ một đến một triệu',
    ordinalsTitle: 'Số thứ tự',
    ordinalsDesc: 'thứ 1, thứ 2, thứ 3... thứ tự & ngày tháng',
    relatedRuleBtn: '📖 Quy tắc nhỏ #6: Số đếm và Số thứ tự',
    wordsSuffix: 'từ',
  },
};

NUMBERS_FOLDER_I18N['pt-br'] = NUMBERS_FOLDER_I18N.pt;
NUMBERS_FOLDER_I18N['es-mx'] = NUMBERS_FOLDER_I18N.es;

export function getNumbersFolderStrings(lang = 'en') {
  const norm = String(lang || 'en').toLowerCase().replace('_', '-').trim();
  if (NUMBERS_FOLDER_I18N[norm]) return NUMBERS_FOLDER_I18N[norm];
  const base = norm.split('-')[0];
  return NUMBERS_FOLDER_I18N[base] || NUMBERS_FOLDER_I18N.en;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStylesHtml() {
  return `
    <style>
      .numbers-folder-page {
        padding: 12px 6px 24px;
        max-width: 640px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .nf-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
      }
      .nf-hero {
        margin-bottom: 16px;
      }
      .nf-hero-title {
        font-size: 21px;
        font-weight: 800;
        color: var(--text-main);
        margin: 0 0 4px;
        line-height: 1.25;
      }
      .nf-hero-sub {
        font-size: 13.5px;
        color: var(--text-muted);
        margin: 0;
        line-height: 1.4;
      }
      .nf-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      .nf-sub-tile {
        height: auto !important;
        min-height: 172px !important;
        padding: 18px 12px 16px !important;
        justify-content: space-between !important;
        gap: 8px;
      }
      .nf-tile-desc {
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.35;
        margin: 2px 0 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .nf-count-pill {
        display: inline-block;
        font-size: 12px;
        font-weight: 700;
        color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
        border: 1px solid rgba(37, 99, 235, 0.22);
        padding: 3px 10px;
        border-radius: 999px;
        margin-top: 2px;
      }
      .dark-theme .nf-count-pill,
      [data-theme='dark'] .nf-count-pill {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.14);
        border-color: rgba(56, 189, 248, 0.35);
      }
      .nf-sub-tile.is-completed {
        border: 2px solid #22c55e !important;
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.24) !important;
      }
      .nf-count-pill.is-done {
        color: #15803d;
        background: rgba(34, 197, 94, 0.14);
        border-color: rgba(34, 197, 94, 0.38);
      }
      .dark-theme .nf-count-pill.is-done,
      [data-theme='dark'] .nf-count-pill.is-done {
        color: #86efac;
        background: rgba(34, 197, 94, 0.18);
        border-color: rgba(74, 222, 128, 0.45);
      }
      .nf-rule-btn {
        width: 100%;
        background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        border: 1.5px solid #c7d2fe;
        border-radius: 14px;
        padding: 13px 16px;
        font-size: 14px;
        font-weight: 700;
        color: #3730a3;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        text-align: start;
        box-sizing: border-box;
        transition: transform 0.14s ease, box-shadow 0.14s ease;
        box-shadow: 0 2px 6px rgba(55, 48, 163, 0.06);
      }
      .nf-rule-btn:active {
        transform: scale(0.985);
      }
      .dark-theme .nf-rule-btn,
      [data-theme='dark'] .nf-rule-btn {
        background: linear-gradient(180deg, #1e293b 0%, #172033 100%);
        border-color: #4338ca;
        color: #c7d2fe;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .nf-rule-chevron {
        font-size: 18px;
        line-height: 1;
        flex-shrink: 0;
        opacity: 0.75;
      }
    </style>
  `;
}

export function renderNumbersFolderView(allWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (typeof window !== 'undefined' && window.trackScreen) {
    window.trackScreen('numbers_hub', 'NumbersFolderView');
  }

  const {
    onBack = () => {},
    onOpenCollection = () => {},
    onNavigateLink = null,
  } = options;

  const rawLang = (getInterfaceLanguage() || 'en').toLowerCase();
  const baseLang = rawLang.split(/[-_]/)[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getNumbersFolderStrings(rawLang);

  const cardinalsWords = getCollectionWords('numbers', allWords);
  const ordinalsWords = getCollectionWords('ordinal_numbers', allWords);
  const cardinalsCount = cardinalsWords.length;
  const ordinalsCount = ordinalsWords.length;
  let progMap = {};
  let completedColsSet = new Set();
  try { progMap = getUserProgress() || {}; } catch (_) {}
  try {
    const rawC = typeof localStorage !== 'undefined' ? localStorage.getItem('myduo_completed_collections') : null;
    const arrC = rawC ? JSON.parse(rawC) : [];
    if (Array.isArray(arrC)) completedColsSet = new Set(arrC.map(String));
  } catch (_) {}
  const countDone = (list) => list.filter((w) => w && w.id != null && isWordMastered(progMap[w.id] || progMap[String(w.id)])).length;
  const cardinalsMastered = countDone(cardinalsWords);
  const ordinalsMastered = countDone(ordinalsWords);
  const cardinalsCompleted = (cardinalsCount > 0 && cardinalsMastered >= cardinalsCount) || completedColsSet.has('numbers');
  const ordinalsCompleted = (ordinalsCount > 0 && ordinalsMastered >= ordinalsCount) || completedColsSet.has('ordinal_numbers');

  const restoreSelf = () => renderNumbersFolderView(allWords, containerSelector, options);
  const trainLabel = String(t('fav_practice_btn') || 'Practice').replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'Practice';

  container.innerHTML = `
    ${getStylesHtml()}
    <style>
      .nf-audio-test-btn {
        margin-top: 10px;
        width: 100%;
        padding: 9px 12px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.28);
        transition: transform 0.12s ease;
      }
      .nf-audio-test-btn:active { transform: scale(0.97); }
    </style>
    <div class="numbers-folder-page" dir="${isRtl ? 'rtl' : 'ltr'}">
      <div class="nf-topbar">
        <button type="button" class="eb-back-pill-btn" id="fav-view-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
      </div>
      <div class="nf-hero">
        <h2 class="nf-hero-title">🔢 ${escapeHtml(s.folderTitle)}</h2>
        <p class="nf-hero-sub">${escapeHtml(s.folderSubtitle)}</p>
      </div>
      <div class="nf-grid">
        <div class="col-tile nf-sub-tile ${cardinalsCompleted ? 'is-completed' : ''}" data-subfolder-id="numbers" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🔢</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(s.cardinalsTitle)}</h3>
            <p class="nf-tile-desc">${escapeHtml(s.cardinalsDesc)}</p>
            <span class="nf-count-pill ${cardinalsCompleted ? 'is-done' : ''}"><span dir="ltr">${cardinalsCompleted ? `✅ ${cardinalsCount}/${cardinalsCount}` : `${cardinalsMastered}/${cardinalsCount}`}</span> ${escapeHtml(s.wordsSuffix)}</span>
            <button type="button" class="nf-audio-test-btn" data-audio-trainer="cardinals">🎧 ${escapeHtml(trainLabel)} (${cardinalsCount})</button>
          </div>
        </div>
        <div class="col-tile nf-sub-tile ${ordinalsCompleted ? 'is-completed' : ''}" data-subfolder-id="ordinal_numbers" role="button" tabindex="0">
          <div class="col-tile-icon-box">
            <span class="col-tile-icon">🥇</span>
          </div>
          <div class="col-tile-content">
            <h3 class="col-tile-name">${escapeHtml(s.ordinalsTitle)}</h3>
            <p class="nf-tile-desc">${escapeHtml(s.ordinalsDesc)}</p>
            <span class="nf-count-pill ${ordinalsCompleted ? 'is-done' : ''}"><span dir="ltr">${ordinalsCompleted ? `✅ ${ordinalsCount}/${ordinalsCount}` : `${ordinalsMastered}/${ordinalsCount}`}</span> ${escapeHtml(s.wordsSuffix)}</span>
            <button type="button" class="nf-audio-test-btn" data-audio-trainer="ordinals">🎧 ${escapeHtml(trainLabel)} (${ordinalsCount})</button>
          </div>
        </div>
      </div>
      <button type="button" class="nf-rule-btn" data-nav-rule="6">
        <span>${escapeHtml(s.relatedRuleBtn)}</span>
        <span class="nf-rule-chevron">${isRtl ? '‹' : '›'}</span>
      </button>
    </div>
  `;

  container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => onBack());

  container.querySelectorAll('[data-audio-trainer]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mode = btn.getAttribute('data-audio-trainer') === 'ordinals' ? 'ordinals' : 'cardinals';
      pushNavReturn({ label: 'numbers_hub', restore: restoreSelf });
      renderNumberAudioTrainerView(container, {
        mode,
        allWords,
        onBack: restoreSelf,
      });
    });
  });

  const openSubfolder = (colId) => {
    if (!colId) return;
    pushNavReturn({ label: 'numbers_hub', restore: restoreSelf });
    onOpenCollection(colId);
  };

  container.querySelectorAll('[data-subfolder-id]').forEach((tile) => {
    tile.addEventListener('click', () => {
      openSubfolder(tile.getAttribute('data-subfolder-id'));
    });
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSubfolder(tile.getAttribute('data-subfolder-id'));
      }
    });
  });

  container.querySelector('[data-nav-rule="6"]')?.addEventListener('click', () => {
    navigateWithReturn(
      restoreSelf,
      () => onNavigateLink?.({ targetType: 'grammar_microrules', ruleId: 6 }),
      'numbers_hub'
    );
  });
}
