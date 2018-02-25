var cacheName = 'ASBMobile';

// TODO: Break into a lightweight shell then load resource intensive files like images or values.json
var filesToCache = [
   '/',
   '/index.html',
   '/favicon.ico',
   '/css/w3.css',
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
   '/src/ASBM/UI.js',
   'https://cdn.jsdelivr.net/npm/vue@2.5.13/dist/vue.js',
   'https://unpkg.com/dexie@latest/dist/dexie.js'
];

// caches refers to the entire cache, including multiple caches (if any)
// cache refers to an individual cache, and can only manipulate that one

// When the "install" event is sent, call function (returns an event)
// This is always the first event sent to ServiceWorks
// Can be used to initialize the DB
self.addEventListener('install', function(e) {
   console.log('[ServiceWorker] Install');

   // waitUntil tells the browser work is in progress, let it continue
   // requires a promise
   e.waitUntil(
      // Calls the caches object and requests to open our cachename
      // Since it is a promise, once it resolves, it returns the cache that was requested
      caches.open(cacheName).then(function(cache) {
         console.log('[ServiceWorker] Caching app shell');
         // attempts to add all of our files to the cache (for offline use)
         // If one file fails, the Service Worker doesn't install
         // cache.addAll resolves with void (?)
         return cache.addAll(filesToCache);
      // Since we didn't use a promise, we can start ending the chain
      })
   ); // Allows the browser to end the "install" event
});

// When the "activate" event is sent, call a function
// The activate even is only sent after a Service Worker has successfully been installed
// This guarantess that none of the install functions failed
// Commonly used to clean up the cache
self.addEventListener('activate', function(e) {
   console.log('[ServiceWorker] Activate');
   e.waitUntil(

      // We request the different keys from the cache
      // Once it resolves, handle the keyList
      caches.keys().then(function(keyList) {
         // Return a promise once all iterations are done
         // if a failure occurs, it returns with the first object to fail
         return Promise.all(keyList.map(function(key) {
            // iterating over the keyList, we get one key at a time
            // We check the key names against our cache name
            if (key !== cacheName) {
               console.log('[ServiceWorker] Removing old cache', key);
               // And remove any that aren't the cache we are looking for
               // This removes an entire cache and returns a promise that resolves to true on succeed
               // resolves to false otherwise
               return caches.delete(key);
            }
         }));
      })
   );
   // Sets the service worker as active immediately instead of waiting for the next load of a resource
   // Unsure if it handles multiple instances of the webapp (i.e., all tabs use the same exact worker)
   // Specifically if the service worker updates between the first tab loading to the second tab opening
   // Basically says, "Hey, look at me and forget that other SW!"
   // Since a page can only be controlled after a service worker is registered, we force ourselves
   // onto the page so that we can control future events
   return self.clients.claim();
});

// "fetch" event is used to "catch" file/resource requests
// This is called anytime a file is needed by HTML/JSS (probably CSS too if it ever needed files)
self.addEventListener('fetch', function(e) {
   console.log('[ServiceWorker] Fetch', e.request.url);
   
   // When the fetch event is sent, we need to tell the browser what to respond with
   e.respondWith(
      // We check all of our caches to see which one has the matching file requested
      // match returns a promise that resolves to the file or undefined if the file was found in one of the caches
      caches.match(e.request).then(function(response) {
         // If the file was found, return that file, otherwise try to grab the actual resource
         // since it doesn't exist in our cache
         return response || fetch(e.request);
      })
   );
});