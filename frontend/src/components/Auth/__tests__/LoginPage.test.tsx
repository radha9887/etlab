/**
 * Tests for LoginPage Component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../LoginPage'
import { useAuthStore } from '../../../stores/authStore'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

// Reset auth store
const resetAuthStore = () => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthStore()
  })

  describe('rendering', () => {
    it('should render login form', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to ETLab')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should render sign up link', () => {
      renderWithRouter(<LoginPage />)

      const signUpLink = screen.getByText('Sign up')
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink).toHaveAttribute('href', '/register')
    })

    it('should render email and password inputs', () => {
      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('form validation', () => {
    it('should show error when submitting empty form', async () => {
      renderWithRouter(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })

    it('should show error when email is empty', async () => {
      renderWithRouter(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })

    it('should show error when password is empty', async () => {
      renderWithRouter(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('should call login with email and password', async () => {
      const mockLogin = vi.fn().mockResolvedValue(true)
      useAuthStore.setState({ login: mockLogin })

      renderWithRouter(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should navigate to home on successful login', async () => {
      const mockLogin = vi.fn().mockResolvedValue(true)
      useAuthStore.setState({ login: mockLogin })

      renderWithRouter(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should not navigate on failed login', async () => {
      const mockLogin = vi.fn().mockResolvedValue(false)
      useAuthStore.setState({ login: mockLogin })

      renderWithRouter(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpassword' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should disable inputs when loading', () => {
      useAuthStore.setState({ isLoading: true })
      renderWithRouter(<LoginPage />)

      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
    })

    it('should show loading spinner when loading', () => {
      useAuthStore.setState({ isLoading: true })
      renderWithRouter(<LoginPage />)

      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('should disable submit button when loading', () => {
      useAuthStore.setState({ isLoading: true })
      renderWithRouter(<LoginPage />)

      const button = screen.getByRole('button', { name: /signing in/i })
      expect(button).toBeDisabled()
    })
  })

  describe('error display', () => {
    it('should display error message from store', () => {
      useAuthStore.setState({ error: 'Invalid credentials' })
      renderWithRouter(<LoginPage />)

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('should clear error when form is submitted', async () => {
      const mockSetError = vi.fn()
      const mockLogin = vi.fn().mockResolvedValue(false)
      useAuthStore.setState({
        error: 'Previous error',
        setError: mockSetError,
        login: mockLogin,
      })

      renderWithRouter(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith(null)
      })
    })
  })

  describe('input handling', () => {
    it('should update email on input change', () => {
      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      fireEvent.change(emailInput, { target: { value: 'new@email.com' } })

      expect(emailInput).toHaveValue('new@email.com')
    })

    it('should update password on input change', () => {
      renderWithRouter(<LoginPage />)

      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } })

      expect(passwordInput).toHaveValue('newpassword')
    })
  })
})
