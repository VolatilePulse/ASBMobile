var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
   '/',
   '/index.html',
   '/favicon.ico',
   '/values.json',
   '/img/Food.png',
   '/img/Health.png',
   '/img/Melee.png',
   '/img/Oxygen.png',
   '/img/Speed.png',
   '/img/Stamina.png',
   '/img/Torpor.png',
   '/img/Weight.png',
   '/src/app.js',
   '/src/Ark.js',
   '/src/Data.js',
   '/src/Utils.js',
   '/src/ASBM/Creature.js',
   '/src/ASBM/Extractor.js',
   '/src/ASBM/Library.js',
   '/src/ASBM/Multipliers.js',
   '/src/ASBM/UI.js'
 ];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
   console.log('[ServiceWorker] Activate');
   e.waitUntil(
     caches.keys().then(function(keyList) {
       return Promise.all(keyList.map(function(key) {
         if (key !== cacheName) {
           console.log('[ServiceWorker] Removing old cache', key);
           return caches.delete(key);
         }
       }));
     })
   );
   return self.clients.claim();
 });

self.addEventListener('fetch', function(e) {
   console.log('[ServiceWorker] Fetch', e.request.url);
   e.respondWith(
     caches.match(e.request).then(function(response) {
       return response || fetch(e.request);
     })
   );
 });