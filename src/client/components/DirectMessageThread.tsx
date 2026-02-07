import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import {
  Button,
  Clock,
  ResizibleGhostInput,
} from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  useDirectMessages,
  useSendDirectMessage,
  DirectMessageRecord,
} from '#client/queries'
import { sync } from '../sync'

const MAX_DM_LENGTH = 2000

interface DirectMessageThreadProps {
  userId: string
}

export const DirectMessageThread: React.FC<DirectMessageThreadProps> = ({ userId }) => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const me = useStore(stores.me)
  const isTouchDevice = useStore(stores.isTouchDevice)
  const queryClient = useQueryClient()

  const [message, setMessage] = React.useState('')
  const [messages, setMessages] = React.useState<DirectMessageRecord[]>([])
  const hasInitiallyLoaded = React.useRef(false)

  const { data: fetchedData } = useDirectMessages(userId)
  const { mutate: sendDirectMessage } = useSendDirectMessage({
    onSuccess: () => setMessage(''),
  })

  const onChangeMessage = React.useCallback((value: string) => {
    setMessage(
      value.length <= MAX_DM_LENGTH
        ? value
        : value.slice(0, MAX_DM_LENGTH)
    )
  }, [])

  // Load messages from API on initial mount
  React.useEffect(() => {
    if (fetchedData?.messages && !hasInitiallyLoaded.current) {
      setMessages(fetchedData.messages)
      hasInitiallyLoaded.current = true
    }
  }, [fetchedData])

  // Reset on unmount
  React.useEffect(() => {
    return () => {
      hasInitiallyLoaded.current = false
    }
  }, [])

  // Listen for new direct messages via SSE
  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message', (data: any) => {
      // Only add messages that are part of this thread
      if (
        (data.senderId === userId && data.receiverId === me?.id) ||
        (data.senderId === me?.id && data.receiverId === userId)
      ) {
        setMessages((prev) => {
          if (prev.some((x) => x.id === data.id)) return prev
          return [
            {
              id: data.id,
              senderId: data.senderId,
              receiverId: data.receiverId,
              message: data.message,
              createdAt: data.createdAt,
              updatedAt: data.createdAt,
              isMine: data.senderId === me?.id,
            },
            ...prev,
          ]
        })
      }
    })
    return dispose
  }, [userId, me?.id])

  const onSubmitMessage = React.useCallback(
    (ev?: React.FormEvent) => {
      ev?.preventDefault()
      if (!message.trim()) return
      sendDirectMessage({ receiverId: userId, message })
    },
    [message, userId, sendDirectMessage]
  )

  const onKeyDown = React.useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.key === 'Enter') {
        if (isTouchDevice) return
        if (!ev.metaKey && !ev.shiftKey) {
          onSubmitMessage()
          ev.preventDefault()
        }
      }
    },
    [onSubmitMessage, isTouchDevice]
  )

  React.useEffect(() => {
    formRef.current?.querySelector('textarea')?.focus()
  }, [])

  const otherUserName = fetchedData?.otherUser
    ? `${fetchedData.otherUser.firstName || ''} ${fetchedData.otherUser.lastName || ''}`.trim() || 'User'
    : 'User'

  return (
    <div className="max-w-[700px]">
      <div className="mb-40">
        <span className="opacity-30">Conversation with {otherUserName}</span>
      </div>

      <div className="flex items-center mb-80">
        <span className="mr-8 whitespace-nowrap leading-normal">
          {me!.firstName}
        </span>
        <form
          onSubmit={onSubmitMessage}
          className="flex items-center gap-x-8 flex-1"
          ref={formRef}
        >
          <ResizibleGhostInput
            direction="vh"
            value={message}
            onChange={onChangeMessage}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            containerClassName="flex-grow leading-normal"
            className="leading-normal"
          />
          <div className="flex items-center gap-x-8">
            <span className="text-acc/40 pointer-events-none select-none whitespace-nowrap leading-normal">
              <Clock format="hh:mm A" interval={5e3} />
            </span>
            <Button
              type="submit"
              kind="secondary"
              size="small"
              disabled={!message.trim()}
            >
              Send
            </Button>
          </div>
        </form>
      </div>

      <div>
        {messages.map((x, i) => {
          return (
            <div
              key={x.id}
              className={cn(
                'group flex items-start gap-x-8 mb-8 -mx-4 px-4 py-2 rounded',
                x.isMine ? 'opacity-30' : ''
              )}
            >
              <span className="whitespace-nowrap pr-4">
                {x.isMine ? me!.firstName : otherUserName}
              </span>
              <div
                className="whitespace-breakspaces"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {x.message}
              </div>

              {!isTouchDevice && (
                <div className="text-acc/0 transition-opacity select-none pointer-events-none whitespace-nowrap group-hover:text-acc/40">
                  <MessageTimeLabel dateString={x.createdAt} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MessageTimeLabel: React.FC<{ dateString: string }> = ({ dateString }) => {
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const date = dayjs(dateString)
  const now = dayjs()
  const isPast = now.diff(date, 'day') >= 1
  const timeFormat = isTimeFormat12h ? 'hh:mm A' : 'HH:mm'
  const fromNow = date.fromNow()
  return (
    <span>
      {date.format(timeFormat)}
      {isPast && `, ${fromNow}`}
    </span>
  )
}
