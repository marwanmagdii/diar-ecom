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
    console.log('Navigating to Admin Products page on port 3000...');
    await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle' });
    
    console.log('Clicking on the first product edit button...');
    const editButtons = await page.$$('.btn-outline-primary');
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'C:\\Users\\MARWAN MAGDY\\.gemini\\antigravity\\brain\\cb6991fd-1358-472f-99e1-d233270a4aaa\\admin_product_click_vercel.png',
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
