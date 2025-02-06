const CACHE_VERSION = new Date().toISOString().split('T')[0]; // Auto-version based on date
const CACHE_NAME = `pwa-cache-${CACHE_VERSION}`;
const ASSETS = ['/', '/index.html', '/root.css', '/core.css', '/core.js', '/support.js', '/manifest.json', '/icons/favicon.png', '/assets/fonts/Playfair.ttf', '/assets/fonts/Nunito.ttf', '/assets/fonts/CourierPrime.ttf', '/assets/fonts/Roboto.ttf'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		})
	);
	self.skipWaiting(); // Forces immediate activation
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
		})
	);
	self.clients.claim(); // Forces all clients to use the new version immediately
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				return caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, response.clone());
					return response;
				});
			})
			.catch(() => caches.match(event.request)) // Serve from cache if offline
	);
});

// Auto-update all open instances of the PWA
self.addEventListener('controllerchange', () => {
	self.clients.matchAll().then((clients) => {
		clients.forEach((client) => client.navigate(client.url));
	});
});
