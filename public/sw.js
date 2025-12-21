// Service Worker for PULSE Field Interviewer PWA
// Implements offline-first caching strategy for field data collection

const CACHE_NAME = 'pulse-fi-pwa-v6';
const RUNTIME_CACHE = 'pulse-fi-runtime-v6';
const OFFLINE_URL = '/offline.html';

// Static assets to cache on install - focused on field interviewer needs
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // API calls - Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    // CPAP API endpoints - NEVER cache to ensure fresh data after saves
    if (url.pathname.startsWith('/api/cpap')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            console.log('[SW] CPAP API - Network only (no cache):', url.pathname);
            return response;
          })
          .catch((error) => {
            console.log('[SW] CPAP API - Network failed:', url.pathname);
            // Return error response for failed CPAP API calls
            return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          })
      );
      return;
    }
    
    // Other API calls - Network-first with cache fallback
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Clone and cache successful responses
            if (response.status === 200) {
              const responseToCache = response.clone();
              cache.put(request, responseToCache);
              console.log('[SW] Cached API response:', url.pathname);
            }
            return response;
          })
          .catch((error) => {
            console.log('[SW] Network failed for:', url.pathname, 'Checking cache...');
            // Return cached API response if available
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] ✅ Using cached API response for:', url.pathname);
                return cachedResponse;
              }
              console.log('[SW] ❌ No cache available for:', url.pathname);
              // Return error response for failed API calls
              return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              });
            });
          });
      })
    );
    return;
  }
  
  // HTML pages and Next.js routes - Cache-first for offline support
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // If fetch fails, return cached version or offline page
              if (cachedResponse) {
                console.log('[SW] Serving cached page offline:', url.pathname);
                return cachedResponse;
              }
              return caches.match(OFFLINE_URL);
            });
          
          // Return cached version immediately if available
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Static assets (JS, CSS, images, fonts) - Aggressive caching for offline
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately, update in background
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response);
            }
          }).catch(() => {});
          return cachedResponse;
        }
        
        // Not in cache, fetch and cache
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            console.log('[SW] Failed to fetch:', url.pathname);
            return new Response('Offline', { status: 503 });
          });
      });
    })
  );
});

// Handle messages from the client
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
