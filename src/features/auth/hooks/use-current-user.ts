import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuth } from '@/store'
import { useEffect } from 'react'

export function useCurrentUser() {
  const { setUser, setPermissions, isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)

      // Set permissions from backend (already computed)
      const permissions = query.data.permissions || []
      setPermissions(permissions)
    }
  }, [query.data, setUser, setPermissions])

  return query
}
