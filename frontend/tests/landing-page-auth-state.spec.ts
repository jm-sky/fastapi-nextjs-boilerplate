import { test, expect } from '@playwright/test';

test.describe('Landing Page Authentication State', () => {
  test('should show Login and Register buttons when not authenticated', async ({ page }) => {
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

    // Should show both Login and Register links in topbar
    await expect(page.getByRole('navigation').getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: /register/i })).toBeVisible();

    // Should show CTA links in hero section
    await expect(page.getByRole('main').getByRole('link', { name: /get started free/i })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /sign in/i })).toBeVisible();

    // Should NOT show Dashboard button
    await expect(page.getByRole('button', { name: /dashboard/i })).not.toBeVisible();
  });

  test('should show Dashboard button when authenticated', async ({ page }) => {
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

    // Should show Dashboard button in topbar
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Dashboard' })).toBeVisible();

    // Should show Go to Dashboard link in hero
    await expect(page.getByRole('main').getByRole('link', { name: /go to dashboard/i })).toBeVisible();

    // Should show Logout button in topbar
    await expect(page.getByRole('navigation').getByRole('button', { name: /logout/i })).toBeVisible();

    // Should NOT show Login/Register buttons
    await expect(page.getByRole('button', { name: /login/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).not.toBeVisible();
  });

  test('should handle slow authentication check gracefully', async ({ page }) => {
    // Mock slow auth check to verify the page handles loading states
    await page.route('/api/auth/me', async route => {
      // Simulate slow network
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Not authenticated'
        })
      });
    });

    await page.goto('/');

    // Should eventually show login/register links (testing that it doesn't crash during loading)
    await expect(page.getByRole('navigation').getByRole('link', { name: /login/i })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('navigation').getByRole('link', { name: /register/i })).toBeVisible();

    // Verify page content is loaded
    await expect(page.getByRole('heading', { name: /welcome to saas boilerplate/i })).toBeVisible();
  });

  test('should navigate to login when Login button clicked', async ({ page }) => {
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

    // Click the login link in navigation
    await page.getByRole('navigation').getByRole('link', { name: /login/i }).click();

    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register when Register button clicked', async ({ page }) => {
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

    // Click the register link in navigation
    await page.getByRole('navigation').getByRole('link', { name: /register/i }).click();

    await expect(page).toHaveURL('/register');
  });

  test('should navigate to dashboard when Dashboard button clicked', async ({ page }) => {
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

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/');

    // Click the "Go to Dashboard" link in the hero section
    await page.getByRole('main').getByRole('link', { name: /go to dashboard/i }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('should logout and redirect to login page when Logout button clicked', async ({ page }) => {
    // Mock authenticated state initially
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

    // Mock logout endpoint
    await page.route('/api/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Logged out successfully'
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    await page.goto('/');

    // Should show Dashboard and Logout buttons initially
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: /logout/i })).toBeVisible();

    // Click logout - this will redirect to login page
    await page.getByRole('navigation').getByRole('button', { name: /logout/i }).click();

    // Should redirect to login page (this is the expected behavior)
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});