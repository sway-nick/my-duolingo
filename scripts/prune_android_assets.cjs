const fs = require('fs');
const path = require('path');

function prune() {
  const androidAudioDir = path.join(__dirname, '../android/app/src/main/assets/public/assets/audio');
  if (!fs.existsSync(androidAudioDir)) {
    console.log('Android audio dir not found, skipping prune.');
    return;
  }

  // 1. Remove UK audio folder completely from Android packaged assets (on-demand download)
  const ukDir = path.join(androidAudioDir, 'uk');
  if (fs.existsSync(ukDir)) {
    fs.rmSync(ukDir, { recursive: true, force: true });
    console.log('⚡ Pruned assets/audio/uk/ completely (saved ~56 MB, on-demand UK voice)');
  }

  // 2. In US audio folder, keep ONLY Elementary (Базовая лексика) and Irregular Verbs (Неправильные глаголы)
  const usDir = path.join(androidAudioDir, 'us');
  if (fs.existsSync(usDir)) {
    const wordsJsonPath = path.join(__dirname, '../frontend/assets/data/words.json');
    if (fs.existsSync(wordsJsonPath)) {
      const words = JSON.parse(fs.readFileSync(wordsJsonPath, 'utf8'));
      const coreWords = words.filter(
        (w) => w.category === 'Elementary' || w.category === 'Irregular verbs'
      );

      const filesToKeep = new Set();
      coreWords.forEach((w) => {
        const cleanFilename = (w.word || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s'-]/g, '')
          .replace(/\s+/g, '_') + '.mp3';
        filesToKeep.add(cleanFilename);
      });

      const allUsFiles = fs.readdirSync(usDir).filter((f) => f.endsWith('.mp3'));
      let deletedCount = 0;
      let keptCount = 0;

      allUsFiles.forEach((file) => {
        if (filesToKeep.has(file)) {
          keptCount++;
        } else {
          try {
            fs.unlinkSync(path.join(usDir, file));
            deletedCount++;
          } catch (e) {}
        }
      });

      console.log(
        `⚡ Kept ${keptCount} US audio files (Elementary & Irregular Verbs), pruned ${deletedCount} non-core files (saved ~33 MB)`
      );
    }
  }

  console.log('✅ Android asset pruning complete. Pre-packaged US core vocabulary ready (~20 MB)!');
}

prune();
