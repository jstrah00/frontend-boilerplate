import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { usersApi } from "../api/users.api"
import { USERS_QUERY_KEY } from "./use-users"

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
      toast.success(i18n.t('users.toast.deleteSuccess'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('users.toast.deleteError'))
    },
  })
}
