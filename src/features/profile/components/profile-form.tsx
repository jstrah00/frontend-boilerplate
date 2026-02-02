import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserProfile } from "../api/profile.api"
import { profileUpdateSchema, ProfileUpdateInput } from "../schemas"

interface ProfileFormProps {
  profile: UserProfile
  onSubmit: (data: ProfileUpdateInput) => void
  isLoading?: boolean
}

export function ProfileForm({ profile, onSubmit, isLoading }: ProfileFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
  })

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 border-b bg-muted/30">
        <CardTitle className="text-sm sm:text-base font-semibold">{t('profile.form.title')}</CardTitle>
        <CardDescription className="text-[11px] sm:text-sm">{t('profile.form.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">{t('profile.form.email')}</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted h-9 sm:h-10 text-xs sm:text-sm"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t('profile.form.emailCannotChange')}
            </p>
          </div>

          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="first_name" className="text-xs sm:text-sm">{t('profile.form.firstName')}</Label>
            <Input
              id="first_name"
              placeholder={t('profile.form.firstNamePlaceholder')}
              className="h-9 sm:h-10 text-xs sm:text-sm"
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-[10px] sm:text-xs text-destructive">{errors.first_name.message}</p>
            )}
          </div>

          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="last_name" className="text-xs sm:text-sm">{t('profile.form.lastName')}</Label>
            <Input
              id="last_name"
              placeholder={t('profile.form.lastNamePlaceholder')}
              className="h-9 sm:h-10 text-xs sm:text-sm"
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-[10px] sm:text-xs text-destructive">{errors.last_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="role" className="text-xs sm:text-sm">{t('profile.form.role')}</Label>
              <Input
                id="role"
                value={profile.role}
                disabled
                className="bg-muted capitalize h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="status" className="text-xs sm:text-sm">{t('profile.form.status')}</Label>
              <Input
                id="status"
                value={profile.status}
                disabled
                className="bg-muted capitalize h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} size="sm" className="w-full sm:w-auto">
            {isLoading ? t('profile.form.saving') : t('profile.form.saveChanges')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
