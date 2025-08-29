import { test, expect } from '@playwright/test';

test.describe('User Management - E2E Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Home page loads successfully', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveTitle(/Create Next App/);
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible();
    
    // Check main components are present
    await expect(page.getByRole('heading', { name: 'ユーザー一覧' })).toBeVisible();
    await expect(page.getByRole('button', { name: '追加' })).toBeVisible();
  });

  test('Add user page navigation and loads', async ({ page }) => {
    // Navigate to add user page
    await page.getByRole('button', { name: '追加' }).click();
    
    // Check page loads correctly
    await expect(page).toHaveURL('/users/add');
    await expect(page.getByRole('heading', { name: '新しいユーザーを追加' })).toBeVisible();
    
    // Check form elements are present
    await expect(page.getByPlaceholder('田中太郎')).toBeVisible();
    await expect(page.getByPlaceholder('example@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ユーザーを追加' })).toBeVisible();
    
    // Check navigation back works
    await expect(page.getByText('ユーザー管理に戻る')).toBeVisible();
  });

  test('User detail page navigation and loads', async ({ page }) => {
    // Wait for users to load
    await page.waitForTimeout(2000);
    
    // Check if any user exists and click first one
    const firstUser = page.locator('.cursor-pointer').first();
    await expect(firstUser).toBeVisible();
    await firstUser.click();
    
    // Check detail page loads
    await expect(page).toHaveURL(/\/users\/[a-f0-9\-]+$/);
    await expect(page.getByRole('heading', { name: 'ユーザー詳細' })).toBeVisible();
    
    // Check action buttons are present
    await expect(page.getByRole('button', { name: '編集' })).toBeVisible();
    await expect(page.getByRole('button', { name: '削除' })).toBeVisible();
    
    // Check navigation back works
    await expect(page.getByText('ユーザー管理に戻る')).toBeVisible();
  });

  test('User edit page navigation and loads', async ({ page }) => {
    // Navigate to user detail first
    await page.waitForTimeout(2000);
    const firstUser = page.locator('.cursor-pointer').first();
    await firstUser.click();
    
    // Navigate to edit page
    await expect(page.getByRole('heading', { name: 'ユーザー詳細' })).toBeVisible();
    await page.getByRole('button', { name: '編集' }).click();
    
    // Check edit page loads
    await expect(page).toHaveURL(/\/users\/[a-f0-9\-]+\/edit$/);
    await expect(page.getByRole('heading', { name: 'ユーザー編集' })).toBeVisible();
    
    // Check form elements are present
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: '変更を保存' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();
    
    // Check navigation back works
    await expect(page.getByText('ユーザー詳細に戻る')).toBeVisible();
  });

  test('All page navigation flow works', async ({ page }) => {
    // Home -> Add User -> Back to Home
    await page.getByRole('button', { name: '追加' }).click();
    await expect(page).toHaveURL('/users/add');
    await page.getByText('ユーザー管理に戻る').click();
    await expect(page).toHaveURL('/');
    
    // Home -> User Detail -> Edit -> Back to Detail -> Back to Home
    await page.waitForTimeout(2000);
    const firstUser = page.locator('.cursor-pointer').first();
    if (await firstUser.count() > 0) {
      await firstUser.click();
      await expect(page).toHaveURL(/\/users\/[a-f0-9\-]+$/);
      
      await page.getByRole('button', { name: '編集' }).click();
      await expect(page).toHaveURL(/\/users\/[a-f0-9\-]+\/edit$/);
      
      await page.getByText('ユーザー詳細に戻る').click();
      await expect(page).toHaveURL(/\/users\/[a-f0-9\-]+$/);
      
      await page.getByText('ユーザー管理に戻る').click();
      await expect(page).toHaveURL('/');
    }
  });

  test('Loading states work', async ({ page }) => {
    // Intercept API call to test loading state
    await page.route('/api/users', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/');
    
    // Check loading spinner appears
    await expect(page.locator('.animate-spin').first()).toBeVisible();
  });

  test('Error handling works', async ({ page }) => {
    // Test with network failure
    await page.route('/api/users', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Should handle gracefully (no crash)
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible();
  });

  test('Specific user detail page loads - ddc63b72-b8c4-4888-9fd2-c0a4d1c266cd', async ({ page }) => {
    // Navigate directly to specific user detail page
    await page.goto('/users/ddc63b72-b8c4-4888-9fd2-c0a4d1c266cd');
    
    // Check detail page loads
    await expect(page.getByRole('heading', { name: 'ユーザー詳細' })).toBeVisible();
    
    // Check that user name "Tsuboi" is displayed
    await expect(page.locator('h2').filter({ hasText: 'Tsuboi' })).toBeVisible();
    
    // Check action buttons are present
    await expect(page.getByRole('button', { name: '編集' })).toBeVisible();
    await expect(page.getByRole('button', { name: '削除' })).toBeVisible();
    
    // Check navigation back works
    await expect(page.getByText('ユーザー管理に戻る')).toBeVisible();
  });
});
