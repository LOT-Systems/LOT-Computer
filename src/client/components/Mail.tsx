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
import { Button, GhostButton, ResizibleGhostInput } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  MailRecord,
  useMail,
  useMarkMailRead,
  useSendMail,
} from '#client/queries'
import { sync } from '../sync'

/** Keeps unread count + live delivery alive app-wide (renders nothing). */
export const MailBridge: React.FC = () => {
  const queryClient = useQueryClient()
  const me = useStore(stores.me)
  const { data } = useMail({ enabled: !!me })

  React.useEffect(() => {
    stores.$mailUnread.set(data?.unread ?? 0)
  }, [data?.unread])

  React.useEffect(() => {
    const { dispose } = sync.listen('mail', () => {
      queryClient.invalidateQueries(['/api/mail'])
    })
    return dispose
  }, [])
  return null
}

type Box = 'inbox' | 'sent'

export const MailPanel: React.FC = () => {
  const queryClient = useQueryClient()
  const draft = useStore(stores.$mailDraft)
  const { data } = useMail()
  const [box, setBox] = React.useState<Box>('inbox')
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [compose, setCompose] = React.useState<{
    receiverId: string
    receiverName: string
    body: string
    replyToId?: string
    subject?: string
  } | null>(null)
  const [error, setError] = React.useState('')

  const { mutate: markRead } = useMarkMailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/mail']),
  })
  const { mutate: sendMail, isLoading: isSending } = useSendMail({
    onSuccess: () => {
      setCompose(null)
      setError('')
      setBox('sent')
      queryClient.invalidateQueries(['/api/mail'])
    },
    onError: () => setError('Could not send. Try again.'),
  })

  // Hand-off from Log (/email to X) and Cohort ("Email")
  React.useEffect(() => {
    if (!draft) return
    setCompose({
      receiverId: draft.receiverId,
      receiverName: draft.receiverName,
      body: draft.body || '',
    })
    stores.$mailDraft.set(null)
  }, [draft])

  const list: MailRecord[] = (box === 'inbox' ? data?.inbox : data?.sent) || []

  const onOpen = (m: MailRecord) => {
    setOpenId(openId === m.id ? null : m.id)
    if (box === 'inbox' && !m.isRead) markRead({ id: m.id })
  }

  const onReply = (m: MailRecord) => {
    setCompose({
      receiverId: m.senderId,
      receiverName: m.senderName,
      body: '',
      replyToId: m.id,
      subject: m.subject.startsWith('Re: ') ? m.subject : `Re: ${m.subject}`,
    })
  }

  return (
    <div className="max-w-[700px]">
      <div className="flex items-center gap-x-8 mb-40">
        {(['inbox', 'sent'] as Box[]).map((b) => (
          <GhostButton
            key={b}
            className={cn('capitalize', box === b ? '' : 'text-acc/40')}
            onClick={() => setBox(b)}
          >
            {b}
            {b === 'inbox' && !!data?.unread && ` (${data.unread})`}
          </GhostButton>
        ))}
      </div>

      {compose && (
        <form
          className="mb-40"
          onSubmit={(ev) => {
            ev.preventDefault()
            if (!compose.body.trim()) return
            sendMail({
              receiverId: compose.receiverId,
              body: compose.body,
              subject: compose.subject,
              replyToId: compose.replyToId,
            })
          }}
        >
          <div className="text-acc/40 mb-8">To: {compose.receiverName}</div>
          <ResizibleGhostInput
            direction="vh"
            value={compose.body}
            onChange={(v: string) => setCompose({ ...compose, body: v })}
            placeholder="Write an email..."
            containerClassName="mb-8 leading-normal"
            className="leading-normal"
          />
          <div className="flex items-center gap-x-8">
            <Button
              type="submit"
              kind="secondary"
              size="small"
              disabled={!compose.body.trim() || isSending}
            >
              Send
            </Button>
            <GhostButton onClick={() => setCompose(null)}>Cancel</GhostButton>
            {error && <span className="text-acc/40">{error}</span>}
          </div>
        </form>
      )}

      {list.length === 0 && (
        <div className="text-acc/40">
          {box === 'inbox'
            ? 'No mail. Write one in Log: /email to Name'
            : 'Nothing sent yet.'}
        </div>
      )}

      {list.map((m) => {
        const who = box === 'inbox' ? m.senderName : `To ${m.receiverName}`
        const isOpen = openId === m.id
        return (
          <div key={m.id} className="mb-4">
            <div
              className="group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
              onClick={() => onOpen(m)}
            >
              <span
                className={cn(
                  'whitespace-nowrap',
                  box === 'inbox' && !m.isRead ? '' : 'text-acc/40'
                )}
              >
                {box === 'inbox' && !m.isRead ? '● ' : ''}
                {who}
              </span>
              <span className={cn('flex-1 truncate', m.isRead && 'text-acc/40')}>
                {m.subject}
              </span>
              <span className="text-acc/40 whitespace-nowrap">
                {dayjs(m.createdAt).fromNow()}
              </span>
            </div>
            {isOpen && (
              <div className="pl-4 py-8">
                <div className="whitespace-breakspaces break-words">{m.body}</div>
                {box === 'inbox' && (
                  <div className="mt-8">
                    <GhostButton onClick={() => onReply(m)}>Reply</GhostButton>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
