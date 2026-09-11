const CACHE_NAME = "pedagogy-app-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./curriculum.js",
  "./pdf-reader.js",
  "./icon.png",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Let Gemini API calls pass directly to network
  if (e.request.url.includes("googleapis.com")) return;

  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
