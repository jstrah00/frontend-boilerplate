import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { itemsApi } from "../api/items.api"
import { ITEMS_QUERY_KEY } from "./use-items"

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => itemsApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ITEMS_QUERY_KEY] })
      toast.success(i18n.t('items.toast.deleteSuccess'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('items.toast.deleteError'))
    },
  })
}
