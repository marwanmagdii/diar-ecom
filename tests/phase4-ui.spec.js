import { test, expect } from '@playwright/test';

test.describe('Phase 4 - Customer Tracking & Cleanup', () => {
  test('Page view tracking operates silently', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3000/');
    
    // Wait for the tracking data to be set in localStorage
    await page.waitForTimeout(500);
    
    const trackingData = await page.evaluate(() => {
      const sessionId = localStorage.getItem('diar_session_id');
      const events = localStorage.getItem(`diar_events_${sessionId}`);
      return { sessionId, events: events ? JSON.parse(events) : [] };
    });
    
    // Tracking initialized
    expect(trackingData.sessionId).toBeTruthy();
    
    // PageTracker logs 'view_page' event on mount
    expect(trackingData.events.length).toBeGreaterThan(0);
    expect(trackingData.events[0].type).toBe('view_page');
    expect(trackingData.events[0].details.pagePath).toBe('/');
    
    // Navigate to shop
    await page.goto('http://localhost:3000/shop');
    await page.waitForTimeout(500);
    
    const trackingData2 = await page.evaluate(() => {
      const sessionId = localStorage.getItem('diar_session_id');
      const events = localStorage.getItem(`diar_events_${sessionId}`);
      return { sessionId, events: events ? JSON.parse(events) : [] };
    });
    
    // A second view_page event should be logged
    expect(trackingData2.events.length).toBeGreaterThan(1);
    expect(trackingData2.events[1].type).toBe('view_page');
    expect(trackingData2.events[1].details.pagePath).toBe('/shop');
  });
});
