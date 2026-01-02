/**
 * Tests for ProtectedRoute Component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuthStore } from '../../../stores/authStore'

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

// Test child component
const ProtectedContent = () => <div>Protected Content</div>
const LoginPageMock = () => <div>Login Page</div>

// Helper to render with router
const renderProtectedRoute = (initialEntries = ['/protected']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPageMock />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthStore()
  })

  describe('loading state', () => {
    it('should show loading indicator while checking auth', () => {
      useAuthStore.setState({
        tokens: { access: 'token', refresh: 'refresh' },
        checkAuth: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      })

      renderProtectedRoute()

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('authenticated user', () => {
    it('should render children when authenticated', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        tokens: { access: 'token', refresh: 'refresh' },
        checkAuth: vi.fn().mockResolvedValue(true),
      })

      renderProtectedRoute()

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should call checkAuth when tokens exist', async () => {
      const mockCheckAuth = vi.fn().mockResolvedValue(true)
      useAuthStore.setState({
        isAuthenticated: true,
        tokens: { access: 'token', refresh: 'refresh' },
        checkAuth: mockCheckAuth,
      })

      renderProtectedRoute()

      await waitFor(() => {
        expect(mockCheckAuth).toHaveBeenCalled()
      })
    })
  })

  describe('unauthenticated user', () => {
    it('should redirect to login when not authenticated', async () => {
      useAuthStore.setState({
        isAuthenticated: false,
        tokens: null,
        checkAuth: vi.fn().mockResolvedValue(false),
      })

      renderProtectedRoute()

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument()
      })
    })

    it('should not show protected content when not authenticated', async () => {
      useAuthStore.setState({
        isAuthenticated: false,
        tokens: null,
        checkAuth: vi.fn().mockResolvedValue(false),
      })

      renderProtectedRoute()

      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('auth verification', () => {
    it('should not call checkAuth when no tokens exist', async () => {
      const mockCheckAuth = vi.fn()
      useAuthStore.setState({
        isAuthenticated: false,
        tokens: null,
        checkAuth: mockCheckAuth,
      })

      renderProtectedRoute()

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument()
      })
      expect(mockCheckAuth).not.toHaveBeenCalled()
    })

    it('should redirect after failed auth check', async () => {
      useAuthStore.setState({
        isAuthenticated: false,
        tokens: { access: 'expired-token', refresh: 'expired-refresh' },
        checkAuth: vi.fn().mockImplementation(async () => {
          useAuthStore.setState({ isAuthenticated: false })
          return false
        }),
      })

      renderProtectedRoute()

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument()
      })
    })
  })
})
