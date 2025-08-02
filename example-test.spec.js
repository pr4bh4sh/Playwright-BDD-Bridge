"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('User Authentication', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await page.goto('https://example.com/login');
    });
    (0, test_1.test)('should login with valid credentials', async ({ page }) => {
        await test_1.test.step('enter username', async () => {
            await page.fill('#username', 'testuser');
        });
        await test_1.test.step('enter password', async () => {
            await page.fill('#password', 'password123');
        });
        await test_1.test.step('click login button', async () => {
            await page.click('#login-button');
        });
        await test_1.test.step('verify successful login', async () => {
            await (0, test_1.expect)(page.locator('.dashboard')).toBeVisible();
        });
    });
    (0, test_1.test)('should show error with invalid credentials', async ({ page }) => {
        await test_1.test.step('enter invalid username', async () => {
            await page.fill('#username', 'invalid');
        });
        await test_1.test.step('enter invalid password', async () => {
            await page.fill('#password', 'wrong');
        });
        await test_1.test.step('click login button', async () => {
            await page.click('#login-button');
        });
        await test_1.test.step('verify error message', async () => {
            await (0, test_1.expect)(page.locator('.error-message')).toBeVisible();
        });
    });
});
//# sourceMappingURL=example-test.spec.js.map