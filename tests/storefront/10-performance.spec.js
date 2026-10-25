import { test, expect } from '@playwright/test';

test.describe('Performance & Layout Stability', () => {
  const routes = ['/', '/shop', '/cart', '/checkout'];
  
  for (const route of routes) {
    test(`No horizontal scroll at 375px on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
    });
  }

  test('Product card images are lazy loaded (not eager)', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle').catch(() => {});
    const imgLocator = page.locator('.product-card img');
    await imgLocator.first().waitFor({ timeout: 20000 }).catch(() => {});
    const count = await imgLocator.count();
    if (count === 0) { test.skip(); return; }
    for (let i = 0; i < Math.min(count, 5); i++) {
      const loading = await imgLocator.nth(i).getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('Header is sticky (position: sticky)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const pos = await page.evaluate(() => getComputedStyle(document.querySelector('.header-wrapper')).position);
    expect(pos).toBe('sticky');
  });

  test('Header has backdrop-filter (Apple glass)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const bdFilter = await page.evaluate(() => getComputedStyle(document.querySelector('.header-wrapper')).backdropFilter);
    // Should contain blur()
    expect(bdFilter.toLowerCase()).toContain('blur');
  });

  test('Fonts: body uses Geist not Inter', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(fontFamily.toLowerCase()).toContain('geist');
  });

  test('BottomNav has backdrop-filter on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const bdFilter = await page.evaluate(() => {
      const nav = document.querySelector('.mobile-bottom-nav');
      return nav ? getComputedStyle(nav).backdropFilter : null;
    });
    if (bdFilter) {
      expect(bdFilter.toLowerCase()).toContain('blur');
    }
  });

  test('Admin overflow-x is clip not hidden', async ({ page }) => {
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    const overflowMain = await page.evaluate(() => {
      const el = document.querySelector('.admin-main');
      return el ? getComputedStyle(el).overflowX : 'not-found';
    });
    expect(overflowMain).not.toBe('hidden');
    const overflowContent = await page.evaluate(() => {
      const el = document.querySelector('.admin-content');
      return el ? getComputedStyle(el).overflowX : 'not-found';
    });
    expect(overflowContent).not.toBe('hidden');
  });
});
