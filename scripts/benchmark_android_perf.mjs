import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { performance } from 'node:perf_hooks';

const ROOT = path.resolve(import.meta.dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const DOCS = path.join(ROOT, 'docs');
const ANDROID_FRONTEND = 'C:/projects/my-duolingo-android/frontend';
const ANDROID_AUDIO = path.join(ANDROID_FRONTEND, 'assets/audio');
const BUILD_GRADLE = path.join(ROOT, 'android/app/build.gradle');
const MAIN_ACTIVITY = path.join(ROOT, 'android/app/src/main/java/com/englishbreakfast/app/MainActivity.java');

// 1. Eager Boot JS Graph from frontend/index.html
function measureBootJsGraph() {
  const html = fs.readFileSync(path.join(FRONTEND, 'index.html'), 'utf8');
  const scriptMatches = [...html.matchAll(/<script[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const visited = new Set();
  const queue = [];

  function extractStaticImports(code) {
    const clean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const imports = [];
    const re = /^\s*(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/gm;
    let m;
    while ((m = re.exec(clean)) !== null) {
      imports.push(m[1]);
    }
    return imports;
  }

  for (const m of scriptMatches) {
    for (const spec of extractStaticImports(m[1])) {
      if (spec.startsWith('./') || spec.startsWith('../')) {
        const cleanSpec = spec.split('?')[0];
        queue.push(path.resolve(FRONTEND, cleanSpec));
      }
    }
  }

  let totalBytes = 0;
  let largest = [];
  while (queue.length > 0) {
    const filePath = queue.shift();
    if (visited.has(filePath) || !fs.existsSync(filePath)) continue;
    visited.add(filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    const size = Buffer.byteLength(code, 'utf8');
    totalBytes += size;
    largest.push({ file: path.relative(FRONTEND, filePath).replace(/\\/g, '/'), kb: +(size / 1024).toFixed(1) });

    for (const spec of extractStaticImports(code)) {
      if (spec.startsWith('./') || spec.startsWith('../')) {
        const cleanSpec = spec.split('?')[0];
        const resolved = path.resolve(path.dirname(filePath), cleanSpec);
        if (!visited.has(resolved)) queue.push(resolved);
      }
    }
  }
  largest.sort((a, b) => b.kb - a.kb);
  return {
    moduleCount: visited.size,
    totalKB: +(totalBytes / 1024).toFixed(1),
    totalMB: +(totalBytes / 1048576).toFixed(2),
    top5: largest.slice(0, 5),
  };
}

// 2. Cold-Start Dictionary JSON Parse & RAM
function benchmarkDictParse(label, loaderFn) {
  const durations = [];
  let payloadBytes = 0;
  let heapPeakDelta = 0;
  for (let i = 0; i < 10; i++) {
    if (global.gc) global.gc();
    const h0 = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    const { bytes, count } = loaderFn();
    const t1 = performance.now();
    const h1 = process.memoryUsage().heapUsed;
    payloadBytes = bytes;
    durations.push(t1 - t0);
    heapPeakDelta = Math.max(heapPeakDelta, (h1 - h0) / 1048576);
    if (i === 9) {
      return {
        label,
        wordsCount: count,
        payloadMB: +(payloadBytes / 1048576).toFixed(2),
        medianParseMs: +durations.slice().sort((a, b) => a - b)[5].toFixed(2),
        avgParseMs: +(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2),
        heapDeltaMB: +heapPeakDelta.toFixed(2),
      };
    }
  }
}

function measureDictionary() {
  const res = {};
  const monoPath = path.join(FRONTEND, 'assets/data/words.json');
  if (fs.existsSync(monoPath)) {
    const raw = fs.readFileSync(monoPath, 'utf8');
    res.monolithic = benchmarkDictParse('words.json (all 36 langs)', () => {
      const parsed = JSON.parse(raw);
      return { bytes: Buffer.byteLength(raw, 'utf8'), count: parsed.length };
    });
  }

  const basePath = path.join(FRONTEND, 'assets/data/words_base.json');
  if (fs.existsSync(basePath)) {
    const baseRaw = fs.readFileSync(basePath, 'utf8');
    for (const lang of ['ru', 'de']) {
      const langPath = path.join(FRONTEND, `assets/data/words_lang/${lang}.json`);
      if (fs.existsSync(langPath)) {
        const langRaw = fs.readFileSync(langPath, 'utf8');
        res[`sharded_${lang}`] = benchmarkDictParse(`words_base + ${lang}.json`, () => {
          const base = JSON.parse(baseRaw);
          const ov = JSON.parse(langRaw);
          const merged = base.map((b) => {
            const entry = ov[b.i];
            const trans = Array.isArray(entry) ? entry[0] : (entry || '');
            const note = Array.isArray(entry) ? entry[1] : '';
            const w = { id: b.i, word: b.w, translation: trans, transcription: b.p || '', level: b.l || '', category: b.c || '' };
            if (lang !== 'ru' && lang !== 'en') w.translations = { [lang]: trans };
            if (note) {
              w.notes = note;
              if (lang !== 'ru') w.all_notes = { [lang]: note };
            }
            return w;
          });
          return {
            bytes: Buffer.byteLength(baseRaw, 'utf8') + Buffer.byteLength(langRaw, 'utf8'),
            count: merged.length,
          };
        });
      }
    }
  }
  return res;
}

// 2b. i18n Sharding & Runtime Size Metrics
function measureI18nMetrics() {
  const i18nPath = path.join(FRONTEND, 'services/i18n.js');
  const androidI18nPath = path.join(ANDROID_FRONTEND, 'services/i18n.js');
  const i18nLangDir = path.join(FRONTEND, 'assets/data/i18n_lang');
  let shardCount = 0;
  let shardsBytes = 0;
  if (fs.existsSync(i18nLangDir)) {
    for (const e of fs.readdirSync(i18nLangDir, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.json')) {
        shardCount++;
        shardsBytes += fs.statSync(path.join(i18nLangDir, e.name)).size;
      }
    }
  }
  return {
    i18nJsKB: fs.existsSync(i18nPath) ? +(fs.statSync(i18nPath).size / 1024).toFixed(1) : null,
    androidI18nJsKB: fs.existsSync(androidI18nPath) ? +(fs.statSync(androidI18nPath).size / 1024).toFixed(1) : null,
    i18nLangShards: shardCount,
    i18nLangTotalKB: +(shardsBytes / 1024).toFixed(1),
  };
}

// 3. Android Asset Footprint
function measureAndroidAssets() {
  const gradle = fs.existsSync(BUILD_GRADLE) ? fs.readFileSync(BUILD_GRADLE, 'utf8') : '';
  const ignoresWordsJson = gradle.includes(':!words.json') || gradle.includes('!words.json');
  const hasAndroidFrontend = fs.existsSync(ANDROID_FRONTEND);

  const byExt = {};
  let rawTotal = 0;
  let zipTotal = 0;

  function addFile(fullPath, ext) {
    const buf = fs.readFileSync(fullPath);
    const raw = buf.length;
    // MP3/MP4/PNG/WebP are mostly already compressed -> stored or minimal deflate gain
    const compressed = ['.mp3', '.mp4', '.png', '.webp', '.ico'].includes(ext)
      ? raw
      : Math.min(raw, zlib.deflateRawSync(buf, { level: 6 }).length);
    byExt[ext] = byExt[ext] || { count: 0, rawBytes: 0, zipBytes: 0 };
    byExt[ext].count++;
    byExt[ext].rawBytes += raw;
    byExt[ext].zipBytes += compressed;
    rawTotal += raw;
    zipTotal += compressed;
  }

  function walkFrontend(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      const rel = path.relative(FRONTEND, f).replace(/\\/g, '/');
      if (e.isDirectory()) {
        if (rel === 'assets/audio') continue; // measured from android prepackaged audio below
        walkFrontend(f);
      } else {
        if (e.name.includes('stories')) continue; // !*stories* in aaptOptions
        if (ignoresWordsJson && e.name === 'words.json') continue;
        const ext = path.extname(e.name).toLowerCase() || '(none)';
        let targetFile = f;
        if (hasAndroidFrontend && (ext === '.js' || ext === '.css')) {
          const androidFile = path.join(ANDROID_FRONTEND, rel);
          if (fs.existsSync(androidFile)) targetFile = androidFile;
        }
        addFile(targetFile, ext);
      }
    }
  }
  walkFrontend(FRONTEND);

  if (fs.existsSync(ANDROID_AUDIO)) {
    function walkAudio(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) walkAudio(f);
        else {
          const ext = path.extname(e.name).toLowerCase() || '(none)';
          addFile(f, ext);
        }
      }
    }
    walkAudio(ANDROID_AUDIO);
  }

  const breakdown = {};
  for (const [ext, v] of Object.entries(byExt).sort((a, b) => b[1].rawBytes - a[1].rawBytes)) {
    breakdown[ext] = {
      count: v.count,
      rawMB: +(v.rawBytes / 1048576).toFixed(2),
      zipMB: +(v.zipBytes / 1048576).toFixed(2),
    };
  }
  return {
    ignoresMonolithicWordsJson: ignoresWordsJson,
    jsCssSource: hasAndroidFrontend ? 'android_minified_with_frontend_fallback' : 'frontend',
    totalRawMB: +(rawTotal / 1048576).toFixed(2),
    totalZipMB: +(zipTotal / 1048576).toFixed(2),
    breakdown,
  };
}

// 4. Production CSS Size & MainActivity sync init check
function measureCssAndNative() {
  const frontCss = path.join(FRONTEND, 'assets/css/main.css');
  const docsCss = path.join(DOCS, 'assets/css/main.css');
  const androidCss = path.join(ANDROID_FRONTEND, 'assets/css/main.css');
  const mainAct = fs.existsSync(MAIN_ACTIVITY) ? fs.readFileSync(MAIN_ACTIVITY, 'utf8') : '';
  const onCreateMatch = mainAct.match(/public void onCreate\([\s\S]*?(?=\n    @Override|\n    protected void onNewIntent)/);
  const onCreateBody = onCreateMatch ? onCreateMatch[0] : '';
  const onResumeMatch = mainAct.match(/public void onResume\([\s\S]*?(?=\n    private void injectSafeTopToWebView)/);
  const onResumeBody = onResumeMatch ? onResumeMatch[0] : '';

  return {
    frontendMainCssKB: fs.existsSync(frontCss) ? +(fs.statSync(frontCss).size / 1024).toFixed(1) : null,
    docsMainCssKB: fs.existsSync(docsCss) ? +(fs.statSync(docsCss).size / 1024).toFixed(1) : null,
    androidMainCssKB: fs.existsSync(androidCss) ? +(fs.statSync(androidCss).size / 1024).toFixed(1) : null,
    nativeMainActivity: {
      onCreateDeferredPost: onCreateBody.includes('getWindow().getDecorView().post('),
      onCreateDirectInitNativeTts: /^        initNativeTts\(\);/m.test(onCreateBody),
      onCreateDirectScheduleReminder: /^        StudyReminderManager\.scheduleReminder\(this\);/m.test(onCreateBody),
      onResumeDeferredPostDelayed: onResumeBody.includes('getWindow().getDecorView().postDelayed('),
      onResumeDirectUpdateWidgets: /^        GoldCardWidgetProvider\.updateAllWidgets\(/m.test(onResumeBody),
    },
  };
}

const report = {
  timestamp: new Date().toISOString(),
  bootJsGraph: measureBootJsGraph(),
  dictionary: measureDictionary(),
  i18nMetrics: measureI18nMetrics(),
  androidAssets: measureAndroidAssets(),
  cssAndNative: measureCssAndNative(),
};

console.log(JSON.stringify(report, null, 2));
