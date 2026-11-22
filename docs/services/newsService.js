// Daily News data service:
// - Detects user's country via timezone (Intl.DateTimeFormat, zero GPS/permissions) + locale fallback
// - Separates news REGION (country, e.g. KZ/UA/DE/US) from word translation LANGUAGE (interface locale, e.g. ru/uk/kk/en)
// - Fetches Firestore `daily_news/{COUNTRY}` (1 doc per active country with multi-language `glossaries`)
// - Caches today's edition in localStorage and sends once-per-day active PRO ping `news_active_locales/{COUNTRY}_{locale}`

import {
  fetchDailyNewsFirestore,
  reportActiveNewsLocaleFirestore,
} from './firebase.js?v=386.0';
import { isProActive } from './proState.js?v=386.0';
import { isLocaleSupported } from '../config/locales.js?v=386.0';

const CACHE_PREFIX = 'eb_daily_news_v2_';
const ACTIVE_PING_PREFIX = 'eb_news_active_ping_v2_';

// IANA Timezone -> ISO-2 Country Code (zero permissions, works offline on Android WebView & Web)
export const TIMEZONE_TO_COUNTRY = {
  // Ukraine
  'Europe/Kyiv': 'UA',
  'Europe/Kiev': 'UA',
  'Europe/Uzhgorod': 'UA',
  'Europe/Zaporozhye': 'UA',
  // Kazakhstan
  'Asia/Almaty': 'KZ',
  'Asia/Qyzylorda': 'KZ',
  'Asia/Aqtobe': 'KZ',
  'Asia/Aqtau': 'KZ',
  'Asia/Atyrau': 'KZ',
  'Asia/Oral': 'KZ',
  'Asia/Qostanay': 'KZ',
  // Russia
  'Europe/Moscow': 'RU',
  'Europe/Kaliningrad': 'RU',
  'Europe/Samara': 'RU',
  'Europe/Volgograd': 'RU',
  'Europe/Saratov': 'RU',
  'Europe/Astrakhan': 'RU',
  'Europe/Ulyanovsk': 'RU',
  'Europe/Kirov': 'RU',
  'Asia/Yekaterinburg': 'RU',
  'Asia/Omsk': 'RU',
  'Asia/Novosibirsk': 'RU',
  'Asia/Barnaul': 'RU',
  'Asia/Tomsk': 'RU',
  'Asia/Novokuznetsk': 'RU',
  'Asia/Krasnoyarsk': 'RU',
  'Asia/Irkutsk': 'RU',
  'Asia/Chita': 'RU',
  'Asia/Yakutsk': 'RU',
  'Asia/Vladivostok': 'RU',
  'Asia/Sakhalin': 'RU',
  'Asia/Magadan': 'RU',
  'Asia/Kamchatka': 'RU',
  'Asia/Anadyr': 'RU',
  // CIS & Neighbors
  'Europe/Minsk': 'BY',
  'Asia/Tashkent': 'UZ',
  'Asia/Samarkand': 'UZ',
  'Asia/Tbilisi': 'GE',
  'Asia/Yerevan': 'AM',
  'Asia/Baku': 'AZ',
  'Asia/Bishkek': 'KG',
  'Asia/Dushanbe': 'TJ',
  'Europe/Chisinau': 'MD',
  // Europe
  'Europe/Warsaw': 'PL',
  'Europe/Berlin': 'DE',
  'Europe/Busingen': 'DE',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'Atlantic/Canary': 'ES',
  'Europe/Rome': 'IT',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Lisbon': 'PT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Prague': 'CZ',
  'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI',
  'Europe/Zagreb': 'HR',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Sofia': 'BG',
  'Europe/Athens': 'GR',
  'Europe/Copenhagen': 'DK',
  'Europe/Stockholm': 'SE',
  'Europe/Helsinki': 'FI',
  'Europe/Oslo': 'NO',
  'Europe/Tallinn': 'EE',
  'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT',
  'Europe/Istanbul': 'TR',
  'Asia/Istanbul': 'TR',
  'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL',
  // Americas
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Sao_Paulo': 'BR',
  'America/Fortaleza': 'BR',
  'America/Recife': 'BR',
  'America/Bahia': 'BR',
  'America/Manaus': 'BR',
  'America/Belem': 'BR',
  'America/Mexico_City': 'MX',
  'America/Monterrey': 'MX',
  'America/Cancun': 'MX',
  'America/Tijuana': 'MX',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Bogota': 'CO',
  'America/Santiago': 'CL',
  'America/Lima': 'PE',
  // Asia / Middle East / Oceania
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK',
  'Asia/Tehran': 'IR',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Africa/Cairo': 'EG',
  'Asia/Jakarta': 'ID',
  'Asia/Makassar': 'ID',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Saigon': 'VN',
  'Asia/Bangkok': 'TH',
  'Asia/Seoul': 'KR',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Chongqing': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Singapore': 'SG',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
};

export const LOCALE_DEFAULT_COUNTRY = {
  ar: 'AE',
  bn: 'BD',
  bg: 'BG',
  zh: 'CN',
  hr: 'HR',
  cs: 'CZ',
  da: 'DK',
  en: 'US',
  et: 'EE',
  fi: 'FI',
  fr: 'FR',
  de: 'DE',
  el: 'GR',
  hi: 'IN',
  hu: 'HU',
  id: 'ID',
  it: 'IT',
  ja: 'JP',
  kk: 'KZ',
  ko: 'KR',
  lv: 'LV',
  lt: 'LT',
  fa: 'IR',
  pl: 'PL',
  pt: 'BR',
  ro: 'RO',
  ru: 'RU',
  sk: 'SK',
  sl: 'SI',
  es: 'MX',
  sv: 'SE',
  th: 'TH',
  tr: 'TR',
  uk: 'UA',
  ur: 'PK',
  vi: 'VN',
};

export function getLocalDateKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function normalizeNewsLocale(rawLocale) {
  const base = String(rawLocale || 'en').toLowerCase().split(/[-_]/)[0];
  return isLocaleSupported(base) ? base : 'en';
}

/**
 * Detects the user's country (ISO-2 uppercase, e.g. 'KZ', 'UA', 'DE', 'US')
 * without GPS or permissions:
 *   1. IANA timezone via Intl.DateTimeFormat().resolvedOptions().timeZone
 *   2. Region subtag from navigator.languages / navigator.language (e.g. 'ru-KZ' -> 'KZ')
 *   3. Default country for the current interface locale
 */
export function detectUserNewsCountry(rawLocale = 'en', { timeZone = null, navigatorLang = null } = {}) {
  let tz = timeZone;
  if (!tz) {
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (_) {
      tz = '';
    }
  }
  if (tz && TIMEZONE_TO_COUNTRY[tz]) {
    return TIMEZONE_TO_COUNTRY[tz];
  }

  let navTag = navigatorLang;
  if (!navTag && typeof navigator !== 'undefined') {
    navTag = (Array.isArray(navigator.languages) && navigator.languages[0]) || navigator.language || '';
  }
  const regionMatch = /[-_]([A-Za-z]{2})(?:$|[-_])/.exec(String(navTag || ''));
  if (regionMatch && regionMatch[1]) {
    return regionMatch[1].toUpperCase();
  }

  const locale = normalizeNewsLocale(rawLocale);
  return LOCALE_DEFAULT_COUNTRY[locale] || 'US';
}

/**
 * Picks the contextual glossary object for the user's interface language from an article.
 * Supports both new multi-language `article.glossaries[locale]` and legacy `article.glossary`.
 */
export function getArticleGlossaryForLocale(article, locale) {
  if (!article || typeof article !== 'object') return null;
  const code = normalizeNewsLocale(locale);
  if (article.glossaries && typeof article.glossaries === 'object') {
    if (article.glossaries[code] && typeof article.glossaries[code] === 'object') {
      return article.glossaries[code];
    }
  }
  if (article.glossary && typeof article.glossary === 'object') {
    return article.glossary;
  }
  return null;
}

/**
 * Resolves a tapped word against an article's contextual glossary.
 * Tries exact lowercase match, apostrophe-stripped match, and common English inflections.
 */
export function lookupGlossaryWord(rawWord, glossary) {
  if (!rawWord || !glossary || typeof glossary !== 'object') return null;
  const cleaned = String(rawWord)
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u02BB]/g, "'")
    .replace(/^[^a-z]+|[^a-z]+$/g, '');
  if (!cleaned) return null;

  const candidates = [cleaned];
  if (cleaned.endsWith("'s") && cleaned.length > 3) {
    candidates.push(cleaned.slice(0, -2));
  }
  if (cleaned.endsWith('ies') && cleaned.length > 4) {
    candidates.push(cleaned.slice(0, -3) + 'y');
  }
  if (cleaned.endsWith('es') && cleaned.length > 3) {
    candidates.push(cleaned.slice(0, -2));
  }
  if (cleaned.endsWith('s') && cleaned.length > 3 && !cleaned.endsWith('ss')) {
    candidates.push(cleaned.slice(0, -1));
  }
  if (cleaned.endsWith('ied') && cleaned.length > 4) {
    candidates.push(cleaned.slice(0, -3) + 'y');
  }
  if (cleaned.endsWith('ed') && cleaned.length > 4) {
    candidates.push(cleaned.slice(0, -2));
    candidates.push(cleaned.slice(0, -1));
  }
  if (cleaned.endsWith('ing') && cleaned.length > 5) {
    const stem = cleaned.slice(0, -3);
    candidates.push(stem);
    candidates.push(stem + 'e');
    if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      candidates.push(stem.slice(0, -1));
    }
  }

  for (const cand of candidates) {
    if (Object.prototype.hasOwnProperty.call(glossary, cand) && glossary[cand]) {
      return String(glossary[cand]);
    }
  }
  return null;
}

/**
 * Starter edition (1 Tech + 1 Finance + 1 Good News) used only if Firestore is unreachable/unseeded.
 */
export function getStarterDemoEdition(locale, country = null) {
  const code = normalizeNewsLocale(locale);
  const resolvedCountry = country || detectUserNewsCountry(code);
  const today = getLocalDateKey();

  return {
    country: resolvedCountry,
    locale: code,
    date: today,
    isDemoEdition: true,
    isFallbackEdition: false,
    articles: [
      {
        id: 'starter-tech-1',
        category: 'tech',
        title: 'New Lightweight Battery Charges in Ten Minutes',
        paragraphs: [
          'Engineers have announced a lightweight battery breakthrough that stores nearly twice the energy of previous models. It charges in just ten minutes using ordinary household outlets.',
          'Researchers expect electric bicycles and portable devices to adopt the technology within two years, making clean travel more affordable for everyday commuters.',
        ],
        sourceName: 'Tech Daily Digest',
        glossaries: {
          ru: {
            lightweight: 'лёгкий',
            battery: 'батарея / аккумулятор',
            breakthrough: 'прорыв',
            stores: 'хранит',
            charges: 'заряжается',
            outlets: 'розетки',
            adopt: 'внедрить',
            affordable: 'доступный по цене',
            commuters: 'пассажиры / те, кто ездит на работу',
          },
          uk: {
            lightweight: 'легкий',
            battery: 'батарея / акумулятор',
            breakthrough: 'прорив',
            stores: 'зберігає',
            charges: 'заряджається',
            outlets: 'розетки',
            adopt: 'впровадити',
            affordable: 'доступний за ціною',
            commuters: 'пасажири, що їздять на роботу',
          },
          en: {
            breakthrough: 'a sudden, important discovery',
            outlets: 'wall sockets for electricity',
            affordable: 'not too expensive',
            commuters: 'people who travel regularly to work',
          },
        },
      },
      {
        id: 'starter-finance-2',
        category: 'finance',
        title: 'Small Online Businesses Report Strongest Quarterly Growth in Three Years',
        paragraphs: [
          'Independent online shops recorded steady revenue growth this quarter as digital payments became faster and cheaper for small merchants. Lower transfer fees helped many founders invest in better delivery and customer support.',
          'Analysts note that rising demand for local handmade goods is creating new jobs and healthy competition across regional markets.',
        ],
        sourceName: 'Global Business Wire',
        glossaries: {
          ru: {
            quarterly: 'квартальный',
            growth: 'рост',
            independent: 'независимый',
            recorded: 'зафиксировали',
            steady: 'стабильный',
            revenue: 'выручка / доход',
            payments: 'платежи',
            merchants: 'продавцы / торговцы',
            fees: 'комиссии',
            founders: 'основатели',
            invest: 'инвестировать',
            delivery: 'доставка',
            analysts: 'аналитики',
            demand: 'спрос',
            competition: 'конкуренция',
            markets: 'рынки',
          },
          uk: {
            quarterly: 'квартальний',
            growth: 'зростання',
            independent: 'незалежний',
            recorded: 'зафіксували',
            steady: 'стабільний',
            revenue: 'виручка / дохід',
            payments: 'платежі',
            merchants: 'продавці / підприємці',
            fees: 'комісії',
            founders: 'засновники',
            invest: 'інвестувати',
            delivery: 'доставка',
            analysts: 'аналітики',
            demand: 'попит',
            competition: 'конкуренція',
            markets: 'ринки',
          },
          en: {
            quarterly: 'occurring every three months',
            revenue: 'total income earned by a business',
            merchants: 'people or companies who sell goods',
            fees: 'charges paid for a service',
            demand: 'desire of customers to buy something',
          },
        },
      },
      {
        id: 'starter-positive-3',
        category: 'positive',
        title: 'Volunteers Transform Empty City Roofs Into Green Gardens',
        paragraphs: [
          'A local community of volunteers has planted herbs, flowers, and berry bushes across twelve apartment buildings. The green rooftop spaces help cool the city in summer and attract bees and butterflies.',
          'Neighbors now gather on weekends to water the plants and share fresh mint tea together.',
        ],
        sourceName: 'Good News Network',
        glossaries: {
          ru: {
            volunteers: 'волонтёры',
            transform: 'превращают',
            roofs: 'крыши',
            herbs: 'травы / зелень',
            bushes: 'кусты',
            rooftop: 'на крыше',
            cool: 'охлаждать',
            attract: 'привлекать',
            neighbors: 'соседи',
            gather: 'собираются',
            mint: 'мята',
          },
          uk: {
            volunteers: 'волонтери',
            transform: 'перетворюють',
            roofs: 'дахи',
            herbs: 'трави / зелень',
            bushes: 'кущі',
            rooftop: 'на даху',
            cool: 'охолоджувати',
            attract: 'приваблювати',
            neighbors: 'сусіди',
            gather: 'збираються',
            mint: 'м’ята',
          },
          en: {
            volunteers: 'people who help without being paid',
            transform: 'change completely into something better',
            herbs: 'plants used for flavor or tea',
            gather: 'come together as a group',
          },
        },
      },
    ],
  };
}

function readCachedEdition(country, todayKey) {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${CACHE_PREFIX}${country}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.date === todayKey && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
      return parsed;
    }
  } catch (_) {}
  return null;
}

function writeCachedEdition(country, edition) {
  try {
    if (typeof localStorage === 'undefined' || !edition || edition.isDemoEdition) return;
    localStorage.setItem(`${CACHE_PREFIX}${country}`, JSON.stringify(edition));
  } catch (_) {}
}

/**
 * Reports that an active PRO user in `country` uses interface language `locale` (once per day),
 * so the hourly generator fetches `country`'s regional news and builds `glossaries[locale]` at 6:00 AM.
 */
export function pingActiveNewsLocale(rawLocale, explicitCountry = null) {
  if (!isProActive()) return Promise.resolve(false);
  const locale = normalizeNewsLocale(rawLocale);
  const country = explicitCountry || detectUserNewsCountry(locale);
  const today = getLocalDateKey();
  const pingKey = `${ACTIVE_PING_PREFIX}${country}_${locale}`;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(pingKey) === today) {
      return Promise.resolve(true);
    }
  } catch (_) {}

  return reportActiveNewsLocaleFirestore(country, locale)
    .then((ok) => {
      if (ok) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(pingKey, today);
          }
        } catch (_) {}
      }
      return ok;
    })
    .catch(() => false);
}

/**
 * Loads today's Daily News edition for the user's detected COUNTRY (independent of interface language).
 * Order:
 * 1. Today's localStorage cache for `country`
 * 2. Firestore `daily_news/{COUNTRY}`
 * 3. Firestore `daily_news/US` (global English edition fallback)
 * 4. Built-in starter demo edition (if offline / unseeded)
 */
export async function fetchDailyNews(rawLocale, { forceRefresh = false, countryOverride = null } = {}) {
  const locale = normalizeNewsLocale(rawLocale);
  const country = countryOverride || detectUserNewsCountry(locale);
  const today = getLocalDateKey();

  pingActiveNewsLocale(locale, country);

  if (!forceRefresh) {
    const cached = readCachedEdition(country, today);
    if (cached) return { ...cached, locale };
  }

  // 1. Try user's detected country from Firestore (e.g., KZ, UA, RU, DE, US)
  const remote = await fetchDailyNewsFirestore(country);
  if (remote && Array.isArray(remote.articles) && remote.articles.length > 0) {
    const edition = {
      ...remote,
      country,
      locale,
      isFallbackEdition: false,
      isDemoEdition: false,
    };
    if (remote.date === today) {
      writeCachedEdition(country, edition);
    }
    return edition;
  }

  // 2. Fallback to global US edition in Firestore
  if (country !== 'US') {
    const fallbackUs = await fetchDailyNewsFirestore('US');
    if (fallbackUs && Array.isArray(fallbackUs.articles) && fallbackUs.articles.length > 0) {
      return {
        ...fallbackUs,
        country: 'US',
        locale,
        isFallbackEdition: true,
        isDemoEdition: false,
      };
    }
  }

  // 3. Offline / unseeded fallback
  return getStarterDemoEdition(locale, country);
}
