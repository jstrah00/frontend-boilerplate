import { memo, useEffect } from "react"
import { useForm, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "../api/users.api"
import { userCreateSchema, userUpdateSchema, UserCreateInput, UserUpdateInput } from "../schemas"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UserCreateInput | UserUpdateInput) => void
  user?: User | null
  isLoading?: boolean
}

export const UserFormDialog = memo(function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading,
}: UserFormDialogProps) {
  const { t } = useTranslation()
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FieldValues>({
    resolver: zodResolver(isEditing ? userUpdateSchema : userCreateSchema),
    defaultValues: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status,
        }
      : {
          email: "",
          first_name: "",
          last_name: "",
          password: "",
          role: "user" as const,
        },
  })

  const role = watch("role")

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
      })
    } else {
      reset({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        role: "user",
      })
    }
  }, [user, reset])

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data as UserCreateInput | UserUpdateInput)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('users.editUser') : t('users.createUser')}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('users.form.updateDescription')
              : t('users.form.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            {!isEditing && (
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="email" className="text-sm">{t('users.form.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('users.form.emailPlaceholder')}
                  className="h-9 sm:h-10"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.email.message as string}</p>
                )}
              </div>
            )}

            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="first_name" className="text-sm">{t('users.form.firstName')}</Label>
              <Input
                id="first_name"
                placeholder={t('users.form.firstNamePlaceholder')}
                className="h-9 sm:h-10"
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="text-xs sm:text-sm text-destructive">{String(errors.first_name.message)}</p>
              )}
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="last_name" className="text-sm">{t('users.form.lastName')}</Label>
              <Input
                id="last_name"
                placeholder={t('users.form.lastNamePlaceholder')}
                className="h-9 sm:h-10"
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="text-xs sm:text-sm text-destructive">{String(errors.last_name.message)}</p>
              )}
            </div>

            {!isEditing && (
              <>
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor="password" className="text-sm">{t('users.form.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('users.form.passwordPlaceholder')}
                    className="h-9 sm:h-10"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs sm:text-sm text-destructive">{errors.password.message as string}</p>
                  )}
                </div>

                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor="role" className="text-sm">{t('users.form.role')}</Label>
                  <Select
                    value={role as string}
                    onValueChange={(value) => setValue("role", value)}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder={t('users.form.rolePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t('users.filters.user')}</SelectItem>
                      <SelectItem value="admin">{t('users.filters.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs sm:text-sm text-destructive">{errors.role.message as string}</p>
                  )}
                </div>
              </>
            )}

            {isEditing && (
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="status" className="text-sm">{t('users.form.status')}</Label>
                <Select
                  value={watch("status") as string}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue placeholder={t('users.form.statusPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('users.filters.active')}</SelectItem>
                    <SelectItem value="inactive">{t('users.filters.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.status.message as string}</p>
                )}
              </div>
            )}
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
              {isLoading ? t('users.actions.saving') : isEditing ? t('users.actions.update') : t('users.actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})
