const fs = require('fs');

const huTitle = 'English Breakfast: Angol';
const huShort = 'Kezdőképernyő widget, gyakori szavak, fotószkenner és lezárt képernyős podcast!';

const huDesc = `Az English Breakfast a te intelligens napi angol szókincsfejlesztőd interaktív kezdőképernyő widgettel!

Felejtsd el a felesleges kifejezéseket és a magolást. Kezdj a leggyakoribb szavakkal, szkenneld be a tankönyveket kamerával, olvass interaktív történeteket, és rögzítsd a szókincsed automatikusan!

🍳 10 FŐ ELŐNY:

1. 📈 VALÓS GYAKORISÁG ALAPÚ TANULÁS (ZIPF-TÖRVÉNY)
A szavak valós gyakoriságára épül (CEFR A1–C2). Az első 1 000 szó a mindennapi beszélt angol, filmek és üzenetek akár 85%-át lefedi. Közel 7 000 szó felesleges időpazarlás nélkül.

2. 📱 INTERAKTÍV KEZDŐKÉPERNYŐ WIDGET (GOLDEN CARD)
Tanulj angolul minden alkalommal, amikor a kezedbe veszed a telefont! Helyezd el az Arany kártya widgetet a kezdőképernyőn: fordítsd meg a kártyát egy érintéssel a fordításért, hallgasd meg a kiejtést, és lapozz szavakat az app megnyitása nélkül.

3. 📖 INTERAKTÍV TÖRTÉNETEK MINDEN 100 SZÓ UTÁN
Gyakorolj valós szövegkörnyezetben! Minden 100 elsajátított szó után egy új, motiváló történet nyílik meg, amely szigorúan csak az ismert szavaidból áll. Érints meg bármely szót az azonnali fordításért, mentsd Kedvencnek, vagy nyisd meg a teljes fordítást.

4. 🔓 ELŐFIZETÉSEK ÉS KORLÁTOZÁSOK NÉLKÜL
Nincsenek kötelező havidíjak és mesterséges „életek” (szívecskék). Korlátlan hozzáférés minden szóhoz — tanulj saját tempódban, amennyit csak szeretnél.

5. 🧠 INTELLIGENS KÖR-TERVEZŐ
A rendszer valós időben elemzi a válaszaidat. Ha egy szó nehézséget okoz, az algoritmus a következő lépésekben intelligensen újra feladja, amíg 100%-osan el nem sajátítod.

6. 📷 OKOS FOTÓSZKENNER HÁZI FELADATOKHOZ
Tankönyvből vagy cikkből kell szavakat tanulnod? Fotózd le az oldalt! Az OCR szövegfelismerő azonosítja az új szavakat, és egy gombnyomással importálja őket gépelés nélkül.

7. 📝 SAJÁT SZÓTÁR ÉS EGYÉNI JEGYZETEK
Új szóra bukkantál játékban vagy sorozatban? Add hozzá egyetlen érintéssel. Írj hozzá saját emlékeztetőket és asszociációkat a tartós memória érdekében.

8. ⭐ KEDVENCEK EGYEDI CÉLOKHOZ
Hozz létre szócsoportokat célzott feladatokhoz: a holnapi dolgozatra, állásinterjúra, utazásra vagy nemzetközi vizsgákra (IELTS, TOEFL, Cambridge).

9. 🎧 UTAZÓ AUDIO PODCAST KIKAPCSOLT KÉPERNYŐVEL
Tanulj ingázás, séta vagy futás közben! A háttérben futó lejátszás lezárt képernyővel is működik akkumulátort spórolva: anyanyelvi fordítás, szünet a felidézéshez és tiszta kiejtés kétszer.

10. 🎙️ KÉT STÚDIÓ-SZABVÁNY: US ÉS UK
Kristálytiszta hangfelvételek anyanyelvi beszélőktől. Bármikor válthatsz az amerikai és a brit akcentus között.

🔄 TELJES ISMÉTLÉSI CIKLUS (4 LÉPÉS):
1. Szókártyák — vizuális megismerés és tiszta kiejtés
2. Kvíz — gyors hallás utáni értés és felidézés
3. Párosítás — gyors reakció és asszociáció
4. Helyesírás — betűről betűre gépelés.

🌍 36 FELÜLETI NYELV ÉS RTL TÁMOGATÁS:
Tanulj kényelmesen anyanyelveden — 36 nyelvre lefordítva, beleértve a jobbról balra író nyelveket (arab, perzsa, urdu).

🏆 HETI LIGÁK ÉS FELHŐ-SZINKRONIZÁLÁS:
Versenyezz heti ligákban, lépj fel a dobogóra, és mentsd el haladásodat 1 kattintásos Google bejelentkezéssel.

🚀 KINEK AJÁNLOTT:
• Diákoknak: Fotózd le a leckét, és szerezz ötösöket.
• Kezdőknek (A1–A2): Építs stabil alapot a legfontosabb szavakból.
• Haladóknak (B1–C2): Bővítsd aktív szókincsedet munkához és vizsgákhoz.

Napi 10–15 perc tartalmas „angol reggeli” garantálja a biztos nyelvtudást!
Töltsd le az English Breakfast alkalmazást most, és beszélj magabiztosan angolul!`;

console.log('HU Title length:', huTitle.length, '(Limit: 30)');
console.log('HU Short length:', huShort.length, '(Limit: 80)');
console.log('HU Desc length:', huDesc.length, '(Limit: 4000)');

const huFile = `# Hungarian (Magyar) — Google Play Store Listing

## Title (max 30 chars)
${huTitle}

## Short Description (max 80 chars)
${huShort}

## Full Description (max 4000 chars)
${huDesc}
`;

fs.writeFileSync('google_play_assets/store_listings/hu.md', huFile);
