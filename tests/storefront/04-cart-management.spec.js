import { test, expect } from '@playwright/test';

test.describe('Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
  });

  test('cart page renders without crashing', async ({ page }) => {
    // Should not show error boundary
    const errorBoundary = page.locator('[class*="error-boundary"], .error-page');
    await expect(errorBoundary).toHaveCount(0);
  });

  test('empty cart shows empty state or product list', async ({ page }) => {
    // Either an empty state message or cart items — both are valid
    const content = page.locator('.container, main, [class*="cart"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('cart page has no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });

  test('BottomNav is NOT on cart page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('.mobile-bottom-nav');
    await expect(nav).not.toBeVisible();
  });
});
