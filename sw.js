// soulsensis app (14 Nov 2026, docs/specs/app-2026-11-14.md): pages come fresh from the network when online; the app's
// start page, the book and anything read before also open offline. A page never read offline falls back to the app.
const C = "ss-v2";
const CORE = ["/app/", "/book.html", "/site.css", "/landing.css", "/fonts/fonts.css", "/manifest.webmanifest",
  "/app-192.png", "/apple-touch-icon.png", "/book/colours/front-white.webp"];
self.addEventListener("install", (e) => {
  // one missing file never stops the app installing: each is cached on its own
  e.waitUntil(caches.open(C).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(C).then((c) => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })
      .then((r) => r || (e.request.mode === "navigate" ? caches.match("/app/") : Response.error()))));
});
