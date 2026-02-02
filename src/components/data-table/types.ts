import { ColumnDef } from "@tanstack/react-table"

export interface DataTablePagination {
  pageIndex: number
  pageSize: number
  totalPages: number
  totalItems?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  pagination?: DataTablePagination
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  toolbar?: React.ReactNode
  emptyMessage?: string
  emptyDescription?: string
}

export interface DataTableToolbarProps {
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
}

export interface DataTablePaginationProps {
  pagination: DataTablePagination
}
