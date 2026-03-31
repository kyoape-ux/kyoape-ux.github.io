/* coi-serviceworker.js — Cross-Origin Isolation Service Worker
 * Injects COOP/COEP headers so SharedArrayBuffer is available on GitHub Pages.
 * Based on https://github.com/gzuidhof/coi-serviceworker
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  // Don't intercept non-GET or extension requests
  if (e.request.method !== 'GET') return;
  if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') return;

  e.respondWith(
    fetch(e.request, { credentials: 'same-origin' })
      .then(response => {
        if (!response || response.status === 0 || response.type === 'opaque') return response;
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch(e => new Response('Service worker fetch error: ' + e, { status: 500 }))
  );
});
