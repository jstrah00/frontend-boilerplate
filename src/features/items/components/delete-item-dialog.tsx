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
import { useTranslation } from "react-i18next"
import { Item } from "../api/items.api"

interface DeleteItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  item: Item | null
  isLoading?: boolean
}

export function DeleteItemDialog({
  open,
  onOpenChange,
  onConfirm,
  item,
  isLoading,
}: DeleteItemDialogProps) {
  const { t } = useTranslation()
  if (!item) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('items.deleteConfirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('items.deleteConfirm.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('items.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('items.actions.deleting') : t('items.actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
