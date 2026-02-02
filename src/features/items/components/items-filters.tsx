import { memo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"

interface ItemsFiltersProps {
  statusFilter: string
  onStatusChange: (value: string) => void
}

export const ItemsFilters = memo(function ItemsFilters({
  statusFilter,
  onStatusChange,
}: ItemsFiltersProps) {
  const { t } = useTranslation()
  return (
    <div className="w-[90px] sm:w-[150px]">
      <Label htmlFor="status-filter" className="sr-only">
        {t('items.filters.filterByStatus')}
      </Label>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger id="status-filter" className="h-8 sm:h-9 text-[10px] sm:text-sm px-2 sm:px-3">
          <SelectValue placeholder={t('items.filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('items.filters.allStatuses')}</SelectItem>
          <SelectItem value="active">{t('items.filters.active')}</SelectItem>
          <SelectItem value="archived">{t('items.filters.archived')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
})
