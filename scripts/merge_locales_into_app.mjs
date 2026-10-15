import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'scripts', 'locales');
const I18N_PATH = path.join(ROOT_DIR, 'frontend', 'services', 'i18n.js');
const SETTINGS_VIEW_PATH = path.join(ROOT_DIR, 'frontend', 'components', 'settings', 'SettingsView.js');

const LANG_CONFIG = [
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'ar', nativeName: 'العربية', rtl: true },
  { code: 'id', nativeName: 'Bahasa Indonesia' },
  { code: 'vi', nativeName: 'Tiếng Việt' },
  { code: 'th', nativeName: 'ไทย' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'ja', nativeName: '日本語' }
];

const SPEECH_PROMPTS_EXTRA = {
  listening: {
    hi: 'सुन रहा हूँ! अब बोलिए...',
    ar: 'أستمع! تحدث الآن...',
    id: 'Mendengarkan! Bicara sekarang...',
    vi: 'Đang nghe! Hãy nói ngay...',
    th: 'กำลังฟัง! พูดเลย...',
    ko: '듣고 있어요! 지금 말하세요...',
    ja: '聞いています！今話してください...'
  },
  good: {
    hi: 'बहुत बढ़िया! आपने कहा:',
    ar: 'رائع! لقد قلت:',
    id: 'Bagus! Anda berkata:',
    vi: 'Tuyệt vời! Bạn đã nói:',
    th: 'ยอดเยี่ยม! คุณพูดว่า:',
    ko: '훌륭해요! 말씀하신 내용:',
    ja: '素晴らしい！あなたの発言:'
  },
  try_again: {
    hi: 'पुनः प्रयास करें:',
    ar: 'حاول مرة أخرى:',
    id: 'Coba lagi:',
    vi: 'Thử lại:',
    th: 'ลองอีกครั้ง:',
    ko: '다시 시도하세요:',
    ja: 'もう一度お試しください:'
  },
  voice_search_listening: {
    hi: 'खोज के लिए सुन रहा हूँ...',
    ar: 'أستمع للبحث...',
    id: 'Mendengarkan pencarian...',
    vi: 'Đang nghe tìm kiếm...',
    th: 'กำลังฟังเพื่อค้นหา...',
    ko: '검색 음성을 듣는 중...',
    ja: '検索ワードを聞いています...'
  },
  voice_search_speak_now: {
    hi: 'अब बोलिए...',
    ar: 'تحدث الآن...',
    id: 'Bicara sekarang...',
    vi: 'Hãy nói ngay...',
    th: 'พูดเลย...',
    ko: '지금 말하세요...',
    ja: '今話してください...'
  },
  voice_search_btn_try_again: {
    hi: 'फिर से प्रयास करें',
    ar: 'حاول مجدداً',
    id: 'Coba lagi',
    vi: 'Thử lại',
    th: 'ลองใหม่',
    ko: '다시 시도',
    ja: 'やり直す'
  },
  review_learn: {
    hi: 'सीखें (1-3)',
    ar: 'تعلم (1-3)',
    id: 'Pelajari (1-3)',
    vi: 'Học (1-3)',
    th: 'เรียนรู้ (1-3)',
    ko: '학습 (1-3)',
    ja: '学習 (1-3)'
  },
  review_know: {
    hi: 'मुझे पता है (4-5)',
    ar: 'أعرف (4-5)',
    id: 'Tahu (4-5)',
    vi: 'Đã biết (4-5)',
    th: 'รู้แล้ว (4-5)',
    ko: '알고 있음 (4-5)',
    ja: '知っている (4-5)'
  }
};

const CATEGORIES_EXTRA = {
  elementary: {
    hi: { title: "बुनियादी शब्दावली", desc: "दैनिक अंग्रेजी के सबसे आम और महत्वपूर्ण शब्द" },
    ar: { title: "المفردات الأساسية", desc: "أهم الكلمات وأكثرها شيوعاً في اللغة الإنجليزية اليومية" },
    id: { title: "Kosakata Dasar", desc: "Kata-kata bahasa Inggris sehari-hari yang paling sering digunakan dan penting" },
    vi: { title: "Từ vựng cơ bản", desc: "Những từ tiếng Anh thông dụng và cần thiết nhất hàng ngày" },
    th: { title: "คำศัพท์พื้นฐาน", desc: "คำศัพท์ภาษาอังกฤษในชีวิตประจำวันที่มีประโยชน์และพบบ่อยที่สุด" },
    ko: { title: "기초 어휘", desc: "일상 영어에서 가장 자주 쓰이고 필수적인 단어들" },
    ja: { title: "基本単語", desc: "日常会話で最も頻出する重要英単語" }
  },
  irregular: {
    hi: { title: "अनियमित क्रियाएं", desc: "सभी अंग्रेजी अनियमित क्रियाओं के मुख्य रूप और अर्थ" },
    ar: { title: "الأفعال الشاذة", desc: "الأشكال الرئيسية ومعاني جميع الأفعال غير القياسية في اللغة الإنجليزية" },
    id: { title: "Kata Kerja Tidak Beraturan", desc: "Bentuk utama dan arti dari semua kata kerja tidak beraturan bahasa Inggris" },
    vi: { title: "Động từ bất quy tắc", desc: "Các dạng chính và ý nghĩa của tất cả động từ bất quy tắc trong tiếng Anh" },
    th: { title: "กริยาไม่ปกติ", desc: "รูปสำคัญและความหมายของกริยาไม่ปกติภาษาอังกฤษทั้งหมด" },
    ko: { title: "불규칙 동사", desc: "모든 영어 불규칙 동사의 주요 형태와 의미" },
    ja: { title: "不規則動詞", desc: "すべての英語不規則動詞の重要変化形と意味" }
  },
  pattern: {
    hi: { title: "बातचीत के पैटर्न", desc: "सामान्य वाक्यांश, संवादात्मक संयोजन और मुहावरे" },
    ar: { title: "أنماط المحادثة", desc: "العبارات الشائعة والمتلازمات اللفظية والتعابير الاصطلاحية" },
    id: { title: "Pola Percakapan", desc: "Frasa umum, kolokasi percakapan dan idiom" },
    vi: { title: "Mẫu câu giao tiếp", desc: "Các cụm từ thông dụng, cách diễn đạt hội thoại và thành ngữ" },
    th: { title: "รูปแบบบทสนทนา", desc: "วลีที่ใช้บ่อย การเชื่อมประโยค และสำนวนภาษาอังกฤษ" },
    ko: { title: "회화 패턴", desc: "자주 쓰이는 표현, 대화 연어 및 관용구" },
    ja: { title: "会話パターン", desc: "よく使われる定型フレーズ、コロケーション、慣用句" }
  },
  intermediate: {
    hi: { title: "मध्यम स्तर", desc: "धाराप्रवाह बातचीत, काम और अध्ययन के लिए शब्दावली" },
    ar: { title: "المستوى المتوسط", desc: "مفردات للتحدث بطلاقة والعمل والقراءة" },
    id: { title: "Tingkat Menengah", desc: "Kosakata untuk percakapan lancar, pekerjaan, dan membaca" },
    vi: { title: "Trình độ trung cấp", desc: "Từ vựng để giao tiếp lưu loát, làm việc và đọc hiểu" },
    th: { title: "ระดับกลาง", desc: "คำศัพท์สำหรับการสนทนาอย่างคล่องแคล่ว การทำงาน และการอ่าน" },
    ko: { title: "중급 어휘", desc: "유창한 대화, 업무 및 독서를 위한 어휘" },
    ja: { title: "中級語彙", desc: "流暢な会話、仕事、読書のための実践的英単語" }
  },
  advanced: {
    hi: { title: "उन्नत स्तर", desc: "गहरी, सूक्ष्म और शैक्षणिक उन्नत शब्दावली" },
    ar: { title: "المستوى المتقدم", desc: "مفردات متقدمة وأكاديمية دقيقة ومعبرة" },
    id: { title: "Tingkat Lanjut", desc: "Kosakata tingkat lanjut bernuansa ekspresif dan akademis" },
    vi: { title: "Trình độ nâng cao", desc: "Từ vựng nâng cao giàu sắc thái và mang tính học thuật" },
    th: { title: "ระดับสูง", desc: "คำศัพท์ขั้นสูงเชิงวิชาการที่ลึกซึ้งและสื่อความหมายเฉพาะเจาะจง" },
    ko: { title: "고급 어휘", desc: "뉘앙스가 풍부하고 표현력 있는 학술적 고급 어휘" },
    ja: { title: "上級語彙", desc: "ニュアンス豊かで表現力のある学術・高度語彙" }
  }
};

const CAT_MODAL_EXTRA = {
  hi: {
    title: "ऑडियो फाइलें डाउनलोड करें",
    desc: "श्रेणी का अभ्यास करने के लिए ऑडियो फाइलें डाउनलोड करने की आवश्यकता है",
    downloadBtn: "डाउनलोड करें",
    cancelBtn: "रद्द करें",
    retryBtn: "पुनः प्रयास करें",
    downloading: "ऑडियो फाइलें डाउनलोड हो रही हैं..."
  },
  ar: {
    title: "تنزيل الملفات الصوتية",
    desc: "لممارسة هذه الفئة، يلزم تنزيل الملفات الصوتية",
    downloadBtn: "تنزيل",
    cancelBtn: "إلغاء",
    retryBtn: "إعادة المحاولة",
    downloading: "جارٍ تنزيل الملفات الصوتية..."
  },
  id: {
    title: "Unduh file audio",
    desc: "Untuk berlatih kategori ini, Anda perlu mengunduh file audio",
    downloadBtn: "Unduh",
    cancelBtn: "Batal",
    retryBtn: "Coba lagi",
    downloading: "Mengunduh file audio..."
  },
  vi: {
    title: "Tải tệp âm thanh",
    desc: "Để luyện tập danh mục này, bạn cần tải xuống các tệp âm thanh",
    downloadBtn: "Tải xuống",
    cancelBtn: "Hủy",
    retryBtn: "Thử lại",
    downloading: "Đang tải tệp âm thanh..."
  },
  th: {
    title: "ดาวน์โหลดไฟล์เสียง",
    desc: "หากต้องการฝึกหมวดหมู่นี้ จำเป็นต้องดาวน์โหลดไฟล์เสียง",
    downloadBtn: "ดาวน์โหลด",
    cancelBtn: "ยกเลิก",
    retryBtn: "ลองใหม่",
    downloading: "กำลังดาวน์โหลดไฟล์เสียง..."
  },
  ko: {
    title: "오디오 파일 다운로드",
    desc: "카테고리를 연습하려면 오디오 파일을 다운로드해야 합니다",
    downloadBtn: "다운로드",
    cancelBtn: "취소",
    retryBtn: "다시 시도",
    downloading: "오디오 파일 다운로드 중..."
  },
  ja: {
    title: "音声ファイルをダウンロード",
    desc: "カテゴリーを練習するには音声ファイルのダウンロードが必要です",
    downloadBtn: "ダウンロード",
    cancelBtn: "キャンセル",
    retryBtn: "再試行",
    downloading: "音声ファイルをダウンロード中..."
  }
};

export async function merge() {
  console.log('🔄 Checking all 7 locale JSON files...');
  for (const { code } of LANG_CONFIG) {
    const file = path.join(LOCALES_DIR, `${code}.json`);
    if (!fs.existsSync(file)) {
      throw new Error(`File ${file} does not exist yet!`);
    }
  }

  console.log('📖 Reading frontend/services/i18n.js...');
  let i18nContent = fs.readFileSync(I18N_PATH, 'utf8');

  // 1. Build string blocks for translations[code]
  let transAdditions = '';
  for (const { code } of LANG_CONFIG) {
    const jsonPath = path.join(LOCALES_DIR, `${code}.json`);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    transAdditions += `  ${code}: {\n`;
    for (const [key, val] of Object.entries(data)) {
      const escaped = String(val)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
      transAdditions += `    ${key}: "${escaped}",\n`;
    }
    transAdditions += `  },\n`;
  }

  // Insert translations before `  },};`
  const endTransMarker = '  },};';
  if (!i18nContent.includes(endTransMarker)) {
    throw new Error('Could not find end of translations marker `  },};` in i18n.js');
  }
  i18nContent = i18nContent.replace(endTransMarker, `  },\n${transAdditions}};`);

  // 2. Append SPEECH_PROMPTS
  for (const [promptKey, langs] of Object.entries(SPEECH_PROMPTS_EXTRA)) {
    const regex = new RegExp(`(${promptKey}:\\s*\\{[\\s\\S]*?)(\\n\\s*\\},)`, 'm');
    const match = i18nContent.match(regex);
    if (match) {
      let add = '';
      for (const [lCode, text] of Object.entries(langs)) {
        add += `    ${lCode}: '${text.replace(/'/g, "\\'")}',\n`;
      }
      i18nContent = i18nContent.replace(regex, `$1${add}$2`);
    }
  }

  // 3. Append CATEGORY_LOCALIZATIONS
  for (const [catKey, langs] of Object.entries(CATEGORIES_EXTRA)) {
    const regex = new RegExp(`(${catKey}:\\s*\\{[\\s\\S]*?)(\\n\\s*\\},)`, 'm');
    const match = i18nContent.match(regex);
    if (match) {
      let add = '';
      for (const [lCode, obj] of Object.entries(langs)) {
        add += `    ${lCode}: { title: "${obj.title}", desc: "${obj.desc}" },\n`;
      }
      i18nContent = i18nContent.replace(regex, `$1${add}$2`);
    }
  }

  // 4. Append CAT_VOICE_MODAL_I18N
  const catModalRegex = /(CAT_VOICE_MODAL_I18N\s*=\s*\{[\s\S]*?)(\n\};)/m;
  const cmMatch = i18nContent.match(catModalRegex);
  if (cmMatch) {
    let add = ',\n';
    for (const [lCode, obj] of Object.entries(CAT_MODAL_EXTRA)) {
      add += `  ${lCode}: {\n`;
      add += `    title: "${obj.title}",\n`;
      add += `    formatDesc: (t, c, s) => \`\${t} (\${c}, ~\${s} MB)\`,\n`;
      add += `    downloadBtn: (s) => \`📥 ${obj.downloadBtn} (~\${s} MB)\`,\n`;
      add += `    cancelBtn: "${obj.cancelBtn}",\n`;
      add += `    retryBtn: "${obj.retryBtn}",\n`;
      add += `    downloading: "${obj.downloading}"\n`;
      add += `  },\n`;
    }
    i18nContent = i18nContent.replace(catModalRegex, `$1${add}$2`);
  }

  // 5. Add RTL support to setInterfaceLanguage and getInterfaceLanguage
  if (!i18nContent.includes("document.documentElement.setAttribute('dir'")) {
    const rtlLogic = `
  if (typeof document !== 'undefined' && document.documentElement) {
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  }`;
    i18nContent = i18nContent.replace(
      /(export function setInterfaceLanguage\(lang\) \{[\s\S]*?try \{[\s\S]*?\} catch \(e\) \{\})/,
      `$1${rtlLogic}`
    );
  }

  fs.writeFileSync(I18N_PATH, i18nContent, 'utf8');
  console.log('✅ frontend/services/i18n.js updated successfully!');

  // 6. Update SettingsView.js
  let settingsContent = fs.readFileSync(SETTINGS_VIEW_PATH, 'utf8');

  // Insert dropdown items
  const lastDropdownItem = '<div class="dropdown-item" data-value="uk">Українська</div>';
  if (settingsContent.includes(lastDropdownItem)) {
    const newItems = `
            <div class="dropdown-item" data-value="uk">Українська</div>
            <div class="dropdown-item" data-value="hi">हिन्दी</div>
            <div class="dropdown-item" data-value="ar">العربية</div>
            <div class="dropdown-item" data-value="id">Bahasa Indonesia</div>
            <div class="dropdown-item" data-value="vi">Tiếng Việt</div>
            <div class="dropdown-item" data-value="th">ไทย</div>
            <div class="dropdown-item" data-value="ko">한국어</div>
            <div class="dropdown-item" data-value="ja">日本語</div>`;
    settingsContent = settingsContent.replace(lastDropdownItem, newItems.trim());
  }

  // Insert into langNames map
  const lastLangName = "mt: 'Malti',";
  if (settingsContent.includes(lastLangName)) {
    const newLangNames = `mt: 'Malti',
    hi: 'हिन्दी',
    ar: 'العربية',
    id: 'Bahasa Indonesia',
    vi: 'Tiếng Việt',
    th: 'ไทย',
    ko: '한국어',
    ja: '日本語',`;
    settingsContent = settingsContent.replace(lastLangName, newLangNames);
  }

  fs.writeFileSync(SETTINGS_VIEW_PATH, settingsContent, 'utf8');
  console.log('✅ frontend/components/settings/SettingsView.js updated successfully!');
}

if (process.argv.includes('--run')) {
  merge().catch(console.error);
}
