const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '../frontend/assets/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
const existing = new Set(words.map(w => String(w.word).toLowerCase().trim()));

const newNumbers = [
  { id: 6854, word: 'five', transcription: '/faɪv/', translation: 'пять', category: 'Elementary', level: 'A1', translations: { ru: 'пять', uk: "п'ять", de: 'fünf', es: 'cinco', fr: 'cinq', it: 'cinque', pl: 'pięć', tr: 'beş', pt: 'cinco' }, zipf: 5.5 },
  { id: 6855, word: 'nine', transcription: '/naɪn/', translation: 'девять', category: 'Elementary', level: 'A1', translations: { ru: 'девять', uk: "дев'ять", de: 'neun', es: 'nueve', fr: 'neuf', it: 'nove', pl: 'dziewięć', tr: 'dokuz', pt: 'nove' }, zipf: 5.2 },
  { id: 6856, word: 'thirteen', transcription: '/ˌθɜːˈtiːn/', translation: 'тринадцать', category: 'Elementary', level: 'A1', translations: { ru: 'тринадцать', uk: 'тринадцять', de: 'dreizehn', es: 'trece', fr: 'treize', it: 'tredici', pl: 'trzynaście', tr: 'on üç', pt: 'treze' }, zipf: 4.5 },
  { id: 6857, word: 'fourteen', transcription: '/ˌfɔːˈtiːn/', translation: 'четырнадцать', category: 'Elementary', level: 'A1', translations: { ru: 'четырнадцать', uk: 'чотирнадцять', de: 'vierzehn', es: 'catorce', fr: 'quatorze', it: 'quattordici', pl: 'czternaście', tr: 'on dört', pt: 'quatorze' }, zipf: 4.4 },
  { id: 6858, word: 'sixteen', transcription: '/ˌsɪkˈstiːn/', translation: 'шестнадцать', category: 'Elementary', level: 'A1', translations: { ru: 'шестнадцать', uk: 'шістнадцять', de: 'sechzehn', es: 'dieciséis', fr: 'seize', it: 'sedici', pl: 'szesnaście', tr: 'on altı', pt: 'dezesseis' }, zipf: 4.4 },
  { id: 6859, word: 'seventeen', transcription: '/ˌsev.ənˈtiːn/', translation: 'семнадцать', category: 'Elementary', level: 'A1', translations: { ru: 'семнадцать', uk: 'сімнадцять', de: 'siebzehn', es: 'diecisiete', fr: 'dix-sept', it: 'diciassette', pl: 'siedemnaście', tr: 'on yedi', pt: 'dezessete' }, zipf: 4.3 },
  { id: 6860, word: 'eighteen', transcription: '/ˌeɪˈtiːn/', translation: 'восемнадцать', category: 'Elementary', level: 'A1', translations: { ru: 'восемнадцать', uk: 'вісімнадцять', de: 'achtzehn', es: 'dieciocho', fr: 'dix-huit', it: 'diciotto', pl: 'osiemnaście', tr: 'on sekiz', pt: 'dezoito' }, zipf: 4.3 },
  { id: 6861, word: 'nineteen', transcription: '/ˌnaɪnˈtiːn/', translation: 'девятнадцать', category: 'Elementary', level: 'A1', translations: { ru: 'девятнадцать', uk: "дев'ятнадцять", de: 'neunzehn', es: 'diecinueve', fr: 'dix-neuf', it: 'diciannove', pl: 'dziewiętнаście', tr: 'on dokuz', pt: 'dezenove' }, zipf: 4.2 },
  { id: 6862, word: 'sixty', transcription: '/ˈsɪk.sti/', translation: 'шестьдесят', category: 'Elementary', level: 'A1', translations: { ru: 'шестьдесят', uk: 'шістдесят', de: 'sechzig', es: 'sesenta', fr: 'soixante', it: 'sessanta', pl: 'sześćdziesiąt', tr: 'altmış', pt: 'sessenta' }, zipf: 4.4 },
  { id: 6863, word: 'seventy', transcription: '/ˈsev.ən.ti/', translation: 'семьдесят', category: 'Elementary', level: 'A1', translations: { ru: 'семьдесят', uk: 'сімдесят', de: 'siebzig', es: 'setenta', fr: 'soixante-dix', it: 'settanta', pl: 'siedemdziesiąt', tr: 'yetmiş', pt: 'setenta' }, zipf: 4.3 },
  { id: 6864, word: 'eighty', transcription: '/ˈeɪ.ti/', translation: 'восемьдесят', category: 'Elementary', level: 'A1', translations: { ru: 'восемьдесят', uk: 'вісімдесят', de: 'achtzig', es: 'ochenta', fr: 'quatre-vingts', it: 'ottanta', pl: 'osiemdziesiąt', tr: 'seksen', pt: 'oitenta' }, zipf: 4.3 },
  { id: 6865, word: 'ninety', transcription: '/ˈnaɪn.ti/', translation: 'девяносто', category: 'Elementary', level: 'A1', translations: { ru: 'девяносто', uk: "дев'яносто", de: 'neunzig', es: 'noventa', fr: 'quatre-vingt-dix', it: 'novanta', pl: 'dziewięćdziesiąt', tr: 'doksan', pt: 'noventa' }, zipf: 4.2 }
];

let added = 0;
for (const n of newNumbers) {
  if (!existing.has(n.word)) {
    words.push(n);
    added++;
  }
}
fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2), 'utf8');
console.log('Added missing numbers count:', added, 'Total words:', words.length);
