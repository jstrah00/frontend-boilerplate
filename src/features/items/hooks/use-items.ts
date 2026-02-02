import { useQuery } from "@tanstack/react-query"
import { itemsApi, ItemsListParams } from "../api/items.api"

export const ITEMS_QUERY_KEY = "items"

export function useItems(params: ItemsListParams = {}) {
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, params],
    queryFn: () => itemsApi.getItems(params),
  })
}
