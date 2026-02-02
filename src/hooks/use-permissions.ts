import { useAuth } from '@/store'

export function usePermissions() {
  const { permissions } = useAuth()

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((permission) => permissions.includes(permission))
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((permission) => permissions.includes(permission))
  }

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    permissions,
  }
}
