// SW v3: Limpieza Profunda y Refuerzo Offline para iOS y S25
const CACHE_NAME = 'vigilancia-ultra-safe-v3 v85.00'; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
];

// INSTALACIÓN: Cachear todo de inmediato
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW v3: Cacheando Archivos...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Forzar activación
});

// ACTIVACIÓN: Borrar CUALQUIER caché vieja agresivamente
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('SW v3: Borrando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Toma el control de las pestañas abiertas de inmediato
  return self.clients.claim(); 
});

// ESTRATEGIA FETCH: Prioridad Caché (para Offline confiable)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // Devuelve caché si existe, sino va a red
      return response || fetch(e.request);
    }).catch(() => {
      // Fallback para navegación offline si no está en caché
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});