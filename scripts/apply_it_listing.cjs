const fs = require('fs');

const itTitle = 'English Breakfast: Inglese';
const itShort = 'Widget schermata iniziale, parole frequenti, scanner compiti & podcast off';

const itDesc = `English Breakfast è il tuo allenatore quotidiano intelligente per imparare l'inglese con widget interattivo per la schermata iniziale!

Dimentica le frasi poco pratiche e la noiosa memorizzazione a memoria. Inizia dalle parole con la più alta frequenza d'uso nella lingua parlata, scansiona i testi con la fotocamera, leggi storie interattive e impara l'inglese con naturalezza!

🍳 10 VANTAGGI PRINCIPALI:

1. 📈 APPRENDIMENTO BASATO SULLA FREQUENZA REALE (ZIPF)
Il metodo si basa sulla reale frequenza d'uso (QCER A1–C2). I primi 1.000 vocaboli coprono fino all'85% dell'inglese parlato quotidiano, dei film e delle chat. Quasi 7.000 parole senza inutili perdite di tempo.

2. 📱 WIDGET INTERATTIVO PER SCHERMATA INIZIALE (GOLDEN CARD)
Impara vocaboli ogni volta che prendi in mano il telefono! Inserisci il widget Carta Dorata sulla schermata home: capovolgi la carta con un tocco per verificare la traduzione, ascolta la pronuncia chiara e cambia parola senza aprire l'app.

3. 📖 STORIE INTERATTIVE OGNI 100 PAROLE
Consolida il lessico in un contesto vivo! Ogni 100 parole padroneggiate sbloccano una nuova storia, composta rigorosamente solo da vocaboli che conosci già. Tocca qualsiasi parola per vederne la traduzione istantanea, aggiungila ai Preferiti o apri la traduzione completa.

4. 🔓 SENZA COSTOSI ABBONAMENTI NÉ LIMITI
Nessun paywall forzato e nessun limite artificiale di vite (cuoricini). Accesso illimitato a tutti i vocaboli e modalità: impara al tuo ritmo quando vuoi.

5. 🧠 ARCHITETTO INTELLIGENTE DEI ROUND
L'algoritmo analizza le risposte in tempo reale. Se hai dubbi su una parola, il sistema la ripropone in modo adattivo nei passaggi successivi fino a quando non la padroneggi al 100%.

6. 📷 SCANNER FOTOGRAFICO INTELLIGENTE PER COMPITI
Devi imparare parole da un libro scolastico o da un articolo? Fai una foto alla pagina! Lo scanner OCR rileva i vocaboli sconosciuti e li importa nella tua sessione di studio con un tocco, senza digitare nulla a mano.

7. 📝 DIZIONARIO PERSONALE E NOTE SU MISURA
Hai trovato una nuova parola in un film o videogioco? Aggiungila al volo. Associa esempi pratici e note personali per una memoria a lungo termine indistruttibile.

8. ⭐ LISTE DI PREFERITI PER OGNI OBIETTIVO
Organizza i vocaboli per traguardi mirati: per l'interrogazione di domani, un colloquio di lavoro, un viaggio o per esami internazionali (IELTS, TOEFL, Cambridge).

9. 🎧 MODALITÀ PODCAST A SCHERMO SPENTO
Impara mentre sei sui mezzi, cammini o fai sport! La riproduzione in background funziona a schermo spento per risparmiare batteria: ascolta la traduzione, una pausa per ricordare e la pronuncia inglese chiara due volte.

10. 🎙️ DUE STANDARD DA STUDIO: US E UK
Audio cristallino registrato da madrelingua. Passa dall'accento americano a quello britannico in qualsiasi momento.

🔄 CICLO COMPLETO DI MEMORIZZAZIONE (4 FASI):
1. Flashcard — riconoscimento visivo e pronuncia
2. Quiz — rapida comprensione all'ascolto e significato
3. Coppie — velocità di reazione e associazione
4. Scrittura — ortografia esatta lettera per lettera.

🌍 36 LINGUE E SUPPORTO RTL:
Studia comodamente nella tua lingua madre: interfaccia interamente tradotta in 36 lingue, inclusi arabo, persiano e urdu (RTL).

🏆 LEGHE SETTIMANALI E CLOUD SYNC:
Sfida altri studenti nelle leghe, conquista il podio, mantieni vivo lo streak quotidiano e sincronizza i progressi con 1 clic tramite Google.

🚀 IDEALE PER:
• Studenti: scansiona i compiti e prendi voti eccellenti.
• Principianti (A1–A2): costruisci una base solida con le parole essenziali.
• Avanzati (B1–C2): amplia il lessico per il lavoro e certificazioni.

Bastano 10–15 minuti al giorno di "English Breakfast" per fare un vero salto di qualità!
Scarica English Breakfast adesso e parla inglese con sicurezza!`;

console.log('IT Title length:', itTitle.length, '(Limit: 30)');
console.log('IT Short length:', itShort.length, '(Limit: 80)');
console.log('IT Desc length:', itDesc.length, '(Limit: 4000)');

const itFile = `# IT — Google Play Store Listing

### Title (max 30 chars)
${itTitle}

### Short Description (max 80 chars)
${itShort}

### Full Description (max 4000 chars)
${itDesc}
`;

fs.writeFileSync('google_play_assets/store_listings/it.md', itFile);
