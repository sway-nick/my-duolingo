import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "τρένο, προπονούμαι",
  44: "γηγενής, μητρικός, φυσικός ομιλητής",
  267: "δάκρυ, σκίζω",
  578: "μπότα, πορτμπαγκάζ",
  851: "πορτοκάλι, πορτοκαλί",
  965: "νύχι, καρφί",
  1396: "αυτό, εκείνο",
  1398: "πού, προς τα πού",
  1415: "επάνω, ψηλά",
  1468: "φτάνω, αγγίζω",
  1537: "έτσι, τόσο, ώστε",
  1585: "φυσικά, σίγουρος",
  1620: "παίζω, θεατρικό έργο",
  1641: "κατάστημα, ψωνίζω",
  1662: "πριν, παλαιότερα",
  1734: "πετυχαίνω, κατορθώνω",
  1923: "φόρεμα, ντύνομαι",
  2046: "περίπου, σχετικά με",
  2130: "γυρίζω, στριφογυρίζω, γνέθω",
  3175: "μέλος σώματος, κλαδί",
  3382: "αγαπημένος, καλέ μου",
  3772: "πυροβολώ, κινηματογραφώ, τραβώ",
  3784: "είμαι, είσαι, είναι, είμαστε, είστε",
  3786: "από, του, της",
  3788: "σε, μέσα, εντός",
  3802: "παρά, από",
  3809: "μιλώ, λέω",
  3815: "αν, εάν",
  3821: "πώς",
  3842: "σε, στο, στη",
  3859: "ο, η, το",
  3865: "μέσα σε, προς τα μέσα",
  3885: "τι γίνεται, πώς πάει",
  3949: "και λοιπόν, τι έγινε",
  3975: "τι, ποιος, πού, πότε",
  4007: "χορός αποφοίτησης",
  4091: "συνήθιζα, παλιά",
  4112: "πυρσός, φακός",
  4124: "φοβάμαι, τρομαγμένος από",
  4140: "ευγενικός με, καλός με",
  4151: "νοιάζομαι για, ενδιαφέρομαι",
  4160: "αηδίασα με, μπούχτισα από",
  4170: "ποιος ξέρει",
  4174: "κατάθλιψη, μελαγχολία",
  4184: "παρ' όλα αυτά, το ίδιο κάνει",
  4188: "πώς είσαι, πώς περνάς",
  4197: "δεν με πειράζει, δεν έχω αντίρρηση",
  4257: "γυμνάζομαι, επιλύω",
  4284: "τι συμβαίνει, τι τρέχει",
  4308: "δεν μπορούσα, δεν στάθηκε δυνατό",
  4350: "είμαι σίγουρος",
  4354: "πόσο κάνει, πόσο",
  4368: "κανένα νέο",
  4371: "είναι μακριά",
  4372: "από πότε",
  4373: "και λοιπόν",
  4375: "κατάλαβες, έγινε σαφές",
  4387: "επίρρημα",
  4457: "τουαλέτα, λουτρό",
  4787: "έμμεσος, πλάγιος",
  4903: "συγγνώμη, λυπάμαι",
  4989: "βγήκε, κυκλοφόρησε",
  4997: "το έλαβες, κατάλαβες",
  5018: "συν-, μαζί",
  5021: "πρέπει, οφείλω",
  5023: "δεν θα, αρνείται να",
  5031: "θεωρώ δεδομένο, υποτιμώ",
  5064: "του Αγίου Ποτέ, ποτέ",
  5092: "τρέχω για δουλειές, κάνω θελήματα",
  5165: "υφιστάμενος, κατώτερος",
  5166: "αυθάδης, αναιδής, προκλητικός",
  5202: "διαπράττω, κάνω",
  5775: "καταδέχομαι, παραχωρώ, παρέχω",
  6012: "πικρία, δριμύτητα, οξύτητα",
  6013: "οξυδέρκεια, διορατικότητα",
  6037: "διαβόητος, απόλυτος, σκέτος",
  6496: "θάρρος, ψυχικό σθένος, τόλμη",
  6510: "οστρακισμός, εξορία, αποκλεισμός",
  6742: "όπως ήρθαν, έτσι έφυγαν",
  6743: "αγαθά κόποις κτώνται",
  6940: "μπαγιάτικος, παλιός",
  6941: "λιμοκτονώ, είμαι κατάπεινος",
  7039: "σιγοβράζω, στιφάδο"
};

function cleanEl(id, val) {
  if (val === null || val === undefined) return val;
  if (manualOverrides[id] !== undefined) {
    return manualOverrides[id];
  }

  let res = val;
  if (res.includes('(') || res.includes(')')) {
    res = res.replace(/\(.*?\)/g, '');
  }
  if (res.includes('/')) {
    res = res.replace(/\//g, ', ');
  }
  if (res.includes(';') || res.includes('\u037e')) {
    res = res.replace(/\u037e/g, ';');
    res = res.replace(/;\s*$/, '');
    res = res.replace(/;/g, ',');
  }

  const parts = res.split(/[,;]/).map(p => p.trim()).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      deduped.push(p);
    }
  }
  return deduped.join(', ');
}

const targetFiles = [
  path.join(rootDir, 'frontend', 'assets', 'data', 'words.json'),
  path.join(rootDir, 'assets', 'data', 'words.json'),
  path.join(rootDir, 'docs', 'assets', 'data', 'words.json')
];

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const words = JSON.parse(content);
  let updatedCount = 0;

  for (const w of words) {
    const tr = w.translations || {};
    const orig = tr.el;
    if (orig !== undefined) {
      const cleaned = cleanEl(w.id, orig);
      if (cleaned !== orig) {
        tr.el = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Greek translations in ${filePath}`);
}
