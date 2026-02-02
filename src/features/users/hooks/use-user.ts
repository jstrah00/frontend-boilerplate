import { useQuery } from "@tanstack/react-query"
import { usersApi } from "../api/users.api"
import { USERS_QUERY_KEY } from "./use-users"

export function useUser(id: string) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  })
}
