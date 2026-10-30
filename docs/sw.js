// Red primero sin caché HTTP (Pages guarda 10 min y mezclaba versiones), caché si no hay conexión. Subir versión si cambia la lista.
const CACHE = 'bam-v11';
const ARCHIVOS = ['./', 'index.html', 'app.js', 'logic.js', 'ia.js', 'manifest.json', 'icon-180.png', 'icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== location.origin) return; // clima: siempre a la red
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
