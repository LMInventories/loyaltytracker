// v5: pages are no longer cached at all. Earlier versions kept a runtime cache
// of every visited page — including signed-in ones (balances, rewards, admin
// customer lists) — readable offline by the next person on a shared device.
// The activate handler deletes every cache except SHELL_CACHE, so bumping this
// purges those old runtime caches on existing installs.
const CACHE_VERSION = "v5";
const SHELL_CACHE = `hployalty-shell-${CACHE_VERSION}`;

// The ?v= query must match ASSET_VERSION in src/lib/asset-version.ts — this
// file is served as-is from /public and can't import that constant.
const SHELL_ASSETS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png?v=4",
  "/icons/icon-512.png?v=4",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API or auth routes — data must always be fresh.
  if (url.pathname.startsWith("/api/")) return;

  // Page navigations: network only. Pages are personalised, so they are never
  // stored; if the network is down, show the generic offline page (which is
  // precached above and contains no user data).
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  // Static assets (Next build output, icons, etc.): cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "Local Loyalty", body: "", url: "/" };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png?v=4",
      badge: "/icons/icon-192.png?v=4",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => new URL(client.url).pathname === url);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});
