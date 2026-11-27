import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as esbuild from 'esbuild';
import { BUILTIN_COLLECTIONS_DEF, DOWNLOADABLE_PACK_COLLECTIONS } from '../frontend/services/collectionsService.js';

const require = createRequire(import.meta.url);
const { minifyCssContent, cleanStaleAssetsInRoot } = require('./build.cjs');

const ROOT_SOURCE = 'c:/projects/my-duolingo';
const ANDROID_PROJECT = 'C:/projects/my-duolingo-android';

export function prepareAndroidAssets() {
  console.log('--- 1. Loading words.json & filtering Elementary + core Built-in Collections (excluding downloadable packs) ---');
  const wordsPath = path.join(ROOT_SOURCE, 'frontend/assets/data/words.json');
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  function getAudioFileName(text) {
    return String(text || '').toLowerCase().trim()
      .replace(/[^a-z0-9\s'-]/g, '')
      .replace(/\s+/g, '_') + '.mp3';
  }

  // Collect all word keys from core built-in collections (excluding on-demand downloadable packs: it_terms, idioms)
  const collectionWordsSet = new Set();
  BUILTIN_COLLECTIONS_DEF.forEach(col => {
    if (col.wordKeys && !DOWNLOADABLE_PACK_COLLECTIONS.has(col.id)) {
      col.wordKeys.forEach(k => collectionWordsSet.add(k.toLowerCase().trim()));
    }
  });

  // Include strictly Elementary words PLUS all words from standard collections regardless of difficulty level
  const targetWords = words.filter(w => {
    const wordKey = String(w.word || '').toLowerCase().trim();
    const cat = String(w.category || '').toLowerCase();
    return cat.includes('elementary') || collectionWordsSet.has(wordKey);
  });

  const targetFileNames = new Set();
  targetWords.forEach(w => {
    if (w.word) {
      targetFileNames.add(getAudioFileName(w.word));
    }
  });

  console.log('Found ' + targetWords.length + ' words (Elementary + ' + collectionWordsSet.size + ' standard collection words) -> ' + targetFileNames.size + ' unique audio files for US.');

  const androidAudioDir = path.join(ANDROID_PROJECT, 'frontend/assets/audio');
  const sourceAudioDir = path.join(ROOT_SOURCE, 'frontend/assets/audio');

  // Ensure UK audio folder is completely removed from APK prepackaging (UK is on-demand per Section 12)
  const destUkDir = path.join(androidAudioDir, 'uk');
  if (fs.existsSync(destUkDir)) {
    fs.rmSync(destUkDir, { recursive: true, force: true });
    console.log('✅ Removed UK audio folder from Android package (UK is downloaded on-demand in-app).');
  }

  // Prepare US audio folder (strictly Elementary words)
  const srcUsDir = path.join(sourceAudioDir, 'us');
  const destUsDir = path.join(androidAudioDir, 'us');

  if (!fs.existsSync(destUsDir)) {
    fs.mkdirSync(destUsDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(destUsDir);
  let removed = 0;
  for (const file of existingFiles) {
    if (!targetFileNames.has(file)) {
      fs.unlinkSync(path.join(destUsDir, file));
      removed++;
    }
  }

  let copied = 0;
  for (const filename of targetFileNames) {
    const srcFile = path.join(srcUsDir, filename);
    const destFile = path.join(destUsDir, filename);
    if (fs.existsSync(srcFile)) {
      if (!fs.existsSync(destFile) || fs.statSync(srcFile).size !== fs.statSync(destFile).size) {
        fs.copyFileSync(srcFile, destFile);
        copied++;
      }
    }
  }

  const finalUsCount = fs.readdirSync(destUsDir).length;
  console.log('✅ US Elementary audio: removed ' + removed + ' non-elementary files, verified ' + copied + ', total in folder: ' + finalUsCount);

  // Ensure sound effects are copied
  const sfxFiles = ['coin.mp3'];
  sfxFiles.forEach(sfx => {
    const srcSfx = path.join(sourceAudioDir, sfx);
    if (fs.existsSync(srcSfx)) {
      fs.copyFileSync(srcSfx, path.join(androidAudioDir, sfx));
    }
  });

  // Ensure story narration audio is NOT prepackaged into APK/AAB (downloaded on-demand & cached for PRO)
  const destStoriesDir = path.join(androidAudioDir, 'stories');
  if (fs.existsSync(destStoriesDir)) {
    fs.rmSync(destStoriesDir, { recursive: true, force: true });
    console.log('✅ Removed stories audio folder from Android package (stories audio is downloaded on-demand & cached).');
  }

  // Clean Android public assets/audio so stale files are not retained
  console.log('--- 2. Cleaning android public assets/audio before cap sync ---');
  const publicAudioDir = path.join(ANDROID_PROJECT, 'android/app/src/main/assets/public/assets/audio');
  if (fs.existsSync(publicAudioDir)) {
    fs.rmSync(publicAudioDir, { recursive: true, force: true });
    console.log('Public audio directory cleaned.');
  }

  // Also filter local android/app/src/main/assets/public/assets/audio in ROOT_SOURCE
  const localAndroidAudioDir = path.join(ROOT_SOURCE, 'android/app/src/main/assets/public/assets/audio');
  if (fs.existsSync(localAndroidAudioDir)) {
    const localUkDir = path.join(localAndroidAudioDir, 'uk');
    if (fs.existsSync(localUkDir)) {
      fs.rmSync(localUkDir, { recursive: true, force: true });
    }
    const localUsDir = path.join(localAndroidAudioDir, 'us');
    if (fs.existsSync(localUsDir)) {
      for (const file of fs.readdirSync(localUsDir)) {
        if (!targetFileNames.has(file)) {
          fs.unlinkSync(path.join(localUsDir, file));
        }
      }
    }
  }

  // 3. Optimize Android frontend assets: split words data, remove stale PNG avatars/dead assets, minify main.css
  console.log('--- 3. Optimizing Android frontend data, avatars & CSS ---');
  const srcDataDir = path.join(ROOT_SOURCE, 'frontend/assets/data');
  const androidDataDir = path.join(ANDROID_PROJECT, 'frontend/assets/data');
  if (!fs.existsSync(androidDataDir)) {
    fs.mkdirSync(androidDataDir, { recursive: true });
  }

  function syncJsonShardDir(srcDir, destDir, label) {
    if (!fs.existsSync(srcDir)) return;
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const srcShards = new Set();
    let copiedShards = 0;
    for (const file of fs.readdirSync(srcDir)) {
      if (file.endsWith('.json')) {
        srcShards.add(file);
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        copiedShards++;
      }
    }
    let prunedShards = 0;
    for (const file of fs.readdirSync(destDir)) {
      if (file.endsWith('.json') && !srcShards.has(file)) {
        fs.unlinkSync(path.join(destDir, file));
        prunedShards++;
      }
    }
    console.log(`✅ Synced ${label}: ${copiedShards} shards copied, ${prunedShards} stale pruned.`);
  }

  const srcWordsBase = path.join(srcDataDir, 'words_base.json');
  if (fs.existsSync(srcWordsBase)) {
    fs.copyFileSync(srcWordsBase, path.join(androidDataDir, 'words_base.json'));
  }
  syncJsonShardDir(path.join(srcDataDir, 'words_lang'), path.join(androidDataDir, 'words_lang'), 'words_lang');
  syncJsonShardDir(path.join(srcDataDir, 'i18n_lang'), path.join(androidDataDir, 'i18n_lang'), 'i18n_lang');

  const staleAndroidWordsJson = path.join(androidDataDir, 'words.json');
  if (fs.existsSync(staleAndroidWordsJson)) {
    fs.unlinkSync(staleAndroidWordsJson);
    console.log('✅ Removed stale Android words.json (replaced by words_base.json + words_lang/).');
  }
  const stalePublicWordsJson = path.join(ANDROID_PROJECT, 'android/app/src/main/assets/public/assets/data/words.json');
  if (fs.existsSync(stalePublicWordsJson)) {
    fs.unlinkSync(stalePublicWordsJson);
  }

  // Sync WebP avatars and remove any stale .png avatars / dead assets
  const srcAvatarsDir = path.join(ROOT_SOURCE, 'frontend/assets/avatars');
  const androidAvatarsDir = path.join(ANDROID_PROJECT, 'frontend/assets/avatars');
  if (fs.existsSync(srcAvatarsDir)) {
    if (!fs.existsSync(androidAvatarsDir)) {
      fs.mkdirSync(androidAvatarsDir, { recursive: true });
    }
    for (const file of fs.readdirSync(srcAvatarsDir)) {
      if (file.endsWith('.webp')) {
        fs.copyFileSync(path.join(srcAvatarsDir, file), path.join(androidAvatarsDir, file));
      }
    }
  }
  for (const avatarDir of [
    androidAvatarsDir,
    path.join(ANDROID_PROJECT, 'android/app/src/main/assets/public/assets/avatars'),
  ]) {
    if (fs.existsSync(avatarDir)) {
      for (const file of fs.readdirSync(avatarDir)) {
        if (/^avatar_\d+\.png$/i.test(file)) {
          fs.unlinkSync(path.join(avatarDir, file));
        }
      }
    }
  }
  cleanStaleAssetsInRoot(path.join(ANDROID_PROJECT, 'frontend/assets'));

  // Minify Android main.css from single source of truth
  const srcMainCss = path.join(ROOT_SOURCE, 'frontend/assets/css/main.css');
  const androidMainCss = path.join(ANDROID_PROJECT, 'frontend/assets/css/main.css');
  const cssSourcePath = fs.existsSync(srcMainCss) ? srcMainCss : androidMainCss;
  if (fs.existsSync(cssSourcePath)) {
    const rawCss = fs.readFileSync(cssSourcePath, 'utf8');
    const minCss = minifyCssContent(rawCss);
    fs.mkdirSync(path.dirname(androidMainCss), { recursive: true });
    fs.writeFileSync(androidMainCss, minCss, 'utf8');
    console.log(`🎨 Minified Android main.css: ${(Buffer.byteLength(rawCss) / 1024).toFixed(1)} KB -> ${(Buffer.byteLength(minCss) / 1024).toFixed(1)} KB`);
  }

  // 4. Minify all Android JS files via esbuild (reading clean unminified sources from ROOT_SOURCE/frontend)
  console.log('--- 4. Minifying Android JS files via esbuild ---');
  const srcFrontendDir = path.join(ROOT_SOURCE, 'frontend');
  const androidFrontendDir = path.join(ANDROID_PROJECT, 'frontend');
  let jsFileCount = 0;
  let jsRawBytes = 0;
  let jsMinBytes = 0;
  const expectedJsRels = new Set();

  function walkAndMinifyJs(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const rel = path.relative(srcFrontendDir, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || rel === 'assets/audio') {
          continue;
        }
        walkAndMinifyJs(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        expectedJsRels.add(rel);
        const rawCode = fs.readFileSync(fullPath, 'utf8');
        const result = esbuild.transformSync(rawCode, {
          loader: 'js',
          format: 'esm',
          target: ['chrome100', 'es2022'],
          charset: 'utf8',
          minifyWhitespace: true,
          minifySyntax: true,
          minifyIdentifiers: true,
          legalComments: 'none',
        });
        const destPath = path.join(androidFrontendDir, rel);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, result.code, 'utf8');
        jsFileCount++;
        jsRawBytes += Buffer.byteLength(rawCode, 'utf8');
        jsMinBytes += Buffer.byteLength(result.code, 'utf8');
      }
    }
  }

  let prunedJs = 0;
  function pruneStaleAndroidJs(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const rel = path.relative(androidFrontendDir, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || rel === 'assets/audio') {
          continue;
        }
        pruneStaleAndroidJs(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js') && !expectedJsRels.has(rel)) {
        fs.unlinkSync(fullPath);
        prunedJs++;
      }
    }
  }

  if (fs.existsSync(srcFrontendDir)) {
    const srcIndexHtml = path.join(srcFrontendDir, 'index.html');
    const destIndexHtml = path.join(androidFrontendDir, 'index.html');
    if (fs.existsSync(srcIndexHtml)) {
      fs.copyFileSync(srcIndexHtml, destIndexHtml);
    }
    walkAndMinifyJs(srcFrontendDir);
    pruneStaleAndroidJs(androidFrontendDir);
    const savedBytes = jsRawBytes - jsMinBytes;
    const rawMB = (jsRawBytes / 1048576).toFixed(2);
    const minMB = (jsMinBytes / 1048576).toFixed(2);
    const savedKB = (savedBytes / 1024).toFixed(1);
    const savedMB = (savedBytes / 1048576).toFixed(2);
    console.log(`⚡ Minified ${jsFileCount} Android JS files (pruned ${prunedJs} stale): ${rawMB} MB -> ${minMB} MB (saved ${savedKB} KB / ${savedMB} MB)`);
  }

  console.log('✅ Android asset preparation complete: Ready for lightweight APK/AAB build.');
}

prepareAndroidAssets();
