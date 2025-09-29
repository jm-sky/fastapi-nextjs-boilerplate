import { test, expect } from '@playwright/test'

test.describe('Change Password Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to access protected route
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z'
        })
      })
    })
  })

  test('should load change password page correctly', async ({ page }) => {
    await page.goto('/change-password')

    // Check if page loads correctly
    await expect(page).toHaveURL('/change-password')

    // Check for main page heading (more flexible)
    await expect(page.getByText('Change Password')).toBeVisible()

    // Check for form description
    await expect(page.getByText(/update your password to keep your account secure/i)).toBeVisible()

    // Check form fields
    await expect(page.getByLabel(/current password/i)).toBeVisible()
    await expect(page.getByLabel(/^new password$/i)).toBeVisible()
    await expect(page.getByLabel(/confirm new password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^change password$/i })).toBeVisible()

    // Check back to dashboard link
    await expect(page.getByText(/back to dashboard/i)).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/change-password')

    // Try to submit empty form
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Check for validation errors
    await expect(page.getByText('Current password is required')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show validation error for short new password', async ({ page }) => {
    await page.goto('/change-password')

    // Fill short new password
    await page.getByLabel(/current password/i).fill('currentpass123')
    await page.getByLabel(/^new password$/i).fill('123')
    await page.getByLabel(/^new password$/i).blur()
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Check for password validation error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show validation error when passwords do not match', async ({ page }) => {
    await page.goto('/change-password')

    // Fill mismatched passwords
    await page.getByLabel(/current password/i).fill('currentpass123')
    await page.getByLabel(/^new password$/i).fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('differentpass123')
    await page.getByLabel(/confirm new password/i).blur()
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Check for password match validation error
    await expect(page.getByText("Passwords don't match")).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/change-password')

    const currentPasswordInput = page.getByLabel(/current password/i)
    const newPasswordInput = page.getByLabel(/^new password$/i)
    const confirmPasswordInput = page.getByLabel(/confirm new password/i)

    // Initially should be password type
    await expect(currentPasswordInput).toHaveAttribute('type', 'password')
    await expect(newPasswordInput).toHaveAttribute('type', 'password')
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    // Get all eye toggle buttons
    const toggleButtons = page.locator('button').filter({ has: page.locator('svg') })

    // Click toggle for current password (first button)
    await toggleButtons.nth(0).click()
    await expect(currentPasswordInput).toHaveAttribute('type', 'text')

    // Click toggle for new password (second button)
    await toggleButtons.nth(1).click()
    await expect(newPasswordInput).toHaveAttribute('type', 'text')

    // Click toggle for confirm password (third button)
    await toggleButtons.nth(2).click()
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text')
  })

  test('should navigate back to dashboard', async ({ page }) => {
    await page.goto('/change-password')

    // Click back to dashboard link
    await page.getByText(/back to dashboard/i).click()

    // Should navigate to dashboard page
    await expect(page).toHaveURL('/dashboard')
  })
})

test.describe('Change Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z'
        })
      })
    })
  })

  test('should show success message after changing password', async ({ page }) => {
    // Mock successful change password response
    await page.route('/api/auth/change-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password has been successfully changed'
        })
      })
    })

    await page.goto('/change-password')

    // Fill and submit form
    await page.getByLabel(/current password/i).fill('currentpass123')
    await page.getByLabel(/^new password$/i).fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('newpassword123')
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Should show success message
    await expect(page.getByText(/your password has been successfully changed/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/for security, please log out and log back in/i)).toBeVisible()

    // Should show options to change password again or go back to dashboard
    await expect(page.getByRole('button', { name: /change password again/i })).toBeVisible()
    await expect(page.getByText(/back to dashboard/i)).toBeVisible()
  })

  test('should handle incorrect current password error', async ({ page }) => {
    // Mock incorrect current password response
    await page.route('/api/auth/change-password', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Current password is incorrect'
        })
      })
    })

    await page.goto('/change-password')

    // Fill and submit form
    await page.getByLabel(/current password/i).fill('wrongpassword')
    await page.getByLabel(/^new password$/i).fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('newpassword123')
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Should show error message
    await expect(page.getByText(/current password is incorrect/i)).toBeVisible({ timeout: 5000 })
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and return network error
    await page.route('/api/auth/change-password', route => {
      route.abort('internetdisconnected')
    })

    await page.goto('/change-password')

    // Fill and submit form
    await page.getByLabel(/current password/i).fill('currentpass123')
    await page.getByLabel(/^new password$/i).fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('newpassword123')
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Should show error message
    await expect(
      page.getByText('An unexpected error occurred')
        .or(page.getByText('Network error'))
        .or(page.getByText('Connection failed'))
        .or(page.getByText('Request failed'))
    ).toBeVisible({ timeout: 10000 })
  })

  test('should show loading state during submission', async ({ page }) => {
    // Intercept API calls to simulate slow response
    await page.route('/api/auth/change-password', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password has been successfully changed'
        })
      })
    })

    await page.goto('/change-password')

    // Fill form
    await page.getByLabel(/current password/i).fill('currentpass123')
    await page.getByLabel(/^new password$/i).fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('newpassword123')

    // Submit form
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Check loading state
    await expect(page.getByRole('button', { name: /changing password/i })).toBeVisible()

    // Form fields should be disabled during loading
    await expect(page.getByLabel(/current password/i)).toBeDisabled()
    await expect(page.getByLabel(/^new password$/i)).toBeDisabled()
    await expect(page.getByLabel(/confirm new password/i)).toBeDisabled()
  })

  test('should allow changing password again after success', async ({ page }) => {
    // Mock successful change password response
    await page.route('/api/auth/change-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password has been successfully changed'
        })
      })
    })

    await page.goto('/change-password')

    // Fill and submit form
    await page.getByLabel(/current password/i).fill('currentpass123')
    await page.getByLabel(/^new password$/i).fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('newpassword123')
    await page.getByRole('button', { name: /^change password$/i }).click()

    // Wait for success message
    await expect(page.getByText(/your password has been successfully changed/i)).toBeVisible({ timeout: 5000 })

    // Click change password again
    await page.getByRole('button', { name: /change password again/i }).click()

    // Should be back to the form
    await expect(page.getByLabel(/current password/i)).toBeVisible()
    await expect(page.getByLabel(/^new password$/i)).toBeVisible()
    await expect(page.getByLabel(/confirm new password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^change password$/i })).toBeVisible()
  })
})

test.describe('Dashboard Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z'
        })
      })
    })
  })

  test('should have change password link on dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Check for change password link in settings card
    const settingsCard = page.locator('text=Settings').locator('..')
    await expect(settingsCard.getByText(/change password/i)).toBeVisible()

    // Click change password link
    await settingsCard.getByText(/change password/i).click()

    // Should navigate to change password page
    await expect(page).toHaveURL('/change-password')
  })

  test('should require authentication to access change password page', async ({ page }) => {
    // Override the auth mock for this specific test to simulate unauthenticated state
    await page.route('/api/auth/me', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not authenticated' })
      })
    })

    await page.goto('/change-password')

    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
  })
})
