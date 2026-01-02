import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByText('Welcome back')).toBeVisible()
      await expect(page.getByText('Sign in to ETLab')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should show link to register page', async ({ page }) => {
      await page.goto('/login')

      const signUpLink = page.getByRole('link', { name: 'Sign up' })
      await expect(signUpLink).toBeVisible()
      await expect(signUpLink).toHaveAttribute('href', '/register')
    })

    test('should show error for empty form submission', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText('Please fill in all fields')).toBeVisible()
    })

    test('should show error when only email is provided', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText('Please fill in all fields')).toBeVisible()
    })

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('link', { name: 'Sign up' }).click()

      await expect(page).toHaveURL(/\/register/)
      await expect(page.getByText('Create an account')).toBeVisible()
    })
  })

  test.describe('Register Page', () => {
    test('should display register page', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByText('Create an account')).toBeVisible()
      await expect(page.getByText('Get started with ETLab')).toBeVisible()
      await expect(page.getByLabel('Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })

    test('should show link to login page', async ({ page }) => {
      await page.goto('/register')

      const signInLink = page.getByRole('link', { name: 'Sign in' })
      await expect(signInLink).toBeVisible()
      await expect(signInLink).toHaveAttribute('href', '/login')
    })

    test('should show error for empty form submission', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Please fill in all fields')).toBeVisible()
    })

    test('should show error for password mismatch', async ({ page }) => {
      await page.goto('/register')

      await page.getByLabel('Name').fill('Test User')
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByLabel('Confirm Password').fill('different456')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('should show error for short password', async ({ page }) => {
      await page.goto('/register')

      await page.getByLabel('Name').fill('Test User')
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('12345')
      await page.getByLabel('Confirm Password').fill('12345')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/register')

      await page.getByRole('link', { name: 'Sign in' }).click()

      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByText('Welcome back')).toBeVisible()
    })
  })
})
