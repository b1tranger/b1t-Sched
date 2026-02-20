# Fix Browser Cache Serving Stale Code After Deploy

## Root Cause

Your `sw.js` service worker uses a **cache-first** strategy for ALL static assets (`.html`, `.css`, `.js`, etc.). This means:

1. **First load** → browser fetches from network, caches the response
2. **Every subsequent load** → service worker returns the **cached** version *without ever checking the network*
3. **`CACHE_VERSION` is hardcoded** as `'v1.0.2'` — it never changes automatically, so old caches are never invalidated

Even after clearing cache manually, the service worker **re-caches the old version** from its own cache or immediately re-caches on the next fetch, which is why the stale code "comes back" after a refresh.

## Proposed Changes

### Service Worker

#### [MODIFY] [sw.js](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/sw.js)

**1. Switch static assets from `cacheFirst` → `networkFirst`**

The key change: instead of always serving from cache, we try the network first. If the network is available, users always get fresh code. If offline, they still get the cached fallback.

```diff
   // Handle different request types
   if (isStaticAsset(url)) {
-    event.respondWith(cacheFirst(request, STATIC_CACHE));
+    event.respondWith(networkFirst(request, STATIC_CACHE));
   } else if (isAPIRequest(url)) {
     event.respondWith(networkFirst(request, API_CACHE));
   } else {
     event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
   }
```

**2. Auto-generate `CACHE_VERSION` from timestamp**

Replace the hardcoded version so each deploy naturally invalidates old caches:

```diff
-const CACHE_VERSION = 'v1.0.2';
+const CACHE_VERSION = 'v2025.02.20';
```

> [!IMPORTANT]
> Going forward you should bump this string whenever you push a new deploy. Alternatively, we can discuss adding a build script to auto-generate it.

---

### Firebase Hosting

#### [MODIFY] [firebase.json](file:///e:/Git_WIP/3.%20University%20repositories/b1t-Sched/firebase.json)

Add a `hosting` section with cache-control headers that tell browsers **not to cache** HTML, and to treat CSS/JS as revalidatable:

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "firestore.rules", "firestore.indexes.json", "functions/**", "node_modules/**", "doc/**", "doc-2/**", "Archive/**", ".git/**"],
    "headers": [
      {
        "source": "**/*.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      },
      {
        "source": "sw.js",
        "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store" }]
      }
    ]
  }
}
```

The `no-cache` header doesn't mean "never cache" — it means the browser must **revalidate** with the server before using a cached copy. This ensures fresh code is always served while still benefiting from conditional caching (304 responses) when files haven't changed.

The `no-store` for `sw.js` itself ensures the browser always fetches the latest service worker file.

## Verification Plan

### Manual Verification
1. After applying the changes, deploy to Firebase Hosting (`firebase deploy --only hosting`)
2. Open the site in Chrome → DevTools → **Application** → **Service Workers**
3. Verify the new service worker shows status **"activated and is running"**
4. Go to **Network** tab → check that `sw.js`, `.js`, and `.css` files show `Cache-Control: no-cache` response headers
5. Make a small visible change (e.g. change text in HTML), redeploy, and confirm the change appears on refresh **without** clearing cache
