import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  tenant_id: number
  phc_center_id: number
  department_id: number
  tenant?: { id: number; name: string; locale: string }
  phc_center?: { id: number; name: string }
  department?: { id: number; name: string }
  roles: { id: number; name: string }[]
  permissions: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  refreshPermissions: () => Promise<void>
  setUser: (user: User | null) => void
  hasPermission: (permission: string) => boolean
}

const getInitialToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getInitialToken(),
      isAuthenticated: !!getInitialToken(),
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(email, password)
          localStorage.setItem('token', data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Ignore logout errors
        } finally {
          localStorage.removeItem('token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },

      fetchUser: async () => {
        const currentToken = get().token || localStorage.getItem('token')
        if (!currentToken) {
          set({ isAuthenticated: false, isLoading: false })
          return
        }
        set({ isLoading: true })
        try {
          const { data } = await authApi.me()
          set({
            user: data.user,
            token: currentToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          localStorage.removeItem('token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setUser: (user) => set({ user }),

      refreshPermissions: async () => {
        const currentToken = get().token || localStorage.getItem('token')
        if (!currentToken) return
        try {
          const { data } = await authApi.me()
          set({ user: data.user })
        } catch {
          // Ignore errors
        }
      },

      hasPermission: (permission: string) => {
        const user = get().user
        if (!user) return false
        return user.permissions.includes(permission)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)