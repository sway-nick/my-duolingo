import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_SOURCE = path.resolve(__dirname, '..');
const ANDROID_PROJECT = process.env.ANDROID_PROJECT_PATH || path.resolve(ROOT_SOURCE, '../my-duolingo-android');
const userJdks = path.join(process.env.USERPROFILE || 'C:\\Users\\user', '.jdks', 'jbr-21.0.11');
const JAVA_HOME = fs.existsSync(userJdks) ? userJdks : 'C:\\Program Files\\Android\\Android Studio\\jbr';

console.log('====================================================');
console.log('🚀 STANDARDIZED GOOGLE PLAY AAB RELEASE BUILD');
console.log('====================================================');

// Step 1: Sync frontend web assets
console.log('\n[1/5] Building frontend and synchronizing assets...');
execSync('node scripts/build.cjs', { cwd: ROOT_SOURCE, stdio: 'inherit' });

// Sync changes to android project frontend
console.log('\n[2/5] Synchronizing frontend to android project...');
fs.cpSync(path.join(ROOT_SOURCE, 'frontend'), path.join(ANDROID_PROJECT, 'frontend'), { recursive: true, force: true });
execSync('node scripts/build.cjs', { cwd: ANDROID_PROJECT, stdio: 'inherit' });

// Step 2: Prepare lightweight audio assets (Elementary US only)
console.log('\n[3/5] Enforcing Section 12 audio standards (Elementary US only)...');
execSync('node scripts/prepare_android_assets.mjs', { cwd: ROOT_SOURCE, stdio: 'inherit' });

// Step 3: Capacitor sync
console.log('\n[4/5] Running Capacitor Android sync...');
execSync('cmd.exe /c "npx cap sync android"', { cwd: ANDROID_PROJECT, stdio: 'inherit' });

// Step 4: Assemble Release AAB via Gradle
console.log('\n[5/5] Building Release AAB with Gradle (bundleRelease)...');
const oldAab = path.join(ANDROID_PROJECT, 'android/app/build/outputs/bundle/release/app-release.aab');
if (fs.existsSync(oldAab)) {
  try { fs.unlinkSync(oldAab); } catch (e) {}
}
const gradleCmd = 'cmd.exe /c "set JAVA_HOME=' + JAVA_HOME + '&& gradlew.bat clean bundleRelease"';
execSync(gradleCmd, { cwd: path.join(ANDROID_PROJECT, 'android'), stdio: 'inherit' });

// Step 5: Copy and verify AAB size
const aabSource = path.join(ANDROID_PROJECT, 'android/app/build/outputs/bundle/release/app-release.aab');
const aabDestRoot = path.join(ROOT_SOURCE, 'EnglishBreakfast.aab');
const aabDestGooglePlay = path.join(ROOT_SOURCE, 'google_play_assets/EnglishBreakfast.aab');

if (fs.existsSync(aabSource)) {
  fs.copyFileSync(aabSource, aabDestRoot);
  fs.copyFileSync(aabSource, aabDestGooglePlay);

  const sizeMb = (fs.statSync(aabSource).size / (1024 * 1024)).toFixed(2);
  console.log('\n====================================================');
  console.log('✅ SIGNED RELEASE AAB GENERATED SUCCESSFULLY!');
  console.log('📦 File: EnglishBreakfast.aab (' + sizeMb + ' MB)');
  console.log('📍 Locations:');
  console.log('   - ' + aabDestRoot);
  console.log('   - ' + aabDestGooglePlay);
  console.log('🎯 Ready for upload to Google Play Console!');
  console.log('====================================================');
} else {
  throw new Error('❌ AAB build failed: Output file app-release.aab not found!');
}
