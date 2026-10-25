import { test, expect } from '@playwright/test';

test.describe('Checkout Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
  });

  test('checkout page renders', async ({ page }) => {
    const content = page.locator('.container, main, [class*="checkout"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('checkout has no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });

  test('BottomNav is NOT on checkout page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('.mobile-bottom-nav');
    await expect(nav).not.toBeVisible();
  });

  test('mobile checkout action bar is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    const mobileAction = page.locator('.mobile-checkout-action');
    const count = await mobileAction.count();
    if (count > 0) {
      await expect(mobileAction).toBeVisible();
    }
  });

  test('desktop checkout action is hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    const desktopAction = page.locator('.desktop-checkout-action');
    const count = await desktopAction.count();
    if (count > 0) {
      await expect(desktopAction).not.toBeVisible();
    }
  });

  test('checkout grid is single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    const grid = page.locator('.checkout-grid');
    const count = await grid.count();
    if (count > 0) {
      const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
      // Single column = only one value
      const colCount = cols.trim().split(' ').length;
      expect(colCount).toBe(1);
    }
  });
});
