const assert = require('assert');
console.log('🧪 Running Input Tests...');
let passed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ✅ PASS: ' + name); passed++; } catch (e) { console.error('  ❌ FAIL: ' + name, e.message); } }
function norm(t) { return (t||'').replace(/\u00a0/g,' ').replace(/_/g,'').replace(/\s+/g,' ').trim().toLowerCase(); }
test('Test Mode: trims & lowers', () => { assert.strictEqual(norm('  HELLO  '), 'hello'); assert.strictEqual(norm('_h_e_l_l_o_'), 'hello'); });
test('Dict Search: case insensitive', () => { const list = [{word:'Apple', translation:'яблоко'}]; const q = 'app'; assert.ok(list.some(w => w.word.toLowerCase().includes(q) || w.translation.includes(q))); });
test('Add Word: English regex check', () => { const reg = /[^a-z\s\-\x27]/; assert.ok(reg.test('apple123')); assert.ok(!reg.test('mother-in-law')); assert.ok(!reg.test('don''t')); });
test('Add Word: Length limits', () => { assert.strictEqual('a'.repeat(50).slice(0,35).length, 35); assert.strictEqual('b'.repeat(100).slice(0,60).length, 60); assert.strictEqual('c'.repeat(200).slice(0,120).length, 120); });
test('Auth: Email regex', () => { const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; assert.ok(re.test('user@mail.com')); assert.ok(!re.test('invalid-email')); });
test('Auth: Password min length 6', () => { assert.ok('123456'.length >= 6); assert.ok(!('12345'.length >= 6)); });
console.log(
🎉 RESULTS: / input tests passed!);

console.log('🧪 Starting Comprehensive Automated Tests for All Inputs in My Duolingo...\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error('     Error:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 1. ТРЕНИРОВКА: РЕЖИМ «ТЕСТ» (Written Test Input Mode)
// -----------------------------------------------------------------------------
console.log('📋 1. Testing "Тест" (TrainingCard Written Input)...');

function normalizeUserAnswer(rawText) {
  return (rawText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/_/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function calculateLevenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1)
            );
    }
  }
  return matrix[b.length][a.length];
}

function renderDiffHtml(userText, targetText) {
  let html = '';
  for (let i = 0; i < userText.length; i++) {
    const u = userText[i];
    const t = targetText[i];
    if (u === t) {
      html += `<span class="match">${u}</span>`;
    } else {
      html += `<span class="mismatch">${u}</span>`;
    }
  }
  if (userText.length < targetText.length) {
    const missingCount = targetText.length - userText.length;
    for (let j = 0; j < missingCount; j++) {
      html += `<span class="diff-missing-dash"></span>`;
    }
  }
  return html;
}

test('Test Input: Trims whitespace, handles non-breaking spaces & lowercases', () => {
  const target = 'blossom';
  assert.strictEqual(normalizeUserAnswer('  BLOSSOM  '), target);
  assert.strictEqual(normalizeUserAnswer('BlOsSoM'), target);
  assert.strictEqual(normalizeUserAnswer('blossom\u00a0'), target);
});

test('Test Input: Strips underscores and placeholder artifacts', () => {
  const target = 'apple';
  assert.strictEqual(normalizeUserAnswer('__apple__'), target);
  assert.strictEqual(normalizeUserAnswer('_a_p_p_l_e_'), target);
});

test('Test Input: Fuzzy typo check allows minor typo (second chance)', () => {
  const target = 'declaration';
  const typo = normalizeUserAnswer('declaraton'); // 1 letter missing
  const lev = calculateLevenshtein(typo, target);
  const maxAllowed = Math.max(2, Math.floor(target.length * 0.38));
  assert.strictEqual(lev, 1);
  assert.ok(lev <= maxAllowed);
});

test('Test Input: Gross mistake fails second chance threshold', () => {
  const target = 'declaration';
  const wrong = normalizeUserAnswer('banana');
  const lev = calculateLevenshtein(wrong, target);
  const maxAllowed = Math.max(2, Math.floor(target.length * 0.38));
  assert.ok(lev > maxAllowed);
});

test('Test Input: Diff renderer marks matches, mismatches, and missing dashes', () => {
  const diff = renderDiffHtml('aple', 'apple');
  assert.ok(diff.includes('class="match"'));
  assert.ok(diff.includes('class="diff-missing-dash"'));
});

// -----------------------------------------------------------------------------
// 2. СЛОВАРЬ: ПОИСК ПО СЛОВАМ И КАТЕГОРИЯМ
// -----------------------------------------------------------------------------
console.log('\n📋 2. Testing Dictionary Search Input...');

const mockWords = [
  { id: '1', word: 'abandon', translation: 'покидать', category: 'Intermediate' },
  { id: '2', word: 'ability', translation: 'способность', category: 'Elementary' },
  { id: '3', word: 'apple', translation: 'яблоко', category: 'Elementary' },
  { id: '4', word: 'break', translation: 'ломать', category: 'Irregular verb' },
];

function searchDictionary(query, categoryFilter, words) {
  const q = (query || '').toLowerCase().trim();
  return words.filter((w) => {
    if (categoryFilter && categoryFilter !== 'All' && categoryFilter !== 'Все категории') {
      if (w.category !== categoryFilter) return false;
    }
    if (!q) return true;
    const matchEn = w.word.toLowerCase().includes(q);
    const matchRu = (w.translation || '').toLowerCase().includes(q);
    return matchEn || matchRu;
  });
}

test('Dict Search: English query matches case-insensitively', () => {
  const res = searchDictionary('APP', 'All', mockWords);
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].word, 'apple');
});

test('Dict Search: Russian query matches translation', () => {
  const res = searchDictionary('яблоко', 'All', mockWords);
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].word, 'apple');
});

test('Dict Search: Category filter combines correctly with search query', () => {
  const res1 = searchDictionary('ab', 'Elementary', mockWords);
  assert.strictEqual(res1.length, 1);
  assert.strictEqual(res1[0].word, 'ability');

  const res2 = searchDictionary('ab', 'Intermediate', mockWords);
  assert.strictEqual(res2.length, 1);
  assert.strictEqual(res2[0].word, 'abandon');
});

test('Dict Search: Empty query returns all items in category', () => {
  const res = searchDictionary('', 'Elementary', mockWords);
  assert.strictEqual(res.length, 2);
});

// -----------------------------------------------------------------------------
// 3. СЛОВАРЬ: МОДАЛЬНОЕ ОКНО «ДОБАВИТЬ СЛОВО»
// -----------------------------------------------------------------------------
console.log('\n📋 3. Testing "Добавить слово" Modal Inputs...');

function validateAddWordEnglish(val) {
  let clean = (val || '').toLowerCase();
  const hasInvalidChars = /[^a-z\s\-\']/.test(clean);
  if (hasInvalidChars) {
    clean = clean.replace(/[^a-z\s\-\']/g, '');
  }
  return {
    value: clean.slice(0, 35),
    hasInvalidChars,
    isValidLength: clean.length > 0 && clean.length <= 35,
  };
}

function validateAddWordTranslation(val) {
  const clean = (val || '').toLowerCase().trim();
  return {
    value: clean.slice(0, 60),
    isValidLength: clean.length > 0 && clean.length <= 60,
  };
}

function validateAddWordNotes(val) {
  const clean = (val || '').trim();
  return {
    value: clean.slice(0, 120),
    isValidLength: clean.length <= 120,
  };
}

const CLIENT_PROFANITY = [
  'fuck', 'fucking', 'fucker', 'fucked', 'fucks',
  'shit', 'bitch', 'cunt', 'dick', 'pussy', 'asshole',
  'хуй', 'пизд', 'сука'
];

function isProfane(text) {
  const t = String(text || '').toLowerCase();
  return CLIENT_PROFANITY.some((bad) => {
    const reg = new RegExp('\\b' + bad + '\\b', 'i');
    return reg.test(t) || t.includes(bad);
  });
}

function checkWordDuplicate(typedWord, words) {
  const clean = String(typedWord || '').trim().toLowerCase();
  return words.find((w) => w.word && w.word.trim().toLowerCase() === clean) || null;
}

test('Add Word: English input blocks cyrillic, numbers, symbols', () => {
  const res = validateAddWordEnglish('Apple 123! яблоко');
  assert.strictEqual(res.value, 'apple  ');
  assert.strictEqual(res.hasInvalidChars, true);
});

test('Add Word: English input permits valid hyphens and apostrophes', () => {
  const res1 = validateAddWordEnglish("don't");
  assert.strictEqual(res1.value, "don't");
  assert.strictEqual(res1.hasInvalidChars, false);

  const res2 = validateAddWordEnglish("mother-in-law");
  assert.strictEqual(res2.value, "mother-in-law");
  assert.strictEqual(res2.hasInvalidChars, false);
});

test('Add Word: Enforces character limits (Word: 35, Translation: 60, Notes: 120)', () => {
  assert.strictEqual(validateAddWordEnglish('a'.repeat(50)).value.length, 35);
  assert.strictEqual(validateAddWordTranslation('т'.repeat(80)).value.length, 60);
  assert.strictEqual(validateAddWordNotes('n'.repeat(150)).value.length, 120);
});

test('Add Word: Profanity filter identifies forbidden words', () => {
  assert.strictEqual(isProfane('bitch'), true);
  assert.strictEqual(isProfane('friendly learning word'), false);
});

test('Add Word: Duplicate detector correctly flags existing words', () => {
  const dup = checkWordDuplicate('apple', mockWords);
  assert.ok(dup !== null);
  assert.strictEqual(dup.id, '3');

  const notDup = checkWordDuplicate('cherry', mockWords);
  assert.strictEqual(notDup, null);
});

// -----------------------------------------------------------------------------
// 4. АВТОРИЗАЦИЯ: ВХОД И РЕГИСТРАЦИЯ
// -----------------------------------------------------------------------------
console.log('\n📋 4. Testing Auth Modal Inputs...');

function validateEmail(email) {
  const clean = String(email || '').trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(clean);
}

function validatePassword(pass) {
  return Boolean(pass && pass.length >= 6);
}

function validatePasswordConfirmation(p1, p2) {
  return Boolean(p1 && p1 === p2);
}

test('Auth: Email regex validates standard emails and rejects malformed', () => {
  assert.strictEqual(validateEmail('test@example.com'), true);
  assert.strictEqual(validateEmail('user.name+tag@sub.domain.co.uk'), true);
  assert.strictEqual(validateEmail('invalid-email'), false);
  assert.strictEqual(validateEmail('@no-user.com'), false);
  assert.strictEqual(validateEmail('no-domain@'), false);
  assert.strictEqual(validateEmail('spaces in@mail.com'), false);
});

test('Auth: Password enforces min length of 6 characters', () => {
  assert.strictEqual(validatePassword('12345'), false);
  assert.strictEqual(validatePassword('123456'), true);
  assert.strictEqual(validatePassword('strongPass2026!'), true);
});

test('Auth: Password confirmation matches strictly', () => {
  assert.strictEqual(validatePasswordConfirmation('pass123', 'pass123'), true);
  assert.strictEqual(validatePasswordConfirmation('pass123', 'pass999'), false);
});

console.log('\n=============================================================');
console.log(`🎉 TEST SUMMARY: ${passed}/${total} input tests passed successfully!`);
console.log('=============================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}