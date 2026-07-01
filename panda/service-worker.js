self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // Biarkan request lewat tanpa caching untuk sementara
  e.respondWith(fetch(e.request));
});
