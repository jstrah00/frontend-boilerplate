import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import i18n from '@/i18n/config'
import { authApi } from '../api/auth.api'
import { useAuth } from '@/store'

export function useLogout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Backend clears HttpOnly cookies
      // Clear auth state in store
      logout()

      toast.success(i18n.t('auth.logoutSuccess'))
      navigate('/login')
    },
    onError: () => {
      // Clear local state even if backend fails
      // (cookies are handled by backend)
      logout()
      navigate('/login')
    },
  })
}
