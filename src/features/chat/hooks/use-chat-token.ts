import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../api/chat.api'

export const CHAT_TOKEN_QUERY_KEY = 'chat-token'

export function useChatToken() {
  return useQuery({
    queryKey: [CHAT_TOKEN_QUERY_KEY],
    queryFn: () => chatApi.getToken(),
    staleTime: 1000 * 60 * 25, // 25 minutes (before 30min token expiry)
    retry: 2,
  })
}
