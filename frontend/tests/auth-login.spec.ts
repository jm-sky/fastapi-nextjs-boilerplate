import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should load login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Check if page loads correctly
    await expect(page).toHaveURL('/login');

    // Check for main page heading
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Check for login form elements (CardTitle is not a heading role) - use first() to avoid strict mode violation
    await expect(page.getByText(/sign in/i).first()).toBeVisible();
    await expect(page.getByText(/enter your email and password/i)).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Check sign up link
    await expect(page.getByText(/don't have an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for validation errors (exact messages from Zod schema)
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email and blur to trigger validation
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/email/i).blur();
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for email validation error (exact message from Zod schema)
    await expect(page.getByText('Please enter a valid email address')).toBeVisible({ timeout: 3000 });
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/login');

    // Fill valid email but short password
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for password validation error (exact message from Zod schema)
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });
});

test.describe('Login Flow', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill form with invalid credentials
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for and check error message (actual backend response)
    await expect(page.getByText('Incorrect email or password')).toBeVisible({
      timeout: 10000
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and return network error
    await page.route('/api/auth/login', route => {
      route.abort('internetdisconnected');
    });

    await page.goto('/login');

    // Fill form with valid format credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show some error message (check for common network error messages)
    await expect(
      page.getByText('An unexpected error occurred')
        .or(page.getByText('Network error'))
        .or(page.getByText('Connection failed'))
        .or(page.getByText('Request failed'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during login', async ({ page }) => {
    // Intercept API calls to simulate slow response
    await page.route('/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    await page.goto('/login');

    // Fill form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check loading state (could be either "Signing in..." or "Authenticating...")
    await expect(page.locator('button:has-text("Signing in...")').or(page.locator('button:has-text("Authenticating...")'))).toBeVisible();

    // Form fields should be disabled during loading
    await expect(page.getByLabel(/email/i)).toBeDisabled();
    await expect(page.getByLabel(/password/i)).toBeDisabled();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/login');

    // Click sign up link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Should navigate to register page
    await expect(page).toHaveURL('/register');
  });
});

test.describe('Login Success Flow (Mock)', () => {
  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock successful login response
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '01JC123456789ABCDEFGHIJK',
            email: 'test@example.com',
            name: 'Test User',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 3600
        })
      });
    });

    // Mock current user endpoint for authentication check
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

    await page.goto('/login');

    // Fill and submit form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Check dashboard content is loaded
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should maintain authentication state after refresh', async ({ page }) => {
    // Mock authentication endpoints
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

    // Set mock tokens in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    // Navigate directly to dashboard
    await page.goto('/dashboard');

    // Should stay on dashboard (not redirect to login)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Refresh page
    await page.reload();

    // Should still be authenticated and on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});