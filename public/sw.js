const CACHE_NAME = 'mellodi-pwa-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and exclude APIs or external extension calls
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') || 
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }
  
  event.respondWith(
    // Network-First Strategy: Try to fetch from network first
    fetch(event.request)
      .then((response) => {
        // Cache new static assets dynamically
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (offline), fall back to cache
        return caches.match(event.request);
      })
  );
});
