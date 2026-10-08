/* =========================================================
   PWA Service Worker - Gurukulam App Shell & Offline Cache
   ========================================================= */
const CACHE_NAME = 'gurukulam-pwa-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.css?v=13',
  './enhance.css?v=17',
  './ai-chat.css?v=18',
  './manage.css?v=3',
  './cloud.js?v=51',
  './ux-upgrade.css?v=2',
  './logo.png',
  './favicon.png',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA: Some assets could not be pre-cached', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Clearing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Do not cache API or non-GET requests
  if (url.pathname.includes('/api/') || req.method !== 'GET') {
    return;
  }

  // Network First for all requests, fallback to cache if offline
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === 'navigate' || req.destination === 'document') {
            return caches.match('./index.html');
          }
          if (req.destination === 'image') {
            return caches.match('./logo.png');
          }
        });
      })
  );
});
