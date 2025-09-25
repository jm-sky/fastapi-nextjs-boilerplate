import { test, expect } from '@playwright/test';

test.describe('Landing Page Visual Tests', () => {
  test('screenshot landing page at 1920x1080', async ({ page }) => {
    // Set viewport to 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Mock unauthenticated state
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Not authenticated'
        })
      });
    });

    await page.goto('/');

    // Wait for page to fully load
    await expect(page.getByRole('heading', { name: /welcome to saas boilerplate/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/landing-page-1920x1080.png',
      fullPage: true
    });
  });

  test('screenshot landing page authenticated state at 1920x1080', async ({ page }) => {
    // Set viewport to 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Mock authenticated state
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '01JC123456789ABCDEFGHIJK',
          email: 'test@example.com',
          name: 'Test User',
          isActive: true,
          createdAt: new Date().toISOString()
        })
      });
    });

    // Set mock tokens
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/');

    // Wait for authenticated content to load
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/landing-page-authenticated-1920x1080.png',
      fullPage: true
    });
  });
});