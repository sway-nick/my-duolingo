// Single Source of Truth for all supported languages in English Breakfast
// Exactly 34 official locales

export const SUPPORTED_LOCALES = [
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'uk', name: 'Українська', dir: 'ltr' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'pl', name: 'Polski', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'ro', name: 'Română', dir: 'ltr' },
  { code: 'bg', name: 'Български', dir: 'ltr' },
  { code: 'hu', name: 'Magyar', dir: 'ltr' },
  { code: 'el', name: 'Ελληνικά', dir: 'ltr' },
  { code: 'da', name: 'Dansk', dir: 'ltr' },
  { code: 'lv', name: 'Latviešu', dir: 'ltr' },
  { code: 'lt', name: 'Lietuvių', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'sk', name: 'Slovenčina', dir: 'ltr' },
  { code: 'sl', name: 'Slovenščina', dir: 'ltr' },
  { code: 'fi', name: 'Suomi', dir: 'ltr' },
  { code: 'hr', name: 'Hrvatski', dir: 'ltr' },
  { code: 'cs', name: 'Čeština', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', dir: 'ltr' },
  { code: 'et', name: 'Eesti', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr' },
  { code: 'th', name: 'ไทย', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
];

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map((l) => l.code);

export const RTL_LOCALES = new Set(
  SUPPORTED_LOCALES.filter((l) => l.dir === 'rtl').map((l) => l.code)
);

export const LOCALE_NAMES = Object.fromEntries(
  SUPPORTED_LOCALES.map((l) => [l.code, l.name])
);

/**
 * Returns formatted display name: "Українська (uk)" or "Русский (ru)"
 */
export function getLocaleDisplayName(code, includeCode = true) {
  const loc = SUPPORTED_LOCALES.find((l) => l.code === code);
  if (!loc) return code;
  return includeCode ? `${loc.name} (${loc.code})` : loc.name;
}

export function isRtlLocale(code) {
  return RTL_LOCALES.has(code);
}

export function isLocaleSupported(code) {
  if (!code || typeof code !== 'string') return false;
  const normalized = code.toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALE_CODES.includes(normalized);
}
