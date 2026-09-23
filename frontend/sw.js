// Service Worker disabled in development to prevent stale CSS caching
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests; never intercept cross-origin API calls (Firebase Auth, Firestore, Google)
  if (event.request.method !== 'GET') return;
  try {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    event.respondWith(fetch(event.request));
  } catch (e) {
    // If URL parsing fails, let the browser handle it naturally
  }
});
