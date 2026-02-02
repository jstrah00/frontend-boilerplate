import { useState, useEffect } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { DataTableToolbarProps } from "./types"

export function DataTableToolbar({
  onSearch,
  searchPlaceholder = "Search...",
  children,
}: DataTableToolbarProps) {
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, onSearch])

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {onSearch && (
        <div className="relative w-full sm:w-auto sm:min-w-[180px] md:min-w-[280px]">
          <Search className="absolute left-2 top-1.5 sm:top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>
      )}
      {children && (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
