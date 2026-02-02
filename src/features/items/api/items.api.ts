import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import { ItemCreateInput, ItemUpdateInput } from "../schemas"

export interface Item {
  id: string
  title: string
  description?: string
  owner_id: string
  owner_email?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ItemsListResponse {
  items: Item[]
  total: number
  skip: number
  limit: number
}

export interface ItemsListParams {
  skip?: number
  limit?: number
}

export const itemsApi = {
  getItems: async (params: ItemsListParams = {}): Promise<ItemsListResponse> => {
    const { skip = 0, limit = 10 } = params
    const response = await apiClient.get(API_ENDPOINTS.ITEMS.LIST, {
      params: { skip, limit },
    })
    return response.data
  },

  getItem: async (id: string): Promise<Item> => {
    const response = await apiClient.get(API_ENDPOINTS.ITEMS.DETAIL(id))
    return response.data
  },

  createItem: async (data: ItemCreateInput): Promise<Item> => {
    const response = await apiClient.post(API_ENDPOINTS.ITEMS.CREATE, data)
    return response.data
  },

  updateItem: async (id: string, data: ItemUpdateInput): Promise<Item> => {
    const response = await apiClient.patch(API_ENDPOINTS.ITEMS.UPDATE(id), data)
    return response.data
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ITEMS.DELETE(id))
  },
}
