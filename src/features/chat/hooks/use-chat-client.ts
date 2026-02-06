import { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import { useAuth } from '@/store'
import { useChatToken } from './use-chat-token'
import { debugLog, debugError } from '@/lib/debug'

export function useChatClient() {
  const { user } = useAuth()
  const { data: tokenData, isLoading: isTokenLoading, error: tokenError } = useChatToken()
  const [client, setClient] = useState<StreamChat | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user || !tokenData) return

    let didCancel = false
    const userId = String(user.id)

    const connect = async () => {
      setIsConnecting(true)
      setConnectionError(null)

      try {
        debugLog('[Chat] Connecting...', { userId })

        const chatClient = new StreamChat(tokenData.api_key)

        // Disconnect any existing user first
        if (chatClient.userID && chatClient.userID !== userId) {
          await chatClient.disconnectUser()
        }

        await chatClient.connectUser(
          {
            id: userId,
            name: `${user.first_name} ${user.last_name}`,
          },
          tokenData.token
        )

        if (!didCancel) {
          debugLog('[Chat] Connected')
          setClient(chatClient)
        } else {
          chatClient.disconnectUser()
        }
      } catch (err) {
        debugError('[Chat] Connection failed:', err)
        if (!didCancel) {
          setConnectionError(err instanceof Error ? err : new Error('Connection failed'))
        }
      } finally {
        if (!didCancel) {
          setIsConnecting(false)
        }
      }
    }

    connect()

    return () => {
      didCancel = true
      setClient((prev) => {
        if (prev) {
          debugLog('[Chat] Disconnecting...')
          prev.disconnectUser()
        }
        return null
      })
    }
  }, [user, tokenData])

  return {
    client,
    isLoading: isTokenLoading || isConnecting,
    error: tokenError || connectionError,
  }
}
