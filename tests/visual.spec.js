import { test, expect } from '@playwright/test';

test.describe('Visual & Functional Testing: Full Flows', () => {

  test.describe('Customer Flow: Shop, Cart, and Checkout', () => {
    test.setTimeout(60000); // 60 seconds
    test('Should functionally navigate the shop, add to cart, and visually match at each step', async ({ page }) => {
      // 1. Homepage
      await page.goto('/');
      await page.waitForSelector('main', { state: 'visible', timeout: 10000 });
      await expect(page).toHaveScreenshot('01-homepage.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 2. Shop Page
      await page.goto('/shop');
      // Wait for shop layout to be visible
      await page.waitForSelector('.shop-main', { state: 'visible', timeout: 15000 });
      // Give time for products to load if any
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('02-shop-page.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 3. Add to Cart (using first available "Add to Cart" button)
      const addToCartBtn = page.locator('.product-card .btn-add-cart, .product-card button[aria-label="Increase"]').first();
      
      // If products exist, add to cart
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        await page.waitForSelector('.cart-counter', { state: 'visible', timeout: 5000 });
        await expect(page.locator('.cart-counter').first()).toBeVisible();
          
        // Take screenshot of Shop page with item added
        await expect(page).toHaveScreenshot('03-shop-item-added.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
      }

      // 4. Navigate to Cart Page
      await page.goto('/cart');
      await page.waitForSelector('.cart-layout, .empty-cart-state', { state: 'visible', timeout: 10000 });
      await expect(page).toHaveScreenshot('04-cart-page.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 5. Checkout Page
      await page.goto('/checkout');
      await page.waitForSelector('main.container', { state: 'visible', timeout: 10000 });
      await expect(page).toHaveScreenshot('05-checkout-page.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
    });
  });

  test.describe('Admin Flow: All Dashboards and Pages', () => {
    test('Should functionally log in and visually capture all admin sections', async ({ page }) => {
      // 1. Admin Login
      await page.goto('/diaradmin26');
      await page.waitForSelector('form', { state: 'visible', timeout: 10000 });
      await expect(page).toHaveScreenshot('06-admin-login.png', { maxDiffPixelRatio: 0.05 });

      // Perform Login
      await page.fill('input[type="text"]', 'marwan');
      await page.fill('input[type="password"]', 'Marwan@Diar2026!');
      await page.click('button[type="submit"]');

      // 2. Main Dashboard
      await page.waitForURL('**/diaradmin26', { timeout: 10000 });
      await page.waitForSelector('.admin-main', { state: 'visible' });
      await page.waitForSelector('.spinner', { state: 'hidden' });
      await expect(page).toHaveScreenshot('07-admin-dashboard.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 3. Orders Page
      await page.goto('/diaradmin26/orders');
      await page.waitForSelector('table, .empty-state', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('.spinner', { state: 'hidden' });
      await expect(page).toHaveScreenshot('08-admin-orders.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 4. Products Page
      await page.goto('/diaradmin26/products');
      await page.waitForSelector('table, .empty-state', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('.spinner', { state: 'hidden' });
      await expect(page).toHaveScreenshot('09-admin-products.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 5. Users Page
      await page.goto('/diaradmin26/users');
      await page.waitForSelector('table, .empty-state', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('.spinner', { state: 'hidden' });
      await expect(page).toHaveScreenshot('10-admin-users.png', { fullPage: true, maxDiffPixelRatio: 0.05 });

      // 6. Influencers Page
      await page.goto('/diaradmin26/influencers');
      await page.waitForSelector('table, .empty-state', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('.spinner', { state: 'hidden' });
      await expect(page).toHaveScreenshot('11-admin-influencers.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
      
      // 7. Settings Page
      await page.goto('/diaradmin26/settings/general');
      await page.waitForSelector('.headline-sm', { state: 'visible', timeout: 10000 });
      await expect(page).toHaveScreenshot('12-admin-settings.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
    });
  });

});
