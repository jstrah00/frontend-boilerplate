import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { passwordChangeSchema, PasswordChangeInput } from "../schemas"

interface PasswordFormProps {
  onSubmit: (data: PasswordChangeInput) => void
  isLoading?: boolean
}

export function PasswordForm({ onSubmit, isLoading }: PasswordFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const handleFormSubmit = (data: PasswordChangeInput) => {
    onSubmit(data)
    reset()
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 border-b bg-muted/30">
        <CardTitle className="text-sm sm:text-base font-semibold">{t('profile.password.title')}</CardTitle>
        <CardDescription className="text-[11px] sm:text-sm">{t('profile.password.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="current_password" className="text-xs sm:text-sm">{t('profile.password.currentPassword')}</Label>
            <Input
              id="current_password"
              type="password"
              placeholder={t('profile.password.placeholder')}
              className="h-9 sm:h-10 text-xs sm:text-sm"
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.current_password.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="new_password" className="text-xs sm:text-sm">{t('profile.password.newPassword')}</Label>
            <Input
              id="new_password"
              type="password"
              placeholder={t('profile.password.placeholder')}
              className="h-9 sm:h-10 text-xs sm:text-sm"
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="confirm_password" className="text-xs sm:text-sm">{t('profile.password.confirmPassword')}</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder={t('profile.password.placeholder')}
              className="h-9 sm:h-10 text-xs sm:text-sm"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} size="sm" className="w-full sm:w-auto">
            {isLoading ? t('profile.password.changing') : t('profile.password.changeButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
