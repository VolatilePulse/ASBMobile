"use strict";var precacheConfig=[["index.html","bbb14af8f253867b55ea03663d6c6049"],["service-worker.js","e5e2772ec5e1f3600fa9e03d2b19570a"],["static/css/app.5cd7b6bf5e9db281c3b4d26ce2e64edb.css","b33c413b04013909322e3506d19a98ea"],["static/js/0.b1b6d9b6f0ca4603e4a0.js","30b3a3bc45e6e329b50589e5b6be1512"],["static/js/1.e7f15ec36eb92da5301c.js","ac9ad418566c9059c3f5a915f46da7dd"],["static/js/2.c15edac208401360b752.js","e692b37d95b417251adb387eb16d2263"],["static/js/3.8dda8898164c23a98c14.js","c3074a192c7cc8fd4ac970860bc08d9f"],["static/js/4.adc71bdf50a017a3f0cc.js","74557d0836250497bfeabf4c87fcb48d"],["static/js/5.e525c02f836932ecbd54.js","837fca11bfbc12efecff89318697fc32"],["static/js/6.b5d5a7024f12935a5483.js","257e9279e71cde9768fd0d32f34585aa"],["static/js/7.c904a35d08d2f62da558.js","50f5beae8b728d8b9c84d6e408a7e450"],["static/js/app.e5a86a2f9e11bc522e68.js","4ff2d28efbcb9aa86a8f6083ef41084a"],["static/js/manifest.7ef12b11fa458121d471.js","b9732f7d92062b08078e47cc97d71b6c"],["static/js/vendor.6391f59cfb1ecacc625e.js","0a54144f8d6a0bec5bc0b069eeddbf10"]],cacheName="sw-precache-v3-my-vue-app-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=t),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,n,a){var r=new URL(e);return a&&r.pathname.match(a)||(r.search+=(r.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(n)),r.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var n=new URL(t).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],n=e[1],a=new URL(t,self.location),r=createCacheKey(a,hashParamName,n,!1);return[a.toString(),r]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var a=new Request(n,{credentials:"same-origin"});return fetch(a).then(function(t){if(!t.ok)throw new Error("Request for "+n+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(n,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!t.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching),a="index.html";(t=urlsToCacheKeys.has(n))||(n=addDirectoryIndex(n,a),t=urlsToCacheKeys.has(n));0,t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});