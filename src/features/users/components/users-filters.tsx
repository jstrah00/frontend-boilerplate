import { memo } from "react"
import { useTranslation } from "react-i18next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface UsersFiltersProps {
  statusFilter: string
  roleFilter: string
  onStatusChange: (value: string) => void
  onRoleChange: (value: string) => void
}

export const UsersFilters = memo(function UsersFilters({
  statusFilter,
  roleFilter,
  onStatusChange,
  onRoleChange,
}: UsersFiltersProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="w-[90px] sm:w-[140px]">
        <Label htmlFor="status-filter" className="sr-only">
          {t('users.filters.filterByStatus')}
        </Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter" className="h-8 sm:h-9 text-[10px] sm:text-sm px-2 sm:px-3">
            <SelectValue placeholder={t('users.filters.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.filters.allStatuses')}</SelectItem>
            <SelectItem value="active">{t('users.filters.active')}</SelectItem>
            <SelectItem value="inactive">{t('users.filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[90px] sm:w-[140px]">
        <Label htmlFor="role-filter" className="sr-only">
          {t('users.filters.filterByRole')}
        </Label>
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger id="role-filter" className="h-8 sm:h-9 text-[10px] sm:text-sm px-2 sm:px-3">
            <SelectValue placeholder={t('users.filters.allRoles')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.filters.allRoles')}</SelectItem>
            <SelectItem value="admin">{t('users.filters.admin')}</SelectItem>
            <SelectItem value="user">{t('users.filters.user')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
})
