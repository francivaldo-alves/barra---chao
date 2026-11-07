// Service Worker para funcionamento 100% Offline no Android (PWA / WebView)
// O build (scripts/build-web.mjs) troca "dev" por um hash do conteúdo: mudou qualquer arquivo, muda o cache.
const CACHE_NAME = "barra-e-chao-dev";

// Lista única dos arquivos do app: é o que fica offline e o que o build copia para www/ (o APK)
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./styles/variables.css",
  "./styles/base.css",
  "./styles/workout.css",
  "./styles/modals.css",
  "./styles/fonts/barlow-400.woff2",
  "./styles/fonts/barlow-500.woff2",
  "./styles/fonts/barlow-600.woff2",
  "./styles/fonts/barlow-700.woff2",
  "./styles/fonts/big-shoulders-display.woff2",
  "./styles/fonts/OFL-Barlow.txt",
  "./styles/fonts/OFL-BigShouldersDisplay.txt",
  "./vendor/three.min.js",
  "./vendor/GLTFLoader.js",
  "./models/male-glb.js",
  "./src/main.js",
  "./src/data/poses.js",
  "./src/data/exercises.js",
  "./src/data/plans.js",
  "./src/data/challenges.js",
  "./src/data/tempo.js",
  "./src/engine/kinematics2d.js",
  "./src/engine/figure2d.js",
  "./src/engine/viewer3d.js",
  "./src/services/storage.js",
  "./src/services/planner.js",
  "./src/services/audio.js",
  "./src/ui/dom.js",
  "./src/ui/sheet.js",
  "./src/ui/timer.js",
  "./src/ui/player.js",
  "./src/ui/modals.js",
  "./src/ui/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request, { cache: "no-cache" })
      .then(response => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => cached || caches.match("./index.html"))
      )
  );
});
