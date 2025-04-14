const CACHE_NAME = 'brasilit-v2';
const OFFLINE_PAGE = '/offline.html';

// Critical assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/index.css',
  '/src/main.tsx',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  OFFLINE_PAGE
];

// Install - Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // For API calls, use network first
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response('{error: "offline"}', {
          headers: {'Content-Type': 'application/json'}
        }))
    );
    return;
  }

  // For assets, use cache first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return cachedResponse || new Response('Offline content not available');
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncInspections());
  }
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nova notificação', {
      body: data.body || 'Você tem uma nova notificação',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.url ? { url: data.url } : null
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

async function syncInspections() {
  // Implementation for syncing offline inspections
  // Would integrate with src/lib/sync.service.ts
}

async function syncForms() {
  // Implementation for syncing form submissions
  const cache = await caches.open('form-submissions');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Failed to sync form submission:', error);
    }
  }
}
