import { memo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash, Key } from "lucide-react"
import { useTranslation } from "react-i18next"

import { User } from "../api/users.api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table"
import { formatDate, getInitials } from "@/lib/formatters"

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  pagination: {
    pageIndex: number
    pageSize: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onChangePassword: (user: User) => void
  onSearch?: (query: string) => void
  toolbar?: React.ReactNode
}

export const UsersTable = memo(function UsersTable({
  users,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onChangePassword,
  onSearch,
  toolbar,
}: UsersTableProps) {
  const { t } = useTranslation()
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: t('users.table.email'),
      cell: ({ row }) => {
        const user = row.original
        const role = user.role
        return (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
              <span className="text-[10px] sm:text-sm font-medium">
                {getInitials(user.first_name, user.last_name)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 gap-0.5">
              <span className="font-medium text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">{user.email}</span>
              <div className="flex items-center gap-1.5 sm:hidden">
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.first_name} {user.last_name}
                </span>
                <Badge variant={role === "admin" ? "default" : "secondary"} className="text-[9px] px-1 py-0 h-4">
                  {role === "admin" ? t('users.filters.admin') : t('users.filters.user')}
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: () => <span className="hidden sm:inline">{t('users.table.fullName')}</span>,
      cell: ({ row }) => {
        const user = row.original
        return <span className="hidden sm:inline">{`${user.first_name} ${user.last_name}`}</span>
      },
    },
    {
      accessorKey: "role",
      header: () => <span className="hidden sm:inline">{t('users.table.role')}</span>,
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"} className="hidden sm:inline-flex whitespace-nowrap">
            {role === "admin" ? t('users.filters.admin') : t('users.filters.user')}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="hidden md:inline">{t('users.table.status')}</span>,
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === "active" ? "success" : "secondary"} className="hidden md:inline-flex whitespace-nowrap">
            {status === "active" ? t('users.filters.active') : t('users.filters.inactive')}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: () => <span className="hidden lg:inline">{t('users.table.createdAt')}</span>,
      cell: ({ row }) => (
        <span className="hidden lg:inline whitespace-nowrap">
          {row.original.created_at ? formatDate(row.original.created_at) : '-'}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('users.table.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('users.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangePassword(user)}>
                <Key className="mr-2 h-4 w-4" />
                {t('users.actions.changePassword')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('users.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      pagination={pagination}
      onSearch={onSearch}
      searchPlaceholder={t('users.searchPlaceholder')}
      toolbar={toolbar}
      emptyMessage={t('users.noUsersFound')}
      emptyDescription={t('users.createFirstUser')}
    />
  )
})
