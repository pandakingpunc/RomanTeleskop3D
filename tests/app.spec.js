import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openApp, collectErrors, litPixelRatio, THREE_VERSION } from './helpers.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test.describe('Roman Teleskop 3D', () => {
  test('yüksek kalitede hatasız açılır ve modeli çizer', async ({ page }) => {
    const errors = collectErrors(page);
    await openApp(page, { quality: 'high' });
    await expect(page.locator('.brand__long')).toHaveText('Nancy Grace Roman Uzay Teleskobu');
    await expect(page.locator('.hotspot').first()).toBeAttached();
    expect(await litPixelRatio(page)).toBeGreaterThan(0.03);
    expect(errors).toEqual([]);
  });

  test('dil değişimi arayüzü, başlığı ve URL dışı tercihi günceller', async ({ page }) => {
    await openApp(page);
    await page.click('[data-lang="en"]');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Roman Space Telescope 3D');
    await expect(page.locator('[data-action="tour"] span')).toHaveText('Guided tour');
    await page.reload();
    await page.waitForFunction(() => window.romanApp !== undefined);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('parça listesinden seçim bilgi panelini açar ve bağlantıyı günceller', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="parts"]');
    await expect(page.locator('#parts-panel')).toBeVisible();
    await expect(page.locator('.part-item')).toHaveCount(18);
    await page.click('.part-item[data-part="wfi"]');
    await expect(page.locator('#info-title')).toHaveText('Geniş Alan Aleti (WFI)');
    await expect(page).toHaveURL(/#part=wfi$/);
    await page.click('[data-action="next-part"]');
    await expect(page.locator('#info-title')).toHaveText('Eleman Tekerleği');
    // İç parça seçilince kesit görünümü kendiliğinden açılır
    await expect(page.locator('.tool[data-action="inside"]')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#info-panel')).toBeHidden();
    await expect(page).not.toHaveURL(/#/);
  });

  test('doğrudan bağlantı (#part=primary) parçayı açar', async ({ page }) => {
    await openApp(page, { path: '/#part=primary' });
    await expect(page.locator('#info-title')).toHaveText('Birincil Ayna');
    expect(await page.evaluate(() => window.romanApp.state.inside)).toBe(true);
  });

  test('3D sahnede tıklama parçayı seçer', async ({ page }) => {
    await openApp(page);
    await page.waitForTimeout(2600); // açılış kamera hareketi
    const box = await page.locator('#scene').boundingBox();
    // Ekranın ortası gözlemevinin gövdesine denk gelir
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(page.locator('#info-panel')).toBeVisible();
    expect(await page.evaluate(() => window.romanApp.state.selected)).not.toBeNull();
  });

  test('klavye kısayolları modları açıp kapatır', async ({ page }) => {
    await openApp(page);
    await page.locator('body').press('i');
    await expect(page.locator('.tool[data-action="inside"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('body').press('m');
    await expect(page.locator('.tool[data-action="dims"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.dim-label').first()).toBeVisible();
    await page.locator('body').press('h');
    await expect(page.locator('.tool[data-action="labels"]')).toHaveAttribute('aria-pressed', 'false');
    await page.locator('body').press('e');
    await expect.poll(() => page.evaluate(() => window.romanApp.state.explodeTarget)).toBe(1);
    // Patlatma kesit görünümünü kapatır
    await expect(page.locator('.tool[data-action="inside"]')).toHaveAttribute('aria-pressed', 'false');
    await page.locator('body').press('?');
    await expect(page.locator('#help-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-dialog')).toBeHidden();
  });

  test('ışık yolu anlatımı adım adım ilerler', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="light"]');
    await expect(page.locator('#player')).toBeVisible();
    await expect(page.locator('#player-count')).toHaveText('1 / 5');
    await expect(page).toHaveURL(/#light$/);
    await page.click('[data-action="player-next"]');
    await expect(page.locator('#player-count')).toHaveText('2 / 5');
    expect(await page.evaluate(() => window.romanApp.state.lightStep)).toBe(2);
    await page.click('[data-action="player-close"]');
    await expect(page.locator('#player')).toBeHidden();
    expect(await page.evaluate(() => window.romanApp.state.light)).toBe(false);
  });

  test('uzayda açılış dizisi modeli katlayıp yeniden açar', async ({ page }) => {
    await openApp(page);
    await page.locator('body').press('d');
    await expect(page.locator('#player-count')).toHaveText('1 / 4');
    await expect.poll(() => page.evaluate(() => window.romanApp.state.deploy), { timeout: 20_000 }).toBeLessThan(0.01);
    await page.click('[data-action="player-close"]');
    await expect.poll(() => page.evaluate(() => window.romanApp.state.deploy), { timeout: 20_000 }).toBeGreaterThan(0.99);
  });

  test('rehberli tur başlar ve kullanıcı seçimiyle sona erer', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="tour"]');
    await expect(page.locator('#player-count')).toHaveText('1 / 10');
    await page.click('[data-action="player-next"]');
    await expect.poll(() => page.evaluate(() => window.romanApp.state.selected)).toBe('sass');
    await page.click('.tool[data-action="parts"]');
    await page.click('.part-item[data-part="antenna"]');
    await expect(page.locator('#player')).toBeHidden();
    await expect(page.locator('#info-title')).toHaveText('Yüksek Kazançlı Anten');
  });

  test('görev, görüş alanı ve L2 panelleri içerik gösterir', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="mission"]');
    await expect(page.locator('#info-title')).toHaveText('Roman ne yapacak?');
    await expect(page.locator('.timeline li')).toHaveCount(11);
    await expect(page.locator('.survey')).toHaveCount(4);
    await page.click('.tool[data-action="fov"]');
    await expect(page.locator('.figure svg .fov-chip')).toHaveCount(18);
    await page.click('.tool[data-action="l2"]');
    await expect(page.locator('#info-title')).toHaveText('Güneş–Dünya L2 Noktası');
    await page.click('[data-action="settings"]');
    await page.click('[data-action="about"]');
    await expect(page.locator('.sources a').first()).toHaveAttribute('href', /^https:\/\//);
  });

  test('ekran görüntüsü PNG olarak indirilir', async ({ page }) => {
    await openApp(page);
    const download = page.waitForEvent('download');
    await page.click('[data-action="screenshot"]');
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^roman-teleskop-\d{4}-\d{2}-\d{2}\.png$/);
  });

  test('tüm düğmelerin erişilebilir bir adı vardır', async ({ page }) => {
    await openApp(page);
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('button')]
      .filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim() || b.title))
      .map((b) => b.outerHTML.slice(0, 80)));
    expect(unnamed).toEqual([]);
  });

  test('file:// ile açılınca yönlendirme mesajı gösterilir', async ({ page }) => {
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await expect(page.locator('.loader__file')).toBeVisible();
  });
});

test.describe('regresyon', () => {
  test('tur, iç parçadan dış parçaya geçerken kendiliğinden bitmez', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="tour"]');
    for (let i = 0; i < 6; i++) await page.click('[data-action="player-next"]');
    await expect(page.locator('#player-count')).toHaveText('7 / 10');
    await expect.poll(() => page.evaluate(() => window.romanApp.state.selected)).toBe('cgi');
    await expect(page.locator('#player')).toBeVisible();
  });

  test('bozuk bir bağlantı yükleme ekranını kilitlemez', async ({ page }) => {
    await openApp(page, { path: '/#%E0%A4' });
    await expect(page.locator('.toolbar')).toBeVisible();
  });

  test('ışık yolu sırasında patlatma anlatımı da kapatır', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="light"]');
    await expect(page.locator('#player')).toBeVisible();
    await page.locator('body').press('e');
    await expect(page.locator('#player')).toBeHidden();
    await expect(page.locator('.tool[data-action="light"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('seçim yokken ← son parçayı seçer', async ({ page }) => {
    await openApp(page);
    await page.locator('body').press('ArrowLeft');
    await expect.poll(() => page.evaluate(() => window.romanApp.state.selected)).toBe('antenna');
  });

  test('atlama bağlantısı açık parça listesini kapatmaz', async ({ page }) => {
    await openApp(page);
    await page.click('.tool[data-action="parts"]');
    await page.locator('.skip-link').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#parts-panel')).toBeVisible();
  });

  test('patlatma boyut çizgilerini kapatır', async ({ page }) => {
    await openApp(page);
    await page.locator('body').press('m');
    await expect(page.locator('.tool[data-action="dims"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('body').press('e');
    await expect(page.locator('.tool[data-action="dims"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('?lang= adresi dil değişince güncellenir', async ({ page }) => {
    await openApp(page, { path: '/?lang=en' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.click('[data-lang="tr"]');
    await expect(page).toHaveURL(/\?lang=tr/);
  });
});

test.describe('proje bütünlüğü', () => {
  test('service worker önbellek listesindeki dosyalar mevcut', () => {
    const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
    const shell = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
    expect(shell.length).toBeGreaterThan(10);
    for (const file of shell) expect(fs.existsSync(path.join(root, file)), file).toBe(true);
    const cdn = [...sw.matchAll(/'((?:build|examples)\/[^']+)'/g)].map((m) => m[1]);
    for (const file of cdn) expect(fs.existsSync(path.join(root, 'node_modules/three', file)), file).toBe(true);
    expect(sw).toContain(`three@${THREE_VERSION}`);
  });

  test('her JS modülü service worker listesinde yer alır', () => {
    const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
    for (const file of walk(path.join(root, 'js'))) {
      const rel = `./${path.relative(root, file).split(path.sep).join('/')}`;
      expect(sw, rel).toContain(`'${rel}'`);
    }
  });

  test('node_modules içindeki three sürümü importmap ile aynı', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/three/package.json'), 'utf8'));
    expect(pkg.version).toBe(THREE_VERSION);
  });

  test('her parçanın iki dilde içeriği ve 3D karşılığı var', async () => {
    const { PARTS, PART_ORDER } = await import('../js/content/parts.js');
    expect(PART_ORDER.length).toBe(Object.keys(PARTS).length);
    for (const id of PART_ORDER) {
      for (const lang of ['tr', 'en']) {
        const text = PARTS[id][lang];
        expect(text?.name, `${id}.${lang}.name`).toBeTruthy();
        expect(text?.desc, `${id}.${lang}.desc`).toBeTruthy();
        expect(text?.facts?.length, `${id}.${lang}.facts`).toBeGreaterThan(1);
        if (PARTS[id].tr.specs) expect(text.specs?.length, `${id}.${lang}.specs`).toBe(PARTS[id].tr.specs.length);
      }
    }
  });

  test('arayüz metinleri iki dilde de tam', async () => {
    const { UI_STRINGS } = await import('../js/content/ui-strings.js');
    const tr = Object.keys(UI_STRINGS.tr).sort();
    const en = Object.keys(UI_STRINGS.en).sort();
    expect(en).toEqual(tr);
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const used = [...html.matchAll(/data-i18n="([^"]+)"/g), ...html.matchAll(/:([a-z]+\.[A-Za-z]+)/g)].map((m) => m[1]);
    for (const key of used) expect(tr, key).toContain(key);
  });
});
