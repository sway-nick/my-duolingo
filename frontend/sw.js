const CACHE_NAME = 'my-duolingo-v2.1';
const APP_SHELL_FILES = [
  './index.html',
  './assets/css/main.css?v=2.1',
  './manifest.json',
  './app.js?v=2.1'
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install v2.1');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// Activate Event - purge all old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate & Purge Old Caches');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First strategy for dev & updates
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});
