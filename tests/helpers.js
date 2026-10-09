// Ortak test yardımcıları: three.js CDN isteklerini yerel node_modules kopyasına yönlendirir
// (testler ağdan bağımsız ve hızlı olsun diye) ve uygulamanın hazır olmasını bekler.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
export const THREE_VERSION = html.match(/three@([\d.]+)\/build\/three\.module\.js/)[1];
const threeDir = path.join(root, 'node_modules', 'three');

export async function routeThree(page) {
  await page.route(`https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/**`, (route) => {
    const rel = new URL(route.request().url()).pathname.replace(`/npm/three@${THREE_VERSION}/`, '');
    route.fulfill({
      path: path.join(threeDir, rel),
      contentType: 'text/javascript; charset=utf-8',
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  });
}

/** Konsol hatalarını toplar; testin sonunda boş olması beklenir. */
export function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

/**
 * Uygulamayı açar ve 3D sahnenin hazır olmasını bekler.
 * @param {import('@playwright/test').Page} page
 * @param {{path?: string, quality?: string, lang?: string}} [opts]
 */
export async function openApp(page, { path: url = '/', quality = 'low', lang = 'tr' } = {}) {
  await routeThree(page);
  await page.addInitScript(({ quality, lang }) => {
    // Yalnızca ilk yüklemede ayarla; sayfa yenilenince kullanıcının seçimi korunmalı
    try {
      if (sessionStorage.getItem('roman-test-init')) return;
      sessionStorage.setItem('roman-test-init', '1');
      localStorage.setItem('roman-quality', quality);
      localStorage.setItem('roman-language', lang);
    } catch { /* yok say */ }
  }, { quality, lang });
  await page.goto(url);
  await page.waitForFunction(() => window.romanApp !== undefined, null, { timeout: 60_000 });
  await page.locator('#loader').waitFor({ state: 'detached', timeout: 15_000 });
}

/** Tuvalde çizilmiş parlak piksellerin oranını döndürür (sahne boş mu diye). */
export async function litPixelRatio(page) {
  return page.evaluate(() => {
    const app = window.romanApp;
    const source = document.getElementById('scene');
    app.viewer.renderNow();
    const w = 320;
    const h = Math.round((source.height / source.width) * w);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(source, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let lit = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] > 120) lit++;
    return lit / (w * h);
  });
}
