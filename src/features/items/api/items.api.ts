import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import { ItemCreateInput, ItemUpdateInput } from '../schemas'
import type { Item, ItemsListResponse, ItemsListParams } from '@/types/models'

export type { Item, ItemsListResponse, ItemsListParams }

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
