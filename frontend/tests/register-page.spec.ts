import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test('should load register page correctly', async ({ page }) => {
    await page.goto('/register');

    // Check if page loads correctly
    await expect(page).toHaveURL('/register');

    // Check for main page heading
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    // Check for register form elements
    await expect(page.getByText(/join us today/i)).toBeVisible();
    await expect(page.getByText(/sign up/i).first()).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();

    // Check sign in link
    await expect(page.getByText(/already have an account/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for validation errors (exact messages from Zod schema)
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/register');

    // Fill invalid email
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for email validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/register');

    // Fill valid fields but short password
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for password validation error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('should show validation error for name too short', async ({ page }) => {
    await page.goto('/register');

    // Fill valid fields but short name
    await page.getByLabel(/name/i).fill('A');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for name validation error
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
  });
});

test.describe('Register Flow', () => {
  test('should show error for existing email', async ({ page }) => {
    await page.goto('/register');

    // Mock register API to return conflict error
    await page.route('/api/auth/register', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'User with this email already exists'
        })
      });
    });

    // Fill form with existing email
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('existing@example.com');
    await page.getByLabel(/password/i).fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for and check error message
    await expect(page.getByText('User with this email already exists')).toBeVisible({
      timeout: 10000
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and return network error
    await page.route('/api/auth/register', route => {
      route.abort('internetdisconnected');
    });

    await page.goto('/register');

    // Fill form with valid credentials
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show generic error message
    await expect(page.getByText('An unexpected error occurred')).toBeVisible({
      timeout: 10000
    });
  });

  test('should show loading state during registration', async ({ page }) => {
    // Intercept API calls to simulate slow response
    await page.route('/api/auth/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    await page.goto('/register');

    // Fill form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Check loading state
    await expect(page.getByRole('button', { name: 'Creating account...' })).toBeVisible();

    // Form fields should be disabled during loading
    await expect(page.getByLabel(/name/i)).toBeDisabled();
    await expect(page.getByLabel(/email/i)).toBeDisabled();
    await expect(page.getByLabel(/password/i)).toBeDisabled();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/register');

    // Click sign in link
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should navigate to login page
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Register Success Flow (Mock)', () => {
  test('should redirect to dashboard on successful registration', async ({ page }) => {
    // Mock successful register response
    await page.route('/api/auth/register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '01JC123456789ABCDEFGHIJK',
            email: 'newuser@example.com',
            name: 'New User',
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
          email: 'newuser@example.com',
          name: 'New User',
          isActive: true,
          createdAt: new Date().toISOString()
        })
      });
    });

    await page.goto('/register');

    // Fill and submit form
    await page.getByLabel(/name/i).fill('New User');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Check dashboard content is loaded
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should redirect to login page on successful registration (alternative flow)', async ({ page }) => {
    // Mock successful register response without auto-login
    await page.route('/api/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'User registered successfully. Please log in.',
          user: {
            id: '01JC123456789ABCDEFGHIJK',
            email: 'newuser@example.com',
            name: 'New User',
            isActive: true
          }
        })
      });
    });

    await page.goto('/register');

    // Fill and submit form
    await page.getByLabel(/name/i).fill('New User');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to login page with success message
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    await expect(page.getByText('Registration successful')).toBeVisible();
  });
});