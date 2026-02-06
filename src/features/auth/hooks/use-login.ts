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
      // Login - tokens are set as HttpOnly cookies by the backend
      await authApi.login(credentials)

      // Fetch current user data (includes permissions from backend)
      const user = await authApi.getCurrentUser()

      return user
    },
    onSuccess: (user) => {
      // Set user in store
      setUser(user)

      // Set permissions from backend (already computed by backend)
      // Backend sends all effective permissions (role + custom)
      const permissions = user.permissions || []
      setPermissions(permissions)

      toast.success(i18n.t('auth.loginSuccess'))
      navigate('/')
    },
    onError: () => {
      toast.error(i18n.t('auth.loginError'))
    },
  })
}
