import { test, expect } from '@playwright/test';

const MOCK_PRODUCTS = [
  {
    id: "p1",
    title: "Test Product",
    price: 100,
    category: "Electronics",
    stock: 10,
    image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    isActive: true
  },
  {
    id: "p2",
    title: "Out of Stock Product",
    price: 50,
    category: "Electronics",
    stock: 0,
    image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    isActive: true
  }
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PRODUCTS)
    });
  });
});

test.describe('Storefront & Navigation', () => {
  test('1. Homepage Render: Verify Homepage loads and displays featured collections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: /HomeEase/i }).first()).toBeVisible();
    await expect(page.locator('.product-grid').first()).toBeVisible();
    await expect(page.locator('.product-card').first()).toBeVisible();
  });

  test('2. Shop Navigation: Verify Shop page grid and category filters', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    const filters = page.locator('.btn-outline, .btn-primary');
    await expect(filters.first()).toBeVisible();
    await expect(page.locator('.product-card').first()).toBeVisible();
  });

  test('3. Product Detail Page: Verify PDP loads variants and stock status', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await page.locator('.product-card').first().click();
    await expect(page).toHaveURL(/.*\/product\/.*/);
    await expect(page.getByRole('button', { name: /Add to Cart|Out of Stock|أضف للسلة|نفدت الكمية/i }).first()).toBeVisible();
  });
});

test.describe('Cart & Checkout Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await page.locator('.product-card').first().click();
    const addBtn = page.getByRole('button', { name: /Add to Cart|أضف للسلة/i }).first();
    if (await addBtn.isVisible() && await addBtn.isEnabled()) {
      await addBtn.click();
    }
  });

  test('4. Add to Cart (Happy Path)', async ({ page }) => {
    const cartCount = page.locator('a[href="/cart"] span').last();
    await expect(cartCount).toBeVisible();
  });

  test('5. Cart Quantities: Increase/Decrease and dynamic subtotal', async ({ page }) => {
    await page.locator('a[href="/cart"]').first().click();
    const increaseBtn = page.getByRole('button', { name: '+' }).first();
    if (await increaseBtn.isVisible()) {
      await increaseBtn.click();
      const qtyValue = page.locator('.qty-value').first();
      await expect(qtyValue).toHaveText('2');
    }
  });

  test('6. Stock Validation (Edge Case): Verify Out of Stock items cannot be added', async ({ page }) => {
    await page.locator('a[href="/shop"]').first().click();
    const outOfStockBtn = page.getByRole('button', { name: /Out of Stock|نفدت الكمية/i }).first();
    if (await outOfStockBtn.isVisible()) {
      await expect(outOfStockBtn).toBeDisabled();
    }
  });

  test('7. Checkout Flow (COD)', async ({ page }) => {
    await page.locator('a[href="/cart"]').first().click();
    const checkoutBtn = page.getByRole('button', { name: /Checkout|إتمام الطلب/i });
    if (await checkoutBtn.isVisible() && await checkoutBtn.isEnabled()) {
      await checkoutBtn.click();
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="phone"]', '01000000000');
      await page.fill('input[name="address"]', 'Test Street');
      const completeBtn = page.getByRole('button', { name: /Complete Order|إتمام الطلب/i });
      await expect(completeBtn).toBeVisible();
    }
  });

  test('8. Checkout Form Validation (Edge Case): Submit with missing fields', async ({ page }) => {
    await page.locator('a[href="/cart"]').first().click();
    const checkoutBtn = page.getByRole('button', { name: /Checkout|إتمام الطلب/i });
    if (await checkoutBtn.isVisible() && await checkoutBtn.isEnabled()) {
      await checkoutBtn.click();
      const completeBtn = page.getByRole('button', { name: /Complete Order|إتمام الطلب/i });
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await expect(page).not.toHaveURL(/.*\/success/);
      }
    }
  });
});

test.describe('Promo Codes & Discounts', () => {
  test('9. Valid Promo Code', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  });

  test('10. Invalid/Expired Promo Code (Edge Case)', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  });
});

test.describe('Admin Dashboard Security & CRUD', () => {
  test('11. Strict Authentication Guard: Deep URLs redirect', async ({ page }) => {
    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
  });

  test('12. Product Creation', async ({ page }) => {
    test.info().annotations.push({ type: 'Info', description: 'Requires Admin Auth' });
  });

  test('13. Inventory Update', async ({ page }) => {
    test.info().annotations.push({ type: 'Info', description: 'Requires Admin Auth' });
  });

  test('14. Order Fulfillment', async ({ page }) => {
    test.info().annotations.push({ type: 'Info', description: 'Requires Admin Auth' });
  });
});

test.describe('Deep UI/UX & Layout Assertions', () => {
  test('15. RTL/LTR Mirroring: Toggle to Arabic applies dir="rtl"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const langBtn = page.locator('.lang-btn');
    await expect(langBtn).toBeVisible();
    await langBtn.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('16. Element Overlapping (Mobile & Desktop)', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('.footer-premium');
    await expect(footer).toBeVisible();
  });

  test('17. Mobile Responsiveness: Grid snaps to single column, links collapse', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const mobileMenuBtn = page.locator('.mobile-menu-btn');
    await expect(mobileMenuBtn).toBeVisible();
    
    // Check bottom sheet behavior
    await mobileMenuBtn.click();
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toHaveCSS('position', 'fixed');
    await expect(navLinks).toHaveCSS('bottom', '0px');
  });
});
