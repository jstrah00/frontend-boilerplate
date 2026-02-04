import { StateCreator } from 'zustand'
import type { User } from '@/types/models'

export type { User }

export interface AuthState {
  user: User | null
  permissions: string[]
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setPermissions: (permissions: string[]) => void
  logout: () => void
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  setPermissions: (permissions) =>
    set({
      permissions,
    }),
  logout: () =>
    set({
      user: null,
      permissions: [],
      isAuthenticated: false,
    }),
})
