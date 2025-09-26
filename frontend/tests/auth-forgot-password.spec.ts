import { test, expect } from '@playwright/test'

test.describe('Forgot Password Page', () => {
  test('should load forgot password page correctly', async ({ page }) => {
    await page.goto('/forgot-password')

    // Check if page loads correctly
    await expect(page).toHaveURL('/forgot-password')

    // Check for main page heading
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible()

    // Check for form description
    await expect(page.getByText(/enter your email address and we'll send you a link/i)).toBeVisible()

    // Check form fields
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()

    // Check sign in link
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/forgot-password')

    // Try to submit empty form
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Check for validation error
    await expect(page.getByText('Email is required')).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/forgot-password')

    // Fill invalid email and trigger validation
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/email/i).blur()
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Check for email validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible({ timeout: 3000 })
  })

  test('should navigate back to login page', async ({ page }) => {
    await page.goto('/forgot-password')

    // Click sign in link
    await page.getByText(/sign in/i).click()

    // Should navigate to login page
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Forgot Password Flow', () => {
  test('should show success message after submitting valid email', async ({ page }) => {
    // Mock successful forgot password response
    await page.route('/api/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'If the email exists, a password reset link has been sent'
        })
      })
    })

    await page.goto('/forgot-password')

    // Fill and submit form
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Should show success message
    await expect(page.getByText(/if an account with the email/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/test@example.com/)).toBeVisible()

    // Should show options to try different email or go back to sign in
    await expect(page.getByRole('button', { name: /try different email/i })).toBeVisible()
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and return network error
    await page.route('/api/auth/forgot-password', route => {
      route.abort('internetdisconnected')
    })

    await page.goto('/forgot-password')

    // Fill and submit form
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

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
    await page.route('/api/auth/forgot-password', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'If the email exists, a password reset link has been sent'
        })
      })
    })

    await page.goto('/forgot-password')

    // Fill form
    await page.getByLabel(/email/i).fill('test@example.com')

    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Check loading state
    await expect(page.getByRole('button', { name: /sending reset link/i })).toBeVisible()

    // Form field should be disabled during loading
    await expect(page.getByLabel(/email/i)).toBeDisabled()
  })

  test('should allow trying different email after success', async ({ page }) => {
    // Mock successful forgot password response
    await page.route('/api/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'If the email exists, a password reset link has been sent'
        })
      })
    })

    await page.goto('/forgot-password')

    // Fill and submit form
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Wait for success message
    await expect(page.getByText(/if an account with the email/i)).toBeVisible({ timeout: 5000 })

    // Click try different email
    await page.getByRole('button', { name: /try different email/i }).click()

    // Should be back to the form
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })
})

test.describe('Login Page Integration', () => {
  test('should have forgot password link on login page', async ({ page }) => {
    await page.goto('/login')

    // Check for forgot password link
    await expect(page.getByText(/forgot password/i)).toBeVisible()

    // Click forgot password link
    await page.getByText(/forgot password/i).click()

    // Should navigate to forgot password page
    await expect(page).toHaveURL('/forgot-password')
  })
})

test.describe('Reset Password Page', () => {
  const mockToken = 'mock-reset-token-123'

  test('should load reset password page correctly', async ({ page }) => {
    await page.goto(`/reset-password/${mockToken}`)

    // Check if page loads correctly
    await expect(page).toHaveURL(`/reset-password/${mockToken}`)

    // Check for main page heading
    await expect(page.getByRole('heading', { name: /set new password/i })).toBeVisible()

    // Check for form description
    await expect(page.getByText(/enter your new password below/i)).toBeVisible()

    // Check form fields
    await expect(page.getByLabel(/new password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^reset password$/i })).toBeVisible()

    // Check sign in link
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto(`/reset-password/${mockToken}`)

    // Try to submit empty form
    await page.getByRole('button', { name: /^reset password$/i }).click()

    // Check for validation errors
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show validation error for short password', async ({ page }) => {
    await page.goto(`/reset-password/${mockToken}`)

    // Fill short password
    await page.getByLabel(/new password/i).fill('123')
    await page.getByLabel(/new password/i).blur()
    await page.getByRole('button', { name: /^reset password$/i }).click()

    // Check for password validation error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show validation error when passwords do not match', async ({ page }) => {
    await page.goto(`/reset-password/${mockToken}`)

    // Fill mismatched passwords
    await page.getByLabel(/new password/i).fill('password123')
    await page.getByLabel(/confirm password/i).fill('password456')
    await page.getByLabel(/confirm password/i).blur()
    await page.getByRole('button', { name: /^reset password$/i }).click()

    // Check for password match validation error
    await expect(page.getByText("Passwords don't match")).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto(`/reset-password/${mockToken}`)

    const newPasswordInput = page.getByLabel(/new password/i)
    const confirmPasswordInput = page.getByLabel(/confirm password/i)
    const newPasswordToggle = page.locator('button').filter({ has: page.locator('svg') }).first()
    const confirmPasswordToggle = page.locator('button').filter({ has: page.locator('svg') }).last()

    // Initially should be password type
    await expect(newPasswordInput).toHaveAttribute('type', 'password')
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    // Click toggle for new password
    await newPasswordToggle.click()
    await expect(newPasswordInput).toHaveAttribute('type', 'text')

    // Click toggle for confirm password
    await confirmPasswordToggle.click()
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text')
  })

  test('should show success message and redirect after successful reset', async ({ page }) => {
    // Mock successful reset password response
    await page.route('/api/auth/reset-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password has been successfully reset'
        })
      })
    })

    await page.goto(`/reset-password/${mockToken}`)

    // Fill and submit form
    await page.getByLabel(/new password/i).fill('newpassword123')
    await page.getByLabel(/confirm password/i).fill('newpassword123')
    await page.getByRole('button', { name: /^reset password$/i }).click()

    // Should show success message
    await expect(page.getByText(/your password has been successfully reset/i)).toBeVisible({ timeout: 5000 })

    // Should show continue button
    await expect(page.getByRole('button', { name: /continue to sign in/i })).toBeVisible()
  })

  test('should handle invalid token error', async ({ page }) => {
    // Mock invalid token response
    await page.route('/api/auth/reset-password', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Invalid or expired reset token'
        })
      })
    })

    await page.goto(`/reset-password/${mockToken}`)

    // Fill and submit form
    await page.getByLabel(/new password/i).fill('newpassword123')
    await page.getByLabel(/confirm password/i).fill('newpassword123')
    await page.getByRole('button', { name: /^reset password$/i }).click()

    // Should show error message
    await expect(page.getByText(/invalid or expired reset token/i)).toBeVisible({ timeout: 5000 })
  })

  test('should show loading state during submission', async ({ page }) => {
    // Intercept API calls to simulate slow response
    await page.route('/api/auth/reset-password', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password has been successfully reset'
        })
      })
    })

    await page.goto(`/reset-password/${mockToken}`)

    // Fill form
    await page.getByLabel(/new password/i).fill('newpassword123')
    await page.getByLabel(/confirm password/i).fill('newpassword123')

    // Submit form
    await page.getByRole('button', { name: /^reset password$/i }).click()

    // Check loading state
    await expect(page.getByRole('button', { name: /resetting password/i })).toBeVisible()

    // Form fields should be disabled during loading
    await expect(page.getByLabel(/new password/i)).toBeDisabled()
    await expect(page.getByLabel(/confirm password/i)).toBeDisabled()
  })
})