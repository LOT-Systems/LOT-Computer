// Service Worker for LOT Systems PWA
// Version: 2026-01-28-003 - DISABLED - Bypass all requests to diagnose Safari PWA issue

const CACHE_VERSION = 'v2026-01-28-003';
const CACHE_NAME = `lot-cache-${CACHE_VERSION}`;

// Minimal cache - just PWA icons
const STATIC_CACHE = [
  '/icon/icon-192.png',
  '/icon/icon-512.png',
];

// Install event - minimal caching
self.addEventListener('install', (event) => {
  console.log('[SW] Installing minimal service worker version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating minimal service worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - BYPASS EVERYTHING - Let all requests go straight to network
self.addEventListener('fetch', (event) => {
  // Don't intercept anything - pass everything through to the network
  // This helps diagnose if the service worker is causing the issue
  return;
});

console.log('[SW] Minimal bypass service worker loaded, version:', CACHE_VERSION);
