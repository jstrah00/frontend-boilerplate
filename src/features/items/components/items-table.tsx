import { memo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Item } from "../api/items.api"
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
import { formatDate, truncateText } from "@/lib/formatters"

interface ItemsTableProps {
  items: Item[]
  isLoading: boolean
  pagination: {
    pageIndex: number
    pageSize: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  onSearch?: (query: string) => void
  currentUserId?: string
  toolbar?: React.ReactNode
}

export const ItemsTable = memo(function ItemsTable({
  items,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onSearch,
  currentUserId,
  toolbar,
}: ItemsTableProps) {
  const { t } = useTranslation()
  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: "title",
      header: t('items.table.title'),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">{item.title}</span>
            <Badge variant={item.status === "active" ? "success" : "secondary"} className="sm:hidden w-fit text-[9px] px-1.5 py-0 h-4">
              {item.status}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: () => <span className="hidden sm:inline">{t('items.table.description')}</span>,
      cell: ({ row }) => (
        <div className="text-muted-foreground hidden sm:block">
          {truncateText(row.original.description || "", 50)}
        </div>
      ),
    },
    {
      accessorKey: "owner_email",
      header: () => <span className="hidden lg:inline">{t('items.table.owner')}</span>,
      cell: ({ row }) => {
        const ownerEmail = row.original.owner_email
        return <span className="hidden lg:inline">{ownerEmail || t('common.unknown')}</span>
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="hidden sm:inline">{t('items.table.status')}</span>,
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === "active" ? "success" : "secondary"} className="hidden sm:inline-flex whitespace-nowrap">
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: () => <span className="hidden md:inline">{t('items.table.createdAt')}</span>,
      cell: ({ row }) => (
        <span className="hidden md:inline whitespace-nowrap">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        const isOwner = currentUserId === item.owner_id

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('items.table.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('items.actions.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {t('items.actions.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      pagination={pagination}
      onSearch={onSearch}
      searchPlaceholder={t('items.searchPlaceholder')}
      toolbar={toolbar}
      emptyMessage={t('items.noItemsFound')}
      emptyDescription={t('items.createFirstItem')}
    />
  )
})
