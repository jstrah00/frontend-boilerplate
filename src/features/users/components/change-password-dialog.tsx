import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trans, useTranslation } from "react-i18next"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "../api/users.api"
import { passwordChangeSchema, PasswordChangeInput } from "../schemas"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PasswordChangeInput) => void
  user: User | null
  isLoading?: boolean
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading,
}: ChangePasswordDialogProps) {
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

  useEffect(() => {
    if (open) {
      reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    }
  }, [open, reset])

  const handleFormSubmit = (data: PasswordChangeInput) => {
    onSubmit(data)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('users.changePassword.title')}</DialogTitle>
          <DialogDescription>
            <Trans
              i18nKey="users.changePassword.description"
              values={{ name: `${user.first_name} ${user.last_name}` }}
              components={{ strong: <span className="font-semibold" /> }}
            />
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="current_password" className="text-sm">{t('users.changePassword.currentPassword')}</Label>
              <Input
                id="current_password"
                type="password"
                placeholder={t('users.changePassword.placeholder')}
                className="h-9 sm:h-10"
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="new_password" className="text-sm">{t('users.changePassword.newPassword')}</Label>
              <Input
                id="new_password"
                type="password"
                placeholder={t('users.changePassword.placeholder')}
                className="h-9 sm:h-10"
                {...register("new_password")}
              />
              {errors.new_password && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="confirm_password" className="text-sm">{t('users.changePassword.confirmPassword')}</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder={t('users.changePassword.placeholder')}
                className="h-9 sm:h-10"
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('users.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('users.actions.changing') : t('users.actions.changePassword')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
