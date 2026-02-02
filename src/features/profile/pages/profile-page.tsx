import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"
import { useProfile, useUpdateProfile, useChangePassword } from "../hooks"
import { ProfileCard } from "../components/profile-card"
import { ProfileForm } from "../components/profile-form"
import { PasswordForm } from "../components/password-form"
import { ProfileUpdateInput, PasswordChangeInput } from "../schemas"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  const handleUpdateProfile = async (data: ProfileUpdateInput) => {
    await updateProfileMutation.mutateAsync(data)
  }

  const handleChangePassword = async (data: PasswordChangeInput) => {
    await changePasswordMutation.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Skeleton className="h-32 sm:h-48 w-full rounded-xl" />
        <Skeleton className="h-64 sm:h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <p className="text-center text-muted-foreground">
          {t('profile.unableToLoad')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold">{t('profile.title')}</h1>
        <p className="text-[11px] sm:text-sm text-muted-foreground">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProfileCard profile={profile} />
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
              <TabsTrigger value="personal" className="text-xs sm:text-sm px-2 sm:px-4">{t('profile.tabs.personal')}</TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm px-2 sm:px-4">{t('profile.tabs.security')}</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-3 sm:mt-4">
              <ProfileForm
                profile={profile}
                onSubmit={handleUpdateProfile}
                isLoading={updateProfileMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-3 sm:mt-4">
              <PasswordForm
                onSubmit={handleChangePassword}
                isLoading={changePasswordMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
