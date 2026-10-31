const fs = require('fs');

const plTitle = 'English Breakfast: Angielski';
const plShort = 'Widżet na pulpit, częste słówka, skaner zadań i podcast z ciemnym ekranem!';

const plDesc = `English Breakfast to Twój inteligentny codzienny trener słownictwa angielskiego z interaktywnym widżetem na ekran główny!

Zapomnij o bezużytecznych zwrotach i nudnym wkuwaniu na pamięć. Ucz się słówek o najwyższej realnej częstotliwości występowania w żywej mowie, skanuj podręczniki aparatem, czytaj interaktywne opowiadania i opanuj angielski w naturalny sposób!

🍳 10 GŁÓWNYCH ZALET ENGLISH BREAKFAST:

1. 📈 NAUKA WG REALNEJ CZĘSTOTLIWOŚCI (PRAWO ZIPFA)
Metoda opiera się na rzeczywistej częstotliwości użycia (poziomy CEFR A1–C2). Pierwsze 1 000 słów pokrywa do 85% codziennego języka mówionego, filmów i czatów. Prawie 7 000 słówek bez marnowania czasu.

2. 📱 INTERAKTYWNY WIDŻET NA EKRAN GŁÓWNY (ZŁOTA KARTA)
Ucz się angielskiego za każdym razem, gdy bierzesz telefon do ręki! Umieść stylowy widżet Złotej Karty na pulpicie: odwracaj kartę jednym dotknięciem, aby sprawdzić znaczenie, słuchaj studyjnej wymowy i przeglądaj słówka bez otwierania aplikacji. Podłącz gotowe kolekcje lub własne Ulubione.

3. 📖 INTERAKTYWNE OPOWIADANIA CO 100 SŁÓWEK
Utrwalaj słownictwo w naturalnym kontekście! Każde 100 opanowanych słówek odblokowuje nowe opowiadanie, złożone wyłącznie z poznanych już przez Ciebie słów. Dotknij dowolnego słowa, aby wyświetlić tłumaczenie tuż nad nim, dodaj do Ulubionych lub otwórz pełne tłumaczenie równoległe.

4. 🔓 BEZ DROGICH SUBSKRYPCJI I LIMITÓW
Brak ukrytych opłat, wymuszonych abonamentów i sztucznych limitów „żyć” (serduszek). Pełny dostęp do wszystkich słówek i trybów nauki — ucz się we własnym tempie, kiedy tylko chcesz.

5. 🧠 INTELIGENTNY ARCHITEKT RUNDY
Algorytm analizuje Twoje odpowiedzi w czasie rzeczywistym. Jeśli dane słówko sprawia trudność, system adaptacyjnie powtórzy je w kolejnych krokach, dopóki nie opanujesz go w 100%.

6. 📷 INTELIGENTNY SKANER ZDJĘĆ ZADAŃ I PODRĘCZNIKÓW (OCR)
Musisz nauczyć się słówek z podręcznika lub artykułu? Zrób zdjęcie! Skaner OCR automatycznie rozpoznaje tekst, wyłapuje nieznane słówka i dodaje je do treningu jednym kliknięciem, bez ręcznego wpisywania.

7. 📝 WŁASNY SŁOWNIK I OSOBISTE NOTATKI
Nowe słówko w grze lub serialu? Dodaj je od razu. Dołączaj własne skojarzenia, przykłady i notatki mnemotechniczne, budując trwałe ścieżki w pamięci długoterminowej.

8. ⭐ LISTY ULUBIONYCH POD KONKRETNY CEL
Twórz zestawy pod konkretne zadania: na jutrzejszy sprawdzian, rozmowę o pracę, wyjazd za granicę czy egzaminy (matura, FCE, CAE, IELTS).

9. 🎧 TRYB PODCASTU Z WYŁĄCZONYM EKRANEM
Ucz się w drodze, na spacerze lub podczas treningu ze słuchawkami! Odtwarzanie w tle działa przy wygaszonym, czarnym ekranie, oszczędzając baterię: polskie tłumaczenie, pauza na przypomnienie i podwójna wyraźna wymowa w języku angielskim.

10. 🎙️ DWA STANDARDY STUDYJNE: US I UK
Krystalicznie czysty dźwięk nagrany przez native speakerów. Przełączaj się między akcentem amerykańskim a brytyjskim w dowolnym momencie.

🔄 PEŁNY CYKL ZAPAMIĘTYWANIA (4 ETAPY):
1. Fiszki — rozpoznawanie wzrokowe i wymowa
2. Quiz — szybkie rozumienie ze słuchu i znaczenie
3. Pary — szybkość reakcji i kojarzenie
4. Pisownia — bezbłędne wpisywanie litera po literze.

🌍 36 JĘZYKÓW INTERFEJSU I WSPARCIE RTL:
Ucz się wygodnie w języku ojczystym — interfejs przetłumaczony na 36 języków, w tym arabski, perski i urdu (RTL).

🏆 COTYGODNIOWE LIGI I SYNCHRONIZACJA W CHMURZE:
Rywalizuj w ligach, zdobywaj podium, utrzymuj codzienną passę (streak) i zapisuj postępy jednym kliknięciem przez konto Google.

🚀 DLA KOGO:
• Uczniowie i studenci: skanuj zadania i zdobywaj najlepsze oceny.
• Początkujący (A1–A2): zbuduj solidną bazę najważniejszych słów.
• Średniozaawansowani i zaawansowani (B1–C2): rozwijaj słownictwo do pracy i podróży.

Wystarczy 10–15 minut pożywnego „angielskiego śniadania” dziennie, aby osiągnąć płynność!
Pobierz English Breakfast już teraz i mów pewnie po angielsku!`;

console.log('PL Title length:', plTitle.length, '(Limit: 30)');
console.log('PL Short length:', plShort.length, '(Limit: 80)');
console.log('PL Desc length:', plDesc.length, '(Limit: 4000)');

const plFile = `# Polish (Polski) — Google Play Store Listing

## Title (max 30 chars)
${plTitle}

## Short Description (max 80 chars)
${plShort}

## Full Description (max 4000 chars)
${plDesc}
`;

fs.writeFileSync('google_play_assets/store_listings/pl.md', plFile);
