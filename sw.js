// 1. Cambiamos el nombre de la caché para forzar al S25 Ultra a borrar lo anterior
const CACHE_NAME = 'vigilancia-v56-70'; 

// 2. Lista de archivos esenciales para que funcione offline
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
];

// EVENTO DE INSTALACIÓN: Descarga los archivos nuevos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Cacheando archivos nuevos...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Fuerza a este SW a tomar el control de inmediato
});

// EVENTO DE ACTIVACIÓN: Borra TODAS las cachés viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('SW: Borrando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Toma el control de las pestañas abiertas
});

// EVENTO FETCH: Sirve los archivos desde la caché si no hay internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // Si está en caché, lo devuelve; si no, lo busca en internet
      return response || fetch(e.request);
    }).catch(() => {
      // Si falla todo (offline total y no está en caché), intenta devolver la raíz
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});