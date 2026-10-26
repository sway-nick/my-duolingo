import { getInterfaceLanguage } from './i18n.js?v=386.0';
/**
 * Google AdMob Integration Service
 * Manages Rewarded Ads, Interstitials, Banners and Shield mechanisms
 * Supports Capacitor Native AdMob with Graceful Web/Offline Fallbacks
 * and automatic fallback to official Google Test Units while ad units are pending review.
 */

// Production AdMob Unit IDs
const MOCK_AD_I18N = {
  "ru": {"shield": "Защита 20 XP", "pack": "Языковой пакет", "download": "Скачивание", "watch": "Просмотр рекламы", "wait": "Вознаграждение будет начислено после окончания таймера:", "sec": "с", "skip": "Пропустить (без награды)", "done": "Награда получена!", "double_xp": "Удвоить XP (+20 XP)", "double_xp_done": "XP удвоено! (+20 XP)", "bonus_xp": "Бонус (+100 XP)", "bonus_xp_done": "Бонус получен! (+100 XP)"},
  "uk": {"shield": "Захист 20 XP", "pack": "Мовний пакет", "download": "Завантаження", "watch": "Перегляд реклами", "wait": "Винагороду буде нараховано після завершення таймера:", "sec": "с", "skip": "Пропустити (без нагороди)", "done": "Нагороду отримано!", "double_xp": "Подвоїти XP (+20 XP)", "double_xp_done": "XP подвоєно! (+20 XP)", "bonus_xp": "Бонус (+100 XP)", "bonus_xp_done": "Бонус отримано! (+100 XP)"},
  "en": {"shield": "20 XP Shield", "pack": "Language pack", "download": "Download", "watch": "Watch ad", "wait": "Your reward will be granted when the timer ends:", "sec": "s", "skip": "Skip (no reward)", "done": "Reward earned!", "double_xp": "Double XP (+20 XP)", "double_xp_done": "XP Doubled! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus earned! (+100 XP)"},
  "pt": {"shield": "Proteção de 20 XP", "pack": "Pacote de idioma", "download": "Download", "watch": "Assistir ao anúncio", "wait": "A recompensa será concedida quando o cronômetro terminar:", "sec": "s", "skip": "Pular (sem recompensa)", "done": "Recompensa recebida!", "double_xp": "Dobrar XP (+20 XP)", "double_xp_done": "XP dobrado! (+20 XP)", "bonus_xp": "Bônus (+100 XP)", "bonus_xp_done": "Bônus recebido! (+100 XP)"},
  "pt-br": {"shield": "Proteção de 20 XP", "pack": "Pacote de idioma", "download": "Download", "watch": "Assistir ao anúncio", "wait": "A recompensa será concedida quando o cronômetro terminar:", "sec": "s", "skip": "Pular (sem recompensa)", "done": "Recompensa recebida!", "double_xp": "Dobrar XP (+20 XP)", "double_xp_done": "XP dobrado! (+20 XP)", "bonus_xp": "Bônus (+100 XP)", "bonus_xp_done": "Bônus recebido! (+100 XP)"},
  "es": {"shield": "Protección 20 XP", "pack": "Paquete de idioma", "download": "Descarga", "watch": "Ver anuncio", "wait": "Tu recompensa se otorgará al finalizar el temporizador:", "sec": "s", "skip": "Omitir (sin recompensa)", "done": "¡Recompensa obtenida!", "double_xp": "Duplicar XP (+20 XP)", "double_xp_done": "¡XP duplicado! (+20 XP)", "bonus_xp": "Bono (+100 XP)", "bonus_xp_done": "¡Bono obtenido! (+100 XP)"},
  "es-mx": {"shield": "Protección 20 XP", "pack": "Paquete de idioma", "download": "Descarga", "watch": "Ver anuncio", "wait": "Tu recompensa se otorgará al finalizar el temporizador:", "sec": "s", "skip": "Omitir (sin recompensa)", "done": "¡Recompensa obtenida!", "double_xp": "Duplicar XP (+20 XP)", "double_xp_done": "¡XP duplicado! (+20 XP)", "bonus_xp": "Bono (+100 XP)", "bonus_xp_done": "¡Bono obtenido! (+100 XP)"},
  "hi": {"shield": "20 XP शील्ड", "pack": "भाषा पैक", "download": "डाउनलोड", "watch": "विज्ञापन देखें", "wait": "टाइमर समाप्त होने पर आपका पुरस्कार दिया जाएगा:", "sec": "सेकंड", "skip": "छोड़ें (बिना इनाम)", "done": "इनाम प्राप्त हुआ!", "double_xp": "XP दोगुना करें (+20 XP)", "double_xp_done": "XP दोगुना हो गया! (+20 XP)", "bonus_xp": "बोनस (+100 XP)", "bonus_xp_done": "बोनस प्राप्त हुआ! (+100 XP)"},
  "de": {"shield": "20 XP Schutz", "pack": "Sprachpaket", "download": "Download", "watch": "Werbung ansehen", "wait": "Deine Belohnung wird nach Ablauf des Timers vergeben:", "sec": "s", "skip": "Überspringen (keine Belohnung)", "done": "Belohnung erhalten!", "double_xp": "XP verdoppeln (+20 XP)", "double_xp_done": "XP verdoppelt! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus erhalten! (+100 XP)"},
  "fr": {"shield": "Bouclier 20 XP", "pack": "Pack de langue", "download": "Téléchargement", "watch": "Regarder la pub", "wait": "Votre récompense sera accordée à la fin du compte à rebours :", "sec": "s", "skip": "Passer (sans récompense)", "done": "Récompense obtenue !", "double_xp": "Doubler les XP (+20 XP)", "double_xp_done": "XP doublés ! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus obtenu ! (+100 XP)"},
  "it": {"shield": "Scudo 20 XP", "pack": "Pacchetto lingua", "download": "Download", "watch": "Guarda annuncio", "wait": "La ricompensa verrà assegnata al termine del timer:", "sec": "s", "skip": "Salta (senza ricompensa)", "done": "Ricompensa ottenuta!", "double_xp": "Raddoppia XP (+20 XP)", "double_xp_done": "XP raddoppiati! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus ottenuto! (+100 XP)"},
  "pl": {"shield": "Tarcza 20 XP", "pack": "Pakiet językowy", "download": "Pobieranie", "watch": "Obejrzyj reklamę", "wait": "Nagroda zostanie przyznana po zakończeniu odliczania:", "sec": "s", "skip": "Pomiń (bez nagrody)", "done": "Nagroda zdobyta!", "double_xp": "Podwój XP (+20 XP)", "double_xp_done": "XP podwojone! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus zdobyty! (+100 XP)"},
  "tr": {"shield": "20 XP Kalkanı", "pack": "Dil paketi", "download": "İndirme", "watch": "Reklamı izle", "wait": "Ödülünüz zamanlayıcı sona erdiğinde verilecektir:", "sec": "sn", "skip": "Atla (ödülsüz)", "done": "Ödül kazanıldı!", "double_xp": "2 Kat XP Kazan (+20 XP)", "double_xp_done": "XP İkiye Katlandı! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus kazanıldı! (+100 XP)"},
  "ro": {"shield": "Scut 20 XP", "pack": "Pachet de limbă", "download": "Descărcare", "watch": "Vizionează reclamă", "wait": "Recompensa va fi acordată la expirarea cronometrului:", "sec": "s", "skip": "Omite (fără recompensă)", "done": "Recompensă obținută!", "double_xp": "Dublează XP (+20 XP)", "double_xp_done": "XP dublat! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus obținut! (+100 XP)"},
  "bg": {"shield": "Щит 20 XP", "pack": "Езиков пакет", "download": "Изтегляне", "watch": "Гледане на реклама", "wait": "Наградата ще бъде начислена след изтичане на таймера:", "sec": "сек", "skip": "Пропусни (без награда)", "done": "Наградата е получена!", "double_xp": "Удвои XP (+20 XP)", "double_xp_done": "XP е удвоен! (+20 XP)", "bonus_xp": "Бонус (+100 XP)", "bonus_xp_done": "Бонусът е получен! (+100 XP)"},
  "hu": {"shield": "20 XP Pajzs", "pack": "Nyelvi csomag", "download": "Letöltés", "watch": "Hirdetés megtekintése", "wait": "A jutalom az időzítő lejárta után kerül jóváírásra:", "sec": "mp", "skip": "Kihagyás (jutalom nélkül)", "done": "Jutalom megszerezve!", "double_xp": "XP megduplázása (+20 XP)", "double_xp_done": "XP megduplázva! (+20 XP)", "bonus_xp": "Bónusz (+100 XP)", "bonus_xp_done": "Bónusz megszerezve! (+100 XP)"},
  "el": {"shield": "Ασπίδα 20 XP", "pack": "Πακέτο γλώσσας", "download": "Λήψη", "watch": "Προβολή διαφήμισης", "wait": "Η ανταμοιβή θα δοθεί μετά τη λήξη του χρονομέτρου:", "sec": "δευτ", "skip": "Παράλειψη (χωρίς ανταμοιβή)", "done": "Η ανταμοιβή αποκτήθηκε!", "double_xp": "Διπλασιασμός XP (+20 XP)", "double_xp_done": "Τα XP διπλασιάστηκαν! (+20 XP)", "bonus_xp": "Μπόνους (+100 XP)", "bonus_xp_done": "Το μπόνους αποκτήθηκε! (+100 XP)"},
  "da": {"shield": "20 XP Skjold", "pack": "Sprogpakke", "download": "Download", "watch": "Se annonce", "wait": "Din belønning gives, når timeren udløber:", "sec": "s", "skip": "Spring over (uden belønning)", "done": "Belønning modtaget!", "double_xp": "Fordobl XP (+20 XP)", "double_xp_done": "XP fordoblet! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus modtaget! (+100 XP)"},
  "ga": {"shield": "Sciath 20 XP", "pack": "Pacáiste teanga", "download": "Íoslódáil", "watch": "Féach ar fhógra", "wait": "Gheofar an luach saothair nuair a bheidh an t-amadóir thart:", "sec": "s", "skip": "Léim (gan luach saothair)", "done": "Luach saothair faighte!", "double_xp": "Dúbail XP (+20 XP)", "double_xp_done": "XP dúbailte! (+20 XP)", "bonus_xp": "Bónas (+100 XP)", "bonus_xp_done": "Bónas faighte! (+100 XP)"},
  "lv": {"shield": "20 XP Vairogs", "pack": "Valodas pakotne", "download": "Lejupielāde", "watch": "Skatīties reklāmu", "wait": "Atlīdzība tiks piešķirta pēc taimera beigām:", "sec": "s", "skip": "Izlaist (bez atlīdzības)", "done": "Atlīdzība saņemta!", "double_xp": "Dubultot XP (+20 XP)", "double_xp_done": "XP dubultots! (+20 XP)", "bonus_xp": "Bonuss (+100 XP)", "bonus_xp_done": "Bonuss saņemts! (+100 XP)"},
  "lt": {"shield": "20 XP Skydas", "pack": "Kalbos paketas", "download": "Atsisiųsti", "watch": "Žiūrėti reklamą", "wait": "Apdovanojimas bus suteiktas pasibaigus laikmačiui:", "sec": "s", "skip": "Praleisti (be apdovanojimo)", "done": "Apdovanojimas gautas!", "double_xp": "Padvigubinti XP (+20 XP)", "double_xp_done": "XP padvigubinta! (+20 XP)", "bonus_xp": "Premija (+100 XP)", "bonus_xp_done": "Premija gauta! (+100 XP)"},
  "mt": {"shield": "Tarka ta' 20 XP", "pack": "Pakkett tal-lingwa", "download": "Niżżel", "watch": "Ara r-reklam", "wait": "Il-premju jingħata meta jispiċċa t-tajmer:", "sec": "s", "skip": "Aqbeż (bla premju)", "done": "Premju miksub!", "double_xp": "Irdoppja l-XP (+20 XP)", "double_xp_done": "XP irdoppjat! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus miksub! (+100 XP)"},
  "sk": {"shield": "20 XP Štít", "pack": "Jazykový balíček", "download": "Stiahnutie", "watch": "Pozrieť reklamu", "wait": "Odmena bude udelená po uplynutí časovača:", "sec": "s", "skip": "Preskočiť (bez odmeny)", "done": "Odmena získaná!", "double_xp": "Zdvojnásobiť XP (+20 XP)", "double_xp_done": "XP zdvojnásobené! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus získaný! (+100 XP)"},
  "sl": {"shield": "Ščit 20 XP", "pack": "Jezikovni paket", "download": "Prenos", "watch": "Ogled oglasa", "wait": "Nagrada bo podeljena po izteku časovnika:", "sec": "s", "skip": "Preskoči (brez nagrade)", "done": "Nagrada prejeta!", "double_xp": "Podvoji XP (+20 XP)", "double_xp_done": "XP podvojen! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus prejet! (+100 XP)"},
  "fi": {"shield": "20 XP Kilpi", "pack": "Kielipaketti", "download": "Lataus", "watch": "Katso mainos", "wait": "Palkinto myönnetään ajastimen päätyttyä:", "sec": "s", "skip": "Ohita (ilman palkintoa)", "done": "Palkinto ansaittu!", "double_xp": "Tuplaa XP (+20 XP)", "double_xp_done": "XP tuplattu! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus saatu! (+100 XP)"},
  "hr": {"shield": "20 XP Štit", "pack": "Jezični paket", "download": "Preuzimanje", "watch": "Pogledaj oglas", "wait": "Nagrada će biti dodijeljena nakon isteka odbrojavanja:", "sec": "s", "skip": "Preskoči (bez nagrade)", "done": "Nagrada osvojena!", "double_xp": "Udvostruči XP (+20 XP)", "double_xp_done": "XP udvostručen! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus osvojen! (+100 XP)"},
  "cs": {"shield": "20 XP Štít", "pack": "Jazykový balíček", "download": "Stáhnout", "watch": "Zhlédnout reklamu", "wait": "Odměna bude udělena po vypršení časovače:", "sec": "s", "skip": "Přeskočit (bez odměny)", "done": "Odměna získána!", "double_xp": "Zdvojnásobit XP (+20 XP)", "double_xp_done": "XP zdvojnásobeno! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus získán! (+100 XP)"},
  "sv": {"shield": "20 XP Sköld", "pack": "Språkpaket", "download": "Ladda ner", "watch": "Titta på annons", "wait": "Din belöning ges när timern tar slut:", "sec": "s", "skip": "Hoppa över (utan belöning)", "done": "Belöning erhållen!", "double_xp": "Dubbla XP (+20 XP)", "double_xp_done": "XP fördubblat! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus erhållen! (+100 XP)"},
  "et": {"shield": "20 XP Kilp", "pack": "Keelepakett", "download": "Laadi alla", "watch": "Vaata reklaami", "wait": "Preemia antakse pärast taimeri lõppemist:", "sec": "s", "skip": "Jäta vahele (ilma preemiata)", "done": "Preemia teenitud!", "double_xp": "Kahekordista XP (+20 XP)", "double_xp_done": "XP kahekordistatud! (+20 XP)", "bonus_xp": "Boonus (+100 XP)", "bonus_xp_done": "Boonus teenitud! (+100 XP)"},
  "ar": {"shield": "درع 20 XP", "pack": "حزمة اللغة", "download": "تنزيل", "watch": "مشاهدة الإعلان", "wait": "ستحصل على المكافأة بعد انتهاء المؤقت:", "sec": "ث", "skip": "تخطي (بدون مكافأة)", "done": "تم الحصول على المكافأة!", "double_xp": "مضاعفة XP (+20 XP)", "double_xp_done": "تمت مضاعفة XP! (+20 XP)", "bonus_xp": "مكافأة (+100 XP)", "bonus_xp_done": "تم الحصول على المكافأة! (+100 XP)"},
  "id": {"shield": "Perisai 20 XP", "pack": "Paket bahasa", "download": "Unduh", "watch": "Tonton iklan", "wait": "Hadiah Anda akan diberikan setelah penghitung waktu selesai:", "sec": "dtk", "skip": "Lewati (tanpa hadiah)", "done": "Hadiah didapatkan!", "double_xp": "Gandakan XP (+20 XP)", "double_xp_done": "XP digandakan! (+20 XP)", "bonus_xp": "Bonus (+100 XP)", "bonus_xp_done": "Bonus didapatkan! (+100 XP)"},
  "vi": {"shield": "Khiên 20 XP", "pack": "Gói ngôn ngữ", "download": "Tải xuống", "watch": "Xem quảng cáo", "wait": "Phần thưởng sẽ được trao sau khi hết giờ:", "sec": "giây", "skip": "Bỏ qua (không có thưởng)", "done": "Đã nhận thưởng!", "double_xp": "Nhân đôi XP (+20 XP)", "double_xp_done": "Đã nhân đôi XP! (+20 XP)", "bonus_xp": "Thưởng (+100 XP)", "bonus_xp_done": "Đã nhận thưởng! (+100 XP)"},
  "th": {"shield": "โล่ 20 XP", "pack": "แพ็กเกจภาษา", "download": "ดาวน์โหลด", "watch": "ดูโฆษณา", "wait": "คุณจะได้รับรางวัลเมื่อตัวจับเวลาสิ้นสุดลง:", "sec": "วินาที", "skip": "ข้าม (ไม่รับรางวัล)", "done": "ได้รับรางวัลแล้ว!", "double_xp": "เพิ่ม XP 2 เท่า (+20 XP)", "double_xp_done": "รับ XP 2 เท่าแล้ว! (+20 XP)", "bonus_xp": "โบนัส (+100 XP)", "bonus_xp_done": "รับโบนัสแล้ว! (+100 XP)"},
  "ko": {"shield": "20 XP 방패", "pack": "언어 팩", "download": "다운로드", "watch": "광고 시청", "wait": "타이머가 끝나면 보상이 지급됩니다:", "sec": "초", "skip": "건너뛰기 (보상 없음)", "done": "보상 획득!", "double_xp": "XP 2배 받기 (+20 XP)", "double_xp_done": "XP 2배 획득 완료! (+20 XP)", "bonus_xp": "보너스 (+100 XP)", "bonus_xp_done": "보너스 획득 완료! (+100 XP)"},
  "ja": {"shield": "20 XP シールド", "pack": "言語パック", "download": "ダウンロード", "watch": "広告を見る", "wait": "タイマー終了後にリワードが付与されます:", "sec": "秒", "skip": "スキップ（報酬なし）", "done": "報酬を獲得しました！", "double_xp": "XPを2倍にする (+20 XP)", "double_xp_done": "XPが2倍になりました！ (+20 XP)", "bonus_xp": "ボーナス (+100 XP)", "bonus_xp_done": "ボーナスを獲得しました！ (+100 XP)"},
};

function mockAdText(key) {
  let lang = 'en';
  try {
    lang = (getInterfaceLanguage() || 'en').toLowerCase().trim();
  } catch (e) {}

  const dict = MOCK_AD_I18N[lang] || MOCK_AD_I18N[lang.split(/[-_]/)[0]] || MOCK_AD_I18N.en;
  return (dict && dict[key]) || (MOCK_AD_I18N.en && MOCK_AD_I18N.en[key]) || key;
}
export const AD_CONFIG = {
  APP_ID: 'ca-app-pub-9917058160362744~9932614693',
  UNITS: {
    REWARDED_SHIELD: 'ca-app-pub-9917058160362744/1964468644',
    REWARDED_PACKS: 'ca-app-pub-9917058160362744/5712141963',
    INTERSTITIAL_ROUND: 'ca-app-pub-9917058160362744/8667634483',
    BANNER_FAVORITES: 'ca-app-pub-9917058160362744/5957710665'
  },
  // Official Google AdMob Test Units (always return 100% filled test ads)
  TEST_UNITS: {
    REWARDED_SHIELD: 'ca-app-pub-3940256099942544/5224354917',
    REWARDED_PACKS: 'ca-app-pub-3940256099942544/5224354917',
    INTERSTITIAL_ROUND: 'ca-app-pub-3940256099942544/1033173712',
    BANNER_FAVORITES: 'ca-app-pub-3940256099942544/6300978111'
  }
};

class AdServiceImpl {
  getTodayDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  canClaimDailyBonus() {
    try {
      if (typeof localStorage === 'undefined') return true;
      const lastDate = localStorage.getItem('daily_bonus_xp_last_date');
      return lastDate !== this.getTodayDateKey();
    } catch (e) {
      return true;
    }
  }

  markDailyBonusClaimed() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('daily_bonus_xp_last_date', this.getTodayDateKey());
      }
    } catch (e) {}
  }

  async showBonusXpRewardedAd(bonusAmount = 100) {
    return this.showDoubleXpRewardedAd(bonusAmount);
  }

  constructor() {
    this.initialized = false;
    this.maxShieldsPerRound = 3;
    this.shieldsUsedInRound = 0;
    this.isShieldAdPrepared = false;
    this.isInterstitialPrepared = false;
    this.isPreparingInterstitial = false;
    this.isBannerActive = false;
    this.bannerCreated = false;
    this.roundsCompletedSinceLastAd = 0;
    this.minRoundsBetweenInterstitials = 1;
    this.lastInterstitialTime = 0;

    // Production AdMob ads enabled (account approved by Google).
    // Test devices registered in Google console or testingDevices receive test ads safely.
    this.useTestAds = false;

    // Bind methods
    this.init = this.init.bind(this);
  }

  getNativeAdMob() {
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins) {
      return window.Capacitor.Plugins.AdMob || null;
    }
    return null;
  }

  isNative() {
    return Boolean(
      typeof window !== 'undefined' &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === 'function' &&
      window.Capacitor.isNativePlatform()
    );
  }

  getI18nText(key) {
    return mockAdText(key);
  }

  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  }

  /**
   * Initialize AdMob SDK
   */
  async init() {
    if (this.initialized) return;
    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          testingDevices: [
            'EMULATOR',
            '88fdb90c-2abb-45e2-b323-35336fbe2ddc',
            '88FDB90C-2ABB-45E2-B323-35336FBE2DDC'
          ],
          initializeForTesting: false
        });
        this.initialized = true;
        console.log('✅ Google AdMob initialized on Android');
        // Preload interstitial ad in the background (rewarded ads preloaded just-in-time)
        this.preloadInterstitial().catch(() => {});
      } catch (err) {
        console.warn('⚠️ AdMob native init error:', err);
      }
    } else {
      this.initialized = true;
      console.log('ℹ️ AdMob running in Web/Simulator mode');
    }
  }

  /**
   * Reset shield counters when starting a new training round
   */
  resetRoundShields() {
    this.shieldsUsedInRound = 0;
    console.log('🛡️ Round shields reset. Available: 3/3');
    this.preloadInterstitial().catch(() => {});
  }

  /**
   * Get remaining shields in current training round
   */
  getShieldsRemaining() {
    return Math.max(0, this.maxShieldsPerRound - this.shieldsUsedInRound);
  }

  /**
   * Check if user can use a shield (has remaining shields and network available)
   */
  canUseShield() {
    return this.getShieldsRemaining() > 0 && this.isOnline();
  }

  /**
   * Get target ad unit ID based on test / production setting
   */
  getUnitId(type) {
    if (this.useTestAds) {
      return AD_CONFIG.TEST_UNITS[type] || AD_CONFIG.TEST_UNITS.REWARDED_SHIELD;
    }
    return AD_CONFIG.UNITS[type] || '';
  }

  /**
   * Prepare rewarded ad for display
   */
  async prepareRewarded(unitType = 'REWARDED_SHIELD') {
    const AdMob = this.getNativeAdMob();
    if (!AdMob || !this.isNative() || !this.isOnline()) return false;

    const primaryId = this.getUnitId(unitType);
    if (!primaryId) return false;

    try {
      await AdMob.prepareRewardVideoAd({ adId: primaryId });
      if (unitType === 'REWARDED_SHIELD') {
        this.isShieldAdPrepared = true;
      }
      return true;
    } catch (e) {
      console.warn(`AdMob rewarded unit ${primaryId} unavailable (no fill / region / network), skipping ad:`, e);
      return false;
    }
  }

  /**
   * Preload rewarded video ad for the shield
   */
  async preloadShieldAd() {
    return this.prepareRewarded('REWARDED_SHIELD');
  }

  /**
   * Preload Interstitial Ad in background so it displays with 0ms delay when a round finishes
   */
  async preloadInterstitial() {
    if (this.isPreparingInterstitial || this.isInterstitialPrepared) return false;
    const AdMob = this.getNativeAdMob();
    if (!AdMob || !this.isNative() || !this.isOnline()) return false;

    const adId = this.getUnitId('INTERSTITIAL_ROUND');
    if (!adId) return false;

    this.isPreparingInterstitial = true;
    try {
      await AdMob.prepareInterstitial({ adId });
      this.isInterstitialPrepared = true;
      console.log('✅ AdMob Interstitial preloaded and ready in memory');
      return true;
    } catch (err) {
      console.warn('⚠️ AdMob Interstitial preload unavailable (no fill / region / network), skipping ad:', err);
      this.isInterstitialPrepared = false;
      return false;
    } finally {
      this.isPreparingInterstitial = false;
    }
  }

  /**
   * Show Rewarded Ad to save 20 XP in Test mode
   * Returns Promise<{ success: boolean, rewardEarned: boolean, isOffline: boolean }>
   */
  /**
   * Show Rewarded Video to grant Double XP on round completion
   * Returns Promise<{ success: boolean, rewardEarned: boolean, isOffline: boolean }>
   */
  async showDoubleXpRewardedAd(bonusAmount = 100) {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_double_xp_requested', { bonus: bonusAmount });
    }

    if (!this.isOnline()) {
      return { success: false, rewardEarned: false, isOffline: true };
    }

    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      return new Promise(async (resolve) => {
        let rewardGranted = false;
        let isResolved = false;
        const listeners = [];
        let fallbackTimer = null;

        const cleanup = () => {
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }
          listeners.forEach((sub) => {
            try { if (sub && typeof sub.remove === 'function') sub.remove(); } catch (e) {}
          });
          listeners.length = 0;
        };

        const safeResolve = (result) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(result);
        };

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ AdMob Double XP timeout (10s), releasing button smoothly');
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }, 10000);

        try {
          const onReward = () => {
            console.log('🏆 AdMob Double XP reward earned!');
            rewardGranted = true;
            if (typeof window !== 'undefined' && window.trackEvent) {
              window.trackEvent('ad_double_xp_reward_earned', { bonus: bonusAmount });
            }
          };

          const onDismiss = () => {
            console.log('📺 AdMob Double XP ad dismissed, reward =', rewardGranted);
            if (rewardGranted) {
              safeResolve({ success: true, rewardEarned: true, isOffline: false });
            } else {
              safeResolve({ success: false, rewardEarned: false, isOffline: false });
            }
          };

          const onFailed = (err) => {
            console.warn('❌ AdMob Double XP ad failed to show:', err);
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
          };

          listeners.push(await AdMob.addListener('onRewardedVideoAdReward', onReward));
          listeners.push(await AdMob.addListener('onRewarded', onReward));
          listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', onFailed));
          listeners.push(await AdMob.addListener('onFailedToShow', onFailed));

          const prepared = await this.prepareRewarded('REWARDED_SHIELD');
          if (!prepared) {
            console.warn('⚠️ Could not prepare Double XP rewarded ad');
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
            return;
          }

          AdMob.showRewardVideoAd().catch((err) => {
            console.warn('AdMob show error in Double XP:', err);
            onFailed(err);
          });
        } catch (e) {
          console.warn('⚠️ Exception in showDoubleXpRewardedAd:', e);
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }
      });
    }

    return this.showWebMockRewardedAd(`⚡ ${mockAdText('double_xp')} (+${bonusAmount} XP)`, false);
  }

  async showShieldRewardedAd() {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_shield_requested');
    }

    if (!this.isOnline()) {
      return { success: false, rewardEarned: false, isOffline: true };
    }

    if (this.getShieldsRemaining() <= 0) {
      return { success: false, rewardEarned: false, isOffline: false };
    }

    const AdMob = this.getNativeAdMob();

    // 1. Native Android AdMob Flow
    if (AdMob && this.isNative()) {
      return new Promise(async (resolve) => {
        let rewardGranted = false;
        let isResolved = false;
        const listeners = [];
        let fallbackTimer = null;

        const cleanup = () => {
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }
          listeners.forEach((sub) => {
            try { if (sub && typeof sub.remove === 'function') sub.remove(); } catch (e) {}
          });
          listeners.length = 0;
        };

        const safeResolve = (result) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(result);
        };

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ AdMob Double XP timeout (10s), releasing button smoothly');
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }, 10000);

        try {
          // Listen to BOTH standard plugin event names to guarantee callback
          const onReward = () => {
            console.log('🏆 AdMob Rewarded video reward earned!');
            rewardGranted = true;
            if (typeof window !== 'undefined' && window.trackEvent) {
              window.trackEvent('ad_shield_reward_earned');
            }
          };

          const onDismiss = () => {
            console.log('📺 AdMob Rewarded video dismissed, reward =', rewardGranted);
            if (rewardGranted) {
              this.shieldsUsedInRound++;
              this.isShieldAdPrepared = false;
              this.preloadShieldAd().catch(() => {});
              safeResolve({ success: true, rewardEarned: true, isOffline: false });
            } else {
              safeResolve({ success: false, rewardEarned: false, isOffline: false });
            }
          };

          const onFailed = (err) => {
            console.warn('❌ AdMob Rewarded video failed to show:', err);
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
          };

          // Register across both naming conventions supported by Capacitor AdMob versions
          listeners.push(await AdMob.addListener('onRewardedVideoAdReward', onReward));
          listeners.push(await AdMob.addListener('onRewarded', onReward));
          listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', onFailed));
          listeners.push(await AdMob.addListener('onFailedToShow', onFailed));

          // Ensure video is prepared
          if (!this.isShieldAdPrepared) {
            const prepared = await this.prepareRewarded('REWARDED_SHIELD');
            if (!prepared) {
              safeResolve({ success: false, rewardEarned: false, isOffline: false });
              return;
            }
          }

          AdMob.showRewardVideoAd().catch((err) => {
            console.warn('AdMob show error, falling back:', err);
            onFailed(err);
          });
        } catch (err) {
          console.warn('AdMob show exception, falling back:', err);
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }
      });
    }

    // 2. Web / Browser Test Simulator Modal
    return this.showWebMockRewardedAd('🛡️ ' + mockAdText('shield'), true);
  }

  /**
   * Show Rewarded Ad to download a language or audio pack
   */
  async showLanguagePackRewardedAd(packTitle = mockAdText('pack')) {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_pack_requested', { pack: packTitle });
    }

    if (!this.isOnline()) {
      return { success: false, rewardEarned: false, isOffline: true };
    }

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      return new Promise(async (resolve) => {
        let rewardGranted = false;
        let isResolved = false;
        const listeners = [];
        let fallbackTimer = null;

        const cleanup = () => {
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }
          listeners.forEach((sub) => {
            try { if (sub && typeof sub.remove === 'function') sub.remove(); } catch (e) {}
          });
          listeners.length = 0;
        };

        const safeResolve = (result) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(result);
        };

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ AdMob Double XP timeout (10s), releasing button smoothly');
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }, 10000);

        try {
          const onReward = () => {
            console.log('🏆 Language pack reward earned!');
            rewardGranted = true;
            if (typeof window !== 'undefined' && window.trackEvent) {
              window.trackEvent('ad_pack_reward_earned', { pack: packTitle });
            }
          };
          const onDismiss = () => {
            console.log('📺 Language pack ad dismissed, reward =', rewardGranted);
            safeResolve({ success: true, rewardEarned: rewardGranted, isOffline: false });
          };
          const onFailed = (err) => {
            console.warn('❌ Language pack ad failed to show:', err);
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
          };

          listeners.push(await AdMob.addListener('onRewardedVideoAdReward', onReward));
          listeners.push(await AdMob.addListener('onRewarded', onReward));
          listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onDismissed', onDismiss));
          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', onFailed));
          listeners.push(await AdMob.addListener('onFailedToShow', onFailed));

          const prepared = await this.prepareRewarded('REWARDED_PACKS');
          if (!prepared) {
            console.warn('⚠️ Could not prepare REWARDED_PACKS ad');
            safeResolve({ success: false, rewardEarned: false, isOffline: false });
            return;
          }

          AdMob.showRewardVideoAd().catch((err) => {
            console.warn('AdMob language pack show error:', err);
            onFailed(err);
          });
        } catch (e) {
          console.warn('⚠️ Exception in showLanguagePackRewardedAd:', e);
          safeResolve({ success: false, rewardEarned: false, isOffline: false });
        }
      });
    }

    return this.showWebMockRewardedAd(`📦 ${mockAdText('download')}: ${packTitle}`, false);
  }

  /**
   * Show Interstitial Ad at the end of a round
   * Includes frequency capping (at least 2 rounds or 3 minutes)
   * Displays with 0ms delay if preloaded, and queues next preload in background
   */
  async showRoundFinishInterstitial() {
    this.roundsCompletedSinceLastAd++;

    if (this.roundsCompletedSinceLastAd < this.minRoundsBetweenInterstitials) {
      console.log(`ℹ️ Interstitial deferred: round ${this.roundsCompletedSinceLastAd}/${this.minRoundsBetweenInterstitials}`);
      this.preloadInterstitial().catch(() => {});
      return false;
    }

    if (!this.isOnline()) return false;

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('INTERSTITIAL_ROUND');
        if (!adId) return false;

        if (!this.isInterstitialPrepared) {
          console.log('⏳ Interstitial not preloaded, preparing now...');
          await AdMob.prepareInterstitial({ adId });
          this.isInterstitialPrepared = true;
        }

        await AdMob.showInterstitial();
        this.isInterstitialPrepared = false;

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('ad_interstitial_shown');
        }
        this.roundsCompletedSinceLastAd = 0;
        this.lastInterstitialTime = Date.now();
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ad_training_early_exit_last_time', String(Date.now()));
          }
        } catch (e) {}

        // Immediately preload NEXT interstitial in background for next round
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 1500);

        return true;
      } catch (err) {
        console.warn('AdMob interstitial failed to load/show:', err);
        this.isInterstitialPrepared = false;
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 3000);
        return false;
      }
    }

    console.log('ℹ️ [Web Simulator] Round finish interstitial shown');
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_interstitial_shown');
    }
    this.roundsCompletedSinceLastAd = 0;
    this.lastInterstitialTime = Date.now();
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ad_training_early_exit_last_time', String(Date.now()));
          }
        } catch (e) {}
    return true;
  }

  /**
   * Show Interstitial Ad upon user-initiated exit from Collections & Lists.
   * Strict limits:
   * 1. Max 2 times per day (daily cap).
   * 2. Not more frequently than once per hour (3600 seconds cooldown).
   */
  async showCollectionsExitInterstitial() {
    if (!this.isOnline()) return false;
    const now = Date.now();
    const STORAGE_KEY_COL_EXIT = 'ad_col_exit_interstitial_stats';

    let stats = { count: 0, date: '', lastShown: 0 };
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COL_EXIT);
      if (raw) stats = JSON.parse(raw);
    } catch (e) {}

    const todayStr = new Date().toISOString().slice(0, 10);
    if (stats.date !== todayStr) {
      stats.count = 0;
      stats.date = todayStr;
    }

    if (stats.count >= 2) {
      console.log(`ℹ️ Collections exit interstitial skipped: daily cap of 2 reached today (${stats.count}/2)`);
      this.preloadInterstitial().catch(() => {});
      return false;
    }

    const ONE_HOUR_MS = 60 * 60 * 1000;
    if (stats.lastShown && (now - stats.lastShown < ONE_HOUR_MS)) {
      const minutesRemaining = Math.ceil((ONE_HOUR_MS - (now - stats.lastShown)) / 60000);
      console.log(`ℹ️ Collections exit interstitial skipped: 1-hour cooldown active (${minutesRemaining}m remaining)`);
      this.preloadInterstitial().catch(() => {});
      return false;
    }

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('INTERSTITIAL_ROUND');
        if (!adId) return false;

        if (!this.isInterstitialPrepared) {
          console.log('⏳ Collections exit interstitial not preloaded, preparing now...');
          await AdMob.prepareInterstitial({ adId });
          this.isInterstitialPrepared = true;
        }

        await AdMob.showInterstitial();
        this.isInterstitialPrepared = false;

        stats.count = (stats.count || 0) + 1;
        stats.lastShown = now;
        stats.date = todayStr;
        try {
          localStorage.setItem(STORAGE_KEY_COL_EXIT, JSON.stringify(stats));
        } catch (e) {}

        this.lastInterstitialTime = now;
        this.roundsCompletedSinceLastAd = 0;

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('ad_interstitial_col_exit_shown', { daily_count: stats.count });
        }

        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 1500);

        return true;
      } catch (err) {
        console.warn('AdMob collections exit interstitial failed:', err);
        this.isInterstitialPrepared = false;
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 3000);
        return false;
      }
    }

    console.log('ℹ️ [Web Simulator] Collections exit interstitial shown');
    stats.count = (stats.count || 0) + 1;
    stats.lastShown = now;
    stats.date = todayStr;
    try {
      localStorage.setItem(STORAGE_KEY_COL_EXIT, JSON.stringify(stats));
    } catch (e) {}
    this.lastInterstitialTime = now;
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_interstitial_col_exit_shown', { daily_count: stats.count });
    }
    return true;
  }

  /**
   * Show Interstitial Ad upon user-initiated early exit from Quiz, Pairs, or Test in a training round.
   * Strict rules:
   * 1. Never for Cards (handled at invocation site).
   * 2. Cooldown of 60 minutes (3600 seconds) between early exit interstitials.
   * 3. Unlimited daily frequency (no daily cap).
   */
  async showTrainingEarlyExitInterstitial() {
    if (!this.isOnline()) return false;
    const now = Date.now();
    const STORAGE_KEY_EARLY_EXIT = 'ad_training_early_exit_last_time';
    const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes (was 60m)

    let lastShown = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EARLY_EXIT);
      if (stored) lastShown = parseInt(stored, 10) || 0;
    } catch (e) {}

    if (lastShown > 0 && (now - lastShown < COOLDOWN_MS)) {
      const remainingMins = Math.ceil((COOLDOWN_MS - (now - lastShown)) / 60000);
      console.log(`ℹ️ Training early exit interstitial skipped: 10-minute cooldown active (${remainingMins}m remaining)`);
      this.preloadInterstitial().catch(() => {});
      return false;
    }

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('INTERSTITIAL_ROUND');
        if (!adId) return false;

        if (!this.isInterstitialPrepared) {
          console.log('⏳ Training early exit interstitial not preloaded, preparing now...');
          await AdMob.prepareInterstitial({ adId });
          this.isInterstitialPrepared = true;
        }

        await AdMob.showInterstitial();
        this.isInterstitialPrepared = false;

        try {
          localStorage.setItem(STORAGE_KEY_EARLY_EXIT, String(now));
        } catch (e) {}
        this.lastInterstitialTime = now;

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('ad_interstitial_early_exit_shown');
        }

        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 1500);

        return true;
      } catch (err) {
        console.warn('AdMob early exit interstitial failed to load/show:', err);
        this.isInterstitialPrepared = false;
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 3000);
        return false;
      }
    }

    console.log('ℹ️ [Web Simulator] Training early exit interstitial shown');
    try {
      localStorage.setItem(STORAGE_KEY_EARLY_EXIT, String(now));
    } catch (e) {}
    this.lastInterstitialTime = now;
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_interstitial_early_exit_shown');
    }
    return true;
  }

  /**
   * Show Interstitial Ad upon user-initiated transition between training and other tabs/screens.
   * Protected with a 60-second cooldown so it never spams or causes accidental clicks.
   */
  async showTransitionInterstitial(minCooldownSeconds = 60) {
    if (!this.isOnline()) return false;
    const now = Date.now();
    if (this.lastInterstitialTime && (now - this.lastInterstitialTime < minCooldownSeconds * 1000)) {
      console.log(`ℹ️ Transition interstitial skipped: only ${Math.round((now - this.lastInterstitialTime)/1000)}s since last ad (cooldown: ${minCooldownSeconds}s)`);
      this.preloadInterstitial().catch(() => {});
      return false;
    }

    const AdMob = this.getNativeAdMob();
    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('INTERSTITIAL_ROUND');
        if (!adId) return false;

        if (!this.isInterstitialPrepared) {
          console.log('⏳ Transition interstitial not preloaded, preparing now...');
          await AdMob.prepareInterstitial({ adId });
          this.isInterstitialPrepared = true;
        }

        await AdMob.showInterstitial();
        this.isInterstitialPrepared = false;

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('ad_interstitial_transition_shown');
        }
        this.lastInterstitialTime = Date.now();
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ad_training_early_exit_last_time', String(Date.now()));
          }
        } catch (e) {}
        this.roundsCompletedSinceLastAd = 0;

        // Preload next interstitial in background
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 1500);

        return true;
      } catch (err) {
        console.warn('AdMob transition interstitial failed:', err);
        this.isInterstitialPrepared = false;
        setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, 3000);
        return false;
      }
    }

    console.log('ℹ️ [Web Simulator] Transition interstitial shown');
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('ad_interstitial_transition_shown');
    }
    this.lastInterstitialTime = Date.now();
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ad_training_early_exit_last_time', String(Date.now()));
          }
        } catch (e) {}
    this.roundsCompletedSinceLastAd = 0;
    return true;
  }

  /**
   * Show Bottom Banner (Stats & Leaderboard)
   */
  async showBottomBanner() {
    if (this.isBannerActive || !this.isOnline()) return;
    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      try {
        const adId = this.getUnitId('BANNER_FAVORITES');
        if (!adId) return;
        await AdMob.showBanner({
          adId,
          adSize: 'ADAPTIVE_BANNER',
          position: 'BOTTOM_CENTER',
          margin: 0
        });
        this.bannerCreated = true;
        this.isBannerActive = true;
      } catch (e) {
        console.warn('AdMob banner error:', e);
      }
    } else {
      this.renderWebBannerPlaceholder(true);
      this.isBannerActive = true;
    }
  }

  /**
   * Hide Bottom Banner (cleanly removes view so re-entry creates a fresh banner)
   */
  async hideBottomBanner() {
    if (!this.isBannerActive && !this.bannerCreated) return;
    const AdMob = this.getNativeAdMob();

    if (AdMob && this.isNative()) {
      try {
        await AdMob.removeBanner();
      } catch (e) {
        try { await AdMob.hideBanner(); } catch (_) {}
      }
    } else {
      this.renderWebBannerPlaceholder(false);
    }
    this.bannerCreated = false;
    this.isBannerActive = false;
  }

  // Compatibility aliases
  async showFavoritesBanner() { return this.showBottomBanner(); }
  async hideFavoritesBanner() { return this.hideBottomBanner(); }

  /**
   * Web Mock Rewarded Ad Modal (for local browser testing and dev preview)
   */
  showWebMockRewardedAd(title = mockAdText('watch'), isShield = false) {
    if (typeof document === 'undefined') {
      return Promise.resolve({ success: true, rewardEarned: true, isOffline: false });
    }
    return new Promise((resolve) => {
      const existing = document.getElementById('admob-mock-modal');
      if (existing) existing.remove();

      let timeLeft = 5;
      const modal = document.createElement('div');
      modal.id = 'admob-mock-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 24px;
        box-sizing: border-box;
      `;

      modal.innerHTML = `
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px 24px; max-width: 360px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="display: inline-block; background: #e65100; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 16px;">
            GOOGLE ADMOB PREVIEW
          </div>
          <div style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">${title}</div>
          <p style="font-size: 14px; color: #94a3b8; margin: 0 0 20px 0;">
            ${mockAdText('wait')}
          </p>
          <div id="mock-ad-timer" style="font-size: 42px; font-weight: 900; color: #f59e0b; margin-bottom: 20px; font-variant-numeric: tabular-nums;">
            ${timeLeft}${mockAdText('sec')}
          </div>
          <div style="background: #334155; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 24px;">
            <div id="mock-ad-progress" style="background: #f59e0b; height: 100%; width: 0%; transition: width 1s linear;"></div>
          </div>
          <button id="mock-ad-close-btn" style="background: transparent; border: 1px solid #475569; color: #94a3b8; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; display: none;">
            ${mockAdText('skip')}
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      const timerEl = modal.querySelector('#mock-ad-timer');
      const progressEl = modal.querySelector('#mock-ad-progress');
      const closeBtn = modal.querySelector('#mock-ad-close-btn');

      const interval = setInterval(() => {
        timeLeft--;
        if (progressEl) progressEl.style.width = `${((5 - timeLeft) / 5) * 100}%`;
        if (timerEl) timerEl.textContent = `${timeLeft}${mockAdText('sec')}`;

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (timerEl) {
            timerEl.textContent = '✓ ' + mockAdText('done');
            timerEl.style.color = '#22c55e';
            timerEl.style.fontSize = '24px';
          }
          setTimeout(() => {
            modal.remove();
            if (isShield) {
              this.shieldsUsedInRound++;
            }
            resolve({ success: true, rewardEarned: true, isOffline: false });
          }, 600);
        }
      }, 1000);

      closeBtn.addEventListener('click', () => {
        clearInterval(interval);
        modal.remove();
        resolve({ success: false, rewardEarned: false, isOffline: false });
      });
    });
  }

  /**
   * Renders unobtrusive banner placeholder in web mode
   */
  renderWebBannerPlaceholder(show) {
    const existing = document.getElementById('web-admob-banner');
    if (!show) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'web-admob-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: #0f172a;
      border-top: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      z-index: 1000;
    `;
    banner.innerHTML = `<span>📢 AdMob Adaptive Banner • English Breakfast</span>`;
    document.body.appendChild(banner);
  }
}

export const AdService = new AdServiceImpl();
if (typeof window !== 'undefined') {
  window.AdService = AdService;
}
export default AdService;
