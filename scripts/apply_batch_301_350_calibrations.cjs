const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 305: cycle
  {
    id: 305,
    translations: {
      fr: 'cycle'
    }
  },
  // ID 307: golden (fix noun "gold chemical element / bullion" to adjective across 12 languages!)
  {
    id: 307,
    translations: {
      fr: 'doré',
      it: 'dorato',
      ro: 'auriu',
      bg: 'златен',
      cs: 'zlatý',
      sk: 'zlatý',
      hu: 'arany, aranyos',
      el: 'χρυσός, χρυσαφένιος',
      sl: 'zlat',
      et: 'kuldne',
      lt: 'auksinis',
      hr: 'zlatan'
    }
  },
  // ID 322: mad (fix demonic maleficent evil to angry / insane across 6 languages!)
  {
    id: 322,
    translations: {
      es: 'enojado, loco',
      fr: 'en colère, fou',
      it: 'arrabbiato, pazzo',
      ro: 'furios, nebun',
      hu: 'dühös, őrült',
      el: 'θυμωμένος, τρελός'
    }
  },
  // ID 327: opening (fix scientific breakthrough discovery to event/store opening across 11 languages!)
  {
    id: 327,
    translations: {
      da: 'åbning, indvielse',
      fi: 'avajaiset, aukko',
      sv: 'öppning, invigning',
      hr: 'otvaranje',
      lv: 'atvēršana',
      hi: 'उद्घाटन, शुरुआत',
      vi: 'khai mạc, mở màn',
      th: 'การเปิด, พิธีเปิด',
      ko: '개장, 개막, 시작',
      ja: '開始、オープニング、開幕',
      kk: 'ашылу'
    }
  },
  // ID 329: frequently
  {
    id: 329,
    translations: {
      it: 'spesso'
    }
  },
  // ID 330: employ (fix apartment rental lease to hiring employees across 7 languages!)
  {
    id: 330,
    translations: {
      ro: 'angaja',
      bg: 'наемам на работа',
      cs: 'zaměstnat',
      sk: 'zamestnať',
      hu: 'foglalkoztat, alkalmaz',
      el: 'προσλαμβάνω',
      sl: 'zaposliti'
    }
  },
  // ID 337: appeal (fix catastrophic street mailing postal address mistranslation across 21 languages!)
  {
    id: 337,
    translations: {
      fr: 'faire appel, attrait',
      it: 'fare appello, fascino',
      ro: 'a face apel, atracție',
      bg: 'обжалване, апел',
      cs: 'odvolání, apelovat',
      sk: 'odvolanie, apelovať',
      hu: 'fellebbezés, vonzerő',
      el: 'έφεση, έκκληση',
      sl: 'pritožba, privlačnost',
      et: 'edasikaebus, meeldivus',
      lt: 'apeliacija, kreipimasis',
      da: 'appel, appellere',
      fi: 'valitus, vedota',
      sv: 'appell, vädjan',
      hr: 'žalba, privlačnost',
      lv: 'apelācija, vērsties',
      vi: 'kháng cáo, lôi cuốn',
      th: 'อุทธรณ์, ดึงดูด',
      ko: '항소하다, 매력',
      ja: '訴える、魅力',
      kk: 'шағымдану, үндеу'
    }
  },
  // ID 338: quote (add verb forms)
  {
    id: 338,
    translations: {
      fr: 'citer, citation',
      it: 'citare, citazione',
      pl: 'cytować, cytat',
      tr: 'alıntı yapmak, alıntı',
      ro: 'cita, citat',
      bg: 'цитирам, цитат',
      sk: 'citovať, citát',
      hu: 'idéz, idézet',
      sl: 'citirati, citat',
      et: 'tsiteerima, tsitaat',
      lt: 'cituoti, citata',
      da: 'citere, citat',
      sv: 'citera, citat',
      hr: 'citirati, citat',
      lv: 'citēt, citāts',
      fi: 'lainata, lainaus',
      ko: '인용하다, 인용',
      ja: '引用する、引用'
    }
  },
  // ID 344: row (fix violent brawl/quarrel to row of seats and rowing)
  {
    id: 344,
    translations: {
      fi: 'rivi, meloa',
      sv: 'rad, ro',
      hr: 'red, veslati',
      lv: 'rinda, airēt'
    }
  },
  // ID 350: household
  {
    id: 350,
    translations: {
      ro: 'gospodărie'
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

console.log(`Batch 301..350 calibration finished! Total translation fields patched: ${totalPatched}`);
