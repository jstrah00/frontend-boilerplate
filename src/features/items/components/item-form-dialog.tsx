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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Item } from "../api/items.api"
import { itemCreateSchema, itemUpdateSchema, ItemCreateInput, ItemUpdateInput } from "../schemas"

interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ItemCreateInput | ItemUpdateInput) => void
  item?: Item | null
  isLoading?: boolean
}

export const ItemFormDialog = memo(function ItemFormDialog({
  open,
  onOpenChange,
  onSubmit,
  item,
  isLoading,
}: ItemFormDialogProps) {
  const { t } = useTranslation()
  const isEditing = !!item

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    resolver: zodResolver(isEditing ? itemUpdateSchema : itemCreateSchema),
    defaultValues: item
      ? {
          title: item.title,
          description: item.description || "",
        }
      : {
          title: "",
          description: "",
        },
  })

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        description: item.description || "",
      })
    } else {
      reset({
        title: "",
        description: "",
      })
    }
  }, [item, reset])

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data as ItemCreateInput | ItemUpdateInput)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('items.editItem') : t('items.createItem')}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('items.form.updateDescription')
              : t('items.form.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="title" className="text-sm">{t('items.form.title')}</Label>
              <Input
                id="title"
                placeholder={t('items.form.titlePlaceholder')}
                className="h-9 sm:h-10"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs sm:text-sm text-destructive">{String(errors.title.message)}</p>
              )}
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="description" className="text-sm">{t('items.form.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('items.form.descriptionPlaceholder')}
                rows={3}
                className="min-h-[80px] sm:min-h-[100px]"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs sm:text-sm text-destructive">{String(errors.description.message)}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('items.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('items.actions.saving') : isEditing ? t('items.actions.update') : t('items.actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})
