/**
 * Web Play Store Funnel Modal (100 Words Teaser Gate)
 *
 * CRITICAL RULE #1: Exactly 36 locales supported.
 * Only triggers on Web platforms (!AdService.isNative()).
 * Native Android APK/AAB is NEVER restricted by this gate.
 */

import { AdService } from '../../services/adService.js?v=386.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { getGuestTrainingCount } from '../../services/authService.js?v=386.0';

export const WEB_GATE_WORD_LIMIT = 100;
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.englishbreakfast.app&referrer=utm_source%3Dweb_100_words_gate';

export const WEB_FUNNEL_I18N = {
  ru: {
    badge: '100 СЛОВ ВЫУЧЕНО',
    title: 'Поздравляем! Вводный курс завершён',
    desc: 'Вы успешно выучили свои первые 100 слов на сайте. Чтобы продолжить обучение, открыть все 7 000+ слов, умный виджет на экран смартфона и озвучку без интернета — установите бесплатное приложение English Breakfast!',
    btn: 'Продолжить в Google Play',
    sub: 'Бесплатно • 7 000 слов • Рейтинг 5.0 ★',
  },
  uk: {
    badge: '100 СЛІВ ВИВЧЕНО',
    title: 'Вітаємо! Вступний курс завершено',
    desc: 'Ви успішно вивчили свої перші 100 слів на сайті. Щоб продовжити навчання, відкрити всі 7 000+ слів, розумний віджет на екран смартфона та озвучення без інтернету — встановіть безкоштовний додаток English Breakfast!',
    btn: 'Продовжити в Google Play',
    sub: 'Безкоштовно • 7 000 слів • Рейтинг 5.0 ★',
  },
  en: {
    badge: '100 WORDS LEARNED',
    title: 'Congratulations! Intro Course Completed',
    desc: 'You have successfully learned your first 100 words on the web. To continue learning, unlock all 7,000+ words, the smart home screen widget, and offline audio — get the free English Breakfast app!',
    btn: 'Continue in Google Play',
    sub: 'Free • 7,000 words • 5.0 ★ rating',
  },
  de: {
    badge: '100 WÖRTER GELERNT',
    title: 'Glückwunsch! Einführungskurs abgeschlossen',
    desc: 'Du hast deine ersten 100 Wörter im Web erfolgreich gelernt. Um weiterzulernen, alle 7.000+ Wörter, das intelligente Startbildschirm-Widget und Offline-Audio freizuschalten — lade die kostenlose English Breakfast App herunter!',
    btn: 'Weiter bei Google Play',
    sub: 'Kostenlos • 7.000 Wörter • Bewertung 5.0 ★',
  },
  es: {
    badge: '100 PALABRAS APRENDIDAS',
    title: '¡Felicidades! Curso introductorio completado',
    desc: 'Has aprendido con éxito tus primeras 100 palabras en la web. Para continuar aprendiendo, desbloquear las más de 7,000 palabras, el widget para tu pantalla y audio sin internet — ¡descarga la app gratuita English Breakfast!',
    btn: 'Continuar en Google Play',
    sub: 'Gratis • 7,000 palabras • Calificación 5.0 ★',
  },
  fr: {
    badge: '100 MOTS APPRIS',
    title: "Félicitations ! Cours d'initiation terminé",
    desc: "Vous avez appris avec succès vos 100 premiers mots sur le web. Pour continuer l'apprentissage, débloquer plus de 7 000 mots, le widget d'écran d'accueil et l'audio hors ligne — téléchargez l'application gratuite English Breakfast !",
    btn: 'Continuer sur Google Play',
    sub: 'Gratuit • 7 000 mots • Note 5.0 ★',
  },
  pl: {
    badge: '100 SŁÓW OPANOWANYCH',
    title: 'Gratulacje! Kurs wprowadzający ukończony',
    desc: 'Opanowałeś swoje pierwsze 100 słów w przeglądarce. Aby kontynuować naukę, odblokować ponad 7 000 słów, inteligentny widżet na ekran i dźwięk offline — pobierz darmową aplikację English Breakfast!',
    btn: 'Kontynuuj w Google Play',
    sub: 'Bezpłatnie • 7 000 słów • Ocena 5.0 ★',
  },
  tr: {
    badge: '100 KELİME ÖĞRENİLDİ',
    title: 'Tebrikler! Giriş Kursu Tamamlandı',
    desc: "Web sitemizde ilk 100 kelimenizi başarıyla öğrendiniz. Öğrenmeye devam etmek, 7.000'den fazla kelimenin tamamını, akıllı ana ekran widget'ını ve internetsiz sesleri açmak için — ücretsiz English Breakfast uygulamasını indirin!",
    btn: "Google Play'de Devam Et",
    sub: 'Ücretsiz • 7.000 kelime • 5.0 ★ puan',
  },
  it: {
    badge: '100 PAROLE IMPARATE',
    title: 'Congratulazioni! Corso introduttivo completato',
    desc: "Hai imparato con successo le tue prime 100 parole sul web. Per continuare a imparare, sbloccare oltre 7.000 parole, il widget per la schermata iniziale e l'audio offline — scarica l'app gratuita English Breakfast!",
    btn: 'Continua su Google Play',
    sub: 'Gratis • 7.000 parole • Valutazione 5.0 ★',
  },
  ro: {
    badge: '100 DE CUVINTE ÎNVĂȚATE',
    title: 'Felicitări! Cursul introductiv s-a încheiat',
    desc: 'Ai învățat cu succes primele 100 de cuvinte pe web. Pentru a continua învățarea, a debloca peste 7.000 de cuvinte, widgetul inteligent și sunetul offline — descarcă aplicația gratuită English Breakfast!',
    btn: 'Continuă în Google Play',
    sub: 'Gratuit • 7.000 de cuvinte • Evaluare 5.0 ★',
  },
  bg: {
    badge: '100 НАУЧЕНИ ДУМИ',
    title: 'Поздравления! Въвеждащият курс е завършен',
    desc: 'Успешно научихте първите си 100 думи в уеб версията. За да продължите обучението, да отключите всички 7 000+ думи, смарт уиджета и офлайн аудио — изтеглете безплатното приложение English Breakfast!',
    btn: 'Продължи в Google Play',
    sub: 'Безплатно • 7 000 думи • Оценка 5.0 ★',
  },
  hu: {
    badge: '100 MEGTANULT SZÓ',
    title: 'Gratulálunk! A bevezető kurzus véget ért',
    desc: 'Sikeresen megtanultad az első 100 szavadat a weben. A tanulás folytatásához, a több mint 7 000 szó, az okos widget és az offline hang feloldásához — töltsd le az ingyenes English Breakfast alkalmazást!',
    btn: 'Folytatás a Google Playen',
    sub: 'Ingyenes • 7 000 szó • 5.0 ★ értékelés',
  },
  el: {
    badge: '100 ΛΕΞΕΙΣ ΟΛΟΚΛΗΡΩΘΗΚΑΝ',
    title: 'Συγχαρητήρια! Το εισαγωγικό μάθημα ολοκληρώθηκε',
    desc: 'Μάθατε με επιτυχία τις πρώτες σας 100 λέξεις στο web. Για να συνεχίσετε τη μάθηση, να ξεκλειδώσετε 7.000+ λέξεις, το έξυπνο widget και ήχο χωρίς διαδίκτυο — κατεβάστε τη δωρεάν εφαρμογή English Breakfast!',
    btn: 'Συνέχεια στο Google Play',
    sub: 'Δωρεάν • 7.000 λέξεις • Βαθμολογία 5.0 ★',
  },
  da: {
    badge: '100 ORD LÆRT',
    title: 'Tillykke! Introduktionskurset er fuldført',
    desc: 'Du har lært dine første 100 ord på nettet. For at fortsætte med at lære, låse op for 7.000+ ord, den smarte widget og offline-lyd — hent den gratis English Breakfast-app!',
    btn: 'Fortsæt i Google Play',
    sub: 'Gratis • 7.000 ord • 5.0 ★ vurdering',
  },
  lv: {
    badge: '100 VĀRDI APGŪTI',
    title: 'Apsveicam! Ievadkurss ir pabeigts',
    desc: 'Jūs esat veiksmīgi apguvis pirmos 100 vārdus tīmeklī. Lai turpinātu mācīties, atbloķētu 7 000+ vārdus, viedo logrīku un bezsaistes audio — lejupielādējiet bezmaksas lietotni English Breakfast!',
    btn: 'Turpināt pakalpojumā Google Play',
    sub: 'Bezmaksas • 7 000 vārdi • Vērtējums 5.0 ★',
  },
  lt: {
    badge: '100 ŽODŽIŲ IŠMOKTA',
    title: 'Sveikiname! Įvadinis kursas baigtas',
    desc: 'Sėkmingai išmokote pirmuosius 100 žodžių internete. Norėdami tęsti mokymąsi, atrakinti daugiau nei 7 000 žodžių, išmanųjį valdiklį ir garsą neprisijungus — atsisiųskite nemokamą English Breakfast programėlę!',
    btn: 'Tęsti „Google Play“',
    sub: 'Nemokamai • 7 000 žodžių • Įvertinimas 5.0 ★',
  },
  pt: {
    badge: '100 PALAVRAS APRENDIDAS',
    title: 'Parabéns! Curso introdutório concluído',
    desc: 'Você aprendeu com sucesso suas primeiras 100 palavras na web. Para continuar aprendendo, desbloquear mais de 7.000 palavras, o widget inteligente e áudio offline — baixe o aplicativo gratuito English Breakfast!',
    btn: 'Continuar no Google Play',
    sub: 'Grátis • 7.000 palavras • Avaliação 5.0 ★',
  },
  sk: {
    badge: '100 NAUČENÝCH SLOV',
    title: 'Gratulujeme! Úvodný kurz bol dokončený',
    desc: 'Úspešne ste sa naučili prvých 100 slov na webe. Ak chcete pokračovať v učení, odomknúť viac ako 7 000 slov, inteligentný widget a zvuk offline — stiahnite si bezplatnú aplikáciu English Breakfast!',
    btn: 'Pokračovať v Google Play',
    sub: 'Zadarmo • 7 000 slov • Hodnotenie 5.0 ★',
  },
  sl: {
    badge: '100 NAUČENIH BESED',
    title: 'Čestitamo! Uvodni tečaj je zaključen',
    desc: 'Uspešno ste se naučili prvih 100 besed na spletu. Za nadaljevanje učenja, odklep več kot 7.000 besed, pametnega pripomočka in zvoka brez povezave — prenesite brezplačno aplikacijo English Breakfast!',
    btn: 'Nadaljuj v Google Play',
    sub: 'Brezplačno • 7.000 besed • Ocena 5.0 ★',
  },
  fi: {
    badge: '100 SANAA OPITTU',
    title: 'Onnittelut! Johdantokurssi suoritettu',
    desc: 'Olet oppinut ensimmäiset 100 sanaasi verkossa. Jatkaaksesi oppimista, avataksesi kaikki yli 7 000 sanaa, älykkään widgetin ja offline-äänen — lataa ilmainen English Breakfast -sovellus!',
    btn: 'Jatka Google Playssa',
    sub: 'Ilmainen • 7 000 sanaa • Arvosana 5.0 ★',
  },
  hr: {
    badge: '100 NAUČENIH RIJEČI',
    title: 'Čestitamo! Uvodni tečaj je završen',
    desc: 'Uspješno ste naučili prvih 100 riječi na webu. Za nastavak učenja, otključavanje više od 7.000 riječi, pametnog widgeta i izvanmrežnog zvuka — preuzmite besplatnu aplikaciju English Breakfast!',
    btn: 'Nastavi na Google Playu',
    sub: 'Besplatno • 7.000 riječi • Ocena 5.0 ★',
  },
  cs: {
    badge: '100 NAUČENÝCH SLOV',
    title: 'Gratulujeme! Úvodní kurz byl dokončen',
    desc: 'Úspěšně jste se naučili prvních 100 slov na webu. Chcete-li pokračovat ve výuce, odemknout všech 7 000+ slov, chytrý widget a offline výslovnost — stáhněte si bezplatnou aplikaci English Breakfast!',
    btn: 'Pokračovat na Google Play',
    sub: 'Zdarma • 7 000 slov • Hodnocení 5.0 ★',
  },
  sv: {
    badge: '100 ORD INLÄRDA',
    title: 'Grattis! Introduktionskursen är klar',
    desc: 'Du har framgångsrikt lärt dig dina första 100 ord på webben. För att fortsätta lära dig, låsa upp alla 7 000+ ord, smarta widgeten och offlineljud — ladda ner gratisappen English Breakfast!',
    btn: 'Fortsätt på Google Play',
    sub: 'Gratis • 7 000 ord • Betyg 5.0 ★',
  },
  et: {
    badge: '100 SÕNA ÕPITUD',
    title: 'Palju õnne! Sissejuhatav kursus on läbitud',
    desc: 'Olete veebis edukalt selgeks saanud esimesed 100 sõna. Õppimise jätkamiseks, 7 000+ sõna, nutika vidina ja võrguühenduseta heli avamiseks — laadige alla tasuta rakendus English Breakfast!',
    btn: 'Jätka teenuses Google Play',
    sub: 'Tasuta • 7 000 sõna • Hinnang 5.0 ★',
  },
  hi: {
    badge: '100 शब्द सीखे गए',
    title: 'बधाई हो! परिचयात्मक पाठ्यक्रम पूरा हुआ',
    desc: 'आपने वेब पर अपने पहले 100 शब्द सफलतापूर्वक सीख लिए हैं। आगे सीखने, 7,000+ शब्दों को अनलॉक करने, स्मार्ट विजेट और ऑफलाइन ऑडियो पाने के लिए — मुफ्त English Breakfast ऐप इंस्टॉल करें!',
    btn: 'Google Play पर जारी रखें',
    sub: 'मुफ्त • 7,000 शब्द • 5.0 ★ रेटिंग',
  },
  bn: {
    badge: '১০০টি শব্দ শেখা হয়েছে',
    title: 'অভিনন্দন! প্রাথমিক কোর্স সম্পন্ন হয়েছে',
    desc: 'আপনি ওয়েবে সফলভাবে আপনার প্রথম ১০০টি শব্দ শিখেছেন। শেখা চালিয়ে যেতে, ৭,০০০+ শব্দ আনলক করতে, স্মার্ট উইজেট এবং অফলাইন অডিও পেতে — বিনামূল্যে English Breakfast অ্যাপটি ইনস্টল করুন!',
    btn: 'Google Play-তে চালিয়ে যান',
    sub: 'বিনামূল্যে • ৭,০০০ শব্দ • ৫.০ ★ রেটিং',
  },
  ar: {
    badge: 'تم تعلم 100 كلمة',
    title: 'تهانينا! اكتملت الدورة التمهيدية',
    desc: 'لقد تعلمت بنجاح أول 100 كلمة على الموقع. لمواصلة التعلم وفتح أكثر من 7000 كلمة والقطعة الذكية للشاشة والصوت بدون إنترنت — قم بتنزيل تطبيق English Breakfast المجاني!',
    btn: 'المتابعة في Google Play',
    sub: 'مجاني • 7,000 كلمة • تقييم 5.0 ★',
  },
  fa: {
    badge: '۱۰۰ کلمه یاد گرفته شد',
    title: 'تبریک! دوره مقدماتی به پایان رسید',
    desc: 'شما با موفقیت ۱۰۰ کلمه اول خود را در وب یاد گرفتید. برای ادامه یادگیری، باز کردن بیش از ۷۰۰۰ کلمه، ویجت هوشمند و تلفظ آفلاین — برنامه رایگان English Breakfast را دریافت کنید!',
    btn: 'ادامه در Google Play',
    sub: 'رایگان • ۷۰۰۰ کلمه • امتیاز ۵.۰ ★',
  },
  ur: {
    badge: '100 الفاظ سیکھ لیے',
    title: 'مبارک ہو! تعارفی کورس مکمل ہو گیا',
    desc: 'آپ نے ویب پر اپنے پہلے 100 الفاظ کامیابی سے سیکھ لیے ہیں۔ مزید سیکھنے، 7,000 سے زیادہ الفاظ، اسمارٹ ویجیٹ اور آف لائن آڈیو کے لیے — مفت English Breakfast ایپ انسٹال کریں!',
    btn: 'Google Play پر جاری رکھیں',
    sub: 'مفت • 7,000 الفاظ • 5.0 ★ ریٹنگ',
  },
  id: {
    badge: '100 KATA DIPELAJARI',
    title: 'Selamat! Kursus Pengantar Selesai',
    desc: 'Anda telah berhasil mempelajari 100 kata pertama di web. Untuk melanjutkan belajar, membuka 7.000+ kata, widget layar utama cerdas, dan audio offline — unduh aplikasi gratis English Breakfast!',
    btn: 'Lanjutkan di Google Play',
    sub: 'Gratis • 7.000 kata • Rating 5.0 ★',
  },
  vi: {
    badge: 'ĐÃ HỌC 100 TỪ',
    title: 'Chúc mừng! Đã hoàn thành khóa học nhập môn',
    desc: 'Bạn đã học thành công 100 từ đầu tiên trên web. Để tiếp tục học, mở khóa toàn bộ hơn 7.000 từ, tiện ích widget thông minh và âm thanh ngoại tuyến — hãy tải ứng dụng miễn phí English Breakfast!',
    btn: 'Tiếp tục trên Google Play',
    sub: 'Miễn phí • 7.000 từ • Đánh giá 5.0 ★',
  },
  th: {
    badge: 'เรียนรู้แล้ว 100 คำ',
    title: 'ยินดีด้วย! คุณจบคอร์สเบื้องต้นแล้ว',
    desc: 'คุณเรียนรู้ 100 คำแรกบนเว็บเรียบร้อยแล้ว หากต้องการเรียนต่อ ปลดล็อกคำศัพท์กว่า 7,000 คำ วิดเจ็ตอัจฉริยะ และเสียงออฟไลน์ — ดาวน์โหลดแอป English Breakfast ฟรี!',
    btn: 'ดำเนินการต่อใน Google Play',
    sub: 'ฟรี • 7,000 คำ • คะแนน 5.0 ★',
  },
  ko: {
    badge: '100단어 학습 완료',
    title: '축하합니다! 입문 코스를 완료했습니다',
    desc: '웹에서 첫 100단어를 성공적으로 학습하셨습니다. 계속해서 7,000개 이상의 모든 단어, 스마트 홈 화면 위젯, 오프라인 음성을 이용하시려면 — 무료 English Breakfast 앱을 다운로드하세요!',
    btn: 'Google Play에서 계속하기',
    sub: '무료 • 7,000단어 • 평점 5.0 ★',
  },
  ja: {
    badge: '100単語学習完了',
    title: 'おめでとうございます！入門コースを完了しました',
    desc: 'ウェブで最初の100単語を無事に学習しました。学習を続けて7,000語以上の全単語、スマートウィジェット、オフライン音声を利用するには — 無料のEnglish Breakfastアプリをダウンロードしてください！',
    btn: 'Google Playで続ける',
    sub: '無料 • 7,000単語 • 評価 5.0 ★',
  },
  zh: {
    badge: '已掌握100个单词',
    title: '恭喜！入门课程已完成',
    desc: '您已在网页版成功学习了前100个单词。想要继续学习并解锁全部7000+单词、智能桌面小部件以及离线发音 — 请下载免费的English Breakfast官方应用！',
    btn: '在 Google Play 中继续',
    sub: '免费 • 7,000单词 • 5.0 ★ 高分好评',
  },
  kk: {
    badge: '100 СӨЗ МЕҢГЕРІЛДІ',
    title: 'Құттықтаймыз! Кіріспе курс аяқталды',
    desc: 'Сіз сайтта алғашқы 100 сөзді сәтті меңгердіңіз. Оқуды жалғастыру, барлық 7 000+ сөзді, смартфон экранындағы ақылды виджетті және интернетсіз дыбыстауды ашу үшін — English Breakfast тегін қосымшасын орнатыңыз!',
    btn: 'Google Play арқылы жалғастыру',
    sub: 'Тегін • 7 000 сөз • 5.0 ★ рейтингі',
  },
};

/**
 * Normalizes locale code into one of the 36 supported keys
 */
export function getFunnelStrings(langCode = 'en') {
  const code = String(langCode || 'en').toLowerCase().split(/[-_]/)[0];
  return WEB_FUNNEL_I18N[code] || WEB_FUNNEL_I18N.en;
}

/**
 * Returns true if running in a web browser, false inside Android native app
 */
export function isWebPlatform() {
  if (typeof window === 'undefined') return false;
  if (AdService && typeof AdService.isNative === 'function' && AdService.isNative()) {
    return false;
  }
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
    return false;
  }
  return true;
}

export function getWebTrainedCount() {
  try {
    if (typeof localStorage === 'undefined') return 0;
    return Number(localStorage.getItem('eb_web_trained_words_count') || 0);
  } catch (_) {
    return 0;
  }
}

export function incrementWebTrainedCount() {
  try {
    if (typeof localStorage === 'undefined') return 0;
    const next = getWebTrainedCount() + 1;
    localStorage.setItem('eb_web_trained_words_count', String(next));
    return next;
  } catch (_) {
    return 0;
  }
}

export function isWeb100WordsLimitReached() {
  if (!isWebPlatform()) return false;
  const webCount = getWebTrainedCount();
  const guestCount = typeof getGuestTrainingCount === 'function' ? getGuestTrainingCount() : 0;
  return webCount >= WEB_GATE_WORD_LIMIT || guestCount >= WEB_GATE_WORD_LIMIT;
}

/**
 * Injects Google Play SVG icon
 */
function getPlayStoreSvg() {
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
      <path d="M3.6 1.48C3.33 1.77 3.17 2.22 3.17 2.8v18.4c0 .58.16 1.03.43 1.32l.07.07L14.04 12.2v-.4L3.67 1.41l-.07.07z" fill="#00E676"/>
      <path d="M17.5 15.66l-3.46-3.46v-.4l3.46-3.46.08.05 4.1 2.33c1.17.66 1.17 1.75 0 2.41l-4.1 2.33-.08.2z" fill="#FFD600"/>
      <path d="M14.04 12.2L3.6 22.52c.38.41 1.03.46 1.77.04l12.21-6.9-3.54-3.46z" fill="#FF3D00"/>
      <path d="M14.04 11.8L17.58 8.34 5.37 1.44c-.74-.42-1.39-.37-1.77.04l10.44 10.32z" fill="#00B0FF"/>
    </svg>
  `;
}

/**
 * Shows unclosable celebratory Google Play conversion modal
 */
export function showWebPlayStoreFunnelModal() {
  if (typeof document === 'undefined') return;
  if (!isWebPlatform()) return;

  const existing = document.getElementById('eb-web-funnel-modal');
  if (existing) return;

  const lang = typeof getInterfaceLanguage === 'function' ? getInterfaceLanguage() : 'en';
  const str = getFunnelStrings(lang);
  const isRtl = lang === 'ar' || lang === 'fa' || lang === 'ur';

  const modal = document.createElement('div');
  modal.id = 'eb-web-funnel-modal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999999;
    background: rgba(15, 23, 42, 0.94);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: ebFadeIn 0.3s ease-out;
  `;

  modal.innerHTML = `
    <style>
      @keyframes ebFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes ebScaleUp { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      @keyframes ebShake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
      @keyframes ebPulseBtn { 0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); } 50% { box-shadow: 0 0 24px 6px rgba(34, 197, 94, 0.7); } }
      .eb-shake-anim { animation: ebShake 0.45s ease-in-out !important; }
      .eb-play-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
    </style>
    <div id="eb-funnel-card" style="
      background: #1e293b;
      border: 2px solid rgba(245, 158, 11, 0.4);
      border-radius: 24px;
      padding: 36px 26px 30px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      color: #ffffff;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.15);
      animation: ebScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      direction: ${isRtl ? 'rtl' : 'ltr'};
    ">
      <div style="font-size: 56px; line-height: 1; margin-bottom: 14px; filter: drop-shadow(0 6px 14px rgba(245, 158, 11, 0.35));">
        🏆
      </div>
      <div style="
        display: inline-block;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 900;
        letter-spacing: 1px;
        padding: 5px 14px;
        border-radius: 999px;
        margin-bottom: 16px;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
      ">
        ${str.badge}
      </div>
      <h2 style="
        margin: 0 0 12px 0;
        font-size: 22px;
        font-weight: 800;
        line-height: 1.3;
        color: #f8fafc;
      ">
        ${str.title}
      </h2>
      <p style="
        margin: 0 0 26px 0;
        font-size: 14.5px;
        line-height: 1.55;
        color: #cbd5e1;
      ">
        ${str.desc}
      </p>

      <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="eb-play-btn" id="eb-funnel-play-btn" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        text-decoration: none;
        padding: 16px 24px;
        border-radius: 16px;
        font-size: 17px;
        font-weight: 800;
        box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
        transition: all 0.2s ease;
        animation: ebPulseBtn 2.2s infinite;
        border: 1px solid rgba(255, 255, 255, 0.2);
      ">
        ${getPlayStoreSvg()}
        <span>${str.btn}</span>
      </a>

      <div style="
        margin-top: 18px;
        font-size: 12.5px;
        font-weight: 600;
        color: #94a3b8;
      ">
        ${str.sub}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Prevent closing on backdrop click: trigger shake animation
  const card = modal.querySelector('#eb-funnel-card');
  modal.addEventListener('click', (e) => {
    if (e.target === modal && card) {
      card.classList.remove('eb-shake-anim');
      void card.offsetWidth; // Force reflow
      card.classList.add('eb-shake-anim');
    }
  });

  // Track event in Google Analytics
  if (typeof window !== 'undefined' && window.trackEvent) {
    window.trackEvent('web_100_words_gate_shown', { lang });
  }
}

/**
 * Inline card version replacing training area when limit is reached
 */
export function renderWebLimitCard(containerEl) {
  if (!containerEl) return;
  const lang = typeof getInterfaceLanguage === 'function' ? getInterfaceLanguage() : 'en';
  const str = getFunnelStrings(lang);
  const isRtl = lang === 'ar' || lang === 'fa' || lang === 'ur';

  containerEl.innerHTML = `
    <div style="
      background: var(--card-bg, #ffffff);
      border: 2px solid var(--border-color, #e2e8f0);
      border-radius: 24px;
      padding: 36px 24px;
      max-width: 480px;
      margin: 20px auto;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      direction: ${isRtl ? 'rtl' : 'ltr'};
    ">
      <div style="font-size: 52px; margin-bottom: 12px;">🏆</div>
      <div style="
        display: inline-block;
        background: #f59e0b;
        color: #fff;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 14px;
      ">
        ${str.badge}
      </div>
      <h2 style="margin: 0 0 12px; font-size: 21px; font-weight: 800; color: var(--text-main, #0f172a);">
        ${str.title}
      </h2>
      <p style="margin: 0 0 24px; font-size: 14.5px; line-height: 1.5; color: var(--text-muted, #64748b);">
        ${str.desc}
      </p>
      <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: #22c55e;
        color: #ffffff;
        text-decoration: none;
        padding: 15px 22px;
        border-radius: 14px;
        font-size: 16px;
        font-weight: 800;
        box-shadow: 0 6px 18px rgba(34,197,94,0.35);
      ">
        ${getPlayStoreSvg()}
        <span>${str.btn}</span>
      </a>
      <div style="margin-top: 14px; font-size: 12px; color: var(--text-muted, #94a3b8); font-weight: 600;">
        ${str.sub}
      </div>
    </div>
  `;
}
