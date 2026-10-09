// Giriş noktası: önce arayüz ve dil hazırlanır, ardından 3D uygulama (three.js) dinamik olarak
// yüklenir. Böylece CDN'e ulaşılamasa bile kullanıcı anlaşılır bir hata mesajı görür.
import { initI18n } from './i18n.js';
import { createUI } from './ui/ui.js';

document.documentElement.classList.remove('is-file');
if (!document.fullscreenEnabled) document.documentElement.classList.add('no-fullscreen');

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

async function boot() {
  initI18n();
  const ui = createUI();
  ui.setProgress(0.15);

  if (!webglAvailable()) {
    ui.showError('error.webgl');
    return;
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let app;
  try {
    const { createApp } = await import('./app/app.js');
    ui.setProgress(0.45);
    app = await createApp({
      canvas: document.getElementById('scene'),
      stage: document.getElementById('stage'),
      reducedMotion,
      onProgress: (p) => ui.setProgress(p),
    });
  } catch (error) {
    console.error(error);
    ui.showError('error.load');
    return;
  }

  ui.connect(app);
  requestAnimationFrame(() => ui.hideLoader());
  // Geliştirici araçlarından erişim ve otomatik testler için
  window.romanApp = app;
}

boot();

// Çevrimdışı kullanım için service worker (yalnızca güvenli bağlamda)
if ('serviceWorker' in navigator && window.isSecureContext && !navigator.webdriver) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
