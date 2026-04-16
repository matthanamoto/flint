// ============================================================
// FLINT — Service Worker
// Cache-first app shell. Update CACHE_NAME when releasing.
// ============================================================
const CACHE_NAME = 'flint-v1';

const APP_SHELL = [
  './',
  './index.html',
  './flint.css',
  './flint-app.js',
  './flint-data.js',
  './flint-registry.js',
  './flint-icon.svg',
  './manifest.json'
];

// ── Install: pre-cache the shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first, network fallback ─────────────────────
self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests; let cross-origin (claude.ai) pass through
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation: always serve index.html from cache so the PWA works offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(r => r || fetch(event.request))
    );
    return;
  }

  // Assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Only cache valid, same-origin responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
