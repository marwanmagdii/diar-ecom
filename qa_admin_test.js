import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[Browser Error]: ${msg.text()}`);
    else console.log(`[Browser]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`[Browser Uncaught Error]: ${error.message}`);
  });

  try {
    // Mock the API response so the admin dashboard actually has products
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '6a3873b7c4c15d2acf0f3b8a',
            title: 'Mock Product',
            price: 100,
            badge: 'Best Seller',
            category: 'Electronics',
            isActive: true,
            stock: 10,
            options: []
          }
        ])
      });
    });
    // Mock the API response for auth/config so it doesn't log errors
    await page.route('**/api/config', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    });
    await page.route('**/api/orders', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    console.log('Navigating to Admin Products page on port 3005...');
    await page.goto('http://localhost:3005/admin/products', { waitUntil: 'networkidle' });
    
    console.log('Clicking on the first product edit button...');
    const editButtons = await page.$$('.btn-outline');
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'C:\\Users\\MARWAN MAGDY\\.gemini\\antigravity\\brain\\cb6991fd-1358-472f-99e1-d233270a4aaa\\admin_product_click_fixed.png',
        fullPage: true 
      });
      console.log('Screenshot saved.');
    } else {
      console.log('No edit buttons found.');
    }
  } catch (e) {
    console.error('Test failed:', e);
  }
  
  await browser.close();
})();
