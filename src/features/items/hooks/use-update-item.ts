import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { itemsApi } from "../api/items.api"
import { ItemUpdateInput } from "../schemas"
import { ITEMS_QUERY_KEY } from "./use-items"

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemUpdateInput }) =>
      itemsApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ITEMS_QUERY_KEY] })
      toast.success(i18n.t('items.toast.updateSuccess'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('items.toast.updateError'))
    },
  })
}
