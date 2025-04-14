const CACHE_NAME = 'brasilit-v3';
const STATIC_CACHE_NAME = 'brasilit-static-v3';
const DYNAMIC_CACHE_NAME = 'brasilit-dynamic-v3';
const OFFLINE_PAGE = '/offline.html';

// Recursos críticos para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Limite de cache dinâmico
const DYNAMIC_CACHE_LIMIT = 50;

// Função para limitar o tamanho do cache dinâmico
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Remove os itens mais antigos
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Função para verificar se a URL é uma API
function isApiUrl(url) {
  return url.includes('/api/') || 
         url.includes('supabase.co') || 
         url.includes('clerk.dev');
}

// Função para verificar se a URL é um recurso estático
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff2', '.ttf', '.woff', '.png', '.jpg', '.jpeg', '.svg', '.ico'];
  return staticExtensions.some(ext => url.endsWith(ext));
}

// Função para verificar se a URL é uma página HTML
function isHtmlPage(url) {
  const urlObj = new URL(url);
  return urlObj.pathname === '/' || 
         urlObj.pathname.endsWith('.html') || 
         !urlObj.pathname.includes('.');
}

// Instalar - Cache de recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar - Limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME && 
            cacheName !== DYNAMIC_CACHE_NAME && 
            cacheName !== CACHE_NAME
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch - Estratégias de cache diferentes por tipo de recurso
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar requisições para o DevTools
  if (url.hostname === 'localhost' && url.port === '5173' && url.pathname.startsWith('/__vite')) {
    return;
  }

  // Para APIs, usar Network First com fallback para cache
  if (isApiUrl(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clonar a resposta para o cache
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
              limitCacheSize(DYNAMIC_CACHE_NAME, DYNAMIC_CACHE_LIMIT);
            });
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return cachedResponse || new Response(
            JSON.stringify({ error: 'offline', message: 'Você está offline' }), 
            { 
              headers: {'Content-Type': 'application/json'},
              status: 503,
              statusText: 'Service Unavailable'
            }
          );
        })
    );
    return;
  }

  // Para recursos estáticos, usar Cache First
  if (isStaticAsset(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            })
            .catch(error => {
              console.error('[Service Worker] Fetch failed:', error);
              // Não há fallback específico para recursos estáticos
            });
        })
    );
    return;
  }

  // Para páginas HTML, usar Network First com fallback para offline
  if (isHtmlPage(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clonar a resposta para o cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return cachedResponse || caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Para outros recursos, usar Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                limitCacheSize(DYNAMIC_CACHE_NAME, DYNAMIC_CACHE_LIMIT);
              });
            return networkResponse;
          })
          .catch(() => {
            // Se não conseguir buscar, retorna o cache ou offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_PAGE);
            }
            // Não há fallback específico para outros recursos
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Sincronização em segundo plano para dados offline
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event.tag);
  
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncInspections());
  }
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
  if (event.tag === 'sync-all') {
    event.waitUntil(Promise.all([
      syncInspections(),
      syncForms()
    ]));
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received');
  
  const data = event.data?.json() || {
    title: 'Nova notificação',
    body: 'Você tem uma nova notificação',
    icon: '/icons/icon-192x192.png'
  };
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.url ? { url: data.url } : null,
    actions: data.actions || [
      { action: 'view', title: 'Ver detalhes' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  // Verificar se há URL nos dados da notificação
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // Verificar se já há uma janela aberta e focar nela
          for (const client of windowClients) {
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // Se não houver janela aberta, abrir uma nova
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
    );
  }
});

// Implementação para sincronizar inspeções offline
async function syncInspections() {
  try {
    const cache = await caches.open('sync-inspections');
    const requests = await cache.keys();
    
    console.log(`[Service Worker] Syncing ${requests.length} inspections`);
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          console.log('[Service Worker] Synced inspection:', request.url);
          await cache.delete(request);
          
          // Notificar o cliente sobre sincronização bem-sucedida
          const clients = await self.clients.matchAll();
          for (const client of clients) {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              url: request.url
            });
          }
        } else {
          console.error('[Service Worker] Failed to sync inspection:', response.status);
        }
      } catch (error) {
        console.error('[Service Worker] Error syncing inspection:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Sync inspections error:', error);
    return false;
  }
}

// Implementação para sincronizar envios de formulários
async function syncForms() {
  try {
    const cache = await caches.open('form-submissions');
    const requests = await cache.keys();
    
    console.log(`[Service Worker] Syncing ${requests.length} form submissions`);
    
    for (const request of requests) {
      try {
        const formData = await cache.match(request).then(r => r.json());
        
        // Recriar a requisição com os dados do formulário
        const syncRequest = new Request(request.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const response = await fetch(syncRequest);
        if (response.ok) {
          console.log('[Service Worker] Synced form submission:', request.url);
          await cache.delete(request);
          
          // Notificar o cliente sobre sincronização bem-sucedida
          const clients = await self.clients.matchAll();
          for (const client of clients) {
            client.postMessage({
              type: 'FORM_SYNC_SUCCESS',
              url: request.url,
              data: formData
            });
          }
        } else {
          console.error('[Service Worker] Failed to sync form:', response.status);
        }
      } catch (error) {
        console.error('[Service Worker] Error syncing form:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Sync forms error:', error);
    return false;
  }
}

// Ouvir mensagens dos clientes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Sincronização manual para navegadores sem suporte a Background Sync
  if (event.data && event.data.type === 'MANUAL_SYNC') {
    console.log('[Service Worker] Iniciando sincronização manual');
    Promise.all([
      syncInspections(),
      syncForms()
    ]).then(results => {
      const allSuccess = results.every(result => result === true);
      
      // Notificar os clientes sobre o resultado da sincronização
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MANUAL_SYNC_COMPLETE',
            success: allSuccess
          });
        });
      });
    });
  }
});
