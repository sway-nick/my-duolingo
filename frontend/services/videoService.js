/**
 * Video OTA (Over-The-Air) Service
 * Allows replacing and updating cat videos dynamically over the air
 * without rebuilding APK/AAB or requiring Google Play review.
 */

const VIDEO_CACHE_NAME = 'myduo-video-cache-v1';
const RAW_MANIFEST_URL = 'https://raw.githubusercontent.com/sway-nick/my-duolingo/main/frontend/assets/video/ota_manifest.json';
const RAW_VIDEO_BASE = 'https://raw.githubusercontent.com/sway-nick/my-duolingo/main/frontend/assets/video/';

const cachedBlobUrls = new Map();

/**
 * Returns playable URL for a video file.
 * If an OTA updated version exists in CacheStorage, returns its blob URL.
 * Otherwise returns local bundled path 'assets/video/' + filename.
 */
export async function resolveVideoUrl(filename) {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('blob:')) {
    return filename;
  }

  // Check in-memory cached blob URL
  if (cachedBlobUrls.has(filename)) {
    return cachedBlobUrls.get(filename);
  }

  // Check CacheStorage for OTA video
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(VIDEO_CACHE_NAME);
      const cacheKey = `ota_video_${filename}`;
      const matched = await cache.match(cacheKey);
      if (matched) {
        const blob = await matched.blob();
        if (blob && blob.size > 1000) {
          const blobUrl = URL.createObjectURL(blob);
          cachedBlobUrls.set(filename, blobUrl);
          return blobUrl;
        }
      }
    } catch (e) {
      console.warn('Error reading video from cache:', e);
    }
  }

  return 'assets/video/' + filename;
}

/**
 * Checks remote OTA manifest and downloads newer video versions in background.
 */
export async function syncRemoteVideos() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    let manifest = null;

    // 1. Try fetching remote OTA manifest from raw GitHub CDN
    try {
      const res = await fetch(`${RAW_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        manifest = await res.json();
      }
    } catch (netErr) {
      // Fallback to local manifest if available
      try {
        const localRes = await fetch(`assets/video/ota_manifest.json?t=${Date.now()}`);
        if (localRes.ok) manifest = await localRes.json();
      } catch (e) {}
    }

    if (!manifest || !manifest.versions) return;

    // 2. Check each video version against local storage
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(VIDEO_CACHE_NAME);
      const versions = manifest.versions || {};
      const customUrls = manifest.urls || {};

      for (const [filename, remoteVer] of Object.entries(versions)) {
        const localVer = parseInt(localStorage.getItem(`ota_video_ver_${filename}`) || '0', 10);
        if (Number(remoteVer) > localVer) {
          console.log(`📥 [OTA Video] New version available for ${filename} (v${remoteVer} > v${localVer}). Downloading...`);
          const downloadUrl = customUrls[filename] || `${RAW_VIDEO_BASE}${filename}?v=${remoteVer}`;

          try {
            const vidRes = await fetch(downloadUrl);
            if (vidRes.ok) {
              const cacheKey = `ota_video_${filename}`;
              await cache.put(cacheKey, vidRes.clone());
              localStorage.setItem(`ota_video_ver_${filename}`, String(remoteVer));

              // Invalidate any previously cached blob URL
              if (cachedBlobUrls.has(filename)) {
                try { URL.revokeObjectURL(cachedBlobUrls.get(filename)); } catch (e) {}
                cachedBlobUrls.delete(filename);
              }

              console.log(`✅ [OTA Video] ${filename} updated to v${remoteVer} successfully!`);
            }
          } catch (dlErr) {
            console.warn(`[OTA Video] Download failed for ${filename}:`, dlErr);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[OTA Video] Sync error:', err);
  }
}
