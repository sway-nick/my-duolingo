import fs from 'fs';
import path from 'path';

const ROOT_SOURCE = 'c:/projects/my-duolingo';
const ANDROID_PROJECT = 'C:/projects/my-duolingo-android';

console.log('--- 1. Loading words.json and filtering Elementary & Irregular verbs ---');
const wordsPath = path.join(ROOT_SOURCE, 'frontend/assets/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

function getAudioFileName(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s'-]/g, '')
    .replace(/\s+/g, '_') + '.mp3';
}

const targetCategories = ['elementary', 'irregular'];
const targetWords = words.filter(w => {
  const cat = String(w.category || '').toLowerCase();
  return targetCategories.some(tc => cat.includes(tc));
});

const targetFileNames = new Set();
targetWords.forEach(w => {
  if (w.word) {
    targetFileNames.add(getAudioFileName(w.word));
  }
});

console.log(`Found ${targetWords.length} target words (${targetFileNames.size} unique audio files per accent).`);

const androidAudioDir = path.join(ANDROID_PROJECT, 'frontend/assets/audio');
const sourceAudioDir = path.join(ROOT_SOURCE, 'frontend/assets/audio');

// 2. Prepare Android frontend/assets/audio
console.log('--- 2. Preparing Android frontend/assets/audio (Elementary + Irregular verbs only) ---');

// Package US audio for Elementary & Irregular verbs (19.9 MB), keep UK empty for on-demand download to maintain ~37 MB APK size
['us'].forEach(accent => {
  const srcAccentDir = path.join(sourceAudioDir, accent);
  const destAccentDir = path.join(androidAudioDir, accent);

  if (!fs.existsSync(destAccentDir)) {
    fs.mkdirSync(destAccentDir, { recursive: true });
  }

  // Remove existing files in dest that are not in target
  const existingFiles = fs.readdirSync(destAccentDir);
  let removed = 0;
  for (const file of existingFiles) {
    if (!targetFileNames.has(file)) {
      fs.unlinkSync(path.join(destAccentDir, file));
      removed++;
    }
  }

  // Copy target files from source if missing or different size
  let copied = 0;
  for (const filename of targetFileNames) {
    const srcFile = path.join(srcAccentDir, filename);
    const destFile = path.join(destAccentDir, filename);
    if (fs.existsSync(srcFile)) {
      if (!fs.existsSync(destFile) || fs.statSync(srcFile).size !== fs.statSync(destFile).size) {
        fs.copyFileSync(srcFile, destFile);
        copied++;
      }
    } else {
      console.warn(`Warning: source audio missing for [${accent}]: ${filename}`);
    }
  }

  const finalCount = fs.readdirSync(destAccentDir).length;
  console.log(`Accent [${accent}]: removed ${removed} non-target files, copied/verified ${copied}, total in folder: ${finalCount}`);
});

// Clear UK audio folder in Android frontend
const ukDestDir = path.join(androidAudioDir, 'uk');
if (fs.existsSync(ukDestDir)) {
  const ukFiles = fs.readdirSync(ukDestDir);
  for (const f of ukFiles) {
    fs.unlinkSync(path.join(ukDestDir, f));
  }
  console.log(`Cleaned UK audio folder in Android frontend (${ukFiles.length} files removed).`);
}

// Ensure coin.mp3 is in android audio
if (fs.existsSync(path.join(sourceAudioDir, 'coin.mp3'))) {
  fs.copyFileSync(path.join(sourceAudioDir, 'coin.mp3'), path.join(androidAudioDir, 'coin.mp3'));
}

// 3. Clean android public assets/audio so Capacitor copy does not leave stale files
console.log('--- 3. Cleaning android public assets/audio before cap sync ---');
const publicAudioDir = path.join(ANDROID_PROJECT, 'android/app/src/main/assets/public/assets/audio');
if (fs.existsSync(publicAudioDir)) {
  fs.rmSync(publicAudioDir, { recursive: true, force: true });
  console.log('Public audio directory cleaned.');
}

console.log('Asset preparation complete.');
