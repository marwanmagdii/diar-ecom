import { test, expect } from '@playwright/test';

test.describe('Visual Audit & Screenshots Flow', () => {
  test('Storefront Flow', async ({ page }) => {
    // Navigate to Home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/home.png', fullPage: true });

    // Navigate to Shop
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/shop.png', fullPage: true });

    // Try to find a product and go to product page
    // Assuming there are links to products
    const productLinks = await page.locator('a[href^="/product/"]');
    if (await productLinks.count() > 0) {
      await productLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/product.png', fullPage: true });
    }

    // Cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/cart.png', fullPage: true });

    // Checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/checkout.png', fullPage: true });
  });

  test('Admin Dashboard Flow', async ({ page }) => {
    // Navigate to Admin Login
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/admin_login.png', fullPage: true });

    // We may not be able to login easily if we don't have credentials,
    // but let's try to capture the login at least.
  });
});
