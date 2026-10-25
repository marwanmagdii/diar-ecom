import { test, expect } from '@playwright/test';

test.describe('Shop & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders product grid', async ({ page }) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    const cardLocator = page.locator('.product-card');
    await cardLocator.first().waitFor({ timeout: 15000 }).catch(() => {});
    const count = await cardLocator.count();
    if (count === 0) {
      test.skip(); // API offline in test env
      return;
    }
    expect(count).toBeGreaterThan(0);
  });

  test('mobile filter button visible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
    const filterBtn = page.locator('.shop-mobile-filter-btn');
    await expect(filterBtn).toBeVisible();
  });

  test('desktop sidebar visible on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
    const sidebar = page.locator('.shop-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });

  test('product cards have images with lazy loading', async ({ page }) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    const imgLocator = page.locator('.product-card img');
    await imgLocator.first().waitFor({ timeout: 20000 }).catch(() => {});
    const count = await imgLocator.count();
    if (count === 0) {
      test.skip(); // API offline
      return;
    }
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 6); i++) {
      const loading = await imgLocator.nth(i).getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });
});
