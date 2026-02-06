import { Chat } from 'stream-chat-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/store'
import { useChatClient } from '../hooks/use-chat-client'
import { ChatSidebar } from '../components/chat-sidebar'
import { ChatWindow } from '../components/chat-window'
import 'stream-chat-react/dist/css/v2/index.css'

export function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { client, isLoading, error } = useChatClient()

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive text-lg font-semibold">
                {t('chat.errorConnecting')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('chat.errorDetails')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !client) {
    return (
      <div className="w-full max-w-7xl mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
            <p className="text-center text-muted-foreground mt-4">
              {t('chat.connecting')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)]">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-y-auto">
            <ChatSidebar currentUserId={String(user?.id)} />
          </div>
          <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
            <ChatWindow />
          </div>
        </div>
      </Chat>
    </div>
  )
}
