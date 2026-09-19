import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const API_URL = 'https://script.google.com/macros/s/AKfycbwnXMvc0F37phkEvq7fEXcqLoFCVrAUYrC88d09pjDjer039oDmsciF-u18mZbuhngjxQ/exec?route=words';
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
  console.log('\n[1/4] Fetching latest vocabulary from Google Sheets API...');
  let remoteWords = [];
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(json.error || 'Invalid API response format');
    }
    remoteWords = json.data;
    console.log(`✅ Successfully fetched ${remoteWords.length} words from Google Sheets.`);
  } catch (err) {
    console.error(`❌ Failed to fetch from Google Sheets API: ${err.message}`);
    process.exit(1);
  }

  console.log('\n[2/4] Comparing with local words.json database...');
  let localWords = [];
  if (fs.existsSync(LOCAL_WORDS_PATH)) {
    try {
      localWords = JSON.parse(fs.readFileSync(LOCAL_WORDS_PATH, 'utf8'));
    } catch (e) {
      localWords = [];
    }
  }

  const localMap = new Map(localWords.map((w) => [String(w.id || w.word), w]));
  let newWordsCount = 0;
  let updatedWordsCount = 0;

  remoteWords.forEach((rw) => {
    const key = String(rw.id || rw.word);
    const existing = localMap.get(key);
    if (!existing) {
      newWordsCount++;
    } else {
      if (existing.translation !== rw.translation || existing.transcription !== rw.transcription) {
        updatedWordsCount++;
      }
    }
  });

  console.log(`📊 Diff summary:`);
  console.log(`   - Total Remote Words: ${remoteWords.length}`);
  console.log(`   - Local Words:        ${localWords.length}`);
  console.log(`   - New Words:          ${newWordsCount}`);
  console.log(`   - Modified Words:     ${updatedWordsCount}`);

  // Update local words.json
  fs.writeFileSync(LOCAL_WORDS_PATH, JSON.stringify(remoteWords, null, 2), 'utf8');
  console.log(`💾 Updated: ${LOCAL_WORDS_PATH}`);

  console.log('\n[3/4] Verifying audio coverage in assets/audio/us and assets/audio/uk...');
  const missingUs = [];
  const missingUk = [];

  remoteWords.forEach((w) => {
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
      execSync('python scripts/download_audio.py', { cwd: ROOT_DIR, stdio: 'inherit' });
    } catch (e) {
      console.warn('⚠️ TTS download encountered issues or python/edge-tts not present:', e.message);
    }
  } else {
    console.log('\n[4/4] ✅ All dictionary words already have full US and UK audio coverage!');
  }

  console.log('\n====================================================');
  console.log('🎉 SYNC COMPLETE!');
  console.log('====================================================\n');
}

syncDictionaryAndAudio();
