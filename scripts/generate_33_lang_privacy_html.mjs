import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const LANG_NAMES = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  pl: 'Polski',
  it: 'Italiano',
  tr: 'Türkçe',
  pt: 'Português',
  ro: 'Română',
  bg: 'Български',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  el: 'Ελληνικά',
  sl: 'Slovenščina',
  et: 'Eesti',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  da: 'Dansk',
  fi: 'Suomi',
  sv: 'Svenska',
  hr: 'Hrvatski',
  ga: 'Gaeilge',
  mt: 'Malti',
  ja: '日本語',
  hi: 'हिन्दी',
  ar: 'العربية',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  ko: '한국어'
};

async function run() {
  const { PRIVACY_POLICY_DATA } = await import('../frontend/components/modals/privacyTranslations.js');

  const serializedData = JSON.stringify(PRIVACY_POLICY_DATA);
  const serializedLangs = JSON.stringify(LANG_NAMES);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - English Breakfast</title>
  <link rel="icon" type="image/png" href="./favicon-96x96.png" sizes="96x96">
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #ff6a00;
      --border-color: #334155;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg-color: #f8fafc;
        --card-bg: #ffffff;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --border-color: #e2e8f0;
      }
    }
    body {
      margin: 0;
      padding: 24px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-color);
      color: var(--text-main);
      line-height: 1.6;
    }
    .container {
      max-width: 780px;
      margin: 0 auto;
      background: var(--card-bg);
      padding: 32px 24px;
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand h1 {
      margin: 0;
      font-size: 24px;
      color: var(--accent);
    }
    .lang-picker-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .lang-select {
      background: var(--bg-color);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
    }
    h2 {
      font-size: 20px;
      margin-top: 20px;
      margin-bottom: 8px;
      color: var(--text-main);
    }
    h3 {
      font-size: 16px;
      margin-top: 22px;
      margin-bottom: 8px;
      color: var(--text-main);
    }
    p, li {
      font-size: 15px;
      color: var(--text-muted);
    }
    ul {
      padding-left: 20px;
      margin-top: 6px;
      margin-bottom: 16px;
    }
    li {
      margin-bottom: 6px;
    }
    .updated-date {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .back-link {
      display: inline-block;
      margin-top: 28px;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }
    .back-link:hover {
      text-decoration: underline;
    }
    [dir="rtl"] {
      text-align: right;
    }
    [dir="rtl"] ul {
      padding-right: 20px;
      padding-left: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <h1>🍳 English Breakfast</h1>
      </div>
      <div class="lang-picker-box">
        <label for="lang-select" style="font-size: 13px; color: var(--text-muted); font-weight: 600;">🌐 Language:</label>
        <select id="lang-select" class="lang-select" onchange="changeLang(this.value)"></select>
      </div>
    </div>

    <div id="policy-content"></div>

    <a href="./index.html" class="back-link" id="back-to-app-link">← Return to App</a>
  </div>

  <script>
    const PRIVACY_DATA = ${serializedData};
    const LANG_NAMES = ${serializedLangs};

    function initLangSelect() {
      const select = document.getElementById('lang-select');
      select.innerHTML = '';
      for (const [code, name] of Object.entries(LANG_NAMES)) {
        if (PRIVACY_DATA[code]) {
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = name;
          select.appendChild(opt);
        }
      }

      // Auto-detect browser/stored language
      const savedLang = (localStorage.getItem('myduo_interface_lang') || navigator.language || 'en').slice(0, 2).toLowerCase();
      const initialLang = PRIVACY_DATA[savedLang] ? savedLang : 'en';
      select.value = initialLang;
      renderPolicy(initialLang);
    }

    function renderPolicy(langCode) {
      const policy = PRIVACY_DATA[langCode] || PRIVACY_DATA.en;
      const content = document.getElementById('policy-content');
      const isRtl = langCode === 'ar';
      content.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

      let html = '<h2>' + (policy.modalTitle || 'Privacy Policy') + '</h2>';
      if (policy.updated) {
        html += '<div class="updated-date"><strong>' + policy.updated + '</strong></div>';
      }
      if (policy.intro) {
        html += '<p>' + policy.intro + '</p>';
      }

      if (Array.isArray(policy.sections)) {
        policy.sections.forEach(sec => {
          if (sec.title) {
            html += '<h3>' + sec.title + '</h3>';
          }
          if (sec.intro) {
            html += '<p>' + sec.intro + '</p>';
          }
          if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
            html += '<ul>';
            sec.bullets.forEach(b => {
              html += '<li><strong>' + b.bold + '</strong> ' + b.text + '</li>';
            });
            html += '</ul>';
          }
          if (sec.contactEmail) {
            html += '<p><strong>Email:</strong> <a href=\"mailto:' + sec.contactEmail + '\" style=\"color: var(--accent); font-weight: 600;\">' + sec.contactEmail + '</a></p>';
          }
        });
      }

      content.innerHTML = html;

      // Update back button
      const backLink = document.getElementById('back-to-app-link');
      if (backLink) {
        backLink.textContent = policy.backBtn ? ('← ' + policy.backBtn) : '← Return to App';
      }
      document.documentElement.lang = langCode;
    }

    function changeLang(langCode) {
      try { localStorage.setItem('myduo_interface_lang', langCode); } catch (e) {}
      renderPolicy(langCode);
    }

    window.addEventListener('DOMContentLoaded', initLangSelect);

    window.handleAndroidBackButton = function() {
      window.location.href = './index.html';
      return true;
    };
  </script>
</body>
</html>
`;

  const targetFiles = [
    path.join(ROOT, 'privacy.html'),
    path.join(ROOT, 'frontend/privacy.html'),
    path.join(ROOT, 'docs/privacy.html'),
  ];

  for (const f of targetFiles) {
    fs.writeFileSync(f, html, 'utf8');
    console.log(`✅ ${f}: updated with dynamic 33-language support!`);
  }
}

run().catch(console.error);
