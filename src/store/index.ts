import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AuthState, createAuthSlice } from './slices/authSlice'
import { UIState, createUISlice } from './slices/uiSlice'

type StoreState = AuthState & UIState

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
)

// Selectors
export const useAuth = () => useStore((state) => ({
  user: state.user,
  permissions: state.permissions,
  isAuthenticated: state.isAuthenticated,
  setUser: state.setUser,
  setPermissions: state.setPermissions,
  logout: state.logout,
}))

export const useUI = () => useStore((state) => ({
  sidebarCollapsed: state.sidebarCollapsed,
  setSidebarCollapsed: state.setSidebarCollapsed,
  toggleSidebar: state.toggleSidebar,
}))
