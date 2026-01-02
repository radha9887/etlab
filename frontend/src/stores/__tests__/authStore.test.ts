/**
 * Tests for Auth Store
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore, getAuthHeaders } from '../authStore'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Helper to reset store
const resetStore = () => {
  const store = useAuthStore.getState()
  store.logout()
}

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.tokens).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should set user and isAuthenticated', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      act(() => {
        useAuthStore.getState().setUser(user)
      })

      const state = useAuthStore.getState()
      expect(state.user).toEqual(user)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should clear authentication when user is null', () => {
      // First set a user
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      act(() => {
        useAuthStore.getState().setUser(user)
      })

      // Then clear it
      act(() => {
        useAuthStore.getState().setUser(null)
      })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('setTokens', () => {
    it('should set tokens', () => {
      const tokens = {
        access_token: 'access123',
        refresh_token: 'refresh456',
      }

      act(() => {
        useAuthStore.getState().setTokens(tokens)
      })

      expect(useAuthStore.getState().tokens).toEqual(tokens)
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      act(() => {
        useAuthStore.getState().setLoading(true)
      })
      expect(useAuthStore.getState().isLoading).toBe(true)

      act(() => {
        useAuthStore.getState().setLoading(false)
      })
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      act(() => {
        useAuthStore.getState().setError('Test error')
      })
      expect(useAuthStore.getState().error).toBe('Test error')
    })

    it('should clear error with null', () => {
      act(() => {
        useAuthStore.getState().setError('Test error')
      })
      act(() => {
        useAuthStore.getState().setError(null)
      })
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          access_token: 'access123',
          refresh_token: 'refresh456',
        }),
      })

      let result: boolean = false
      await act(async () => {
        result = await useAuthStore.getState().login('test@example.com', 'password')
      })

      expect(result).toBe(true)
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual({
        access_token: 'access123',
        refresh_token: 'refresh456',
      })
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      })

      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().login('test@example.com', 'wrong')
      })

      expect(result).toBe(false)
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Invalid credentials')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().login('test@example.com', 'password')
      })

      expect(result).toBe(false)
      expect(useAuthStore.getState().error).toBe('Network error')
    })

    it('should set loading during login', async () => {
      mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

      const loginPromise = useAuthStore.getState().login('test@example.com', 'password')

      // Should be loading immediately after call
      expect(useAuthStore.getState().isLoading).toBe(true)

      await act(async () => {
        await loginPromise.catch(() => {})
      })
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          access_token: 'access123',
          refresh_token: 'refresh456',
        }),
      })

      let result: boolean = false
      await act(async () => {
        result = await useAuthStore.getState().register('new@example.com', 'password', 'New User')
      })

      expect(result).toBe(true)
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should handle registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Email already exists' }),
      })

      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().register('existing@example.com', 'password', 'User')
      })

      expect(result).toBe(false)
      expect(useAuthStore.getState().error).toBe('Email already exists')
    })
  })

  describe('logout', () => {
    it('should clear all auth state', () => {
      // Set up authenticated state
      act(() => {
        useAuthStore.getState().setUser({
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        })
        useAuthStore.getState().setTokens({
          access_token: 'access123',
          refresh_token: 'refresh456',
        })
      })

      // Logout
      act(() => {
        useAuthStore.getState().logout()
      })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.tokens).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Set up tokens
      act(() => {
        useAuthStore.getState().setTokens({
          access_token: 'old_access',
          refresh_token: 'refresh456',
        })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new_access' }),
      })

      let result: boolean = false
      await act(async () => {
        result = await useAuthStore.getState().refreshToken()
      })

      expect(result).toBe(true)
      expect(useAuthStore.getState().tokens?.access_token).toBe('new_access')
      expect(useAuthStore.getState().tokens?.refresh_token).toBe('refresh456')
    })

    it('should return false when no refresh token', async () => {
      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().refreshToken()
      })

      expect(result).toBe(false)
    })

    it('should logout on refresh failure', async () => {
      // Set up state
      act(() => {
        useAuthStore.getState().setUser({
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        })
        useAuthStore.getState().setTokens({
          access_token: 'access',
          refresh_token: 'refresh',
        })
      })

      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().refreshToken()
      })

      expect(result).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Set up authenticated state
      act(() => {
        useAuthStore.getState().setUser({
          id: '1',
          email: 'test@example.com',
          name: 'Old Name',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        })
        useAuthStore.getState().setTokens({
          access_token: 'access123',
          refresh_token: 'refresh456',
        })
      })

      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'New Name',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser,
      })

      let result: boolean = false
      await act(async () => {
        result = await useAuthStore.getState().updateProfile({ name: 'New Name' })
      })

      expect(result).toBe(true)
      expect(useAuthStore.getState().user?.name).toBe('New Name')
    })

    it('should return false when not authenticated', async () => {
      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().updateProfile({ name: 'New' })
      })

      expect(result).toBe(false)
    })
  })

  describe('checkAuth', () => {
    it('should return false when no tokens', async () => {
      let result: boolean = true
      await act(async () => {
        result = await useAuthStore.getState().checkAuth()
      })

      expect(result).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should verify auth with valid token', async () => {
      act(() => {
        useAuthStore.getState().setTokens({
          access_token: 'access123',
          refresh_token: 'refresh456',
        })
      })

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      let result: boolean = false
      await act(async () => {
        result = await useAuthStore.getState().checkAuth()
      })

      expect(result).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  describe('getAuthHeaders', () => {
    it('should return empty object when no tokens', () => {
      const headers = getAuthHeaders()
      expect(headers).toEqual({})
    })

    it('should return authorization header when authenticated', () => {
      act(() => {
        useAuthStore.getState().setTokens({
          access_token: 'test_token',
          refresh_token: 'refresh',
        })
      })

      const headers = getAuthHeaders()
      expect(headers).toEqual({
        Authorization: 'Bearer test_token',
      })
    })
  })
})
