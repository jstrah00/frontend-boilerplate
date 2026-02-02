import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuth } from '@/store'
import { useEffect } from 'react'

export function useCurrentUser() {
  const { setUser, setPermissions, isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated || !!localStorage.getItem('access_token'),
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)

      // Set permissions based on user data
      const permissions: string[] = []
      if (query.data.is_admin) {
        permissions.push('users:read', 'users:write', 'users:delete')
      }
      setPermissions(permissions)
    }
  }, [query.data, setUser, setPermissions])

  return query
}
