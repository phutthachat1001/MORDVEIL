const CACHE = 'mordveil-v13';
const ASSETS = [
  './Play.html',
  './css/style.css',
  './js/state.js',
  './js/data.js',
  './js/save.js',
  './js/exp.js',
  './js/ui.js',
  './js/battle.js',
  './js/npc-encounter.js',
  './js/tasks.js',
  './js/inventory.js',
  './js/shop.js',
  './js/hub.js',
  './js/intro.js',
  './js/daily.js',
  './js/events.js',
  './js/evolution.js',
  './js/achievements.js',
  './js/cosmetic.js',
  './js/audio.js',
  './assets/button/playnext.png',
  './assets/button/newgame.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML/JS/CSS — always try to get fresh version,
// fall back to cache only when offline.
// Images and other assets use cache-first (stable, large).
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isAsset = /\.(png|jpg|jpeg|gif|svg|webp|mp4|woff2?)$/i.test(url.pathname);

  if (isAsset) {
    // cache-first for images/fonts/videos
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
  } else {
    // network-first for HTML/JS/CSS
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
});
