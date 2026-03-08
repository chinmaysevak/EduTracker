// ============================================
// Service Worker for EduTracker0 PWA
// ============================================

const CACHE_NAME = 'edutracker0-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
  // Add your static assets here
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Skip waiting for activation
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - SPA-friendly offline handling
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Always let non-GET requests go to the network
  if (request.method !== 'GET') {
    return;
  }

  // Treat navigation requests (page loads, address bar, history) specially.
  // This makes the app behave correctly for routes like /dashboard, /settings, etc.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        // If network fails, fall back to cached index.html for all routes
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) return cachedIndex;

        // Last resort: plain offline text
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
    return;
  }

  // For other GET requests (CSS, JS, images), use cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});

// Background sync for data when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Sync data with localStorage
async function syncData() {
  try {
    // Get data from localStorage
    const subjects = localStorage.getItem('edu-tracker-subjects');
    const attendance = localStorage.getItem('edu-tracker-attendance-v2');
    const materials = localStorage.getItem('edu-tracker-materials');
    const tasks = localStorage.getItem('edu-tracker-tasks');
    
    // Here you can implement cloud sync
    // For now, just log that sync was attempted
    console.log('Background sync completed');
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('EduTracker0 Update', options)
  );
});

// Message handler for communication with app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
