import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import {
  Button,
  Clock,
  GhostButton,
  ResizibleGhostInput,
  Tag,
} from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  useCreateChatMessage,
  useChatMessages,
  useLikeChatMessage,
} from '#client/queries'
import { sync } from '../sync'
import { PublicChatMessage, UserTag } from '#shared/types'
import {
  SYNC_CHAT_MESSAGES_TO_SHOW,
  MAX_SYNC_CHAT_MESSAGE_LENGTH,
} from '#shared/constants'

export const Sync = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const me = useStore(stores.me)
  const isTouchDevice = useStore(stores.isTouchDevice)

  const [message, setMessage] = React.useState('')
  const [messages, setMessages] = React.useState<PublicChatMessage[]>([])

  const { data: fetchedMessages } = useChatMessages()
  const { mutate: createChatMessage } = useCreateChatMessage({
    onSuccess: () => setMessage(''),
  })
  const { mutate: likeChatMessage } = useLikeChatMessage()

  const onChangeMessage = React.useCallback((value: string) => {
    setMessage(
      value.length <= MAX_SYNC_CHAT_MESSAGE_LENGTH
        ? value
        : value.slice(0, MAX_SYNC_CHAT_MESSAGE_LENGTH)
    )
  }, [])

  React.useEffect(() => {
    if (fetchedMessages?.length) {
      setMessages(fetchedMessages)
    }
  }, [fetchedMessages])

  React.useEffect(() => {
    const { dispose: disposeChatMessageListener } = sync.listen(
      'chat_message',
      (data) => {
        setMessages((prev) => {
          if (prev.some((x) => x.id === data.id)) return prev
          const newValue = [data, ...prev]
          return me?.isAdmin
            ? newValue
            : newValue.slice(0, SYNC_CHAT_MESSAGES_TO_SHOW)
        })
      }
    )
    const { dispose: disposeChatMessageLikeListener } = sync.listen(
      'chat_message_like',
      (data) => {
        setMessages((prev) => {
          return prev.map((x) => {
            if (x.id === data.messageId) {
              // Only update likes count from SSE, keep user's own isLiked state
              return { ...x, likes: data.likes }
            }
            return x
          })
        })
      }
    )
    return () => {
      disposeChatMessageListener()
      disposeChatMessageLikeListener()
    }
  }, [])

  const onSubmitMessage = React.useCallback(
    (ev?: React.FormEvent) => {
      ev?.preventDefault()
      createChatMessage({ message })
    },
    [message]
  )

  const onToggleLike = React.useCallback(
    (messageId: string) => (ev: React.MouseEvent) => {
      ev?.preventDefault()
      ev?.stopPropagation()
      console.log('[Sync] Toggling like for message:', messageId)

      // Optimistically update isLiked state for current user
      setMessages((prev) => {
        return prev.map((x) => {
          if (x.id === messageId) {
            const newIsLiked = !x.isLiked
            const newLikes = newIsLiked ? (x.likes || 0) + 1 : Math.max(0, (x.likes || 0) - 1)
            return { ...x, likes: newLikes, isLiked: newIsLiked }
          }
          return x
        })
      })

      likeChatMessage({ messageId })
    },
    [likeChatMessage]
  )

  const onNavigateToUserProfile = React.useCallback(
    (userId: string) => (ev: React.MouseEvent | React.TouchEvent) => {
      ev?.preventDefault()
      ev?.stopPropagation()
      window.location.href = `/us/${userId}`
    },
    []
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
    [onSubmitMessage]
  )

  React.useEffect(() => {
    formRef.current?.querySelector('textarea')?.focus()
  }, [])

  return (
    <div className="max-w-[700px]">
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
          const authorObj = typeof x.author === 'object' ? x.author : null
          const authorName = typeof x.author === 'string'
            ? x.author
            : authorObj
              ? `${authorObj.firstName || ''} ${authorObj.lastName || ''}`.trim() || 'Unknown'
              : 'Unknown'
          const authorId = authorObj?.id || x.authorUserId

          return (
            <div
              key={x.id}
              className={cn(
                'group flex items-start gap-x-8 mb-8 cursor-pointer hover:bg-acc/10 -mx-4 px-4 py-2 rounded transition-colors',
                i >= SYNC_CHAT_MESSAGES_TO_SHOW && 'text-acc/20'
              )}
              onClick={onToggleLike(x.id)}
            >
              {authorId ? (
                <GhostButton
                  className="whitespace-nowrap pr-4"
                  onClick={onNavigateToUserProfile(authorId)}
                  onTouchEnd={onNavigateToUserProfile(authorId)}
                >
                  {authorName}
                </GhostButton>
              ) : (
                <span className="whitespace-nowrap -ml-4 px-4 pr-8">{authorName}</span>
              )}
              <div
                className="whitespace-breakspaces"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {x.message}
              </div>

              {!!x.likes && (
                <Tag
                  className={cn(
                    'text-acc/40 border-acc/40 select-none',
                    !x.isLiked && 'border-transparent'
                  )}
                  title="Click message to like/unlike"
                  key={`${x.id}_${x.isLiked}`}
                  fill={false}
                >
                  {x.likes}
                </Tag>
              )}

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
