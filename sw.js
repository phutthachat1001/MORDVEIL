const CACHE = 'mordveil-v12';
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

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
