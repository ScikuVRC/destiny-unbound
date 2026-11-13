/* Destiny Unbound service worker: cache-first for the app shell so it works offline */
const CACHE = 'fatewheel-v30';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/favicon-32.png', 'icons/icon-192.png', 'css/fonts.css', 'css/base.css', 'css/themes.css', 'css/menu.css', 'css/ui.css', 'js/version.js', 'js/prefs.js', 'js/system.js', 'js/menu-data.js', 'js/menu.js', 'js/options.js', 'js/presence.js', 'js/data.js', 'js/data-more.js', 'js/data-extra.js', 'lang/es.js', 'js/i18n.js', 'js/engine.js', 'js/story.js', 'js/wheel.js', 'js/audio.js', 'js/render.js', 'js/card.js', 'js/art.js', 'js/app.js', 'js/studio.js', 'js/story-ui.js', 'js/extras.js', 'js/packs.js', 'js/achievements.js', 'js/mods.js', 'js/mods-ui.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;   // never cache or intercept calls to image generators
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r; }).catch(() => caches.match('index.html'))));
});
