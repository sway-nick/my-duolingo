const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 401: rush (fix imperatives and clean verb/noun senses across 8 languages)
  {
    id: 401,
    translation: 'спешить, торопиться, спешка',
    translations: {
      uk: 'поспішати, квапитися, поспіх',
      fr: 'se dépêcher, précipiter, ruée',
      cs: 'pospíchat, spěchat, spěch',
      sk: 'ponáhľať sa, spěchať, zhon',
      bg: 'бързам, бързане, натиск',
      et: 'kiirustama, tormama, rutt',
      ro: 'a se grăbi, grabă, năvală',
      sl: 'hiteti, naglica, juriš'
    }
  },
  // ID 402: gate (fix Russian plurale tantum calque to singular noun across 11 languages)
  {
    id: 402,
    translations: {
      fr: 'porte, grille, portail',
      de: 'Tor, Pforte, Flugsteig',
      it: 'cancello, porta, varco',
      cs: 'brána, branka, východ',
      sk: 'brána, bránka, východ',
      bg: 'порта, врата, изход',
      el: 'πύλη, πόρτα',
      et: 'värav, pääsla',
      hu: 'kapu, átjáró',
      ro: 'poartă, ieșire',
      pl: 'brama, furtka, bramka'
    }
  },
  // ID 406: recover (fix "restore PC backup" to "heal, recover health and assets" across 11 languages)
  {
    id: 406,
    translation: 'выздоравливать, восстанавливаться, возвращать',
    translations: {
      uk: 'одужувати, відновлюватися, повертати',
      fr: 'se rétablir, récupérer, guérir',
      it: 'riprendersi, recuperare, guarire',
      cs: 'zotavit se, uzdravit se, obnovit',
      sk: 'zotaviť sa, uzdraviť sa, obnoviť',
      sl: 'okrevati, opomoči se, obnoviti',
      bg: 'възстановявам се, оздравявам',
      el: 'αναρρώνω, συνέρχομαι, ανακτώ',
      hu: 'felépül, meggyógyul, visszaszerez',
      lt: 'pasveikti, atsigauti, atgauti',
      ro: 'a se recupera, a se reface, a se însănătoși'
    }
  },
  // ID 413: deeply (fix adjective to adverb across 17 languages)
  {
    id: 413,
    translations: {
      fr: 'profondément',
      it: 'profondamente',
      cs: 'hluboce',
      sk: 'hlboko',
      da: 'dybt',
      sv: 'djupt',
      fi: 'syvästi',
      et: 'sügavalt',
      hu: 'mélyen',
      el: 'βαθιά',
      lt: 'giliai',
      lv: 'dziļi',
      ro: 'profund, adânc',
      ja: '深く、心から',
      ko: '깊이, 깊게',
      ar: 'بعمق',
      vi: 'sâu sắc'
    }
  },
  // ID 416: fairly (fix "VERY" calque to "moderately, rather, justly" across 20 languages)
  {
    id: 416,
    translation: 'довольно, весьма, справедливо',
    translations: {
      uk: 'досить, доволі, справедливо',
      fr: 'assez, plutôt, équitablement',
      it: 'abbastanza, piuttosto, equamente',
      bg: 'доста, сравнително, справедливо',
      cs: 'docela, poměrně, spravedlivě',
      sk: 'celkom, pomerne, spravodlivo',
      da: 'ganske, temmelig, retfærdigt',
      sv: 'ganska, tämligen, rättvist',
      el: 'αρκετά, δίκαια',
      et: 'üsna, võrdlemisi, õiglaselt',
      hr: 'prilično, dosta, pravedno',
      hu: 'eléggé, meglehetősen, igazságosan',
      ja: 'かなり、公正に',
      kk: 'айтарлықтай, әділ',
      ko: '상당히, 꽤, 공정하게',
      lt: 'gana, pakankamai, teisingai',
      lv: 'diezgan, samērā, taisnīgi',
      ro: 'destul de, destul, echitabil',
      sl: 'kar, precej, pravično',
      th: 'ค่อนข้าง, พอสมควร, อย่างยุติธรรม',
      vi: 'khá, tương đối, công bằng'
    }
  },
  // ID 417: wash (clean prefixes across 6 languages)
  {
    id: 417,
    translations: {
      bg: 'мия, пера, измивам',
      el: 'πλένω, πλένομαι',
      ro: 'spăla, a spăla',
      sl: 'umivati, prati',
      cs: 'mýt, prát, umývat',
      sk: 'umývať, prať'
    }
  },
  // ID 418: button (strip phrase "to fasten buttons" and restore button/fasten across 16 languages)
  {
    id: 418,
    translation: 'кнопка, пуговица, застёгивать',
    translations: {
      uk: 'кнопка, ґудзик, застібати',
      bg: 'бутон, копче, закопчавам',
      cs: 'tlačítko, knoflík, zapnout',
      sk: 'tlačidlo, gombík, zapnúť',
      el: 'κουμπί, κουμπώνω',
      et: 'nupp, nööp, nööpima',
      hu: 'gomb, gombol',
      lt: 'mygtukas, saga, užsagstyti',
      ro: 'buton, nasture, încheia',
      sl: 'gumb, zapeti',
      da: 'knap, knappe',
      sv: 'knapp, knäppa',
      fi: 'nappi, painike, napittaa',
      kk: 'түйме, батырма, түймелеу',
      ar: 'زر، أزرار',
      de: 'Knopf, Taste, zuknöpfen'
    }
  },
  // ID 420: pour (clean imperfective verbs)
  {
    id: 420,
    translation: 'наливать, лить, сыпать',
    translations: {
      uk: 'наливати, лити',
      cs: 'nalévat, lít',
      sk: 'nalievať, liať',
      sl: 'nalivati, točiti',
      lv: 'liet, nolieta'
    }
  },
  // ID 424: unable (clean compound negative words)
  {
    id: 424,
    translation: 'неспособный, не в состоянии',
    translations: {
      uk: 'нездатний, неспроможний',
      hr: 'nesposoban, nemoćan',
      tr: 'yapamaz, aciz, yetersiz'
    }
  },
  // ID 426: violent (fix "CRUEL" calque across 15 languages)
  {
    id: 426,
    translation: 'насильственный, жестокий, яростный',
    translations: {
      uk: 'насильницький, жорстокий, лютий',
      fr: 'violent, brutal',
      es: 'violento, brutal',
      it: 'violento, brutale',
      de: 'gewalttätig, gewaltsam',
      da: 'voldelig, voldsom',
      sv: 'våldsam, brutal',
      fi: 'väkivaltainen, raju',
      cs: 'násilný, prudký',
      sk: 'násilný, prudký',
      hr: 'nasilan, brutalan',
      sl: 'nasilen, silovit',
      hu: 'erőszakos, heves',
      ro: 'violent, brutal',
      ar: 'عنيف، شديد',
      vi: 'bạo lực, hung bạo'
    }
  },
  // ID 428: stretch (restore stretch/stretch out across 7 languages)
  {
    id: 428,
    translation: 'растягивать, тянуться, потягиваться, отрезок',
    translations: {
      uk: 'розтягувати, тягнутися, потягуватися',
      fr: 'étirer, s\'étirer, étendue',
      it: 'allungare, allungarsi, tratto',
      cs: 'protáhnout se, natahovat, úsek',
      sk: 'natiahnuť sa, naťahovať, úsek',
      el: 'τεντώνω, τέντωμα',
      hu: 'nyújt, nyújtózkodik, szakasz'
    }
  },
  // ID 432: supporter (strip soccer fan bias and fix verbs to nouns)
  {
    id: 432,
    translations: {
      fr: 'partisan, défenseur, supporter',
      pl: 'zwolennik, kibic, popierający',
      da: 'tilhænger, støtte'
    }
  },
  // ID 435: lower (restore dual adjective + verb senses across 8 languages)
  {
    id: 435,
    translation: 'ниже, опускать, снижать',
    translations: {
      uk: 'нижчий, опускати, знижувати',
      pt: 'mais baixo, abaixar, diminuir',
      cs: 'nižší, snížit, spustit',
      sk: 'nižší, znížiť, spustiť',
      bn: 'নিচু, কমানো',
      lt: 'žemesnis, sumažinti, nuleisti',
      th: 'ต่ำกว่า, ลดลง',
      zh: '较低的、降低',
      bg: 'по-нисък, намалявам, свалям'
    }
  },
  // ID 442: round (fix Kazakh bullet calque and Italian verb calque across 7 languages)
  {
    id: 442,
    translations: {
      kk: 'дөңгелек, жұмыр, раунд',
      it: 'rotondo, turno, giro',
      cs: 'kulatý, kolo, zaokrouhlit',
      sk: 'okrúhly, kolo, zaokrúhliť',
      el: 'στρογγυλός, γύρος',
      ro: 'rotund, rundă, cerc',
      sv: 'rund, omgång, runda'
    }
  },
  // ID 443: detective (fix Italian "acustico" and Czech adjective)
  {
    id: 443,
    translations: {
      it: 'investigatore, detective',
      cs: 'detektiv, vyšetřovatel'
    }
  },
  // ID 444: pack (fix "A PACK OF WOLVES" calque across 25 languages and add verb senses)
  {
    id: 444,
    translation: 'упаковывать, пачка, стая',
    translations: {
      uk: 'пакувати, пачка, зграя',
      fr: 'emballer, paquet, meute',
      it: 'imballare, pacco, branco',
      es: 'empacar, paquete, manada',
      de: 'packen, Paket, Rudel',
      cs: 'balit, balíček, smečka',
      sk: 'baliť, balík, svorka',
      pl: 'pakować, paczka, stado',
      pt: 'empacotar, pacote, alcateia',
      ro: 'împacheta, pachet, haită',
      bg: 'опаковам, пакет, глутница',
      hu: 'becsomagol, csomag, falka',
      el: 'πακετάρω, πακέτο, αγέλη',
      da: 'pakke, pakke ind, flok',
      fi: 'pakata, paketti, lauma',
      sv: 'packa, paket, flock',
      hr: 'pakirati, paket, čopor',
      sl: 'pakirati, paket, krdelo',
      et: 'pakkima, pakk, kari',
      lt: 'pakuoti, paketas, gauja',
      lv: 'saiņot, iepakojums, bars',
      tr: 'paketlemek, paket, sürü',
      ar: 'يحزم، حزمة، قطيع',
      fa: 'بسته‌بندی کردن، بسته، گله',
      ur: 'پیک کرنا، پیکٹ، جھنڈ',
      hi: 'पैक करना, पैकेट, झुंड',
      bn: 'প্যাক করা, প্যাকেট, পাল',
      id: 'mengemas, paket, kawanan',
      vi: 'đóng gói, gói, bầy',
      th: 'บรรจุ, ห่อ, ฝูง',
      ja: '荷造りする、包み、群れ',
      ko: '싸다, 소포, 무리',
      zh: '打包、包裹、群',
      kk: 'жинау, қаптама, топ'
    }
  },
  // ID 447: housing (fix plurals to mass noun / casing across 5 languages)
  {
    id: 447,
    translations: {
      hu: 'lakhatás, lakásügy, burkolat',
      it: 'alloggio, edilizia, custodia',
      ro: 'locuință, carcasă',
      sl: 'nastanitev, stanovanjski fond, ohišje',
      sv: 'bostäder, bostad, hus'
    }
  },
  // ID 448: chip (fix chip tokens and potato chips calque across 6 languages)
  {
    id: 448,
    translation: 'чип, микросхема, чипсы, щепка',
    translations: {
      it: 'chip, microchip, patatine',
      kk: 'чип, микросхема, чипсы',
      tr: 'çip, yonga, cips',
      es: 'chip, microchip, patatas fritas',
      fr: 'puce, microprocesseur, chips'
    }
  },
  // ID 449: numerous (fix plural forms to singular adjectives across 9 languages)
  {
    id: 449,
    translation: 'многочисленный',
    translations: {
      uk: 'численний, багаточисельний',
      cs: 'početný, četný',
      sk: 'početný, mnohý',
      hr: 'brojan, mnogobrojan',
      bg: 'многоброен',
      ro: 'numeros',
      pt: 'numeroso',
      it: 'numeroso'
    }
  },
  // ID 450: command (fix catastrophic "SPORTS TEAM" calque across 19 languages!)
  {
    id: 450,
    translation: 'приказ, командовать, команда',
    translations: {
      uk: 'наказ, командувати, команда',
      fr: 'ordre, commander, commandement',
      it: 'ordine, comandare, comando',
      es: 'orden, comandar, comando',
      de: 'Befehl, befehlen, Kommando',
      cs: 'rozkaz, velet, příkaz',
      sk: 'rozkaz, veliť, príkaz',
      pl: 'rozkaz, dowodzić, polecenie',
      pt: 'ordem, comandar, comando',
      ro: 'ordin, a comanda, comandă',
      bg: 'заповед, командвам, команда',
      hu: 'parancs, parancsol, vezényel',
      el: 'διαταγή, διατάζω, εντολή',
      da: 'ordre, befale, kommando',
      fi: 'käsky, komentaa, käskeä',
      sv: 'order, befalla, kommando',
      hr: 'naredba, zapovijedati, komanda',
      sl: 'ukaz, poveljevati, ukazati',
      et: 'käsk, käskima, komando',
      lt: 'įsakymas, komanduoti, nurodymas',
      lv: 'pavēle, komandēt, rīkojums',
      tr: 'emir, komuta etmek, komut',
      ar: 'أمر، يقود، قيادة',
      fa: 'دستور، فرمان دادن، فرماندهی',
      ur: 'حکم، حکم دینا، کمانڈ',
      hi: 'आदेश, आदेश देना, कमान',
      bn: 'আদেশ, হুকুম করা, কমান্ড',
      id: 'perintah, memerintah, komando',
      vi: 'lệnh, chỉ huy, ra lệnh',
      th: 'คำสั่ง, สั่งการ, บัญชาการ',
      ja: '命令、指揮する、指令',
      ko: '명령, 지휘하다, 지시',
      zh: '命令、指挥、指示',
      kk: 'бұйрық, басқару, бұйыру'
    }
  }
];

let totalPatched = 0;

for (const filepath of FILES) {
  if (!fs.existsSync(filepath)) continue;
  const words = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const wordMap = new Map(words.map(w => [w.id, w]));

  for (const cal of calibrations) {
    const target = wordMap.get(cal.id);
    if (!target) continue;

    if (cal.translation) {
      target.translation = cal.translation;
      totalPatched++;
    }

    if (cal.translations) {
      if (!target.translations) target.translations = {};
      for (const [lang, val] of Object.entries(cal.translations)) {
        target.translations[lang] = val;
        totalPatched++;
      }
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Successfully calibrated ${filepath}`);
}

console.log(`Batch 401..450 calibration finished! Total translation fields patched: ${totalPatched}`);
