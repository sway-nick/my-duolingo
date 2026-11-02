const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 501: transfer (fix catastrophic "LIVE TV BROADCAST" calque across 15 languages!)
  {
    id: 501,
    translation: 'перевод, передача, переносить',
    translations: {
      uk: 'переказ, перенесення, переводити',
      fr: 'transfert, transférer, virement',
      it: 'trasferimento, trasferire, bonifico',
      es: 'transferencia, transferir, traslado',
      de: 'Übertragung, Transfer, überweisen',
      cs: 'převod, přesun, přenést',
      sk: 'prevod, presun, preniesť',
      pl: 'przelew, transfer, przenieść',
      pt: 'transferência, transferir, traslado',
      ro: 'transfer, a transfera, virament',
      bg: 'прехвърляне, трансфер, превод',
      hu: 'átutalás, áthelyezés, átvitel',
      el: 'μεταφορά, μεταβίβαση',
      da: 'overførsel, overføre',
      fi: 'siirto, siirtää',
      sv: 'överföring, överföra',
      hr: 'prijenos, prebacivanje, premještaj',
      sl: 'prenos, premestitev, nakazilo',
      et: 'ülekanne, ülekandmine, siirdamine',
      lt: 'perkėlimas, pervedimas',
      lv: 'pārskaitījums, pārvietošana',
      tr: 'transfer, aktarma, devretme',
      kk: 'аудару, тасымалдау, өткізу'
    }
  },
  // ID 504: employment (lowercase and clean across 10 languages)
  {
    id: 504,
    translation: 'работа, трудоустройство, занятость',
    translations: {
      bg: 'работа, заетост',
      cs: 'práce, zaměstnání',
      el: 'δουλειά, απασχόληση',
      et: 'töö, hõive',
      fr: 'emploi, travail',
      hu: 'munka, foglalkoztatás',
      it: 'lavoro, occupazione',
      lt: 'darbas, užimtumas',
      ro: 'post, angajare, muncă',
      sk: 'práca, zamestnanie',
      sl: 'delo, zaposlitev',
      tr: 'iş, istihdam'
    }
  },
  // ID 505: relax (fix imperatives and nouns to infinitive verbs across 8 languages)
  {
    id: 505,
    translation: 'расслабляться, отдыхать',
    translations: {
      uk: 'розслаблятися, відпочивати',
      bg: 'отпускам се, почивам си',
      el: 'χαλαρώνω, ξεκουράζομαι',
      et: 'lõõgastuma, puhkama',
      hu: 'pihen, lazít',
      it: 'rilassarsi, distendersi',
      ro: 'a se relaxa, a se odihni',
      sl: 'sprostiti se, počivati',
      ko: '휴식을 취하다, 쉬다'
    }
  },
  // ID 506: owe (fix catastrophic "TO BE / DUE TO EXPIRE" calque across 20 languages!)
  {
    id: 506,
    translation: 'быть должным, задолжать, быть обязанным',
    translations: {
      uk: 'бути винним, заборгувати, завдячувати',
      fr: 'devoir, être redevable',
      it: 'dovere, essere debitore',
      es: 'deber, adeudar',
      de: 'schulden, verdanken',
      cs: 'dlužit, vděčit',
      sk: 'dlhovať, vďačiť',
      pl: 'być dłużnym, zawdzięczać',
      pt: 'dever, estar em dívida',
      ro: 'a datora, datora',
      bg: 'дължа, имам дълг',
      hu: 'tartozik, köszönhet',
      el: 'χρωστώ, οφείλω',
      da: 'skylde, have gæld',
      fi: 'olla velkaa, olla kiitollisuudenvelassa',
      sv: 'vara skyldig, ha skuld',
      hr: 'dugovati, biti dužan',
      sl: 'dolgovati, biti dolžan',
      et: 'võlgnema, võlgu olema',
      lt: 'būti skolingam, skolėti',
      lv: 'būt parādā, parādā',
      tr: 'borçlu olmak, minnettar olmak',
      ar: 'يدين، مدين لـ',
      fa: 'بدهکار بودن، مدیون بودن',
      ur: 'مقروض ہونا، احسان مند ہونا',
      hi: 'ऋणी होना, का आभारी होना',
      bn: 'ঋণী থাকা, দেনাদার হওয়া',
      id: 'berutang, berhutang',
      vi: 'nợ, chịu ơn',
      th: 'เป็นหนี้, ติดหนี้',
      ja: '借りがある、恩を受けている',
      ko: '빚지고 있다, 신세를 지고 있다',
      zh: '欠、感恩、归功于',
      kk: 'қарыз болу, борыштар болу'
    }
  },
  // ID 511: abandon (fix "ANNUAL HOLIDAY / PAID LEAVE" calque across 8 languages)
  {
    id: 511,
    translation: 'покидать, бросать, отказываться',
    translations: {
      uk: 'покидати, кидати, відмовлятися',
      cs: 'opustit, zanechat, vzdát se',
      sk: 'opustiť, zanechať, vzdať sa',
      el: 'εγκαταλείπω, παρατάω',
      hu: 'elhagy, felad, cserbenhagy',
      sl: 'zapustiti, opustiti',
      fr: 'abandonner, délaisser',
      it: 'abbandonare, lasciare',
      es: 'abandonar, renunciar a',
      fi: 'hylätä, luopua',
      sv: 'överge, lämna, överlämna',
      ro: 'a abandona, părăsi'
    }
  },
  // ID 513: musical (add adjective sense to Russian and calibrate)
  {
    id: 513,
    translation: 'музыкальный, мюзикл',
    translations: {
      uk: 'музичний, мюзикл'
    }
  },
  // ID 514: suggestion (fix catastrophic "SCIENTIFIC HYPOTHESIS" calque across 23 languages!)
  {
    id: 514,
    translation: 'предложение, совет, рекомендация',
    translations: {
      uk: 'пропозиція, порада, рекомендація',
      fr: 'suggestion, proposition, conseil',
      it: 'suggerimento, proposta, consiglio',
      es: 'sugerencia, propuesta, consejo',
      de: 'Vorschlag, Anregung, Empfehlung',
      cs: 'návrh, podnět, doporučení',
      sk: 'návrh, podnet, odporúčanie',
      pl: 'sugestia, propozycja, rada',
      pt: 'sugestão, proposta, conselho',
      ro: 'sugestie, propunere, sfat',
      bg: 'предложение, съвет, внушение',
      hu: 'javaslat, ötlet, tanács',
      el: 'πρόταση, υπόδειξη, συμβουλή',
      da: 'forslag, vink, henstilling',
      fi: 'ehdotus, vihje, suositus',
      sv: 'förslag, antydan, rekommendation',
      hr: 'prijedlog, sugestija, savjet',
      sl: 'predlog, namig, pobuda',
      et: 'ettepanek, soovitus, vihje',
      lt: 'pasiūlymas, patarimas',
      lv: 'priekšlikums, ieteikums',
      tr: 'öneri, teklif, tavsiye',
      ar: 'اقتراح، نصيحة، توصية',
      fa: 'پیشنهاد، توصیه',
      ur: 'تجویز، مشورہ',
      hi: 'सुझाव, प्रस्ताव, सलाह',
      bn: 'পরামর্শ, প্রস্তাব',
      id: 'saran, usul, anjuran',
      vi: 'gợi ý, đề xuất, lời khuyên',
      th: 'ข้อเสนอแนะ, คำแนะนำ',
      ja: '提案、助言、示唆',
      ko: '제안, 암시, 추천',
      zh: '建议、提议、暗示',
      kk: 'ұсыныс, кеңес'
    }
  },
  // ID 520: awesome (fix "anesthetic / numbing" in Nordic languages)
  {
    id: 520,
    translations: {
      da: 'fantastisk, fedt, fremragende',
      sv: 'fantastisk, grym, fantastiskt',
      fi: 'mahtava, upea, loistava',
      lv: 'lielisks, satriecošs',
      it: 'fantastico, straordinario'
    }
  },
  // ID 521: switch (calibrate network switch to electrical switch / verb to switch)
  {
    id: 521,
    translation: 'переключатель, переключать, менять',
    translations: {
      uk: 'перемикач, перемикати, міняти'
    }
  },
  // ID 522: iron (add missing household iron to Russian/Ukrainian and key languages)
  {
    id: 522,
    translation: 'железо, утюг, гладить',
    translations: {
      uk: 'залізо, праска, прасувати',
      ar: 'حديد، مكواة، يكوي',
      da: 'jern, strygejern, stryge',
      fi: 'rauta, silitysrauta, silittää',
      sv: 'järn, strykjärn, stryka',
      ja: '鉄、アイロン、アイロンをかける',
      ko: '철, 다리미, 다림질하다',
      kk: 'темір, үтік, үтіктеу'
    }
  },
  // ID 528: leading (fix catastrophic "TV SHOW PRESENTER" calque across 12 languages!)
  {
    id: 528,
    translation: 'ведущий, передовой, главный',
    translations: {
      uk: 'провідний, передовий, головний',
      da: 'førende, ledende',
      fi: 'johtava, eturivin',
      hr: 'vodeći, predvodnički',
      sv: 'ledande, framstående',
      ja: '主要な、一流の、主導する',
      ko: '선도적인, 주요한',
      vi: 'hàng đầu, dẫn đầu',
      th: 'ชั้นนำ, สำคัญ',
      kk: 'жетекші, басты, алдыңғы',
      ar: 'رائد، رئيسي، قيادي',
      fr: 'de premier plan, principal, dirigeant',
      it: 'principale, leader, di punta',
      cs: 'vedoucí, přední, hlavní',
      sk: 'vedúci, popredný, hlavný'
    }
  },
  // ID 529: widely (fix adjective to adverb across 12 languages)
  {
    id: 529,
    translations: {
      fr: 'largement, largement répandu',
      it: 'ampiamente, diffusamente',
      cs: 'široce, hojně',
      sk: 'široko, hojne',
      bg: 'широко',
      el: 'ευρέως',
      et: 'laialdaselt',
      hu: 'széles körben',
      kk: 'кеңінен, жалпыға ортақ',
      lt: 'plačiai',
      ro: 'pe scară largă, pe larg',
      sl: 'široko'
    }
  },
  // ID 535: cap (strip "ANY HAT AT ALL" phrase across 17 languages and restore cap/lid/limit)
  {
    id: 535,
    translation: 'кепка, шапка, крышка, предел',
    translations: {
      uk: 'кепка, шапка, кришка, ліміт',
      fr: 'casquette, bouchon, plafond',
      it: 'berretto, cappellino, tappo',
      es: 'gorra, gorro, tapa, tope',
      de: 'Kappe, Mütze, Deckel, Grenze',
      cs: 'čepice, kšiltovka, uzávěr',
      sk: 'čiapka, šiltovka, uzáver',
      pl: 'czapka, czapka z daszkiem, nakrętka',
      pt: 'boné, tampa, limite',
      ro: 'șapcă, căciulă, capac',
      bg: 'шапка, каскет, капачка',
      hu: 'sapka, fedő, felső határ',
      el: 'καπέλο, πώμα, καπάκι',
      da: 'kasket, hætte, låg',
      fi: 'lippis, lakki, korkki',
      sv: 'keps, mössa, kork',
      hr: 'kapa, šilterica, poklopac',
      sl: 'kapa, pokrov, zamašek',
      et: 'müts, nokamüts, kork',
      lt: 'kepurė, dangtelis, kepuraitė',
      lv: 'cepure, vāciņš, kepurs',
      th: 'หมวกแก๊ป, ฝาครอบ, เพดาน',
      kk: 'кепка, қалпақ, қақпақ'
    }
  },
  // ID 536: secure (fix "MONEY VAULT / BANK SAFE" calque in cs/ro and clean)
  {
    id: 536,
    translation: 'безопасный, надежный, защищать',
    translations: {
      cs: 'bezpečný, spolehlivý, zajistit',
      ro: 'sigur, securizat, a asigura',
      bg: 'сигурен, надежден, осигурявам',
      hr: 'siguran, pouzdan, osigurati',
      sk: 'bezpečný, zaistiť',
      sl: 'varen, zavarovati',
      lv: 'drošs, nodrošināt'
    }
  },
  // ID 542: boyfriend (fix "guy friend" calque to romantic boyfriend across 13 languages)
  {
    id: 542,
    translation: 'парень, бойфренд, возлюбленный',
    translations: {
      uk: 'хлопець, бойфренд, коханий',
      fr: 'petit ami, copain',
      it: 'fidanzato, ragazzo',
      cs: 'přítel, kluk',
      sk: 'priateľ, frajer',
      ro: 'iubit, prieten',
      hu: 'barát, pasi',
      kk: 'жігіт, ғашық жігіт',
      lt: 'vaikinas, draugas',
      bg: 'приятел, гадже',
      sl: 'fant, partner',
      lv: 'puisis, draugs',
      el: 'αγόρι, σύντροφος'
    }
  },
  // ID 545: preserve (fix catastrophic "SAVE COMPUTER FILE / SAVE MONEY / RESCUE" calque across 25 languages!)
  {
    id: 545,
    translation: 'сохранять, оберегать, заповедник',
    translations: {
      uk: 'зберігати, оберігати, заповідник',
      fr: 'préserver, conserver, confiture',
      it: 'preservare, conservare, riserva',
      es: 'preservar, conservar, reserva',
      de: 'bewahren, erhalten, konservieren',
      cs: 'zachovat, uchovat, chránit',
      sk: 'zachovať, uchovať, chrániť',
      pl: 'zachować, chronić, konfitura',
      pt: 'preservar, conservar, reserva',
      ro: 'a păstra, conserva, rezervație',
      bg: 'запазвам, съхранявам, резерват',
      hu: 'megőriz, megóv, természetvédelmi terület',
      el: 'διατηρώ, προστατεύω, καταφύγιο',
      da: 'bevare, frede, syltetøj',
      fi: 'säilyttää, suojella, suojelualue',
      sv: 'bevara, skydda, naturreservat',
      hr: 'očuvati, sačuvati, rezervat',
      sl: 'ohraniti, ohranjati, naravni rezervat',
      et: 'säilitama, hoidma, looduskaitseala',
      lt: 'išsaugoti, tausoti, draustinis',
      lv: 'saglabāt, saudzēt, liegums',
      tr: 'korumak, muhafaza etmek, reçel',
      ar: 'يحافظ على، صيانة، محمية',
      fa: 'حفظ کردن، نگهداری کردن',
      ur: 'محفوظ رکھنا، حفاظت کرنا',
      hi: 'संरक्षित करना, बचाना',
      bn: 'সংরক্ষণ করা, রক্ষা করা',
      id: 'melestarikan, menjaga, mengawetkan',
      vi: 'bảo tồn, giữ gìn, mứt',
      th: 'อนุรักษ์, สงวน, แยม',
      ja: '保存する、保護する、ジャム',
      ko: '보존하다, 보호하다, 잼',
      zh: '保存、保护、蜜饯',
      kk: 'сақтау, қорғау, қорық'
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

console.log(`Batch 501..550 calibration finished! Total translation fields patched: ${totalPatched}`);
