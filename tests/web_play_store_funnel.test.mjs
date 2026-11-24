import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WEB_FUNNEL_I18N,
  getFunnelStrings,
  WEB_GATE_WORD_LIMIT,
  PLAY_STORE_URL,
} from '../frontend/components/modals/WebPlayStoreFunnelModal.js';

const REQUIRED_36_LOCALES = [
  'ru', 'uk', 'en', 'de', 'es', 'fr', 'pl', 'tr', 'it', 'ro',
  'bg', 'hu', 'el', 'da', 'lv', 'lt', 'pt', 'sk', 'sl', 'fi',
  'hr', 'cs', 'sv', 'et', 'hi', 'bn', 'ar', 'fa', 'ur', 'id',
  'vi', 'th', 'ko', 'ja', 'zh', 'kk'
];

test('WEB_FUNNEL_I18N covers EXACTLY 36 supported locales without exception (Critical Rule #1)', () => {
  assert.equal(REQUIRED_36_LOCALES.length, 36, 'Must define exactly 36 required locales');
  const configuredLocales = Object.keys(WEB_FUNNEL_I18N);
  assert.equal(configuredLocales.length, 36, `Must have exactly 36 locales configured in WEB_FUNNEL_I18N, got ${configuredLocales.length}`);

  for (const loc of REQUIRED_36_LOCALES) {
    const entry = WEB_FUNNEL_I18N[loc];
    assert.ok(entry, `Missing locale entry for "${loc}"`);
    assert.ok(entry.badge && entry.badge.trim().length > 0, `Locale "${loc}" missing badge`);
    assert.ok(entry.title && entry.title.trim().length > 0, `Locale "${loc}" missing title`);
    assert.ok(entry.desc && entry.desc.trim().length > 0, `Locale "${loc}" missing desc`);
    assert.ok(entry.btn && entry.btn.trim().length > 0, `Locale "${loc}" missing btn`);
    assert.ok(entry.sub && entry.sub.trim().length > 0, `Locale "${loc}" missing sub`);
  }
});

test('getFunnelStrings supports exact and regional locale tags (e.g. es-MX, pt-BR)', () => {
  assert.equal(getFunnelStrings('es').badge, '100 PALABRAS APRENDIDAS');
  assert.equal(getFunnelStrings('es-mx').badge, '100 PALABRAS APRENDIDAS');
  assert.equal(getFunnelStrings('pt-br').badge, '100 PALAVRAS APRENDIDAS');
  assert.equal(getFunnelStrings('ru-RU').badge, '100 СЛОВ ВЫУЧЕНО');
  assert.equal(getFunnelStrings('unknown').badge, '100 WORDS LEARNED');
});

test('Constants: WEB_GATE_WORD_LIMIT is 100 and PLAY_STORE_URL has tracking referrer', () => {
  assert.equal(WEB_GATE_WORD_LIMIT, 100);
  assert.ok(PLAY_STORE_URL.includes('id=com.englishbreakfast.app'));
  assert.ok(PLAY_STORE_URL.includes('referrer=utm_source%3Dweb_100_words_gate'));
});
