const CACHE_NAME = 'my-duolingo-v1';
const APP_SHELL_FILES = [
  './index.html',
  './assets/css/main.css',
  './manifest.json',
  // Note: Add all necessary JS module paths here.
  // './js/app.js',
  // './js/initialData.js',
  // './js/storageService.js'
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(APP_SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first for local static assets (App Shell)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  } else {
    // Network-first for API calls or external resources
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            if (response) {
              return response;
            }
            // Offline fallback for API
            if (event.request.headers.get('accept').includes('application/json')) {
              return new Response(JSON.stringify({ success: true, offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          });
        })
    );
  }
});
