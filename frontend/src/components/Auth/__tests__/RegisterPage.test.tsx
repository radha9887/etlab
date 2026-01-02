/**
 * Tests for RegisterPage Component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RegisterPage } from '../RegisterPage'
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthStore()
  })

  describe('rendering', () => {
    it('should render registration form', () => {
      renderWithRouter(<RegisterPage />)

      expect(screen.getByText('Create an account')).toBeInTheDocument()
      expect(screen.getByText('Get started with ETLab')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should render sign in link', () => {
      renderWithRouter(<RegisterPage />)

      const signInLink = screen.getByText('Sign in')
      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/login')
    })

    it('should have correct input types', () => {
      renderWithRouter(<RegisterPage />)

      expect(screen.getByLabelText('Name')).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password')
    })
  })

  describe('form validation', () => {
    it('should show error when submitting empty form', async () => {
      renderWithRouter(<RegisterPage />)

      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })

    it('should show error when name is missing', async () => {
      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })

    it('should show error when password is too short', async () => {
      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '12345' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })
    })

    it('should show error when passwords do not match', async () => {
      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different456' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('should call register with correct parameters', async () => {
      const mockRegister = vi.fn().mockResolvedValue(true)
      useAuthStore.setState({ register: mockRegister })

      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
      })
    })

    it('should navigate to home on successful registration', async () => {
      const mockRegister = vi.fn().mockResolvedValue(true)
      useAuthStore.setState({ register: mockRegister })

      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should not navigate on failed registration', async () => {
      const mockRegister = vi.fn().mockResolvedValue(false)
      useAuthStore.setState({ register: mockRegister })

      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should disable inputs when loading', () => {
      useAuthStore.setState({ isLoading: true })
      renderWithRouter(<RegisterPage />)

      expect(screen.getByLabelText('Name')).toBeDisabled()
      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByLabelText('Confirm Password')).toBeDisabled()
    })

    it('should show loading spinner when loading', () => {
      useAuthStore.setState({ isLoading: true })
      renderWithRouter(<RegisterPage />)

      expect(screen.getByText('Creating account...')).toBeInTheDocument()
    })

    it('should disable submit button when loading', () => {
      useAuthStore.setState({ isLoading: true })
      renderWithRouter(<RegisterPage />)

      const button = screen.getByRole('button', { name: /creating account/i })
      expect(button).toBeDisabled()
    })
  })

  describe('error display', () => {
    it('should display error message from store', () => {
      useAuthStore.setState({ error: 'Email already exists' })
      renderWithRouter(<RegisterPage />)

      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })

    it('should clear error when form is submitted', async () => {
      const mockSetError = vi.fn()
      const mockRegister = vi.fn().mockResolvedValue(false)
      useAuthStore.setState({
        error: 'Previous error',
        setError: mockSetError,
        register: mockRegister,
      })

      renderWithRouter(<RegisterPage />)

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith(null)
      })
    })
  })

  describe('input handling', () => {
    it('should update all inputs on change', () => {
      renderWithRouter(<RegisterPage />)

      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmInput = screen.getByLabelText('Confirm Password')

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'secret123' } })
      fireEvent.change(confirmInput, { target: { value: 'secret123' } })

      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(passwordInput).toHaveValue('secret123')
      expect(confirmInput).toHaveValue('secret123')
    })
  })
})
