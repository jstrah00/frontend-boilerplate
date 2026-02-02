import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { usersApi } from "../api/users.api"
import { PasswordChangeInput } from "../schemas"

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PasswordChangeInput }) =>
      usersApi.changePassword(id, data),
    onSuccess: () => {
      toast.success(i18n.t('users.toast.passwordChangeSuccess'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('users.toast.passwordChangeError'))
    },
  })
}
