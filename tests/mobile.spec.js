import { test, expect } from '@playwright/test';
import { openApp, collectErrors } from './helpers.js';

test('telefon düzeni: alt araç çubuğu ve alt sayfa paneli', async ({ page }) => {
  const errors = collectErrors(page);
  await openApp(page);
  const viewport = page.viewportSize();
  const toolbar = await page.locator('.toolbar').boundingBox();
  expect(toolbar.y).toBeGreaterThan(viewport.height * 0.75);
  await expect(page.locator('.brand__short')).toBeVisible();

  await page.locator('.tool[data-action="parts"]').tap();
  await page.locator('.part-item[data-part="sass"]').tap();
  const panel = await page.locator('#info-panel').boundingBox();
  // Bilgi paneli ekranın altından açılan bir "alt sayfa" olur
  expect(panel.y + panel.height).toBeGreaterThan(viewport.height - 2);
  expect(panel.width).toBeGreaterThan(viewport.width - 2);
  await expect(page.locator('#info-title')).toHaveText('Güneş Paneli Kalkanı (SASS)');
  expect(errors).toEqual([]);
});
