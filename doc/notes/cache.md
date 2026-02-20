browser cache related issues are majorly due to the service worker. 
```
Your sw.js service worker is the culprit — it uses a cache-first strategy for all static assets, so it always serves stale cached .html, .css, and .js files without ever checking the network. Combined with a hardcoded CACHE_VERSION that never changes, old caches are never invalidated.

The fix involves two changes:

sw.js — switch static assets from cacheFirst → networkFirst and bump the cache version
firebase.json — add hosting section with Cache-Control: no-cache headers so browsers always revalidate
```