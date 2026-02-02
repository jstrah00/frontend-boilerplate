import { useQuery } from "@tanstack/react-query"
import { usersApi, UsersListParams } from "../api/users.api"

export const USERS_QUERY_KEY = "users"

export function useUsers(params: UsersListParams = {}) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => usersApi.getUsers(params),
  })
}
