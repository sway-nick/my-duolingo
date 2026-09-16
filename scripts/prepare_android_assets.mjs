import fs from 'fs';
import path from 'path';

const ROOT_SOURCE = 'c:/projects/my-duolingo';
const ANDROID_PROJECT = 'C:/projects/my-duolingo-android';

export function prepareAndroidAssets() {
  console.log('--- 1. Loading words.json & filtering strictly Elementary (US only, Section 12) ---');
  const wordsPath = path.join(ROOT_SOURCE, 'frontend/assets/data/words.json');
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

  function getAudioFileName(text) {
    return text.toLowerCase().trim()
      .replace(/[^a-z0-9\s'-]/g, '')
      .replace(/\s+/g, '_') + '.mp3';
  }

  // Section 12: In APK, strictly 'elementary' category words are prepackaged
  const targetWords = words.filter(w => {
    const cat = String(w.category || '').toLowerCase();
    return cat.includes('elementary');
  });

  const targetFileNames = new Set();
  targetWords.forEach(w => {
    if (w.word) {
      targetFileNames.add(getAudioFileName(w.word));
    }
  });

  console.log('Found ' + targetWords.length + ' Elementary words (' + targetFileNames.size + ' unique audio files for US).');

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

  // Clean Android public assets/audio so stale files are not retained
  console.log('--- 2. Cleaning android public assets/audio before cap sync ---');
  const publicAudioDir = path.join(ANDROID_PROJECT, 'android/app/src/main/assets/public/assets/audio');
  if (fs.existsSync(publicAudioDir)) {
    fs.rmSync(publicAudioDir, { recursive: true, force: true });
    console.log('Public audio directory cleaned.');
  }

  console.log('✅ Android asset preparation complete: Ready for lightweight ~35MB APK build.');
}

prepareAndroidAssets();
