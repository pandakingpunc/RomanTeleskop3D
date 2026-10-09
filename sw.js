// Service worker: modeli bir kez açtıktan sonra çevrimdışı da çalışmasını sağlar.
// - Kendi dosyalarımız: önce ağ, ağ yoksa önbellek (güncellemeler hemen görünür).
// - three.js (sürüm sabitlenmiş CDN adresi): önce önbellek (dosyalar hiç değişmez).
// Yeni bir sürüm yayınlarken VERSION değerini artırın.
const VERSION = '2.0.0';
const SHELL_CACHE = `roman-shell-${VERSION}`;
const CDN_CACHE = 'roman-cdn-three-0.186.1';
const CDN_PREFIX = 'https://cdn.jsdelivr.net/npm/three@0.186.1/';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/i18n.js',
  './js/content/ui-strings.js',
  './js/content/parts.js',
  './js/content/mission.js',
  './js/content/sequences.js',
  './js/ui/ui.js',
  './js/ui/panels.js',
  './js/ui/player.js',
  './js/ui/diagrams.js',
  './js/app/app.js',
  './js/app/viewer.js',
  './js/app/environment.js',
  './js/app/textures.js',
  './js/app/materials.js',
  './js/app/model.js',
  './js/app/camera-rig.js',
  './js/app/cutaway.js',
  './js/app/lightpath.js',
  './js/app/annotations.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
];

// Uygulamanın kullandığı three.js modülleri (eklentilerin bağımlılıkları dahil)
const CDN_FILES = [
  'build/three.module.js',
  'build/three.core.js',
  'examples/jsm/controls/OrbitControls.js',
  'examples/jsm/environments/RoomEnvironment.js',
  'examples/jsm/postprocessing/EffectComposer.js',
  'examples/jsm/postprocessing/MaskPass.js',
  'examples/jsm/postprocessing/OutputPass.js',
  'examples/jsm/postprocessing/Pass.js',
  'examples/jsm/postprocessing/RenderPass.js',
  'examples/jsm/postprocessing/ShaderPass.js',
  'examples/jsm/postprocessing/UnrealBloomPass.js',
  'examples/jsm/renderers/CSS2DRenderer.js',
  'examples/jsm/shaders/CopyShader.js',
  'examples/jsm/shaders/LuminosityHighPassShader.js',
  'examples/jsm/shaders/OutputShader.js',
  'examples/jsm/utils/BufferGeometryUtils.js',
].map((file) => CDN_PREFIX + file);

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)),
      // CDN dosyaları önbelleğe alınamazsa kurulum yine de tamamlansın
      caches.open(CDN_CACHE).then((cache) => cache.addAll(CDN_FILES)).catch(() => {}),
    ]).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('roman-') && key !== SHELL_CACHE && key !== CDN_CACHE).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.url.startsWith(CDN_PREFIX)) {
    event.respondWith(
      caches.open(CDN_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request, { ignoreSearch: true })) ?? caches.match('./index.html')),
    );
  }
});
