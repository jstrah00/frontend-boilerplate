import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChatContext } from 'stream-chat-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { chatApi } from '../api/chat.api'
import { useQuery } from '@tanstack/react-query'
import type { ChatUser } from '@/types/models'
import { useAuth } from '@/store'

export function NewConversationDialog() {
  const { t } = useTranslation()
  const { client, setActiveChannel } = useChatContext()
  const { user: currentUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['chat-users'],
    queryFn: () => chatApi.getUsers(),
    enabled: open,
  })

  const startConversation = async (targetUser: ChatUser) => {
    if (!client || !currentUser) return

    setCreating(true)
    try {
      const currentUserId = String(currentUser.id)
      const targetUserId = targetUser.id

      const channel = client.channel('messaging', {
        members: [currentUserId, targetUserId],
      })

      await channel.watch()
      setActiveChannel(channel)
      setOpen(false)
    } catch (err) {
      console.error('Failed to create conversation:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          {t('chat.newMessage')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('chat.newMessage')}</DialogTitle>
          <DialogDescription>{t('chat.selectUser')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : !users || users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('chat.noUsersAvailable')}
            </p>
          ) : (
            users.map((u: ChatUser) => (
              <button
                key={u.id}
                onClick={() => startConversation(u)}
                disabled={creating}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {u.first_name[0]}{u.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
