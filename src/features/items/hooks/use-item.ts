import { useQuery } from "@tanstack/react-query"
import { itemsApi } from "../api/items.api"
import { ITEMS_QUERY_KEY } from "./use-items"

export function useItem(id: string) {
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, id],
    queryFn: () => itemsApi.getItem(id),
    enabled: !!id,
  })
}
