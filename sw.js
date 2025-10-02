const CACHE = 'grifts-v1';
self.addEventListener('install', evt=>{
  evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/assets/css/style.css','/assets/js/main.js'])));
});
self.addEventListener('fetch', evt=>{
  evt.respondWith(caches.match(evt.request).then(r=>r || fetch(evt.request)));
});