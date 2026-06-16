import { test, expect } from '@playwright/test';

test.describe('SmartLeads BI App', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/login/);
    
    const loginBtn = page.locator('button', { hasText: 'Continue with Facebook' });
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should navigate to leads page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button', { hasText: 'Continue with Facebook' }).click();
    await expect(page).toHaveURL('http://localhost:5173/');

    await page.locator('a', { hasText: 'Leads' }).click();
    await expect(page).toHaveURL('http://localhost:5173/leads');
    await expect(page.locator('h1').first()).toContainText('Leads Management');
  });
  
  test('should interact with Chatbot', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button', { hasText: 'Continue with Facebook' }).click();
    await expect(page).toHaveURL('http://localhost:5173/');
    
    // Open chat
    const chatBtn = page.locator('button.fixed.bottom-6.right-6');
    await chatBtn.click();
    
    // Verify chat is open
    await expect(page.locator('h3', { hasText: 'AI Assistant' })).toBeVisible();
    
    // Type and send message
    await page.fill('input[placeholder="Ask me anything..."]', 'Hello AI!');
    await page.locator('button[type="submit"]').click();
    
    // Since backend might not be fully seeded with OpenRouter without a real key,
    // we just check if a loading bubble or response appears.
    // The user text should at least appear.
    await expect(page.locator('text=Hello AI!')).toBeVisible();
  });
});
