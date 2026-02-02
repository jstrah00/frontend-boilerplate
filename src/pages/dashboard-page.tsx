import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold">{t('navigation.dashboard')}</h1>
        <p className="text-[11px] sm:text-sm text-muted-foreground">{t('dashboard.welcome')}</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.totalUsers')}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{t('dashboard.totalUsersDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">1,234</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.totalItems')}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{t('dashboard.totalItemsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">567</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.activeSessions')}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{t('dashboard.activeSessionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">89</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.performance')}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{t('dashboard.performanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">98%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
