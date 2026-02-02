import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/store"
import { debugError } from "@/lib/debug"
import { ApiError } from "@/types/api-error"
import { Item } from "../api/items.api"
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from "../hooks"
import { ItemsTable } from "../components/items-table"
import { ItemFormDialog } from "../components/item-form-dialog"
import { DeleteItemDialog } from "../components/delete-item-dialog"
import { ItemsFilters } from "../components/items-filters"
import { ItemCreateInput, ItemUpdateInput } from "../schemas"

export function ItemsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)

  const { user } = useAuth()

  const { data: itemsData, isLoading, error } = useItems({
    skip: page * pageSize,
    limit: pageSize,
  })

  const createItemMutation = useCreateItem()
  const updateItemMutation = useUpdateItem()
  const deleteItemMutation = useDeleteItem()

  const items = itemsData?.items || []
  const totalItems = itemsData?.total || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleCreateItem = async (data: ItemCreateInput | ItemUpdateInput) => {
    await createItemMutation.mutateAsync(data as ItemCreateInput)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateItem = async (data: ItemCreateInput | ItemUpdateInput) => {
    if (!editingItem) return
    await updateItemMutation.mutateAsync({ id: editingItem.id, data: data as ItemUpdateInput })
    setEditingItem(null)
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return
    await deleteItemMutation.mutateAsync(deletingItem.id)
    setDeletingItem(null)
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (error) {
    debugError('[Items Page] Error loading items:', error)
    const apiError = error as ApiError
    const errorMessage = apiError.response?.data?.detail ||
                        apiError.message ||
                        t('errors.unknownError')
    const errorStatus = apiError.response?.status

    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive text-lg font-semibold">
                {t('items.errorLoading')}
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Message: {errorMessage}</p>
                {errorStatus && <p>Status: {errorStatus}</p>}
                <p className="text-xs mt-4">
                  Check the browser console for more details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 border-b bg-muted/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">{t('items.management')}</CardTitle>
              <CardDescription className="text-[11px] sm:text-sm">{t('items.description')}</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="w-full sm:w-auto">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('items.addItem')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-4 pb-3 sm:px-4 sm:pt-5 sm:pb-4 md:px-6 md:pt-6 md:pb-5">
          <ItemsTable
            items={filteredItems}
            isLoading={isLoading}
            pagination={{
              pageIndex: page,
              pageSize,
              totalPages,
              totalItems,
              onPageChange: setPage,
            }}
            onEdit={setEditingItem}
            onDelete={setDeletingItem}
            onSearch={setSearchQuery}
            currentUserId={user?.id ? String(user.id) : undefined}
            toolbar={
              <ItemsFilters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            }
          />
        </CardContent>
      </Card>

      <ItemFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateItem}
        isLoading={createItemMutation.isPending}
      />

      <ItemFormDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSubmit={handleUpdateItem}
        item={editingItem}
        isLoading={updateItemMutation.isPending}
      />

      <DeleteItemDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        item={deletingItem}
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  )
}
