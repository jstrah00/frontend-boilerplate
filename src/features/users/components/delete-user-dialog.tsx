import { Trans, useTranslation } from "react-i18next"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User } from "../api/users.api"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  user: User | null
  isLoading?: boolean
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  user,
  isLoading,
}: DeleteUserDialogProps) {
  const { t } = useTranslation()

  if (!user) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('users.deleteConfirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="users.deleteConfirm.description"
              values={{ name: `${user.first_name} ${user.last_name}`, email: user.email }}
              components={{ strong: <span className="font-semibold" /> }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('users.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('users.actions.deleting') : t('users.actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
