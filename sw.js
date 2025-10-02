// Service Worker (Updated to v2 to force cache refresh)
const CACHE = 'grifts-v2'; 
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/main.js',
    // --- New Tool Assets Added ---
    '/tools/invoice/index.html',
    '/tools/invoice/main.js',
    '/tools/password/index.html', 
    '/tools/qr/index.html',       
    '/tools/converter/index.html',
    '/tools/meme-caption/index.html',
    // Crucial External Dependency for Invoice Generator
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js' 
];

self.addEventListener('install', evt=>{
  evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE_ASSETS)));
});

self.addEventListener('fetch', evt=>{
  evt.respondWith(caches.match(evt.request).then(r=>r || fetch(evt.request)));
});
