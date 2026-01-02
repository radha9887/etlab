import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
}

// ============================================
// API Helpers
// ============================================

const API_BASE = '/api';

async function authFetch(
  endpoint: string,
  options: RequestInit = {},
  tokens?: AuthTokens | null
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (tokens?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.access_token}`;
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
}

// ============================================
// Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Login failed');
          }

          const data = await response.json();

          set({
            user: data.user,
            tokens: {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          return false;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Registration failed');
          }

          const data = await response.json();

          set({
            user: data.user,
            tokens: {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refresh_token) return false;

        try {
          const response = await authFetch('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: tokens.refresh_token }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();

          set({
            tokens: {
              ...tokens,
              access_token: data.access_token,
            },
          });

          return true;
        } catch {
          // Refresh failed, logout
          get().logout();
          return false;
        }
      },

      updateProfile: async (data: { name?: string; avatar_url?: string }) => {
        const { tokens } = get();
        if (!tokens) return false;

        set({ isLoading: true, error: null });

        try {
          const response = await authFetch('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data),
          }, tokens);

          if (!response.ok) {
            throw new Error('Profile update failed');
          }

          const user = await response.json();
          set({ user, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed',
          });
          return false;
        }
      },

      checkAuth: async () => {
        const { tokens } = get();
        if (!tokens?.access_token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          const response = await authFetch('/auth/me', {}, tokens);

          if (!response.ok) {
            // Try to refresh token
            const refreshed = await get().refreshToken();
            if (!refreshed) {
              return false;
            }
            // Retry with new token
            const newTokens = get().tokens;
            const retryResponse = await authFetch('/auth/me', {}, newTokens);
            if (!retryResponse.ok) {
              throw new Error('Auth check failed');
            }
            const user = await retryResponse.json();
            set({ user, isAuthenticated: true });
            return true;
          }

          const user = await response.json();
          set({ user, isAuthenticated: true });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'etlab-auth',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ============================================
// Auth Header Helper (for API calls)
// ============================================

export function getAuthHeaders(): HeadersInit {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.access_token) {
    return {
      'Authorization': `Bearer ${tokens.access_token}`,
    };
  }
  return {};
}
