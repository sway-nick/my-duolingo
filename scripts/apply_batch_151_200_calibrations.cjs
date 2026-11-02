const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 151: surround
  {
    id: 151,
    translations: {
      da: 'omringe, omgive',
      fi: 'ympäröidä',
      lt: 'apsupti',
      ko: '둘러싸다, 에워싸다',
      hr: 'okružiti, okruživati',
      lv: 'ieskaut, aplenkt',
      ro: 'înconjura'
    }
  },
  // ID 158: propose (fix noun "commercial discount offer" to verb)
  {
    id: 158,
    translations: {
      da: 'foreslå',
      fi: 'ehdottaa',
      sv: 'föreslå',
      hr: 'predložiti',
      lv: 'ierosināt, piedāvāt',
      ar: 'يقترح، يطلب يد',
      ko: '제안하다, 청혼하다',
      kk: 'ұсыну'
    }
  },
  // ID 160: sentence (fix catastrophic machine mistranslation from commercial offer to grammatical sentence across 20 langs!)
  {
    id: 160,
    translations: {
      fr: 'phrase, sentence',
      it: 'frase, condanna',
      ro: 'propoziție, frază, sentință',
      bg: 'изречение, присъда',
      cs: 'věta, rozsudek',
      sk: 'veta, rozsudok',
      hu: 'mondat, ítélet',
      el: 'πρόταση, απόφαση',
      sl: 'stavek, obsodba',
      et: 'lause, kohtuotsus',
      lt: 'sakinys, nuosprendis',
      da: 'sætning, dom',
      fi: 'lause, tuomio',
      sv: 'mening, dom',
      hr: 'rečenica, presuda',
      lv: 'teikums, spriedums',
      vi: 'câu, bản án',
      th: 'ประโยค, คำพิพากษา',
      ko: '문장, 선고',
      ja: '文、判決',
      kk: 'сөйлем, үкім'
    }
  },
  // ID 162: appearance
  {
    id: 162,
    translation: 'появление, внешний вид',
    translations: {
      uk: 'поява, зовнішність',
      de: 'Aussehen, Erscheinung',
      it: 'aspetto, apparizione',
      fr: 'apparence, apparition'
    }
  },
  // ID 163: excellent (fix "big" and capitalization)
  {
    id: 163,
    translations: {
      it: 'eccellente, ottimo',
      tr: 'harika, mükemmel',
      ro: 'excelent',
      cs: 'vynikající, skvělý',
      hu: 'kiváló, nagyszerű',
      el: 'εξαιρετικός'
    }
  },
  // ID 164: criminal
  {
    id: 164,
    translations: {
      it: 'criminale, delinquente',
      ro: 'criminal, infractor',
      hu: 'bűnöző',
      de: 'Verbrecher, kriminell'
    }
  },
  // ID 170: dry (fix capitalization and verb)
  {
    id: 170,
    translations: {
      it: 'asciutto, secco',
      cs: 'suchý',
      sl: 'suh',
      hr: 'suh'
    }
  },
  // ID 175: mark (fix name Mark, stamp, and verb)
  {
    id: 175,
    translations: {
      hu: 'jel, jelölés, jegy',
      cs: 'známka, značka, označit',
      bg: 'белег, оценка, знак'
    }
  },
  // ID 178: illegal
  {
    id: 178,
    translations: {
      bg: 'незаконен',
      sl: 'nezakonit',
      sv: 'olaglig',
      hr: 'ilegalan, nezakonit'
    }
  },
  // ID 179: significantly (fix adjective "essential" to adverb)
  {
    id: 179,
    translations: {
      da: 'betydeligt, væsentligt',
      fi: 'merkittävästi, huomattavasti',
      sv: 'betydligt, avsevärt',
      vi: 'đáng kể, có ý nghĩa',
      th: 'อย่างมีนัยสำคัญ, อย่างมาก',
      ko: '상당히, 현저하게',
      ja: '著しく、大幅に、かなり',
      lv: 'būtiski, ievērojami'
    }
  },
  // ID 184: self (fix "myself/yourself" confusion to general self)
  {
    id: 184,
    translations: {
      fr: 'soi, soi-même',
      it: 'sé, se stesso',
      pt: 'si mesmo, próprio',
      ro: 'sine, sine însuși',
      cs: 'já sám, sebe',
      sk: 'seba, sám',
      hu: 'maga, önmaga',
      el: 'εαυτός',
      sl: 'sebi, jaz',
      et: 'iseennast, ise',
      lt: 'pats, savęs',
      da: 'sig selv, selv',
      sv: 'sig själv, själv',
      lv: 'pats, sevi',
      vi: 'bản thân',
      th: 'ตัวเอง',
      ja: '自己、自身'
    }
  },
  // ID 188: desk (fix catastrophic desktop PC / Windows OS UI mistranslation to wooden writing desk across 17 langs!)
  {
    id: 188,
    translation: 'письменный стол, парта',
    translations: {
      uk: 'письмовий стіл, парта',
      fr: 'bureau',
      it: 'scrivania',
      ro: 'birou',
      bg: 'бюро',
      cs: 'psací stůl, lavice',
      sk: 'písací stôl',
      hu: 'íróasztal',
      el: 'γραφείο',
      sl: 'pisalna miza',
      et: 'kirjutuslaud',
      lt: 'rašomasis stalas',
      da: 'skrivebord',
      hr: 'radni stol, pisaći stol',
      lv: 'rakstāmgalds',
      ar: 'مكتب',
      vi: 'bàn làm việc, bàn học',
      th: 'โต๊ะทำงาน, โต๊ะเขียนหนังสือ',
      ko: '책상',
      ja: '机、デスク'
    }
  },
  // ID 189: eastern (fix oriental carpet / Middle East mistranslation and capitalization)
  {
    id: 189,
    translations: {
      fr: 'oriental, de l\'est',
      ro: 'estic, oriental',
      bg: 'източен',
      sk: 'východný',
      sl: 'vzhodni',
      et: 'ida, idapoolne',
      lt: 'rytų',
      cs: 'východní'
    }
  },
  // ID 195: arrest (add verb forms)
  {
    id: 195,
    translations: {
      it: 'arrestare, arresto',
      bg: 'арестувам, арест',
      sk: 'zatknúť, zatknutie',
      hu: 'letartóztat',
      el: 'συλλαμβάνω, σύλληψη',
      sl: 'aretirati',
      et: 'vahistama',
      lt: 'suimti, areštuoti',
      da: 'anholde',
      fi: 'pidättää',
      sv: 'gripa, anhålla',
      hr: 'uhititi',
      lv: 'arestēt, aizturēt'
    }
  },
  // ID 198: internal (fix home interior design mistranslation to internal/domestic)
  {
    id: 198,
    translations: {
      bg: 'вътрешен',
      cs: 'vnitřní, interní',
      sk: 'vnútorný, interný',
      el: 'εσωτερικός',
      sl: 'notranji',
      et: 'sisemine, sise-',
      lt: 'vidinis'
    }
  },
  // ID 200: proposal
  {
    id: 200,
    translations: {
      ro: 'propunere, ofertă',
      fr: 'proposition, offre',
      it: 'proposta, offerta',
      bg: 'предложение, оферта'
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

console.log(`Batch 151..200 calibration finished! Total translation fields patched: ${totalPatched}`);
