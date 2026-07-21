// Service Worker for Room 803 Mess Management PWA

const CACHE_NAME = 'mess-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './admin.html',
  './attendance.html',
  './members.html',
  './register.html',
  './menu.html',
  './bills.html',
  './payments.html',
  './reports.html',
  './settings.html',
  './css/style.css',
  './css/dashboard.css',
  './css/responsive.css',
  './js/storage.js',
  './js/app.js',
  './js/dashboard.js',
  './js/members.js',
  './js/attendance.js',
  './js/menu.js',
  './js/bills.js',
  './js/payments.js',
  './js/reports.js',
  './manifest.json'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200 && event.request.url.startsWith('http')) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
