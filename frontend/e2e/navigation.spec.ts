import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.describe('Unauthenticated Access', () => {
    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.goto('/')

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should show loading state briefly', async ({ page }) => {
      await page.goto('/')

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    })
  })

  test.describe('Public Routes', () => {
    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByText('Welcome back')).toBeVisible()
    })

    test('register page should be accessible', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByText('Create an account')).toBeVisible()
    })
  })

  test.describe('Page Structure', () => {
    test('login page should have correct structure', async ({ page }) => {
      await page.goto('/login')

      // Check for logo/branding
      await expect(page.locator('h1')).toContainText('Welcome back')

      // Check for form elements
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()

      // Check for submit button
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('register page should have correct structure', async ({ page }) => {
      await page.goto('/register')

      // Check for logo/branding
      await expect(page.locator('h1')).toContainText('Create an account')

      // Check for form elements
      await expect(page.getByLabel('Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()

      // Check for submit button
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })
  })
})
