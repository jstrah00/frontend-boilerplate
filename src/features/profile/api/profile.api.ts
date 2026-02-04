import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useStore } from '@/store'
import { ProfileUpdateInput, PasswordChangeInput } from '../schemas'
import type { UserProfile } from '@/types/models'

export type { UserProfile }

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME)
    return response.data
  },

  updateProfile: async (data: ProfileUpdateInput): Promise<UserProfile> => {
    const response = await apiClient.patch(API_ENDPOINTS.PROFILE.UPDATE, data)
    return response.data
  },

  changePassword: async (data: PasswordChangeInput): Promise<void> => {
    const { user } = useStore.getState()
    if (!user?.id) throw new Error('User not authenticated')

    await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD(user.id), {
      current_password: data.current_password,
      new_password: data.new_password,
    })
  },
}
