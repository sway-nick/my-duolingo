import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  37: "влак, тренирам",
  44: "роден, роден език, местен",
  267: "сълза, късам",
  390: "не съм съгласен",
  578: "ботуш, багажник",
  851: "портокал, оранжев",
  1396: "то, това",
  1415: "нагоре, горе",
  1468: "достигам, стигам до",
  1537: "така, толкова, затова",
  1620: "играя, пиеса",
  1641: "магазин, пазарувам",
  1662: "преди, назад",
  1734: "постигам, реализирам",
  1923: "рокля, обличам се",
  2046: "за, относно, около",
  2130: "въртя се, преда",
  3033: "съпруг, съпруга",
  3175: "крайник, клон",
  3772: "стрелям, снимам",
  3784: "съм, си, е, сме, сте, са",
  3786: "от, на",
  3788: "в, във, вътре",
  3802: "отколкото, от",
  3809: "говоря, казвам",
  3815: "ако, дали",
  3842: "на, при, в",
  3859: "този, онзи",
  3865: "в, вътре в",
  4007: "абитуриентски бал, бал",
  4091: "преди правех, свикнал съм",
  4112: "факла, фенерче",
  4124: "уплашен от, боя се от",
  4143: "женен за, омъжена за",
  4150: "съгласен с, единодушен за",
  4151: "грижа се за, тревожа се за",
  4160: "писна ми от, омръзна ми",
  4174: "депресия, меланхолия",
  4184: "все едно, въпреки това",
  4197: "нямам нищо против, не възразявам",
  4257: "тренирам, решавам",
  4308: "не можех, не успях",
  4333: "бих искал да",
  4387: "наречие",
  4457: "тоалетна",
  4772: "женен, омъжена",
  4787: "косвен, заобиколен",
  4903: "съжалявам, извинявай",
  4989: "излезе, появи се",
  5018: "съ-, съвместно",
  5021: "трябва, налага се",
  5023: "няма да, отказва да",
  5031: "приемам за даденост, подценявам",
  5056: "бих искал да бъда",
  5064: "когато цъфнат налъмите, никога",
  5092: "въртя поръчки, върша задачи",
  5202: "извършвам, правя",
  5775: "благоволявам, дарявам, отпускам",
  6012: "ожесточение, горчивина, язвителност",
  6013: "проницателност, съобразителност",
  6037: "пълен, завършен, явен",
  6496: "кураж, смелост, непоколебимост",
  6510: "остракизъм, изгнание, бойкот",
  6742: "лесно дошло, лесно отишло",
  6743: "без труд няма сполука",
  6940: "застоял, стар",
  6941: "гладуващ, прегладнял",
  6950: "изтичам, свършвам",
  7004: "течност, течен",
  7027: "пека, печено",
  7039: "задушавам, яхния",
  7043: "гръм, гърмя",
  7049: "чудя се, чудо"
};

function cleanBg(id, val) {
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
  if (res.includes(';')) {
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
    const orig = tr.bg;
    if (orig !== undefined) {
      const cleaned = cleanBg(w.id, orig);
      if (cleaned !== orig) {
        tr.bg = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Bulgarian translations in ${filePath}`);
}
