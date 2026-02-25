const CACHE_NAME = "clipper-v1";
const STATIC_ASSETS = [
    "/",
    "/auth/signin",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// Install
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip API routes (except for offline task viewing)
    if (request.url.includes("/api/")) {
        // Cache GET /api/tasks responses for offline viewing
        if (request.url.includes("/api/tasks") && !request.url.includes("/api/tasks/")) {
            event.respondWith(
                fetch(request)
                    .then((response) => {
                        const cloned = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, cloned);
                        });
                        return response;
                    })
                    .catch(() => caches.match(request))
            );
            return;
        }
        return;
    }

    // For pages: network first, cache fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                const cloned = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, cloned);
                });
                return response;
            })
            .catch(() => caches.match(request))
    );
});

