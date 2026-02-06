import { ChannelList } from 'stream-chat-react'
import { useTranslation } from 'react-i18next'
import { NewConversationDialog } from './new-conversation-dialog'

interface ChatSidebarProps {
  currentUserId: string
}

export function ChatSidebar({ currentUserId }: ChatSidebarProps) {
  const { t } = useTranslation()

  const filters = {
    type: 'messaging' as const,
    members: { $in: [currentUserId] },
  }

  const sort = { last_message_at: -1 as const }
  const options = { limit: 20 }

  return (
    <div className="h-full border-r">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('chat.conversations')}</h2>
        <NewConversationDialog />
      </div>
      <ChannelList filters={filters} sort={sort} options={options} />
    </div>
  )
}
