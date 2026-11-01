const fs = require('fs');

const daTitle = 'English Breakfast: Lær engelsk';
const daShort = 'Hjemmeskærm-widget, frekvensord, fotoskanner & podcast med slukket skærm!';

const daDesc = `English Breakfast er din smarte, daglige træner til engelsk ordforråd med interaktiv hjemmeskærm-widget!

Glem alt om ubrugelige vendinger og kedelig udenadslære. Begynd med de ord, der har den højeste reelle hyppighed i levende samtaler, skan lektier med kameraet, læs interaktive historier og lær engelsk med fuld selvtillid!

🍳 10 VIGTIGSTE FORDELE VED ENGLISH BREAKFAST:

1. 📈 INDLÆRING EFTER REEL HYPPIGHED (ZIPFS LOV)
Indlæringen følger den reelle hyppighed i moderne engelsk (CEFR A1–C2). De første 1.000 ord dækker op til 85% af hverdagssproget, film og samtaler. Næsten 7.000 ord uden spildtid.

2. 📱 INTERAKTIV HJEMMESKÆRM-WIDGET (GYLDENT KORT)
Lær engelsk, hver gang du tager telefonen i hånden! Placer den stilfulde Gyldent Kort-widget direkte på din startskærm: vend kortet med ét tryk for at tjekke oversættelsen, lyt til krystalklar udtale og skift ord uden at åbne appen. Forbind samlinger eller gentag dine personlige Favoritter.

3. 📖 INTERAKTIVE HISTORIER FOR HVER 100 ORD
Træn ordforrådet i en levende kontekst! For hver 100 mestrede ord låser du op for en motiverende historie, der udelukkende består af ord, du allerede har lært. Tryk på ethvert ord for at se oversættelsen lige over ordet, gem i Favoritter med ét tryk eller åbn den fulde parallelle oversættelse.

4. 🔓 UDEN DYRE ABONNEMENTER OG BEGRÆNSNINGER
Ingen betalingsmure, ingen tvungne månedsgebyrer og ingen kunstige grænser for liv (hjerter). Ubegrænset adgang til alle ord og funktioner — lær i dit eget tempo, så meget du vil.

5. 🧠 INTELLIGENT RUNDE-ARKITEKT
Algoritmen analyserer dine svar i realtid. Hvis et ord driller, genindfører systemet det automatisk i de næste trin, indtil du mestrer det 100%.

6. 📷 INTELLIGENT FOTOSKANNER TIL LEKTIER
Skal du lære ord fra en lærebog eller en artikel? Tag et billede af siden! OCR-skanneren genkender teksten, finder nye ord og tilføjer dem til din træning uden manuel indtastning.

7. 📝 PERSONLIG ORDBOG OG EGNE NOTER
Mødt et nyt ord i et spil eller en serie? Tilføj det med ét tryk. Knyt dine egne eksempler, huskeregler og associationer til ordene for varig langtidshukommelse.

8. ⭐ FAVORITLISTER TIL DINE MÅL
Opret målrettede ordlister: til morgendagens prøve i skolen, jobsamtalen, ferien eller internationale eksamener (IELTS, TOEFL, Cambridge).

9. 🎧 PENDLER-PODCAST MED SLUKKET SKÆRM
Lær engelsk på farten, i bussen eller under løbeturen! Baggrundsafspilning fungerer selv med slukket, sort skærm for at spare strøm: hør oversættelsen, pause til at huske og klar engelsk udtale to gange.

10. 🎙️ TO STUDIE-STANDARDER: US OG UK
Optaget af modersmålstalende med krystalklar lydkvalitet. Skift frit mellem amerikansk og britisk accent når som helst.

🔄 FULD INDLÆRINGSCYKLUS (4 TRIN):
1. Kort — visuel genkendelse og klar udtale
2. Quiz — hurtig lytteforståelse og betydning
3. Par — hurtig reaktionsevne og associationer
4. Stavning — præcis tastaturskrivning bogstav for bogstav.

🌍 36 SPROG OG FULD RTL-STØTTE:
Lær engelsk på dit modersmål — fuldt oversat til 36 sprog, inklusive arabisk, persisk og urdu med højremargen (RTL).

🏆 UGENTLIGE LIGAER OG CLOUD-SYNKRONISERING:
Dyst i ligaerne, hold din daglige stime og gem dine fremskridt sikkert med 1-klik Google-login.

🚀 PERFEKT TIL:
• Elever og studerende: Skan lektier og få topkarakterer.
• Begyndere (A1–A2): Opbyg et solidt ordforråd af de vigtigste ord.
• Viderekomne (B1–C2): Udvid dit aktive ordforråd til karriere og rejser.

Kun 10–15 minutter med en frisk "engelsk morgenmad" om dagen sikrer hurtig fremgang!
Download English Breakfast nu, og tal engelsk med selvtillid!`;

console.log('DA Title length:', daTitle.length, '(Limit: 30)');
console.log('DA Short length:', daShort.length, '(Limit: 80)');
console.log('DA Desc length:', daDesc.length, '(Limit: 4000)');

const daFile = `# 🇩🇰 Danish (Dansk) — Google Play Store Listing

### App Name (up to 30 chars)
${daTitle}

### Short Description (up to 80 chars)
${daShort}

### Full Description (up to 4000 chars)
${daDesc}
`;

fs.writeFileSync('google_play_assets/store_listings/da.md', daFile);
