import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const LOCAL_WORDS_PATH = path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json');
const US_AUDIO_DIR = path.join(ROOT_DIR, 'frontend', 'assets', 'audio', 'us');
const UK_AUDIO_DIR = path.join(ROOT_DIR, 'frontend', 'assets', 'audio', 'uk');

function cleanFilename(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s'-]/g, '')
    .replace(/\s+/g, '_');
}

console.log('====================================================');
console.log('🔄 DICTIONARY & AUDIO SYNCHRONIZATION TOOL');
console.log('====================================================');

async function syncDictionaryAndAudio() {
  console.log('\n[1/4] Synchronizing vocabulary directly from Google Sheets (all 32 languages)...');
  try {
    execSync('node scripts/sync_translations_from_sheet.mjs', { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (err) {
    console.error(`❌ Failed to sync from Google Sheets: ${err.message}`);
    process.exit(1);
  }

  console.log('\n[2/4] Verifying local words.json database...');
  let localWords = [];
  if (fs.existsSync(LOCAL_WORDS_PATH)) {
    try {
      localWords = JSON.parse(fs.readFileSync(LOCAL_WORDS_PATH, 'utf8'));
    } catch (e) {
      localWords = [];
    }
  }

  console.log(`📊 Total words in dictionary: ${localWords.length}`);

  console.log('\n[3/4] Verifying audio coverage in assets/audio/us and assets/audio/uk...');
  const missingUs = [];
  const missingUk = [];

  localWords.forEach((w) => {
    const wordText = String(w.word || '').trim();
    if (!wordText) return;
    const cleanName = cleanFilename(wordText);
    const usFile = path.join(US_AUDIO_DIR, `${cleanName}.mp3`);
    const ukFile = path.join(UK_AUDIO_DIR, `${cleanName}.mp3`);

    if (!fs.existsSync(usFile) || fs.statSync(usFile).size < 400) {
      missingUs.push(w);
    }
    if (!fs.existsSync(ukFile) || fs.statSync(ukFile).size < 400) {
      missingUk.push(w);
    }
  });

  console.log(`🔊 Audio status:`);
  console.log(`   - Missing US audio: ${missingUs.length} files`);
  console.log(`   - Missing UK audio: ${missingUk.length} files`);

  if (missingUs.length > 0 || missingUk.length > 0) {
    console.log('\n[4/4] Launching Python TTS generation for missing audio...');
    try {
      execSync('python scripts/download_audio.py', { stdio: 'inherit', cwd: ROOT_DIR });
    } catch (e) {
      console.warn('⚠️ TTS download encountered issues or python/edge-tts not present:', e.message);
    }
  } else {
    console.log('\n[4/4] All audio files are present and complete! Skipping TTS generation.');
  }

  console.log('\n====================================================');
  console.log('🎉 SYNC COMPLETE!');
  console.log('====================================================');
}

syncDictionaryAndAudio().catch(console.error);
