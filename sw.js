const CACHE_NAME = 'howtobeyoung-v1';
const LANG_DIRS = ['en', 'es', 'fr', 'de', 'ja', 'pt', 'zh', 'ko', 'ar'];
const PAGES = ['index.html', 'youth-score.html', 'youth-systems.html', 'stories.html', 'protocols.html', 'life-stages.html', 'about.html'];

const CORE_ASSETS = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/404.html'
];

const LANG_ASSETS = LANG_DIRS.flatMap(lang =>
  PAGES.map(page => `/${lang}/${page}`)
);

const ALL_ASSETS = [...CORE_ASSETS, ...LANG_ASSETS];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Serve from cache on network failure
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // Fallback to 404 page for HTML requests
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/404.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
