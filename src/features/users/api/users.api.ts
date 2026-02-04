import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import { UserCreateInput, UserUpdateInput, PasswordChangeInput } from '../schemas'
import type { User, UsersListResponse, UsersListParams } from '@/types/models'

export type { User, UsersListResponse, UsersListParams }

export const usersApi = {
  getUsers: async (params: UsersListParams = {}): Promise<UsersListResponse> => {
    const { skip = 0, limit = 10 } = params
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, {
      params: { skip, limit },
    })
    return response.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id))
    return response.data
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data)
    return response.data
  },

  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id))
  },

  changePassword: async (id: string, data: PasswordChangeInput): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD(id), {
      current_password: data.current_password,
      new_password: data.new_password,
    })
  },
}
