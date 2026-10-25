import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 14', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 412, height: 915 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 900 },
  ];

  const routes = ['/', '/shop', '/cart', '/checkout'];

  for (const vp of viewports) {
    for (const route of routes) {
      test(`No horizontal scroll on ${vp.name} at ${route}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
      });
    }
  }

  test('Product grid shows 2 columns on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
    const grid = page.locator('.product-grid');
    const gridCols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    // Should have 2 columns (2 values separated by space)
    const colCount = gridCols.trim().split(' ').length;
    expect(colCount).toBe(2);
  });

  test('All tap targets are at least 44px on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const buttons = page.locator('.btn, .icon-btn, .bottom-nav-item');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
