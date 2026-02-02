import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-4xl">403</CardTitle>
          <CardDescription>{t('errors.forbidden')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('errors.noPermission')}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              {t('errors.goBack')}
            </Button>
            <Button onClick={() => navigate('/')}>{t('errors.goHome')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
