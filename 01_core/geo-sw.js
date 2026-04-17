// GEO Service Worker - Soporte offline y caché
const CACHE_NAME = 'geo-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/geo.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[GEO SW] Caché abierto');
            return cache.addAll(urlsToCache.filter(url => {
                // Solo cachear archivos locales, no CDNs
                return url.startsWith('http') === false;
            }));
        }).catch(err => {
            console.warn('[GEO SW] Error al cachear:', err);
        })
    );
});

// Activar Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[GEO SW] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Estrategia: Network first, fallback cache
self.addEventListener('fetch', event => {
    // Solo manejar GETs
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cachear respuesta exitosa
                if (response.ok && event.request.url.startsWith('http')) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla, uenta del caché
                return caches.match(event.request)
                    .then(cachedResponse => {
                        return cachedResponse || new Response(
                            JSON.stringify({
                                error: 'Offline - No hay caché disponible',
                                message: 'Verifica tu conexión a internet'
                            }),
                            {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({ 'Content-Type': 'application/json' })
                            }
                        );
                    });
            })
    );
});

// Manejo de mensajes de la app
self.addEventListener('message', event => {
    const { action, data } = event.data;

    switch (action) {
        case 'skip-waiting':
            self.skipWaiting();
            break;
        case 'cache-urls':
            caches.open(CACHE_NAME).then(cache => {
                cache.addAll(data.urls).catch(err => {
                    console.warn('[GEO SW] Error al cachear URLs:', err);
                });
            });
            break;
        case 'clear-cache':
            caches.delete(CACHE_NAME).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        default:
            console.log('[GEO SW] Acción desconocida:', action);
    }
});

// Notificaciones push (futuro)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'GEO Notificación',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛡️</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300ff88"/></svg>',
        tag: 'geo-notification',
        sound: 'notification.mp3'
    };

    event.waitUntil(
        self.registration.showNotification('GEO', options)
    );
});

// Click en notificación
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

console.log('[GEO] Service Worker registrado con éxito');
