import { getInterfaceLanguage } from '../../services/i18n.js?v=386.0';
import { openGooglePlayStore } from './ReviewFunnelModal.js?v=386.0';
import { submitSurveyFeedbackApi } from '../../services/api.js?v=386.0';

export const FAIRY_TALE_SURVEY_TRANSLATIONS = {
  "en": {
    "congratsTitle": "Congratulations! Claim your bonus Japanese fairy tale 🎁",
    "congratsBadge": "🎁 3rd Lesson Reward",
    "badge": "🎁 Secret Fairy Tale",
    "title": "Unlock a Magic Japanese Fairy Tale!",
    "subtitle": "Answer a couple of quick questions to instantly unlock the legendary story \"My Lord Bag of Rice\" (Tawara Toda).",
    "q1": "1. How are you enjoying English Breakfast?",
    "starLabels": [
      "Poor",
      "Fair",
      "Good",
      "Great!",
      "Well done!"
    ],
    "q2": "Which features did you like?",
    "optQuiz": "Quiz",
    "optFavorites": "Favorites",
    "optWidget": "Home Screen Widget",
    "optScanner": "Text Scanner",
    "submitBtn": "Claim Gift!",
    "posTitle": "Fairy Tale Unlocked! 🎉",
    "posSub": "We are thrilled that you love English Breakfast! Would you take 5 seconds to give us 5 stars on Google Play? It means the world to our indie team!",
    "btnRate": "⭐ Rate 5 Stars on Google Play",
    "negTitle": "Thank You for Your Honesty! 💖",
    "negSub": "Thank you for your honest feedback! We want to make English Breakfast even better for you.",
    "negAsk": "What can we improve in the app?",
    "negPlaceholder": "Tell us what went wrong or what feature you need...",
    "negBtnSend": "✉️ Send Feedback",
    "negSentToast": "Thank you! We will carefully review your feedback ❤️",
    "btnClose": "Done"
  },
  "ru": {
    "congratsTitle": "Поздравляем! Заберите бонусную японскую сказку 🎁",
    "congratsBadge": "🎁 Награда за 3-й урок",
    "badge": "🎁 Секретная сказка",
    "title": "Открой Волшебную японскую сказку!",
    "subtitle": "Ответьте на пару вопросов, чтобы мгновенно получить доступ к древней легенде «My Lord Bag of Rice» (Тавара Тода).",
    "q1": "1. Как вам English Breakfast?",
    "starLabels": [
      "Плохо",
      "Так себе",
      "Нормально",
      "Хорошо!",
      "Молодцы!"
    ],
    "q2": "Какая функция вам понравилась?",
    "optQuiz": "Квиз",
    "optFavorites": "Избранное",
    "optWidget": "Виджет на экран",
    "optScanner": "Сканер текста",
    "submitBtn": "Забрать подарок!",
    "posTitle": "Сказка разблокирована! 🎉",
    "posSub": "Мы безумно рады, что вам нравится English Breakfast! Пожалуйста, подарите нам 5 секунд — поставьте 5 звёзд в Google Play. Это лучшая поддержка проекта!",
    "btnRate": "⭐ Поставить 5 звёзд в Google Play",
    "negTitle": "Спасибо за честность! 💖",
    "negSub": "Спасибо за честный ответ! Мы хотим сделать English Breakfast лучше для вас.",
    "negAsk": "Что нам улучшить в приложении?",
    "negPlaceholder": "Напишите, что пошло не так или чего вам не хватает...",
    "negBtnSend": "✉️ Отправить отзыв",
    "negSentToast": "Спасибо! Мы обязательно учтём ваш отзыв ❤️",
    "btnClose": "Готово"
  },
  "uk": {
    "congratsTitle": "Вітаємо! Заберіть бонусну японську казку 🎁",
    "congratsBadge": "🎁 Нагорода за 3-й урок",
    "badge": "🎁 Секретна казка",
    "title": "Відкрий Чарівну японську казку!",
    "subtitle": "Дайте відповідь на пару запитань, щоб миттєво відкрити легендарну розповідь «My Lord Bag of Rice» (Тавара Тода).",
    "q1": "1. Як вам English Breakfast?",
    "starLabels": [
      "Погано",
      "Так собі",
      "Нормально",
      "Добре!",
      "Молодці!"
    ],
    "q2": "Яка функція вам сподобалася?",
    "optQuiz": "Квіз",
    "optFavorites": "Обране",
    "optWidget": "Віджет на екран",
    "optScanner": "Сканер тексту",
    "submitBtn": "Забрати подарунок!",
    "posTitle": "Казку розблоковано! 🎉",
    "posSub": "Ми безмежно раді, що вам подобається English Breakfast! Подаруйте нам 5 секунд — поставте 5 зірок у Google Play!",
    "btnRate": "⭐ Поставити 5 зірок у Google Play",
    "negTitle": "Дякуємо за чесність! 💖",
    "negSub": "Дякуємо за чесну відповідь! Ми хочемо зробити English Breakfast кращим для вас.",
    "negAsk": "Що нам покращити в додатку?",
    "negPlaceholder": "Напишіть, що пішло не так або чого вам бракує...",
    "negBtnSend": "✉️ Надіслати відгук",
    "negSentToast": "Дякуємо! Ми обов’язково врахуємо ваш відгук ❤️",
    "btnClose": "Готово"
  },
  "de": {
    "congratsTitle": "Herzlichen Glückwunsch! Hol dir dein Bonus-Märchen 🎁",
    "congratsBadge": "🎁 Belohnung für Lektion 3",
    "badge": "🎁 Geheimes Märchen",
    "title": "Schalte ein magisches japanisches Märchen frei!",
    "subtitle": "Beantworte ein paar kurze Fragen, um die legendäre Geschichte „My Lord Bag of Rice“ sofort freizuschalten.",
    "q1": "1. Wie gefällt dir English Breakfast?",
    "starLabels": [
      "Schlecht",
      "Geht so",
      "Gut",
      "Super!",
      "Klasse gemacht!"
    ],
    "q2": "Welche Funktion hat dir gefallen?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoriten",
    "optWidget": "Startbildschirm-Widget",
    "optScanner": "Text-Scanner",
    "submitBtn": "Geschenk abholen!",
    "posTitle": "Märchen freigeschaltet! 🎉",
    "posSub": "Wir freuen uns riesig, dass dir English Breakfast gefällt! Schenkst du uns 5 Sekunden für 5 Sterne bei Google Play?",
    "btnRate": "⭐ 5 Sterne bei Google Play bewerten",
    "negTitle": "Danke für deine Ehrlichkeit! 💖",
    "negSub": "Vielen Dank für dein ehrliches Feedback! Wir möchten English Breakfast weiter verbessern.",
    "negAsk": "Was können wir an der App verbessern?",
    "negPlaceholder": "Sag uns, was nicht geklappt hat oder was du vermisst...",
    "negBtnSend": "✉️ Feedback senden",
    "negSentToast": "Vielen Dank! Wir prüfen dein Feedback sorgfältig ❤️",
    "btnClose": "Fertig"
  },
  "es": {
    "congratsTitle": "¡Felicidades! Consigue tu cuento japonés de regalo 🎁",
    "congratsBadge": "🎁 Recompensa de la lección 3",
    "badge": "🎁 Cuento secreto",
    "title": "¡Desbloquea un mágico cuento japonés!",
    "subtitle": "Responde un par de preguntas para desbloquear al instante la legendaria historia \"My Lord Bag of Rice\".",
    "q1": "1. ¿Qué te parece English Breakfast?",
    "starLabels": [
      "Malo",
      "Regular",
      "Bueno",
      "¡Genial!",
      "¡Bien hecho!"
    ],
    "q2": "¿Qué función te gustó?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoritos",
    "optWidget": "Widget de pantalla de inicio",
    "optScanner": "Escáner de texto",
    "submitBtn": "¡Reclamar regalo!",
    "posTitle": "¡Cuento desbloqueado! 🎉",
    "posSub": "¡Nos alegra muchísimo que te encante English Breakfast! ¿Nos regalarías 5 segundos con 5 estrellas en Google Play?",
    "btnRate": "⭐ Valorar con 5 estrellas en Google Play",
    "negTitle": "¡Gracias por tu sinceridad! 💖",
    "negSub": "¡Gracias por tu honestidad! Queremos que English Breakfast sea cada vez mejor para ti.",
    "negAsk": "¿Qué podemos mejorar en la aplicación?",
    "negPlaceholder": "Cuéntanos qué falló o qué función te gustaría tener...",
    "negBtnSend": "✉️ Enviar opinión",
    "negSentToast": "¡Muchas gracias! Tendremos en cuenta tus comentarios ❤️",
    "btnClose": "Listo"
  },
  "es-mx": {
    "congratsTitle": "¡Felicidades! Consigue tu cuento japonés de regalo 🎁",
    "congratsBadge": "🎁 Recompensa de la lección 3",
    "badge": "🎁 Cuento secreto",
    "title": "¡Desbloquea un mágico cuento japonés!",
    "subtitle": "Responde un par de preguntas para desbloquear al instante la legendaria historia \"My Lord Bag of Rice\".",
    "q1": "1. ¿Qué te parece English Breakfast?",
    "starLabels": [
      "Malo",
      "Regular",
      "Bueno",
      "¡Genial!",
      "¡Bien hecho!"
    ],
    "q2": "¿Qué función te gustó?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoritos",
    "optWidget": "Widget de pantalla de inicio",
    "optScanner": "Escáner de texto",
    "submitBtn": "¡Reclamar regalo!",
    "posTitle": "¡Cuento desbloqueado! 🎉",
    "posSub": "¡Nos alegra muchísimo que disfrutes English Breakfast! ¿Nos regalas 5 segundos para calificarnos con 5 estrellas en Google Play?",
    "btnRate": "⭐ Calificar con 5 estrellas en Google Play",
    "negTitle": "¡Gracias por tu sinceridad! 💖",
    "negSub": "¡Gracias por tu honestidad! Queremos mejorar English Breakfast para ti.",
    "negAsk": "¿Qué podemos mejorar en la app?",
    "negPlaceholder": "Cuéntanos qué falló o qué te gustaría ver...",
    "negBtnSend": "✉️ Enviar comentarios",
    "negSentToast": "¡Muchas gracias! Tomaremos muy en cuenta tus sugerencias ❤️",
    "btnClose": "Listo"
  },
  "fr": {
    "congratsTitle": "Félicitations ! Obtenez votre conte japonais en bonus 🎁",
    "congratsBadge": "🎁 Récompense de la 3e leçon",
    "badge": "🎁 Conte secret",
    "title": "Débloquez un conte japonais magique !",
    "subtitle": "Répondez à quelques questions rapides pour débloquer immédiatement l'histoire légendaire « My Lord Bag of Rice ».",
    "q1": "1. Que pensez-vous d'English Breakfast ?",
    "starLabels": [
      "Médiocre",
      "Moyen",
      "Bien",
      "Super !",
      "Bravo !"
    ],
    "q2": "Quelle fonctionnalité avez-vous aimée ?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoris",
    "optWidget": "Widget pour écran d'accueil",
    "optScanner": "Scanner de texte",
    "submitBtn": "Récupérer le cadeau !",
    "posTitle": "Conte débloqué ! 🎉",
    "posSub": "Nous sommes ravis qu'English Breakfast vous plaise ! Pourriez-vous prendre 5 secondes pour nous attribuer 5 étoiles sur Google Play ?",
    "btnRate": "⭐ Noter 5 étoiles sur Google Play",
    "negTitle": "Merci pour votre franchise ! 💖",
    "negSub": "Merci pour votre franchise ! Nous tenons à perfectionner English Breakfast pour vous.",
    "negAsk": "Que pourrions-nous améliorer dans l'application ?",
    "negPlaceholder": "Indiquez-nous ce qui ne va pas ou ce qu'il vous manque...",
    "negBtnSend": "✉️ Envoyer mon avis",
    "negSentToast": "Merci beaucoup ! Nous étudierons votre retour avec attention ❤️",
    "btnClose": "Terminé"
  },
  "pl": {
    "congratsTitle": "Gratulacje! Odbierz bonusową japońską baśń 🎁",
    "congratsBadge": "🎁 Nagroda za 3. lekcję",
    "badge": "🎁 Ukryta bajka",
    "title": "Odblokuj magiczną japońską baśń!",
    "subtitle": "Odpowiedz na kilka szybkich pytań, aby natychmiast odblokować legendarną historię „My Lord Bag of Rice”.",
    "q1": "1. Jak oceniasz English Breakfast?",
    "starLabels": [
      "Słabo",
      "Średnio",
      "Dobrze",
      "Świetnie!",
      "Świetnie!"
    ],
    "q2": "Która funkcja Ci się spodobała?",
    "optQuiz": "Quiz",
    "optFavorites": "Ulubione",
    "optWidget": "Widżet na ekran główny",
    "optScanner": "Skaner tekstu",
    "submitBtn": "Odbierz prezent!",
    "posTitle": "Baśń odblokowana! 🎉",
    "posSub": "Cieszymy się niesamowicie, że lubisz English Breakfast! Czy poświęcisz 5 sekund na ocenę 5 gwiazdek w Google Play?",
    "btnRate": "⭐ Oceń na 5 gwiazdek w Google Play",
    "negTitle": "Dziękujemy za szczerość! 💖",
    "negSub": "Dziękujemy za szczerą opinię! Chcemy stale ulepszać English Breakfast.",
    "negAsk": "Co możemy poprawić w aplikacji?",
    "negPlaceholder": "Napisz, co poszło nie tak lub jakiej opcji Ci brakuje...",
    "negBtnSend": "✉️ Wyślij opinię",
    "negSentToast": "Dziękujemy! Uważnie przeanalizujemy Twoją wiadomość ❤️",
    "btnClose": "Gotowe"
  },
  "tr": {
    "congratsTitle": "Tebrikler! Bonus Japon masalınızı alın 🎁",
    "congratsBadge": "🎁 3. Ders Ödülü",
    "badge": "🎁 Gizli Masal",
    "title": "Sihirli bir Japon masalının kilidini aç!",
    "subtitle": "Efsanevi \"My Lord Bag of Rice\" hikayesini anında açmak için birkaç kısa soruyu yanıtla.",
    "q1": "1. English Breakfast deneyimin nasıl?",
    "starLabels": [
      "Kötü",
      "İdare eder",
      "İyi",
      "Harika!",
      "Aferin!"
    ],
    "q2": "Hangi özelliği beğendiniz?",
    "optQuiz": "Bilgi Yarışması (Quiz)",
    "optFavorites": "Favoriler",
    "optWidget": "Ana Ekran Widget'ı",
    "optScanner": "Metin Tarayıcı",
    "submitBtn": "Hediyeni Al!",
    "posTitle": "Masalın Kilidi Açıldı! 🎉",
    "posSub": "English Breakfast'ı beğendiğin için çok mutluyuz! Google Play'de 5 yıldız vermek için 5 saniyeni ayırır mısın?",
    "btnRate": "⭐ Google Play'de 5 Yıldız Ver",
    "negTitle": "Dürüstlüğün için teşekkürler! 💖",
    "negSub": "Dürüst geri bildirimin için teşekkür ederiz! English Breakfast'ı senin için daha da geliştirmek istiyoruz.",
    "negAsk": "Uygulamada neleri geliştirebiliriz?",
    "negPlaceholder": "Neyin aksadığını veya hangi özelliğe ihtiyaç duyduğunu yaz...",
    "negBtnSend": "✉️ Geri Bildirim Gönder",
    "negSentToast": "Teşekkürler! Geri bildirimini dikkatle inceleyeceğiz ❤️",
    "btnClose": "Tamam"
  },
  "it": {
    "congratsTitle": "Congratulazioni! Riscatta la favola giapponese bonus 🎁",
    "congratsBadge": "🎁 Ricompensa 3ª lezione",
    "badge": "🎁 Favola segreta",
    "title": "Sblocca una magica favola giapponese!",
    "subtitle": "Rispondi a un paio di rapide domande per sbloccare subito la leggendaria storia \"My Lord Bag of Rice\".",
    "q1": "1. Come ti trovi con English Breakfast?",
    "starLabels": [
      "Male",
      "Così così",
      "Bene",
      "Ottimo!",
      "Bravi!"
    ],
    "q2": "Quale funzione ti è piaciuta?",
    "optQuiz": "Quiz",
    "optFavorites": "Preferiti",
    "optWidget": "Widget schermata iniziale",
    "optScanner": "Scanner di testo",
    "submitBtn": "Ritira il regalo!",
    "posTitle": "Favola sbloccata! 🎉",
    "posSub": "Siamo felicissimi che English Breakfast ti piaccia! Ti andrebbe di dedicarci 5 secondi per votare 5 stelle su Google Play?",
    "btnRate": "⭐ Vota 5 stelle su Google Play",
    "negTitle": "Grazie per la tua sincerità! 💖",
    "negSub": "Grazie per la tua opinione sincera! Desideriamo migliorare costantemente English Breakfast per te.",
    "negAsk": "Cosa possiamo migliorare nell'app?",
    "negPlaceholder": "Raccontaci cosa non ha funzionato o cosa vorresti aggiungere...",
    "negBtnSend": "✉️ Invia commento",
    "negSentToast": "Grazie mille! Leggeremo attentamente la tua proposta ❤️",
    "btnClose": "Fatto"
  },
  "ro": {
    "congratsTitle": "Felicitări! Ia-ți povestea japoneză bonus 🎁",
    "congratsBadge": "🎁 Recompensa lecției 3",
    "badge": "🎁 Poveste secretă",
    "title": "Deblochează o poveste japoneză magică!",
    "subtitle": "Răspunde la câteva întrebări scurte pentru a debloca instantaneu legenda „My Lord Bag of Rice”.",
    "q1": "1. Cum ți se pare English Breakfast?",
    "starLabels": [
      "Slab",
      "Așa și așa",
      "Bun",
      "Grozav!",
      "Bravo!"
    ],
    "q2": "Ce funcționalitate ți-a plăcut?",
    "optQuiz": "Test / Quiz",
    "optFavorites": "Favorite",
    "optWidget": "Widget pentru ecran",
    "optScanner": "Scaner de text",
    "submitBtn": "Revendică cadoul!",
    "posTitle": "Poveste deblocată! 🎉",
    "posSub": "Ne bucurăm enorm că apreciezi English Breakfast! Ne ajuți cu 5 stele pe Google Play în doar 5 secunde?",
    "btnRate": "⭐ Evaluează cu 5 stele pe Google Play",
    "negTitle": "Îți mulțumim pentru sinceritate! 💖",
    "negSub": "Mulțumim pentru feedback-ul tău cinstit! Vrem să perfecționăm English Breakfast pentru tine.",
    "negAsk": "Ce am putea îmbunătăți în aplicație?",
    "negPlaceholder": "Spune-ne ce nu a mers bine sau ce funcție ți-ar plăcea...",
    "negBtnSend": "✉️ Trimite părerea ta",
    "negSentToast": "Îți mulțumim! Vom ține cont de sugestia ta ❤️",
    "btnClose": "Gata"
  },
  "bg": {
    "congratsTitle": "Поздравления! Вземи своята бонус японска приказка 🎁",
    "congratsBadge": "🎁 Награда за 3-ти урок",
    "badge": "🎁 Тайна приказка",
    "title": "Отключи вълшебна японска приказка!",
    "subtitle": "Отговори на няколко кратки въпроса, за да отключиш легендарната история «My Lord Bag of Rice».",
    "q1": "1. Как намираш English Breakfast?",
    "starLabels": [
      "Слабо",
      "Горе-долу",
      "Добре",
      "Чудесно!",
      "Браво!"
    ],
    "q2": "Коя функция ви хареса?",
    "optQuiz": "Куиз",
    "optFavorites": "Любими",
    "optWidget": "Уиджет за начален екран",
    "optScanner": "Текстов скенер",
    "submitBtn": "Вземи подаръка!",
    "posTitle": "Приказката е отключена! 🎉",
    "posSub": "Много се радваме, че харесваш English Breakfast! Би ли отделил 5 секунди за 5 звезди в Google Play?",
    "btnRate": "⭐ Оцени с 5 звезди в Google Play",
    "negTitle": "Благодарим за откровеността! 💖",
    "negSub": "Благодарим за честния отговор! Искаме да направим English Breakfast още по-добър.",
    "negAsk": "Какво можем да подобрим в приложението?",
    "negPlaceholder": "Напиши какво не ти хареса или какво ти липсва...",
    "negBtnSend": "✉️ Изпрати отзив",
    "negSentToast": "Благодарим ти! Ще разгледаме внимателно обратната връзка ❤️",
    "btnClose": "Готово"
  },
  "hu": {
    "congratsTitle": "Gratulálunk! Vedd át a bónusz japán mesét 🎁",
    "congratsBadge": "🎁 3. lecke jutalma",
    "badge": "🎁 Titkos mese",
    "title": "Oldj fel egy varázslatos japán mesét!",
    "subtitle": "Válaszolj néhány gyors kérdésre a legendás „My Lord Bag of Rice” történet azonnali feloldásához.",
    "q1": "1. Hogy tetszik az English Breakfast?",
    "starLabels": [
      "Gyenge",
      "Elmegy",
      "Jó",
      "Szuper!",
      "Szép munka!"
    ],
    "q2": "Melyik funkció tetszett?",
    "optQuiz": "Kvíz",
    "optFavorites": "Kedvencek",
    "optWidget": "Főképernyő widget",
    "optScanner": "Szövegszkenner",
    "submitBtn": "Ajándék átvétele!",
    "posTitle": "Mese feloldva! 🎉",
    "posSub": "Nagyon örülünk, hogy tetszik az English Breakfast! Értékelnél minket 5 csillaggal a Google Playen?",
    "btnRate": "⭐ 5 csillag a Google Playen",
    "negTitle": "Köszönjük az őszinteségedet! 💖",
    "negSub": "Köszönjük az őszinte választ! Szeretnénk még jobbá tenni az English Breakfast alkalmazást számodra.",
    "negAsk": "Mit javíthatnánk az alkalmazásban?",
    "negPlaceholder": "Írd meg, mi nem működött jól, vagy mi hiányzik...",
    "negBtnSend": "✉️ Visszajelzés küldése",
    "negSentToast": "Köszönjük! Alaposan átnézzük az üzenetedet ❤️",
    "btnClose": "Kész"
  },
  "el": {
    "congratsTitle": "Συγχαρητήρια! Πάρτε το μπόνους ιαπωνικό παραμύθι 🎁",
    "congratsBadge": "🎁 Ανταμοιβή 3ου μαθήματος",
    "badge": "🎁 Μυστικό παραμύθι",
    "title": "Ξεκλειδώστε ένα μαγικό ιαπωνικό παραμύθι!",
    "subtitle": "Απαντήστε σε μερικές γρήγορες ερωτήσεις για να ξεκλειδώσετε αμέσως την ιστορία «My Lord Bag of Rice».",
    "q1": "1. Πώς σας φαίνεται το English Breakfast;",
    "starLabels": [
      "Μέτριο",
      "Έτσι κι έτσι",
      "Καλό",
      "Πολύ καλό!",
      "Μπράβο!"
    ],
    "q2": "Ποια λειτουργία σας άρεσε;",
    "optQuiz": "Κουίζ",
    "optFavorites": "Αγαπημένα",
    "optWidget": "Widget αρχικής οθόνης",
    "optScanner": "Σαρωτής κειμένου",
    "submitBtn": "Πάρτε το δώρο σας!",
    "posTitle": "Η ιστορία ξεκλειδώθηκε! 🎉",
    "posSub": "Χαιρόμαστε πολύ που σας αρέσει το English Breakfast! Μας χαρίζετε 5 δευτερόλεπτα με 5 αστέρια στο Google Play;",
    "btnRate": "⭐ 5 αστέρια στο Google Play",
    "negTitle": "Ευχαριστούμε για την ειλικρίνειά σας! 💖",
    "negSub": "Σας ευχαριστούμε για την ειλικρινή σας γνώμη! Θέλουμε να κάνουμε το English Breakfast ακόμη καλύτερο.",
    "negAsk": "Τι μπορούμε να βελτιώσουμε στην εφαρμογή;",
    "negPlaceholder": "Γράψτε μας τι δεν πήγε καλά ή τι θα θέλατε να προστεθεί...",
    "negBtnSend": "✉️ Αποστολή πρότασης",
    "negSentToast": "Ευχαριστούμε! Θα εξετάσουμε προσεκτικά τα σχόλιά σας ❤️",
    "btnClose": "Τέλος"
  },
  "da": {
    "congratsTitle": "Tillykke! Få dit bonus japanske eventyr 🎁",
    "congratsBadge": "🎁 Belønning for 3. lektion",
    "badge": "🎁 Hemmeligt eventyr",
    "title": "Lås op for et magisk japansk eventyr!",
    "subtitle": "Svar på et par hurtige spørgsmål for straks at åbne den legendariske historie “My Lord Bag of Rice”.",
    "q1": "1. Hvad synes du om English Breakfast?",
    "starLabels": [
      "Dårligt",
      "Middel",
      "Fint",
      "Rigtig godt!",
      "Godt gået!"
    ],
    "q2": "Hvilken funktion kunne du lide?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoritter",
    "optWidget": "Startskærm-widget",
    "optScanner": "Tekstscanner",
    "submitBtn": "Hent gave!",
    "posTitle": "Eventyret er låst op! 🎉",
    "posSub": "Vi er så glade for, at du kan lide English Breakfast! Vil du bruge 5 sekunder på at give os 5 stjerner på Google Play?",
    "btnRate": "⭐ Giv 5 stjerner på Google Play",
    "negTitle": "Tak for din ærlighed! 💖",
    "negSub": "Tak for din ærlige feedback! Vi vil gøre English Breakfast endnu bedre for dig.",
    "negAsk": "Hvad kan vi forbedre i appen?",
    "negPlaceholder": "Fortæl os, hvad der gik galt eller hvad du savner...",
    "negBtnSend": "✉️ Send feedback",
    "negSentToast": "Tusind tak! Vi kigger grundigt på det ❤️",
    "btnClose": "Færdig"
  },
  "lv": {
    "congratsTitle": "Apsveicam! Saņem savu bonusa japāņu pasaku 🎁",
    "congratsBadge": "🎁 3. nodarbības balva",
    "badge": "🎁 Slepenā pasaka",
    "title": "Atbloķē burvīgu japāņu pasaku!",
    "subtitle": "Atbildi uz pāris īsiem jautājumiem, lai tūlīt piekļūtu leģendārajam stāstam “My Lord Bag of Rice”.",
    "q1": "1. Kā tev patīk English Breakfast?",
    "starLabels": [
      "Vāji",
      "Vidēji",
      "Labi",
      "Lieliski!",
      "Malači!"
    ],
    "q2": "Kura funkcija tev patika?",
    "optQuiz": "Viktorīna",
    "optFavorites": "Izlase",
    "optWidget": "Sākuma ekrāna logrīks",
    "optScanner": "Teksta skeneris",
    "submitBtn": "Saņemt dāvanu!",
    "posTitle": "Pasaka atbloķēta! 🎉",
    "posSub": "Mēs ļoti priecājamies, ka tev patīk English Breakfast! Vai veltīsi 5 sekundes, lai novērtētu ar 5 zvaigznēm Google Play?",
    "btnRate": "⭐ Novērtēt ar 5 zvaigznēm Google Play",
    "negTitle": "Paldies par tavu godīgumu! 💖",
    "negSub": "Paldies par godīgo vērtējumu! Mēs vēlamies padarīt English Breakfast vēl labāku.",
    "negAsk": "Ko mēs varētu lietotnē uzlabot?",
    "negPlaceholder": "Uzraksti, kas nepatika vai kādas funkcijas pietrūkst...",
    "negBtnSend": "✉️ Nosūtīt atsauksmi",
    "negSentToast": "Liels paldies! Mēs rūpīgi izskatīsim ieteikumu ❤️",
    "btnClose": "Gatavs"
  },
  "lt": {
    "congratsTitle": "Sveikiname! Atsiimk bonusinę japonų pasaką 🎁",
    "congratsBadge": "🎁 3-ios pamokos apdovanojimas",
    "badge": "🎁 Paslaptinga pasaka",
    "title": "Atrask stebuklingą japonų pasaką!",
    "subtitle": "Atsakyk į porą trumpų klausimų ir iškart atverk legendinę istoriją „My Lord Bag of Rice“.",
    "q1": "1. Kaip vertini English Breakfast?",
    "starLabels": [
      "Prastai",
      "Vidutiniškai",
      "Gerai",
      "Puikiai!",
      "Šaunuoliai!"
    ],
    "q2": "Kuri funkcija tau patiko?",
    "optQuiz": "Viktorina",
    "optFavorites": "Mėgstamiausi",
    "optWidget": "Pagrindinio ekrano valdiklis",
    "optScanner": "Teksto skaitytuvas",
    "submitBtn": "Atsiimti dovaną!",
    "posTitle": "Pasaka atrakinta! 🎉",
    "posSub": "Labai džiaugiamės, kad tau patinka English Breakfast! Ar skirtum 5 sekundes įvertinti 5 žvaigždutėmis „Google Play“?",
    "btnRate": "⭐ Įvertinti 5 žvaigždutėmis „Google Play“",
    "negTitle": "Ačiū už tavo nuoširdumą! 💖",
    "negSub": "Ačiū už atvirą atsakymą! Siekiame paversti English Breakfast dar patogesne programėle.",
    "negAsk": "Ką programėlėje galėtume patobulinti?",
    "negPlaceholder": "Parašyk, kas nepatiko arba ko pritrūko...",
    "negBtnSend": "✉️ Siųsti atsiliepimą",
    "negSentToast": "Labai ačiū! Būtinai atsižvelgsime į tavo nuomonę ❤️",
    "btnClose": "Atlikta"
  },
  "pt": {
    "congratsTitle": "Parabéns! Resgate o seu conto bônus japonês 🎁",
    "congratsBadge": "🎁 Recompensa da 3ª lição",
    "badge": "🎁 Conto secreto",
    "title": "Desbloqueie um conto mágico japonês!",
    "subtitle": "Responda a algumas perguntas rápidas para desbloquear agora a história clássica \"My Lord Bag of Rice\".",
    "q1": "1. Como está sendo sua experiência com o English Breakfast?",
    "starLabels": [
      "Ruim",
      "Regular",
      "Bom",
      "Ótimo!",
      "Muito bem!"
    ],
    "q2": "Qual funcionalidade você gostou?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoritos",
    "optWidget": "Widget de tela inicial",
    "optScanner": "Scanner de texto",
    "submitBtn": "Resgatar presente!",
    "posTitle": "Conto desbloqueado! 🎉",
    "posSub": "Ficamos muito felizes que você esteja gostando do English Breakfast! Que tal nos dedicar 5 segundos e deixar 5 estrelas no Google Play?",
    "btnRate": "⭐ Avaliar com 5 estrelas no Google Play",
    "negTitle": "Obrigado pela sua sinceridade! 💖",
    "negSub": "Agradecemos pelo seu feedback sincero! Queremos aprimorar o English Breakfast para você.",
    "negAsk": "O que podemos melhorar no aplicativo?",
    "negPlaceholder": "Diga-nos o que deu errado ou qual recurso faz falta...",
    "negBtnSend": "✉️ Enviar feedback",
    "negSentToast": "Muito obrigado! Vamos analisar sua mensagem com carinho ❤️",
    "btnClose": "Concluir"
  },
  "pt-br": {
    "congratsTitle": "Parabéns! Resgate seu conto japonês bônus 🎁",
    "congratsBadge": "🎁 Recompensa da 3ª lição",
    "badge": "🎁 Conto secreto",
    "title": "Desbloqueie um conto mágico japonês!",
    "subtitle": "Responda a algumas perguntas rápidas para desbloquear agora a história clássica \"My Lord Bag of Rice\".",
    "q1": "1. Como está sendo sua experiência com o English Breakfast?",
    "starLabels": [
      "Ruim",
      "Regular",
      "Bom",
      "Ótimo!",
      "Muito bem!"
    ],
    "q2": "Qual funcionalidade você gostou?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoritos",
    "optWidget": "Widget de tela inicial",
    "optScanner": "Scanner de texto",
    "submitBtn": "Resgatar presente!",
    "posTitle": "Conto desbloqueado! 🎉",
    "posSub": "Ficamos felizes demais que você esteja curtindo o English Breakfast! Pode doar 5 segundos para nos avaliar com 5 estrelas na Google Play?",
    "btnRate": "⭐ Avaliar com 5 estrelas na Google Play",
    "negTitle": "Obrigado pela sua sinceridade! 💖",
    "negSub": "Agradecemos muito pelo seu retorno sincero! Queremos deixar o English Breakfast ainda melhor para você.",
    "negAsk": "O que podemos melhorar no app?",
    "negPlaceholder": "Conta pra gente o que não funcionou bem ou o que você sente falta...",
    "negBtnSend": "✉️ Enviar sugestão",
    "negSentToast": "Muito obrigado! Vamos analisar sua sugestão com todo carinho ❤️",
    "btnClose": "Pronto"
  },
  "sk": {
    "congratsTitle": "Gratulujeme! Získaj bonusovú japonskú rozprávku 🎁",
    "congratsBadge": "🎁 Odmena za 3. lekciu",
    "badge": "🎁 Tajná rozprávka",
    "title": "Odomkni čarovnú japonskú rozprávku!",
    "subtitle": "Odpovedz na pár rýchlych otázok a okamžite získaj prístup k legendárnemu príbehu „My Lord Bag of Rice“.",
    "q1": "1. Ako sa ti páči English Breakfast?",
    "starLabels": [
      "Slabé",
      "Ujde to",
      "Dobré",
      "Skvelé!",
      "Výborne!"
    ],
    "q2": "Ktorá funkcia sa ti páčila?",
    "optQuiz": "Kvíz",
    "optFavorites": "Obľúbené",
    "optWidget": "Widget na domovskú obrazovku",
    "optScanner": "Skener textu",
    "submitBtn": "Vyzdvihnúť darček!",
    "posTitle": "Rozprávka odomknutá! 🎉",
    "posSub": "Veľmi sa tešíme, že sa ti English Breakfast páči! Venuješ nám 5 sekúnd a ohodnotíš nás 5 hviezdičkami na Google Play?",
    "btnRate": "⭐ Ohodnotiť 5 hviezdičkami na Google Play",
    "negTitle": "Ďakujeme za tvoju úprimnosť! 💖",
    "negSub": "Ďakujeme za úprimnú spätnú väzbu! Chceme pre teba aplikáciu English Breakfast ešte viac vylepšiť.",
    "negAsk": "Čo by sme mali v aplikácii zlepšiť?",
    "negPlaceholder": "Napíš nám, čo nefungovalo alebo čo ti v aplikácii chýba...",
    "negBtnSend": "✉️ Odoslať spätnú väzbu",
    "negSentToast": "Ďakujeme! Tvoj podnet si dôkladne prejdeme ❤️",
    "btnClose": "Hotovo"
  },
  "sl": {
    "congratsTitle": "Čestitke! Prevzemi svojo bonus japonsko pravljico 🎁",
    "congratsBadge": "🎁 Nagrada za 3. lekcijo",
    "badge": "🎁 Skrivna pravljica",
    "title": "Odkrij čarobno japonsko pravljico!",
    "subtitle": "Odgovori na nekaj hitrih vprašanj in takoj odkleni legendarno zgodbo »My Lord Bag of Rice«.",
    "q1": "1. Kako ti je všeč English Breakfast?",
    "starLabels": [
      "Slabo",
      "Tako tako",
      "Dobro",
      "Odlično!",
      "Odlično!"
    ],
    "q2": "Katera funkcija ti je bila všeč?",
    "optQuiz": "Kviz",
    "optFavorites": "Priljubljene",
    "optWidget": "Gradnik za domači zaslon",
    "optScanner": "Bralnik besedila",
    "submitBtn": "Prevzemi darilo!",
    "posTitle": "Pravljica je odklenjena! 🎉",
    "posSub": "Zelo smo veseli, da ti je English Breakfast všeč! Bi si vzel 5 sekund in nas na Google Play ocenil s 5 zvezdicami?",
    "btnRate": "⭐ Oceni s 5 zvezdicami na Google Play",
    "negTitle": "Hvala za tvojo iskrenost! 💖",
    "negSub": "Hvala za iskren odgovor! Aplikacijo English Breakfast želimo zate še izboljšati.",
    "negAsk": "Kaj bi lahko izboljšali v aplikaciji?",
    "negPlaceholder": "Napiši nam, kaj ni bilo v redu ali kaj pogrešaš...",
    "negBtnSend": "✉️ Pošlji mnenje",
    "negSentToast": "Hvala! Tvoj predlog bomo skrbno pregledali ❤️",
    "btnClose": "Končano"
  },
  "fi": {
    "congratsTitle": "Onnittelut! Lunasta japanilainen bonussatusi 🎁",
    "congratsBadge": "🎁 3. oppitunnin palkinto",
    "badge": "🎁 Salainen satu",
    "title": "Avaa maaginen japanilainen satu!",
    "subtitle": "Vastaa muutamaan lyhyeen kysymykseen ja avaa heti legendaarinen tarina ”My Lord Bag of Rice”.",
    "q1": "1. Mitä pidät English Breakfast -sovelluksesta?",
    "starLabels": [
      "Heikko",
      "Kohtalainen",
      "Hyvä",
      "Loistava!",
      "Hienoa työtä!"
    ],
    "q2": "Mistä toiminnosta pidit?",
    "optQuiz": "Tietovisa (Quiz)",
    "optFavorites": "Suosikit",
    "optWidget": "Aloitusnäytön widget",
    "optScanner": "Tekstiskanneri",
    "submitBtn": "Lunasta lahja!",
    "posTitle": "Satu avattu! 🎉",
    "posSub": "Olemme todella iloisia, että pidät English Breakfastista! Voisitko antaa meille 5 sekuntia ja 5 tähteä Google Playssa?",
    "btnRate": "⭐ Anna 5 tähteä Google Playssa",
    "negTitle": "Kiitos rehellisyydestäsi! 💖",
    "negSub": "Kiitos rehellisestä palautteestasi! Haluamme tehdä English Breakfastista entistä paremman.",
    "negAsk": "Mitä voisimme parantaa sovelluksessa?",
    "negPlaceholder": "Kerro, mikä ei toiminut tai mitä ominaisuutta kaipaat...",
    "negBtnSend": "✉️ Lähetä palaute",
    "negSentToast": "Kiitos paljon! Otamme palautteesi huomioon ❤️",
    "btnClose": "Valmis"
  },
  "hr": {
    "congratsTitle": "Čestitamo! Preuzmi svoju bonus japansku bajku 🎁",
    "congratsBadge": "🎁 Nagrada za 3. lekciju",
    "badge": "🎁 Tajna bajka",
    "title": "Otključaj čarobnu japansku bajku!",
    "subtitle": "Odgovori na par brzih pitanja i odmah otključaj legendarnu priču „My Lord Bag of Rice”.",
    "q1": "1. Kako ti se sviđa English Breakfast?",
    "starLabels": [
      "Loše",
      "Onako",
      "Dobro",
      "Sjajno!",
      "Bravo!"
    ],
    "q2": "Koja ti se funkcija svidjela?",
    "optQuiz": "Kviz",
    "optFavorites": "Favoriti",
    "optWidget": "Widget za početni zaslon",
    "optScanner": "Skener teksta",
    "submitBtn": "Preuzmi dar!",
    "posTitle": "Bajka otključana! 🎉",
    "posSub": "Presretni smo što ti se sviđa English Breakfast! Možeš li odvojiti 5 sekundi za 5 zvjezdica na Google Playu?",
    "btnRate": "⭐ Ocijeni s 5 zvjezdica na Google Playu",
    "negTitle": "Hvala ti na iskrenosti! 💖",
    "negSub": "Hvala ti na iskrenoj povratnoj informaciji! Želimo učiniti English Breakfast još boljim za tebe.",
    "negAsk": "Što možemo poboljšati u aplikaciji?",
    "negPlaceholder": "Napiši nam što nije radilo kako treba ili što ti nedostaje...",
    "negBtnSend": "✉️ Pošalji povratnu informaciju",
    "negSentToast": "Hvala ti! Pažljivo ćemo proučiti tvoj prijedlog ❤️",
    "btnClose": "Gotovo"
  },
  "cs": {
    "congratsTitle": "Gratulujeme! Vyzvedni si bonusovou japonskou pohádku 🎁",
    "congratsBadge": "🎁 Odměna za 3. lekci",
    "badge": "🎁 Tajná pohádka",
    "title": "Odemkni kouzelnou japonskou pohádku!",
    "subtitle": "Odpověz na pár rychlých otázek a okamžitě získej přístup k legendárnímu příběhu „My Lord Bag of Rice“.",
    "q1": "1. Jak se ti líbí English Breakfast?",
    "starLabels": [
      "Špatné",
      "Ujde to",
      "Dobré",
      "Skvělé!",
      "Skvělá práce!"
    ],
    "q2": "Která funkce se ti líbila?",
    "optQuiz": "Kvíz",
    "optFavorites": "Oblíbené",
    "optWidget": "Widget na domovskou obrazovku",
    "optScanner": "Skener textu",
    "submitBtn": "Vyzvednout dárek!",
    "posTitle": "Pohádka odemčena! 🎉",
    "posSub": "Máme obrovskou radost, že se ti English Breakfast líbí! Věnuješ nám 5 vteřin a ohodnotíš nás 5 hvězdičkami na Google Play?",
    "btnRate": "⭐ Dát 5 hvězdiček na Google Play",
    "negTitle": "Děkujeme za tvou upřímnost! 💖",
    "negSub": "Děkujeme za upřímnou odpověď! Chceme English Breakfast udělat pro tebe ještě lepší.",
    "negAsk": "Co bychom měli v aplikaci zlepšit?",
    "negPlaceholder": "Napiš nám, co nefungovalo nebo co ti v aplikaci chybí...",
    "negBtnSend": "✉️ Odeslat zpětnou vazbu",
    "negSentToast": "Děkujeme! Tvůj podnět si pečlivě projdeme ❤️",
    "btnClose": "Hotovo"
  },
  "sv": {
    "congratsTitle": "Grattis! Hämta din japanska bonussaga 🎁",
    "congratsBadge": "🎁 Belöning för lektion 3",
    "badge": "🎁 Hemlig saga",
    "title": "Lås upp en magisk japansk saga!",
    "subtitle": "Svara på ett par snabba frågor för att direkt låsa upp den legendariska berättelsen ”My Lord Bag of Rice”.",
    "q1": "1. Vad tycker du om English Breakfast?",
    "starLabels": [
      "Dåligt",
      "Helt okej",
      "Bra",
      "Toppen!",
      "Bra jobbat!"
    ],
    "q2": "Vilken funktion gillade du?",
    "optQuiz": "Quiz",
    "optFavorites": "Favoriter",
    "optWidget": "Startskärmswidget",
    "optScanner": "Textskanner",
    "submitBtn": "Hämta gåvan!",
    "posTitle": "Sagan är upplåst! 🎉",
    "posSub": "Vi är otroligt glada att du gillar English Breakfast! Skulle du vilja ge oss 5 sekunder och 5 stjärnor på Google Play?",
    "btnRate": "⭐ Betygsätt med 5 stjärnor på Google Play",
    "negTitle": "Tack för din ärlighet! 💖",
    "negSub": "Tack för din ärliga feedback! Vi vill göra English Breakfast ännu bättre för dig.",
    "negAsk": "Vad kan vi förbättra i appen?",
    "negPlaceholder": "Berätta vad som inte fungerade eller vad du saknar...",
    "negBtnSend": "✉️ Skicka feedback",
    "negSentToast": "Tack så mycket! Vi kommer att gå igenom dina synpunkter noga ❤️",
    "btnClose": "Klart"
  },
  "et": {
    "congratsTitle": "Palju õnne! Võta oma jaapani boonusmuinasjutt 🎁",
    "congratsBadge": "🎁 3. tunni preemia",
    "badge": "🎁 Salajane muinasjutt",
    "title": "Ava maagiline jaapani muinasjutt!",
    "subtitle": "Vasta paarile lühikesele küsimusele, et kohe avada legendaarne lugu „My Lord Bag of Rice”.",
    "q1": "1. Kuidas sulle English Breakfast meeldib?",
    "starLabels": [
      "Kehv",
      "Käib kah",
      "Hea",
      "Väga hea!",
      "Hästi tehtud!"
    ],
    "q2": "Milline funktsioon sulle meeldis?",
    "optQuiz": "Viktoriin",
    "optFavorites": "Lemmikud",
    "optWidget": "Avakuva vidin",
    "optScanner": "Tekstiskanner",
    "submitBtn": "Võta kingitus vastu!",
    "posTitle": "Muinasjutt on avatud! 🎉",
    "posSub": "Meil on ääretult hea meel, et sulle meeldib English Breakfast! Kas pühendaksid 5 sekundit ja annaksid meile Google Plays 5 tärni?",
    "btnRate": "⭐ Hinda 5 tärniga Google Plays",
    "negTitle": "Aitäh aususe eest! 💖",
    "negSub": "Täname ausa tagasiside eest! Soovime teha English Breakfasti sinu jaoks veelgi paremaks.",
    "negAsk": "Mida saaksime rakenduses paremaks muuta?",
    "negPlaceholder": "Kirjuta, mis ei toiminud hästi või millisest funktsioonist puudust tundsid...",
    "negBtnSend": "✉️ Saada tagasiside",
    "negSentToast": "Suur aitäh! Vaatame su ettepaneku kindlasti läbi ❤️",
    "btnClose": "Valmis"
  },
  "hi": {
    "congratsTitle": "बधाई हो! अपनी बोनस जापानी लोककथा प्राप्त करें 🎁",
    "congratsBadge": "🎁 तीसरे पाठ का उपहार",
    "badge": "🎁 गुप्त जापानी कहानी",
    "title": "जादुई जापानी लोककथा अनलॉक करें!",
    "subtitle": "पौराणिक कहानी \"My Lord Bag of Rice\" को तुरंत खोलने के लिए कुछ छोटे सवालों के जवाब दें।",
    "q1": "1. आपको English Breakfast कैसा लग रहा है?",
    "starLabels": [
      "खराब",
      "ठीक-ठाक",
      "अच्छा",
      "बहुत बढ़िया!",
      "शाबाश!"
    ],
    "q2": "आपको कौन सा फ़ीचर पसंद आया?",
    "optQuiz": "क्विज़",
    "optFavorites": "पसंदीदा शब्द",
    "optWidget": "होम स्क्रीन विजेट",
    "optScanner": "टेक्स्ट स्कैनर",
    "submitBtn": "उपहार प्राप्त करें!",
    "posTitle": "कहानी अनलॉक हो गई! 🎉",
    "posSub": "हमें बहुत खुशी है कि आपको English Breakfast पसंद आ रहा है! क्या आप Google Play पर 5 स्टार देने के लिए 5 सेकंड निकाल सकते हैं?",
    "btnRate": "⭐ Google Play पर 5 स्टार दें",
    "negTitle": "आपकी ईमानदारी के लिए धन्यवाद! 💖",
    "negSub": "सच्ची प्रतिक्रिया के लिए धन्यवाद! हम आपके लिए English Breakfast को और बेहतर बनाना चाहते हैं।",
    "negAsk": "हम ऐप में क्या सुधार कर सकते हैं?",
    "negPlaceholder": "बताएं क्या कमी लगी या आपको कौन सा नया फीचर चाहिए...",
    "negBtnSend": "✉️ सुझाव भेजें",
    "negSentToast": "धन्यवाद! हम आपके सुझाव पर गंभीरता से काम करेंगे ❤️",
    "btnClose": "हो गया"
  },
  "bn": {
    "congratsTitle": "অভিনন্দন! আপনার বোনাস জাপানি রূপকথা সংগ্রহ করুন 🎁",
    "congratsBadge": "🎁 ৩য় পাঠের পুরস্কার",
    "badge": "🎁 গোপন জাপানি রূপকথা",
    "title": "জাদুকরী জাপানি রূপকথা আনলক করুন!",
    "subtitle": "কিংবদন্তি গল্প \"My Lord Bag of Rice\" অবিলম্বে আনলক করতে কয়েকটি দ্রুত প্রশ্নের উত্তর দিন।",
    "q1": "1. English Breakfast আপনার কেমন লাগছে?",
    "starLabels": [
      "খারাপ",
      "মোটামুটি",
      "ভালো",
      "দারুণ!",
      "দারুণ কাজ!"
    ],
    "q2": "কোন ফিচারটি আপনার ভালো লেগেছে?",
    "optQuiz": "কুইজ",
    "optFavorites": "প্রিয় শব্দ তালিকা",
    "optWidget": "হোম স্ক্রিন উইজেট",
    "optScanner": "টেক্সট স্ক্যানার",
    "submitBtn": "উপহার গ্রহণ করুন!",
    "posTitle": "রূপকথা আনলক করা হয়েছে! 🎉",
    "posSub": "English Breakfast আপনার ভালো লেগেছে জেনে আমরা দারুণ আনন্দিত! Google Play-তে আমাদের ৫ স্টার রেটিং দিতে ৫ সেকেন্ড সময় দেবেন কি?",
    "btnRate": "⭐ Google Play-তে ৫ স্টার দিন",
    "negTitle": "আপনার সততার জন্য ধন্যবাদ! 💖",
    "negSub": "আপনার আন্তরিক মতামতের জন্য ধন্যবাদ! আমরা English Breakfast-কে আপনার জন্য আরও উন্নত করতে চাই।",
    "negAsk": "অ্যাপে আমরা কী কী উন্নতি করতে পারি?",
    "negPlaceholder": "কোথায় সমস্যা হয়েছে বা কোন ফিচারটি প্রয়োজন তা লিখুন...",
    "negBtnSend": "✉️ মতামত পাঠান",
    "negSentToast": "ধন্যবাদ! আমরা আপনার মূল্যবান মতামত গুরুত্ব সহকারে পর্যালোচনা করব ❤️",
    "btnClose": "সম্পন্ন"
  },
  "ar": {
    "congratsTitle": "تهانينا! احصل على القصة اليابانية الإضافية 🎁",
    "congratsBadge": "🎁 مكافأة الدرس الثالث",
    "badge": "🎁 قصة يابانية سرية",
    "title": "افتح قصة يابانية ساحرة!",
    "subtitle": "أجب عن بضعة أسئلة سريعة لفتح القصة الأسطورية \"My Lord Bag of Rice\" فوراً.",
    "q1": "1. ما رأيك في تطبيق English Breakfast؟",
    "starLabels": [
      "ضعيف",
      "مقبول",
      "جيد",
      "رائع!",
      "أحسنتم!"
    ],
    "q2": "ما الميزة التي نالت إعجابك؟",
    "optQuiz": "اختبار قصير (كويز)",
    "optFavorites": "الكلمات المفضلة",
    "optWidget": "ويدجت الشاشة الرئيسية",
    "optScanner": "ماسح النصوص الذكي",
    "submitBtn": "استلام الهدية!",
    "posTitle": "تم فتح القصة بنجاح! 🎉",
    "posSub": "يسعدنا جداً أن English Breakfast قد نال إعجابك! هل تمنحنا 5 ثوانٍ لتقييم التطبيق بـ 5 نجوم على Google Play؟",
    "btnRate": "⭐ تقييم 5 نجوم على Google Play",
    "negTitle": "شكراً لصراحتك معنا! 💖",
    "negSub": "نشكرك على تقييمك الصادق! نسعى دائماً لجعل English Breakfast أفضل لك.",
    "negAsk": "ما الذي يمكننا تحسينه في التطبيق؟",
    "negPlaceholder": "أخبرنا بما يمكن تحسينه أو المزايا التي تنقصك...",
    "negBtnSend": "✉️ إرسال الملاحظات",
    "negSentToast": "شكراً جزيلاً! سنأخذ رأيك بعين الاعتبار والاهتمام ❤️",
    "btnClose": "تم"
  },
  "fa": {
    "congratsTitle": "تبریک! داستان ژاپنی هدیه خود را دریافت کنید 🎁",
    "congratsBadge": "🎁 پاداش درس سوم",
    "badge": "🎁 داستان ژاپنی مخفی",
    "title": "یک افسانه جادویی ژاپنی را باز کنید!",
    "subtitle": "برای دسترسی فوری به افسانه مشهور \"My Lord Bag of Rice\" به چند پرسش کوتاه پاسخ دهید.",
    "q1": "۱. از کار با English Breakfast چقدر رضایت دارید؟",
    "starLabels": [
      "ضعیف",
      "متوسط",
      "خوب",
      "عالی!",
      "آفرین!"
    ],
    "q2": "کدام قابلیت را دوست داشتید؟",
    "optQuiz": "آزمون (کوییز)",
    "optFavorites": "واژه‌های نشان‌شده",
    "optWidget": "ابزارک صفحه اصلی",
    "optScanner": "اسکنر متن",
    "submitBtn": "دریافت جایزه!",
    "posTitle": "داستان باز شد! 🎉",
    "posSub": "بسیار خوشحالیم که English Breakfast را دوست دارید! آیا می‌توانید ۵ ثانیه وقت بگذارید و به ما در گوگل‌پلی ۵ ستاره دهید؟",
    "btnRate": "⭐ ثبت ۵ ستاره در Google Play",
    "negTitle": "از صداقت شما سپاسگزاریم! 💖",
    "negSub": "از بازخورد صادقانه‌تان بسیار متشکریم! می‌خواهیم English Breakfast را برای شما بسیار بهتر کنیم.",
    "negAsk": "چه چیزی را در برنامه بهبود دهیم؟",
    "negPlaceholder": "هر گونه ایراد یا قابلیتی که نیاز دارید را برای ما بنویسید...",
    "negBtnSend": "✉️ ارسال نظر",
    "negSentToast": "متشکریم! حتماً پیشنهاد شما را بررسی خواهیم کرد ❤️",
    "btnClose": "انجام شد"
  },
  "ur": {
    "congratsTitle": "مبارک ہو! اپنی بونس جاپانی کہانی حاصل کریں 🎁",
    "congratsBadge": "🎁 تیسرے سبق کا انعام",
    "badge": "🎁 خفیہ جاپانی کہانی",
    "title": "ایک جادوئی جاپانی کہانی انلاک کریں!",
    "subtitle": "مشہور لوک داستان \"My Lord Bag of Rice\" تک فوری رسائی کے لیے چند مختصر سوالات کے جواب دیں۔",
    "q1": "1. آپ کو English Breakfast کیسا لگا؟",
    "starLabels": [
      "برا",
      "ٹھیک ٹھاک",
      "اچھا",
      "بہت زبردست!",
      "شاباش!"
    ],
    "q2": "آپ کو کون سا فیچر پسند آیا؟",
    "optQuiz": "کوئز",
    "optFavorites": "پسندیدہ الفاظ",
    "optWidget": "ہوم اسکرین ویجیٹ",
    "optScanner": "ٹیکسٹ اسکینر",
    "submitBtn": "تحفہ حاصل کریں!",
    "posTitle": "کہانی انلاک ہو گئی! 🎉",
    "posSub": "ہمیں بے حد خوشی ہے کہ آپ کو English Breakfast پسند آیا! کیا آپ گوگل پلے پر 5 اسٹار دینے کے لیے 5 سیکنڈ نکال سکتے ہیں؟",
    "btnRate": "⭐ گوگل پلے پر 5 اسٹار دیں",
    "negTitle": "آپ کی سچائی کا شکریہ! 💖",
    "negSub": "ایماندارانہ رائے کے لیے آپ کا شکریہ! ہم آپ کے لیے English Breakfast کو مزید بہتر بنانا چاہتے ہیں۔",
    "negAsk": "ہم ایپ میں کیا بہتری لا سکتے ہیں؟",
    "negPlaceholder": "ہمیں بتائیں کیا مسئلہ پیش آیا یا کس فیچر کی ضرورت ہے...",
    "negBtnSend": "✉️ رائے بھیجیں",
    "negSentToast": "شکریہ! ہم آپ کی رائے پر توجہ دیں گے ❤️",
    "btnClose": "مکمل"
  },
  "id": {
    "congratsTitle": "Selamat! Klaim dongeng Jepang bonusmu 🎁",
    "congratsBadge": "🎁 Hadiah Pelajaran ke-3",
    "badge": "🎁 Dongeng Rahasia",
    "title": "Buka Dongeng Jepang yang Ajaib!",
    "subtitle": "Jawab beberapa pertanyaan singkat untuk langsung membuka cerita legendaris \"My Lord Bag of Rice\".",
    "q1": "1. Bagaimana pengalamanmu dengan English Breakfast?",
    "starLabels": [
      "Buruk",
      "Biasa saja",
      "Bagus",
      "Mantap!",
      "Luar biasa!"
    ],
    "q2": "Fitur mana yang kamu sukai?",
    "optQuiz": "Kuis",
    "optFavorites": "Favorit",
    "optWidget": "Widget Layar Utama",
    "optScanner": "Pemindai Teks",
    "submitBtn": "Ambil Hadiah!",
    "posTitle": "Dongeng Berhasil Dibuka! 🎉",
    "posSub": "Kami sangat senang kamu menyukai English Breakfast! Maukah meluangkan 5 detik untuk memberi 5 bintang di Google Play?",
    "btnRate": "⭐ Beri 5 Bintang di Google Play",
    "negTitle": "Terima kasih atas kejujuranmu! 💖",
    "negSub": "Terima kasih atas masukan jujurmu! Kami ingin membuat English Breakfast semakin baik untukmu.",
    "negAsk": "Apa yang bisa kami tingkatkan di aplikasi?",
    "negPlaceholder": "Tuliskan kendala yang kamu alami atau fitur yang kamu inginkan...",
    "negBtnSend": "✉️ Kirim Masukan",
    "negSentToast": "Terima kasih! Kami akan mempelajari saranmu dengan teliti ❤️",
    "btnClose": "Selesai"
  },
  "vi": {
    "congratsTitle": "Chúc mừng! Nhận ngay truyện cổ tích Nhật Bản tặng thêm 🎁",
    "congratsBadge": "🎁 Phần thưởng bài học thứ 3",
    "badge": "🎁 Truyện cổ tích bí mật",
    "title": "Mở khóa truyện cổ tích Nhật Bản kỳ diệu!",
    "subtitle": "Trả lời vài câu hỏi nhanh để mở khóa ngay câu chuyện huyền thoại “My Lord Bag of Rice”.",
    "q1": "1. Bạn thấy English Breakfast thế nào?",
    "starLabels": [
      "Tệ",
      "Tạm ổn",
      "Tốt",
      "Tuyệt vời!",
      "Làm tốt lắm!"
    ],
    "q2": "Bạn thích tính năng nào?",
    "optQuiz": "Trắc nghiệm (Quiz)",
    "optFavorites": "Từ vựng yêu thích",
    "optWidget": "Tiện ích màn hình chính",
    "optScanner": "Quét văn bản (Scanner)",
    "submitBtn": "Nhận quà ngay!",
    "posTitle": "Đã mở khóa truyện! 🎉",
    "posSub": "Chúng tôi rất vui vì bạn yêu thích English Breakfast! Bạn có thể dành 5 giây để đánh giá 5 sao trên Google Play không?",
    "btnRate": "⭐ Đánh giá 5 sao trên Google Play",
    "negTitle": "Cảm ơn sự chân thành của bạn! 💖",
    "negSub": "Cảm ơn phản hồi thẳng thắn của bạn! Chúng tôi luôn nỗ lực hoàn thiện English Breakfast hơn nữa.",
    "negAsk": "Chúng tôi có thể cải thiện điều gì trong ứng dụng?",
    "negPlaceholder": "Hãy cho chúng tôi biết lỗi gặp phải hoặc tính năng bạn muốn có...",
    "negBtnSend": "✉️ Gửi góp ý",
    "negSentToast": "Xin cảm ơn! Chúng tôi sẽ xem xét kỹ lưỡng ý kiến của bạn ❤️",
    "btnClose": "Xong"
  },
  "th": {
    "congratsTitle": "ยินดีด้วย! รับนิทานญี่ปุ่นตอนพิเศษเป็นของขวัญ 🎁",
    "congratsBadge": "🎁 รางวัลบทเรียนที่ 3",
    "badge": "🎁 นิทานลับ",
    "title": "ปลดล็อกนิทานญี่ปุ่นสุดมหัศจรรย์!",
    "subtitle": "ตอบคำถามสั้นๆ เพียงไม่กี่ข้อเพื่อเปิดอ่านเรื่องราวในตำนาน “My Lord Bag of Rice” ทันที",
    "q1": "1. คุณชอบ English Breakfast แค่ไหน?",
    "starLabels": [
      "ไม่ดี",
      "พอใช้",
      "ดี",
      "ยอดเยี่ยม!",
      "ยอดเยี่ยมมาก!"
    ],
    "q2": "คุณชอบฟีเจอร์ใด?",
    "optQuiz": "แบบทดสอบ (Quiz)",
    "optFavorites": "คำศัพท์ที่บันทึกไว้",
    "optWidget": "วิดเจ็ตหน้าจอหลัก",
    "optScanner": "สแกนเนอร์ข้อความ",
    "submitBtn": "รับของขวัญ!",
    "posTitle": "ปลดล็อกนิทานแล้ว! 🎉",
    "posSub": "เราดีใจมากที่คุณชื่นชอบ English Breakfast! สละเวลาเพียง 5 วินาทีให้ 5 ดาวบน Google Play ได้ไหม?",
    "btnRate": "⭐ ให้ 5 ดาวบน Google Play",
    "negTitle": "ขอบคุณสำหรับความจริงใจ! 💖",
    "negSub": "ขอบคุณสำหรับความคิดเห็นที่จริงใจ! เราอยากทำให้ English Breakfast ดียิ่งขึ้นสำหรับคุณ",
    "negAsk": "เราควรปรับปรุงอะไรในแอปบ้าง?",
    "negPlaceholder": "บอกเราได้เลยว่าติดปัญหาตรงไหนหรืออยากให้มีฟังก์ชันอะไรเพิ่ม...",
    "negBtnSend": "✉️ ส่งข้อเสนอแนะ",
    "negSentToast": "ขอบคุณมาก! เราจะนำไปพิจารณาอย่างตั้งใจ ❤️",
    "btnClose": "เสร็จสิ้น"
  },
  "ko": {
    "congratsTitle": "축하합니다! 보너스 일본 전래동화를 받아가세요 🎁",
    "congratsBadge": "🎁 3번째 레슨 보상",
    "badge": "🎁 비밀 동화",
    "title": "마법 같은 일본 전래동화를 잠금 해제하세요!",
    "subtitle": "간단한 질문에 답하고 전설적인 이야기 “My Lord Bag of Rice”를 바로 열어보세요.",
    "q1": "1. English Breakfast는 어떠셨나요?",
    "starLabels": [
      "별로예요",
      "그저 그래요",
      "좋아요",
      "매우 좋아요!",
      "잘했어요!"
    ],
    "q2": "어떤 기능이 마음에 드셨나요?",
    "optQuiz": "퀴즈",
    "optFavorites": "즐겨찾기 단어",
    "optWidget": "홈 화면 위젯",
    "optScanner": "텍스트 스캐너",
    "submitBtn": "선물 받기!",
    "posTitle": "동화 잠금 해제 완료! 🎉",
    "posSub": "English Breakfast가 마음에 드셨다니 정말 기쁩니다! Google Play에서 별 5개 평점을 남겨주시는 데 5초만 내어주시겠어요?",
    "btnRate": "⭐ Google Play에서 별 5개 주기",
    "negTitle": "솔직한 의견 감사드립니다! 💖",
    "negSub": "솔직한 답변 감사드립니다! 더 유용한 English Breakfast를 만들기 위해 최선을 다하겠습니다.",
    "negAsk": "앱에서 어떤 점을 개선하면 좋을까요?",
    "negPlaceholder": "아쉬웠던 점이나 필요한 기능을 적어주세요...",
    "negBtnSend": "✉️ 의견 보내기",
    "negSentToast": "감사합니다! 소중한 의견 꼼꼼히 검토하겠습니다 ❤️",
    "btnClose": "완료"
  },
  "ja": {
    "congratsTitle": "おめでとうございます！特典の日本の昔話を受け取ろう 🎁",
    "congratsBadge": "🎁 レッスン3完了のご褒美",
    "badge": "🎁 秘密の昔話",
    "title": "魔法の日本の昔話をアンロックしよう！",
    "subtitle": "簡単な質問に答えて、伝説の物語「俵藤太（My Lord Bag of Rice）」を今すぐ読もう。",
    "q1": "1. English Breakfastの使い心地はいかがですか？",
    "starLabels": [
      "不満",
      "普通",
      "良い",
      "とても良い！",
      "よくできました！"
    ],
    "q2": "どの機能が気に入りましたか？",
    "optQuiz": "クイズ",
    "optFavorites": "お気に入り単語",
    "optWidget": "ホーム画面ウィジェット",
    "optScanner": "テキストスキャナー",
    "submitBtn": "プレゼントを受け取る！",
    "posTitle": "昔話がアンロックされました！ 🎉",
    "posSub": "English Breakfastを気に入っていただけて大変嬉しいです！Google Playで星5つの評価をいただくために5秒だけお時間をいただけますか？",
    "btnRate": "⭐ Google Playで星5つをつける",
    "negTitle": "率直なご意見ありがとうございます！ 💖",
    "negSub": "率直なご回答をありがとうございます！English Breakfastをより良いアプリへと改善してまいります。",
    "negAsk": "アプリのどの点を改善すれば良いでしょうか？",
    "negPlaceholder": "不満な点や追加してほしい機能をご記入ください...",
    "negBtnSend": "✉️ 意見を送信する",
    "negSentToast": "ありがとうございます！いただいたご意見を真摯に受け止めます ❤️",
    "btnClose": "完了"
  },
  "zh": {
    "congratsTitle": "恭喜！领取您的专属奖励日本神话故事 🎁",
    "congratsBadge": "🎁 第3课专属奖励",
    "badge": "🎁 隐藏童话",
    "title": "解锁神奇的日本古老传说！",
    "subtitle": "只需回答几个小问题，即可立刻解锁经典故事《俵藤太（My Lord Bag of Rice）》。",
    "q1": "1. 您觉得 English Breakfast 怎么样？",
    "starLabels": [
      "较差",
      "一般",
      "不错",
      "非常好！",
      "做得太棒了！"
    ],
    "q2": "您最喜欢哪个功能？",
    "optQuiz": "测验 (Quiz)",
    "optFavorites": "单词收藏夹",
    "optWidget": "桌面单词小组件",
    "optScanner": "文本扫描器",
    "submitBtn": "领取礼物！",
    "posTitle": "故事已成功解锁！ 🎉",
    "posSub": "很高兴您喜欢 English Breakfast！能请您花 5 秒钟在 Google Play 给我们留个 5 星好评吗？这对我们意义重大！",
    "btnRate": "⭐ 在 Google Play 给出 5 星好评",
    "negTitle": "感谢您的坦诚反馈！ 💖",
    "negSub": "非常感谢您的坦诚回答！我们希望将 English Breakfast 做得更好。",
    "negAsk": "您觉得应用还有哪些地方需要改进？",
    "negPlaceholder": "请写下您觉得不满意的地方，或您希望增加的功能...",
    "negBtnSend": "✉️ 发送改进建议",
    "negSentToast": "非常感谢！我们会认真研究您的每一条建议 ❤️",
    "btnClose": "完成"
  },
  "kk": {
    "congratsTitle": "Құттықтаймыз! Бонустық жапон ертегісін алыңыз 🎁",
    "congratsBadge": "🎁 3-сабақ сыйлығы",
    "badge": "🎁 Құпия ертегі",
    "title": "Сиқырлы жапон ертегісін ашыңыз!",
    "subtitle": "Аты аңызға айналған «My Lord Bag of Rice» (Тавара Тода) ертегісін ашу үшін бір-екі қысқа сұраққа жауап беріңіз.",
    "q1": "1. English Breakfast қолданбасы қалай ұнауда?",
    "starLabels": [
      "Нашар",
      "Орташа",
      "Жақсы",
      "Керемет!",
      "Жарайсыңдар!"
    ],
    "q2": "Сізге қай функция ұнады?",
    "optQuiz": "Викторина",
    "optFavorites": "Таңдаулы сөздер",
    "optWidget": "Басты экран виджеті",
    "optScanner": "Мәтін сканері",
    "submitBtn": "Сыйлықты алу!",
    "posTitle": "Ертегі ашылды! 🎉",
    "posSub": "English Breakfast сізге ұнағанына шексіз қуаныштымыз! Google Play-де бізге 5 жұлдыз қою үшін 5 секунд бөле аласыз ба?",
    "btnRate": "⭐ Google Play-де 5 жұлдыз беру",
    "negTitle": "Шынайылығыңызға рақмет! 💖",
    "negSub": "Шынайы жауабыңызға рақмет! English Breakfast қолданбасын сіз үшін одан әрі жетілдіргіміз келеді.",
    "negAsk": "Қолданбада нені жақсартуымыз керек?",
    "negPlaceholder": "Ненің дұрыс болмағанын немесе қандай мүмкіндік жетіспейтінін жазыңыз...",
    "negBtnSend": "✉️ Ұсынысты жіберу",
    "negSentToast": "Рақмет! Пікіріңізді мұқият оқып шығамыз ❤️",
    "btnClose": "Дайын"
  }
};

export function getFairyTaleStrings() {
  const lang = (typeof getInterfaceLanguage === 'function' ? getInterfaceLanguage() : 'en') || 'en';
  const cleanLang = String(lang).toLowerCase().trim().replace('_', '-');
  return FAIRY_TALE_SURVEY_TRANSLATIONS[cleanLang] || FAIRY_TALE_SURVEY_TRANSLATIONS[cleanLang.split('-')[0]] || FAIRY_TALE_SURVEY_TRANSLATIONS.en;
}

let isSurveyActive = false;

/**
 * Show the Gamified Fairy Tale Survey Modal
 * @param {string} triggerSource - 'story_tile' | 'lesson_summary' | 'drawer'
 */
export function showFairyTaleSurveyModal(triggerSource = 'story_tile') {
  if (isSurveyActive) return;

  const existing = document.querySelector('#fairy-tale-survey-overlay');
  if (existing) existing.remove();

  isSurveyActive = true;
  const strings = getFairyTaleStrings();
  const isAutoLesson = triggerSource === 'auto_lesson_3';
  const displayTitle = isAutoLesson && strings.congratsTitle ? strings.congratsTitle : strings.title;

  if (window.trackScreen) window.trackScreen('survey_fairy_tale_q1', 'FairyTaleSurveyModal');
  if (window.trackEvent) window.trackEvent('survey_fairy_tale_opened', { source: triggerSource });

  const overlay = document.createElement('div');
  overlay.id = 'fairy-tale-survey-overlay';
  overlay.className = 'fairy-tale-survey-overlay';

  let selectedStars = 5;
  const selectedFeatures = new Set();

  overlay.innerHTML = `
    <style>
      .fairy-tale-survey-overlay {
        position: fixed;
        inset: 0;
        z-index: 10060;
        background: rgba(15, 23, 42, 0.82);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px 16px max(36px, calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 20px));
        box-sizing: border-box;
        animation: ftsFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes ftsFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .fts-card {
        background: #1e293b;
        color: #f8fafc;
        border: 1.5px solid rgba(245, 158, 11, 0.4);
        box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.2);
        border-radius: 24px;
        width: 100%;
        max-width: 410px;
        max-height: calc(100dvh - max(48px, calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 32px)));
        max-height: calc(100vh - max(48px, calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 32px)));
        overflow-y: auto;
        padding: 22px 20px max(24px, calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 12px));
        box-sizing: border-box;
        text-align: center;
        position: relative;
        font-family: inherit;
        -webkit-overflow-scrolling: touch;
      }
      .fts-cover-wrap {
        width: 100%;
        height: 125px;
        border-radius: 16px;
        overflow: hidden;
        margin-top: 4px;
        margin-bottom: 14px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .fts-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .fts-title {
        font-size: 20px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 6px;
        line-height: 1.3;
      }
      .fts-subtitle {
        font-size: 13.5px;
        color: #94a3b8;
        line-height: 1.5;
        margin: 0 0 20px;
      }
      .fts-q-block {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 14px 14px 16px;
        margin-bottom: 14px;
        text-align: left;
      }
      .fts-q-title {
        font-size: 14px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0 0 10px;
      }
      .fts-stars-row {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 6px;
      }
      .fts-star-btn {
        background: none;
        border: none;
        font-size: 32px;
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.15s ease;
        padding: 2px;
        filter: grayscale(1) opacity(0.35);
      }
      .fts-star-btn.is-active {
        filter: grayscale(0) opacity(1);
        transform: scale(1.1);
      }
      .fts-star-label {
        font-size: 13px;
        font-weight: 700;
        color: #fbbf24;
        text-align: center;
        min-height: 18px;
      }
      .fts-chips-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .fts-chip-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 10px 8px;
        font-size: 12.5px;
        font-weight: 600;
        color: #cbd5e1;
        cursor: pointer;
        text-align: center;
        transition: all 0.15s ease;
      }
      .fts-chip-btn.is-selected {
        background: rgba(245, 158, 11, 0.18);
        border-color: #f59e0b;
        color: #fef08a;
        font-weight: 700;
      }
      .fts-btn-submit {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        border: none;
        border-radius: 16px;
        padding: 14px 20px;
        font-size: 16px;
        font-weight: 800;
        cursor: pointer;
        width: 100%;
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 8px;
        margin-bottom: 4px;
        transition: transform 0.12s ease, filter 0.12s ease, opacity 0.15s ease;
      }
      .fts-btn-submit:active {
        transform: scale(0.98);
      }
      .fts-btn-submit.is-disabled {
        opacity: 0.45;
        cursor: not-allowed;
        box-shadow: none;
        pointer-events: none;
      }
      .fts-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
        padding: 12px 20px;
        border-radius: 14px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
        transition: background 0.15s ease;
      }
      .fts-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
      }
      .fts-close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 10;
        width: 32px;
        height: 32px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        color: #94a3b8;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .fts-close-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
    </style>

    <div class="fts-card" id="fts-card">
      <button class="fts-close-btn" id="fts-close-survey" aria-label="Close">&times;</button>

      <div class="fts-cover-wrap">
        <img class="fts-cover-img" src="assets/images/my_lord_bag_of_rice.png" alt="My Lord Bag of Rice" onerror="this.src='assets/images/my_lord_bag_of_rice.webp'" />
      </div>

      <h2 class="fts-title">${displayTitle}</h2>
      <p class="fts-subtitle">${strings.subtitle}</p>

      <!-- Question 1: Rating -->
      <div class="fts-q-block">
        <div class="fts-q-title">${strings.q1}</div>
        <div class="fts-stars-row" id="fts-stars-row">
          <button type="button" class="fts-star-btn is-active" data-star="1">⭐</button>
          <button type="button" class="fts-star-btn is-active" data-star="2">⭐</button>
          <button type="button" class="fts-star-btn is-active" data-star="3">⭐</button>
          <button type="button" class="fts-star-btn is-active" data-star="4">⭐</button>
          <button type="button" class="fts-star-btn is-active" data-star="5">⭐</button>
        </div>
        <div class="fts-star-label" id="fts-star-label">${strings.starLabels[4] || ''}</div>
      </div>

      <!-- Question 2: Favorite feature -->
      <div class="fts-q-block">
        <div class="fts-q-title">${strings.q2}</div>
        <div class="fts-chips-grid">
          <button type="button" class="fts-chip-btn" data-feat="quiz" aria-pressed="false">${strings.optQuiz}</button>
          <button type="button" class="fts-chip-btn" data-feat="favorites" aria-pressed="false">${strings.optFavorites}</button>
          <button type="button" class="fts-chip-btn" data-feat="widget" aria-pressed="false">${strings.optWidget}</button>
          <button type="button" class="fts-chip-btn" data-feat="scanner" aria-pressed="false">${strings.optScanner}</button>
        </div>
      </div>

      <!-- Submit button -->
      <button class="fts-btn-submit is-disabled" id="fts-btn-submit" disabled aria-disabled="true">
        ${strings.submitBtn}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  function dismiss() {
    overlay.remove();
    isSurveyActive = false;
  }

  // Close X
  overlay.querySelector('#fts-close-survey')?.addEventListener('click', () => {
    if (window.trackEvent) window.trackEvent('survey_fairy_tale_dismissed');
    dismiss();
  });

  // Star handling
  const starBtns = overlay.querySelectorAll('.fts-star-btn');
  const starLabelEl = overlay.querySelector('#fts-star-label');

  function updateStars(rating) {
    selectedStars = rating;
    starBtns.forEach(btn => {
      const star = Number(btn.getAttribute('data-star'));
      if (star <= rating) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
    if (starLabelEl && strings.starLabels && strings.starLabels[rating - 1]) {
      starLabelEl.textContent = strings.starLabels[rating - 1];
    }
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const r = Number(btn.getAttribute('data-star')) || 5;
      updateStars(r);
    });
  });

  // Feature chips: multi-select (none selected initially)
  const submitBtn = overlay.querySelector('#fts-btn-submit');

  function updateSubmitState() {
    if (!submitBtn) return;
    const canSubmit = selectedFeatures.size > 0;
    if (canSubmit) {
      submitBtn.classList.remove('is-disabled');
      submitBtn.removeAttribute('disabled');
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.cursor = 'pointer';
    } else {
      submitBtn.classList.add('is-disabled');
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.style.opacity = '0.45';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.cursor = 'not-allowed';
    }
  }
  updateSubmitState();

  const featChips = overlay.querySelectorAll('.fts-chip-btn');
  featChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const feat = chip.getAttribute('data-feat');
      if (!feat) return;
      if (selectedFeatures.has(feat)) {
        selectedFeatures.delete(feat);
        chip.classList.remove('is-selected');
        chip.setAttribute('aria-pressed', 'false');
      } else {
        selectedFeatures.add(feat);
        chip.classList.add('is-selected');
        chip.setAttribute('aria-pressed', 'true');
      }
      updateSubmitState();
    });
  });

  // Submit action
  submitBtn?.addEventListener('click', () => {
    if (selectedFeatures.size === 0) return;
    const featureListStr = Array.from(selectedFeatures).join(',');

    // Record survey completion and unlock story 0
    localStorage.setItem('myduo_fairy_tale_survey_done', 'true');
    localStorage.setItem('myduo_survey_rating', String(selectedStars));
    localStorage.setItem('myduo_survey_feature', featureListStr);
    localStorage.setItem('myduo_story_0_unlocked', 'true');

    try {
      window.dispatchEvent(new CustomEvent('storyUnlocked', { detail: { storyId: 0 } }));
    } catch (e) {}

    if (window.trackEvent) {
      window.trackEvent('survey_fairy_tale_submitted', {
        rating: selectedStars,
        features: Array.from(selectedFeatures),
        feature: featureListStr
      });
    }

    try {
      submitSurveyFeedbackApi({
        rating: selectedStars,
        feature: featureListStr,
        text: ''
      });
    } catch (e) {}

    const card = overlay.querySelector('#fts-card');
    if (!card) return;

    if (selectedStars >= 4) {
      // Positive outcome: Rated 4 or 5 stars -> Offer Google Play 5-star review!
      if (window.trackScreen) window.trackScreen('survey_fairy_tale_success_positive', 'FairyTaleSurveyModal');

      card.innerHTML = `
        <button class="fts-close-btn" id="fts-close-done" aria-label="Close">&times;</button>
        <div style="font-size: 54px; margin: 12px 0 8px;">🎉</div>
        <h3 class="fts-title">${strings.posTitle}</h3>
        <p class="fts-subtitle" style="font-size: 14.5px; margin-bottom: 24px;">${strings.posSub}</p>

        <button class="fts-btn-submit" id="fts-rate-google" style="margin-bottom: 12px;">${strings.btnRate}</button>
        <button class="fts-btn-secondary" id="fts-btn-done-pos">${strings.btnClose}</button>
      `;

      card.querySelector('#fts-close-done')?.addEventListener('click', dismiss);

      card.querySelector('#fts-rate-google')?.addEventListener('click', () => {
        localStorage.setItem('myduo_review_completed', 'true');
        if (window.trackEvent) window.trackEvent('survey_google_play_opened');
        openGooglePlayStore();
        dismiss();
      });

      card.querySelector('#fts-btn-done-pos')?.addEventListener('click', dismiss);

    } else {
      // Neutral/Critical outcome: Rated 1-3 stars -> Ask what to improve with feedback form!
      if (window.trackScreen) window.trackScreen('survey_fairy_tale_success_feedback', 'FairyTaleSurveyModal');

      card.innerHTML = `
        <button class="fts-close-btn" id="fts-close-done" aria-label="Close">&times;</button>
        <div style="font-size: 54px; margin: 12px 0 8px;">💖</div>
        <h3 class="fts-title">${strings.negTitle}</h3>
        <p class="fts-subtitle" style="font-size: 14.5px; margin-bottom: 16px;">${strings.negSub}</p>

        <div class="fts-neg-feedback-box" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 14px; margin-bottom: 16px; text-align: left;">
          <div style="font-size: 13.5px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px;">${strings.negAsk}</div>
          <textarea id="fts-neg-input" rows="3" style="width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; color: #ffffff; padding: 10px; font-size: 13.5px; resize: none; font-family: inherit; line-height: 1.4;" placeholder="${strings.negPlaceholder}"></textarea>
          <button type="button" id="fts-btn-send-feedback" style="margin-top: 10px; width: 100%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; color: #ffffff; padding: 11px 14px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">${strings.negBtnSend}</button>
          <div id="fts-neg-toast" style="display: none; font-size: 12.5px; font-weight: 600; color: #86efac; text-align: center; margin-top: 8px;">${strings.negSentToast}</div>
        </div>

        <button class="fts-btn-secondary" id="fts-btn-done-neg">${strings.btnClose}</button>
      `;

      card.querySelector('#fts-close-done')?.addEventListener('click', dismiss);

      const feedbackInput = card.querySelector('#fts-neg-input');
      const sendBtn = card.querySelector('#fts-btn-send-feedback');
      const toastEl = card.querySelector('#fts-neg-toast');

      sendBtn?.addEventListener('click', () => {
        const text = feedbackInput ? feedbackInput.value.trim() : '';
        if (text) {
          localStorage.setItem('myduo_survey_feedback_text', text);
          if (window.trackEvent) {
            window.trackEvent('survey_neg_feedback_submitted', { text, rating: selectedStars });
          }
          try {
            submitSurveyFeedbackApi({
              rating: selectedStars,
              feature: Array.from(selectedFeatures).join(','),
              text: text
            });
          } catch (e) {}
        }
        if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.style.opacity = '0.6';
          sendBtn.textContent = '✓ ' + (strings.negSentToast.split('!')[0] || 'OK');
        }
        if (toastEl) toastEl.style.display = 'block';
      });

      card.querySelector('#fts-btn-done-neg')?.addEventListener('click', dismiss);
    }
  });
}
