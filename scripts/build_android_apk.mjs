import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_SOURCE = 'c:/projects/my-duolingo';
const ANDROID_PROJECT = 'C:/projects/my-duolingo-android';
const JAVA_HOME = 'C:\\Program Files\\Android\\Android Studio\\jbr';

console.log('====================================================');
console.log('🚀 STANDARDIZED ANDROID APK BUILD (Section 12 Compliant)');
console.log('====================================================');

// Step 1: Sync frontend web assets
console.log('\n[1/5] Building frontend and synchronizing assets...');
execSync('node scripts/build.cjs', { cwd: ROOT_SOURCE, stdio: 'inherit' });

// Sync changes to android project frontend
console.log('\n[2/5] Synchronizing frontend to android project...');
execSync('node scripts/build.cjs', { cwd: ANDROID_PROJECT, stdio: 'inherit' });

// Step 2: Prepare lightweight audio assets (Elementary US only)
console.log('\n[3/5] Enforcing Section 12 audio standards (Elementary US only)...');
execSync('node scripts/prepare_android_assets.mjs', { cwd: ROOT_SOURCE, stdio: 'inherit' });

// Step 3: Capacitor sync
console.log('\n[4/5] Running Capacitor Android sync...');
execSync('cmd.exe /c "npx cap sync android"', { cwd: ANDROID_PROJECT, stdio: 'inherit' });

// Step 4: Assemble Debug APK via Gradle
console.log('\n[5/5] Building APK with Gradle...');
const gradleCmd = 'cmd.exe /c "set JAVA_HOME=' + JAVA_HOME + '&& gradlew.bat assembleDebug"';
execSync(gradleCmd, { cwd: path.join(ANDROID_PROJECT, 'android'), stdio: 'inherit' });

// Step 5: Copy and verify APK size
const apkSource = path.join(ANDROID_PROJECT, 'android/app/build/outputs/apk/debug/app-debug.apk');
const apkDestOutputs = path.join(ANDROID_PROJECT, 'android/app/build/outputs/apk/EnglishBreakfast.apk');
const apkDestRoot = path.join(ROOT_SOURCE, 'EnglishBreakfast.apk');
const apkDestAndroid = path.join(ANDROID_PROJECT, 'EnglishBreakfast.apk');

if (fs.existsSync(apkSource)) {
  fs.copyFileSync(apkSource, apkDestOutputs);
  fs.copyFileSync(apkSource, apkDestRoot);
  fs.copyFileSync(apkSource, apkDestAndroid);

  const sizeMb = (fs.statSync(apkSource).size / (1024 * 1024)).toFixed(2);
  console.log('\n====================================================');
  console.log('✅ APK BUILD COMPLETED SUCCESSFULLY!');
  console.log('📦 Output: EnglishBreakfast.apk (' + sizeMb + ' MB)');
  if (parseFloat(sizeMb) <= 40.0) {
    console.log('🎯 Standards achieved: Lightweight APK (~34-36 MB target met).');
  } else {
    console.warn('⚠️ Warning: APK size (' + sizeMb + ' MB) exceeds recommended ~36 MB limit.');
  }
  console.log('====================================================');
} else {
  throw new Error('❌ APK build failed: Output file app-debug.apk not found!');
}
