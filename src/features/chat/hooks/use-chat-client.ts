import { useCallback, useEffect, useRef, useState } from 'react'
import { StreamChat } from 'stream-chat'
import { useAuth } from '@/store'
import { useChatToken } from './use-chat-token'
import { debugLog, debugError } from '@/lib/debug'

const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

export function useChatClient() {
  const { user } = useAuth()
  const { data: tokenData, isLoading: isTokenLoading, error: tokenError } = useChatToken()
  const [client, setClient] = useState<StreamChat | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  const clientRef = useRef<StreamChat | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDisconnectedRef = useRef(false)

  const connect = useCallback(async () => {
    if (!user || !tokenData) return
    if (clientRef.current?.userID === String(user.id)) return // already connected

    setIsConnecting(true)
    setConnectionError(null)

    try {
      const userId = String(user.id)
      debugLog('[Chat] Connecting...', { userId })

      const chatClient = clientRef.current ?? new StreamChat(tokenData.api_key)

      if (chatClient.userID && chatClient.userID !== userId) {
        await chatClient.disconnectUser()
      }

      await chatClient.connectUser(
        { id: userId, name: `${user.first_name} ${user.last_name}` },
        tokenData.token,
      )

      clientRef.current = chatClient
      isDisconnectedRef.current = false
      debugLog('[Chat] Connected')
      setClient(chatClient)
    } catch (err) {
      debugError('[Chat] Connection failed:', err)
      setConnectionError(err instanceof Error ? err : new Error('Connection failed'))
    } finally {
      setIsConnecting(false)
    }
  }, [user, tokenData])

  const disconnect = useCallback(async () => {
    if (!clientRef.current?.userID) return
    debugLog('[Chat] Disconnecting (idle/hidden)...')
    isDisconnectedRef.current = true
    await clientRef.current.disconnectUser()
    setClient(null)
  }, [])

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      debugLog('[Chat] Idle timeout reached, disconnecting...')
      disconnect()
    }, IDLE_TIMEOUT_MS)
  }, [disconnect])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (!user || !tokenData) return

    connect()

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      const currentClient = clientRef.current
      if (currentClient) {
        debugLog('[Chat] Disconnecting (unmount)...')
        currentClient.disconnectUser()
        clientRef.current = null
      }
    }
  }, [user, tokenData, connect])

  // Auto-disconnect on tab hidden, reconnect on tab visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start idle timer when tab is hidden
        debugLog('[Chat] Tab hidden, starting idle timer...')
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        idleTimerRef.current = setTimeout(() => {
          debugLog('[Chat] Tab hidden for too long, disconnecting...')
          disconnect()
        }, IDLE_TIMEOUT_MS)
      } else {
        // Tab is visible again — cancel idle timer and reconnect if needed
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        if (isDisconnectedRef.current) {
          debugLog('[Chat] Tab visible again, reconnecting...')
          connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [connect, disconnect, resetIdleTimer])

  // Reset idle timer on user interaction within the chat page
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    const handler = () => {
      if (isDisconnectedRef.current) {
        connect()
      } else {
        resetIdleTimer()
      }
    }

    events.forEach((e) => document.addEventListener(e, handler))
    resetIdleTimer() // start the initial timer

    return () => {
      events.forEach((e) => document.removeEventListener(e, handler))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [connect, resetIdleTimer])

  return {
    client,
    isLoading: isTokenLoading || isConnecting,
    error: tokenError || connectionError,
  }
}
