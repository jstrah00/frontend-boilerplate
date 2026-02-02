import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api/auth.api'
import { useAuth } from '@/store'

export function useLogout() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { logout } = useAuth()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // Clear auth state
      logout()

      toast.success(t('auth.logoutSuccess'))
      navigate('/login')
    },
    onError: () => {
      // Clear local state even if backend fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      logout()
      navigate('/login')
    },
  })
}
