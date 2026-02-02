import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { useTranslation } from 'react-i18next'

export function UserMenu() {
  const { user } = useAuth()
  const logout = useLogout()
  const { t } = useTranslation()

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex md:flex-col md:items-end md:text-sm">
        <span className="font-medium">{user.first_name} {user.last_name}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <Button variant="ghost" size="icon" title={t('auth.logout')} onClick={() => logout.mutate()}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
