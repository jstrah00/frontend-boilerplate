import { StateCreator } from 'zustand'

export interface User {
  id: string | number
  email: string
  first_name: string
  last_name: string
  status: "active" | "inactive"
  role: "admin" | "user"
  is_admin: boolean
  created_at?: string
  updated_at?: string
}

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
