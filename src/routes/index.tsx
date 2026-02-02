import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from './protected-route'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load page components
const LoginPage = lazy(() => import('@/features/auth/pages/login-page').then(m => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/pages/dashboard-page').then(m => ({ default: m.DashboardPage })))
const UsersPage = lazy(() => import('@/features/users/pages/users-page').then(m => ({ default: m.UsersPage })))
const ItemsPage = lazy(() => import('@/features/items/pages/items-page').then(m => ({ default: m.ItemsPage })))
const ProfilePage = lazy(() => import('@/features/profile/pages/profile-page').then(m => ({ default: m.ProfilePage })))
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then(m => ({ default: m.NotFoundPage })))
const UnauthorizedPage = lazy(() => import('@/pages/unauthorized-page').then(m => ({ default: m.UnauthorizedPage })))

// Inline loading fallback
const pageLoader = <div className="p-6"><Skeleton className="h-96 w-full" /></div>

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={pageLoader}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={pageLoader}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={pageLoader}>
            <DashboardPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/items',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={pageLoader}>
            <ItemsPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredPermissions={['users:read']}>
        <AppLayout>
          <Suspense fallback={pageLoader}>
            <UsersPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={pageLoader}>
            <ProfilePage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={pageLoader}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
