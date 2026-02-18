/**
 * Service Worker for b1t-Sched PWA
 * Handles caching strategies, offline functionality, and background sync
 */

const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/colors.css',
  '/css/components.css',
  '/css/navbar.css',
  '/css/user-details-card.css',
  '/css/dashboard.css',
  '/css/notice.css',
  '/css/classroom.css',
  '/css/note.css',
  '/css/calendar.css',
  '/css/timeline.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/classroom.js',
  '/js/db.js',
  '/js/ui.js',
  '/js/utils.js',
  '/js/notes.js',
  '/js/notice.js',
  '/js/profile.js',
  '/js/routing.js',
  '/js/firebase-config.js',
  '/Social-Preview.webp',
  '/images/preloader.gif'
];

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] SKIP_WAITING message received');
    self.skipWaiting();
  }
});

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Error caching static assets:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => {
              // Remove old caches that don't match current version
              return key !== STATIC_CACHE &&
                key !== DYNAMIC_CACHE &&
                key !== API_CACHE;
            })
            .map(key => {
              console.log('[Service Worker] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different request types
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  const staticExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  const pathname = url.pathname;

  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
    pathname === '/' ||
    pathname === '/index.html' ||
    pathname === '/manifest.json';
}

/**
 * Check if URL is an API request
 */
function isAPIRequest(url) {
  return url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.pathname.includes('/api/');
}

/**
 * Cache-first strategy for static assets
 */
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request);

    // Cache the new response
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache-first strategy failed:', error);

    // Try to return cached response as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page or error response
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network-first strategy for API calls
 */
async function networkFirst(request, cacheName) {
  try {
    // Try network first with timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 10000)
    );

    const networkResponse = await Promise.race([networkPromise, timeoutPromise]);

    // Update cache with fresh data
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('[Service Worker] Network request failed, trying cache:', error);

    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Both failed
    return new Response(JSON.stringify({ error: 'Network and cache unavailable' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale-while-revalidate strategy for dynamic content
 */
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(error => {
    console.warn('[Service Worker] Fetch failed in stale-while-revalidate:', error);
    return cachedResponse;
  });

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

console.log('[Service Worker] Loaded');


/**
 * Notification click event - handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  // Get notification data
  const data = event.notification.data || {};
  const type = data.type || 'task'; // 'task' or 'event'
  const id = data.id || '';

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus().then(client => {
              // Navigate to dashboard
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                notificationType: type,
                id: id
              });
              return client;
            });
          }
        }

        // No window open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/#/dashboard');
        }
      })
      .catch(error => {
        console.error('[Service Worker] Error handling notification click:', error);
      })
  );
});
