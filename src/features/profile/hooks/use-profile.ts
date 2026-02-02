import { useQuery } from "@tanstack/react-query"
import { profileApi } from "../api/profile.api"

export const PROFILE_QUERY_KEY = "profile"

export function useProfile() {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => profileApi.getProfile(),
  })
}
