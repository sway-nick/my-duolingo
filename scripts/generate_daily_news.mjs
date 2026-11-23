#!/usr/bin/env node
/**
 * Daily News Generator for English Breakfast (PRO feature)
 *
 * Separates NEWS REGION (ISO-2 country, e.g. KZ, UA, RU, DE, US) from INTERFACE LANGUAGE
 * (e.g. ru, uk, kk, de, en).
 *
 * For each active COUNTRY (recorded in Firestore `news_active_locales/{COUNTRY}_{locale}` within 14 days):
 *   - Runs starting at 06:00 AM local time of that country whenever today's edition does not exist yet
 *     (or forced via FORCE_COUNTRIES / --countries)
 *   - Fetches Google News RSS for that country (TECHNOLOGY, BUSINESS, SCIENCE)
 *   - Makes 1 Gemini API call per country to pick 1 top Tech + 1 top Finance + 1 top Positive/Science story
 *     (strictly excluding politics, wars, crime, disasters), write learner-friendly English digests,
 *     and build contextual `glossaries` for ALL active interface languages in that country!
 *   - Overwrites Firestore `daily_news/{COUNTRY}` (so old news is immediately replaced, 0 history bloat)
 *   - Automatically deletes stale `daily_news/{COUNTRY}` and `news_active_locales/{pair}` docs inactive > 14 days.
 *
 * Environment variables:
 *   GEMINI_API_KEY                 - Google Gemini API key
 *   FIREBASE_SERVICE_ACCOUNT_JSON  - Firebase Service Account JSON with Firestore read/write
 *   FIREBASE_PROJECT_ID            - Defaults to "english-breakfast-181ba"
 *   FORCE_COUNTRIES                - Optional comma-separated country[:langs] (e.g. "KZ:ru+kk,UA:uk+ru,US:en")
 *   DRY_RUN                        - Optional "true" to print generated JSON without writing to Firestore
 */

import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DEFAULT_FIREBASE_PROJECT_ID = 'english-breakfast-181ba';
const ACTIVE_WINDOW_DAYS = 14;
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

export const LOCALE_LANGUAGE_NAMES = {
  ar: 'Arabic',
  bn: 'Bengali',
  bg: 'Bulgarian',
  zh: 'Simplified Chinese',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  en: 'Simple English (short learner definition)',
  et: 'Estonian',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  el: 'Greek',
  hi: 'Hindi',
  hu: 'Hungarian',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  kk: 'Kazakh',
  ko: 'Korean',
  lv: 'Latvian',
  lt: 'Lithuanian',
  fa: 'Persian (Farsi)',
  pl: 'Polish',
  pt: 'Brazilian Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenian',
  es: 'Mexican / Latin American Spanish',
  sv: 'Swedish',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
};

// Baseline active countries (core markets + active ad campaign regions: Mexico, Colombia & LATAM) generated daily
export const DEFAULT_ACTIVE_COUNTRIES = {
  US: ['en'],
  UA: ['uk', 'ru'],
  KZ: ['ru', 'kk'],
  MX: ['es'],
  CO: ['es'],
  AR: ['es'],
  CL: ['es'],
  PE: ['es'],
  BR: ['pt'],
};

// ISO-2 Country -> Regional Google News RSS parameters & local timezone offset (hours)
export const COUNTRY_NEWS_CONFIG = {
  AE: { hl: 'ar', gl: 'AE', ceid: 'AE:ar', tz: 4, name: 'United Arab Emirates' },
  AM: { hl: 'ru', gl: 'AM', ceid: 'AM:ru', tz: 4, name: 'Armenia' },
  AR: { hl: 'es-419', gl: 'AR', ceid: 'AR:es-419', tz: -3, name: 'Argentina' },
  AT: { hl: 'de', gl: 'AT', ceid: 'AT:de', tz: 1, name: 'Austria' },
  AU: { hl: 'en-AU', gl: 'AU', ceid: 'AU:en', tz: 10, name: 'Australia' },
  AZ: { hl: 'ru', gl: 'AZ', ceid: 'AZ:ru', tz: 4, name: 'Azerbaijan' },
  BD: { hl: 'bn', gl: 'BD', ceid: 'BD:bn', tz: 6, name: 'Bangladesh' },
  BE: { hl: 'fr', gl: 'BE', ceid: 'BE:fr', tz: 1, name: 'Belgium' },
  BG: { hl: 'bg', gl: 'BG', ceid: 'BG:bg', tz: 2, name: 'Bulgaria' },
  BR: { hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419', tz: -3, name: 'Brazil' },
  BY: { hl: 'ru', gl: 'BY', ceid: 'BY:ru', tz: 3, name: 'Belarus' },
  CA: { hl: 'en-CA', gl: 'CA', ceid: 'CA:en', tz: -5, name: 'Canada' },
  CH: { hl: 'de', gl: 'CH', ceid: 'CH:de', tz: 1, name: 'Switzerland' },
  CL: { hl: 'es-419', gl: 'CL', ceid: 'CL:es-419', tz: -3, name: 'Chile' },
  CN: { hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans', tz: 8, name: 'China' },
  CO: { hl: 'es-419', gl: 'CO', ceid: 'CO:es-419', tz: -5, name: 'Colombia' },
  CZ: { hl: 'cs', gl: 'CZ', ceid: 'CZ:cs', tz: 1, name: 'Czechia' },
  DE: { hl: 'de', gl: 'DE', ceid: 'DE:de', tz: 1, name: 'Germany' },
  DK: { hl: 'da', gl: 'DK', ceid: 'DK:da', tz: 1, name: 'Denmark' },
  EE: { hl: 'et', gl: 'EE', ceid: 'EE:et', tz: 2, name: 'Estonia' },
  EG: { hl: 'ar', gl: 'EG', ceid: 'EG:ar', tz: 2, name: 'Egypt' },
  ES: { hl: 'es', gl: 'ES', ceid: 'ES:es', tz: 1, name: 'Spain' },
  FI: { hl: 'fi', gl: 'FI', ceid: 'FI:fi', tz: 2, name: 'Finland' },
  FR: { hl: 'fr', gl: 'FR', ceid: 'FR:fr', tz: 1, name: 'France' },
  GB: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en', tz: 0, name: 'United Kingdom' },
  GE: { hl: 'ru', gl: 'GE', ceid: 'GE:ru', tz: 4, name: 'Georgia' },
  GR: { hl: 'el', gl: 'GR', ceid: 'GR:el', tz: 2, name: 'Greece' },
  HR: { hl: 'hr', gl: 'HR', ceid: 'HR:hr', tz: 1, name: 'Croatia' },
  HU: { hl: 'hu', gl: 'HU', ceid: 'HU:hu', tz: 1, name: 'Hungary' },
  ID: { hl: 'id', gl: 'ID', ceid: 'ID:id', tz: 7, name: 'Indonesia' },
  IL: { hl: 'he', gl: 'IL', ceid: 'IL:he', tz: 2, name: 'Israel' },
  IN: { hl: 'hi', gl: 'IN', ceid: 'IN:hi', tz: 5.5, name: 'India' },
  IR: { hl: 'fa', gl: 'IR', ceid: 'IR:fa', tz: 3.5, name: 'Iran' },
  IT: { hl: 'it', gl: 'IT', ceid: 'IT:it', tz: 1, name: 'Italy' },
  JP: { hl: 'ja', gl: 'JP', ceid: 'JP:ja', tz: 9, name: 'Japan' },
  KR: { hl: 'ko', gl: 'KR', ceid: 'KR:ko', tz: 9, name: 'South Korea' },
  KZ: {
    hl: 'ru', gl: 'KZ', ceid: 'KZ:ru', tz: 5, name: 'Kazakhstan',
    searchTopics: {
      technology: 'Казахстан технологии ИИ стартап when:3d',
      business: 'Казахстан финансы бизнес инвестиции when:3d',
      science: 'Казахстан наука инновации открытие when:3d',
    },
  },
  LT: { hl: 'lt', gl: 'LT', ceid: 'LT:lt', tz: 2, name: 'Lithuania' },
  LV: { hl: 'lv', gl: 'LV', ceid: 'LV:lv', tz: 2, name: 'Latvia' },
  MD: { hl: 'ro', gl: 'MD', ceid: 'MD:ro', tz: 2, name: 'Moldova' },
  MX: { hl: 'es-419', gl: 'MX', ceid: 'MX:es-419', tz: -6, name: 'Mexico' },
  NL: { hl: 'nl', gl: 'NL', ceid: 'NL:nl', tz: 1, name: 'Netherlands' },
  PE: { hl: 'es-419', gl: 'PE', ceid: 'PE:es-419', tz: -5, name: 'Peru' },
  PK: { hl: 'ur', gl: 'PK', ceid: 'PK:ur', tz: 5, name: 'Pakistan' },
  PL: { hl: 'pl', gl: 'PL', ceid: 'PL:pl', tz: 1, name: 'Poland' },
  PT: { hl: 'pt-PT', gl: 'PT', ceid: 'PT:pt-150', tz: 0, name: 'Portugal' },
  RO: { hl: 'ro', gl: 'RO', ceid: 'RO:ro', tz: 2, name: 'Romania' },
  RU: { hl: 'ru', gl: 'RU', ceid: 'RU:ru', tz: 3, name: 'Russia' },
  SA: { hl: 'ar', gl: 'SA', ceid: 'SA:ar', tz: 3, name: 'Saudi Arabia' },
  SE: { hl: 'sv', gl: 'SE', ceid: 'SE:sv', tz: 1, name: 'Sweden' },
  SI: { hl: 'sl', gl: 'SI', ceid: 'SI:sl', tz: 1, name: 'Slovenia' },
  SK: { hl: 'sk', gl: 'SK', ceid: 'SK:sk', tz: 1, name: 'Slovakia' },
  TH: { hl: 'th', gl: 'TH', ceid: 'TH:th', tz: 7, name: 'Thailand' },
  TR: { hl: 'tr', gl: 'TR', ceid: 'TR:tr', tz: 3, name: 'Turkey' },
  UA: { hl: 'uk', gl: 'UA', ceid: 'UA:uk', tz: 2, name: 'Ukraine' },
  US: { hl: 'en-US', gl: 'US', ceid: 'US:en', tz: -5, name: 'United States' },
  UZ: { hl: 'ru', gl: 'UZ', ceid: 'UZ:ru', tz: 5, name: 'Uzbekistan' },
  VN: { hl: 'vi', gl: 'VN', ceid: 'VN:vi', tz: 7, name: 'Vietnam' },
};

export function getLocalTimeForOffset(tzOffsetHours, now = new Date()) {
  const shiftedMs = now.getTime() + tzOffsetHours * 3600 * 1000;
  const d = new Date(shiftedMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    dateKey: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`,
  };
}

export function isMorningWindowForCountry(country, now = new Date()) {
  const cfg = COUNTRY_NEWS_CONFIG[country] || COUNTRY_NEWS_CONFIG.US;
  const { hour } = getLocalTimeForOffset(cfg.tz, now);
  return hour === 6 || hour === 7;
}

export function isEligibleGenerationTimeForCountry(country, now = new Date()) {
  const cfg = COUNTRY_NEWS_CONFIG[country] || COUNTRY_NEWS_CONFIG.US;
  const { hour } = getLocalTimeForOffset(cfg.tz, now);
  // Eligible starting from 06:00 AM local time throughout the day if today's edition is missing
  return hour >= 6;
}

function decodeXmlEntities(str) {
  return String(str || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseRssHeadlines(xmlText, topic, maxItems = 8) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(String(xmlText || ''))) !== null && items.length < maxItems) {
    const block = match[1];
    const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(block);
    const sourceMatch = /<source\b[^>]*>([\s\S]*?)<\/source>/i.exec(block);
    const descMatch = /<description\b[^>]*>([\s\S]*?)<\/description>/i.exec(block);
    const rawTitle = decodeXmlEntities(titleMatch?.[1] || '');
    if (!rawTitle) continue;
    let sourceName = decodeXmlEntities(sourceMatch?.[1] || '');
    let cleanTitle = rawTitle;
    if (!sourceName && rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      sourceName = parts.pop().trim();
      cleanTitle = parts.join(' - ').trim();
    } else if (sourceName && cleanTitle.endsWith(` - ${sourceName}`)) {
      cleanTitle = cleanTitle.slice(0, -(sourceName.length + 3)).trim();
    }
    const snippet = decodeXmlEntities(descMatch?.[1] || '').slice(0, 260);
    items.push({
      topic,
      title: cleanTitle,
      sourceName: sourceName || 'News Wire',
      snippet,
    });
  }
  return items;
}

async function fetchRegionalHeadlines(country) {
  const cfg = COUNTRY_NEWS_CONFIG[country] || {
    hl: 'en',
    gl: country,
    ceid: `${country}:en`,
    tz: 0,
    name: country,
  };
  const topics = ['TECHNOLOGY', 'BUSINESS', 'SCIENCE'];
  const all = [];

  for (const topic of topics) {
    const lowerTopic = topic.toLowerCase();
    const searchQ = cfg.searchTopics?.[lowerTopic];
    const url = searchQ
      ? `https://news.google.com/rss/search?q=${encodeURIComponent(searchQ)}&hl=${encodeURIComponent(cfg.hl)}&gl=${encodeURIComponent(cfg.gl)}&ceid=${encodeURIComponent(cfg.ceid)}`
      : `https://news.google.com/rss/headlines/section/topic/${topic}?hl=${encodeURIComponent(cfg.hl)}&gl=${encodeURIComponent(cfg.gl)}&ceid=${encodeURIComponent(cfg.ceid)}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'EnglishBreakfastNewsBot/1.0' },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      all.push(...parseRssHeadlines(xml, lowerTopic, 7));
    } catch (err) {
      console.warn(`[${country}] RSS fetch failed for ${topic}:`, err.message);
    }
  }

  if (all.length === 0 && country !== 'US') {
    return fetchRegionalHeadlines('US');
  }
  return all;
}

export function normalizeGeneratedArticles(rawArticles, targetLocales = ['en']) {
  if (!Array.isArray(rawArticles)) return [];
  const validCategories = new Set(['tech', 'finance', 'positive']);
  const cleanGlossaryObj = (obj) => {
    const res = {};
    if (!obj || typeof obj !== 'object') return res;
    for (const [k, v] of Object.entries(obj)) {
      const cleanKey = String(k || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
      const cleanVal = String(v || '').trim();
      if (cleanKey && cleanVal) {
        res[cleanKey] = cleanVal;
      }
    }
    return res;
  };

  return rawArticles
    .slice(0, 3)
    .map((a, idx) => {
      const rawCat = String(a?.category || 'positive').toLowerCase();
      const cat = rawCat === 'business' ? 'finance' : rawCat;
      const paragraphs = Array.isArray(a?.paragraphs)
        ? a.paragraphs.map((p) => String(p || '').trim()).filter(Boolean)
        : [];
      const title = String(a?.title || '').trim();
      const sourceName = String(a?.sourceName || 'News Digest').trim().slice(0, 60);
      if (!title || paragraphs.length === 0) return null;

      const glossaries = {};
      if (a?.glossaries && typeof a.glossaries === 'object') {
        for (const [loc, g] of Object.entries(a.glossaries)) {
          const cleanLoc = String(loc || '').toLowerCase().slice(0, 2);
          if (LOCALE_LANGUAGE_NAMES[cleanLoc]) {
            glossaries[cleanLoc] = cleanGlossaryObj(g);
          }
        }
      } else if (a?.glossary && typeof a.glossary === 'object') {
        const primary = targetLocales[0] || 'en';
        glossaries[primary] = cleanGlossaryObj(a.glossary);
      }

      return {
        id: `news-${idx + 1}`,
        category: validCategories.has(cat) ? cat : 'positive',
        title,
        paragraphs,
        sourceName,
        glossaries,
      };
    })
    .filter(Boolean);
}

export function buildGeminiPrompt(country, targetLocales, headlines, previousArticles = []) {
  const cfg = COUNTRY_NEWS_CONFIG[country] || { name: country };
  const headlinesText = headlines
    .slice(0, 21)
    .map((h, i) => `${i + 1}. [${h.topic}] ${h.title} (Source: ${h.sourceName})`)
    .join('\n');

  const langSpec = targetLocales
    .map((loc) => `"${loc}": ${LOCALE_LANGUAGE_NAMES[loc] || loc}`)
    .join(', ');

  const previousTitles = (previousArticles || [])
    .map((a) => String(a?.title || '').trim())
    .filter(Boolean);

  const prevBlock = previousTitles.length > 0
    ? [
        '',
        `IMPORTANT - DEDUPLICATION (PREVIOUS STORIES TO EXCLUDE):`,
        `The following stories were ALREADY featured in yesterday's edition for ${country}. Strictly DO NOT repeat or cover the same events, companies, or topics:`,
        ...previousTitles.map((t, idx) => `  ${idx + 1}. "${t}"`),
      ].join('\n')
    : '';

  return [
    `You are an editor for the English learning app "English Breakfast".`,
    `Below are today's regional news headlines for ${cfg.name} (${country}):`,
    headlinesText,
    prevBlock,
    '',
    'Task:',
    '1. Strictly EXCLUDE politics, wars, elections, government conflicts, crime, violence, disasters, and panic.',
    previousTitles.length > 0
      ? '2. Strictly DO NOT repeat or cover the same events/stories featured yesterday (listed above). Pick 3 COMPLETELY FRESH stories.'
      : '2. Pick 3 completely fresh and engaging stories.',
    '3. Pick EXACTLY 3 stories: 1 top Technology ("tech"), 1 top Finance/Business ("finance" — neutral/constructive company, market, startup, or economy news), and 1 top Positive/Science ("positive").',
    '4. For each story, write a short, engaging original digest in natural learner-friendly English (A2–B1 level, 2 short paragraphs, 75–115 words total). Do NOT copy full copyrighted articles.',
    `5. For each story, include a "glossaries" object containing contextual word-by-word translations for these active interface languages: { ${langSpec} }. For each language, translate ~20–30 non-trivial lowercase English words used in that story's title and paragraphs.`,
    '6. Include "sourceName" (just the publication name as plain text, NO URLs).',
    '',
    'Return ONLY valid JSON matching this exact schema:',
    '{ "articles": [ { "category": "tech"|"finance"|"positive", "title": "...", "paragraphs": ["...", "..."], "sourceName": "...", "glossaries": { "ru": { "word": "translation" } } } ] }',
  ].filter(Boolean).join('\n');
}

async function generateArticlesWithGemini(country, targetLocales, headlines, apiKey, previousArticles = []) {
  const prompt = buildGeminiPrompt(country, targetLocales, headlines, previousArticles);

  let lastErr = null;
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        lastErr = new Error(`Gemini ${model} failed (${res.status}): ${errText.slice(0, 200)}`);
        continue;
      }
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(rawText);
      const articles = normalizeGeneratedArticles(parsed?.articles, targetLocales);
      if (articles.length > 0) return articles;
      lastErr = new Error(`Gemini ${model} returned empty articles array`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Gemini generation failed');
}

// --- Firebase Service Account JWT Auth ---
function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function getGoogleAccessToken(serviceAccount) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  );
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claim}`);
  const signature = sign
    .sign(serviceAccount.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  const jwt = `${header}.${claim}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Service account token exchange failed (${res.status})`);
  }
  const data = await res.json();
  return data.access_token;
}

/**
 * Reads `news_active_locales/{COUNTRY}_{locale}` docs active in the last 14 days
 * and groups them as Map<country, Set<locale>>. Always includes US -> ['en'] as global fallback.
 */
async function fetchActiveCountryLocalesFromFirestore(projectId, accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/news_active_locales?pageSize=200`;
  const grouped = new Map();
  for (const [c, langs] of Object.entries(DEFAULT_ACTIVE_COUNTRIES)) {
    grouped.set(c, new Set(langs));
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return grouped;
  const data = await res.json();
  const cutoffMs = Date.now() - ACTIVE_WINDOW_DAYS * 86400 * 1000;

  for (const doc of data?.documents || []) {
    const country = String(doc?.fields?.country?.stringValue || '').toUpperCase();
    const locale = String(doc?.fields?.locale?.stringValue || '').toLowerCase();
    const ts = doc?.fields?.lastActiveAt?.timestampValue || doc?.updateTime;
    const ms = ts ? Date.parse(ts) : 0;
    if (/^[A-Z]{2}$/.test(country) && LOCALE_LANGUAGE_NAMES[locale] && ms >= cutoffMs) {
      if (!grouped.has(country)) grouped.set(country, new Set());
      grouped.get(country).add(locale);
    }
  }
  return grouped;
}

export async function getExistingNewsDoc(projectId, accessToken, country) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/daily_news/${encodeURIComponent(country)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const doc = await res.json();
  const date = doc?.fields?.date?.stringValue || null;
  let articles = [];
  try {
    const raw = doc?.fields?.articlesJson?.stringValue || '[]';
    articles = JSON.parse(raw);
  } catch (_) {}
  return { date, articles };
}

export async function getExistingNewsDate(projectId, accessToken, country) {
  const doc = await getExistingNewsDoc(projectId, accessToken, country);
  return doc?.date || null;
}

async function writeDailyNewsToFirestore(projectId, accessToken, country, dateKey, articles) {
  // Overwrites daily_news/{COUNTRY} in place so previous day's articles are immediately replaced.
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/daily_news/${encodeURIComponent(country)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        country: { stringValue: country },
        date: { stringValue: dateKey },
        generatedAt: { timestampValue: new Date().toISOString() },
        articlesJson: { stringValue: JSON.stringify(articles) },
      },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Firestore write failed for ${country} (${res.status}): ${txt.slice(0, 200)}`);
  }
}

async function cleanupStaleNewsDocs(projectId, accessToken, activeCountriesSet) {
  const cutoffMs = Date.now() - ACTIVE_WINDOW_DAYS * 86400 * 1000;
  for (const collection of ['daily_news', 'news_active_locales']) {
    try {
      const listUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${collection}?pageSize=200`;
      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const doc of data?.documents || []) {
        const docName = String(doc?.name || '');
        const docId = docName.split('/').pop();
        if (!docId || DEFAULT_ACTIVE_COUNTRIES[docId] || DEFAULT_ACTIVE_COUNTRIES[docId.split('_')[0]]) continue;
        const country = collection === 'daily_news' ? docId : docId.split('_')[0];
        if (activeCountriesSet.has(country) && collection === 'daily_news') continue;
        const ts =
          doc?.fields?.lastActiveAt?.timestampValue ||
          doc?.fields?.generatedAt?.timestampValue ||
          doc?.updateTime;
        const ms = ts ? Date.parse(ts) : 0;
        if (ms > 0 && ms < cutoffMs) {
          const delUrl = `https://firestore.googleapis.com/v1/${docName}`;
          const delRes = await fetch(delUrl, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (delRes.ok) {
            console.log(`🧹 Deleted stale ${collection}/${docId} (inactive > ${ACTIVE_WINDOW_DAYS}d).`);
          }
        }
      }
    } catch (err) {
      console.warn(`Cleanup skipped for ${collection}:`, err.message);
    }
  }
}

export function parseForcedCountriesSpec(spec) {
  const map = new Map();
  for (const token of String(spec || '').split(',')) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    const [rawCountry, rawLangs] = trimmed.split(':');
    const country = String(rawCountry || '').trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) continue;
    const langs = (rawLangs || 'en')
      .split('+')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => Boolean(LOCALE_LANGUAGE_NAMES[l]));
    map.set(country, new Set(langs.length > 0 ? langs : ['en']));
  }
  return map;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required.');
  }

  const dryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');
  const forceAll = process.argv.includes('--force');
  const countriesArg = process.argv.find((a) => a.startsWith('--countries='));
  const forceSpec = countriesArg ? countriesArg.split('=')[1] : process.env.FORCE_COUNTRIES || process.env.FORCE_LOCALES || '';
  const forcedMap = parseForcedCountriesSpec(forceSpec);

  const projectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
  let accessToken = null;
  if (!dryRun) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GA4_SERVICE_ACCOUNT_JSON;
    if (!saRaw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON or GA4_SERVICE_ACCOUNT_JSON is required (or pass --dry-run).');
    }
    const sa = JSON.parse(saRaw);
    accessToken = await getGoogleAccessToken(sa);
  }

  const countryLocalesMap =
    forcedMap.size > 0
      ? forcedMap
      : accessToken
        ? await fetchActiveCountryLocalesFromFirestore(projectId, accessToken)
        : new Map(Object.entries(DEFAULT_ACTIVE_COUNTRIES).map(([c, ls]) => [c, new Set(ls)]));

  console.log(
    'Candidate active countries:',
    Array.from(countryLocalesMap.entries())
      .map(([c, ls]) => `${c}[${Array.from(ls).join('+')}]`)
      .join(', '),
  );

  let generatedCount = 0;
  for (const [country, localesSet] of countryLocalesMap.entries()) {
    const cfg = COUNTRY_NEWS_CONFIG[country] || { tz: 0, name: country };
    const localTime = getLocalTimeForOffset(cfg.tz);
    const isForced = forcedMap.has(country) || forceAll;
    const targetLocales = Array.from(localesSet).slice(0, 4);

    if (!isForced && !isEligibleGenerationTimeForCountry(country)) {
      console.log(`[${country}] Skipping — local hour is ${localTime.hour}:00 (waiting for >= 06:00 AM).`);
      continue;
    }

    let previousArticles = [];
    if (!dryRun && accessToken) {
      const existingDoc = await getExistingNewsDoc(projectId, accessToken, country);
      if (!isForced && existingDoc?.date === localTime.dateKey) {
        console.log(`[${country}] Already generated for ${localTime.dateKey}, skipping.`);
        continue;
      }
      if (Array.isArray(existingDoc?.articles)) {
        previousArticles = existingDoc.articles;
      }
    }

    if (previousArticles.length > 0) {
      console.log(`[${country}] Found ${previousArticles.length} previous stories for deduplication.`);
    }

    console.log(`[${country}] Fetching regional RSS (Tech + Business + Science)...`);
    const headlines = await fetchRegionalHeadlines(country);
    if (headlines.length === 0) {
      console.warn(`[${country}] No RSS headlines found, skipping.`);
      continue;
    }

    console.log(`[${country}] Generating 3 English stories + glossaries (${targetLocales.join(', ')}) via Gemini...`);
    const articles = await generateArticlesWithGemini(country, targetLocales, headlines, apiKey, previousArticles);

    if (dryRun) {
      console.log(`[${country}] DRY RUN (${localTime.dateKey}):`, JSON.stringify(articles, null, 2));
    } else {
      await writeDailyNewsToFirestore(projectId, accessToken, country, localTime.dateKey, articles);
      console.log(`[${country}] ✅ Saved ${articles.length} articles to daily_news/${country} (${localTime.dateKey}).`);
    }
    generatedCount++;
  }

  if (!dryRun && accessToken && generatedCount > 0) {
    await cleanupStaleNewsDocs(projectId, accessToken, new Set(countryLocalesMap.keys()));
  }

  console.log(`Done. Generated editions for ${generatedCount} country/countries.`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error('❌ Daily News generation failed:', err);
    process.exit(1);
  });
}
