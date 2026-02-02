import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store'
import { usePermissions } from '@/hooks/use-permissions'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: string[]
}

export function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const { hasAllPermissions } = usePermissions()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
