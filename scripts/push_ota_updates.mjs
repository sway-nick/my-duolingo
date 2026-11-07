import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const WORDS_JSON_PATH = path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json');

const FS_PROJECT_ID = 'english-breakfast-181ba';
const FS_API_KEY = 'AIzaSyD_-Zrs0NEhIerHyg3S6jlNsXVt5RevABc';
const FS_ADMIN_EMAIL = 'sheet-sync-admin@english-breakfast.app';
const FS_ADMIN_PASS = 'SyncPassword2026!Sec';
const FS_DOC_PATH = 'shared/vocabulary_updates';

async function getFirebaseAuthToken() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FS_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: FS_ADMIN_EMAIL,
      password: FS_ADMIN_PASS,
      returnSecureToken: true
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firebase Auth error: ${errText}`);
  }
  const data = await res.json();
  return data.idToken;
}

async function run() {
  console.log('🚀 Starting Universal Vocabulary OTA Synchronization (Cloud Firestore)...\n');

  // Key sample checks across batch 1-50, 51-100, 101-150, 151-200, 201-250, 251-300, 301-350, 351-400
  const sampleChecks = [
    // Batch 1-50
    { id: 2, word: 'good at', lang: 'it', expected: 'bravo a, abile in' },
    { id: 10, word: 'beginning', lang: 'ja', expected: '始まり、初め' },
    { id: 24, word: 'lunch', lang: 'it', expected: 'pranzo' },
    { id: 44, word: 'native', lang: 'ja', expected: '母国語話者、ネイティブ、生まれつきの' },

    // Batch 51-100
    { id: 51, word: 'launch', lang: 'hu', expected: 'indítás, kilövés' },
    { id: 53, word: 'ring', lang: 'it', expected: 'anello, suonare' },
    { id: 78, word: 'plate', lang: 'es', expected: 'plato, placa' },
    { id: 78, word: 'plate', lang: 'ja', expected: '皿、プレート' },

    // Batch 101-150
    { id: 105, word: 'united', lang: 'fr', expected: 'uni' },
    { id: 106, word: 'pool', lang: 'ko', expected: '수영장, 공동 기금' },
    { id: 134, word: 'bear', lang: 'it', expected: 'orso, sopportare' },
    { id: 147, word: 'domestic', lang: 'ja', expected: '国内の、家庭の' },

    // Batch 151-200
    { id: 160, word: 'sentence', lang: 'fr', expected: 'phrase, sentence' },
    { id: 160, word: 'sentence', lang: 'it', expected: 'frase, condanna' },
    { id: 160, word: 'sentence', lang: 'cs', expected: 'věta, rozsudek' },
    { id: 188, word: 'desk', lang: 'fr', expected: 'bureau' },
    { id: 188, word: 'desk', lang: 'it', expected: 'scrivania' },

    // Batch 201-250
    { id: 213, word: 'surgery', lang: 'de', expected: 'Chirurgie, Operation' },
    { id: 213, word: 'surgery', lang: 'ja', expected: '手術、外科' },
    { id: 229, word: 'fat', lang: 'kk', expected: 'семіз, майлы, май' },
    { id: 241, word: 'breast', lang: 'fi', expected: 'rinta' },
    { id: 248, word: 'overall', lang: 'cs', expected: 'celkový, obecný' },
    { id: 248, word: 'overall', lang: 'ko', expected: '전반적인, 전반적으로' },

    // Batch 251-300
    { id: 260, word: 'airport', lang: 'cs', expected: 'letiště' },
    { id: 269, word: 'initial', lang: 'de', expected: 'anfänglich, erst' },
    { id: 271, word: 'guide', lang: 'de', expected: 'Leitfaden, Führer' },
    { id: 277, word: 'escape', lang: 'da', expected: 'undslippe, flugt' },
    { id: 277, word: 'escape', lang: 'ja', expected: '逃げる、脱出する' },
    { id: 282, word: 'fault', lang: 'da', expected: 'fejl, skyld' },
    { id: 282, word: 'fault', lang: 'ja', expected: '過失、責任、欠陥' },
    { id: 282, word: 'fault', lang: 'ko', expected: '잘못, 과실' },
    { id: 292, word: 'slip', lang: 'fi', expected: 'liukastua, lipsahtaa' },
    { id: 299, word: 'mass', lang: 'fr', expected: 'masse' },

    // Batch 301-350
    { id: 307, word: 'golden', lang: 'fr', expected: 'doré' },
    { id: 307, word: 'golden', lang: 'it', expected: 'dorato' },
    { id: 307, word: 'golden', lang: 'cs', expected: 'zlatý' },
    { id: 322, word: 'mad', lang: 'fr', expected: 'en colère, fou' },
    { id: 322, word: 'mad', lang: 'it', expected: 'arrabbiato, pazzo' },
    { id: 327, word: 'opening', lang: 'da', expected: 'åbning, indvielse' },
    { id: 327, word: 'opening', lang: 'ja', expected: '開始、オープニング、開幕' },
    { id: 327, word: 'opening', lang: 'ko', expected: '개장, 개막, 시작' },
    { id: 329, word: 'frequently', lang: 'it', expected: 'spesso' },
    { id: 330, word: 'employ', lang: 'ro', expected: 'angaja' },
    { id: 330, word: 'employ', lang: 'cs', expected: 'zaměstnat' },
    { id: 337, word: 'appeal', lang: 'fr', expected: 'faire appel, attrait' },
    { id: 337, word: 'appeal', lang: 'it', expected: 'fare appello, fascino' },
    { id: 337, word: 'appeal', lang: 'cs', expected: 'odvolání, apelovat' },
    { id: 337, word: 'appeal', lang: 'ja', expected: '訴える、魅力' },
    { id: 337, word: 'appeal', lang: 'ko', expected: '항소하다, 매력' },
    { id: 338, word: 'quote', lang: 'fr', expected: 'citer, citation' },
    { id: 338, word: 'quote', lang: 'it', expected: 'citare, citazione' },
    { id: 344, word: 'row', lang: 'fi', expected: 'rivi, meloa' },

    // Batch 351-400
    { id: 370, word: 'agenda', lang: 'es', expected: 'agenda, orden del día' },
    { id: 381, word: 'tank', lang: 'cs', expected: 'tank, nádrž' },
    { id: 387, word: 'perfectly', lang: 'it', expected: 'perfettamente' },
    { id: 390, word: 'disagree', lang: 'cs', expected: 'nesouhlasit' },
    { id: 395, word: 'waste', lang: 'fr', expected: 'gaspiller, déchets' },
    { id: 398, word: 'wrap', lang: 'da', expected: 'pakke ind, vikle' },
    { id: 398, word: 'wrap', lang: 'fi', expected: 'kääriä, paketoida' },
    { id: 398, word: 'wrap', lang: 'ja', expected: '包む、包装する' },

    // Batch 401-450
    { id: 401, word: 'rush', lang: 'fr', expected: 'se dépêcher, précipiter, ruée' },
    { id: 402, word: 'gate', lang: 'de', expected: 'Tor, Pforte, Flugsteig' },
    { id: 413, word: 'deeply', lang: 'it', expected: 'profondamente' },
    { id: 416, word: 'fairly', lang: 'fr', expected: 'assez, plutôt, équitablement' },
    { id: 426, word: 'violent', lang: 'de', expected: 'gewalttätig, gewaltsam' },
    { id: 442, word: 'round', lang: 'kk', expected: 'дөңгелек, жұмыр, раунд' },
    { id: 443, word: 'detective', lang: 'it', expected: 'investigatore, detective' },
    { id: 444, word: 'pack', lang: 'fr', expected: 'emballer, paquet, meute' },
    { id: 450, word: 'command', lang: 'fr', expected: 'ordre, commander, commandement' },
    { id: 450, word: 'command', lang: 'it', expected: 'ordine, comandare, comando' },
    { id: 450, word: 'command', lang: 'ja', expected: '命令、指揮する、指令' },

    // Batch 451-500
    { id: 451, word: 'shooting', lang: 'fr', expected: 'tir, tournage' },
    { id: 456, word: 'pure', lang: 'fr', expected: 'pur, sans mélange, authentique' },
    { id: 459, word: 'fellow', lang: 'de', expected: 'Kollege, Gefährte, Kerl' },
    { id: 464, word: 'sharp', lang: 'fr', expected: 'tranchant, pointu, aiguisé' },
    { id: 464, word: 'sharp', lang: 'it', expected: 'affilato, tagliente, acuto' },
    { id: 464, word: 'sharp', lang: 'ja', expected: '鋭い、尖った' },
    { id: 471, word: 'load', lang: 'fr', expected: 'charge, chargement, charger' },
    { id: 471, word: 'load', lang: 'it', expected: 'carico, caricare, carico di lavoro' },
    { id: 485, word: 'advance', lang: 'fr', expected: 'avancer, progrès, avance' },
    { id: 490, word: 'rural', lang: 'fr', expected: 'rural, champêtre' },
    { id: 490, word: 'rural', lang: 'it', expected: 'rurale, campestre' },
    { id: 491, word: 'wage', lang: 'fr', expected: 'salaire, rémunération, mener' },
    { id: 491, word: 'wage', lang: 'de', expected: 'Lohn, Gehalt, führen' },
    { id: 491, word: 'wage', lang: 'ja', expected: '賃金、給料、行う' },

    // Batch 501-550
    { id: 501, word: 'transfer', lang: 'fr', expected: 'transfert, transférer, virement' },
    { id: 506, word: 'owe', lang: 'cs', expected: 'dlužit, vděčit' },
    { id: 506, word: 'owe', lang: 'fr', expected: 'devoir, être redevable' },
    { id: 511, word: 'abandon', lang: 'cs', expected: 'opustit, zanechat, vzdát se' },
    { id: 514, word: 'suggestion', lang: 'fr', expected: 'suggestion, proposition, conseil' },
    { id: 514, word: 'suggestion', lang: 'it', expected: 'suggerimento, proposta, consiglio' },
    { id: 514, word: 'suggestion', lang: 'ja', expected: '提案、助言、示唆' },
    { id: 528, word: 'leading', lang: 'da', expected: 'førende, ledende' },
    { id: 529, word: 'widely', lang: 'cs', expected: 'široce, hojně' },
    { id: 535, word: 'cap', lang: 'es', expected: 'gorra, gorro, tapa, tope' },
    { id: 536, word: 'secure', lang: 'cs', expected: 'bezpečný, spolehlivý, zajistit' },
    { id: 542, word: 'boyfriend', lang: 'fr', expected: 'petit ami, copain' },
    { id: 545, word: 'preserve', lang: 'fr', expected: 'préserver, conserver, confiture' },
    { id: 545, word: 'preserve', lang: 'cs', expected: 'zachovat, uchovat, chránit' },
    { id: 545, word: 'preserve', lang: 'ja', expected: '保存する、保護する、ジャム' },

    // Batch 551-600
    { id: 552, word: 'submit', lang: 'fr', expected: 'soumettre, envoyer, céder' },
    { id: 552, word: 'submit', lang: 'cs', expected: 'odeslat, předložit, podřídit se' },
    { id: 555, word: 'resolve', lang: 'fr', expected: 'résoudre, régler, détermination' },
    { id: 555, word: 'resolve', lang: 'cs', expected: 'vyřešit, urovnat, odhodlání' },
    { id: 555, word: 'resolve', lang: 'ja', expected: '解決する、解明する、決意' },
    { id: 566, word: 'vary', lang: 'fi', expected: 'vaihdella, erota' },
    { id: 568, word: 'equally', lang: 'it', expected: 'ugualmente, altrettanto, equamente' },
    { id: 571, word: 'imply', lang: 'bg', expected: 'подразбирам, намеквам' },
    { id: 571, word: 'imply', lang: 'cs', expected: 'naznačovat, implikovat, znamenat' },
    { id: 578, word: 'boot', lang: 'fr', expected: 'botte, coffre, démarrer' },
    { id: 582, word: 'favor', lang: 'cs', expected: 'laskavost, přízeň, služba' },
    { id: 597, word: 'mess', lang: 'ja', expected: '散らかり、混乱、散らかす' },
    { id: 597, word: 'mess', lang: 'ko', expected: '엉망진창, 난장판, 엉망으로 만들다' },
    { id: 598, word: 'joy', lang: 'de', expected: 'Freude, Entzücken, Wonne' },
    { id: 598, word: 'joy', lang: 'fr', expected: 'joie, allégresse, bonheur' },

    // Batch 601-650
    { id: 616, word: 'plot', lang: 'fr', expected: 'intrigue, trame, complot, parcelle' },
    { id: 616, word: 'plot', lang: 'it', expected: 'trama, intreccio, complotto' },
    { id: 616, word: 'plot', lang: 'cs', expected: 'děj, zápletka, spiknutí, pozemek' },
    { id: 617, word: 'angle', lang: 'fr', expected: 'angle, point de vue' },
    { id: 617, word: 'angle', lang: 'cs', expected: 'úhel, zorný úhel, pohled' },
    { id: 622, word: 'desert', lang: 'sv', expected: 'öken, ödemark' },
    { id: 626, word: 'bullet', lang: 'da', expected: 'kugle, projektil, punkt' },
    { id: 627, word: 'sequence', lang: 'fr', expected: 'séquence, ordre, suite' },
    { id: 629, word: 'minor', lang: 'da', expected: 'mindre, uvæsentlig, mindreårig' },
    { id: 633, word: 'clock', lang: 'da', expected: 'ur, vægur' },
    { id: 633, word: 'clock', lang: 'fi', expected: 'kello, seinäkello' },
    { id: 634, word: 'arrange', lang: 'fr', expected: 'organiser, arranger, disposer' },
    { id: 634, word: 'arrange', lang: 'cs', expected: 'zorganizovat, zařídit, uspořádat' },
    { id: 634, word: 'arrange', lang: 'da', expected: 'arrangere, organisere, tilrettelægge' },
    { id: 639, word: 'properly', lang: 'fr', expected: 'correctement, convenablement, comme il faut' },
    { id: 639, word: 'properly', lang: 'cs', expected: 'správně, řádně, jak se patří' },

    // Batch 651-700
    { id: 651, word: 'friendly', lang: 'ru', expected: 'дружелюбный, приветливый' },
    { id: 656, word: 'trick', lang: 'fr', expected: 'tour, astuce, tromper' },
    { id: 656, word: 'trick', lang: 'cs', expected: 'trik, lest, kouzlo, oklamat' },
    { id: 661, word: 'approval', lang: 'fr', expected: 'approbation, accord, consentement' },
    { id: 661, word: 'approval', lang: 'it', expected: 'approvazione, consenso, assenso' },
    { id: 661, word: 'approval', lang: 'cs', expected: 'schválení, souhlas, uznání' },
    { id: 663, word: 'permanent', lang: 'fr', expected: 'permanent, durable, fixe' },
    { id: 663, word: 'permanent', lang: 'cs', expected: 'trvalý, stálý, permanentní' },
    { id: 663, word: 'permanent', lang: 'ko', expected: '영구적인, 불변의, 상설의' },
    { id: 667, word: 'objective', lang: 'fr', expected: 'objectif, but, impartial' },
    { id: 667, word: 'objective', lang: 'it', expected: 'obiettivo, scopo, imparziale' },
    { id: 672, word: 'cent', lang: 'it', expected: 'centesimo, cent' },
    { id: 674, word: 'crucial', lang: 'fr', expected: 'crucial, capital, décisif' },
    { id: 674, word: 'crucial', lang: 'pl', expected: 'kluczowy, decydujący, przełomowy' },
    { id: 674, word: 'crucial', lang: 'it', expected: 'cruciale, fondamentale, decisivo' },
    { id: 674, word: 'crucial', lang: 'cs', expected: 'klíčový, rozhodující, zásadní' },
    { id: 674, word: 'crucial', lang: 'ja', expected: '決定的な, 極めて重要な, 肝心な' },
    { id: 674, word: 'crucial', lang: 'ko', expected: '결정적인, 중대한' },
    { id: 686, word: 'rough', lang: 'it', expected: 'ruvido, grezzo, approssimativo' },
    { id: 690, word: 'inner', lang: 'cs', expected: 'vnitřní, niterný' },
    { id: 692, word: 'pace', lang: 'fr', expected: 'allure, rythme, cadence, pas' },
    { id: 692, word: 'pace', lang: 'it', expected: 'ritmo, passo, andatura' },
    { id: 692, word: 'pace', lang: 'ja', expected: 'ペース, 歩調, 速度' },
    { id: 695, word: 'advise', lang: 'sv', expected: 'råda, tillråda, ge råd' },
    { id: 696, word: 'initially', lang: 'it', expected: "inizialmente, all'inizio, dapprima" },
    { id: 698, word: 'unlikely', lang: 'cs', expected: 'nepravděpodobný, pochybný' },

    // Batch 701-750
    { id: 706, word: 'translate', lang: 'fr', expected: 'traduire, transposer' },
    { id: 706, word: 'translate', lang: 'cs', expected: 'přeložit, překládat' },
    { id: 706, word: 'translate', lang: 'it', expected: 'tradurre, interpretare' },
    { id: 711, word: 'dismiss', lang: 'fr', expected: 'licencier, renvoyer, rejeter' },
    { id: 711, word: 'dismiss', lang: 'it', expected: 'licenziare, respingere, archiviare' },
    { id: 711, word: 'dismiss', lang: 'cs', expected: 'propustit, zamítnout, vyloučit' },
    { id: 719, word: 'possess', lang: 'fr', expected: 'posséder, détenir, jouir de' },
    { id: 719, word: 'possess', lang: 'it', expected: 'possedere, detenere, godere di' },
    { id: 719, word: 'possess', lang: 'cs', expected: 'vlastnit, mít, disponovat' },
    { id: 721, word: 'hurry', lang: 'de', expected: 'eilen, sich beeilen, Eile' },
    { id: 721, word: 'hurry', lang: 'fr', expected: 'se dépêcher, hâter, hâte' },
    { id: 722, word: 'bite', lang: 'cs', expected: 'kousat, uštknout, kousnutí, sousto' },
    { id: 726, word: 'encounter', lang: 'fr', expected: 'rencontrer, faire face à, rencontre' },
    { id: 726, word: 'encounter', lang: 'it', expected: 'incontrare, imbattersi in, incontro' },
    { id: 726, word: 'encounter', lang: 'cs', expected: 'potkat, narazit na, setkání' },
    { id: 733, word: 'relative', lang: 'de', expected: 'Verwandter, relativ, verhältnismäßig' },
    { id: 733, word: 'relative', lang: 'fr', expected: 'parent, proche, relatif' },
    { id: 733, word: 'relative', lang: 'it', expected: 'parente, familiare, relativo' },
    { id: 733, word: 'relative', lang: 'cs', expected: 'příbuzný, relativní, poměrný' },
    { id: 736, word: 'nut', lang: 'cs', expected: 'ořech, oříšek, blázen, matice' },
    { id: 737, word: 'rank', lang: 'fr', expected: 'rang, grade, rangée, classer' },
    { id: 737, word: 'rank', lang: 'it', expected: 'rango, grado, posizione, classificare' },
    { id: 740, word: 'fortune', lang: 'cs', expected: 'jmění, bohatství, štěstí, osud' },
    { id: 741, word: 'freeze froze frozen', lang: 'da', expected: 'fryse, nedfryse, stivne' },
    { id: 741, word: 'freeze froze frozen', lang: 'fi', expected: 'jäätyä, pakastaa, jähmettyä' },
    { id: 746, word: 'retain', lang: 'fr', expected: 'retenir, conserver, garder' },
    { id: 746, word: 'retain', lang: 'it', expected: 'trattenere, conservare, mantenere' },
    { id: 746, word: 'retain', lang: 'cs', expected: 'uchovat, udržet, ponechat si' },
    { id: 749, word: 'qualify', lang: 'ar', expected: 'يؤهل, يتأهل, ينال الأهلية' },
    { id: 750, word: 'scheme', lang: 'fr', expected: 'projet, plan, dispositif, combine' },
    { id: 750, word: 'scheme', lang: 'cs', expected: 'plán, projekt, schéma, intrika' },

    // Batch 751-800
    { id: 751, word: 'shame', lang: 'fr', expected: 'honte, déshonneur, dommage' },
    { id: 754, word: 'tube', lang: 'ar', expected: 'أنبوب, ماسورة, مترو الأنفاق' },
    { id: 755, word: 'chef', lang: 'it', expected: 'chef, capocuoco, cuoco' },
    { id: 755, word: 'chef', lang: 'fr', expected: 'chef cuisinier, chef, cuisinier' },
    { id: 758, word: 'tongue', lang: 'sv', expected: 'tunga, språk' },
    { id: 758, word: 'tongue', lang: 'ar', expected: 'لسان, لغة' },
    { id: 758, word: 'tongue', lang: 'ja', expected: '舌, 言語, 言葉' },
    { id: 761, word: 'flat', lang: 'fr', expected: 'plat, aplati, appartement' },
    { id: 761, word: 'flat', lang: 'it', expected: 'piatto, piano, appartamento' },
    { id: 761, word: 'flat', lang: 'cs', expected: 'plochý, rovný, byt' },
    { id: 763, word: 'register', lang: 'fr', expected: "s'inscrire, enregistrer, registre" },
    { id: 763, word: 'register', lang: 'cs', expected: 'zaregistrovat se, zapsat se, rejstřík' },
    { id: 766, word: 'port', lang: 'it', expected: 'porto, scalo marittimo, porta di connessione' },
    { id: 770, word: 'appointment', lang: 'fr', expected: 'rendez-vous, consultation, nomination' },
    { id: 770, word: 'appointment', lang: 'cs', expected: 'schůzka, objednání k lékaři, jmenování' },
    { id: 771, word: 'convert', lang: 'cs', expected: 'přeměnit, převést, obrátit na víru' },
    { id: 788, word: 'asleep', lang: 'fr', expected: 'endormi, assoupi' },
    { id: 788, word: 'asleep', lang: 'it', expected: 'addormentato, assopito' },
    { id: 788, word: 'asleep', lang: 'cs', expected: 'spící, usnutý' },
    { id: 788, word: 'asleep', lang: 'ja', expected: '眠っている, 眠って' },
    { id: 796, word: 'borrow', lang: 'fr', expected: 'emprunter, contracter un emprunt' },
    { id: 796, word: 'borrow', lang: 'cs', expected: 'půjčit si, vypůjčit si' },
    { id: 798, word: 'custom', lang: 'kk', expected: 'салт, дәстүр, әдет-ғұрып, тапсырыспен жасалған' },
    { id: 799, word: 'satellite', lang: 'sv', expected: 'satellit, konstgjord måne' },
    { id: 799, word: 'satellite', lang: 'fi', expected: 'satelliitti, kiertolainen' },
    { id: 799, word: 'satellite', lang: 'ar', expected: 'قمر صناعي, ساتل, تابع فضائي' },
    { id: 799, word: 'satellite', lang: 'ja', expected: '人工衛星, 衛星' },
    { id: 799, word: 'satellite', lang: 'ko', expected: '인공위성, 위성' },
    { id: 800, word: 'stable', lang: 'sv', expected: 'stabil, stadig, stall' },
    { id: 800, word: 'stable', lang: 'fi', expected: 'vakaa, luja, talli' },
    { id: 800, word: 'stable', lang: 'cs', expected: 'stabilní, stálý, stáj, maštal' },

    // Batch 801-850
    { id: 801, word: 'script', lang: 'fr', expected: 'scénario, écriture manuscrite, script' },
    { id: 801, word: 'script', lang: 'it', expected: 'sceneggiatura, scrittura, copione' },
    { id: 803, word: 'efficient', lang: 'sl', expected: 'učinkovit, smotrn, zmogljiv' },
    { id: 807, word: 'ideal', lang: 'sl', expected: 'idealen, popoln, vzor' },
    { id: 810, word: 'reserve', lang: 'cs', expected: 'rezervovat, zamluvit, záloha, rezervace' },
    { id: 812, word: 'quietly', lang: 'fr', expected: 'silencieusement, doucement, calmement' },
    { id: 814, word: 'loose', lang: 'fr', expected: 'ample, lâche, desserré, fluide' },
    { id: 814, word: 'loose', lang: 'it', expected: 'largo, allentato, sfuso, morbido' },
    { id: 814, word: 'loose', lang: 'sk', expected: 'voľný, uvoľnený, plandavý' },
    { id: 814, word: 'loose', lang: 'hu', expected: 'laza, tág, bő, laza illesztésű' },
    { id: 820, word: 'missing', lang: 'sv', expected: 'saknad, försvunnen, fattas' },
    { id: 820, word: 'missing', lang: 'fi', expected: 'kadonnut, puuttuva, kadoksissa' },
    { id: 820, word: 'missing', lang: 'ar', expected: 'مفقود, ضائع, ناقص' },
    { id: 824, word: 'remote', lang: 'sv', expected: 'avlägsen, avskild, fjärrkontroll' },
    { id: 824, word: 'remote', lang: 'fi', expected: 'etäinen, syrjäinen, kaukosäädin' },
    { id: 824, word: 'remote', lang: 'da', expected: 'fjern, afsides, fjernbetjening' },
    { id: 824, word: 'remote', lang: 'ar', expected: 'بعيد, ناءٍ, جهاز تحكم عن بعد' },
    { id: 824, word: 'remote', lang: 'ja', expected: '遠く離れた, 人里離れた, リモコン, 遠隔の' },
    { id: 824, word: 'remote', lang: 'ko', expected: '외딴, 먼, 원격의, 리모컨' },
    { id: 826, word: 'everyday', lang: 'fr', expected: 'quotidien, habituel, de tous les jours' },
    { id: 826, word: 'everyday', lang: 'it', expected: 'quotidiano, giornaliero, abituale' },
    { id: 830, word: 'measurement', lang: 'it', expected: 'misura, misurazione, dimensione' },
    { id: 830, word: 'measurement', lang: 'ja', expected: '測定, 寸法, 計測' },
    { id: 837, word: 'upset', lang: 'cs', expected: 'rozrušený, znechucený, naštvaný, zarmoutit' },
    { id: 837, word: 'upset', lang: 'sk', expected: 'rozrušený, znechutený, nahnevaný, zarmútiť' },
    { id: 837, word: 'upset', lang: 'hu', expected: 'feldúlt, ideges, zaklatott, bánt' },
    { id: 837, word: 'upset', lang: 'el', expected: 'αναστατωμένος, εκνευρισμένος, στενοχωρημένος' },
    { id: 842, word: 'ban', lang: 'it', expected: 'divieto, bandire, vietare, proscrivere' },
    { id: 844, word: 'badly', lang: 'fr', expected: 'mal, gravement, durement' },
    { id: 846, word: 'slight', lang: 'fr', expected: 'léger, minime, discret, affront' },
    { id: 846, word: 'slight', lang: 'it', expected: 'lieve, leggero, impercettibile, sgarbo' },
    { id: 846, word: 'slight', lang: 'cs', expected: 'nepatrný, mírný, lehký, urážka' },
    { id: 846, word: 'slight', lang: 'fi', expected: 'vähäinen, lievä, pieni, loukkaus' },
    { id: 850, word: 'incredibly', lang: 'fr', expected: 'incroyablement, prodigieusement, extrêmement' },
    { id: 850, word: 'incredibly', lang: 'it', expected: 'incredibilmente, straordinariamente, oltremodo' },
    { id: 850, word: 'incredibly', lang: 'cs', expected: 'neuvěřitelně, neskutečně, ohromně' },

    // Batch 851-900
    { id: 851, word: 'orange', lang: 'it', expected: 'arancia, arancione' },
    { id: 853, word: 'running', lang: 'fr', expected: 'course, course à pied, courant, en marche' },
    { id: 855, word: 'stairs', lang: 'fr', expected: 'escalier, marches' },
    { id: 855, word: 'stairs', lang: 'cs', expected: 'schody, schodiště, stupně' },
    { id: 857, word: 'assignment', lang: 'fr', expected: 'devoir, tâche, mission, affectation' },
    { id: 857, word: 'assignment', lang: 'it', expected: 'compito, incarico, assegnazione' },
    { id: 857, word: 'assignment', lang: 'cs', expected: 'úkol, zadání, pověření' },
    { id: 857, word: 'assignment', lang: 'ar', expected: 'مهمة, واجب, تكليف' },
    { id: 867, word: 'decrease', lang: 'fr', expected: 'baisse, diminution, diminuer, réduire' },
    { id: 867, word: 'decrease', lang: 'cs', expected: 'pokles, snížení, klesat, snižovat' },
    { id: 867, word: 'decrease', lang: 'sk', expected: 'pokles, zníženie, klesať, znižovať' },
    { id: 867, word: 'decrease', lang: 'fi', expected: 'väheneminen, lasku, vähentää, vähentyä' },
    { id: 867, word: 'decrease', lang: 'hr', expected: 'smanjenje, pad, smanjivati, opadati' },
    { id: 868, word: 'resort', lang: 'fr', expected: 'station balnéaire, complexe hôtelier, recourir à' },
    { id: 868, word: 'resort', lang: 'da', expected: 'feriested, kursted, ty til' },
    { id: 868, word: 'resort', lang: 'fi', expected: 'lomakeskus, lomakohde, turvautua johonkin' },
    { id: 869, word: 'cancel', lang: 'fr', expected: 'annuler, résilier, annulation' },
    { id: 869, word: 'cancel', lang: 'cs', expected: 'zrušit, odvolat, stornovat, storno' },
    { id: 881, word: 'lung', lang: 'da', expected: 'lunge' },
    { id: 881, word: 'lung', lang: 'fi', expected: 'keuhko, keuhkot' },
    { id: 881, word: 'lung', lang: 'sv', expected: 'lunga' },
    { id: 881, word: 'lung', lang: 'ar', expected: 'رئة, رئتان' },
    { id: 881, word: 'lung', lang: 'ko', expected: '폐, 허파' },
    { id: 881, word: 'lung', lang: 'ja', expected: '肺, 肺臓' },
    { id: 882, word: 'steady', lang: 'fr', expected: 'constant, régulier, stable, ferme' },
    { id: 882, word: 'steady', lang: 'sl', expected: 'stalen, stanoviten, miren, zanesljiv' },
    { id: 883, word: 'headline', lang: 'da', expected: 'overskrift, avisoverskrift, blikfang' },
    { id: 883, word: 'headline', lang: 'sv', expected: 'rubrik, tidningsrubrik, löpsedel' },
    { id: 883, word: 'headline', lang: 'fi', expected: 'otsikko, lehtiotsikko, pääotsikko' },
    { id: 883, word: 'headline', lang: 'ar', expected: 'عنوان رئيسي, مانشيت' },
    { id: 885, word: 'successfully', lang: 'da', expected: 'med succes, succesfuldt, vellykket' },
    { id: 885, word: 'successfully', lang: 'sv', expected: 'framgångsrikt, med framgång, lyckat' },
    { id: 885, word: 'successfully', lang: 'fi', expected: 'onnistuneesti, menestyksekkäästi, tuloksellisesti' },
    { id: 897, word: 'oven', lang: 'de', expected: 'Backofen, Ofen, Röhre' },
    { id: 897, word: 'oven', lang: 'fr', expected: 'four, fourneau' },
    { id: 897, word: 'oven', lang: 'it', expected: 'forno, fornetto' },
    { id: 897, word: 'oven', lang: 'cs', expected: 'trouba, pečicí trouba, pec' },
    { id: 897, word: 'oven', lang: 'ja', expected: 'オーブン, 天火, 窯' },
    { id: 900, word: 'heel', lang: 'de', expected: 'Ferse, Absatz, Hacke' },
    { id: 900, word: 'heel', lang: 'it', expected: 'tallone, tacco' },

    // Batch 901-950
    { id: 903, word: 'cheat', lang: 'fr', expected: 'tricher, tromper' },
    { id: 903, word: 'cheat', lang: 'it', expected: 'imbrogliare, barare, tradire' },
    { id: 903, word: 'cheat', lang: 'cs', expected: 'podvádět, opisovat' },
    { id: 907, word: 'celebration', lang: 'fr', expected: 'célébration, fête' },
    { id: 907, word: 'celebration', lang: 'it', expected: 'celebrazione, festa' },
    { id: 907, word: 'celebration', lang: 'cs', expected: 'oslava, slavnost' },
    { id: 918, word: 'intelligent', lang: 'fr', expected: 'intelligent, brillant' },
    { id: 918, word: 'intelligent', lang: 'it', expected: 'intelligente, brillante' },
    { id: 920, word: 'delay', lang: 'fr', expected: 'retarder, différer, retard' },
    { id: 920, word: 'delay', lang: 'it', expected: 'ritardare, posticipare, ritardo' },
    { id: 922, word: 'examination', lang: 'fi', expected: 'tutkinto, koe, lääkärintarkastus' },
    { id: 922, word: 'examination', lang: 'cs', expected: 'zkouška, vyšetření, prohlídka' },
    { id: 926, word: 'float', lang: 'fr', expected: 'flotter, surnager' },
    { id: 926, word: 'float', lang: 'el', expected: 'επιπλέω, πλέω' },
    { id: 928, word: 'rapid', lang: 'it', expected: 'rapido, veloce' },
    { id: 934, word: 'leather', lang: 'da', expected: 'læder' },
    { id: 934, word: 'leather', lang: 'fi', expected: 'nahka' },
    { id: 934, word: 'leather', lang: 'ja', expected: '革、レザー' },
    { id: 937, word: 'uncomfortable', lang: 'ru', expected: 'неудобный, некомфортный' },
    { id: 937, word: 'uncomfortable', lang: 'uk', expected: 'незручний, дискомфортний' },
    { id: 940, word: 'grain', lang: 'fr', expected: 'grain, céréale' },
    { id: 940, word: 'grain', lang: 'it', expected: 'grano, chicco, cereale' },
    { id: 940, word: 'grain', lang: 'cs', expected: 'zrno, obilí' },
    { id: 942, word: 'collapse', lang: 'da', expected: 'styrte sammen, kollapse, kollaps' },
    { id: 942, word: 'collapse', lang: 'fi', expected: 'luhistua, romahtaa, romahdus' },
    { id: 947, word: 'behave', lang: 'fr', expected: 'se comporter, agir' },
    { id: 947, word: 'behave', lang: 'ru', expected: 'вести себя, поступать' },
    { id: 949, word: 'elderly', lang: 'ru', expected: 'пожилой, преклонного возраста' },
    { id: 949, word: 'elderly', lang: 'es', expected: 'anciano, de edad avanzada, mayor' },
    { id: 950, word: 'virtual', lang: 'el', expected: 'εικονικός' },

    // Batch 951-1000
    { id: 955, word: 'donate', lang: 'da', expected: 'donere, skænke' },
    { id: 955, word: 'donate', lang: 'fi', expected: 'lahjoittaa, antaa hyväntekeväisyyteen' },
    { id: 955, word: 'donate', lang: 'sv', expected: 'donera, skänka' },
    { id: 955, word: 'donate', lang: 'vi', expected: 'quyên góp, hiến tặng' },
    { id: 956, word: 'toe', lang: 'it', expected: 'dito del piede, punta della scarpa' },
    { id: 956, word: 'toe', lang: 'lt', expected: 'kojos pirštas, bato noselė' },
    { id: 956, word: 'toe', lang: 'ja', expected: '足の指、つま先' },
    { id: 957, word: 'prescription', lang: 'fr', expected: 'ordonnance, prescription médicale' },
    { id: 957, word: 'prescription', lang: 'da', expected: 'recept, lægerecept' },
    { id: 957, word: 'prescription', lang: 'vi', expected: 'đơn thuốc, toa thuốc' },
    { id: 957, word: 'prescription', lang: 'th', expected: 'ใบสั่งยา' },
    { id: 957, word: 'prescription', lang: 'ko', expected: '처방전, 처방약' },
    { id: 957, word: 'prescription', lang: 'ja', expected: '処方箋、処方薬' },
    { id: 965, word: 'nail', lang: 'fr', expected: 'clou, ongle' },
    { id: 965, word: 'nail', lang: 'it', expected: 'chiodo, unghia' },
    { id: 965, word: 'nail', lang: 'cs', expected: 'hřebík, nehet' },
    { id: 967, word: 'interrupt', lang: 'hu', expected: 'félbeszakít, beleszól' },
    { id: 967, word: 'interrupt', lang: 'el', expected: 'διακόπτω' },
    { id: 967, word: 'interrupt', lang: 'da', expected: 'afbryde, falde i talen' },
    { id: 970, word: 'melt', lang: 'it', expected: 'sciogliersi, fondere' },
    { id: 970, word: 'melt', lang: 'sl', expected: 'taliti se, stopiti se' },
    { id: 975, word: 'toilet', lang: 'ru', expected: 'туалет, унитаз, уборная' },
    { id: 975, word: 'toilet', lang: 'fr', expected: 'toilettes, cabinet, WC' },
    { id: 978, word: 'organ', lang: 'sl', expected: 'organ, orgle' },
    { id: 978, word: 'organ', lang: 'hr', expected: 'organ, orgulje' },
    { id: 978, word: 'organ', lang: 'ko', expected: '장기, 기관, 오르간' },
    { id: 978, word: 'organ', lang: 'ja', expected: '臓器、器官、オルガン' },
    { id: 979, word: 'brush', lang: 'de', expected: 'Bürste, Pinsel, bürsten' },
    { id: 979, word: 'brush', lang: 'fr', expected: 'brosse, pinceau, brosser' },
    { id: 979, word: 'brush', lang: 'it', expected: 'spazzola, pennello, spazzolare' },
    { id: 979, word: 'brush', lang: 'cs', expected: 'kartáč, štětec, kartáčovat' },
    { id: 981, word: 'disappointed', lang: 'it', expected: 'deluso, amareggiato' },
    { id: 981, word: 'disappointed', lang: 'de', expected: 'enttäuscht, ernüchtert' },
    { id: 981, word: 'disappointed', lang: 'fr', expected: 'déçu, désenchanté' },
    { id: 981, word: 'disappointed', lang: 'cs', expected: 'zklamaný, rozčarovaný' },
    { id: 981, word: 'disappointed', lang: 'ko', expected: '실망한, 낙담한' },
    { id: 983, word: 'rescue', lang: 'fr', expected: 'secourir, sauver, le sauvetage' },
    { id: 983, word: 'rescue', lang: 'it', expected: 'soccorrere, salvare, il salvataggio' },
    { id: 983, word: 'rescue', lang: 'cs', expected: 'zachránit, vyprostit, záchrana' },
    { id: 983, word: 'rescue', lang: 'da', expected: 'redde, bjærge, redning' },
    { id: 983, word: 'rescue', lang: 'fi', expected: 'pelastaa, auttaa pulasta, pelastus' },
    { id: 986, word: 'costume', lang: 'da', expected: 'udklædning, karnevalskostume' },
    { id: 986, word: 'costume', lang: 'hr', expected: 'maska, maškare, nošnja' },
    { id: 986, word: 'costume', lang: 'ja', expected: '舞台衣装、仮装、コスチューム' },
    { id: 986, word: 'costume', lang: 'ko', expected: '무대 의상, 코스튬' },
    { id: 990, word: 'injure', lang: 'fr', expected: 'blesser, faire du mal, estropier' },
    { id: 990, word: 'injure', lang: 'it', expected: 'ferire, farsi male, lesionare' },
    { id: 990, word: 'injure', lang: 'cs', expected: 'zranit, poranit, ublížit' },
    { id: 993, word: 'associated', lang: 'da', expected: 'forbundet med, tilknyttet' },
    { id: 993, word: 'associated', lang: 'fi', expected: 'liittyvä, yhdistetty, yhteydessä oleva' },
    { id: 993, word: 'associated', lang: 'sv', expected: 'associerad, förknippad' },
    { id: 993, word: 'associated', lang: 'ja', expected: '関連した、付随する' },
    { id: 993, word: 'associated', lang: 'ko', expected: '연관된, 결부된' },
    { id: 994, word: 'fascinating', lang: 'de', expected: 'faszinierend, fesselnd, packend' },
    { id: 994, word: 'fascinating', lang: 'fr', expected: 'fascinant, captivant, passionnant' },
    { id: 994, word: 'fascinating', lang: 'cs', expected: 'fascinující, úchvatný' },
    { id: 1000, word: 'alarm', lang: 'hu', expected: 'riasztó, ébresztőóra, vészjelzés' },
    { id: 1000, word: 'alarm', lang: 'cs', expected: 'poplach, budík, výstražný signál' },
    { id: 1000, word: 'alarm', lang: 'ru', expected: 'будильник, тревога, сигнал тревоги' },

    // Batch 1001-1050
    { id: 1008, word: 'lend', lang: 'cs', expected: 'půjčit, zapůjčit, poskytnout úvěr' },
    { id: 1008, word: 'lend', lang: 'el', expected: 'δανείζω, παραχωρώ προσωρινά' },
    { id: 1008, word: 'lend', lang: 'hu', expected: 'kölcsönad, kölcsönöz' },
    { id: 1009, word: 'correctly', lang: 'it', expected: 'correttamente, esattamente, a dovere' },
    { id: 1009, word: 'correctly', lang: 'bg', expected: 'правилно, коректно' },
    { id: 1009, word: 'correctly', lang: 'cs', expected: 'správně, bezchybně' },
    { id: 1010, word: 'govern', lang: 'it', expected: 'governare, amministrare, reggere' },
    { id: 1010, word: 'govern', lang: 'fr', expected: 'gouverner, diriger, administrer' },
    { id: 1021, word: 'sum', lang: 'it', expected: 'somma, importo, totale' },
    { id: 1021, word: 'sum', lang: 'fr', expected: 'somme, montant, total' },
    { id: 1022, word: 'lecture', lang: 'it', expected: 'lezione universitaria, conferenza' },
    { id: 1022, word: 'lecture', lang: 'fr', expected: 'cours magistral, conférence' },
    { id: 1023, word: 'upstairs', lang: 'it', expected: 'al piano superiore, di sopra' },
    { id: 1023, word: 'upstairs', lang: 'bg', expected: 'на горния етаж, горе по стълбите' },
    { id: 1033, word: 'boring', lang: 'hu', expected: 'unalmas, egyhangú' },
    { id: 1033, word: 'boring', lang: 'cs', expected: 'nudný, nezáživný' },
    { id: 1034, word: 'closed', lang: 'cs', expected: 'zavřený, uzamčený' },
    { id: 1034, word: 'closed', lang: 'hu', expected: 'zárt, becsukott' },
    { id: 1037, word: 'tablet', lang: 'cs', expected: 'tablet, tableta, pilulka' },
    { id: 1037, word: 'tablet', lang: 'el', expected: 'τάμπλετ, δισκίο, χάπι' },
    { id: 1040, word: 'artistic', lang: 'it', expected: "artistico, d'arte, creativo" },
    { id: 1040, word: 'artistic', lang: 'cs', expected: 'umělecký, výtvarný' },
    { id: 1044, word: 'excitement', lang: 'it', expected: 'entusiasmo, trepidazione, fervore' },
    { id: 1044, word: 'excitement', lang: 'cs', expected: 'nadšení, vzrušení, elán' },
    { id: 1045, word: 'palace', lang: 'it', expected: 'palazzo, reggia, sontuosa dimora' },
    { id: 1045, word: 'palace', lang: 'cs', expected: 'palác, zámecké sídlo' },
    { id: 1048, word: 'shell', lang: 'it', expected: 'conchiglia, guscio, proiettile di cannone' },
    { id: 1048, word: 'shell', lang: 'cs', expected: 'lastura, skořápka, dělostřelecký granát' },

    // Batch 1051-1100
    { id: 1058, word: 'greet', lang: 'it', expected: 'salutare, dare il benvenuto' },
    { id: 1058, word: 'greet', lang: 'cs', expected: 'pozdravit, přivítat' },
    { id: 1058, word: 'greet', lang: 'hu', expected: 'üdvözölni, köszönteni' },
    { id: 1065, word: 'spell', lang: 'fr', expected: 'épeler, sortilège, enchantement' },
    { id: 1065, word: 'spell', lang: 'it', expected: 'compitare, incantesimo, maleficio' },
    { id: 1065, word: 'spell', lang: 'cs', expected: 'hláskovat, kouzlo, zaklínadlo' },
    { id: 1065, word: 'spell', lang: 'ru', expected: 'писать по буквам, заклинание, чары' },
    { id: 1066, word: 'conscious', lang: 'ru', expected: 'сознательный, находящийся в сознании' },
    { id: 1066, word: 'conscious', lang: 'it', expected: 'consapevole, cosciente' },
    { id: 1066, word: 'conscious', lang: 'cs', expected: 'vědomý, při vědomí' },
    { id: 1068, word: 'teenage', lang: 'ru', expected: 'подростковый, юношеский' },
    { id: 1068, word: 'teenage', lang: 'it', expected: 'adolescenziale, giovanile' },
    { id: 1070, word: 'photography', lang: 'it', expected: 'fotografia, arte fotografica' },
    { id: 1070, word: 'photography', lang: 'hu', expected: 'fotózás, fényképészet' },
    { id: 1076, word: 'bath', lang: 'fr', expected: 'bain, baignoire' },
    { id: 1076, word: 'bath', lang: 'it', expected: 'bagno, vasca da bagno' },
    { id: 1085, word: 'regret', lang: 'fr', expected: 'regretter, déplorer, regret' },
    { id: 1085, word: 'regret', lang: 'it', expected: 'rimpiangere, pentirsi, rimpianto' },
    { id: 1085, word: 'regret', lang: 'cs', expected: 'litovat, mrzet, lítost' },
    { id: 1091, word: 'castle', lang: 'fr', expected: 'château fort, forteresse, castel' },
    { id: 1091, word: 'castle', lang: 'it', expected: 'castello, fortezza, rocca' },
    { id: 1091, word: 'castle', lang: 'hu', expected: 'vár, várkastély, erőd' },
    { id: 1091, word: 'castle', lang: 'el', expected: 'κάστρο, φρούριο' },
    { id: 1098, word: 'artificial', lang: 'cs', expected: 'umělý, syntetický' },
    { id: 1098, word: 'artificial', lang: 'hu', expected: 'mesterséges, mű-' },
    { id: 1101, word: 'outdoor', lang: 'fr', expected: 'en plein air, extérieur, de plein air' },
    { id: 1101, word: 'outdoor', lang: 'it', expected: "all'aperto, esterno, da esterno" },
    { id: 1101, word: 'outdoor', lang: 'cs', expected: 'venkovní, pod širým nebem' },
    { id: 1101, word: 'outdoor', lang: 'hu', expected: 'szabadtéri, kültéri, szabadban lévő' },
    { id: 1101, word: 'outdoor', lang: 'ru', expected: 'на открытом воздухе, уличный, наружный' },

    // Batch 1102-1151
    { id: 1108, word: 'alright', lang: 'el', expected: 'εντάξει, σύμφωνοι, καλά' },
    { id: 1108, word: 'alright', lang: 'cs', expected: 'v pořádku, dobře, ujednáno' },
    { id: 1108, word: 'alright', lang: 'hu', expected: 'rendben, jó, minden oké' },
    { id: 1109, word: 'mild', lang: 'fr', expected: 'doux, clément, modéré' },
    { id: 1109, word: 'mild', lang: 'it', expected: 'mite, dolce, leggero' },
    { id: 1109, word: 'mild', lang: 'cs', expected: 'mírný, jemný, nepálivý' },
    { id: 1113, word: 'hockey', lang: 'el', expected: 'χόκεϊ' },
    { id: 1114, word: 'clever', lang: 'de', expected: 'klug, schlau, geschickt' },
    { id: 1114, word: 'clever', lang: 'fr', expected: 'intelligent, astucieux, ingénieux' },
    { id: 1114, word: 'clever', lang: 'cs', expected: 'chytrý, bystrý, vynalézavý' },
    { id: 1125, word: 'hesitate', lang: 'it', expected: 'esitare, tentennare, indugiare' },
    { id: 1125, word: 'hesitate', lang: 'el', expected: 'διστάζω, αμφιταλαντεύομαι' },
    { id: 1125, word: 'hesitate', lang: 'hu', expected: 'habozni, tétovázni, hezitálni' },
    { id: 1135, word: 'sadly', lang: 'it', expected: 'tristemente, con amarezza, purtroppo' },
    { id: 1135, word: 'sadly', lang: 'de', expected: 'traurigerweise, leider, wehmütig' },
    { id: 1135, word: 'sadly', lang: 'cs', expected: 'smutně, bohužel, s lítostí' },
    { id: 1145, word: 'sail', lang: 'de', expected: 'Segel, segeln, in See stechen' },
    { id: 1145, word: 'sail', lang: 'fr', expected: 'voile, faire de la voile, naviguer' },
    { id: 1145, word: 'sail', lang: 'it', expected: 'vela, veleggiare, navigare' },
    { id: 1147, word: 'sympathy', lang: 'it', expected: 'compassione, cordoglio, solidarietà' },
    { id: 1147, word: 'sympathy', lang: 'fr', expected: 'compassion, condoléances, empathie' },
    { id: 1147, word: 'sympathy', lang: 'es', expected: 'compasión, empatía, condolencia' },
    { id: 1148, word: 'inappropriate', lang: 'de', expected: 'unangemessen, unpassend, ungebührlich' },
    { id: 1148, word: 'inappropriate', lang: 'fr', expected: 'inapproprié, inadapté, inconvenant' },
    { id: 1148, word: 'inappropriate', lang: 'cs', expected: 'nevhodný, nepatřičný, nepřístojný' },
    { id: 1149, word: 'o\'clock', lang: 'de', expected: 'Uhr, Punkt auf der Uhr' },
    { id: 1149, word: 'o\'clock', lang: 'fr', expected: 'heures, pile à l\'heure' },
    { id: 1149, word: 'o\'clock', lang: 'it', expected: 'in punto, ore precise' },

    // Batch 1152-1201
    { id: 1154, word: 'boil', lang: 'fr', expected: 'bouillir, faire bouillir' },
    { id: 1154, word: 'boil', lang: 'de', expected: 'kochen, sieden, aufkochen' },
    { id: 1155, word: 'shallow', lang: 'de', expected: 'seicht, untief, oberflächlich' },
    { id: 1155, word: 'shallow', lang: 'fr', expected: 'peu profond, superficiel' },
    { id: 1158, word: 'outline', lang: 'de', expected: 'Umriss, Entwurf, Gliederung' },
    { id: 1158, word: 'outline', lang: 'cs', expected: 'obrys, nárys, osnova' },
    { id: 1162, word: 'disabled', lang: 'de', expected: 'behindert, deaktiviert' },
    { id: 1162, word: 'disabled', lang: 'fr', expected: 'handicapé, désactivé' },
    { id: 1164, word: 'steep', lang: 'fr', expected: 'raide, escarpé, abrupt' },
    { id: 1164, word: 'steep', lang: 'de', expected: 'steil, schroff, drastisch' },
    { id: 1178, word: 'stiff', lang: 'it', expected: 'rigido, intorpidito, teso' },
    { id: 1178, word: 'stiff', lang: 'ro', expected: 'rigid, țeapăn, înțepenit' },
    { id: 1184, word: 'sunny', lang: 'de', expected: 'sonnig, heiter' },
    { id: 1184, word: 'sunny', lang: 'fr', expected: 'ensoleillé, radieux' },
    { id: 1194, word: 'generation', lang: 'el', expected: 'γενιά, γενεά' },
    { id: 1197, word: 'president', lang: 'fi', expected: 'presidentti, puheenjohtaja' },

    // Batch 1202-1251
    { id: 1204, word: 'introduce', lang: 'fr', expected: 'présenter, faire les présentations, introduire' },
    { id: 1204, word: 'introduce', lang: 'de', expected: 'vorstellen, bekanntmachen, einführen' },
    { id: 1205, word: 'statement', lang: 'fr', expected: 'déclaration, affirmation, relevé' },
    { id: 1205, word: 'statement', lang: 'de', expected: 'Aussage, Erklärung, Kontoauszug' },
    { id: 1209, word: 'perspective', lang: 'de', expected: 'Perspektive, Blickwinkel, Sichtweise' },
    { id: 1209, word: 'perspective', lang: 'fr', expected: 'perspective, point de vue' },
    { id: 1214, word: 'relationship', lang: 'fr', expected: 'relation, rapport, lien' },
    { id: 1214, word: 'relationship', lang: 'it', expected: 'relazione, rapporto, legame' },
    { id: 1221, word: 'manage', lang: 'pt', expected: 'gerenciar, administrar, conseguir' },
    { id: 1224, word: 'weapon', lang: 'pt', expected: 'arma' },
    { id: 1229, word: 'growth', lang: 'fr', expected: 'croissance, développement, essor' },
    { id: 1229, word: 'growth', lang: 'it', expected: 'crescita, sviluppo, incremento' },
    { id: 1237, word: 'religion', lang: 'pt', expected: 'religião, crença' },
    { id: 1241, word: 'straight', lang: 'cs', expected: 'rovný, přímý, přímo' },
    { id: 1241, word: 'straight', lang: 'hi', expected: 'सीधा, सरल, साफ-साफ' },
    { id: 1247, word: 'easily', lang: 'fi', expected: 'helposti, vaivattomasti' },
    { id: 1247, word: 'easily', lang: 'hi', expected: 'आसानी से, सरलता से' },
    { id: 1251, word: 'target', lang: 'fr', expected: 'cible, objectif, viser' },
    { id: 1251, word: 'target', lang: 'it', expected: 'bersaglio, obiettivo, traguardo' },

    // Batch 1252-1301
    { id: 1266, word: 'express', lang: 'fi', expected: 'ilmaista, lausua, pika-' },
    { id: 1266, word: 'express', lang: 'hu', expected: 'kifejez, kinyilvánít, expressz' },
    { id: 1272, word: 'course', lang: 'cs', expected: 'kurz, chod, průběh' },
    { id: 1272, word: 'course', lang: 'fr', expected: 'cours, parcours, plat' },
    { id: 1278, word: 'quickly', lang: 'fr', expected: 'rapidement, vite' },
    { id: 1278, word: 'quickly', lang: 'it', expected: 'rapidamente, velocemente, presto' },
    { id: 1287, word: 'subject', lang: 'fr', expected: 'sujet, matière, question' },
    { id: 1287, word: 'subject', lang: 'cs', expected: 'předmět, téma, podmět' },
    { id: 1292, word: 'property', lang: 'de', expected: 'Eigenschaft, Eigentum, Immobilie' },
    { id: 1299, word: 'century', lang: 'sk', expected: 'storočie, vek' },
    { id: 1299, word: 'century', lang: 'hr', expected: 'stoljeće, vijek' },

    // Batch 1302-1351
    { id: 1303, word: 'flight', lang: 'ja', expected: '飛行、フライト、逃走' },
    { id: 1304, word: 'strange', lang: 'bg', expected: 'странен, необичаен' },
    { id: 1304, word: 'strange', lang: 'sl', expected: 'čuden, nenavaden' },
    { id: 1307, word: 'director', lang: 'de', expected: 'Direktor, Leiter, Regisseur' },
    { id: 1307, word: 'director', lang: 'fr', expected: 'directeur, réalisateur, dirigeant' },
    { id: 1315, word: 'decision', lang: 'de', expected: 'Entscheidung, Beschluss, Entschluss' },
    { id: 1315, word: 'decision', lang: 'el', expected: 'απόφαση, κρίση' },
    { id: 1316, word: 'strike', lang: 'fr', expected: 'faire la grève, grève, frapper' },
    { id: 1319, word: 'clearly', lang: 'da', expected: 'klart, tydeligt, åbenlyst' },
    { id: 1319, word: 'clearly', lang: 'fi', expected: 'selvästi, ilmeisesti, kirkkaasti' },
    { id: 1335, word: 'operate', lang: 'fr', expected: 'faire fonctionner, manœuvrer, opérer' },
    { id: 1339, word: 'possibly', lang: 'de', expected: 'möglicherweise, eventuell, vielleicht' },
    { id: 1339, word: 'possibly', lang: 'fr', expected: 'éventuellement, peut-être, possiblement' },
    { id: 1345, word: 'handle', lang: 'de', expected: 'Griff, Klinke, handhaben' },
    { id: 1345, word: 'handle', lang: 'it', expected: 'maniglia, impugnatura, gestire' },
    { id: 1350, word: 'advice', lang: 'de', expected: 'Rat, Ratschlag, Empfehlung' },

    // Batch 1352-1401
    { id: 1383, word: 'score', lang: 'de', expected: 'Punktestand, Spielstand, Treffer, punkten' },
    { id: 1399, word: 'arm', lang: 'de', expected: 'Arm, Oberarm, bewaffnen' },

    // Batch 1402-1451
    { id: 1405, word: 'easy', lang: 'ja', expected: '簡単な、易しい、容易な' },
    { id: 1448, word: 'cool', lang: 'pt', expected: 'fresco, legal, bacana, calmo' },

    // Batch 1452-1501
    { id: 1486, word: 'peace', lang: 'de', expected: 'Frieden, Ruhe' },

    // Batch 1502-1551
    { id: 1517, word: 'cell', lang: 'de', expected: 'Zelle, Gefängniszelle, Element' },

    // Batch 1552-1601
    { id: 1581, word: 'lie lay lain', lang: 'de', expected: 'liegen, ruhen' },
    { id: 1591, word: 'die', lang: 'sv', expected: 'dö, avlida, omkomma' },

    // Batch 1602-1651
    { id: 1618, word: 'bar', lang: 'de', expected: 'Bar, Riegel, Stange, Schenke' },

    // Batch 1652-1701
    { id: 1653, word: 'card', lang: 'it', expected: 'carta, cartolina, tessera' },

    // Batch 1702-1751
    { id: 1717, word: 'ear', lang: 'de', expected: 'Ohr, Gehör' },

    // Batch 1752-1801
    { id: 1777, word: 'identity', lang: 'de', expected: 'Identität, Wesen, Eigenart' },

    // Batch 1802-1851
    { id: 1807, word: 'produce', lang: 'ro', expected: 'a produce, a fabrica, a genera' },
    { id: 1845, word: 'shape', lang: 'de', expected: 'Form, Gestalt, formen' },

    // Batch 1852-1901
    { id: 1870, word: 'recycle', lang: 'de', expected: 'recyceln, wiederverwerten' },
    { id: 1898, word: 'network', lang: 'de', expected: 'Netzwerk, Netz, vernetzen' },

    // Batch 1902-1951
    { id: 1918, word: 'afternoon', lang: 'de', expected: 'Nachmittag' },
    { id: 1946, word: 'school', lang: 'de', expected: 'Schule; Fischschwarm' },

    // Batch 1952-2001
    { id: 1976, word: 'break', lang: 'es', expected: 'romper, quebrar, quebrantar' },
    { id: 1997, word: 'teach', lang: 'de', expected: 'lehren, unterrichten, beibringen' },

    // Batch 2002-2051
    { id: 2006, word: 'change', lang: 'cs', expected: 'měnit, změna, drobné (peníze)' },
    { id: 2033, word: 'stupid', lang: 'de', expected: 'dumm, albern, einfältig' },

    // Batch 2052-2101
    { id: 2053, word: 'practice', lang: 'pt', expected: 'praticar, exercitar, prática' },
    { id: 2099, word: 'tear tore torn', lang: 'zh', expected: '撕裂、扯破' },

    // Batch 2102-2151
    { id: 2107, word: 'shut shut shut', lang: 'it', expected: 'chiudere, serrare, sprangare' },
    { id: 2109, word: 'quit quit quit', lang: 'it', expected: 'smettere, licenziarsi, abbandonare' },

    // Batch 2152-2201
    { id: 2157, word: 'gender', lang: 'uk', expected: 'стать, гендер, рід (граматичний)' },
    { id: 2187, word: 'forth', lang: 'fr', expected: 'en avant, dehors, au jour' },

    // Batch 2202-2251
    { id: 2202, word: 'regime', lang: 'de', expected: 'Regime, Herrschaftssystem, Lebensweise' },
    { id: 2207, word: 'somewhat', lang: 'fr', expected: 'quelque peu, assez, plutôt' },

    // Batch 2252-2301
    { id: 2270, word: 'accomplish', lang: 'et', expected: 'saavutama, korda saatma, teostama' },
    { id: 2290, word: 'avenue', lang: 'ja', expected: '大通り、並木道、街路' },

    // Batch 2302-2351
    { id: 2310, word: 'joint', lang: 'de', expected: 'Gelenk, Verbindung, gemeinsam' },
    { id: 2350, word: 'palm', lang: 'de', expected: 'Handfläche, Palme' },

    // Batch 2352-2401
    { id: 2372, word: 'deputy', lang: 'de', expected: 'Stellvertreter, Vize, Vertreter' },
    { id: 2387, word: 'rose', lang: 'de', expected: 'Rose, rosafarben, stieg auf' },

    // Batch 2402-2451
    { id: 2407, word: 'emphasis', lang: 'pt', expected: 'ênfase, destaque, realce, foco' },
    { id: 2424, word: 'sheriff', lang: 'pt', expected: 'xerife' },

    // Batch 2452-2501
    { id: 2456, word: 'chamber', lang: 'cs', expected: 'komora, sněmovna, síň' },
    { id: 2496, word: 'tap', lang: 'de', expected: 'Wasserhahn, tippen, klopfen' },

    // Batch 2502-2551
    { id: 2506, word: 'bye', lang: 'da', expected: 'hej hej, farvel, vi ses' },
    { id: 2513, word: 'guideline', lang: 'de', expected: 'Richtlinie, Leitfaden, Leitlinie' },

    // Batch 2552-2601
    { id: 2559, word: 'bench', lang: 'de', expected: 'Bank, Sitzbank, Werkbank' },
    { id: 2591, word: 'flee', lang: 'de', expected: 'fliehen, flüchten, entkommen' },

    // Batch 2602-2651
    { id: 2609, word: 'dumb', lang: 'pt', expected: 'mudo, bobo, burro' },
    { id: 2627, word: 'cabinet', lang: 'de', expected: 'Schrank, Vitrine, Kabinett' },

    // Batch 2652-2701
    { id: 2671, word: 'bishop', lang: 'de', expected: 'Bischof, Läufer (Schach)' },
    { id: 2699, word: 'alien', lang: 'de', expected: 'Außerirdischer, Fremder, fremdartig, wesensfremd' },

    // Batch 2702-2751
    { id: 2743, word: 'barrel', lang: 'de', expected: 'Fass, Gewehrlauf, Barrel' },
    { id: 2729, word: 'till', lang: 'de', expected: 'bis, bis zu, Kasse, beackern' },

    // Batch 2752-2801
    { id: 2755, word: 'stroke', lang: 'de', expected: 'Schlaganfall, Hieb, Strich, streicheln' },
    { id: 2757, word: 'duck', lang: 'de', expected: 'Ente, sich bücken, ausweichen' },

    // Batch 2802-2851
    { id: 2803, word: 'log', lang: 'de', expected: 'Holzklotz, Baumstamm, Protokoll, Logbuch' },
    { id: 2811, word: 'temple', lang: 'de', expected: 'Tempel, Schläfe (Anatomie)' },

    // Batch 2852-2901
    { id: 2861, word: 'eager', lang: 'de', expected: 'eifrig, begierig, ungeduldig, bestrebt' },
    { id: 2901, word: 'plead', lang: 'de', expected: 'flehen, anflehen, plädieren, vor Gericht aussagen' },

    // Batch 2902-2951
    { id: 2907, word: 'stem', lang: 'de', expected: 'Stängel, Stamm, Wortstamm, herrühren' },
    { id: 2908, word: 'guilt', lang: 'de', expected: 'Schuld, Schuldgefühl' },

    // Batch 2952-3001
    { id: 2960, word: 'loser', lang: 'de', expected: 'Verlierer, Versager' },
    { id: 2975, word: 'slam', lang: 'de', expected: 'zuschlagen, knallen, scharf kritisieren' },

    // Batch 3002-3051
    { id: 3002, word: 'omit', lang: 'de', expected: 'auslassen, weglassen, übergehen, aussparen' },
    { id: 3016, word: 'pine', lang: 'de', expected: 'Kiefer, Fichte, Pinie; sich sehnen, schmachten' },

    // Batch 3052-3101
    { id: 3066, word: 'sustainable', lang: 'de', expected: 'nachhaltig, zukunftsfähig' },
    { id: 3092, word: 'output', lang: 'de', expected: 'Leistung, Produktionsmenge, Ausgabe' },

    // Batch 3102-3151
    { id: 3114, word: 'liability', lang: 'de', expected: 'Haftung, Verbindlichkeit, Passiva, Belastung' },
    { id: 3149, word: 'immune', lang: 'de', expected: 'immun, resistent, geschützt, gefeit' },

    // Batch 3152-3201
    { id: 3158, word: 'elbow', lang: 'cs', expected: 'loket, postrkovat loktem' },
    { id: 3195, word: 'cage', lang: 'de', expected: 'Käfig, Gehege; einsperren' },

    // Batch 3202-3251
    { id: 3232, word: 'automatic', lang: 'de', expected: 'automatisch, selbsttätig' },
    { id: 3243, word: 'skull', lang: 'de', expected: 'Schädel, Totenkopf' },

    // Batch 3252-3301
    { id: 3264, word: 'tuck', lang: 'de', expected: 'hineinstecken, einstecken, feststecken, unterbringen' },
    { id: 3301, word: 'graph', lang: 'de', expected: 'Diagramm, Graph, Schaubild, Kurvenbild' },

    // Batch 3302-3351
    { id: 3313, word: 'electoral', lang: 'de', expected: 'Wahl-, wahlbezogen, elektoral' },
    { id: 3338, word: 'accommodate', lang: 'de', expected: 'unterbringen, beherbergen, aufnehmen, entgegenkommen' },

    // Batch 3352-3401
    { id: 3393, word: 'fever', lang: 'fr', expected: 'fièvre' },
    { id: 3391, word: 'openly', lang: 'ru', expected: 'открыто, откровенно, прямо, гласно' },

    // Batch 3402-3451
    { id: 3421, word: 'jar', lang: 'da', expected: 'krukke, syltetøjsglas, rystelse' },
    { id: 3415, word: 'rookie', lang: 'fi', expected: 'tulokas, vasta-alkaja, keltanokka' },

    // Batch 3452-3501
    { id: 3475, word: 'validity', lang: 'de', expected: 'Gültigkeit, Rechtskraft, Stichhaltigkeit' },
    { id: 3455, word: 'premium', lang: 'fr', expected: 'prime, cotisation, surcoût, haut de gamme' },

    // Batch 3502-3551
    { id: 3502, word: 'sodium', lang: 'fr', expected: 'sodium' },
    { id: 3505, word: 'ipad', lang: 'es', expected: 'iPad' },

    // Batch 3552-3601
    { id: 3552, word: 'defender', lang: 'de', expected: 'Verteidiger, Abwehrspieler' },
    { id: 3574, word: 'chop', lang: 'it', expected: 'tagliare, tritare; costoletta' },

    // Batch 3602-3651
    { id: 3623, word: 'induce', lang: 'de', expected: 'herbeiführen, auslösen, veranlassen' },
    { id: 3641, word: 'peel', lang: 'fr', expected: 'éplucher, peler, décortiquer; peau, zeste' },

    // Batch 3652-3701
    { id: 3696, word: 'graduation', lang: 'fr', expected: "remise des diplômes, collation des grades, fin d'études" },
    { id: 3692, word: 'reluctant', lang: 'fr', expected: 'réticent, hésitant, peu disposé' },

    // Batch 3702-3751
    { id: 3702, word: 'casualty', lang: 'fr', expected: 'victime, blessé, perte' },
    { id: 3751, word: 'October', lang: 'de', expected: 'Oktober' },

    // Batch 3752-3801
    { id: 3774, word: 'put', lang: 'de', expected: 'setzen, stellen, legen, platzieren' },
    { id: 3782, word: 'focus on', lang: 'fr', expected: 'se concentrer sur, se focaliser sur' },

    // Batch 3802-3851
    { id: 3802, word: 'than', lang: 'fr', expected: 'que, de' },
    { id: 3851, word: 'hello', lang: 'fr', expected: 'bonjour, salut, allô' },

    // Batch 3852-3901
    { id: 3852, word: 'okay', lang: 'ro', expected: 'bine, de acord, în regulă' },
    { id: 3892, word: 'kettle', lang: 'hi', expected: 'केतली' },

    // Batch 3902-3951
    { id: 3917, word: 'template', lang: 'cs', expected: 'šablona, předloha' },
    { id: 3929, word: 'laugh at', lang: 'de', expected: 'auslachen, lachen über' },

    // Batch 3952-4001
    { id: 3954, word: 'yob', lang: 'de', expected: 'Hooligan, Schläger, Rabauke' },
    { id: 3983, word: 'shovel', lang: 'fr', expected: 'pelle, pelleter' },

    // Batch 4002-4051
    { id: 4004, word: 'ladder', lang: 'fr', expected: 'échelle' },
    { id: 4050, word: 'pancake', lang: 'fr', expected: 'crêpe, pancake' },

    // Batch 4052-4101
    { id: 4066, word: 'beat it', lang: 'de', expected: 'zieh Leine, hau ab, mach dich fort' },
    { id: 4092, word: 'shed', lang: 'fr', expected: 'perdre, muer, se dépouiller de' },

    // Batch 4102-4151
    { id: 4102, word: 'dream of', lang: 'de', expected: 'träumen von, schwärmen von' },
    { id: 4109, word: 'plug in', lang: 'fr', expected: 'brancher, enficher, connecter' },

    // Batch 4152-4201
    { id: 4153, word: 'look after', lang: 'fr', expected: "s'occuper de, veiller sur, garder" },
    { id: 4179, word: 'maiden', lang: 'ja', expected: '乙女、少女、処女航海などの「初の」' },

    // Batch 4202-4251
    { id: 4211, word: 'foot feet', lang: 'fr', expected: 'pied — pieds' },
    { id: 4239, word: 'come in', lang: 'fr', expected: 'entrer, pénétrer, faire son entrée, arriver' },

    // Batch 4252-4301
    { id: 4271, word: 'rasp', lang: 'de', expected: 'Raspel; kratzendes Geräusch, Krächzen' },
    { id: 4278, word: 'faced', lang: 'de', expected: 'konfrontiert, gegenüberstehend; verkleidet' },

    // Batch 4302-4351
    { id: 4319, word: 'at home', lang: 'de', expected: 'zu Hause, daheim' },
    { id: 4344, word: 'safe travels', lang: 'de', expected: 'gute Reise, gute Fahrt, komm gut an' },

    // Batch 4352-4401
    { id: 4374, word: 'participle', lang: 'de', expected: 'Partizip, Mittelwort' },
    { id: 4391, word: 'shoelace', lang: 'fr', expected: 'lacet, lacet de chaussure' },

    // Batch 4402-4451
    { id: 4424, word: 'bear bore born', lang: 'es', expected: 'soportar, aguantar, dar a luz' },
    { id: 4449, word: 'scrambled eggs', lang: 'de', expected: 'Rührei, Rühreier' },

    // Batch 4452-4501
    { id: 4457, word: 'restroom', lang: 'fr', expected: 'toilettes, sanitaires' },
    { id: 4488, word: 'guy', lang: 'da', expected: 'fyr, gut, mand' },

    // Batch 4502-4551
    { id: 4506, word: 'cooker', lang: 'de', expected: 'Herd, Küchenherd, Kocher' },
    { id: 4545, word: 'cupboard', lang: 'de', expected: 'Schrank, Küchenschrank, Geschirrschrank' },

    // Batch 4552-4601
    { id: 4565, word: 'debt', lang: 'de', expected: 'Schulden, Schuld, Verbindlichkeit' },
    { id: 4591, word: 'outcome', lang: 'de', expected: 'Ergebnis, Resultat, Ausgang' },

    // Batch 4602-4651
    { id: 4624, word: 'printing', lang: 'it', expected: 'stampa, stampaggio, tipografia' },
    { id: 4637, word: 'pub', lang: 'de', expected: 'Pub, Kneipe, Gasthaus' },

    // Batch 4652-4701
    { id: 4661, word: 'offence', lang: 'ro', expected: 'infracțiune, abatere, ofensă' },
    { id: 4693, word: 'learn', lang: 'de', expected: 'lernen, studieren, erfahren' },

    // Batch 4702-4751
    { id: 4705, word: 'movie', lang: 'ko', expected: '영화' },
    { id: 4746, word: 'least', lang: 'ko', expected: '가장 적은, 최소한, 가장 적게' },

    // Batch 4752-4801
    { id: 4773, word: 'divorced', lang: 'de', expected: 'geschieden' },
    { id: 4787, word: 'indirect', lang: 'de', expected: 'indirekt, mittelbar, umwegig' },

    // Batch 4802-4851
    { id: 4802, word: 'aged', lang: 'de', expected: 'gealtert, betagt, gereift' },
    { id: 4851, word: 'general', lang: 'de', expected: 'allgemein, universell; General' },

    // Batch 4852-4901
    { id: 4880, word: 'pointed', lang: 'de', expected: 'spitz, zugespitzt, pointiert' },
    { id: 4894, word: 'scared', lang: 'de', expected: 'verängstigt, ängstlich, erschrocken' },

    // Batch 4902-4951
    { id: 4945, word: 'intend', lang: 'cs', expected: 'mít v úmyslu, zamýšlet, hodlat' },
    { id: 4942, word: 'imagine', lang: 'de', expected: 'sich vorstellen, ausmalen, wähnen' },

    // Batch 4952-5001
    { id: 4962, word: 'refuse', lang: 'de', expected: 'ablehnen, sich weigern, verweigern' },
    { id: 4980, word: 'rid rid rid', lang: 'de', expected: 'befreien, entledigen, loswerden' },

    // Batch 5002-5051
    { id: 5050, word: 'cheer for', lang: 'da', expected: 'heppe på, bakke op om' },
    { id: 5043, word: 'postpone', lang: 'fr', expected: 'reporter, ajourner, différer' },

    // Batch 5052-5101
    { id: 5053, word: 'preposition', lang: 'fr', expected: 'préposition' },
    { id: 5065, word: 'a piece of cake', lang: 'fr', expected: "du gâteau, un jeu d'enfant, simple comme bonjour" },

    // Batch 5102-5151
    { id: 5128, word: 'set off', lang: 'fr', expected: 'se mettre en route, partir; déclencher, faire exploser; faire ressortir' },
    { id: 5140, word: 'trump', lang: 'de', expected: 'Trumpf; übertrumpfen, stechen' },

    // Batch 5152-5201
    { id: 5158, word: 'lash out', lang: 'es', expected: 'arremeter, despotricar, abalanzarse' },
    { id: 5181, word: 'mitigate', lang: 'de', expected: 'mildern, abschwächen, abfedern' },

    // Batch 5202-5251
    { id: 5216, word: 'reciprocate', lang: 'ja', expected: 'お返しをする、報いる、応える' },
    { id: 5246, word: 'hypocritical', lang: 'el', expected: 'υποκριτικός, φαρισαϊκός' },

    // Batch 5252-5301
    { id: 5255, word: 'imminent', lang: 'de', expected: 'bevorstehend, unmittelbar bevorstehend, drohend' },
    { id: 5270, word: 'impudent', lang: 'de', expected: 'unverschämt, dreist, frech' },

    // Batch 5302-5351
    { id: 5302, word: 'concealment', lang: 'es', expected: 'ocultamiento, encubrimiento, camuflaje' },
    { id: 5337, word: 'behold beheld beheld', lang: 'de', expected: 'erblicken, schauen, gewahr werden' },

    // Batch 5352-5401
    { id: 5401, word: 'smuggle', lang: 'de', expected: 'schmuggeln, einschmuggeln, herausschmuggeln' },
    { id: 5376, word: 'salvage', lang: 'pl', expected: 'ratowanie mienia, wydobycie wraku; ocalić mienie, wydobyć' },

    // Batch 5402-5451
    { id: 5407, word: 'span', lang: 'pt', expected: 'abranger, estender-se por, cruzar' },
    { id: 5421, word: 'stall', lang: 'fr', expected: 'caler, tergiverser, bloquer' },

    // Batch 5452-5501
    { id: 5485, word: 'abrogate', lang: 'de', expected: 'aufheben, für nichtig erklären, außer Kraft setzen' },
    { id: 5496, word: 'acquit', lang: 'it', expected: 'assolvere, scagionare, dichiarare non colpevole' },

    // Batch 5502-5551
    { id: 5514, word: 'amortize', lang: 'lt', expected: 'amortizuoti, išmokėti dalimis' },
    { id: 5531, word: 'allege', lang: 'fr', expected: 'alléguer, prétendre, arguer' },

    // Batch 5552-5601
    { id: 5552, word: 'assent', lang: 'de', expected: 'Zustimmung, zustimmen, einwilligen' },
    { id: 5601, word: 'perishable', lang: 'de', expected: 'leicht verderblich, vergänglich, hinfällig' },

    // Batch 5602-5651
    { id: 5607, word: 'perquisite', lang: 'ru', expected: 'привилегия, служебная льгота, дополнительное благо' },
    { id: 5645, word: 'politic', lang: 'de', expected: 'klug, umsichtig, wohlüberlegt' },

    // Batch 5652-5701
    { id: 5697, word: 'fare', lang: 'cs', expected: 'jízdné, tarif dopravy' },
    { id: 5695, word: 'famine', lang: 'de', expected: 'Hungersnot, Massenhunger' },

    // Batch 5702-5751
    { id: 5746, word: 'forte', lang: 'de', expected: 'Stärke, Spezialität, Paradedisziplin, Forte (laut)' },
    { id: 5715, word: 'filament', lang: 'pt', expected: 'filamento, fio incandescente, fibra' },

    // Batch 5752-5801
    { id: 5798, word: 'guile', lang: 'fr', expected: 'ruse, fourberie, artifice' },
    { id: 5791, word: 'gamut', lang: 'de', expected: 'Tonleiter, Spektrum, ganze Bandbreite' },

    // Batch 5802-5851
    { id: 5808, word: 'fulminate', lang: 'ru', expected: 'громить, метать громы и молнии, бурно протестовать, взрываться' },
    { id: 5803, word: 'castigate', lang: 'de', expected: 'züchtigen, scharf kritisieren, maßregeln' },

    // Batch 5852-5901
    { id: 5889, word: 'remonstrate', lang: 'it', expected: 'rimostrare, protestare, obiettare, contestare' },
    { id: 5890, word: 'renege', lang: 'de', expected: 'sein Wort brechen, einen Rückzieher machen, vertragsbrüchig werden' },

    // Batch 5902-5951
    { id: 5909, word: 'scrupulous', lang: 'de', expected: 'gewissenhaft, peinlich genau, sorgfältig, skrupulös' },
    { id: 5922, word: 'spendthrift', lang: 'fr', expected: 'dépensier, panier percé, prodigue, dissipateur' },

    // Batch 5952-6001
    { id: 5971, word: 'turpitude', lang: 'de', expected: 'Schändlichkeit, Niedertracht, Verdorbenheit, Lasterhaftigkeit' },
    { id: 5980, word: 'upbraid', lang: 'de', expected: 'tadeln, Vorwürfe machen, rügen' },

    // Batch 6002-6051
    { id: 6050, word: 'avocation', lang: 'fr', expected: 'passe-temps, violon d’Ingres, hobby, occupation secondaire' },
    { id: 6037, word: 'arrant', lang: 'de', expected: 'ausgemacht, vollkommen, schier, unverhohlen' },

    // Batch 6052-6101
    { id: 6058, word: 'beatify', lang: 'de', expected: 'seligsprechen, selig preisen, beglücken' },
    { id: 6083, word: 'canard', lang: 'de', expected: 'Zeitungsente, Falschmeldung, Gerücht, Fake News' },

    // Batch 6102-6151
    { id: 6146, word: 'cursory', lang: 'it', expected: 'superficiale, rapido, sommario' },
    { id: 6137, word: 'coterie', lang: 'de', expected: 'Koterie, Clique, Zirkel, geschlossene Gesellschaft' },

    // Batch 6152-6201
    { id: 6174, word: 'disabuse', lang: 'de', expected: 'eines Besseren belehren, enttäuschen' },
    { id: 6158, word: 'demur', lang: 'it', expected: 'obiettare, fare obiezioni, esitare' },

    // Batch 6202-6251
    { id: 6229, word: 'equivocate', lang: 'de', expected: 'zweideutig reden, lavieren, herumreden' },
    { id: 6243, word: 'excoriate', lang: 'fr', expected: 'fustiger, vitrioler, écorcher vivement' },

    // Batch 6252-6301
    { id: 6267, word: 'exuberant', lang: 'de', expected: 'überschwänglich, voller Lebensfreude, üppig, ausgelassen' },
    { id: 6297, word: 'gainsay', lang: 'fr', expected: 'contredire, démentir, contester, nier' },

    // Batch 6302-6351
    { id: 6351, word: 'impious', lang: 'de', expected: 'gottlos, pietätlos, unfromm' },
    { id: 6307, word: 'glib', lang: 'de', expected: 'schlagfertig aber oberflächlich, zungengewandt' },

    // Batch 6352-6401
    { id: 6353, word: 'implode', lang: 'de', expected: 'implodieren, nach innen zusammenstürzen' },
    { id: 6394, word: 'ingenuous', lang: 'ru', expected: 'простодушный, наивный, искренний' },

    // Batch 6402-6451
    { id: 6436, word: 'knell', lang: 'fr', expected: 'glas funèbre, sonnerie de mort' },
    { id: 6408, word: 'insolent', lang: 'ru', expected: 'дерзкий, наглый, высокомерный' },

    // Batch 6452-6501
    { id: 6491, word: 'mercurial', lang: 'kk', expected: 'құбылмалы, көңіл-күйі тез өзгергіш, сынаптай ойнақшыған' },
    { id: 6486, word: 'maxim', lang: 'kk', expected: 'өсиет, нақыл сөз, өмірлік қағида, қағидат' },

    // Batch 6502-6551
    { id: 6510, word: 'ostracism', lang: 'ru', expected: 'остракизм, изгнание, бойкот, общественное неприятие' },
    { id: 6544, word: 'remiss', lang: 'fr', expected: 'négligent, insouciant, coupable de manquement' },

    // Batch 6552-6601
    { id: 6556, word: 'scintilla', lang: 'ru', expected: 'крупица, искорка, малейшая доля' },
    { id: 6573, word: 'singular', lang: 'ru', expected: 'исключительный, выдающийся, своеобразный, редкий' },

    // Batch 6602-6651
    { id: 6609, word: 'sonorous', lang: 'fr', expected: 'sonore, résonnant, harmonieux' },
    { id: 6646, word: 'teetotaler', lang: 'kk', expected: 'мүлде ішімдік татпайтын адам, салауатты жан' },

    // Batch 6652-6701
    { id: 6652, word: 'temporize', lang: 'it', expected: 'temporeggiare, prendere tempo, esitare' },
    { id: 6669, word: 'toady', lang: 'hu', expected: 'talpnyaló, hízelgő, talpnyaló alak' },

    // Batch 6702-6751
    { id: 6717, word: 'bind bound bound', lang: 'da', expected: 'binde, samle, forpligte' },
    { id: 6747, word: 'better safe than sorry', lang: 'kk', expected: 'сақтансаң сақтайды, өкінгенше сақтанған жөн' },

    // Batch 6752-6801
    { id: 6752, word: 'false', lang: 'fi', expected: 'väärä, virheellinen, epätosi' },
    { id: 6753, word: 'cheatsheet', lang: 'el', expected: 'σκονάκι' },

    // Batch 6802-6851
    { id: 6847, word: 'May', lang: 'de', expected: 'Mai' },
    { id: 6834, word: 'lantern', lang: 'fr', expected: 'lanterne' },

    // Batch 6852-6901
    { id: 6878, word: 'wear', lang: 'ru', expected: 'носить, надевать, быть одетым в' },
    { id: 6896, word: 'mean', lang: 'pt', expected: 'significar, querer dizer' },

    // Batch 6902-6951
    { id: 6945, word: 'per', lang: 'de', expected: 'pro, je' },
    { id: 6951, word: 'aboard', lang: 'fa', expected: 'سوار بر کشتی، درون هواپیما' },

    // Batch 6952-7001
    { id: 6953, word: 'outage', lang: 'de', expected: 'Ausfall, Stromausfall' },
    { id: 7000, word: 'inexhaustible', lang: 'cs', expected: 'nevyčerpatelný, nezdolný' },

    // Batch 7002-7049 (Final batch!)
    { id: 7009, word: 'monstrous', lang: 'uk', expected: 'чудовищний, потворний, страхітливий' },
    { id: 7015, word: 'parapet', lang: 'pl', expected: 'barierka, balustrada' }
  ];

  // 1. Fetch current Firestore shared/vocabulary_updates
  console.log('1. Fetching current Firestore shared/vocabulary_updates...');
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_ID}/databases/(default)/documents/${FS_DOC_PATH}?key=${FS_API_KEY}`;
  const fsRes = await fetch(fsUrl);
  if (!fsRes.ok) throw new Error(`HTTP ${fsRes.status} fetching Firestore`);
  const fsData = await fsRes.json();
  const fsMap = JSON.parse(fsData.fields?.updatesJson?.stringValue || '{}');
  console.log(`   Current entries in Firestore: ${Object.keys(fsMap).length}`);

  const words = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  const wordsMap = new Map(words.map(w => [w.id, w]));

  // Helper to load calibrations from a batch file
  function loadBatchObj(filename) {
    const filePath = path.join(ROOT_DIR, 'scripts', filename);
    const mod = require(filePath);
    const calibs = mod.batchCalibrations || mod.calibrations || mod;
    const out = {};
    for (const [id, entry] of Object.entries(calibs)) {
      if (entry.translations) {
        out[id] = { ru: entry.translation, ...entry.translations };
      } else {
        out[id] = entry;
      }
    }
    return out;
  }

  // Batches 1 to 133 (words 1-6651) are hard-baked into words.json in all builds.
  // We keep verified sample check words for batches 1-133 to ensure verification on readback,
  // and maintain full 36-locale payload for active batches 134-141 (words 6652-7049, 398 words)
  // to ensure dynamic OTA update coverage while staying safely under the 1024 KB Firestore limit.
  const activeBatchFiles = [
    'apply_batch_6652_6701_calibrations.cjs',
    'apply_batch_6702_6751_calibrations.cjs',
    'apply_batch_6752_6801_calibrations.cjs',
    'apply_batch_6802_6851_calibrations.cjs',
    'apply_batch_6852_6901_calibrations.cjs',
    'apply_batch_6902_6951_calibrations.cjs',
    'apply_batch_6952_7001_calibrations.cjs',
    'apply_batch_7002_7049_calibrations.cjs'
  ];

  let mergedCount = 0;
  const activeBatchIds = new Set();

  for (const batchFile of activeBatchFiles) {
    const batchCalibs = loadBatchObj(batchFile);
    for (const [idStr, map] of Object.entries(batchCalibs)) {
      activeBatchIds.add(idStr);
      const idNum = parseInt(idStr, 10);
      const localW = wordsMap.get(idNum);
      if (!fsMap[idStr]) {
        fsMap[idStr] = {
          id: idNum,
          word: localW?.word || '',
          translations: {}
        };
      }
      for (const [lang, val] of Object.entries(map)) {
        if (lang === 'ru') {
          fsMap[idStr].translation = val;
        } else {
          if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
          fsMap[idStr].translations[lang] = val;
        }
      }
      delete fsMap[idStr].updatedAt;
      mergedCount++;
    }
  }

  // Also ensure key sample check words are synchronized
  for (const check of sampleChecks) {
    const localW = wordsMap.get(check.id);
    if (!localW) continue;
    const idStr = String(check.id);
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: check.id,
        word: localW.word,
        translations: {}
      };
    }
    if (check.lang === 'ru') {
      fsMap[idStr].translation = localW.translation;
    } else {
      if (!fsMap[idStr].translations) fsMap[idStr].translations = {};
      fsMap[idStr].translations[check.lang] = localW.translations?.[check.lang];
    }
    delete fsMap[idStr].updatedAt;
  }

  // Merge functional grammar words exclusion (category: Advanced, level: C2)
  const functionalIds = [1396, 1677, 2049, 3786, 3788, 3797, 3802, 3819, 3842, 3854, 3859, 3865, 3909, 3910, 3911, 3912, 4005, 4075, 4077];
  for (const id of functionalIds) {
    const localW = wordsMap.get(id);
    if (!localW) continue;
    const idStr = String(id);
    if (!fsMap[idStr]) {
      fsMap[idStr] = {
        id: localW.id,
        word: localW.word,
        translations: {}
      };
    }
    fsMap[idStr].category = 'Advanced';
    fsMap[idStr].level = 'C2';
    delete fsMap[idStr].updatedAt;
  }

  console.log(`   Merged active batches (1252-1851), sample checks (1-1251), and functional exclusions into Firestore updates.`);

  // 2. Prune redundant legacy entries to preserve plenty of headroom (< 1024 KB)
  let pruned = 0;
  const sampleCheckIdLangs = new Map();
  for (const c of sampleChecks) {
    const idStr = String(c.id);
    if (!sampleCheckIdLangs.has(idStr)) sampleCheckIdLangs.set(idStr, new Set());
    sampleCheckIdLangs.get(idStr).add(c.lang);
  }

  const functionalIdStrs = functionalIds.map(String);

  for (const [idStr, entry] of Object.entries(fsMap)) {
    if (activeBatchIds.has(idStr) || functionalIdStrs.includes(idStr)) {
      // Active batch (recent ~600 words) or functional exclusion: keep full
      continue;
    }
    if (sampleCheckIdLangs.has(idStr)) {
      // Early baked batch: keep only verified sample check languages to save Firestore space
      const allowed = sampleCheckIdLangs.get(idStr);
      if (!allowed.has('ru')) delete entry.translation;
      if (entry.translations) {
        for (const lang of Object.keys(entry.translations)) {
          if (!allowed.has(lang)) delete entry.translations[lang];
        }
      }
      continue;
    }
    // Any entry outside active batches and sample checks is pruned
    delete fsMap[idStr];
    pruned++;
  }

  for (const entry of Object.values(fsMap)) {
    delete entry.updatedAt;
  }

  const finalPayloadStr = JSON.stringify(fsMap);
  const finalBytes = Buffer.byteLength(finalPayloadStr, 'utf8');
  console.log(`\n2. Firestore payload optimization:`);
  console.log(`   - Pruned redundant legacy entries: ${pruned}`);
  console.log(`   - Remaining entries in Firestore: ${Object.keys(fsMap).length}`);
  console.log(`   - Final payload size: ${finalBytes} bytes (${(finalBytes / 1024).toFixed(1)} KB / 1024 KB max)`);
  console.log(`   - Headroom remaining: ${(1024 - finalBytes / 1024).toFixed(1)} KB`);

  if (finalBytes > 1048576) {
    throw new Error(`Payload exceeds 1MB Firestore limit (${finalBytes} bytes)! Aborting write.`);
  }

  // 3. Authenticate with Firebase Admin
  console.log('\n3. Authenticating with Firebase Admin...');
  const idToken = await getFirebaseAuthToken();
  console.log('   Authenticated successfully.');

  // 4. Patch Firestore
  console.log('4. Writing updates to Firestore shared/vocabulary_updates (OTA)...');
  const patchPayload = JSON.stringify({
    fields: {
      updatesJson: { stringValue: finalPayloadStr },
      updatedAt: { integerValue: String(Date.now()) },
      totalCount: { integerValue: String(Object.keys(fsMap).length) }
    }
  });

  const patchRes = await fetch(fsUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: patchPayload
  });

  if (!patchRes.ok) {
    const patchErr = await patchRes.text();
    throw new Error(`Firestore PATCH failed: HTTP ${patchRes.status}: ${patchErr}`);
  }

  const patchData = await patchRes.json();
  console.log('   Successfully patched shared/vocabulary_updates in Cloud Firestore!');
  console.log(`   Doc update time: ${patchData.updateTime}`);

  // 5. Verification read-back
  console.log('\n5. Verifying read-back from Firestore...');
  const verifyRes = await fetch(fsUrl);
  if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status} verifying Firestore readback`);
  const verifyData = await verifyRes.json();
  const verifyMap = JSON.parse(verifyData.fields?.updatesJson?.stringValue || '{}');

  for (const check of sampleChecks) {
    const wordEntry = verifyMap[String(check.id)];
    const readVal = check.lang === 'ru' ? wordEntry?.translation : wordEntry?.translations?.[check.lang];
    console.log(`   - ID ${check.id} (${check.word}) [${check.lang}]: "${readVal}"`);
    if (readVal !== check.expected) {
      throw new Error(`Verification mismatch on read-back for ID ${check.id} (${check.lang})! Got "${readVal}", expected "${check.expected}"`);
    }
  }

  console.log('\n✅ OTA Update verified successfully! Users will immediately receive all calibrations over-the-air.');
}

run().catch(err => {
  console.error('\n❌ OTA sync failed:', err);
  process.exit(1);
});
