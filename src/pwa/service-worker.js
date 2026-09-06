/*
 * astro-blog-theme service worker.
 *
 * The build id and precache list a few lines down are filled in at build time.
 *
 * Strategy:
 *   - precache every page and hashed asset on install (big files like the
 *     Stockfish WASM and feeds are left out — they cache on first use only)
 *   - navigations: network-first, fall back to the cached page, then "/"
 *   - other same-origin GETs: cache-first, then network (and cache the result)
 */

const BUILD_ID = "__BUILD_ID__";
const CACHE = `abt-${BUILD_ID}`;
const PRECACHE = JSON.parse("__PRECACHE__");

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // one bad URL shouldn't fail the whole install
      Promise.allSettled(PRECACHE.map((url) => cache.add(url))),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("abt-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
