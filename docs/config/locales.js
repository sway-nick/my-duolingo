// Single Source of Truth for all supported languages in English Breakfast
// Exactly 36 official locales

export const SUPPORTED_LOCALES = [
  { code: 'ar', name: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', dir: 'ltr' },
  { code: 'bg', name: 'Български', englishName: 'Bulgarian', dir: 'ltr' },
  { code: 'zh', name: '中文', englishName: 'Chinese (Simplified)', dir: 'ltr' },
  { code: 'hr', name: 'Hrvatski', englishName: 'Croatian', dir: 'ltr' },
  { code: 'cs', name: 'Čeština', englishName: 'Czech', dir: 'ltr' },
  { code: 'da', name: 'Dansk', englishName: 'Danish', dir: 'ltr' },
  { code: 'en', name: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'et', name: 'Eesti', englishName: 'Estonian', dir: 'ltr' },
  { code: 'fi', name: 'Suomi', englishName: 'Finnish', dir: 'ltr' },
  { code: 'fr', name: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'el', name: 'Ελληνικά', englishName: 'Greek', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'hu', name: 'Magyar', englishName: 'Hungarian', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr' },
  { code: 'it', name: 'Italiano', englishName: 'Italian', dir: 'ltr' },
  { code: 'ja', name: '日本語', englishName: 'Japanese', dir: 'ltr' },
  { code: 'kk', name: 'Қазақша', englishName: 'Kazakh', dir: 'ltr' },
  { code: 'ko', name: '한국어', englishName: 'Korean', dir: 'ltr' },
  { code: 'lv', name: 'Latviešu', englishName: 'Latvian', dir: 'ltr' },
  { code: 'lt', name: 'Lietuvių', englishName: 'Lithuanian', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', englishName: 'Persian', dir: 'rtl' },
  { code: 'pl', name: 'Polski', englishName: 'Polish', dir: 'ltr' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', dir: 'ltr' },
  { code: 'ro', name: 'Română', englishName: 'Romanian', dir: 'ltr' },
  { code: 'ru', name: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'sk', name: 'Slovenčina', englishName: 'Slovak', dir: 'ltr' },
  { code: 'sl', name: 'Slovenščina', englishName: 'Slovenian', dir: 'ltr' },
  { code: 'es', name: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', englishName: 'Swedish', dir: 'ltr' },
  { code: 'th', name: 'ไทย', englishName: 'Thai', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish', dir: 'ltr' },
  { code: 'uk', name: 'Українська', englishName: 'Ukrainian', dir: 'ltr' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', dir: 'rtl' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', dir: 'ltr' },
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
