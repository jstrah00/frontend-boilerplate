import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTablePaginationProps } from "./types"

export function DataTablePagination({ pagination }: DataTablePaginationProps) {
  const { t } = useTranslation()
  const {
    pageIndex,
    pageSize,
    totalPages,
    totalItems,
    onPageChange,
    onPageSizeChange,
  } = pagination

  const currentPage = pageIndex + 1

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between px-1 sm:px-2">
      <div className="text-[10px] sm:text-sm text-muted-foreground text-center sm:text-left">
        {totalItems !== undefined && (
          <span>
            {totalItems} total {totalItems === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:gap-4 lg:gap-8">
        {onPageSizeChange && (
          <div className="hidden sm:flex items-center space-x-2">
            <p className="text-sm font-medium">{t('pagination.rowsPerPage')}</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center justify-center text-[10px] sm:text-sm font-medium whitespace-nowrap">
          <span className="hidden sm:inline">Page </span>
          <span>{currentPage} / {totalPages}</span>
        </div>
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
