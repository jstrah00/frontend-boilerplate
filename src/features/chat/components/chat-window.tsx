import {
  Channel,
  MessageList,
  MessageInput,
  Thread,
  Window,
  ChannelHeader,
} from 'stream-chat-react'

export function ChatWindow() {
  return (
    <Channel>
      <Window>
        <ChannelHeader />
        <MessageList />
        <MessageInput />
      </Window>
      <Thread />
    </Channel>
  )
}
