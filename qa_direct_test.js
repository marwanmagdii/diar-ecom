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
    // Mock the API response so the product is actually found!
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

    console.log('Navigating directly to Product Form on port 3005...');
    await page.goto('http://localhost:3005/admin/products/6a3873b7c4c15d2acf0f3b8a', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(3000);
    console.log('Done waiting.');
  } catch (e) {
    console.error('Test failed:', e);
  }
  
  await browser.close();
})();
