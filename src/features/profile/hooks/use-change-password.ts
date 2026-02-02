import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { profileApi } from "../api/profile.api"
import { PasswordChangeInput } from "../schemas"

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: PasswordChangeInput) => profileApi.changePassword(data),
    onSuccess: () => {
      toast.success(i18n.t('profile.toast.passwordChanged'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('profile.toast.passwordChangeFailed'))
    },
  })
}
