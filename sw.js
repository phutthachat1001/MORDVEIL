const CACHE = 'mordveil-v81';
const ASSETS = [
  './Play.html',
  './css/style.css',
  './js/state.js',
  './js/data.js',
  './js/cards.js',
  './js/save.js',
  './js/exp.js',
  './js/ui.js',
  './js/battle.js',
  './js/idle.js',
  './js/codex.js',
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
  './js/infinity.js',
  './js/t4dungeon.js',
  './js/dungeon.js',
  './js/enhance.js',
  './js/idle-events.js',
  './js/tutorial.js',
  './js/offline.js',
  './assets/button/playnext.png',
  './assets/button/newgame.png',
  // NOTE: attack-effect PNGs are NOT precached here — they are cached lazily by
  // the fetch handler (cache-first for images). Precaching every per-class file
  // would make install() fail entirely if any single file is missing (404).
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Only cache full responses (status 200) — skip 206 Partial Content
function _safeCache(cache, req, res) {
  if (res && res.status === 200) cache.put(req, res);
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Skip non-GET and cross-origin requests
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isAsset = /\.(png|jpg|jpeg|gif|svg|webp|mp4|woff2?)$/i.test(url.pathname);

  if (isAsset) {
    // cache-first for images/fonts/videos
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        caches.open(CACHE).then(c => _safeCache(c, e.request, res.clone()));
        return res;
      }))
    );
  } else {
    // network-first for HTML/JS/CSS
    e.respondWith(
      fetch(e.request).then(res => {
        caches.open(CACHE).then(c => _safeCache(c, e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
});
