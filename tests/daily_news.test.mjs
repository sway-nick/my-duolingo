import test from 'node:test';
import assert from 'node:assert/strict';

import { SUPPORTED_LOCALE_CODES } from '../frontend/config/locales.js';
import { NEWS_I18N, getNewsStrings } from '../frontend/services/newsI18n.js';
import {
  lookupGlossaryWord,
  normalizeNewsLocale,
  detectUserNewsCountry,
  getArticleGlossaryForLocale,
  getStarterDemoEdition,
} from '../frontend/services/newsService.js';
import {
  LOCALE_LANGUAGE_NAMES,
  COUNTRY_NEWS_CONFIG,
  DEFAULT_ACTIVE_COUNTRIES,
  isMorningWindowForCountry,
  isEligibleGenerationTimeForCountry,
  getLocalTimeForOffset,
  parseRssHeadlines,
  normalizeGeneratedArticles,
  parseForcedCountriesSpec,
  buildGeminiPrompt,
  getExistingNewsDoc,
  containsWarOrPoliticsContent,
  WAR_AND_POLITICS_STOPWORDS_REGEX,
  BANNED_OUTPUT_KEYWORDS_REGEX,
} from '../scripts/generate_daily_news.mjs';

test('NEWS_I18N covers all 36 supported locales with Finance category and complete UI strings', () => {
  assert.equal(SUPPORTED_LOCALE_CODES.length, 36);
  const requiredKeys = Object.keys(NEWS_I18N.en);
  assert.ok(requiredKeys.includes('catFinance'), 'Expected catFinance key');
  assert.ok(!requiredKeys.includes('catSports'), 'catSports should be replaced by catFinance');

  for (const code of SUPPORTED_LOCALE_CODES) {
    assert.ok(NEWS_I18N[code], `Missing locale "${code}" in NEWS_I18N`);
    const strings = getNewsStrings(code);
    for (const key of requiredKeys) {
      assert.equal(typeof strings[key], 'string', `Missing key "${key}" for locale "${code}"`);
      assert.ok(strings[key].trim().length > 0, `Empty key "${key}" for locale "${code}"`);
    }
  }
});

test('LOCALE_LANGUAGE_NAMES covers all 36 supported locales', () => {
  assert.equal(Object.keys(LOCALE_LANGUAGE_NAMES).length, 36);
  for (const code of SUPPORTED_LOCALE_CODES) {
    assert.ok(LOCALE_LANGUAGE_NAMES[code], `Missing language name for "${code}"`);
  }
});

test('DEFAULT_ACTIVE_COUNTRIES covers core markets and active ad campaigns (Mexico, Colombia, LATAM)', () => {
  const adCountries = ['MX', 'CO', 'AR', 'CL', 'PE', 'BR', 'UA', 'KZ', 'US'];
  for (const c of adCountries) {
    assert.ok(DEFAULT_ACTIVE_COUNTRIES[c], `Missing ${c} in DEFAULT_ACTIVE_COUNTRIES`);
    assert.ok(COUNTRY_NEWS_CONFIG[c], `Missing ${c} in COUNTRY_NEWS_CONFIG`);
    assert.ok(COUNTRY_NEWS_CONFIG[c].hl, `Missing hl for ${c}`);
    assert.ok(COUNTRY_NEWS_CONFIG[c].gl, `Missing gl for ${c}`);
    assert.ok(COUNTRY_NEWS_CONFIG[c].ceid, `Missing ceid for ${c}`);
    assert.ok(typeof COUNTRY_NEWS_CONFIG[c].tz === 'number', `Missing tz for ${c}`);
  }
  // LATAM timezone detection
  assert.equal(detectUserNewsCountry('es', { timeZone: 'America/Bogota' }), 'CO');
  assert.equal(detectUserNewsCountry('es', { timeZone: 'America/Mexico_City' }), 'MX');
  assert.equal(detectUserNewsCountry('es', { timeZone: 'America/Santiago' }), 'CL');
  assert.equal(detectUserNewsCountry('es', { timeZone: 'America/Lima' }), 'PE');
  assert.equal(detectUserNewsCountry('es', { timeZone: 'America/Argentina/Buenos_Aires' }), 'AR');
  assert.equal(detectUserNewsCountry('pt', { timeZone: 'America/Sao_Paulo' }), 'BR');
});

test('detectUserNewsCountry separates country (by timezone) from interface language', () => {
  // User in Kazakhstan with Russian UI -> KZ news + Russian word translations
  assert.equal(detectUserNewsCountry('ru', { timeZone: 'Asia/Almaty' }), 'KZ');
  // User in Ukraine with Russian UI -> UA news + Russian word translations
  assert.equal(detectUserNewsCountry('ru', { timeZone: 'Europe/Kyiv' }), 'UA');
  assert.equal(detectUserNewsCountry('ru', { timeZone: 'Europe/Kiev' }), 'UA');
  // User in Germany with English UI -> DE news
  assert.equal(detectUserNewsCountry('en', { timeZone: 'Europe/Berlin' }), 'DE');
  // Fallback to navigator region tag when timezone is unknown
  assert.equal(detectUserNewsCountry('ru', { timeZone: 'Etc/UTC', navigatorLang: 'ru-KZ' }), 'KZ');
  // Fallback to default locale country when both unknown
  assert.equal(detectUserNewsCountry('uk', { timeZone: 'Etc/UTC', navigatorLang: 'uk' }), 'UA');
});

test('getArticleGlossaryForLocale picks the user interface language glossary from multi-language article', () => {
  const article = {
    glossaries: {
      ru: { growth: 'рост' },
      uk: { growth: 'зростання' },
      kk: { growth: 'өсу' },
    },
  };
  assert.equal(lookupGlossaryWord('growth', getArticleGlossaryForLocale(article, 'ru')), 'рост');
  assert.equal(lookupGlossaryWord('growth', getArticleGlossaryForLocale(article, 'uk')), 'зростання');
  assert.equal(lookupGlossaryWord('growth', getArticleGlossaryForLocale(article, 'kk')), 'өсу');
});

test('lookupGlossaryWord matches exact and inflected English word forms', () => {
  const glossary = {
    battery: 'аккумулятор',
    charge: 'заряжать',
    city: 'город',
    run: 'бежать',
    make: 'делать',
    merchant: 'продавец',
  };

  assert.equal(lookupGlossaryWord('Battery', glossary), 'аккумулятор');
  assert.equal(lookupGlossaryWord('batteries', glossary), 'аккумулятор');
  assert.equal(lookupGlossaryWord('charges', glossary), 'заряжать');
  assert.equal(lookupGlossaryWord('charged', glossary), 'заряжать');
  assert.equal(lookupGlossaryWord('cities', glossary), 'город');
  assert.equal(lookupGlossaryWord('running', glossary), 'бежать');
  assert.equal(lookupGlossaryWord('making', glossary), 'делать');
  assert.equal(lookupGlossaryWord("merchant's", glossary), 'продавец');
  assert.equal(lookupGlossaryWord('unknownword', glossary), null);
});

test('normalizeNewsLocale handles region tags and unsupported fallbacks', () => {
  assert.equal(normalizeNewsLocale('pt-BR'), 'pt');
  assert.equal(normalizeNewsLocale('es-MX'), 'es');
  assert.equal(normalizeNewsLocale('uk_UA'), 'uk');
  assert.equal(normalizeNewsLocale('xx'), 'en');
});

test('isMorningWindowForCountry triggers only during 06:00–07:59 local time', () => {
  assert.ok(COUNTRY_NEWS_CONFIG.KZ);
  // 01:30 UTC -> KZ (UTC+5) is 06:30 (true), UA (UTC+2) is 03:30 (false)
  const utc0130 = new Date('2026-11-22T01:30:00Z');
  assert.equal(isMorningWindowForCountry('KZ', utc0130), true);
  assert.equal(isMorningWindowForCountry('UA', utc0130), false);

  // 04:15 UTC -> UA (UTC+2) is 06:15 (true), KZ (UTC+5) is 09:15 (false)
  const utc0415 = new Date('2026-11-22T04:15:00Z');
  assert.equal(isMorningWindowForCountry('UA', utc0415), true);
  assert.equal(isMorningWindowForCountry('KZ', utc0415), false);

  // Fractional timezone: IN (UTC+5.5) at 01:00 UTC -> 06:30 local
  const utc0100 = new Date('2026-11-22T01:00:00Z');
  assert.equal(isMorningWindowForCountry('IN', utc0100), true);
  assert.equal(getLocalTimeForOffset(5.5, utc0100).hour, 6);
});

test('isEligibleGenerationTimeForCountry allows generation globally', () => {
  const utc0130 = new Date('2026-11-22T01:30:00Z');
  assert.equal(isEligibleGenerationTimeForCountry('KZ', utc0130), true);
  assert.equal(isEligibleGenerationTimeForCountry('UA', utc0130), true);

  const utc0730 = new Date('2026-11-22T07:30:00Z');
  assert.equal(isEligibleGenerationTimeForCountry('UA', utc0730), true);
  assert.equal(isMorningWindowForCountry('UA', utc0730), false);
});

test('parseForcedCountriesSpec parses COUNTRY:lang+lang format', () => {
  const m = parseForcedCountriesSpec('KZ:ru+kk,UA:uk+ru,US:en');
  assert.deepEqual(Array.from(m.get('KZ')), ['ru', 'kk']);
  assert.deepEqual(Array.from(m.get('UA')), ['uk', 'ru']);
  assert.deepEqual(Array.from(m.get('US')), ['en']);
});

test('parseRssHeadlines extracts clean title and sourceName without HTML tags', () => {
  const sampleXml = `
    <rss><channel>
      <item>
        <title><![CDATA[New Solar Battery Reaches Record Efficiency - TechCrunch]]></title>
        <source>TechCrunch</source>
        <description><![CDATA[<a href="https://example.com">Read more</a> about solar cells.]]></description>
      </item>
    </channel></rss>
  `;
  const items = parseRssHeadlines(sampleXml, 'technology', 5);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'New Solar Battery Reaches Record Efficiency');
  assert.equal(items[0].sourceName, 'TechCrunch');
});

test('normalizeGeneratedArticles supports tech, finance, positive and multi-language glossaries', () => {
  const raw = [
    { category: 'tech', title: 'A', paragraphs: ['P1'], sourceName: 'The Verge', glossaries: { ru: { 'Solar!': 'солнечный' } } },
    { category: 'business', title: 'B', paragraphs: ['P2'], sourceName: 'Bloomberg', glossaries: { ru: { market: 'рынок' }, kk: { market: 'нарық' } } },
    { category: 'positive', title: 'C', paragraphs: ['P3'], sourceName: 'Good News', glossaries: {} },
    { category: 'tech', title: 'D', paragraphs: ['P4'], sourceName: 'Extra', glossaries: {} },
  ];
  const out = normalizeGeneratedArticles(raw, ['ru', 'kk']);
  assert.equal(out.length, 3);
  assert.equal(out[0].category, 'tech');
  assert.equal(out[0].glossaries.ru.solar, 'солнечный');
  assert.equal(out[1].category, 'finance');
  assert.equal(out[1].glossaries.kk.market, 'нарық');
  assert.equal(out[0].sourceUrl, undefined);
});

test('getStarterDemoEdition returns 1 Tech + 1 Finance + 1 Positive with multi-language glossaries', () => {
  const ed = getStarterDemoEdition('ru', 'KZ');
  assert.equal(ed.country, 'KZ');
  assert.equal(ed.locale, 'ru');
  assert.equal(ed.articles.length, 3);
  assert.deepEqual(ed.articles.map((a) => a.category), ['tech', 'finance', 'positive']);
  assert.ok(Object.keys(ed.articles[1].glossaries.ru).length > 10);
});

test('buildGeminiPrompt injects previous day stories into deduplication block', () => {
  const headlines = [
    { topic: 'technology', title: 'Fresh Headline 1', sourceName: 'Wire' },
    { topic: 'business', title: 'Fresh Headline 2', sourceName: 'Wire' },
  ];
  const previousArticles = [
    { title: 'Yesterday Starship Launch Story' },
    { title: 'Yesterday Grand Theft Auto Debut' },
  ];

  const promptWithDeduplication = buildGeminiPrompt('MX', ['es'], headlines, previousArticles);
  assert.ok(promptWithDeduplication.includes('DEDUPLICATION'));
  assert.ok(promptWithDeduplication.includes('Yesterday Starship Launch Story'));
  assert.ok(promptWithDeduplication.includes('Yesterday Grand Theft Auto Debut'));
  assert.ok(promptWithDeduplication.includes('Strictly DO NOT repeat'));

  const promptWithoutPrevious = buildGeminiPrompt('MX', ['es'], headlines, []);
  assert.ok(!promptWithoutPrevious.includes('DEDUPLICATION'));
  assert.ok(promptWithoutPrevious.includes('Pick 3 completely fresh and engaging stories.'));
});

test('containsWarOrPoliticsContent filters out war, drones, weapons, missiles in multiple languages', () => {
  assert.equal(containsWarOrPoliticsContent('UK Discovers Fake Explosives for Drones'), true);
  assert.equal(containsWarOrPoliticsContent('Безпілотники атакували одразу декілька НПЗ'), true);
  assert.equal(containsWarOrPoliticsContent('Удар по російському корвету "Меркурій"'), true);
  assert.equal(containsWarOrPoliticsContent('Британія закупила вибухівку для ударних дронів'), true);
  assert.equal(containsWarOrPoliticsContent('Росія закуповує танки у Китаї'), true);
  assert.equal(containsWarOrPoliticsContent('Стрілянина біля торгового центру, є поранені'), true);
  assert.equal(containsWarOrPoliticsContent('Новые ракеты и военные учения армии'), true);

  // Peaceful tech / business headlines must be allowed:
  assert.equal(containsWarOrPoliticsContent('New Solar Battery Reaches Record Efficiency'), false);
  assert.equal(containsWarOrPoliticsContent('Google Pixel 11: новини, оновлення та особливості'), false);
  assert.equal(containsWarOrPoliticsContent('Казахстанский стартап привлек миллион долларов на развитие ИИ'), false);
});

test('parseRssHeadlines automatically drops war and drone items from feed', () => {
  const sampleXml = `
    <rss><channel>
      <item>
        <title><![CDATA[Британія закупила вибухівку для ударних дронів ЗСУ - РБК-Україна]]></title>
        <source>РБК-Україна</source>
        <description><![CDATA[Деталі постачання безпілотників]]></description>
      </item>
      <item>
        <title><![CDATA[Next-Gen Smartphone Displays Promise Zero Glare - Tech Daily]]></title>
        <source>Tech Daily</source>
        <description><![CDATA[Innovative screen crystals reduce glare]]></description>
      </item>
    </channel></rss>
  `;
  const items = parseRssHeadlines(sampleXml, 'technology', 5);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Next-Gen Smartphone Displays Promise Zero Glare');
});

test('normalizeGeneratedArticles drops articles containing banned war or military keywords', () => {
  const badArticle = [
    {
      category: 'tech',
      title: 'Army Unveils Advanced Recon Drone',
      paragraphs: ['A new military drone was deployed today for defense operations.'],
      sourceName: 'Defense News',
      glossaries: { en: { drone: 'flying robot' } }
    },
    {
      category: 'tech',
      title: 'New Solar Powered Bicycle',
      paragraphs: ['Engineers created an electric bicycle powered by clean solar panels.'],
      sourceName: 'Clean Tech',
      glossaries: { en: { bicycle: 'two wheeled vehicle' } }
    }
  ];
  const out = normalizeGeneratedArticles(badArticle, ['en']);
  assert.equal(out.length, 1);
  assert.equal(out[0].title, 'New Solar Powered Bicycle');
});

