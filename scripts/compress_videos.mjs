#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegStatic from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const VIDEO_SRC_DIR = path.join(ROOT, 'frontend', 'assets', 'video');
const SYNC_DIRS = [
  path.join(ROOT, 'docs', 'assets', 'video'),
  path.join(ROOT, 'assets', 'video'),
  path.resolve(ROOT, '..', 'my-duolingo-android', 'frontend', 'assets', 'video'),
];

const COMPRESSED_TAG = 'eb-compressed-v1';
const MIN_VALID_BYTES = 15000;

function resolveFfmpegPath() {
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) return ffmpegStatic;
  const fallback = path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
  if (fs.existsSync(fallback)) return fallback;
  throw new Error('ffmpeg-static binary not found');
}

function probeMedia(ffmpegPath, filePath) {
  let stderr = '';
  try {
    execFileSync(ffmpegPath, ['-hide_banner', '-i', filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
  } catch (err) {
    stderr = (err.stderr || '') + (err.stdout || '');
  }
  const hasAudio = /Stream #\d+:\d+.*:\s*Audio:/i.test(stderr);
  const isAlreadyCompressed = new RegExp(`comment\\s*:\\s*${COMPRESSED_TAG}\\b`, 'i').test(stderr);
  return { hasAudio, isAlreadyCompressed };
}

function hasFtypHeader(filePath) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    const bytesRead = fs.readSync(fd, buf, 0, 12, 0);
    return bytesRead >= 8 && buf.subarray(4, 8).toString('ascii') === 'ftyp';
  } finally {
    fs.closeSync(fd);
  }
}

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1);
}

function formatMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(3);
}

function parseArgs(argv) {
  const args = { force: false, fromDir: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--from-dir' && argv[i + 1]) {
      args.fromDir = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function main() {
  const { force, fromDir } = parseArgs(process.argv.slice(2));
  const ffmpegPath = resolveFfmpegPath();

  if (!fs.existsSync(VIDEO_SRC_DIR)) {
    throw new Error(`Source video directory missing: ${VIDEO_SRC_DIR}`);
  }

  const mp4Files = fs
    .readdirSync(VIDEO_SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .sort();

  if (mp4Files.length === 0) {
    throw new Error(`No .mp4 files found in ${VIDEO_SRC_DIR}`);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eb-video-compress-'));
  let totalBefore = 0;
  let totalAfter = 0;
  let encodedCount = 0;
  let skippedCount = 0;

  try {
    for (const fileName of mp4Files) {
      const targetPath = path.join(VIDEO_SRC_DIR, fileName);
      const inputPath = fromDir ? path.join(fromDir, fileName) : targetPath;
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file missing: ${inputPath}`);
      }

      const origSize = fs.statSync(inputPath).size;
      const currentSize = fs.statSync(targetPath).size;
      const targetProbe = probeMedia(ffmpegPath, targetPath);

      if (!force && !fromDir && targetProbe.isAlreadyCompressed) {
        totalBefore += currentSize;
        totalAfter += currentSize;
        skippedCount += 1;
        console.log(`[SKIP] ${fileName}: already compressed (${formatKb(currentSize)} KB)`);
        continue;
      }

      const inputProbe = inputPath === targetPath ? targetProbe : probeMedia(ffmpegPath, inputPath);
      const tmpOut = path.join(tmpDir, fileName);

      const ffmpegArgs = [
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-profile:v',
        'main',
        '-level',
        '3.1',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        "scale='min(480,iw)':-2",
        '-crf',
        '29',
        '-preset',
        'slow',
        '-movflags',
        '+faststart',
        ...(inputProbe.hasAudio ? ['-c:a', 'aac', '-b:a', '44k', '-ac', '1'] : ['-an']),
        '-metadata',
        `comment=${COMPRESSED_TAG}`,
        tmpOut,
      ];

      execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });

      if (!fs.existsSync(tmpOut)) {
        throw new Error(`ffmpeg did not produce output for ${fileName}`);
      }

      const newSize = fs.statSync(tmpOut).size;
      if (newSize <= MIN_VALID_BYTES) {
        throw new Error(`Encoded ${fileName} too small (${newSize} bytes <= ${MIN_VALID_BYTES})`);
      }
      if (!hasFtypHeader(tmpOut)) {
        throw new Error(`Encoded ${fileName} missing MP4 ftyp header`);
      }
      if (newSize >= origSize) {
        throw new Error(`Encoded ${fileName} (${newSize} B) is not smaller than original (${origSize} B)`);
      }

      fs.copyFileSync(tmpOut, targetPath);
      encodedCount += 1;
      totalBefore += origSize;
      totalAfter += newSize;

      const pct = (((origSize - newSize) / origSize) * 100).toFixed(1);
      console.log(
        `[OK] ${fileName}: ${formatKb(origSize)} KB -> ${formatKb(newSize)} KB (-${pct}%)`
      );
    }

    // Sync compressed MP4s to all destination asset directories (preserve playlist.json & ota_manifest.json)
    for (const destDir of SYNC_DIRS) {
      fs.mkdirSync(destDir, { recursive: true });
      for (const fileName of mp4Files) {
        const srcFile = path.join(VIDEO_SRC_DIR, fileName);
        const destFile = path.join(destDir, fileName);
        fs.copyFileSync(srcFile, destFile);
        const srcLen = fs.statSync(srcFile).size;
        const destLen = fs.statSync(destFile).size;
        if (srcLen !== destLen) {
          throw new Error(`Sync size mismatch for ${destFile}: ${destLen} !== ${srcLen}`);
        }
      }
      console.log(`[SYNC] Copied ${mp4Files.length} MP4 files to ${destDir}`);
    }

    const totalPct = totalBefore > 0 ? (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1) : '0.0';
    console.log(
      `\nSummary: encoded=${encodedCount}, skipped=${skippedCount}, ` +
        `before=${formatKb(totalBefore)} KB (${formatMb(totalBefore)} MiB), ` +
        `after=${formatKb(totalAfter)} KB (${formatMb(totalAfter)} MiB), saved=-${totalPct}%`
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
