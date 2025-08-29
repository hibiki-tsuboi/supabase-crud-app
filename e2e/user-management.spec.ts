import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the user management page', async ({ page }) => {
    await expect(page).toHaveTitle(/Create Next App/);
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible();
  });

  test('should display the create user form', async ({ page }) => {
    await expect(page.getByPlaceholder('田中太郎')).toBeVisible();
    await expect(page.getByPlaceholder('example@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ユーザーを追加' })).toBeVisible();
  });

  test('should create a new user', async ({ page }) => {
    const testUser = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`
    };

    await page.getByPlaceholder('田中太郎').fill(testUser.name);
    await page.getByPlaceholder('example@example.com').fill(testUser.email);
    await page.getByRole('button', { name: 'ユーザーを追加' }).click();

    // Wait for the user to be added to the list
    await expect(page.getByText(testUser.name)).toBeVisible();
    await expect(page.getByText(testUser.email)).toBeVisible();

    // Check that the form is cleared
    await expect(page.getByPlaceholder('田中太郎')).toHaveValue('');
    await expect(page.getByPlaceholder('example@example.com')).toHaveValue('');
  });

  test('should display existing users', async ({ page }) => {
    // Check that the users section is visible
    await expect(page.getByRole('heading', { name: 'ユーザー一覧' })).toBeVisible();
    
    // Wait for any users to load
    await page.waitForTimeout(1000);
    
    // Check that the user list container or empty message exists
    await expect(page.locator('.space-y-3').or(page.getByText('まだユーザーが登録されていません'))).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Intercept the API call to delay it
    await page.route('/api/users', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/');
    
    // Check for loading state - there are refresh icons that animate
    await expect(page.locator('.animate-spin').first()).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'ユーザーを追加' }).click();
    
    // Check that form fields are required
    await expect(page.getByPlaceholder('田中太郎')).toHaveAttribute('required');
    await expect(page.getByPlaceholder('example@example.com')).toHaveAttribute('required');
  });
});