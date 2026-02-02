import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { profileApi } from "../api/profile.api"
import { ProfileUpdateInput } from "../schemas"
import { PROFILE_QUERY_KEY } from "./use-profile"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProfileUpdateInput) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      toast.success(i18n.t('profile.toast.profileUpdated'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('profile.toast.profileUpdateFailed'))
    },
  })
}
