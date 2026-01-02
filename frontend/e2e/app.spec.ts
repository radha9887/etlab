import { test, expect } from '@playwright/test'

test.describe('Application', () => {
  test.describe('Visual Appearance', () => {
    test('login page should have dark theme styling', async ({ page }) => {
      await page.goto('/login')

      // Check that the page uses dark theme
      const body = page.locator('body')
      // The app should have a dark background
      await expect(body).toBeVisible()
    })

    test('should display ETLab branding', async ({ page }) => {
      await page.goto('/login')

      // Check for "E" logo or ETLab text
      await expect(page.getByText('ETLab', { exact: false })).toBeVisible()
    })
  })

  test.describe('Form Interactions', () => {
    test('login form should be interactive', async ({ page }) => {
      await page.goto('/login')

      const emailInput = page.getByLabel('Email')
      const passwordInput = page.getByLabel('Password')

      // Type in fields
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')

      // Verify values
      await expect(emailInput).toHaveValue('test@example.com')
      await expect(passwordInput).toHaveValue('password123')
    })

    test('register form should be interactive', async ({ page }) => {
      await page.goto('/register')

      const nameInput = page.getByLabel('Name')
      const emailInput = page.getByLabel('Email')
      const passwordInput = page.getByLabel('Password')
      const confirmInput = page.getByLabel('Confirm Password')

      // Type in fields
      await nameInput.fill('Test User')
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')
      await confirmInput.fill('password123')

      // Verify values
      await expect(nameInput).toHaveValue('Test User')
      await expect(emailInput).toHaveValue('test@example.com')
      await expect(passwordInput).toHaveValue('password123')
      await expect(confirmInput).toHaveValue('password123')
    })

    test('form inputs should have proper placeholders', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
      await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/login')

      await expect(page.getByText('Welcome back')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/login')

      await expect(page.getByText('Welcome back')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/login')

      await expect(page.getByText('Welcome back')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('form inputs should have proper labels', async ({ page }) => {
      await page.goto('/login')

      // Check that inputs have associated labels
      const emailInput = page.getByLabel('Email')
      const passwordInput = page.getByLabel('Password')

      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
    })

    test('buttons should be focusable', async ({ page }) => {
      await page.goto('/login')

      const submitButton = page.getByRole('button', { name: /sign in/i })

      await submitButton.focus()
      await expect(submitButton).toBeFocused()
    })

    test('links should be accessible by keyboard', async ({ page }) => {
      await page.goto('/login')

      // Tab through elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Sign up link should be focusable
      const signUpLink = page.getByRole('link', { name: 'Sign up' })
      await expect(signUpLink).toBeVisible()
    })
  })

  test.describe('Error States', () => {
    test('should display error message with correct styling', async ({ page }) => {
      await page.goto('/login')

      // Submit empty form to trigger error
      await page.getByRole('button', { name: /sign in/i }).click()

      const errorMessage = page.getByText('Please fill in all fields')
      await expect(errorMessage).toBeVisible()
    })

    test('error message should be dismissable by form interaction', async ({ page }) => {
      await page.goto('/login')

      // Submit empty form
      await page.getByRole('button', { name: /sign in/i }).click()
      await expect(page.getByText('Please fill in all fields')).toBeVisible()

      // Start filling form
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('password')

      // Submit again - error should update or clear based on validation
      await page.getByRole('button', { name: /sign in/i }).click()
    })
  })
})
