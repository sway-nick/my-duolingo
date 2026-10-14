import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { prepareAndroidAssets } from './prepare_android_assets.mjs';

const ROOT_SOURCE = 'c:/projects/my-duolingo';
const ANDROID_PROJECT = 'C:/projects/my-duolingo-android';
const userJdks = path.join(process.env.USERPROFILE || 'C:\\Users\\user', '.jdks', 'jbr-21.0.11');
const JAVA_HOME = fs.existsSync(userJdks) ? userJdks : 'C:\\Program Files\\Android\\Android Studio\\jbr';

console.log('====================================================');
console.log('🚀 BUILDING SIGNED PRODUCTION ANDROID APP BUNDLE (.AAB)');
console.log('====================================================');

// Step 1: Sync frontend web assets
console.log('\n[1/5] Building frontend and synchronizing assets...');
execSync('node scripts/build.cjs', { cwd: ROOT_SOURCE, stdio: 'inherit' });

console.log('\n[2/5] Synchronizing frontend to android project...');
fs.cpSync(path.join(ROOT_SOURCE, 'frontend'), path.join(ANDROID_PROJECT, 'frontend'), { recursive: true, force: true });
execSync('node scripts/build.cjs', { cwd: ANDROID_PROJECT, stdio: 'inherit' });

// Step 2: Prepare lightweight audio assets (Elementary US only per Section 12)
console.log('\n[3/5] Enforcing Section 12 audio standards...');
prepareAndroidAssets();

// Step 3: Capacitor sync
console.log('\n[4/5] Running Capacitor Android sync...');
execSync('cmd.exe /c "npx cap sync android"', { cwd: ANDROID_PROJECT, stdio: 'inherit' });

// Step 4: Assemble Release AAB via Gradle
console.log('\n[5/5] Building signed Release Bundle (.aab) with Gradle...');
const oldAab = path.join(ANDROID_PROJECT, 'android/app/build/outputs/bundle/release/app-release.aab');
if (fs.existsSync(oldAab)) {
  try { fs.unlinkSync(oldAab); } catch (e) {}
}

const gradleCmd = 'cmd.exe /c "set JAVA_HOME=' + JAVA_HOME + '&& gradlew.bat clean bundleRelease"';
execSync(gradleCmd, { cwd: path.join(ANDROID_PROJECT, 'android'), stdio: 'inherit' });

// Step 5: Verify and copy AAB
const aabSource = path.join(ANDROID_PROJECT, 'android/app/build/outputs/bundle/release/app-release.aab');
const aabDestRoot = path.join(ROOT_SOURCE, 'app-release.aab');
const aabDestAndroid = path.join(ANDROID_PROJECT, 'app-release.aab');

if (fs.existsSync(aabSource)) {
  fs.copyFileSync(aabSource, aabDestRoot);
  fs.copyFileSync(aabSource, aabDestAndroid);

  const sizeMb = (fs.statSync(aabSource).size / (1024 * 1024)).toFixed(2);
  console.log('\n====================================================');
  console.log('✅ PRODUCTION AAB BUNDLE BUILT AND SIGNED SUCCESSFULLY!');
  console.log('📦 Output: app-release.aab (' + sizeMb + ' MB)');
  console.log('📍 Saved to: ' + aabDestAndroid);
  console.log('📍 Also saved to: ' + aabDestRoot);
  console.log('====================================================');
} else {
  console.error('❌ Error: AAB output file not found at ' + aabSource);
  process.exit(1);
}
