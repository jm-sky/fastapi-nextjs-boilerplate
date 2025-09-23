import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
    // Mock unauthenticated response
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Not authenticated'
        })
      });
    });

    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('should show loading state while checking authentication', async ({ page }) => {
    // Mock slow authentication check
    await page.route('/api/auth/me', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Not authenticated'
        })
      });
    });

    await page.goto('/dashboard');

    // Should show loading spinner initially
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Then redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('should allow access to dashboard when authenticated', async ({ page }) => {
    // Mock authenticated response
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

    await page.goto('/dashboard');

    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Check dashboard content
    await expect(page.getByText(/welcome to your dashboard/i)).toBeVisible();
    await expect(page.getByText(/overview/i)).toBeVisible();
    await expect(page.getByText(/settings/i)).toBeVisible();
    await expect(page.getByText(/activity/i)).toBeVisible();
  });

  test('should handle token refresh during protected route access', async ({ page }) => {
    // Mock initial auth failure (expired token)
    let callCount = 0;
    await page.route('/api/auth/me', async route => {
      callCount++;
      if (callCount === 1) {
        // First call fails with 401
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Token expired'
          })
        });
      } else {
        // Second call succeeds after token refresh
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
      }
    });

    // Mock token refresh endpoint
    await page.route('/api/auth/refresh', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'new-mock-access-token',
          refreshToken: 'new-mock-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 3600
        })
      });
    });

    // Set initial tokens
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
    });

    await page.goto('/dashboard');

    // Should eventually access dashboard after token refresh
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Public Routes', () => {
  test('should allow access to home page without authentication', async ({ page }) => {
    await page.goto('/');

    // Should stay on home page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /hello/i })).toBeVisible();
  });

  test('should allow access to login page without authentication', async ({ page }) => {
    await page.goto('/login');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should redirect to dashboard if already authenticated and visiting login', async ({ page }) => {
    // Mock authenticated user
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

    // Set tokens to simulate logged in user
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/login');

    // Should redirect to dashboard since user is already authenticated
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});