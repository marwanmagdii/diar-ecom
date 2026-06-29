import { test, expect } from '@playwright/test';

test.describe('Phase 1 - Zustand UI Slices', () => {
  test('Language toggle and StoreConfig render', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3000/');

    const shopLink = page.locator('text=Shop').first();
    await expect(shopLink).toBeVisible();

    const langToggle = page.locator('button:has-text("عربي"), button:has-text("EN")').first();
    await expect(langToggle).toBeVisible();
    await langToggle.click();
    const shopLinkAr = page.locator('text=التسوق').first();
    await expect(shopLinkAr).toBeVisible();
  });

  test('Toast notification triggers', async ({ page }) => {
    await page.goto('http://localhost:3000/shop');
    // Wait for products to load
    await page.waitForSelector('.product-card', { timeout: 10000 });
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("أضف للسلة")').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    const toast = page.locator('.toast').first();
    await expect(toast).toBeVisible();
  });
});
