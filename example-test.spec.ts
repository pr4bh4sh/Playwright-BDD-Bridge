import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('the user is on the login page', async () => {
      await page.goto('https://example.com/login');
    });
  });

  test('should login with valid credentials', async ({ page }) => {
    await test.step('enter username', async () => {
      await page.fill('#username', 'testuser');
    });

    await test.step('enter password', async () => {
      await page.fill('#password', 'password123');
    });

    await test.step('click login button', async () => {
      await page.click('#login-button');
    });

    await test.step('verify successful login', async () => {
      await expect(page.locator('.dashboard')).toBeVisible();
    });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await test.step('enter invalid username', async () => {
      await page.fill('#username', 'invalid');
    });

    await test.step('enter invalid password', async () => {
      await page.fill('#password', 'wrong');
    });

    await test.step('click login button', async () => {
      await page.click('#login-button');
    });

    await test.step('verify error message', async () => {
      await expect(page.locator('.error-message')).toBeVisible();
    });
  });
}); 
