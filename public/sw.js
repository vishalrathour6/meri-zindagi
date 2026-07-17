/*
 * Meri Zindagi service worker (hand-written, no Workbox — Turbopack-friendly).
 *
 * Strategy:
 *   - precache the offline fallback page + app icons on install
 *   - static build assets (/_next/static, icons, fonts) -> cache-first (immutable)
 *   - navigations -> network-first, fall back to cache, then to /offline
 *   - GET /api/* (data) -> network-first, fall back to the last cached response
 *   - non-GET requests and /api/auth/* -> passthrough (never cached)
 *
 * Bump CACHE_VERSION to invalidate all caches on the next activation.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `mz-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mz-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheable(response) {
  return (
    response &&
    response.status === 200 &&
    (response.type === "basic" || response.type === "default")
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, { navigate = false } = {}) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (navigate) {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/auth")) return;

  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname === "/favicon.ico";

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, { navigate: true }));
    return;
  }
  if (isStatic) {
    event.respondWith(cacheFirst(request));
    return;
  }
  // Data APIs and everything else: prefer fresh, fall back to cache when offline.
  event.respondWith(networkFirst(request));
});
