/* Service Worker für Sparblick (PWA) — cached die App-Shell für Offline-Betrieb.
 * Speichert KEINE Nutzerdaten; die liegen im localStorage des Geräts. */
const CACHE = "sparblick-v0.13.0"; // pro Release erhöhen, damit neue Dateien aktiv werden
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Erlaubt der App, eine wartende neue Version sofort zu übernehmen.
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Cache-first mit Netzwerk-Fallback; erfolgreiche GET-Antworten nachcachen.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // version.json immer frisch aus dem Netz (Update-Prüfung), sonst Cache als Fallback.
  if (new URL(e.request.url).pathname.endsWith("version.json")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
