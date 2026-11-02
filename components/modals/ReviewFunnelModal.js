import { handleFeedbackClick } from '../layout/AppLayout.js?v=386.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=386.0';

export const REVIEW_TRANSLATIONS = {
  en: {
    step1Title: 'Enjoying English Breakfast?',
    step1Sub: 'Your feedback helps us make the app better every single day.',
    step1Yes: '👍 Yes, I love it!',
    step1No: '👎 Not really',
    step1Later: 'Ask me later',
    step2PosTitle: 'Thank you so much! 💖',
    step2PosSub: 'Would you take 5 seconds to rate us 5 stars on Google Play? It really helps our indie project grow!',
    step2PosRate: '⭐ Rate on Google Play',
    step2PosDone: 'Done',
    step2NegTitle: 'Help us improve 💬',
    step2NegSub: 'What can we do better? Tell us directly — we read every single message and fix issues fast.',
    step2NegFeedback: '✉️ Send feedback',
    step2NegClose: 'Close'
  },
  ru: {
    step1Title: 'Вам нравится English Breakfast?',
    step1Sub: 'Ваша поддержка и отзывы помогают нам становиться лучше каждый день.',
    step1Yes: '👍 Да, очень нравится!',
    step1No: '👎 Не очень / Есть замечания',
    step1Later: 'Спросить позже',
    step2PosTitle: 'Спасибо от всей души! 💖',
    step2PosSub: 'Пожалуйста, поставьте нам 5 звёзд в Google Play. Это займет всего 5 секунд и поможет проекту развиваться!',
    step2PosRate: '⭐ Оценить в Google Play',
    step2PosDone: 'Готово',
    step2NegTitle: 'Помогите нам стать лучше 💬',
    step2NegSub: 'Что пошло не так или чего вам не хватает? Напишите нам напрямую — мы читаем каждое сообщение.',
    step2NegFeedback: '✉️ Написать разработчику',
    step2NegClose: 'Закрыть'
  },
  uk: {
    step1Title: 'Вам подобається English Breakfast?',
    step1Sub: 'Ваша підтримка та відгуки допомагають нам ставати кращими щодня.',
    step1Yes: '👍 Так, дуже подобається!',
    step1No: '👎 Не дуже / Є зауваження',
    step1Later: 'Запитати пізніше',
    step2PosTitle: 'Щиро дякуємо! 💖',
    step2PosSub: 'Будь ласка, поставте нам 5 зірок у Google Play. Це займе лише 5 секунд і допоможе проєкту розвиватися!',
    step2PosRate: '⭐ Оцінити в Google Play',
    step2PosDone: 'Готово',
    step2NegTitle: 'Допоможіть нам стати кращими 💬',
    step2NegSub: 'Що пішло не так або чого вам бракує? Напишіть нам напряму — ми читаємо кожне повідомлення.',
    step2NegFeedback: '✉️ Написати розробнику',
    step2NegClose: 'Закрити'
  },
  de: {
    step1Title: 'Gefällt dir English Breakfast?',
    step1Sub: 'Dein Feedback hilft uns, die App jeden Tag zu verbessern.',
    step1Yes: '👍 Ja, sehr!',
    step1No: '👎 Nicht wirklich',
    step1Later: 'Später fragen',
    step2PosTitle: 'Vielen Dank! 💖',
    step2PosSub: 'Würdest du dir 5 Sekunden Zeit nehmen, um uns 5 Sterne bei Google Play zu geben? Das hilft uns enorm!',
    step2PosRate: '⭐ Bei Google Play bewerten',
    step2PosDone: 'Fertig',
    step2NegTitle: 'Hilf uns, besser zu werden 💬',
    step2NegSub: 'Was können wir verbessern? Schreib uns direkt — wir lesen jede Nachricht.',
    step2NegFeedback: '✉️ Feedback senden',
    step2NegClose: 'Schließen'
  },
  es: {
    step1Title: '¿Te gusta English Breakfast?',
    step1Sub: 'Tus comentarios nos ayudan a mejorar la aplicación cada día.',
    step1Yes: '👍 ¡Sí, me encanta!',
    step1No: '👎 No mucho',
    step1Later: 'Preguntar más tarde',
    step2PosTitle: '¡Muchas gracias! 💖',
    step2PosSub: '¿Podrías tomarnos 5 segundos para calificarnos con 5 estrellas en Google Play? ¡Nos ayuda muchísimo!',
    step2PosRate: '⭐ Calificar en Google Play',
    step2PosDone: 'Listo',
    step2NegTitle: 'Ayúdanos a mejorar 💬',
    step2NegSub: '¿Qué podemos mejorar? Escríbenos directamente: leemos todos los mensajes.',
    step2NegFeedback: '✉️ Enviar comentarios',
    step2NegClose: 'Cerrar'
  },
  'es-mx': {
    step1Title: '¿Te gusta English Breakfast?',
    step1Sub: 'Tus comentarios nos ayudan a mejorar la app todos los días.',
    step1Yes: '👍 ¡Sí, me encanta!',
    step1No: '👎 No mucho',
    step1Later: 'Más tarde',
    step2PosTitle: '¡Muchísimas gracias! 💖',
    step2PosSub: '¿Nos regalas 5 segundos para calificarnos con 5 estrellas en Google Play? ¡Ayuda un montón al proyecto!',
    step2PosRate: '⭐ Calificar en Google Play',
    step2PosDone: 'Listo',
    step2NegTitle: 'Ayúdanos a mejorar 💬',
    step2NegSub: '¿Qué podemos hacer mejor? Escríbenos directo, leemos cada mensaje.',
    step2NegFeedback: '✉️ Enviar opinión',
    step2NegClose: 'Cerrar'
  },
  fr: {
    step1Title: 'Vous aimez English Breakfast ?',
    step1Sub: 'Vos retours nous aident à améliorer l’application chaque jour.',
    step1Yes: '👍 Oui, j’adore !',
    step1No: '👎 Pas vraiment',
    step1Later: 'Plus tard',
    step2PosTitle: 'Merci beaucoup ! 💖',
    step2PosSub: 'Pourriez-vous prendre 5 secondes pour nous donner 5 étoiles sur Google Play ? Cela aide énormément !',
    step2PosRate: '⭐ Noter sur Google Play',
    step2PosDone: 'Terminé',
    step2NegTitle: 'Aidez-nous à nous améliorer 💬',
    step2NegSub: 'Que pouvons-nous améliorer ? Écrivez-nous directement, nous lisons chaque message.',
    step2NegFeedback: '✉️ Envoyer un message',
    step2NegClose: 'Fermer'
  },
  pl: {
    step1Title: 'Podoba Ci się English Breakfast?',
    step1Sub: 'Twoja opinia pomaga nam ulepszać aplikację każdego dnia.',
    step1Yes: '👍 Tak, uwielbiam!',
    step1No: '👎 Niezbyt',
    step1Later: 'Zapytaj później',
    step2PosTitle: 'Bardzo dziękujemy! 💖',
    step2PosSub: 'Czy poświęcisz 5 sekund na wystawienie 5 gwiazdek w Google Play? To bardzo pomaga!',
    step2PosRate: '⭐ Oceń w Google Play',
    step2PosDone: 'Gotowe',
    step2NegTitle: 'Pomóż nam ulepszyć aplikację 💬',
    step2NegSub: 'Co poszło nie tak? Napisz do nas bezpośrednio — czytamy każdą wiadomość.',
    step2NegFeedback: '✉️ Wyślij opinię',
    step2NegClose: 'Zamknij'
  },
  tr: {
    step1Title: 'English Breakfast uygulamasını sevdiniz mi?',
    step1Sub: 'Geri bildiriminiz uygulamayı her gün daha iyi yapmamıza yardımcı oluyor.',
    step1Yes: '👍 Evet, çok beğendim!',
    step1No: '👎 Pek değil',
    step1Later: 'Daha sonra sor',
    step2PosTitle: 'Çok teşekkür ederiz! 💖',
    step2PosSub: 'Google Play’de bize 5 yıldız vermek için 5 saniyenizi ayırır mısınız? Projemize çok büyük destek olur!',
    step2PosRate: '⭐ Google Play’de Değerlendir',
    step2PosDone: 'Tamam',
    step2NegTitle: 'Daha iyi olmamıza yardım edin 💬',
    step2NegSub: 'Neyi geliştirebiliriz? Bize doğrudan yazın, her mesajı okuyoruz.',
    step2NegFeedback: '✉️ Geri Bildirim Gönder',
    step2NegClose: 'Kapat'
  },
  it: {
    step1Title: 'Ti piace English Breakfast?',
    step1Sub: 'Il tuo feedback ci aiuta a migliorare l’app ogni giorno.',
    step1Yes: '👍 Sì, molto!',
    step1No: '👎 Non proprio',
    step1Later: 'Chiedi più tardi',
    step2PosTitle: 'Grazie di cuore! 💖',
    step2PosSub: 'Ti andrebbe di dedicarci 5 secondi per darci 5 stelle su Google Play? Ci aiuta tantissimo!',
    step2PosRate: '⭐ Valuta su Google Play',
    step2PosDone: 'Fatto',
    step2NegTitle: 'Aiutaci a migliorare 💬',
    step2NegSub: 'Cosa possiamo fare meglio? Scrivici direttamente, leggiamo ogni messaggio.',
    step2NegFeedback: '✉️ Invia feedback',
    step2NegClose: 'Chiudi'
  },
  ro: {
    step1Title: 'Îți place English Breakfast?',
    step1Sub: 'Părerea ta ne ajută să îmbunătățim aplicația în fiecare zi.',
    step1Yes: '👍 Da, foarte mult!',
    step1No: '👎 Nu chiar',
    step1Later: 'Întreabă-mă mai târziu',
    step2PosTitle: 'Îți mulțumim din suflet! 💖',
    step2PosSub: 'Ne ajuți cu 5 stele pe Google Play? Durează doar 5 secunde și ne ajută enorm!',
    step2PosRate: '⭐ Evaluează pe Google Play',
    step2PosDone: 'Gata',
    step2NegTitle: 'Ajută-ne să fim mai buni 💬',
    step2NegSub: 'Ce putem îmbunătăți? Scrie-ne direct, citim fiecare mesaj.',
    step2NegFeedback: '✉️ Trimite feedback',
    step2NegClose: 'Închide'
  },
  bg: {
    step1Title: 'Харесва ли ви English Breakfast?',
    step1Sub: 'Вашите отзиви ни помагат да подобряваме приложението всеки ден.',
    step1Yes: '👍 Да, много!',
    step1No: '👎 Не особено',
    step1Later: 'Попитай по-късно',
    step2PosTitle: 'Сърдечно благодарим! 💖',
    step2PosSub: 'Бихте ли отделили 5 секунди, за да ни оцените с 5 звезди в Google Play? Това помага много!',
    step2PosRate: '⭐ Оцени в Google Play',
    step2PosDone: 'Готово',
    step2NegTitle: 'Помогнете ни да станем по-добри 💬',
    step2NegSub: 'Какво можем да подобрим? Пишете ни директно — четем всяко съобщение.',
    step2NegFeedback: '✉️ Изпрати отзив',
    step2NegClose: 'Затвори'
  },
  hu: {
    step1Title: 'Tetszik az English Breakfast?',
    step1Sub: 'A visszajelzésed segít nekünk minden nap jobbá tenni az alkalmazást.',
    step1Yes: '👍 Igen, nagyon!',
    step1No: '👎 Nem igazán',
    step1Later: 'Kérdezd később',
    step2PosTitle: 'Nagyon köszönjük! 💖',
    step2PosSub: 'Szánnál 5 másodpercet arra, hogy 5 csillagra értékelsz minket a Google Playen? Hatalmas segítség!',
    step2PosRate: '⭐ Értékelés a Google Playen',
    step2PosDone: 'Kész',
    step2NegTitle: 'Segíts jobbá válnunk 💬',
    step2NegSub: 'Mit javíthatnánk? Írj nekünk közvetlenül — minden üzenetet elolvasunk.',
    step2NegFeedback: '✉️ Visszajelzés küldése',
    step2NegClose: 'Bezárás'
  },
  el: {
    step1Title: 'Σας αρέσει το English Breakfast;',
    step1Sub: 'Τα σχόλιά σας μας βοηθούν να βελτιώνουμε την εφαρμογή καθημερινά.',
    step1Yes: '👍 Ναι, πάρα πολύ!',
    step1No: '👎 Όχι ιδιαίτερα',
    step1Later: 'Ρώτησε αργότερα',
    step2PosTitle: 'Σας ευχαριστούμε θερμά! 💖',
    step2PosSub: 'Θα αφιερώνατε 5 δευτερόλεπτα για να μας αξιολογήσετε με 5 αστέρια στο Google Play; Μας βοηθάει απίστευτα!',
    step2PosRate: '⭐ Αξιολόγηση στο Google Play',
    step2PosDone: 'Έτοιμο',
    step2NegTitle: 'Βοηθήστε μας να γίνουμε καλύτεροι 💬',
    step2NegSub: 'Τι μπορούμε να βελτιώσουμε; Γράψτε μας απευθείας — διαβάζουμε κάθε μήνυμα.',
    step2NegFeedback: '✉️ Αποστολή σχολίων',
    step2NegClose: 'Κλείσιμο'
  },
  da: {
    step1Title: 'Kan du lide English Breakfast?',
    step1Sub: 'Din feedback hjælper os med at gøre appen bedre hver evig eneste dag.',
    step1Yes: '👍 Ja, jeg er vild med det!',
    step1No: '👎 Ikke rigtigt',
    step1Later: 'Spørg mig senere',
    step2PosTitle: 'Tusind tak! 💖',
    step2PosSub: 'Vil du bruge 5 sekunder på at give os 5 stjerner på Google Play? Det gør en kæmpe forskel!',
    step2PosRate: '⭐ Bedøm på Google Play',
    step2PosDone: 'Færdig',
    step2NegTitle: 'Hjælp os med at blive bedre 💬',
    step2NegSub: 'Hvad kan vi forbedre? Skriv direkte til os — vi læser alle beskeder.',
    step2NegFeedback: '✉️ Send feedback',
    step2NegClose: 'Luk'
  },
  lv: {
    step1Title: 'Vai jums patīk English Breakfast?',
    step1Sub: 'Jūsu atsauksmes palīdz mums padarīt lietotni labāku katru dienu.',
    step1Yes: '👍 Jā, ļoti!',
    step1No: '👎 Ne visai',
    step1Later: 'Pajautāt vēlāk',
    step2PosTitle: 'Liels paldies! 💖',
    step2PosSub: 'Vai veltīsiet 5 sekundes, lai novērtētu mūs ar 5 zvaigznēm pakalpojumā Google Play? Tas mums ļoti palīdz!',
    step2PosRate: '⭐ Novērtēt pakalpojumā Google Play',
    step2PosDone: 'Gatavs',
    step2NegTitle: 'Palīdziet mums kļūt labākiem 💬',
    step2NegSub: 'Ko mēs varam uzlabot? Rakstiet mums tieši — mēs izlasām katru ziņu.',
    step2NegFeedback: '✉️ Sūtīt atsauksmi',
    step2NegClose: 'Aizvērt'
  },
  lt: {
    step1Title: 'Ar patinka English Breakfast?',
    step1Sub: 'Jūsų atsiliepimai padeda mums tobulinti programėlę kiekvieną dieną.',
    step1Yes: '👍 Taip, labai!',
    step1No: '👎 Nelabai',
    step1Later: 'Klausti vėliau',
    step2PosTitle: 'Nuoširdžiai ačiū! 💖',
    step2PosSub: 'Ar skirtumėte 5 sekundes įvertinti mus 5 žvaigždutėmis „Google Play“? Tai labai padeda projektui!',
    step2PosRate: '⭐ Įvertinti „Google Play“',
    step2PosDone: 'Atlikta',
    step2NegTitle: 'Padėkite mums tobulėti 💬',
    step2NegSub: 'Ką galėtume pagerinti? Parašykite mums tiesiogiai — perskaitome kiekvieną žinutę.',
    step2NegFeedback: '✉️ Siųsti atsiliepimą',
    step2NegClose: 'Uždaryti'
  },
  pt: {
    step1Title: 'Está a gostar do English Breakfast?',
    step1Sub: 'O seu feedback ajuda-nos a melhorar a aplicação todos os dias.',
    step1Yes: '👍 Sim, adoro!',
    step1No: '👎 Nem por isso',
    step1Later: 'Mais tarde',
    step2PosTitle: 'Muito obrigado! 💖',
    step2PosSub: 'Poderia dedicar 5 segundos para nos avaliar com 5 estrelas no Google Play? Ajuda imenso!',
    step2PosRate: '⭐ Avaliar no Google Play',
    step2PosDone: 'Concluído',
    step2NegTitle: 'Ajude-nos a melhorar 💬',
    step2NegSub: 'O que podemos melhorar? Escreva-nos diretamente — lemos todas as mensagens.',
    step2NegFeedback: '✉️ Enviar feedback',
    step2NegClose: 'Fechar'
  },
  'pt-br': {
    step1Title: 'Curtindo o English Breakfast?',
    step1Sub: 'Sua opinião nos ajuda a evoluir o app todos os dias.',
    step1Yes: '👍 Sim, estou adorando!',
    step1No: '👎 Não muito',
    step1Later: 'Lembrar mais tarde',
    step2PosTitle: 'Muito obrigado de coração! 💖',
    step2PosSub: 'Você poderia dedicar 5 segundos para avaliar com 5 estrelas no Google Play? Ajuda muito nosso projeto!',
    step2PosRate: '⭐ Avaliar no Google Play',
    step2PosDone: 'Pronto',
    step2NegTitle: 'Ajude-nos a melhorar 💬',
    step2NegSub: 'O que podemos melhorar? Mande uma mensagem direta — lemos todas com atenção.',
    step2NegFeedback: '✉️ Enviar sugestão',
    step2NegClose: 'Fechar'
  },
  sk: {
    step1Title: 'Páči sa vám English Breakfast?',
    step1Sub: 'Vaša spätná väzba nám pomáha zlepšovať aplikáciu každý deň.',
    step1Yes: '👍 Áno, veľmi!',
    step1No: '👎 Ani nie',
    step1Later: 'Opýtať sa neskôr',
    step2PosTitle: 'Veľmi pekne ďakujeme! 💖',
    step2PosSub: 'Venovali by ste nám 5 sekúnd a ohodnotili nás 5 hviezdičkami v Google Play? Nesmierne to pomáha!',
    step2PosRate: '⭐ Ohodnotiť v Google Play',
    step2PosDone: 'Hotovo',
    step2NegTitle: 'Pomôžte nám zlepšiť sa 💬',
    step2NegSub: 'Čo môžeme zlepšiť? Napíšte nám priamo — čítame každú správu.',
    step2NegFeedback: '✉️ Odoslať spätnú väzbu',
    step2NegClose: 'Zavrieť'
  },
  sl: {
    step1Title: 'Vam je všeč English Breakfast?',
    step1Sub: 'Vaše povratne informacije nam pomagajo izboljšati aplikacijo vsak dan.',
    step1Yes: '👍 Da, zelo!',
    step1No: '👎 Niti ne',
    step1Later: 'Vprašaj pozneje',
    step2PosTitle: 'Iskrena hvala! 💖',
    step2PosSub: 'Bi si vzeli 5 sekund in nas ocenili s 5 zvezdicami v Google Play? To nam res ogromno pomeni!',
    step2PosRate: '⭐ Oceni v Google Play',
    step2PosDone: 'Končano',
    step2NegTitle: 'Pomagajte nam postati boljši 💬',
    step2NegSub: 'Kaj lahko izboljšamo? Pišite nam neposredno — preberemo vsako sporočilo.',
    step2NegFeedback: '✉️ Pošlji povratne informacije',
    step2NegClose: 'Zapri'
  },
  fi: {
    step1Title: 'Pidätkö English Breakfastista?',
    step1Sub: 'Palautteesi auttaa meitä tekemään sovelluksesta paremman joka päivä.',
    step1Yes: '👍 Kyllä, todella paljon!',
    step1No: '👎 En oikeastaan',
    step1Later: 'Kysy myöhemmin',
    step2PosTitle: 'Lämmin kiitos! 💖',
    step2PosSub: 'Voisitko käyttää 5 sekuntia ja antaa meille 5 tähteä Google Playssa? Se auttaa projektiamme suuresti!',
    step2PosRate: '⭐ Arvostele Google Playssa',
    step2PosDone: 'Valmis',
    step2NegTitle: 'Auta meitä parantamaan 💬',
    step2NegSub: 'Mitä voisimme tehdä paremmin? Kirjoita meille suoraan — luemme jokaisen viestin.',
    step2NegFeedback: '✉️ Lähetä palautetta',
    step2NegClose: 'Sulje'
  },
  hr: {
    step1Title: 'Sviđa li vam se English Breakfast?',
    step1Sub: 'Vaše povratne informacije pomažu nam poboljšati aplikaciju svaki dan.',
    step1Yes: '👍 Da, jako mi se sviđa!',
    step1No: '👎 Ne baš',
    step1Later: 'Pitaj kasnije',
    step2PosTitle: 'Hvala od srca! 💖',
    step2PosSub: 'Biste li odvojili 5 sekundi i ocijenili nas s 5 zvjezdica na Google Playu? To nam iznimno puno znači!',
    step2PosRate: '⭐ Ocijeni na Google Playu',
    step2PosDone: 'Gotovo',
    step2NegTitle: 'Pomozite nam da budemo bolji 💬',
    step2NegSub: 'Što možemo poboljšati? Pišite nam izravno — čitamo svaku poruku.',
    step2NegFeedback: '✉️ Pošalji povratne informacije',
    step2NegClose: 'Zatvori'
  },
  cs: {
    step1Title: 'Líbí se vám English Breakfast?',
    step1Sub: 'Vaše zpětná vazba nám pomáhá aplikaci každým dnem vylepšovat.',
    step1Yes: '👍 Ano, moc se mi líbí!',
    step1No: '👎 Ani ne',
    step1Later: 'Zeptat se později',
    step2PosTitle: 'Moc děkujeme! 💖',
    step2PosSub: 'Věnujete nám 5 vteřin a ohodnotíte nás 5 hvězdičkami na Google Play? Hrozně moc to pomáhá!',
    step2PosRate: '⭐ Ohodnotit na Google Play',
    step2PosDone: 'Hotovo',
    step2NegTitle: 'Pomozte nám se zlepšit 💬',
    step2NegSub: 'Co můžeme udělat lépe? Napište nám přímo — čteme každou zprávu.',
    step2NegFeedback: '✉️ Napsat vývojáři',
    step2NegClose: 'Zavřít'
  },
  sv: {
    step1Title: 'Gillar du English Breakfast?',
    step1Sub: 'Din feedback hjälper oss att förbättra appen varje dag.',
    step1Yes: '👍 Ja, jättemycket!',
    step1No: '👎 Inte direkt',
    step1Later: 'Fråga senare',
    step2PosTitle: 'Varmt tack! 💖',
    step2PosSub: 'Skulle du vilja ta 5 sekunder och ge oss 5 stjärnor på Google Play? Det hjälper oss otroligt mycket!',
    step2PosRate: '⭐ Betygsätt på Google Play',
    step2PosDone: 'Klart',
    step2NegTitle: 'Hjälp oss bli bättre 💬',
    step2NegSub: 'Vad kan vi göra bättre? Skriv direkt till oss — vi läser alla meddelanden.',
    step2NegFeedback: '✉️ Skicka feedback',
    step2NegClose: 'Stäng'
  },
  et: {
    step1Title: 'Kas sulle meeldib English Breakfast?',
    step1Sub: 'Sinu tagasiside aitab meil rakendust iga päev paremaks muuta.',
    step1Yes: '👍 Jah, väga!',
    step1No: '👎 Mitte eriti',
    step1Later: 'Küsi hiljem',
    step2PosTitle: 'Suur aitäh! 💖',
    step2PosSub: 'Kas võtaksid 5 sekundit, et anda meile Google Plays 5 tärni? See aitab meid tohutult!',
    step2PosRate: '⭐ Hinda Google Plays',
    step2PosDone: 'Valmis',
    step2NegTitle: 'Aita meil paremaks saada 💬',
    step2NegSub: 'Mida saaksime parandada? Kirjuta meile otse — loeme iga kirja.',
    step2NegFeedback: '✉️ Saada tagasisidet',
    step2NegClose: 'Sulge'
  },
  hi: {
    step1Title: 'क्या आपको English Breakfast पसंद आ रहा है?',
    step1Sub: 'आपकी राय हमें ऐप को हर दिन बेहतर बनाने में मदद करती है।',
    step1Yes: '👍 हाँ, बहुत पसंद आया!',
    step1No: '👎 ज़्यादा नहीं',
    step1Later: 'बाद में पूछें',
    step2PosTitle: 'तहे दिल से धन्यवाद! 💖',
    step2PosSub: 'क्या आप Google Play पर हमें 5 स्टार देने के लिए 5 सेकंड निकाल सकते हैं? इससे हमारे प्रोजेक्ट को बहुत मदद मिलती है!',
    step2PosRate: '⭐ Google Play पर रेटिंग दें',
    step2PosDone: 'हो गया',
    step2NegTitle: 'हमें बेहतर बनने में मदद करें 💬',
    step2NegSub: 'हम क्या बेहतर कर सकते हैं? हमें सीधे लिखें — हम हर संदेश पढ़ते हैं।',
    step2NegFeedback: '✉️ सुझाव भेजें',
    step2NegClose: 'बंद करें'
  },
  bn: {
    step1Title: 'English Breakfast কেমন লাগছে?',
    step1Sub: 'আপনার মতামত অ্যাপটিকে প্রতিদিন আরও উন্নত করতে সাহায্য করে।',
    step1Yes: '👍 হ্যাঁ, দারুণ লাগছে!',
    step1No: '👎 খুব একটা না',
    step1Later: 'পরে জিজ্ঞাসা করুন',
    step2PosTitle: 'অসংখ্য ধন্যবাদ! 💖',
    step2PosSub: 'Google Play-তে ৫ স্টার রেটিং দিতে ৫ সেকেন্ড সময় দেবেন? এটি আমাদের প্রজেক্টের জন্য অনেক বড় সাহায্য!',
    step2PosRate: '⭐ Google Play-তে রেটিং দিন',
    step2PosDone: 'সম্পন্ন',
    step2NegTitle: 'আমাদের আরও উন্নত হতে সাহায্য করুন 💬',
    step2NegSub: 'কীভাবে আরও ভালো করা যায়? সরাসরি আমাদের লিখে জানান — আমরা প্রতিটি মেসেজ গুরুত্বের সাথে পড়ি।',
    step2NegFeedback: '✉️ মতামত পাঠান',
    step2NegClose: 'বন্ধ করুন'
  },
  ar: {
    step1Title: 'هل يعجبك English Breakfast؟',
    step1Sub: 'ملاحظاتك تساعدنا على تحسين التطبيق كل يوم.',
    step1Yes: '👍 نعم، يعجبني جداً!',
    step1No: '👎 ليس تماماً',
    step1Later: 'اسألني لاحقاً',
    step2PosTitle: 'شكراً جزيلاً من القلب! 💖',
    step2PosSub: 'هل يمكنك تخصيص 5 ثوانٍ لتقييمنا بـ 5 نجوم على Google Play؟ هذا يدعم مشروعنا كثيراً!',
    step2PosRate: '⭐ التقييم على Google Play',
    step2PosDone: 'تم',
    step2NegTitle: 'ساعدنا لنصبح أفضل 💬',
    step2NegSub: 'ما الذي يمكننا تحسينه؟ راسلنا مباشرةً — نحن نقرأ كل رسالة.',
    step2NegFeedback: '✉️ إرسال ملاحظات',
    step2NegClose: 'إغلاق'
  },
  fa: {
    step1Title: 'آیا از English Breakfast راضی هستید؟',
    step1Sub: 'نظرات شما به ما کمک می‌کند هر روز برنامه را بهتر کنیم.',
    step1Yes: '👍 بله، عالی است!',
    step1No: '👎 نه چندان',
    step1Later: 'بعداً بپرس',
    step2PosTitle: 'خیلی ممنون از همراهی شما! 💖',
    step2PosSub: 'آیا ۵ ثانیه وقت دارید که در Google Play به ما ۵ ستاره بدهید؟ این کمک بزرگی به رشد ماست!',
    step2PosRate: '⭐ ثبت امتیاز در Google Play',
    step2PosDone: 'انجام شد',
    step2NegTitle: 'کمک کنید بهتر شویم 💬',
    step2NegSub: 'چه چیزی را می‌توانیم بهتر کنیم؟ مستقیم به ما پیام دهید — همه پیام‌ها را با دقت می‌خوانیم.',
    step2NegFeedback: '✉️ ارسال نظر',
    step2NegClose: 'بستن'
  },
  ur: {
    step1Title: 'کیا آپ کو English Breakfast پسند آ رہا ہے؟',
    step1Sub: 'آپ کی رائے ایپ کو ہر روز بہتر بنانے میں ہماری مدد کرتی ہے۔',
    step1Yes: '👍 جی ہاں، بہت زبردست!',
    step1No: '👎 زیادہ نہیں',
    step1Later: 'بعد میں پوچھیں',
    step2PosTitle: 'تہہ دل سے شکریہ! 💖',
    step2PosSub: 'کیا آپ Google Play پر ہمیں 5 اسٹار دینے کے لیے 5 سیکنڈ نکال سکتے ہیں؟ یہ ہماری بہت بڑی مدد ہوگی!',
    step2PosRate: '⭐ Google Play پر ریٹنگ دیں',
    step2PosDone: 'مکمل',
    step2NegTitle: 'ہمیں بہتر بنانے میں مدد کریں 💬',
    step2NegSub: 'ہم کیا بہتر کر سکتے ہیں؟ براہِ راست بتائیں — ہم ہر پیغام پڑھتے ہیں۔',
    step2NegFeedback: '✉️ فیڈ بیک بھیجیں',
    step2NegClose: 'بند کریں'
  },
  id: {
    step1Title: 'Menikmati English Breakfast?',
    step1Sub: 'Masukan Anda membantu kami membuat aplikasi lebih baik setiap hari.',
    step1Yes: '👍 Ya, saya sangat suka!',
    step1No: '👎 Kurang suka',
    step1Later: 'Tanya nanti',
    step2PosTitle: 'Terima kasih banyak! 💖',
    step2PosSub: 'Maukah Anda meluangkan waktu 5 detik untuk memberi kami bintang 5 di Google Play? Ini sangat membantu kami berkembang!',
    step2PosRate: '⭐ Beri Rating di Google Play',
    step2PosDone: 'Selesai',
    step2NegTitle: 'Bantu kami menjadi lebih baik 💬',
    step2NegSub: 'Apa yang bisa kami tingkatkan? Tulis langsung kepada kami — kami membaca setiap masukan.',
    step2NegFeedback: '✉️ Kirim Masukan',
    step2NegClose: 'Tutup'
  },
  vi: {
    step1Title: 'Bạn có thích English Breakfast không?',
    step1Sub: 'Ý kiến của bạn giúp chúng tôi cải thiện ứng dụng mỗi ngày.',
    step1Yes: '👍 Có, rất tuyệt vời!',
    step1No: '👎 Chưa hài lòng lắm',
    step1Later: 'Hỏi lại sau',
    step2PosTitle: 'Cảm ơn bạn rất nhiều! 💖',
    step2PosSub: 'Bạn có thể dành 5 giây để đánh giá 5 sao trên Google Play không? Điều này giúp đỡ chúng tôi rất nhiều!',
    step2PosRate: '⭐ Đánh giá trên Google Play',
    step2PosDone: 'Xong',
    step2NegTitle: 'Giúp chúng tôi hoàn thiện hơn 💬',
    step2NegSub: 'Chúng tôi có thể cải thiện điều gì? Hãy nhắn tin trực tiếp — chúng tôi luôn lắng nghe mọi góp ý.',
    step2NegFeedback: '✉️ Gửi phản hồi',
    step2NegClose: 'Đóng'
  },
  th: {
    step1Title: 'คุณชอบ English Breakfast ไหม?',
    step1Sub: 'ความคิดเห็นของคุณช่วยให้เราพัฒนาแอปให้ดียิ่งขึ้นทุกวัน',
    step1Yes: '👍 ใช่ ชอบมาก!',
    step1No: '👎 ยังไม่ค่อยโดนใจ',
    step1Later: 'ถามภายหลัง',
    step2PosTitle: 'ขอบคุณมาก ๆ จากใจ! 💖',
    step2PosSub: 'คุณช่วยสละเวลา 5 วินาทีให้ 5 ดาวเราบน Google Play ได้ไหม? มันช่วยสนับสนุนเราได้อย่างมหาศาล!',
    step2PosRate: '⭐ ให้คะแนนบน Google Play',
    step2PosDone: 'เสร็จสิ้น',
    step2NegTitle: 'ช่วยเราพัฒนาให้ดียิ่งขึ้น 💬',
    step2NegSub: 'เราสามารถปรับปรุงอะไรได้บ้าง? ส่งข้อความถึงเราโดยตรง เราอ่านทุกความคิดเห็น',
    step2NegFeedback: '✉️ ส่งข้อเสนอแนะ',
    step2NegClose: 'ปิด'
  },
  ko: {
    step1Title: 'English Breakfast가 마음에 드시나요?',
    step1Sub: '여러분의 소중한 피드백은 앱을 매일 더 발전시키는 원동력이 됩니다.',
    step1Yes: '👍 네, 정말 좋아요!',
    step1No: '👎 별로예요',
    step1Later: '나중에 묻기',
    step2PosTitle: '진심으로 감사드립니다! 💖',
    step2PosSub: 'Google Play에서 별 5개 평점을 남겨주시는 데 5초만 내어주시겠어요? 큰 힘이 됩니다!',
    step2PosRate: '⭐ Google Play에서 평가하기',
    step2PosDone: '완료',
    step2NegTitle: '더 나은 앱을 만들 수 있게 도와주세요 💬',
    step2NegSub: '어떤 점을 개선하면 좋을까요? 직접 의견을 보내주시면 빠르게 반영하겠습니다.',
    step2NegFeedback: '✉️ 피드백 보내기',
    step2NegClose: '닫기'
  },
  ja: {
    step1Title: 'English Breakfastを気に入っていただけましたか？',
    step1Sub: '皆様のご意見が、アプリを毎日より良くする大きな力になります。',
    step1Yes: '👍 はい、とても気に入っています！',
    step1No: '👎 あまり…',
    step1Later: '後で',
    step2PosTitle: '心より感謝申し上げます！ 💖',
    step2PosSub: 'Google Playで星5つの評価をいただくために5秒だけお時間をいただけますか？大変励みになります！',
    step2PosRate: '⭐ Google Playで評価する',
    step2PosDone: '完了',
    step2NegTitle: '改善にご協力ください 💬',
    step2NegSub: 'どのような点を改善できるでしょうか？直接お聞かせください。すべてのご意見を拝読しています。',
    step2NegFeedback: '✉️ フィードバックを送信',
    step2NegClose: '閉じる'
  },
  zh: {
    step1Title: '喜欢 English Breakfast 吗？',
    step1Sub: '您的宝贵反馈帮助我们每天都把应用做得更好。',
    step1Yes: '👍 是的，非常喜欢！',
    step1No: '👎 感觉一般',
    step1Later: '稍后再说',
    step2PosTitle: '衷心感谢您的支持！ 💖',
    step2PosSub: '您愿意花 5 秒钟在 Google Play 上给我们留个 5 星好评吗？这对我们是莫大的鼓励！',
    step2PosRate: '⭐ 在 Google Play 评价',
    step2PosDone: '完成',
    step2NegTitle: '帮助我们做得更好 💬',
    step2NegSub: '您觉得还有哪些地方可以改进？欢迎直接留言反馈，我们会认真阅读每一条建议。',
    step2NegFeedback: '✉️ 发送反馈',
    step2NegClose: '关闭'
  },
  kk: {
    step1Title: 'English Breakfast қолданбасы ұнап жатыр ма?',
    step1Sub: 'Сіздің пікіріңіз қолданбаны күн сайын жақсартуға көмектеседі.',
    step1Yes: '👍 Иә, өте қатты ұнайды!',
    step1No: '👎 Қатты емес / Ескертулер бар',
    step1Later: 'Кейінірек сұрау',
    step2PosTitle: 'Шын жүректен рақмет! 💖',
    step2PosSub: 'Google Play-де бізге 5 жұлдыз бағалау қоюға 5 секунд уақытыңызды бөле аласыз ба? Бұл жобаның дамуына үлкен көмек!',
    step2PosRate: '⭐ Google Play-де бағалау',
    step2PosDone: 'Дайын',
    step2NegTitle: 'Жақсара түсуімізге көмектесіңіз 💬',
    step2NegSub: 'Нені жақсартуға болады? Бізге тікелей жазыңыз — біз әр хабарламаны мұқият оқимыз.',
    step2NegFeedback: '✉️ Әзірлеушіге жазу',
    step2NegClose: 'Жабу'
  }
};

export const GOOGLE_PLAY_PACKAGE = 'com.englishbreakfast.app';

/**
 * Open Google Play Store page
 */
export function openGooglePlayStore() {
  const packageName = GOOGLE_PLAY_PACKAGE;
  const webUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
  const marketUrl = `market://details?id=${packageName}`;

  try {
    if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.openStoreListing === 'function') {
      window.AndroidWidgetBridge.openStoreListing();
      return;
    }
    if (window.androidBridge && typeof window.androidBridge.openStoreListing === 'function') {
      window.androidBridge.openStoreListing();
      return;
    }
  } catch (e) {}

  try {
    window.location.href = marketUrl;
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 400);
  } catch (e) {
    window.open(webUrl, '_blank');
  }
}

/**
 * Get active review translation
 */
export function getReviewStrings() {
  const lang = (typeof getInterfaceLanguage === 'function' ? getInterfaceLanguage() : 'en') || 'en';
  const cleanLang = String(lang).toLowerCase().trim().replace('_', '-');
  return REVIEW_TRANSLATIONS[cleanLang] || REVIEW_TRANSLATIONS[cleanLang.split('-')[0]] || REVIEW_TRANSLATIONS.en;
}

let isModalActive = false;

/**
 * Main Two-Step Review Funnel Modal
 * @param {string} triggerSource - 'streak' | 'milestone' | 'manual' | 'summary'
 */
export function showReviewFunnelModal(triggerSource = 'manual') {
  if (isModalActive) return;

  const existing = document.querySelector('#review-funnel-overlay');
  if (existing) existing.remove();

  isModalActive = true;
  const strings = getReviewStrings();

  if (window.trackScreen) {
    window.trackScreen('review_funnel_step1', 'ReviewFunnelModal');
  }
  if (window.trackEvent) {
    window.trackEvent('review_funnel_opened', { source: triggerSource });
  }

  const overlay = document.createElement('div');
  overlay.id = 'review-funnel-overlay';
  overlay.className = 'review-funnel-overlay';

  overlay.innerHTML = `
    <style>
      .review-funnel-overlay {
        position: fixed;
        inset: 0;
        z-index: 10050;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        animation: rfFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes rfFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .review-funnel-card {
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.15);
        border-radius: 24px;
        width: 100%;
        max-width: 380px;
        padding: 28px 24px 22px;
        box-sizing: border-box;
        text-align: center;
        position: relative;
        font-family: inherit;
      }
      .rf-icon-wrap {
        width: 68px;
        height: 68px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%);
        border: 1.5px solid rgba(245, 158, 11, 0.4);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        box-shadow: 0 8px 18px rgba(245, 158, 11, 0.25);
      }
      .rf-title {
        font-size: 20px;
        font-weight: 800;
        line-height: 1.35;
        color: #ffffff;
        margin: 0 0 8px;
        letter-spacing: -0.3px;
      }
      .rf-subtitle {
        font-size: 14.5px;
        line-height: 1.55;
        color: #94a3b8;
        margin: 0 0 24px;
      }
      .rf-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .rf-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        border: none;
        border-radius: 16px;
        padding: 14px 20px;
        font-size: 15.5px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .rf-btn-primary:active {
        transform: scale(0.98);
        filter: brightness(0.95);
      }
      .rf-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 12px 18px;
        font-size: 14.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
      }
      .rf-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }
      .rf-btn-secondary:active {
        transform: scale(0.98);
      }
      .rf-btn-subtle {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 13.5px;
        font-weight: 500;
        padding: 6px;
        cursor: pointer;
        margin-top: 4px;
      }
      .rf-btn-subtle:hover {
        color: #94a3b8;
        text-decoration: underline;
      }
      .rf-close-x {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        border-radius: 50%;
        color: #94a3b8;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .rf-close-x:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.14);
      }
    </style>
    <div class="review-funnel-card" id="rf-card">
      <button class="rf-close-x" id="rf-close-btn" aria-label="Close">&times;</button>
      <div class="rf-icon-wrap" id="rf-icon">☕</div>
      <h3 class="rf-title" id="rf-title">${strings.step1Title}</h3>
      <p class="rf-subtitle" id="rf-sub">${strings.step1Sub}</p>
      
      <div class="rf-actions" id="rf-actions">
        <button class="rf-btn-primary" id="rf-btn-yes">${strings.step1Yes}</button>
        <button class="rf-btn-secondary" id="rf-btn-no">${strings.step1No}</button>
        <button class="rf-btn-subtle" id="rf-btn-later">${strings.step1Later}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  function dismiss(action = 'dismissed') {
    overlay.remove();
    isModalActive = false;
    if (window.trackEvent) {
      window.trackEvent('review_funnel_dismissed', { action });
    }
  }

  // Close X
  overlay.querySelector('#rf-close-btn')?.addEventListener('click', () => {
    localStorage.setItem('myduo_review_delayed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    dismiss('close_x');
  });

  // Ask Later
  overlay.querySelector('#rf-btn-later')?.addEventListener('click', () => {
    localStorage.setItem('myduo_review_delayed_until', (Date.now() + 5 * 24 * 60 * 60 * 1000).toString());
    dismiss('later');
  });

  // Background tap
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      localStorage.setItem('myduo_review_delayed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
      dismiss('overlay_tap');
    }
  });

  // Positive branch: Yes, I love it!
  overlay.querySelector('#rf-btn-yes')?.addEventListener('click', () => {
    if (window.trackScreen) window.trackScreen('review_funnel_step2_positive', 'ReviewFunnelModal');
    if (window.trackEvent) window.trackEvent('review_funnel_positive_clicked');

    const iconEl = overlay.querySelector('#rf-icon');
    const titleEl = overlay.querySelector('#rf-title');
    const subEl = overlay.querySelector('#rf-sub');
    const actionsEl = overlay.querySelector('#rf-actions');

    if (iconEl) iconEl.textContent = '⭐';
    if (titleEl) titleEl.textContent = strings.step2PosTitle;
    if (subEl) subEl.textContent = strings.step2PosSub;

    if (actionsEl) {
      actionsEl.innerHTML = `
        <button class="rf-btn-primary" id="rf-btn-rate" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4);">${strings.step2PosRate}</button>
        <button class="rf-btn-secondary" id="rf-btn-done">${strings.step2PosDone}</button>
      `;

      overlay.querySelector('#rf-btn-rate')?.addEventListener('click', () => {
        localStorage.setItem('myduo_review_completed', 'true');
        if (window.trackEvent) window.trackEvent('review_store_opened');
        openGooglePlayStore();
        dismiss('rate_store_clicked');
      });

      overlay.querySelector('#rf-btn-done')?.addEventListener('click', () => {
        localStorage.setItem('myduo_review_completed', 'true');
        dismiss('done_positive');
      });
    }
  });

  // Constructive / Negative branch: Not really
  overlay.querySelector('#rf-btn-no')?.addEventListener('click', () => {
    if (window.trackScreen) window.trackScreen('review_funnel_step2_negative', 'ReviewFunnelModal');
    if (window.trackEvent) window.trackEvent('review_funnel_negative_clicked');

    // Delay prompt for 30 days so user is not annoyed
    localStorage.setItem('myduo_review_delayed_until', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());

    const iconEl = overlay.querySelector('#rf-icon');
    const titleEl = overlay.querySelector('#rf-title');
    const subEl = overlay.querySelector('#rf-sub');
    const actionsEl = overlay.querySelector('#rf-actions');

    if (iconEl) iconEl.textContent = '💬';
    if (titleEl) titleEl.textContent = strings.step2NegTitle;
    if (subEl) subEl.textContent = strings.step2NegSub;

    if (actionsEl) {
      actionsEl.innerHTML = `
        <button class="rf-btn-primary" id="rf-btn-feedback" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 6px 18px rgba(59, 130, 246, 0.35);">${strings.step2NegFeedback}</button>
        <button class="rf-btn-secondary" id="rf-btn-close">${strings.step2NegClose}</button>
      `;

      overlay.querySelector('#rf-btn-feedback')?.addEventListener('click', () => {
        dismiss('feedback_opened');
        if (typeof handleFeedbackClick === 'function') {
          handleFeedbackClick();
        }
      });

      overlay.querySelector('#rf-btn-close')?.addEventListener('click', () => {
        dismiss('close_negative');
      });
    }
  });
}

/**
 * Check triggers and auto-prompt when conditions are met
 * @param {string} triggerName - 'streak' | 'milestone' | 'summary'
 * @param {object} params - { streak: number, milestone: number, accuracy: number }
 */
export function checkAndPromptReviewFunnel(triggerName = '', params = {}) {
  try {
    if (localStorage.getItem('myduo_review_completed') === 'true') {
      return false; // Already reviewed
    }

    const delayedUntil = Number(localStorage.getItem('myduo_review_delayed_until') || 0);
    if (Date.now() < delayedUntil) {
      return false; // Cooldown active
    }

    // Session throttle: trigger only once per page load / session
    if (sessionStorage.getItem('myduo_review_session_shown') === 'true') {
      return false;
    }

    let shouldPrompt = false;

    if (triggerName === 'streak') {
      const currentStreak = Number(params.streak || 0);
      if (currentStreak >= 3) {
        shouldPrompt = true;
      }
    } else if (triggerName === 'milestone') {
      const currentMilestone = Number(params.milestone || 0);
      if (currentMilestone >= 50) {
        shouldPrompt = true;
      }
    } else if (triggerName === 'summary') {
      const accuracy = Number(params.accuracy || 0);
      const streak = Number(params.streak || 0);
      if (accuracy >= 80 && streak >= 2) {
        shouldPrompt = true;
      }
    }

    if (shouldPrompt) {
      sessionStorage.setItem('myduo_review_session_shown', 'true');
      setTimeout(() => {
        showReviewFunnelModal(triggerName);
      }, 750);
      return true;
    }
  } catch (err) {
    console.warn('Review funnel check warning:', err);
  }
  return false;
}
