"use strict";var precacheConfig=[["index.html","ddbd436d61bd83fbe0e1f3d182aaf3d6"],["static/css/app.8852f0041be9ef667600e66d66b4d4a0.css","5f3c30887ddcd18847c19ff400566559"],["static/js/0.91af488243b78fbee510.js","cf0f3d07684c3be6e0b0fcf2fdadcecb"],["static/js/1.8e1a1dd0ce9034febe48.js","ceda462f4b232e3d4ca3226d389a2414"],["static/js/2.976437887b97bb34ed3c.js","370f530c0164cd0b5c64d2559df0f08e"],["static/js/3.765f82b628530f2298aa.js","787e593a18cb36dd12c54a2738e90a4c"],["static/js/4.736b0031ded3fdab3197.js","ece779333dc3e516ba1ce0f82d39bc56"],["static/js/5.14eadcdd96237c32685f.js","41ec0f97858bb64bc9de1905e96c0b40"],["static/js/6.e45daf174c34e8b5ce20.js","db2f9d364241f8483a91179ea30bacb2"],["static/js/7.5e2a2e00eabc1e5c4549.js","403222728d070fb0640eadddc9c72c3a"],["static/js/8.7d7d1e9ad60443354bdf.js","d1c94b26d252966ed0fd150f11102e57"],["static/js/app.c33938c56fa75debc142.js","dace0748d0478afa97aa25d80c88166b"],["static/js/manifest.0d801238c675cfa43606.js","6dc6ea165a934f3fa4204c5fc4833ec3"],["static/js/vendor.a62e840da99576af5a54.js","92fabf48ee2b145603f63b2db5064d86"]],cacheName="sw-precache-v3-my-vue-app-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=t),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,n,a){var r=new URL(e);return a&&r.pathname.match(a)||(r.search+=(r.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(n)),r.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var n=new URL(t).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],n=e[1],a=new URL(t,self.location),r=createCacheKey(a,hashParamName,n,!1);return[a.toString(),r]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var a=new Request(n,{credentials:"same-origin"});return fetch(a).then(function(t){if(!t.ok)throw new Error("Request for "+n+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(n,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!t.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching),a="index.html";(t=urlsToCacheKeys.has(n))||(n=addDirectoryIndex(n,a),t=urlsToCacheKeys.has(n));0,t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});