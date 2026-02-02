import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { UserProfile } from "../api/profile.api"
import { formatDateLong, getInitials } from "@/lib/formatters"

interface ProfileCardProps {
  profile: UserProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 border-b bg-muted/30">
        <CardTitle className="text-sm sm:text-base font-semibold">{t('profile.overview.title')}</CardTitle>
        <CardDescription className="text-[11px] sm:text-sm">{t('profile.overview.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
            <span className="text-lg sm:text-2xl font-medium">
              {getInitials(profile.first_name, profile.last_name)}
            </span>
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base sm:text-xl font-semibold truncate">
              {profile.first_name} {profile.last_name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile.email}</p>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                {profile.role}
              </Badge>
              <Badge variant={profile.status === "active" ? "success" : "secondary"} className="text-[10px] sm:text-xs">
                {profile.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('profile.overview.memberSince')}</p>
            <p className="text-xs sm:text-sm">{formatDateLong(profile.created_at)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('profile.overview.lastUpdated')}</p>
            <p className="text-xs sm:text-sm">{formatDateLong(profile.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
