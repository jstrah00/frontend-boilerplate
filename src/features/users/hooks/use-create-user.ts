import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import i18n from "@/i18n/config"
import { ApiError } from "@/types/api-error"
import { usersApi } from "../api/users.api"
import { UserCreateInput } from "../schemas"
import { USERS_QUERY_KEY } from "./use-users"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreateInput) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
      toast.success(i18n.t('users.toast.createSuccess'))
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.detail || i18n.t('users.toast.createError'))
    },
  })
}
