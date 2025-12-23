// Service Worker for LOT Systems PWA
// Version: 2024-12-23-006

const CACHE_VERSION = 'v2024-12-23-006';
const CACHE_NAME = `lot-cache-${CACHE_VERSION}`;

// Files to cache initially (only static assets)
const STATIC_CACHE = [
  '/icon/icon-192.png',
  '/icon/icon-512.png',
  '/og.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete ALL caches, even current one, to force fresh fetch
            console.log('[SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Recreate cache with static assets only
        return caches.open(CACHE_NAME).then((cache) => {
          console.log('[SW] Creating fresh cache with static assets');
          return cache.addAll(STATIC_CACHE);
        });
      })
      .then(() => {
        // Take control of all pages immediately
        console.log('[SW] Taking control of all pages');
        return self.clients.claim();
      })
  );
});

// Fetch event - network-first strategy for JavaScript, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip external CDN requests - let them through without service worker interference
  if (url.origin !== self.location.origin) {
    console.log('[SW] Bypassing external request:', url.href);
    return; // Pass through to network, don't intercept
  }

  // Network-first for all JavaScript files (including bundles)
  if (url.pathname.endsWith('.js') || url.pathname.includes('/js/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before returning it
          const responseToCache = response.clone();

          // Update cache with fresh response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Serving cached JS (offline):', url.pathname);
                return cachedResponse;
              }
              // If not in cache, return error response
              return new Response('Offline - file not cached', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }

  // Network-first for HTML pages and API calls
  if (url.pathname.endsWith('.html') || url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/u/') || url.pathname.startsWith('/us/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // For HTML pages, try cache as fallback
          if (!url.pathname.startsWith('/api/')) {
            return caches.match(event.request);
          }
          throw new Error('API not available offline');
        })
    );
    return;
  }

  // Cache-first for CSS and static assets
  if (url.pathname.endsWith('.css') || url.pathname.includes('/icon/') ||
      url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request).then((response) => {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          });
        })
    );
    return;
  }

  // Default: network-first for everything else
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service worker loaded, version:', CACHE_VERSION);
