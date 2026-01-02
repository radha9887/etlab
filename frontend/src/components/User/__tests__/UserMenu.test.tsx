/**
 * Tests for UserMenu Component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { UserMenu } from '../UserMenu'
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

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthStore()
  })

  describe('unauthenticated state', () => {
    it('should show sign in button when not authenticated', () => {
      renderWithRouter(<UserMenu />)

      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })

    it('should navigate to login when sign in is clicked', () => {
      renderWithRouter(<UserMenu />)

      fireEvent.click(screen.getByText('Sign in'))
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should not show dropdown when not authenticated', () => {
      renderWithRouter(<UserMenu />)

      expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
    })
  })

  describe('authenticated state', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    }

    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should show user initial', () => {
      renderWithRouter(<UserMenu />)

      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('should show user name', () => {
      renderWithRouter(<UserMenu />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should not show sign in button when authenticated', () => {
      renderWithRouter(<UserMenu />)

      expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    })

    it('should toggle dropdown on click', () => {
      renderWithRouter(<UserMenu />)

      // Click to open dropdown
      fireEvent.click(screen.getByText('John Doe'))

      expect(screen.getByText('Sign out')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should show user details in dropdown', () => {
      renderWithRouter(<UserMenu />)

      fireEvent.click(screen.getByText('John Doe'))

      // Should show user name and email in dropdown
      const dropdownNames = screen.getAllByText('John Doe')
      expect(dropdownNames.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should close dropdown on second click', () => {
      renderWithRouter(<UserMenu />)

      // Open dropdown - use the button which is the parent container
      const userButton = screen.getAllByText('John Doe')[0]
      fireEvent.click(userButton)
      expect(screen.getByText('Sign out')).toBeInTheDocument()

      // Close dropdown
      fireEvent.click(userButton)
      expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
    })
  })

  describe('logout functionality', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    }

    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should call logout when sign out is clicked', () => {
      const mockLogout = vi.fn()
      useAuthStore.setState({ logout: mockLogout })

      renderWithRouter(<UserMenu />)

      fireEvent.click(screen.getByText('Test User'))
      fireEvent.click(screen.getByText('Sign out'))

      expect(mockLogout).toHaveBeenCalled()
    })

    it('should navigate to login after logout', () => {
      const mockLogout = vi.fn()
      useAuthStore.setState({ logout: mockLogout })

      renderWithRouter(<UserMenu />)

      fireEvent.click(screen.getByText('Test User'))
      fireEvent.click(screen.getByText('Sign out'))

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should close dropdown after logout', async () => {
      const mockLogout = vi.fn()
      useAuthStore.setState({ logout: mockLogout })

      renderWithRouter(<UserMenu />)

      fireEvent.click(screen.getByText('Test User'))
      fireEvent.click(screen.getByText('Sign out'))

      // After logout, the sign in button should appear
      await waitFor(() => {
        expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
      })
    })
  })

  describe('click outside handling', () => {
    const mockUser = {
      id: '1',
      name: 'Click Test',
      email: 'click@test.com',
    }

    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should close dropdown when clicking outside', async () => {
      renderWithRouter(
        <div>
          <UserMenu />
          <div data-testid="outside">Outside Element</div>
        </div>
      )

      // Open dropdown
      fireEvent.click(screen.getByText('Click Test'))
      expect(screen.getByText('Sign out')).toBeInTheDocument()

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
      })
    })
  })

  describe('user initial rendering', () => {
    it('should display uppercase initial', () => {
      useAuthStore.setState({
        user: { id: '1', name: 'alice', email: 'alice@test.com' },
        isAuthenticated: true,
      })

      renderWithRouter(<UserMenu />)

      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should handle single character name', () => {
      useAuthStore.setState({
        user: { id: '1', name: 'X', email: 'x@test.com' },
        isAuthenticated: true,
      })

      renderWithRouter(<UserMenu />)

      // There are two X's - one in the avatar and one as the name
      const xElements = screen.getAllByText('X')
      expect(xElements.length).toBeGreaterThanOrEqual(1)
    })
  })
})
