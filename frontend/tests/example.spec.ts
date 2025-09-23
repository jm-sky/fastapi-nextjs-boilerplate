import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title to contain our app name
  await expect(page).toHaveTitle(/SaaS Boilerplate/);
});

test('can navigate to home page', async ({ page }) => {
  await page.goto('/');

  // Expect page to have a heading with our app name
  await expect(page.getByRole('heading', { name: /SaaS Boilerplate/i })).toBeVisible();

  // Check for other expected elements
  await expect(page.getByText(/Modern SaaS application/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test('health check works via API proxy', async ({ page }) => {
  // Test the API proxy by checking if backend health endpoint is accessible
  const response = await page.request.get('/api/health');
  expect(response.status()).toBe(200);

  const healthData = await response.json();
  expect(healthData.status).toBe('healthy');
});