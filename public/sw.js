const CACHE_NAME = 'clinicpath-navigator-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/offline.html'
];

// Map-related assets to pre-cache
const MAP_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Install event - cache static assets and map data
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache map assets
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Service Worker: Caching map assets');
        return Promise.all(
          MAP_ASSETS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(err => {
              console.log('Failed to cache map asset:', url, err);
            })
          )
        );
      }),
      // Pre-fetch and cache map data
      preCacheMapData()
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle map tiles (OpenStreetMap, CartoDB, etc.)
  if (url.hostname.includes('tile.openstreetmap.org') || 
      url.hostname.includes('cartodb-basemaps') ||
      url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle Mapbox tiles and API requests
  if (url.hostname.includes('mapbox.com') || url.hostname.includes('mapbox')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle API requests (Supabase functions)
  if (url.pathname.includes('/functions/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets (CSS, JS, images)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      url.pathname.includes('leaflet')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default strategy
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache-first strategy failed:', error);
    return caches.match('/offline.html') || new Response('Offline');
  }
}

// Network-first strategy (for API calls and navigation)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network-first strategy failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline');
    }
    
    throw error;
  }
}

// Background sync for data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncMapData());
  }
});

// Pre-cache map data during installation
async function preCacheMapData() {
  try {
    console.log('Service Worker: Pre-caching map data...');
    
    // Fetch current map data
    const mapResponse = await fetch('/functions/maps-current', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (mapResponse.ok) {
      const mapData = await mapResponse.json();
      const cache = await caches.open(DYNAMIC_CACHE);
      
      // Cache the map data response
      await cache.put('/functions/maps-current', new Response(JSON.stringify(mapData), {
        headers: { 'Content-Type': 'application/json' }
      }));
      
      console.log('Service Worker: Map data pre-cached successfully');
    } else {
      console.log('Service Worker: Failed to pre-cache map data, using fallback');
      // Store fallback map data
      const fallbackData = {
        map: {
          name: "General Hospital",
          floors: [
            {
              id: "ground-floor",
              name: "Ground Floor",
              locations: [
                { id: "main-entrance", name: "Main Entrance", x: 100, y: 300, type: "entrance" },
                { id: "reception", name: "Reception", x: 200, y: 300, type: "reception" },
                { id: "emergency", name: "Emergency Room", x: 350, y: 200, type: "emergency", room: "ER-001" },
                { id: "pharmacy", name: "Pharmacy", x: 150, y: 450, type: "pharmacy", room: "PH-001" },
                { id: "cafeteria", name: "Cafeteria", x: 400, y: 400, type: "cafeteria" },
                { id: "elevator-gf", name: "Elevator", x: 300, y: 350, type: "elevator" },
                { id: "stairs-gf", name: "Stairs", x: 350, y: 350, type: "stairs" }
              ],
              connections: [
                { from: "main-entrance", to: "reception", distance: 25 },
                { from: "reception", to: "emergency", distance: 40 },
                { from: "reception", to: "pharmacy", distance: 30 },
                { from: "reception", to: "elevator-gf", distance: 20 },
                { from: "elevator-gf", to: "stairs-gf", distance: 10 },
                { from: "pharmacy", to: "cafeteria", distance: 35 }
              ]
            }
          ]
        },
        lastUpdated: new Date().toISOString()
      };
      
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put('/functions/maps-current', new Response(JSON.stringify(fallbackData), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    // Pre-cache tile server fallbacks for Leaflet
    const tileUrls = [
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
    ];
    
    // Store tile URL patterns for offline fallback
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put('/tile-patterns', new Response(JSON.stringify(tileUrls), {
      headers: { 'Content-Type': 'application/json' }
    }));
    
  } catch (error) {
    console.log('Service Worker: Pre-cache failed:', error);
  }
}

// Sync map data when back online
async function syncMapData() {
  try {
    // Try to fetch fresh map data
    const response = await fetch('/functions/maps-current', {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store in cache for offline use
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/functions/maps-current', new Response(JSON.stringify(data)));
      
      // Notify all clients about the update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'MAP_DATA_UPDATED',
          data: data
        });
      });
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}