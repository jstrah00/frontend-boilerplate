import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import i18n from '@/i18n/config'
import { authApi, LoginCredentials } from '../api/auth.api'
import { useAuth } from '@/store'

export function useLogin() {
  const navigate = useNavigate()
  const { setUser, setPermissions } = useAuth()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // First, login and get tokens
      const loginResponse = await authApi.login(credentials)

      // Store tokens in localStorage
      if (loginResponse.access_token) {
        localStorage.setItem('access_token', loginResponse.access_token)
      }
      if (loginResponse.refresh_token) {
        localStorage.setItem('refresh_token', loginResponse.refresh_token)
      }

      // Then, fetch current user data
      const user = await authApi.getCurrentUser()

      return { ...loginResponse, user }
    },
    onSuccess: (data) => {
      // Set user in store
      setUser(data.user)

      // Set permissions based on user role
      const permissions: string[] = []
      if (data.user.is_admin) {
        permissions.push('users:read', 'users:write', 'users:delete')
      }
      setPermissions(permissions)

      toast.success(i18n.t('auth.loginSuccess'))
      navigate('/')
    },
    onError: () => {
      toast.error(i18n.t('auth.loginError'))
    },
  })
}
