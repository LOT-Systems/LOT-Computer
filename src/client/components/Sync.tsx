/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { $featureUnlocks } from '#client/stores/evolution'
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
  useEmails,
  useSendEmail,
  useMarkEmailRead,
  EmailRecord,
} from '#client/queries'
import { sync } from '../sync'
import { PublicChatMessage, UserTag } from '#shared/types'
import {
  SYNC_CHAT_MESSAGES_TO_SHOW,
  MAX_SYNC_CHAT_MESSAGE_LENGTH,
  isBlankMessage,
} from '#shared/constants'

const CHAT_ALLOWED_TAGS: string[] = [
  UserTag.Admin,
  UserTag.RND,
  UserTag.Usership,
  UserTag.Onyx,
  UserTag.Legacy,
].map((t) => t.toLowerCase())

export const Sync = React.memo(function SyncInner() {
  const formRef = React.useRef<HTMLFormElement>(null)
  const me = useStore(stores.me)
  const isTouchDevice = useStore(stores.isTouchDevice)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const featureUnlocks = useStore($featureUnlocks)
  const queryClient = useQueryClient()

  const [message, setMessage] = React.useState('')
  // SSE-received messages not yet reflected in the API response
  const [sseMessages, setSseMessages] = React.useState<PublicChatMessage[]>([])

  // Check if current user can access /us section (admin-level access)
  const canAccessUserProfiles = React.useMemo(() => {
    if (!me) return false
    if (me.isAdmin) return true
    return me.tags.some((tag) =>
      tag.toLowerCase() === UserTag.Usership.toLowerCase() ||
      tag.toLowerCase() === UserTag.RND.toLowerCase()
    )
  }, [me])

  // Chat is restricted to Admin / R&D / Usership / Onyx / Legacy
  const canAccessChat = React.useMemo(() => {
    if (!me) return false
    if (me.isAdmin) return true
    return me.tags.some((tag) => CHAT_ALLOWED_TAGS.includes(tag.toLowerCase()))
  }, [me])

  const { data: fetchedMessages } = useChatMessages()
  const { mutate: createChatMessage } = useCreateChatMessage({
    onSuccess: () => setMessage(''),
  })
  const { mutate: likeChatMessage } = useLikeChatMessage({
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/chat-messages'])
    }
  })

  // ---- LOT® Email -------------------------------------------------------
  const { data: emailData } = useEmails({ enabled: canAccessChat })
  const { mutate: markEmailRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })
  // Reply target: set by an email's "Reply" or by the Cohort "Send email" button
  const [emailTarget, setEmailTarget] = React.useState<{ id: string; name: string } | null>(
    () => {
      try {
        const raw = sessionStorage.getItem('lot.emailDraft')
        sessionStorage.removeItem('lot.emailDraft')
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    }
  )
  const [emailBody, setEmailBody] = React.useState('')
  const [emailStatus, setEmailStatus] = React.useState<string | null>(null)
  const { mutate: sendEmail } = useSendEmail({
    onSuccess: (data) => {
      setEmailStatus(`Sent to ${data.to}`)
      setEmailBody('')
      setEmailTarget(null)
    },
    onError: (err: any) => setEmailStatus(err?.response?.data?.error || 'Email failed'),
  })
  const onSubmitEmail = React.useCallback(
    (ev: React.FormEvent) => {
      ev.preventDefault()
      if (!emailTarget || !emailBody.trim()) return
      setEmailStatus(null)
      sendEmail({ toId: emailTarget.id, body: emailBody })
    },
    [emailTarget, emailBody, sendEmail]
  )

  // Ensure fresh data on mount (filters suspended users)
  React.useEffect(() => {
    queryClient.invalidateQueries(['/api/chat-messages'])
  }, [])

  // Merge: SSE-only messages (not yet in API response) prepended to API list
  const messages = React.useMemo(() => {
    const fetched = fetchedMessages || []
    const fetchedIds = new Set(fetched.map((m) => m.id))
    const fresh = sseMessages.filter((m) => !fetchedIds.has(m.id))
    const combined = [...fresh, ...fetched].filter((m) => !isBlankMessage(m.message))
    return canAccessUserProfiles ? combined : combined.slice(0, SYNC_CHAT_MESSAGES_TO_SHOW)
  }, [fetchedMessages, sseMessages, canAccessUserProfiles])

  React.useEffect(() => {
    const { dispose: disposeChatMessageListener } = sync.listen(
      'chat_message',
      (data) => {
        setSseMessages((prev) => {
          if (prev.some((x) => x.id === data.id)) return prev
          return [data, ...prev]
        })
      }
    )
    const { dispose: disposeChatMessageLikeListener } = sync.listen(
      'chat_message_like',
      (data) => {
        setSseMessages((prev) =>
          prev.map((x) => {
            if (x.id !== data.messageId) return x
            if (data.userId === me?.id) return { ...x, likes: data.likes, isLiked: data.isLiked }
            return { ...x, likes: data.likes }
          })
        )
        queryClient.invalidateQueries(['/api/chat-messages'])
      }
    )
    const { dispose: disposeEmailListener } = sync.listen('email' as any, () => {
      queryClient.invalidateQueries(['/api/emails'])
    })
    return () => {
      disposeChatMessageListener()
      disposeChatMessageLikeListener()
      disposeEmailListener()
    }
  }, [me?.id])

  const onChangeMessage = React.useCallback((value: string) => setMessage(value), [])

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
      likeChatMessage({ messageId })
    },
    [likeChatMessage]
  )

  const onNavigateToUserProfile = React.useCallback(
    (userId: string) => (ev: React.MouseEvent | React.TouchEvent) => {
      ev?.preventDefault()
      ev?.stopPropagation()
      // Usership users go to /us/u (internal profile within /us context)
      // Regular users go to /u (public profile for sharing)
      window.location.href = canAccessUserProfiles ? `/us/u/${userId}` : `/u/${userId}`
    },
    [canAccessUserProfiles]
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

  if (!canAccessChat) {
    return (
      <div className="max-w-[700px] text-acc/40 py-8">
        Sync is available for Usership, Onyx, Legacy, R&D, and Admin members.
      </div>
    )
  }

  return (
    <div className="max-w-[700px]">
      {(emailTarget || emailStatus || !!emailData?.emails?.length) && (
        <div className="mb-40">
          <div className="text-acc/40 mb-8">
            Email{!!emailData?.unread && ` · ${emailData.unread} new`}
            {' · '}
            <span title="In Log: /email to Name. Message — then Ctrl+Enter">/email to Name.</span>
          </div>
          {emailTarget && (
            <form onSubmit={onSubmitEmail} className="flex items-center gap-x-8 mb-8">
              <span className="whitespace-nowrap">To {emailTarget.name}</span>
              <ResizibleGhostInput
                direction="vh"
                value={emailBody}
                onChange={(v: string) => setEmailBody(v.slice(0, 2000))}
                placeholder="Write an email..."
                containerClassName="flex-grow leading-normal"
                className="leading-normal"
              />
              <Button type="submit" kind="secondary" size="small" disabled={!emailBody.trim()}>
                Send
              </Button>
              <GhostButton onClick={() => setEmailTarget(null)}>Cancel</GhostButton>
            </form>
          )}
          {emailStatus && <div className="text-acc/40 mb-8">{emailStatus}</div>}
          {(emailData?.emails || []).slice(0, 10).map((e: EmailRecord) => (
            <div
              key={e.id}
              className="group flex items-start gap-x-8 py-2"
              onMouseEnter={() => { if (!e.readAt) markEmailRead({ id: e.id }) }}
            >
              <span className={cn('whitespace-nowrap', e.readAt && 'text-acc/40')}>
                {e.senderName}
              </span>
              <div
                className={cn('whitespace-breakspaces flex-1', e.readAt && 'text-acc/40')}
                style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
              >
                {e.body}
              </div>
              <GhostButton
                className="whitespace-nowrap"
                onClick={() => {
                  setEmailStatus(null)
                  setEmailTarget({ id: e.senderId, name: e.senderName.split(' ')[0] })
                }}
              >
                Reply
              </GhostButton>
              {!isTouchDevice && (
                <div className="text-acc/0 select-none whitespace-nowrap group-hover:text-acc/40">
                  <MessageTimeLabel dateString={e.createdAt} isTimeFormat12h={isTimeFormat12h} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
                'group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded',
                i >= SYNC_CHAT_MESSAGES_TO_SHOW && 'text-acc/20'
              )}
              onClick={onToggleLike(x.id)}
            >
              {authorId && (featureUnlocks?.socialMentions || canAccessUserProfiles) ? (
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
                    'text-acc/40 select-none -mt-[2px]',
                    x.isLiked ? 'border-acc/40' : 'border-transparent'
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
                  <MessageTimeLabel dateString={x.createdAt} isTimeFormat12h={isTimeFormat12h} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

const MessageTimeLabel: React.FC<{ dateString: string | Date; isTimeFormat12h: boolean }> = ({ dateString, isTimeFormat12h }) => {
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
