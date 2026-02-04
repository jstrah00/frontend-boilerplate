# Frontend Patterns - Complete Reference

All patterns, conventions, and examples for this React + TypeScript frontend.
This is the detailed reference - the main CLAUDE.md is kept short (<200 lines).

## Table of Contents
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Form Patterns](#form-patterns)
- [Routing Patterns](#routing-patterns)
- [Auth Patterns](#auth-patterns)
- [Testing Patterns](#testing-patterns)
- [Styling Patterns](#styling-patterns)
- [i18n Patterns](#i18n-patterns)
- [Performance Patterns](#performance-patterns)

---

## Component Patterns

### Naming Conventions
````typescript
// Feature components: PascalCase + descriptive
UserCard.tsx         // Good
Card.tsx            // Bad - too generic

// UI components: PascalCase
Button.tsx
Dialog.tsx

// Pages: PascalCase + Page suffix
UsersPage.tsx
ProductDetailPage.tsx

// Hooks: camelCase + use prefix
useUsers.ts
useAuth.ts

// Utils: camelCase
formatters.ts
utils.ts
````

### Component Structure
````typescript
// 1. Imports
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/generated/api'

// 2. Types/Interfaces
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (id: number) => void
}

// 3. Component
export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  // 4. Hooks
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 5. Event handlers
  const handleEdit = () => {
    onEdit?.(user)
  }
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
````

### Compound Components Pattern
````typescript
// Parent component
export function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <ProductCard.Header product={product} />
      <ProductCard.Content product={product} />
      <ProductCard.Actions product={product} />
    </Card>
  )
}

// Child components as properties
ProductCard.Header = function ProductCardHeader({ product }: { product: Product }) {
  return <CardHeader><h3>{product.name}</h3></CardHeader>
}

ProductCard.Content = function ProductCardContent({ product }: { product: Product }) {
  return <CardContent><p>{product.description}</p></CardContent>
}

ProductCard.Actions = function ProductCardActions({ product }: { product: Product }) {
  return (
    <CardFooter>
      <Button>Edit</Button>
    </CardFooter>
  )
}
````

### Render Props Pattern
````typescript
interface DataFetcherProps<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  children: (data: T, isLoading: boolean) => React.ReactNode
}

function DataFetcher<T>({ queryKey, queryFn, children }: DataFetcherProps<T>) {
  const { data, isLoading } = useQuery({ queryKey, queryFn })
  return <>{children(data, isLoading)}</>
}

// Usage
<DataFetcher queryKey={['users']} queryFn={usersApi.list}>
  {(users, isLoading) => (
    isLoading ? <Loading /> : <UserList users={users} />
  )}
</DataFetcher>
````

### Conditional Rendering Patterns
````typescript
// 1. Early return
if (isLoading) return <Loading />
if (error) return <Error message={error.message} />
if (!data) return null

// 2. Ternary (simple cases)
{isActive ? <ActiveBadge /> : <InactiveBadge />}

// 3. Logical AND (when no else)
{hasPermission && <Button>Edit</Button>}

// 4. Switch/case for multiple conditions
const renderStatus = () => {
  switch (order.status) {
    case 'pending':
      return <PendingBadge />
    case 'shipped':
      return <ShippedBadge />
    case 'delivered':
      return <DeliveredBadge />
    default:
      return <UnknownBadge />
  }
}
````

---

## State Management

### Zustand Store Pattern
````typescript
// src/store/slices/authSlice.ts
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
````
````typescript
// src/store/index.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createAuthSlice, AuthSlice } from './slices/auth-slice'
import { createUISlice, UISlice } from './slices/ui-slice'

type StoreState = AuthSlice & UISlice

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        // Only persist UI preferences, not auth
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Export hooks
export const useAuth = () => useStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  permissions: state.permissions,
  setAuth: state.setAuth,
  clearAuth: state.clearAuth,
}))

export const useUI = () => useStore((state) => ({
  theme: state.theme,
  sidebarCollapsed: state.sidebarCollapsed,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
}))
````

### TanStack Query Patterns

**Basic Query:**
````typescript
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}
````

**Query with Parameters:**
````typescript
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.get(id),
    enabled: !!id, // Only fetch if id is truthy
  })
}
````

**Paginated Query:**
````typescript
export function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => usersApi.list({ page, pageSize }),
    keepPreviousData: true, // Keep old data while fetching new
  })
}
````

**Infinite Query:**
````typescript
export function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ['users'],
    queryFn: ({ pageParam = 1 }) => usersApi.list({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length + 1 : undefined,
  })
}
````

**Mutation with Optimistic Update:**
````typescript
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
      usersApi.update(id, data),
      
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users', id] })
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['users', id])
      
      // Optimistically update
      queryClient.setQueryData(['users', id], (old: User) => ({
        ...old,
        ...data,
      }))
      
      return { previous }
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['users', variables.id], context.previous)
      }
    },
    
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
    },
  })
}
````

---

## API Integration

### Axios Client Setup
````typescript
// src/api/client.ts
import axios from 'axios'

// baseURL includes /api suffix
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
````

**Important:** Always use named import `{ apiClient }` for consistency.

### Request Interceptor
````typescript
// src/api/interceptors.ts
import { apiClient } from './client'

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
````

### Response Interceptor with Token Refresh
````typescript
import { apiClient } from './client'
import { useStore } from '@/store'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => apiClient(originalRequest))
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')
        
        const response = await apiClient.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken,
        })
        
        const { access_token, refresh_token: newRefreshToken } = response.data
        
        localStorage.setItem('token', access_token)
        localStorage.setItem('refresh_token', newRefreshToken)
        
        processQueue(null)
        
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        
        // Clear auth and redirect
        useStore.getState().clearAuth()
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // Handle 403
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }
    
    return Promise.reject(error)
  }
)
````

### API Function Patterns
````typescript
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { User, UsersListResponse, UsersListParams } from '@/types/models'
import { UserCreateInput, UserUpdateInput } from '../schemas'

export type { User, UsersListResponse, UsersListParams }

export const usersApi = {
  // GET with params
  getUsers: async (params: UsersListParams = {}): Promise<UsersListResponse> => {
    const { skip = 0, limit = 10 } = params
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, {
      params: { skip, limit },
    })
    return response.data
  },

  // GET single
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id))
    return response.data
  },

  // POST
  createUser: async (data: UserCreateInput): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data)
    return response.data
  },

  // PATCH
  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), data)
    return response.data
  },

  // DELETE
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id))
  },
}
````

---

## Form Patterns

### Basic Form with Zod
````typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  
  const onSubmit = (data: FormData) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  )
}
````

### Complex Validation
````typescript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
````

### Dynamic Form Fields
````typescript
const schema = z.object({
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(1),
  })),
})

type FormData = z.infer<typeof schema>

export function OrderForm() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [{ name: '', quantity: 1 }],
    },
  })
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <input {...register(`items.${index}.quantity`)} type="number" />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', quantity: 1 })}>
        Add Item
      </button>
    </form>
  )
}
````

---

## Routing Patterns

### Route Configuration
````typescript
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const UsersPage = lazy(() => import('@/features/users/pages/users-page'))

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: '/users',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <UsersPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  
  // Protected with permissions
  {
    element: <ProtectedRoute requiredPermissions={['admin:access']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/admin',
            element: <AdminPage />,
          },
        ],
      },
    ],
  },
  
  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
````

### Protected Route Component
````typescript
// src/routes/protected-route.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store'
import { usePermissions } from '@/hooks/use-permissions'

interface ProtectedRouteProps {
  requiredPermissions?: string[]
}

export function ProtectedRoute({ requiredPermissions }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const { hasAllPermissions } = usePermissions()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredPermissions && !hasAllPermissions(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <Outlet />
}
````

---

## Auth Patterns

### Login Flow
````typescript
// src/features/auth/hooks/use-login.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth-api'
import { useAuth } from '@/store'
import { toast } from 'sonner'

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      setAuth(data.user, data.permissions)
      
      toast.success('Login successful')
      navigate('/')
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || 'Login failed')
    },
  })
}
````

### Logout Flow
````typescript
export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuth()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      clearAuth()
      navigate('/login')
    },
  })
}
````

### Permission Hook
````typescript
// src/hooks/use-permissions.ts
import { useAuth } from '@/store'

export function usePermissions() {
  const { permissions } = useAuth()
  
  const hasPermission = (permission: string) => {
    return permissions.includes(permission)
  }
  
  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every(hasPermission)
  }
  
  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some(hasPermission)
  }
  
  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  }
}
````

### Can Component
````typescript
// src/components/can.tsx
import { ReactNode } from 'react'
import { useAuth } from '@/store'

interface CanProps {
  perform: string | string[]
  yes?: () => ReactNode
  no?: () => ReactNode
  children?: ReactNode
}

export function Can({ perform, yes, no, children }: CanProps) {
  const { permissions } = useAuth()

  const hasPermission = () => {
    if (Array.isArray(perform)) {
      return perform.some((p) => permissions.includes(p))
    }
    return permissions.includes(perform)
  }

  if (hasPermission()) {
    if (yes) return <>{yes()}</>
    return <>{children}</>
  }

  if (no) return <>{no()}</>
  return null
}
````

**Usage:**
````typescript
// Simple usage with children
<Can perform="users:write">
  <Button>Create User</Button>
</Can>

// With yes/no render functions
<Can
  perform="users:delete"
  yes={() => <Button variant="destructive">Delete</Button>}
  no={() => <span className="text-muted-foreground">No permission</span>}
/>
````


