import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { ChatTokenResponse, ChatUser } from '@/types/models'

export type { ChatTokenResponse, ChatUser }

export const chatApi = {
  getToken: async (): Promise<ChatTokenResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.CHAT.TOKEN)
    return response.data
  },

  getUsers: async (): Promise<ChatUser[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CHAT.USERS)
    return response.data
  },
}
