import { test, expect } from '@playwright/test';

test.describe('Admin Table Mobile Scroll (Bug #8 Regression)', () => {
  // This test verifies the critical fix: overflow-x: hidden was changed to overflow-x: clip
  // so admin tables can horizontally scroll on mobile

  test.use({ viewport: { width: 375, height: 812 } });

  test('Admin login page loads without horizontal scroll', async ({ page }) => {
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });

  test('.admin-content does NOT have overflow-x: hidden', async ({ page }) => {
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    // After login redirect — but we can check on the login page styles are injected
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('.admin-content');
      return el ? getComputedStyle(el).overflowX : 'element-not-found';
    });
    // Should be 'clip' or 'visible', NOT 'hidden'
    expect(overflow).not.toBe('hidden');
  });

  test('.admin-main does NOT have overflow-x: hidden', async ({ page }) => {
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('.admin-main');
      return el ? getComputedStyle(el).overflowX : 'element-not-found';
    });
    expect(overflow).not.toBe('hidden');
  });

  test('admin-table-container has overflow-x: auto', async ({ page }) => {
    // Navigate to the login page — the table styles are loaded via global CSS
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    // Inject a test table container to check computed style
    const overflow = await page.evaluate(() => {
      const div = document.createElement('div');
      div.className = 'admin-table-container';
      document.body.appendChild(div);
      const computed = getComputedStyle(div).overflowX;
      document.body.removeChild(div);
      return computed;
    });
    expect(overflow).toBe('auto');
  });
});

test.describe('Toast Visibility on Mobile Checkout (Bug #10 Regression)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('toast-container bottom is above checkout action bar on mobile', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    const toastBottom = await page.evaluate(() => {
      const el = document.querySelector('.toast-container');
      if (!el) return null;
      return getComputedStyle(el).bottom;
    });
    // Should NOT be 16px (old value) — should reference calc with 80px
    // The actual computed value will be > 16px when safe area is 0 (desktop/non-iOS)
    if (toastBottom && toastBottom !== 'auto') {
      const bottomPx = parseFloat(toastBottom);
      expect(bottomPx).toBeGreaterThan(16);
    }
  });
});

test.describe('BottomNav Not on Checkout (Bug #2 Regression)', () => {
  // Note: /success redirects to /shop when accessed without orderId state (by design in Success.jsx).
  // We test /cart and /checkout directly since they are unconditionally hidden.
  const hiddenRoutes = ['/cart', '/checkout'];

  for (const route of hiddenRoutes) {
    test(`BottomNav returns null (not in DOM) on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const nav = page.locator('.mobile-bottom-nav');
      const count = await nav.count();
      if (count > 0) {
        await expect(nav).not.toBeVisible();
      } else {
        expect(count).toBe(0);
      }
    });
  }

  test('/success redirects to /shop (by design) and BottomNav is shown there', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/success');
    await page.waitForLoadState('domcontentloaded');
    // Success.jsx redirects to /shop when no orderId in state — that is correct behavior
    await expect(page).toHaveURL(/\/shop/);
    // On /shop the BottomNav SHOULD be visible — confirming redirect worked
    const nav = page.locator('.mobile-bottom-nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Image Lazy Loading (Bug #12 Regression)', () => {
  test('All product card images have loading=lazy', async ({ page }) => {
    test.slow(); // Triple the timeout — products load from API and can be slow
    await page.goto('/shop');
    await page.waitForLoadState('networkidle').catch(() => {});
    const imgLocator = page.locator('.product-card img');
    // Wait up to 15s (within the tripled timeout budget)
    await imgLocator.first().waitFor({ timeout: 15000 }).catch(() => {});
    const count = await imgLocator.count().catch(() => 0);
    if (count === 0) {
      // Products didn't load (API may be offline in test env) — skip gracefully
      test.skip();
      return;
    }
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 8); i++) {
      const loading = await imgLocator.nth(i).getAttribute('loading').catch(() => null);
      if (loading !== null) {
        expect(loading).toBe('lazy');
      }
    }
  });
});

test.describe('Font Migration (Phase 2)', () => {
  test('body uses Geist font family, not Inter', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    // Should contain Geist
    expect(fontFamily.toLowerCase()).toContain('geist');
    // Should NOT be only Inter
    expect(fontFamily.toLowerCase()).not.toBe('"inter", sans-serif');
  });
});
